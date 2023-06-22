pragma solidity =0.8.19;
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract DogProxy is TransparentUpgradeableProxy {
    constructor(
        address _logic,
        address admin_
    ) TransparentUpgradeableProxy(_logic, admin_, "") {}

    function dGetAdmin() public view returns (address) {
        return _admin();
    }

    function dGetImplementation() public view returns (address) {
        return _implementation();
    }
}
