require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
}).on('line', processInputLine);

let toggleState = false;

function processInputLine(inputStr) {
  toggleState = !toggleState;
  if (toggleState) {
    return;
  }

  const stringParts = inputStr.split(' ');
  const parseIntegerWithRadix = (str) => parseInt(str, 10);
  const parsedNumbers = stringParts.map(parseIntegerWithRadix);

  const gradientSigns = calculateGradients(...parsedNumbers);

  const initialSegmentCount = 1;
  const finalCount = tallySegments(initialSegmentCount, ...gradientSigns);

  console.log(finalCount);
}

function calculateGradients(firstVal, secondVal, ...remainingVals) {
  const valueDifference = secondVal - firstVal;
  const gradientSign = Math.sign(valueDifference);

  if (isNaN(gradientSign)) {
    return [];
  } else {
    const subsequentGradients = calculateGradients(secondVal, ...remainingVals);
    return [gradientSign, ...subsequentGradients];
  }
}

function tallySegments(segmentCounter, currentSign, nextSign, ...subsequentSigns) {
  const isEndOfSequence = (typeof nextSign === 'undefined');
  if (isEndOfSequence) {
    return segmentCounter;
  }

  const signsAreDifferent = (currentSign !== nextSign);

  if (signsAreDifferent) {
    const incrementedCounter = segmentCounter + 1;
    return tallySegments(incrementedCounter, ...subsequentSigns);
  } else {
    return tallySegments(segmentCounter, currentSign, ...subsequentSigns);
  }
}
