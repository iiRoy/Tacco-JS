var parseInteger = (inputString) => parseInt(inputString, 0xA);
var parseIntegerArray = (stringArray) => stringArray.map(element => parseInteger(element));
var absoluteValue = (numericValue) => numericValue > 0 ? numericValue : -numericValue;

function findMinimum() {
    var argumentList = arguments,
        currentMin = argumentList[0];
    for (var k = 1; k < argumentList.length; k++) {
        if (argumentList[k] < currentMin) {
            currentMin = argumentList[k];
        }
    }
    return currentMin;
}

function findMaximum() {
    var argumentList = arguments,
        currentMax = argumentList[0];
    for (var k = 1; k < argumentList.length; k++) {
        if (argumentList[k] > currentMax) {
            currentMax = argumentList[k];
        }
    }
    return currentMax;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessInput(rawData) {
    let processedLines = rawData.split('\n');
    processedLines = processedLines.map(lineContent => parseIntegerArray(lineContent.split(' ')));

    const numDays = processedLines[0][0];
    const costFactors = processedLines[1];
    const satisfactionScores = processedLines.slice(0x2);

    let totalScore = 0x0;
    const resultChoices = [];
    let currentType;

    const lastOccurrenceDay = new Array(0x1A);
    lastOccurrenceDay.fill(-1);

    function calculateSatisfaction(currentDay, selectedType, previousOccurrences) {
        let currentSatisfaction = 0x0;
        currentSatisfaction += satisfactionScores[currentDay][selectedType - 1];
        for (let typeIndex = 0x0; typeIndex < 0x1A; typeIndex++) {
            if (typeIndex !== selectedType - 1) {
                currentSatisfaction -= costFactors[typeIndex] * (currentDay - previousOccurrences[typeIndex]);
            }
        }
        return currentSatisfaction;
    }

    const numBlocksOfThree = Math.floor(numDays / 0x3);
    const remainingDays = numDays - numBlocksOfThree * 0x3;

    let blockScores;
    let temporaryLastOccurrences;
    let cumulativeBlockScore;

    for (let blockIndex = 0x0; blockIndex < numBlocksOfThree; blockIndex++) {
        blockScores = [];

        for (let choice0 = 0x0; choice0 < 0x1A; choice0++) {
            temporaryLastOccurrences = lastOccurrenceDay.concat();
            cumulativeBlockScore = 0x0;

            temporaryLastOccurrences[choice0] = blockIndex * 0x3;
            cumulativeBlockScore += calculateSatisfaction(blockIndex * 0x3, choice0 + 1, temporaryLastOccurrences);

            for (let choice1 = 0x0; choice1 < 0x1A; choice1++) {
                temporaryLastOccurrences[choice1] = blockIndex * 0x3 + 1;
                cumulativeBlockScore += calculateSatisfaction(blockIndex * 0x3 + 1, choice1 + 1, temporaryLastOccurrences);

                for (let choice2 = 0x0; choice2 < 0x1A; choice2++) {
                    temporaryLastOccurrences[choice2] = blockIndex * 0x3 + 2;
                    cumulativeBlockScore += calculateSatisfaction(blockIndex * 0x3 + 2, choice2 + 1, temporaryLastOccurrences);
                    blockScores.push([choice0, choice1, choice2, cumulativeBlockScore]);
                }
            }
        }

        const scoresOnly = blockScores.map(entry => entry[0x3]);
        const maxScoreInBlock = Math.max(...scoresOnly);
        const bestBlockIndex = scoresOnly.indexOf(maxScoreInBlock);
        const bestBlockCombination = blockScores[bestBlockIndex];

        resultChoices.push(bestBlockCombination[0x0] + 1, bestBlockCombination[0x1] + 1, bestBlockCombination[0x2] + 1);
        lastOccurrenceDay[bestBlockCombination[0x0]] = blockIndex * 0x3;
        lastOccurrenceDay[bestBlockCombination[0x1]] = blockIndex * 0x3 + 1;
        lastOccurrenceDay[bestBlockCombination[0x2]] = blockIndex * 0x3 + 2;
    }

    for (let singleDayIndex = numBlocksOfThree * 0x3; singleDayIndex < numDays; singleDayIndex++) {
        blockScores = [];

        for (let optionIndex = 0x0; optionIndex < 0x1A; optionIndex++) {
            blockScores[optionIndex] = calculateSatisfaction(singleDayIndex, optionIndex + 1, lastOccurrenceDay);
        }

        const maxScoreForDay = Math.max(...blockScores);
        const bestOptionIndex = blockScores.indexOf(maxScoreForDay);
        resultChoices.push(bestOptionIndex + 1);
        lastOccurrenceDay[bestOptionIndex] = singleDayIndex;
    }

    console.log(resultChoices.join('\n'));
}
