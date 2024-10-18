// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { ISP } from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import { ISPHook } from "@ethsign/sign-protocol-evm/src/interfaces/ISPHook.sol";
import { Attestation } from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";

error InvalidCrosschainCaller(uint32 eid, bytes32 caller);

contract GojoSignHook is ISPHook, OApp {
    error UnsupportedOperation();

    struct Project{
        string metadata;
        uint32[] aiAgentsUsed;
        address owner;
        uint256 ipConsumption;
        uint32 generationsCount;
        bool isExported;
    }

    uint32 public exportedProjectsCount;
    bytes32 public gojoCoreAddress;
    uint32 public constant STORY_EID = 40315;
    uint32 public constant SKALE_EID = 40273;
    uint32 public constant POLYGON_EID = 40267;

    mapping(uint32 => Project) public exportedProjects;

    constructor(address endpoint) OApp(endpoint, msg.sender) Ownable(msg.sender) {}

    event MessageReceived(bytes32 guid, Origin origin, address executor, bytes payload, bytes extraData);

    modifier onlyGojoCore(uint32 _eid, bytes32 _sender){
        if(_eid != SKALE_EID || _sender != gojoCoreAddress) revert InvalidCrosschainCaller(_eid, _sender);
        _;
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,  
        bytes calldata _extraData  
    ) internal override onlyGojoCore(_origin.srcEid, _origin.sender){
        Project memory project = abi.decode(_payload, (Project));   
        exportedProjects[exportedProjectsCount] = project;

        emit MessageReceived(_guid, _origin, _executor, _payload, _extraData);
        exportedProjectsCount++;
    }


    function didReceiveAttestation(
        address, // attester
        uint64, // schemaId
        uint64 attestationId,
        bytes calldata // extraData
    )
        external
        payable
    {
        Attestation memory attestation = ISP(_msgSender()).getAttestation(attestationId);
        // TODO: Check attestation validity
    }

    function didReceiveAttestation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    )
        external
        pure
    {
        revert UnsupportedOperation();
    }

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        bytes calldata // extraData
    )
        external
        payable
    {
        revert UnsupportedOperation();
    }

    function didReceiveRevocation(
        address, // attester
        uint64, // schemaId
        uint64, // attestationId
        IERC20, // resolverFeeERC20Token
        uint256, // resolverFeeERC20Amount
        bytes calldata // extraData
    )
        external
        pure
    {
        revert UnsupportedOperation();
    }
}