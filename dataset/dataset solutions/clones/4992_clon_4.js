function processInputData(rawData) {
  const processedData = rawData.trim();

  const lineSegments = processedData.split('\n');

  const numericComponents = lineSegments.map(segment => parseInt(segment, 10));

  const componentOne = numericComponents[0];
  const componentTwo = numericComponents[1];
  const componentThree = numericComponents[2];
  const componentFour = numericComponents[3];

  const calculatedOutcome = componentTwo * componentThree + Math.max(0, componentOne - componentTwo) * componentFour;

  console.log(calculatedOutcome);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
