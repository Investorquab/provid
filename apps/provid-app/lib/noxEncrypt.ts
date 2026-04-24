export async function encryptWithNox(
  address: string,
  values: { walletAgeDays: number; balanceEth: number; txCount: number },
  contractAddress: string
) {
  const { createViemHandleClient } = await import('@iexec-nox/handle')
  const { createWalletClient, custom } = await import('viem')
  const { arbitrumSepolia } = await import('viem/chains')

  // Switch MetaMask to Arbitrum Sepolia first
  await (window as any).ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x' + (421614).toString(16) }],
  })

  const viemWallet = createWalletClient({
    chain: arbitrumSepolia,
    transport: custom((window as any).ethereum),
    account: address as `0x${string}`,
  })

  const handleClient = await createViemHandleClient(viemWallet)

  const [walletAgeEnc, balanceEnc, txCountEnc] = await Promise.all([
    handleClient.encryptInput(BigInt(values.walletAgeDays), 'uint256', contractAddress),
    handleClient.encryptInput(BigInt(values.balanceEth), 'uint256', contractAddress),
    handleClient.encryptInput(BigInt(values.txCount), 'uint256', contractAddress),
  ])

  return { walletAgeEnc, balanceEnc, txCountEnc }
}
