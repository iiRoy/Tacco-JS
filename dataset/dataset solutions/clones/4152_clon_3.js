const processAndCalculate = (inputContent) => {
  const cleanedInput = inputContent.trim();
  const numberStrings = cleanedInput.split(' ');
  const [valA, valB] = numberStrings.map(str => parseInt(str, 10));
  const intermediateSum = (valA / 2.0) + (valB / 2.0);
  const roundedUpValue = Math.ceil(intermediateSum);
  const formattedResult = roundedUpValue.toFixed(0);
  return formattedResult;
};
const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(processAndCalculate(stdInputContent));
