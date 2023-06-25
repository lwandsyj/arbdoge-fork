// SPDX-License-Identifier: UNLICENSED

pragma solidity =0.8.19;

interface IDogeTradePool {
    function trade(address user, uint256 _amount) external;
}
