(function () {
    // This self-executing anonymous function encapsulates the entire library,
    // creating a private scope for variables and preventing global pollution.
    "use strict"; // Enforces stricter parsing and error handling in the code.

    // The primary namespace object for this application's core utilities.
    let CoreEngine;

    // Check if an Asynchronous Module Definition (AMD) loader like RequireJS is present.
    // If so, the library will register itself as a module.
    if (typeof window.define === 'function' && window.define.amd) {
        CoreEngine = {}; // Initialize the main object for AMD.

        // Register the module with the AMD loader.
        // The module ID "Application/System/Core" indicates its path and name.
        window.define("Application/System/Core", CoreEngine);
    } else {
        // If no AMD loader is found, fall back to creating a global namespace structure.
        // This ensures that the necessary parent objects exist before assigning properties.
        window.App = window.App || {};
        window.App.Infrastructure = window.App.Infrastructure || {};
        window.App.Infrastructure.System = window.App.Infrastructure.System || {};
        window.App.Infrastructure.System.Core = window.App.Infrastructure.System.Core || {};

        // Assign the CoreEngine to the globally accessible path.
        CoreEngine = window.App.Infrastructure.System.Core;
    }

    // Initialize core sub-modules within the main CoreEngine namespace.
    // These objects will hold related functionalities like rendering, user input, and media management.
    CoreEngine.Renderer = CoreEngine.Renderer || {};
    const Renderer = CoreEngine.Renderer; // Create a local alias for easier access.

    CoreEngine.InputHandler = CoreEngine.InputHandler || {};
    const InputHandler = CoreEngine.InputHandler; // Create a local alias.

    CoreEngine.AssetManager = CoreEngine.AssetManager || {};
    const AssetManager = CoreEngine.AssetManager; // Create a local alias.

    // Define a constant for the earliest possible valid date in JavaScript,
    // useful for date boundary checks or default values.
    const JS_MIN_DATE_VAL = new Date(-8640000000000000);

    // region: Numerical Utilities

    // A collection of mathematical helper functions and constants.
    CoreEngine.NumericHelpers = {};
    const NumericHelpers = CoreEngine.NumericHelpers;

    // Standard mathematical constants.
    NumericHelpers.EulersNumber = Math.E;
    NumericHelpers.LogBase10OfE = 0.4342944819032518; // More precise value for log_10(e)
    NumericHelpers.LogBase2OfE = 1.4426950408889634;  // More precise value for log_2(e)
    NumericHelpers.PiConstant = Math.PI;
    NumericHelpers.HalfPi = Math.PI / 2.0;
    NumericHelpers.QuarterPi = Math.PI / 4.0;
    NumericHelpers.TwoPi = Math.PI * 2.0;

    /**
     * Computes the barycentric coordinate of a point relative to a 1D segment.
     * @param {number} valA - The first value.
     * @param {number} valB - The second value.
     * @param {number} valC - The third value.
     * @param {number} weightB - The weight for valB.
     * @param {number} weightC - The weight for valC.
     * @returns {number} The interpolated value.
     */
    NumericHelpers.barycentricInterpolate1D = function (valA, valB, valC, weightB, weightC) {
        const deltaBA = valB - valA;
        const deltaCA = valC - valA;
        return valA + (deltaBA * weightB) + (deltaCA * weightC);
    };

    /**
     * Performs Catmull-Rom spline interpolation on a single dimension.
     * @param {number} p0 - The first control point.
     * @param {number} p1 - The second control point.
     * @param {number} p2 - The third control point.
     * @param {number} p3 - The fourth control point.
     * @param {number} t - The interpolation parameter (0 to 1).
     * @returns {number} The interpolated value.
     */
    NumericHelpers.catmullRomSpline = function (p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;

        const term1 = (p2 - p0) * t;
        const term2 = (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2;
        const term3 = (3.0 * p1 - p0 - 3.0 * p2 + p3) * t3;

        return 0.5 * (2.0 * p1 + term1 + term2 + term3);
    };

    /**
     * Constrains a value within a specified minimum and maximum range.
     * Automatically handles cases where min is greater than max.
     * @param {number} inputVal - The value to constrain.
     * @param {number} minAllowed - The minimum boundary.
     * @param {number} maxAllowed - The maximum boundary.
     * @returns {number} The constrained value.
     */
    NumericHelpers.constrainValue = function (inputVal, minAllowed, maxAllowed) {
        // Ensure that minAllowed is indeed the minimum.
        if (minAllowed > maxAllowed) {
            [minAllowed, maxAllowed] = [maxAllowed, minAllowed]; // ES6 array destructuring for swap
        }
        return Math.max(minAllowed, Math.min(maxAllowed, inputVal));
    };

    /**
     * Computes the absolute difference between two numerical values.
     * @param {number} numX - The first number.
     * @param {number} numY - The second number.
     * @returns {number} The non-negative difference.
     */
    NumericHelpers.absoluteDifference = function (numX, numY) {
        return Math.abs(numX - numY);
    };

    /**
     * Performs Hermite curve interpolation.
     * @param {number} startPos - The starting position.
     * @param {number} startTangent - The tangent at the starting position.
     * @param {number} endPos - The ending position.
     * @param {number} endTangent - The tangent at the ending position.
     * @param {number} factor - The interpolation factor (0 to 1).
     * @returns {number} The interpolated value.
     */
    NumericHelpers.hermiteCurve = function (startPos, startTangent, endPos, endTangent, factor) {
        // Early exit for boundary conditions.
        if (factor === 0.0) return startPos;
        if (factor === 1.0) return endPos;

        const fSquared = factor * factor;
        const fCubed = fSquared * factor;

        // Hermite blend function calculations.
        const h00 = (2 * fCubed) - (3 * fSquared) + 1;
        const h10 = fCubed - (2 * fSquared) + factor;
        const h01 = (-2 * fCubed) + (3 * fSquared);
        const h11 = fCubed - fSquared;

        return (startPos * h00) + (startTangent * h10) + (endPos * h01) + (endTangent * h11);
    };

    /**
     * Performs linear interpolation between two values.
     * @param {number} initialVal - The starting value.
     * @param {number} finalVal - The ending value.
     * @param {number} alpha - The interpolation amount (0.0 for initial, 1.0 for final).
     * @returns {number} The interpolated value.
     */
    NumericHelpers.linearInterpolation = function (initialVal, finalVal, alpha) {
        const valueRange = finalVal - initialVal;
        return initialVal + (valueRange * alpha);
    };

    // Aliases for standard Math functions.
    NumericHelpers.getMaximum = Math.max;
    NumericHelpers.getMinimum = Math.min;

    /**
     * Generates a smooth transition between two values using Hermite interpolation.
     * The interpolation factor is clamped to [0, 1].
     * @param {number} startVal - The starting value.
     * @param {number} endVal - The ending value.
     * @param {number} interpAmount - The interpolation factor.
     * @returns {number} The smoothly interpolated value.
     */
    NumericHelpers.smoothStepTransition = function (startVal, endVal, interpAmount) {
        const clampedAmount = NumericHelpers.constrainValue(interpAmount, 0, 1);
        // SmoothStep is Hermite interpolation with zero tangents.
        return NumericHelpers.hermiteCurve(startVal, 0, endVal, 0, clampedAmount);
    };

    /**
     * Converts an angle from radians to degrees.
     * @param {number} angleRad - The angle in radians.
     * @returns {number} The angle in degrees.
     */
    NumericHelpers.radiansToDegrees = function (angleRad) {
        return angleRad * (180.0 / NumericHelpers.PiConstant);
    };

    /**
     * Converts an angle from degrees to radians.
     * @param {number} angleDeg - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    NumericHelpers.degreesToRadians = function (angleDeg) {
        return angleDeg * (NumericHelpers.PiConstant / 180.0);
    };

    /**
     * Computes the IEEE 754 floating-point remainder of two numbers.
     * This is equivalent to `x - (y * Math.round(x / y))`.
     * @param {number} dividend - The number to be divided.
     * @param {number} divisor - The number by which to divide.
     * @returns {number} The remainder.
     */
    NumericHelpers.computeIEEERemainder = function (dividend, divisor) {
        if (divisor === 0) {
            return NaN; // Consistent with IEEE 754 behavior for x % 0
        }
        const quotientRounded = Math.round(dividend / divisor);
        return dividend - (divisor * quotientRounded);
    };

    /**
     * Normalizes an angle to be within the range (-Pi, Pi].
     * @param {number} angleToWrap - The angle to normalize.
     * @returns {number} The normalized angle.
     */
    NumericHelpers.normalizeAngle = function (angleToWrap) {
        let wrappedAngle = NumericHelpers.computeIEEERemainder(angleToWrap, NumericHelpers.TwoPi);

        // Adjust to be within (-Pi, Pi]
        if (wrappedAngle <= -NumericHelpers.PiConstant) {
            wrappedAngle += NumericHelpers.TwoPi;
        } else if (wrappedAngle > NumericHelpers.PiConstant) {
            wrappedAngle -= NumericHelpers.TwoPi;
        }
        return wrappedAngle;
    };

    /**
     * Determines if a positive integer is a power of two.
     * @param {number} numValue - The integer to check.
     * @returns {boolean} True if numValue is a power of two, false otherwise.
     */
    NumericHelpers.isPositivePowerOfTwo = function (numValue) {
        if (typeof numValue !== 'number' || !Number.isInteger(numValue) || numValue <= 0) {
            return false; // Added validation for positive integers.
        }
        return (numValue & (numValue - 1)) === 0;
    };

    // endregion

    // region: 2D Point Structure

    /**
     * Represents a 2D point with integer coordinates.
     * @class
     * @param {number} xPos - The X-coordinate.
     * @param {number} yPos - The Y-coordinate.
     */
    CoreEngine.PointInteger2D = function (xPos, yPos) {
        this.x = xPos;
        this.y = yPos;
    };
    const PointInteger2D = CoreEngine.PointInteger2D;

    // A static instance representing the origin (0,0).
    PointInteger2D.TheOrigin = new PointInteger2D(0, 0);

    /**
     * Adds another PointInteger2D to this point, returning a new point.
     * @param {PointInteger2D} otherPoint - The point to add.
     * @returns {PointInteger2D} A new PointInteger2D representing the sum.
     */
    PointInteger2D.prototype.addPoint = function (otherPoint) {
        if (!(otherPoint instanceof PointInteger2D)) {
            throw new Error("Argument 'otherPoint' must be an instance of PointInteger2D.");
        }
        return new PointInteger2D(this.x + otherPoint.x, this.y + otherPoint.y);
    };

    /**
     * Subtracts another PointInteger2D from this point, returning a new point.
     * @param {PointInteger2D} otherPoint - The point to subtract.
     * @returns {PointInteger2D} A new PointInteger2D representing the difference.
     */
    PointInteger2D.prototype.subtractPoint = function (otherPoint) {
        if (!(otherPoint instanceof PointInteger2D)) {
            throw new Error("Argument 'otherPoint' must be an instance of PointInteger2D.");
        }
        return new PointInteger2D(this.x - otherPoint.x, this.y - otherPoint.y);
    };

    /**
     * Multiplies this point's coordinates by another point's coordinates, returning a new point.
     * @param {PointInteger2D} otherPoint - The point to multiply by.
     * @returns {PointInteger2D} A new PointInteger2D representing the product.
     */
    PointInteger2D.prototype.multiplyPoint = function (otherPoint) {
        if (!(otherPoint instanceof PointInteger2D)) {
            throw new Error("Argument 'otherPoint' must be an instance of PointInteger2D.");
        }
        return new PointInteger2D(this.x * otherPoint.x, this.y * otherPoint.y);
    };

    /**
     * Divides this point's coordinates by another point's coordinates, returning a new point.
     * @param {PointInteger2D} otherPoint - The point to divide by.
     * @returns {PointInteger2D} A new PointInteger2D representing the quotient.
     */
    PointInteger2D.prototype.dividePoint = function (otherPoint) {
        if (!(otherPoint instanceof PointInteger2D)) {
            throw new Error("Argument 'otherPoint' must be an instance of PointInteger2D.");
        }
        if (otherPoint.x === 0 || otherPoint.y === 0) {
            throw new Error("Division by zero in PointInteger2D.dividePoint: one or more components of 'otherPoint' are zero.");
        }
        return new PointInteger2D(this.x / otherPoint.x, this.y / otherPoint.y);
    };

    /**
     * Checks if this PointInteger2D is equal to another object.
     * @param {object} comparisonTarget - The object to compare with.
     * @returns {boolean} True if the objects are equal (same type and coordinates), false otherwise.
     */
    PointInteger2D.prototype.isEquivalent = function (comparisonTarget) {
        return (comparisonTarget instanceof PointInteger2D) &&
               (this.x === comparisonTarget.x) &&
               (this.y === comparisonTarget.y);
    };

    /**
     * Returns a string representation of this PointInteger2D.
     * @returns {string} A string in the format "{X:val, Y:val}".
     */
    PointInteger2D.prototype.toFormattedString = function () {
        return `{X:${this.x}, Y:${this.y}}`; // Using template literals for string formatting.
    };

    // endregion

    // region: Rectangle Structure

    /**
     * Represents an axis-aligned bounding box or rectangle.
     * @class
     * @param {number} startX - The X-coordinate of the top-left corner.
     * @param {number} startY - The Y-coordinate of the top-left corner.
     * @param {number} extentWidth - The width of the rectangle.
     * @param {number} extentHeight - The height of the rectangle.
     */
    CoreEngine.RectangularArea = function (startX, startY, extentWidth, extentHeight) {
        this.x = startX;
        this.y = startY;
        this.width = extentWidth;
        this.height = extentHeight;
    };
    const RectangularArea = CoreEngine.RectangularArea;

    // A static instance representing an empty rectangle at the origin.
    RectangularArea.emptyArea = new RectangularArea(0, 0, 0, 0);

    /**
     * Checks if this RectangularArea is identical to another object.
     * @param {object} otherObject - The object to compare against.
     * @returns {boolean} True if the objects are RectangularAreas with the same dimensions and position, false otherwise.
     */
    RectangularArea.prototype.isEqualTo = function (otherObject) {
        if (!(otherObject instanceof RectangularArea)) return false; // Type check.
        return (this.x === otherObject.x) &&
               (this.y === otherObject.y) &&
               (this.width === otherObject.width) &&
               (this.height === otherObject.height);
    };

    /**
     * Determines if this RectangularArea contains a given point or another rectangular area.
     * Overloaded method:
     * - `contains(point)`
     * - `contains(rectangle)`
     * - `contains(x, y)`
     * @param {PointInteger2D|RectangularArea|number} arg1 - A point object, a rectangle object, or an X-coordinate.
     * @param {number} [arg2] - The Y-coordinate if arg1 is an X-coordinate.
     * @returns {boolean} True if the area contains the specified entity, false otherwise.
     */
    RectangularArea.prototype.encompasses = function (arg1, arg2) {
        if (arg1 instanceof PointInteger2D) {
            const pt = arg1;
            return (this.x <= pt.x) && (pt.x < this.x + this.width) &&
                   (this.y <= pt.y) && (pt.y < this.y + this.height);
        } else if (arg1 instanceof RectangularArea) {
            const rect = arg1;
            const thisRight = this.x + this.width;
            const thisBottom = this.y + this.height;
            const rectRight = rect.x + rect.width;
            const rectBottom = rect.y + rect.height;

            return (this.x <= rect.x) && (rectRight <= thisRight) &&
                   (this.y <= rect.y) && (rectBottom <= thisBottom);
        } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
            const checkX = arg1;
            const checkY = arg2;
            return (this.x <= checkX) && (checkX < this.x + this.width) &&
                   (this.y <= checkY) && (checkY < this.y + this.height);
        }
        return false; // Invalid arguments.
    };

    /**
     * Moves the top-left corner of the rectangle to a new position.
     * Overloaded method:
     * - `reposition(newX, newY)`
     * - `reposition(newPositionPoint)`
     * @param {number|PointInteger2D} val1 - The new X-coordinate or a PointInteger2D object.
     * @param {number} [val2] - The new Y-coordinate (required if val1 is a number).
     */
    RectangularArea.prototype.reposition = function (val1, val2) {
        let targetX, targetY;
        if (val1 instanceof PointInteger2D) {
            targetX = val1.x;
            targetY = val1.y;
        } else if (typeof val1 === 'number' && typeof val2 === 'number') {
            targetX = val1;
            targetY = val2;
        } else {
            throw new Error("Invalid arguments for RectangularArea.reposition. Expected (x, y) or (PointInteger2D).");
        }
        this.x = targetX;
        this.y = targetY;
    };

    /**
     * Calculates the center point of this RectangularArea.
     * @returns {PointInteger2D} A new PointInteger2D representing the center.
     */
    RectangularArea.prototype.getCentralPoint = function () {
        const centerX = this.x + (this.width / 2);
        const centerY = this.y + (this.height / 2);
        return new PointInteger2D(centerX, centerY);
    };

    /**
     * Inflates or deflates the rectangle by a specified amount in horizontal and vertical directions.
     * @param {number} hDelta - The amount to inflate/deflate horizontally.
     * @param {number} vDelta - The amount to inflate/deflate vertically.
     */
    RectangularArea.prototype.adjustSize = function (hDelta, vDelta) {
        this.x -= hDelta;
        this.y -= vDelta;
        this.width += hDelta * 2;
        this.height += vDelta * 2;
    };

    /**
     * Checks if the rectangle is empty (has zero width, height, and is at the origin).
     * @returns {boolean} True if the rectangle is empty, false otherwise.
     */
    RectangularArea.prototype.queryIsEmpty = function () {
        return this.width === 0 && this.height === 0 && this.x === 0 && this.y === 0;
    };

    /**
     * Returns a string representation of the rectangle's properties.
     * @returns {string} A formatted string.
     */
    RectangularArea.prototype.getDebugInfo = function () {
        return `[X:${this.x}, Y:${this.y}, W:${this.width}, H:${this.height}]`;
    };

    /**
     * Determines if this RectangularArea intersects with another RectangularArea.
     * @param {RectangularArea} otherRect - The other rectangle to check for intersection.
     * @returns {boolean} True if the rectangles intersect, false otherwise.
     */
    RectangularArea.prototype.collidesWith = function (otherRect) {
        if (!(otherRect instanceof RectangularArea)) return false; // Validate input.
        const thisRight = this.getRightBoundary();
        const thisBottom = this.getBottomBoundary();
        const otherLeft = otherRect.getLeftBoundary();
        const otherTop = otherRect.getTopBoundary();
        const otherRight = otherRect.getRightBoundary();
        const otherBottom = otherRect.getBottomBoundary();

        return otherLeft < thisRight && this.getLeftBoundary() < otherRight &&
               otherTop < thisBottom && this.getTopBoundary() < otherBottom;
    };

    /**
     * Creates a new RectangularArea that represents the union of two existing areas.
     * The union is the smallest rectangle that contains both input rectangles.
     * @static
     * @param {RectangularArea} rectA - The first rectangle.
     * @param {RectangularArea} rectB - The second rectangle.
     * @returns {RectangularArea} A new RectangularArea representing the union.
     */
    RectangularArea.computeUnion = function (rectA, rectB) {
        if (!(rectA instanceof RectangularArea) || !(rectB instanceof RectangularArea)) {
            throw new Error("Both arguments must be instances of RectangularArea.");
        }

        const newX = NumericHelpers.getMinimum(rectA.x, rectB.x);
        const newY = NumericHelpers.getMinimum(rectA.y, rectB.y);
        const maxRight = NumericHelpers.getMaximum(rectA.getRightBoundary(), rectB.getRightBoundary());
        const maxBottom = NumericHelpers.getMaximum(rectA.getBottomBoundary(), rectB.getBottomBoundary());

        return new RectangularArea(newX, newY, maxRight - newX, maxBottom - newY);
    };

    // Getter methods for rectangle boundaries.
    RectangularArea.prototype.getLeftBoundary = function () { return this.x; };
    RectangularArea.prototype.getRightBoundary = function () { return this.x + this.width; };
    RectangularArea.prototype.getTopBoundary = function () { return this.y; };
    RectangularArea.prototype.getBottomBoundary = function () { return this.y + this.height; };

    // endregion

    // region: 2D Vector Structure

    /**
     * Represents a 2D vector or point with floating-point components.
     * @class
     * @param {number} xComponent - The X component.
     * @param {number} [yComponent] - The Y component. If undefined, defaults to xComponent.
     */
    CoreEngine.Vector2f = function (xComponent, yComponent) {
        this.x = xComponent;
        this.y = (yComponent === undefined) ? xComponent : yComponent;
    };
    const Vector2f = CoreEngine.Vector2f;

    // Static instances for common vectors.
    Vector2f.zeroVector = new Vector2f(0.0);
    Vector2f.oneVector = new Vector2f(1.0);
    Vector2f.unitX = new Vector2f(1.0, 0.0);
    Vector2f.unitY = new Vector2f(0.0, 1.0);

    /**
     * Returns a new vector with components negated.
     * @returns {Vector2f} A new Vector2f with negative components.
     */
    Vector2f.prototype.getNegative = function () {
        return new Vector2f(-this.x, -this.y); // Corrected original bug: should negate components.
    };

    /**
     * Compares this vector to another object for equality.
     * @param {object} otherObject - The object to compare.
     * @returns {boolean} True if the object is a Vector2f with identical components, false otherwise.
     */
    Vector2f.prototype.isIdentical = function (otherObject) {
        return (otherObject instanceof Vector2f) &&
               (otherObject.x === this.x) &&
               (otherObject.y === this.y);
    };

    /**
     * Adds another vector to this vector, returning a new vector.
     * @param {Vector2f} anotherVector - The vector to add.
     * @returns {Vector2f} A new Vector2f representing the sum.
     */
    Vector2f.prototype.add = function (anotherVector) {
        if (!(anotherVector instanceof Vector2f)) {
            throw new Error("Argument 'anotherVector' must be an instance of Vector2f.");
        }
        return new Vector2f(this.x + anotherVector.x, this.y + anotherVector.y);
    };

    /**
     * Multiplies this vector by a scalar or another vector component-wise.
     * @param {number|Vector2f} factor - The scalar or vector to multiply by.
     * @returns {Vector2f} A new Vector2f representing the product.
     */
    Vector2f.prototype.scale = function (factor) {
        if (typeof factor === "number") {
            return new Vector2f(this.x * factor, this.y * factor);
        } else if (factor instanceof Vector2f) {
            return new Vector2f(this.x * factor.x, this.y * factor.y);
        }
        throw new Error("Argument 'factor' must be a number or a Vector2f instance.");
    };

    /**
     * Divides this vector by a scalar or another vector component-wise.
     * @param {number|Vector2f} divisor - The scalar or vector to divide by.
     * @returns {Vector2f} A new Vector2f representing the quotient.
     */
    Vector2f.prototype.divide = function (divisor) {
        if (typeof divisor === "number") {
            if (divisor === 0) throw new Error("Division by zero scalar in Vector2f.divide.");
            return new Vector2f(this.x / divisor, this.y / divisor);
        } else if (divisor instanceof Vector2f) {
            if (divisor.x === 0 || divisor.y === 0) throw new Error("Division by zero component in Vector2f.divide.");
            return new Vector2f(this.x / divisor.x, this.y / divisor.y);
        }
        throw new Error("Argument 'divisor' must be a number or a Vector2f instance.");
    };

    /**
     * Calculates the Euclidean distance between two vectors.
     * @static
     * @param {Vector2f} vec1 - The first vector.
     * @param {Vector2f} vec2 - The second vector.
     * @returns {number} The distance between the two vectors.
     */
    Vector2f.calculateEuclideanDistance = function (vec1, vec2) {
        if (!(vec1 instanceof Vector2f) || !(vec2 instanceof Vector2f)) {
            throw new Error("Both arguments must be instances of Vector2f.");
        }
        const dx = vec1.x - vec2.x;
        const dy = vec1.y - vec2.y;
        return Math.hypot(dx, dy); // Uses Math.hypot for better precision and readability.
    };

    /**
     * Calculates the squared Euclidean distance between two vectors.
     * Useful for comparisons where the actual square root is not needed.
     * @static
     * @param {Vector2f} vec1 - The first vector.
     * @param {Vector2f} vec2 - The second vector.
     * @returns {number} The squared distance.
     */
    Vector2f.calculateSquaredDistance = function (vec1, vec2) {
        if (!(vec1 instanceof Vector2f) || !(vec2 instanceof Vector2f)) {
            throw new Error("Both arguments must be instances of Vector2f.");
        }
        const deltaX = vec1.x - vec2.x;
        const deltaY = vec1.y - vec2.y;
        return (deltaX * deltaX) + (deltaY * deltaY);
    };

    /**
     * Reflects an incoming vector across a surface defined by a normal vector.
     * @static
     * @param {Vector2f} incidentVector - The incoming vector.
     * @param {Vector2f} surfaceNormal - The normal vector of the surface.
     * @returns {Vector2f} The reflected vector.
     */
    Vector2f.reflectAroundNormal = function (incidentVector, surfaceNormal) {
        if (!(incidentVector instanceof Vector2f) || !(surfaceNormal instanceof Vector2f)) {
            throw new Error("Both arguments must be instances of Vector2f.");
        }
        // Formula: R = I - 2 * (I . N) * N
        const dotProd = (incidentVector.x * surfaceNormal.x) + (incidentVector.y * surfaceNormal.y);
        const reflectedX = incidentVector.x - (2.0 * surfaceNormal.x * dotProd);
        const reflectedY = incidentVector.y - (2.0 * surfaceNormal.y * dotProd);
        return new Vector2f(reflectedX, reflectedY);
    };

    /**
     * Computes the length (magnitude) of this vector.
     * @returns {number} The length of the vector.
     */
    Vector2f.prototype.magnitude = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };

    /**
     * Computes the squared length (magnitude) of this vector.
     * @returns {number} The squared length of the vector.
     */
    Vector2f.prototype.squaredMagnitude = function () {
        return (this.x * this.x) + (this.y * this.y);
    };

    /**
     * Returns a new vector containing the maximum components from two vectors.
     * @static
     * @param {Vector2f} vecA - The first vector.
     * @param {Vector2f} vecB - The second vector.
     * @returns {Vector2f} A new Vector2f with the maximum components.
     */
    Vector2f.componentMax = function (vecA, vecB) {
        if (!(vecA instanceof Vector2f) || !(vecB instanceof Vector2f)) {
            throw new Error("Both arguments must be instances of Vector2f.");
        }
        return new Vector2f(NumericHelpers.getMaximum(vecA.x, vecB.x), NumericHelpers.getMaximum(vecA.y, vecB.y));
    };

    /**
     * Returns a new vector containing the minimum components from two vectors.
     * @static
     * @param {Vector2f} vecA - The first vector.
     * @param {Vector2f} vecB - The second vector.
     * @returns {Vector2f} A new Vector2f with the minimum components.
     */
    Vector2f.componentMin = function (vecA, vecB) {
        if (!(vecA instanceof Vector2f) || !(vecB instanceof Vector2f)) {
            throw new Error("Both arguments must be instances of Vector2f.");
        }
        return new Vector2f(NumericHelpers.getMinimum(vecA.x, vecB.x), NumericHelpers.getMinimum(vecA.y, vecB.y));
    };

    /**
     * Normalizes this vector in-place, making its magnitude 1.
     * If the vector is a zero vector, it remains unchanged.
     */
    Vector2f.prototype.normalizeInPlace = function () {
        const currentMag = this.magnitude();
        if (currentMag === 0) {
            // Cannot normalize a zero vector.
            return;
        }
        const inverseMag = 1.0 / currentMag;
        this.x *= inverseMag;
        this.y *= inverseMag;
    };

    /**
     * Performs barycentric interpolation between three Vector2f instances.
     * @static
     * @param {Vector2f} v1 - The first vector.
     * @param {Vector2f} v2 - The second vector.
     * @param {Vector2f} v3 - The third vector.
     * @param {number} weight1 - The weighting factor for v2.
     * @param {number} weight2 - The weighting factor for v3.
     * @returns {Vector2f} A new Vector2f representing the interpolated value.
     */
    Vector2f.barycentric = function (v1, v2, v3, weight1, weight2) {
        return new Vector2f(
            NumericHelpers.barycentricInterpolate1D(v1.x, v2.x, v3.x, weight1, weight2),
            NumericHelpers.barycentricInterpolate1D(v1.y, v2.y, v3.y, weight1, weight2)
        );
    };

    /**
     * Performs Catmull-Rom interpolation between four Vector2f instances.
     * @static
     * @param {Vector2f} p0 - The first control point vector.
     * @param {Vector2f} p1 - The second control point vector.
     * @param {Vector2f} p2 - The third control point vector.
     * @param {Vector2f} p3 - The fourth control point vector.
     * @param {number} t - The interpolation parameter (0 to 1).
     * @returns {Vector2f} A new Vector2f representing the interpolated value.
     */
    Vector2f.catmullRom = function (p0, p1, p2, p3, t) {
        return new Vector2f(
            NumericHelpers.catmullRomSpline(p0.x, p1.x, p2.x, p3.x, t),
            NumericHelpers.catmullRomSpline(p0.y, p1.y, p2.y, p3.y, t)
        );
    };

    /**
     * Clamps a Vector2f's components within a specified min and max vector range.
     * @static
     * @param {Vector2f} inputVec - The vector to clamp.
     * @param {Vector2f} minVec - The minimum component values.
     * @param {Vector2f} maxVec - The maximum component values.
     * @returns {Vector2f} A new Vector2f with clamped components.
     */
    Vector2f.clamp = function (inputVec, minVec, maxVec) {
        return new Vector2f(
            NumericHelpers.constrainValue(inputVec.x, minVec.x, maxVec.x),
            NumericHelpers.constrainValue(inputVec.y, minVec.y, maxVec.y)
        );
    };

    /**
     * Performs linear interpolation between two Vector2f instances.
     * @static
     * @param {Vector2f} startVec - The starting vector.
     * @param {Vector2f} endVec - The ending vector.
     * @param {number} amount - The interpolation factor (0.0 to 1.0).
     * @returns {Vector2f} A new Vector2f representing the interpolated value.
     */
    Vector2f.lerp = function (startVec, endVec, amount) {
        return new Vector2f(
            NumericHelpers.linearInterpolation(startVec.x, endVec.x, amount),
            NumericHelpers.linearInterpolation(startVec.y, endVec.y, amount)
        );
    };

    /**
     * Performs smooth step interpolation between two Vector2f instances.
     * @static
     * @param {Vector2f} startVec - The starting vector.
     * @param {Vector2f} endVec - The ending vector.
     * @param {number} amount - The interpolation factor.
     * @returns {Vector2f} A new Vector2f representing the smoothly interpolated value.
     */
    Vector2f.smoothStep = function (startVec, endVec, amount) {
        return new Vector2f(
            NumericHelpers.smoothStepTransition(startVec.x, endVec.x, amount),
            NumericHelpers.smoothStepTransition(startVec.y, endVec.y, amount)
        );
    };

    /**
     * Helper function to apply a 4x4 transformation matrix to an array of 2D vectors.
     * This function modifies the destination array in place.
     * @param {Array<Vector2f>} srcArray - The array of source vectors.
     * @param {number} srcIdx - The starting index in the source array.
     * @param {Matrix4x4} transformMat - The transformation matrix.
     * @param {Array<Vector2f>} destArray - The array to store transformed vectors.
     * @param {number} destIdx - The starting index in the destination array.
     * @param {number} count - The number of vectors to transform.
     */
    function _applyVector2fTransformBatch(srcArray, srcIdx, transformMat, destArray, destIdx, count) {
        for (let i = 0; i < count; i++) {
            const currentSource = srcArray[srcIdx + i];
            let currentDest = destArray[destIdx + i];

            // Ensure the destination slot is a Vector2f object, create if null/undefined.
            if (!currentDest || !(currentDest instanceof Vector2f)) {
                currentDest = new Vector2f(0, 0);
                destArray[destIdx + i] = currentDest;
            }

            const newX = (currentSource.x * transformMat._m11) +
                         (currentSource.y * transformMat._m21) +
                          transformMat._m41;
            const newY = (currentSource.x * transformMat._m12) +
                         (currentSource.y * transformMat._m22) +
                          transformMat._m42;

            currentDest.x = newX;
            currentDest.y = newY;
        }
    }

    /**
     * Transforms a Vector2f or an array of Vector2f by a Matrix4x4.
     * Overloaded method to support single vector transformation or batch transformation.
     *
     * @static
     * @param {Vector2f|Array<Vector2f>} source - The source vector or array of vectors.
     * @param {Matrix4x4|number} matrixOrSourceIndex - The transformation matrix or the starting index in the source array.
     * @param {Array<Vector2f>} [destArray] - The destination array for batch transformation.
     * @param {number} [destIndex] - The starting index in the destination array.
     * @param {number} [numElements] - The number of elements to transform in a batch.
     * @returns {Vector2f|void} A new transformed Vector2f for single transformations, or void for batch transforms (modifies destArray in-place).
     */
    Vector2f.transform = function (source, matrixOrSourceIndex, destArray, destIndex, numElements) {
        // Single vector transformation: transform(vector, matrix)
        if (source instanceof Vector2f && matrixOrSourceIndex instanceof CoreEngine.Matrix4x4) {
            const vec = source;
            const mat = matrixOrSourceIndex;
            const transformedX = (vec.x * mat._m11) + (vec.y * mat._m21) + mat._m41;
            const transformedY = (vec.x * mat._m12) + (vec.y * mat._m22) + mat._m42;
            return new Vector2f(transformedX, transformedY);
        }
        // Batch transformation: transform(sourceArray, sourceIndex, matrix, destinationArray, destinationIndex, length)
        else if (Array.isArray(source) && typeof matrixOrSourceIndex === 'number' &&
                 destArray instanceof CoreEngine.Matrix4x4 && Array.isArray(arguments[3]) &&
                 typeof arguments[4] === 'number' && typeof arguments[5] === 'number') {
            _applyVector2fTransformBatch(source, matrixOrSourceIndex, destArray, arguments[3], arguments[4], arguments[5]);
        }
        // Simplified batch transformation: transform(sourceArray, matrix, destinationArray)
        else if (Array.isArray(source) && matrixOrSourceIndex instanceof CoreEngine.Matrix4x4 && Array.isArray(destArray)) {
            _applyVector2fTransformBatch(source, 0, matrixOrSourceIndex, destArray, 0, source.length);
        }
        else {
            throw new Error("Invalid arguments for Vector2f.transform. Check overloads: (vec, mat) or (srcArr, srcIdx, mat, destArr, destIdx, count) or (srcArr, mat, destArr).");
        }
    };

    /**
     * Transforms a normal vector by a Matrix4x4, ignoring translation components.
     * @static
     * @param {Vector2f} normalVector - The normal vector to transform.
     * @param {CoreEngine.Matrix4x4} transformationMatrix - The transformation matrix.
     * @returns {Vector2f} A new Vector2f representing the transformed normal.
     */
    Vector2f.transformNormal = function (normalVector, transformationMatrix) {
        if (!(normalVector instanceof Vector2f) || !(transformationMatrix instanceof CoreEngine.Matrix4x4)) {
            throw new Error("Both arguments must be instances of Vector2f and Matrix4x4 respectively.");
        }
        const newX = (normalVector.x * transformationMatrix._m11) + (normalVector.y * transformationMatrix._m21);
        const newY = (normalVector.x * transformationMatrix._m12) + (normalVector.y * transformationMatrix._m22);
        return new Vector2f(newX, newY);
    };

    // endregion

    // region: 4x4 Matrix Structure

    /**
     * Represents a 4x4 matrix, typically used for 3D transformations.
     * The components are named using a common convention (row-column).
     * @class
     */
    CoreEngine.Matrix4x4 = function (m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44) {
        this._m11 = m11; this._m12 = m12; this._m13 = m13; this._m14 = m14;
        this._m21 = m21; this._m22 = m22; this._m23 = m23; this._m24 = m24;
        this._m31 = m31; this._m32 = m32; this._m33 = m33; this._m34 = m34;
        this._m41 = m41; this._m42 = m42; this._m43 = m43; this._m44 = m44;
    };
    const Matrix4x4 = CoreEngine.Matrix4x4;

    // A static instance representing the identity matrix.
    Matrix4x4.Identity = new Matrix4x4(1, 0, 0, 0,
                                        0, 1, 0, 0,
                                        0, 0, 1, 0,
                                        0, 0, 0, 1);

    /**
     * Adds two Matrix4x4 instances component-wise, returning a new matrix.
     * @static
     * @param {Matrix4x4} matA - The first matrix.
     * @param {Matrix4x4} matB - The second matrix.
     * @returns {Matrix4x4} A new Matrix4x4 representing the sum.
     */
    Matrix4x4.addMatrices = function (matA, matB) {
        if (!(matA instanceof Matrix4x4) || !(matB instanceof Matrix4x4)) {
            throw new Error("Both arguments must be instances of Matrix4x4.");
        }

        const res11 = matA._m11 + matB._m11;
        const res12 = matA._m12 + matB._m12;
        const res13 = matA._m13 + matB._m13;
        const res14 = matA._m14 + matB._m14;

        const res21 = matA._m21 + matB._m21;
        const res22 = matA._m22 + matB._m22;
        const res23 = matA._m23 + matB._m23;
        const res24 = matA._m24 + matB._m24;

        const res31 = matA._m31 + matB._m31;
        const res32 = matA._m32 + matB._m32;
        const res33 = matA._m33 + matB._m33;
        const res34 = matA._m34 + matB._m34;

        const res41 = matA._m41 + matB._m41;
        const res42 = matA._m42 + matB._m42;
        const res43 = matA._m43 + matB._m43;
        const res44 = matA._m44 + matB._m44;

        return new Matrix4x4(
            res11, res12, res13, res14,
            res21, res22, res23, res24,
            res31, res32, res33, res34,
            res41, res42, res43, res44
        );
    };

    // Additional Matrix4x4 methods (e.g., subtract, multiply, transpose, inverse, etc.)
    // would follow here, applying similar renaming and structural changes.

    // endregion

})();