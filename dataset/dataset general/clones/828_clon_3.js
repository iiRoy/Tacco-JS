// A versatile graphics agent for HTML Canvas, drawing inspiration from Logo's turtle graphics.
// This module offers a fluent interface for creating geometric paths and shapes.

// Key Operational Conventions:
// - All spatial measurements (positions, distances) are expressed in pixel units.
// - All angular measurements are provided in degrees, aligning with typical human intuition.

const GraphicPathController = function(canvasElementSelector) {
    // Fundamental mathematical constant for degree-to-radian conversion.
    const DEG_TO_RAD_CONV_FACTOR = Math.PI / 180.0;
    // Default initial orientation: pointing upwards on the canvas.
    const INITIAL_ORIENTATION_DEGREES = -90;

    // --- Current State Properties ---
    this.currentHorizontalPosition = 0; // The agent's X-coordinate.
    this.currentVerticalPosition = 0;   // The agent's Y-coordinate.
    this.agentOrientationDegrees = INITIAL_ORIENTATION_DEGREES; // The agent's current direction.

    // --- Canvas Context and Drawing Attributes ---
    let designatedCanvasElement = document.getElementById(canvasElementSelector) || canvasElementSelector;

    // Robust validation for the canvas element.
    if (!designatedCanvasElement || !(designatedCanvasElement instanceof HTMLCanvasElement)) {
        console.error("GraphicPathController: The provided identifier or object is not a valid HTMLCanvasElement.");
        // Fallback: Attempt to dynamically create and append a canvas.
        designatedCanvasElement = document.createElement('canvas');
        document.body.appendChild(designatedCanvasElement);
        console.warn("GraphicPathController: No valid canvas found or provided. A new default canvas has been created and appended to the document body.");
        designatedCanvasElement.width = 800; // Default width
        designatedCanvasElement.height = 600; // Default height
    }

    this.canvasRenderingContext = designatedCanvasElement.getContext("2d");
    if (!this.canvasRenderingContext) {
        throw new Error("GraphicPathController: Unable to acquire 2D rendering context from the canvas.");
    }

    this.lineBorderColor = "#000000"; // Default line color: black.
    this.canvasRenderingContext.strokeStyle = this.lineBorderColor;

    this.lineStrokeWidth = 1; // Default line thickness: 1 pixel.
    this.canvasRenderingContext.lineWidth = this.lineStrokeWidth;

    this.shapeFillColor = ""; // Default fill color: transparent/none.
    this.canvasRenderingContext.fillStyle = this.shapeFillColor;

    // --- Reference Points and Drawing Mode ---
    this.polarOriginX = 0; // X-coordinate for relative polar movements.
    this.polarOriginY = 0; // Y-coordinate for relative polar movements.

    this.isLineDrawingActive = true; // Controls whether lines are drawn during movement.

    // --- Positional Memory Stack ---
    this.historicalStates = []; // Stores agent's position and orientation snapshots.

    // Start the very first path segment immediately.
    this.canvasRenderingContext.beginPath();
    this.canvasRenderingContext.moveTo(this.currentHorizontalPosition, this.currentVerticalPosition);

    /**
     * Converts an angle from degrees into radians.
     * @param {number} angleInDegrees - The angle value in degrees.
     * @returns {number} The equivalent angle in radians.
     */
    this.convertDegreesToRadians = function(angleInDegrees) {
        return angleInDegrees * DEG_TO_RAD_CONV_FACTOR;
    };
};

