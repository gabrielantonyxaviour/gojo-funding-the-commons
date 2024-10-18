// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("SimpleNFT", "SFT")
        Ownable(initialOwner)
    {}

    function mint(address to) public returns (uint256 tokenId)  {
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}