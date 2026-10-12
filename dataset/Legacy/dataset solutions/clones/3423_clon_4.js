"use strict";
const sourceData = require("fs").readFileSync("/dev/stdin", "UTF-8").trim();
const processedNumber = Number(sourceData);

const allowedSet = new Set([3, 5, 7]);
console.log(allowedSet.has(processedNumber) ? "YES" : "NO");
