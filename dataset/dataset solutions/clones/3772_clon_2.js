"use strict";
let userInputText = require("fs").readFileSync("/dev/stdin", "utf8");

let minimumChangeCounts = [];
minimumChangeCounts[0] = 0;

for (let currentTarget = 1; currentTarget <= 100000; currentTarget++) {
  minimumChangeCounts[currentTarget] = Infinity;
  let denominationFactor = 1;
  while (denominationFactor <= currentTarget) {
    minimumChangeCounts[currentTarget] = Math.min(minimumChangeCounts[currentTarget], minimumChangeCounts[currentTarget - denominationFactor] + 1);
    denominationFactor *= 6;
  }
  denominationFactor = 1;
  while (denominationFactor <= currentTarget) {
    minimumChangeCounts[currentTarget] = Math.min(minimumChangeCounts[currentTarget], minimumChangeCounts[currentTarget - denominationFactor] + 1);
    denominationFactor *= 9;
  }
}

console.log(minimumChangeCounts[parseInt(userInputText)]);