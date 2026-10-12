const fileSystem = require('fs');

const AREA_COMPARISON_THRESHOLD = 0.0005;

const makePoint = (xCoord, yCoord) => ({ x: xCoord, y: yCoord });

const computeSignedAreaDoubled = (pA, pB, pC) => {
    return (pB.x - pA.x) * (pC.y - pA.y) - (pB.y - pA.y) * (pC.x - pA.x);
};

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInput.trim().split('\n');

const CROSS_PRODUCT_THRESHOLD = 2 * AREA_COMPARISON_THRESHOLD;

processedLines.forEach(currentInputLine => {
    const coordinateValues = currentInputLine.split(' ').map(Number);

    const triangleVertex1 = makePoint(coordinateValues[0], coordinateValues[1]);
    const triangleVertex2 = makePoint(coordinateValues[2], coordinateValues[3]);
    const triangleVertex3 = makePoint(coordinateValues[4], coordinateValues[5]);
    const testPoint = makePoint(coordinateValues[6], coordinateValues[7]);

    const orientation12P = computeSignedAreaDoubled(triangleVertex1, triangleVertex2, testPoint);
    const orientation23P = computeSignedAreaDoubled(triangleVertex2, triangleVertex3, testPoint);
    const orientation31P = computeSignedAreaDoubled(triangleVertex3, triangleVertex1, testPoint);

    const mainTriangleOrientation = computeSignedAreaDoubled(triangleVertex1, triangleVertex2, triangleVertex3);

    let isPointWithinTriangle = false;

    if (Math.abs(mainTriangleOrientation) < CROSS_PRODUCT_THRESHOLD) {
        if (Math.abs(orientation12P) < CROSS_PRODUCT_THRESHOLD &&
            Math.abs(orientation23P) < CROSS_PRODUCT_THRESHOLD &&
            Math.abs(orientation31P) < CROSS_PRODUCT_THRESHOLD) {
            isPointWithinTriangle = true;
        } else {
            isPointWithinTriangle = false;
        }
    } else {
        if (mainTriangleOrientation > 0) {
            isPointWithinTriangle = (orientation12P >= -CROSS_PRODUCT_THRESHOLD &&
                                     orientation23P >= -CROSS_PRODUCT_THRESHOLD &&
                                     orientation31P >= -CROSS_PRODUCT_THRESHOLD);
        } else {
            isPointWithinTriangle = (orientation12P <= CROSS_PRODUCT_THRESHOLD &&
                                     orientation23P <= CROSS_PRODUCT_THRESHOLD &&
                                     orientation31P <= CROSS_PRODUCT_THRESHOLD);
        }
    }

    console.log(isPointWithinTriangle ? "YES" : "NO");
});
