function ProcessGridEvents(rawTransmission) {
    const parsedData = rawTransmission.trim().split("\n");
    const entityCount = parseInt(parsedData[0], 10);

    const initialEntities = [];
    for (let k = 0; k < entityCount; k++) {
        const parts = parsedData[k + 1].split(" ");
        initialEntities.push({
            hCoord: parseInt(parts[0], 10), // horizontal coordinate (x)
            vCoord: parseInt(parts[1], 10), // vertical coordinate (y)
            path: parts[2]                  // movement path (U, D, L, R)
        });
    }

    let minimumEncounterMoment = Infinity;

    // Helper function to detect collisions within groups of entities sharing a characteristic
    const assessPotentialEncounters = (entitiesCollection, groupingKeyExtractor, sortingKeyExtractor, collisionRules) => {
        // Group entities by their shared characteristic (e.g., X+Y sum, X-Y difference, X value, Y value)
        const groupedMap = new Map();
        entitiesCollection.forEach(entity => {
            const groupValue = groupingKeyExtractor(entity);
            if (!groupedMap.has(groupValue)) {
                groupedMap.set(groupValue, []);
            }
            groupedMap.get(groupValue).push(entity);
        });

        // Iterate through each group
        groupedMap.forEach(group => {
            // Sort entities within the group by the primary coordinate for collision detection
            group.sort((a, b) => sortingKeyExtractor(a) - sortingKeyExtractor(b));

            // Each specific collision rule needs its own state (last seen leading entity) within this group iteration
            const ruleStates = new Map(collisionRules.map(rule => [rule.id, { lastLeadingCoord: null, lastLeadingPathIdentified: null }]));

            // Iterate through the sorted entities in the current group
            group.forEach(currentEntity => {
                // Apply each relevant collision rule
                collisionRules.forEach(rule => {
                    const { leadingPath, followingPath, coordinateForDistance, speedFactor, id } = rule;
                    const state = ruleStates.get(id);

                    if (currentEntity.path === leadingPath) {
                        // Current entity is a potential 'leader' for this rule
                        state.lastLeadingCoord = currentEntity[coordinateForDistance];
                        state.lastLeadingPathIdentified = leadingPath;
                    } else if (currentEntity.path === followingPath && state.lastLeadingPathIdentified === leadingPath) {
                        // Current entity is a 'follower' and a 'leader' was previously identified
                        const currentEncounterTime = Math.abs(currentEntity[coordinateForDistance] - state.lastLeadingCoord) * speedFactor;
                        minimumEncounterMoment = Math.min(minimumEncounterMoment, currentEncounterTime);
                    }
                });
            });
        });
    };

    // Define all possible collision rules as data objects
    const allCollisionRules = [
        // Collision scenarios on diagonals where X+Y is constant
        { id: 'xy_R_U', groupingName: 'sumCoords', sortingName: 'hCoord', leadingPath: 'R', followingPath: 'U', coordinateForDistance: 'hCoord', speedFactor: 10 },
        { id: 'xy_D_L', groupingName: 'sumCoords', sortingName: 'hCoord', leadingPath: 'D', followingPath: 'L', coordinateForDistance: 'hCoord', speedFactor: 10 },

        // Collision scenarios on diagonals where Y-X is constant
        { id: 'yx_R_D', groupingName: 'diffCoords', sortingName: 'hCoord', leadingPath: 'R', followingPath: 'D', coordinateForDistance: 'hCoord', speedFactor: 10 },
        { id: 'yx_U_L', groupingName: 'diffCoords', sortingName: 'hCoord', leadingPath: 'U', followingPath: 'L', coordinateForDistance: 'hCoord', speedFactor: 10 },

        // Collision scenarios on vertical lines where X is constant
        { id: 'x_U_D', groupingName: 'hCoord', sortingName: 'vCoord', leadingPath: 'U', followingPath: 'D', coordinateForDistance: 'vCoord', speedFactor: 5 },

        // Collision scenarios on horizontal lines where Y is constant
        { id: 'y_R_L', groupingName: 'vCoord', sortingName: 'hCoord', leadingPath: 'R', followingPath: 'L', coordinateForDistance: 'hCoord', speedFactor: 5 }
    ];

    // Map of functions for grouping entities based on different characteristics
    const groupingFunctions = {
        sumCoords: e => e.hCoord + e.vCoord,
        diffCoords: e => e.vCoord - e.hCoord,
        hCoord: e => e.hCoord,
        vCoord: e => e.vCoord
    };

    // Map of functions for sorting entities within a group
    const sortingFunctions = {
        hCoord: e => e.hCoord,
        vCoord: e => e.vCoord
    };

    // Group collision rules by their required grouping and sorting strategy to avoid redundant processing
    const processingStrategies = new Map();
    allCollisionRules.forEach(rule => {
        const strategyKey = `${rule.groupingName}_${rule.sortingName}`;
        if (!processingStrategies.has(strategyKey)) {
            processingStrategies.set(strategyKey, {
                groupingKeyExtractor: groupingFunctions[rule.groupingName],
                sortingKeyExtractor: sortingFunctions[rule.sortingName],
                rulesForStrategy: []
            });
        }
        processingStrategies.get(strategyKey).rulesForStrategy.push(rule);
    });

    // Execute each unique processing strategy
    processingStrategies.forEach(strategy => {
        assessPotentialEncounters(initialEntities, strategy.groupingKeyExtractor, strategy.sortingKeyExtractor, strategy.rulesForStrategy);
    });

    // Return the minimum collision time or "SAFE" if no collisions are found
    return minimumEncounterMoment === Infinity ? "SAFE" : minimumEncounterMoment;
}

// Standard input handling for competitive programming environments
const simulationInput = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(ProcessGridEvents(simulationInput));