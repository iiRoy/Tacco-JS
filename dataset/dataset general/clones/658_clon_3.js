(function() {
  // A robust requestAnimationFrame polyfill for smoother animations across browsers.
  // It checks for standard and vendor-prefixed versions, falling back to setTimeout if unavailable.
  const animFrameScheduler = window.requestAnimationFrame ||
                             window.webkitRequestAnimationFrame ||
                             window.mozRequestAnimationFrame ||
                             window.msRequestAnimationFrame ||
                             function(callback) { return window.setTimeout(callback, 1000 / 60); }; // Fallback to 60fps
  
  // Expose the chosen scheduler globally.
  window.requestAnimationFrame = animFrameScheduler;

  // Also provide a cancellation mechanism.
  window.cancelAnimationFrame = window.cancelAnimationFrame ||
                                window.webkitCancelAnimationFrame ||
                                window.mozCancelAnimationFrame ||
                                window.msCancelAnimationFrame ||
                                function(id) { clearTimeout(id); };
})();

// Entry point after the entire document has loaded.
window.addEventListener('load', function() {
  const targetDisplayElement = document.getElementById('main-content-area'); // Renamed ID from 'container'
  if (!targetDisplayElement) {
    console.error('Initialization failed: Target display element "main-content-area" not found.');
    return;
  }
  
  // Begin the process of setting up file handling and subsequent audio processing.
  setupFileDropHandler(targetDisplayElement, processDecodedAudio, "ArrayBuffer"); // Renamed functions and data type string
});


// Configures a DOM element to handle dropped files, reading their content.
// @param {HTMLElement} dropZoneEl - The element that will receive dropped files.
// @param {function(ArrayBuffer|string)} completionCallback - Function to call with the file's content.
// @param {string} desiredFormat - The format to read the file in (e.g., "ArrayBuffer", "DataURL", "Text").
function setupFileDropHandler(dropZoneEl, completionCallback, desiredFormat) {
  // Ensure a valid format is used, defaulting to DataURL if not recognized.
  const chosenReadFormat = desiredFormat === "ArrayBuffer" ? "ArrayBuffer" :
                           desiredFormat === "Text" ? "Text" :
                           "DataURL"; // Default format changed from "DataUrl" to "DataURL"

  // Prevent default drag-and-drop behavior during dragover.
  const handleDragOver = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Indicate that a copy operation will occur.
  };

  // Process the dropped file.
  const handleFileDrop = (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    
    const droppedFiles = evt.dataTransfer.files;
    if (droppedFiles.length > 0) {
      readSingleFile(droppedFiles[0]); // Only handle the first dropped file.
    } else {
      console.warn("No files were dropped.");
    }
  };

  // Attach event listeners to the designated drop zone.
  dropZoneEl.addEventListener('dragover', handleDragOver, false);
  dropZoneEl.addEventListener('drop', handleFileDrop, false);

  // Internal helper function to read the content of a file.
  function readSingleFile(inputBlob) {
    if (!inputBlob) {
      console.error("No file blob provided for reading.");
      return;
    }

    const fileReaderInstance = new FileReader();
    
    fileReaderInstance.onload = (event) => {
      completionCallback(event.target.result); // Pass the read content to the main callback.
    };

    fileReaderInstance.onerror = (errorEvent) => {
      console.error("Error reading file:", errorEvent);
      alert("Failed to read file: " + errorEvent.target.error.name);
    };

    // Dynamically call the appropriate FileReader method based on the desired format.
    switch (chosenReadFormat) {
      case "ArrayBuffer":
        fileReaderInstance.readAsArrayBuffer(inputBlob);
        break;
      case "DataURL":
        fileReaderInstance.readAsDataURL(inputBlob);
        break;
      case "Text":
        fileReaderInstance.readAsText(inputBlob);
        break;
      default:
        console.error(`Unsupported read format: ${chosenReadFormat}. Defaulting to DataURL.`);
        fileReaderInstance.readAsDataURL(inputBlob);
    }
  }
}

