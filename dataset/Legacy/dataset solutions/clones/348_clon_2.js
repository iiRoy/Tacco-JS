"use strict";

var utilityModule = require("util"),
    logOutput = console.log,
    printChar = utilityModule.print,
    inputReader = obtainInputParser();

function evaluateExpression() {
    var resultValue = processTerm();

    while (true) {
        if (currentLine[currentIndex] === "+") {
            currentIndex++;
            resultValue += processTerm();
        } else if (currentLine[currentIndex] === "-") {
            currentIndex++;
            resultValue -= processTerm();
        } else {
            break;
        }
    }
    return resultValue;
}

function processTerm() {
    var resultValue = handleFactor();

    while (true) {
        if (currentLine[currentIndex] === "*") {
            currentIndex++;
            resultValue *= handleFactor();
        } else if (currentLine[currentIndex] === "/") {
            currentIndex++;
            resultValue = ~~(resultValue / handleFactor());
        } else {
            break;
        }
    }
    return resultValue;
}

function handleFactor() {
    while (true) {
        if (currentLine[currentIndex] === "(") {
            currentIndex++;
            return evaluateExpression();
        } else if (currentLine[currentIndex] === ")") {
            currentIndex++;
        } else {
            break;
        }
    }
    var resultValue = extractNumber();
    return resultValue;
}

function extractNumber() {
    var numVal;

    while (true) {
        if (/^\d/.test(currentLine[currentIndex])) {
            numVal = numVal ? numVal * 10 + +currentLine[currentIndex] : +currentLine[currentIndex];
            currentIndex++;
        } else {
            break;
        }
    }
    return numVal;
}

var loopCount = inputReader.nextInt(),
    currentLine, currentIndex;

while (loopCount--) {
    currentIndex = 0;

    currentLine = inputReader.next();
    currentLine = currentLine.slice(0, currentLine.length - 1);

    logOutput(evaluateExpression());
}

function obtainInputParser(splitBySpace) {
    var itemIndex = 0,
        collectedItems = [],
        rawInputData = require("fs").readFileSync("/dev/stdin", "utf8"),
        processedLines = rawInputData.replace(/\r/g, '').split("\n");

    splitBySpace = splitBySpace || true;

    // Process input by splitting lines and optionally by spaces
    processedLines.forEach(function(lineContent) {
        if (splitBySpace && lineContent !== "") {
            lineContent.split(" ").forEach(function(elementPart) {
                if (elementPart !== "") collectedItems.push(elementPart);
            });
        } else {
            collectedItems.push(lineContent);
        }
    });

    return {
        hasNext: function(val) {
            if (typeof val === "undefined") {
                return typeof collectedItems[itemIndex] !== "undefined";
            } else {
                return collectedItems[itemIndex] === val;
            }
        },
        next: function() {
            if (typeof collectedItems[itemIndex + 1] === "undefined") throw new RangeError("Index out of bounds at '" + itemIndex + 1 + "'");
            return collectedItems[itemIndex++];
        },
        nextNumber: function() {
            if (!/^\d+$/.test(this.top())) throw new TypeError("'" + this.top() + "' cannot convet to Number");
            return +this.next();
        },
        nextInt: function() {
            return parseInt(this.nextNumber());
        },
        top: function() {
            return collectedItems[itemIndex];
        },
        rewind: function() {
            itemIndex = 0;
        }
    };
}
