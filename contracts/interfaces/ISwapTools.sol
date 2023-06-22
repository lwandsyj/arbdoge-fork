// SPDX-License-Identifier: UNLICENSED

pragma solidity =0.8.19;

interface ISwapTools {
    function anchorToken() external view returns (address);
    function getTokensPrice(address[] memory tokens) external view returns(uint256[] memory prices);
    function getCurrentPrice(address token) external view returns (uint256 price);
    function getCurrentPriceMule12(address token) external view returns (uint256 price);
}