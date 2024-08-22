// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VoidForge.sol";

contract VoidForgeV2 is VoidForge {
    /**
     * @dev Function that returns a string to confirm the contract version.
     */
    function version() public pure override returns (string memory) {
        return "V2";
    }
}
