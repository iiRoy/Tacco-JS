'use strict';

const processInputData = (rawData) => {
  const operationCount = Number(rawData[0]);
  const operationSequence = rawData.slice(2, 2 + operationCount);
  const operationCharacters = operationSequence.split('');

  const initialLevelState = { currentLevel: 0, peakLevel: 0 };

  const levelTracker = (accumulator, char) => {
    const nextLevel = accumulator.currentLevel + (char === 'I' ? 1 : -1);
    return {
      currentLevel: nextLevel,
      peakLevel: Math.max(accumulator.peakLevel, nextLevel)
    };
  };

  const finalLevelState = operationCharacters.reduce(levelTracker, initialLevelState);

  return finalLevelState.peakLevel;
};

const executeProgram = (inputSource) => {
  const resultValue = processInputData(inputSource);
  console.log(resultValue);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
