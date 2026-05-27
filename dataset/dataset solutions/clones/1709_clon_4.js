const parseInteger = val => parseInt(val, 10);
const parseIntegerArray = stringArray => stringArray.map(parseInteger);

MainProcess(require("fs").readFileSync("/dev/stdin", "utf8"));

function MainProcess(inputContent) {
    const lines = inputContent.split('\n');
    const parsedLines = lines.map(line => parseIntegerArray(line.split(' ')));

    const totalDays = parsedLines[0][0];
    const displeasureCoefficients = parsedLines[1];
    const satisfactionScores = parsedLines.slice(2);

    let chosenTypes = [];
    let lastChosenDay = Array(26).fill(-1);

    const calculateSatisfactionChange = (currentDay, chosenTypeOneIndexed, lastChosenDayState, satisfactionMatrix, coefficients) => {
        let scoreChange = 0;
        const chosenTypeZeroIndexed = chosenTypeOneIndexed - 1;
        scoreChange += satisfactionMatrix[currentDay][chosenTypeZeroIndexed];
        for (let typeIndex = 0; typeIndex < 26; typeIndex++) {
            if (typeIndex !== chosenTypeZeroIndexed) {
                scoreChange -= coefficients[typeIndex] * (currentDay - lastChosenDayState[typeIndex]);
            }
        }
        return scoreChange;
    };

    const calculateThreeDayBlockScore = (blockStartDay, typeChoice0, typeChoice1, typeChoice2, currentLastChosenDayState, satisfactionMatrix, coefficients) => {
        let simulatedLastChosenDay = currentLastChosenDayState.slice();
        let cumulativeBlockScore = 0;

        simulatedLastChosenDay[typeChoice0] = blockStartDay;
        cumulativeBlockScore += calculateSatisfactionChange(blockStartDay, typeChoice0 + 1, simulatedLastChosenDay, satisfactionMatrix, coefficients);

        simulatedLastChosenDay[typeChoice1] = blockStartDay + 1;
        cumulativeBlockScore += calculateSatisfactionChange(blockStartDay + 1, typeChoice1 + 1, simulatedLastChosenDay, satisfactionMatrix, coefficients);

        simulatedLastChosenDay[typeChoice2] = blockStartDay + 2;
        cumulativeBlockScore += calculateSatisfactionChange(blockStartDay + 2, typeChoice2 + 1, simulatedLastChosenDay, satisfactionMatrix, coefficients);

        return { score: cumulativeBlockScore, finalLastDayState: simulatedLastChosenDay };
    };

    const threeDayBlocks = Math.floor(totalDays / 3);
    const typeIndices = Array.from({ length: 26 }, (_, i) => i);

    for (let blockIndex = 0; blockIndex < threeDayBlocks; blockIndex++) {
        const currentBlockStartDay = blockIndex * 3;

        const allTypeTriplets = typeIndices.flatMap(t0 =>
            typeIndices.flatMap(t1 =>
                typeIndices.map(t2 => [t0, t1, t2])
            )
        );

        const scoredTriplets = allTypeTriplets.map(triplet => {
            const [t0, t1, t2] = triplet;
            const result = calculateThreeDayBlockScore(
                currentBlockStartDay, t0, t1, t2,
                lastChosenDay, satisfactionScores, displeasureCoefficients
            );
            return { choices: triplet, score: result.score, finalLastDay: result.finalLastDayState };
        });

        const bestScoredTriplet = scoredTriplets.reduce((best, current) =>
            (current.score > best.score ? current : best), { score: -Infinity, choices: [-1, -1, -1], finalLastDay: [] }
        );

        chosenTypes.push(bestScoredTriplet.choices[0] + 1, bestScoredTriplet.choices[1] + 1, bestScoredTriplet.choices[2] + 1);
        lastChosenDay = bestScoredTriplet.finalLastDay;
    }

    for (let currentDay = threeDayBlocks * 3; currentDay < totalDays; currentDay++) {
        const dayChoices = Array.from({ length: 26 }, (_, typeIndex) => ({
            type: typeIndex,
            score: calculateSatisfactionChange(currentDay, typeIndex + 1, lastChosenDay, satisfactionScores, displeasureCoefficients)
        }));

        const bestDayChoice = dayChoices.reduce((best, current) =>
            (current.score > best.score ? current : best), { score: -Infinity, type: -1 }
        );

        chosenTypes.push(bestDayChoice.type + 1);
        lastChosenDay[bestDayChoice.type] = currentDay;
    }

    console.log(chosenTypes.join('\n'));
}
