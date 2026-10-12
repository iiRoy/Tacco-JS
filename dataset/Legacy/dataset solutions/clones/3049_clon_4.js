"use strict";

function processInputAndCalculate(rawData) {
  const dataLines = rawData.split('\n');
  const totalElements = parseInt(dataLines[0], 10);
  const numericSeries = dataLines[1].split(' ').map(Number);

  const finalObservation = numericSeries.reduce((accumulator, currentObservation) => {
    if (currentObservation >= accumulator.highestValueEncountered) {
      return {
        count: accumulator.count + 1,
        highestValueEncountered: currentObservation
      };
    } else {
      return accumulator;
    }
  }, { count: 0, highestValueEncountered: 0 });

  console.log(finalObservation.count);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
