// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import "./interface/IGojoWrappedIP.sol";
import "./interface/IGojoStoryIPWrapper.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidCaller(address caller);
error NotProjectOwner(uint256 projectId, address owner);
error InvalidCrosschainCaller(uint32 eid, bytes32 caller);

contract GojoStoryCore is OApp{
    
    struct ConstructorParams{
        address endpoint;
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

    struct Resource {
        string metadata;
        address owner;
        uint256 assetTokenId;
        uint256 ipTokenId;
        uint32 aiAgentId;
    }

    struct DomainSpecificAiAgent{
        string metadata;
        address agentAddress;
    }

    address public gojoCoreAIAgent;
    bytes32 public gojoCoreAddress;
    address public gojoStoryIPWrapperAddress;
    uint32 public constant STORY_EID = 40315;
    uint32 public constant SKALE_EID = 40273;
    uint32 public constant POLYGON_EID = 40267;

    uint256 public resourceIdCount;
    uint32 public aiAgentsCount;
    uint32 public exportedProjectsCount;

    mapping(uint256 => Resource) public resources;
    mapping(uint32 => DomainSpecificAiAgent) public domainSpecificAiAgents;
    mapping(uint32 => Project) public exportedProjects;
    mapping(uint32 => uint256) public aiAgentsRevenue;

    constructor(ConstructorParams memory _params) OApp(_params.endpoint, msg.sender) Ownable(msg.sender) {
        gojoCoreAIAgent = _params.gojoCoreAIAgent;
        resourceIdCount = 0;
    }

    event ResourceUploaded(uint256 resourceId, string metadata, address owner, uint256 assetTokenId, uint256 ipTokenId, uint32 aiAgentId);
    event DomainSpecificAiAgentAdded(DomainSpecificAiAgent[] agent);
    event MessageSent(bytes32 guid, uint32 dstEid, bytes payload, MessagingFee fee, uint64 nonce);
    event MessageReceived(bytes32 guid, Origin origin, address executor, bytes payload, bytes extraData);
    
    modifier onlyGojoCore(uint32 _eid, bytes32 _sender){
        if(_eid != SKALE_EID || _sender != gojoCoreAddress) revert InvalidCrosschainCaller(_eid, _sender);
        _;
    }

    function setGojoCoreAddress(address _gojoCoreAddress) external onlyOwner {
        gojoCoreAddress = addressToBytes32(_gojoCoreAddress);
        setPeer(STORY_EID, addressToBytes32(_gojoCoreAddress));
    }

    function setGojoStoryIPWrapperAddress(address _gojoStoryIPWrapperAddress) external onlyOwner {
        gojoStoryIPWrapperAddress = _gojoStoryIPWrapperAddress;
    }

    function createAiAgents(DomainSpecificAiAgent[] memory aiAgents, bytes calldata _options) external payable onlyOwner {
        for(uint i = 0; i < aiAgents.length; i++){
            domainSpecificAiAgents[aiAgentsCount] = aiAgents[i];
            aiAgentsCount++;
        }
        _send(abi.encode(aiAgents), _options);
        emit DomainSpecificAiAgentAdded(aiAgents);
    }

    function createResource(string memory metadata, uint32 aiAgentId) external {
        uint256 resourceId = resourceIdCount;
        resources[resourceId] = Resource(metadata, msg.sender, 0, 0, 0);

        // TODO: Create IP
        uint256 assetTokenId = 0;
        uint256 ipTokenId = 0;

        emit ResourceUploaded(resourceId, metadata, msg.sender, assetTokenId, ipTokenId, aiAgentId);
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
    ) internal override  onlyGojoCore(_origin.srcEid, _origin.sender){
        Project memory project = abi.decode(_payload, (Project));   
        IGojoStoryIPWrapper(gojoStoryIPWrapperAddress).unwrap(project.ipConsumption);
        exportedProjects[exportedProjectsCount] = project;
        uint256 aiAgentsUsed = project.aiAgentsUsed.length;
        uint256 revenuePerAgent = project.ipConsumption / aiAgentsUsed;
        for(uint i = 0; i < aiAgentsUsed; i++) aiAgentsRevenue[project.aiAgentsUsed[i]] += revenuePerAgent;
        emit MessageReceived(_guid, _origin, _executor, _payload, _extraData);
        exportedProjectsCount++;
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