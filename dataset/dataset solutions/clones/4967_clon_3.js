function processInputData(rawDataString) {
  const parseNumericValue = (valueString) => {
    return Number(valueString);
  };

  const dataLines = rawDataString.split("\n");

  const baseOne = parseNumericValue(dataLines[0]);
  const baseTwo = parseNumericValue(dataLines[1]);
  const trapezoidHeight = parseNumericValue(dataLines[2]);

  const sumOfParallelSides = baseOne + baseTwo;
  const productOfSumAndHeight = sumOfParallelSides * trapezoidHeight;
  const areaCalculationResult = productOfSumAndHeight / 2;

  console.log(areaCalculationResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
