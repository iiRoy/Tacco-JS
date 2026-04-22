'use strict';

function primaryProcess(sourceData)
{
  const totalElements = Number.parseInt(sourceData[0]);

  const originalNumbers = sourceData[1]
    .split(' ')
    .map(Number);

  let adjustedValues = new Array();

  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    adjustedValues.push(originalNumbers[currentIdx] - currentIdx + 1);
  }

  adjustedValues.sort();

  let centralTendency;
  const middleIdx = Math.floor(totalElements / 2);

  if (totalElements % 2 !== 0) {
    centralTendency = adjustedValues[middleIdx];
  }
  else {
    centralTendency = Math.floor((adjustedValues[middleIdx] + adjustedValues[middleIdx - 1]) / 2);
  }

  let sumAbsoluteDeviations = 0.0;

  for (let elementValue of adjustedValues) {
    sumAbsoluteDeviations += Math.abs(elementValue - centralTendency);
  }

  console.log(sumAbsoluteDeviations);
}


const nodeFileSystem = require("node:fs");
const fileContentReader = nodeFileSystem.readFileSync;
const standardInputPath = "/dev/stdin";
const characterEncoding = "utf-8";
const lineDelimiter = "\n";

primaryProcess(
  fileContentReader(standardInputPath, characterEncoding).split(lineDelimiter)
);