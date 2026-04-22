let fullInput = '';

process.stdin.on('data', chunk => {
    fullInput += chunk.toString();
});

const PROXIMITY_THRESHOLD = 1e-10;

const checkBoundary = val => val >= -100 && val <= 100;

const deriveConfluence = (segmentA, segmentB) => {
    const [aX, aY, bX, bY] = segmentA;
    const [cX, cY, dX, dY] = segmentB;

    const denomCalc = (bX - aX) * (dY - cY) - (bY - aY) * (dX - cX);

    if (Math.abs(denomCalc) < PROXIMITY_THRESHOLD) {
        return undefined;
    }

    const paramNumR = (dY - cY) * (cX - aX) - (dX - cX) * (cY - aY);
    const paramNumS = (bY - aY) * (cX - aX) - (bX - aX) * (cY - aY);

    const ratioR = paramNumR / denomCalc;

    const intersectX = aX * (1 - ratioR) + bX * ratioR;
    const intersectY = aY * (1 - ratioR) + bY * ratioR;

    if (!checkBoundary(intersectX) || !checkBoundary(intersectY)) {
        return undefined;
    }

    return [intersectX, intersectY];
};

const computeEnclosures = segmentCollection => {
    let regionCount = 1 + segmentCollection.length;
    const distinctCrossings = [];

    for (let i = 0; i < segmentCollection.length; ++i) {
        for (let j = i + 1; j < segmentCollection.length; ++j) {
            const currentCross = deriveConfluence(segmentCollection[i], segmentCollection[j]);

            if (currentCross !== undefined) {
                const isUnique = !distinctCrossings.some(recordedPoint =>
                    (currentCross[0] - recordedPoint[0]) ** 2 +
                    (currentCross[1] - recordedPoint[1]) ** 2 <
                    PROXIMITY_THRESHOLD ** 2
                );

                if (isUnique) {
                    distinctCrossings.push(currentCross);
                }
            }
        }
    }

    regionCount += distinctCrossings.length;
    return regionCount;
};

const processDiagrams = entireFeed => {
    const feedLines = entireFeed.split('\n').filter(Boolean);
    let currentLinePointer = 0;

    while (currentLinePointer < feedLines.length) {
        const segmentQuantity = parseInt(feedLines[currentLinePointer++], 10);

        if (segmentQuantity === 0) {
            break;
        }

        const currentSegments = Array.from({ length: segmentQuantity }, () => {
            const coordinateStrings = feedLines[currentLinePointer++].split(' ');
            return coordinateStrings.map(Number);
        });

        console.log(computeEnclosures(currentSegments));
    }
};

process.stdin.on('end', () => {
    processDiagrams(fullInput);
});