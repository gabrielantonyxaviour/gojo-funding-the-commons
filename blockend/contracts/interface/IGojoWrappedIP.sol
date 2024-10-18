

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;


interface IGojoWrappedIP {
    function transferAuthorized(address from, uint256 amount) external;
    function setGojoCoreAddress(address _gojoCoreAddress) external;
    function balanceOf(address account) external view returns (uint256);
}