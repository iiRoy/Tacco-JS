function ProcessInputData(rawInputString) {
  const RADIX_DECIMAL = 10;

  const inputLines = rawInputString.split("\n");
  const dataLineContent = inputLines[1];

  const parseNumericString = (numStr) => parseInt(numStr, RADIX_DECIMAL);

  const parsedNumbers = dataLineContent.split(" ").map(parseNumericString);

  const highestValue = Math.max(...parsedNumbers);

  let totalAdjustments = 0;

  for (let targetNumber = 0; targetNumber <= highestValue; targetNumber++) {
    const matchingOccurrences = parsedNumbers.filter((currentNumber) => currentNumber === targetNumber);
    const currentOccurrenceCount = matchingOccurrences.length;

    if (currentOccurrenceCount < targetNumber) {
      totalAdjustments += currentOccurrenceCount;
    } else if (currentOccurrenceCount > targetNumber) {
      totalAdjustments += currentOccurrenceCount - targetNumber;
    }
  }

  console.log(totalAdjustments);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
