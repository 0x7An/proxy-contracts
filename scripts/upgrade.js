const { ethers, upgrades } = require("hardhat");

async function main() {
    // Replace this with your proxy contract address
    const proxyAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

    // Get the contract factory for the new implementation
    const VoidForgeV2 = await ethers.getContractFactory("VoidForgeV2");

    // Upgrade the proxy to point to the new implementation
    const upgraded = await upgrades.upgradeProxy(proxyAddress, VoidForgeV2);

    console.log("Contract upgraded. New implementation address:", upgraded.address);

    // Verify the upgrade by calling the new function
    const result = await upgraded.newFunction();
    console.log("New function output:", result);

    // Check the total supply of a previously minted token ID to ensure state is preserved
    const totalSupply1 = await upgraded.totalSupply(1);
    console.log("Total supply of token ID 1 after upgrade:", totalSupply1.toString());

    // Check if token ID 2 still exists
    const exists2 = await upgraded.exists(2);
    console.log("Does token ID 2 exist after upgrade?", exists2);

    const ff = await upgraded.newFunction()
    console.log(ff)

}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
