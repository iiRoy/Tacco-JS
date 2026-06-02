function computeSegmentValue(segmentData, startIdx) {
  return segmentData.slice(startIdx, startIdx + 3).reduce((accum, currentVal) => accum + Math.abs(currentVal), 0);
}

function evaluateHappiness(segmentData) {
  let currentTotal = 0;
  for (const val of segmentData) {
    currentTotal += val;
  }
  return currentTotal - segmentData.length;
}

function processInput(rawInput) {
  const lines = rawInput.split("\n");

  const firstLineParts = lines[0].split(" ");
  const totalLength = Number.parseInt(firstLineParts[0], 10);
  const operationCount = Number.parseInt(firstLineParts[1], 10);

  const inputSequence = lines[1];

  const segmentLengths = inputSequence.match(/(.)\1*/g).map(group => group.length);

  let finalHappiness;

  if (segmentLengths.length <= 2) {
    finalHappiness = totalLength - 1;
  } else {
    const finalState = Array.from({ length: operationCount }).reduce((currentState) => {
      if (currentState.terminated) {
        return currentState;
      }

      const currentSegments = currentState.segments;

      const valueAtStart = computeSegmentValue(currentSegments, 0);
      const valueAtNext = computeSegmentValue(currentSegments, 1);

      let selectedPosition;
      let chosenValue;

      if (valueAtStart >= valueAtNext) {
        selectedPosition = 0;
        chosenValue = valueAtStart;
      } else {
        selectedPosition = 1;
        chosenValue = valueAtNext;
      }

      const updatedSegments = [
        ...currentSegments.slice(0, selectedPosition),
        chosenValue,
        ...currentSegments.slice(selectedPosition + 3)
      ];

      const currentHappiness = evaluateHappiness(updatedSegments);
      const shouldTerminate = (totalLength - 1 === currentHappiness);

      return {
        segments: updatedSegments,
        terminated: shouldTerminate,
        happiness: currentHappiness
      };
    }, { segments: segmentLengths, terminated: false, happiness: 0 });

    finalHappiness = finalState.terminated ? finalState.happiness : evaluateHappiness(finalState.segments);
  }

  console.log(finalHappiness);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
