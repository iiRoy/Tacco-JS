function readInputDataFromStdin() {
    return require("fs").readFileSync("/dev/stdin", "utf8");
}

function processInputData(rawDataString) {
    const allInputLines = rawDataString.split('\n');

    const firstLineTokens = allInputLines.shift().split(' ');
    const initialCardCount = Number(firstLineTokens[0]);
    const operationCount = Number(firstLineTokens[1]);

    let currentCardValues = allInputLines.shift().split(' ').map(Number);
    currentCardValues.sort((a, b) => a - b);

    if (allInputLines.length > 0 && allInputLines[allInputLines.length - 1] === '') {
        allInputLines.pop();
    }

    const modifierOperations = allInputLines.map(line => {
        const parts = line.split(' ');
        return {
            count: Number(parts[0]),
            value: Number(parts[1])
        };
    });

    modifierOperations.sort((opA, opB) => opB.value - opA.value);

    let cardValueIndex = 0;
    const totalCardsInDeck = currentCardValues.length;

    for (const currentOperation of modifierOperations) {
        let blocksToModify = currentOperation.count;
        const replacementCandidateValue = currentOperation.value;

        if (cardValueIndex >= totalCardsInDeck) {
            break;
        }

        while (blocksToModify > 0) {
            if (cardValueIndex >= totalCardsInDeck) {
                break;
            }

            const cardAtIndex = currentCardValues[cardValueIndex];

            if (cardAtIndex < replacementCandidateValue) {
                currentCardValues[cardValueIndex] = replacementCandidateValue;
            } else {
                break;
            }

            cardValueIndex++;
            blocksToModify--;
        }
    }

    let finalCalculatedSum = 0;
    for (const cardVal of currentCardValues) {
        finalCalculatedSum += cardVal;
    }

    console.log(finalCalculatedSum);
}

processInputData(readInputDataFromStdin());
