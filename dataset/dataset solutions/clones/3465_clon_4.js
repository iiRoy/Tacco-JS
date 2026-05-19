'use strict'

const stringFlipper = (initialString) => {
  let flippedResult = '';
  let charIndex = initialString.length;
  while (charIndex--) {
    flippedResult += initialString[charIndex];
  }
  return flippedResult;
};

const processEntry = (rawInputContent) => {
  const contentLines = rawInputContent.split('\n');
  const targetLine = contentLines[0];

  console.log(
    (targetLine.length === 2)
      ? targetLine
      : stringFlipper(targetLine)
  );
};

processEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
