const POS_SIDE = 1;
const NEG_SIDE = -1;
const ON_PLANE = 0;
const GEOMETRY_TOLERANCE = 1e-5;

class SpatialVector {
    constructor(xVal, yVal, zVal) {
        this.xVal = xVal;
        this.yVal = yVal;
        this.zVal = zVal;
    }

    scalarProduct(otherVec) {
        return this.xVal * otherVec.xVal + this.yVal * otherVec.yVal + this.zVal * otherVec.zVal;
    }

    subtract(otherVec) {
        return new SpatialVector(this.xVal - otherVec.xVal, this.yVal - otherVec.yVal, this.zVal - otherVec.zVal);
    }

    add(otherVec) {
        return new SpatialVector(this.xVal + otherVec.xVal, this.yVal + otherVec.yVal, this.zVal + otherVec.zVal);
    }

    scale(factor) {
        return new SpatialVector(this.xVal * factor, this.yVal * factor, this.zVal * factor);
    }

    normalize() {
        let magnitude = Math.sqrt(this.xVal * this.xVal + this.yVal * this.yVal + this.zVal * this.zVal);
        if (magnitude === 0) return new SpatialVector(0, 0, 0); // Handle zero vector
        return new SpatialVector(this.xVal / magnitude, this.yVal / magnitude, this.zVal / magnitude);
    }

    crossProduct(otherVec) {
        return new SpatialVector(
            this.yVal * otherVec.zVal - this.zVal * otherVec.yVal,
            this.zVal * otherVec.xVal - this.xVal * otherVec.zVal,
            this.xVal * otherVec.yVal - this.yVal * otherVec.xVal
        );
    }

    transformVectorByMatrix(matrixObj) {
        let m = matrixObj.elements;
        let x = this.xVal, y = this.yVal, z = this.zVal;
        let w = 0; // Homogeneous coordinate for vectors

        let newX = m[0] * x + m[1] * y + m[2] * z + m[3] * w;
        let newY = m[4] * x + m[5] * y + m[6] * z + m[7] * w;
        let newZ = m[8] * x + m[9] * y + m[10] * z + m[11] * w;
        return new SpatialVector(newX, newY, newZ).normalize();
    }
}

class PointDatum extends SpatialVector {
    constructor(x, y, z) {
        super(x, y, z);
    }

    transformByMatrix(matrixObj) {
        let m = matrixObj.elements;
        let x = this.xVal, y = this.yVal, z = this.zVal;
        let w = 1; // Homogeneous coordinate for points

        let newX = m[0] * x + m[1] * y + m[2] * z + m[3] * w;
        let newY = m[4] * x + m[5] * y + m[6] * z + m[7] * w;
        let newZ = m[8] * x + m[9] * y + m[10] * z + m[11] * w;
        let newW = m[12] * x + m[13] * y + m[14] * z + m[15] * w;

        return new PointDatum(newX / newW, newY / newW, newZ / newW);
    }
}

class SurfaceEquation {
    constructor(normalVector, distFromOrigin) {
        this.normalVector = normalVector.normalize();
        this.distFromOrigin = distFromOrigin;
    }

    static fromThreePoints(pA, pB, pC) {
        let vecAB = pB.subtract(pA);
        let vecAC = pC.subtract(pA);
        let normal = vecAB.crossProduct(vecAC).normalize();
        let distance = normal.scalarProduct(pA);
        return new SurfaceEquation(normal, distance);
    }

    classifyPoint(point, tolerance = GEOMETRY_TOLERANCE) {
        let distance = this.normalVector.scalarProduct(point) - this.distFromOrigin;
        if (distance < -tolerance) return NEG_SIDE;
        if (distance > tolerance) return POS_SIDE;
        return ON_PLANE;
    }

    applyTransform(matrixObj) {
        let transformedNormal = this.normalVector.transformVectorByMatrix(matrixObj.getInverseTranspose());
        let pointOnPlane = this.normalVector.scale(this.distFromOrigin);
        let transformedPointOnPlane = pointOnPlane.transformByMatrix(matrixObj);

        let newDistance = transformedNormal.scalarProduct(transformedPointOnPlane);
        return new SurfaceEquation(transformedNormal, newDistance);
    }

    reversed() {
        return new SurfaceEquation(this.normalVector.scale(-1), -this.distFromOrigin);
    }
}

class FaceElement {
    constructor(vertexList, sharedData, surfaceEquation) {
        this.vertexList = vertexList;
        this.sharedData = sharedData || {};
        this.surfaceEquation = surfaceEquation || SurfaceEquation.fromThreePoints(vertexList[0], vertexList[1], vertexList[2]);
    }

    reorient() {
        let newVertices = [...this.vertexList].reverse();
        let newSurface = this.surfaceEquation.reversed();
        return new FaceElement(newVertices, this.sharedData, newSurface);
    }

