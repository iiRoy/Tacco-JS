function processInput(rawData) {
  let inputLines = rawData.split("\n");
  let firstLineParts = inputLines[0].split(" ");

  let firstValue = Number(firstLineParts[0]);
  let secondValue = Number(firstLineParts[1]);

  let powerOfTwoFactor = Math.pow(2, secondValue);
  let termOne = 1900 * secondValue;
  let termTwo = 100 * (firstValue - secondValue);
  let sumOfInternalTerms = termOne + termTwo;

  let finalCalculatedResult = powerOfTwoFactor * sumOfInternalTerms;

  console.log(`${finalCalculatedResult}`);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
