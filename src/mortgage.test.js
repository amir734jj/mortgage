import assert from "node:assert/strict";
import test from "node:test";

import { calculateMortgage } from "./mortgage.js";

const termExpectations = [
  { years: 10, payment: "942.70", totalInterest: "13123.88" },
  { years: 15, payment: "666.79", totalInterest: "20022.06" },
  { years: 20, payment: "529.90", totalInterest: "27176.69" },
  { years: 30, payment: "395.12", totalInterest: "42243.52" },
];

for (const expectation of termExpectations) {
  test(`calculates a ${expectation.years}-year fixed-rate mortgage`, () => {
    const result = calculateMortgage(100000, 2.5, expectation.years, 500);

    assert.equal(result.numberOfPayments, expectation.years * 12);
    assert.equal(
      result.principalAndInterest.toFixed(2),
      expectation.payment,
    );
    assert.equal(result.totalInterest.toFixed(2), expectation.totalInterest);
    assert.equal(
      result.totalPayment.toFixed(2),
      (Number(expectation.payment) + 500).toFixed(2),
    );
  });
}

test("calculates the first month's principal and interest split", () => {
  const result = calculateMortgage(100000, 2.5, 10);

  assert.equal(result.interest.toFixed(2), "208.33");
  assert.equal(result.principalPayment.toFixed(2), "734.37");
  assert.equal(
    (result.principalPayment + result.interest).toFixed(2),
    result.principalAndInterest.toFixed(2),
  );
});

test("calculates the final month's principal and interest split", () => {
  const result = calculateMortgage(100000, 2.5, 10);

  assert.equal(result.lastInterest.toFixed(2), "1.96");
  assert.equal(result.lastPrincipalPayment.toFixed(2), "940.74");
  assert.equal(
    (result.lastPrincipalPayment + result.lastInterest).toFixed(2),
    result.principalAndInterest.toFixed(2),
  );
});

test("amortizes every available term to a zero balance", () => {
  for (const { years } of termExpectations) {
    const result = calculateMortgage(100000, 2.5, years, 500);
    const monthlyRate = 0.025 / 12;
    let balance = 100000;
    let totalInterest = 0;
    let lastInterest = 0;
    let lastPrincipal = 0;

    for (let month = 1; month <= result.numberOfPayments; month += 1) {
      lastInterest = balance * monthlyRate;
      lastPrincipal = result.principalAndInterest - lastInterest;
      totalInterest += lastInterest;
      balance -= lastPrincipal;
    }

    assert.ok(Math.abs(balance) < 0.000001);
    assert.ok(Math.abs(totalInterest - result.totalInterest) < 0.000001);
    assert.ok(Math.abs(lastInterest - result.lastInterest) < 0.000001);
    assert.ok(
      Math.abs(lastPrincipal - result.lastPrincipalPayment) < 0.000001,
    );
  }
});

test("supports a zero-percent mortgage", () => {
  const result = calculateMortgage(120000, 0, 10);

  assert.equal(result.principalAndInterest, 1000);
  assert.equal(result.interest, 0);
  assert.equal(result.lastInterest, 0);
  assert.equal(result.lastPrincipalPayment, 1000);
  assert.equal(result.totalInterest, 0);
});
