const ROT_POS = 1;
const ROT_NEG = -1;
const LINE_REAR = 2;
const LINE_FORE = -2;
const LINE_MID = 0;

const EPSILON_VAL = 1 / 8192; // Used for float comparisons

// --- Coordinate (Point/Vector) Operations ---
const makeCoord = (x, y) => [x, y]; // Represents a point or vector as [x, y]

const sumCoords = ([ax, ay], [bx, by]) => [ax + bx, ay + by];
const diffCoords = ([ax, ay], [bx, by]) => [ax - bx, ay - by];
const scaleCoord = ([vx, vy], factor) => [vx * factor, vy * factor];
const scaleByFactor = ([vx, vy], factor) => [vx / factor, vy / factor]; // Division
const invertDirection = ([vx, vy]) => [-vx, -vy];

const scalarProduct = ([ax, ay], [bx, by]) => ax * bx + ay * by; // Dot product
const outerProduct = ([ax, ay], [bx, by]) => ax * by - ay * bx; // Cross product (2D equivalent)

const squaredMagnitude = ([vx, vy]) => vx * vx + vy * vy;
const measureMagnitude = (coord) => Math.sqrt(squaredMagnitude(coord));

const normalizeVector = (coord) => {
    const len = measureMagnitude(coord);
    return len > 0 ? scaleByFactor(coord, len) : coord;
};

const turnOrthogonal = ([vx, vy]) => [-vy, vx]; // Rotate 90 degrees counter-clockwise

const degToRad = (val) => val * (Math.PI / 180);

const spinVector = ([vx, vy], angleRad) => {
    const sin_a = Math.sin(angleRad);
    const cos_a = Math.cos(angleRad);
    return [vx * cos_a - vy * sin_a, vx * sin_a + vy * cos_a];
};

const vectorProjection = (targetVec, axisVec) => {
    const denom = squaredMagnitude(axisVec);
    if (denom > EPSILON_VAL) { // Avoid division by zero
        const dot = scalarProduct(targetVec, axisVec);
        return scaleCoord(axisVec, dot / denom);
    }
    return axisVec; // Or makeCoord(0,0) depending on desired behavior for zero axisVec
};

// --- Comparison Operations ---
const approxEqual = (valA, valB) => Math.abs(valA - valB) < EPSILON_VAL;
const areEquivalentCoords = ([ax, ay], [bx, by]) => approxEqual(ax - bx, 0) && approxEqual(ay - by, 0);

const areAlikeDirections = (vec1, vec2) => approxEqual(0, scalarProduct(turnOrthogonal(vec1), vec2)); // Parallel
const arePerpendicularDirections = (vec1, vec2) => approxEqual(0, scalarProduct(vec1, vec2)); // Perpendicular

// --- Segment/Line/Bound Structures ---
const makeSegment = (p1, p2) => [p1, p2]; // Segment as [[x1, y1], [x2, y2]]
const makeStrLine = (baseP, directionV) => [baseP, directionV]; // Line as [[baseX, baseY], [dirX, dirY]]
const makeBound = (minVal, maxVal) => [minVal, maxVal]; // Range as [min, max]

const orderBound = ([minVal, maxVal]) => minVal > maxVal ? [maxVal, minVal] : [minVal, maxVal];
const combineBounds = ([min1, max1], [min2, max2]) => [Math.min(min1, min2), Math.max(max1, max2)];

// --- Segment/Line/Bound Operations ---
const overlapCheck = (minA, maxA, minB, maxB) => minB <= maxA && minA <= maxB;

const boundsIntersect = ([minA, maxA], [minB, maxB]) => overlapCheck(minA, maxA, minB, maxB);

const isUnilateral = ([[baseX, baseY], [dirX, dirY]], [[p1x, p1y], [p2x, p2y]]) => {
    const offset1 = diffCoords([p1x, p1y], [baseX, baseY]);
    const offset2 = diffCoords([p2x, p2y], [baseX, baseY]);
    const normal = turnOrthogonal([dirX, dirY]);
    return scalarProduct(normal, offset1) * scalarProduct(normal, offset2) > 0;
};

