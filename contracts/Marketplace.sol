//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.16;

import "./ERC20TransferableReceivable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

// This is the main building block for smart contracts.
contract Marketplace {
    // A mapping of TradeableCashflow NFT to their ERC20TransferableReceivable
    mapping(address => address) streams;
    ERC20TransferableReceivable public receivable;

    // The Lend event helps off-chain applications understand
    // what happens within your contract.
    event Lend(address indexed _from, address indexed _to, uint256 _value);

    /**
     * Contract initialization.
     */
    constructor(ERC20TransferableReceivable _receivable) {
        receivable = _receivable;
    }

    /**
     * A function to transfer streams and pay the employee advance salary.
     *
     * The `external` modifier makes a function *only* callable from *outside*
     * the contract.
     */

    function createReceivable(
        address borrower,
        uint256 amount,
        bytes calldata paymentReference,
        address erc20Addr
    ) public {
        console.log("Creating receivable...");

        // mint ERC20TransferableReceivable
        receivable.mint(borrower, paymentReference, amount, erc20Addr);
    }

    function lend(
        uint256 tokenId,
        address borrower,
        uint256 amount,
        uint256 feeAmount,
        address feeAddress,
        bytes calldata paymentReference
    ) public {
        console.log("Lending...");

        // 3. pay the employee advance salary
        receivable.payOwner(
            tokenId,
            amount,
            paymentReference,
            feeAmount,
            feeAddress
        );

        // 4. transfer Tradeable Cashflow NFT to the lender

        emit Lend(borrower, msg.sender, amount);
    }
}
