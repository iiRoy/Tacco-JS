'use strict';

const executeTransformationProcess = (sourceData) => {
  const inputLines = sourceData.split('\n');
  let workingString = inputLines[0];

  let totalTransformationCount = 0;

  const globalSwapPattern = /BW/g;
  const existenceCheckPattern = /BW/;

  const performSingleSwapPass = (str, pattern) => {
    const matchesFound = str.match(pattern);
    const currentPassCount = matchesFound.length;

    const transformedString = str.replace(pattern, 'WB');

    return {
      newStringState: transformedString,
      swapsInPass: currentPassCount
    };
  };

  while (existenceCheckPattern.test(workingString)) {
    const passResult = performSingleSwapPass(workingString, globalSwapPattern);

    totalTransformationCount += passResult.swapsInPass;

    workingString = passResult.newStringState;
  }

  console.log(totalTransformationCount);
};

executeTransformationProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));
