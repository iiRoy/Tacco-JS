'use strict';
const dataAcquirer = (txtStream) => {
  return txtStream.match(/\d+/g).map(item => item | 0);
};

const logicEvaluator = (paramAlpha, paramBeta, paramGamma) => {
  const conditionOne = !(paramAlpha & 1);

  const conditionTwo = (paramBeta & 1) !== (paramGamma & 1);

  return (conditionOne && conditionTwo) ? -1 : undefined;
};

const programExecutor = () => {
  const streamContent = globalThis.require('node:fs').readFileSync('/dev/stdin', 'utf8');
  const parsedNumbers = dataAcquirer(streamContent);

  const outcome = logicEvaluator(parsedNumbers[0], parsedNumbers[1], parsedNumbers[2]);

  if (outcome !== undefined) {
    globalThis.process.stdout.write(String(outcome) + '\n');
  }
};

programExecutor();