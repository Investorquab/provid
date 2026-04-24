import { encodeFunctionData } from 'viem'
import { ProvidIdentityTokenABI } from '@/lib/abis/ProvidIdentityToken'
import { encryptWithNox } from '@/lib/noxEncrypt'
import { CONTRACT_ADDRESSES } from '@/lib/web3'

const TOKEN = CONTRACT_ADDRESSES.ProvidIdentityToken as `0x${string}`

export async function mintProvidToken(address: string) {
  const { walletAgeEnc } = await encryptWithNox(
    address,
    { walletAgeDays: 1, balanceEth: 1, txCount: 1 },
    TOKEN
  )

  const data = encodeFunctionData({
    abi: ProvidIdentityTokenABI,
    functionName: 'mintIdentity',
    args: [
      walletAgeEnc.handle as `0x${string}`,
      walletAgeEnc.handleProof as `0x${string}`,
    ],
  })

  const eth = (window as any).ethereum
  const block = await eth.request({ method: 'eth_getBlockByNumber', params: ['latest', false] })
  const baseFee = parseInt(block.baseFeePerGas, 16)
  const maxFeePerGas = Math.ceil(baseFee * 2)
  const maxPriorityFeePerGas = Math.ceil(baseFee * 0.1)

  const hash = await eth.request({
    method: 'eth_sendTransaction',
    params: [{
      from: address,
      to: TOKEN,
      data,
      gas: '0x' + (600000).toString(16),
      maxFeePerGas: '0x' + maxFeePerGas.toString(16),
      maxPriorityFeePerGas: '0x' + maxPriorityFeePerGas.toString(16),
    }],
  })

  return hash as string
}
