export const ProofVerifierABI = [
  {
    name: 'requestVerification',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'credentialType', type: 'uint8' },
      { name: 'decryptionProof', type: 'bytes' },
    ],
    outputs: [{ name: 'requestId', type: 'bytes32' }],
  },
  {
    name: 'getRequest',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'requestId', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'user', type: 'address' },
          { name: 'requester', type: 'address' },
          { name: 'credentialType', type: 'uint8' },
          { name: 'requestedAt', type: 'uint256' },
          { name: 'fulfilled', type: 'bool' },
          { name: 'result', type: 'bool' },
        ],
      },
    ],
  },
  {
    name: 'VerificationResult',
    type: 'event',
    inputs: [
      { name: 'requestId', type: 'bytes32', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'credentialType', type: 'uint8', indexed: false },
      { name: 'qualified', type: 'bool', indexed: false },
    ],
  },
] as const
