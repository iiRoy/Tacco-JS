"use strict";
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenSequence = fileContent.split(/ |\n/), sequenceIndex = 0;

function next(isString) {
  return isString ? tokenSequence[sequenceIndex++] : +tokenSequence[sequenceIndex++];
}

function obtainMultiple(count, asString) {
  return asString ? tokenSequence.slice(sequenceIndex, sequenceIndex += count) : tokenSequence.slice(sequenceIndex, sequenceIndex += count).map(val => +val);
}

function obtainMatrix(rows, cols, asString) {
  var resultMatrix = [], rowCounter = 0;
  if (asString) {
    for (; rowCounter < rows; rowCounter++) resultMatrix.push(tokenSequence.slice(sequenceIndex, sequenceIndex += cols));
  } else {
    for (; rowCounter < rows; rowCounter++) resultMatrix.push(tokenSequence.slice(sequenceIndex, sequenceIndex += cols).map(val => +val));
  }
  return resultMatrix;
}

function constructMultiArray(initialValue) {
  var args = arguments, argCount = args.length, currentExpression = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argCount) currentExpression = "Array(args[" + argCount + "]).fill().map(x=>" + currentExpression + ")";
  return eval(currentExpression);
}

var finalOutput = primaryLogic();
if (finalOutput !== undefined) console.log(finalOutput);

function* valueSequenceProducer() {
  yield 1; yield 1; yield 1; yield 2; yield 1; yield 2; yield 1; yield 5;
  yield 2; yield 2; yield 1; yield 5; yield 1; yield 2; yield 1; yield 14;
  yield 1; yield 5; yield 1; yield 5; yield 2; yield 2; yield 1; yield 15;
  yield 2; yield 2; yield 5; yield 4; yield 1; yield 4; yield 1; yield 51;
}

function primaryLogic() {
  const requestedIndex = next();
  
  if (requestedIndex <= 0 || requestedIndex > 32) {
    return undefined;
  }

  const sequenceIterator = valueSequenceProducer();
  let currentElement;

  for (let i = 0; i < requestedIndex - 1; i++) {
    sequenceIterator.next();
  }
  currentElement = sequenceIterator.next().value;
  return currentElement;
}
