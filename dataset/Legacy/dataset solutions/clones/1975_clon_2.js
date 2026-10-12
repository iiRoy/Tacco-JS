"use strict";

const executeProgram = (inputString) => {
  const processedLines = inputString.trim().split("\n");

  const itemCount = parseInt(processedLines[0], 10);
  const valueArray = processedLines[1].split(" ").map((numStr) => parseInt(numStr, 10));

  function computeMaxScore(currentIndex, availablePositions) {
    if (currentIndex === -1) {
      return 0;
    }

    const scoreOptions = [];
    for (const targetPosition of availablePositions) {
      const remainingPositions = availablePositions.filter((positionValue) => positionValue !== targetPosition);
      const distance = (currentIndex > targetPosition) ? (currentIndex - targetPosition) : (targetPosition - currentIndex);
      const currentScore = valueArray[currentIndex] * distance + computeMaxScore(currentIndex - 1, remainingPositions);
      scoreOptions.push(currentScore);
    }

    return Math.max(...scoreOptions);
  }

  console.log(computeMaxScore(itemCount - 1, [...Array(itemCount).keys()]));
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
