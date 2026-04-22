function SonicVisualizer(userSettings) {
    // Ensure settings object is valid, otherwise initialize as an empty object.
    userSettings = userSettings || {};

    // Define default configuration values for the visualizer.
    const DEFAULT_WAVE_SETTINGS = {
        width: 320,
        height: 100,
        amplitude: 1,
        speed: 0.2,
        frequency: 6,
        color: '#fff',
        container: document.body,
        autostart: false,
        ratio: window.devicePixelRatio || 1
    };

    // Merge user-provided settings with the defaults.
    // This creates a comprehensive configuration object for the instance.
    const effectiveSettings = Object.assign({}, DEFAULT_WAVE_SETTINGS, userSettings);

    // Internal state variables for the animation
    this._currentWavePhase = 0; // Tracks the current phase of the wave oscillation.
    this._isAnimating = false;  // Flag to control the animation loop.
    this._animationFrameId = null; // Stores the ID returned by requestAnimationFrame.

    // UI-related dimensions and scaling factors
    this._devicePixelDensity = effectiveSettings.ratio; // Device pixel ratio for high-DPI displays.

    // Calculate rendering dimensions based on settings and pixel density.
    this._renderWidthPx = this._devicePixelDensity * effectiveSettings.width;
    this._halfRenderWidth = this._renderWidthPx / 2;
    this._quarterRenderWidth = this._renderWidthPx / 4;

    this._renderHeightPx = this._devicePixelDensity * effectiveSettings.height;
    this._halfRenderHeight = this._renderHeightPx / 2;

    // Determine the maximum amplitude allowed for the wave, with a small buffer.
    this._maxWaveHeightPx = (this._halfRenderHeight) - 4; // Adjusted for visual padding.

    // Core wave parameters, derived from settings
    this._waveAmplitudeFactor = effectiveSettings.amplitude; // Overall intensity of the wave.
    this._animationSpeedFactor = effectiveSettings.speed;   // Rate of wave progression.
    this._waveFrequencyFactor = effectiveSettings.frequency; // Number of wave cycles.

    // Process and store the base color in an RGB string format.
    // Uses a static helper method for robust color parsing.
    this._baseColorString = SonicVisualizer._parseHexColorToRGB(effectiveSettings.color) || '255,255,255';

    // Canvas element setup
    // Create a new canvas element for drawing the wave.
    this._drawingSurface = document.createElement('canvas');
    this._drawingSurface.width = this._renderWidthPx;
    this._drawingSurface.height = this._renderHeightPx;

    // Apply CSS styles to scale the canvas appropriately for the display.
    this._drawingSurface.style.width = (this._renderWidthPx / this._devicePixelDensity) + 'px';
    this._drawingSurface.style.height = (this._renderHeightPx / this._devicePixelDensity) + 'px';
    this._drawingSurface.style.display = 'block'; // Ensure it doesn't leave gaps.

    // Identify the parent container and append the canvas.
    this._parentContainer = effectiveSettings.container;
    if (!this._parentContainer || !(this._parentContainer instanceof Element)) {
        console.warn("SonicVisualizer: Invalid container element provided. Appending to document body.");
        this._parentContainer = document.body;
    }
    this._parentContainer.appendChild(this._drawingSurface);

    // Obtain the 2D rendering context for drawing operations.
    this._drawingContext = this._drawingSurface.getContext('2d');
    if (!this._drawingContext) {
        throw new Error("SonicVisualizer: Could not get 2D rendering context from canvas.");
    }

    // Optionally start the animation immediately if configured.
    if (effectiveSettings.autostart) {
        this.beginAnimation();
    }
}

// --- Static Helper Methods ---

// Cache for storing pre-calculated global attenuation values to optimize performance.
SonicVisualizer._attenuationFactorLookup = {};

/**
 * Parses a hexadecimal color string into an RGB string (e.g., "255,255,255").
 * Supports shorthand hex codes (e.g., #FFF) and full hex codes (e.g., #FFFFFF).
 * @param {string} hexColor - The hexadecimal color string.
 * @returns {string|null} - The RGB string or null if parsing fails.
 */
SonicVisualizer._parseHexColorToRGB = function(hexColor) {
    if (!hexColor || typeof hexColor !== 'string') {
        return null; // Handle invalid input.
    }

    let cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;

    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(char => char + char).join('');
    }

    // Validate length for full hex color.
    if (cleanHex.length !== 6) {
        console.error("SonicVisualizer: Invalid hex color format detected:", hexColor);
        return null;
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Check if parsing resulted in valid numbers.
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.error("SonicVisualizer: Failed to parse hex color channels:", hexColor);
        return null;
    }

    return `${r},${g},${b}`;
};

