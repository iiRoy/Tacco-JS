function ProcessInputData(rawData) {
  const lines = rawData.split("\n");
  const dataLine = lines[1];
  const numericStrings = dataLine.split(" ");
  const parsedNumbers = numericStrings.map(Number);

  const valueFrequencies = new Map();
  for (const val of parsedNumbers) {
    valueFrequencies.set(val, (valueFrequencies.get(val) || 0) + 1);
  }

  let cumulativeDifference = 0;

  for (const [currentValue, currentFrequency] of valueFrequencies.entries()) {
    if (currentFrequency < currentValue) {
      cumulativeDifference += currentFrequency;
    } else if (currentFrequency > currentValue) {
      cumulativeDifference += currentFrequency - currentValue;
    }
  }

  console.log(cumulativeDifference);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
