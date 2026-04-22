const dataAcquisitionSystem = require('node:fs');

function fetchResourceContent(resourceLocator) {
  return dataAcquisitionSystem.readFileSync(resourceLocator, 'utf8');
}

function parseNumericalSequence(textLine) {
  return textLine.split(' ').map(value => Number(value));
}

(function mainProgramFlow() {
  const rawTextData = fetchResourceContent('/dev/stdin');
  const firstDataLine = rawTextData.split('\n')[0];
  const numericalComponents = parseNumericalSequence(firstDataLine);

  const initialBoundary = numericalComponents[0];
  const finalBoundary = numericalComponents[1];
  const primaryDivisor = numericalComponents[2];
  const secondaryDivisor = numericalComponents[3];

  const valueRangeLength = finalBoundary - initialBoundary + 1;

  const calculatedResult = valueRangeLength + 
                           Math.floor(valueRangeLength / (primaryDivisor * secondaryDivisor)) - 
                           Math.floor(valueRangeLength / primaryDivisor) - 
                           Math.floor(valueRangeLength / secondaryDivisor);
  
  process.stdout.write(calculatedResult.toString() + '\n');
})();