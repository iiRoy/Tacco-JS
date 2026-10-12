"use strict";

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputLines = rawInputContent.trim().split("\n");

const initialConfiguration = inputLines.shift().trim().split(" ").map(Number);
const N = initialConfiguration[0];
const A = initialConfiguration[1];
const B = initialConfiguration[2];
const C = initialConfiguration[3];

const taskQueue = [];
taskQueue.push({ A, B, C, result: [] });

let finalOperationResult;
while (taskQueue.length) {
  const currentOperation = taskQueue.pop();
  if (currentOperation.result.length >= N) {
    finalOperationResult = currentOperation;
    break;
  }

  const currentInstruction = inputLines[currentOperation.result.length];
  if (currentOperation[currentInstruction[0]] > 0) {
    const nextOperation = Object.create(currentOperation);
    nextOperation[currentInstruction[0]] -= 1;
    nextOperation[currentInstruction[1]] += 1;
    nextOperation.result = currentOperation.result.concat([currentInstruction[1]]);
    taskQueue.push(nextOperation);
  }
  if (currentOperation[currentInstruction[1]] > 0) {
    const nextOperation = Object.create(currentOperation);
    nextOperation[currentInstruction[0]] += 1;
    nextOperation[currentInstruction[1]] -= 1;
    nextOperation.result = currentOperation.result.concat([currentInstruction[1]]);
    taskQueue.push(nextOperation);
  }
}

if (finalOperationResult) {
  console.log("Yes");
  console.log(finalOperationResult.result.join("\n"));
} else {
  console.log("No");
}
