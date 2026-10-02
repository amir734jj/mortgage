export function calculateMortgage(principal, annualRate, years, escrow = 0) {
  const numberOfPayments = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  const principalAndInterest =
    monthlyRate === 0
      ? principal / numberOfPayments
      : principal *
        ((monthlyRate * (1 + monthlyRate) ** numberOfPayments) /
          ((1 + monthlyRate) ** numberOfPayments - 1));

  const interest = principal * monthlyRate;
  const principalPayment = principalAndInterest - interest;
  const lastPrincipalPayment =
    monthlyRate === 0
      ? principalAndInterest
      : principalAndInterest / (1 + monthlyRate);
  const lastInterest = principalAndInterest - lastPrincipalPayment;

  return {
    principalAndInterest,
    principalPayment,
    interest,
    lastPrincipalPayment,
    lastInterest,
    escrow,
    totalPayment: principalAndInterest + escrow,
    totalInterest: principalAndInterest * numberOfPayments - principal,
    numberOfPayments,
  };
}
