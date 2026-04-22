const OrientationScheme = {
    NO_GUIDELINE: 0,
    X_AXIS_GUIDELINE: 1, // Point chosen to fix a vertical line at its X-coordinate
    Y_AXIS_GUIDELINE: 2, // Point chosen to fix a horizontal line at its Y-coordinate
};

function GeographicMarker(xVal, yVal, influence, initialOrdinal) {
    this.xCoord = xVal;
    this.yCoord = yVal;
    this.influenceFactor = influence;
    this.initialIndex = initialOrdinal;
}

function evaluateScenario(totalMarkers, allMarkers, selectionProfile) {
    const markerSpecificCosts = new Array(totalMarkers);

    allMarkers.forEach(marker => {
        markerSpecificCosts[marker.initialIndex] = Math.min(Math.abs(marker.xCoord), Math.abs(marker.yCoord)) * marker.influenceFactor;
    });

    const sortedByXCoordinate = [...allMarkers].sort((m1, m2) => m1.xCoord - m2.xCoord);
    
    let currentXReference = null;
    sortedByXCoordinate.forEach(marker => {
        if (selectionProfile[marker.initialIndex] === OrientationScheme.X_AXIS_GUIDELINE) {
            currentXReference = marker.xCoord;
            markerSpecificCosts[marker.initialIndex] = 0;
        } else if (currentXReference !== null) {
            markerSpecificCosts[marker.initialIndex] = Math.min(
                markerSpecificCosts[marker.initialIndex],
                Math.abs(marker.xCoord - currentXReference) * marker.influenceFactor
            );
        }
    });

    currentXReference = null;
    for (let i = totalMarkers - 1; i >= 0; i--) {
        const marker = sortedByXCoordinate[i];
        if (selectionProfile[marker.initialIndex] === OrientationScheme.X_AXIS_GUIDELINE) {
            currentXReference = marker.xCoord;
            markerSpecificCosts[marker.initialIndex] = 0;
        } else if (currentXReference !== null) {
            markerSpecificCosts[marker.initialIndex] = Math.min(
                markerSpecificCosts[marker.initialIndex],
                Math.abs(marker.xCoord - currentXReference) * marker.influenceFactor
            );
        }
    }

    const sortedByYCoordinate = [...allMarkers].sort((m1, m2) => m1.yCoord - m2.yCoord);

    let currentYReference = null;
    sortedByYCoordinate.forEach(marker => {
        if (selectionProfile[marker.initialIndex] === OrientationScheme.Y_AXIS_GUIDELINE) {
            currentYReference = marker.yCoord;
            markerSpecificCosts[marker.initialIndex] = 0;
        } else if (currentYReference !== null) {
            markerSpecificCosts[marker.initialIndex] = Math.min(
                markerSpecificCosts[marker.initialIndex],
                Math.abs(marker.yCoord - currentYReference) * marker.influenceFactor
            );
        }
    });

    currentYReference = null;
    for (let i = totalMarkers - 1; i >= 0; i--) {
        const marker = sortedByYCoordinate[i];
        if (selectionProfile[marker.initialIndex] === OrientationScheme.Y_AXIS_GUIDELINE) {
            currentYReference = marker.yCoord;
            markerSpecificCosts[marker.initialIndex] = 0;
        } else if (currentYReference !== null) {
            markerSpecificCosts[marker.initialIndex] = Math.min(
                markerSpecificCosts[marker.initialIndex],
                Math.abs(marker.yCoord - currentYReference) * marker.influenceFactor
            );
        }
    }

    return markerSpecificCosts.reduce((accumulated, value) => accumulated + value, 0);
}

function processGeographicData(rawInputText) {
    const inputLines = rawInputText.trim().split('\n');
    const firstLineFields = inputLines[0].split(/\s+/);
    const numberOfMarkers = parseInt(firstLineFields[0]);

    const geographicMarkers = Array.from({ length: numberOfMarkers }, (_, index) => {
        const fields = inputLines[index + 1].split(/\s+/);
        return new GeographicMarker(
            parseInt(fields[0]),
            parseInt(fields[1]),
            parseInt(fields[2]),
            index
        );
    });

    const finalMinimumOutlays = new Array(numberOfMarkers + 1).fill(Number.MAX_SAFE_INTEGER);

    const possibleCombinations = Math.pow(3, numberOfMarkers);

    for (let comboIteration = 0; comboIteration < possibleCombinations; comboIteration++) {
        const currentSelectionChoices = new Array(numberOfMarkers).fill(OrientationScheme.NO_GUIDELINE);
        let activeGuidelineCount = 0;
        let temporaryComboValue = comboIteration;

        for (let markerIndex = 0; markerIndex < numberOfMarkers; markerIndex++) {
            const choiceForMarker = temporaryComboValue % 3;
            currentSelectionChoices[markerIndex] = choiceForMarker;
            if (choiceForMarker === OrientationScheme.X_AXIS_GUIDELINE || choiceForMarker === OrientationScheme.Y_AXIS_GUIDELINE) {
                activeGuidelineCount++;
            }
            temporaryComboValue = Math.floor(temporaryComboValue / 3);
        }

        const currentScenarioCost = evaluateScenario(numberOfMarkers, geographicMarkers, currentSelectionChoices);
        finalMinimumOutlays[activeGuidelineCount] = Math.min(finalMinimumOutlays[activeGuidelineCount], currentScenarioCost);
    }

    return finalMinimumOutlays.join('\n');
}

function main(inputContent) {
    return processGeographicData(inputContent);
}