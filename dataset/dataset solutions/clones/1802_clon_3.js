// 1
// 2
// 1 2
// 10
// //
// 1
// 2
// 1 1
// 10

function processPuzzle(count, targetXOR, valuesArr, binaryStr) {
  // Base case: if no more bits to process, check if targetXOR is 0.
  const isBaseCaseReached = (count === 0);
  if (isBaseCaseReached) {
    return targetXOR === 0;
  }

  // Calculate the index for the current bit and value.
  // This index is relative to the end of the string/array,
  // as 'count' counts down from the total length.
  const currentRelativeIndex = binaryStr.length - count;
  const currentBitChar = binaryStr[currentRelativeIndex];
  const associatedNumericValue = Number(valuesArr[currentRelativeIndex]); // Ensure A elements are numbers

  // Define the two possible recursive outcomes.
  // Outcome A: Proceed by XORing with the current associated value.
  const outcomeA = processPuzzle(count - 1, targetXOR ^ associatedNumericValue, valuesArr, binaryStr);
  // Outcome B: Proceed without XORing with the current associated value.
  const outcomeB = processPuzzle(count - 1, targetXOR, valuesArr, binaryStr);

  // Apply logic based on the current bit character.
  // If '1', both outcomes must be true (logical AND).
  // If '0', at least one outcome must be true (logical OR).
  return (currentBitChar === '1') ? (outcomeA && outcomeB) : (outcomeA || outcomeB);
}

function executeProgram(programInput) {
  const allInputLines = programInput.split('\n');
  const totalTestCases = Number(allInputLines[0]);

  // Helper function to process a single test case's input lines
  const parseTestCaseData = (startIndex) => {
    const nValue = Number(allInputLines[startIndex + 1]); // N is a number
    const aValues = allInputLines[startIndex + 2].split(' ');
    const sString = allInputLines[startIndex + 3];
    return { n: nValue, a: aValues, s: sString };
  };

  const loopIncrementStep = 3;
  const loopUpperBoundary = totalTestCases * loopIncrementStep;

  for (let currentCaseBlockIndex = 0; currentCaseBlockIndex < loopUpperBoundary; currentCaseBlockIndex += loopIncrementStep) {
    const testCaseParameters = parseTestCaseData(currentCaseBlockIndex);

    // The initial XOR target is always 0 for this problem.
    const initialXORTarget = 0;

    const finalBooleanResult = processPuzzle(
      testCaseParameters.n,
      initialXORTarget,
      testCaseParameters.a,
      testCaseParameters.s
    );

    // Output '0' if the result is true, '1' if false, as per problem specification.
    const outputCharacter = finalBooleanResult ? '0' : '1';
    console.log(outputCharacter);
  }
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
