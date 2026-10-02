import assert from "node:assert/strict";
import test from "node:test";

import { calculateMortgage } from "./mortgage.js";

const termExpectations = [
  { years: 10, payment: "1078.39", totalInterest: "15012.98" },
  { years: 15, payment: "762.77", totalInterest: "22904.11" },
  { years: 20, payment: "606.18", totalInterest: "31088.61" },
  { years: 30, payment: "452.00", totalInterest: "48324.22" },
];

for (const expectation of termExpectations) {
  test(`calculates a ${expectation.years}-year fixed-rate mortgage`, () => {
    const result = calculateMortgage(
      114394.39,
      2.5,
      expectation.years,
      524.21,
    );

    assert.equal(result.numberOfPayments, expectation.years * 12);
    assert.equal(
      result.principalAndInterest.toFixed(2),
      expectation.payment,
    );
    assert.equal(result.totalInterest.toFixed(2), expectation.totalInterest);
    assert.equal(
      result.totalPayment.toFixed(2),
      (Number(expectation.payment) + 524.21).toFixed(2),
    );
  });
}

test("calculates the first month's principal and interest split", () => {
  const result = calculateMortgage(114394.39, 2.5, 10);

  assert.equal(result.interest.toFixed(2), "238.32");
  assert.equal(result.principalPayment.toFixed(2), "840.07");
  assert.equal(
    (result.principalPayment + result.interest).toFixed(2),
    result.principalAndInterest.toFixed(2),
  );
});

test("supports a zero-percent mortgage", () => {
  const result = calculateMortgage(120000, 0, 10);

  assert.equal(result.principalAndInterest, 1000);
  assert.equal(result.interest, 0);
  assert.equal(result.totalInterest, 0);
});