const castSegmentShadow = ([[p1x, p1y], [p2x, p2y]], ontoVec) => {
    const ontoUnit = normalizeVector(ontoVec);
    const projMin = scalarProduct(ontoUnit, [p1x, p1y]);
    const projMax = scalarProduct(ontoUnit, [p2x, p2y]);
    return orderBound(makeBound(projMin, projMax));
};

const detectSegmentIntersection = (segA, segB) => {
    const [a1, a2] = segA;
    const [b1, b2] = segB;

    const dirA = diffCoords(a2, a1);
    const dirB = diffCoords(b2, b1);

    const axisA = makeStrLine(a1, dirA);
    const axisB = makeStrLine(b1, dirB);

    if (isUnilateral(axisA, segB)) { return false; }
    if (isUnilateral(axisB, segA)) { return false; }

    if (areAlikeDirections(dirA, dirB)) { // Parallel case
        const shadowA = castSegmentShadow(segA, dirA);
        const shadowB = castSegmentShadow(segB, dirA);
        return boundsIntersect(shadowA, shadowB);
    } else {
        return true; // Non-parallel lines always intersect
    }
};

const pointProjectionOnSegment = ([[p1x, p1y], [p2x, p2y]], [qx, qy]) => {
    const segVec = diffCoords([p2x, p2y], [p1x, p1y]);
    const ptOffset = diffCoords([qx, qy], [p1x, p1y]);
    const rate = scalarProduct(ptOffset, segVec) / squaredMagnitude(segVec);
    const projVec = scaleCoord(segVec, rate);
    return sumCoords([p1x, p1y], projVec);
};

const reflectPointAcrossSegment = (seg, pt) => {
    const projection = pointProjectionOnSegment(seg, pt);
    const vecToProj = diffCoords(projection, pt);
    const doubledVec = scaleCoord(vecToProj, 2);
    return sumCoords(doubledVec, pt);
};

const findSegmentCrossing = ([[a1x, a1y], [a2x, a2y]], [[b1x, b1y], [b2x, b2y]]) => {
    const baseVec = diffCoords([b2x, b2y], [b1x, b1y]);
    const d1Vec = diffCoords([a1x, a1y], [b1x, b1y]);
    const d2Vec = diffCoords([a2x, a2y], [b1x, b1y]);

    const d1 = Math.abs(outerProduct(baseVec, d1Vec));
    const d2 = Math.abs(outerProduct(baseVec, d2Vec));

    const t = d1 / (d1 + d2);
    const x = a1x + (a2x - a1x) * t;
    const y = a1y + (a2y - a1y) * t;
    return makeCoord(x, y);
};

const constrainValue = (val, lower, upper) => Math.max(lower, Math.min(val, upper));

// Note: Original getDistanceLinePoint takes a segment, not a Line class.
const distanceFromSegmentLineToPoint = ([[p1x, p1y], [p2x, p2y]], [qx, qy]) => {
    const segVec = diffCoords([p2x, p2y], [p1x, p1y]);
    const ptOffset = diffCoords([qx, qy], [p1x, p1y]);
    return Math.abs(outerProduct(segVec, ptOffset) / measureMagnitude(segVec));
};

const distanceFromSegmentToPoint = (seg, pt) => {
    const [p1, p2] = seg;
    const vecP2P1 = diffCoords(p2, p1);
    const vecPtP1 = diffCoords(pt, p1);

    if (scalarProduct(vecP2P1, vecPtP1) < 0) {
        return measureMagnitude(vecPtP1);
    }

    const vecP1P2 = diffCoords(p1, p2);
    const vecPtP2 = diffCoords(pt, p2);

    if (scalarProduct(vecP1P2, vecPtP2) < 0) {
        return measureMagnitude(vecPtP2);
    }

    return distanceFromSegmentLineToPoint(seg, pt);
};

const closestSegmentApproach = (segA, segB) => {
    if (detectSegmentIntersection(segA, segB)) {
        return 0;
    }
    const [a1, a2] = segA;
    const [b1, b2] = segB;

    return Math.min(
        distanceFromSegmentToPoint(segA, b1),
        distanceFromSegmentToPoint(segA, b2),
        distanceFromSegmentToPoint(segB, a1),
        distanceFromSegmentToPoint(segB, a2)
    );
};

