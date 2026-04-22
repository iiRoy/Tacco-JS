function HomographyProcessor(targetElement, visualWidth, visualHeight, allowReverseFace) {

    // Assign the DOM element to the instance
    this.targetElement = targetElement;

    // Store the element's style object
    this.elementStyle = targetElement.style;

    // Retrieve the computed style for later calculations
    this.resolvedStyle = window.getComputedStyle(targetElement);

    // Set the nominal width of the element
    this.visualWidth = visualWidth;

    // Set the nominal height of the element
    this.visualHeight = visualHeight;

    // Determine if back-facing transformations are permitted
    this.allowReverseFace = !!allowReverseFace;

    // Define the initial corner coordinates of the quad
    this.vertexTopLeft = {
        x: 0,
        y: 0
    };
    this.vertexTopRight = {
        x: visualWidth,
        y: 0
    };
    this.vertexBottomLeft = {
        x: 0,
        y: visualHeight
    };
    this.vertexBottomRight = {
        x: visualWidth,
        y: visualHeight
    };
}

// Static property to enable device pixel ratio adjustments
HomographyProcessor.applyPixelRatioCorrection = false;

// Static property to hold the device pixel ratio value
HomographyProcessor.devicePixelRatioValue = 1;

HomographyProcessor.prototype = (function() {

    // Internal object to hold shared utilities and configuration
    var transformUtilities = {
        vendorPrefix: '' // Stores the detected CSS vendor prefix
    };

    // Variables for caching computed CSS property names
    var _cssTransformProperty;
    var _cssTransformDomProperty; // Not explicitly used but similar to original structure
    var _cssTransformOriginProperty;

    // Matrix 'A' for solving the homography equation (8x8)
    var coefficientMatrix = [
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0]
    ];
    // Vector 'b' for solving the homography equation (8x1)
    var resultVector = [0, 0, 0, 0, 0, 0, 0, 0];

    /**
     * Initializes browser-specific CSS transform property names.
     * Detects vendor prefix for 'transform' and 'transform-origin'.
     */
    function _initializeStyleNames() {
        var tempDivStyle = document.createElement('div').style;
        transformUtilities.vendorPrefix =
            'webkitTransform' in tempDivStyle ? 'webkit' :
            'MozTransform' in tempDivStyle ? 'Moz' :
            'msTransform' in tempDivStyle ? 'ms' :
            '';
        _cssTransformProperty = transformUtilities.vendorPrefix + (transformUtilities.vendorPrefix.length > 0 ? 'Transform' : 'transform');
        _cssTransformOriginProperty = '-' + transformUtilities.vendorPrefix.toLowerCase() + '-transform-origin';
    }


    /**
     * Checks if any two points of the quad are too close, indicating potential numerical instability.
     * Returns true if points are within 1 pixel proximity.
     * @returns {boolean} True if problematic distances are found.
     */
    function _detectProximityIssues() {
        var deltaX, deltaY;

        // Check top-left to top-right
        deltaX = this.vertexTopLeft.x - this.vertexTopRight.x;
        deltaY = this.vertexTopLeft.y - this.vertexTopRight.y;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= 1) return true;

        // Check bottom-left to bottom-right
        deltaX = this.vertexBottomLeft.x - this.vertexBottomRight.x;
        deltaY = this.vertexBottomLeft.y - this.vertexBottomRight.y;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= 1) return true;

        // Check top-left to bottom-left
        deltaX = this.vertexTopLeft.x - this.vertexBottomLeft.x;
        deltaY = this.vertexTopLeft.y - this.vertexBottomLeft.y;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= 1) return true;

        // Check top-right to bottom-right
        deltaX = this.vertexTopRight.x - this.vertexBottomRight.x;
        deltaY = this.vertexTopRight.y - this.vertexBottomRight.y;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= 1) return true;

        // Check top-left to bottom-right (diagonal)
        deltaX = this.vertexTopLeft.x - this.vertexBottomRight.x;
        deltaY = this.vertexTopLeft.y - this.vertexBottomRight.y;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= 1) return true;

        // Check top-right to bottom-left (diagonal)
        deltaX = this.vertexTopRight.x - this.vertexBottomLeft.x;
        deltaY = this.vertexTopRight.y - this.vertexBottomLeft.y;
        if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= 1) return true;

        return false;
    }

    /**
     * Computes the determinant of a 2D triangle formed by three points.
     * Useful for checking concavity or winding order.
     * @param {object} pointA - First point {x, y}.
     * @param {object} pointB - Second point {x, y}.
     * @param {object} pointC - Third point {x, y}.
     * @returns {number} The determinant value.
     */
    function _calculateTriangleDeterminant(pointA, pointB, pointC) {
        return pointA.x * pointB.y + pointB.x * pointC.y + pointC.x * pointA.y - pointA.y * pointB.x - pointB.y * pointC.x - pointC.y * pointA.x;
    }

    /**
     * Determines if the quadrilateral is concave or if it's back-facing
     * when back-facing transformations are not allowed.
     * @returns {boolean} True if the quad is invalid (concave or back-facing).
     */
    function _checkShapeValidity() {
        // Check the first triangle (TL, TR, BR) and second (BR, BL, TL)
        var determinantOne = _calculateTriangleDeterminant(this.vertexTopLeft, this.vertexTopRight, this.vertexBottomRight);
        var determinantTwo = _calculateTriangleDeterminant(this.vertexBottomRight, this.vertexBottomLeft, this.vertexTopLeft);
        if (this.allowReverseFace) {
            if (determinantOne * determinantTwo <= 0) return true; // Concave
        } else {
            if (determinantOne <= 0 || determinantTwo <= 0) return true; // Concave or back-facing
        }

        // Check the other pair of triangles (TR, BR, BL) and (BL, TL, TR)
        determinantOne = _calculateTriangleDeterminant(this.vertexTopRight, this.vertexBottomRight, this.vertexBottomLeft);
        determinantTwo = _calculateTriangleDeterminant(this.vertexBottomLeft, this.vertexTopLeft, this.vertexTopRight);
        if (this.allowReverseFace) {
            if (determinantOne * determinantTwo <= 0) return true; // Concave
        } else {
            if (determinantOne <= 0 || determinantTwo <= 0) return true; // Concave or back-facing
        }
        return false; // Shape is valid
    }

    /**
     * Performs various validation checks on the current quad configuration.
     * @returns {number} An error code (0 for no error, 1 for proximity issues, 2 for shape validity issues).
     */
    function validateConfiguration() {
        if (_detectProximityIssues.apply(this)) return 1; // Points are too close, matrix might be singular.
        if (_checkShapeValidity.apply(this)) return 2; // Quad is concave or facing away (if restricted).
        return 0; // No issues detected.
    }

    /**
     * Calculates and applies the 3D perspective transformation matrix to the element.
     * This involves solving a system of linear equations to find the homography matrix.
     */
    function applyTransformation() {
        var elemWidth = this.visualWidth;
        var elemHeight = this.visualHeight;

        // Calculate offsets from the transform origin of the element
        var originOffsetX = 0;
        var originOffsetY = 0;
        var originValue = this.resolvedStyle.getPropertyValue(_cssTransformOriginProperty);

        if (originValue.indexOf('px') > -1) {
            originValue = originValue.split('px');
            originOffsetX = -parseFloat(originValue[0]);
            originOffsetY = -parseFloat(originValue[1]);
        } else if (originValue.indexOf('%') > -1) {
            originValue = originValue.split('%');
            originOffsetX = -parseFloat(originValue[0]) * elemWidth / 100;
            originOffsetY = -parseFloat(originValue[1]) * elemHeight / 100;
        }

        // Prepare the destination points and the system of equations
        var destinationPoints = [this.vertexTopLeft, this.vertexTopRight, this.vertexBottomLeft, this.vertexBottomRight];
        var solutionVector = [0, 1, 2, 3, 4, 5, 6, 7]; // Used for pivot tracking during Gaussian elimination

        for (var idx = 0; idx < 4; idx++) {
            // Populate rows of coefficientMatrix for X coordinates
            coefficientMatrix[idx][0] = coefficientMatrix[idx + 4][3] = (idx & 1) ? elemWidth + originOffsetX : originOffsetX;
            coefficientMatrix[idx][1] = coefficientMatrix[idx + 4][4] = (idx > 1) ? elemHeight + originOffsetY : originOffsetY;
            coefficientMatrix[idx][6] = ((idx & 1) ? -originOffsetX - elemWidth : -originOffsetX) * (destinationPoints[idx].x + originOffsetX);
            coefficientMatrix[idx][7] = ((idx > 1) ? -originOffsetY - elemHeight : -originOffsetY) * (destinationPoints[idx].x + originOffsetX);

            // Populate rows of coefficientMatrix for Y coordinates
            coefficientMatrix[idx + 4][6] = ((idx & 1) ? -originOffsetX - elemWidth : -originOffsetX) * (destinationPoints[idx].y + originOffsetY);
            coefficientMatrix[idx + 4][7] = ((idx > 1) ? -originOffsetY - elemHeight : -originOffsetY) * (destinationPoints[idx].y + originOffsetY);

            // Populate resultVector
            resultVector[idx] = (destinationPoints[idx].x + originOffsetX);
            resultVector[idx + 4] = (destinationPoints[idx].y + originOffsetY);

            // Set constant terms and zeros in coefficientMatrix
            coefficientMatrix[idx][2] = coefficientMatrix[idx + 4][5] = 1;
            coefficientMatrix[idx][3] = coefficientMatrix[idx][4] = coefficientMatrix[idx][5] = coefficientMatrix[idx + 4][0] = coefficientMatrix[idx + 4][1] = coefficientMatrix[idx + 4][2] = 0;
        }

        // --- Gaussian Elimination with Partial Pivoting to solve for homography coefficients ---
        var maxIndex, currentSum;
        var currentRow;
        var currentColumn = [];
        var idx1, idx2, idx3, tempVal;

        for (var j_col = 0; j_col < 8; j_col++) {
            for (var i_row = 0; i_row < 8; i_row++) currentColumn[i_row] = coefficientMatrix[i_row][j_col];

            for (idx1 = 0; idx1 < 8; idx1++) {
                currentRow = coefficientMatrix[idx1];
                maxIndex = idx1 < j_col ? idx1 : j_col;
                currentSum = 0.0;
                for (idx3 = 0; idx3 < maxIndex; idx3++) currentSum += currentRow[idx3] * currentColumn[idx3];
                currentRow[j_col] = currentColumn[idx1] -= currentSum;
            }

            var pivotRow = j_col;
            for (idx1 = j_col + 1; idx1 < 8; idx1++) {
                if (Math.abs(currentColumn[idx1]) > Math.abs(currentColumn[pivotRow])) pivotRow = idx1;
            }

            if (pivotRow != j_col) {
                // Swap rows in coefficientMatrix
                for (idx3 = 0; idx3 < 8; idx3++) {
                    tempVal = coefficientMatrix[pivotRow][idx3];
                    coefficientMatrix[pivotRow][idx3] = coefficientMatrix[j_col][idx3];
                    coefficientMatrix[j_col][idx3] = tempVal;
                }
                // Swap rows in pivot tracking vector
                tempVal = solutionVector[pivotRow];
                solutionVector[pivotRow] = solutionVector[j_col];
                solutionVector[j_col] = tempVal;
            }

            // Normalize current column
            if (coefficientMatrix[j_col][j_col] != 0.0) {
                for (idx1 = j_col + 1; idx1 < 8; idx1++) coefficientMatrix[idx1][j_col] /= coefficientMatrix[j_col][j_col];
            }
        }

        // Apply row permutations to resultVector
        for (idx1 = 0; idx1 < 8; idx1++) solutionVector[idx1] = resultVector[solutionVector[idx1]];

        // Forward substitution
        for (idx3 = 0; idx3 < 8; idx3++) {
            for (idx1 = idx3 + 1; idx1 < 8; idx1++) solutionVector[idx1] -= solutionVector[idx3] * coefficientMatrix[idx1][idx3];
        }

        // Backward substitution
        for (idx3 = 7; idx3 > -1; idx3--) {
            solutionVector[idx3] /= coefficientMatrix[idx3][idx3];
            for (idx1 = 0; idx1 < idx3; idx1++) solutionVector[idx1] -= solutionVector[idx3] * coefficientMatrix[idx1][idx3];
        }
        // --- End Gaussian Elimination ---

        // Construct the CSS matrix3d transform string
        var computedStyleString = 'matrix3d(' +
            solutionVector[0].toFixed(9) + ',' + solutionVector[3].toFixed(9) + ', 0,' + solutionVector[6].toFixed(9) + ',' +
            solutionVector[1].toFixed(9) + ',' + solutionVector[4].toFixed(9) + ', 0,' + solutionVector[7].toFixed(9) + ',' +
            '0, 0, 1, 0,' +
            solutionVector[2].toFixed(9) + ',' + solutionVector[5].toFixed(9) + ', 0, 1)';

        // Apply device pixel ratio fix if enabled
        if (HomographyProcessor.applyPixelRatioCorrection) {
            var pixelRatio = HomographyProcessor.devicePixelRatioValue;
            computedStyleString = 'scale(' + pixelRatio + ',' + pixelRatio + ')perspective(1000px)' + computedStyleString + 'translateZ(' + ((1 - pixelRatio) * 1000) + 'px)';
        }

        // Apply the generated style to the element, ensuring numerical precision
        return this.elementStyle[_cssTransformProperty] = computedStyleString;

    }

    // Initialize CSS style names when the prototype is created
    _initializeStyleNames();

    // Expose public methods through the returned object
    transformUtilities.applyTransformation = applyTransformation;
    transformUtilities.validateConfiguration = validateConfiguration;

    return transformUtilities;

})();