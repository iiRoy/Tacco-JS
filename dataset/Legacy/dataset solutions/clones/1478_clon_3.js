"use strict";
const fileSystem = require("fs");
const standardInputPath = "/dev/stdin";
const encodingFormat = "utf8";

const rawInputData = fileSystem.readFileSync(standardInputPath, encodingFormat);
const tokenDelimiter = / |\n/;
let tokenArray = rawInputData.split(tokenDelimiter);
let tokenIndex = 0;

const retrieveNextToken = () => tokenArray[tokenIndex++];

function getNextNum() {
  return +retrieveNextToken();
}

function getNextStr() {
  return retrieveNextToken();
}

function getNextBigInt() {
  return BigInt(retrieveNextToken());
}

function getNumsOrStrs(count, asStrings) {
  const startIndex = tokenIndex;
  tokenIndex += count;
  const slicedTokens = tokenArray.slice(startIndex, tokenIndex);
  if (asStrings) {
    return slicedTokens;
  } else {
    return slicedTokens.map(val => +val);
  }
}

function getSortedNums(count, descending) {
  const startIndex = tokenIndex;
  tokenIndex += count;
  const numbers = tokenArray.slice(startIndex, tokenIndex).map(val => +val);

  const sortComparator = (valA, valB) => {
    if (descending) {
      return valB - valA;
    } else {
      return valA - valB;
    }
  };
  return numbers.sort(sortComparator);
}

function getMatrix(height, width, asStrings) {
  const resultMatrix = [];
  for (let rowIdx = 0; rowIdx < height; rowIdx++) {
    const startIndex = tokenIndex;
    tokenIndex += width;
    const rowTokens = tokenArray.slice(startIndex, tokenIndex);
    if (asStrings) {
      resultMatrix.push(rowTokens);
    } else {
      resultMatrix.push(rowTokens.map(val => +val));
    }
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  const args = arguments;
  let argLength = args.length;
  let evalString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    evalString = "Array(args[" + argLength + "]).fill().map(x=>" + evalString + ")";
  }
  const finalEvalExpression = evalString;
  return eval(finalEvalExpression);
}

const outputBuffer = [];
function appendToBuffer(content) {
  outputBuffer.push(content);
}

function executeProgram() {
  const inputK = getNextNum();
  const baseSegment = "ACL";
  const maxSegmentsInLiteral = 5; // Corresponds to "ACLACLACLACLACL" having 5 "ACL"s

  const getSourcePatternString = (segment, maxCount) => {
    let fullPattern = "";
    for (let i = 0; i < maxCount; i++) {
      fullPattern += segment;
    }
    return fullPattern;
  };

  const sourceStringForSlicing = getSourcePatternString(baseSegment, maxSegmentsInLiteral);
  const sliceEndIndex = inputK * baseSegment.length;

  return sourceStringForSlicing.slice(0, sliceEndIndex);
}

const finalizeOutput = (programResult, bufferedOutput) => {
  if (programResult !== undefined) {
    console.log(String(programResult));
  }
  if (bufferedOutput.length > 0) {
    console.log(bufferedOutput.join("\n"));
  }
};

const mainResult = executeProgram();
finalizeOutput(mainResult, outputBuffer);
