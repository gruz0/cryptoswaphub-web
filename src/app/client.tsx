'use client'

import { useIsClient } from '@uidotdev/usehooks'
import React from 'react'
import { useAccount, useNetwork } from 'wagmi'
import ConnectWallet from './connect-wallet'
import DisconnectWallet from './disconnect-wallet'
import SwitchNetwork from './switch-network'
import TokenBalance from './token-balance'

interface Props {
  chainId: number
}

export default function Component({ chainId }: Props) {
  const isClient = useIsClient()
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { chain } = useNetwork()

  if (!isClient) return null

  return (
    <div className="flex flex-col bg-gray-200 rounded shadow-lg">
      {isConnecting && (
        <div className="p-4">
          <h2 className="text-1xl mb-4">Connecting...</h2>
        </div>
      )}

      {isDisconnected && (
        <div className="p-4">
          <h2 className="text-1xl mb-4">
            To use this platform please connect your wallet.
          </h2>

          <ConnectWallet chainId={chainId} />
        </div>
      )}

      {isConnected && (
        <>
          <div className="w-full rounded shadow-lg divide-gray-300 divide-solid">
            <div className="px-6 py-4">
              <div className="font-bold text-1xl mb-2">Hi {address},</div>

              {chain && chain.id === chainId ? (
                <p className="text-gray-700 text-base">
                  Your network cryptocurrency balance:{' '}
                  <TokenBalance chainId={chainId} />.
                </p>
              ) : (
                <>
                  <h2 className="text-1xl mb-4">
                    Please switch your wallet to the supported network:
                  </h2>

                  <SwitchNetwork />
                </>
              )}
            </div>

            <hr />

            <div className="px-6 py-4">
              <DisconnectWallet />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
