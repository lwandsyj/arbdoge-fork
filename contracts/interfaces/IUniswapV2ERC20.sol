// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.6.6;

interface IUniswapV2ERC20 {

    function transfer(address to, uint value) external returns (bool);
    function transferFrom(address from, address to, uint value) external returns (bool);

    function nonces(address owner) external view returns (uint);
    function permit(
        address owner,
        address spender,
        uint value,
        uint deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
}