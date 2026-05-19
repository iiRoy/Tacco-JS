function processInput(rawData) {
  const [upperBoundStr, lowerBoundStr] = rawData[0].split(" ");
  const upperBound = Number(upperBoundStr);
  const lowerBound = Number(lowerBoundStr);

  const modulusValue = BigInt(1000000007);

  const iterationValues = Array.from(
    { length: upperBound + 1 - lowerBound + 1 },
    (_, index) => lowerBound + index
  );

  const accumulatedSum = iterationValues.reduce((currentTotal, currentIterationValue) => {
    const termValue = BigInt(currentIterationValue) * BigInt(upperBound - currentIterationValue + 1) + BigInt(1);
    
    return currentTotal + termValue;
  }, BigInt(0));

  console.log((accumulatedSum % modulusValue).toString());
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
