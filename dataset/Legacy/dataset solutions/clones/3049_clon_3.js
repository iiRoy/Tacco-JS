"use strict"

function ProcessData(rawInputString) {
  let inputLines = rawInputString.split('\n');

  const firstInputLine = inputLines.shift();
  let elementCount = parseInt(firstInputLine);

  const secondInputLine = inputLines.shift();
  let numericSequence = secondInputLine.split(' ').map(Number);

  let peakCount = 0;
  let highestValueSeen = 0;

  for (let currentIndex = 0; currentIndex < elementCount; currentIndex++) {
    let currentElement = numericSequence[currentIndex];

    if (currentElement >= highestValueSeen) {
      highestValueSeen = currentElement;
      peakCount++;
    }
  }
  console.log(peakCount);
}

const STANDARD_INPUT_PATH = "/dev/stdin";
const fileContents = require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8");

ProcessData(fileContents);
