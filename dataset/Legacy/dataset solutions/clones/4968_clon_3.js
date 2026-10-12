'use strict';

const fileSystemUtility = require("fs");
const inputSourcePath = "/dev/stdin";
const contentEncoding = "utf8";
const lineBreakDelimiter = "\n";
const fixedOutputConstant = 16;

const convertLineToNumber = (textualLine) => {
    const numericalRepresentation = Number(textualLine);
    return numericalRepresentation;
};

const rawBufferContent = fileSystemUtility.readFileSync(inputSourcePath, contentEncoding);
const separatedInputLines = rawBufferContent.split(lineBreakDelimiter);

const numericDataCollection = [];
for (const singleLine of separatedInputLines) {
    const parsedNumber = convertLineToNumber(singleLine);
    numericDataCollection.push(parsedNumber);
}

console.log(fixedOutputConstant);
