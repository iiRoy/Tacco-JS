"use strict";

function obtainAndPrepareInputData() {
  const fileSystemUtility = require("fs");
  const rawFileContent = fileSystemUtility.readFileSync("/dev/stdin", "UTF-8");
  const processedContent = rawFileContent.trim();
  const lineSegments = processedContent.split("\n");
  return lineSegments;
}

function processInputData(receivedLines) {
  const firstEntry = receivedLines[0];
  const characterToRepeat = "x";
  const firstEntryLength = firstEntry.length;
  const finalOutputString = characterToRepeat.repeat(firstEntryLength);
  console.log(finalOutputString);
}

const inputLines = obtainAndPrepareInputData();
processInputData(inputLines);
