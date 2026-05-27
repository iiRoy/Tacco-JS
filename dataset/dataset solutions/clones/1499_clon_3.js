function readStdInContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function parseInitialNumber(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const parsedNumericValue = parseInt(inputLines[0], 10);
  return parsedNumericValue;
}

function calculateCandidateValue(baseNumber, currentIterationFactor) {
  const EIGHT_MULTIPLIER = 8;
  const ADDITION_CONSTANT = 1;
  const HALF_FACTOR = 0.5;

  const termUnderSquareRoot = (EIGHT_MULTIPLIER * baseNumber * currentIterationFactor) + ADDITION_CONSTANT;
  const squareRootResult = Math.sqrt(termUnderSquareRoot);
  const subtractionResult = squareRootResult - ADDITION_CONSTANT;
  const finalCandidate = HALF_FACTOR * subtractionResult;
  return finalCandidate;
}

function solveProblem(rawInputString) {
  const initialNumber = parseInitialNumber(rawInputString);

  let iterationCounter = 1;
  const STARTING_ITERATION_VALUE = 1;

  for (iterationCounter = STARTING_ITERATION_VALUE; ; iterationCounter++) {
    const candidateResult = calculateCandidateValue(initialNumber, iterationCounter);

    if (Number.isInteger(candidateResult)) {
      console.log(candidateResult);
      break;
    }
  }
}

solveProblem(readStdInContent());
