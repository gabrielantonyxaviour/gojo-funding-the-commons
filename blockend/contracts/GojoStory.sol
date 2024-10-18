// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;


import { OApp, Origin, MessagingFee, MessagingReceipt} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract GojoStory is OApp{
       constructor(address _endpoint, address _owner) OApp(_endpoint, _owner) Ownable(_owner) {}

    string public data;
    

    event MessageSent(bytes32 guid, uint32 dstEid, string message, MessagingFee fee, uint64 nonce);
    event MessageReceived(bytes32 guid, uint32 srcId, bytes32 sender, address executor, string message, bytes extraData, uint64 nonce);
   
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
    ) internal override {
        data = abi.decode(_payload, (string));
        emit MessageReceived(_guid, _origin.srcEid, _origin.sender, _executor, data, _extraData, _origin.nonce);
    }
}