const calculateRectangleArea = (incomingContent) => {
  const contentLines = incomingContent.split('\n');
  const measurementStrings = contentLines[1].split(' ');

  const dimensionCounts = measurementStrings.reduce((acc, currentDimension) => {
    const numericDimension = Number(currentDimension);
    if (!isNaN(numericDimension)) { // Ensure valid numbers
      acc[numericDimension] = (acc[numericDimension] || 0) + 1;
    }
    return acc;
  }, {});

  const distinctDimensions = Object.keys(dimensionCounts)
    .map(Number)
    .sort((a, b) => b - a); // Sort descending

  let collectedLengths = [];

  for (const aDimension of distinctDimensions) {
    const currentTally = dimensionCounts[aDimension];

    if (currentTally >= 4) {
      collectedLengths.push(aDimension, aDimension);
      break;
    } else if (currentTally >= 2) {
      collectedLengths.push(aDimension);
      if (collectedLengths.length === 2) {
        break;
      }
    }
  }

  if (collectedLengths.length === 2) {
    console.log(collectedLengths[0] * collectedLengths[1]);
  } else {
    console.log(0);
  }
};

const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
calculateRectangleArea(systemInput);