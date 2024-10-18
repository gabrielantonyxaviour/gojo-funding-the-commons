// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;


import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import "./interface/IGojoWrappedIP.sol";

error InvalidCaller(address caller);
error AlreadyExported(uint256 projectId);
error NotProjectOwner(uint256 projectId, address owner);
error NotEnoughIP(uint256 projectId, uint256 ipConsumption, uint256 availableIP);

contract GojoCore is Ownable{
    
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

    address public gojoWrappedIP;
    address public gojoCoreAIAgent;
    uint256 public projectIdCount;

    mapping(uint256 => Project) public projects;

    constructor(ConstructorParams memory _params) Ownable(_params.owner) {
        gojoWrappedIP = _params.gojoWrappedIP;
        gojoCoreAIAgent = _params.gojoCoreAIAgent;
        projectIdCount = 0;
    }

    event ProjectCreated(uint256 projectId, string metadata, address owner);
    event GenerationAction(uint256 projectId, uint32[] newAiAgentsUsed, uint256 ipConsumption);


    modifier onlyGojoCoreAiAgent(address _sender){
        if(_sender != gojoCoreAIAgent) revert InvalidCaller(_sender);
        _;
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


}