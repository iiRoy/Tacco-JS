function processInput(inputLines) {
    const pointCount = Number(inputLines[0]);

    const pointCoordinates = inputLines.slice(1, pointCount + 1).map(line =>
        line.split(" ").map(Number)
    );

    const distanceMatrix = Array.from({ length: pointCount }, () =>
        Array(pointCount).fill(0)
    );

    for (let pIdx = 0; pIdx < pointCount; pIdx++) {
        for (let qIdx = pIdx + 1; qIdx < pointCount; qIdx++) {
            const dist = euclideanDistance(pointCoordinates[pIdx], pointCoordinates[qIdx]);
            distanceMatrix[pIdx][qIdx] = dist;
            distanceMatrix[qIdx][pIdx] = dist;
        }
    }

    const initialIndices = Array.from({ length: pointCount }, (_, i) => i);
    const allPossibleRoutes = generateAllPermutations(initialIndices);

    const totalPathSum = allPossibleRoutes.reduce((accumulator, currentRoute) => {
        return accumulator + computePathLength(distanceMatrix, currentRoute);
    }, 0);

    console.log(totalPathSum / allPossibleRoutes.length);
}

function computePathLength(distMapRef, currentRoute) {
    return currentRoute.slice(1).reduce((segmentSum, currentPointIdx, index) => {
        const previousPointIdx = currentRoute[index];
        return segmentSum + distMapRef[previousPointIdx][currentPointIdx];
    }, 0);
}

function euclideanDistance(coordA, coordB) {
    const deltaX = coordA[0] - coordB[0];
    const deltaY = coordA[1] - coordB[1];
    return Math.hypot(deltaX, deltaY);
}

function generateAllPermutations(elementsToPermute) {
    if (elementsToPermute.length === 0) {
        return [[]];
    }

    if (elementsToPermute.length === 1) {
        return [[elementsToPermute[0]]];
    }

    const permutationCollection = [];

    elementsToPermute.forEach((currentElement, elementIndex) => {
        const remainingElements = elementsToPermute.filter((_, idx) => idx !== elementIndex);
        const subPermutations = generateAllPermutations(remainingElements);

        subPermutations.forEach(subP => {
            permutationCollection.push([currentElement, ...subP]);
        });
    });

    return permutationCollection;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
