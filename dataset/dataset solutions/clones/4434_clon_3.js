function processInputData(sourceString) {
    const totalStringLength = sourceString.length;

    const charactersToExclude = 2;
    const innerCharCount = totalStringLength - charactersToExclude;

    const initialChar = sourceString.substr(0, 1);

    const finalChar = sourceString.substr(totalStringLength - 1, 1);

    const outputValue = `${initialChar}${innerCharCount}${finalChar}`;

    console.log(outputValue);
}

const fileSystemUtility = require("fs");
const standardInputFile = "/dev/stdin";
const textEncoding = "utf8";

const rawContentFromInput = fileSystemUtility.readFileSync(standardInputFile, textEncoding);

processInputData(rawContentFromInput);
