'use strict';

function processInputData(rawInputString) {
  const TARGET_MULTIPLE_VALUE = 111;

  const parsedNumericValue = ~~rawInputString;

  const intermediateDivisionResult = parsedNumericValue / TARGET_MULTIPLE_VALUE;
  const roundedUpDivision = Math.ceil(intermediateDivisionResult);
  const finalComputedValue = roundedUpDivision * TARGET_MULTIPLE_VALUE;

  console.log(finalComputedValue);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
