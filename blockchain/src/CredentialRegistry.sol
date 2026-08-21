// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CredentialRegistry
 * @dev On-chain trust layer for EduPass. Stores cryptographic commitments and status of academic credentials.
 * Sensitive student PII and raw transcripts are stored off-chain.
 */
contract CredentialRegistry {

    struct Credential {
        address issuer;
        bytes32 commitment;
        uint256 issuedAt;
        bool active;
    }

    mapping(bytes32 => Credential) private credentials;

    event CredentialRegistered(
        bytes32 indexed credentialId,
        address indexed issuer,
        bytes32 commitment,
        uint256 issuedAt
    );

    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed issuer
    );

    /**
     * @dev Register a new academic credential commitment on-chain.
     * @param credentialId Keccak-256 or string hash identifier of the credential.
     * @param commitment Keccak-256 hash of the canonical off-chain credential object.
     */
    function registerCredential(
        bytes32 credentialId,
        bytes32 commitment
    ) external {
        require(
            credentials[credentialId].issuedAt == 0,
            "Credential already exists"
        );

        credentials[credentialId] = Credential({
            issuer: msg.sender,
            commitment: commitment,
            issuedAt: block.timestamp,
            active: true
        });

        emit CredentialRegistered(
            credentialId,
            msg.sender,
            commitment,
            block.timestamp
        );
    }

    /**
     * @dev Revoke an existing credential. Only the issuing wallet can revoke.
     * @param credentialId The target credential identifier to revoke.
     */
    function revokeCredential(
        bytes32 credentialId
    ) external {
        Credential storage credential = credentials[credentialId];

        require(
            credential.issuedAt != 0,
            "Credential does not exist"
        );

        require(
            credential.issuer == msg.sender,
            "Not credential issuer"
        );

        require(
            credential.active == true,
            "Credential already revoked"
        );

        credential.active = false;

        emit CredentialRevoked(
            credentialId,
            msg.sender
        );
    }

    /**
     * @dev View function to fetch credential record.
     * @param credentialId Identifier to query.
     */
    function getCredential(
        bytes32 credentialId
    )
        external
        view
        returns (
            address issuer,
            bytes32 commitment,
            uint256 issuedAt,
            bool active
        )
    {
        Credential memory credential = credentials[credentialId];

        return (
            credential.issuer,
            credential.commitment,
            credential.issuedAt,
            credential.active
        );
    }

    /**
     * @dev View function to check if a credential is valid and active.
     * @param credentialId Identifier to check.
     */
    function isActive(
        bytes32 credentialId
    )
        external
        view
        returns (bool)
    {
        return credentials[credentialId].active;
    }
}
