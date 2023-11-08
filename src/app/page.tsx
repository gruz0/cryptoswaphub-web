import getConfig from 'next/config'
import React from 'react'
import Client from './client'
import Contracts from './contracts'
import WagmiContext from './wagmi'
import type { Metadata } from 'next'

const { publicRuntimeConfig } = getConfig()

export const metadata: Metadata = {
  title: 'Crypto Swap Hub',
  description: 'Buy project tokens using native network tokens',
}

export default function Home() {
  return (
    <WagmiContext>
      <div className="items-center w-screen h-screen flex justify-center">
        <div className="max-w-xl p-6">
          <h1 className="p-4 text-3xl font-bold">
            Welcome to Crypto Swap Hub 👋
          </h1>

          <Client
            chainId={+publicRuntimeConfig.chainId}
            marketplaceContract={publicRuntimeConfig.marketplaceContract}
            tokenContract={publicRuntimeConfig.tokenContract}
          />

          <Contracts
            blockchainExplorerURL={publicRuntimeConfig.blockchainExplorerURL}
            marketplaceContract={publicRuntimeConfig.marketplaceContract}
            tokenContract={publicRuntimeConfig.tokenContract}
          />
        </div>
      </div>
    </WagmiContext>
  )
}
