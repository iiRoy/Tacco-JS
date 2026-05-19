function processInput(rawInput) {
    const inputLines = rawInput.trim().split("\n");
    const numRobots = parseInt(inputLines[0].split(" ")[0], 10);

    const parseRobotLine = (lineStr) => {
        const parts = lineStr.split(" ");
        return [parseInt(parts[0], 10), parseInt(parts[1], 10), parts[2]];
    };

    let robotConfigurations = inputLines.slice(1, numRobots + 1).map(parseRobotLine);

    const DIAGONAL_COLLISION_FACTOR = 10;
    const AXIAL_COLLISION_FACTOR = 5;

    let overallMinCollisionTime = Infinity;

    function calculateMinCollisionForScenario(
        robotsArray,
        sortComparator,
        groupKeyExtractor,
        coordinateExtractor,
        collisionFactor,
        leadingDirection,
        collidingDirection,
        defaultDirectionForNewGroup
    ) {
        const sortedRobots = [...robotsArray].sort(sortComparator);

        let currentScenarioMinTime = Infinity;
        let previousGroupValue = null;
        let lastObservedCoord = null;
        let lastObservedDirection = null;

        for (const currentRobot of sortedRobots) {
            const [currentX, currentY, currentDir] = currentRobot;
            const currentGroupValue = groupKeyExtractor(currentRobot);
            const currentCoordForDiff = coordinateExtractor(currentRobot);

            if (previousGroupValue === currentGroupValue) {
                if (lastObservedDirection === leadingDirection) {
                    if (currentDir === collidingDirection) {
                        currentScenarioMinTime = Math.min(
                            currentScenarioMinTime,
                            Math.abs(currentCoordForDiff - lastObservedCoord) * collisionFactor
                        );
                    } else if (currentDir === leadingDirection) {
                        lastObservedCoord = currentCoordForDiff;
                    }
                } else {
                    if (currentDir === leadingDirection) {
                        lastObservedDirection = leadingDirection;
                        lastObservedCoord = currentCoordForDiff;
                    }
                }
            } else {
                previousGroupValue = currentGroupValue;
                if (currentDir === leadingDirection) {
                    lastObservedDirection = leadingDirection;
                    lastObservedCoord = currentCoordForDiff;
                } else {
                    lastObservedDirection = defaultDirectionForNewGroup;
                    lastObservedCoord = null;
                }
            }
        }
        return currentScenarioMinTime;
    }

    const sumCoordsSort = (rA, rB) => (rA[0] + rA[1]) - (rB[0] + rB[1]) || rA[0] - rB[0];
    const sumCoordsGroupKey = r => r[0] + r[1];
    const xCoordExtractor = r => r[0];

    overallMinCollisionTime = Math.min(
        overallMinCollisionTime,
        calculateMinCollisionForScenario(
            robotConfigurations,
            sumCoordsSort,
            sumCoordsGroupKey,
            xCoordExtractor,
            DIAGONAL_COLLISION_FACTOR,
            'R', 'U', 'U'
        )
    );

    overallMinCollisionTime = Math.min(
        overallMinCollisionTime,
        calculateMinCollisionForScenario(
            robotConfigurations,
            sumCoordsSort,
            sumCoordsGroupKey,
            xCoordExtractor,
            DIAGONAL_COLLISION_FACTOR,
            'D', 'L', 'L'
        )
    );

    const diffCoordsSort = (rA, rB) => (rA[1] - rA[0]) - (rB[1] - rB[0]) || rA[0] - rB[0];
    const diffCoordsGroupKey = r => r[1] - r[0];

    overallMinCollisionTime = Math.min(
        overallMinCollisionTime,
        calculateMinCollisionForScenario(
            robotConfigurations,
            diffCoordsSort,
            diffCoordsGroupKey,
            xCoordExtractor,
            DIAGONAL_COLLISION_FACTOR,
            'R', 'D', 'D'
        )
    );

    overallMinCollisionTime = Math.min(
        overallMinCollisionTime,
        calculateMinCollisionForScenario(
            robotConfigurations,
            diffCoordsSort,
            diffCoordsGroupKey,
            xCoordExtractor,
            DIAGONAL_COLLISION_FACTOR,
            'U', 'L', 'L'
        )
    );

    const xThenYSort = (rA, rB) => rA[0] - rB[0] || rA[1] - rB[1];
    const xGroupKey = r => r[0];
    const yCoordExtractor = r => r[1];

    overallMinCollisionTime = Math.min(
        overallMinCollisionTime,
        calculateMinCollisionForScenario(
            robotConfigurations,
            xThenYSort,
            xGroupKey,
            yCoordExtractor,
            AXIAL_COLLISION_FACTOR,
            'U', 'D', 'D'
        )
    );

    const yThenXSort = (rA, rB) => rA[1] - rB[1] || rA[0] - rB[0];
    const yGroupKey = r => r[1];

    overallMinCollisionTime = Math.min(
        overallMinCollisionTime,
        calculateMinCollisionForScenario(
            robotConfigurations,
            yThenXSort,
            yGroupKey,
            xCoordExtractor,
            AXIAL_COLLISION_FACTOR,
            'R', 'L', 'L'
        )
    );

    const finalResult = overallMinCollisionTime === Infinity ? "SAFE" : overallMinCollisionTime;
    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
