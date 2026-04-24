// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Nox, euint256, ebool, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {IIdentityVault} from "./interfaces/IIdentityVault.sol";

interface IProvidIdentityToken {
    function mintIdentity(address to, externalEuint256 encryptedAmount, bytes calldata inputProof) external returns (euint256);
    function hasIdentityToken(address wallet) external view returns (bool);
    function hasMinted(address wallet) external view returns (bool);
}

contract CredentialIssuer {
    uint8 public constant CRED_WALLET_AGE  = 0;
    uint8 public constant CRED_MIN_BALANCE = 1;
    uint8 public constant CRED_TX_HISTORY  = 2;
    uint8 public constant CRED_FULL_KYC    = 3;

    uint256 public constant WALLET_AGE_THRESHOLD  = 90;
    uint256 public constant MIN_BALANCE_THRESHOLD = 1;
    uint256 public constant TX_COUNT_THRESHOLD    = 3;

    IIdentityVault public immutable vault;
    address public proofVerifier;
    address public owner;
    IProvidIdentityToken public identityToken;

    mapping(address => mapping(uint8 => ebool)) private credentials;
    mapping(address => mapping(uint8 => bool)) public credentialIssued;
    mapping(address => mapping(uint8 => uint256)) public credentialIssuedAt;

    event CredentialIssued(address indexed user, uint8 credentialType, uint256 timestamp);
    event IdentityTokenMinted(address indexed user);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _vault) {
        vault = IIdentityVault(_vault);
        owner = msg.sender;
    }

    function setProofVerifier(address _verifier) external onlyOwner {
        proofVerifier = _verifier;
    }

    function setIdentityToken(address _token) external onlyOwner {
        identityToken = IProvidIdentityToken(_token);
    }

    function issueCredential(uint8 credentialType) external {
        require(vault.isRegistered(msg.sender), "register identity first");
        require(credentialType <= CRED_FULL_KYC, "invalid credential type");

        (euint256 walletAgeDays, euint256 tokenBalance, euint256 txCount,,) =
            vault.getIdentityHandles(msg.sender);

        ebool result;

        if (credentialType == CRED_WALLET_AGE) {
            result = Nox.ge(walletAgeDays, Nox.toEuint256(WALLET_AGE_THRESHOLD));
        } else if (credentialType == CRED_MIN_BALANCE) {
            result = Nox.ge(tokenBalance, Nox.toEuint256(MIN_BALANCE_THRESHOLD));
        } else if (credentialType == CRED_TX_HISTORY) {
            result = Nox.ge(txCount, Nox.toEuint256(TX_COUNT_THRESHOLD));
        } else {
            ebool ageOk     = Nox.ge(walletAgeDays, Nox.toEuint256(WALLET_AGE_THRESHOLD));
            ebool balanceOk = Nox.ge(tokenBalance, Nox.toEuint256(MIN_BALANCE_THRESHOLD));
            ebool txOk      = Nox.ge(txCount, Nox.toEuint256(TX_COUNT_THRESHOLD));
            euint256 zero = Nox.toEuint256(0);
            euint256 one  = Nox.toEuint256(1);
            euint256 ab   = Nox.select(ageOk, Nox.select(balanceOk, one, zero), zero);
            euint256 abc  = Nox.select(txOk, ab, zero);
            result = Nox.ge(abc, one);
        }

        credentials[msg.sender][credentialType] = result;
        credentialIssued[msg.sender][credentialType] = true;
        credentialIssuedAt[msg.sender][credentialType] = block.timestamp;

        Nox.allowThis(result);
        Nox.allow(result, msg.sender);
        if (proofVerifier != address(0)) {
            Nox.allow(result, proofVerifier);
        }

        emit CredentialIssued(msg.sender, credentialType, block.timestamp);
    }

    function getCredential(address user, uint8 credentialType) external view returns (ebool) {
        require(credentialIssued[user][credentialType], "credential not issued");
        return credentials[user][credentialType];
    }

    function getCredentialStatus(address user) external view returns (
        bool[4] memory issued,
        uint256[4] memory issuedAt
    ) {
        for (uint8 i = 0; i <= CRED_FULL_KYC; i++) {
            issued[i] = credentialIssued[user][i];
            issuedAt[i] = credentialIssuedAt[user][i];
        }
    }

    function hasIdentityToken(address user) external view returns (bool) {
        if (address(identityToken) == address(0)) return false;
        return identityToken.hasMinted(user);
    }
}
