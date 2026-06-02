'use strict'

function calculateMaxBeauty(count, heights, beauties) {
  const initialBeautyValues = beauties;
  let dynamicProgrammingArray = Array.from({ length: count }, (_, index) => initialBeautyValues[index]);

  let overallMaximumBeauty = 0;

  for (let outerLoopIndex = 0; outerLoopIndex < count; outerLoopIndex++) {
    let currentMaxPrecedingBeauty = 0;

    const currentItemHeight = heights[outerLoopIndex];

    for (let innerLoopIndex = 0; innerLoopIndex < outerLoopIndex; innerLoopIndex++) {
      const precedingItemHeight = heights[innerLoopIndex];
      const precedingItemBeautySum = dynamicProgrammingArray[innerLoopIndex];

      if (currentItemHeight > precedingItemHeight) {
        if (currentMaxPrecedingBeauty < precedingItemBeautySum) {
          currentMaxPrecedingBeauty = precedingItemBeautySum;
        }
      }
    }

    dynamicProgrammingArray[outerLoopIndex] += currentMaxPrecedingBeauty;

    overallMaximumBeauty = Math.max(overallMaximumBeauty, dynamicProgrammingArray[outerLoopIndex]);
  }
  return overallMaximumBeauty;
}

function parseSpaceSeparatedIntegers(lineString) {
  return lineString.split(' ').map(value => parseInt(value, 10));
}

function processInputAndSolve(inputContent) {
  const inputLines = inputContent.split("\n");

  const firstLineContent = inputLines[0];
  const itemCount = parseInt(firstLineContent, 10);

  const itemHeights = parseSpaceSeparatedIntegers(inputLines[1]);
  const itemBeauties = parseSpaceSeparatedIntegers(inputLines[2]);

  const finalResult = calculateMaxBeauty(itemCount, itemHeights, itemBeauties);
  console.log(finalResult);
}

const standardInputFilePath = '/dev/stdin';
const fileSystemModule = require('fs');

const rawInputData = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
processInputAndSolve(rawInputData);
