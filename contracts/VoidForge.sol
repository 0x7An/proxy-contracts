// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC1155Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { AccessControlUpgradeable } from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract VoidForge is Initializable, ERC1155Upgradeable, OwnableUpgradeable, AccessControlUpgradeable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 public constant MAX_SUPPLY = 10000;

    // Mapping to track the total supply of each token ID
    mapping(uint256 => uint256) private _totalSupply;

    // Custom errors
    error MaxSupplyExceeded();
    error BurnExceedsBalance();

    /**
     * @dev Initializer function that replaces the constructor for upgradeable contracts.
     * This function is called once during the contract deployment to set the initial URI, owner, default admin role.
     * @param uri The URI for all token types by relying on ID substitution.
     */
    function initialize(string memory uri) public virtual initializer {
        __ERC1155_init(uri);
        __Ownable_init(msg.sender);
        __AccessControl_init();

        // Grant the contract deployer the default admin role and the minter role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new token with a specified ID and amount, and assign it to the `to` address.
     * Only addresses with the MINTER_ROLE can call this function.
     * @param to The address that will receive the minted tokens.
     * @param id The ID of the token to mint.
     * @param amount The amount of tokens to mint.
     * @param data Additional data to pass to the `onERC1155Received` hook, if applicable.
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) {
        uint256 currentSupply = _totalSupply[id];
        unchecked {
            if (currentSupply + amount > MAX_SUPPLY) {
                revert MaxSupplyExceeded();
            }
            _totalSupply[id] = currentSupply + amount;
        }
        _mint(to, id, amount, data);
    }

    /**
     * @dev Mint multiple new tokens with specified IDs and amounts, and assign them to the `to` address.
     * Only addresses with the MINTER_ROLE can call this function.
     * @param to The address that will receive the minted tokens.
     * @param ids An array of token IDs to mint.
     * @param amounts An array of amounts of tokens to mint for each ID.
     * @param data Additional data to pass to the `onERC1155BatchReceived` hook, if applicable.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual onlyRole(MINTER_ROLE) {
        uint256 id;
        uint256 amount;

        for (uint256 i = 0; i < ids.length; ++i) {
            id = ids[i];
            amount = amounts[i];

            uint256 currentSupply = _totalSupply[id];
            unchecked {
                if (currentSupply + amount > MAX_SUPPLY) {
                    revert MaxSupplyExceeded();
                }
                _totalSupply[id] = currentSupply + amount;
            }
        }
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Returns the total supply of a specific token ID.
     * @param id The ID of the token whose total supply is queried.
     * @return The total supply of the token with the specified ID.
     */
    function totalSupply(uint256 id) public view virtual returns (uint256) {
        return _totalSupply[id];
    }

    /**
     * @dev Checks if a specific token ID exists (i.e., has been minted).
     * @param id The ID of the token to check.
     * @return A boolean value indicating whether the token with the specified ID exists.
     */
    function exists(uint256 id) public view virtual returns (bool) {
        return _totalSupply[id] > 0;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     * Override to allow this contract to return the correct interface support.
     */
    function supportsInterface(bytes4 interfaceId)
        public view virtual
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Burns a specific amount of tokens of a specific ID from `from` address.
     * Only the owner of the tokens or an account with the MINTER_ROLE can call this function.
     * @param from The address from which the tokens will be burned.
     * @param id The ID of the token to burn.
     * @param amount The amount of tokens to burn.
     */
    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) public virtual {
        require(
            from == msg.sender || hasRole(MINTER_ROLE, msg.sender),
            "VoidForge: caller is not owner nor approved"
        );
        if (balanceOf(from, id) < amount) {
            revert BurnExceedsBalance();
        }

        _burn(from, id, amount);
        unchecked {
            _totalSupply[id] -= amount;
        }
    }

    /**
     * @dev Burns multiple tokens of specific IDs from `from` address.
     * Only the owner of the tokens or an account with the MINTER_ROLE can call this function.
     * @param from The address from which the tokens will be burned.
     * @param ids An array of token IDs to burn.
     * @param amounts An array of amounts of tokens to burn for each ID.
     */
    function burnBatch(
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public virtual {
        require(
            from == msg.sender || hasRole(MINTER_ROLE, msg.sender),
            "VoidForge: caller is not owner nor approved"
        );

        uint256 id;
        uint256 amount;

        for (uint256 i = 0; i < ids.length; ++i) {
            id = ids[i];
            amount = amounts[i];

            if (balanceOf(from, id) < amount) {
                revert BurnExceedsBalance();
            }

            unchecked {
                _totalSupply[id] -= amount;
            }
        }

        _burnBatch(from, ids, amounts);
    }

    /**
     * @dev Function that returns a string to confirm the contract version.
     */
    function version() public pure virtual returns (string memory) {
        return "V1";
    }
}
