const web3 = require("web3");
const {
  utils: { toWei },
} = web3;

const DemonEyes = artifacts.require("DemonEyes");

describe("DemonEyesNFT", function () {
  contract("DemonEyes", (accounts) => {
    let [user_owner, user_1, user_2] = accounts;
    let token;

    beforeEach(async () => {
      token = await DemonEyes.deployed();
    });

    it("can activate the minting", async () => {
      const result = await token.setIsActive(true, { from: user_owner });
      assert.equal(
        result.receipt.status,
        true,
        "Cannot update the state of isActive"
      );

      // Get the state of the minting
      const saleIsActive = await token.isActive.call();

      // Make sure the Minting is Active
      assert.equal(saleIsActive, true, "The sale is not active");
    });

    it("can minting token", async () => {
      const tokenPrice = await token.cost.call();

      // user_1 mint mintAmount Token
      const mintAmount = 1;
      const result = await token.mint(mintAmount, {
        from: user_1,
        value: tokenPrice * mintAmount,
      });
      const tokenId = result.logs[0].args.tokenId.toNumber();
      const owner = await token.ownerOf(tokenId);
      assert.equal(owner, user_1, "buyer is not the owner");

      const userBalance = await token.balanceOf.call(user_1);

      assert.equal(userBalance, mintAmount, "Balance incorrect");
    });

    it("can mint multiple tokens", async () => {
      const tokenPrice = await token.cost.call();
      const balanceBeforeMint = await token.balanceOf.call(user_1);

      // user_1 mint mintAmount Token
      const mintAmount = 2;
      const result = await token.mint(mintAmount, {
        from: user_1,
        value: tokenPrice * mintAmount,
      });

      const balanceAfterMint = await token.balanceOf.call(user_1);

      assert.equal(
        balanceAfterMint,
        balanceBeforeMint.toNumber() + mintAmount,
        "Balance incorrect"
      );
    });

    it("can change the cost per token", async () => {
      const result = await token.setCost(toWei("0.4", "ether"), {
        from: user_owner,
      });
      assert.equal(result.receipt.status, true, "Error when updating the cost");
      const newCost = await token.cost.call();
      assert.equal(newCost, toWei("0.4", "ether"));
    });

    it("can reveal the collection", async () => {
      const tokenID = 1;
      const revealedBaseURI =
        "ipfs://QmeanFQfCxbi9YcoxbcxmChWojGSzo8yxAGA6Mz2BpWkpk/";

      // Updating the baseURI to be the revealedBaseURI
      const result = await token.setBaseURI(revealedBaseURI, {
        from: user_owner,
      });
      assert.equal(
        result.receipt.status,
        true,
        "Error when updating the baseURI"
      );

      // Check if the new tokenURI point the right ipfs
      const updatedBaseURI = await token.tokenURI(tokenID, {
        from: user_owner,
      });
      assert.equal(updatedBaseURI, revealedBaseURI + tokenID);
    });

    context(
      "transfer token with the single-step transfer scenario",
      async () => {
        it("should transfer a token", async () => {
          const tokenPrice = await token.cost.call();
          const mintAmount = 1;
          const result = await token.mint(mintAmount, {
            from: user_1,
            value: tokenPrice * mintAmount,
          });
          const tokenId = result.logs[0].args.tokenId.toNumber();
          await token.transferFrom(user_1, user_2, tokenId, {
            from: user_1,
          });
          const newOwner = await token.ownerOf(tokenId);
          assert.equal(newOwner, user_2);
        });
      }
    );

    context("transfer token with the two-step transfer scenario", async () => {
      it("should approve and then transfer a token when the approved address calls transferFrom", async () => {
        const tokenPrice = await token.cost.call();
        const mintAmount = 1;
        const result = await token.mint(mintAmount, {
          from: user_1,
          value: tokenPrice * mintAmount,
        });
        const tokenId = result.logs[0].args.tokenId.toNumber();

        await token.approve(user_2, tokenId, { from: user_1 });
        await token.transferFrom(user_1, user_2, tokenId, {
          from: user_2,
        });
        const newOwner = await token.ownerOf(tokenId);
        assert.equal(newOwner, user_2);
      });
      it("should approve and then transfer a token when the owner calls transferFrom", async () => {
        const tokenPrice = await token.cost.call();
        const mintAmount = 1;
        const result = await token.mint(mintAmount, {
          from: user_1,
          value: tokenPrice * mintAmount,
        });
        const tokenId = result.logs[0].args.tokenId.toNumber();

        await token.approve(user_2, tokenId, { from: user_1 });
        await token.transferFrom(user_1, user_2, tokenId, {
          from: user_1,
        });
        const newOwner = await token.ownerOf(tokenId);
        assert.equal(newOwner, user_2);
      });
    });
  });
});
