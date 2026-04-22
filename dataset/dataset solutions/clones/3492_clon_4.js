'use strict';

const processInputData = (dataStrings) => {
  const [configurationLine, ...entryLines] = dataStrings;

  const [totalEntries, maximumTime] = configurationLine.split(' ').map(Number);

  const allOpportunities = entryLines
    .slice(0, totalEntries)
    .map(entryText => {
      const [costMetric, timeMetric] = entryText.split(' ').map(Number);
      return { cost: costMetric, time: timeMetric };
    });

  const validOpportunities = allOpportunities.filter(
    opportunity => opportunity.time <= maximumTime
  );

  const lowestCost = validOpportunities.reduce((currentMin, opportunity) => {
    return Math.min(currentMin, opportunity.cost);
  }, Infinity);

  const outputDisplay = (lowestCost === Infinity) ? 'TLE' : lowestCost;

  console.log(outputDisplay);
};

const fileSystem = require("fs");
const standardIn = "/dev/stdin";
const sourceReader = fileSystem.readFileSync(standardIn, "utf8");
const rawInputLines = sourceReader.split('\n');

processInputData(rawInputLines);