// Once audio binary data is loaded, this function processes and visualizes it.
// @param {ArrayBuffer} audioBinaryPayload - The raw audio data as an ArrayBuffer.
function processDecodedAudio(audioBinaryPayload) {
  const statusDisplay = document.getElementById('status-message'); // Renamed ID from 'instructions'
  if (statusDisplay) {
    statusDisplay.textContent = 'Processing audio data...';
  } else {
    console.warn('Status message element not found.');
  }

  // Ensure AudioContext is initialized once globally.
  if (!window.globalAudioContext) {
    window.globalAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('AudioContext initialized.');
  }
  const currentAudioContext = window.globalAudioContext;

  // Create an analyzer node for frequency data.
  if (!window.spectrumAnalyzer) {
    window.spectrumAnalyzer = currentAudioContext.createAnalyser();
    window.spectrumAnalyzer.fftSize = 2048; // Set FFT size for analysis.
    console.log('Audio analyzer created.');
  }
  const currentAnalyzer = window.spectrumAnalyzer;

  // Stop any currently playing audio source to prevent overlapping playback.
  if (window.audioSourceNode && typeof window.audioSourceNode.stop === 'function') {
    try {
      window.audioSourceNode.stop();
      console.log('Previous audio source stopped.');
    } catch (e) {
      console.warn('Could not stop previous audio source:', e);
    }
  }

  // Decode the binary audio data into an AudioBuffer.
  currentAudioContext.decodeAudioData(audioBinaryPayload, (decodedBuffer) => {
    // Create a new buffer source node for playback.
    const newAudioSourceNode = currentAudioContext.createBufferSource();
    newAudioSourceNode.buffer = decodedBuffer;
    
    // Connect the source to the analyzer, and the analyzer to the audio output.
    newAudioSourceNode.connect(currentAnalyzer);
    currentAnalyzer.connect(currentAudioContext.destination);
    
    // Store the current source globally for potential stopping.
    window.audioSourceNode = newAudioSourceNode;

    // Start playback immediately.
    newAudioSourceNode.start(0);
    console.log('Audio playback started.');

    // Instantiate and initialize the visualization components.
    const barChartRenderer = new simpleBarGraph(); // Renamed class
    
    // Pass the renderer's update method and the analyzer to the visualization loop.
    new spectrumDisplayLoop(barChartRenderer.refreshVisuals.bind(barChartRenderer), currentAnalyzer); // Renamed class and method, bound context

    if (statusDisplay) {
      statusDisplay.textContent = ''; // Clear status message.
    }
  }, (error) => {
    console.error('Error decoding audio data:', error);
    if (statusDisplay) {
      statusDisplay.textContent = 'Error decoding audio!';
    }
    alert('Failed to decode audio data. Please ensure it is a valid audio file.');
  });
}

// Manages the animation loop for updating the audio visualization.
// @param {function(Uint8Array, number)} renderFunction - Callback to draw each frame.
// @param {AnalyserNode} audioAnalyzerNode - The Web Audio API AnalyserNode providing frequency data.
function spectrumDisplayLoop(renderFunction, audioAnalyzerNode) {
  const rendererRef = this; // Capture 'this' for internal use if needed, though not strictly required here.
  let lastFrameTime = performance.now(); // Use performance.now for higher precision timing.
  let animationFrameId = null; // To store the ID returned by requestAnimationFrame for cancellation.

  if (!audioAnalyzerNode || typeof audioAnalyzerNode.getByteFrequencyData !== 'function') {
      console.error('Invalid AnalyserNode provided to spectrumDisplayLoop.');
      return;
  }
  if (typeof renderFunction !== 'function') {
      console.error('Invalid renderFunction provided to spectrumDisplayLoop.');
      return;
  }

  // The core animation loop function.
  const animationLoopTick = () => {
    const currentTime = performance.now();
    const deltaTimeMillis = currentTime - lastFrameTime; // Time elapsed since last frame.
    lastFrameTime = currentTime;

    // Retrieve the current frequency data from the analyzer.
    const frequencyDataArray = new Uint8Array(audioAnalyzerNode.frequencyBinCount);
    audioAnalyzerNode.getByteFrequencyData(frequencyDataArray);
    
    // Call the provided render function with the frequency data and delta time.
    renderFunction(frequencyDataArray, deltaTimeMillis);
    
    // Schedule the next frame.
    animationFrameId = requestAnimationFrame(animationLoopTick);
  };

  // Start the animation loop.
  animationFrameId = requestAnimationFrame(animationLoopTick);
  console.log('Visualization loop started.');

  // Optional: A method to stop the loop, for cleanup if this were part of a larger component.
  rendererRef.stopLoop = () => {
      if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
          console.log('Visualization loop stopped.');
      }
  };
}

