function processInputData(rawData) {
  const LINE_DELIMITER = "\n";
  const EVEN_DIVISOR = 2;
  const THREE_DIVISOR = 3;
  const FIVE_DIVISOR = 5;
  const DENIED_MESSAGE = "DENIED";
  const APPROVED_MESSAGE = "APPROVED";

  const extractNumericArray = (inputString) => {
    const lines = inputString.split(LINE_DELIMITER);
    const firstLineValue = lines.shift();
    return lines.map(lineContent => parseInt(lineContent, 10));
  };

  const checkSpecificViolation = (numberToCheck) => {
    const isDivisibleByThree = (numberToCheck % THREE_DIVISOR === 0);
    const isDivisibleByFive = (numberToCheck % FIVE_DIVISOR === 0);
    return !(isDivisibleByThree || isDivisibleByFive);
  };

  const allNumericValues = extractNumericArray(rawData);

  const filteredEvenNumbers = allNumericValues.filter(currentValue => currentValue % EVEN_DIVISOR === 0);

  const hasAnyViolation = filteredEvenNumbers.some(checkSpecificViolation);

  if (hasAnyViolation) {
    console.log(DENIED_MESSAGE);
  } else {
    console.log(APPROVED_MESSAGE);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
