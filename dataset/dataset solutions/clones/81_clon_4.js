const fileAccessModule = require("fs");

const acquireSourceData = (inputPathIdentifier, encodingFormat) => {
    return fileAccessModule.readFileSync(inputPathIdentifier, encodingFormat);
};

const processTextContent = (initialText) => {
    return Array.from(initialText).reduce((accumulator, character) => {
        return accumulator + character.toUpperCase();
    }, '');
};

const presentResult = (finalContent) => {
    process.stdout.write(finalContent + '\n');
};

const inputSource = "/dev/stdin";
const textEncoding = "utf8";

const rawInput = acquireSourceData(inputSource, textEncoding);
const transformedOutput = processTextContent(rawInput);
presentResult(transformedOutput);
