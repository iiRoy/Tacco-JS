'use strict';

function* termProducer(startValue, multiplier, subtractor) {
  let current = startValue;
  while (true) {
    yield current;
    current = multiplier * current - subtractor;
  }
}

function processInputAndGenerate(sourceText) {
  const rawParts = sourceText.trim().split(' ');
  const numericParts = rawParts.map(parseFloat);

  const multiplierVal = numericParts[0];
  const subtractorVal = numericParts[1];
  const initialVal = numericParts[2];

  const sequenceGen = termProducer(initialVal, multiplierVal, subtractorVal);

  sequenceGen.next();

  const subsequentTerms = Array.from({ length: 10 }, () => sequenceGen.next().value);

  console.log(subsequentTerms.join('\n'));
}

processInputAndGenerate(require('fs').readFileSync('/dev/stdin', 'utf8'));
