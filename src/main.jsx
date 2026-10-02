import { render } from "preact";
import { useMemo, useState } from "preact/hooks";
import "bootstrap/dist/css/bootstrap.min.css";

import { calculateMortgage } from "./mortgage.js";

const TERMS = [10, 15, 20, 30];
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function NumberField({ label, value, onInput, prefix, suffix, min = 0, step }) {
  return (
    <label class="form-label d-block mb-3">
      <span class="d-block fw-semibold mb-2">{label}</span>
      <span class="input-group">
        {prefix && <span class="input-group-text">{prefix}</span>}
        <input
          type="number"
          class="form-control"
          min={min}
          step={step}
          value={value}
          onInput={(event) => onInput(event.currentTarget.value)}
        />
        {suffix && <span class="input-group-text">{suffix}</span>}
      </span>
    </label>
  );
}

function App() {
  const [principal, setPrincipal] = useState("100000");
  const [annualRate, setAnnualRate] = useState("2.5");
  const [years, setYears] = useState(10);
  const [escrow, setEscrow] = useState("500");

  const values = {
    principal: Math.max(0, Number(principal) || 0),
    annualRate: Math.max(0, Number(annualRate) || 0),
    escrow: Math.max(0, Number(escrow) || 0),
  };

  const payment = useMemo(
    () =>
      calculateMortgage(
        values.principal,
        values.annualRate,
        years,
        values.escrow,
      ),
    [values.principal, values.annualRate, values.escrow, years],
  );

  const shareOfTotal = (amount) =>
    payment.totalPayment > 0
      ? `${((amount / payment.totalPayment) * 100).toFixed(1)}%`
      : "0.0%";

  return (
    <main class="container py-5">
      <section class="row g-4 align-items-end mb-4">
        <div class="col-lg-8">
          <p class="text-uppercase text-primary fw-bold small mb-2">
            Fixed-rate planning tool
          </p>
          <h1 class="display-3 fw-bold">Mortgage payment calculator</h1>
          <p class="lead text-body-secondary mb-0">
            Estimate your monthly principal, interest, and escrow payment using
            the standard amortization formula.
          </p>
        </div>
        <div class="col-lg-4">
          <div class="card text-bg-primary shadow-sm">
            <div class="card-body p-4">
              <p class="card-text mb-1">Estimated monthly payment</p>
              <p class="display-5 fw-bold mb-1">
                {currency.format(payment.totalPayment)}
              </p>
              <small>
                {years} years at{" "}
                {values.annualRate
                  .toFixed(3)
                  .replace(/0+$/, "")
                  .replace(/\.$/, "")}
                %
              </small>
            </div>
          </div>
        </div>
      </section>

      <section class="card shadow-sm mb-5">
        <div class="row g-0">
          <div class="col-lg-5 border-end">
            <div class="card-body p-4 p-md-5">
              <p class="text-uppercase text-primary fw-bold small mb-2">
                Your loan
              </p>
              <h2 class="h3 mb-4">Adjust the details</h2>

              <NumberField
                label="Outstanding balance"
                value={principal}
                onInput={setPrincipal}
                prefix="$"
                step="100"
              />
              <NumberField
                label="Mortgage rate"
                value={annualRate}
                onInput={setAnnualRate}
                suffix="%"
                step="0.01"
              />
              <label class="form-label d-block mb-3">
                <span class="d-block fw-semibold mb-2">Loan term</span>
                <select
                  class="form-select"
                  value={years}
                  onChange={(event) =>
                    setYears(Number(event.currentTarget.value))
                  }
                >
                  {TERMS.map((term) => (
                    <option key={term} value={term}>
                      {term} years
                    </option>
                  ))}
                </select>
              </label>
              <NumberField
                label="Monthly escrow"
                value={escrow}
                onInput={setEscrow}
                prefix="$"
                step="10"
              />
            </div>
          </div>

          <div class="col-lg-7">
            <div class="card-body p-4 p-md-5">
              <p class="text-uppercase text-primary fw-bold small mb-2">
                Payment breakdown
              </p>
              <h2 class="h3 mb-2">First payment vs. last payment</h2>
              <p class="text-body-secondary mb-4">
                Your principal and interest payment stays fixed, but its
                allocation changes over the life of the loan.
              </p>

              <div
                class="progress mb-4"
                role="img"
                aria-label="First payment distribution"
              >
                <div
                  class="progress-bar bg-primary"
                  style={{ width: shareOfTotal(payment.principalPayment) }}
                />
                <div
                  class="progress-bar bg-warning"
                  style={{ width: shareOfTotal(payment.interest) }}
                />
                <div
                  class="progress-bar bg-info"
                  style={{ width: shareOfTotal(payment.escrow) }}
                />
              </div>

              <div class="table-responsive">
                <table class="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Component</th>
                      <th scope="col" class="text-end">First month</th>
                      <th scope="col" class="text-end">Last month</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Principal</th>
                      <td class="text-end">
                        {currency.format(payment.principalPayment)}
                      </td>
                      <td class="text-end">
                        {currency.format(payment.lastPrincipalPayment)}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Interest</th>
                      <td class="text-end">
                        {currency.format(payment.interest)}
                      </td>
                      <td class="text-end">
                        {currency.format(payment.lastInterest)}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Escrow</th>
                      <td class="text-end">{currency.format(payment.escrow)}</td>
                      <td class="text-end">{currency.format(payment.escrow)}</td>
                    </tr>
                    <tr>
                      <th scope="row">Principal &amp; interest</th>
                      <td class="text-end fw-bold">
                        {currency.format(payment.principalAndInterest)}
                      </td>
                      <td class="text-end fw-bold">
                        {currency.format(payment.principalAndInterest)}
                      </td>
                    </tr>
                    <tr class="table-primary">
                      <th scope="row">Total payment</th>
                      <td class="text-end fw-bold">
                        {currency.format(payment.totalPayment)}
                      </td>
                      <td class="text-end fw-bold">
                        {currency.format(payment.totalPayment)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="card bg-body-tertiary border-0">
        <div class="card-body p-4 p-md-5">
          <div class="row g-4 align-items-center">
            <div class="col-lg-4">
              <p class="text-uppercase text-primary fw-bold small mb-2">
                How it works
              </p>
              <h2 class="h3 mb-0">The fixed-rate formula</h2>
            </div>
            <div class="col-lg-4">
              <div class="alert alert-primary text-center mb-0">
                M = P × [r(1 + r)<sup>n</sup>] ÷ [(1 + r)<sup>n</sup> − 1]
              </div>
            </div>
            <div class="col-lg-4">
              <p class="text-body-secondary mb-0">
                For a {years}-year term, this estimate uses{" "}
                <strong>{payment.numberOfPayments} monthly payments</strong>.
                Over the full loan, estimated interest totals{" "}
                <strong>{currency.format(payment.totalInterest)}</strong>.
                Taxes, insurance, fees, and lender rounding may change the
                actual payment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

render(<App />, document.getElementById("app"));
