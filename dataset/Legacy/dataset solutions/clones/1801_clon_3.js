function processSequence(currentLength, currentXorSum, valueArray, binaryString, memoizationTable) {
  if (currentLength === 0) {
    return currentXorSum === 0;
  }

  const currentElementIndex = binaryString.length - currentLength;
  const currentBit = binaryString[currentElementIndex];

  if (memoizationTable[currentLength] === undefined) {
    memoizationTable[currentLength] = {};
  }

  if (memoizationTable[currentLength][currentXorSum] !== undefined) {
    return memoizationTable[currentLength][currentXorSum];
  }

  let outcome;
  const nextLength = currentLength - 1;
  const valueToXor = valueArray[currentElementIndex];

  const resultFromPathOne = processSequence(nextLength, currentXorSum, valueArray, binaryString, memoizationTable);
  const resultFromPathTwo = processSequence(nextLength, currentXorSum ^ valueToXor, valueArray, binaryString, memoizationTable);

  if (currentBit === '1') {
    outcome = resultFromPathOne && resultFromPathTwo;
  } else {
    outcome = resultFromPathOne || resultFromPathTwo;
  }

  memoizationTable[currentLength][currentXorSum] = outcome;
  return outcome;
}

function executeProgram(programInput) {
  const inputLines = programInput.split('\n');
  const testCaseCount = Number(inputLines[0]);

  const LINES_PER_TEST_CASE_DATA = 3;

  const extractAndParseCaseData = (startIndex) => {
    const sequenceLengthString = inputLines[startIndex];
    const valueStrings = inputLines[startIndex + 1].split(' ');
    const bitSequence = inputLines[startIndex + 2];

    const parsedLength = Number(sequenceLengthString);
    const parsedValues = valueStrings.map(Number);

    return {
      length: parsedLength,
      values: parsedValues,
      bits: bitSequence
    };
  };

  for (let currentLineOffset = 0; currentLineOffset < testCaseCount * LINES_PER_TEST_CASE_DATA; currentLineOffset += LINES_PER_TEST_CASE_DATA) {
    const caseDataStartIndex = 1 + currentLineOffset;
    const currentCase = extractAndParseCaseData(caseDataStartIndex);

    const memoizationCache = {};

    const finalOutcome = processSequence(
      currentCase.length,
      0,
      currentCase.values,
      currentCase.bits,
      memoizationCache
    );
    console.log(finalOutcome ? '0' : '1');
  }
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
