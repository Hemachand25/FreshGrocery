export const USD_TO_INR = 83;

export function toINR(amountInUSD) {
  const amountInINR = (Number(amountInUSD) || 0) * USD_TO_INR;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amountInINR);
}

export function formatINR(amountInINR) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amountInINR) || 0);
}

export function usdToInrNumber(amountInUSD) {
  return (Number(amountInUSD) || 0) * USD_TO_INR;
}

export function inrToUsdNumber(amountInINR) {
  const v = Number(amountInINR) || 0;
  return v / USD_TO_INR;
}