    applyTransform(matrixObj) {
        let newVertices = this.vertexList.map(v => v.transformByMatrix(matrixObj));
        let newSurface = this.surfaceEquation.applyTransform(matrixObj);
        // Note: isMirroring logic omitted for Type IV divergence (requires matrix decomposition)
        return new FaceElement(newVertices, this.sharedData, newSurface);
    }
}

class AffineMatrix {
    constructor(elements) {
        this.elements = elements || AffineMatrix.identity().elements;
    }

    static identity() {
        return new AffineMatrix([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    getInverseTranspose() {
        // Simplified inverse transpose for 3x3 part relevant to normals
        let m = this.elements;
        let invTranspose = [
            m[0], m[4], m[8], 0,
            m[1], m[5], m[9], 0,
            m[2], m[6], m[10], 0,
            0, 0, 0, 1
        ];
        return new AffineMatrix(invTranspose);
    }
}

function findLineSurfaceIntersection(pt1, pt2, surface) {
    let lineVector = pt2.subtract(pt1);
    let normal = surface.normalVector;
    let dist1 = normal.scalarProduct(pt1) - surface.distFromOrigin;
    let dist2 = normal.scalarProduct(pt2) - surface.distFromOrigin;

    let denominator = normal.scalarProduct(lineVector);
    if (Math.abs(denominator) < GEOMETRY_TOLERANCE) { // Line is parallel or on plane
        return null;
    }

    let t = -dist1 / denominator;
    if (t >= 0 - GEOMETRY_TOLERANCE && t <= 1 + GEOMETRY_TOLERANCE) { // Check if intersection is within segment
        return pt1.add(lineVector.scale(t));
    }
    return null;
}

function filterCloseVertices(vertices, tolerance) {
    if (vertices.length < 2) return vertices;
    let unique = [vertices[0]];
    let toleranceSq = tolerance * tolerance;
    for (let i = 1; i < vertices.length; i++) {
        let lastUnique = unique[unique.length - 1];
        let current = vertices[i];
        let distSq = (lastUnique.xVal - current.xVal)**2 + (lastUnique.yVal - current.yVal)**2 + (lastUnique.zVal - current.zVal)**2;
        if (distSq > toleranceSq) {
            unique.push(current);
        }
    }
    // Check if the last point is a duplicate of the first (for closed polygons)
    if (unique.length > 1) {
        let firstUnique = unique[0];
        let lastUnique = unique[unique.length - 1];
        let distSq = (firstUnique.xVal - lastUnique.xVal)**2 + (firstUnique.yVal - lastUnique.yVal)**2 + (firstUnique.zVal - lastUnique.zVal)**2;
        if (distSq <= toleranceSq) {
            unique.pop();
        }
    }
    return unique;
}

function sliceFacetBySurface(inputFacet, cuttingSurface, epsilon) {
    let facetVertices = inputFacet.vertexList;
    let vertexClassifications = facetVertices.map(v => cuttingSurface.classifyPoint(v, epsilon));

    let frontSideVertices = [];
    let backSideVertices = [];

    for (let i = 0; i < facetVertices.length; i++) {
        let p1 = facetVertices[i];
        let class1 = vertexClassifications[i];

        let p2 = facetVertices[(i + 1) % facetVertices.length];
        let class2 = vertexClassifications[(i + 1) % facetVertices.length];

        if (class1 !== NEG_SIDE) { // Point is front or on
            frontSideVertices.push(p1);
        }
        if (class1 !== POS_SIDE) { // Point is back or on
            backSideVertices.push(p1);
        }

        if (class1 !== ON_PLANE && class2 !== ON_PLANE && class1 !== class2) {
            let intersectionPoint = findLineSurfaceIntersection(p1, p2, cuttingSurface);
            if (intersectionPoint) {
                frontSideVertices.push(intersectionPoint);
                backSideVertices.push(intersectionPoint);
            }
        }
    }

    let slicedParts = { front: [], back: [] };

    if (frontSideVertices.length >= 3) {
        let distinctFrontVertices = filterCloseVertices(frontSideVertices, epsilon);
        if (distinctFrontVertices.length >= 3) {
            slicedParts.front.push(new FaceElement(distinctFrontVertices, inputFacet.sharedData, inputFacet.surfaceEquation));
        }
    }
    if (backSideVertices.length >= 3) {
        let distinctBackVertices = filterCloseVertices(backSideVertices, epsilon);
        if (distinctBackVertices.length >= 3) {
            slicedParts.back.push(new FaceElement(distinctBackVertices, inputFacet.sharedData, inputFacet.surfaceEquation));
        }
    }

    return slicedParts;
}

function trimFacetsByBoundary(initialFacets, boundarySurfaces, desiredSide, epsilon = GEOMETRY_TOLERANCE) {
    let currentFacetSet = [...initialFacets];

    for (let i = 0; i < boundarySurfaces.length; i++) {
        let currentBoundary = boundarySurfaces[i];
        let nextFacetSet = [];

        for (let j = 0; j < currentFacetSet.length; j++) {
            let facet = currentFacetSet[j];
            if (facet.vertexList.length < 3) continue;

            let classifications = facet.vertexList.map(p => currentBoundary.classifyPoint(p, epsilon));
            let numPositive = 0, numNegative = 0, numOn = 0;
            for (let k = 0; k < classifications.length; k++) {
                if (classifications[k] === POS_SIDE) numPositive++;
                else if (classifications[k] === NEG_SIDE) numNegative++;
                else numOn++;
            }

            if (numNegative === 0 && numPositive === 0) { // Entire facet is coplanar
                let normalAlignment = facet.surfaceEquation.normalVector.scalarProduct(currentBoundary.normalVector);
                if (desiredSide === 'POSITIVE_SPACE' && normalAlignment > epsilon) {
                    nextFacetSet.push(facet);
                } else if (desiredSide === 'NEGATIVE_SPACE' && normalAlignment < -epsilon) {
                    nextFacetSet.push(facet);
                }
            } else if (numNegative === 0) { // Entire facet is in positive space or spanning positive/on
                if (desiredSide === 'POSITIVE_SPACE') nextFacetSet.push(facet);
            } else if (numPositive === 0) { // Entire facet is in negative space or spanning negative/on
                if (desiredSide === 'NEGATIVE_SPACE') nextFacetSet.push(facet);
            } else { // Facet spans the plane, needs splitting
                let parts = sliceFacetBySurface(facet, currentBoundary, epsilon);
                if (desiredSide === 'POSITIVE_SPACE') nextFacetSet = nextFacetSet.concat(parts.front);
                else if (desiredSide === 'NEGATIVE_SPACE') nextFacetSet = nextFacetSet.concat(parts.back);
            }
        }
        currentFacetSet = nextFacetSet;
    }
    return currentFacetSet;
}


class GeometricVolume {
    constructor(boundaryElements) {
        this.facets = boundaryElements;
        this.propertiesMap = new Map();
    }

    static fromFacets(elements) {
        return new GeometricVolume(elements);
    }

    obtainBoundaryFacets() {
        return this.facets;
    }

    // Equivalent to union
    joinSolids(otherVolume) {
        let allPlanesOfOther = otherVolume.facets.map(f => f.surfaceEquation);
        let allPlanesOfThis = this.facets.map(f => f.surfaceEquation);

        let thisOutsideOther = trimFacetsByBoundary(this.facets, allPlanesOfOther, 'POSITIVE_SPACE');
        let otherOutsideThis = trimFacetsByBoundary(otherVolume.facets, allPlanesOfThis, 'POSITIVE_SPACE');
        let thisIntersectOther = trimFacetsByBoundary(this.facets, allPlanesOfOther, 'NEGATIVE_SPACE');

        let combinedFacets = thisOutsideOther.concat(otherOutsideThis).concat(thisIntersectOther);
        return GeometricVolume.fromFacets(combinedFacets);
    }

    // Equivalent to subtract
    carveMaterial(otherVolume) {
        let allPlanesOfOther = otherVolume.facets.map(f => f.surfaceEquation);
        let allPlanesOfThis = this.facets.map(f => f.surfaceEquation);

        let thisMinusOther = trimFacetsByBoundary(this.facets, allPlanesOfOther, 'POSITIVE_SPACE');
        let otherIntersectThisFlipped = trimFacetsByBoundary(
            otherVolume.facets.map(f => f.reorient()),
            allPlanesOfThis,
            'POSITIVE_SPACE'
        );

        let combinedFacets = thisMinusOther.concat(otherIntersectThisFlipped);
        return GeometricVolume.fromFacets(combinedFacets);
    }

    // Equivalent to intersect
    findOverlap(otherVolume) {
        let allPlanesOfOther = otherVolume.facets.map(f => f.surfaceEquation);
        let allPlanesOfThis = this.facets.map(f => f.surfaceEquation);

        let thisInsideOther = trimFacetsByBoundary(this.facets, allPlanesOfOther, 'NEGATIVE_SPACE');
        let otherInsideThis = trimFacetsByBoundary(otherVolume.facets, allPlanesOfThis, 'NEGATIVE_SPACE');

        let combinedFacets = thisInsideOther.concat(otherInsideThis);
        return GeometricVolume.fromFacets(combinedFacets);
    }

    // Equivalent to inverse
    flipOrientation() {
        let reversedFacets = this.facets.map(f => f.reorient());
        return GeometricVolume.fromFacets(reversedFacets);
    }

    // Equivalent to transform
    applyTransformation(affineMatrix) {
        let transformedFacets = this.facets.map(f => f.applyTransform(affineMatrix));
        return GeometricVolume.fromFacets(transformedFacets);
    }
}