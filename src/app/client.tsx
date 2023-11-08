'use client'

import { useIsClient } from '@uidotdev/usehooks'
import React, { useCallback, useEffect, useState } from 'react'
import { formatEther, formatUnits, parseUnits } from 'viem'
import {
  useAccount,
  useBalance,
  useContractRead,
  useNetwork,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { marketplaceABI } from '@/generated'
import ConnectWallet from './connect-wallet'
import DisconnectWallet from './disconnect-wallet'
import { reduceAddress } from './helpers'
import SwitchNetwork from './switch-network'

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

const DEFAULT_TOKENS = 100

export default function Component({
  chainId,
  marketplaceContract,
  tokenContract,
}: Props) {
  const isClient = useIsClient()

  const [tokensToBuy, setTokensToBuy] = useState<string>('')
  const [estimatedPriceInBNB, setEstimatedPriceInBNB] = useState<bigint>()
  const [estimatedPriceInBNBFormatted, setEstimatedPriceInBNBFormatted] =
    useState<string>('')
  const [isSufficientFunds, setIsSufficientFunds] = useState<boolean>(false)
  const [availableTokensForUser, setAvailableTokensForUser] =
    useState<number>(0)
  const [showBuyButton, setShowBuyButton] = useState<boolean>(false)

  const [marketplaceValues, setMarketplaceValues] = useState<MarketplaceValues>(
    {
      availableTokens: '',
      tokenPriceInNativeToken: '',
      tokenPriceInCents: 0,
      tokenDecimals: 0,
    }
  )

  const { address, isConnected, isConnecting, isDisconnected } = useAccount()

  const { chain } = useNetwork()

  const {
    data: userNetworkTokensBalanceData,
    isError: isUserNetworkTokensBalanceErrored,
    isLoading: isUserNetworkTokensBalanceLoading,
    error: userNetworkTokensBalanceError,
    isSuccess: userNetworkTokensBalanceLoaded,
  } = useBalance({
    address: address,
    chainId: chainId,
    enabled: isConnected && chain && chain.id === chainId,
  })

  const {
    data: userApplicationTokensBalanceData,
    isError: isUserApplicationTokensBalanceErrored,
    isLoading: isUserApplicationTokensBalanceLoading,
    error: userApplicationTokensBalanceError,
  } = useBalance({
    address: address,
    chainId: chainId,
    token: tokenContract,
    enabled: isConnected && chain && chain.id === chainId,
  })

  const {
    data: getValuesRaw,
    isSuccess: isGetValuesLoaded,
    isError: isGetValuesErrored,
    error: getValuesError,
    isLoading: isGetValuesLoading,
  } = useContractRead({
    enabled:
      isConnected &&
      chain &&
      chain.id === chainId &&
      userNetworkTokensBalanceLoaded,
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

      if (userNetworkTokensBalanceData) {
        const tokensForUser = userNetworkTokensBalanceData.value / data[1]
        setAvailableTokensForUser(+tokensForUser.toString())
      }

      // NOTE: We want to populate pre-defined values right after getting actual tokens price
      recalculate(DEFAULT_TOKENS)
    },
  })

  const { config } = usePrepareContractWrite({
    enabled:
      isConnected &&
      chain &&
      chain.id === chainId &&
      isSufficientFunds &&
      +tokensToBuy > 0,
    chainId: chainId,
    account: address,
    address: marketplaceContract,
    abi: marketplaceABI,
    functionName: 'buyTokens',
    args: [parseUnits(tokensToBuy, marketplaceValues.tokenDecimals)],
    value: estimatedPriceInBNB,
  })

  const {
    isLoading: isBuyTokensLoading,
    error: buyTokensError,
    isSuccess: isBuyTokensSucceeded,
    write: buyTokens,
  } = useContractWrite(config)

  const recalculate = useCallback(
    (tokensAmount: number) => {
      if (!getValuesRaw) return

      const tokensPriceInUnits = getValuesRaw[1] * BigInt(tokensAmount)

      const tokensPriceFormatted = formatUnits(
        tokensPriceInUnits,
        getValuesRaw[3]
      )

      setTokensToBuy(tokensAmount.toString())
      setEstimatedPriceInBNB(tokensPriceInUnits)
      setEstimatedPriceInBNBFormatted(tokensPriceFormatted.toString())
      setShowBuyButton(tokensAmount > 0)
    },
    [getValuesRaw]
  )

  const handleTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userNetworkTokensBalanceData) return
    if (!getValuesRaw) return

    let value = e.target.value.trim()

    if (value.length === 0 || +value <= 0) {
      value = ''
    } else if (+value > availableTokensForUser) {
      value = availableTokensForUser.toString()
    }

    recalculate(+value)
  }

  const handleBuyTokens = () => {
    buyTokens?.()
  }

  useEffect(() => {
    if (!userNetworkTokensBalanceData) return
    if (!estimatedPriceInBNB) return

    setIsSufficientFunds(
      userNetworkTokensBalanceData.value > estimatedPriceInBNB
    )
  }, [estimatedPriceInBNB, userNetworkTokensBalanceData])

  if (!isClient) {
    return (
      <div className="flex flex-col bg-gray-100 rounded shadow-lg">
        <div className="w-full rounded shadow-lg divide-gray-300 divide-solid">
          <div className="px-6 py-4">
            <p className="text-gray-700 text-base">Loading application...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col bg-gray-100 rounded shadow-lg">
        {isConnecting && (
          <div className="p-4">
            <h2 className="text-gray-700 text-base">Connecting...</h2>
          </div>
        )}

        {isDisconnected && (
          <div className="p-4">
            <h2 className="text-1xl mb-4 font-bold">
              To use this platform, kindly connect your wallet.
            </h2>

            <p className="text-gray-700 text-base mb-4">
              We require a connected wallet to request information about
              available tokens with their price from the blockchain network
              because all data is stored on-chain. After connecting your wallet,
              you will have access to the platform.
            </p>

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
                      Your network tokens balance:{' '}
                      {isUserNetworkTokensBalanceLoading && <>Loading...</>}
                      {isUserNetworkTokensBalanceErrored && <>Error</>}
                      {userNetworkTokensBalanceData && (
                        <>
                          {userNetworkTokensBalanceData.formatted}{' '}
                          {userNetworkTokensBalanceData.symbol}
                        </>
                      )}
                    </p>

                    {userNetworkTokensBalanceError && (
                      <p className="text-red-700 text-base">
                        Unable to load network tokens balance:{' '}
                        {userNetworkTokensBalanceError.message}
                      </p>
                    )}

                    <p className="text-gray-700 text-base">
                      Your application tokens balance:{' '}
                      {isUserApplicationTokensBalanceLoading && <>Loading...</>}
                      {isUserApplicationTokensBalanceErrored && <>Error</>}
                      {userApplicationTokensBalanceData && (
                        <>
                          {userApplicationTokensBalanceData.formatted}{' '}
                          {userApplicationTokensBalanceData.symbol}
                        </>
                      )}
                    </p>

                    {userApplicationTokensBalanceError && (
                      <p className="text-red-700 text-base">
                        Unable to load application tokens balance:{' '}
                        {userApplicationTokensBalanceError.message}
                      </p>
                    )}
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

      {isConnected &&
        chain &&
        chain.id === chainId &&
        userNetworkTokensBalanceData && (
          <div className="mt-6 flex flex-col bg-gray-100 rounded shadow-lg">
            <div className="w-full rounded shadow-lg divide-gray-300 divide-solid">
              <div className="px-6 py-4">
                {isGetValuesLoading ? (
                  <div className="font-bold text-1xl mb-2">
                    Loading marketplace...
                  </div>
                ) : (
                  <>
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
                        <div className="font-bold text-1xl mb-2">
                          Please use this form to buy our tokens ⤵️
                        </div>

                        {userApplicationTokensBalanceData && (
                          <>
                            <p className="text-gray-700 text-base">
                              Total token supply on the marketplace:{' '}
                              {marketplaceValues.availableTokens}{' '}
                              {userApplicationTokensBalanceData.symbol}.
                            </p>

                            <p className="text-gray-700 text-base">
                              Your balance is enough to buy:{' '}
                              {availableTokensForUser}{' '}
                              {userApplicationTokensBalanceData.symbol}.
                            </p>
                          </>
                        )}

                        <p className="text-gray-700 text-base">
                          1 token price is{' '}
                          {marketplaceValues.tokenPriceInCents / 100} USD (~
                          {marketplaceValues.tokenPriceInNativeToken}{' '}
                          {userNetworkTokensBalanceData.symbol}).
                        </p>

                        {+marketplaceValues.availableTokens > 0 ? (
                          <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mt-4 mb-4">
                            <div className="mb-4">
                              <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="tokens"
                              >
                                How many tokens would you like to buy (max.{' '}
                                {availableTokensForUser})?
                              </label>

                              <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:shadow-outline"
                                id="tokens"
                                type="number"
                                placeholder=""
                                min={1}
                                max={availableTokensForUser}
                                onChange={(e) => handleTokensChange(e)}
                                value={tokensToBuy}
                              />
                            </div>

                            <div className="mb-4">
                              <label
                                className="block text-gray-700 text-sm font-bold mb-2"
                                htmlFor="tokens"
                              >
                                Estimated price in{' '}
                                {userNetworkTokensBalanceData.symbol}:
                              </label>

                              <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                id="estimated_price"
                                type="text"
                                placeholder=""
                                disabled
                                readOnly
                                value={estimatedPriceInBNBFormatted}
                              />
                            </div>

                            {isSufficientFunds ? (
                              <div className="mb-4">
                                {isBuyTokensLoading ? (
                                  <p className="text-blue-700 text-base">
                                    Processing transaction...
                                  </p>
                                ) : (
                                  <>
                                    {buyTokensError && (
                                      <p className="text-red-700 text-base">
                                        Unable to buy tokens:{' '}
                                        {buyTokensError.message}
                                      </p>
                                    )}

                                    {isBuyTokensSucceeded && (
                                      <p className="text-green-700 text-base">
                                        Transaction proceeded!
                                      </p>
                                    )}

                                    {showBuyButton ? (
                                      <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                        type="button"
                                        onClick={() => handleBuyTokens()}
                                      >
                                        Buy
                                      </button>
                                    ) : (
                                      <p className="text-gray-700 text-base">
                                        Please enter amount of tokens you wish
                                        to buy 😉
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="mb-4">
                                <p className="text-red-700 text-base">
                                  Insufficient funds
                                </p>
                              </div>
                            )}
                          </form>
                        ) : (
                          <p className="mt-4 text-red-700 text-base font-bold">
                            Unfortunately, there are no available tokens at the
                            moment.
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  )
}
