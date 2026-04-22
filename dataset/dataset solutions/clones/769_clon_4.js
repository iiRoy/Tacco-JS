(function(inputBlob) {
    const conductQuest = (sourceContent) => {
        const contentLines = sourceContent.trim().split('\n');

        const directionalChanges = new Map([
            ['N', [0, 1]],
            ['S', [0, -1]],
            ['E', [1, 0]],
            ['W', [-1, 0]]
        ]);

        const extractCases = (remainingLines, accumulator = []) => {
            if (remainingLines.length === 0) {
                return accumulator;
            }

            const [firstLine, ...restOfLines] = remainingLines;
            const gemAmount = Number(firstLine);

            if (gemAmount === 0) {
                return accumulator;
            }

            const initialGems = new Set(restOfLines.slice(0, gemAmount).map(l => l.trim()));
            const linesAfterGems = restOfLines.slice(gemAmount);

            const movementAmount = Number(linesAfterGems[0]);
            const linesAfterMoveAmount = linesAfterGems.slice(1);

            const moves = linesAfterMoveAmount.slice(0, movementAmount).map(moveLine => {
                const [directionSymbol, quantity] = moveLine.trim().split(' ');
                return { symbol: directionSymbol, quantity: Number(quantity) };
            });

            const linesAfterMoves = linesAfterMoveAmount.slice(movementAmount);

            return extractCases(
                linesAfterMoves,
                [...accumulator, { treasureSet: initialGems, journeyPlan: moves, expectedMatch: movementAmount }]
            );
        };

        const parsedCases = extractCases(contentLines);

        const evaluateJourney = (caseData) => {
            const initialPoint = { horizontal: 10, vertical: 10 };

            const finalState = caseData.journeyPlan.reduce((currentStatus, currentInstruction) => {
                const { horizontal, vertical } = currentStatus.position;
                const currentTreasures = currentStatus.foundItems;

                const vectorChange = directionalChanges.get(currentInstruction.symbol);
                let tempHorizontal = horizontal;
                let tempVertical = vertical;

                const stepResult = Array.from({ length: currentInstruction.quantity }).reduce((stepState, _, __) => {
                    tempHorizontal += vectorChange[0];
                    tempVertical += vectorChange[1];
                    const currentSpotKey = `${tempHorizontal} ${tempVertical}`;

                    if (caseData.treasureSet.has(currentSpotKey)) {
                        stepState.add(currentSpotKey);
                    }
                    return stepState;
                }, new Set(currentTreasures)); 

                return {
                    position: { horizontal: tempHorizontal, vertical: tempVertical },
                    foundItems: stepResult
                };
            }, { position: initialPoint, foundItems: new Set() });

            return finalState.foundItems.size === caseData.expectedMatch ? 'Yes' : 'No';
        };

        const allResults = parsedCases.map(evaluateJourney);

        return allResults.join('\n');
    };

    console.log(conductQuest(inputBlob));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));