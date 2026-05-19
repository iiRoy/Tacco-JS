function processInputData(sourceData) {
  const inputLines = sourceData.split('\n');

  const secondLineContent = inputLines[1];

  const lineComponents = secondLineContent.split(' ');

  const targetValueString = lineComponents[1];

  const isConditionMet = (targetValueString === '1');

  const outputResult = isConditionMet ? 1 : 0;

  console.log(outputResult);
}

const fileSystemHandler = require('fs');
const standardInputPath = '/dev/stdin';
const fileEncoding = 'utf8';

const rawInputContent = fileSystemHandler.readFileSync(standardInputPath, fileEncoding);

processInputData(rawInputContent);
