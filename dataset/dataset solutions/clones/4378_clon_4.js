const fileSystemInterface = require("fs");

const computeAlternateSequence = (sourceLine, currentPosition) => {
    if (currentPosition >= sourceLine.length) {
        return "";
    }
    const currentChar = sourceLine[currentPosition];
    return currentChar + computeAlternateSequence(sourceLine, currentPosition + 2);
};

const processExternalData = (streamPayload) => {
    const initialSegment = streamPayload.split("\n")[0];
    return computeAlternateSequence(initialSegment, 0);
};

const outcome = processExternalData(fileSystemInterface.readFileSync("/dev/stdin", "utf-8"));
console.log(outcome);