/*
    visual-sequence-renderer.js
    A dynamic image sequence displayer, powered by JSON data, optimized for modern web environments.

    @author: A. Clone (derived from Vagner Santana's frame-video project)
    @repository: https://github.com/example/visual-sequence-renderer
    @version: 1.0.0
    @created: 2023-10-27
*/

/**
 * Manages the display and playback of an image sequence from a JSON source.
 * @param {string} containerId - The ID of the DOM element to host the renderer.
 * @param {object} [config] - Configuration options for the renderer.
 */
const VisualSequenceRenderer = function(containerId, config = {}) {
    // Validate the host element immediately
    const targetElement = document.getElementById(containerId);
    if (!targetElement) {
        console.error(`VisualSequenceRenderer: Host element with ID '${containerId}' not found.`);
        throw new Error(`Host element '${containerId}' missing.`);
    }

    this.hostElement = targetElement;
    this.hostId = containerId;
    this.dataStreamUrl = this.hostElement.getAttribute('data-vidsrc') || '';

    // Default configuration properties
    this.frameRate = 20; // Frames per second
    this.displayUi = true; // Show playback controls
    this.isPlaybackHalted = false; // Initial playback state
    this.renderWidth = '480px';
    this.renderHeight = '320px';
    this.cornerRadiusCss = null; // CSS border-radius value
    this.loopPlayback = true; // New: loop the sequence by default
    this.currentAnimationFrameId = null; // To store requestAnimationFrame ID for cancellation

    // Apply user-provided configurations
    this.applyConfiguration(config);

    // Ensure requestAnimationFrame is available
    this.initAnimationFrameSupport();
};

/**
 * Applies configuration options to the renderer instance.
 * @param {object} userConfig - Configuration object.
 */
VisualSequenceRenderer.prototype.applyConfiguration = function(userConfig) {
    // Helper to safely assign config values
    const assignIfDefined = (propName, defaultValue) => {
        this[propName] = userConfig[propName] !== undefined ? userConfig[propName] : defaultValue;
    };

    assignIfDefined('frameRate', this.frameRate);
    assignIfDefined('displayUi', this.displayUi);
    assignIfDefined('renderWidth', this.renderWidth);
    assignIfDefined('renderHeight', this.renderHeight);
    assignIfDefined('cornerRadiusCss', this.cornerRadiusCss);
    assignIfDefined('loopPlayback', this.loopPlayback);

    // Special handling for autoplay
    if (userConfig.autoplay !== undefined && !userConfig.autoplay) {
        this.isPlaybackHalted = true;
    } else if (userConfig.autoplay === undefined) {
        // Default autoplay behavior (true) means it's not halted
        this.isPlaybackHalted = false;
    }

    // Apply dimensions to the host container
    this.hostElement.style.width = this.renderWidth;
    this.hostElement.style.height = this.renderHeight;

    // Apply border-radius if specified
    if (this.cornerRadiusCss) {
        // Create or update a style element for border-radius
        let dynamicStyle = document.getElementById(`style-${this.hostId}-radius`);
        if (!dynamicStyle) {
            dynamicStyle = document.createElement('style');
            dynamicStyle.setAttribute('id', `style-${this.hostId}-radius`);
            document.head.appendChild(dynamicStyle);
        }
        dynamicStyle.innerHTML = `#${this.hostId}, .renderer-frames-${this.hostId} { border-radius: ${this.cornerRadiusCss}; overflow: hidden; }`;
    }

    // Initialize user interface if required
    if (this.displayUi) {
        this.assembleInterfaceElements();
    }
};

/**
 * Starts the animation loop for rendering frames.
 * @param {object} imageSequenceData - Object containing frame URLs.
 * @param {VisualSequenceRenderer} rendererInstance - Reference to the current renderer.
 */
