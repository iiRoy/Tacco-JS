function processInputData(rawData) {
    const dataLines = rawData.split("\n");
    let lineCursor = 0;

    // Generator function to provide lines sequentially
    function* lineStream() {
        while (lineCursor < dataLines.length) {
            yield dataLines[lineCursor++];
        }
    }

    const inputIterator = lineStream();

    while (true) {
        const currentCaseHeader = inputIterator.next().value;
        if (currentCaseHeader === undefined) {
            break; // End of input
        }

        const headerValues = currentCaseHeader.split(' ').map(Number);
        const participantCount = headerValues[0];
        const targetParticipantIndex = headerValues[1];
        const deductionPercentage = headerValues[2];

        if (participantCount === 0 && targetParticipantIndex === 0 && deductionPercentage === 0) {
            break; // Termination condition for the problem set
        }

        let accumulatedPoints = 0;
        let specificParticipantPoints = 0;

        // Collect all individual scores for the current case
        const participantScores = Array.from({ length: participantCount }, () => {
            const scoreLine = inputIterator.next().value;
            return Number(scoreLine);
        });

        // Process scores using a functional approach
        participantScores.reduce((_, currentScore, idx) => {
            accumulatedPoints += currentScore * 100;
            if (idx === targetParticipantIndex - 1) {
                specificParticipantPoints = currentScore;
            }
            return null; // Accumulator not used for return value, only for iteration side-effects
        }, null);

        const finalAdjustedPoints = accumulatedPoints * (100 - deductionPercentage) / 100;

        if (specificParticipantPoints > 0) {
            console.log(Math.floor(finalAdjustedPoints / specificParticipantPoints));
        } else {
            console.log("0");
        }
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
