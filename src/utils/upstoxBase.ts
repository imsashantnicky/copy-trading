// utils/upstoxBase.ts
export const upstoxBase = () =>
    process.env.UPSTOX_ENV === 'live'
      ? 'https://api-hft.upstox.com/v3'
      : 'https://api-sandbox.upstox.com/v3';
  