VisualSequenceRenderer.prototype.startRenderingLoop = function(imageSequenceData, rendererInstance) {
    if (!imageSequenceData || !Array.isArray(imageSequenceData.frames) || imageSequenceData.frames.length === 0) {
        console.error("VisualSequenceRenderer: No frames found in the provided data.");
        return;
    }

    let lastFrameTimestamp = performance.now();
    const frameDurationMs = 1000 / rendererInstance.frameRate;
    let currentFrameIdx = 0;

    // Create a canvas for drawing if it doesn't exist
    if (!rendererInstance.displayCanvas) {
        rendererInstance.displayCanvas = document.createElement('canvas');
        rendererInstance.drawContext = rendererInstance.displayCanvas.getContext('2d');
        rendererInstance.hostElement.appendChild(rendererInstance.displayCanvas);

        // Set canvas dimensions to match the host element
        rendererInstance.displayCanvas.width = rendererInstance.hostElement.offsetWidth;
        rendererInstance.displayCanvas.height = rendererInstance.hostElement.offsetHeight;
    }

    const currentFrameImage = new Image(); // Use a single Image object for efficiency

    const animateFrame = (highResTimestamp) => {
        rendererInstance.currentAnimationFrameId = window.requestAnimationFrame(animateFrame);

        const elapsedSinceLastFrame = highResTimestamp - lastFrameTimestamp;

        // Only update frame if enough time has passed and not paused
        if (elapsedSinceLastFrame >= frameDurationMs && !rendererInstance.isPlaybackHalted) {
            lastFrameTimestamp = highResTimestamp - (elapsedSinceLastFrame % frameDurationMs); // Adjust timestamp for more stable frame rate

            currentFrameIdx++;
            if (currentFrameIdx >= imageSequenceData.frames.length) {
                if (rendererInstance.loopPlayback) {
                    currentFrameIdx = 0; // Loop back to start
                } else {
                    currentFrameIdx = imageSequenceData.frames.length - 1; // Stop at last frame
                    rendererInstance.haltPlayback(); // Pause playback
                    return; // Exit animation loop
                }
            }

            currentFrameImage.src = imageSequenceData.frames[currentFrameIdx];
            // Ensure image is loaded before drawing, though in a fast loop this might cause flickering
            // For simplicity and matching original, we assume image.src will load fast enough.
            currentFrameImage.onload = () => {
                rendererInstance.drawContext.clearRect(0, 0, rendererInstance.displayCanvas.width, rendererInstance.displayCanvas.height); // Clear previous frame
                rendererInstance.drawContext.drawImage(
                    currentFrameImage,
                    0, 0,
                    rendererInstance.displayCanvas.width,
                    rendererInstance.displayCanvas.height
                );
            };
            if (currentFrameImage.complete) { // Draw immediately if already loaded (e.g. cached)
                rendererInstance.drawContext.clearRect(0, 0, rendererInstance.displayCanvas.width, rendererInstance.displayCanvas.height);
                rendererInstance.drawContext.drawImage(
                    currentFrameImage,
                    0, 0,
                    rendererInstance.displayCanvas.width,
                    rendererInstance.displayCanvas.height
                );
            }
        }
    };

    // Begin the animation loop
    rendererInstance.currentAnimationFrameId = window.requestAnimationFrame(animateFrame);
};

/**
 * Assembles the user interface elements (control bar).
 */
VisualSequenceRenderer.prototype.assembleInterfaceElements = function() {
    const selfRef = this;

    // Guard against re-creating controls
    if (this.hostElement.querySelector('.renderer-controls')) {
        console.warn("Controls already exist for this renderer instance.");
        return;
    }

    const uiContainer = document.createElement('div');
    uiContainer.className = 'renderer-controls'; // Use class for styling
    uiContainer.style.width = this.renderWidth;

    // Helper for creating buttons
    const createControlBtn = (btnIdSuffix, btnText, clickHandler) => {
        const button = document.createElement('button');
        button.id = `btn-${btnIdSuffix}-${selfRef.hostId}`;
        button.className = 'renderer-btn';
        button.textContent = btnText;
        button.addEventListener('click', clickHandler, false);
        return button;
    };

    // Play/Pause buttons
    const pauseButton = createControlBtn('pause', 'Pause', () => selfRef.haltPlayback());
    const playButton = createControlBtn('play', 'Play', () => selfRef.unpause());
    uiContainer.appendChild(pauseButton);
    uiContainer.appendChild(playButton);

    // Initial display state for buttons
    if (selfRef.isPlaybackHalted) {
        pauseButton.style.display = 'none';
        playButton.style.display = 'block';
    } else {
        pauseButton.style.display = 'block';
        playButton.style.display = 'none';
    }

    // Filter selection dropdown
    const filterDropdown = document.createElement('select');
    const visualFilterOptions = ['none', 'grayscale', 'sepia', 'invert']; // Renamed 'normal' to 'none'

    visualFilterOptions.forEach(filterName => {
        const optionElement = document.createElement('option');
        optionElement.value = filterName;
        optionElement.textContent = filterName.charAt(0).toUpperCase() + filterName.slice(1);
        filterDropdown.appendChild(optionElement);
    });

    filterDropdown.id = `filter-select-${selfRef.hostId}`;
    filterDropdown.className = 'renderer-select';
    filterDropdown.addEventListener('change', function() {
        selfRef.applyVisualFilter(this.value);
    }, false);
    uiContainer.appendChild(filterDropdown);

    // New: Add a simple frame counter / progress indicator
    const frameCounter = document.createElement('span');
    frameCounter.id = `frame-counter-${selfRef.hostId}`;
    frameCounter.className = 'renderer-frame-counter';
    frameCounter.textContent = 'Frame: 0'; // Initial text
    uiContainer.appendChild(frameCounter);

    // Append the assembled control bar to the host container
    this.hostElement.appendChild(uiContainer);
};

/**
 * Initiates the media playback by fetching the source and starting the render loop.
 */
VisualSequenceRenderer.prototype.beginPlayback = function() {
    // If playback is already active and not halted, do nothing
    if (this.currentAnimationFrameId && !this.isPlaybackHalted) {
        return;
    }
    this.retrieveMediaSource(this.dataStreamUrl, this.startRenderingLoop);
};

/**
 * Resumes playback if currently halted.
 */
