/*
 * Extensive copyright and licensing information.
 * Original source: Boris Smus, 2013.
 * Licensed under Apache License, Version 2.0.
 * This code is a Type III clone, modified significantly from the original.
 */

// Global configuration constants for the visualizer display and audio processing.
const DISPLAY_CANVAS_WIDTH = 640;  // Horizontal dimension for the visual output area.
const DISPLAY_CANVAS_HEIGHT = 360; // Vertical dimension for the visual output area.

// Parameters influencing the audio analysis and visualization.
const AUDIO_SMOOTHING_FACTOR = 0.8; // Smoothing constant for frequency data (0.0 to 1.0).
const SPECTRUM_ANALYSIS_POINTS = 2048; // Number of FFT bins for frequency analysis.
const DEFAULT_AUDIO_SOURCE_PATH = 'chrono.mp3'; // Default audio file to load.
const ANALYSER_MIN_DECIBELS = -140; // Minimum decibel value for analyser.
const ANALYSER_MAX_DECIBELS = 0;    // Maximum decibel value for analyser.

// Fallback for requestAnimationFrame for broader browser compatibility.
window.requestAnimationLoopFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

/**
 * Manages audio playback and real-time spectrum visualization.
 * @class AudioSpectrumVisualizer
 */
function AudioSpectrumVisualizer() {
  // Ensure AudioContext is available before proceeding.
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.error("Web Audio API is not supported in this browser.");
    throw new Error("Web Audio API not available.");
  }

  // Reference to the global audio context.
  this.audioContextRef = new (window.AudioContext || window.webkitAudioContext)();

  // Web Audio API AnalyserNode for time and frequency domain analysis.
  this.audioProcessor = this.audioContextRef.createAnalyser();
  this.audioProcessor.connect(this.audioContextRef.destination); // Connect to speakers.
  this.audioProcessor.minDecibels = ANALYSER_MIN_DECIBELS;
  this.audioProcessor.maxDecibels = ANALYSER_MAX_DECIBELS;
  this.audioProcessor.smoothingTimeConstant = AUDIO_SMOOTHING_FACTOR;
  this.audioProcessor.fftSize = SPECTRUM_ANALYSIS_POINTS;

  // Data arrays for storing frequency and time domain data.
  // The size of these arrays is determined by the analyser's frequencyBinCount.
  this.frequencyDataArray = new Uint8Array(this.audioProcessor.frequencyBinCount);
  this.waveformDataArray = new Uint8Array(this.audioProcessor.frequencyBinCount);

  // State variables for playback control.
  this.isMediaPlaying = false; // Flag indicating if audio is currently playing.
  this.playbackStartTimestamp = 0; // Timestamp when playback was last started/resumed.
  this.currentPlaybackOffset = 0; // Offset in seconds from the start of the audio buffer.

  // Store the loaded audio buffer.
  this.audioBuffer = null;
  // Reference to the active AudioBufferSourceNode.
  this.audioSourceNode = null;
  // ID for the ongoing animation frame request.
  this.animationFrameId = null;

  // Initial audio loading.
  this._loadAudioContent(DEFAULT_AUDIO_SOURCE_PATH);
}

/**
 * Asynchronously loads an audio file into an AudioBuffer.
 * @param {string} soundPath - The URL of the audio file.
 * @private
 */
AudioSpectrumVisualizer.prototype._loadAudioContent = function(soundPath) {
  const request = new XMLHttpRequest();
  request.open('GET', soundPath, true);
  request.responseType = 'arraybuffer';

  request.onload = () => {
    this.audioContextRef.decodeAudioData(request.response,
      (decodedBuffer) => {
        this.audioBuffer = decodedBuffer;
        console.info(`Audio content loaded: ${soundPath}`);
        // Optionally start playback immediately or enable a UI button.
      },
      (error) => {
        console.error(`Error decoding audio data from ${soundPath}:`, error);
      }
    );
  };

  request.onerror = () => {
    console.error(`Network error or unable to fetch audio from ${soundPath}.`);
  };

  request.send();
};

/**
 * Initiates or pauses the audio playback.
 * @public
 */
AudioSpectrumVisualizer.prototype.manageMediaPlayback = function() {
  // Guard clause: ensure audio buffer is loaded.
  if (!this.audioBuffer) {
    console.warn("Audio buffer not yet loaded. Cannot manage playback.");
    return;
  }

  if (this.isMediaPlaying) {
    // Current state is playing, so we pause.
    if (this.audioSourceNode) {
      this.audioSourceNode.stop(); // Stop the current source node.
      this.audioSourceNode.disconnect(); // Disconnect to free resources.
      this.audioSourceNode = null; // Clear reference.
    }
    this.currentPlaybackOffset += this.audioContextRef.currentTime - this.playbackStartTimestamp;
    console.log(`Audio paused at ${this.currentPlaybackOffset.toFixed(2)} seconds.`);

    // Cancel any pending animation frame requests.
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

  } else {
    // Current state is paused/stopped, so we start/resume.
    this.playbackStartTimestamp = this.audioContextRef.currentTime;
    console.log(`Audio starting from ${this.currentPlaybackOffset.toFixed(2)} seconds.`);

    // Create a new AudioBufferSourceNode for playback.
    const sourceNode = this.audioContextRef.createBufferSource();
    sourceNode.buffer = this.audioBuffer;
    sourceNode.loop = true; // Loop the audio indefinitely.
    sourceNode.connect(this.audioProcessor); // Connect to the analyser.
    this.audioSourceNode = sourceNode; // Store reference to the active source.

    // Calculate the precise start position, ensuring it wraps within the buffer duration.
    const effectiveStartPosition = this.currentPlaybackOffset % this.audioBuffer.duration;
    this.audioSourceNode.start(0, effectiveStartPosition);

    // Request the first frame of the visualization loop.
    this.animationFrameId = window.requestAnimationLoopFrame(this.renderSpectrumVisualization.bind(this));
  }

  // Toggle the playback state.
  this.isMediaPlaying = !this.isMediaPlaying;
};

