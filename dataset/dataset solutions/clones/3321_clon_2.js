process.stdout.write( (function (sourceText) {
  const processedLines = sourceText
    .trim()
    .split('\n')
    .map( (currentLine) => currentLine.split(' ') );
  const totalCases = processedLines.shift()[0] | 0;
  const likelihoods = processedLines[0].map(Number);
  const probabilityTable = Array(totalCases)
    .fill(0.0)
    .map((rowFiller) => Array(totalCases + 1).fill(0.0));
  probabilityTable[0][0] = 1.0 - likelihoods[0];
  probabilityTable[0][1] = likelihoods[0];
  for ( let outerIdx = 0; outerIdx < totalCases - 1; outerIdx++ ) {
    for ( let innerIdx = 0; innerIdx <= outerIdx + 1; innerIdx++ ) {
      probabilityTable[outerIdx + 1][innerIdx + 1] += probabilityTable[outerIdx][innerIdx] * likelihoods[outerIdx + 1];
      probabilityTable[outerIdx + 1][innerIdx] += probabilityTable[outerIdx][innerIdx] * (1.0 - likelihoods[outerIdx + 1]);
    }
  }
  return probabilityTable[totalCases - 1]
    .slice((totalCases + 1) / 2)
    .reduce((sumResult, nextItem) => sumResult + nextItem)
    .toFixed(10);
}(require('node:fs').readFileSync('/dev/stdin', 'utf8')) );