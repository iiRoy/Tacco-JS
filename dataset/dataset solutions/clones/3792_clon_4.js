'use strict';

const executeAnalysis = (rawData) => {
  const dataLines = rawData.split('\n');
  const totalLength = Number(dataLines[0]);
  const primaryString = dataLines[1].split('');

  const splitIndices = Array.from({ length: totalLength - 1 }, (_, idx) => idx + 1);

  const intersectionResults = splitIndices.map(separationPoint => {
    const leftSegmentChars = primaryString.slice(0, separationPoint);
    const rightSegmentChars = primaryString.slice(separationPoint);

    const distinctLeftSet = new Set(leftSegmentChars);
    const distinctRightSet = new Set(rightSegmentChars);

    const commonElementsCount = [...distinctLeftSet].filter(symbol =>
      distinctRightSet.has(symbol)
    ).length;

    return commonElementsCount;
  });

  const highestCount = Math.max(...intersectionResults);
  console.log(highestCount);
};

executeAnalysis(require("fs").readFileSync("/dev/stdin", "utf8").trim());