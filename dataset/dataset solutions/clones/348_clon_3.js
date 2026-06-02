"use strict";

const utilityModule = require("util");
const logOutput = console.log;
const printChar = utilityModule.print; // This variable is declared but not used in the original code.
const inputReader = createInputParser();

let currentLine;
let currentIndex;

function evaluateExpression() {
    let resultValue = evaluateTerm();

    while (true) {
        const operatorChar = currentLine[currentIndex];
        if (operatorChar === "+") {
            currentIndex++;
            resultValue += evaluateTerm();
        } else if (operatorChar === "-") {
            currentIndex++;
            resultValue -= evaluateTerm();
        } else {
            break;
        }
    }
    return resultValue;
}

function evaluateTerm() {
    let termResult = evaluateFactor();

    while (true) {
        const operatorChar = currentLine[currentIndex];
        if (operatorChar === "*") {
            currentIndex++;
            termResult *= evaluateFactor();
        } else if (operatorChar === "/") {
            currentIndex++;
            termResult = ~~(termResult / evaluateFactor()); // Integer division
        } else {
            break;
        }
    }
    return termResult;
}

function evaluateFactor() {
    let factorValue;
    const currentSymbol = currentLine[currentIndex];

    if (currentSymbol === "(") {
        currentIndex++; // Consume '('
        factorValue = evaluateExpression();
        // The original code does not consume ')' after an expression in parentheses.
        // This behavior is preserved.
    } else if (currentSymbol === ")") {
        currentIndex++; // Consume ')' - this is an unusual parsing step, but preserved.
        factorValue = parseNumber(); // Then parse a number, e.g., ")5" parses as 5.
    } else {
        factorValue = parseNumber();
    }
    return factorValue;
}

function parseNumber() {
    let parsedNum = 0;
    let isFirstDigit = true;

    while (currentIndex < currentLine.length && /^\d/.test(currentLine[currentIndex])) {
        const digitChar = currentLine[currentIndex];
        if (isFirstDigit) {
            parsedNum = parseInt(digitChar, 10);
            isFirstDigit = false;
        } else {
            parsedNum = parsedNum * 10 + parseInt(digitChar, 10);
        }
        currentIndex++;
    }
    return parsedNum;
}

let testCaseCount = inputReader.getNextInteger();

while (testCaseCount-- > 0) {
    currentIndex = 0;

    currentLine = inputReader.getNextToken();
    const processedLine = currentLine.slice(0, currentLine.length - 1); // Remove trailing newline or similar
    currentLine = processedLine;

    logOutput(evaluateExpression());
}

function createInputParser(shouldSplitBySpace) {
    let readIndex = 0;
    const parsedTokens = [];
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    const inputLines = rawInputData.replace(/\r/g, '').split("\n");

    const splitBySpaceFlag = shouldSplitBySpace === undefined ? true : shouldSplitBySpace;

    // Process input lines into a flat array of tokens
    for (const lineContent of inputLines) {
        if (splitBySpaceFlag && lineContent !== "") {
            const lineTokens = lineContent.split(" ");
            for (const tokenElement of lineTokens) {
                if (tokenElement !== "") {
                    parsedTokens.push(tokenElement);
                }
            }
        } else {
            parsedTokens.push(lineContent);
        }
    }

    return {
        hasMoreTokens: function(expectedValue) {
            if (typeof expectedValue === "undefined") {
                return typeof parsedTokens[readIndex] !== "undefined";
            } else {
                return parsedTokens[readIndex] === expectedValue;
            }
        },
        getNextToken: function() {
            if (typeof parsedTokens[readIndex + 1] === "undefined" && readIndex + 1 > parsedTokens.length) {
                throw new RangeError("Index out of bounds at '" + (readIndex + 1) + "'");
            }
            return parsedTokens[readIndex++];
        },
        getNextNumber: function () {
            const currentToken = this.peekToken();
            if (!/^\d+$/.test(currentToken)) {
                throw new TypeError("'" + currentToken + "' cannot convert to Number");
            }
            return +this.getNextToken();
        },
        getNextInteger: function() {
            return parseInt(this.getNextNumber(), 10);
        },
        peekToken: function() {
            return parsedTokens[readIndex];
        },
        resetReader: function() {
            readIndex = 0;
        }
    };
}
