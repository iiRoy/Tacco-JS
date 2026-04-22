const readline = require('readline');

const inputProcessor = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedInputStrings = [];
inputProcessor.on('line', (currentString) => {
    collectedInputStrings.push(currentString);
});

inputProcessor.on('close', () => {
    initiateProcessing(collectedInputStrings);
});

const initiateProcessing = (allInputLines) => {
    let runtimeConfig = {};
    let traversalModifications = [];
    let lineIterator = 0;

    // Early exit if the first line indicates termination
    if (allInputLines[lineIterator] === "0") {
        return;
    }

    const configurationFields = ["verticalPathCount", "initialColumn", "finalColumn", "maxInteractionDepth"];
    
    // Parse core configuration parameters
    for (let i = 0; i < configurationFields.length; i++) {
        runtimeConfig[configurationFields[i]] = parseInt(allInputLines[lineIterator++]);
    }

    // Construct the grid of traversal modifications
    while (lineIterator < allInputLines.length) {
        const currentLineData = allInputLines[lineIterator];
        if (currentLineData === "0") { // Stop reading grid data if "0" is encountered
            break;
        }
        traversalModifications.push(createLevelModifiers(currentLineData, runtimeConfig.verticalPathCount));
        lineIterator++;
    }

    // Adjust column indices to be zero-based
    runtimeConfig.initialColumn -= 1;
    runtimeConfig.finalColumn -= 1;

    // Determine the forward path from the starting column
    const forwardJourneyPath = computeForwardTraversal(runtimeConfig.initialColumn, 0, traversalModifications);

    // If the forward journey already reaches the target, output "0"
    if (forwardJourneyPath[forwardJourneyPath.length - 1] === runtimeConfig.finalColumn) {
        process.stdout.write("0\n");
        return;
    }

    // Determine the path that would end at the final column using the reverse application of modifications
    const endingGoalPath = computeBackwardTerminalTraversal(runtimeConfig.finalColumn, traversalModifications);

    let outcomeMessage = "";

    // Search for a suitable position to insert a new horizontal connection
    const potentialInsertionPoint = Array.from({ length: runtimeConfig.maxInteractionDepth })
        .map((_, currentDepth) => currentDepth) // Generate an array of depths to iterate
        .find(depthValue => {
            const currentForwardPos = forwardJourneyPath[depthValue];
            const currentGoalPos = endingGoalPath[depthValue];

            const areAdjacentColumns = Math.abs(currentForwardPos - currentGoalPos) === 1;
            const noExistingBarAtForward = traversalModifications[depthValue][currentForwardPos] === 0;
            const noExistingBarAtGoal = traversalModifications[depthValue][currentGoalPos] === 0;

            return areAdjacentColumns && noExistingBarAtForward && noExistingBarAtGoal;
        });

    if (potentialInsertionPoint !== undefined) {
        const chosenDepth = potentialInsertionPoint;
        const smallerColumn = Math.min(forwardJourneyPath[chosenDepth], endingGoalPath[chosenDepth]);
        outcomeMessage = (chosenDepth + 1) + " " + (smallerColumn + 1);
    } else {
        outcomeMessage = "1";
    }

    process.stdout.write(outcomeMessage + "\n");
};

// Function to translate a level's string representation into its movement modifiers
const createLevelModifiers = (levelDescriptor, totalColumns) => {
    const rawSegmentValues = levelDescriptor.slice(0, totalColumns - 1)
                                            .split('')
                                            .map(Number); // Convert '0'/'1' to 0/1 integers
    
    const processedModifiers = rawSegmentValues.reduce((accumulator, currentSegmentValue, index) => {
        let effectiveModifier = currentSegmentValue;
        // Logic to determine if a '0' actually represents the right side of a bar
        if (index > 0 && currentSegmentValue === 0 && accumulator[index - 1] === 1) {
            effectiveModifier = -1;
        }
        accumulator.push(effectiveModifier);
        return accumulator;
    }, []);

    // Determine the modifier for the very last column based on the second-to-last
    const finalColumnModifier = (processedModifiers[processedModifiers.length - 1] === 1) ? -1 : 0;
    processedModifiers.push(finalColumnModifier);
    
    return processedModifiers;
};

// Function to calculate the path from a given starting position and depth
const computeForwardTraversal = (initialPosition, startingDepth, modifierGrid) => {
    const totalDepths = modifierGrid.length;
    const pathTrajectory = [initialPosition];

    // Iteratively build the path using reduce
    return Array.from({ length: totalDepths - startingDepth }).reduce((currentPath, _, stepIndex) => {
        const currentLevel = startingDepth + stepIndex;
        const currentColumn = currentPath[currentPath.length - 1];
        const moveDelta = modifierGrid[currentLevel][currentColumn];
        const nextColumn = currentColumn + moveDelta;
        currentPath.push(nextColumn);
        return currentPath;
    }, pathTrajectory);
};

// Function to calculate the path that *ends* at a specified column, by applying modifications in reverse order
const computeBackwardTerminalTraversal = (targetTerminalColumn, modifierGrid) => {
    const totalDepths = modifierGrid.length;
    const pathSegmentsReversed = [targetTerminalColumn];

    // Build the path segments by traversing the grid backwards
    const intermediateReversedSegments = Array.from({ length: totalDepths }).reduce((segmentsList, _, index) => {
        const currentGridDepth = totalDepths - 1 - index; // Iterate grid depths from last to first
        const currentColumnInBackwardTraversal = segmentsList[segmentsList.length - 1];
        const modificationEffect = modifierGrid[currentGridDepth][currentColumnInBackwardTraversal];
        const nextColumnInBackwardTraversal = currentColumnInBackwardTraversal + modificationEffect;
        segmentsList.push(nextColumnInBackwardTraversal);
        return segmentsList;
    }, pathSegmentsReversed);

    // Reverse the segments to get the path in forward order (from start to end)
    return intermediateReversedSegments.reverse();
};