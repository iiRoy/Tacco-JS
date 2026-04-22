function assessTerritoryConflict(historicalRecords) {
    const numericalObservations = historicalRecords.match(/-?\d+/g).map(Number);

    const firstDimensionCount = numericalObservations[0];
    const primaryThreshold = numericalObservations[2];
    const secondaryThreshold = numericalObservations[3];

    if (primaryThreshold >= secondaryThreshold) {
        return "War";
    }

    const primaryInfluencePoints = numericalObservations.slice(4, 4 + firstDimensionCount);
    const secondaryInfluencePoints = numericalObservations.slice(4 + firstDimensionCount);

    const highestPrimaryEffect = Math.max(primaryThreshold, ...primaryInfluencePoints);
    const lowestSecondaryEffect = Math.min(secondaryThreshold, ...secondaryInfluencePoints);

    return (lowestSecondaryEffect >= highestPrimaryEffect) ? "War" : "No War";
}

console.log(assessTerritoryConflict(require("fs").readFileSync("/dev/stdin", "utf8")));