"use strict";
var inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
var parsedInput = inputSource.split(/ |\n/);
var inputCursor = 0;

function readSingleValue(isString) {
  return isString ? parsedInput[inputCursor++] : +parsedInput[inputCursor++];
}

function readMultipleValues(count, isString) {
  if (isString) {
    return parsedInput.slice(inputCursor, inputCursor += count);
  } else {
    return parsedInput.slice(inputCursor, inputCursor += count).map(val => +val);
  }
}

function readMatrix(height, width, isString) {
  var resultMatrix = [];
  var i = 0;
  if (isString) {
    for (; i < height; i++) resultMatrix.push(parsedInput.slice(inputCursor, inputCursor += width));
  } else {
    for (; i < height; i++) resultMatrix.push(parsedInput.slice(inputCursor, inputCursor += width).map(val => +val));
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  var args = arguments,
    len = args.length,
    expression = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--len) expression = "Array(args[" + len + "]).fill().map(x=>" + expression + ")";
  return eval(expression);
}

var finalResult = processSequence();
if (finalResult !== undefined) console.log(finalResult);

function processSequence() {
  const [sequenceLength, initialA, initialB, initialC] = readMultipleValues(4);
  const pairSequence = readMultipleValues(sequenceLength, true);

  const decisionRules = {
    "AB": { chars: ['A', 'B'], nextExclusion: 'AC', primaryForNextCheck: 'A' },
    "AC": { chars: ['A', 'C'], nextExclusion: 'AB', primaryForNextCheck: 'A' },
    "BC": { chars: ['C', 'B'], nextExclusion: 'AC', primaryForNextCheck: 'C' }
  };

  const initialProcessingState = {
    currentCounts: { A: initialA, B: initialB, C: initialC },
    decisionPath: [],
    outcomeStatus: "Proceed"
  };

  const finalProcessingState = pairSequence.reduce((accumulator, currentPair, index) => {
    if (accumulator.outcomeStatus === "No") {
      return accumulator;
    }

    const { currentCounts } = accumulator;
    const nextPairInSequence = (index < sequenceLength - 1) ? pairSequence[index + 1] : null;
    const isFinalStep = (index === sequenceLength - 1);

    const config = decisionRules[currentPair];
    const [charPrimary, charSecondary] = config.chars;

    const stepCounts = { ...currentCounts };

    stepCounts[charPrimary]--;
    stepCounts[charSecondary]--;

    if (stepCounts[charPrimary] < 0 && stepCounts[charSecondary] < 0) {
      return { ...accumulator, outcomeStatus: "No" };
    }

    let chosenCharacter;
    if (isFinalStep) {
      chosenCharacter = (stepCounts[charPrimary] > stepCounts[charSecondary]) ? charSecondary : charPrimary;
    } else {
      const conditionOne = (stepCounts[charPrimary] > stepCounts[charSecondary]);
      const conditionTwo = (nextPairInSequence !== config.nextExclusion && stepCounts[config.primaryForNextCheck] >= 0);
      chosenCharacter = (conditionOne || conditionTwo) ? charSecondary : charPrimary;
    }

    stepCounts[chosenCharacter] += 2;

    accumulator.decisionPath.push(chosenCharacter);
    accumulator.currentCounts = stepCounts;
    return accumulator;
  }, initialProcessingState);

  if (finalProcessingState.outcomeStatus === "No") {
    return "No";
  } else {
    console.log("Yes");
    return finalProcessingState.decisionPath.join("\n");
  }
}
