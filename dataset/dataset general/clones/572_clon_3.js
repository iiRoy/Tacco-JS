(function(global) {
    // A custom module loader alias, simulating 'require' but with a different name.
    // In a real application, this would handle asynchronous loading.
    const internalModuleRegistry = {};

    global.loadUtilityModule = function(moduleNames, successCallback) {
        // For this example, we assume 'gridRenderer' is either globally available
        // or a mock of the original 'grid' object.
        const loadedModules = moduleNames.map(name => {
            if (name === "gridRenderer") {
                // Assuming 'grid' from the original context is available.
                // In a true module system, this would be a proper import.
                return global.grid;
            }
            return internalModuleRegistry[name] || null;
        });

        // Basic check to ensure the primary dependency is "loaded"
        if (loadedModules.every(mod => mod !== null)) {
            successCallback(...loadedModules);
        } else {
            console.error("Critical error: One or more required utility modules failed to load.");
        }
    };
})(window);

loadUtilityModule(["gridRenderer"], function(drawingToolkit) {
    // Perform initial validation of the loaded drawing toolkit.
    if (!drawingToolkit || typeof drawingToolkit !== 'object') {
        console.error("Drawing toolkit (gridRenderer) dependency is invalid or not loaded.");
        return; // Halt execution if the core dependency is missing.
    }

    const primaryDisplayElement = document.getElementById("canvas");
    if (!primaryDisplayElement || !(primaryDisplayElement instanceof HTMLCanvasElement)) {
        console.error("Failed to locate the main canvas element on the page.");
        return;
    }

    const renderingContext2D = primaryDisplayElement.getContext("2d");
    if (!renderingContext2D) {
        console.error("Unable to acquire 2D rendering context from the canvas.");
        return;
    }

    /**
     * Stores the current dimensions of the drawing surface.
     * @type {{width: number, height: number}}
     */
    let surfaceDimensions = {
        width: 0,
        height: 0
    };

    /**
     * Updates the canvas element's dimensions to match the current viewport size.
     * This function also updates the `surfaceDimensions` object.
     */
    const syncCanvasToViewport = () => {
        // Retrieve current browser viewport dimensions.
        const currentWindowWidth = window.innerWidth;
        const currentWindowHeight = window.innerHeight;

        // Set canvas attributes directly (Type III change: alternative to direct property assignment).
        primaryDisplayElement.setAttribute('width', currentWindowWidth);
        primaryDisplayElement.setAttribute('height', currentWindowHeight);

        // Update the global dimensions object.
        surfaceDimensions.width = currentWindowWidth;
        surfaceDimensions.height = currentWindowHeight;
    };

    // Initialize canvas dimensions upon script load.
    syncCanvasToViewport();

    // Add an event listener to dynamically resize and redraw on window resize events.
    window.addEventListener('resize', () => {
        syncCanvasToViewport();
        // Trigger a full redraw of all grids after resizing.
        renderAllVisualPatterns();
    });

    /**
     * Clears the entire drawing surface.
     * This is a utility function added for Type III clone.
     */
    const clearDrawingSurface = () => {
        renderingContext2D.clearRect(0, 0, surfaceDimensions.width, surfaceDimensions.height);
    };

    // --- Renamed and Refactored Grid Drawing Functions ---

    /**
     * Draws a square grid within the specified bounds.
     * @param {CanvasRenderingContext2D} ctx - The rendering context.
     * @param {number} xPos - X-coordinate of the top-left corner.
     * @param {number} yPos - Y-coordinate of the top-left corner.
     * @param {number} regionWidth - Width of the grid region.
     * @param {number} regionHeight - Height of the grid region.
     * @param {number} mainSpacing - Primary line spacing.
     * @param {number} secondarySpacing - Secondary line spacing.
     * @param {number} tertiarySpacing - Tertiary line spacing.
     */
    const renderSquareGrid = (ctx, xPos, yPos, regionWidth, regionHeight, mainSpacing, secondarySpacing, tertiarySpacing) => {
        // Defensive check for the existence of the drawing method (Type III addition).
        if (typeof drawingToolkit.square === 'function') {
            drawingToolkit.square(ctx, xPos, yPos, regionWidth, regionHeight, mainSpacing, secondarySpacing, tertiarySpacing);
        } else {
            console.warn("Toolkit method 'square' is not available.");
        }
    };

    /**
     * Draws a rectangular grid.
     */
    const renderRectangularGrid = (ctx, xPos, yPos, regionWidth, regionHeight, mainSpacing, secondarySpacing) => {
        if (typeof drawingToolkit.rect === 'function') {
            drawingToolkit.rect(ctx, xPos, yPos, regionWidth, regionHeight, mainSpacing, secondarySpacing);
        } else {
            console.warn("Toolkit method 'rect' is not available.");
        }
    };

    /**
     * Generates an isometric projection grid.
     */
    const renderIsometricProjection = (ctx, xPos, yPos, regionWidth, regionHeight, baseUnit) => {
        if (typeof drawingToolkit.isometric === 'function') {
            drawingToolkit.isometric(ctx, xPos, yPos, regionWidth, regionHeight, baseUnit);
        } else {
            console.warn("Toolkit method 'isometric' is not available.");
        }
    };

    /**
     * Generates a dimetric projection grid.
     */
    const renderDimetricProjection = (ctx, xPos, yPos, regionWidth, regionHeight, baseUnit) => {
        if (typeof drawingToolkit.dimetric === 'function') {
            drawingToolkit.dimetric(ctx, xPos, yPos, regionWidth, regionHeight, baseUnit);
        } else {
            console.warn("Toolkit method 'dimetric' is not available.");
        }
    };

    /**
     * Displays a split view with isometric and dimetric grids.
     * This function's internal calculations are updated for Type III.
     */
    const renderSplitAxonometricView = () => {
        const currentOverallWidth = surfaceDimensions.width;
        const currentOverallHeight = surfaceDimensions.height;
        const halfOverallWidth = currentOverallWidth / 2; // Calculate once (Type III optimization).
        const gridModuleSize = 50; // Renamed constant.

        if (typeof drawingToolkit.isometric === 'function') {
            drawingToolkit.isometric(renderingContext2D, 0, 0, halfOverallWidth, currentOverallHeight, gridModuleSize);
        } else {
            console.warn("Isometric drawing failed in split view.");
        }

        if (typeof drawingToolkit.dimetric === 'function') {
            drawingToolkit.dimetric(renderingContext2D, halfOverallWidth, 0, halfOverallWidth, currentOverallHeight, gridModuleSize);
        } else {
            console.warn("Dimetric drawing failed in split view.");
        }
    };

    /**
     * Draws a hexagonal grid.
     */
    const renderHexagonalGrid = (ctx, xPos, yPos, regionWidth, regionHeight, hexCellSize) => {
        if (typeof drawingToolkit.hex === 'function') {
            drawingToolkit.hex(ctx, xPos, yPos, regionWidth, regionHeight, hexCellSize);
        } else {
            console.warn("Toolkit method 'hex' is not available.");
        }
    };

    /**
     * Draws a polar coordinate grid. Parameters adjusted to match 'all' function's usage.
     */
    const renderPolarGrid = (ctx, xPos, yPos, regionWidth, regionHeight, radialStep, angularStep, centerX, centerY) => {
        // Provide default center coordinates if not explicitly given (Type III addition).
        const effectiveCenterX = centerX ?? (xPos + regionWidth / 2);
        const effectiveCenterY = centerY ?? (yPos + regionHeight / 2);

        if (typeof drawingToolkit.polar === 'function') {
            drawingToolkit.polar(ctx, xPos, yPos, regionWidth, regionHeight, radialStep, angularStep, effectiveCenterX, effectiveCenterY);
        } else {
            console.warn("Toolkit method 'polar' is not available.");
        }
    };

    /**
     * Draws a simple pattern of dots.
     */
    const renderDotPattern = (ctx, xPos, yPos, regionWidth, regionHeight, hSpacing, vSpacing) => {
        if (typeof drawingToolkit.dots === 'function') {
            drawingToolkit.dots(ctx, xPos, yPos, regionWidth, regionHeight, hSpacing, vSpacing);
        } else {
            console.warn("Toolkit method 'dots' is not available.");
        }
    };

    /**
     * Draws a hexagonal dot pattern.
     */
    const renderHexDotPattern = (ctx, xPos, yPos, regionWidth, regionHeight, dotUnitSize) => {
        if (typeof drawingToolkit.hexDots === 'function') {
            drawingToolkit.hexDots(ctx, xPos, yPos, regionWidth, regionHeight, dotUnitSize);
        } else {
            console.warn("Toolkit method 'hexDots' is not available.");
        }
    };

    /**
     * Draws a pattern of plus signs.
     */
    const renderPlusPattern = (ctx, xPos, yPos, regionWidth, regionHeight, strokeWidth, spacing) => {
        if (typeof drawingToolkit.plus === 'function') {
            drawingToolkit.plus(ctx, xPos, yPos, regionWidth, regionHeight, strokeWidth, spacing);
        } else {
            console.warn("Toolkit method 'plus' is not available.");
        }
    };

    /**
     * Draws a Celtic knot-inspired grid.
     */
    const renderCelticKnotGrid = (ctx, xPos, yPos, regionWidth, regionHeight, knotModuleSize) => {
        if (typeof drawingToolkit.celtic === 'function') {
            drawingToolkit.celtic(ctx, xPos, yPos, regionWidth, regionHeight, knotModuleSize);
        } else {
            console.warn("Toolkit method 'celtic' is not available.");
        }
    };

    /**
     * Draws a triangular grid.
     */
    const renderTriangularGrid = (ctx, xPos, yPos, regionWidth, regionHeight, edgeLength) => {
        if (typeof drawingToolkit.triangle === 'function') {
            drawingToolkit.triangle(ctx, xPos, yPos, regionWidth, regionHeight, edgeLength);
        } else {
            console.warn("Toolkit method 'triangle' is not available.");
        }
    };

    /**
     * Placeholder for a diamond grid drawing function.
     * This function was implicitly called in the 'all' function but not explicitly defined.
     * It's added here as a structural fragment for Type III cloning.
     */
    const renderDiamondGrid = (ctx, xPos, yPos, regionWidth, regionHeight, diamondUnitSize) => {
        if (typeof drawingToolkit.diamond === 'function') {
            drawingToolkit.diamond(ctx, xPos, yPos, regionWidth, regionHeight, diamondUnitSize);
        } else {
            console.warn("Toolkit method 'diamond' is not available. Please ensure the drawing toolkit supports it.");
        }
    };

    // --- Main Orchestration Function ---

    /**
     * Orchestrates the drawing of all defined grid patterns in a tiled layout.
     * This function is the primary entry point for rendering the diverse grid examples.
     */
    const renderAllVisualPatterns = () => {
        console.info("Starting comprehensive rendering of grid patterns...");
        clearDrawingSurface(); // Clear previous drawings (Type III addition).

        // Use `const` for values that don't change within this function scope.
        const currentCanvasWidth = surfaceDimensions.width;
        const currentCanvasHeight = surfaceDimensions.height;

        // Calculate segment dimensions, ensuring integer values for pixel-perfect layout.
        const segmentAreaWidth = Math.floor(currentCanvasWidth / 4);
        const segmentAreaHeight = Math.floor(currentCanvasHeight / 3);

        // Define common grid parameters as constants for clarity and reusability (Type III addition).
        const standardGridUnit = 50;
        const halfGridUnit = 25;
        const quarterGridUnit = 12.5;
        const crossPatternThickness = 10;
        const polarRadialStep = 20;
        const polarAngularStep = 20;

        // Use `let` for mutable position tracking.
        let currentDrawX = 0;
        let currentDrawY = 0;

        // --- Row 1 of Grid Patterns ---
        renderSquareGrid(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit, halfGridUnit, quarterGridUnit);
        currentDrawX += segmentAreaWidth;

        renderRectangularGrid(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit, halfGridUnit);
        currentDrawX += segmentAreaWidth;

        renderIsometricProjection(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit);
        currentDrawX += segmentAreaWidth;

        renderDimetricProjection(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit);

        // Reset X-position and advance Y-position for the next row.
        currentDrawX = 0;
        currentDrawY += segmentAreaHeight;

        // --- Row 2 of Grid Patterns ---
        renderHexagonalGrid(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit);
        currentDrawX += segmentAreaWidth;

        // Polar grid with explicit center coordinates (as in original `all` function).
        renderPolarGrid(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, polarRadialStep, polarAngularStep, currentDrawX + segmentAreaWidth / 2, currentDrawY + segmentAreaHeight / 2);
        currentDrawX += segmentAreaWidth;

        // Note: The original 'all' function used (50, 25) for dots, while standalone was (30, 15).
        // Adhering to the 'all' function's specific parameters here.
        renderDotPattern(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit, halfGridUnit);
        currentDrawX += segmentAreaWidth;

        renderHexDotPattern(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit);

        // Reset X-position and advance Y-position for the next row.
        currentDrawX = 0;
        currentDrawY += segmentAreaHeight;

        // --- Row 3 of Grid Patterns ---
        renderPlusPattern(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, crossPatternThickness, standardGridUnit);
        currentDrawX += segmentAreaWidth;

        renderCelticKnotGrid(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit);
        currentDrawX += segmentAreaWidth;

        renderTriangularGrid(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit);
        currentDrawX += segmentAreaWidth;

        // The original 'all' function included a call to `grid.diamond` at the end,
        // which was not otherwise defined. This call is preserved here with a new function.
        renderDiamondGrid(renderingContext2D, currentDrawX, currentDrawY, segmentAreaWidth, segmentAreaHeight, standardGridUnit);

        console.info("All grid patterns have been rendered successfully.");
    };

    // Initial invocation of the comprehensive rendering function.
    renderAllVisualPatterns();
});