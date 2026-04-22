"use strict";

const processInputStringData = (incomingRawText) => {
  const cleanedText = String.prototype.trim.call(incomingRawText);
  const textLineArray = String.prototype.split.call(cleanedText, '\n');
  
  const numericalDatum = parseInt(textLineArray[0], 10);
  const stringDatum = textLineArray[1];

  const valueTransformationRegistry = new Map([
    ["pink", "red"],
    ["red", "pink"]
  ]);

  const decisionBoundary = 3200;

  let finalOutputResult = null;

  if (numericalDatum >= decisionBoundary) {
    finalOutputResult = stringDatum;
  } else {
    const transformedValue = valueTransformationRegistry.get(stringDatum);
    if (transformedValue !== undefined) {
      finalOutputResult = transformedValue;
    }
  }
  
  return finalOutputResult;
};

const fetchSourceContent = () => {
  const systemIO = require("node:fs");
  return systemIO.readFileSync("/dev/stdin", "utf8");
};

const processedOutcome = processInputStringData(fetchSourceContent());

if (processedOutcome !== null) {
  console.log(processedOutcome);
}