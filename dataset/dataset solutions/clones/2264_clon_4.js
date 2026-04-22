const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const allLines = fileContent.split('\n').filter(ln => ln.trim().length > 0);
let currentLineIdx = 0;

const retrieveNumber = () => parseInt(allLines[currentLineIdx++], 10);
const retrievePointData = (numPts) => {
    const ptCollection = [];
    for (let i = 0; i < numPts; ++i) {
        const parts = allLines[currentLineIdx++].split(' ').map(Number);
        ptCollection.push({ xVal: parts[0], yVal: parts[1] });
    }
    return ptCollection;
};

const EPSILON_VAL = 1e-9;
const INCLUSION_FACTOR = 1 - EPSILON_VAL;

const calculateSquareDistance = (pointA, pointB) => {
    const diffX = pointA.xVal - pointB.xVal;
    const diffY = pointA.yVal - pointB.yVal;
    return diffX * diffX + diffY * diffY;
};

const checkPointInCircle = (pnt, circObj) => {
    const distFromCenter = Math.sqrt(calculateSquareDistance(pnt, { xVal: circObj.cX, yVal: circObj.cY }));
    return distFromCenter <= circObj.rad / INCLUSION_FACTOR + EPSILON_VAL;
};

const createCircleFromSinglePoint = (pnt) => {
    return { cX: pnt.xVal, cY: pnt.yVal, rad: 0 };
};

const createCircleFromTwoPoints = (pntA, pntB) => {
    const midX = (pntA.xVal + pntB.xVal) / 2;
    const midY = (pntA.yVal + pntB.yVal) / 2;
    const radius = Math.sqrt(calculateSquareDistance(pntA, pntB)) / 2;
    return { cX: midX, cY: midY, rad: radius };
};

const createCircleFromThreePoints = (pntA, pntB, pntC) => {
    const xA = pntA.xVal, yA = pntA.yVal;
    const xB = pntB.xVal, yB = pntB.yVal;
    const xC = pntC.xVal, yC = pntC.yVal;

    const term1 = xA * xA + yA * yA;
    const term2 = xB * xB + yB * yB;
    const term3 = xC * xC + yC * yC;

    const D = 2 * (xA * (yB - yC) + xB * (yC - yA) + xC * (yA - yB));

    if (Math.abs(D) < EPSILON_VAL) {
        const sqDab = calculateSquareDistance(pntA, pntB);
        const sqDbc = calculateSquareDistance(pntB, pntC);
        const sqDac = calculateSquareDistance(pntA, pntC);

        if (sqDab >= sqDbc && sqDab >= sqDac) {
            return createCircleFromTwoPoints(pntA, pntB);
        } else if (sqDbc >= sqDab && sqDbc >= sqDac) {
            return createCircleFromTwoPoints(pntB, pntC);
        } else {
            return createCircleFromTwoPoints(pntA, pntC);
        }
    }

    const cX_val = (term1 * (yB - yC) + term2 * (yC - yA) + term3 * (yA - yB)) / D;
    const cY_val = (term1 * (xC - xB) + term2 * (xA - xC) + term3 * (xB - xA)) / D;

    const radius = Math.sqrt(calculateSquareDistance(pntA, { xVal: cX_val, yVal: cY_val }));
    return { cX: cX_val, cY: cY_val, rad: radius };
};

const getBoundaryCircle = (boundaryPoints) => {
    if (boundaryPoints.length === 0) {
        return { cX: 0, cY: 0, rad: 0 };
    }
    if (boundaryPoints.length === 1) {
        return createCircleFromSinglePoint(boundaryPoints[0]);
    }
    if (boundaryPoints.length === 2) {
        return createCircleFromTwoPoints(boundaryPoints[0], boundaryPoints[1]);
    }
    if (boundaryPoints.length === 3) {
        return createCircleFromThreePoints(boundaryPoints[0], boundaryPoints[1], boundaryPoints[2]);
    }
    throw new Error("Invalid number of boundary points for circle determination.");
};

const welzlRecursiveSolver = (currentPoints, boundaryPoints) => {
    if (currentPoints.length === 0 || boundaryPoints.length === 3) {
        return getBoundaryCircle(boundaryPoints);
    }

    const pntIdx = Math.floor(Math.random() * currentPoints.length);
    const currentPoint = currentPoints[pntIdx];
    currentPoints.splice(pntIdx, 1);

    const candidateCircle = welzlRecursiveSolver(currentPoints, boundaryPoints);

    if (checkPointInCircle(currentPoint, candidateCircle)) {
        return candidateCircle;
    } else {
        boundaryPoints.push(currentPoint);
        const finalCircle = welzlRecursiveSolver(currentPoints, boundaryPoints);
        boundaryPoints.pop();
        return finalCircle;
    }
};

const computeSmallestEnclosingCircle = (allInputPoints) => {
    if (allInputPoints.length === 0) {
        return { cX: 0, cY: 0, rad: 0 };
    }
    const shuffledPoints = [...allInputPoints];
    for (let i = shuffledPoints.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPoints[i], shuffledPoints[j]] = [shuffledPoints[j], shuffledPoints[i]];
    }

    return welzlRecursiveSolver(shuffledPoints, []);
};

const primaryExecution = () => {
    const totalPointsCount = retrieveNumber();
    const allInputPoints = retrievePointData(totalPointsCount);

    const resultCircle = computeSmallestEnclosingCircle(allInputPoints);

    return resultCircle.rad;
};

console.log(primaryExecution());