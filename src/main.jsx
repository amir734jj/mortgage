import { render } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import "bootstrap/dist/css/bootstrap.min.css";

import { calculateMortgage } from "./mortgage.js";

const TERMS = [10, 15, 20, 30];
const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function MathFormula({ children }) {
  const container = useRef(null);

  useEffect(() => {
    const typeset = () => {
      const mathJax = window.MathJax;

      if (!container.current || !mathJax?.typesetPromise) {
        return;
      }

      mathJax.typesetClear?.([container.current]);
      container.current.textContent = `\\[${children}\\]`;
      mathJax.typesetPromise([container.current]);
    };

    if (container.current) {
      container.current.textContent = `\\[${children}\\]`;
    }

    const script = document.getElementById("MathJax-script");
    script?.addEventListener("load", typeset);
    typeset();

    return () => script?.removeEventListener("load", typeset);
  }, [children]);

  return <div ref={container} />;
}

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
  const [originalPrincipal, setOriginalPrincipal] = useState("188200");
  const [currentPrincipal, setCurrentPrincipal] = useState("113356.92");
  const [annualRate, setAnnualRate] = useState("2.5");
  const [years, setYears] = useState(15);
  const [escrow, setEscrow] = useState("524.21");

  const values = {
    originalPrincipal: Math.max(0, Number(originalPrincipal) || 0),
    currentPrincipal: Math.max(0, Number(currentPrincipal) || 0),
    annualRate: Math.max(0, Number(annualRate) || 0),
    escrow: Math.max(0, Number(escrow) || 0),
  };

  const payment = useMemo(
    () =>
      calculateMortgage(
        values.originalPrincipal,
        values.annualRate,
        years,
        values.escrow,
        values.currentPrincipal,
      ),
    [
      values.originalPrincipal,
      values.currentPrincipal,
      values.annualRate,
      values.escrow,
      years,
    ],
  );

  const shareOfTotal = (amount, total) =>
    total > 0
      ? `${((amount / total) * 100).toFixed(1)}%`
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
                label="Original loan amount"
                value={originalPrincipal}
                onInput={setOriginalPrincipal}
                prefix="$"
                step="100"
              />
              <NumberField
                label="Current outstanding balance"
                value={currentPrincipal}
                onInput={setCurrentPrincipal}
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
                <span class="d-block fw-semibold mb-2">Original loan term</span>
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
              <h2 class="h3 mb-2">Regular monthly payment</h2>
              <p class="text-body-secondary mb-4">
                Principal and interest are calculated from your current
                balance; escrow is added to show your regular monthly amount.
              </p>

              <div
                class="progress mb-4"
                role="img"
                aria-label="Regular monthly payment distribution"
              >
                <div
                  class="progress-bar bg-primary"
                  style={{
                    width: shareOfTotal(payment.principalPayment, payment.totalPayment),
                  }}
                />
                <div
                  class="progress-bar bg-warning"
                  style={{
                    width: shareOfTotal(payment.interest, payment.totalPayment),
                  }}
                />
                <div
                  class="progress-bar bg-info"
                  style={{
                    width: shareOfTotal(payment.escrow, payment.totalPayment),
                  }}
                />
              </div>

              <div class="table-responsive">
                <table class="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Component</th>
                      <th scope="col" class="text-end">Monthly amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Principal</th>
                      <td class="text-end">
                        {currency.format(payment.principalPayment)}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Interest</th>
                      <td class="text-end">
                        {currency.format(payment.interest)}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Escrow</th>
                      <td class="text-end">{currency.format(payment.escrow)}</td>
                    </tr>
                    <tr>
                      <th scope="row">Principal &amp; interest</th>
                      <td class="text-end fw-bold">
                        {currency.format(payment.principalAndInterest)}
                      </td>
                    </tr>
                    <tr class="table-primary">
                      <th scope="row">Total payment</th>
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
            <div class="col-lg-8">
              <div class="alert alert-primary text-center mb-0 overflow-auto">
                <MathFormula>
                  {`\\begin{aligned}
                    M &= P_0 \\times \\frac{r(1+r)^n}{(1+r)^n-1} \\\\
                    I_t &= B_t \\times r \\\\
                    Principal_t &= M - I_t \\\\
                    P_0 &: \\text{original loan amount} \\\\
                    r &: \\text{monthly rate = annual rate / 100 / 12} \\\\
                    n &= ${payment.numberOfPayments} \\text{ monthly payments} \\\\
                    B_t &: \\text{balance at the start of month } t \\\\
                    M &: \\text{scheduled monthly principal-and-interest payment} \\\\
                    I_t &: \\text{interest paid in month } t \\\\
                    Principal_t &: \\text{principal paid in month } t
                  \\end{aligned}`}
                </MathFormula>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

render(<App />, document.getElementById("app"));
