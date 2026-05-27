function getInputData() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(message) {
  console.log(message);
}

function logError(message) {
  console.error(message);
}

function splitAndMapToNumbers(inputString, separator) {
  return inputString.split(separator).map((item) => Number(item));
}

function processInput(valueToConvert, conversionType) {
  const conversionStrategies = {
    0: (val) => val,
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    3: (val) => val.split("\n"),
    4: (val) => splitAndMapToNumbers(val, " "),
    5: (val) => splitAndMapToNumbers(val, "\n"),
    6: (val) => val.split(""),
    7: (val) => splitAndMapToNumbers(val, ""),
  };

  if (!conversionStrategies.hasOwnProperty(conversionType)) {
    return undefined; // Matches original switch behavior for unknown 'no'
  }
  return conversionStrategies[conversionType](valueToConvert);
}

function isFiveDigitPalindrome(digitsArray) {
  const FIRST_DIGIT_INDEX = 0;
  const SECOND_DIGIT_INDEX = 1;
  const FOURTH_DIGIT_INDEX = 3;
  const FIFTH_DIGIT_INDEX = 4;

  // The original code implicitly handles non-5-digit numbers by failing comparisons
  // (e.g., tmp[4] would be undefined). This explicit check achieves the same outcome.
  if (digitsArray.length !== 5) {
    return false;
  }

  const firstMatchesFifth = digitsArray[FIRST_DIGIT_INDEX] === digitsArray[FIFTH_DIGIT_INDEX];
  const secondMatchesFourth = digitsArray[SECOND_DIGIT_INDEX] === digitsArray[FOURTH_DIGIT_INDEX];

  return firstMatchesFifth && secondMatchesFourth;
}

function executeMainLogic(rawData) {
  const CONV_TYPE_SPACE_SPLIT_NUMBERS = 4;
  const CONV_TYPE_CHAR_SPLIT = 6;

  const processedNumbers = processInput(rawData, CONV_TYPE_SPACE_SPLIT_NUMBERS);

  const startRange = processedNumbers[0];
  const endRange = processedNumbers[1];

  let countPalindromes = 0;

  for (let currentNum = startRange; currentNum <= endRange; currentNum++) {
    const numAsString = String(currentNum);
    const numDigits = processInput(numAsString, CONV_TYPE_CHAR_SPLIT);

    if (isFiveDigitPalindrome(numDigits)) {
      countPalindromes++;
    }
  }

  displayResult(countPalindromes);
}

executeMainLogic(getInputData());
