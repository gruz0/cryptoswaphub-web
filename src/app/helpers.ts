export const reduceAddress = (
  address: `0x${string}`,
  prefixLength = 10,
  suffixLength = 10
): string => {
  if (address.length <= prefixLength + suffixLength) {
    return address
  }

  const prefix = address.slice(0, prefixLength)
  const suffix = address.slice(-suffixLength)

  return `${prefix}...${suffix}`
}
