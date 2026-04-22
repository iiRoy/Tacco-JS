let fileSystemModule = require("node:fs");

var incomingTextualData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

incomingTextualData = incomingTextualData.split("\n").map(singleLineString => parseInt(singleLineString, 10));

const resultDisplaySystem = {
  emitMessage: function(messageContent) {
    console.log(messageContent);
  }
};

resultDisplaySystem.emitMessage(executeSequenceVerification());

function executeSequenceVerification() {
  const failureIndicator = "No";
  let totalSequenceItems = incomingTextualData[0];
  let observedNumericValues = {};

  for (let currentIterationIndex = 1; currentIterationIndex <= totalSequenceItems; currentIterationIndex++) {
    if ((incomingTextualData[currentIterationIndex] ^ currentIterationIndex) & 1) {
      return failureIndicator;
    }

    let upperBoundaryValue = incomingTextualData[currentIterationIndex];
    let lowerBoundaryMarker = currentIterationIndex;
    observedNumericValues[upperBoundaryValue] = 1;

    while (currentIterationIndex < upperBoundaryValue) {
      currentIterationIndex++;

      if (incomingTextualData[currentIterationIndex] !== currentIterationIndex) {
        return failureIndicator;
      }

      currentIterationIndex++;

      if ((incomingTextualData[currentIterationIndex] ^ currentIterationIndex) & 1) {
        return failureIndicator;
      }

      if (upperBoundaryValue < incomingTextualData[currentIterationIndex]) {
        upperBoundaryValue = incomingTextualData[currentIterationIndex];
        observedNumericValues[upperBoundaryValue] = 1;
      } else if (lowerBoundaryMarker === incomingTextualData[currentIterationIndex]) {
        do {
          lowerBoundaryMarker += 2;
        } while (observedNumericValues[lowerBoundaryMarker]);
      } else {
        return failureIndicator;
      }
    }
  }

  return "Yes";
}