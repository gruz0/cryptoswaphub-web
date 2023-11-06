'use client'

import React from 'react'
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [bscTestnet],
  [publicProvider()]
)

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors: [new MetaMaskConnector({ chains })],
})

export default function WagmiContext({
  children,
}: {
  children: React.ReactNode
}) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>
}
