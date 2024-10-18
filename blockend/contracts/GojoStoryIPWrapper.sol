

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error InvalidCrosschainCaller(uint32 eid, bytes32 caller);
error NotEnoughBalance(uint256 balance, uint256 amount);
error UnAuthorizedCaller(address caller);

contract GojoStoryIPWrapper is OApp {

    bytes32 public gojoWrappedIpAddress;
    address public gojoStoryCoreAddress;
    uint32 public constant STORY_EID = 40315;
    uint32 public constant SKALE_EID = 40273;

    constructor(address _endpoint) OApp(_endpoint, msg.sender) Ownable(msg.sender) {}
    
    event MessageSent(bytes32 guid, uint32 dstEid, bytes payload, MessagingFee fee, uint64 nonce);
    event MessageReceived(bytes32 guid, Origin origin, address executor, bytes payload, bytes extraData);
    
    modifier onlyGojoWrappedIp(uint32 _eid, bytes32 _sender){
        if(_eid != SKALE_EID || _sender != gojoWrappedIpAddress) revert InvalidCrosschainCaller(_eid, _sender);
        _;
    }

    function setGojoWrappedIpAddress(address _gojoWrappedIpAddress) external onlyOwner {
        gojoWrappedIpAddress = addressToBytes32(_gojoWrappedIpAddress);
        setPeer(SKALE_EID, addressToBytes32(_gojoWrappedIpAddress));
    }

    function setGojoStoryCoreAddress(address _gojoStoryCoreAddress) external onlyOwner {
        gojoStoryCoreAddress = _gojoStoryCoreAddress;
    }

    function wrap(uint256 _amount, bytes calldata _options) external payable {
        if(msg.value <= _amount) revert NotEnoughBalance(msg.value, _amount);
        _send(abi.encode(msg.sender, _amount), _options);
    }

    function unwrap( uint256 _amount) external payable {
        if(msg.sender != gojoStoryCoreAddress) revert UnAuthorizedCaller(msg.sender);
        msg.sender.call{value: _amount}("");
    }

    function _send(
        bytes memory _payload,
        bytes calldata _options
    ) internal {
        MessagingReceipt memory _receipt = _lzSend(
            STORY_EID,
            _payload,
            _options,
            // Fee in native gas and ZRO token.
            MessagingFee(msg.value, 0),
            // Refund address in case of failed source message.
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
    ) internal override  onlyGojoWrappedIp(_origin.srcEid, _origin.sender){
        (address receiver, uint256 amount) = abi.decode(_payload, (address, uint256));
        receiver.call{value: amount}("");
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
