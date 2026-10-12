"use strict";

function getLinesFromInput(rawInput) {
  return rawInput.split("\n");
}

function readDeclaredAmount(lines) {
  const firstLineParts = lines[0].split(" ");
  return firstLineParts[0] - 0;
}

function addOneOccurrence(counterTable, keyText) {
  if (counterTable[keyText]) {
    counterTable[keyText]++;
  } else {
    counterTable[keyText] = 1;
  }
}

function buildOccurrenceTable(lines, amountToRead) {
  const occurrences = {};

  for (let index = 0; index < amountToRead; index++) {
    const currentString = lines[index + 1];
    addOneOccurrence(occurrences, currentString);
  }

  return occurrences;
}

function convertTableToPairs(occurrenceTable) {
  const pairs = [];

  for (const stringKey in occurrenceTable) {
    pairs.push([stringKey, occurrenceTable[stringKey]]);
  }

  return pairs;
}

function sortPairsByFrequencyDescendingOnly(pairs) {
  pairs.sort(function(leftPair, rightPair) {
    return rightPair[1] - leftPair[1];
  });

  return pairs;
}

function printStringsWithMaximumFrequency(sortedPairs) {
  const maximumFrequency = sortedPairs[0][1];

  while (true) {
    const currentPair = sortedPairs.shift();

    if (!currentPair || currentPair[1] !== maximumFrequency) {
      return;
    }

    console.log(currentPair[0]);
  }
}

function main(input) {
  const inputLines = getLinesFromInput(input);
  const declaredAmount = readDeclaredAmount(inputLines);

  const occurrenceTable = buildOccurrenceTable(inputLines, declaredAmount);
  const frequencyPairs = convertTableToPairs(occurrenceTable);
  const sortedPairs = sortPairsByFrequencyDescendingOnly(frequencyPairs);

  printStringsWithMaximumFrequency(sortedPairs);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));