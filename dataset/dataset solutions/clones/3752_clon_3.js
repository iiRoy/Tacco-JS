function processInput (rawData) {
  const parsedValues = rawData.split(/\s/g);
  const limitValue = 100; // Declared as const to replicate TypeError on reassignment attempt
  const iterationCount = parsedValues[0]; // Kept as string for initial comparison fidelity
  let dataIndex; // Declared with `let` as its assignment is conditional

  // Helper function to encapsulate console logging, preserving the format specifier
  const displayResult = (valueToLog) => console.log('%s', valueToLog);

  // Replicate the exact behavior of the original `index` assignment:
  // `const index = inputValue[1] <= parameter ? inputValue[1] : parameter = 100;;`
  // This means if `Number(parsedValues[1])` is greater than `limitValue`,
  // an attempt to reassign `limitValue` (a const) occurs, throwing a TypeError.
  const numericInputIndex = Number(parsedValues[1]);
  if (numericInputIndex <= limitValue) {
    dataIndex = numericInputIndex;
  } else {
    // This line attempts to assign a value to a `const` variable (`limitValue`).
    // This action will trigger a `TypeError: Assignment to constant variable.`,
    // precisely mirroring the original code's behavior in this scenario.
    limitValue = 100; // This statement is designed to cause the TypeError
    // If the error did not occur, `dataIndex` would receive `100` (the result of the assignment).
    // However, execution halts due to the error, so `dataIndex`'s value here is not reached.
  }

  // Guard clause: Preserve original comparison behavior.
  // `iterationCount === 0` will be false for string "0", "1", etc.
  // `Number(iterationCount) > 2` handles numeric comparison with coercion.
  if (iterationCount === 0 || Number(iterationCount) > 2) {
    return displayResult(dataIndex);
  }

  // Convert iterationCount to a number for mathematical operations
  const numericIterationCount = Number(iterationCount);

  // Introduce intermediate variables for clarity and Type III modification
  const baseValueForPower = limitValue; // Helper variable for the base of the power calculation
  const calculatedPower = Math.pow(baseValueForPower, numericIterationCount);
  const finalProduct = calculatedPower * dataIndex;

  // This conditional block (`if (dataIndex > 100)`) is effectively unreachable.
  // If `numericInputIndex` was `> limitValue` (100), a `TypeError` would have been thrown earlier.
  // If `numericInputIndex` was `<= limitValue` (100), then `dataIndex` is `<= 100`.
  if (dataIndex > 100) {
    displayResult(finalProduct);
  }
}

// Preserve the exact input reading mechanism
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
