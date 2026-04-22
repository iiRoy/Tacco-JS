function processInputData(rawInputString) {
    // Validate the raw input: ensure it's a non-empty string.
    if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.log("SAFE");
        return;
    }

    // Prepare the input by cleaning and splitting into individual lines.
    const inputLines = rawInputString.trim().split('\n');

    // Parse the total number of points from the first line.
    // Ensure the count is a valid non-negative integer.
    const numberOfPoints = parseInt(inputLines[0].split(' ')[0], 10);
    if (isNaN(numberOfPoints) || numberOfPoints < 0) {
        console.log("SAFE");
        return;
    }

    // Structure point data as objects for better readability and access (x, y, direction).
    const listOfRobotPositions = [];
    // Validate that enough data lines exist for the declared number of points.
    if (inputLines.length - 1 < numberOfPoints) {
        console.log("SAFE");
        return;
    }

    // Iterate through input lines to populate the list of robot positions.
    for (let pointIndex = 0; pointIndex < numberOfPoints; pointIndex++) {
        const currentLineSegments = inputLines[pointIndex + 1].split(' ');

        // Basic validation for each line: expect 3 parts (x, y, direction).
        if (currentLineSegments.length !== 3) {
            // If a line is malformed, skip it or handle as an error.
            // For this problem, we'll skip to maintain robustness.
            continue;
        }

        const xCoordinate = parseInt(currentLineSegments[0], 10);
        const yCoordinate = parseInt(currentLineSegments[1], 10);
        const movementDirection = currentLineSegments[2];

        // Further validation for parsed coordinates and direction values.
        const validDirections = ['U', 'D', 'L', 'R'];
        if (isNaN(xCoordinate) || isNaN(yCoordinate) || !validDirections.includes(movementDirection)) {
            continue;
        }

        listOfRobotPositions.push({
            x: xCoordinate,
            y: yCoordinate,
            direction: movementDirection
        });
    }

    // If no valid robot positions were parsed, the system is safe.
    if (listOfRobotPositions.length === 0) {
        console.log("SAFE");
        return;
    }

    // Initialize a mutable object to hold the minimum collision time found across all scans.
    // Using an object allows passing it by reference to the helper function.
    const minimumCollisionDuration = { value: Infinity };

    // --- Helper functions for sorting and data extraction ---

    // Comparator for sorting by sum of coordinates (x+y), then by x for tie-breaking.
    const compareBySumOfCoords = (posA, posB) => {
        const sumA = posA.x + posA.y;
        const sumB = posB.x + posB.y;
        if (sumA !== sumB) return sumA - sumB;
        return posA.x - posB.x;
    };

    // Comparator for sorting by difference of coordinates (y-x), then by x for tie-breaking.
    const compareByDiffOfCoords = (posA, posB) => {
        const diffA = posA.y - posA.x;
        const diffB = posB.y - posB.x;
        if (diffA !== diffB) return diffA - diffB;
        return posA.x - posB.x;
    };

    // Comparator for sorting by x-coordinate, then by y for tie-breaking.
    const compareByXCoordinate = (posA, posB) => {
        if (posA.x !== posB.x) return posA.x - posB.x;
        return posA.y - posB.y;
    };

    // Comparator for sorting by y-coordinate, then by x for tie-breaking.
    const compareByYCoordinate = (posA, posB) => {
        if (posA.y !== posB.y) return posA.y - posB.y;
        return posA.x - posB.x;
    };

    // Extractors for specific coordinate values or group keys.
    const getSumOfCoords = (pos) => pos.x + pos.y;
    const getDiffOfCoords = (pos) => pos.y - pos.x;
    const getXValue = (pos) => pos.x;
    const getYValue = (pos) => pos.y;

    // --- Core collision detection logic encapsulated in a reusable function ---
    const executeCollisionDetectionPass = (
        positionsData,
        sortFunction,
        groupKeyFunction,
        referenceCoordFunction,
        initialGroupSentinel,
        initialActiveDirection,
        firstRelevantDirection,
        secondRelevantDirection,
        collisionFactor
    ) => {
        // Sort the array according to the current pass's criteria.
        positionsData.sort(sortFunction);

        let currentGroupKey = initialGroupSentinel;
        let lastKnownReferenceCoord = null;
        let trackedDirectionInGroup = initialActiveDirection;

        // Skip if the list is empty after sorting (though checked earlier, good for robustness).
        if (positionsData.length === 0) {
            return;
        }

        // Iterate through each robot position to detect potential collisions.
        for (const currentPosition of positionsData) {
            const pointGroupIdentifier = groupKeyFunction(currentPosition);
            const pointMovementDirection = currentPosition.direction;
            const pointReferenceCoordinate = referenceCoordFunction(currentPosition);

            if (currentGroupKey === pointGroupIdentifier) {
                // Still processing points within the same logical group (e.g., same x+y line).
                if (trackedDirectionInGroup === firstRelevantDirection) {
                    // If the previously tracked direction was 'firstRelevantDirection',
                    // we are now looking for 'secondRelevantDirection' to find a collision.
                    if (pointMovementDirection === secondRelevantDirection) {
                        // Collision detected! Calculate time and update minimum.
                        minimumCollisionDuration.value = Math.min(
                            minimumCollisionDuration.value,
                            Math.abs(pointReferenceCoordinate - lastKnownReferenceCoord) * collisionFactor
                        );
                        // Update the tracked direction to the current one, as it might start a new sequence.
                        trackedDirectionInGroup = secondRelevantDirection;
                    } else if (pointMovementDirection === firstRelevantDirection) {
                        // Another 'firstRelevantDirection' point, update the reference coordinate.
                        lastKnownReferenceCoord = pointReferenceCoordinate;
                    }
                    // If pointMovementDirection is neither, the state remains unchanged.
                } else {
                    // If trackedDirectionInGroup is not 'firstRelevantDirection' (e.g., it's 'initialActiveDirection'
                    // or 'secondRelevantDirection' from a previous collision in this group),
                    // we are looking for 'firstRelevantDirection' to initiate a new potential collision sequence.
                    if (pointMovementDirection === firstRelevantDirection) {
                        trackedDirectionInGroup = firstRelevantDirection;
                        lastKnownReferenceCoord = pointReferenceCoordinate;
                    }
                    // If pointMovementDirection is not 'firstRelevantDirection', state remains unchanged.
                }
            } else {
                // A new logical group is encountered. Reset state for this new group.
                currentGroupKey = pointGroupIdentifier;
                
                // Initialize the tracked direction and reference coordinate for the new group.
                if (pointMovementDirection === firstRelevantDirection) {
                    trackedDirectionInGroup = firstRelevantDirection;
                    lastKnownReferenceCoord = pointReferenceCoordinate;
                } else {
                    // If the first point in a new group is not 'firstRelevantDirection',
                    // the group's initial state defaults to the 'initialActiveDirection' for the pass.
                    trackedDirectionInGroup = initialActiveDirection;
                    lastKnownReferenceCoord = null; // No reference yet for 'firstRelevantDirection'.
                }
            }
        }
    };

    // --- Execute the six distinct collision detection passes ---

    // Pass 1: Sort by (x+y), check for 'R' then 'U' collisions.
    executeCollisionDetectionPass(
        listOfRobotPositions,
        compareBySumOfCoords,
        getSumOfCoords,
        getXValue,
        -1, // Initial group key sentinel
        'U', // Initial active direction for new groups
        'R', // Primary direction to track
        'U', // Secondary direction for collision
        10   // Collision distance multiplier
    );

    // Pass 2: Sort by (x+y), check for 'D' then 'L' collisions.
    executeCollisionDetectionPass(
        listOfRobotPositions,
        compareBySumOfCoords,
        getSumOfCoords,
        getXValue,
        -1,
        'L',
        'D',
        'L',
        10
    );

    // Pass 3: Sort by (y-x), check for 'R' then 'D' collisions.
    executeCollisionDetectionPass(
        listOfRobotPositions,
        compareByDiffOfCoords,
        getDiffOfCoords,
        getXValue,
        Infinity, // Different initial group key sentinel
        'D',
        'R',
        'D',
        10
    );

    // Pass 4: Sort by (y-x), check for 'U' then 'L' collisions.
    executeCollisionDetectionPass(
        listOfRobotPositions,
        compareByDiffOfCoords,
        getDiffOfCoords,
        getXValue,
        Infinity,
        'L',
        'U',
        'L',
        10
    );

    // Pass 5: Sort by X-coordinate, check for 'U' then 'D' collisions.
    executeCollisionDetectionPass(
        listOfRobotPositions,
        compareByXCoordinate,
        getXValue,
        getYValue, // Reference coordinate is now Y
        -1,
        'D',
        'U',
        'D',
        5    // Different collision factor
    );

    // Pass 6: Sort by Y-coordinate, check for 'R' then 'L' collisions.
    executeCollisionDetectionPass(
        listOfRobotPositions,
        compareByYCoordinate,
        getYValue,
        getXValue, // Reference coordinate is now X
        -1,
        'L',
        'R',
        'L',
        5
    );

    // Determine the final output message.
    let finalOutputMessage;
    if (minimumCollisionDuration.value === Infinity) {
        finalOutputMessage = "SAFE";
    } else {
        finalOutputMessage = minimumCollisionDuration.value;
    }

    // Print the result to the console.
    console.log(finalOutputMessage);
}

// Read input from standard input and initiate processing.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));