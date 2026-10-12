"use strict";

const processInput = (rawData) => {
  const parsedLines = rawData.trim().split("\n");
  const elementCount = parseInt(parsedLines[0]);
  const numericalSequence = parsedLines[1].split(" ").map((value) => parseInt(value));

  const cumulativeTotals = numericalSequence.reduce((accumulator, currentElement, index) => {
    const priorTotal = index === 0 ? 0 : accumulator[index - 1];
    accumulator.push(priorTotal + currentElement);
    return accumulator;
  }, []);

  const overallTotal = cumulativeTotals[cumulativeTotals.length - 1];

  const allPartitionDifferences = cumulativeTotals.map((leftSegmentTotal) => {
    const rightSegmentTotal = overallTotal - leftSegmentTotal;
    return Math.abs(rightSegmentTotal - leftSegmentTotal);
  });

  const minimalDifference = allPartitionDifferences.reduce((currentMin, currentDifference) => {
    return Math.min(currentMin, currentDifference);
  }, Infinity);

  console.log(minimalDifference);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
