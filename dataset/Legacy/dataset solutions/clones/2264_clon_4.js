class InputProcessor {
    constructor(sourceText) {
        this.lineSegments = sourceText.trim().split("\n");
        this.currentLinePointer = 0;
        this.currentSegmentCache = [];
    }

    _ensureSegmentCache() {
        while (this.currentSegmentCache.length === 0 && this.currentLinePointer < this.lineSegments.length) {
            this.currentSegmentCache = this.lineSegments[this.currentLinePointer++].split(" ").reverse();
        }
    }

    retrieveNumericToken() {
        this._ensureSegmentCache();
        if (this.currentSegmentCache.length > 0) {
            return +this.currentSegmentCache.pop();
        }
        throw new Error("No more numeric tokens available for retrieval.");
    }

    retrieveNumericLine() {
        if (this.currentLinePointer < this.lineSegments.length) {
            const lineContent = this.lineSegments[this.currentLinePointer++];
            return lineContent.split(" ").map(Number);
        }
        throw new Error("No more lines available for retrieval.");
    }

    retrieveNumericMatrix(rowsToFetch) {
        const resultMatrix = [];
        for (let i = 0; i < rowsToFetch; i++) {
            resultMatrix.push(this.retrieveNumericLine());
        }
        return resultMatrix;
    }

    retrieveNumericVector(elementsToFetch) {
        const resultVector = [];
        for (let i = 0; i < elementsToFetch; i++) {
            resultVector.push(Number(this.lineSegments[this.currentLinePointer++]));
        }
        return resultVector;
    }
}

function buildNestedArray(dimensionSizes, initialFillValue) {
    if (dimensionSizes.length === 0) {
        return initialFillValue;
    }
    const currentDimension = dimensionSizes[0];
    const remainingDimensions = dimensionSizes.slice(1);
    return Array.from({ length: currentDimension }, () => buildNestedArray(remainingDimensions, initialFillValue));
}

function* generateCombinations(sourceCollection, combinationLength) {
    const collectionSize = sourceCollection.length;
    if (combinationLength < 1 || combinationLength > collectionSize) {
        return;
    }

    const currentIndices = Array.from({ length: combinationLength }, (_, i) => i);

    function* recursiveCombination(currentPosition, startIndex) {
        if (currentPosition === combinationLength) {
            yield currentIndices.map(idx => sourceCollection[idx]);
            return;
        }

        for (let i = startIndex; i <= collectionSize - (combinationLength - currentPosition); i++) {
            currentIndices[currentPosition] = i;
            yield* recursiveCombination(currentPosition + 1, i + 1);
        }
    }

    yield* recursiveCombination(0, 0);
}

class MinimumEnclosingCircleAlgorithm {
    constructor(allInputPoints) {
        this.dataPoints = allInputPoints;
        this.totalPoints = allInputPoints.length;
        this.comparisonEpsilon = 1 - 1e-9;
        this.currentMinimumRadius = Infinity;
    }

    calculateTwoPointDiameterCircle(pointAlpha, pointBeta) {
        const deltaX = pointAlpha[0] - pointBeta[0];
        const deltaY = pointAlpha[1] - pointBeta[1];
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 2;
    }

    checkAllPointsWithinCandidateCircle(centerCoords, candidateRadiusValue) {
        if (this.currentMinimumRadius < candidateRadiusValue) {
            return false;
        }

        const radiusSquared = candidateRadiusValue * candidateRadiusValue;
        const toleranceSquared = this.comparisonEpsilon * this.comparisonEpsilon;

        const allPointsAreCovered = this.dataPoints.every(currentPoint => {
            const deltaX = currentPoint[0] - centerCoords[0];
            const deltaY = currentPoint[1] - centerCoords[1];
            const distanceToCenterSquared = deltaX * deltaX + deltaY * deltaY;
            return distanceToCenterSquared <= radiusSquared / toleranceSquared;
        });

        if (allPointsAreCovered) {
            this.currentMinimumRadius = candidateRadiusValue;
            return true;
        }
        return false;
    }

    determineCircumcircleAndVerifyCoverage(pointOne, pointTwo, pointThree) {
        const [xOne, yOne] = pointOne;
        const [xTwo, yTwo] = pointTwo;
        const [xThree, yThree] = pointThree;

        const termA = xOne - xTwo;
        const termB = yOne - yTwo;
        const termC = xTwo - xThree;
        const termD = yTwo - yThree;

        const denominator = 2 * (termA * termD - termB * termC);

        let circleCenterX, circleCenterY, circleRadius;

        if (denominator === 0) {
            const dxThree = xThree - xOne;
            const dyThree = yThree - yOne;

            const distOneTwoSq = termA * termA + termB * termB;
            const distTwoThreeSq = termC * termC + termD * termD;
            const distOneThreeSq = dxThree * dxThree + dyThree * dyThree;

            const maxDistanceSquared = Math.max(distOneTwoSq, distTwoThreeSq, distOneThreeSq);
            circleRadius = Math.sqrt(maxDistanceSquared) / 2;

            if (distOneTwoSq === maxDistanceSquared) {
                circleCenterX = (xOne + xTwo) / 2;
                circleCenterY = (yOne + yTwo) / 2;
            } else if (distTwoThreeSq === maxDistanceSquared) {
                circleCenterX = (xThree + xTwo) / 2;
                circleCenterY = (yThree + yTwo) / 2;
            } else {
                circleCenterX = (xOne + xThree) / 2;
                circleCenterY = (yOne + yThree) / 2;
            }
        } else {
            const vOne = xOne * xOne + yOne * yOne;
            const vTwo = xTwo * xTwo + yTwo * yTwo;
            const vThree = xThree * xThree + yThree * yThree;

            const inverseDenominator = 1 / denominator;
            circleCenterX = inverseDenominator * (termD * (vOne - vTwo) - termB * (vTwo - vThree));
            circleCenterY = inverseDenominator * (termA * (vTwo - vThree) - termC * (vOne - vTwo));

            const deltaX = xOne - circleCenterX;
            const deltaY = yOne - circleCenterY;
            circleRadius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }

        return this.checkAllPointsWithinCandidateCircle([circleCenterX, circleCenterY], circleRadius);
    }

    executeSolution() {
        if (this.totalPoints === 2) {
            return this.calculateTwoPointDiameterCircle(this.dataPoints[0], this.dataPoints[1]);
        }

        for (const [pA, pB, pC] of generateCombinations(this.dataPoints, 3)) {
            this.determineCircumcircleAndVerifyCoverage(pA, pB, pC);
        }

        return this.currentMinimumRadius;
    }
}

const inputSource = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

const numberOfPoints = inputSource.retrieveNumericToken();
const pointCoordinates = inputSource.retrieveNumericMatrix(numberOfPoints);

const problemSolver = new MinimumEnclosingCircleAlgorithm(pointCoordinates);
console.log(problemSolver.executeSolution());
