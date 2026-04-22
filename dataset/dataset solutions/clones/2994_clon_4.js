function processJourney(rawData) {
    const numericInputs = rawData.slice(0, 5).map(Number);
    const worldHeight = numericInputs[0];
    const worldWidth = numericInputs[1];
    const travelSteps = numericInputs[2];
    const startRow = numericInputs[3];
    const startColumn = numericInputs[4];

    const participantActions = rawData[5];
    const environmentalRestrictions = rawData[6];

    const initialLimits = {
        colMinimum: startColumn,
        colMaximum: startColumn,
        rowMinimum: startRow,
        rowMaximum: startRow,
        adventureStatus: "ACTIVE"
    };

    const actionTransformers = {
        'L': (currentBounds) => ({ ...currentBounds, colMinimum: currentBounds.colMinimum - 1 }),
        'R': (currentBounds) => ({ ...currentBounds, colMaximum: currentBounds.colMaximum + 1 }),
        'U': (currentBounds) => ({ ...currentBounds, rowMinimum: currentBounds.rowMinimum - 1 }),
        'D': (currentBounds) => ({ ...currentBounds, rowMaximum: currentBounds.rowMaximum + 1 })
    };

    const restrictionAppliers = {
        'L': (currentBounds, dimensions) => ({ ...currentBounds, colMaximum: Math.max(1, currentBounds.colMaximum - 1) }),
        'R': (currentBounds, dimensions) => ({ ...currentBounds, colMinimum: Math.min(dimensions.width, currentBounds.colMinimum + 1) }),
        'U': (currentBounds, dimensions) => ({ ...currentBounds, rowMaximum: Math.max(1, currentBounds.rowMaximum - 1) }),
        'D': (currentBounds, dimensions) => ({ ...currentBounds, rowMinimum: Math.min(dimensions.height, currentBounds.rowMinimum + 1) })
    };

    const finalState = Array.from({ length: travelSteps }).reduce((currentLimits, _, stepIndex) => {
        if (currentLimits.adventureStatus === "ABORTED") {
            return currentLimits;
        }

        const currentAction = participantActions.charAt(stepIndex);
        const currentRestriction = environmentalRestrictions.charAt(stepIndex);

        let postActionLimits = currentLimits;
        if (actionTransformers[currentAction]) {
            postActionLimits = actionTransformers[currentAction](currentLimits);
        }

        if (postActionLimits.colMinimum <= 0 || postActionLimits.colMaximum > worldWidth ||
            postActionLimits.rowMinimum <= 0 || postActionLimits.rowMaximum > worldHeight) {
            return { ...currentLimits, adventureStatus: "ABORTED" };
        }

        let postRestrictionLimits = postActionLimits;
        if (restrictionAppliers[currentRestriction]) {
            postRestrictionLimits = restrictionAppliers[currentRestriction](postActionLimits, { width: worldWidth, height: worldHeight });
        }

        return postRestrictionLimits;
    }, initialLimits);

    if (finalState.adventureStatus === "ACTIVE") {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

(function () {
    const dataSource = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/);
    processJourney(dataSource);
})();