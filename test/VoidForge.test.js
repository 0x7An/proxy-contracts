const { ethers, upgrades } = require("hardhat");
const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers");

describe("VoidForge", function () {
    async function deployVoidForgeFixture() {
        const uri = "https://my-metadata-uri.com/{id}.json";
        const [owner, otherAccount, thirdAccount] = await ethers.getSigners();
        const VoidForge = await ethers.getContractFactory("VoidForge");
        const myVoidForge = await upgrades.deployProxy(VoidForge, [uri], { initializer: "initialize" });
        return { myVoidForge, owner, otherAccount, thirdAccount };
    }

    describe("Deployment", function () {
        it("Should set the correct URI", async function () {
            const { myVoidForge } = await deployVoidForgeFixture();
            expect(await myVoidForge.uri(1)).to.equal("https://my-metadata-uri.com/{id}.json");
        });

        it("Should grant the deployer the default admin role", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            const DEFAULT_ADMIN_ROLE = await myVoidForge.DEFAULT_ADMIN_ROLE();
            expect(await myVoidForge.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
        });

        it("Should grant the deployer the minter role", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            const MINTER_ROLE = await myVoidForge.MINTER_ROLE();
            expect(await myVoidForge.hasRole(MINTER_ROLE, owner.address)).to.be.true;
        });
    });

    describe("Minting", function () {
        it("Should allow accounts with MINTER_ROLE to mint tokens", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            await myVoidForge.mint(owner.address, 1, 100, "0x00");
            expect((await myVoidForge.totalSupply(1)).toString()).to.equal('100');
        });

        it("Should not allow accounts without MINTER_ROLE to mint tokens", async function () {
            const { myVoidForge, otherAccount } = await deployVoidForgeFixture();
      
            try {
                await myVoidForge.connect(otherAccount).mint(otherAccount.address, 1, 100, "0x00");
                assert.fail("The transaction should have reverted");
            } catch (error) {
                expect(error.message).to.include('AccessControlUnauthorizedAccount');
            }
        });

        it("Should allow batch minting", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            await myVoidForge.mintBatch(owner.address, [1, 2], [100, 200], "0x00");
            expect((await myVoidForge.totalSupply(1)).toString()).to.equal('100');
            expect((await myVoidForge.totalSupply(2)).toString()).to.equal('200');
        });

        it("Should allow transferring MINTER_ROLE and minting by new minter", async function () {
            const { myVoidForge, owner, otherAccount } = await deployVoidForgeFixture();
            const MINTER_ROLE = await myVoidForge.MINTER_ROLE();

            // Grant MINTER_ROLE to otherAccount
            await myVoidForge.grantRole(MINTER_ROLE, otherAccount.address);

            // Other account can now mint
            await myVoidForge.connect(otherAccount).mint(otherAccount.address, 1, 100, "0x00");
            expect((await myVoidForge.totalSupply(1)).toString()).to.equal('100');
        });

        it("Should not allow minting more than maximum supply (if applicable)", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            const MAX_SUPPLY = 10001;
            
            try {
                await myVoidForge.mint(owner.address, 1, MAX_SUPPLY + 1, "0x00");
                assert.fail("The transaction should have reverted");
            } catch (error) {
                expect(error.message).to.include("MaxSupplyExceeded");
            }
        });        
    });

    describe("Role Management", function () {
        it("Should allow DEFAULT_ADMIN_ROLE to grant and revoke roles", async function () {
            const { myVoidForge, owner, otherAccount } = await deployVoidForgeFixture();
            const MINTER_ROLE = await myVoidForge.MINTER_ROLE();

            // Grant MINTER_ROLE to otherAccount
            await myVoidForge.grantRole(MINTER_ROLE, otherAccount.address);
            expect(await myVoidForge.hasRole(MINTER_ROLE, otherAccount.address)).to.be.true;

            // Revoke MINTER_ROLE from otherAccount
            await myVoidForge.revokeRole(MINTER_ROLE, otherAccount.address);
            expect(await myVoidForge.hasRole(MINTER_ROLE, otherAccount.address)).to.be.false;
        });

        it("Should not allow non-admins to grant or revoke roles", async function () {
          const { myVoidForge, otherAccount, thirdAccount } = await deployVoidForgeFixture();
          const MINTER_ROLE = await myVoidForge.MINTER_ROLE();
      
          // Test granting role
          try {
              await myVoidForge.connect(otherAccount).grantRole(MINTER_ROLE, thirdAccount.address);
              assert.fail("The transaction should have reverted");
          } catch (error) {
              expect(error.message).to.include("AccessControlUnauthorizedAccount");
          }
      
          // Test revoking role
          try {
              await myVoidForge.connect(otherAccount).revokeRole(MINTER_ROLE, thirdAccount.address);
              assert.fail("The transaction should have reverted");
          } catch (error) {
              expect(error.message).to.include("AccessControlUnauthorizedAccount");
          }
      });
      
      
    });

    describe("Token Transfers", function () {
        it("Should allow token transfers between accounts", async function () {
            const { myVoidForge, owner, otherAccount } = await deployVoidForgeFixture();
            await myVoidForge.mint(owner.address, 1, 100, "0x00");

            await myVoidForge.safeTransferFrom(owner.address, otherAccount.address, 1, 50, "0x00");
            expect((await myVoidForge.balanceOf(otherAccount.address, 1)).toString()).to.equal('50');
            expect((await myVoidForge.balanceOf(owner.address, 1)).toString()).to.equal('50');
        });

        it("Should allow batch token transfers", async function () {
            const { myVoidForge, owner, otherAccount } = await deployVoidForgeFixture();
            await myVoidForge.mintBatch(owner.address, [1, 2], [100, 200], "0x00");

            await myVoidForge.safeBatchTransferFrom(owner.address, otherAccount.address, [1, 2], [50, 100], "0x00");
            expect((await myVoidForge.balanceOf(otherAccount.address, 1)).toString()).to.equal('50');
            expect((await myVoidForge.balanceOf(otherAccount.address, 2)).toString()).to.equal('100');
        });
    });

    describe("Upgrade", function () {
        it("Should preserve state after upgrade", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            await myVoidForge.mint(owner.address, 1, 100, "0x00");

            const VoidForgeV2 = await ethers.getContractFactory("VoidForgeV2");
            const upgraded = await upgrades.upgradeProxy(myVoidForge.target, VoidForgeV2);

            expect((await upgraded.totalSupply(1)).toString()).to.equal('100');
            expect(await upgraded.exists(1)).to.be.true;
            expect(await upgraded.version()).to.equal("V2");
        });

        it("Should preserve state after multiple upgrades", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            await myVoidForge.mint(owner.address, 1, 100, "0x00");

            // Upgrade to V2
            const VoidForgeV2 = await ethers.getContractFactory("VoidForgeV2");
            const upgradedV2 = await upgrades.upgradeProxy(myVoidForge.target, VoidForgeV2);

            // Upgrade to V3 (hypothetical)
            const VoidForgeV3 = await ethers.getContractFactory("VoidForgeV3");
            const upgradedV3 = await upgrades.upgradeProxy(upgradedV2.target, VoidForgeV3);

            expect((await upgradedV3.totalSupply(1)).toString()).to.equal('100');
            expect(await upgradedV3.exists(1)).to.be.true;
        });
    });

    describe("Burning Tokens", function () {
        it("Should allow burning tokens and reduce total supply", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            await myVoidForge.mint(owner.address, 1, 100, "0x00");

            await myVoidForge.burn(owner.address, 1, 50);
            expect((await myVoidForge.totalSupply(1)).toString()).to.equal('50');
        });

        it("Should not allow burning more tokens than owned", async function () {
            const { myVoidForge, owner } = await deployVoidForgeFixture();
            // Mint some tokens
            await myVoidForge.mint(owner.address, 1, 100, "0x00");
        
            try {
                // Try to burn more tokens than owned
                await myVoidForge.burn(owner.address, 1, 200);
                assert.fail("The transaction should have reverted");
            } catch (error) {
                expect(error.message).to.include("BurnExceedsBalance");
            }
        });
        
    });
});
