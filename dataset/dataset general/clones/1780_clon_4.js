class AudioVisualizer {
    constructor(userConfiguration) {
        // Apply default settings to the provided configuration object directly.
        // This replicates the original's behavior where missing properties remain undefined,
        // allowing for potential NaN results if a numeric property like 'scale' is not provided.
        this.clientConfiguration = userConfiguration || {};
        this.clientConfiguration.displayCanvasId = this.clientConfiguration.displayCanvasId || 'view';
        this.clientConfiguration.mediaSourceElementId = this.clientConfiguration.mediaSourceElementId || 'source';
        this.clientConfiguration.graphColor = this.clientConfiguration.graphColor || 'screen';

        this.renderingSurface = document.getElementById(this.clientConfiguration.displayCanvasId);
        // Original code proceeds even if canvas not found, potentially leading to errors.
        // For exact equivalence, we don't throw an error here but allow subsequent operations to fail.
        this.drawingContext = this.renderingSurface ? this.renderingSurface.getContext("2d") : null;

        if (this.drawingContext) {
            this.drawingContext.fillStyle = this.clientConfiguration.graphColor;
        }

        this.audioProcessingContext = null;
        if (typeof AudioContext !== "undefined") {
            this.audioProcessingContext = new AudioContext();
        } else if (typeof webkitAudioContext !== "undefined") {
            this.audioProcessingContext = new webkitAudioContext();
        } else {
            // Replicating original's DOM manipulation for "no API" case using native JS
            document.querySelectorAll(".hideIfNoApi").forEach(el => el.style.display = 'none');
            // Assuming 'block' is a common default, but could be 'inline-block', etc.
            // Original used jQuery .show() which restores default display.
            document.querySelectorAll(".showIfNoApi").forEach(el => el.style.display = 'block');
            return; // Exit constructor if no audio API, as original does.
        }

        this.frequencyAnalyzer = this.audioProcessingContext.createAnalyser();
        this.frequencyAnalyzer.fftSize = 64;
        this.spectrumData = new Uint8Array(this.frequencyAnalyzer.frequencyBinCount);

        // Circular buffer for historical frequency data points, enabling the "scrolling" effect
        // If renderingSurface is null, width will be 0, leading to an empty buffer.
        this.spectrumHistoryBuffer = new Uint8Array(this.renderingSurface ? this.renderingSurface.width : 0);
        this.bufferWriteIndex = 0; // Current insertion point in the circular buffer

        this.animationTimerId = null; // Store the ID for cancelling custom animation frames
        this.lastFrameTime = 0; // For custom frame scheduling, mimicking requestAnimationFrame's timing

        this._associateMediaElement(); // Bind audio source
        this._executeFrameRender = this._executeFrameRender.bind(this); // Ensure 'this' context in animation loop
    }

    _associateMediaElement() {
        const mediaSourceElement = document.getElementById(this.clientConfiguration.mediaSourceElementId);
        if (mediaSourceElement && mediaSourceElement instanceof HTMLMediaElement) {
            mediaSourceElement.addEventListener('canplay', () => {
                const mediaNode = this.audioProcessingContext.createMediaElementSource(mediaSourceElement);
                mediaNode.connect(this.frequencyAnalyzer);
                this.frequencyAnalyzer.connect(this.audioProcessingContext.destination);
            });
        } else {
            // Original logs nothing here, but a warning is good practice.
            // For strict Type IV, we'd replicate the absence of a warning.
            // console.warn(`Media element with ID '${this.clientConfiguration.mediaSourceElementId}' not found or not an HTMLMediaElement. Visualization might not function.`);
        }
    }

    // Custom frame scheduler (replaces requestAnimationFrame polyfill logic)
    _scheduleNextFrame() {
        const currentTime = new Date().getTime();
        const timeSinceLastFrame = currentTime - this.lastFrameTime;
        const targetFrameRateMs = 1000 / 60; // Aim for 60 FPS
        const delay = Math.max(0, targetFrameRateMs - timeSinceLastFrame);

        this.animationTimerId = setTimeout(() => {
            this.lastFrameTime = new Date().getTime(); // Update for the *actual* start of the frame processing
            this._executeFrameRender();
        }, delay);
    }

    _executeFrameRender() {
        if (!this.audioProcessingContext || !this.drawingContext || !this.renderingSurface) {
            // If audio context or canvas setup failed, terminate.
            this.terminateVisualization();
            return;
        }

        this.frequencyAnalyzer.getByteFrequencyData(this.spectrumData);
        const primaryAmplitude = this.spectrumData[0];

        // Original logic: if frequencyData[0] is 0, nothing is drawn.
        if (primaryAmplitude === 0) {
            this._scheduleNextFrame(); // Still schedule next frame to keep trying
            return;
        }

        // Update circular buffer with current amplitude
        if (this.spectrumHistoryBuffer.length > 0) {
            this.spectrumHistoryBuffer[this.bufferWriteIndex] = primaryAmplitude;
            this.bufferWriteIndex = (this.bufferWriteIndex + 1) % this.renderingSurface.width;
        }

        // Clear entire canvas for redraw
        this.drawingContext.clearRect(0, 0, this.renderingSurface.width, this.renderingSurface.height);

        // Create and apply gradient fill style
        const visualGradient = this.drawingContext.createLinearGradient(0, 0, 0, this.renderingSurface.height);
        visualGradient.addColorStop(0, 'white');
        visualGradient.addColorStop(1, this.clientConfiguration.graphColor);
        this.drawingContext.fillStyle = visualGradient;

        // Retrieve the scale factor, which might be undefined if not provided in config.
        // This replicates the original's behavior with `params.scale`.
        const amplitudeScaleFactor = this.clientConfiguration.scale; // 'scale' from original 'params'

        // Iterate through the circular buffer and draw each vertical bar
        for (let i = 0; i < this.renderingSurface.width; i++) {
            // Read from buffer in correct order for "scrolling" effect
            const historyReadIndex = (this.bufferWriteIndex + i) % this.renderingSurface.width;
            const amplitudeValue = this.spectrumHistoryBuffer[historyReadIndex];

            // If amplitudeScaleFactor is undefined, the multiplication will result in NaN,
            // replicating the original's potential behavior.
            const scaledAmplitude = amplitudeValue * (amplitudeScaleFactor === undefined ? 1 : amplitudeScaleFactor);

            if (amplitudeValue > 0) { // Only draw if there's a value to represent
                const barTopY = this.renderingSurface.height - scaledAmplitude;
                // Draw a 1-pixel wide vertical bar from calculated top down to canvas bottom
                this.drawingContext.fillRect(i, barTopY, 1, this.renderingSurface.height - barTopY);
            }
        }

        this._scheduleNextFrame(); // Schedule the next frame
    }

    commenceVisualization() {
        if (!this.audioProcessingContext || !this.drawingContext) {
            // console.error("Audio API or rendering context not available, cannot commence visualization.");
            return;
        }
        // Initialize lastFrameTime for the first frame scheduling
        this.lastFrameTime = new Date().getTime();
        this._scheduleNextFrame(); // Start the custom animation loop
    }

    terminateVisualization() {
        if (this.animationTimerId) {
            clearTimeout(this.animationTimerId);
            this.animationTimerId = null;
        }
        if (this.audioProcessingContext) {
            this.audioProcessingContext.close().catch(e => { /* console.error("Error closing audio context:", e) */ });
            this.audioProcessingContext = null;
        }
    }
}

// Global entry point function, renamed and takes parameters
function initiateAudioGraphicDisplay(userPreferences) {
    const visualizerInstance = new AudioVisualizer(userPreferences);
    // If AudioContext was successfully created in the constructor, start the visualization.
    // The constructor handles the "no API" case by returning early.
    if (visualizerInstance.audioProcessingContext) {
        visualizerInstance.commenceVisualization();
    }
    // No explicit return value needed as original didn't return anything useful.
}