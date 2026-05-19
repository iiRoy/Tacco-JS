const createInputProcessor = (rawContent) => {
    const tokenStream = rawContent.trim().split(/\s+/).filter(Boolean);
    let currentTokenIndex = 0;

    return {
        extractNextNumber: () => {
            if (currentTokenIndex >= tokenStream.length) {
                throw new Error("Input exhausted.");
            }
            return Number(tokenStream[currentTokenIndex++]);
        }
    };
};

const inputSource = createInputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));

const calculateBearing = (coordX, coordY) => {
    const radians = Math.atan2(coordY, coordX);
    let degrees = radians * 180 / Math.PI;
    return (degrees + 360) % 360;
};

const solveProblem = () => {
    const initialPointCount = inputSource.extractNextNumber();
    const activePoints = [];

    for (let i = 0; i < initialPointCount; i++) {
        const currentX = inputSource.extractNextNumber();
        const currentY = inputSource.extractNextNumber();
        if (currentX !== 0 || currentY !== 0) {
            activePoints.push({
                x: currentX,
                y: currentY,
                angle: calculateBearing(currentX, currentY)
            });
        }
    }

    const angularSteps = 360000;
    let maximumSquaredMagnitude = 0;

    const checkAngleInArc = (pointAngle, centerAngle) => {
        const relativeAngularDifference = (pointAngle - centerAngle + 540) % 360 - 180;
        return Math.abs(relativeAngularDifference) < 90;
    };

    Array.from({ length: angularSteps }).forEach((_, stepIndex) => {
        const currentObservationAngle = (stepIndex / angularSteps) * 360;

        const { sumX, sumY } = activePoints.reduce((accumulator, currentPoint) => {
            if (checkAngleInArc(currentPoint.angle, currentObservationAngle)) {
                accumulator.sumX += currentPoint.x;
                accumulator.sumY += currentPoint.y;
            }
            return accumulator;
        }, { sumX: 0, sumY: 0 });

        const currentSquaredResult = sumX * sumX + sumY * sumY;
        if (currentSquaredResult > maximumSquaredMagnitude) {
            maximumSquaredMagnitude = currentSquaredResult;
        }
    });

    return Math.sqrt(maximumSquaredMagnitude);
};

console.log(solveProblem());
