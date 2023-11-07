declare namespace NodeJS {
  export interface ProcessEnv {
    CHAIN_ID: number
    BLOCKCHAIN_EXPLORER_URL: string
    MARKETPLACE_CONTRACT: `0x${string}`
    TOKEN_CONTRACT: `0x${string}`
  }
}
