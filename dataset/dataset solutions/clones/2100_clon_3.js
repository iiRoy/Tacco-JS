const processInputData = (inputLineContent) => {
  const inputParts = inputLineContent.split(" ");

  const [totalN, valA, valB] = inputParts.map(Number);

  const sumOfAB = valA + valB;

  if (sumOfAB === 0) {
    console.log(0);
    return;
  }

  const fullCycles = Math.floor(totalN / sumOfAB);
  const remainingItems = totalN % sumOfAB;

  const baseContribution = fullCycles * valA;
  const additionalContribution = Math.min(remainingItems, valA);

  const finalOutcome = baseContribution + additionalContribution;

  console.log(finalOutcome);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
