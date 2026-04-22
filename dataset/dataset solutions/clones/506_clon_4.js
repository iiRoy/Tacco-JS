const fileData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const sumOfElements = (fileData.trim())
  .split('\n')
  .slice(0, 10)
  .reduce((accumulator, currentString) => {
    const numericRepresentation = +currentString;
    return accumulator + numericRepresentation;
  }, 0);

console.log(sumOfElements);