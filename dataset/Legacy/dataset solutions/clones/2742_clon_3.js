function processInputData(rawDataContent) {
    const inputLines = rawDataContent.split("\n");
    const totalItemCount = parseInt(inputLines[0]);
    const itemNumericValues = inputLines.slice(1).map(strVal => parseInt(strVal));

    const pileMap = {};
    let highestPileIdUsed = 0;

    pileMap[highestPileIdUsed] = itemNumericValues[0];

    const findOptimalPileForValue = (valueToPlace, currentMaxId, existingPiles) => {
        let chosenPileIndex = null;
        let bestMatchValueInPile = -Infinity;

        for (let pileIdx = 0; pileIdx <= currentMaxId; pileIdx++) {
            const pileTopValue = existingPiles[pileIdx];
            if (pileTopValue < valueToPlace) {
                if (chosenPileIndex === null || pileTopValue > bestMatchValueInPile) {
                    chosenPileIndex = pileIdx;
                    bestMatchValueInPile = pileTopValue;
                }
            }
        }
        return chosenPileIndex;
    };

    for (let itemIdx = 1; itemIdx < totalItemCount; itemIdx++) {
        const currentItemValue = itemNumericValues[itemIdx];
        const targetPileIdentifier = findOptimalPileForValue(currentItemValue, highestPileIdUsed, pileMap);

        if (targetPileIdentifier === null) {
            highestPileIdUsed++;
            pileMap[highestPileIdUsed] = currentItemValue;
        } else {
            pileMap[targetPileIdentifier] = currentItemValue;
        }
    }

    console.log(highestPileIdUsed + 1);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
