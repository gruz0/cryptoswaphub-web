'use client'

import React from 'react'
import { useAccount, useBalance } from 'wagmi'

interface Props {
  chainId: number
  tokenAddress?: `0x${string}`
  fractionDigits?: number
}

export default function Component({
  chainId,
  tokenAddress,
  fractionDigits = 8,
}: Props) {
  const { isConnected, address } = useAccount()
  const { data, isError, isLoading, error } = useBalance({
    address: address,
    chainId: chainId,
    token: tokenAddress,
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
