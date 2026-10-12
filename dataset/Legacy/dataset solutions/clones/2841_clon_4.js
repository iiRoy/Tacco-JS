function processInput(rawData) {
    const dataLines = rawData.split("\n").filter(Boolean);
    const totalPointsCount = +dataLines[0];

    if (totalPointsCount <= 2) {
        console.log(1);
        return;
    }

    const coordinateSet = dataLines.slice(1).map(line => line.split(' ').map(Number));

    // A generator function to produce string representations of all displacement vectors
    function* createDisplacementVectorKeys(pointsCollection) {
        for (let sourceIndex = 0; sourceIndex < pointsCollection.length; sourceIndex++) {
            for (let destinationIndex = 0; destinationIndex < pointsCollection.length; destinationIndex++) {
                if (sourceIndex === destinationIndex) continue; // Skip vector from a point to itself
                
                const sourcePoint = pointsCollection[sourceIndex];
                const destinationPoint = pointsCollection[destinationIndex];
                
                const xDifference = destinationPoint[0] - sourcePoint[0];
                const yDifference = destinationPoint[1] - sourcePoint[1];
                
                yield `${xDifference}:${yDifference}`; // Using a colon as a separator for the key
            }
        }
    }

    const vectorFrequencyMap = new Map();
    for (const vectorIdentifier of createDisplacementVectorKeys(coordinateSet)) {
        vectorFrequencyMap.set(vectorIdentifier, (vectorFrequencyMap.get(vectorIdentifier) || 0) + 1);
    }

    let maxObservedFrequency = 1; // Initialize to 1 to match original's reduce initial value behavior
    if (vectorFrequencyMap.size > 0) {
        maxObservedFrequency = Math.max(1, ...vectorFrequencyMap.values());
    }

    console.log(totalPointsCount - maxObservedFrequency);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
