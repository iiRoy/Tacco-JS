var soundAnalyzer;
var drawPointerX = 0;
var animationLoopId;
var targetCanvas;
var renderContext;
var spectrumData;
var graphicDisplay;
var configOptions;

function initAudioVisualizer(initialSettings) {
    // Establish default configuration parameters for the visualizer
    initialSettings.displayId = initialSettings.displayId || 'visualOutput';
    initialSettings.mediaSourceId = initialSettings.mediaSourceId || 'soundInput';
    initialSettings.baseColor = initialSettings.baseColor || 'themeColor';
    initialSettings.amplitudeScale = initialSettings.amplitudeScale || 1.0;

    // Store the processed settings globally for access
    configOptions = initialSettings;

    targetCanvas = document.getElementById(configOptions.displayId);
    renderContext = targetCanvas.getContext("2d");
    renderContext.fillStyle = configOptions.baseColor;
    
    // Check for Web Audio API support
    if (typeof AudioContext !== "undefined") {
        audioGraphContext = new AudioContext();
    }
    else if (typeof webkitAudioContext !== "undefined") {
        audioGraphContext = new webkitAudioContext();
    }
    else {
        // If no Web Audio API is available, hide elements requiring it
        $("#noApiMessage").hide();
        $("#apiMissingWarning").show();
        return;
    }

    var previousFrameTime = 0;
    var browserPrefixes = ['ms', 'moz', 'webkit', 'o'];
    
    // Polyfill for requestAnimationFrame across different browsers
    for (var idx = 0; idx < browserPrefixes.length && !window.requestAnimationFrame; ++idx) {
        window.requestAnimationFrame = window[browserPrefixes[idx] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[browserPrefixes[idx] + 'CancelAnimationFrame'] || window[browserPrefixes[idx] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (animationCallback, targetElement) {
            var presentTime = new Date().getTime();
            var delayUntilCall = Math.max(0, 16 - (presentTime - previousFrameTime));
            var timeoutHandle = window.setTimeout(function () { animationCallback(presentTime + delayUntilCall); },
                delayUntilCall);
            previousFrameTime = presentTime + delayUntilCall;
            return timeoutHandle;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (requestHandle) {
            clearTimeout(requestHandle);
        };
    }

    // Initialize the audio spectrum analyzer
    soundAnalyzer = audioGraphContext.createAnalyser();
    soundAnalyzer.fftSize = 64; // Set FFT size for frequency data resolution
    spectrumData = new Uint8Array(soundAnalyzer.frequencyBinCount);

    // Prepare the visual display area using jQuery
    graphicDisplay = $("#" + configOptions.displayId);

    // Connect to the designated audio input element when it's ready to play
    $("#" + configOptions.mediaSourceId).on('canplaythrough', function() {
        var audioStreamSource = audioGraphContext.createMediaElementSource(this);
        audioStreamSource.connect(soundAnalyzer);
        soundAnalyzer.connect(audioGraphContext.destination);
    });

    // Initiate the main rendering loop
    renderFrame();
}

function renderFrame() {
    requestAnimationFrame(renderFrame); // Schedule the next frame
    soundAnalyzer.getByteFrequencyData(spectrumData); // Retrieve the frequency data

    // Only draw if there's actual audio data (first bin > 0)
    if (spectrumData[0] === 0) {
        // Skip rendering if no audio data is present, effectively pausing the visualizer
    } else {
        // Adjust the spectrum data to control the visual amplitude scale
        var colorGradient = renderContext.createLinearGradient(0, 0, 0, targetCanvas.height);
        colorGradient.addColorStop(0, '#FFFFFF'); // Top color (white)
        colorGradient.addColorStop(1, configOptions.baseColor); // Bottom color from config
        renderContext.fillStyle = colorGradient;

        drawPointerX = drawPointerX + 1; // Advance the drawing position
        
        // If the drawing pointer reaches the edge, shift the canvas content
        if (drawPointerX >= targetCanvas.width - 2) {
            drawPointerX = targetCanvas.width - 3; // Reset pointer to avoid drawing off-canvas
            var canvasSnapshot = document.createElement('img');
            canvasSnapshot.src = targetCanvas.toDataURL("image/jpeg"); // Capture current canvas state
            renderContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height); // Clear the canvas
            renderContext.drawImage(canvasSnapshot, -1, 0); // Redraw shifted to the left
        }
        
        // Draw the frequency bar
        renderContext.fillRect(drawPointerX, (targetCanvas.height - (spectrumData[0] * configOptions.amplitudeScale)), 1, targetCanvas.height);
    }
}