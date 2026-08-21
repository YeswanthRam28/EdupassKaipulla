export const CREDENTIAL_REGISTRY_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CREDENTIAL_REGISTRY_ABI = [
  {
    type: "function",
    name: "registerCredential",
    stateMutability: "nonpayable",
    inputs: [
      { name: "credentialId", type: "bytes32" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "revokeCredential",
    stateMutability: "nonpayable",
    inputs: [{ name: "credentialId", type: "bytes32" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getCredential",
    stateMutability: "view",
    inputs: [{ name: "credentialId", type: "bytes32" }],
    outputs: [
      { name: "issuer", type: "address" },
      { name: "commitment", type: "bytes32" },
      { name: "issuedAt", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "isActive",
    stateMutability: "view",
    inputs: [{ name: "credentialId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "event",
    name: "CredentialRegistered",
    inputs: [
      { name: "credentialId", type: "bytes32", indexed: true },
      { name: "issuer", type: "address", indexed: true },
      { name: "commitment", type: "bytes32", indexed: false },
      { name: "issuedAt", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "CredentialRevoked",
    inputs: [
      { name: "credentialId", type: "bytes32", indexed: true },
      { name: "issuer", type: "address", indexed: true },
    ],
  },
] as const;
