const inputHandler = require('readline');
const inputInterface = inputHandler.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const directionTranslator = {
  'north': '0',
  'west': '1'
};

const processSegment = (segmentContent) => {
  if (segmentContent === "#") {
    return { terminateSession: true };
  }

  let convertedSegment = segmentContent;
  for (const directionKey in directionTranslator) {
    convertedSegment = convertedSegment.replaceAll(directionKey, directionTranslator[directionKey]);
  }

  const initialPower = convertedSegment.length - 1;
  const upperBoundary = 90 * (1 << initialPower);

  const determineValue = (currentAccumulator, currentDirectionChar, index) => {
    const stepMagnitude = 90 * (1 << (initialPower - index));
    if (currentDirectionChar === '1') {
      return Math.min(currentAccumulator + stepMagnitude, upperBoundary);
    } else {
      return Math.max(currentAccumulator - stepMagnitude, 0);
    }
  };

  let finalValue = convertedSegment.split('').reduce(determineValue, 0);
  let currentPower = initialPower;

  const normalizeFraction = (valueNumerator, powerDenominator) => {
    while (powerDenominator > 0 && (valueNumerator & 1) === 0) {
      valueNumerator >>= 1;
      powerDenominator--;
    }
    return { normalizedNumerator: valueNumerator, residualPower: powerDenominator };
  };

  const { normalizedNumerator, residualPower } = normalizeFraction(finalValue, currentPower);

  if (residualPower > 0) {
    return { resultOutput: `${normalizedNumerator}/${(1 << residualPower)}`, terminateSession: false };
  } else {
    return { resultOutput: normalizedNumerator.toString(), terminateSession: false };
  }
};

inputInterface.on('line', (receivedLine) => {
  const processingResult = processSegment(receivedLine);
  if (processingResult.terminateSession) {
    inputInterface.close();
  } else {
    console.log(processingResult.resultOutput);
  }
});

inputInterface.on('close', () => {
  // All input processed or termination signal received.
  // The process will naturally exit when no more event listeners are active.
});