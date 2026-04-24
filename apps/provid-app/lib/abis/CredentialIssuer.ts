export const CredentialIssuerABI = [
  {
    name: 'issueCredential',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'credentialType', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'credentialIssued',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'credentialType', type: 'uint8' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getCredentialStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'issued', type: 'bool[4]' },
      { name: 'issuedAt', type: 'uint256[4]' },
    ],
  },
  {
    name: 'CredentialIssued',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'credentialType', type: 'uint8', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const
