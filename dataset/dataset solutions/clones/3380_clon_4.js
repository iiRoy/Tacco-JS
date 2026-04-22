const extractNumericSequence = (textualSource) => {
  const allSubstances = textualSource.trim().split(/\s+/);
  const numericalEntities = allSubstances.map(Number);
  const quantity = numericalEntities[0];
  return numericalEntities.slice(1, quantity + 1);
};

const ascertainChampion = (initialPayload) => {
  const sequenceComponents = extractNumericSequence(initialPayload);

  const decisiveFactor = sequenceComponents.reduce((currentParitySum, currentElement) => {
    return currentParitySum ^ (currentElement % 2);
  }, 0);

  if (decisiveFactor === 1) {
    console.log('first');
  } else {
    console.log('second');
  }
};

((inputOrigin) => {
  const rawData = require('fs').readFileSync(inputOrigin, 'utf8');
  ascertainChampion(rawData);
})('/dev/stdin');