const evaluateStringContent = (inputPayload) => {
    const characterArray = Array.from(inputPayload);
    const detectionResult = characterArray.reduce((foundStatus, currentElement, elementIndex, entireSequence) => {
        if (foundStatus) {
            return true;
        }
        if (currentElement === 'h' && entireSequence[elementIndex + 1] === 'i') {
            return true;
        }
        return false;
    }, false);

    return detectionResult ? 'Yes' : 'No';
};

process.stdout.write(evaluateStringContent(require("fs").readFileSync("/dev/stdin", "utf8")));
