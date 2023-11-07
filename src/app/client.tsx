'use client'

import { useIsClient } from '@uidotdev/usehooks'
import React, { useState } from 'react'
import { formatEther, formatUnits } from 'viem'
import { useAccount, useContractRead, useNetwork } from 'wagmi'
import { marketplaceABI } from '@/generated'
import ConnectWallet from './connect-wallet'
import DisconnectWallet from './disconnect-wallet'
import { reduceAddress } from './helpers'
import SwitchNetwork from './switch-network'
import TokenBalance from './token-balance'

interface Props {
  chainId: number
  marketplaceContract: `0x${string}`
  tokenContract: `0x${string}`
}

interface MarketplaceValues {
  availableTokens: string
  tokenPriceInNativeToken: string
  tokenPriceInCents: number
  tokenDecimals: number
}

export default function Component({
  chainId,
  marketplaceContract,
  tokenContract,
}: Props) {
  const isClient = useIsClient()
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  const { chain } = useNetwork()
  const {
    isSuccess: isGetValuesLoaded,
    isError: isGetValuesErrored,
    error: getValuesError,
    isLoading: isGetValuesLoading,
  } = useContractRead({
    enabled: isConnected && chain && chain.id === chainId,
    address: marketplaceContract,
    abi: marketplaceABI,
    chainId: chainId,
    account: address,
    functionName: 'getValues',
    onSuccess(data) {
      setMarketplaceValues({
        availableTokens: formatUnits(data[0], data[3]),
        tokenPriceInNativeToken: formatEther(data[1]),
        tokenPriceInCents: data[2],
        tokenDecimals: data[3],
      })
    },
  })

  const [marketplaceValues, setMarketplaceValues] = useState<MarketplaceValues>(
    {
      availableTokens: '',
      tokenPriceInNativeToken: '',
      tokenPriceInCents: 0,
      tokenDecimals: 0,
    }
  )

  if (!isClient) return null

  return (
    <>
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
                {address && (
                  <div className="font-bold text-1xl mb-2">
                    Hi {reduceAddress(address)},
                  </div>
                )}

                {chain && chain.id === chainId ? (
                  <>
                    <p className="text-gray-700 text-base">
                      Your network cryptocurrency balance:{' '}
                      <TokenBalance chainId={chainId} />.
                    </p>

                    <p className="text-gray-700 text-base">
                      Your tokens balance:{' '}
                      <TokenBalance
                        chainId={chainId}
                        tokenContract={tokenContract}
                        fractionDigits={0}
                      />
                      .
                    </p>
                  </>
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

      {isConnected && chain && chain.id === chainId && (
        <div className="mt-6 flex flex-col bg-gray-200 rounded shadow-lg">
          <div className="w-full rounded shadow-lg divide-gray-300 divide-solid">
            <div className="px-6 py-4">
              {isGetValuesLoading && (
                <div className="font-bold text-1xl mb-2">
                  Loading marketplace...
                </div>
              )}

              {isGetValuesErrored && getValuesError && (
                <>
                  <div className="font-bold text-1xl mb-2">
                    Unable to load marketplace
                  </div>

                  <p className="text-red-700 text-base">
                    {getValuesError.message}
                  </p>
                </>
              )}

              {isGetValuesLoaded && (
                <>
                  <div className="font-bold text-1xl mb-2">Marketplace</div>

                  <p className="text-gray-700 text-base">
                    Available tokens to buy: {marketplaceValues.availableTokens}
                  </p>

                  <p className="text-gray-700 text-base">
                    Token price: {marketplaceValues.tokenPriceInCents / 100} USD
                    (~{marketplaceValues.tokenPriceInNativeToken} BNB)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
