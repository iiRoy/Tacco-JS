function processSequence(rawData) {
    const parsedLines = rawData.split("\n");
    const sequenceLength = parseInt(parsedLines[0], 10);
    const heightValues = parsedLines[1].split(" ").map(Number);

    if (sequenceLength <= 1) {
        console.log('Yes');
        return;
    }

    const evaluationResult = heightValues.slice(0, sequenceLength - 1).reduceRight(
        (currentStatus, leftElementCandidate) => {
            if (!currentStatus.isFeasible) {
                return currentStatus;
            }

            const rightAdjacentValue = currentStatus.previousAdjustedValue;
            let processedLeftElement = leftElementCandidate;

            if (processedLeftElement - rightAdjacentValue > 1) {
                return { isFeasible: false, previousAdjustedValue: rightAdjacentValue };
            } else if (processedLeftElement - rightAdjacentValue === 1) {
                processedLeftElement -= 1;
            }

            return { isFeasible: true, previousAdjustedValue: processedLeftElement };
        },
        { isFeasible: true, previousAdjustedValue: heightValues[sequenceLength - 1] }
    );

    console.log(evaluationResult.isFeasible ? 'Yes' : 'No');
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
