'use client'

import React from 'react'
import { useConnect } from 'wagmi'

interface Props {
  chainId: number
}

export default function Component({ chainId }: Props) {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect({
      chainId: chainId,
    })

  return (
    <>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mr-4 rounded"
        >
          {connector.name}
          {isLoading &&
            pendingConnector?.id === connector.id &&
            ' (connecting)'}
        </button>
      ))}

      {error && <>Unable to connect: {error.message}</>}
    </>
  )
}
