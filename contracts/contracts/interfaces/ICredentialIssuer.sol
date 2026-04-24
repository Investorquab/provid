// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import {ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";

interface ICredentialIssuer {
    function getCredential(address user, uint8 credentialType) external view returns (ebool);
    function credentialIssued(address user, uint8 credentialType) external view returns (bool);
    function getCredentialStatus(address user) external view returns (
        bool[4] memory issued,
        uint256[4] memory issuedAt
    );
}
