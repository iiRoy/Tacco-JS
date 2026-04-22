function    PerspectiveTransform(element, width, height, useBackFacing)
{
    // The DOM element this transform applies to
    this.element       = element;

    // Direct access to the element's style object
    this.style         = element.style;
    // Computed styles for properties like transform-origin
    this.computedStyle = window.getComputedStyle(element);

    // Dimensions of the element
    this.width         = width;
    this.height        = height;

    // Flag indicating whether back-facing polygons should be considered valid
    this.useBackFacing = !!useBackFacing;

    // Define the initial corner points of the perspective transform.
    // These are relative to the element's top-left corner (0,0) before any transform.
    this.topLeft     = {x: 0, y: 0};
    this.topRight    = {x: width, y: 0};
    this.bottomLeft  = {x: 0, y: height};
    this.bottomRight = {x: width, y: height};
}


// Static property to enable a fix for device pixel ratio issues, typically on Retina displays in Firefox.
PerspectiveTransform.useDPRFix = false;
// Static property for the device pixel ratio, to be set by the user if useDPRFix is true.
PerspectiveTransform.dpr = 1;


// Define methods for the PerspectiveTransform prototype using an Immediately Invoked Function Expression (IIFE).
PerspectiveTransform.prototype = (function()
{

    var app = {
        // Prefix for CSS transform properties (e.g., 'webkit', 'Moz', 'ms', or '')
        stylePrefix: ''
    };

    // Private variables to store the browser-specific CSS transform property names.
    var _transformStyleName;        // e.g., 'webkitTransform', 'transform'
    var _transformDomStyleName;     // This variable is declared but not used in the provided code.
    var _transformOriginDomStyleName; // e.g., '-webkit-transform-origin'


    // Pre-allocate matrices for the linear system solver to avoid re-allocation in 'update'.
    // aM is an 8x8 matrix for the coefficients of the perspective transform equation system.
    var aM = [
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0]
    ];
    // bM is an 8-element vector for the right-hand side of the equation system.
    var bM = [0, 0, 0, 0, 0, 0, 0, 0];


    // Function to determine the browser's CSS transform prefix and property names.
    function _setTransformStyleName()
    {
        // Create a dummy div to test style property support.
        var testStyle = document.createElement('div').style;

        // Determine the appropriate prefix based on browser support.
        app.stylePrefix =
            'webkitTransform' in testStyle ? 'webkit' :
            'MozTransform'    in testStyle ? 'Moz'    :
            'msTransform'     in testStyle ? 'ms'     :
            ''; // Default to no prefix if none of the above are found.

        // Construct the full CSS transform property name.
        _transformStyleName = app.stylePrefix + (app.stylePrefix.length > 0 ? 'Transform' : 'transform');
        // Construct the full CSS transform-origin property name.
        _transformOriginDomStyleName = '-' + app.stylePrefix.toLowerCase() + '-transform-origin';
    }


    /*
     * Check the distances between each pair of adjacent and diagonal points.
     * If any distance is less than or equal to 1 pixel, it indicates points are too close,
     * which can lead to numerical instability in the perspective calculation.
     * Returns true if such an error is found, false otherwise.
     */
    function _hasDistancesError()
    {
        var lenX;
        var lenY;

        // Top-left to Top-right distance check
        lenX = this.topLeft.x - this.topRight.x;
        lenY = this.topLeft.y - this.topRight.y;
        if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

        // Bottom-left to Bottom-right distance check
        lenX = this.bottomLeft.x - this.bottomRight.x;
        lenY = this.bottomLeft.y - this.bottomRight.y;
        if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

        // Top-left to Bottom-left distance check
        lenX = this.topLeft.x - this.bottomLeft.x;
        lenY = this.topLeft.y - this.bottomLeft.y;
        if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

        // Top-right to Bottom-right distance check
        lenX = this.topRight.x - this.bottomRight.x;
        lenY = this.topRight.y - this.bottomRight.y;
        if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

        // Top-left to Bottom-right (diagonal) distance check
        lenX = this.topLeft.x - this.bottomRight.x;
        lenY = this.topLeft.y - this.bottomRight.y;
        if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

        // Top-right to Bottom-left (diagonal) distance check
        lenX = this.topRight.x - this.bottomLeft.x;
        lenY = this.topRight.y - this.bottomLeft.y;
        if (Math.sqrt(lenX * lenX + lenY * lenY) <= 1) return true;

        // No distances were found to be too small.
        return false;
    }

    // Calculates the determinant of three 2D points.
    // This is used to check for concavity and back-facing polygons.
    function _getDeterminant(p0, p1, p2)
    {
        return p0.x * p1.y + p1.x * p2.y + p2.x * p0.y - p0.y * p1.x - p1.y * p2.x - p2.y * p0.x;
    }

    /*
     * Checks for polygon errors: concavity or back-facing.
     * A polygon is concave if the determinants of its constituent triangles have different signs.
     * A polygon is back-facing if both determinants are negative (assuming a clockwise winding order).
     * Returns true if an error is detected, false otherwise.
     */
    function _hasPolyonError()
    {
        // Calculate determinants for the two triangles forming the quadrilateral.
        // Triangle 1: TopLeft, TopRight, BottomRight
        var det1 = _getDeterminant(this.topLeft, this.topRight, this.bottomRight);
        // Triangle 2: BottomRight, BottomLeft, TopLeft
        var det2 = _getDeterminant(this.bottomRight, this.bottomLeft, this.topLeft);

        // If useBackFacing is true, allow any orientation as long as it's not degenerate (det1*det2 <= 0 means degenerate or concave).
        if (this.useBackFacing) {
            if (det1 * det2 <= 0) return true;
        } else {
            // If useBackFacing is false, both determinants must be positive for a front-facing polygon.
            if (det1 <= 0 || det2 <= 0) return true;
        }

        // Re-check with the other pair of triangles (TopRight, BottomRight, BottomLeft) and (BottomLeft, TopLeft, TopRight)
        // This ensures concavity is caught regardless of which diagonal splits the quad.
        det1 = _getDeterminant(this.topRight, this.bottomRight, this.bottomLeft);
        det2 = _getDeterminant(this.bottomLeft, this.topLeft, this.topRight);

        if (this.useBackFacing) {
            if (det1 * det2 <= 0) return true;
        } else {
            if (det1 <= 0 || det2 <= 0) return true;
        }

        // No polygon errors detected.
        return false;
    }

    // Public method to check for various errors in the current transform configuration.
    function checkError()
    {
        // Check if any points are too close, indicating potential numerical instability.
        if (_hasDistancesError.apply(this))
        {
            return 1; // Error code 1: Points are too close to each other.
        }
        // Check if the polygon is concave or back-facing (if back-facing is not allowed).
        if (_hasPolyonError.apply(this))
        {
            return 2; // Error code 2: Concave polygon or back-facing when not allowed.
        }
        // No errors found.
        return 0; // Error code 0: No error.
    }

    // Updates the CSS transform property of the element to apply the perspective transformation.
    function update()
    {
        var width  = this.width;
        var height = this.height;

        // Get the offset from the transform origin of the element.
        // This is crucial because the perspective transform is applied relative to the origin.
        var offsetX = 0;
        var offsetY = 0;
        var offset  = this.computedStyle.getPropertyValue(_transformOriginDomStyleName);

        // Parse the transform-origin value, which can be in 'px' or '%'.
        if (offset.indexOf('px') > -1)
        {
            offset  = offset.split('px');
            offsetX = -parseFloat(offset[0]);
            offsetY = -parseFloat(offset[1]);
        }
        else if (offset.indexOf('%') > -1)
        {
            offset  = offset.split('%');
            offsetX = -parseFloat(offset[0]) * width  / 100;
            offsetY = -parseFloat(offset[1]) * height / 100;
        }


        // The core "magic" happens here: solving a system of linear equations
        // to find the coefficients of the perspective matrix.

        // Array of destination points (the transformed corners).
        var dst = [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];
        // Array to store the solution (coefficients of the matrix).
        var arr = [0, 1, 2, 3, 4, 5, 6, 7]; // This will be overwritten with coefficients.

        // Populate the aM (coefficient matrix) and bM (right-hand side vector)
        // for the linear system solver.
        for (var i = 0; i < 4; i++)
        {
            // Equations for x coordinates (top 4 rows of aM, top 4 elements of bM)
            aM[i][0] = aM[i+4][3] = (i & 1) ? width  + offsetX : offsetX; // x_i * a + y_i * b + c = x'_i
            aM[i][1] = aM[i+4][4] = (i > 1) ? height + offsetY : offsetY; // x_i * d + y_i * e + f = y'_i
            aM[i][6] = ((i & 1) ? -offsetX - width  : -offsetX) * (dst[i].x + offsetX); // -x'_i * x_i * g
            aM[i][7] = ((i > 1) ? -offsetY - height : -offsetY) * (dst[i].x + offsetX); // -x'_i * y_i * h

            // Equations for y coordinates (bottom 4 rows of aM, bottom 4 elements of bM)
            aM[i+4][6] = ((i & 1) ? -offsetX - width  : -offsetX) * (dst[i].y + offsetY); // -y'_i * x_i * g
            aM[i+4][7] = ((i > 1) ? -offsetY - height : -offsetY) * (dst[i].y + offsetY); // -y'_i * y_i * h

            bM[i] = (dst[i].x + offsetX);     // x'_i (right-hand side for x equations)
            bM[i+4] = (dst[i].y + offsetY); // y'_i (right-hand side for y equations)

            // Constant terms and zeroed out coefficients
            aM[i][2] = aM[i+4][5] = 1; // 'c' and 'f' coefficients
            aM[i][3] = aM[i][4] = aM[i][5] = aM[i+4][0] = aM[i+4][1] = aM[i+4][2] = 0; // Other coefficients are zero
        }

        // Gaussian elimination with partial pivoting to solve the linear system aM * arr = bM.
        // The solution 'arr' will contain the 8 coefficients of the perspective matrix.
        var kmax, sum;
        var row;
        var col = [];
        var i, j, k, tmp;

        // Forward elimination phase
        for (var j = 0; j < 8; j++) // Iterate through columns
        {
            // Copy current column into 'col' array
            for (var i = 0; i < 8; i++) col[i] = aM[i][j];

            // Perform elimination for current column 'j'
            for (i = 0; i < 8; i++)
            {
                row = aM[i];
                kmax = i < j ? i : j; // Determine upper bound for sum
                sum = 0.0;
                for (var k = 0; k < kmax; k++) sum += row[k] * col[k];
                row[j] = col[i] -= sum; // Update matrix element
            }

            // Find pivot (largest absolute value in the current column below the diagonal)
            var p = j;
            for (i = j + 1; i < 8; i++)
            {
                if (Math.abs(col[i]) > Math.abs(col[p])) p = i;
            }

            // Swap rows if pivot is not on the diagonal
            if (p != j)
            {
                for (k = 0; k < 8; k++)
                {
                    tmp      = aM[p][k];
                    aM[p][k] = aM[j][k];
                    aM[j][k] = tmp;
                }
                tmp      = arr[p]; // Also swap elements in the solution vector index tracker
                arr[p]   = arr[j];
                arr[j]   = tmp;
            }

            // Normalize current row if pivot is not zero
            if (aM[j][j] != 0.0)
            {
                for (i = j + 1; i < 8; i++) aM[i][j] /= aM[j][j];
            }
        }

        // Apply row permutations to the right-hand side vector bM, storing in 'arr'
        for (i = 0; i < 8; i++) arr[i] = bM[arr[i]];

        // Forward substitution (solve for L * y = b, where L is lower triangular)
        for (k = 0; k < 8; k++)
        {
            for (i = k + 1; i < 8; i++) arr[i] -= arr[k] * aM[i][k];
        }

        // Backward substitution (solve for U * x = y, where U is upper triangular)
        for (k = 7; k > -1; k--)
        {
            arr[k] /= aM[k][k];
            for (i = 0; i < k; i++) arr[i] -= arr[k] * aM[i][k];
        }

        // Construct the CSS matrix3d string from the calculated coefficients.
        // The order of coefficients in matrix3d is column-major.
        var style = 'matrix3d(' +
            arr[0].toFixed(9) + ',' + // a11
            arr[3].toFixed(9) + ', 0,' + // a21
            arr[6].toFixed(9) + ',' + // a41 (g)
            arr[1].toFixed(9) + ',' + // a12
            arr[4].toFixed(9) + ', 0,' + // a22
            arr[7].toFixed(9) + ',' + // a42 (h)
            '0, 0, 1, 0,' + // a13, a23, a33, a43 (z-axis, no rotation)
            arr[2].toFixed(9) + ',' + // a14 (c)
            arr[5].toFixed(9) + ', 0, 1)'; // a24 (f), a34, a44 (constant)


        // A fix for Firefox on Retina displays, if enabled.
        // Requires setting PerspectiveTransform.useDPRFix to true and updating PerspectiveTransform.dpr.
        if (PerspectiveTransform.useDPRFix)
        {
            var dpr = PerspectiveTransform.dpr;
            // Apply a scale and perspective transform to counteract DPR scaling, then apply the matrix3d.
            // The translateZ adjusts the effective perspective origin.
            style = 'scale(' + dpr + ',' + dpr + ')perspective(1000px)' + style + 'translateZ(' + ((1 - dpr) * 1000) + 'px)';
        }

        // Apply the generated CSS style to the element.
        // Use toFixed() to prevent floating point inaccuracies from generating extremely long numbers
        // which might cause parsing issues or performance degradation in browsers.
        return this.style[_transformStyleName] = style;

    }

    // Initialize the browser-specific transform style names when the script loads.
    _setTransformStyleName();

    // Expose public methods through the 'app' object.
    app.update    = update;
    app.checkError = checkError;

    // Return the 'app' object, which becomes the prototype.
    return app;


})();