'use strict';

function parseNumericLine(lineContent, valueDelimiter = ' ') {
  const stringNumbers = lineContent.split(valueDelimiter);
  return stringNumbers.map(str => Number(str));
}

function executeCoreLogic(initialInputPayload) {
  // The original function explicitly reassigns its input parameter
  // to a fixed string, effectively ignoring the 'initialInputPayload'.
  // This behavior must be preserved for exact equivalence.
  const hardcodedInputString = '1 1\n';

  // Extract the first line from the hardcoded input
  const lineSegments = hardcodedInputString.split('\n');
  const relevantLine = lineSegments[0];

  // Parse the numbers from the relevant line using a helper
  const parsedNumbers = parseNumericLine(relevantLine);

  const primaryOperand = parsedNumbers[0];
  const secondaryOperand = parsedNumbers[1];

  let finalComputedValue;

  // Introduce an intermediate constant for the 'primaryOperand - 1' case
  const adjustedPrimaryOperand = primaryOperand - 1;

  // Rewrite the ternary operator as an if-else block
  if (primaryOperand <= secondaryOperand) {
    finalComputedValue = primaryOperand;
  } else {
    finalComputedValue = adjustedPrimaryOperand;
  }

  console.log(finalComputedValue);
}

// The original script calls the main function with data read from stdin.
// Even though the function internally overrides this input, the call structure
// and the `require("fs").readFileSync` part are preserved.
executeCoreLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
