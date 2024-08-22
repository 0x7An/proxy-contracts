const { ethers, upgrades } = require("hardhat");

async function main() {
    // Get the contract factory for your upgradeable contract
    const VoidForge = await ethers.getContractFactory("VoidForge");

    // Deploy the proxy contract and initialize it with the required parameters
    const uri = "https://my-metadata-uri.com/{id}.json"; // Example URI
    const myERC1155 = await upgrades.deployProxy(VoidForge, [uri], {
        initializer: "initialize",
    });

    // Log the address of the deployed proxy contract
    console.log("VoidForge deployed to:", myERC1155.target);
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
