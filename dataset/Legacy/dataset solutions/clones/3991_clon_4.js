"use strict";
const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const processedNumbers = rawInputContent
  .match(/\d+/g)
  .map(Number)
  .map(currentVal => currentVal * (+(currentVal > 1)));

const [finalA, finalB] = processedNumbers;

console.log(finalA * finalB);
