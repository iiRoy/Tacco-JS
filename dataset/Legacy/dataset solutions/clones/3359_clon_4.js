'use strict';

const calculateValue = (rawTextContent) => {
  const lineSegments = rawTextContent.split('\n');
  const firstLine = lineSegments[0];
  
  const numericComponents = firstLine.split(' ').reduce((acc, str) => {
    acc.push(Number(str));
    return acc;
  }, []);

  const [valX, valY, valZ] = numericComponents;

  const conditionCheck = (valZ <= valX + valY);
  const finalOutcome = (valZ + valY) * conditionCheck + (valX + 2 * valY + 1) * (!conditionCheck);

  console.log(finalOutcome);
};

calculateValue(require('fs').readFileSync('/dev/stdin', 'utf8'));
