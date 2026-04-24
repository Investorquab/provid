// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

contract IdentityVault {
    struct IdentityData {
        euint256 walletAgeDays;
        euint256 tokenBalance;
        euint256 txCount;
        bool exists;
        uint256 registeredAt;
    }

    mapping(address => IdentityData) private identities;
    address public credentialIssuer;
    address public owner;

    event IdentityRegistered(address indexed user, uint256 timestamp);
    event CredentialIssuerSet(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setCredentialIssuer(address _issuer) external onlyOwner {
        credentialIssuer = _issuer;
        emit CredentialIssuerSet(_issuer);
    }

    function registerIdentity(
        externalEuint256 walletAgeHandle, bytes calldata walletAgeProof,
        externalEuint256 tokenBalanceHandle, bytes calldata tokenBalanceProof,
        externalEuint256 txCountHandle, bytes calldata txCountProof
    ) external {
        require(!identities[msg.sender].exists, "already registered");

        euint256 walletAge = Nox.fromExternal(walletAgeHandle, walletAgeProof);
        euint256 tokenBalance = Nox.fromExternal(tokenBalanceHandle, tokenBalanceProof);
        euint256 txCount = Nox.fromExternal(txCountHandle, txCountProof);

        identities[msg.sender] = IdentityData({
            walletAgeDays: walletAge,
            tokenBalance: tokenBalance,
            txCount: txCount,
            exists: true,
            registeredAt: block.timestamp
        });

        _grantPermissions(msg.sender, walletAge);
        _grantPermissions(msg.sender, tokenBalance);
        _grantPermissions(msg.sender, txCount);

        emit IdentityRegistered(msg.sender, block.timestamp);
    }

    function getIdentityHandles(address user) external view returns (
        euint256 walletAgeDays,
        euint256 tokenBalance,
        euint256 txCount,
        bool exists,
        uint256 registeredAt
    ) {
        IdentityData storage data = identities[user];
        return (data.walletAgeDays, data.tokenBalance, data.txCount, data.exists, data.registeredAt);
    }

    function isRegistered(address user) external view returns (bool) {
        return identities[user].exists;
    }

    function _grantPermissions(address user, euint256 handle) internal {
        Nox.allowThis(handle);
        Nox.allow(handle, user);
        if (credentialIssuer != address(0)) {
            Nox.allow(handle, credentialIssuer);
        }
    }
}
