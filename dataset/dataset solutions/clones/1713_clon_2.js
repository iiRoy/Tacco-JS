"use strict";
var dataSource = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = dataSource.split(/ |\n/),
  tokenIndex = 0;

function readNum() {
  return +tokenStream[tokenIndex++];
}

function readStr() {
  return tokenStream[tokenIndex++];
}

function readBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

function readSequence(count, asStrings) {
  return asStrings ?
    tokenStream.slice(tokenIndex, (tokenIndex += count)) :
    tokenStream.slice(tokenIndex, (tokenIndex += count)).map((item) => +item);
}

function readMatrix(rows, cols, asStrings) {
  var resultGrid = [],
    rowIndex = 0;
  if (asStrings)
    for (; rowIndex < rows; rowIndex++)
      resultGrid.push(tokenStream.slice(tokenIndex, (tokenIndex += cols)));
  else
    for (; rowIndex < rows; rowIndex++)
      resultGrid.push(
        tokenStream.slice(tokenIndex, (tokenIndex += cols)).map((element) => +element)
      );
  return resultGrid;
}

function createMultiDimArray(initialValue) {
  var dimensions = arguments,
    dimCount = dimensions.length,
    arrayDefString =
    "Array(dimensions[" +
    --dimCount +
    "]).fill().map(_=>{return " +
    initialValue +
    ";})";
  while (--dimCount)
    arrayDefString =
    "Array(dimensions[" + dimCount + "]).fill().map(_=>" + arrayDefString + ")";
  return eval(arrayDefString);
}

var totalPoints = 0;

var programResult = executeProgram();

if (programResult !== undefined) {
  console.log(String(programResult));
}

function executeProgram() {
  const numDays = readNum();
  const numCategories = 26;
  const categoryCosts = readSequence(numCategories);
  const satisfactionValues = readMatrix(numDays, numCategories);

  var lastSatisfaction = createMultiDimArray(0, numCategories);

  for (var currentDay = 0; currentDay < numDays; currentDay++) {
    var selectedCategory = readNum();
    for (var catIndex = 0; catIndex < numCategories; catIndex++) {
      lastSatisfaction[catIndex] -= categoryCosts[catIndex];
    }
    lastSatisfaction[selectedCategory - 1] = 0;
    totalPoints += satisfactionValues[currentDay][selectedCategory - 1];
    for (var catIndex = 0; catIndex < numCategories; catIndex++) {
      totalPoints += lastSatisfaction[catIndex];
    }
    console.log(totalPoints);
  }
}