'use strict';

const processInputData = (sourceContent) => {
  const firstLine = sourceContent.toString().split('\n')[0];
  const numericalTokens = firstLine.split(' ').map(Number);
  return {
    width: numericalTokens[0],
    height: numericalTokens[1],
    centerX: numericalTokens[2],
    centerY: numericalTokens[3],
    radius: numericalTokens[4]
  };
};

const evaluateCondition = (geometry) => {
  const outcomeMap = new Map([
    [true, 'No'],
    [false, 'Yes']
  ]);
  return outcomeMap.get(geometry.centerY + geometry.centerX > geometry.height);
};

const executeProgram = (inputProvider) => {
  const parsedGeometry = processInputData(inputProvider);
  console.log(evaluateCondition(parsedGeometry));
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
