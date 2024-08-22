# VoidForge

This repository contains a Solidity smart contract project for an upgradeable ERC-1155 token. The contract is built using OpenZeppelin's upgradeable library and includes custom functionalities such as minting, batch minting, burning, and batch burning of tokens. The project is configured with testing and linting tools to ensure code quality and functionality.

## Features

- **Upgradeable Contract**: The contract can be upgraded without losing its state, allowing for future enhancements.
- **Access Control**: Utilizes role-based access control with a `MINTER_ROLE` to restrict minting and burning functionalities.
- **Minting**: Allows authorized users to mint new tokens, including batch minting.
- **Burning**: Enables burning of tokens to reduce total supply, including batch burning.
- **Custom Errors**: Implements custom errors for better gas efficiency and more informative revert reasons.
- **Unit Tests**: Comprehensive test suite using Hardhat to ensure contract functionality.
- **Linting**: Configured with Solhint to enforce Solidity code quality and style guidelines.