/**
 * Renders the audio spectrum and waveform onto the canvas.
 * This method is called repeatedly by requestAnimationFrame.
 * @private
 */
AudioSpectrumVisualizer.prototype.renderSpectrumVisualization = function() {
  // Fetch the latest frequency and time domain data from the analyser.
  this.audioProcessor.getByteFrequencyData(this.frequencyDataArray);
  this.audioProcessor.getByteTimeDomainData(this.waveformDataArray);

  // Retrieve the canvas element and its 2D rendering context.
  const displayCanvasElement = document.querySelector('canvas');
  if (!displayCanvasElement) {
    console.error("Canvas element not found for visualization.");
    // No point in continuing if we can't draw.
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
    return;
  }

  const renderContext = displayCanvasElement.getContext('2d');
  if (!renderContext) {
    console.error("Failed to get 2D rendering context from canvas.");
    // No point in continuing if we can't draw.
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
    }
    return;
  }

  // Ensure canvas dimensions are set correctly.
  displayCanvasElement.width = DISPLAY_CANVAS_WIDTH;
  displayCanvasElement.height = DISPLAY_CANVAS_HEIGHT;

  // Clear the entire canvas before drawing new frames.
  renderContext.clearRect(0, 0, DISPLAY_CANVAS_WIDTH, DISPLAY_CANVAS_HEIGHT);

  const totalBins = this.audioProcessor.frequencyBinCount;
  const barWidthUnit = DISPLAY_CANVAS_WIDTH / totalBins;
  const maxByteValue = 256; // Max value for Uint8Array data.

  // --- Draw Frequency Domain Data (Bar Chart) ---
  for (let i = 0; i < totalBins; i++) {
    const frequencyMagnitude = this.frequencyDataArray[i];
    const magnitudePercentage = frequencyMagnitude / maxByteValue; // Normalize to 0-1.
    const barHeight = DISPLAY_CANVAS_HEIGHT * magnitudePercentage;
    const yOffset = DISPLAY_CANVAS_HEIGHT - barHeight - 1; // Position from bottom.

    const hueAngle = (i / totalBins) * 360; // Calculate color based on frequency.
    renderContext.fillStyle = `hsl(${hueAngle}, 100%, 50%)`;
    renderContext.fillRect(i * barWidthUnit, yOffset, barWidthUnit, barHeight);
  }

  // --- Draw Time Domain Data (Waveform Line) ---
  // A slightly different visualization for the waveform, e.g., a simple line.
  renderContext.strokeStyle = 'rgba(255, 255, 255, 0.7)'; // White with some transparency.
  renderContext.lineWidth = 1;
  renderContext.beginPath();

  for (let i = 0; i < totalBins; i++) {
    const waveformAmplitude = this.waveformDataArray[i];
    // Normalize amplitude from 0-255 to 0-1, then scale to canvas height.
    // Adjust by 0.5 to center around the middle of the canvas.
    const amplitudeNormalized = (waveformAmplitude / maxByteValue) - 0.5;
    const yPosition = (DISPLAY_CANVAS_HEIGHT / 2) + (amplitudeNormalized * DISPLAY_CANVAS_HEIGHT * 0.8); // Scale for visibility.
    const xPosition = i * barWidthUnit;

    if (i === 0) {
      renderContext.moveTo(xPosition, yPosition);
    } else {
      renderContext.lineTo(xPosition, yPosition);
    }
  }
  renderContext.stroke();


  // Continue the animation loop if playback is active.
  if (this.isMediaPlaying) {
    this.animationFrameId = window.requestAnimationLoopFrame(this.renderSpectrumVisualization.bind(this));
  } else {
    // If playback stopped, ensure animation loop is fully cancelled.
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
};

/**
 * Retrieves the magnitude of a specific frequency bin.
 * @param {number} targetFrequency - The frequency in Hz to query.
 * @returns {number} The byte value (0-255) representing the magnitude of the frequency.
 * @public
 */
AudioSpectrumVisualizer.prototype.retrieveFrequencyMagnitude = function(targetFrequency) {
  // Validate input frequency.
  if (typeof targetFrequency !== 'number' || targetFrequency < 0) {
    console.warn("Invalid target frequency provided. Returning 0.");
    return 0;
  }

  const nyquistFrequencyLimit = this.audioContextRef.sampleRate / 2;
  // Calculate the corresponding index in the frequency data array.
  // Ensure the index is within bounds of the array.
  const dataArrayIndex = Math.floor(
    (targetFrequency / nyquistFrequencyLimit) * this.frequencyDataArray.length
  );

  if (dataArrayIndex < 0 || dataArrayIndex >= this.frequencyDataArray.length) {
      // Frequency is out of the detectable range, or calculation resulted in invalid index.
      console.warn(`Frequency ${targetFrequency} Hz is out of analyser range. Returning 0.`);
      return 0;
  }

  return this.frequencyDataArray[dataArrayIndex];
};