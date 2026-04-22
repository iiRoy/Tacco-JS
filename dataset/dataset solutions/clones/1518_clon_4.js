const discoverSequenceAndCycle = (
  valueCurrently,
  indexCurrently,
  maxSequenceLength,
  moduloDenominator,
  sequenceStore,
  indexToValueMap
) => {
  if (indexToValueMap.has(valueCurrently)) {
    return {
      generatedValues: sequenceStore,
      cycleDetails: {
        cycleStartPoint: indexToValueMap.get(valueCurrently),
        cycleEndPoint: indexCurrently
      }
    };
  }

  if (indexCurrently >= maxSequenceLength) {
    return {
      generatedValues: sequenceStore,
      cycleDetails: null
    };
  }

  indexToValueMap.set(valueCurrently, indexCurrently);
  sequenceStore.push(valueCurrently);

  const nextCalculatedValue = (valueCurrently * valueCurrently) % moduloDenominator;

  return discoverSequenceAndCycle(
    nextCalculatedValue,
    indexCurrently + 1,
    maxSequenceLength,
    moduloDenominator,
    sequenceStore,
    indexToValueMap
  );
};

const calculateTotalSum = (inputStr) => {
  const [targetCount, seedValue, modulusDivisor] = inputStr
    .split(" ")
    .map(Number);

  const storedValues = [];
  const valueIndexMap = new Map();

  const { generatedValues, cycleDetails } = discoverSequenceAndCycle(
    seedValue,
    0,
    modulusDivisor + 1,
    modulusDivisor,
    storedValues,
    valueIndexMap
  );

  let overallSum = 0;

  if (!cycleDetails || cycleDetails.cycleStartPoint >= targetCount) {
    overallSum = generatedValues
      .slice(0, targetCount)
      .reduce((accumulatorVal, currentVal) => accumulatorVal + currentVal, 0);
  } else {
    const cycleStart = cycleDetails.cycleStartPoint;
    const cycleEnd = cycleDetails.cycleEndPoint;

    for (let j = 0; j < cycleStart; ++j) {
      if (j < targetCount) {
        overallSum += generatedValues[j];
      } else {
        break;
      }
    }

    let remainingElementsToSum = targetCount - cycleStart;

    if (remainingElementsToSum > 0) {
      const cycleSegment = generatedValues.slice(cycleStart, cycleEnd);
      const segmentLength = cycleSegment.length;
      const segmentSum = cycleSegment.reduce((acc, val) => acc + val, 0);

      if (segmentLength > 0) {
        const fullSegmentRepeats = Math.floor(remainingElementsToSum / segmentLength);
        overallSum += fullSegmentRepeats * segmentSum;

        const remainingInSegment = remainingElementsToSum % segmentLength;
        for (let k = 0; k < remainingInSegment; ++k) {
          overallSum += cycleSegment[k];
        }
      }
    }
  }

  console.log(overallSum);
};

calculateTotalSum("1000 2 16");