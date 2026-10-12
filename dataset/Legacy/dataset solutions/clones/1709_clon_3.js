const parseInteger = (str) => parseInt(str, 10);
const parseIntegerArray = (arr) => arr.map(parseInteger);

function processContestData(rawData) {
    const lines = rawData.split('\n');
    const parsedLines = lines.map(line => parseIntegerArray(line.split(' ')));

    const totalDays = parsedLines[0][0];
    const costFactors = parsedLines[1];
    const satisfactionScores = parsedLines.slice(2);

    const chosenTypesPerDay = [];
    const lastOccurrenceDay = new Array(26).fill(-1);

    const calculateDaySatisfaction = (currentDayIndex, chosenTypeIdentifier, lastOccurrenceDayState) => {
        const actualTypeIndex = chosenTypeIdentifier - 1;
        let totalDailyScore = satisfactionScores[currentDayIndex][actualTypeIndex];

        for (let typeIdx = 0; typeIdx < 26; typeIdx++) {
            if (typeIdx !== actualTypeIndex) {
                const lastOccurredDayForType = lastOccurrenceDayState[typeIdx];
                const elapsedDays = currentDayIndex - lastOccurredDayForType;
                totalDailyScore -= costFactors[typeIdx] * elapsedDays;
            }
        }
        return totalDailyScore;
    };

    const findBestBlockChoice = (candidates) => {
        let maxScore = -Infinity;
        let bestChoice = null;
        for (const candidate of candidates) {
            const currentScore = candidate[3];
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestChoice = candidate;
            }
        }
        return bestChoice;
    };

    const findBestSingleDayType = (dailyScores) => {
        let maxScore = -Infinity;
        let bestTypeIndex = -1;
        for (let typeIdx = 0; typeIdx < dailyScores.length; typeIdx++) {
            const currentScore = dailyScores[typeIdx];
            if (currentScore > maxScore) {
                maxScore = currentScore;
                bestTypeIndex = typeIdx;
            }
        }
        return bestTypeIndex;
    };

    const threeDayBlocksCount = Math.floor(totalDays / 3);
    const remainingDaysStart = threeDayBlocksCount * 3;

    for (let blockIdx = 0; blockIdx < threeDayBlocksCount; blockIdx++) {
        const blockScoresCandidates = [];
        const currentBlockStartDay = blockIdx * 3;

        let currentBlockTempLastOccurrence;
        let currentBlockAccumulatedScore;

        for (let typeChoice0 = 0; typeChoice0 < 26; typeChoice0++) {
            currentBlockTempLastOccurrence = lastOccurrenceDay.slice();
            currentBlockAccumulatedScore = 0;

            currentBlockTempLastOccurrence[typeChoice0] = currentBlockStartDay;
            currentBlockAccumulatedScore += calculateDaySatisfaction(currentBlockStartDay, typeChoice0 + 1, currentBlockTempLastOccurrence);

            for (let typeChoice1 = 0; typeChoice1 < 26; typeChoice1++) {
                currentBlockTempLastOccurrence[typeChoice1] = currentBlockStartDay + 1;
                currentBlockAccumulatedScore += calculateDaySatisfaction(currentBlockStartDay + 1, typeChoice1 + 1, currentBlockTempLastOccurrence);

                for (let typeChoice2 = 0; typeChoice2 < 26; typeChoice2++) {
                    currentBlockTempLastOccurrence[typeChoice2] = currentBlockStartDay + 2;
                    currentBlockAccumulatedScore += calculateDaySatisfaction(currentBlockStartDay + 2, typeChoice2 + 1, currentBlockTempLastOccurrence);

                    blockScoresCandidates.push([typeChoice0, typeChoice1, typeChoice2, currentBlockAccumulatedScore]);
                }
            }
        }

        const bestBlockChoice = findBestBlockChoice(blockScoresCandidates);

        chosenTypesPerDay.push(bestBlockChoice[0] + 1, bestBlockChoice[1] + 1, bestBlockChoice[2] + 1);
        lastOccurrenceDay[bestBlockChoice[0]] = currentBlockStartDay;
        lastOccurrenceDay[bestBlockChoice[1]] = currentBlockStartDay + 1;
        lastOccurrenceDay[bestBlockChoice[2]] = currentBlockStartDay + 2;
    }

    for (let currentDayIndex = remainingDaysStart; currentDayIndex < totalDays; currentDayIndex++) {
        const dailyScoresForCurrentDay = new Array(26);

        for (let singleDayTypeChoice = 0; singleDayTypeChoice < 26; singleDayTypeChoice++) {
            dailyScoresForCurrentDay[singleDayTypeChoice] = calculateDaySatisfaction(currentDayIndex, singleDayTypeChoice + 1, lastOccurrenceDay);
        }

        const bestTypeForDay = findBestSingleDayType(dailyScoresForCurrentDay);
        chosenTypesPerDay.push(bestTypeForDay + 1);
        lastOccurrenceDay[bestTypeForDay] = currentDayIndex;
    }

    console.log(chosenTypesPerDay.join('\n'));
}

processContestData(require("fs").readFileSync("/dev/stdin", "utf8"));
