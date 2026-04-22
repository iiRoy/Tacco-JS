function processData(sourceText) {
  const numericComponents = sourceText.match(/\d+/g);

  const monetaryUnitCount = parseInt(numericComponents[0], 10);
  const expenditureThreshold = parseInt(numericComponents[1], 10);

  console.log([monetaryUnitCount, expenditureThreshold].join(' '));

  let accumulatedValue = 0;
  for (let counter = 0; counter < monetaryUnitCount; ++counter) {
    accumulatedValue = accumulatedValue + 500;
  }

  const possibleOutcomes = ["NO", "YES"];
  const outcomeIndicator = +(accumulatedValue > expenditureThreshold);

  console.log(possibleOutcomes[outcomeIndicator]);
}