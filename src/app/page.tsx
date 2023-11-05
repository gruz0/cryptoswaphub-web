import React from 'react'
import Client from './client'
import WagmiContext from './wagmi'

export default function Home() {
  return (
    <WagmiContext>
      <div className="items-center w-screen h-screen flex justify-center">
        <div className="w-full bg-gray-100 max-w-xl p-6 rounded shadow-lg">
          <h1 className="p-4 text-3xl font-bold">
            Welcome to Crypto Swap Hub 👋
          </h1>

          <Client chainId={97} />
        </div>
      </div>
    </WagmiContext>
  )
}
