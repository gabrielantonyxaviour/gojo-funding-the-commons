// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;


import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import "./interface/IGojoWrappedIP.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidCaller(address caller);
error AlreadyExported(uint256 projectId);
error NotProjectOwner(uint256 projectId, address owner);
error NotEnoughIP(uint256 projectId, uint256 ipConsumption, uint256 availableIP);
error InvalidCrosschainCaller(uint32 eid, bytes32 caller);

contract GojoCore is OApp{
    
    struct ConstructorParams{
        address endpoint;
        address owner;
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
    uint32 public constant STORY_EID = 40315;
    uint32 public constant SKALE_EID = 40273;

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
    
    modifier onlyGojoStory(uint32 _eid, bytes32 _sender){
        if(_sender != gojoStoryCoreAddress) revert InvalidCrosschainCaller(_eid, _sender);
        _;
    }

    modifier onlyGojoCoreAiAgent(address _sender){
        if(_sender != gojoCoreAIAgent) revert InvalidCaller(_sender);
        _;
    }
    
    function setGojoStoryAddress(address _gojoStoryCoreAddress) external onlyOwner {
        gojoStoryCoreAddress = addressToBytes32(_gojoStoryCoreAddress);
        setPeer(STORY_EID, addressToBytes32(_gojoStoryCoreAddress));
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

    function exportGeneration(uint256 _projectId) external {
        if(projects[_projectId].isExported) revert AlreadyExported(_projectId);
        if(projects[_projectId].owner != msg.sender) revert NotProjectOwner(_projectId, msg.sender);
        
        uint256 _availaleIP = IGojoWrappedIP(gojoWrappedIP).balanceOf(msg.sender);
        if(projects[_projectId].ipConsumption > _availaleIP) revert NotEnoughIP(_projectId, projects[_projectId].ipConsumption, _availaleIP);
        IGojoWrappedIP(gojoWrappedIP).transferAuthorized(msg.sender, projects[_projectId].ipConsumption);
        
        Project storage project = projects[_projectId];
        project.isExported = true;
    }

    function _send(
        bytes memory _payload,
        bytes calldata _options
    ) internal {
        MessagingReceipt memory _receipt = _lzSend(
            STORY_EID,
            _payload,
            _options,
            MessagingFee(msg.value, 0),
            payable(msg.sender)
        );
        emit MessageSent(_receipt.guid, STORY_EID, _payload, _receipt.fee, _receipt.nonce);
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,  
        bytes calldata _extraData  
    ) internal override  onlyGojoStory(_origin.srcEid, _origin.sender){
        DomainSpecificAiAgent[] memory agents = abi.decode(_payload, (DomainSpecificAiAgent[]));
        for(uint i = 0; i < agents.length; i++){
            domainSpecificAiAgents[aiAgentsCount] = agents[i];
            aiAgentsCount++;
        }
        emit DomainSpecificAiAgentAdded(agents);
        emit MessageReceived(_guid, _origin, _executor, _payload, _extraData);
    }

    function getQuote(uint32 _dstEid, string memory _message, bytes calldata _options) external view returns (uint256, uint256) {
        MessagingFee memory quote=_quote(_dstEid, abi.encode(_message), _options, false);
        return (quote.nativeFee, quote.lzTokenFee);
    }

    function addressToBytes32(address _address) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_address)));
    }

    function bytes32ToAddress(bytes32 _bytes32) public pure returns (address) {
        return address(uint160(uint256(_bytes32)));
    }

}