'use client'

import React from 'react'
import { useAccount, useBalance } from 'wagmi'

interface Props {
  chainId: number
  tokenContract?: `0x${string}`
  fractionDigits?: number
}

export default function Component({
  chainId,
  tokenContract,
  fractionDigits = 8,
}: Props) {
  const { isConnected, address } = useAccount()
  const { data, isError, isLoading, error } = useBalance({
    address: address,
    chainId: chainId,
    token: tokenContract,
  })

  if (!isConnected) return null
  if (!data) return null
  if (isLoading) return <>Loading balance...</>
  if (isError) return <>Unable to load balance: {error}</>

  return (
    <>
      {(+data.formatted).toFixed(fractionDigits)} {data.symbol}
    </>
  )
}
