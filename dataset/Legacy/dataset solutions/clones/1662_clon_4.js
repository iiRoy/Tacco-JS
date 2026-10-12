function processRoboticsData(sensorStream) {
    const dataSegments = sensorStream.trim().split("\n");
    const totalUnits = parseInt(dataSegments[0].split(" ")[0], 10);

    const roboticEntities = [];
    for (let i = 0; i < totalUnits; i++) {
        const attributes = dataSegments[i + 1].split(" ");
        roboticEntities.push({
            pos_x: parseInt(attributes[0], 10),
            pos_y: parseInt(attributes[1], 10),
            movement_vector: attributes[2]
        });
    }

    let minimalCollisionInterval = Number.POSITIVE_INFINITY;

    const analyzeEncounterPattern = (
        entityCollection,
        primaryKeyExtractor,
        secondaryKeyExtractor,
        initialScanState,
        triggeringMovement,
        collidingMovement,
        triggeringCoordExtractor,
        collidingCoordExtractor,
        timeScalingFactor
    ) => {
        let currentMinimum = Number.POSITIVE_INFINITY;

        const orderedEntities = [...entityCollection].sort((e1, e2) => {
            const pk1 = primaryKeyExtractor(e1);
            const pk2 = primaryKeyExtractor(e2);
            if (pk1 < pk2) return -1;
            if (pk1 > pk2) return 1;

            const sk1 = secondaryKeyExtractor(e1);
            const sk2 = secondaryKeyExtractor(e2);
            if (sk1 < sk2) return -1;
            if (sk1 > sk2) return 1;
            return 0;
        });

        let currentGroupIdentifier = null;
        let lastTriggeringCoordinate = null;
        let currentScanState = initialScanState;

        for (const entity of orderedEntities) {
            const groupValue = primaryKeyExtractor(entity);

            if (currentGroupIdentifier === groupValue) {
                if (currentScanState === triggeringMovement) {
                    if (entity.movement_vector === collidingMovement) {
                        currentScanState = collidingMovement;
                        currentMinimum = Math.min(currentMinimum, Math.abs(collidingCoordExtractor(entity) - lastTriggeringCoordinate) * timeScalingFactor);
                    } else if (entity.movement_vector === triggeringMovement) {
                        lastTriggeringCoordinate = triggeringCoordExtractor(entity);
                    }
                } else {
                    if (entity.movement_vector === triggeringMovement) {
                        currentScanState = triggeringMovement;
                        lastTriggeringCoordinate = triggeringCoordExtractor(entity);
                    }
                }
            } else {
                currentGroupIdentifier = groupValue;
                if (entity.movement_vector === triggeringMovement) {
                    currentScanState = triggeringMovement;
                    lastTriggeringCoordinate = triggeringCoordExtractor(entity);
                } else {
                    currentScanState = initialScanState;
                }
            }
        }
        return currentMinimum;
    };

    // Scenario 1: Diagonal (sum X+Y), Right-moving then Up-moving
    minimalCollisionInterval = Math.min(minimalCollisionInterval,
        analyzeEncounterPattern(
            roboticEntities,
            (e) => e.pos_x + e.pos_y, (e) => e.pos_x, 'U', 'R', 'U', (e) => e.pos_x, (e) => e.pos_x, 10
        )
    );

    // Scenario 2: Diagonal (sum X+Y), Down-moving then Left-moving
    minimalCollisionInterval = Math.min(minimalCollisionInterval,
        analyzeEncounterPattern(
            roboticEntities,
            (e) => e.pos_x + e.pos_y, (e) => e.pos_x, 'L', 'D', 'L', (e) => e.pos_x, (e) => e.pos_x, 10
        )
    );

    // Scenario 3: Diagonal (diff Y-X), Right-moving then Down-moving
    minimalCollisionInterval = Math.min(minimalCollisionInterval,
        analyzeEncounterPattern(
            roboticEntities,
            (e) => e.pos_y - e.pos_x, (e) => e.pos_x, 'D', 'R', 'D', (e) => e.pos_x, (e) => e.pos_x, 10
        )
    );

    // Scenario 4: Diagonal (diff Y-X), Up-moving then Left-moving
    minimalCollisionInterval = Math.min(minimalCollisionInterval,
        analyzeEncounterPattern(
            roboticEntities,
            (e) => e.pos_y - e.pos_x, (e) => e.pos_x, 'L', 'U', 'L', (e) => e.pos_x, (e) => e.pos_x, 10
        )
    );

    // Scenario 5: Vertical (constant X), Up-moving then Down-moving
    minimalCollisionInterval = Math.min(minimalCollisionInterval,
        analyzeEncounterPattern(
            roboticEntities,
            (e) => e.pos_x, (e) => e.pos_y, 'D', 'U', 'D', (e) => e.pos_y, (e) => e.pos_y, 5
        )
    );

    // Scenario 6: Horizontal (constant Y), Right-moving then Left-moving
    minimalCollisionInterval = Math.min(minimalCollisionInterval,
        analyzeEncounterPattern(
            roboticEntities,
            (e) => e.pos_y, (e) => e.pos_x, 'L', 'R', 'L', (e) => e.pos_x, (e) => e.pos_x, 5
        )
    );

    console.log(minimalCollisionInterval === Number.POSITIVE_INFINITY ? "SAFE" : minimalCollisionInterval);
}

processRoboticsData(require("fs").readFileSync("/dev/stdin", "utf8"));