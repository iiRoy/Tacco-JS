const fileSystemModule = require("fs");

const inputSourcePath = "/dev/stdin";
const fileEncoding = "utf8";

const rawFileContents = fileSystemModule.readFileSync(inputSourcePath, fileEncoding);

const lineDelimiter = '\n';
const contentLinesArray = rawFileContents.split(lineDelimiter);

const primaryDivisor = 98;
const constantOffset = 2;

function processAndOutputLine(singleLineText) {
    // The original code checks for truthiness of the line (i.e., not an empty string).
    if (singleLineText) {
        // Convert the string to a number. If it's not a valid number, it becomes NaN.
        const numericValue = Number(singleLineText);
        
        // Perform the core calculation: i*i/98+2
        // If numericValue is NaN, all intermediate results will be NaN.
        const squaredTerm = numericValue * numericValue;
        const divisionResult = squaredTerm / primaryDivisor;
        const sumResult = divisionResult + constantOffset;
        
        // The original code uses '~~' for truncation. This operator specifically
        // converts NaN to 0, which is a crucial behavioral detail to preserve.
        // Math.trunc(NaN) would yield NaN, which is different.
        const finalIntegerOutput = ~~sumResult;
        
        console.log(finalIntegerOutput);
    }
    // If singleLineText is falsy (e.g., an empty string), the original code does nothing (0).
    // This function also does nothing in that case, preserving behavior.
}

// The original code used .map() but discarded the returned array, relying solely on side effects.
// Using .forEach() is a semantically equivalent and clearer way to iterate for side effects.
contentLinesArray.forEach(processAndOutputLine);
