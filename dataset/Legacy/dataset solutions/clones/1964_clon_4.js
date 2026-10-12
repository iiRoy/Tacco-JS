function processInput(rawData) {
    const lineSegments = rawData.split('\n').filter(Boolean);
    
    const firstLineMatch = lineSegments[0].match(/\d+/);
    const thresholdVal = Number(firstLineMatch[0]);

    const sequenceSum = lineSegments[1].split(' ').reduce((accumulator, currentStr) => {
        return accumulator + Number(currentStr);
    }, 0);

    const finalOutcome = thresholdVal - sequenceSum;

    console.log(Math.max(finalOutcome, -1));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
