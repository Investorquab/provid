export const IdentityVaultABI = [
  {
    name: 'registerIdentity',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'walletAgeHandle', type: 'bytes32' },
      { name: 'walletAgeProof', type: 'bytes' },
      { name: 'tokenBalanceHandle', type: 'bytes32' },
      { name: 'tokenBalanceProof', type: 'bytes' },
      { name: 'txCountHandle', type: 'bytes32' },
      { name: 'txCountProof', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'isRegistered',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getIdentityHandles',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'walletAgeDays', type: 'bytes32' },
      { name: 'tokenBalance', type: 'bytes32' },
      { name: 'txCount', type: 'bytes32' },
      { name: 'exists', type: 'bool' },
      { name: 'registeredAt', type: 'uint256' },
    ],
  },
  {
    name: 'IdentityRegistered',
    type: 'event',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const
