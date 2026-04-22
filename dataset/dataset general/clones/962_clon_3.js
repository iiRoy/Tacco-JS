/*
 * Module: Canvas Grid Overlay
 * Version: 2.0.1
 * Author: enterprisbug.github.com
 * License: MIT
 *
 * This module provides functionality to draw a customizable grid on an HTML5 canvas.
 * It's a Type III code clone, incorporating structural changes, renamings, and enhancements.
 */
(function(globalScope, pageDoc, undefVal) {

    /**
     * Applies missing properties from source objects to a target object.
     * Properties are only set if they are strictly `undefVal` in the target.
     *
     * @param {object} targetObj - The object to which properties will be applied.
     * @param {...object} sources - One or more source objects containing default values.
     * @returns {object} The modified target object.
     */
    function applyMissingSettings(targetObj, ...sources) {
        // Basic validation for the target object
        if (!targetObj || typeof targetObj !== 'object') {
            console.error("Target object for settings application is invalid.");
            return targetObj;
        }

        // Iterate through each source object provided
        for (const sourceSettings of sources) {
            // Ensure the source is a valid object before processing
            if (sourceSettings && typeof sourceSettings === 'object') {
                for (const propName in sourceSettings) {
                    // Check if the property belongs directly to the source object (not inherited)
                    if (Object.prototype.hasOwnProperty.call(sourceSettings, propName)) {
                        // Only set the property if it's currently undefined in the target
                        if (targetObj[propName] === undefVal) {
                            targetObj[propName] = sourceSettings[propName];
                        }
                    }
                }
            }
        }
        return targetObj;
    }

    /**
     * Core configuration for the grid's appearance and behavior.
     * These are the lowest-priority, system-wide defaults.
     */
    const baseConfiguration = {
        spacing: 50,          // Distance between grid lines in pixels
        strokeThickness: 1,   // Thickness of grid lines
        lineTint: "#000000",  // Color of grid lines (hex string)
        showLabels: true,     // Whether to display coordinate labels
        labelFont: "10px sans-serif" // Font style for labels
    };

    /**
     * Constructor for the GraphicGrid object.
     * Initializes a grid instance with provided or default options.
     *
     * @param {object} initialConfig - User-provided configuration object.
     * @returns {GraphicGrid} A new GraphicGrid instance.
     */
    const GraphicGrid = function GraphicGrid(initialConfig) {
        // Guard clause: Ensure the constructor is called with 'new'
        if (!(this instanceof GraphicGrid)) {
            console.warn("GraphicGrid constructor invoked without 'new' keyword. Auto-instantiating.");
            return new GraphicGrid(initialConfig);
        }

        // Sanitize the input configuration, ensuring it's an object
        const userProvidedConfig = initialConfig && typeof initialConfig === 'object' ? initialConfig : {};

        // Merge configurations in a specific order of precedence:
        // 1. userProvidedConfig (strongest)
        // 2. GraphicGrid.staticDefaults (user-settable static defaults)
        // 3. baseConfiguration (weakest, hardcoded system defaults)
        this.currentOptions = applyMissingSettings(
            {}, // Start with an empty object to build the final options
            userProvidedConfig,
            GraphicGrid.staticDefaults,
            baseConfiguration
        );
    };

    /**
     * Static property for GraphicGrid to allow users to set global defaults
     * that apply to all new instances, overriding `baseConfiguration`.
     */
    GraphicGrid.staticDefaults = {};

    /**
     * Extends the GraphicGrid prototype with its primary drawing method.
     */
    applyMissingSettings(GraphicGrid.prototype, {
        /**
         * Renders the grid onto a 2D canvas rendering context.
         *
         * @param {CanvasRenderingContext2D} canvasContext - The 2D rendering context of the canvas.
         */
        render: function(canvasContext) {
            // Guard clause: Validate the rendering context
            if (!canvasContext || typeof canvasContext.save !== 'function' || !canvasContext.canvas) {
                console.error("Invalid or missing canvas rendering context provided to GraphicGrid.render.");
                return; // Exit early if context is invalid
            }

            const instanceRef = this;
            const activeOpts = instanceRef.currentOptions;

            // Store a reference to the canvas element for easier access to dimensions
            const drawSurface = canvasContext.canvas;

            canvasContext.save(); // Save the current canvas state (transforms, styles, etc.)

            // Apply drawing styles from current options
            canvasContext.lineWidth = activeOpts.strokeThickness;
            canvasContext.strokeStyle = activeOpts.lineTint;
            canvasContext.font = activeOpts.labelFont;
            canvasContext.textBaseline = 'middle'; // For consistent label positioning
            canvasContext.textAlign = 'center'; // For consistent label positioning

            // Determine the largest dimension to ensure grid lines cover the entire canvas
            const maxExtent = Math.max(drawSurface.width, drawSurface.height);

            // Calculate offset for crisp pixel rendering of 1px lines
            const pixelOffset = (activeOpts.strokeThickness === 1.0) ? 0.5 : 0;

            // Draw horizontal grid lines
            for (let yCoord = 0; yCoord <= maxExtent; yCoord += activeOpts.spacing) {
                canvasContext.beginPath();
                canvasContext.moveTo(0, yCoord + pixelOffset);
                canvasContext.lineTo(drawSurface.width, yCoord + pixelOffset);
                canvasContext.closePath();
                canvasContext.stroke();

                // Draw label if enabled
                if (activeOpts.showLabels) {
                    // Position label slightly offset from the line for better readability
                    canvasContext.fillText(String(yCoord), 15, yCoord - 8);
                }
            }

            // Draw vertical grid lines
            for (let xCoord = 0; xCoord <= maxExtent; xCoord += activeOpts.spacing) {
                canvasContext.beginPath();
                canvasContext.moveTo(xCoord + pixelOffset, 0);
                canvasContext.lineTo(xCoord + pixelOffset, drawSurface.height);
                canvasContext.closePath();
                canvasContext.stroke();

                // Draw label if enabled
                if (activeOpts.showLabels) {
                    // Position label slightly offset from the line for better readability
                    canvasContext.fillText(String(xCoord), xCoord + 8, 15);
                }
            }

            canvasContext.restore(); // Restore the canvas to its state before drawing
        }
    });

    // Expose the GraphicGrid constructor to the global scope (e.g., window)
    globalScope.GraphicGrid = GraphicGrid;

})(window, document, undefined);