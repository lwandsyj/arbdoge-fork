// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.5.0;

interface IDogeTradePool {
    function trade(address user, uint256 _amount) external;
}
