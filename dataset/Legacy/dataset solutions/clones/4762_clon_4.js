function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}
function myout(t){console.log(t);}
function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function ProcessInput(rawInputData) {
  const upperLimit = myconv(rawInputData, 1);
  const modulusValue = 1000000007;

  // Utilize a Sieve of Eratosthenes to determine all prime numbers up to 'upperLimit'.
  // 'isNotPrime' array will store true for composite numbers and false for primes.
  const isNotPrime = new Array(upperLimit + 1).fill(false);
  const discoveredPrimes = [];

  for (let candidate = 2; candidate <= upperLimit; candidate++) {
    if (!isNotPrime[candidate]) {
      discoveredPrimes.push(candidate);
      // Mark all multiples of the current prime as composite.
      // Optimization: start marking from candidate * candidate.
      for (let multiple = candidate * candidate; multiple <= upperLimit; multiple += candidate) {
        isNotPrime[multiple] = true;
      }
    }
  }

  // Calculate the total number of divisors for the product of integers from 1 to 'upperLimit'.
  // This involves finding the exponent of each prime factor in the product (1 * 2 * ... * upperLimit)
  // and then multiplying (exponent + 1) for each prime, applying the modulus.
  let finalProduct = 1;

  for (const currentPrimeFactor of discoveredPrimes) {
    let totalExponent = 0;
    let powerOfFactor = currentPrimeFactor;
    // Sum the contributions of 'currentPrimeFactor' from each power (p, p^2, p^3, ...)
    // using a method similar to Legendre's formula for factorials.
    while (powerOfFactor <= upperLimit) {
      totalExponent += Math.floor(upperLimit / powerOfFactor);
      powerOfFactor *= currentPrimeFactor;
    }
    finalProduct = (finalProduct * (totalExponent + 1)) % modulusValue;
  }

  myout(finalProduct);
}

ProcessInput(myin());
