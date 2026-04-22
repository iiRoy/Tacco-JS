const calculateDistances = (rawData) => {
    const [networkSize, junctionA, junctionB] = rawData.trim().split(/\s+/).map(Number);

    const determineShortestRoute = (initialPoint, finalPoint, firstJunction, secondJunction) => {
        const linearDistance = finalPoint - initialPoint;
        const alternativeDistance = Math.abs(initialPoint - firstJunction) + 1 + Math.abs(finalPoint - secondJunction);
        return Math.min(linearDistance, alternativeDistance);
    };

    const allPathLengths = Array.from({ length: networkSize - 1 }, (_, startNodeIndex) => startNodeIndex + 1)
        .flatMap(beginNode =>
            Array.from({ length: networkSize - beginNode }, (_, endNodeOffset) => endNodeOffset + beginNode + 1)
                .map(endNode => determineShortestRoute(beginNode, endNode, junctionA, junctionB))
        );

    const lengthFrequencyMap = allPathLengths.reduce((accumulator, lengthValue) => {
        accumulator[lengthValue] = (accumulator[lengthValue] || 0) + 1;
        return accumulator;
    }, {});

    const resultCollection = Array.from({ length: networkSize - 1 }, (_, index) => lengthFrequencyMap[index + 1] || 0);

    return resultCollection.join('\n');
};

console.log(calculateDistances(require("fs").readFileSync("/dev/stdin", "utf8")));