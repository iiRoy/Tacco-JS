var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const transformedOutputString = sourceData.replace(/./g, (matchedChar) => {
  return (matchedChar === '1') ? '9' : '1';
});

console.log(Number(transformedOutputString));
