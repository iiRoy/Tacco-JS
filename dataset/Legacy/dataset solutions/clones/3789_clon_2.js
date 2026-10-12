"use strict";

let fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

let firstLineValue = fileContent.split("\n")[0];

let targetString = fileContent.split("\n")[1];

let stringSplits = [];

for (let splitPoint = 1; splitPoint < firstLineValue; splitPoint++) {
  stringSplits.push([
    targetString.slice(0, splitPoint).split(""),
    targetString.slice(splitPoint).split(""),
  ]);
}

let finalResult = stringSplits
  .map((currentSplit) => {
    return currentSplit[0]
      .filter((uniqueChar, charIndex, allChars) => {
        return allChars.indexOf(uniqueChar) === charIndex;
      })
      .reduce((commonCount, charToCheck) => {
        return currentSplit[1].includes(charToCheck) ? commonCount + 1 : commonCount;
      }, 0);
  })
  .reduce((highestCount, currentSplitCount) => {
    return highestCount > currentSplitCount ? highestCount : currentSplitCount;
  });

console.log(finalResult);
