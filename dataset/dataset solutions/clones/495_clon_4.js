const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

function* generateLines(fullTextContent) {
    const contentSegments = fullTextContent.trim().split("\n");
    let currentSegmentCursor = 0;
    while (currentSegmentCursor < contentSegments.length) {
        yield contentSegments[currentSegmentCursor++];
    }
}

const computeExpectedValue = (lineStream) => {
    const collectedOutputs = [];
    while (true) {
        const firstConfigurationLine = lineStream.next().value;
        const scenarioParameters = firstConfigurationLine.split(" ").map(Number);

        if (scenarioParameters.every(val => val === 0)) {
            break;
        }

        const [availableMovesCount, finalDestinationTile, specialEventQuantity] = scenarioParameters;
        const movementChoices = lineStream.next().value.split(" ").map(Number);

        const specialOccurrencesMap = new Map(); // Map<tileIndex, {kind: number, value: number}>
        for (let eventIndex = 0; eventIndex < specialEventQuantity; ++eventIndex) {
            const eventDescriptionLine = lineStream.next().value.split(" ").map(Number);
            specialOccurrencesMap.set(eventDescriptionLine[0], { kind: eventDescriptionLine[1], value: eventDescriptionLine[2] });
        }

        let probabilityDistribution = new Map(); // Map<tileIndex, Map<cashAmount, probability>>
        probabilityDistribution.set(0, new Map([[0, 1.0]])); // Initial state: Tile 0, Cash 0, 100% probability

        for (let currentVisitedTile = 0; currentVisitedTile < finalDestinationTile; ++currentVisitedTile) {
            if (!probabilityDistribution.has(currentVisitedTile)) {
                continue; // No path leads to this tile with any probability, skip
            }

            const currentTileProbabilities = probabilityDistribution.get(currentVisitedTile);

            for (let [currentCashAmount, probabilityOfCurrentState] of currentTileProbabilities.entries()) {
                for (let movementDelta of movementChoices) {
                    let nextTentativeTile = Math.min(currentVisitedTile + movementDelta, finalDestinationTile);
                    let actualNextTile = nextTentativeTile;
                    let actualNextCash = currentCashAmount;

                    const activeEventDetails = specialOccurrencesMap.get(nextTentativeTile);
                    if (activeEventDetails) {
                        const { kind, value } = activeEventDetails;
                        switch (kind) {
                            case 1: // Tile relocation
                                actualNextTile = Math.min(nextTentativeTile + value, finalDestinationTile);
                                break;
                            case 2: // Cash increment
                                actualNextCash += value;
                                break;
                            case 3: // Cash decrement
                                actualNextCash = Math.max(0, actualNextCash - value);
                                break;
                        }
                    }

                    const probabilityContribution = probabilityOfCurrentState / availableMovesCount;

                    if (!probabilityDistribution.has(actualNextTile)) {
                        probabilityDistribution.set(actualNextTile, new Map());
                    }
                    const cashProbabilitiesAtNextTile = probabilityDistribution.get(actualNextTile);
                    cashProbabilitiesAtNextTile.set(actualNextCash, (cashProbabilitiesAtNextTile.get(actualNextCash) || 0) + probabilityContribution);
                }
            }
        }

        let totalExpectedCash = 0;
        const finalTileCashStates = probabilityDistribution.get(finalDestinationTile);
        if (finalTileCashStates) {
            for (let [cashValue, associatedProbability] of finalTileCashStates.entries()) {
                totalExpectedCash += cashValue * associatedProbability;
            }
        }
        collectedOutputs.push(Math.floor(totalExpectedCash));
    }
    return collectedOutputs;
};

const finalResults = computeExpectedValue(generateLines(sourceData));
finalResults.forEach(outcome => console.log(outcome));