// A straightforward visualization component that renders audio frequency data as a bar graph.
function simpleBarGraph() {
  const graphInstance = this; // Self-reference for clarity.

  // Retrieve canvas elements by their IDs.
  graphInstance.mainCanvasEl = document.getElementById('visuals-canvas'); // Renamed ID from 'canvas'
  graphInstance.overlayCanvasEl = document.getElementById('visuals-copy-canvas'); // Renamed ID from 'canvas-copy'

  if (!graphInstance.mainCanvasEl || !graphInstance.overlayCanvasEl) {
      console.error('Visualization canvas elements not found. Ensure "visuals-canvas" and "visuals-copy-canvas" exist.');
      return;
  }

  graphInstance.mainCtx = graphInstance.mainCanvasEl.getContext("2d");
  graphInstance.overlayCtx = graphInstance.overlayCanvasEl.getContext("2d");

  // Styling properties for the bars.
  graphInstance.barColor = 'rgba(255, 255, 255, 0.8)'; // Changed to RGBA for potential transparency.
  graphInstance.barDisplayWidth = 12; // Adjusted bar width.
  graphInstance.spacingBetweenBars = 5; // Adjusted gap between bars.

  // Calculate the maximum number of bars that can fit on the canvas.
  graphInstance.totalBarsToRender = Math.floor(graphInstance.mainCanvasEl.width / (graphInstance.barDisplayWidth + graphInstance.spacingBetweenBars));

  // This method is invoked for each frame to update the visual display.
  // @param {Uint8Array} frequencyDataArray - Array of frequency magnitudes from the audio analyzer.
  graphInstance.refreshVisuals = function(frequencyDataArray) {
    // Clear both canvases at the start of each frame.
    graphInstance.mainCtx.clearRect(0, 0, graphInstance.mainCanvasEl.width, graphInstance.mainCanvasEl.height);
    graphInstance.overlayCtx.clearRect(0, 0, graphInstance.overlayCanvasEl.width, graphInstance.overlayCanvasEl.height);

    graphInstance.mainCtx.fillStyle = graphInstance.barColor; 

    // Determine how many frequency data points to skip for each bar to fit `totalBarsToRender`.
    const dataSamplingInterval = Math.floor(frequencyDataArray.length / graphInstance.totalBarsToRender);
    
    // Iterate to draw each bar.
    for (let currentBarIndex = 0; currentBarIndex < graphInstance.totalBarsToRender; currentBarIndex++) {
      // Sample a frequency value for the current bar.
      const rawFrequencyValue = frequencyDataArray[currentBarIndex * dataSamplingInterval];
      // Scale the frequency value to fit within the canvas height, ensuring a minimum height.
      const barRenderHeight = Math.max(1, rawFrequencyValue * (graphInstance.mainCanvasEl.height / 255)); // Scale 0-255 to canvas height

      // Calculate the X position for the current bar.
      const barXPosition = currentBarIndex * (graphInstance.barDisplayWidth + graphInstance.spacingBetweenBars);

      // Draw the bar on the main canvas.
      graphInstance.mainCtx.fillRect(
        barXPosition, 
        graphInstance.mainCanvasEl.height - barRenderHeight, // Bars grow upwards from the bottom.
        graphInstance.barDisplayWidth, 
        barRenderHeight
      );
    }
    
    // Draw the content of the main canvas onto the overlay canvas.
    // This can be used for effects like blur, glow, or other post-processing on the overlay.
    graphInstance.overlayCtx.drawImage(graphInstance.mainCanvasEl, 0, 0);
  };
}