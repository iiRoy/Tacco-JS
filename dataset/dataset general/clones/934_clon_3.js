function QuadWarper(targetElement, sourceWidth, sourceHeight, allowInverted) {
    // Validate input: Ensure a valid DOM element is provided for transformation.
    if (!(targetElement instanceof HTMLElement)) {
        console.error("QuadWarper: The provided 'targetElement' must be an instance of HTMLElement.");
        throw new Error("Invalid targetElement provided to QuadWarper constructor.");
    }

    // Store a reference to the DOM element and its style properties.
    this.targetElement = targetElement;
    // `computedStyling` is for direct modification of the element's style.
    this.computedStyling = targetElement.style;
    // `liveCssProps` provides read-only access to the element's currently applied CSS.
    this.liveCssProps = window.getComputedStyle(targetElement);

    // Store the original dimensions of the element, which serve as the source rectangle for the transform.
    this.sourceWidth = sourceWidth;
    this.sourceHeight = sourceHeight;

    // Determine if back-facing polygons (i.e., inverted transformations) are permitted.
    // Explicitly convert to a boolean.
    this.allowInverted = Boolean(allowInverted);

    // Initialize the four corner points of the quadrilateral.
    // These points define the target shape that the source rectangle will be warped into.
    // Using xPos and yPos for clarity instead of generic x, y.
    this.cornerTL = { xPos: 0, yPos: 0 }; // Top-Left
    this.cornerTR = { xPos: sourceWidth, yPos: 0 }; // Top-Right
    this.cornerBL = { xPos: 0, yPos: sourceHeight }; // Bottom-Left
    this.cornerBR = { xPos: sourceWidth, yPos: sourceHeight }; // Bottom-Right
}

// Static properties for global configuration, accessible directly via the constructor function.
QuadWarper.enableDPRCorrection = false; // Flag to enable device pixel ratio correction.
QuadWarper.devicePixelRatioValue = 1; // Stores the current device pixel ratio for correction.

