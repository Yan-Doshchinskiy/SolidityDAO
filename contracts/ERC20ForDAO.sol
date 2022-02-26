//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


contract ERC20ForDAO is ERC20, AccessControl {
    // constructor
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // balance changing functions
    function mint(address _account, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(_account, _amount);
    }
}
