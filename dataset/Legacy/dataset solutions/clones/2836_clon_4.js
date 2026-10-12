function Main(input) {
    const pointCount = parseInt(input.shift());
    const rawData = input;

    const directionalBounds = new Map([
        ['L', { xMin: Number.MAX_SAFE_INTEGER, xMax: Number.MIN_SAFE_INTEGER, yMin: Number.MAX_SAFE_INTEGER, yMax: Number.MIN_SAFE_INTEGER, present: false }],
        ['R', { xMin: Number.MAX_SAFE_INTEGER, xMax: Number.MIN_SAFE_INTEGER, yMin: Number.MAX_SAFE_INTEGER, yMax: Number.MIN_SAFE_INTEGER, present: false }],
        ['U', { xMin: Number.MAX_SAFE_INTEGER, xMax: Number.MIN_SAFE_INTEGER, yMin: Number.MAX_SAFE_INTEGER, yMax: Number.MIN_SAFE_INTEGER, present: false }],
        ['D', { xMin: Number.MAX_SAFE_INTEGER, xMax: Number.MIN_SAFE_INTEGER, yMin: Number.MAX_SAFE_INTEGER, yMax: Number.MIN_SAFE_INTEGER, present: false }],
    ]);

    let combinedLR_YMin = Number.MAX_SAFE_INTEGER;
    let combinedLR_YMax = Number.MIN_SAFE_INTEGER;
    let combinedUD_XMin = Number.MAX_SAFE_INTEGER;
    let combinedUD_XMax = Number.MIN_SAFE_INTEGER;

    let hasLRPoints = false;
    let hasUDPoints = false;

    for (let i = 0; i < pointCount; i++) {
        const currentXCoord = parseInt(rawData[i * 3]);
        const currentYCoord = parseInt(rawData[i * 3 + 1]);
        const pointDirection = rawData[i * 3 + 2];

        const currentDirectionalData = directionalBounds.get(pointDirection);
        if (currentDirectionalData) {
            currentDirectionalData.xMin = Math.min(currentDirectionalData.xMin, currentXCoord);
            currentDirectionalData.xMax = Math.max(currentDirectionalData.xMax, currentXCoord);
            currentDirectionalData.yMin = Math.min(currentDirectionalData.yMin, currentYCoord);
            currentDirectionalData.yMax = Math.max(currentDirectionalData.yMax, currentYCoord);
            currentDirectionalData.present = true;

            if (pointDirection === 'L' || pointDirection === 'R') {
                combinedLR_YMin = Math.min(combinedLR_YMin, currentYCoord);
                combinedLR_YMax = Math.max(combinedLR_YMax, currentYCoord);
                hasLRPoints = true;
            }
            if (pointDirection === 'U' || pointDirection === 'D') {
                combinedUD_XMin = Math.min(combinedUD_XMin, currentXCoord);
                combinedUD_XMax = Math.max(combinedUD_XMax, currentXCoord);
                hasUDPoints = true;
            }
        }
    }

    const lData = directionalBounds.get('L');
    const rData = directionalBounds.get('R');
    const uData = directionalBounds.get('U');
    const dData = directionalBounds.get('D');

    const retrieveBoundValue = (boundObject, propertyName, defaultValue) =>
        boundObject.present ? boundObject[propertyName] : defaultValue;

    const computeOverallXMin = (timeMoment) => {
        const lXMinAtMoment = retrieveBoundValue(lData, 'xMin', Number.MAX_SAFE_INTEGER) - timeMoment;
        const rXMinAtMoment = retrieveBoundValue(rData, 'xMin', Number.MAX_SAFE_INTEGER) + timeMoment;
        const udXMinAtMoment = hasUDPoints ? combinedUD_XMin : Number.MAX_SAFE_INTEGER;
        return Math.min(lXMinAtMoment, rXMinAtMoment, udXMinAtMoment);
    };

    const computeOverallXMax = (timeMoment) => {
        const lXMaxAtMoment = retrieveBoundValue(lData, 'xMax', Number.MIN_SAFE_INTEGER) - timeMoment;
        const rXMaxAtMoment = retrieveBoundValue(rData, 'xMax', Number.MIN_SAFE_INTEGER) + timeMoment;
        const udXMaxAtMoment = hasUDPoints ? combinedUD_XMax : Number.MIN_SAFE_INTEGER;
        return Math.max(lXMaxAtMoment, rXMaxAtMoment, udXMaxAtMoment);
    };

    const computeOverallYMin = (timeMoment) => {
        const lrYMinAtMoment = hasLRPoints ? combinedLR_YMin : Number.MAX_SAFE_INTEGER;
        const uYMinAtMoment = retrieveBoundValue(uData, 'yMin', Number.MAX_SAFE_INTEGER) + timeMoment;
        const dYMinAtMoment = retrieveBoundValue(dData, 'yMin', Number.MAX_SAFE_INTEGER) - timeMoment;
        return Math.min(lrYMinAtMoment, uYMinAtMoment, dYMinAtMoment);
    };

    const computeOverallYMax = (timeMoment) => {
        const lrYMaxAtMoment = hasLRPoints ? combinedLR_YMax : Number.MIN_SAFE_INTEGER;
        const uYMaxAtMoment = retrieveBoundValue(uData, 'yMax', Number.MIN_SAFE_INTEGER) + timeMoment;
        const dYMaxAtMoment = retrieveBoundValue(dData, 'yMax', Number.MIN_SAFE_INTEGER) - timeMoment;
        return Math.max(lrYMaxAtMoment, uYMaxAtMoment, dYMaxAtMoment);
    };

    const calculateEnclosingArea = (timeMoment) => {
        const currentMinX = computeOverallXMin(timeMoment);
        const currentMaxX = computeOverallXMax(timeMoment);
        const currentMinY = computeOverallYMin(timeMoment);
        const currentMaxY = computeOverallYMax(timeMoment);
        return (currentMaxX - currentMinX) * (currentMaxY - currentMinY);
    };

    const candidateTimePoints = new Set([0]);

    if (lData.present && rData.present) {
        const t1 = (lData.xMin - rData.xMin) / 2; if (t1 >= 0) candidateTimePoints.add(t1);
        const t2 = (lData.xMax - rData.xMax) / 2; if (t2 >= 0) candidateTimePoints.add(t2);
    }
    if (lData.present && hasUDPoints) {
        const t1 = lData.xMin - combinedUD_XMin; if (t1 >= 0) candidateTimePoints.add(t1);
        const t2 = lData.xMax - combinedUD_XMax; if (t2 >= 0) candidateTimePoints.add(t2);
    }
    if (rData.present && hasUDPoints) {
        const t1 = combinedUD_XMin - rData.xMin; if (t1 >= 0) candidateTimePoints.add(t1);
        const t2 = combinedUD_XMax - rData.xMax; if (t2 >= 0) candidateTimePoints.add(t2);
    }

    if (uData.present && dData.present) {
        const t1 = (dData.yMin - uData.yMin) / 2; if (t1 >= 0) candidateTimePoints.add(t1);
        const t2 = (dData.yMax - uData.yMax) / 2; if (t2 >= 0) candidateTimePoints.add(t2);
    }
    if (uData.present && hasLRPoints) {
        const t1 = combinedLR_YMin - uData.yMin; if (t1 >= 0) candidateTimePoints.add(t1);
        const t2 = combinedLR_YMax - uData.yMax; if (t2 >= 0) candidateTimePoints.add(t2);
    }
    if (dData.present && hasLRPoints) {
        const t1 = dData.yMin - combinedLR_YMin; if (t1 >= 0) candidateTimePoints.add(t1);
        const t2 = dData.yMax - combinedLR_YMax; if (t2 >= 0) candidateTimePoints.add(t2);
    }

    let minimumBoundingArea = Number.MAX_SAFE_INTEGER;

    for (const timeValue of Array.from(candidateTimePoints).sort((a, b) => a - b)) {
        minimumBoundingArea = Math.min(minimumBoundingArea, calculateEnclosingArea(timeValue));
    }

    console.log(minimumBoundingArea);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
