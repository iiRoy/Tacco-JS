class ViewManipulator {
    #targetDisplay;
    #targetStyle;
    #computedDisplayAttributes;
    #surfaceWidth;
    #surfaceHeight;
    #allowRearVisibility;

    #spatialPoints = {
        upperLeft: { x: 0, y: 0 },
        upperRight: { x: 0, y: 0 },
        lowerLeft: { x: 0, y: 0 },
        lowerRight: { x: 0, y: 0 }
    };

    static pixelDensityCorrectionEnabled = false;
    static currentDevicePixelRatio = 1;

    static #vendorCache = {
        prefix: '',
        transformProperty: '',
        transformOriginProperty: ''
    };

    constructor(displayElement, initialWidth, initialHeight, enableRear) {
        this.#targetDisplay = displayElement;
        this.#targetStyle = displayElement.style;
        this.#computedDisplayAttributes = window.getComputedStyle(displayElement);
        this.#surfaceWidth = initialWidth;
        this.#surfaceHeight = initialHeight;
        this.#allowRearVisibility = !!enableRear;

        this.#spatialPoints.upperLeft = { x: 0, y: 0 };
        this.#spatialPoints.upperRight = { x: initialWidth, y: 0 };
        this.#spatialPoints.lowerLeft = { x: 0, y: initialHeight };
        this.#spatialPoints.lowerRight = { x: initialWidth, y: initialHeight };

        // Initialize vendor prefixes once
        if (!ViewManipulator.#vendorCache.transformProperty) {
            ViewManipulator.#determineVendorPrefixes();
        }
    }

    static #determineVendorPrefixes() {
        const testDiv = document.createElement('div').style;
        let pfx = '';
        if ('webkitTransform' in testDiv) pfx = 'webkit';
        else if ('MozTransform' in testDiv) pfx = 'Moz';
        else if ('msTransform' in testDiv) pfx = 'ms';

        ViewManipulator.#vendorCache.prefix = pfx;
        ViewManipulator.#vendorCache.transformProperty = pfx + (pfx.length > 0 ? 'Transform' : 'transform');
        ViewManipulator.#vendorCache.transformOriginProperty = '-' + pfx.toLowerCase() + '-transform-origin';
    }

    #checkProximityFailure() {
        const points = [
            this.#spatialPoints.upperLeft, this.#spatialPoints.upperRight,
            this.#spatialPoints.lowerLeft, this.#spatialPoints.lowerRight
        ];

        const pointPairs = [
            [points[0], points[1]], // TL-TR
            [points[2], points[3]], // BL-BR
            [points[0], points[2]], // TL-BL
            [points[1], points[3]], // TR-BR
            [points[0], points[3]], // TL-BR (diagonal)
            [points[1], points[2]]  // TR-BL (diagonal)
        ];

        for (const [pA, pB] of pointPairs) {
            const deltaX = pA.x - pB.x;
            const deltaY = pA.y - pB.y;
            if (Math.hypot(deltaX, deltaY) <= 1) return true;
        }
        return false;
    }

    #calculateOrientationIndex(pA, pB, pC) {
        return pA.x * pB.y + pB.x * pC.y + pC.x * pA.y - pA.y * pB.x - pB.y * pC.x - pC.y * pA.x;
    }

    #verifyShapeIntegrity() {
        const p = this.#spatialPoints;
        const detA = this.#calculateOrientationIndex(p.upperLeft, p.upperRight, p.lowerRight);
        const detB = this.#calculateOrientationIndex(p.lowerRight, p.lowerLeft, p.upperLeft);

        if (this.#allowRearVisibility) {
            if (detA * detB <= 0) return true;
        } else {
            if (detA <= 0 || detB <= 0) return true;
        }

        const detC = this.#calculateOrientationIndex(p.upperRight, p.lowerRight, p.lowerLeft);
        const detD = this.#calculateOrientationIndex(p.lowerLeft, p.upperLeft, p.upperRight);

        if (this.#allowRearVisibility) {
            if (detC * detD <= 0) return true;
        } else {
            if (detC <= 0 || detD <= 0) return true;
        }
        return false;
    }

    assessConfiguration() {
        if (this.#checkProximityFailure()) return 1;
        if (this.#verifyShapeIntegrity()) return 2;
        return 0;
    }

    recomputeProjection() {
        const currentWidth = this.#surfaceWidth;
        const currentHeight = this.#surfaceHeight;

        let originOffsetX = 0;
        let originOffsetY = 0;
        const originStyleValue = this.#computedDisplayAttributes.getPropertyValue(ViewManipulator.#vendorCache.transformOriginProperty);

        if (originStyleValue.includes('px')) {
            const parts = originStyleValue.split('px');
            originOffsetX = -parseFloat(parts[0]);
            originOffsetY = -parseFloat(parts[1]);
        } else if (originStyleValue.includes('%')) {
            const parts = originStyleValue.split('%');
            originOffsetX = -parseFloat(parts[0]) * currentWidth / 100;
            originOffsetY = -parseFloat(parts[1]) * currentHeight / 100;
        }

        const destinationPoints = [
            this.#spatialPoints.upperLeft,
            this.#spatialPoints.upperRight,
            this.#spatialPoints.lowerLeft,
            this.#spatialPoints.lowerRight
        ];

        // Source points relative to transform origin
        const sourcePoints = [
            { x: 0 + originOffsetX, y: 0 + originOffsetY },
            { x: currentWidth + originOffsetX, y: 0 + originOffsetY },
            { x: 0 + originOffsetX, y: currentHeight + originOffsetY },
            { x: currentWidth + originOffsetX, y: currentHeight + originOffsetY }
        ];

        // Destination points relative to transform origin
        const adjustedDestinationPoints = destinationPoints.map(p => ({
            x: p.x + originOffsetX,
            y: p.y + originOffsetY
        }));

        const matrixCoefficients = Array(8).fill(0).map(() => Array(8).fill(0));
        const solutionVector = Array(8).fill(0);

        for (let i = 0; i < 4; i++) {
            const srcX = sourcePoints[i].x;
            const srcY = sourcePoints[i].y;
            const dstX = adjustedDestinationPoints[i].x;
            const dstY = adjustedDestinationPoints[i].y;

            // Equation for X': a*srcX + b*srcY + c - g*srcX*dstX - h*srcY*dstX = dstX
            matrixCoefficients[2 * i] = [
                srcX, srcY, 1, 0, 0, 0, -srcX * dstX, -srcY * dstX
            ];
            solutionVector[2 * i] = dstX;

            // Equation for Y': d*srcX + e*srcY + f - g*srcX*dstY - h*srcY*dstY = dstY
            matrixCoefficients[2 * i + 1] = [
                0, 0, 0, srcX, srcY, 1, -srcX * dstY, -srcY * dstY
            ];
            solutionVector[2 * i + 1] = dstY;
        }

        const solvedParams = MatrixSolver.calculateSystemSolution(matrixCoefficients, solutionVector);

        // a, b, c, d, e, f, g, h
        // The original output format is matrix3d(a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1)
        const cssA = solvedParams[0];
        const cssB = solvedParams[1];
        const cssC = solvedParams[2];
        const cssD = solvedParams[3];
        const cssE = solvedParams[4];
        const cssF = solvedParams[5];
        const cssG = solvedParams[6];
        const cssH = solvedParams[7];

        let transformationString = `matrix3d(${
            cssA.toFixed(9)},${cssD.toFixed(9)},0,${cssG.toFixed(9)},${
            cssB.toFixed(9)},${cssE.toFixed(9)},0,${cssH.toFixed(9)},0,0,1,0,${
            cssC.toFixed(9)},${cssF.toFixed(9)},0,1)`;

        if (ViewManipulator.pixelDensityCorrectionEnabled) {
            const pixelRatio = ViewManipulator.currentDevicePixelRatio;
            transformationString = `scale(${pixelRatio},${pixelRatio})perspective(1000px)${transformationString}translateZ(${((1 - pixelRatio) * 1000).toFixed(9)}px)`;
        }

        this.#targetStyle[ViewManipulator.#vendorCache.transformProperty] = transformationString;
        return transformationString;
    }

    set upperLeft(point) { this.#spatialPoints.upperLeft = { ...point }; }
    set upperRight(point) { this.#spatialPoints.upperRight = { ...point }; }
    set lowerLeft(point) { this.#spatialPoints.lowerLeft = { ...point }; }
    set lowerRight(point) { this.#spatialPoints.lowerRight = { ...point }; }

    get upperLeft() { return { ...this.#spatialPoints.upperLeft }; }
    get upperRight() { return { ...this.#spatialPoints.upperRight }; }
    get lowerLeft() { return { ...this.#spatialPoints.lowerLeft }; }
    get lowerRight() { return { ...this.#spatialPoints.lowerRight }; }
}

// Internal module for matrix operations
const MatrixSolver = (function() {
    function solveGaussianElimination(coefficientMatrix, constantVector) {
        const order = coefficientMatrix.length;
        const augmentedMatrix = coefficientMatrix.map((row, idx) => [...row, constantVector[idx]]);

        for (let pivotIndex = 0; pivotIndex < order; pivotIndex++) {
            // Find row with max absolute value in current pivot column (partial pivoting)
            let maxElement = Math.abs(augmentedMatrix[pivotIndex][pivotIndex]);
            let maxRowIndex = pivotIndex;
            for (let r = pivotIndex + 1; r < order; r++) {
                if (Math.abs(augmentedMatrix[r][pivotIndex]) > maxElement) {
                    maxElement = Math.abs(augmentedMatrix[r][pivotIndex]);
                    maxRowIndex = r;
                }
            }

            // Swap max row with current pivot row
            if (maxRowIndex !== pivotIndex) {
                [augmentedMatrix[pivotIndex], augmentedMatrix[maxRowIndex]] = [augmentedMatrix[maxRowIndex], augmentedMatrix[pivotIndex]];
            }

            const currentPivot = augmentedMatrix[pivotIndex][pivotIndex];
            if (Math.abs(currentPivot) < 1e-12) { // Extremely small pivot, treat as zero
                // This means the matrix is singular or ill-conditioned.
                // The original code implicitly handles this by allowing division by zero,
                // which results in Infinity/NaN. We replicate that behavior.
            }

            // Eliminate all other rows (make current column zero except for pivot)
            for (let r = 0; r < order; r++) {
                if (r !== pivotIndex) {
                    const factor = augmentedMatrix[r][pivotIndex] / currentPivot;
                    for (let c = pivotIndex; c < order + 1; c++) { // Iterate up to augmented part
                        augmentedMatrix[r][c] -= factor * augmentedMatrix[pivotIndex][c];
                    }
                }
            }
        }

        // Normalize diagonal elements to 1 and extract solutions
        const solutions = Array(order).fill(0);
        for (let r = 0; r < order; r++) {
            solutions[r] = augmentedMatrix[r][order] / augmentedMatrix[r][r];
        }

        return solutions;
    }

    return {
        calculateSystemSolution: solveGaussianElimination
    };
})();