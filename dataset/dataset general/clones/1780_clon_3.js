let audioProcessorNode;
let currentXPosition = 0;
let animationFrameId;
let displayCanvas;
let canvasDisplayContext;
let audioFrequencyData;
let visualizerContainerElement;
let visualizationConfiguration;
let audioContextInstance;

function setupAudioVisualizer(vizOptions) {
    const defaultOptions = {
        targetViewId: 'visualizerCanvas',
        audioSourceId: 'audioElement',
        backgroundColor: '#000000',
        amplitudeScale: 0.8,
        fftBinSize: 128
    };

    visualizationConfiguration = { ...defaultOptions, ...vizOptions };

    if (!visualizationConfiguration.targetViewId || typeof visualizationConfiguration.targetViewId !== 'string') {
        console.error("Invalid or missing 'targetViewId' in visualizer options.");
        return;
    }
    if (!visualizationConfiguration.audioSourceId || typeof visualizationConfiguration.audioSourceId !== 'string') {
        console.error("Invalid or missing 'audioSourceId' in visualizer options.");
        return;
    }

    displayCanvas = document.getElementById(visualizationConfiguration.targetViewId);
    if (!displayCanvas || !(displayCanvas instanceof HTMLCanvasElement)) {
        console.error(`Canvas element with ID '${visualizationConfiguration.targetViewId}' not found or is not a canvas.`);
        displayCanvas = document.createElement('canvas');
        displayCanvas.id = visualizationConfiguration.targetViewId;
        displayCanvas.width = window.innerWidth;
        displayCanvas.height = 200;
        document.body.appendChild(displayCanvas);
        console.warn(`Created a new canvas element with ID '${visualizationConfiguration.targetViewId}'.`);
    }

    canvasDisplayContext = displayCanvas.getContext("2d");
    if (!canvasDisplayContext) {
        console.error("Failed to get 2D context for the canvas.");
        return;
    }

    if (window.AudioContext) {
        audioContextInstance = new window.AudioContext();
    } else if (window.webkitAudioContext) {
        audioContextInstance = new window.webkitAudioContext();
    } else {
        console.error("Web Audio API is not supported in this browser. Cannot initialize visualizer.");
        const noApiElements = document.querySelectorAll(".hideIfNoApi");
        noApiElements.forEach(el => el.style.display = 'none');
        const showApiElements = document.querySelectorAll(".showIfNoApi");
        showApiElements.forEach(el => el.style.display = 'block');
        return;
    }

    audioProcessorNode = audioContextInstance.createAnalyser();
    audioProcessorNode.fftSize = visualizationConfiguration.fftBinSize;
    audioFrequencyData = new Uint8Array(audioProcessorNode.frequencyBinCount);

    visualizerContainerElement = document.getElementById(visualizationConfiguration.targetViewId);

    const sourceAudioElement = document.getElementById(visualizationConfiguration.audioSourceId);
    if (!sourceAudioElement || !(sourceAudioElement instanceof HTMLMediaElement)) {
        console.error(`Audio source element with ID '${visualizationConfiguration.audioSourceId}' not found or is not a media element.`);
        return;
    }

    const connectAudioSource = (mediaElement) => {
        console.log(`Connecting audio source '${visualizationConfiguration.audioSourceId}'.`);
        const mediaSourceNode = audioContextInstance.createMediaElementSource(mediaElement);
        mediaSourceNode.connect(audioProcessorNode);
        audioProcessorNode.connect(audioContextInstance.destination);
    };

    sourceAudioElement.addEventListener('canplay', function() {
        connectAudioSource(this);
    });

    if (sourceAudioElement.readyState >= 3) {
        connectAudioSource(sourceAudioElement);
    }

    requestAnimationFrame(renderAudioSpectrum);
}

function scrollCanvasContent(ctx, canvas) {
    const imageData = ctx.getImageData(1, 0, canvas.width - 1, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);
}

function renderAudioSpectrum() {
    animationFrameId = requestAnimationFrame(renderAudioSpectrum);

    audioProcessorNode.getByteFrequencyData(audioFrequencyData);

    if (audioFrequencyData[0] === 0) {
        if (currentXPosition >= displayCanvas.width - 2) {
             scrollCanvasContent(canvasDisplayContext, displayCanvas);
             currentXPosition = displayCanvas.width - 3;
        }
        return;
    }

    const barGradient = canvasDisplayContext.createLinearGradient(0, 0, 0, displayCanvas.height);
    barGradient.addColorStop(0, 'white');
    barGradient.addColorStop(1, visualizationConfiguration.backgroundColor);
    canvasDisplayContext.fillStyle = barGradient;

    currentXPosition++;

    if (currentXPosition >= displayCanvas.width - 2) {
        scrollCanvasContent(canvasDisplayContext, displayCanvas);
        currentXPosition = displayCanvas.width - 3;
    }

    const barHeight = displayCanvas.height - (audioFrequencyData[0] * visualizationConfiguration.amplitudeScale);

    canvasDisplayContext.fillRect(currentXPosition, barHeight, 1, displayCanvas.height);
}