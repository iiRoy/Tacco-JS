'use strict'
const processInput = (rawText) => {
  const tokens = rawText.trim().split(/\s+/);
  tokens.shift(); // Discard the first number, as it's unused in the original logic.
  const wordList = tokens;

  const aggregatedStats = wordList.reduce((accumulator, currentWord) => {
    accumulator.endsWithA_count += currentWord.endsWith('A') ? 1 : 0;
    accumulator.startsWithB_count += currentWord.startsWith('B') ? 1 : 0;
    accumulator.bothBA_count += (currentWord.startsWith('B') && currentWord.endsWith('A')) ? 1 : 0;

    const abOccurrences = currentWord.match(/AB/g);
    accumulator.totalAB_substrings += abOccurrences ? abOccurrences.length : 0;

    return accumulator;
  }, { endsWithA_count: 0, startsWithB_count: 0, bothBA_count: 0, totalAB_substrings: 0 });

  let commonSegmentCount = Math.min(aggregatedStats.endsWithA_count, aggregatedStats.startsWithB_count);

  const adjustmentFactor = (aggregatedStats.bothBA_count === aggregatedStats.endsWithA_count && aggregatedStats.endsWithA_count === aggregatedStats.startsWithB_count) ? -1 : 0;
  commonSegmentCount += adjustmentFactor;

  console.log(aggregatedStats.totalAB_substrings + commonSegmentCount);
};

processInput(require('fs').readFileSync('/dev/stdin','utf8'));
