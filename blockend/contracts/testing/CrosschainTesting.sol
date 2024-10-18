// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;


import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract Sigma is OApp{

    mapping(uint32=>address) public crosschainAddresses;
    constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    string public data;
    

    event MessageSent(bytes32 guid, uint32 dstEid, string message, MessagingFee fee, uint64 nonce);
    event MessageReceived(bytes32 guid, Origin origin, address executor, string message, bytes extraData);
    

    modifier onlyCrosschainWhitelisted(uint32 _srcId, bytes32 sender){
        require(peers[_srcId]==sender, "Invalid Crosschain address ");
        _;
    }

    function setCrosschainAddresses(uint32[] memory _dstIds, address[] memory _dstAddresses) external onlyOwner {
        for(uint i=0; i<_dstIds.length; i++){
            peers[_dstIds[i]]=addressToBytes32(_dstAddresses[i]);
        }
    }

    function send(
        uint32 _dstEid,
        string memory _message,
        bytes calldata _options
    ) external payable {
      
        bytes memory _payload = abi.encode(_message);
        MessagingReceipt memory _receipt = _lzSend(
            _dstEid,
            _payload,
            _options,
            // Fee in native gas and ZRO token.
            MessagingFee(msg.value, 0),
            // Refund address in case of failed source message.
            payable(msg.sender)
        );
        emit MessageSent(_receipt.guid, _dstEid, _message, _receipt.fee, _receipt.nonce);
    }

    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,  
        bytes calldata _extraData  
    ) internal override  onlyCrosschainWhitelisted(_origin.srcEid,  _origin.sender){
        data = abi.decode(_payload, (string));
        emit MessageReceived(_guid, _origin, _executor, data, _extraData);
    }
    function addressToBytes32(address _address) public pure returns (bytes32) {
        return bytes32(uint256(uint160(_address)));
    }

    function bytes32ToAddress(bytes32 _bytes32) public pure returns (address) {
        return address(uint160(uint256(_bytes32)));
    }

    function getQuote(uint32 _dstEid, string memory _message, bytes calldata _options) external view returns (uint256, uint256) {
        MessagingFee memory quote=_quote(_dstEid, abi.encode(_message), _options, false);
        return (quote.nativeFee, quote.lzTokenFee);
    }
}