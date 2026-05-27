const MAX_PRIME_FACTOR_ARRAY_SIZE = 101;
const INITIAL_DIVISOR_VALUE = 2;
const TARGET_FACTOR_COUNT_TWO = 2;
const TARGET_FACTOR_COUNT_THREE = 3;
const TARGET_FACTOR_COUNT_FOUR_OR_MORE = 4;

function updatePrimeFactorCounts(numberToFactor, factorFrequencyMap) {
  let tempVal = numberToFactor;
  let currentDiv = INITIAL_DIVISOR_VALUE;

  while (tempVal > 1) {
    if (tempVal % currentDiv === 0) {
      factorFrequencyMap[currentDiv]++;
      tempVal /= currentDiv;
    } else {
      currentDiv++;
    }
  }
}

function categorizeFactorCounts(frequencyMap, limit) {
  let twoOrThreeCount = 0;
  let fourOrMoreCount = 0;

  for (let idx = INITIAL_DIVISOR_VALUE; idx < limit; idx++) {
    const currentFactorCount = frequencyMap[idx];
    if (currentFactorCount === TARGET_FACTOR_COUNT_TWO || currentFactorCount === TARGET_FACTOR_COUNT_THREE) {
      twoOrThreeCount++;
    }
    if (currentFactorCount >= TARGET_FACTOR_COUNT_FOUR_OR_MORE) {
      fourOrMoreCount++;
    }
  }
  return { twoOrThree: twoOrThreeCount, fourOrMore: fourOrMoreCount };
}

function solveProblem(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const upperLimit = parseInt(inputLines[0], 10);

  const primeFactorFrequency = new Array(MAX_PRIME_FACTOR_ARRAY_SIZE).fill(0);

  for (let currentNumber = 1; currentNumber <= upperLimit; currentNumber++) {
    updatePrimeFactorCounts(currentNumber, primeFactorFrequency);
  }

  const factorCategories = categorizeFactorCounts(primeFactorFrequency, MAX_PRIME_FACTOR_ARRAY_SIZE);
  const countTwoOrThreeFactors = factorCategories.twoOrThree;
  const countAtLeastFourFactors = factorCategories.fourOrMore;

  let termOneContribution = 0;
  if (countAtLeastFourFactors >= 2) {
    termOneContribution = countTwoOrThreeFactors * countAtLeastFourFactors * (countAtLeastFourFactors - 1) / 2;
  }

  let termTwoContribution = 0;
  if (countAtLeastFourFactors >= 3) {
    termTwoContribution = countAtLeastFourFactors * (countAtLeastFourFactors - 1) * (countAtLeastFourFactors - 2) / 2;
  }

  const finalCalculatedValue = termOneContribution + termTwoContribution;

  console.log('%s', finalCalculatedValue);
}

function executeDebug() {
  const debugInput = document.getElementById("input").value;
  solveProblem(debugInput);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
