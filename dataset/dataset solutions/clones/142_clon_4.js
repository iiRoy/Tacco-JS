const ANTICLOCKWISE = 1;
const CLOCKWISE = -1;
const BEHIND_ORIGIN = 2;
const AHEAD_ORIGIN = -2;
const ON_SPAN = 0;

const RAD_CONVERSION_FACTOR = Math.PI / 180;
const FLOAT_COMPARISON_EPSILON = 1 / 8192; // Matches original 'equalFloats' threshold

const nearlyEqual = (valA, valB) => Math.abs(valA - valB) < FLOAT_COMPARISON_EPSILON;

const toRadians = (angleDegrees) => angleDegrees * RAD_CONVERSION_FACTOR;

const createPoint = (xCoord, yCoord) => [xCoord, yCoord];

const addPoints = (ptA, ptB) => createPoint(ptA[0] + ptB[0], ptA[1] + ptB[1]);

const subtractPoints = (ptA, ptB) => createPoint(ptA[0] - ptB[0], ptA[1] - ptB[1]);

const scalePoint = (pt, factor) => createPoint(pt[0] * factor, pt[1] * factor);

const dividePoint = (pt, divisor) => createPoint(pt[0] / divisor, pt[1] / divisor);

const squaredMagnitude = (vec) => vec[0] * vec[0] + vec[1] * vec[1];

const vectorMagnitude = (vec) => Math.sqrt(squaredMagnitude(vec));

const normalizeVector = (vec) => {
    const mag = vectorMagnitude(vec);
    return mag > Number.EPSILON ? dividePoint(vec, mag) : createPoint(0, 0);
};

const scalarProduct = (vecA, vecB) => vecA[0] * vecB[0] + vecA[1] * vecB[1];

const pseudoCrossProduct = (vecA, vecB) => vecA[0] * vecB[1] - vecA[1] * vecB[0];

const orthogonalVector = (vec) => createPoint(-vec[1], vec[0]);

const rotateVectorByRadians = (vec, angleRad) => {
    const cosVal = Math.cos(angleRad);
    const sinVal = Math.sin(angleRad);
    return createPoint(
        vec[0] * cosVal - vec[1] * sinVal,
        vec[0] * sinVal + vec[1] * cosVal
    );
};

const rotateVectorByDegrees = (vec, angleDeg) => {
    const angleRad = toRadians(angleDeg);
    return rotateVectorByRadians(vec, angleRad);
};

const arePointsEqual = (ptA, ptB) => nearlyEqual(ptA[0], ptB[0]) && nearlyEqual(ptA[1], ptB[1]);

const areVectorsCollinear = (vecA, vecB) => nearlyEqual(pseudoCrossProduct(vecA, vecB), 0);

const areVectorsOrthogonal = (vecA, vecB) => nearlyEqual(scalarProduct(vecA, vecB), 0);

const clampValue = (val, low, high) => Math.max(low, Math.min(val, high));

const createInterval = (minVal, maxVal) => [minVal, maxVal];

const orderInterval = (interval) => {
    const [lower, upper] = interval;
    return lower > upper ? createInterval(upper, lower) : createInterval(lower, upper);
};

const doIntervalsOverlap = (intA, intB) => intB[0] <= intA[1] && intA[0] <= intB[1];

const projectSpanOnAxis = (span, axisVec) => {
    const unitAxis = normalizeVector(axisVec);
    const proj1 = scalarProduct(unitAxis, span[0]);
    const proj2 = scalarProduct(unitAxis, span[1]);
    return orderInterval(createInterval(proj1, proj2));
};

const getRelativeOrientation = (ptA, ptB, ptC) => {
    const vecAB = subtractPoints(ptB, ptA);
    const vecAC = subtractPoints(ptC, ptA);
    const crossVal = pseudoCrossProduct(vecAB, vecAC);

    if (crossVal > Number.EPSILON) return ANTICLOCKWISE;
    if (crossVal < -Number.EPSILON) return CLOCKWISE;

    const dotVal = scalarProduct(vecAB, vecAC);
    if (dotVal < -Number.EPSILON) return BEHIND_ORIGIN;
    if (squaredMagnitude(vecAB) < squaredMagnitude(vecAC)) return AHEAD_ORIGIN;
    return ON_SPAN;
};

