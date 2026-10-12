const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = fileContent.split('\n');

const constructPattern = (hVal, wVal) => {
  if (hVal === 0) {
    return '';
  }
  const singleRow = Array.from({ length: wVal }).reduce((acc, _, idx) => acc + '#', '');
  const completePattern = Array.from({ length: hVal }).reduce((acc, _, idx) => acc + singleRow + '\n', '');
  return completePattern;
};

const processedOutputs = lineSegments.map(segment => {
  const numericValues = segment.split(' ').map(Number);
  const currentHeight = numericValues[0];
  const currentWidth = numericValues[1];

  return (currentHeight === 0)
    ? ''
    : constructPattern(currentHeight, currentWidth);
});

console.log(processedOutputs.join('\n'));
