"use strict";
const fileInput = require("fs").readFileSync("/dev/stdin", "utf8");
let inputTokens = fileInput.split(/ |\n/);
let tokenReadIndex = 0;

function getNextValue(isString) {
    const currentToken = inputTokens[tokenReadIndex++];
    return isString ? currentToken : Number(currentToken);
}

function getMultipleValues(count, asStrings) {
    const values = inputTokens.slice(tokenReadIndex, tokenReadIndex + count);
    tokenReadIndex += count;
    return asStrings ? values : values.map(val => Number(val));
}

function getMatrixValues(height, width, asStrings) {
    const matrixRows = [];
    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        const row = inputTokens.slice(tokenReadIndex, tokenReadIndex + width);
        tokenReadIndex += width;
        matrixRows.push(asStrings ? row : row.map(val => Number(val)));
    }
    return matrixRows;
}

function createMultiDimArray(initialValue) {
    const functionArguments = arguments;
    let argumentCount = functionArguments.length;
    let arrayConstructionString = "Array(functionArguments[" + --argumentCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argumentCount) {
        arrayConstructionString = "Array(functionArguments[" + argumentCount + "]).fill().map(x=>" + arrayConstructionString + ")";
    }
    return eval(arrayConstructionString);
}

function analyzeParenthesesBalance(parenthesesString) {
    let currentBalance = 0;
    let minimumBalanceEncountered = 0;
    const OPEN_CHAR = '(';
    const CLOSE_CHAR = ')';

    for (let charIndex = 0; charIndex < parenthesesString.length; charIndex++) {
        const char = parenthesesString[charIndex];
        if (char === OPEN_CHAR) {
            currentBalance++;
        } else if (char === CLOSE_CHAR) {
            currentBalance--;
            if (currentBalance < minimumBalanceEncountered) {
                minimumBalanceEncountered = currentBalance;
            }
        }
    }
    return { minPrefixBalance: minimumBalanceEncountered, finalBalance: currentBalance };
}

const programOutput = main();
if (programOutput !== undefined) {
    console.log(programOutput);
}

function main() {
    const NO_RESULT = "No";
    const YES_RESULT = "Yes";

    const numberOfStrings = getNextValue(false);

    const stringsWithNegativePrefixAndNonPositiveFinal = [];
    const stringsWithNegativePrefixAndPositiveFinal = [];

    let totalOverallBalance = 0;
    let currentAvailableBalance = 0;

    for (let stringIndex = 0; stringIndex < numberOfStrings; stringIndex++) {
        const currentParenthesesString = getNextValue(true);
        const { minPrefixBalance, finalBalance } = analyzeParenthesesBalance(currentParenthesesString);

        totalOverallBalance += finalBalance;

        if (minPrefixBalance >= 0) {
            currentAvailableBalance += finalBalance;
        } else if (finalBalance <= 0) {
            stringsWithNegativePrefixAndNonPositiveFinal.push([-minPrefixBalance, finalBalance]);
        } else {
            stringsWithNegativePrefixAndPositiveFinal.push([-minPrefixBalance, finalBalance]);
        }
    }

    if (totalOverallBalance !== 0) {
        return NO_RESULT;
    }

    stringsWithNegativePrefixAndPositiveFinal.sort((a, b) => a[0] - b[0]);

    for (const [requiredMin, balanceChange] of stringsWithNegativePrefixAndPositiveFinal) {
        if (requiredMin > currentAvailableBalance) {
            return NO_RESULT;
        }
        currentAvailableBalance += balanceChange;
    }

    stringsWithNegativePrefixAndNonPositiveFinal.sort((a, b) => b[0] - a[0]);

    for (const [requiredMin, balanceChange] of stringsWithNegativePrefixAndNonPositiveFinal) {
        if (requiredMin > currentAvailableBalance) {
            return NO_RESULT;
        }
        currentAvailableBalance += balanceChange;
    }

    return YES_RESULT;
}
