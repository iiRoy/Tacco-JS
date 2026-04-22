"use strict";
// This directive enforces stricter parsing and error handling in the code.

/*
 *  I - Input Parser Class
 *  Provides utility methods to parse input strings.
 */
function I(s, f) {
  // Store the input string, split by newlines, into an array.
  this._s = s.split("\n");

  // Initialize column counter to 0.
  this._c = 0;

  // Initialize line counter to 0.
  this._l = 0;

  // Store the parsing function; defaults to Number if not provided.
  this._f = f || Number;
}


I.prototype.a =
  function () {

    // Get the current line from the stored array.
    var l = this._s[this._l];

    // If the line is empty or undefined, return immediately.
    if (!l)
      return;

    // Trim whitespace from the line and split it into tokens.
    var t =
      l
      .trim()
      .split(" ");

    // Get the token at the current column index.
    var a = t[this._c];

    // Increment the column counter.
    this._c++;

    // Check if all tokens on the current line have been processed.
    if (t.length === this._c) {
      // Reset column counter and move to the next line.
      this._c = 0;
      this._l++;
    }

    // Apply the parsing function to the token and return the result.
    return this._f(a);
  };


I.prototype.l = function () {
  var l =
    this
    ._s[this._l];

  if (!l) {
    return;
  }

  this._c =
    0;
  this._l++;

  /*
   * Split the current line into tokens, apply the parsing function
   * to each, and return the resulting array.
   */
  return l.split(" ").map(this._f);
};


/*
 *  sieveOfEratosthenes
 *  Generates a list of prime numbers up to a given limit 'e'
 *  using the Sieve of Eratosthenes algorithm.
 */
function sieveOfEratosthenes(e) {
  // Create a boolean array, initialized to true, up to e + 1.
  const t = new Array(e + 1).fill(!0);

  // 0 and 1 are not prime numbers.
  t[0] = !1;
  t[1] = !1;

  // This array will store the found prime numbers.
  const n = [];

  // Iterate from 2 up to 'e'.
  for (let r = 2; r <= e; r += 1) {
    // If 'r' is marked as prime (true).
    if (!0 === t[r]) {
      // Add 'r' to our list of primes.
      n.push(r);

      // Start marking multiples of 'r' as not prime.
      // Optimization: start from r*r as smaller multiples would have been marked by smaller primes.
      let f = r * r;

      // Continue marking multiples until we exceed 'e'.
      for (; f <= e;) {
        t[f] = !1; // Mark as not prime.
        f += r; // Move to the next multiple.
      }
    }
  }

  // Return the array of prime numbers.
  return n;
}

// Generate a list of primes up to 100,000 once.
var primes = sieveOfEratosthenes(100000);


/*
 *  main function
 *  Processes the input, performs calculations, and outputs the result.
 */
function main(input) {
  // Create a new instance of the input parser.
  var o = new I(input);

  // Read the first number, which is 'n'.
  var n = o.a();

  // Initialize an empty array 'a'.
  var a = [];

  // Read 'n + 1' numbers into array 'a'.
  for (var i = 0; i <= n; i++) {
    a.push(o.a());
  }

  // Reverse the array 'a'.
  a = a.reverse();

  // Calculate the greatest common divisor (GCD) of all elements in 'a'.
  let agcd = a[0];
  for (var i = 1; i <= n; i++) {
    agcd = gcd(agcd, a[i]);
  }

  // Divide each element in 'a' by the calculated 'agcd'.
  a = a.map(x => x / agcd);

  // Initialize an array to store the final answers.
  var ans = [];

  /*
   * Filter primes that are less than or equal to 'n'.
   * For each such prime, perform a specific check.
   */
  primes.filter(p => p <= n).forEach(prime => {
    // If the first element of 'a' is not divisible by 'prime', skip this prime.
    if (a[0] % prime !== 0)
      return;

    // Loop from 1 up to 'prime - 1'.
    for (var i = 1; i < prime; i++) {
      var j = i;
      var ajsum = 0;

      // Calculate a sum based on elements of 'a' at specific indices.
      while (j <= n) {
        ajsum += a[j];
        j += prime - 1;
      }

      // If the sum is not divisible by 'prime', then this 'prime' is not a valid answer.
      if (ajsum % prime !== 0)
        return;
    }

    // If all checks pass, add 'prime' to the answer list.
    ans.push(prime);
  });

  // Factorize the remaining 'agcd' into its prime factors.
  var i = 0;
  while (agcd > 1 && i < primes.length) {
    // If 'agcd' is divisible by the current prime.
    if (agcd % primes[i] === 0) {
      // Add this prime factor to the answer list.
      ans.push(primes[i]);

      // Keep dividing 'agcd' by this prime until it's no longer divisible.
      while (agcd % primes[i] === 0) {
        agcd = agcd / primes[i];
      }
    }
    // Move to the next prime in the list.
    i += 1;
  }

  // If after all prime checks, 'agcd' is still greater than 1, it means 'agcd' itself is a prime factor.
  if (agcd > 1) {
    ans.push(agcd);
  }

  // Sort the answer array in ascending order.
  ans.sort((a, b) => a - b);

  var prev;

  // Print unique elements of the sorted answer array.
  for (var i = 0; i < ans.length; i++) {
    if (prev !== ans[i]) {
      console.log(ans[i]);
    }
    prev = ans[i];
  }
}

/*
 *  gcd function
 *  Calculates the greatest common divisor of two numbers using the Euclidean algorithm.
 */
function gcd(a, b) {
  // Base case: if b is 0, then a is the GCD.
  if (b === 0)
    return a;

  // Recursive step: GCD(a, b) is the same as GCD(b, a % b).
  return gcd(b, a % b);
}


// Read input from stdin and pass it to the main function.
main(require("fs").readFileSync("/dev/stdin", "utf8"));