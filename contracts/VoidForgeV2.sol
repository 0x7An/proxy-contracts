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

    /**
     * @dev Override the initializer. Initialize with the URI and set max supply for token IDs.
     */
    function initialize(string memory uri) public virtual override initializer {
        VoidForge.initialize(uri);
        setMaxSupply(1, 20000);
        setMaxSupply(2, 15000);
    }

    // Redeem function implementation remains the same...
    mapping(uint256 => bool) private _redeemed;

    /**
     * @dev Function to redeem a token, marking it as redeemed.
     * Only the token owner or an address with the MINTER_ROLE can redeem.
     * @param tokenId The ID of the token to redeem.
     */
    function redeem(uint256 tokenId) public {
        require(balanceOf(msg.sender, tokenId) > 0, "VoidForgeV2: caller does not own the token");
        require(!_redeemed[tokenId], "VoidForgeV2: token already redeemed");

        _redeemed[tokenId] = true;
    }

    /**
     * @dev Function to check if a token has been redeemed.
     * @param tokenId The ID of the token to check.
     * @return A boolean value indicating whether the token has been redeemed.
     */
    function isRedeemed(uint256 tokenId) public view returns (bool) {
        return _redeemed[tokenId];
    }
}
