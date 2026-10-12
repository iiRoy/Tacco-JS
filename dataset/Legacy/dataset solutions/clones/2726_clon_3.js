"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const fileSystemUtility = require("fs");

function computeResult(numericInput) {
    const constantFactor = 3;
    const squaredInput = Math.pow(numericInput, 2);
    return constantFactor * squaredInput;
}

(function mainExecutionBlock() {
    const rawInputString = fileSystemUtility.readFileSync("/dev/stdin", "utf8");
    const parsingRadix = 10;
    const parsedNumericValue = parseInt(rawInputString, parsingRadix);

    const finalCalculatedValue = computeResult(parsedNumericValue);

    console.log(finalCalculatedValue);
})();
