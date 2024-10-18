

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NotGojoCore(address caller);
error InvalidCrosschainCaller(uint32 eid, bytes32 caller);
error NotEnoughBalance(uint256 balance, uint256 amount);

contract GojoWrappedIP is ERC20, OApp {
    address public gojoCoreAddress;
    bytes32 public gojoStoryIpWrapperAddress;
    uint32 public constant STORY_EID = 40315;
    uint32 public constant SKALE_EID = 40273;
    uint32 public constant POLYGON_EID = 40267;

    constructor(string memory name, string memory symbol, address _endpoint) ERC20(name, symbol) OApp(_endpoint, msg.sender) Ownable(msg.sender) {}
    
    event MessageSent(bytes32 guid, uint32 dstEid, bytes payload, MessagingFee fee, uint64 nonce);
    event MessageReceived(bytes32 guid, Origin origin, address executor, bytes payload, bytes extraData);
    
    modifier onlyGojoStory(uint32 _eid, bytes32 _sender){
        if(_eid != STORY_EID || _sender != gojoStoryIpWrapperAddress) revert InvalidCrosschainCaller(_eid, _sender);
        _;
    }

    function setGojoCoreAddress(address _gojoCoreAddress) external onlyOwner {
        gojoCoreAddress = _gojoCoreAddress;
    }

    function setGojoStoryIPWrapperAddress(bytes32 _gojoStoryIpWrapperAddress) external onlyOwner {
        gojoStoryIpWrapperAddress = _gojoStoryIpWrapperAddress;
        setPeer(STORY_EID, _gojoStoryIpWrapperAddress);
    }

    function exportProject(address from, uint256 amount) external {
        if(msg.sender != gojoCoreAddress) revert NotGojoCore(msg.sender);
        _burn(from, amount);
    }

    function unwrap(uint256 _amount, bytes calldata _options) external payable {
        if(balanceOf(msg.sender) < _amount) revert NotEnoughBalance(balanceOf(msg.sender), _amount);
        _send(abi.encode(msg.sender, _amount), _options);
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
        (address receiver, uint256 amount) = abi.decode(_payload, (address, uint256));
        _mint(receiver, amount);
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