const isSeparatedByLine = (lineBasePoint, lineDirectionVector, span) => {
    const [spanP1, spanP2] = span;
    const normalVector = orthogonalVector(lineDirectionVector);
    
    const vecP1ToBase = subtractPoints(spanP1, lineBasePoint);
    const vecP2ToBase = subtractPoints(spanP2, lineBasePoint);

    const dot1 = scalarProduct(normalVector, vecP1ToBase);
    const dot2 = scalarProduct(normalVector, vecP2ToBase);

    return (dot1 * dot2) > Number.EPSILON;
};

const detectSpanCollision = (span1, span2) => {
    const [s1p1, s1p2] = span1;
    const [s2p1, s2p2] = span2;

    const s1Direction = subtractPoints(s1p2, s1p1);
    const s2Direction = subtractPoints(s2p2, s2p1);

    if (isSeparatedByLine(s1p1, s1Direction, span2)) {
        return false;
    }

    if (isSeparatedByLine(s2p1, s2Direction, span1)) {
        return false;
    }

    if (areVectorsCollinear(s1Direction, s2Direction)) {
        const range1 = projectSpanOnAxis(span1, s1Direction);
        const range2 = projectSpanOnAxis(span2, s1Direction);
        return doIntervalsOverlap(range1, range2);
    } else {
        return true;
    }
};

const findClosestPointOnSpan = (span, targetPoint) => {
    const [sP1, sP2] = span;
    const spanVec = subtractPoints(sP2, sP1);
    const targetToS1 = subtractPoints(targetPoint, sP1);

    const sqMagSpan = squaredMagnitude(spanVec);
    if (nearlyEqual(sqMagSpan, 0)) {
        return sP1;
    }

    const t = scalarProduct(targetToS1, spanVec) / sqMagSpan;
    const clampedT = clampValue(t, 0, 1);

    return addPoints(sP1, scalePoint(spanVec, clampedT));
};

const reflectPointAcrossSpan = (span, targetPoint) => {
    const projectedPoint = findClosestPointOnSpan(span, targetPoint);
    const vecToProjected = subtractPoints(projectedPoint, targetPoint);
    return addPoints(targetPoint, scalePoint(vecToProjected, 2));
};

const findSpanIntersectionPoint = (span1, span2) => {
    const [p1, p2] = span1;
    const [p3, p4] = span2;

    const v1 = subtractPoints(p2, p1);
    const v2 = subtractPoints(p4, p3);
    const v3 = subtractPoints(p1, p3);

    const crossV1V2 = pseudoCrossProduct(v1, v2);

    if (nearlyEqual(crossV1V2, 0)) {
        const s2Dir = subtractPoints(p4, p3);
        const s1P1RelS2P1 = subtractPoints(p1, p3);
        const s1P2RelS2P1 = subtractPoints(p2, p3);

        const d1AbsCross = Math.abs(pseudoCrossProduct(s2Dir, s1P1RelS2P1));
        const d2AbsCross = Math.abs(pseudoCrossProduct(s2Dir, s1P2RelS2P1));
        const t = d1AbsCross / (d1AbsCross + d2AbsCross);
        return addPoints(p1, scalePoint(subtractPoints(p2, p1), t));
    }

    const t = pseudoCrossProduct(v3, v2) / crossV1V2;
    return addPoints(p1, scalePoint(v1, t));
};

const distancePointToLine = (lineSpan, targetPoint) => {
    const [pA, pB] = lineSpan;
    const lineVec = subtractPoints(pB, pA);
    const pointVec = subtractPoints(targetPoint, pA);
    const crossVal = pseudoCrossProduct(lineVec, pointVec);
    const lineMagnitude = vectorMagnitude(lineVec);
    return lineMagnitude > Number.EPSILON ? Math.abs(crossVal) / lineMagnitude : vectorMagnitude(pointVec);
};

