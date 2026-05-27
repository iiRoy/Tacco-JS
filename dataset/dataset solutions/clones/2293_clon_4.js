function processValues(rawInput) {
  const numberComponents = rawInput.split(" ").map(strValue => Number.parseInt(strValue, 10));

  let currentPrimary = numberComponents[0];
  let currentSecondary = numberComponents[1];
  let operationBudget = numberComponents[2];

  const primaryConsumption = Math.min(currentPrimary, operationBudget);
  currentPrimary -= primaryConsumption;
  operationBudget -= primaryConsumption;

  const secondaryConsumption = Math.min(currentSecondary, operationBudget);
  currentSecondary -= secondaryConsumption;

  console.log("%d %d", currentPrimary, currentSecondary);
}

processValues(require("fs").readFileSync("/dev/stdin", "utf8"));
