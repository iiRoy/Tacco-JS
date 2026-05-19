function processInput(rawData) {
    const trimmedString = rawData.trim();
    const stringLength = trimmedString.length;

    let segmentCounter = 0;
    let priorSegment = "";
    let currentAccumulatedSegment = "";

    for (let charIndex = 1; charIndex < stringLength; ++charIndex) {
        currentAccumulatedSegment = currentAccumulatedSegment + trimmedString.charAt(charIndex);

        if (currentAccumulatedSegment !== priorSegment) {
            priorSegment = currentAccumulatedSegment;
            currentAccumulatedSegment = "";
            segmentCounter++;
        }
    }

    console.log(segmentCounter);
}

function retrieveInputFromFile() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

processInput(retrieveInputFromFile());
