"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fileSystemAccess = require("fs");
const rawData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
const numericValue = Number(rawData);
const factorsForCalculation = [3, numericValue, numericValue];
const finalResult = factorsForCalculation.reduce((accumulator, currentElement) => accumulator * currentElement, 1);
console.log(finalResult);
