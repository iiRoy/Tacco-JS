function WaveformVisualizer(signalInputSource, displayElement, configuration = {}) {
    // A self-reference for internal method scope, mimicking the original 'scope' variable.
    const selfReference = this;

    // Default configuration settings for the visualizer.
    // Extensive renaming and addition of new parameters.
    const defaultSettings = {
        traceLineColor: 'rgba(255, 0, 0, 0.75)', // Renamed from 'color'
        gridLineStyle: '#333',                   // Renamed from 'lineColor'
        canvasBackground: '#1a1a1a',             // New: Allows setting a background color for the canvas
        horizontalScaleFactor: 1,                // Renamed from 'scaleX'
        verticalScaleFactor: 1,                  // Renamed from 'scaleY'
        dataBufferSize: 500,                     // New: Explicit buffer size, replaces implicit reliance on canvas width
        verticalAxisCenter: 0.5,                 // New: 0.5 means center, 0 means bottom, 1 means top of canvas
        traceStrokeWidth: 1.5,                   // New: Width of the waveform line
        gridLineCountY: 4                        // New: Number of horizontal grid lines (excluding center)
    };
    // Merge provided configuration with defaults
    const activeSettings = { ...defaultSettings, ...configuration };

    // Assigning properties to the instance using the new names
    this.signalInput = signalInputSource;
    this.displayCanvas = displayElement;
    this.traceLineColor = activeSettings.traceLineColor;
    this.gridLineStyle = activeSettings.gridLineStyle;
    this.canvasBackground = activeSettings.canvasBackground;
    this.horizontalScaleFactor = activeSettings.horizontalScaleFactor;
    this.verticalScaleFactor = activeSettings.verticalScaleFactor;
    this.dataBufferSize = activeSettings.dataBufferSize;
    this.verticalAxisCenter = activeSettings.verticalAxisCenter;
    this.traceStrokeWidth = activeSettings.traceStrokeWidth;
    this.gridLineCountY = activeSettings.gridLineCountY;

    // Internal data storage and graphics context
    // 'values' renamed to 'dataSampleBuffer' to be more descriptive
    let dataSampleBuffer = [];
    let bufferWritePointer = 0; // Pointer for implementing a circular buffer (Type III addition)

    // Input validation: Ensure a valid canvas element is provided.
    if (!(this.displayCanvas instanceof HTMLCanvasElement)) {
        console.error('WaveformVisualizer: The provided display element is not a valid HTMLCanvasElement.');
        return; // Abort initialization if canvas is invalid
    }

    const graphicsContext = this.displayCanvas.getContext("2d");
    if (!graphicsContext) {
        console.error('WaveformVisualizer: Failed to retrieve 2D rendering context from the canvas.');
        return; // Abort if context cannot be obtained
    }

    // Configure the rendering context with initial properties
    graphicsContext.globalAlpha = 1.0;
    graphicsContext.lineWidth = this.traceStrokeWidth;
    graphicsContext.lineCap = 'round'; // Added for improved line rendering aesthetics

    /**
     * Internal utility function to clear the canvas and apply the background color.
     * This was extracted from the main rendering loop as a separate helper (Type III).
     */
    const clearRenderingSurface = () => {
        graphicsContext.fillStyle = selfReference.canvasBackground;
        graphicsContext.fillRect(0, 0, selfReference.displayCanvas.width, selfReference.displayCanvas.height);
    };

    /**
     * Draws a more comprehensive background grid over the canvas, replacing simple cross-hairs.
     * Another helper function extracted for modularity (Type III).
     */
    const renderBackgroundGrid = () => {
        graphicsContext.strokeStyle = selfReference.gridLineStyle;
        graphicsContext.beginPath();

        // Central horizontal reference line
        const centerYPosition = selfReference.displayCanvas.height * selfReference.verticalAxisCenter;
        graphicsContext.moveTo(0, centerYPosition);
        graphicsContext.lineTo(selfReference.displayCanvas.width, centerYPosition);

        // Additional horizontal grid lines for better value reference
        const verticalSpacing = selfReference.displayCanvas.height / (selfReference.gridLineCountY + 1);
        for (let i = 1; i <= selfReference.gridLineCountY / 2; i++) {
            const offset = verticalSpacing * i;
            graphicsContext.moveTo(0, centerYPosition - offset);
            graphicsContext.lineTo(selfReference.displayCanvas.width, centerYPosition - offset);
            graphicsContext.moveTo(0, centerYPosition + offset);
            graphicsContext.lineTo(selfReference.displayCanvas.width, centerYPosition + offset);
        }

        graphicsContext.stroke();
        graphicsContext.closePath();
    };

    /**
     * The primary rendering function, responsible for drawing a single frame.
     * Renamed from 'update' to 'drawVisualFrame' for clearer semantics.
     */
    this.drawVisualFrame = function() {
        // Clear the canvas and draw the background
        clearRenderingSurface();
        // Overlay the grid lines
        renderBackgroundGrid();

        // Guard clause: Skip waveform drawing if no data is present (Type III addition)
        if (dataSampleBuffer.length === 0) {
            return;
        }

        graphicsContext.beginPath();
        graphicsContext.strokeStyle = selfReference.traceLineColor;
        graphicsContext.lineWidth = selfReference.traceStrokeWidth; // Ensure trace line width is applied

        const effectiveDisplayWidth = selfReference.displayCanvas.width / selfReference.horizontalScaleFactor;
        const effectiveDisplayHeight = selfReference.displayCanvas.height / selfReference.verticalScaleFactor;
        const yAxisReference = selfReference.displayCanvas.height * selfReference.verticalAxisCenter;

        // Determine the starting index for drawing. This handles the circular buffer.
        const chronologicalSamples = selfReference.bufferedChronologicalSamples; // Use the getter for ordered data

        // If there's no data or only one point, skip drawing a line
        if (chronologicalSamples.length < 2) {
            if (chronologicalSamples.length === 1) {
                // Draw a single point if only one sample exists
                const singleValue = chronologicalSamples[0];
                const yPos = yAxisReference - (singleValue * effectiveDisplayHeight / 2);
                graphicsContext.arc(0, yPos, selfReference.traceStrokeWidth / 2, 0, Math.PI * 2);
                graphicsContext.fill();
            }
            graphicsContext.closePath();
            return;
        }

        // Move to the initial point of the waveform
        const firstValue = chronologicalSamples[0];
        const firstY = yAxisReference - (firstValue * effectiveDisplayHeight / 2); // Invert Y-axis and center
        graphicsContext.moveTo(0, firstY);

        // Draw lines for subsequent data points
        for (let i = 1; i < chronologicalSamples.length; i++) {
            const sampleData = chronologicalSamples[i];
            const xCoordinate = (i / (chronologicalSamples.length - 1)) * selfReference.displayCanvas.width; // Map index to canvas width
            const yCoordinate = yAxisReference - (sampleData * effectiveDisplayHeight / 2); // Invert Y and scale
            graphicsContext.lineTo(xCoordinate, yCoordinate);
        }

        graphicsContext.stroke();
        graphicsContext.closePath();
    };

    /**
     * Resets the internal data buffer, effectively clearing the waveform.
     * This is a new public method added for Type III functionality.
     */
    this.clearWaveformData = function() {
        dataSampleBuffer = [];
        bufferWritePointer = 0;
        this.drawVisualFrame(); // Redraw the empty canvas
    };

    // --- Modernized Property Definitions using Object.defineProperty ---
    // Replaces the deprecated __defineGetter__ and __defineSetter__ methods.

    /**
     * Property: lastCollectedSample
     * Getter: Retrieves the most recently added sample.
     * Setter: Adds a new sample (or array of samples) to the buffer.
     *         Implements a circular buffer logic.
     */
    Object.defineProperty(this, "lastCollectedSample", {
        get: function() {
            if (dataSampleBuffer.length === 0) return undefined;
            // For a circular buffer, the last added item is at (bufferWritePointer - 1) adjusted for wrap-around.
            const lastIndex = (bufferWritePointer - 1 + selfReference.dataBufferSize) % selfReference.dataBufferSize;
            return dataSampleBuffer[lastIndex];
        },
        set: function(valueInput) {
            // Guard clause: Basic validation for input type (Type III addition)
            if (typeof valueInput !== 'number' && !Array.isArray(valueInput)) {
                console.warn('WaveformVisualizer: Invalid input type for lastCollectedSample. Expected number or array.');
                return;
            }

            const processSingleValue = (val) => {
                // Normalize and clamp input values, e.g., to [-1, 1] for typical signal data.
                const clampedValue = Math.max(-1, Math.min(1, val));

                if (dataSampleBuffer.length < selfReference.dataBufferSize) {
                    dataSampleBuffer.push(clampedValue);
                } else {
                    // Circular buffer implementation: overwrite oldest data
                    dataSampleBuffer[bufferWritePointer] = clampedValue;
                }
                bufferWritePointer = (bufferWritePointer + 1) % selfReference.dataBufferSize;
            };

            if (Array.isArray(valueInput)) {
                valueInput.forEach(processSingleValue);
            } else {
                processSingleValue(valueInput);
            }
        },
        enumerable: true,
        configurable: true
    });

    /**
     * Property: bufferedChronologicalSamples
     * Getter: Returns a copy of the samples in chronological order, respecting the circular buffer.
     * Setter: Replaces the entire sample buffer with new data.
     */
    Object.defineProperty(this, "bufferedChronologicalSamples", {
        get: function() {
            if (dataSampleBuffer.length < selfReference.dataBufferSize) {
                return dataSampleBuffer.slice(); // Return a shallow copy if buffer not full
            } else {
                // If the buffer is full and circular, we need to reorder it for chronological display.
                // The data starts after 'bufferWritePointer' and wraps around.
                return [
                    ...dataSampleBuffer.slice(bufferWritePointer),
                    ...dataSampleBuffer.slice(0, bufferWritePointer)
                ];
            }
        },
        set: function(newSampleArray) {
            // Guard clause: Validate input is an array (Type III addition)
            if (!Array.isArray(newSampleArray)) {
                console.warn('WaveformVisualizer: Attempted to set bufferedChronologicalSamples with non-array input.');
                return;
            }
            // Replace the buffer, ensuring it doesn't exceed max size
            dataSampleBuffer = newSampleArray.slice(Math.max(0, newSampleArray.length - selfReference.dataBufferSize));
            bufferWritePointer = dataSampleBuffer.length % selfReference.dataBufferSize; // Reset pointer
        },
        enumerable: true,
        configurable: true
    });

    /**
     * Property: minimumObservedValue
     * Getter: Calculates the minimum value currently in the buffer by iterating.
     *         Replaces the inefficient `sort().shift()` method (Type III change).
     */
    Object.defineProperty(this, "minimumObservedValue", {
        get: function() {
            if (dataSampleBuffer.length === 0) return undefined;
            let minVal = Infinity;
            for (let i = 0; i < dataSampleBuffer.length; i++) {
                if (dataSampleBuffer[i] < minVal) {
                    minVal = dataSampleBuffer[i];
                }
            }
            return minVal;
        },
        enumerable: true,
        configurable: true
    });

    /**
     * Property: maximumObservedValue
     * Getter: Calculates the maximum value currently in the buffer by iterating.
     *         Replaces the inefficient `sort().pop()` method (Type III change).
     */
    Object.defineProperty(this, "maximumObservedValue", {
        get: function() {
            if (dataSampleBuffer.length === 0) return undefined;
            let maxVal = -Infinity;
            for (let i = 0; i < dataSampleBuffer.length; i++) {
                if (dataSampleBuffer[i] > maxVal) {
                    maxVal = dataSampleBuffer[i];
                }
            }
            return maxVal;
        },
        enumerable: true,
        configurable: true
    });

    // Perform an initial draw to set up the canvas with the background and grid.
    this.drawVisualFrame();
}