// SPDX-License-Identifier: UNLICENSED

pragma solidity =0.8.19;

interface IUniswapV2ERC20 {

    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);

    function nonces(address owner) external view returns (uint);
}