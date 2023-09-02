// This is an example test file. Hardhat will run every *.js file in `test/`,
// so feel free to add new ones.

// Hardhat tests are normally written with Mocha and Chai.

// We import Chai to use its asserting functions here.
const { expect } = require("chai");

// We use `loadFixture` to share common setups (or fixtures) between tests.
// Using this simplifies your tests and makes them run faster, by taking
// advantage or Hardhat Network's snapshot functionality.
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// `describe` is a Mocha function that allows you to organize your tests.
// Having your tests organized makes debugging them easier. All Mocha
// functions are available in the global scope.
//
// `describe` receives the name of a section of your test suite, and a
// callback. The callback must define the tests of that section. This callback
// can't be an async function.
describe("Token contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployTokenFixture() {
    // Get the ContractFactory and Signers here.
    const Token = await ethers.getContractFactory("TestERC20");
    const ERC20Proxy = await ethers.getContractFactory("ERC20FeeProxy");
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const Receivable = await ethers.getContractFactory(
      "ERC20TransferableReceivable"
    );
    const [owner, addr1, borrower] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    const hardhatToken = await Token.deploy(100000);
    const erc20proxy = await ERC20Proxy.deploy();
    const receivable = await Receivable.deploy(
      "Request Network Transferable Receivable",
      "tREC",
      erc20proxy.address
    );
    console.log("receivable: ", receivable.address);
    const marketplace = await Marketplace.deploy(receivable.address);

    await hardhatToken.deployed();

    // Fixtures can return anything you consider useful for your tests
    return {
      Token,
      marketplace,
      hardhatToken,
      erc20proxy,
      receivable,
      owner,
      addr1,
      borrower,
    };
  }

  // You can nest describe calls to create subsections.
  describe("Marketplace", function () {
    it("Should lend", async function () {
      const { hardhatToken, receivable, marketplace, owner, borrower } =
        await loadFixture(deployTokenFixture);

      const lenderBeforeBalance = await hardhatToken.balanceOf(owner.address);
      const borrowerBeforeBalance = await hardhatToken.balanceOf(
        borrower.address
      );
      const paymentRef = "0x11";
      console.log("lenderBeforeBalance: ", lenderBeforeBalance);
      console.log("borrowerBeforeBalance: ", borrowerBeforeBalance);
      await marketplace
        .connect(owner)
        .createReceivable(owner.address, 2, paymentRef, hardhatToken.address);
      const receivableInfo = await receivable.receivableInfoMapping(1);
      console.log("receivableInfo: ", receivableInfo);
      //   const key = ethers.utils.solidityKeccak256(
      //     ["address", "bytes"],
      //     [borrower.address, paymentRef]
      //   );
      //   const id = await receivable.receivableTokenIdMapping(key);
      //   console.log("id: ", id);

      await hardhatToken.approve(
        receivable.address,
        ethers.constants.MaxUint256
      );

      console.log(
        "allowance: ",
        await hardhatToken.allowance(owner.address, receivable.address)
      );
      await marketplace
        .connect(owner)
        .lend(1, owner.address, 2, 0, ethers.constants.AddressZero, paymentRef);
      const lenderAfterBalance = await hardhatToken.balanceOf(owner.address);
      const borrowerAfterBalance = await hardhatToken.balanceOf(
        borrower.address
      );
      console.log("lenderAfterBalance: ", lenderAfterBalance);
      console.log("borrowerAfterBalance: ", borrowerAfterBalance);
    });
  });
});
