function processStringData(dataString) {
  const dataLength = dataString.length;
  let cumulativeResult = parseInt(dataString);

  for (let currentPrefixEndIndex = 0; currentPrefixEndIndex < dataLength; currentPrefixEndIndex++) {
    let currentPrefixDigitSum = 0;
    for (let digitIterator = 0; digitIterator < currentPrefixEndIndex; digitIterator++) {
      const digitChar = dataString.charAt(digitIterator);
      const digitValue = parseInt(digitChar);
      currentPrefixDigitSum += digitValue;
    }
    const segmentContribution = calculateSegmentContribution(dataString, currentPrefixEndIndex, currentPrefixDigitSum);
    cumulativeResult += segmentContribution;
  }
  console.log(cumulativeResult);
}

function calculateSegmentContribution(sourceData, segmentStartIndex, baseAccumulator) {
  const sourceLength = sourceData.length;
  let segmentAccumulator = 0;
  const loopUpperLimit = sourceLength - segmentStartIndex;

  for (let segmentLengthOffset = 1; segmentLengthOffset < loopUpperLimit; segmentLengthOffset++) {
    segmentAccumulator += baseAccumulator;

    const firstSegmentPart = sourceData.substr(segmentStartIndex, segmentLengthOffset);
    const parsedFirstPart = parseInt(firstSegmentPart);
    segmentAccumulator += parsedFirstPart;

    const secondSegmentPart = sourceData.substr(segmentLengthOffset + segmentStartIndex);
    const parsedSecondPart = parseInt(secondSegmentPart);
    segmentAccumulator += parsedSecondPart;
  }
  return segmentAccumulator;
}

processStringData(require('fs').readFileSync('/dev/stdin', 'utf8'));
