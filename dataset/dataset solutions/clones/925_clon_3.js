function executeProgram() {
  const fileSystemHandler = require('fs');
  const rawInputString = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
  const inputNumberValue = Number(rawInputString);

  const memoizationStorage = [1, 1]; // Stores computed Fibonacci values, starting with F(0) and F(1)

  const calculateFibonacciSequence = (index) => {
    // Check if the Fibonacci value for the current index is already in storage
    if (memoizationStorage[index] !== undefined) {
      return memoizationStorage[index];
    }

    // If not, compute it recursively using the previous two values
    const valueBeforeCurrent = calculateFibonacciSequence(index - 1);
    const valueTwoBeforeCurrent = calculateFibonacciSequence(index - 2);
    const computedCurrentValue = valueBeforeCurrent + valueTwoBeforeCurrent;

    // Store the newly computed value in the memoization storage
    memoizationStorage[index] = computedCurrentValue;
    return computedCurrentValue;
  };

  const finalComputedResult = calculateFibonacciSequence(inputNumberValue);
  console.log(finalComputedResult);
}

executeProgram();
