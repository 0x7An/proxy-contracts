const { ethers } = require("hardhat");

async function main() {
    // Replace this address with your deployed contract address
    const contractAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

    // Get the contract instance
    const VoidForge = await ethers.getContractFactory("VoidForge");
    const myERC1155 = await VoidForge.attach(contractAddress);

    // Address to receive the minted tokens
    const recipient = "0x5Fee71dfD5E19bb7c8AedfB67Ac1c54BAC06B7C4";

    // Mint a new token (Token ID = 1, Amount = 100)
    const mintTx = await myERC1155.mint(recipient, 1, 100, "0x00");
    await mintTx.wait();
    console.log("Minted 100 units of token ID 1 to:", recipient);

    // Mint multiple tokens (Token IDs = 2, 3; Amounts = 50, 150)
    const mintBatchTx = await myERC1155.mintBatch(recipient, [2, 3], [50, 150], "0x00");
    await mintBatchTx.wait();
    console.log("Minted 50 units of token ID 2 and 150 units of token ID 3 to:", recipient);

    // Check total supply of token ID 1
    const totalSupply1 = await myERC1155.totalSupply(1);
    console.log("Total supply of token ID 1:", totalSupply1.toString());

    // Check if token ID 2 exists
    const exists2 = await myERC1155.exists(2);
    console.log("Does token ID 2 exist?", exists2);

    // Check if token ID 999 exists (should be false)
    const exists999 = await myERC1155.exists(999);
    console.log("Does token ID 999 exist?", exists999);
}

// Run the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
