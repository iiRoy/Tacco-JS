const getPowerValue = (base, exponent) => Math.pow(base, exponent);

function processInput(rawData) {
  const inputLines = rawData.split("\n");
  const targetNumber = parseInt(inputLines[0]);

  let resultStringRepresentation;
  let currentAccumulatedSum = 0;
  let highestPowerIndex = 0;

  if (targetNumber === 0) {
    resultStringRepresentation = "0";
  } else {
    resultStringRepresentation = "1"; // Non-zero numbers in negabase -2 always start with '1'

    if (targetNumber > 0) {
      // Determine the highest power of -2 (which is 2^even_index) needed
      for (let iterationIndex = 0; currentAccumulatedSum < targetNumber; iterationIndex += 2) {
        currentAccumulatedSum += getPowerValue(2, iterationIndex);
        highestPowerIndex = iterationIndex;
      }

      // Construct the negabase representation by iterating downwards
      for (let iterationIndex = 0; iterationIndex < highestPowerIndex; iterationIndex++) {
        const termMagnitude = getPowerValue(2, highestPowerIndex - iterationIndex - 1); // Simplified from Math.pow(2, a-i)/2
        const isCurrentIndexEven = (iterationIndex % 2 === 0);

        if (targetNumber > currentAccumulatedSum - termMagnitude) {
          resultStringRepresentation += isCurrentIndexEven ? "0" : "1";
          // currentAccumulatedSum remains unchanged in this branch
        } else {
          resultStringRepresentation += isCurrentIndexEven ? "1" : "0";
          currentAccumulatedSum -= termMagnitude;
        }
      }
    } else { // targetNumber < 0
      // Determine the highest power of -2 (which is -2^odd_index) needed
      for (let iterationIndex = 1; currentAccumulatedSum > targetNumber; iterationIndex += 2) {
        currentAccumulatedSum += getPowerValue(-2, iterationIndex);
        highestPowerIndex = iterationIndex;
      }

      // Construct the negabase representation by iterating downwards
      for (let iterationIndex = 1; iterationIndex <= highestPowerIndex; iterationIndex++) {
        const termMagnitude = getPowerValue(2, highestPowerIndex - iterationIndex); // Simplified from Math.pow(2, a-(i-1))/2
        const isCurrentIndexEven = (iterationIndex % 2 === 0);

        if (targetNumber > currentAccumulatedSum + termMagnitude) {
          resultStringRepresentation += isCurrentIndexEven ? "0" : "1";
          // currentAccumulatedSum remains unchanged in this branch
        } else {
          resultStringRepresentation += isCurrentIndexEven ? "1" : "0";
          currentAccumulatedSum += termMagnitude;
        }
      }
    }
  }

  console.log('%s', resultStringRepresentation);
}

const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(standardInputContent);
