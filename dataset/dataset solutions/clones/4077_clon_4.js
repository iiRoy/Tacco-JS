const processInput = (rawText) => {
    const lines = rawText.trim().split('\n');
    const [pointCountVal, gridParam] = lines[0].split(' ').map(Number);

    const pointRegistry = lines.slice(1).map(line => {
        const [px, py, pColorChar] = line.split(' ');
        return {
            xCoord: Number(px),
            yCoord: Number(py),
            colorVal: pColorChar === 'W'
        };
    });

    return { pointCount: pointCountVal, gridSize: gridParam, points: pointRegistry };
};

const determineFieldColor = (tx, ty, relX, relY, basePatternColor, gDim) => {
    const xBlockDiffParity = (Math.floor((tx - relX) / gDim) % 2) !== 0;
    const yBlockDiffParity = (Math.floor((ty - relY) / gDim) % 2) !== 0;
    return basePatternColor ^ xBlockDiffParity ^ yBlockDiffParity;
};

const generateResult = (inputData) => {
    const { pointCount, gridSize, points } = processInput(inputData);

    if (pointCount === 0) {
        return 0;
    }

    const initialReferenceColor = points[0].colorVal;

    let maxScore = 0;

    for (let relativeX = 0; relativeX < gridSize; relativeX++) {
        for (let relativeY = 0; relativeY < gridSize; relativeY++) {
            let currentScore = 0;
            for (const observedPoint of points) {
                const predictedColor = determineFieldColor(
                    observedPoint.xCoord,
                    observedPoint.yCoord,
                    relativeX,
                    relativeY,
                    initialReferenceColor,
                    gridSize
                );

                if (predictedColor === observedPoint.colorVal) {
                    currentScore++;
                }
            }
            if (currentScore > maxScore) {
                maxScore = currentScore;
            }
        }
    }

    return maxScore;
};

const runApplication = (rawInput) => {
    console.log(generateResult(rawInput));
};

runApplication(require("fs").readFileSync("/dev/stdin", "utf8"));