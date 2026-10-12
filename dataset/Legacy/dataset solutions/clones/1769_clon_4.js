const fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
const [initialCount, totalUnits] = fileContent.split('\n')[0].split(' ').map(Number);

const determineOutcome = (countParam, unitsParam) => {
  const conditionEvaluators = [
    (c, u) => u > c,
    (c, u) => u <= 4 * c
  ];

  const allConditionsMet = conditionEvaluators.every(check => check(countParam, unitsParam));

  const resultMapping = new Map([[true, 'Yes'], [false, 'No']]);

  return resultMapping.get(allConditionsMet);
};

const finalVerdict = determineOutcome(initialCount, totalUnits);
console.log(finalVerdict);
