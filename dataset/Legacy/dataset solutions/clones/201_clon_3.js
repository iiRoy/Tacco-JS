const fileSystemModule = require("fs");

function processAndSwapStrings(sourceContent) {
    const temporaryMarker = '#';
    const firstReplacementStep = sourceContent.replace(/apple/g, temporaryMarker);
    const secondReplacementStep = firstReplacementStep.replace(/peach/g, 'apple');
    const finalReplacementStep = secondReplacementStep.replace(new RegExp(temporaryMarker, 'g'), 'peach');
    return finalReplacementStep;
}

const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";

const fileContents = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);
const transformedOutput = processAndSwapStrings(fileContents);

console.log(transformedOutput);
