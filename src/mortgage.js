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

  return {
    principalAndInterest,
    principalPayment,
    interest,
    escrow,
    totalPayment: principalAndInterest + escrow,
    totalInterest: principalAndInterest * numberOfPayments - principal,
    numberOfPayments,
  };
}
