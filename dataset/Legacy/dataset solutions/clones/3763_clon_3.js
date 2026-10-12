function compareObjects(objA, objB) {
    const propNamesA = Object.getOwnPropertyNames(objA);
    const propNamesB = Object.getOwnPropertyNames(objB);

    if (propNamesA.length !== propNamesB.length) {
        return false;
    }

    const allPropsMatch = propNamesA.every(function(propName) {
        return objA[propName] === objB[propName];
    });

    return allPropsMatch;
}

function parseInteger(inputStr) {
    const decimalRadix = 10;
    return parseInt(inputStr, decimalRadix);
}

function executeProgram(rawInput) {
    const numericValue = parseInteger(rawInput);
    const comparisonThreshold = 999;
    const isBelowThreshold = numericValue <= comparisonThreshold;
    const outputMessage = isBelowThreshold ? "ABC" : "ABD";
    console.log(outputMessage);
}

const fileSystemModule = require("fs");
const stdinPath = "/dev/stdin";
const fileContent = fileSystemModule.readFileSync(stdinPath, "utf8");
executeProgram(fileContent);
