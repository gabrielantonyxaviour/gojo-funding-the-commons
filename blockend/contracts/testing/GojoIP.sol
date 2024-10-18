// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import { SimpleNFT } from "./SimpleNFT.sol";

interface IIPAssetRegistry {
    function register(uint256 chainId, address tokenContract, uint256 tokenId) external returns (address);
}

contract GojoIP {
    IIPAssetRegistry public immutable IP_ASSET_REGISTRY;
  
    SimpleNFT public immutable SIMPLE_NFT;


    constructor(address ipAssetRegistry ) {
        IP_ASSET_REGISTRY = IIPAssetRegistry(ipAssetRegistry);
     
        SIMPLE_NFT = new SimpleNFT(msg.sender);
      
    }

    function mintIp() external returns (address ipId, uint256 tokenId) {
        tokenId = SIMPLE_NFT.mint(msg.sender);
        ipId = IP_ASSET_REGISTRY.register(block.chainid, address(SIMPLE_NFT), tokenId);
    }

}