const distancePointToSpan = (span, targetPoint) => {
    const [sP1, sP2] = span;
    const vecS1S2 = subtractPoints(sP2, sP1);
    const vecS1P = subtractPoints(targetPoint, sP1);
    const vecS2P = subtractPoints(targetPoint, sP2);

    const dot1 = scalarProduct(vecS1S2, vecS1P);
    if (dot1 < 0) {
        return vectorMagnitude(vecS1P);
    }

    const dot2 = scalarProduct(subtractPoints(sP1, sP2), vecS2P);
    if (dot2 < 0) {
        return vectorMagnitude(vecS2P);
    }
    return distancePointToLine(span, targetPoint);
};

const distanceBetweenSpans = (span1, span2) => {
    if (detectSpanCollision(span1, span2)) {
        return 0;
    }

    const d1 = distancePointToSpan(span1, span2[0]);
    const d2 = distancePointToSpan(span1, span2[1]);
    const d3 = distancePointToSpan(span2, span1[0]);
    const d4 = distancePointToSpan(span2, span1[1]);

    return Math.min(d1, d2, d3, d4);
};

const computeConvexHull = (pointCollection) => {
    const numPoints = pointCollection.length;
    if (numPoints < 3) {
        return [...pointCollection];
    }
    
    pointCollection.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));

    const topChain = [];
    const bottomChain = [];

    for (let i = 0; i < numPoints; ++i) {
        while (topChain.length >= 2 &&
               getRelativeOrientation(topChain[topChain.length - 2],
                               topChain[topChain.length - 1],
                               pointCollection[i]) !== ANTICLOCKWISE) {
            topChain.pop();
        }
        topChain.push(pointCollection[i]);
    }

    for (let i = numPoints - 1; i >= 0; --i) {
        while (bottomChain.length >= 2 &&
               getRelativeOrientation(bottomChain[bottomChain.length - 2],
                               bottomChain[bottomChain.length - 1],
                               pointCollection[i]) !== ANTICLOCKWISE) {
            bottomChain.pop();
        }
        bottomChain.push(pointCollection[i]);
    }

    bottomChain.pop();
    topChain.pop();

    return topChain.concat(bottomChain.reverse());
};

const calculateFarthestPairDistance = (convexPolygonPoints) => {
    const numVertices = convexPolygonPoints.length;
    if (numVertices <= 1) return 0;
    if (numVertices === 2) return vectorMagnitude(subtractPoints(convexPolygonPoints[0], convexPolygonPoints[1]));

    let maxDistSq = 0;

    let minYIdx = 0;
    let maxYIdx = 0;
    for (let i = 1; i < numVertices; i++) {
        if (convexPolygonPoints[i][1] < convexPolygonPoints[minYIdx][1]) minYIdx = i;
        if (convexPolygonPoints[i][1] > convexPolygonPoints[maxYIdx][1]) maxYIdx = i;
    }

    let currentMinYIdx = minYIdx;
    let currentMaxYIdx = maxYIdx;
    const initialMinYIdx = minYIdx;
    const initialMaxYIdx = maxYIdx;

    do {
        const p_i = convexPolygonPoints[currentMinYIdx];
        const p_i_next = convexPolygonPoints[(currentMinYIdx + 1) % numVertices];
        const p_j = convexPolygonPoints[currentMaxYIdx];
        const p_j_next = convexPolygonPoints[(currentMaxYIdx + 1) % numVertices];

        const edge_i = subtractPoints(p_i_next, p_i);
        const edge_j = subtractPoints(p_j_next, p_j);

        if (pseudoCrossProduct(edge_i, edge_j) >= 0) {
            currentMaxYIdx = (currentMaxYIdx + 1) % numVertices;
        } else {
            currentMinYIdx = (currentMinYIdx + 1) % numVertices;
        }

        const currentDistanceSq = squaredMagnitude(subtractPoints(convexPolygonPoints[currentMinYIdx], convexPolygonPoints[currentMaxYIdx]));
        if (currentDistanceSq > maxDistSq) {
            maxDistSq = currentDistanceSq;
        }
    } while (currentMinYIdx !== initialMinYIdx || currentMaxYIdx !== initialMaxYIdx);

    return Math.sqrt(maxDistSq);
};