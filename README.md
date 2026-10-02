# Mortgage Payment Calculator

A small Preact website for estimating fixed-rate mortgage payments, including
the first month's principal and interest split and optional monthly escrow.

## Run locally

```sh
npm install
npm run dev
```

## Test and build

```sh
npm test
npm run build
```

## Run with Docker

```sh
docker build -t mortgage-calculator .
docker run --rm -p 8080:8080 mortgage-calculator
```

Open `http://localhost:8080`.