VisualSequenceRenderer.prototype.unpause = function() {
    if (!this.isPlaybackHalted) {
        return; // Already playing
    }
    const playBtn = document.getElementById(`btn-play-${this.hostId}`);
    const pauseBtn = document.getElementById(`btn-pause-${this.hostId}`);

    if (playBtn) playBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'block';

    this.isPlaybackHalted = false;
    // If animation was cancelled, restart it. Otherwise, it will naturally resume.
    if (!this.currentAnimationFrameId) {
         this.beginPlayback(); // This will re-fetch and restart if needed, or simply let the loop continue
    }
};

/**
 * Halts playback.
 */
VisualSequenceRenderer.prototype.haltPlayback = function() {
    if (this.isPlaybackHalted) {
        return; // Already halted
    }
    const playBtn = document.getElementById(`btn-play-${this.hostId}`);
    const pauseBtn = document.getElementById(`btn-pause-${this.hostId}`);

    if (playBtn) playBtn.style.display = 'block';
    if (pauseBtn) pauseBtn.style.display = 'none';

    this.isPlaybackHalted = true;
    // No need to cancel rAF, the loop itself checks `isPlaybackHalted`
};

/**
 * Applies a visual filter class to the canvas element.
 * @param {string} filterStyleName - The name of the filter to apply (e.g., 'grayscale', 'sepia').
 */
VisualSequenceRenderer.prototype.applyVisualFilter = function(filterStyleName) {
    const targetCanvas = this.hostElement.querySelector('canvas');
    if (!targetCanvas) return;

    // Remove all existing filter classes first
    targetCanvas.classList.remove('renderer-grayscale', 'renderer-sepia', 'renderer-invert');

    // Apply the new filter class if it's not 'none'
    switch (filterStyleName) {
      case 'none': // Renamed from 'normal'
        // No class needed
        break;
      case 'grayscale':
        targetCanvas.classList.add('renderer-grayscale');
        break;
      case 'sepia':
        targetCanvas.classList.add('renderer-sepia');
        break;
      case 'invert':
        targetCanvas.classList.add('renderer-invert');
        break;
      default:
        console.warn(`VisualSequenceRenderer: Unknown filter '${filterStyleName}' requested. Applying 'none'.`);
        break;
    }
};

/**
 * Fetches the JSON media source using the Fetch API.
 * @param {string} sourceUrl - URL of the JSON file.
 * @param {function} successCallback - Callback to execute with the parsed data.
 */
VisualSequenceRenderer.prototype.retrieveMediaSource = async function(sourceUrl, successCallback) {
    const selfRef = this;
    const loadingIndicator = document.createElement('div'); // Changed from <p> to <div> for more styling flexibility
    loadingIndicator.className = 'renderer-loading-indicator';
    loadingIndicator.textContent = 'Loading visual sequence...';
    this.hostElement.appendChild(loadingIndicator);

    try {
        const response = await fetch(sourceUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        // Basic validation for the expected data structure
        if (!data || !Array.isArray(data.frames)) {
            throw new Error("Invalid JSON data structure: 'frames' array not found.");
        }

        selfRef.hostElement.removeChild(loadingIndicator);
        successCallback(data, selfRef);

    } catch (error) {
        selfRef.hostElement.removeChild(loadingIndicator);
        console.error(`VisualSequenceRenderer: Failed to load media source from ${sourceUrl}.`, error);
        // Display an error message to the user
        const errorDisplay = document.createElement('div');
        errorDisplay.className = 'renderer-error-message';
        errorDisplay.textContent = `Error loading content: ${error.message}`;
        selfRef.hostElement.appendChild(errorDisplay);
        throw error; // Re-throw to indicate failure
    }
};

/**
 * Ensures `requestAnimationFrame` and `cancelAnimationFrame` are available,
 * providing a polyfill if necessary.
 * Simplified polyfill logic, focusing on modern browsers' needs.
 */
VisualSequenceRenderer.prototype.initAnimationFrameSupport = function() {
    // Check if native support exists
    if (window.requestAnimationFrame && window.cancelAnimationFrame) {
        return;
    }

    // Simplified polyfill for older or less common environments
    let lastPolyfillTime = 0;
    const vendors = ['webkit', 'moz']; // Only common prefixes for older browsers

    for (let i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        window.requestAnimationFrame = window[`${vendors[i]}RequestAnimationFrame`];
        window.cancelAnimationFrame = window[`${vendors[i]}CancelAnimationFrame`] || window[`${vendors[i]}CancelRequestAnimationFrame`];
    }

    // Fallback if no vendor-prefixed or native rAF is found
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            const currentTime = Date.now();
            const timeToNextFrame = Math.max(0, 16 - (currentTime - lastPolyfillTime)); // Aim for ~60fps (1000ms/60 = 16.6ms)
            const timerId = window.setTimeout(function() {
                callback(currentTime + timeToNextFrame);
            }, timeToNextFrame);
            lastPolyfillTime = currentTime + timeToNextFrame;
            return timerId;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(timeoutId) {
            clearTimeout(timeoutId);
        };
    }
};