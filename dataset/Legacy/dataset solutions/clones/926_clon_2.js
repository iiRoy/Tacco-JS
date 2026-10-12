( function executeProgram ( ) {
  // Obtain the numerical input from standard input.
  const inputVal = Number(require('fs').readFileSync('/dev/stdin', 'utf8'));

  // Initialize a memoization array with pre-calculated Fibonacci numbers.
  const memoStorage = [
    1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144
  ];

  // Define a function to compute Fibonacci numbers using memoization.
  const calculateFibonacci = function calculateFibonacci (index) {
    // If the value is already in memoStorage, return it.
    // Otherwise, compute it recursively and store it before returning.
    return memoStorage[index] || (memoStorage[index] = calculateFibonacci(index - 1) + calculateFibonacci(index - 2));
  };

  // Output the result of the Fibonacci calculation for the given input.
  console.log(calculateFibonacci(inputVal));
} ) ( );
