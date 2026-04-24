import { createConfig, http } from 'wagmi'
import { arbitrumSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [arbitrumSepolia],
  connectors: [injected()],
  transports: {
    [arbitrumSepolia.id]: http('https://arb-sepolia.g.alchemy.com/v2/9jtKqJM7icFXtUSiBM4WR'),
  },
})

export const CONTRACT_ADDRESSES = {
  IdentityVault:       '0xdf434Dd16126BB014d6DffC6017b126A1Ee81A94',
  CredentialIssuer:    '0x5523eF5447aD7F893eaB21c43EC91113675730e5',
  ProofVerifier:       '0x49E331a0d518d55cbc98fA75D4eD781fE6a668e2',
  ProvidIdentityToken: '0x808eED65Ff29d8b32059424D2B78656ba0E98156',
} as const

export const CREDENTIAL_NAMES: Record<number, string> = {
  0: 'Wallet age 90+ days',
  1: 'ETH balance above zero',
  2: 'Transaction count 3+',
  3: 'Full verification',
}
