console.log(( (inputData) => {
  // Convert the incoming data to an integer for the target count.
  const targetCount = inputData | 0;

  // Initialize a boolean array, acting as a sieve, up to a fixed maximum value.
  // All elements are initially set to true, indicating potential primality.
  const primeFlags = Array(55555).fill(true);

  // This array will store the numbers that satisfy our specific conditions.
  const resultNumbers = [];

  // Begin iterating from the first prime number candidate, 2.
  for ( let idx = 2; idx < 55555; idx++ ) {
    // If the current number has already been marked as not prime, skip it.
    if ( !primeFlags[idx] ) {
      continue;
    }

    // If 'idx' is considered prime, mark all its multiples as not prime.
    // This is the sieving step.
    for ( let multiplier = idx + idx; multiplier < 55555; multiplier += idx ) {
      primeFlags[multiplier] = false;
    }

    // After sieving, check if the current prime candidate meets an additional criterion:
    // its remainder when divided by 5 must be 1.
    if ( idx % 5 === 1 ) {
      // If it satisfies the condition, add it to our collection of results.
      resultNumbers.push(idx);
      // If we have accumulated the desired number of results, we can stop.
      if ( resultNumbers.length === targetCount ) {
        break;
      }
    }
  }
  // Format the collected numbers into a single string, separated by spaces.
  return resultNumbers.join` `;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the input from standard input using Node.js file system module.
