(function executePrimaryLogic() {
  // Obtain the numerical input from standard input.
  const inputNumber = Number(require('fs').readFileSync('/dev/stdin', 'utf8'));

  // Initialize a memoization table for Fibonacci sequence.
  // Note: This setup implies fib(0) = 1 and fib(1) = 1.
  const memoizationTable = [1, 1];

  // Define a recursive function to compute Fibonacci numbers with memoization.
  const computeFibonacci = (val) => {
    // If the value is already in the memoization table, return it.
    if (memoizationTable[val] !== undefined) {
      return memoizationTable[val];
    }
    // Otherwise, compute it, store it, and then return it.
    memoizationTable[val] = computeFibonacci(val - 1) + computeFibonacci(val - 2);
    return memoizationTable[val];
  };

  // Output the calculated Fibonacci number for the given input.
  console.log(computeFibonacci(inputNumber));
})();
