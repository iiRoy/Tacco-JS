function Main(rawInput) {
    const inputLines = rawInput.trim().split("\n");
    const numberOfPoints = parseInt(inputLines[0].split(" ")[0], 10);

    let pointCoordinatesAndDirections = [];
    for (let i = 0; i < numberOfPoints; i++) {
        const lineParts = inputLines[i + 1].split(" ");
        pointCoordinatesAndDirections.push([parseInt(lineParts[0], 10), parseInt(lineParts[1], 10), lineParts[2]]);
    }

    let minimumCollisionTime = Infinity;

    function processCollisionScan(
        dataPoints,
        groupKeyFunction, // (point) => key
        initialGroupKeyBoundary,
        defaultDirectionForGroup, // 'U', 'L', 'D', 'R' - default state for a new group or after a collision
        coordinateForComparisonFunction, // (point) => coordinate (x or y)
        timeCalculationMultiplier, // 5 or 10
        potentialTriggerDirection // The direction that sets up a potential collision (e.g., 'R' for R-U collision)
    ) {
        let currentGroupIdentifier = initialGroupKeyBoundary;
        let currentScanState = defaultDirectionForGroup; // This corresponds to original 'tmpAngle'
        let lastKnownTriggerCoordinate; // This corresponds to original 'tmp2'

        for (let j = 0; j < dataPoints.length; j++) {
            const currentPoint = dataPoints[j];
            const pointDirection = currentPoint[2];
            const currentPointCoordinate = coordinateForComparisonFunction(currentPoint);
            const newGroupIdentifier = groupKeyFunction(currentPoint);

            if (currentGroupIdentifier === newGroupIdentifier) {
                if (currentScanState === potentialTriggerDirection) {
                    if (pointDirection === defaultDirectionForGroup) {
                        // Collision detected
                        minimumCollisionTime = Math.min(minimumCollisionTime, Math.abs(currentPointCoordinate - lastKnownTriggerCoordinate) * timeCalculationMultiplier);
                        currentScanState = defaultDirectionForGroup; // Reset state after collision
                    } else if (pointDirection === potentialTriggerDirection) {
                        lastKnownTriggerCoordinate = currentPointCoordinate; // Update the reference point for potentialTriggerDirection
                    }
                } else { // currentScanState is defaultDirectionForGroup (or some other non-trigger state)
                    if (pointDirection === potentialTriggerDirection) {
                        currentScanState = potentialTriggerDirection;
                        lastKnownTriggerCoordinate = currentPointCoordinate;
                    }
                }
            } else { // New group encountered
                currentGroupIdentifier = newGroupIdentifier;
                if (pointDirection === potentialTriggerDirection) {
                    currentScanState = potentialTriggerDirection;
                    lastKnownTriggerCoordinate = currentPointCoordinate;
                } else {
                    currentScanState = defaultDirectionForGroup;
                    lastKnownTriggerCoordinate = undefined; // No trigger point yet in this new group
                }
            }
        }
    }

    const collisionDetectionPasses = [
        // Pass 1: Sort by (x+y), then x. Detect R-U collision.
        {
            sortComparator: (a, b) => {
                const sumA = a[0] + a[1];
                const sumB = b[0] + b[1];
                if (sumA !== sumB) return sumA - sumB;
                return a[0] - b[0];
            },
            groupKeyExtractor: (p) => p[0] + p[1],
            initialGroupKey: -1,
            defaultDirection: 'U',
            coordExtractor: (p) => p[0],
            multiplier: 10,
            triggerDir: 'R'
        },
        // Pass 2: Sort by (x+y), then x. Detect D-L collision.
        {
            sortComparator: (a, b) => {
                const sumA = a[0] + a[1];
                const sumB = b[0] + b[1];
                if (sumA !== sumB) return sumA - sumB;
                return a[0] - b[0];
            },
            groupKeyExtractor: (p) => p[0] + p[1],
            initialGroupKey: -1,
            defaultDirection: 'L',
            coordExtractor: (p) => p[0],
            multiplier: 10,
            triggerDir: 'D'
        },
        // Pass 3: Sort by (y-x), then x. Detect R-D collision.
        {
            sortComparator: (a, b) => {
                const diffA = a[1] - a[0];
                const diffB = b[1] - b[0];
                if (diffA !== diffB) return diffA - diffB;
                return a[0] - b[0];
            },
            groupKeyExtractor: (p) => p[1] - p[0],
            initialGroupKey: Infinity,
            defaultDirection: 'D',
            coordExtractor: (p) => p[0],
            multiplier: 10,
            triggerDir: 'R'
        },
        // Pass 4: Sort by (y-x), then x. Detect U-L collision.
        {
            sortComparator: (a, b) => {
                const diffA = a[1] - a[0];
                const diffB = b[1] - b[0];
                if (diffA !== diffB) return diffA - diffB;
                return a[0] - b[0];
            },
            groupKeyExtractor: (p) => p[1] - p[0],
            initialGroupKey: Infinity,
            defaultDirection: 'L',
            coordExtractor: (p) => p[0],
            multiplier: 10,
            triggerDir: 'U'
        },
        // Pass 5: Sort by x, then y. Detect U-D collision.
        {
            sortComparator: (a, b) => {
                if (a[0] !== b[0]) return a[0] - b[0];
                return a[1] - b[1];
            },
            groupKeyExtractor: (p) => p[0],
            initialGroupKey: -1,
            defaultDirection: 'D',
            coordExtractor: (p) => p[1],
            multiplier: 5,
            triggerDir: 'U'
        },
        // Pass 6: Sort by y, then x. Detect R-L collision.
        {
            sortComparator: (a, b) => {
                if (a[1] !== b[1]) return a[1] - b[1];
                return a[0] - b[0];
            },
            groupKeyExtractor: (p) => p[1],
            initialGroupKey: -1,
            defaultDirection: 'L',
            coordExtractor: (p) => p[0],
            multiplier: 5,
            triggerDir: 'R'
        }
    ];

    for (const passConfiguration of collisionDetectionPasses) {
        const sortedPoints = [...pointCoordinatesAndDirections].sort(passConfiguration.sortComparator);
        processCollisionScan(
            sortedPoints,
            passConfiguration.groupKeyExtractor,
            passConfiguration.initialGroupKey,
            passConfiguration.defaultDirection,
            passConfiguration.coordExtractor,
            passConfiguration.multiplier,
            passConfiguration.triggerDir
        );
    }

    const finalOutput = minimumCollisionTime === Infinity ? "SAFE" : minimumCollisionTime;
    console.log(finalOutput);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
