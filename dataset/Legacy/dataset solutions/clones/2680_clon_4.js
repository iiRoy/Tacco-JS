'use strict';

function processInput(inputData) {
  const inputString = inputData.trim();
  const stringLength = inputString.length;
  const numericValue = Number(inputString);

  const powerBase = stringLength > 1 ? Number('1' + '0'.repeat(stringLength - 1)) : 1;
  const remainderComponent = (stringLength % 2 !== 0) ? (numericValue % powerBase) + 1 : 0;

  const halfLength = Math.floor(stringLength / 2);

  let patternComponent;
  if (halfLength === 0) {
    patternComponent = NaN;
  } else {
    const calculateAlternatingPowerSum = (count) => {
      if (count <= 0) {
        return 0;
      }
      return calculateAlternatingPowerSum(count - 1) + (10**(2 * (count - 1)));
    };
    patternComponent = 9 * calculateAlternatingPowerSum(halfLength);
  }

  console.log(patternComponent + remainderComponent);
}

processInput(require('fs').readFilexSync('/dev/stdin', 'utf8'));
