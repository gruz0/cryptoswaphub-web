'use client'

import React from 'react'
import { useDisconnect } from 'wagmi'

export default function Component() {
  const { disconnect } = useDisconnect()

  return (
    <button
      onClick={() => disconnect()}
      className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 mr-4 rounded"
    >
      Disconnect wallet
    </button>
  )
}
