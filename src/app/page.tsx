import getConfig from 'next/config'
import React from 'react'
import Client from './client'
import WagmiContext from './wagmi'

const { publicRuntimeConfig } = getConfig()

export default function Home() {
  return (
    <WagmiContext>
      <div className="items-center w-screen h-screen flex justify-center">
        <div className="w-full bg-gray-100 max-w-xl p-6 rounded shadow-lg">
          <h1 className="p-4 text-3xl font-bold">
            Welcome to Crypto Swap Hub 👋
          </h1>

          <Client chainId={+publicRuntimeConfig.chainId} />
        </div>
      </div>
    </WagmiContext>
  )
}
