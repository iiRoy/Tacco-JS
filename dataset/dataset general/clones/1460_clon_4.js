class WaveformVisualizer {
    #signalPoints = [];
    #renderEngine;

    inputSource;
    displayElement;
    waveformColor;
    gridColor;
    horizontalFactor = 1;
    verticalFactor = 1;

    constructor(inputSource, displayElement, initialWaveformColor, initialGridColor) {
        this.inputSource = inputSource;
        this.displayElement = displayElement;
        this.waveformColor = initialWaveformColor || 'rgba(255,0,0,0.5)';
        this.gridColor = initialGridColor || '#000';

        this.#renderEngine = displayElement.getContext("2d");
        this.#renderEngine.globalAlpha = 1;
        this.#renderEngine.lineWidth = 1;
    }

    renderDisplay() {
        const renderCtx = this.#renderEngine;
        const targetElement = this.displayElement;
        const currentWidth = targetElement.width;
        const currentHeight = targetElement.height;

        renderCtx.clearRect(0, 0, currentWidth, currentHeight);

        renderCtx.strokeStyle = this.gridColor;
        renderCtx.beginPath();
        renderCtx.moveTo(0, currentHeight / 2);
        renderCtx.lineTo(currentWidth, currentHeight / 2);
        renderCtx.stroke();
        renderCtx.closePath();

        const activeSignalPoints = this.signalData;

        renderCtx.beginPath();
        renderCtx.strokeStyle = this.waveformColor;

        renderCtx.moveTo(0, currentHeight / 2);

        for (let idx = 0; idx < activeSignalPoints.length; idx++) {
            const pointVal = activeSignalPoints[idx];
            const xCoord = idx * this.horizontalFactor;
            const yCoord = pointVal * (currentHeight / this.verticalFactor);
            renderCtx.lineTo(xCoord, yCoord);
        }
        renderCtx.stroke();
        renderCtx.closePath();
    }

    get minimumValue() {
        const pointsSnapshot = this.signalData;
        if (pointsSnapshot.length === 0) return undefined;
        return Math.min(...pointsSnapshot);
    }

    get maximumValue() {
        const pointsSnapshot = this.signalData;
        if (pointsSnapshot.length === 0) return undefined;
        return Math.max(...pointsSnapshot);
    }

    get currentReading() {
        return this.#signalPoints[this.#signalPoints.length - 1];
    }

    set currentReading(incomingObservation) {
        if (Array.isArray(incomingObservation)) {
            for (const valueEntry of incomingObservation) {
                this.#signalPoints.push(valueEntry);
            }
        } else {
            this.#signalPoints.push(incomingObservation);
        }
    }

    get signalData() {
        const internalBuffer = this.#signalPoints;
        const viewportWidth = this.displayElement.width;

        if (internalBuffer.length >= viewportWidth) {
            return internalBuffer.slice(internalBuffer.length - viewportWidth, internalBuffer.length);
        } else {
            return internalBuffer.slice(0);
        }
    }

    set signalData(newDataSet) {
        this.#signalPoints = newDataSet.slice(this.displayElement.width);
    }
}