// --- Core Animation Logic and Rendering Utilities ---

/**
 * Calculates a global attenuation factor based on an input value 'x'.
 * This function determines how much a wave's amplitude is reduced across its span.
 * The result is cached to avoid redundant calculations.
 * @param {number} xVal - The input value for attenuation calculation.
 * @returns {number} - The calculated attenuation factor.
 */
SonicVisualizer.prototype._calculateGlobalAttenuation = function(xVal) {
    if (SonicVisualizer._attenuationFactorLookup[xVal] == null) {
        const xSquared = xVal * xVal;
        const xFourth = xSquared * xSquared;
        const denominator = 4 + xFourth;
        // The original formula was (4/(4+x^4))^2.
        // Rewritten for clarity and to avoid Math.pow for small integer exponents.
        SonicVisualizer._attenuationFactorLookup[xVal] = (4 / denominator) * (4 / denominator);
    }
    return SonicVisualizer._attenuationFactorLookup[xVal];
};

/**
 * Determines the X-coordinate on the canvas for a given wave index.
 * Maps a logical wave index (e.g., from -2 to 2) to a pixel position.
 * @param {number} index - The logical index along the wave's horizontal span.
 * @returns {number} - The corresponding X-coordinate in pixels.
 */
SonicVisualizer.prototype._calculateXCoordinate = function(index) {
    return this._halfRenderWidth + index * this._quarterRenderWidth;
};

/**
 * Determines the Y-coordinate on the canvas for a given wave index and attenuation.
 * This is the core function for calculating the wave's shape.
 * @param {number} index - The logical index along the wave's horizontal span.
 * @param {number} attentuationStrength - A factor influencing the wave's vertical compression.
 * @returns {number} - The corresponding Y-coordinate in pixels.
 */
SonicVisualizer.prototype._calculateYCoordinate = function(index, attentuationStrength) {
    // Calculate the effective amplitude for this segment, considering global max and user amplitude.
    const currentAttenuatedAmplitude = (this._maxWaveHeightPx * this._waveAmplitudeFactor) / attentuationStrength;
    const globalAtten = this._calculateGlobalAttenuation(index);

    // Apply sine wave function to determine vertical displacement.
    // The wave's phase, frequency, and global attenuation all contribute.
    return this._halfRenderHeight + globalAtten * currentAttenuatedAmplitude * Math.sin(this._waveFrequencyFactor * index - this._currentWavePhase);
};

/**
 * Draws a single wave segment on the canvas.
 * This method is responsible for rendering one of the multiple layers that form the complete wave.
 * @param {number} attenuationValue - The specific attenuation factor for this wave layer.
 * @param {string} strokeColor - The CSS color string for this wave layer (e.g., 'rgba(R,G,B,A)').
 * @param {number} [lineWidthVal=1] - The thickness of the line for this wave layer.
 */
SonicVisualizer.prototype._renderWaveSegment = function(attenuationValue, strokeColor, lineWidthVal = 1) {
    const ctx = this._drawingContext; // Cache context for performance.

    ctx.beginPath(); // Start a new path for this wave line.
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidthVal;

    // Iterate across the wave's horizontal span to draw the line.
    // The loop steps are chosen to provide a smooth curve.
    // Original loop: while ((i += 0.01) <= 2)
    // Rewritten for explicit `for` loop and direct index calculation.
    for (let step = -200; step <= 200; step += 1) {
        const i = step / 100; // Convert step to logical index from -2 to 2.
        const xPos = this._calculateXCoordinate(i);
        const yPos = this._calculateYCoordinate(i, attenuationValue);

        // For the first point, use moveTo; for subsequent points, use lineTo.
        if (step === -200) {
            ctx.moveTo(xPos, yPos);
        } else {
            ctx.lineTo(xPos, yPos);
        }
    }

    ctx.stroke(); // Render the drawn path.
};

/**
 * Clears the entire canvas content for the next animation frame.
 * Uses 'destination-out' composite operation for efficient clearing of previous frames.
 */
SonicVisualizer.prototype._eraseCanvasContent = function() {
    const ctx = this._drawingContext;
    ctx.globalCompositeOperation = 'destination-out'; // Erase existing pixels.
    ctx.fillRect(0, 0, this._renderWidthPx, this._renderHeightPx); // Clear the entire canvas.
    ctx.globalCompositeOperation = 'source-over';    // Reset to default drawing mode.
};

/**
 * The main animation loop function, called by requestAnimationFrame.
 * This method updates the wave phase, clears the canvas, draws all wave layers,
 * and schedules the next frame.
 * @param {DOMHighResTimeStamp} [timestamp] - The current time provided by requestAnimationFrame.
 */
