export function calculateMortgage(
  originalPrincipal,
  annualRate,
  years,
  escrow = 0,
  currentPrincipal = originalPrincipal,
) {
  const numberOfPayments = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  const principalAndInterest =
    monthlyRate === 0
      ? originalPrincipal / numberOfPayments
      : originalPrincipal *
        ((monthlyRate * (1 + monthlyRate) ** numberOfPayments) /
          ((1 + monthlyRate) ** numberOfPayments - 1));

  const interest = currentPrincipal * monthlyRate;
  const principalPayment = Math.min(
    currentPrincipal,
    Math.max(0, principalAndInterest - interest),
  );
  let balance = currentPrincipal;
  let totalInterest = 0;
  let lastPrincipalPayment = 0;
  let lastInterest = 0;
  let projectedPayments = 0;

  while (balance > 0 && projectedPayments < 1200) {
    lastInterest = balance * monthlyRate;
    const scheduledPrincipal = principalAndInterest - lastInterest;

    if (scheduledPrincipal <= 0) {
      break;
    }

    lastPrincipalPayment = Math.min(balance, scheduledPrincipal);
    totalInterest += lastInterest;
    balance -= lastPrincipalPayment;
    if (balance < 0.0000001) {
      balance = 0;
    }
    projectedPayments += 1;
  }

  return {
    principalAndInterest,
    principalPayment,
    interest,
    lastPrincipalPayment,
    lastInterest,
    escrow,
    totalPayment: principalAndInterest + escrow,
    lastPrincipalAndInterest: lastPrincipalPayment + lastInterest,
    lastTotalPayment: lastPrincipalPayment + lastInterest + escrow,
    totalInterest,
    numberOfPayments,
    projectedPayments,
  };
}
