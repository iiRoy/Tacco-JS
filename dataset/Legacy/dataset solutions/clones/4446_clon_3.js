function processInput(rawDataContent) {
  const NEWLINE_SEPARATOR = "\n";
  const VALUE_SEPARATOR = " ";
  const DIVISOR_FOUR = 4;
  const DIVISOR_TWO = 2;
  const TWO_COUNT_DECREMENT = 2;
  const FOUR_SCORE_MULTIPLIER = 3;
  const MINIMUM_COUNT_FLOOR = 0;

  const inputLines = rawDataContent.split(NEWLINE_SEPARATOR);

  const numberStringLine = inputLines[1];

  const stringNumberTokens = numberStringLine.split(VALUE_SEPARATOR);
  const parsedNumbers = stringNumberTokens.map(Number);

  let currentCountOfTwos = 0;
  let currentCountOfFours = 0;

  const checkDivisibility = (num, divisor) => num % divisor === 0;

  for (const num of parsedNumbers) {
    if (checkDivisibility(num, DIVISOR_FOUR)) {
      currentCountOfFours++;
    } else if (checkDivisibility(num, DIVISOR_TWO)) {
      currentCountOfTwos++;
    }
  }

  currentCountOfTwos = Math.max(currentCountOfTwos - TWO_COUNT_DECREMENT, MINIMUM_COUNT_FLOOR);

  const totalElementsInArray = parsedNumbers.length;

  const calculatedScore = currentCountOfFours * FOUR_SCORE_MULTIPLIER + currentCountOfTwos;

  const finalResult = calculatedScore >= totalElementsInArray ? "Yes" : "No";

  console.log(finalResult);
}

const fileSystem = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

const rawInputData = fileSystem.readFileSync(standardInputPath, encodingType).trim();
processInput(rawInputData);
