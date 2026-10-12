"use strict";

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

const parsedQuantity = Number(sourceData.trim().split(/\s+/)[0]);

function assemblePattern(repetitions) {
  const actualRepetitions = Math.max(0, repetitions);
  return Array(actualRepetitions).fill("ACL").join("");
}

const generatedOutput = assemblePattern(parsedQuantity);

console.log(generatedOutput);
