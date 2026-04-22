'use strict';

function processInputData(sourceContent) {
  const lineFragment = sourceContent.split('\n')[0];
  const numberStrings = lineFragment.match(/(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/).slice(1);

  const [firstOperand, secondOperand, thirdOperand, fourthOperand] = numberStrings.map(str => parseInt(str, 10));

  const sumOfFirstPair = firstOperand + secondOperand;
  const sumOfSecondPair = thirdOperand + fourthOperand;

  const verdictRegistry = new Map([
    [1, 'Left'],
    [-1, 'Right'],
    [0, 'Balanced']
  ]);

  const comparisonResultSign = Math.sign(sumOfFirstPair - sumOfSecondPair);
  const finalJudgment = verdictRegistry.get(comparisonResultSign);

  console.log(finalJudgment);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));