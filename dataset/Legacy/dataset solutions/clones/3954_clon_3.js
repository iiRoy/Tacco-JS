function processInputData(rawData) {
    const numLocations = +rawData[0];

    const locationCoordinates = rawData[1].split(/[\s]+/).map(Number);

    const segmentCosts = [];
    let totalDistance = 0;
    const STARTING_POINT_COORDINATE = 0;
    let currentLocation = STARTING_POINT_COORDINATE;

    for (let idx = 0; idx < numLocations; ++idx) {
        const nextLocation = locationCoordinates[idx];
        const currentSegmentDifference = currentLocation - nextLocation;
        segmentCosts.push(currentSegmentDifference);
        totalDistance += Math.abs(currentSegmentDifference);
        currentLocation = nextLocation;
    }

    const ENDING_POINT_COORDINATE = 0;
    const finalSegmentDifference = currentLocation - ENDING_POINT_COORDINATE;
    segmentCosts.push(finalSegmentDifference);
    totalDistance += Math.abs(finalSegmentDifference);

    for (let idx = 0; idx < numLocations; ++idx) {
        const firstRemovedSegmentCost = segmentCosts[idx];
        const secondRemovedSegmentCost = segmentCosts[idx + 1];

        const lengthOfRemovedPath = Math.abs(firstRemovedSegmentCost) + Math.abs(secondRemovedSegmentCost);

        const directReplacementSegmentCost = firstRemovedSegmentCost + secondRemovedSegmentCost;
        const lengthOfDirectPath = Math.abs(directReplacementSegmentCost);

        const modifiedTotalDistance = totalDistance - lengthOfRemovedPath + lengthOfDirectPath;

        console.log(modifiedTotalDistance);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
