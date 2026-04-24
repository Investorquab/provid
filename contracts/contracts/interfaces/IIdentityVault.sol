// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import {euint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

interface IIdentityVault {
    function getIdentityHandles(address user) external view returns (
        euint256 walletAgeDays,
        euint256 tokenBalance,
        euint256 txCount,
        bool exists,
        uint256 registeredAt
    );
    function isRegistered(address user) external view returns (bool);
}
