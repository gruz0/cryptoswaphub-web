import React from 'react'
import { reduceAddress } from './helpers'

interface Props {
  blockchainExplorerURL: string
  marketplaceContract: `0x${string}`
  tokenContract: `0x${string}`
}

export default function Component({
  blockchainExplorerURL,
  marketplaceContract,
  tokenContract,
}: Props) {
  return (
    <div className="flex flex-col bg-gray-200 rounded shadow-lg mt-6">
      <div className="w-full rounded shadow-lg divide-gray-300 divide-solid">
        <div className="px-6 py-4">
          <div className="font-bold text-1xl mb-2">
            Here is the list of our smart contracts:
          </div>

          <p className="text-gray-700 text-base">
            Marketplace:{' '}
            <a
              href={`${blockchainExplorerURL}/address/${marketplaceContract}`}
              target="_blank"
              rel="nofollor noopener noreferrer"
              className="underline"
            >
              {reduceAddress(marketplaceContract)}
            </a>
          </p>

          <p className="text-gray-700 text-base">
            Token:{' '}
            <a
              href={`${blockchainExplorerURL}/address/${tokenContract}`}
              target="_blank"
              rel="nofollor noopener noreferrer"
              className="underline"
            >
              {reduceAddress(tokenContract)}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
