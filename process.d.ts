declare namespace NodeJS {
  export interface ProcessEnv {
    CHAIN_ID: number
    MARKETPLACE_CONTRACT: `0x${string}`
    TOKEN_CONTRACT: `0x${string}`
  }
}
