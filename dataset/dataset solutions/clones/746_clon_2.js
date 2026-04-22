function normalizeValue(currentVal) {
 if (currentVal >= 10) {
  currentVal = currentVal - 10 + 1;
 }
 return currentVal;
}

var rawData = require('fs') .readFileSync('/dev/stdin', 'utf8');
var lineData = rawData.trim().split("\n");

var numEntries = parseInt(lineData.shift());
var charSequence = lineData.shift().split("");
var someValueA = parseInt(lineData.shift());
var numberArray = lineData.shift().split(" ").map(parseInt);

var factorList = [];
var initialSum = 0;

charSequence.forEach(function(charItem, charIndex) {
 if (charItem === "*") {
  if (charIndex % 2 === 0) factorList.push(1);
  else factorList.push(2);
 } else {
  if (charIndex % 2 === 0) initialSum += parseInt(charItem);
  else initialSum += normalizeValue(parseInt(charItem) * 2);
 }
});

var dynamicProgTable = [];
for (var rowIdx = 0; rowIdx <= 7; rowIdx++) {
 dynamicProgTable[rowIdx] = [];
 for (var colIdx = 0; colIdx <= 1000000; colIdx++) dynamicProgTable[rowIdx][colIdx] = 0;
}

dynamicProgTable[0][initialSum] = 1;

for (var loopIdx1 = 0; loopIdx1 < factorList.length; loopIdx1++) {
 for (var loopIdx2 = 0; loopIdx2 < numberArray.length; loopIdx2++) {
  for (var currentSum = 0; currentSum <= 1000000; currentSum++) {
   dynamicProgTable[loopIdx1 + 1][currentSum + normalizeValue(numberArray[loopIdx2] * factorList[loopIdx1])] += dynamicProgTable[loopIdx1][currentSum];
  }
 }
}

var finalResult = 0;
for (var finalSumIndex = 0; finalSumIndex <= 100000; finalSumIndex++) finalResult += dynamicProgTable[factorList.length][finalSumIndex * 10];
console.log(finalResult);