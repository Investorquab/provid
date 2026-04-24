// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Nox, ebool} from "@iexec-nox/nox-protocol-contracts/contracts/sdk/Nox.sol";
import {ICredentialIssuer} from "./interfaces/ICredentialIssuer.sol";

contract ProofVerifier {
    ICredentialIssuer public immutable issuer;
    address public owner;

    struct VerificationRequest {
        address user;
        address requester;
        uint8 credentialType;
        uint256 requestedAt;
        bool fulfilled;
        bool result;
    }

    mapping(bytes32 => VerificationRequest) public verificationRequests;

    event VerificationRequested(bytes32 indexed requestId, address indexed user, address indexed requester, uint8 credentialType);
    event VerificationResult(bytes32 indexed requestId, address indexed user, uint8 credentialType, bool qualified);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _issuer) {
        issuer = ICredentialIssuer(_issuer);
        owner = msg.sender;
    }

    function requestVerification(
        address user,
        uint8 credentialType,
        bytes calldata decryptionProof
    ) external returns (bytes32 requestId) {
        require(credentialType <= 3, "invalid credential type");

        requestId = keccak256(abi.encodePacked(user, credentialType, msg.sender, block.timestamp, block.number));

        ebool credential = issuer.getCredential(user, credentialType);
        bool qualified = Nox.publicDecrypt(credential, decryptionProof);

        verificationRequests[requestId] = VerificationRequest({
            user: user,
            requester: msg.sender,
            credentialType: credentialType,
            requestedAt: block.timestamp,
            fulfilled: true,
            result: qualified
        });

        emit VerificationRequested(requestId, user, msg.sender, credentialType);
        emit VerificationResult(requestId, user, credentialType, qualified);

        return requestId;
    }

    function getRequest(bytes32 requestId) external view returns (VerificationRequest memory) {
        return verificationRequests[requestId];
    }
}
