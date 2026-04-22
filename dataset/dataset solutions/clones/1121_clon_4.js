const M = Math;
const PI_VALUE = M.PI;
const FLOAT_THRESHOLD_VAL = 1 / 8192;

const createCoord = (h, v) => ({ h, v });
const createEdge = (start, end) => ({ start, end });
const createBeam = (anchor, vector) => ({ anchor, vector });
const createInterval = (low, high) => ({ low, high });

const addCoords = (c1, c2) => createCoord(c1.h + c2.h, c1.v + c2.v);
const subCoords = (c1, c2) => createCoord(c1.h - c2.h, c1.v - c2.v);
const scaleCoord = (c, s) => createCoord(c.h * s, c.v * s);
const inverseCoord = (c) => createCoord(-c.h, -c.v);

const scalarProd = (c1, c2) => c1.h * c2.h + c1.v * c2.v;
const wedgeProd = (c1, c2) => c1.h * c2.v - c1.v * c2.h;

const normSquared = (c) => scalarProd(c, c);
const getMagnitude = (c) => M.sqrt(normSquared(c));

const deriveDirection = (c) => {
    const len = getMagnitude(c);
    if (len > FLOAT_THRESHOLD_VAL) {
        return scaleCoord(c, 1 / len);
    }
    return createCoord(0, 0);
};

const rotateQuarter = (c) => createCoord(-c.v, c.h);

const floatCompare = (val1, val2) => M.abs(val1 - val2) < FLOAT_THRESHOLD_VAL;

const angleToArc = (degrees) => degrees * PI_VALUE / 180;

const orientByDegree = (c, degrees) => {
    const arc = angleToArc(degrees);
    const sn = M.sin(arc);
    const cs = M.cos(arc);
    return createCoord(
        c.h * cs - c.v * sn,
        c.h * sn + c.v * cs
    );
};

const comparePositions = (p1, p2) => floatCompare(p1.h - p2.h, 0) && floatCompare(p1.v - p2.v, 0);

const checkLinearity = (c1, c2) => floatCompare(0, scalarProd(rotateQuarter(c1), c2));
const checkPerpendicularity = (c1, c2) => floatCompare(0, scalarProd(c1, c2));

const relativePlacement = (lineObj, edge) => {
    const firstOffset = subCoords(edge.start, lineObj.anchor);
    const secondOffset = subCoords(edge.end, lineObj.anchor);
    const normalVector = rotateQuarter(lineObj.vector);
    return scalarProd(normalVector, firstOffset) * scalarProd(normalVector, secondOffset) > 0;
};

const orderInterval = (interval) => {
    return createInterval(M.min(interval.low, interval.high), M.max(interval.low, interval.high));
};

const extentOverlap = (int1, int2) => {
    return int2.low <= int1.high && int1.low <= int2.high;
};

const linearProjection = (edge, axis) => {
    const unitAxis = deriveDirection(axis);
    const projStart = scalarProd(unitAxis, edge.start);
    const projEnd = scalarProd(unitAxis, edge.end);
    return orderInterval(createInterval(projStart, projEnd));
};

const segmentClash = (edge1, edge2) => {
    const beamA = createBeam(edge1.start, subCoords(edge1.end, edge1.start));
    const beamB = createBeam(edge2.start, subCoords(edge2.end, edge2.start));

    if (relativePlacement(beamA, edge2) || relativePlacement(beamB, edge1)) {
        return false;
    }

    if (checkLinearity(beamA.vector, beamB.vector)) {
        const rangeA = linearProjection(edge1, beamA.vector);
        const rangeB = linearProjection(edge2, beamA.vector);
        return extentOverlap(rangeA, rangeB);
    } else {
        return true;
    }
};

const combineExtents = (int1, int2) => {
    return createInterval(M.min(int1.low, int2.low), M.max(int1.high, int2.high));
};

const componentAlong = (projCoord, ontoCoord) => {
    const denom = normSquared(ontoCoord);
    if (denom < FLOAT_THRESHOLD_VAL) {
        return ontoCoord;
    }
    const dotP = scalarProd(projCoord, ontoCoord);
    return scaleCoord(ontoCoord, dotP / denom);
};

const perpendicularDrop = (edge, spot) => {
    const vec1 = subCoords(edge.end, edge.start);
    const vec2 = subCoords(spot, edge.start);
    const rate = scalarProd(vec2, vec1) / normSquared(vec1);
    const vec3 = scaleCoord(vec1, rate);
    return addCoords(edge.start, vec3);
};

const reflectLocation = (edge, spot) => {
    const proj = perpendicularDrop(edge, spot);
    const disp = subCoords(proj, spot);
    return addCoords(scaleCoord(disp, 2), spot);
};

const meetingPoint = (edge1, edge2) => {
    const baseVec = subCoords(edge2.end, edge2.start);
    const d1Vec = subCoords(edge1.start, edge2.start);
    const d2Vec = subCoords(edge1.end, edge2.start);
    const d1 = M.abs(wedgeProd(baseVec, d1Vec));
    const d2 = M.abs(wedgeProd(baseVec, d2Vec));
    const t = d1 / (d1 + d2);
    const x = edge1.start.h + (edge1.end.h - edge1.start.h) * t;
    const y = edge1.start.v + (edge1.end.v - edge1.start.v) * t;
    return createCoord(x, y);
};

const constrainValue = (val, minBound, maxBound) => {
    if (val < minBound) return minBound;
    if (val > maxBound) return maxBound;
    return val;
};

const linePerpDistance = (edge, spot) => {
    const vec1 = subCoords(edge.end, edge.start);
    const vec2 = subCoords(spot, edge.start);
    return M.abs(wedgeProd(vec1, vec2) / getMagnitude(vec1));
};

const pointToSegmentDistance = (edge, spot) => {
    if (scalarProd(subCoords(edge.end, edge.start), subCoords(spot, edge.start)) < 0) {
        return getMagnitude(subCoords(spot, edge.start));
    }
    if (scalarProd(subCoords(edge.start, edge.end), subCoords(spot, edge.end)) < 0) {
        return getMagnitude(subCoords(spot, edge.end));
    }
    return linePerpDistance(edge, spot);
};

const edgeToEdgeDistance = (edge1, edge2) => {
    if (segmentClash(edge1, edge2)) {
        return 0;
    }
    const dist1 = M.min(pointToSegmentDistance(edge1, edge2.start), pointToSegmentDistance(edge1, edge2.end));
    const dist2 = M.min(pointToSegmentDistance(edge2, edge1.start), pointToSegmentDistance(edge2, edge1.end));
    return M.min(dist1, dist2);
};

const fileIO = require('fs');
const rawData = fileIO.readFileSync('/dev/stdin', 'utf8');

const lineArray = rawData.trim().split("\n");
const nodeCount = Number(lineArray[0]);

const vertices = lineArray.slice(1).map(line => {
    const numericValues = line.split(" ").map(Number);
    return createCoord(numericValues[0], numericValues[1]);
});

let areaAccumulator = wedgeProd(vertices[nodeCount - 1], vertices[0]);

for (let idx = 0; idx < nodeCount - 1; ++idx) {
    areaAccumulator += wedgeProd(vertices[idx], vertices[idx + 1]);
}

const finalArea = M.abs(areaAccumulator) / 2;

console.log(finalArea.toFixed(1));