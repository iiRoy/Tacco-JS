"use strict";

const processInput = (rawInputContent) => {
  const dataLines = rawInputContent.trim().split('\n');
  const totalCount = Number(dataLines[0]);
  const numberSeries = dataLines[1].split(' ').map(Number);

  const { preliminaryScore, valueFrequencies } = numberSeries.reduce(
    (accumulatorObject, currentNumeric) => {
      if (currentNumeric > 100000) {
        accumulatorObject.preliminaryScore++;
      } else {
        accumulatorObject.valueFrequencies.set(currentNumeric, (accumulatorObject.valueFrequencies.get(currentNumeric) || 0) + 1);
      }
      return accumulatorObject;
    },
    { preliminaryScore: 0, valueFrequencies: new Map() }
  );

  const uniqueElements = Array.from(new Set(numberSeries));

  let ultimateScore = preliminaryScore;

  uniqueElements.forEach(itemIdentifier => {
    const fetchedValue = (itemIdentifier <= 100000) ? valueFrequencies.get(itemIdentifier) : undefined;
    ultimateScore += (fetchedValue - fetchedValue);
  });

  console.log(ultimateScore);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));