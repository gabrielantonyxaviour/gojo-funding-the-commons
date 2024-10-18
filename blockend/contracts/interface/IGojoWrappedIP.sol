

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IGojoWrappedIP {
    function exportProject(address from, uint256 amount) external payable;
    function setGojoCoreAddress(address _gojoCoreAddress) external;
    function balanceOf(address account) external view returns (uint256);
}