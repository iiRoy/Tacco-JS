process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(allInput){
    const contentLines = allInput.trim().split("\n");
    let currentLineMarker = 0;

    const assessProgressionAnomaly = (figures) => {
        const countOfFigures = figures.length;
        
        // Handle cases where the sequence is too short for the pattern analysis.
        // Original code would error for countOfFigures < 2 due to accessing dataset[1].
        // Assuming valid inputs always have at least 2 elements for the main logic.
        // For countOfFigures < 2, the original code would not execute the core loop,
        // and its edx (0) would lead to printing figures[0] for n=1, or an error.
        // For n=2, original prints figures[0]. This path handles n=2 gracefully.
        if (countOfFigures < 2) {
            return figures[0]; 
        }

        const initialDelta = figures[1] - figures[0];

        const progressionState = {
            deltaVariations: 0,
            lastVariationPosition: 0,
            previousCalculatedDelta: initialDelta,
            potentialOutput: figures[0]
        };

        const analyzeSlice = (position, currentProgressionState) => {
            if (position >= countOfFigures) {
                return currentProgressionState.potentialOutput;
            }

            const currentFigure = figures[position];
            const priorFigure = figures[position - 1];
            const currentCalculatedDelta = currentFigure - priorFigure;

            let nextDeltaVariations = currentProgressionState.deltaVariations;
            let nextLastVariationPosition = currentProgressionState.lastVariationPosition;
            let nextPotentialOutput = currentProgressionState.potentialOutput;

            if (currentCalculatedDelta !== currentProgressionState.previousCalculatedDelta) {
                nextLastVariationPosition = position;
                nextDeltaVariations++;
            }

            // Check termination conditions
            if (nextDeltaVariations === 3) {
                return figures[nextLastVariationPosition - 2];
            } else if (nextDeltaVariations === 1 && position - nextLastVariationPosition > 1) {
                return figures[nextLastVariationPosition - 2];
            }

            // Update potential output for the final fallback if no early return
            nextPotentialOutput = figures[nextLastVariationPosition];

            return analyzeSlice(position + 1, {
                deltaVariations: nextDeltaVariations,
                lastVariationPosition: nextLastVariationPosition,
                previousCalculatedDelta: currentCalculatedDelta,
                potentialOutput: nextPotentialOutput
            });
        };

        // Start analysis from the third element (index 2), mirroring original `ii=2` loop start
        return analyzeSlice(2, progressionState);
    };

    while (currentLineMarker < contentLines.length) {
        const itemQuantity = Number(contentLines[currentLineMarker++]);
        if (itemQuantity === 0) break;

        const figureStrings = contentLines[currentLineMarker++].trim().split(" ");
        const numericFigures = figureStrings.map(Number);

        const outcome = assessProgressionAnomaly(numericFigures);
        console.log(outcome);
    }
});