const acquireSourceData = () => require('node:fs').readFileSync(0, 'utf8');

const evaluateNumericStatus = (incomingText) => {
  const transformedValue = Number(incomingText);
  const isZeroOrNotNumeric = (transformedValue === 0 || Number.isNaN(transformedValue));
  return Number(isZeroOrNotNumeric);
};

console.log(evaluateNumericStatus(acquireSourceData()));