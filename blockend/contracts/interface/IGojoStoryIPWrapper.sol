

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;


interface IGojoStoryIPWrapper {
    function unwrap(uint256 _amount) external payable;
}