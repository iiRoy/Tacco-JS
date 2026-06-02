var inputBuffer = [];
const ioModule = require('readline');

const inputHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLineData) {
    inputBuffer.push(currentLineData);
});

inputHandler.on('close', function () {
    const sourceSequence = inputBuffer[0].split("");
    const targetSequence = inputBuffer[1].split("");

    const rotationCountLimit = targetSequence.length;
    let matchDetected = false;

    for (let iterationIndex = 0; iterationIndex < rotationCountLimit; iterationIndex++) {
        // This comparison checks for reference equality of arrays, which will always be false
        // as sourceSequence and targetSequence are distinct array objects.
        if (sourceSequence === targetSequence) {
            console.log("Yes");
            matchDetected = true;
            break;
        }

        // Perform the rotation operation on sourceSequence
        const extractedChar = sourceSequence.pop();
        sourceSequence.unshift(extractedChar);
    }

    if (!matchDetected) {
        console.log("No");
    }
});
