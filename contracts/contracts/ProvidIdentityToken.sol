// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Nox, euint256, externalEuint256} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {ERC7984} from "@iexec-nox/nox-confidential-contracts/contracts/token/ERC7984.sol";

interface ICredentialIssuer {
    function credentialIssued(address user, uint8 credentialType) external view returns (bool);
}

contract ProvidIdentityToken is ERC7984, Ownable {
    address public credentialIssuer;
    mapping(address => bool) public hasMinted;

    event IdentityTokenMinted(address indexed to, uint256 timestamp);

    constructor() ERC7984("PROVID Identity", "PVID", "") Ownable(msg.sender) {}

    function setCredentialIssuer(address _issuer) external onlyOwner {
        credentialIssuer = _issuer;
    }

    /**
     * @notice Anyone can call this to mint their own token
     *         BUT the CredentialIssuer must confirm all 4 credentials pass
     *         One per wallet — Sybil resistant
     */
    function mintIdentity(
        externalEuint256 encryptedAmount,
        bytes calldata inputProof
    ) external {
        require(!hasMinted[msg.sender], "Already minted");
        require(credentialIssuer != address(0), "Issuer not set");

        // Check all 4 credentials are verified on-chain
        ICredentialIssuer issuer = ICredentialIssuer(credentialIssuer);
        require(issuer.credentialIssued(msg.sender, 0), "Wallet age not verified");
        require(issuer.credentialIssued(msg.sender, 1), "Balance not verified");
        require(issuer.credentialIssued(msg.sender, 2), "Tx count not verified");
        require(issuer.credentialIssued(msg.sender, 3), "Full KYC not verified");

        hasMinted[msg.sender] = true;

        euint256 amount = Nox.fromExternal(encryptedAmount, inputProof);
        emit IdentityTokenMinted(msg.sender, block.timestamp);
        _mint(msg.sender, amount);
    }

    function hasIdentityToken(address wallet) external view returns (bool) {
        return hasMinted[wallet];
    }
}
