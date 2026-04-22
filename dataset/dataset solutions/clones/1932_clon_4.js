const performSequenceGeneration = (inputFragments) => {
  const [primaryValue, iterationCount] = inputFragments[0].split(' ').map(numericConversion => +numericConversion);

  const oddStrategy = (num, idx) => [1 + idx, (num - 1) - idx];
  const evenStrategy = (num, idx) => [num / 2 - idx, num / 2 + 1 + idx];

  const pairSelector = (primaryValue % 2 !== 0) ? oddStrategy : evenStrategy;

  const resultantSets = Array.from({ length: iterationCount }, (_, idx) => pairSelector(primaryValue, idx));

  resultantSets.forEach(currentSet => console.log(`${currentSet[0]} ${currentSet[1]}`));
};

let accumulatedInput = '';
process.stdin.on('data', chunk => accumulatedInput += chunk);
process.stdin.on('end', () => {
  const {EOL: lineBreaker} = require('os');
  const inputLines = accumulatedInput.split(lineBreaker);
  performSequenceGeneration(inputLines);
});