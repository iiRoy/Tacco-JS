"use strict";

function processInput(dataPayload) {
  const contentLines = dataPayload.split('\n');
  const mainString = contentLines[0];
  const searchBoundary = Number(contentLines[1]);

  let resultChar = '1';

  const relevantSegment = mainString.slice(0, searchBoundary); // Using slice instead of substring for divergence
  
  const firstNonOne = Array.from(relevantSegment).find(
    (character) => character !== '1'
  );

  if (firstNonOne !== undefined) {
    resultChar = firstNonOne;
  }

  console.log(resultChar);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
