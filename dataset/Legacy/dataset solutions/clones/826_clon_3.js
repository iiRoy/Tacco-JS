const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const trimmedInputContent = rawInputData.trim();
let inputLineSegments = trimmedInputContent.split("\n");

function calculateEntryScore(
    entryLabel,
    paramP,
    paramA,
    paramB,
    paramC,
    paramD,
    paramE,
    paramF,
    paramS,
    paramM
) {
    const calculationDuration = paramA + paramB + paramC + ((paramD + paramE) * paramM);
    const calculationProfit = (paramF * paramS * paramM) - paramP;
    return [entryLabel, calculationProfit / calculationDuration];
}

while (true) {
    const currentNValue = Number(inputLineSegments.shift());
    if (currentNValue === 0) {
        break;
    }

    let collectedResults = [];

    for (let entryIndex = 0; entryIndex < currentNValue; entryIndex++) {
        const currentDataLine = inputLineSegments.shift();
        let lineParts = currentDataLine.split(" ");

        const extractedLabel = lineParts.shift();
        const numericValues = lineParts.map(Number);

        const functionArguments = [extractedLabel, ...numericValues];

        collectedResults.push(calculateEntryScore.apply(null, functionArguments));
    }

    collectedResults.sort((itemA, itemB) => {
        if (itemA[1] === itemB[1]) {
            return itemA[0] > itemB[0] ? 1 : -1;
        } else {
            return itemB[1] - itemA[1];
        }
    });

    collectedResults.forEach(resultItem => {
        console.log(resultItem[0]);
    });
    console.log("#");
}
