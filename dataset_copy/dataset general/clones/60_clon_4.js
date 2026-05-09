class AudioPulseVisualizer {
    #oscillationOffset = 0;
    #isAnimating = false;

    #pixelDensity;
    #drawingWidth;
    #halfDrawingWidth;
    #quarterDrawingWidth;
    #drawingHeight;
    #halfDrawingHeight;
    #maxAmplitudePx;

    #peakMagnitude;
    #waveSpeed;
    #waveFrequency;
    #lineColorRGB;

    #renderSurface;
    #parentContainer;
    #graphicsContext;

    static #attenuationFactorMemory = new Map();

    static #transformHexToRgb(hexInput) {
        if (!hexInput) return '255,255,255';
        let formattedHex = hexInput.startsWith('#') ? hexInput.substring(1) : hexInput;
        formattedHex = formattedHex.length === 3 ? formattedHex.split('').map(c => c + c).join('') : formattedHex;

        const redSegment = formattedHex.substring(0, 2);
        const greenSegment = formattedHex.substring(2, 4);
        const blueSegment = formattedHex.substring(4, 6);

        if (!redSegment || !greenSegment || !blueSegment) return '255,255,255';

        const r = parseInt(redSegment, 16);
        const g = parseInt(greenSegment, 16);
        const b = parseInt(blueSegment, 16);

        return `${r},${g},${b}`;
    }

    constructor(settings) {
        const currentSettings = settings || {};

        this.#pixelDensity = currentSettings.pixelDensity || window.devicePixelRatio || 1;

        this.#drawingWidth = this.#pixelDensity * (currentSettings.displayWidth || 320);
        this.#halfDrawingWidth = this.#drawingWidth / 2;
        this.#quarterDrawingWidth = this.#drawingWidth / 4;

        this.#drawingHeight = this.#pixelDensity * (currentSettings.displayHeight || 100);
        this.#halfDrawingHeight = this.#drawingHeight / 2;

        this.#maxAmplitudePx = (this.#halfDrawingHeight) - 4;

        this.#peakMagnitude = currentSettings.magnitude || 1;
        this.#waveSpeed = currentSettings.animationSpeed || 0.2;
        this.#waveFrequency = currentSettings.waveDensity || 6;
        this.#lineColorRGB = AudioPulseVisualizer.#transformHexToRgb(currentSettings.displayColor || '#fff');

        this.#renderSurface = document.createElement('canvas');
        this.#renderSurface.width = this.#drawingWidth;
        this.#renderSurface.height = this.#drawingHeight;
        this.#renderSurface.style.width = (this.#drawingWidth / this.#pixelDensity) + 'px';
        this.#renderSurface.style.height = (this.#drawingHeight / this.#pixelDensity) + 'px';

        this.#parentContainer = currentSettings.targetElement || document.body;
        this.#parentContainer.appendChild(this.#renderSurface);

        this.#graphicsContext = this.#renderSurface.getContext('2d');

        if (currentSettings.autoStartDrawing) {
            this.beginAnimation();
        }
    }

    static #retrieveAttenuationFactor(normalizedPosition) {
        if (!AudioPulseVisualizer.#attenuationFactorMemory.has(normalizedPosition)) {
            const positionSquared = normalizedPosition * normalizedPosition;
            const positionQuad = positionSquared * positionSquared;
            const calculation = (4 / (4 + positionQuad));
            AudioPulseVisualizer.#attenuationFactorMemory.set(normalizedPosition, calculation * calculation);
        }
        return AudioPulseVisualizer.#attenuationFactorMemory.get(normalizedPosition);
    }

    #calculateHorizontalPoint(waveIndex) {
        return this.#halfDrawingWidth + waveIndex * this.#quarterDrawingWidth;
    }

    #calculateVerticalPoint(waveIndex, lineAttenuation) {
        const currentAttenuation = (this.#maxAmplitudePx * this.#peakMagnitude) / lineAttenuation;
        const globalAttenuation = AudioPulseVisualizer.#retrieveAttenuationFactor(waveIndex);
        return this.#halfDrawingHeight + globalAttenuation * currentAttenuation * Math.sin(this.#waveFrequency * waveIndex - this.#oscillationOffset);
    }

    #eraseCanvasContent() {
        this.#graphicsContext.globalCompositeOperation = 'destination-out';
        this.#graphicsContext.fillRect(0, 0, this.#drawingWidth, this.#drawingHeight);
        this.#graphicsContext.globalCompositeOperation = 'source-over';
    }

    #drawSingleWaveLayer(attenuationMagnitude, layerColor, strokeThickness) {
        this.#graphicsContext.moveTo(0, 0);
        this.#graphicsContext.beginPath();
        this.#graphicsContext.strokeStyle = layerColor;
        this.#graphicsContext.lineWidth = strokeThickness || 1;

        const pointCount = 401; // Equivalent to (2 - (-2)) / 0.01 + 1
        const stepSize = 0.01;

        Array.from({ length: pointCount }, (_, idx) => -2 + idx * stepSize)
            .forEach(waveIdx => {
                this.#graphicsContext.lineTo(
                    this.#calculateHorizontalPoint(waveIdx),
                    this.#calculateVerticalPoint(waveIdx, attenuationMagnitude)
                );
            });

        this.#graphicsContext.stroke();
    }

    #renderLoop = () => {
        if (this.#isAnimating === false) return;

        this.#oscillationOffset = (this.#oscillationOffset + Math.PI * this.#waveSpeed) % (2 * Math.PI);

        this.#eraseCanvasContent();
        this.#drawSingleWaveLayer(-2, `rgba(${this.#lineColorRGB},0.1)`);
        this.#drawSingleWaveLayer(-6, `rgba(${this.#lineColorRGB},0.2)`);
        this.#drawSingleWaveLayer(4, `rgba(${this.#lineColorRGB},0.4)`);
        this.#drawSingleWaveLayer(2, `rgba(${this.#lineColorRGB},0.6)`);
        this.#drawSingleWaveLayer(1, `rgba(${this.#lineColorRGB},1)`, 1.5);

        requestAnimationFrame(this.#renderLoop);
    };

    beginAnimation() {
        this.#oscillationOffset = 0;
        this.#isAnimating = true;
        this.#renderLoop();
    }

    haltAnimation() {
        this.#oscillationOffset = 0;
        this.#isAnimating = false;
    }

    adjustWaveSpeed(newValue) {
        this.#waveSpeed = newValue;
    }

    adjustWaveMagnitude(newValue) {
        this.#peakMagnitude = Math.max(Math.min(newValue, 1), 0);
    }
}