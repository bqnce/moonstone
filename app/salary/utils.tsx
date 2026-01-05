export const HUF_TO_EUR_RATE = 400;

export const calculateEurPreview = (
  amount: string,
  isEurAccount: boolean
): string | null => {
  if (isEurAccount && amount) {
    return (parseFloat(amount) / HUF_TO_EUR_RATE).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return null;
};