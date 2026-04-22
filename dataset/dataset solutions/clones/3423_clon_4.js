"use strict";
const acquiredData = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }).trim();
const processedValue = parseInt(acquiredData, 10);

const acceptableNumbers = new Set([3, 5, 7]);

const checkInclusion = (valueToCheck) => acceptableNumbers.has(valueToCheck);

const outcomeMessage = checkInclusion(processedValue) ? "YES" : "NO";

console.log(outcomeMessage);