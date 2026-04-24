export async function sendTx(address: string, to: `0x${string}`, data: `0x${string}`) {
  const eth = (window as any).ethereum

  const block = await eth.request({ method: 'eth_getBlockByNumber', params: ['latest', false] })
  const baseFee = parseInt(block.baseFeePerGas, 16)
  const maxFeePerGas = Math.ceil(baseFee * 2)
  const maxPriorityFeePerGas = Math.ceil(baseFee * 0.1)

  const hash = await eth.request({
    method: 'eth_sendTransaction',
    params: [{
      from: address,
      to,
      data,
      maxFeePerGas: '0x' + maxFeePerGas.toString(16),
      maxPriorityFeePerGas: '0x' + maxPriorityFeePerGas.toString(16),
    }],
  })
  return hash as string
}
