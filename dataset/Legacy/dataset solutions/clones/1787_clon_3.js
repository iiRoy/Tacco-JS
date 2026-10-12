function processData(sourceData) {
    const characterArray = sourceData.split("");

    const firstChar = characterArray[0];
    const secondChar = characterArray[1];
    const thirdChar = characterArray[2];

    const outputSegment = firstChar + secondChar + thirdChar;

    console.log(outputSegment);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingOption = "utf8";

const rawContent = fileSystemModule.readFileSync(standardInputPath, encodingOption);

processData(rawContent);
