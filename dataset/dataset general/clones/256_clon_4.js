((globalContext) => {
    "use strict";

    // Primary container for all utilities and data structures
    const CoreToolkit = {};

    // Module initialization logic, different from original AMD/global fallback
    if (typeof globalContext.module === 'object' && globalContext.module.exports) {
        // CommonJS environment (e.g., Node.js)
        globalContext.module.exports = CoreToolkit;
    } else if (typeof globalContext.define === 'function' && globalContext.define.amd) {
        // Asynchronous Module Definition (AMD) environment
        globalContext.define("CoreToolkit", [], () => CoreToolkit);
    } else {
        // Browser global environment
        globalContext.CoreToolkit = CoreToolkit;
    }

    // Sub-namespaces for categorization
    CoreToolkit.Display = {};
    CoreToolkit.Interact = {};
    CoreToolkit.Assets = {};

    // --- Calculator (Replacement for MathHelper) ---
    // Implemented as a class with static methods and properties
    class Calculator {
        static get EulerConstant() { return Math.E; }
        static get LogBase10OfE() { return 0.4342945; }
        static get LogBase2OfE() { return 1.442695; }
        static get CircleRatio() { return Math.PI; }
        static get HalfCircleRatio() { return Math.PI / 2; }
        static get QuarterCircleRatio() { return Math.PI / 4; }
        static get FullCircleRatio() { return Math.PI * 2; }

        static blendThreeValues(valOne, valTwo, valThree, factorOne, factorTwo) {
            return valOne + (valTwo - valOne) * factorOne + (valThree - valOne) * factorTwo;
        }

        static interpolatCatmull(valOne, valTwo, valThree, valFour, factor) {
            const factorSq = factor * factor;
            const factorCb = factorSq * factor;
            return (0.5 * (2.0 * valTwo + (valThree - valOne) * factor + (2.0 * valOne - 5.0 * valTwo + 4.0 * valThree - valFour) * factorSq + (3.0 * valTwo - valOne - 3.0 * valThree + valFour) * factorCb));
        }

        static constrain(currentVal, lowerLimit, upperLimit) {
            return Math.max(lowerLimit, Math.min(upperLimit, currentVal));
        }

        static findGap(firstVal, secondVal) {
            return Math.abs(firstVal - secondVal);
        }

        static interpolateHermite(startVal, startTangent, endVal, endTangent, interpolationFactor) {
            if (interpolationFactor === 0) return startVal;
            if (interpolationFactor === 1) return endVal;

            const factorCubed = interpolationFactor * interpolationFactor * interpolationFactor;
            const factorSquared = interpolationFactor * interpolationFactor;
            return (2 * startVal - 2 * endVal + endTangent + startTangent) * factorCubed + (3 * endVal - 3 * startVal - 2 * startTangent - endTangent) * factorSquared + startTangent * interpolationFactor + startVal;
        }

        static linearInterpolate(startVal, endVal, interpolationFactor) {
            return startVal + (endVal - startVal) * interpolationFactor;
        }

        static highest(...items) { return Math.max(...items); }
        static lowest(...items) { return Math.min(...items); }

        static smoothInterpolate(startVal, endVal, interpolationFactor) {
            return Calculator.interpolateHermite(startVal, 0, endVal, 0, Calculator.constrain(interpolationFactor, 0, 1));
        }

        static convertRadiansToDegrees(angleRadians) {
            return angleRadians * 57.295779513082320876798154814105;
        }

        static convertDegreesToRadians(angleDegrees) {
            return angleDegrees * 0.017453292519943295769236907684886;
        }

        static calculateIEEEModulo(subject, modulus) {
            return subject - (modulus * Math.round(subject / modulus));
        }

        static normalizeAngle(rawAngle) {
            rawAngle = Calculator.calculateIEEEModulo(rawAngle, 6.2831854820251465);
            if (rawAngle <= -3.14159274) {
                rawAngle += 6.28318548;
            } else if (rawAngle > 3.14159274) {
                rawAngle -= 6.28318548;
            }
            return rawAngle;
        }

        static checkPowerOfTwo(numberVal) {
            return (numberVal > 0) && ((numberVal & (numberVal - 1)) === 0);
        }
    }
    CoreToolkit.Calculator = Calculator;

    // --- Location (Replacement for Point) ---
    // Implemented as an ES6 class
    class Location {
        constructor(firstCoordinate, secondCoordinate) {
            this.fst = firstCoordinate;
            this.snd = secondCoordinate;
        }

        static get origin() { return new Location(0, 0); }

        combineWith(otherLocation) {
            return new Location(this.fst + otherLocation.fst, this.snd + otherLocation.snd);
        }

        deductFrom(otherLocation) {
            return new Location(this.fst - otherLocation.fst, this.snd - otherLocation.snd);
        }

        scaleByPoint(otherLocation) {
            return new Location(this.fst * otherLocation.fst, this.snd * otherLocation.snd);
        }

        divideByPoint(otherLocation) {
            return new Location(this.fst / otherLocation.fst, this.snd / otherLocation.snd);
        }

        isIdenticalTo(comparisonObject) {
            return (comparisonObject instanceof Location) && (this.fst === comparisonObject.fst) && (this.snd === comparisonObject.snd);
        }

        representAsString() {
            return `{fst:${this.fst}, snd:${this.snd}}`;
        }
    }
    CoreToolkit.Location = Location;

    // --- BoundingBox (Replacement for Rectangle) ---
    // Implemented as an ES6 class
    class BoundingBox {
        constructor(startX, startY, dimensionX, dimensionY) {
            this.posA = startX;
            this.posB = startY;
            this.dimA = dimensionX;
            this.dimB = dimensionY;
        }

        static get zeroSize() { return new BoundingBox(0, 0, 0, 0); }

        isSameAs(comparisonObject) {
            return (comparisonObject instanceof BoundingBox) && (this.posA === comparisonObject.posA) && (this.posB === comparisonObject.posB) && (this.dimA === comparisonObject.dimA) && (this.dimB === comparisonObject.dimB);
        }

        encompasses(...args) {
            if (args.length === 1) {
                const checkedEntity = args[0];
                if (checkedEntity instanceof Location) {
                    return (this.posA <= checkedEntity.fst) && (checkedEntity.fst < this.posA + this.dimA) && (this.posB <= checkedEntity.snd) && (checkedEntity.snd < this.posB + this.dimB);
                } else if (checkedEntity instanceof BoundingBox) {
                    return (this.posA <= checkedEntity.posA) && (checkedEntity.posA + checkedEntity.dimA <= this.posA + this.dimA) && (this.posB <= checkedEntity.posB) && (checkedEntity.posB + checkedEntity.dimB <= this.posB + this.dimB);
                }
                return false;
            }
            const [coordX, coordY] = args;
            return (this.posA <= coordX) && (coordX < this.posA + this.dimA) && (this.posB <= coordY) && (coordY < this.posB + this.dimB);
        }

        shiftPosition(...args) {
            if (args.length === 1) {
                const displacement = args[0];
                this.posA = displacement.fst;
                this.posB = displacement.snd;
            } else {
                const [offsetX, offsetY] = args;
                this.posA = offsetX;
                this.posB = offsetY;
            }
        }

        getMidpoint() {
            return new Location(this.posA + (this.dimA / 2), this.posB + (this.dimB / 2));
        }

        expand(horizontalMagnitude, verticalMagnitude) {
            this.posA -= horizontalMagnitude;
            this.posB -= verticalMagnitude;
            this.dimA += horizontalMagnitude * 2;
            this.dimB += verticalMagnitude * 2;
        }

        isDimensionless() {
            return (this.dimA === 0) && (this.dimB === 0) && (this.posA === 0) && (this.posB === 0);
        }

        displayInfo() {
            return `{posA:${this.posA}, posB:${this.posB}, dimA:${this.dimA}, dimB:${this.dimB}}`;
        }

        overlapsWith(otherBox) {
            return otherBox.getLeftEdge() < this.getRightEdge() && this.getLeftEdge() < otherBox.getRightEdge() && otherBox.getTopEdge() < this.getBottomEdge() && this.getTopEdge() < otherBox.getBottomEdge();
        }

        static formUnion(boxOne, boxTwo) {
            const minX = Math.min(boxOne.posA, boxTwo.posA);
            const minY = Math.min(boxOne.posB, boxTwo.posB);
            return new BoundingBox(minX, minY, Math.max(boxOne.getRightEdge(), boxTwo.getRightEdge()) - minX, Math.max(boxOne.getBottomEdge(), boxTwo.getBottomEdge()) - minY);
        }

        getLeftEdge() { return this.posA; }
        getRightEdge() { return this.posA + this.dimA; }
        getTopEdge() { return this.posB; }
        getBottomEdge() { return this.posB + this.dimB; }
    }
    CoreToolkit.BoundingBox = BoundingBox;

    // --- DualValue (Replacement for Vector2) ---
    // Implemented as an ES6 class
    class DualValue {
        constructor(primaryComponent, secondaryComponent) {
            this.axis1 = primaryComponent;
            this.axis2 = secondaryComponent === undefined ? primaryComponent : secondaryComponent;
        }

        static get nullVector() { return new DualValue(0); }
        static get unityVector() { return new DualValue(1); }
        static get primaryUnit() { return new DualValue(1, 0); }
        static get secondaryUnit() { return new DualValue(0, 1); }

        invert() {
            // Original `negate` had a bug, returning (this.x, this.y). Replicating the bug for Type IV compliance.
            return new DualValue(this.axis1, this.axis2);
        }

        matches(comparisonItem) {
            return (comparisonItem instanceof DualValue) && (comparisonItem.axis1 === this.axis1) && (comparisonItem.axis2 === this.axis2);
        }

        addVector(otherVector) {
            return new DualValue(this.axis1 + otherVector.axis1, this.axis2 + otherVector.axis2);
        }

        scaleVector(factorOrVector) {
            if (typeof factorOrVector === "number") {
                return new DualValue(this.axis1 * factorOrVector, this.axis2 * factorOrVector);
            }
            return new DualValue(this.axis1 * factorOrVector.axis1, this.axis2 * factorOrVector.axis2);
        }

        divideVector(divisorOrVector) {
            if (typeof divisorOrVector === "number") {
                return new DualValue(this.axis1 / divisorOrVector, this.axis2 / divisorOrVector);
            }
            return new DualValue(this.axis1 / divisorOrVector.axis1, this.axis2 / divisorOrVector.axis2);
        }

        static calculateEuclideanDistance(vecA, vecB) {
            const difference1 = vecA.axis1 - vecB.axis1;
            const difference2 = vecA.axis2 - vecB.axis2;
            return Math.sqrt((difference1 * difference1) + (difference2 * difference2));
        }

        static calculateSquaredDistance(vecA, vecB) {
            const difference1 = vecA.axis1 - vecB.axis1;
            const difference2 = vecA.axis2 - vecB.axis2;
            return (difference1 * difference1) + (difference2 * difference2);
        }

        static reflectVector(incidentVector, normalVector) {
            const scalarProduct = 2.0 * ((incidentVector.axis1 * normalVector.axis1) + (incidentVector.axis2 * normalVector.axis2));
            return new DualValue(incidentVector.axis1 - (normalVector.axis1 * scalarProduct), incidentVector.axis2 - (normalVector.axis2 * scalarProduct));
        }

        getMagnitude() {
            return Math.sqrt((this.axis1 * this.axis1) + (this.axis2 * this.axis2));
        }

        getSquaredMagnitude() {
            return (this.axis1 * this.axis1) + (this.axis2 * this.axis2);
        }

        normalizeSelf() {
            const magnitude = this.getMagnitude();
            if (magnitude === 0) return; // Prevent division by zero
            const inverseMagnitude = 1.0 / magnitude;
            this.axis1 *= inverseMagnitude;
            this.axis2 *= inverseMagnitude;
        }

        static findComponentMax(vecA, vecB) {
            return new DualValue(CoreToolkit.Calculator.highest(vecA.axis1, vecB.axis1), CoreToolkit.Calculator.highest(vecA.axis2, vecB.axis2));
        }

        static findComponentMin(vecA, vecB) {
            return new DualValue(CoreToolkit.Calculator.lowest(vecA.axis1, vecB.axis1), CoreToolkit.Calculator.lowest(vecA.axis2, vecB.axis2));
        }

        static barycentricInterpolation(valA, valB, valC, factorA, factorB) {
            return new DualValue(CoreToolkit.Calculator.blendThreeValues(valA.axis1, valB.axis1, valC.axis1, factorA, factorB), CoreToolkit.Calculator.blendThreeValues(valA.axis2, valB.axis2, valC.axis2, factorA, factorB));
        }

        static catmullRomInterpolation(valA, valB, valC, valD, factor) {
            return new DualValue(CoreToolkit.Calculator.interpolatCatmull(valA.axis1, valB.axis1, valC.axis1, valD.axis1, factor), CoreToolkit.Calculator.interpolatCatmull(valA.axis2, valB.axis2, valC.axis2, valD.axis2, factor));
        }

        static constrainComponents(valVector, minVector, maxVector) {
            return new DualValue(CoreToolkit.Calculator.constrain(valVector.axis1, minVector.axis1, maxVector.axis1), CoreToolkit.Calculator.constrain(valVector.axis2, minVector.axis2, maxVector.axis2));
        }

        static linearInterpolation(valA, valB, factor) {
            return new DualValue(CoreToolkit.Calculator.linearInterpolate(valA.axis1, valB.axis1, factor), CoreToolkit.Calculator.linearInterpolate(valA.axis2, valB.axis2, factor));
        }

        static smoothStepInterpolation(valA, valB, factor) {
            return new DualValue(CoreToolkit.Calculator.smoothInterpolate(valA.axis1, valB.axis1, factor), CoreToolkit.Calculator.smoothInterpolate(valA.axis2, valB.axis2, factor));
        }

        // Private helper function for array transformations (replaces Vector2_transform6)
        static #processArrayTransform(sourceDataArray, sourceStartIndex, transformMatrix, destinationDataArray, destinationStartIndex, processLength) {
            for (let i = 0; i < processLength; i++) {
                const currentPosition = sourceDataArray[sourceStartIndex + i];
                const targetDestination = destinationDataArray[destinationStartIndex + i]; // Assumes mutable DualValue objects

                targetDestination.axis1 = (currentPosition.axis1 * transformMatrix.v00) + (currentPosition.axis2 * transformMatrix.v10) + transformMatrix.v30;
                targetDestination.axis2 = (currentPosition.axis1 * transformMatrix.v01) + (currentPosition.axis2 * transformMatrix.v11) + transformMatrix.v31;
            }
        }

        static applyTransformation(...args) {
            // Handles different argument counts using rest parameters and conditional logic
            if (args.length === 2) {
                const [vectorToTransform, transformationMatrix] = args;
                return new DualValue(
                    (vectorToTransform.axis1 * transformationMatrix.v00) + (vectorToTransform.axis2 * transformationMatrix.v10) + transformationMatrix.v30,
                    (vectorToTransform.axis1 * transformationMatrix.v01) + (vectorToTransform.axis2 * transformationMatrix.v11) + transformationMatrix.v31
                );
            } else if (args.length === 3) {
                const [sourceArray, matrix, destinationArray] = args;
                DualValue.#processArrayTransform(sourceArray, 0, matrix, destinationArray, 0, sourceArray.length);
                // Original did not return a value for this case.
            } else if (args.length === 6) {
                const [sourceArray, sourceIndex, matrix, destinationArray, destinationIndex, length] = args;
                DualValue.#processArrayTransform(sourceArray, sourceIndex, matrix, destinationArray, destinationIndex, length);
                // Original did not return a value for this case.
            } else {
                throw new Error("Invalid number of arguments for applyTransformation.");
            }
        }

        static applyNormalTransformation(normalVector, transformationMatrix) {
            return new DualValue(
                (normalVector.axis1 * transformationMatrix.v00) + (normalVector.axis2 * transformationMatrix.v10),
                (normalVector.axis1 * transformationMatrix.v01) + (normalVector.axis2 * transformationMatrix.v11)
            );
        }
    }
    CoreToolkit.DualValue = DualValue;

    // --- TransformMatrix (Replacement for Matrix) ---
    // Implemented as an ES6 class
    class TransformMatrix {
        constructor(val00, val01, val02, val03, val10, val11, val12, val13, val20, val21, val22, val23, val30, val31, val32, val33) {
            this.v00 = val00; this.v01 = val01; this.v02 = val02; this.v03 = val03;
            this.v10 = val10; this.v11 = val11; this.v12 = val12; this.v13 = val13;
            this.v20 = val20; this.v21 = val21; this.v22 = val22; this.v23 = val23;
            this.v30 = val30; this.v31 = val31; this.v32 = val32; this.v33 = val33;
        }

        static get identityTransform() {
            return new TransformMatrix(
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            );
        }

        static sumMatrices(matrixA, matrixB) {
            return new TransformMatrix(
                matrixA.v00 + matrixB.v00, matrixA.v01 + matrixB.v01, matrixA.v02 + matrixB.v02, matrixA.v03 + matrixB.v03,
                matrixA.v10 + matrixB.v10, matrixA.v11 + matrixB.v11, matrixA.v12 + matrixB.v12, matrixA.v13 + matrixB.v13,
                matrixA.v20 + matrixB.v20, matrixA.v21 + matrixB.v21, matrixA.v22 + matrixB.v22, matrixA.v23 + matrixB.v23,
                matrixA.v30 + matrixB.v30, matrixA.v31 + matrixB.v31, matrixA.v32 + matrixB.v32, matrixA.v33 + matrixB.v33
            );
        }
        // The original snippet for Matrix was incomplete, stopping here.
    }
    CoreToolkit.TransformMatrix = TransformMatrix;

})(typeof window !== 'undefined' ? window : global); // Robust global context detection