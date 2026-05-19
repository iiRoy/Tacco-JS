function processInputData(rawData) {
    const lines = rawData.split("\n");
    const RADIX_DECIMAL = 10;

    const initialParams = lines[0].split(" ");
    const shrineCount = parseInt(initialParams[0], RADIX_DECIMAL);
    const templeCount = parseInt(initialParams[1], RADIX_DECIMAL);
    const queryCount = parseInt(initialParams[2], RADIX_DECIMAL);

    const shrineLocations = [];
    for (let idx = 1; idx <= shrineCount; idx++) {
        shrineLocations.push(parseInt(lines[idx], RADIX_DECIMAL));
    }

    const templeLocations = [];
    for (let idx = 1; idx <= templeCount; idx++) {
        templeLocations.push(parseInt(lines[idx + shrineCount], RADIX_DECIMAL));
    }

    let currentLineOffset = 1 + shrineCount + templeCount;

    for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
        const queryLocation = parseInt(lines[currentLineOffset + queryIdx], RADIX_DECIMAL);
        let minMovementForQuery = Infinity;

        for (let shrineIdx = 0; shrineIdx < shrineLocations.length; shrineIdx++) {
            const currentShrineLoc = shrineLocations[shrineIdx];

            for (let templeIdx = shrineIdx; templeIdx < templeLocations.length; templeIdx++) {
                const currentTempleLoc = templeLocations[templeIdx];

                const distanceBetweenShrineAndTemple = Math.abs(currentShrineLoc - currentTempleLoc);
                const distanceQueryToShrine = Math.abs(queryLocation - currentShrineLoc);
                const distanceQueryToTemple = Math.abs(queryLocation - currentTempleLoc);

                const minDistanceToEither = Math.min(distanceQueryToShrine, distanceQueryToTemple);

                const totalCalculatedMovement = distanceBetweenShrineAndTemple + minDistanceToEither;

                minMovementForQuery = Math.min(minMovementForQuery, totalCalculatedMovement);
            }
        }
        console.log("%d", minMovementForQuery);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
