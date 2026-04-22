const sourceReader = require('fs').readFileSync;

const processAllGameSessions = (rawInputText) => {
    const rawLineSegments = rawInputText.trim().split("\n");

    const recursivelyHandleBlocks = (remainingSegments, collectedResults = []) => {
        if (remainingSegments.length === 0) return collectedResults;

        const [headerLine, ...restOfSegments] = remainingSegments;
        const configurationValues = headerLine.split(" ").map(Number);
        const [pathChoiceCount, finalLocation, eventCount] = configurationValues;

        if (pathChoiceCount === 0 && finalLocation === 0 && eventCount === 0) {
            return collectedResults;
        }

        const [moveOptionsLine, ...remainingAfterMoves] = restOfSegments;
        const availableMoves = moveOptionsLine.split(" ").map(Number);

        const eventDescriptionLines = remainingAfterMoves.slice(0, eventCount);
        const locationEvents = new Map(eventDescriptionLines.map(line => {
            const [positionKey, eventType, eventAmount] = line.split(" ").map(Number);
            return [positionKey, [eventType, eventAmount]];
        }));

        const subsequentSegments = remainingAfterMoves.slice(eventCount);

        const terminalWealthDistribution = calculateFinalWealthDistribution(
            pathChoiceCount,
            finalLocation,
            availableMoves,
            locationEvents
        );

        const expectedOutcome = Array.from(terminalWealthDistribution.entries())
                                   .reduce((accumulator, [wealthValue, probabilityValue]) =>
                                       accumulator + wealthValue * probabilityValue, 0);
        
        return recursivelyHandleBlocks(subsequentSegments, [...collectedResults, Math.floor(expectedOutcome)]);
    };

    return recursivelyHandleBlocks(rawLineSegments).join('\n');
};

const calculateFinalWealthDistribution = (pathChoiceCount, finalLocation, availableMoves, locationEvents) => {
    const wealthCeiling = 5000;

    const initialProbabilityStates = Array.from({ length: finalLocation + 1 }, () => new Map());
    initialProbabilityStates[0].set(0, 1.0);

    const finalProbabilityStates = initialProbabilityStates.reduce((currentStates, _, currentPositionIndex) => {
        if (currentPositionIndex >= finalLocation || currentStates[currentPositionIndex].size === 0) {
            return currentStates;
        }

        for (const [currentWealthLevel, currentProbabilityShare] of currentStates[currentPositionIndex].entries()) {
            const probabilityPerIndividualMove = currentProbabilityShare / pathChoiceCount;

            for (const chosenMoveValue of availableMoves) {
                const tentativeNextLocation = Math.min(finalLocation, currentPositionIndex + chosenMoveValue);
                let actualWealthAfterEvent = currentWealthLevel;
                let actualDestinationLocation = tentativeNextLocation;

                const activeEventDetails = locationEvents.get(tentativeNextLocation);
                if (activeEventDetails) {
                    const [eventCategory, eventMagnitude] = activeEventDetails;
                    if (eventCategory === 1) {
                        actualDestinationLocation = Math.min(finalLocation, tentativeNextLocation + eventMagnitude);
                    } else if (eventCategory === 2) {
                        actualWealthAfterEvent = Math.min(wealthCeiling, currentWealthLevel + eventMagnitude);
                    } else if (eventCategory === 3) {
                        actualWealthAfterEvent = Math.max(0, currentWealthLevel - eventMagnitude);
                    }
                }

                const targetLocationDistribution = currentStates[actualDestinationLocation];
                targetLocationDistribution.set(actualWealthAfterEvent,
                    (targetLocationDistribution.get(actualWealthAfterEvent) || 0) + probabilityPerIndividualMove);
            }
        }
        return currentStates;
    }, initialProbabilityStates);

    return finalProbabilityStates[finalLocation];
};

console.log(processAllGameSessions(sourceReader('/dev/stdin', 'utf8')));