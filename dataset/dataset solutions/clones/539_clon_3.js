var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = rawData.trim().split("\n");

var firstLineValue = lines.shift();
var elementCount = Number(firstLineValue);

var originalArray = lines.shift().split(" ").map(Number);
var sortedArray = originalArray.slice().sort((valX, valY) => valX - valY);

var queryLineValue = lines.shift();
var queryCount = Number(queryLineValue);

var rawSwapLines = lines.map(val => val.split(" "));
var parsedSwapLines = rawSwapLines.map(innerArr => innerArr.map(Number));
var swapIndices = parsedSwapLines.map(innerArr => innerArr.map(val => val - 1));

swapIndices.unshift([0, 0]);

var diffMapOriginal = {};
var diffMapSorted = {};

function populateDiffMaps(origArr, sortedArr, mapOrig, mapSorted) {
    for (let idx = 0; idx < origArr.length; idx++) {
        if (origArr[idx] !== sortedArr[idx]) {
            mapOrig[idx] = origArr[idx];
            mapSorted[idx] = sortedArr[idx];
        }
    }
}

populateDiffMaps(originalArray, sortedArray, diffMapOriginal, diffMapSorted);

function generateMapString(mapObject) {
    let resultString = "";
    for (let key in mapObject) {
        resultString += mapObject[key];
    }
    return resultString;
}

var sortedDiffString = generateMapString(diffMapSorted);

let foundMatch = false;
let matchFoundAtIndex = -1;

for (let currentIterationIndex = 0; currentIterationIndex <= queryCount; currentIterationIndex++) {
   let currentSwapPair = swapIndices[currentIterationIndex];
   let firstSwapKey = currentSwapPair[0];
   let secondSwapKey = currentSwapPair[1];

   let tempValue = diffMapOriginal[firstSwapKey];
   diffMapOriginal[firstSwapKey] = diffMapOriginal[secondSwapKey];
   diffMapOriginal[secondSwapKey] = tempValue;

   let currentDiffString = generateMapString(diffMapOriginal);
   if (currentDiffString === sortedDiffString) {
      foundMatch = true;
      matchFoundAtIndex = currentIterationIndex;
      break;
   }
}

if (foundMatch) {
    console.log(matchFoundAtIndex);
} else {
    console.log(-1);
}
