// SPDX-License-Identifier: UNLICENSED

pragma solidity =0.8.19;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../libs/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DistributionPool is OwnableUpgradeable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SignatureChecker for EnumerableSet.AddressSet;

    uint256 public constant MAX_ADDRESSES = 10000;
    // 40% for airdrop and invitation
    uint256 public constant MAX_TOKEN = 2_000_000_000 * 1e6;
    // INIT_CLAIM ≈ MAX_TOKEN / (4.927942405962074 * MAX_ADDRESSES / 20) * 0.97
    uint256 public constant INIT_CLAIM = 800_000 * 1e6;

    struct InfoView {
        uint256 maxToken;
        uint256 initClaim;
        uint256 currentClaim;
        bool claimed;
        uint256 inviteRewards;
        uint256 inviteUsers;
        uint256 claimedSupply;
        uint256 claimedCount;
    }

    event Claim(
        address indexed user,
        uint128 nonce,
        uint256 amount,
        address referrer,
        uint timestamp
    );

    IERC20 public token;

    EnumerableSet.AddressSet private _signers;
    mapping(uint256 => bool) public _usedNonce;
    mapping(address => bool) public _claimedUser;
    mapping(address => uint256) public inviteRewards;

    uint256 public claimedSupply;
    uint256 public claimedCount;
    uint256 public claimedPercentage;
    mapping(address => uint256) public inviteUsers;

    function initialize(address token_) external initializer {
        __Ownable_init();
        token = IERC20(token_);
        claimedSupply = 0;
        claimedCount = 0;
        claimedPercentage = 0;
    }

    function canClaimAmount() public view returns (uint256) {
        if (claimedCount >= MAX_ADDRESSES) {
            return 0;
        }

        uint256 supplyPerAddress = INIT_CLAIM;
        uint256 curClaimedCount = claimedCount + 1;
        uint256 claimedPercent = (curClaimedCount * 100e6) / MAX_ADDRESSES;
        uint256 curPercent = 5e6;

        while (curPercent <= claimedPercent) {
            supplyPerAddress = (supplyPerAddress * 80) / 100;
            curPercent += 5e6;
        }

        return supplyPerAddress;
    }

    function claim(
        uint128 nonce,
        bytes calldata signature,
        address referrer
    ) public {
        require(_usedNonce[nonce] == false, "nonce already used");
        require(_claimedUser[_msgSender()] == false, "already claimed");

        _claimedUser[_msgSender()] = true;
        bytes32 message = keccak256(
            abi.encode(address(this), _msgSender(), nonce)
        );

        _signers.requireValidSignature(message, signature);
        _usedNonce[nonce] = true;

        uint256 supplyPerAddress = canClaimAmount();
        require(supplyPerAddress >= 1e6, "Airdrop has ended");

        uint256 amount = canClaimAmount();
        token.transfer(_msgSender(), amount);

        claimedCount++;
        claimedSupply += supplyPerAddress;

        if (claimedCount > 0) {
            claimedPercentage = (claimedCount * 100) / MAX_ADDRESSES;
        }

        if (referrer != address(0) && referrer != _msgSender()) {
            uint256 num = (amount * 30) / 1000;
            token.transfer(referrer, num);
            inviteRewards[referrer] += num;
            inviteUsers[referrer]++;
        }

        emit Claim(_msgSender(), nonce, amount, referrer, block.timestamp);
    }

    function getInfoView(address user) public view returns (InfoView memory) {
        return
            InfoView({
                maxToken: MAX_TOKEN,
                initClaim: INIT_CLAIM,
                currentClaim: canClaimAmount(),
                claimed: _claimedUser[user],
                inviteRewards: inviteRewards[user],
                inviteUsers: inviteUsers[user],
                claimedSupply: claimedSupply,
                claimedCount: claimedCount
            });
    }

    function addSigner(address val) public onlyOwner {
        require(val != address(0), "SmallDog: val is the zero address");
        _signers.add(val);
    }

    function delSigner(address signer) public onlyOwner returns (bool) {
        require(signer != address(0), "SmallDog: signer is the zero address");
        return _signers.remove(signer);
    }

    function getSigners() public view returns (address[] memory ret) {
        return _signers.values();
    }
}
