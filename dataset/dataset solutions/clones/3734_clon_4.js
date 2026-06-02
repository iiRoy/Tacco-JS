const computeResult = (sourceData) => {
  const numericalTokens = sourceData
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);

  const [sizeOfCollection, upperBoundary] = numericalTokens;

  const conditionMet = upperBoundary === sizeOfCollection;
  const outcomeOne = 1;
  const outcomeTwo = sizeOfCollection * Math.pow(upperBoundary - 1, -1);

  const finalOutcome = (conditionMet * outcomeOne) + ((!conditionMet) * outcomeTwo);

  console.log(finalOutcome);
};

computeResult(require("fs").readFileSync("/dev/stdin", "utf8"));
