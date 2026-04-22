class FileDropAgent {
    constructor(containerElement, dataReceiverFunction, fileReadMode) {
        this.uiContainer = containerElement;
        this.dataConsumer = dataReceiverFunction;
        this.readFormat = fileReadMode;
        this.establishListeners();
    }

    establishListeners() {
        this.uiContainer.addEventListener('dragover', this.handleDragOverEvent.bind(this));
        this.uiContainer.addEventListener('drop', this.handleDropEvent.bind(this));
    }

    handleDragOverEvent(eventObject) {
        eventObject.stopPropagation();
        eventObject.preventDefault();
        eventObject.dataTransfer.dropEffect = 'copy';
    }

    handleDropEvent(eventObject) {
        eventObject.stopPropagation();
        eventObject.preventDefault();
        const droppedFile = eventObject.dataTransfer.files[0];
        if (droppedFile) {
            this.processInputFile(droppedFile);
        }
    }

    processInputFile(inputResource) {
        return new Promise((resolve, reject) => {
            const fileReaderInstance = new FileReader();
            fileReaderInstance.onload = (eventResult) => resolve(eventResult.target.result);
            fileReaderInstance.onerror = (errorDetails) => reject(errorDetails);
            const methodToCall = `readAs${this.readFormat}`;
            if (typeof fileReaderInstance[methodToCall] === 'function') {
                fileReaderInstance[methodToCall](inputResource);
            } else {
                reject(new Error(`Unsupported file reading format: ${this.readFormat}`));
            }
        }).then(this.dataConsumer).catch(console.error);
    }
}

class SoundProcessor {
    constructor(statusDisplayElement) {
        this.statusPanel = statusDisplayElement;
        this.audioNodeContext = new (window.AudioContext || window.webkitAudioContext)();
        this.frequencySpectrumAnalyzer = this.audioNodeContext.createAnalyser();
        this.activeSoundSource = null;
    }

    async initiateAudioPlayback(inputBinaryBuffer) {
        this.statusPanel.textContent = 'Preparing audio...';
        if (this.activeSoundSource) {
            this.activeSoundSource.stop(0);
            this.activeSoundSource.disconnect();
        }

        try {
            const decodedAudioBuffer = await this.audioNodeContext.decodeAudioData(inputBinaryBuffer);
            this.activeSoundSource = this.audioNodeContext.createBufferSource();
            this.activeSoundSource.buffer = decodedAudioBuffer;
            this.activeSoundSource.connect(this.frequencySpectrumAnalyzer);
            this.frequencySpectrumAnalyzer.connect(this.audioNodeContext.destination);
            this.activeSoundSource.start(0);
            this.statusPanel.textContent = '';
            return this.frequencySpectrumAnalyzer;
        } catch (error) {
            console.error('Failure to decode audio data:', error);
            this.statusPanel.textContent = 'Error during audio processing.';
            throw error;
        }
    }
}

class DisplayOrchestrator {
    constructor(analyzerNode, visualRendererInstance) {
        this.analyzerReference = analyzerNode;
        this.rendererMethod = visualRendererInstance;
        this.lastRenderTime = performance.now();
        this.frequencyDataCollection = new Uint8Array(this.analyzerReference.frequencyBinCount);
        this.animationIsActive = false;
    }

    beginAnimationCycle() {
        if (this.animationIsActive) return;
        this.animationIsActive = true;
        this.lastRenderTime = performance.now();
        this.animationFrameLoop();
    }

    stopAnimationCycle() {
        this.animationIsActive = false;
    }

    animationFrameLoop() {
        if (!this.animationIsActive) return;

        const currentTime = performance.now();
        const frameTimeDelta = currentTime - this.lastRenderTime;
        this.lastRenderTime = currentTime;

        this.analyzerReference.getByteFrequencyData(this.frequencyDataCollection);
        this.rendererMethod.updateVisualization(this.frequencyDataCollection, frameTimeDelta);

        window.requestAnimationFrame(this.animationFrameLoop.bind(this));
    }
}

class CanvasBarGraph {
    constructor(mainDisplayCanvas, mirrorDisplayCanvas) {
        this.primaryCanvasElement = mainDisplayCanvas;
        this.secondaryCanvasElement = mirrorDisplayCanvas;
        this.primaryRenderingContext = this.primaryCanvasElement.getContext('2d');
        this.secondaryRenderingContext = this.secondaryCanvasElement.getContext('2d');

        this.primaryRenderingContext.fillStyle = '#FFF';
        this.columnDimension = 10;
        this.columnSpacing = 4;
        this.totalColumns = Math.floor(this.primaryCanvasElement.width / (this.columnDimension + this.columnSpacing));
    }

    updateVisualization(frequencySpectrumData, timeElapsed) {
        this.primaryRenderingContext.clearRect(0, 0, this.primaryCanvasElement.width, this.primaryCanvasElement.height);

        const dataSamplingStep = Math.floor(frequencySpectrumData.length / this.totalColumns);

        for (let currentColumn = 0; currentColumn < this.totalColumns; currentColumn++) {
            const columnMagnitude = frequencySpectrumData[currentColumn * dataSamplingStep];
            this.primaryRenderingContext.fillRect(
                currentColumn * (this.columnDimension + this.columnSpacing),
                this.primaryCanvasElement.height - columnMagnitude,
                this.columnDimension,
                columnMagnitude
            );
        }
        this.secondaryRenderingContext.clearRect(0, 0, this.primaryCanvasElement.width, this.primaryCanvasElement.height);
        this.secondaryRenderingContext.drawImage(this.primaryCanvasElement, 0, 0);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const mainDropZone = document.getElementById('container');
    const instructionMessagePanel = document.getElementById('instructions');
    const primaryCanvasVisual = document.getElementById('canvas');
    const secondaryCanvasVisual = document.getElementById('canvas-copy');

    const visualBarGenerator = new CanvasBarGraph(primaryCanvasVisual, secondaryCanvasVisual);
    const soundEngine = new SoundProcessor(instructionMessagePanel);

    const onAudioDataLoaded = async (audioBinaryData) => {
        try {
            const activeAnalyzer = await soundEngine.initiateAudioPlayback(audioBinaryData);
            const animationCoordinator = new DisplayOrchestrator(activeAnalyzer, visualBarGenerator);
            animationCoordinator.beginAnimationCycle();
        } catch (error) {
            console.error("Failed to setup audio and visualization:", error);
        }
    };

    const fileDropService = new FileDropAgent(mainDropZone, onAudioDataLoaded, "ArrayBuffer");
});