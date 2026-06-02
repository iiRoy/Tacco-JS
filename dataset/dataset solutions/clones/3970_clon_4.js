function Main(s) {
    const inputLines = s.split("\n");
    const entityCount = parseInt(inputLines[0]);

    const redEntities = Array.from({ length: entityCount }, (_, index) =>
        inputLines[index + 1].split(" ").map(Number)
    );

    const blueEntities = Array.from({ length: entityCount }, (_, index) =>
        inputLines[index + entityCount + 1].split(" ").map(Number)
    );

    // Sort red entities: primary by x-coordinate ascending, secondary by y-coordinate ascending
    redEntities.sort((first, second) => first[0] - second[0] || first[1] - second[1]);

    // Sort blue entities: primary by x-coordinate ascending, secondary by y-coordinate descending
    blueEntities.sort((first, second) => first[0] - second[0] || second[1] - first[1]);

    // Group blue entities by their x-coordinate into a Map
    // Key: x-coordinate, Value: Array of y-coordinates (already sorted descending due to initial sort)
    const blueCoordMap = new Map();
    for (const [bX, bY] of blueEntities) {
        if (!blueCoordMap.has(bX)) {
            blueCoordMap.set(bX, []);
        }
        blueCoordMap.get(bX).push(bY);
    }

    let totalMatches = 0;

    // Iterate red entities in reverse order (effectively processing from largest x, then largest y)
    for (let i = entityCount - 1; i >= 0; i--) {
        const [rX, rY] = redEntities[i];

        // Get current available blue x-coordinates and sort them descending
        // This ensures we prioritize blue entities with larger x-coordinates, matching original logic
        const currentBlueXKeys = Array.from(blueCoordMap.keys()).sort((x1, x2) => x2 - x1);

        for (const currentBX of currentBlueXKeys) {
            // Check if blue entity's x-coordinate is strictly greater than red entity's x-coordinate
            if (currentBX <= rX) {
                // Since currentBlueXKeys is sorted descending, no further x-coordinates will be valid
                break;
            }

            const blueYValues = blueCoordMap.get(currentBX);
            if (!blueYValues || blueYValues.length === 0) {
                // This x-coordinate might have been emptied by a previous match
                continue;
            }

            // Find the first y-coordinate in the current blueYValues list that is strictly greater than rY.
            // Since blueYValues is sorted descending, this will be the largest y-coordinate that satisfies the condition.
            // This matches the original's greedy choice (smallest y for a given x).
            const yMatchIndex = blueYValues.findIndex(bYVal => bYVal > rY);

            if (yMatchIndex !== -1) {
                totalMatches++;
                // Remove the matched blue entity's y-coordinate
                blueYValues.splice(yMatchIndex, 1);

                // If no y-coordinates remain for this x-coordinate, remove the x-coordinate from the map
                if (blueYValues.length === 0) {
                    blueCoordMap.delete(currentBX);
                }
                // A match was found for the current red entity, move to the next red entity
                break;
            }
        }
    }

    console.log(totalMatches);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
