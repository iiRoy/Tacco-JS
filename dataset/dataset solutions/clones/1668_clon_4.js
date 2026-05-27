"use strict";

const processInputAndDisplayResult = (rawInputContent) => {
  const [startRangeText, endRangeText, stepIncrementText] = rawInputContent.trim().split(" ");

  // Using Number() for parsing, which is a different built-in than parseInt()
  const startRangeBoundary = Number(startRangeText);
  const endRangeBoundary = Number(endRangeText);
  const stepIncrement = Number(stepIncrementText);

  // Determine the maximum multiple of 'stepIncrement' that is less than or equal to 100.
  // The original loop iterates 'i = d; i < 101; i = i + d', meaning 'i' goes up to 100.
  const maxPossibleMultiplier = Math.floor(100 / stepIncrement);

  // Generate an array of numbers that are multiples of 'stepIncrement'.
  // This uses a functional approach (Array.from) instead of an imperative for loop.
  const potentialValues = Array.from({ length: maxPossibleMultiplier }, (_, index) => {
    return (index + 1) * stepIncrement;
  });

  // Filter the generated values to include only those within the specified range [startRangeBoundary, endRangeBoundary].
  // Then, count the number of elements that satisfy this condition.
  const matchingCount = potentialValues.filter(
    (currentValue) => currentValue >= startRangeBoundary && currentValue <= endRangeBoundary
  ).length;

  console.log(matchingCount);
};

// This function is a Type IV clone of 'numberSort'.
// It uses a different identifier name and is declared as a const arrow function.
const sortNumericalCollection = (dataElements) => {
  // It calls a separately defined comparison function, mirroring the original's structure.
  dataElements.sort(numericComparisonFunction);
  return dataElements;
};

// This function is a Type IV clone of 'f'.
// It uses a different identifier name and is declared as a named function declaration.
function numericComparisonFunction(firstOperand, secondOperand) {
  return firstOperand - secondOperand;
}

// Execute the main logic by reading from standard input.
processInputAndDisplayResult(require("fs").readFileSync("/dev/stdin", "utf-8"));
