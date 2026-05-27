'use strict';

const parseNumericLine = (lineContent) => {
  return lineContent.split(' ').map(Number);
};

function processInputData(rawData) {
  const lineSeparatorPattern = /\r?\n/g;
  const parsedInputLines = rawData.trim().split(lineSeparatorPattern);

  const [startPositionA, velocityA] = parseNumericLine(parsedInputLines[0]);
  const [startPositionB, velocityB] = parseNumericLine(parsedInputLines[1]);
  const allowedTime = Number(parsedInputLines[2]);

  const initialDistanceBetween = startPositionB - startPositionA;
  const effectiveClosingSpeed = velocityA - velocityB;

  const maximumRelativeDistanceCovered = effectiveClosingSpeed * allowedTime;

  let finalOutcomeMessage;
  if (maximumRelativeDistanceCovered > initialDistanceBetween) {
    finalOutcomeMessage = 'YES';
  } else {
    finalOutcomeMessage = 'NO';
  }

  console.log(finalOutcomeMessage);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
