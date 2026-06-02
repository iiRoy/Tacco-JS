const processInput = (rawData) => {
  // A large prime number used for modulo arithmetic to prevent overflow
  const primeModulo = 10**9 + 7;

  // Parse the input string into two numerical values: N and K
  const [upperBound, lowerBound] = rawData.trim().split(' ').map(Number);

  // Initialize a variable to store the cumulative result
  let totalCount = 0;

  // Loop through possible lengths of sequences, from K up to N+1
  for (let currentLength = lowerBound; currentLength <= upperBound + 1; currentLength++) {
    // Calculate the sum of integers from 0 to (currentLength - 1)
    // This represents the sum of the smallest possible 'currentLength' integers (0, 1, ..., currentLength-1)
    const startSum = (currentLength - 1) * currentLength / 2;

    // Determine the starting value for the largest possible 'currentLength' integers
    // If currentLength is 1, it's N. If currentLength is N+1, it's 0.
    const blockFirst = upperBound - currentLength + 1;

    // Calculate the sum of integers from 'blockFirst' to 'upperBound'
    // This represents the sum of the largest possible 'currentLength' integers
    const blockSum = (blockFirst + upperBound) * currentLength / 2;

    // Add the difference between the largest sum and smallest sum, plus one, to the total count
    // This effectively counts the number of possible sums for sequences of 'currentLength'
    totalCount += blockSum - startSum + 1;
  }

  // Output the final calculated total count, ensuring it remains within the modulo range
  return console.log((totalCount % primeModulo + primeModulo) % primeModulo);
};

// Conditional execution block based on environment variables
// This part handles reading input either from a test function or standard input
process.env.MYTEST
  ? (process.env.MYTEST === 'test'
      ? test() // If MYTEST is 'test', execute a test function (assumed to be defined elsewhere)
      : processInput(require('fs').readFileSync('dev/stdin', 'utf8')) // Otherwise, read from 'dev/stdin'
    )
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8')); // If MYTEST is not set, read from '/dev/stdin'
