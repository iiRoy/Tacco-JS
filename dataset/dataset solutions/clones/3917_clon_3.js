function parseAndPrepareData(rawInputSource) {
  if (typeof rawInputSource !== 'string') {
    throw new TypeError("Input must be a string type for parsing.");
  }

  const firstMeaningfulLine = rawInputSource.split("\n")
                                           .find(line => line.trim().length > 0);

  if (!firstMeaningfulLine) {
    throw new Error("No meaningful data line found in input.");
  }

  const numberTextSegments = firstMeaningfulLine.split(" ")
                                                .filter(segment => segment.trim().length > 0);

  const potentialNumbers = numberTextSegments
    .map(segment => Number(segment.trim()));

  const validatedAndParsedNumbers = potentialNumbers
    .filter(num => Number.isFinite(num));

  const REQUIRED_NUMBER_COUNT = 3;
  if (validatedAndParsedNumbers.length !== REQUIRED_NUMBER_COUNT) {
    throw new Error(`Input requires exactly ${REQUIRED_NUMBER_COUNT} finite numbers, but found ${validatedAndParsedNumbers.length}.`);
  }

  const orderedNumericSet = validatedAndParsedNumbers.sort((valA, valB) => valB - valA);

  return orderedNumericSet;
}

function computeEqualityOperations(initialValuesTriplet) {
  let currentNumericState = [...initialValuesTriplet];
  let totalOperationCount = 0;

  const isInitialMiddleSmallestDiffOdd = ((currentNumericState[1] - currentNumericState[2]) % 2 !== 0);

  if (isInitialMiddleSmallestDiffOdd) {
    currentNumericState[0]++;
    currentNumericState[1]++;
    totalOperationCount++;
  }

  while (!(currentNumericState[0] === currentNumericState[1] && currentNumericState[1] === currentNumericState[2])) {
    if (currentNumericState[0] > currentNumericState[1]) {
      currentNumericState[1]++;
      currentNumericState[2]++;
    } else {
      currentNumericState[2] += 2;
    }
    totalOperationCount++;
  }

  return totalOperationCount;
}

const orchestrateNumericProblemSolver = (rawInputPayload) => {
  try {
    const preparedNumbers = parseAndPrepareData(rawInputPayload);
    const resultantOperations = computeEqualityOperations(preparedNumbers);
    console.log(resultantOperations);
  } catch (processingError) {
    console.error(`An error occurred during processing: ${processingError.message}`);
  }
};

try {
  const nodeFileSystemModule = require("fs");
  const standardInputContent = nodeFileSystemModule.readFileSync("/dev/stdin", "utf8");
  orchestrateNumericProblemSolver(standardInputContent);
} catch (inputReadError) {
  console.error(`Error reading input from /dev/stdin: ${inputReadError.message}`);
}