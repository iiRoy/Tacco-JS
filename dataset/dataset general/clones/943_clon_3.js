(function() {

"use strict";

// Global namespace for layout components and their rendering logic.
globalThis.LayoutElements = {};

// Centralized configuration for visual rendering properties.
const RenderConfig = {
    LINE_THICKNESS_DEFAULT: 2, // Default width for outlines
    LINE_COLOR_PRIMARY: "rgba(0, 0, 0, 0.8)", // Main outline color
    AREA_COLOR_NORMAL: "rgba(192, 192, 192, 0.8)", // Standard fill color for interiors
    AREA_COLOR_HIGHLIGHT: "rgba(255, 255, 255, 0.8)", // Highlight color for special features (e.g., vaulted ceilings)
    LABEL_FONT_STYLE: "12px sans-serif", // Font definition for labels
    LABEL_COLOR_PRIMARY: "rgba(0, 0, 0, 0.8)" // Color for text labels
};

/**
 * Helper function to set up the canvas context with common transformations.
 * @param {CanvasRenderingContext2D} graphicsContext - The 2D rendering context.
 * @param {object} elementData - Data object for the element being drawn.
 * @returns {void}
 */
function applyCommonContextSettings(graphicsContext, elementData) {
    if (!elementData || !elementData.pivotPoint) {
        // Log a warning if essential data is missing, but proceed with defaults if possible.
        console.warn("LayoutElements: Missing elementData or pivotPoint for context setup.");
        return;
    }

    graphicsContext.lineWidth = RenderConfig.LINE_THICKNESS_DEFAULT;
    graphicsContext.strokeStyle = RenderConfig.LINE_COLOR_PRIMARY;
    graphicsContext.translate(elementData.pivotPoint.x, elementData.pivotPoint.y);
    graphicsContext.save(); // Isolate transformations for this element.

    // Apply rotation if an orientation angle is provided.
    if (typeof elementData.orientationAngle === 'number' && elementData.orientationAngle !== 0) {
        graphicsContext.rotate(elementData.orientationAngle * (Math.PI / 180.0)); // Convert degrees to radians.
    }
}

/**
 * Helper function to render an element's label.
 * @param {CanvasRenderingContext2D} graphicsContext - The 2D rendering context.
 * @param {object} elementData - Data object for the element containing the displayLabel.
 * @returns {void}
 */
function drawElementLabel(graphicsContext, elementData) {
    if (!elementData || !elementData.displayLabel) {
        return; // No label to draw.
    }

    graphicsContext.font = RenderConfig.LABEL_FONT_STYLE;
    graphicsContext.textAlign = "center";
    graphicsContext.textBaseline = "middle";
    graphicsContext.fillStyle = RenderConfig.LABEL_COLOR_PRIMARY;
    graphicsContext.fillText(elementData.displayLabel, 0, 0); // Label centered at the element's origin.
}


/**
 * BaseStructure: The fundamental prototype for all architectural layout elements.
 * It defines the contract and common rendering lifecycle.
 * @param {string} categoryName - A string identifying the type of this structure.
 */
LayoutElements.BaseStructure = function(categoryName) {
    this.elementType = categoryName;
};

// Define methods on the BaseStructure prototype.
LayoutElements.BaseStructure.prototype = {
    /**
     * The primary rendering method for any layout element.
     * It handles context setup, element-specific drawing, and label rendering.
     * @param {CanvasRenderingContext2D} graphicsContext - The HTML5 canvas context.
     * @param {object} elementData - The data object describing the specific element instance.
     * @param {object} drawingSurface - The FloorplanCanvas instance calling this renderer. (Not directly used here, but part of contract).
     */
    render: function(graphicsContext, elementData, drawingSurface) {
        // Apply common transformations (translation, rotation) and save context state.
        applyCommonContextSettings(graphicsContext, elementData);

        // Call the specific rendering logic for the concrete structure type.
        this.renderStructure(graphicsContext, elementData, drawingSurface);

        // Restore the canvas context to its state before this element's transformations.
        graphicsContext.restore();

        // Draw the element's descriptive label.
        drawElementLabel(graphicsContext, elementData);
    },

    /**
     * Abstract method for drawing the specific geometry of a structure.
     * Concrete implementations must override this.
     * @param {CanvasRenderingContext2D} graphicsContext - The 2D rendering context.
     * @param {object} elementData - The data object for the element.
     * @param {object} drawingSurface - The FloorplanCanvas instance.
     * @returns {void}
     */
    renderStructure: function(graphicsContext, elementData, drawingSurface) {
        // This method should be implemented by derived types.
        // It's a placeholder for the actual drawing logic.
    },

    /**
     * Retrieves the central point of the element.
     * @param {object} elementData - The data object for the element.
     * @returns {{x: number, y: number}} The central coordinates.
     */
    getCentralPoint: function(elementData) {
        // Basic validation for robustness.
        if (!elementData || !elementData.pivotPoint) {
            console.error("LayoutElements: getCentralPoint called with invalid elementData.");
            return { x: 0, y: 0 }; // Return a fallback point.
        }
        return elementData.pivotPoint;
    },

    /**
     * Calculates and returns the axis-aligned bounding box (AABB) for the element.
     * Note: This simplified version does not account for element rotation.
     * @param {object} elementData - The data object for the element.
     * @returns {{xMin: number, yMin: number, xMax: number, yMax: number}|null} Bounding box coordinates or null if data is insufficient.
     */
    getBoundingBox: function(elementData) {
        if (!elementData || !elementData.pivotPoint || !elementData.dimensions) {
            console.warn("LayoutElements: Cannot compute bounding box for element due to missing data.");
            return null;
        }

        const halfHoriz = elementData.dimensions.horizExtent / 2;
        const halfVert = elementData.dimensions.vertExtent / 2;
        const centerX = elementData.pivotPoint.x;
        const centerY = elementData.pivotPoint.y;

        return {
            xMin: centerX - halfHoriz,
            yMin: centerY - halfVert,
            xMax: centerX + halfHoriz,
            yMax: centerY + halfVert
        };
    }
};

/**
 * RectangularEnclosure: Represents a basic rectangular room or area.
 * Expected elementData properties:
 *     - uniqueId: String ID.
 *     - category: "rect-enclosure".
 *     - pivotPoint: {x, y} coordinates.
 *     - dimensions: {horizExtent, vertExtent}.
 *     - orientationAngle: Number in degrees (optional).
 */
LayoutElements.RectangularEnclosure = function() {
    LayoutElements.BaseStructure.call(this, "rect-enclosure");
};
// Establish prototypal inheritance from BaseStructure.
LayoutElements.RectangularEnclosure.prototype = Object.create(LayoutElements.BaseStructure.prototype);
// Correctly set the constructor property.
Object.defineProperty(LayoutElements.RectangularEnclosure.prototype, 'constructor', {
    value: LayoutElements.RectangularEnclosure,
    enumerable: false,
    writable: true
});

LayoutElements.RectangularEnclosure.prototype.renderStructure = function(graphicsContext, elementData, drawingSurface) {
    if (!elementData || !elementData.dimensions) {
        console.error("RectangularEnclosure: Missing dimensions for rendering.");
        return;
    }
    const halfHoriz = elementData.dimensions.horizExtent / 2;
    const halfVert = elementData.dimensions.vertExtent / 2;

    graphicsContext.fillStyle = RenderConfig.AREA_COLOR_NORMAL;
    // Draw filled rectangle centered at (0,0) due to prior translation.
    graphicsContext.fillRect(-halfHoriz, -halfVert, elementData.dimensions.horizExtent, elementData.dimensions.vertExtent);
    // Draw outline.
    graphicsContext.strokeRect(-halfHoriz, -halfVert, elementData.dimensions.horizExtent, elementData.dimensions.vertExtent);
};


/**
 * SlopedCeilingEnclosure: Represents a rectangular area with a gradient fill,
 * simulating a single-sided sloped or vaulted ceiling.
 * Expected elementData properties similar to RectangularEnclosure.
 */
LayoutElements.SlopedCeilingEnclosure = function() {
    LayoutElements.BaseStructure.call(this, "sloped-ceiling");
};
LayoutElements.SlopedCeilingEnclosure.prototype = Object.create(LayoutElements.BaseStructure.prototype);
Object.defineProperty(LayoutElements.SlopedCeilingEnclosure.prototype, 'constructor', {
    value: LayoutElements.SlopedCeilingEnclosure,
    enumerable: false,
    writable: true
});

LayoutElements.SlopedCeilingEnclosure.prototype.renderStructure = function(graphicsContext, elementData, drawingSurface) {
    if (!elementData || !elementData.dimensions) {
        console.error("SlopedCeilingEnclosure: Missing dimensions for rendering.");
        return;
    }
    const halfHoriz = elementData.dimensions.horizExtent / 2;
    const halfVert = elementData.dimensions.vertExtent / 2;

    // Create a vertical linear gradient from top to bottom.
    const fillGradient = graphicsContext.createLinearGradient(0, -halfVert, 0, halfVert);
    fillGradient.addColorStop(0, RenderConfig.AREA_COLOR_NORMAL);
    fillGradient.addColorStop(1, RenderConfig.AREA_COLOR_HIGHLIGHT); // Brighter at the bottom.

    graphicsContext.fillStyle = fillGradient;
    graphicsContext.fillRect(-halfHoriz, -halfVert, elementData.dimensions.horizExtent, elementData.dimensions.vertExtent);
    graphicsContext.strokeRect(-halfHoriz, -halfVert, elementData.dimensions.horizExtent, elementData.dimensions.vertExtent);
};


/**
 * PitchedRoofEnclosure: Represents an area with a middle-vaulted or pitched roof effect,
 * using a gradient that is brightest in the center.
 * Expected elementData properties similar to RectangularEnclosure.
 */
LayoutElements.PitchedRoofEnclosure = function() {
    LayoutElements.BaseStructure.call(this, "pitched-roof");
};
LayoutElements.PitchedRoofEnclosure.prototype = Object.create(LayoutElements.BaseStructure.prototype);
Object.defineProperty(LayoutElements.PitchedRoofEnclosure.prototype, 'constructor', {
    value: LayoutElements.PitchedRoofEnclosure,
    enumerable: false,
    writable: true
});

LayoutElements.PitchedRoofEnclosure.prototype.renderStructure = function(graphicsContext, elementData, drawingSurface) {
    if (!elementData || !elementData.dimensions) {
        console.error("PitchedRoofEnclosure: Missing dimensions for rendering.");
        return;
    }
    const halfHoriz = elementData.dimensions.horizExtent / 2;
    const halfVert = elementData.dimensions.vertExtent / 2;

    // Create a vertical linear gradient brightest in the middle.
    const fillGradient = graphicsContext.createLinearGradient(0, -halfVert, 0, halfVert);
    fillGradient.addColorStop(0, RenderConfig.AREA_COLOR_NORMAL);
    fillGradient.addColorStop(0.5, RenderConfig.AREA_COLOR_HIGHLIGHT); // Middle point.
    fillGradient.addColorStop(1, RenderConfig.AREA_COLOR_NORMAL);

    graphicsContext.fillStyle = fillGradient;
    graphicsContext.fillRect(-halfHoriz, -halfVert, elementData.dimensions.horizExtent, elementData.dimensions.vertExtent);
    graphicsContext.strokeRect(-halfHoriz, -halfVert, elementData.dimensions.horizExtent, elementData.dimensions.vertExtent);
};


/**
 * LSegmentEnclosure: An L-shaped room, defined by an overall bounding rectangle
 * and a "cutout" rectangle from one corner.
 * Expected elementData properties:
 *     - uniqueId: String ID.
 *     - category: "l-segment".
 *     - pivotPoint: {x, y} coordinates.
 *     - dimensions: {horizExtent, vertExtent} for the overall shape.
 *     - cutoutDimensions: {horizExtent, vertExtent} for the removed corner.
 *     - orientationAngle: Number in degrees (optional).
 */
LayoutElements.LSegmentEnclosure = function() {
    LayoutElements.BaseStructure.call(this, "l-segment");
};
LayoutElements.LSegmentEnclosure.prototype = Object.create(LayoutElements.BaseStructure.prototype);
Object.defineProperty(LayoutElements.LSegmentEnclosure.prototype, 'constructor', {
    value: LayoutElements.LSegmentEnclosure,
    enumerable: false,
    writable: true
});

LayoutElements.LSegmentEnclosure.prototype.renderStructure = function(graphicsContext, elementData, drawingSurface) {
    if (!elementData || !elementData.dimensions || !elementData.cutoutDimensions) {
        console.error("LSegmentEnclosure: Missing dimensions or cutoutDimensions for rendering.");
        return;
    }

    graphicsContext.fillStyle = RenderConfig.AREA_COLOR_NORMAL;

    // Pre-calculate half-dimensions for the main bounding box.
    const halfTotalHoriz = elementData.dimensions.horizExtent / 2;
    const halfTotalVert = elementData.dimensions.vertExtent / 2;
    const cutoutHoriz = elementData.cutoutDimensions.horizExtent;
    const cutoutVert = elementData.cutoutDimensions.vertExtent;

    graphicsContext.beginPath();
    // Define the L-shape path by tracing its perimeter.
    // Start at the top-left corner.
    graphicsContext.moveTo(-halfTotalHoriz, -halfTotalVert);
    // Move right, stopping before the cutout.
    graphicsContext.lineTo(halfTotalHoriz - cutoutHoriz, -halfTotalVert);
    // Move down into the L-shape.
    graphicsContext.lineTo(halfTotalHoriz - cutoutHoriz, -halfTotalVert + cutoutVert);
    // Move right to the edge of the bounding box.
    graphicsContext.lineTo(halfTotalHoriz, -halfTotalVert + cutoutVert);
    // Move down to the bottom-right.
    graphicsContext.lineTo(halfTotalHoriz, halfTotalVert);
    // Move left to the bottom-left.
    graphicsContext.lineTo(-halfTotalHoriz, halfTotalVert);
    // Move up to close the path at the starting point.
    graphicsContext.lineTo(-halfTotalHoriz, -halfTotalVert);
    graphicsContext.closePath(); // Explicitly close the path.

    graphicsContext.fill();
    graphicsContext.stroke();
};

})();