const orientationTest = ([pAx, pAy], [pBx, pBy], [pCx, pCy]) => {
    const vecAB = diffCoords([pBx, pBy], [pAx, pAy]);
    const vecAC = diffCoords([pCx, pCy], [pAx, pAy]);
    const crossVal = outerProduct(vecAB, vecAC);

    if (crossVal > Number.EPSILON) {
        return ROT_POS; // Counter-clockwise
    }
    if (crossVal < -Number.EPSILON) {
        return ROT_NEG; // Clockwise
    }
    if (scalarProduct(vecAB, vecAC) < -Number.EPSILON) {
        return LINE_REAR; // C is behind A on the line AB
    }
    if (measureMagnitude(vecAB) < measureMagnitude(vecAC)) {
        return LINE_FORE; // C is beyond B on the line AB
    }
    return LINE_MID; // C is on the segment AB
};

const envelopeGenerator = (pointList) => {
    if (pointList.length < 3) {
        return [...pointList]; // Return a copy for immutability
    }

    // Sort by X, then Y
    pointList.sort((a, b) => {
        const [ax, ay] = a;
        const [bx, by] = b;
        return (ax > bx) ? 1 : (ax === bx) ? ((ay > by) ? 1 : -1) : -1;
    });

    const upperHull = [];
    upperHull.push(pointList[0], pointList[1]);

    for (let i = 2; i < pointList.length; ++i) {
        while (upperHull.length >= 2 && orientationTest(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], pointList[i]) === ROT_POS) {
            upperHull.pop();
        }
        upperHull.push(pointList[i]);
    }

    const lowerHull = [];
    lowerHull.push(pointList[pointList.length - 1], pointList[pointList.length - 2]);

    for (let i = pointList.length - 3; i >= 0; --i) {
        while (lowerHull.length >= 2 && orientationTest(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], pointList[i]) === ROT_POS) {
            lowerHull.pop();
        }
        lowerHull.push(pointList[i]);
    }

    // Combine and remove duplicates (first/last points of hulls)
    lowerHull.reverse();
    const finalHull = [];
    for (let i = 0; i < lowerHull.length - 1; ++i) { // Exclude last point to avoid duplicate with upperHull's first
        finalHull.push(lowerHull[i]);
    }
    for (let i = 0; i < upperHull.length - 1; ++i) { // Exclude last point to avoid duplicate with lowerHull's first
        finalHull.push(upperHull[i]);
    }
    return finalHull;
};

const maxHullExtent = (hullPoints) => {
    const numPts = hullPoints.length;
    if (numPts < 2) return 0;
    if (numPts === 2) return measureMagnitude(diffCoords(hullPoints[0], hullPoints[1]));

    // Find initial antipodal pair (min/max Y points)
    let idxA = 0; // index for point 'p'
    let idxB = 0; // index for point 'q'
    for (let i = 1; i < numPts; i++) {
        if (hullPoints[i][1] > hullPoints[idxA][1]) idxA = i; // Max Y
        if (hullPoints[i][1] < hullPoints[idxB][1]) idxB = i; // Min Y
    }

    let maxDistSq = squaredMagnitude(diffCoords(hullPoints[idxA], hullPoints[idxB]));
    let bestA = idxA;
    let bestB = idxB;

    let currentA = idxA;
    let currentB = idxB;

    // Rotating Calipers
    do {
        const nextA = (currentA + 1) % numPts;
        const nextB = (currentB + 1) % numPts;

        const vecA_curr_next = diffCoords(hullPoints[nextA], hullPoints[currentA]);
        const vecB_curr_next = diffCoords(hullPoints[nextB], hullPoints[currentB]);

        // Compare angles using cross product to decide which caliper to advance
        // If cross(vecA, vecB) >= 0, it means vecA is CCW or collinear to vecB, so advance B
        // (This essentially means the angle from vecA to vecB is smaller than from vecB to vecA)
        if (outerProduct(vecA_curr_next, vecB_curr_next) >= 0) {
            currentB = nextB;
        } else {
            currentA = nextA;
        }

        const currentDistSq = squaredMagnitude(diffCoords(hullPoints[currentA], hullPoints[currentB]));
        if (currentDistSq > maxDistSq) {
            maxDistSq = currentDistSq;
            bestA = currentA;
            bestB = currentB;
        }
    } while (currentA !== idxA || currentB !== idxB); // Loop until calipers complete a full rotation

    return Math.sqrt(maxDistSq);
};