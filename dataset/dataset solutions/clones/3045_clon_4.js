'use strict';

function ProcessInput(rawData) {
  const lines = rawData.split('\n');
  const numericValues = lines[0].split(' ').map(val => parseInt(val, 10));

  const firstVal = numericValues[0];
  const secondVal = numericValues[1];

  const highestVal = Math.max(firstVal, secondVal);
  const areEqual = (firstVal === secondVal);

  // Calculate the final tally using an expression that leverages boolean-to-number coercion.
  // If numbers are equal, !areEqual is false (0), resulting in highestVal * 2.
  // If numbers are different, !areEqual is true (1), resulting in highestVal * 2 - 1.
  const finalTally = highestVal * 2 - (!areEqual);

  console.log(finalTally);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
