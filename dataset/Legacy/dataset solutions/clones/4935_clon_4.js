'use strict';

function processContest(rawData) {
  const inputLines = rawData.trim().split('\n');

  const numericThresholds = inputLines[0].split(' ').reduce((acc, val, idx) => {
    if (idx === 1) acc.push(parseInt(val, 10));
    if (idx === 2) acc.push(parseInt(val, 10));
    return acc;
  }, []);

  const contestantSymbols = Array.from(inputLines[1]);

  contestantSymbols.forEach((currentSymbol, currentIdx) => {
    const oneBasedIndex = currentIdx + 1;
    const sumOfThresholds = numericThresholds[0] + numericThresholds[1];

    const symbolEvaluators = {
      'a': () => {
        return oneBasedIndex < sumOfThresholds ? 'Yes\n' : 'No\n';
      },
      'b': () => {
        const precedingBCount = contestantSymbols.slice(0, currentIdx).filter(s => s === 'b').length;
        return (oneBasedIndex < sumOfThresholds && oneBasedIndex < precedingBCount) ? 'Yes\n' : 'No\n';
      },
      'default': () => 'No\n'
    };

    const resultOutput = (symbolEvaluators[currentSymbol] || symbolEvaluators['default'])();
    console.log(resultOutput);
  });
}

processContest(require("fs").readFileSync("/dev/stdin", "utf8"));
