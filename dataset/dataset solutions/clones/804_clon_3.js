function processInput(rawData) {
    const lines = rawData.split("\n");
    let currentLinePointer = 0;

    const parseInteger = (str) => parseInt(str, 10);

    const retrieveAndAdvanceLine = () => {
        const value = lines[currentLinePointer];
        currentLinePointer++;
        return value;
    };

    while (true) {
        const currentBlockHeader = retrieveAndAdvanceLine().split(' ');

        const numberOfParticipants = parseInteger(currentBlockHeader[0]);
        const designatedWinnerPosition = parseInteger(currentBlockHeader[1]);
        const managementFeePercentage = parseInteger(currentBlockHeader[2]);

        if (numberOfParticipants === 0 && designatedWinnerPosition === 0 && managementFeePercentage === 0) {
            break;
        }

        let totalAccumulatedScoreValue = 0;
        let winnerParticipantScore;

        for (let participantIndex = 0; participantIndex < numberOfParticipants; participantIndex++) {
            const currentParticipantScore = parseInteger(retrieveAndAdvanceLine());
            totalAccumulatedScoreValue += currentParticipantScore * 100;
            if (designatedWinnerPosition - 1 === participantIndex) {
                winnerParticipantScore = currentParticipantScore;
            }
        }

        const netPercentageFactor = 100 - managementFeePercentage;
        let finalPrizePoolAmount = (totalAccumulatedScoreValue * netPercentageFactor) / 100;

        const outputCalculatedResult = (poolValue, winnerValue) => {
            if (winnerValue > 0) {
                console.log(Math.floor(poolValue / winnerValue));
            } else {
                console.log("0");
            }
        };

        outputCalculatedResult(finalPrizePoolAmount, winnerParticipantScore);
    }
}

const getStandardInputContent = () => {
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

processInput(getStandardInputContent());
