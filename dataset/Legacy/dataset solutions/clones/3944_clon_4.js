function processInputData(rawData) {
    const allLines = rawData.split('\n');

    const participantCount = parseInt(allLines[0], 10);
    const [durationValue, initialScore] = allLines[1].split(' ').map(val => parseInt(val, 10));

    const divisorValues = Array.from({ length: participantCount }, (_, index) => {
        const lineIdentifier = index + 2;
        return parseInt(allLines[lineIdentifier], 10);
    });

    const finalScore = divisorValues.reduce((currentAccumulation, currentDivisor) => {
        return currentAccumulation + Math.ceil(durationValue / currentDivisor);
    }, initialScore);

    console.log(finalScore);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
