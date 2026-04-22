const VISUAL_WIDTH = 640;
const VISUAL_HEIGHT = 360;
const SPECTRUM_SMOOTHING = 0.8;
const TRANSFORM_WINDOW_SIZE = 2048;

window.requestRenderFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

class MediaVisualizer {
  #audioMachine;
  #spectrumMonitor;
  #soundBuffer;
  #soundNode;
  #freqBins;
  #timeSamples;

  #isPlaybackActive = false;
  #currentPlaybackMoment = 0;
  #currentPlaybackOffset = 0;

  constructor() {
    this.#audioMachine = new (window.AudioContext || window.webkitAudioContext)();
    this.#spectrumMonitor = this.#audioMachine.createAnalyser();
    this.#spectrumMonitor.connect(this.#audioMachine.destination);
    this.#spectrumMonitor.minDecibels = -140;
    this.#spectrumMonitor.maxDecibels = 0;

    this.#freqBins = new Uint8Array(this.#spectrumMonitor.frequencyBinCount);
    this.#timeSamples = new Uint8Array(this.#spectrumMonitor.frequencyBinCount);

    this.#initiateAudioLoad('chrono.mp3');
  }

  async #initiateAudioLoad(audioPath) {
    try {
      const mediaResponse = await fetch(audioPath);
      const audioData = await mediaResponse.arrayBuffer();
      this.#soundBuffer = await this.#audioMachine.decodeAudioData(audioData);
    } catch (e) {
      console.error('Failed to load audio:', e);
    }
  }

  async adjustPlaybackState() {
    if (!this.#soundBuffer) {
      console.warn("Audio buffer not loaded yet.");
      return;
    }

    if (this.#isPlaybackActive) {
      if (this.#soundNode) {
        this.#soundNode.stop(0);
        this.#currentPlaybackOffset += this.#audioMachine.currentTime - this.#currentPlaybackMoment;
        console.log('Playback paused at', this.#currentPlaybackOffset);
      }
    } else {
      this.#currentPlaybackMoment = this.#audioMachine.currentTime;
      console.log('Playback resumed at', this.#currentPlaybackOffset);
      this.#soundNode = this.#audioMachine.createBufferSource();
      this.#soundNode.connect(this.#spectrumMonitor);
      this.#soundNode.buffer = this.#soundBuffer;
      this.#soundNode.loop = true;

      const effectiveOffset = this.#currentPlaybackOffset % this.#soundBuffer.duration;
      this.#soundNode.start(0, effectiveOffset);

      window.requestRenderFrame(this.#visualizeSound.bind(this));
    }
    this.#isPlaybackActive = !this.#isPlaybackActive;
  }

  #visualizeSound() {
    this.#spectrumMonitor.smoothingTimeConstant = SPECTRUM_SMOOTHING;
    this.#spectrumMonitor.fftSize = TRANSFORM_WINDOW_SIZE;

    this.#spectrumMonitor.getByteFrequencyData(this.#freqBins);
    this.#spectrumMonitor.getByteTimeDomainData(this.#timeSamples);

    const displayElement = document.querySelector('canvas');
    if (!displayElement) {
      console.error("Canvas element not found.");
      return;
    }
    const renderContext = displayElement.getContext('2d');

    displayElement.width = VISUAL_WIDTH;
    displayElement.height = VISUAL_HEIGHT;

    renderContext.clearRect(0, 0, VISUAL_WIDTH, VISUAL_HEIGHT);

    const frequencyBars = Array.from(this.#freqBins).map((dataValue, index) => {
      const normalizedValue = dataValue / 256;
      const barHeight = VISUAL_HEIGHT * normalizedValue;
      const yOffset = VISUAL_HEIGHT - barHeight - 1;
      const segmentWidth = VISUAL_WIDTH / this.#spectrumMonitor.frequencyBinCount;
      const colorHue = index / this.#spectrumMonitor.frequencyBinCount * 360;
      return {
        xPosition: index * segmentWidth,
        yPosition: yOffset,
        widthDimension: segmentWidth,
        heightDimension: barHeight,
        fillColor: `hsl(${colorHue}, 100%, 50%)`
      };
    });

    frequencyBars.forEach(bar => {
      renderContext.fillStyle = bar.fillColor;
      renderContext.fillRect(bar.xPosition, bar.yPosition, bar.widthDimension, bar.heightDimension);
    });

    const timeDomainPoints = Array.from(this.#timeSamples).map((dataValue, index) => {
      const normalizedValue = dataValue / 256;
      const barHeight = VISUAL_HEIGHT * normalizedValue;
      const yOffset = VISUAL_HEIGHT - barHeight - 1;
      const segmentWidth = VISUAL_WIDTH / this.#spectrumMonitor.frequencyBinCount;
      return {
        xPosition: index * segmentWidth,
        yPosition: yOffset,
        widthDimension: 1,
        heightDimension: 2,
        fillColor: 'white'
      };
    });

    timeDomainPoints.forEach(point => {
      renderContext.fillStyle = point.fillColor;
      renderContext.fillRect(point.xPosition, point.yPosition, point.widthDimension, point.heightDimension);
    });

    if (this.#isPlaybackActive) {
      window.requestRenderFrame(this.#visualizeSound.bind(this));
    }
  }

  retrieveFrequencyLevel(targetFrequency) {
    const nyquistFrequency = this.#audioMachine.sampleRate / 2;
    const dataIndex = Math.round(targetFrequency / nyquistFrequency * this.#freqBins.length);
    return this.#freqBins[dataIndex];
  }
}