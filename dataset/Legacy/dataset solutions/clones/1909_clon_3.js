"use strict";

const fileSystem = require("fs");
const rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
const instructionLines = rawInputData.trim().split("\n");

const parseNumericString = (str) => str.split(" ").map(Number);

const initialConfigString = instructionLines.shift().trim();
const initialConfigValues = parseNumericString(initialConfigString);

const targetLength = initialConfigValues[0];
const initialA = initialConfigValues[1];
const initialB = initialConfigValues[2];
const initialC = initialConfigValues[3];

function generateNextState(baseState, sourceKey, targetKey, operationResultChar) {
  const newState = { ...baseState };
  newState[sourceKey]--;
  newState[targetKey]++;
  newState.result = baseState.result.concat([operationResultChar]);
  return newState;
}

const stateQueue = [];
stateQueue.push({ A: initialA, B: initialB, C: initialC, result: [] });

let finalSolutionState;

while (stateQueue.length > 0) {
  const currentState = stateQueue.pop();

  const currentOperationCount = currentState.result.length;
  if (currentOperationCount >= targetLength) {
    finalSolutionState = currentState;
    break;
  }

  const currentInstructionPair = instructionLines[currentOperationCount];
  const sourceChar = currentInstructionPair[0];
  const targetChar = currentInstructionPair[1];

  if (currentState[sourceChar] > 0) {
    const nextStateOption1 = generateNextState(currentState, sourceChar, targetChar, targetChar);
    stateQueue.push(nextStateOption1);
  }

  if (currentState[targetChar] > 0) {
    const nextStateOption2 = generateNextState(currentState, targetChar, sourceChar, sourceChar);
    stateQueue.push(nextStateOption2);
  }
}

if (finalSolutionState) {
  console.log("Yes");
  console.log(finalSolutionState.result.join("\n"));
} else {
  console.log("No");
}
