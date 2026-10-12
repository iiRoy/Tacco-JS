"use strict";

function processInputData(rawData) {
  const cleanedInputString = rawData.trim();
  const inputSegments = cleanedInputString.split(' ');

  const firstElement = inputSegments[0];
  const secondElement = inputSegments[1];

  const combinedResult = secondElement + firstElement;

  console.log(combinedResult);
}

const fileSystemHandler = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";

const rawContentFromStdin = fileSystemHandler.readFileSync(standardInputPath, textEncoding);
processInputData(rawContentFromStdin);