SonicVisualizer.prototype._animateFrame = function(timestamp) {
    // If animation is explicitly halted, do not proceed.
    if (!this._isAnimating) {
        // Ensure no further frames are requested.
        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }
        return;
    }

    // Update the wave's phase for the next frame, ensuring it wraps around 2*PI.
    this._currentWavePhase = (this._currentWavePhase + Math.PI * this._animationSpeedFactor) % (2 * Math.PI);

    this._eraseCanvasContent(); // Clear the canvas for redrawing.

    // Define the properties for each wave layer to be drawn.
    // These values control the appearance and behavior of each individual line.
    const waveLayersConfiguration = [
        { attenuation: -2, alpha: 0.1, thickness: 1 },
        { attenuation: -6, alpha: 0.2, thickness: 1 },
        { attenuation: 4, alpha: 0.4, thickness: 1 },
        { attenuation: 2, alpha: 0.6, thickness: 1 },
        { attenuation: 1, alpha: 1.0, thickness: 1.5 }
    ];

    // Iterate through the wave layer configurations and render each one.
    waveLayersConfiguration.forEach(layer => {
        this._renderWaveSegment(
            layer.attenuation,
            `rgba(${this._baseColorString},${layer.alpha})`,
            layer.thickness
        );
    });

    // Request the next animation frame, binding the context to maintain 'this'.
    this._animationFrameId = requestAnimationFrame(this._animateFrame.bind(this));
};

// --- Public API Methods ---

/**
 * Initiates the wave animation.
 * Resets the wave phase and sets the animation flag to true, then starts the rendering loop.
 */
SonicVisualizer.prototype.beginAnimation = function() {
    // Only start if not already animating to prevent multiple loops.
    if (this._isAnimating) {
        console.warn("SonicVisualizer: Animation is already active.");
        return;
    }
    this._currentWavePhase = 0; // Reset phase for a fresh start.
    this._isAnimating = true;   // Activate animation state.
    this._animationFrameId = requestAnimationFrame(this._animateFrame.bind(this)); // Start the loop.
};

/**
 * Halts the wave animation.
 * Sets the animation flag to false, which will stop the requestAnimationFrame loop.
 */
SonicVisualizer.prototype.haltAnimation = function() {
    this._isAnimating = false; // Deactivate animation state.
    // Cancel any pending animation frame request.
    if (this._animationFrameId) {
        cancelAnimationFrame(this._animationFrameId);
        this._animationFrameId = null;
    }
    // Optionally clear the canvas when stopping, to remove the last drawn frame.
    this._eraseCanvasContent();
};

/**
 * Adjusts the speed at which the wave animates.
 * @param {number} newRate - The new animation speed factor.
 */
SonicVisualizer.prototype.adjustAnimationRate = function(newRate) {
    if (typeof newRate !== 'number' || newRate < 0) {
        console.warn("SonicVisualizer: Invalid animation rate provided. Must be a non-negative number.");
        return;
    }
    this._animationSpeedFactor = newRate;
};

/**
 * Sets the overall intensity or amplitude of the wave.
 * Values are clamped between 0 and 1.
 * This method can also be accessed via `setWaveIntensityByNoise` for semantic equivalence.
 * @param {number} newIntensity - The new amplitude value (0 to 1).
 */
SonicVisualizer.prototype.setWaveIntensity = function(newIntensity) {
    if (typeof newIntensity !== 'number') {
        console.warn("SonicVisualizer: Invalid wave intensity provided. Must be a number.");
        return;
    }
    // Clamp the amplitude value to be within a valid range [0, 1].
    this._waveAmplitudeFactor = Math.min(Math.max(newIntensity, 0), 1);
};

// Provide an alias for setWaveIntensity for broader API compatibility or readability.
SonicVisualizer.prototype.setWaveIntensityByNoise = SonicVisualizer.prototype.setWaveIntensity;

/**
 * Disposes of the visualizer instance, cleaning up resources.
 * This includes stopping the animation, removing the canvas from the DOM,
 * and nullifying references to prevent memory leaks.
 */
SonicVisualizer.prototype.dispose = function() {
    this.haltAnimation(); // Stop any active animation.

    // Remove the canvas element from its parent container.
    if (this._drawingSurface && this._drawingSurface.parentNode) {
        this._drawingSurface.parentNode.removeChild(this._drawingSurface);
    }

    // Nullify references to aid garbage collection.
    this._drawingSurface = null;
    this._drawingContext = null;
    this._parentContainer = null;
    // Clear the cache for this instance if it were instance-specific.
    // Since _attenuationFactorLookup is static, it's not cleared here.
    // If it were per-instance, it would be `this._attenuationFactorLookup = {};`
};