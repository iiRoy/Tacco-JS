const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let rawInputStorage = [];

lineProcessor.on('line', (currentLine) => {
  rawInputStorage.push(currentLine);
});

lineProcessor.on('close', () => {
  processAllEntries(rawInputStorage);
});

const baseExponentiation = (exponent) => {
  if (exponent < 0) return 0;
  return (10 ** exponent);
};

const sequenceGenerator = (startValue, endValue) => {
  if (startValue > endValue) return [];
  return Array.from({ length: endValue - startValue + 1 }, (_, idx) => startValue + idx);
};

const evaluateCriterion = (itemA, itemB, lengthB) => {
  const expressionLeft = (itemB * itemB + itemB - itemA * itemA + itemA) / 2;
  const expressionRight = itemA * baseExponentiation(lengthB) + itemB;
  return expressionLeft === expressionRight;
};

const discoverConformingPairs = (magnA, magnB) => {
  const minValA = baseExponentiation(magnA - 1);
  const maxValA = baseExponentiation(magnA) - 1;
  const minValB = baseExponentiation(magnB - 1);
  const maxValB = baseExponentiation(magnB) - 1;

  const candidateSetA = sequenceGenerator(minValA, maxValA);
  const candidateSetB = sequenceGenerator(minValB, maxValB);

  return candidateSetA.flatMap(itemA =>
    candidateSetB
      .filter(itemB => evaluateCriterion(itemA, itemB, magnB))
      .map(itemB => [itemA, itemB])
  );
};

const processAllEntries = (entryStrings) => {
  const entryCount = Number(entryStrings[0]);
  let currentReadPosition = 1;

  for (let entryIndex = 0; entryIndex < entryCount; ++entryIndex) {
    const magnitudeSpecs = entryStrings[currentReadPosition++].split(' ').map(Number);
    const magnitudeA = magnitudeSpecs[0];
    const magnitudeB = magnitudeSpecs[1];

    const matchedPairs = discoverConformingPairs(magnitudeA, magnitudeB);

    if (matchedPairs.length === 0) {
      console.log('No cats.');
    } else {
      matchedPairs.forEach(couple => console.log(`${couple[0]} ${couple[1]}`));
    }
  }
};