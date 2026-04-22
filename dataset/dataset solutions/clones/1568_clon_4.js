const parseMapData = (rawText) => {
    const textSections = rawText.split('\n');
    const [verticalSpan, horizontalExtent] = textSections[0].split(' ').map(Number);
    const boundaryMarkers = textSections.slice(1).map(segment => segment.split(' ').map(Number));
    return { totalRows: verticalSpan, totalColumns: horizontalExtent, rowConstraints: boundaryMarkers };
};

const checkDownwardPath = (currentXCoord, currentYCoord, allRowConstraints) => {
    // currentYCoord is 1-indexed for problem logic, rowConstraints is 0-indexed.
    const targetRowConstraint = allRowConstraints[currentYCoord - 1]; 
    return !(targetRowConstraint[0] <= currentXCoord && currentXCoord <= targetRowConstraint[1]);
};

const exploreTrajectory = (initialX, initialY, currentSteps, maxRows, maxCols, constraints) => {
    if (initialX > maxCols) {
        return [];
    }

    let pathResults = [];
    // Relevant rows for updating the result array are 1-indexed rows from 2 to (maxRows + 1).
    if (initialY >= 2 && initialY <= maxRows + 1) { 
        pathResults.push({ reachedRow: initialY, cost: currentSteps });
    }

    const canDescend = checkDownwardPath(initialX, initialY, constraints);

    if (canDescend) {
        // Prioritize moving down
        return pathResults.concat(
            exploreTrajectory(initialX, initialY + 1, currentSteps + 1, maxRows, maxCols, constraints)
        );
    } else {
        // If cannot descend, move right
        return pathResults.concat(
            exploreTrajectory(initialX + 1, initialY, currentSteps + 1, maxRows, maxCols, constraints)
        );
    }
};

const computeTraversalCosts = (rawData) => {
    const { totalRows, totalColumns, rowConstraints } = parseMapData(rawData);

    const allPathOutcomes = Array.from({ length: totalColumns }, (_, idx) => idx + 1)
        .flatMap(startCol => exploreTrajectory(startCol, 1, 0, totalRows, totalColumns, rowConstraints));

    const aggregatedMinCosts = allPathOutcomes.reduce((acc, outcome) => {
        const { reachedRow, cost } = outcome;
        if (acc[reachedRow] === undefined || cost < acc[reachedRow]) {
            acc[reachedRow] = cost;
        }
        return acc;
    }, {});

    // Format the final output array.
    // The original `resultK[k]` corresponds to the minimum moves to reach 1-indexed row `k+2`.
    const finalCalculatedCosts = Array.from({ length: totalRows }, (_, k) => {
        const targetRow = k + 2;
        return aggregatedMinCosts[targetRow] !== undefined ? aggregatedMinCosts[targetRow] : -1;
    });

    return finalCalculatedCosts;
};

const performAnalysis = (sourceInput) => {
    const outcome = computeTraversalCosts(sourceInput);
    console.log(outcome);
};

performAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));