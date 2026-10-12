const fs = require('fs');
const rawContent = fs.readFileSync('/dev/stdin', 'utf8');

rawContent
  .trim()
  .split('\n')
  .map(lineItem => {
    const numericVal = Number(lineItem);
    const squaredVal = numericVal * numericVal;
    const sumPlusOne = squaredVal + 1;
    return -(Math.floor(-sumPlusOne));
  })
  .forEach(finalOutput => console.log(finalOutput));
