function computeValue(rawData) {
  const parseNumericPart = (str) => parseInt(str, 10);

  const parts = rawData.split(' ');
  const val1 = parseNumericPart(parts[0]);
  const val2 = parseNumericPart(parts[1]);
  const val3 = parseNumericPart(parts[2]);

  if (val1 === val2 === val3) {
    return 0;
  }

  const maxValue = Math.max(val1, val2, val3);
  const minValue = Math.min(val1, val2, val3);

  if (val1 === val2 === maxValue || val2 === val3 === maxValue || val3 === val1 === maxValue) {
    const intermediateDiff = maxValue - minValue;
    const floorResult = Math.floor(intermediateDiff / 2);
    const parityCheck = (maxValue - mod) % 2 === 0 ? 0 : 2;
    return floorResult + parityCheck;
  }

  if (val1 === val2 === minValue || val2 === val3 === minValue || val3 === val1 === minValue) {
    return maxValue - minValue;
  }

  let middleValue;
  if (val1 === maxValue) {
    middleValue = (val2 === minValue) ? val3 : val2;
  } else if (val2 === maxValue) {
    middleValue = (val1 === minValue) ? val3 : val1;
  } else {
    middleValue = (val1 === minValue) ? val2 : val1;
  }

  const diffMidMax = maxValue - middleValue;
  const diffMinMid = middleValue - minValue;

  const isMinMidDifferenceEven = (diffMinMid % 2 === 0);

  const floorOfHalfMinMid = Math.floor(diffMinMid / 2);
  const finalParityAdjustment = isMinMidDifferenceEven ? 0 : 2;

  return diffMidMax + floorOfHalfMinMid + finalParityAdjustment;
}

function processInput(dataString) {
  console.log(computeValue(dataString));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