QuadWarper.prototype = (function() {
    // Private scope for module-level variables and helper functions.

    // Internal state object to store detected browser-specific CSS prefixes.
    const moduleState = {
        vendorPrefix: ''
    };

    // Cached CSS property names for transform and transform-origin, to avoid repeated string concatenation.
    let _cssTransformPropertyName;
    let _cssTransformOriginPropertyName;

    // Reusable matrices and vectors for the Gaussian elimination process.
    // These are initialized once and then reset/populated in `applyTransformation` to reduce garbage collection.
    const transformationMatrix = Array(8).fill(null).map(() => Array(8).fill(0)); // 8x8 matrix A
    const solutionVector = Array(8).fill(0); // Vector b, which becomes x after solving

    // A small constant used for floating point comparisons to account for precision issues.
    const FLOATING_POINT_EPSILON = 1e-6;

    /**
     * Detects the browser's CSS transform prefix (e.g., 'webkit', 'Moz', 'ms')
     * and caches the full CSS property names for 'transform' and 'transform-origin'.
     * This function runs once when the prototype is initialized.
     * @private
     */
    function _detectCssVendorPrefixes() {
        const tempDivStyle = document.createElement('div').style; // Use a temporary div to test style properties.

        // Check for common vendor prefixes.
        if ('webkitTransform' in tempDivStyle) {
            moduleState.vendorPrefix = 'webkit';
        } else if ('MozTransform' in tempDivStyle) {
            moduleState.vendorPrefix = 'Moz';
        } else if ('msTransform' in tempDivStyle) {
            moduleState.vendorPrefix = 'ms';
        } else {
            moduleState.vendorPrefix = ''; // No prefix needed for standard 'transform'.
        }

        // Construct the full CSS transform property name.
        _cssTransformPropertyName = moduleState.vendorPrefix
            ? `${moduleState.vendorPrefix}Transform`
            : 'transform';

        // Construct the full CSS transform-origin property name, converting prefix to lowercase for CSS.
        _cssTransformOriginPropertyName = moduleState.vendorPrefix
            ? `-${moduleState.vendorPrefix.toLowerCase()}-transform-origin`
            : 'transform-origin'; // Standard property name.
    }

    /**
     * Checks for numerical stability issues by ensuring that no two corner points are too close to each other.
     * If points are extremely close, the transformation matrix can become singular or ill-conditioned.
     * @returns {boolean} True if any pair of points is within a 1-pixel squared distance, false otherwise.
     * @private
     */
    function _checkForProximityErrors() {
        const cornerPoints = [this.cornerTL, this.cornerTR, this.cornerBL, this.cornerBR];
        const minimumDistanceSquared = 1 * 1; // 1 pixel squared threshold.

        // Iterate through all unique pairs of points.
        for (let i = 0; i < cornerPoints.length; i++) {
            for (let j = i + 1; j < cornerPoints.length; j++) {
                const p1 = cornerPoints[i];
                const p2 = cornerPoints[j];
                const deltaX = p1.xPos - p2.xPos;
                const deltaY = p1.yPos - p2.yPos;
                // Calculate squared Euclidean distance to avoid Math.sqrt for performance.
                if ((deltaX * deltaX + deltaY * deltaY) <= minimumDistanceSquared) {
                    return true; // Points are too close.
                }
            }
        }
        return false; // All points are sufficiently separated.
    }

    /**
     * Calculates the signed area (or cross product determinant) of a triangle formed by three 2D points.
     * This is used to determine polygon orientation (clockwise/counter-clockwise) and concavity.
     * @param {object} p0 - The first point {xPos, yPos}.
     * @param {object} p1 - The second point {xPos, yPos}.
     * @param {object} p2 - The third point {xPos, yPos}.
     * @returns {number} The determinant value. A positive value indicates counter-clockwise winding,
     *                   negative indicates clockwise, and zero indicates collinear points.
     * @private
     */
    function _calculateTriangleDeterminant(p0, p1, p2) {
        return p0.xPos * (p1.yPos - p2.yPos) +
               p1.xPos * (p2.yPos - p0.yPos) +
               p2.xPos * (p0.yPos - p1.yPos);
    }

    /**
     * Checks if the quadrilateral formed by the corner points is concave or back-facing.
     * A quadrilateral is concave if an internal angle is greater than 180 degrees.
     * It's back-facing if its normal vector points away from the viewer (determined by orientation).
     * @returns {boolean} True if the polygon is invalid (concave or back-facing based on `allowInverted`), false otherwise.
     * @private
     */
    function _validatePolygonGeometry() {
        // A quadrilateral can be split into two triangles by either diagonal.
        // For a convex polygon, both triangles formed by either diagonal should have consistent orientation.
        // For a concave polygon, one of these pairs will show inconsistent orientation.

        // Check using diagonal 1 (TL-BR)
        const det1_tri1 = _calculateTriangleDeterminant(this.cornerTL, this.cornerTR, this.cornerBR);
        const det1_tri2 = _calculateTriangleDeterminant(this.cornerBR, this.cornerBL, this.cornerTL);

        if (this.allowInverted) {
            // If inverted faces are allowed, we primarily check for concavity.
            // Concavity occurs if the two triangles formed by a diagonal have "opposite" orientations
            // relative to each other (i.e., their determinants have opposite signs, or one is zero).
            // A product less than or equal to zero indicates this.
            if ((det1_tri1 * det1_tri2) <= FLOATING_POINT_EPSILON) {
                return true; // Concave or degenerate.
            }
        } else {
            // If inverted faces are NOT allowed, both triangles must have positive area (counter-clockwise winding).
            // A non-positive determinant indicates a clockwise winding or a degenerate triangle.
            if (det1_tri1 <= FLOATING_POINT_EPSILON || det1_tri2 <= FLOATING_POINT_EPSILON) {
                return true; // Back-facing or concave.
            }
        }

        // Check using diagonal 2 (TR-BL) for robustness against complex concavity.
        const det2_tri1 = _calculateTriangleDeterminant(this.cornerTR, this.cornerBR, this.cornerBL);
        const det2_tri2 = _calculateTriangleDeterminant(this.cornerBL, this.cornerTL, this.cornerTR);

        if (this.allowInverted) {
            if ((det2_tri1 * det2_tri2) <= FLOATING_POINT_EPSILON) {
                return true; // Concave or degenerate.
            }
        } else {
            if (det2_tri1 <= FLOATING_POINT_EPSILON || det2_tri2 <= FLOATING_POINT_EPSILON) {
                return true; // Back-facing or concave.
            }
        }

        return false; // Polygon is valid and convex (or allowed to be inverted).
    }

    /**
     * Public method to validate the current state of the corner points.
     * Useful for pre-flight checks before attempting a transformation.
     * @returns {number} An error code:
     *                   0: No errors detected.
     *                   1: Corner points are too close, risking numerical instability.
     *                   2: Polygon geometry is invalid (concave or back-facing when not allowed).
     */
    function validateInputGeometry() {
        if (_checkForProximityErrors.apply(this)) {
            return 1; // Error: Points are too close.
        }
        if (_validatePolygonGeometry.apply(this)) {
            return 2; // Error: Invalid polygon geometry.
        }
        return 0; // All checks passed.
    }

    /**
     * Parses a CSS `transform-origin` string and converts it into pixel offsets
     * relative to the element's top-left corner. Handles 'px', '%', and keyword values.
     * @param {string} originCssString - The CSS `transform-origin` value (e.g., "50% 50%", "10px 20px", "center top").
     * @param {number} elementBaseWidth - The base width of the element.
     * @param {number} elementBaseHeight - The base height of the element.
     * @returns {{x: number, y: number}} An object containing the calculated x and y offsets.
     * @private
     */
    function _parseTransformOriginOffsets(originCssString, elementBaseWidth, elementBaseHeight) {
        let originXOffset = 0;
        let originYOffset = 0;

        // Helper function to map keyword/percentage/pixel values to an absolute pixel offset.
        const resolveValue = (value, dimension) => {
            if (value.endsWith('px')) {
                return parseFloat(value);
            }
            if (value.endsWith('%')) {
                return parseFloat(value) * dimension / 100;
            }
            // Handle keywords.
            switch (value) {
                case 'left':
                case 'top':
                    return 0;
                case 'center':
                    return dimension / 2;
                case 'right':
                case 'bottom':
                    return dimension;
                default:
                    return dimension / 2; // Default to center if parsing fails.
            }
        };

        // Split the string into parts, handling potential multiple spaces.
        const parts = originCssString.trim().split(/\s+/);
        let xValue = parts[0] || 'center';
        let yValue = parts[1] || 'center'; // If y is missing, it defaults to 'center'.

        originXOffset = -resolveValue(xValue, elementBaseWidth);
        originYOffset = -resolveValue(yValue, elementBaseHeight);

        return { x: originXOffset, y: originYOffset };
    }

    /**
     * Computes and applies the CSS `matrix3d` transformation to the target element
     * to warp its source rectangle into the shape defined by the four corner points.
     * This involves solving an 8x8 system of linear equations using Gaussian elimination.
     */
    function applyTransformation() {
        const currentElementWidth = this.sourceWidth;
        const currentElementHeight = this.sourceHeight;

        // Get the current transform-origin value from the computed style and parse it.
        const transformOriginCss = this.liveCssProps.getPropertyValue(_cssTransformOriginPropertyName);
        const { x: originXShift, y: originYShift } = _parseTransformOriginOffsets(transformOriginCss, currentElementWidth, currentElementHeight);

        // Array of destination points (the four corners of the target quadrilateral).
        const targetCorners = [this.cornerTL, this.cornerTR, this.cornerBL, this.cornerBR];

        // Reset the transformation matrix and solution vector before populating them.
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                transformationMatrix[row][col] = 0;
            }
            solutionVector[row] = 0;
        }

        // Populate the 8x8 transformation matrix (A) and the 8-element result vector (b).
        // The system Ax = b solves for the 8 parameters (a,b,c,d,e,f,g,h) of the perspective matrix.
        // Each of the 4 corner points (sX, sY) maps to a destination point (dX, dY),
        // yielding 2 equations per point (one for X, one for Y).
        for (let i = 0; i < 4; i++) {
            let sourceX, sourceY; // Source coordinates relative to the transform origin.

            // Determine the source point coordinates based on the corner index.
            if (i === 0) { // Top-Left
                sourceX = originXShift;
                sourceY = originYShift;
            } else if (i === 1) { // Top-Right
                sourceX = currentElementWidth + originXShift;
                sourceY = originYShift;
            } else if (i === 2) { // Bottom-Left
                sourceX = originXShift;
                sourceY = currentElementHeight + originYShift;
            } else { // Bottom-Right
                sourceX = currentElementWidth + originXShift;
                sourceY = currentElementHeight + originYShift;
            }

            // Destination coordinates are absolute, then adjusted by transform origin shift.
            const destinationX = targetCorners[i].xPos + originXShift;
            const destinationY = targetCorners[i].yPos + originYShift;

            // Equations for X-coordinates (rows 0-3 of the system):
            // a*sX + b*sY + c + g*sX*dX + h*sY*dX = dX
            transformationMatrix[i][0] = sourceX;
            transformationMatrix[i][1] = sourceY;
            transformationMatrix[i][2] = 1;
            transformationMatrix[i][6] = -sourceX * destinationX;
            transformationMatrix[i][7] = -sourceY * destinationX;
            solutionVector[i] = destinationX;

            // Equations for Y-coordinates (rows 4-7 of the system):
            // d*sX + e*sY + f + g*sX*dY + h*sY*dY = dY
            transformationMatrix[i + 4][3] = sourceX;
            transformationMatrix[i + 4][4] = sourceY;
            transformationMatrix[i + 4][5] = 1;
            transformationMatrix[i + 4][6] = -sourceX * destinationY;
            transformationMatrix[i + 4][7] = -sourceY * destinationY;
            solutionVector[i + 4] = destinationY;
        }

        // --- Gaussian Elimination with Partial Pivoting ---
        // This algorithm solves the linear system Ax = b for x.
        const systemSize = 8;
        const permutationIndices = Array(systemSize).fill(0).map((_, idx) => idx); // Tracks row permutations.
        const currentColumnCache = Array(systemSize).fill(0); // Temporary storage for column values.

        // Forward elimination phase: Transforms the matrix A into an upper triangular form.
        for (let j = 0; j < systemSize; j++) { // Iterate through columns (pivot elements)
            // Cache the current column's values.
            for (let i = 0; i < systemSize; i++) {
                currentColumnCache[i] = transformationMatrix[i][j];
            }

            // Perform row operations to zero out elements below the diagonal.
            for (let i = 0; i < systemSize; i++) {
                const currentRow = transformationMatrix[i];
                const sumFactor = Math.min(i, j); // Limit for sum calculation.
                let partialSum = 0.0;
                for (let k = 0; k < sumFactor; k++) {
                    partialSum += currentRow[k] * currentColumnCache[k];
                }
                currentRow[j] = currentColumnCache[i] -= partialSum;
            }

            // Find the pivot: the row with the largest absolute value in the current column (partial pivoting).
            let pivotCandidateRow = j;
            for (let i = j + 1; i < systemSize; i++) {
                if (Math.abs(currentColumnCache[i]) > Math.abs(currentColumnCache[pivotCandidateRow])) {
                    pivotCandidateRow = i;
                }
            }

            // Swap rows if a better pivot is found to improve numerical stability.
            if (pivotCandidateRow !== j) {
                // Swap rows in transformationMatrix.
                for (let k = 0; k < systemSize; k++) {
                    const tempMatrixVal = transformationMatrix[pivotCandidateRow][k];
                    transformationMatrix[pivotCandidateRow][k] = transformationMatrix[j][k];
                    transformationMatrix[j][k] = tempMatrixVal;
                }
                // Swap corresponding indices in permutationIndices.
                const tempPermIdx = permutationIndices[pivotCandidateRow];
                permutationIndices[pivotCandidateRow] = permutationIndices[j];
                permutationIndices[j] = tempPermIdx;
            }

            // Normalize the pivot row (make the diagonal element 1).
            const diagonalPivot = transformationMatrix[j][j];
            if (Math.abs(diagonalPivot) > FLOATING_POINT_EPSILON) { // Check for non-zero pivot.
                for (let i = j + 1; i < systemSize; i++) {
                    transformationMatrix[i][j] /= diagonalPivot;
                }
            } else {
                // If the diagonal element is zero (or very close), the matrix is singular or ill-conditioned.
                // This implies collinear points or other geometric issues, making a unique solution impossible.
                console.warn("QuadWarper: Detected a singular or ill-conditioned matrix during transformation. This may result in an invalid perspective transform. Please check your corner points for collinearity or extreme proximity.");
                // In a robust application, one might throw an error, return a default transform, or attempt recovery.
            }
        }

        // Apply row permutations to the solution vector (b) based on the pivot tracking.
        for (let i = 0; i < systemSize; i++) {
            solutionVector[i] = solutionVector[permutationIndices[i]];
        }

        // Backward substitution phase: Solves for the unknown variables (x) in the upper triangular system.
        for (let k = 0; k < systemSize; k++) {
            for (let i = k + 1; i < systemSize; i++) {
                solutionVector[i] -= solutionVector[k] * transformationMatrix[i][k];
            }
        }

        for (let k = systemSize - 1; k >= 0; k--) {
            solutionVector[k] /= transformationMatrix[k][k];
            for (let i = 0; i < k; i++) {
                solutionVector[i] -= solutionVector[k] * transformationMatrix[i][k];
            }
        }

        // The `solutionVector` now contains the 8 parameters (a, b, c, d, e, f, g, h)
        // required for the CSS `matrix3d` transform.
        const [a, b, c, d, e, f, g, h] = solutionVector;

        // Construct the CSS `matrix3d` string.
        // The `matrix3d` format is column-major:
        // matrix3d(a1, b1, c1, d1,  a2, b2, c2, d2,  a3, b3, c3, d3,  a4, b4, c4, d4)
        // For a 2D perspective transform, it simplifies to:
        // matrix3d(a, d, 0, g,   b, e, 0, h,   0, 0, 1, 0,   c, f, 0, 1)
        const outputPrecision = 9; // Number of decimal places for the CSS values.
        let finalTransformCssValue = `matrix3d(` +
            `${a.toFixed(outputPrecision)}, ${d.toFixed(outputPrecision)}, 0, ${g.toFixed(outputPrecision)}, ` +
            `${b.toFixed(outputPrecision)}, ${e.toFixed(outputPrecision)}, 0, ${h.toFixed(outputPrecision)}, ` +
            `0, 0, 1, 0, ` +
            `${c.toFixed(outputPrecision)}, ${f.toFixed(outputPrecision)}, 0, 1` +
            `)`;

        // Apply Device Pixel Ratio (DPR) correction if the static flag is enabled.
        // This is a specific workaround for certain browsers (e.g., Firefox) on high-DPR displays
        // to ensure correct rendering of perspective transforms.
        if (QuadWarper.enableDPRCorrection) {
            const currentDPR = QuadWarper.devicePixelRatioValue;
            // The fix involves scaling the element, then applying a perspective and a compensating translateZ
            // to maintain the perceived depth and size despite the initial scaling.
            finalTransformCssValue = `scale(${currentDPR.toFixed(outputPrecision)}, ${currentDPR.toFixed(outputPrecision)}) perspective(1000px) ${finalTransformCssValue} translateZ(${((1 - currentDPR) * 1000).toFixed(outputPrecision)}px)`;
        }

        // Apply the computed CSS transform to the element's style.
        this.computedStyling[_cssTransformPropertyName] = finalTransformCssValue;
    }

    // Call the CSS property detection function once when the prototype is created.
    _detectCssVendorPrefixes();

    // Define the public interface for the QuadWarper prototype.
    const publicApi = {
        applyTransformation: applyTransformation,
        validateInputGeometry: validateInputGeometry
    };

    return publicApi;
})();