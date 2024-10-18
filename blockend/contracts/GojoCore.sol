// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import "./interface/IGojoWrappedIP.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidCaller(address caller);
error AlreadyExported(uint256 projectId);
error NotProjectOwner(uint256 projectId, address owner);
error NotEnoughIP(uint256 projectId, uint256 ipConsumption, uint256 availableIP);
error InvalidCrosschainCaller(uint32 eid, bytes32 caller);
error InvalidMsgType();

contract GojoCore is OApp, OAppOptionsType3{
    
    struct ConstructorParams{
        address endpoint;
        address gojoWrappedIP;
        address gojoCoreAIAgent;
    }

    struct Project{
        string metadata;
        uint32[] aiAgentsUsed;
        address owner;
        uint256 ipConsumption;
        uint32 generationsCount;
        bool isExported;
    }

    struct DomainSpecificAiAgent{
        string metadata;
        address agentAddress;
    }

    address public gojoWrappedIP;
    address public gojoCoreAIAgent;
    bytes32 public gojoStoryCoreAddress;
    bytes32 public gojoSignHookAddres;
    uint32 public constant STORY_EID = 40315;
    uint32 public constant SKALE_EID = 40273;
    uint32 public constant POLYGON_EID = 40267;
    uint16 public constant SEND = 1;

    uint256 public projectIdCount;
    uint32 public aiAgentsCount;

    mapping(uint256 => Project) public projects;
    mapping(uint32 => DomainSpecificAiAgent) public domainSpecificAiAgents;

    constructor(ConstructorParams memory _params) OApp(_params.endpoint, msg.sender) Ownable(msg.sender) {
        gojoWrappedIP = _params.gojoWrappedIP;
        gojoCoreAIAgent = _params.gojoCoreAIAgent;
        projectIdCount = 0;
    }

    event ProjectCreated(uint256 projectId, string metadata, address owner);
    event GenerationAction(uint256 projectId, uint32[] newAiAgentsUsed, uint256 ipConsumption);
    event DomainSpecificAiAgentAdded(DomainSpecificAiAgent[] agent);
    event MessageSent(bytes32 guid, uint32 dstEid, bytes payload, MessagingFee fee, uint64 nonce);
    event MessageReceived(bytes32 guid, Origin origin, address executor, bytes payload, bytes extraData);
    
    modifier onlyGojoStoryCore(uint32 _eid, bytes32 _sender){
        if(_eid != STORY_EID || _sender != gojoStoryCoreAddress) revert InvalidCrosschainCaller(_eid, _sender);
        _;
    }

    modifier onlyGojoCoreAiAgent(address _sender){
        if(_sender != gojoCoreAIAgent) revert InvalidCaller(_sender);
        _;
    }

    function _payNative(uint256 _nativeFee) internal override returns (uint256 nativeFee) {
        if (msg.value < _nativeFee) revert NotEnoughNative(msg.value);
        return _nativeFee;
    }
    
    function setGojoStoryAddress(address _gojoStoryCoreAddress) external onlyOwner {
        gojoStoryCoreAddress = addressToBytes32(_gojoStoryCoreAddress);
        setPeer(STORY_EID, addressToBytes32(_gojoStoryCoreAddress));
    }

    function setGojoSignHook(address _gojoSignHookAddress) external onlyOwner {
        gojoSignHookAddres = addressToBytes32(_gojoSignHookAddress);
        setPeer(POLYGON_EID, addressToBytes32(_gojoSignHookAddress));
    }

    function setGojoWrappedIP(address _gojoWrappedIP) external onlyOwner {
        gojoWrappedIP = _gojoWrappedIP;
    }

    function createProject(string memory _metadata) external {
        uint256 projectId = projectIdCount;
        projects[projectId] = Project(_metadata, new uint32[](0), msg.sender, 0, 0, false);
        projectIdCount++;
        emit ProjectCreated(projectId, _metadata, msg.sender);
    }

    function registerGeneration(uint256 _projectId, uint32[] memory newAiAgentsUsed, uint256 _ipConsumption) external {
        if(projects[_projectId].isExported) revert AlreadyExported(_projectId);
        Project storage project = projects[_projectId];
        for(uint i = 0; i < newAiAgentsUsed.length; i++) project.aiAgentsUsed.push(newAiAgentsUsed[i]);
        project.ipConsumption += _ipConsumption;
        project.generationsCount++;
        emit GenerationAction(_projectId, newAiAgentsUsed, _ipConsumption);
    }

    function exportProject(uint256 _projectId, bytes calldata _options) external payable {
        if(projects[_projectId].isExported) revert AlreadyExported(_projectId);
        if(projects[_projectId].owner != msg.sender) revert NotProjectOwner(_projectId, msg.sender);
        
        uint256 _availaleIP = IGojoWrappedIP(gojoWrappedIP).balanceOf(msg.sender);
        if(projects[_projectId].ipConsumption > _availaleIP) revert NotEnoughIP(_projectId, projects[_projectId].ipConsumption, _availaleIP);
        IGojoWrappedIP(gojoWrappedIP).exportProject(msg.sender, projects[_projectId].ipConsumption);
        
        Project storage project = projects[_projectId];
        project.isExported = true;
        bytes memory _payload = abi.encode(projects[_projectId]);
        _batchSend(_payload, _options);
    }

    // TODO: This should do batch send.
    function _batchSend(
        bytes memory _payload,
        bytes calldata _options 
    ) internal {
        uint32[] memory _dstEids=new uint32[](2);
        _dstEids[0]=STORY_EID;
        _dstEids[1]=POLYGON_EID;

        // Calculate the total messaging fee required.
        MessagingFee memory totalFee = getQuote(_dstEids, _payload, _options, false);
        require(msg.value >= totalFee.nativeFee, "Insufficient fee provided");

        uint256 totalNativeFeeUsed = 0;
        uint256 remainingValue = msg.value;

        for (uint i = 0; i < _dstEids.length; i++) {
            bytes memory options = combineOptions(_dstEids[i], SEND, _options);
            MessagingFee memory fee = _quote(_dstEids[i], _payload, options, false);

            totalNativeFeeUsed += fee.nativeFee;
            remainingValue -= fee.nativeFee;

            // Ensure the current call has enough allocated fee from msg.value.
            require(remainingValue >= 0, "Insufficient fee for this destination");

            MessagingReceipt memory _receipt =_lzSend(
                _dstEids[i],
                _payload,
                options,
                fee,
                payable(msg.sender)
            );

            emit MessageSent(_receipt.guid, _dstEids[i], _payload, _receipt.fee, _receipt.nonce);
        }
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,  
        bytes calldata _extraData  
    ) internal override  onlyGojoStoryCore(_origin.srcEid, _origin.sender){
        DomainSpecificAiAgent[] memory agents = abi.decode(_payload, (DomainSpecificAiAgent[]));
        for(uint i = 0; i < agents.length; i++){
            domainSpecificAiAgents[aiAgentsCount] = agents[i];
            aiAgentsCount++;
        }
        emit DomainSpecificAiAgentAdded(agents);
        emit MessageReceived(_guid, _origin, _executor, _payload, _extraData);
    }

    function getQuote(
        uint32[] memory _dstEids,
        bytes memory _payload,
        bytes calldata _options,
        bool _payInLzToken
    ) public view returns (MessagingFee memory totalFee) {
        for (uint i = 0; i < _dstEids.length; i++) {
            bytes memory options = combineOptions(_dstEids[i], SEND, _options);
            MessagingFee memory fee = _quote(_dstEids[i], _payload, options, _payInLzToken);
            totalFee.nativeFee += fee.nativeFee;
            totalFee.lzTokenFee += fee.lzTokenFee;
        }
    }

    function addressToBytes32(address _address) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_address)));
    }

    function bytes32ToAddress(bytes32 _bytes32) public pure returns (address) {
        return address(uint160(uint256(_bytes32)));
    }

}