function processInputData(receivedContent) {
    const fixedPrefix = "ABC";
    const finalOutputString = fixedPrefix + receivedContent;
    console.log(finalOutputString);
}

const fsModule = require("fs");
const inputFilePath = "/dev/stdin";
const encodingType = "utf8";

const fileContent = fsModule.readFileSync(inputFilePath, encodingType);

processInputData(fileContent);
