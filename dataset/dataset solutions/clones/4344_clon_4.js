function generatePrimes(limit) {
  if (limit < 2) {
    return [];
  }

  const primeFlags = new Array(limit + 1).fill(true);

  primeFlags[0] = false;
  primeFlags[1] = false;

  for (
    let candidate = 2;
    candidate * candidate <= limit;
    candidate++
  ) {
    if (!primeFlags[candidate]) {
      continue;
    }

    for (
      let multiple = candidate * candidate;
      multiple <= limit;
      multiple += candidate
    ) {
      primeFlags[multiple] = false;
    }
  }

  const primes = [];

  for (let value = 2; value <= limit; value++) {
    if (primeFlags[value]) {
      primes.push(value);
    }
  }

  return primes;
}

function exponentInFactorial(number, prime) {
  let exponent = 0;
  let quotient = number;

  while (quotient > 0) {
    quotient = Math.floor(quotient / prime);
    exponent += quotient;
  }

  return exponent;
}

function factorialFromPrimeFactors(number) {
  if (!Number.isInteger(number) || number < 0) {
    return null;
  }

  const primes = generatePrimes(number);
  let result = 1n;

  for (const prime of primes) {
    const exponent = exponentInFactorial(
      number,
      prime
    );

    result *=
      BigInt(prime) ** BigInt(exponent);
  }

  return result;
}

const fs = require("fs");
const number = Number(
  fs.readFileSync("/dev/stdin", "utf8").trim()
);

const result = factorialFromPrimeFactors(number);

console.log(
  result === null
    ? "INVALID"
    : result.toString()
);