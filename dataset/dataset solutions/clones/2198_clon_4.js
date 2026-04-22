const processRawData = (rawData) => {
  const numericalString = rawData.split("\n")[0].split(" ")[0];
  return +numericalString;
};

const calculateLogDepth = (startingValue) => {
  if (startingValue <= 1) {
    return 0;
  }
  return startingValue.toString(2).length - 1;
};

const computeFinalOutcome = (depth) => {
  return depth <= 1
    ? 1
    : (depth * depth - 1) + (1 << depth);
};

const orchestrateCalculation = (externalData) => {
  const initialNumericDatum = processRawData(externalData);
  const derivedLogarithmicFactor = calculateLogDepth(initialNumericDatum);
  const resultantQuantity = computeFinalOutcome(derivedLogarithmicFactor);
  console.log(resultantQuantity);
};

orchestrateCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));