'use strict'

function parseNumericString(inputLine) {
  return inputLine.split(' ').map(valueStr => Number(valueStr));
}

function processInput(fullInputString) {
  const relevantInputLine = fullInputString.split('\n')[0];

  const parsedNumbers = parseNumericString(relevantInputLine);

  const initialValueA = parsedNumbers[0];
  const finalValueB = parsedNumbers[1];
  const iterationCountK = parsedNumbers[2];

  let collectedUniqueNumbers = new Set();

  for (let currentIterationIndex = 0; currentIterationIndex < iterationCountK; currentIterationIndex++) {
    const candidateFromStart = initialValueA + currentIterationIndex;
    const candidateFromEnd = finalValueB - currentIterationIndex;

    const isStartCandidateWithinRange = candidateFromStart <= finalValueB;
    const isEndCandidateWithinRange = candidateFromEnd >= initialValueA;

    if (!isStartCandidateWithinRange && !isEndCandidateWithinRange) {
      break;
    }

    collectedUniqueNumbers.add(candidateFromStart);
    collectedUniqueNumbers.add(candidateFromEnd);
  }

  const numbersAsArray = Array.from(collectedUniqueNumbers);

  numbersAsArray.sort((val1, val2) => val1 - val2);

  const formattedOutputString = numbersAsArray.join('\n');

  console.log(formattedOutputString);
}

const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");

processInput(stdinContent);