GraphicPathController.prototype = {
    /**
     * Adjusts the agent's current orientation by a specified amount.
     * A positive value rotates clockwise, a negative value rotates counter-clockwise.
     * @param {number} rotationIncrementDegrees - The angular change in degrees.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    alterOrientation: function(rotationIncrementDegrees) {
        if (typeof rotationIncrementDegrees !== 'number' || !Number.isFinite(rotationIncrementDegrees)) {
            console.warn("GraphicPathController: Invalid rotation increment. A finite number is required.");
            return this;
        }
        this.agentOrientationDegrees = (this.agentOrientationDegrees + rotationIncrementDegrees) % 360;
        // Normalize negative angles to be within [0, 360) range.
        if (this.agentOrientationDegrees < 0) {
            this.agentOrientationDegrees += 360;
        }
        return this;
    },

    /**
     * Defines the color to be used for filling shapes.
     * @param {string} newColorString - A valid CSS color string (e.g., "#F00", "rgb(255,0,0)", "lime").
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    setShapeFillColor: function(newColorString) {
        if (typeof newColorString !== 'string' || newColorString.trim() === '') {
            console.warn("GraphicPathController: Provided fill color is invalid or empty. Resetting to transparent.");
            this.shapeFillColor = "";
            this.canvasRenderingContext.fillStyle = "";
            return this;
        }
        this.shapeFillColor = newColorString;
        this.canvasRenderingContext.fillStyle = newColorString;
        return this;
    },

    /**
     * Records the agent's current coordinates and orientation onto a history stack.
     * This allows for later restoration using `restorePreviousState`.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
snapshotCurrentState: function() {
    this.historicalStates.push({
        xCoord: this.currentHorizontalPosition,
        yCoord: this.currentVerticalPosition,
        heading: this.agentOrientationDegrees
    });
    return this;
},

    /**
     * Sets the agent's absolute orientation. 0 degrees is interpreted as 'up' (North).
     * @param {number} targetAngleDegrees - The desired absolute angle in degrees.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    setAbsoluteOrientation: function(targetAngleDegrees) {
        if (typeof targetAngleDegrees !== 'number' || !Number.isFinite(targetAngleDegrees)) {
            console.warn("GraphicPathController: Invalid absolute angle. A finite number is required.");
            return this;
        }
        // Internally, 0 degrees points right (East). Logo's 0 degrees is up (North).
        // A conversion of -90 degrees aligns our internal system with Logo's 'up' at 0.
        this.agentOrientationDegrees = targetAngleDegrees - 90;
        return this;
    },

    /**
     * Retrieves and restores the agent's position and orientation from the last saved state.
     * If the history stack is empty, a warning is issued.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    restorePreviousState: function() {
        if (this.historicalStates.length === 0) {
            console.warn("GraphicPathController: No previous states are available in the history stack for restoration.");
            return this;
        }
        const lastSavedEntry = this.historicalStates.pop();
        this.agentOrientationDegrees = lastSavedEntry.heading;
        this.jumpTo(lastSavedEntry.xCoord, lastSavedEntry.yCoord); // Moves without drawing.
        return this;
    },

    /**
     * Advances the agent by a specified distance along its current orientation.
     * A line is drawn if `isLineDrawingActive` is true.
     * @param {number} advanceDistance - The distance to move forward in pixels.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    moveForward: function(advanceDistance) {
        if (typeof advanceDistance !== 'number' || !Number.isFinite(advanceDistance)) {
            console.warn("GraphicPathController: Invalid distance for forward movement. A finite number is required.");
            return this;
        }

        const orientationInRadians = this.convertDegreesToRadians(this.agentOrientationDegrees);

        const nextX = this.currentHorizontalPosition + advanceDistance * Math.cos(orientationInRadians);
        const nextY = this.currentVerticalPosition + advanceDistance * Math.sin(orientationInRadians);

        this.updateAgentPosition(nextX, nextY);

        return this;
    },

    /**
     * Retreats the agent by a specified distance, moving opposite to its current orientation.
     * This is implemented by temporarily reversing direction, moving, then restoring direction.
     * @param {number} retreatDistance - The distance to move backward in pixels.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    moveBackward: function(retreatDistance) {
        if (typeof retreatDistance !== 'number' || !Number.isFinite(retreatDistance)) {
            console.warn("GraphicPathController: Invalid distance for backward movement. A finite number is required.");
            return this;
        }
        this.alterOrientation(180); // Turn around
        this.moveForward(retreatDistance); // Move
        this.alterOrientation(-180); // Turn back
        return this;
    },

    /**
     * Renders the outline of the current path segment using the `lineBorderColor` and `lineStrokeWidth`.
     * This operation is skipped if no stroke color or zero line width is set.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    drawPathOutline: function() {
        if (this.lineBorderColor && this.lineStrokeWidth > 0) {
            this.canvasRenderingContext.stroke();
        } else {
            console.info("GraphicPathController: Path outline not rendered; no stroke color or line width defined.");
        }
        return this;
    },

    /**
     * Fills the interior of the current path segment with the `shapeFillColor`.
     * This operation is skipped if no fill color is set.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    fillPathInterior: function() {
        if (this.shapeFillColor) {
            this.canvasRenderingContext.fill();
        } else {
            console.info("GraphicPathController: Path interior not filled; no fill color defined.");
        }
        return this;
    },

    /**
     * Commences a new, independent path segment on the canvas.
     * All subsequent drawing commands will contribute to this new path.
     * The new path begins at the agent's current position.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    startNewDrawingPath: function() {
        this.canvasRenderingContext.beginPath();
        this.canvasRenderingContext.moveTo(this.currentHorizontalPosition, this.currentVerticalPosition);
        return this;
    },

    /**
     * Closes the current path, drawing a straight line from the current point back to the
     * starting point of the current subpath. Essential for forming complete, enclosed shapes.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    completeCurrentShape: function() {
        this.canvasRenderingContext.closePath();
        return this;
    },

    /**
     * Executes both fill and stroke operations on the current path, then starts a new path.
     * Fill is performed first (if `shapeFillColor` is set), followed by stroke (if `lineBorderColor`
     * and `lineStrokeWidth` are set).
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    renderAndResetPath: function() {
        if (this.shapeFillColor) {
            this.fillPathInterior();
        }
        if (this.lineBorderColor && this.lineStrokeWidth > 0) {
            this.drawPathOutline();
        }
        this.startNewDrawingPath(); // Automatically prepares for the next drawing operation.
        return this;
    },

    /**
     * Deactivates line drawing. Subsequent movements will not leave a trail.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    liftDrawingTool: function() {
        this.isLineDrawingActive = false;
        return this;
    },

    /**
     * Activates line drawing. Subsequent movements will draw lines.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    lowerDrawingTool: function() {
        this.isLineDrawingActive = true;
        return this;
    },

    /**
     * Internal helper to update agent's coordinates and perform the appropriate canvas drawing command.
     * @param {number} newX - The target X coordinate.
     * @param {number} newY - The target Y coordinate.
     */
    updateAgentPosition: function(newX, newY) {
        this.currentHorizontalPosition = newX;
        this.currentVerticalPosition = newY;

        if (this.isLineDrawingActive) {
            this.canvasRenderingContext.lineTo(this.currentHorizontalPosition, this.currentVerticalPosition);
        } else {
            this.canvasRenderingContext.moveTo(this.currentHorizontalPosition, this.currentVerticalPosition);
        }
    },

    /**
     * Relocates the agent to an absolute (X, Y) coordinate.
     * A line will be drawn if `isLineDrawingActive` is true.
     * @param {number} targetXCoord - The destination X-coordinate.
     * @param {number} targetYCoord - The destination Y-coordinate.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    moveToAbsolute: function(targetXCoord, targetYCoord) {
        if (typeof targetXCoord !== 'number' || !Number.isFinite(targetXCoord) ||
            typeof targetYCoord !== 'number' || !Number.isFinite(targetYCoord)) {
            console.warn("GraphicPathController: Invalid coordinates for absolute move. Finite numbers are required.");
            return this;
        }
        this.updateAgentPosition(targetXCoord, targetYCoord);
        return this;
    },

    /**
     * Instantly relocates the agent to a specific (X, Y) coordinate without drawing any line.
     * This method always initiates a new path segment.
     * @param {number} destinationX - The target X-coordinate for the jump.
     * @param {number} destinationY - The target Y-coordinate for the jump.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    jumpTo: function(destinationX, destinationY) {
        if (typeof destinationX !== 'number' || !Number.isFinite(destinationX) ||
            typeof destinationY !== 'number' || !Number.isFinite(destinationY)) {
            console.warn("GraphicPathController: Invalid coordinates for jump. Finite numbers are required.");
            return this;
        }

        this.startNewDrawingPath(); // Ensure no line is drawn from the previous point.
        this.canvasRenderingContext.moveTo(destinationX, destinationY);
        this.currentHorizontalPosition = destinationX;
        this.currentVerticalPosition = destinationY;

        return this;
    },

    /**
     * Moves the agent vertically upwards by a given distance.
     * @param {number} distancePixels - The distance to move upwards.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    shiftUpward: function(distancePixels) {
        if (typeof distancePixels !== 'number' || !Number.isFinite(distancePixels)) {
            console.warn("GraphicPathController: Invalid distance for upward shift. A finite number is required.");
            return this;
        }
        return this.moveToAbsolute(this.currentHorizontalPosition, this.currentVerticalPosition - distancePixels);
    },

    /**
     * Moves the agent vertically downwards by a given distance.
     * @param {number} distancePixels - The distance to move downwards.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    shiftDownward: function(distancePixels) {
        if (typeof distancePixels !== 'number' || !Number.isFinite(distancePixels)) {
            console.warn("GraphicPathController: Invalid distance for downward shift. A finite number is required.");
            return this;
        }
        return this.moveToAbsolute(this.currentHorizontalPosition, this.currentVerticalPosition + distancePixels);
    },

    /**
     * Moves the agent horizontally to the left by a given distance.
     * @param {number} distancePixels - The distance to move left.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    shiftLeftward: function(distancePixels) {
        if (typeof distancePixels !== 'number' || !Number.isFinite(distancePixels)) {
            console.warn("GraphicPathController: Invalid distance for leftward shift. A finite number is required.");
            return this;
        }
        return this.moveToAbsolute(this.currentHorizontalPosition - distancePixels, this.currentVerticalPosition);
    },

    /**
     * Moves the agent horizontally to the right by a given distance.
     * @param {number} distancePixels - The distance to move right.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    shiftRightward: function(distancePixels) {
        if (typeof distancePixels !== 'number' || !Number.isFinite(distancePixels)) {
            console.warn("GraphicPathController: Invalid distance for rightward shift. A finite number is required.");
            return this;
        }
        return this.moveToAbsolute(this.currentHorizontalPosition + distancePixels, this.currentVerticalPosition);
    },

    /**
     * Moves the agent using polar coordinates relative to the established `polarOrigin`.
     * A line is drawn if `isLineDrawingActive` is true.
     * The `offsetAngleDegrees` is relative to the agent's current orientation.
     * @param {number} radialDistance - The distance from the polar origin.
     * @param {number} offsetAngleDegrees - The angle, in degrees, relative to the agent's current orientation.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    navigateByPolarCoords: function(radialDistance, offsetAngleDegrees) {
        if (typeof radialDistance !== 'number' || !Number.isFinite(radialDistance) ||
            typeof offsetAngleDegrees !== 'number' || !Number.isFinite(offsetAngleDegrees)) {
            console.warn("GraphicPathController: Invalid radial distance or angle for polar navigation. Finite numbers are required.");
            return this;
        }

        // The original `polar` method added `this.dir` to the provided angle.
        // This suggests the input angle is an offset from the current heading, not an absolute angle.
        const combinedAngleRadians = this.convertDegreesToRadians(offsetAngleDegrees + this.agentOrientationDegrees);

        const newCalculatedX = this.polarOriginX + radialDistance * Math.cos(combinedAngleRadians);
        const newCalculatedY = this.polarOriginY + radialDistance * Math.sin(combinedAngleRadians);

        this.updateAgentPosition(newCalculatedX, newCalculatedY);

        return this;
    },

    /**
     * Establishes the agent's current position as the new reference point
     * for all subsequent polar coordinate movements.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    designatePolarOrigin: function() {
        this.polarOriginX = this.currentHorizontalPosition;
        this.polarOriginY = this.currentVerticalPosition;
        return this;
    },

    /**
     * Sets the pixel thickness for all lines drawn by the agent.
     * @param {number} newThicknessPixels - The desired line thickness. Must be a non-negative number.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    setLineThickness: function(newThicknessPixels) {
        if (typeof newThicknessPixels !== 'number' || !Number.isFinite(newThicknessPixels) || newThicknessPixels < 0) {
            console.warn("GraphicPathController: Invalid line thickness. Must be a non-negative finite number.");
            return this;
        }
        this.lineStrokeWidth = newThicknessPixels;
        this.canvasRenderingContext.lineWidth = newThicknessPixels;
        return this;
    },

    /**
     * Sets the color to be used for the outlines of drawn lines and shapes.
     * @param {string} newColorString - A valid CSS color string.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    setLineOutlineColor: function(newColorString) {
        if (typeof newColorString !== 'string' || newColorString.trim() === '') {
            console.warn("GraphicPathController: Invalid line outline color. Resetting to default black.");
            this.lineBorderColor = "#000000";
            this.canvasRenderingContext.strokeStyle = "#000000";
            return this;
        }
        this.lineBorderColor = newColorString;
        this.canvasRenderingContext.strokeStyle = newColorString;
        return this;
    },

    /**
     * Renders a given text string at the agent's current position.
     * The text's appearance is governed by the current font and fill style settings.
     * Note: Text rendering does not follow the agent's current orientation.
     * @param {string} textContentString - The string of text to display.
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    renderTextString: function(textContentString) {
        if (typeof textContentString !== 'string') {
            console.warn("GraphicPathController: Invalid text content provided. Must be a string.");
            return this;
        }
        // If a fill color is explicitly set, use it. Otherwise, default to black for visibility.
        if (this.shapeFillColor) {
            this.canvasRenderingContext.fillText(textContentString, this.currentHorizontalPosition, this.currentVerticalPosition);
        } else {
            console.info("GraphicPathController: Text not filled; no fill color specified. Rendering with default black.");
            const originalFill = this.canvasRenderingContext.fillStyle;
            this.canvasRenderingContext.fillStyle = "#000000"; // Temporarily set to black for text.
            this.canvasRenderingContext.fillText(textContentString, this.currentHorizontalPosition, this.currentVerticalPosition);
            this.canvasRenderingContext.fillStyle = originalFill; // Restore original fill style.
        }
        return this;
    },

    /**
     * Configures the font style for all subsequent text rendering operations.
     * @param {string} fontDefinitionString - A CSS-compatible font string (e.g., "bold 20px 'Comic Sans MS'").
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    setAgentFont: function(fontDefinitionString) {
        if (typeof fontDefinitionString !== 'string' || fontDefinitionString.trim() === '') {
            console.warn("GraphicPathController: Invalid font definition string. Must be a non-empty string.");
            return this;
        }
        this.canvasRenderingContext.font = fontDefinitionString;
        return this;
    },

    /**
     * Clears the entire canvas drawing area and resets the agent's internal state
     * (position, orientation, drawing styles, origin points, and history).
     * @returns {GraphicPathController} The current instance for method chaining.
     */
    clearCanvasAndResetState: function() {
        const canvasElement = this.canvasRenderingContext.canvas;
        this.canvasRenderingContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Reset all internal state variables to their initial defaults.
        this.currentHorizontalPosition = 0;
        this.currentVerticalPosition = 0;
        this.agentOrientationDegrees = INITIAL_ORIENTATION_DEGREES;
        this.polarOriginX = 0;
        this.polarOriginY = 0;
        this.isLineDrawingActive = true;
        this.historicalStates = []; // Empty the history stack.

        // Reapply default drawing styles to the canvas context.
        this.lineBorderColor = "#000000";
        this.canvasRenderingContext.strokeStyle = this.lineBorderColor;
        this.lineStrokeWidth = 1;
        this.canvasRenderingContext.lineWidth = this.lineStrokeWidth;
        this.shapeFillColor = "";
        this.canvasRenderingContext.fillStyle = this.shapeFillColor;
        this.canvasRenderingContext.font = "10px sans-serif"; // Standard default font.

        // Initialize a new path, moving to the reset (0,0) position.
        this.canvasRenderingContext.beginPath();
        this.canvasRenderingContext.moveTo(0, 0);
        return this;
    }
};