function processInputData(rawInputString) {
  'use strict';

  const trimmedInput = rawInputString.trim();
  const inputParts = trimmedInput.split(' ');
  const numericValues = inputParts.map(currentNumStr => parseInt(currentNumStr, 10));

  const totalQuantity = numericValues[0];
  const firstComponentValue = numericValues[1];
  const secondComponentValue = numericValues[2];

  const cycleBlockSize = firstComponentValue + secondComponentValue;

  const numFullBlocks = Math.floor(totalQuantity / cycleBlockSize);
  const remainderAfterBlocks = totalQuantity % cycleBlockSize;

  const contributionFromRemainder = Math.min(firstComponentValue, remainderAfterBlocks);

  const accumulatedValueFromFullBlocks = numFullBlocks * firstComponentValue;
  const finalComputedResult = accumulatedValueFromFullBlocks + contributionFromRemainder;

  console.log(finalComputedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
