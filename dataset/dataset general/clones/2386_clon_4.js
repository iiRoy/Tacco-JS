/*
    visual-sequence-display.js
    A dynamic image sequence player from JSON data.
    Type IV clone of the original 'frameplayer.js'.
*/

const makeDomElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    for (const key in attributes) {
        if (key === 'class') {
            element.className = attributes[key];
        } else if (key === 'style' && typeof attributes[key] === 'object') {
            Object.assign(element.style, attributes[key]);
        } else {
            element.setAttribute(key, attributes[key]);
        }
    }
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });
    return element;
};

const acquireJsonResource = async (url, loadingContainer) => {
    let loaderNotification = null;
    if (loadingContainer) {
        loaderNotification = makeDomElement('p', { class: 'seq-loader-msg' }, ['Acquiring data...']);
        loadingContainer.appendChild(loaderNotification);
    }

    try {
        const networkResponse = await fetch(url);
        if (!networkResponse.ok) {
            throw new Error(`HTTP fetch error: ${networkResponse.status}`);
        }
        const parsedContent = await networkResponse.json();
        return parsedContent;
    } finally {
        if (loaderNotification && loadingContainer.contains(loaderNotification)) {
            loadingContainer.removeChild(loaderNotification);
        }
    }
};

class MediaSequenceDisplay {
    #displayContainer;
    #sequenceDataUrl;
    #settings;
    #renderCanvas;
    #renderContext;
    #frameImage;
    #currentFrameIndex = 0;
    #lastFrameRenderTime = 0;
    #animationFrameHandle = null;
    #playbackHalted = true;
    #uniqueIdentifier;

    static #defaultConfiguration = {
        frameRatePerSecond: 20,
        controlPanelVisible: true,
        autoStart: false,
        displayDimensionWidth: '480px',
        displayDimensionHeight: '320px',
        borderRoundingRadius: null,
    };

    constructor(containerId, presentationOptions) {
        this.#uniqueIdentifier = `seq-${Math.random().toString(36).substring(2, 9)}`;

        this.#displayContainer = document.getElementById(containerId);
        if (!this.#displayContainer) {
            throw new Error(`Host element with ID '${containerId}' not found.`);
        }

        this.#settings = { ...MediaSequenceDisplay.#defaultConfiguration, ...presentationOptions };
        this.#sequenceDataUrl = this.#displayContainer.getAttribute('data-vidsrc');

        this.#applyInitialStyles();
        this.#setupCanvas();

        if (this.#settings.controlPanelVisible) {
            this.#constructControlInterface();
        }

        if (this.#settings.autoStart) {
            this.#playbackHalted = false;
            this.initiatePresentation();
        }
    }

    #applyInitialStyles() {
        this.#displayContainer.style.width = this.#settings.displayDimensionWidth;
        this.#displayContainer.style.height = this.#settings.displayDimensionHeight;
        this.#displayContainer.style.position = 'relative';

        const styleId = `seq-styles-${this.#uniqueIdentifier}`;
        let existingStyle = document.getElementById(styleId);
        if (!existingStyle) {
            existingStyle = makeDomElement('style', { id: styleId });
            document.head.appendChild(existingStyle);
        }

        let styleContent = '';
        if (this.#settings.borderRoundingRadius) {
            styleContent += `#${this.#displayContainer.id}, .sequence-frames-${this.#uniqueIdentifier} { border-radius: ${this.#settings.borderRoundingRadius}; overflow: hidden; }`;
        }
        styleContent += `
            .seq-filter-grayscale { filter: grayscale(100%); }
            .seq-filter-sepia { filter: sepia(100%); }
            .seq-filter-invert { filter: invert(100%); }
            .seq-control-panel {
                position: absolute;
                bottom: 0;
                left: 0;
                background: rgba(0,0,0,0.5);
                padding: 10px;
                display: flex;
                gap: 10px;
                box-sizing: border-box;
                justify-content: center;
                align-items: center;
            }
            .seq-control-button, .seq-effect-selector {
                padding: 5px 10px;
                cursor: pointer;
            }
            .seq-loader-msg {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                background: rgba(0,0,0,0.7);
                padding: 10px 20px;
                border-radius: 5px;
                font-family: sans-serif;
            }
        `;
        existingStyle.innerHTML = styleContent;
    }

    #setupCanvas() {
        this.#renderCanvas = makeDomElement('canvas', {
            class: `sequence-frames-${this.#uniqueIdentifier}`,
            width: parseInt(this.#settings.displayDimensionWidth),
            height: parseInt(this.#settings.displayDimensionHeight),
            style: {
                display: 'block',
                width: this.#settings.displayDimensionWidth,
                height: this.#settings.displayDimensionHeight,
            }
        });
        this.#renderContext = this.#renderCanvas.getContext('2d');
        this.#displayContainer.appendChild(this.#renderCanvas);

        this.#frameImage = new Image();
    }

    #constructControlInterface() {
        const controlPanel = makeDomElement('div', {
            class: 'seq-control-panel',
            style: {
                width: this.#settings.displayDimensionWidth,
            }
        });

        const pauseButton = makeDomElement('button', {
            id: `seq-pause-${this.#uniqueIdentifier}`,
            class: 'seq-control-button',
        }, ['Pause']);
        pauseButton.addEventListener('click', () => this.suspendPresentation());

        const playButton = makeDomElement('button', {
            id: `seq-play-${this.#uniqueIdentifier}`,
            class: 'seq-control-button',
        }, ['Play']);
        playButton.addEventListener('click', () => this.continuePresentation());

        if (this.#playbackHalted) {
            pauseButton.style.display = 'none';
        } else {
            playButton.style.display = 'none';
        }

        controlPanel.appendChild(pauseButton);
        controlPanel.appendChild(playButton);

        const effectOptions = new Map([
            ['normal', 'Normal'],
            ['grayscale', 'Grayscale'],
            ['sepia', 'Sepia'],
            ['invert', 'Invert']
        ]);

        const effectSelector = makeDomElement('select', {
            id: `seq-filter-${this.#uniqueIdentifier}`,
            class: 'seq-effect-selector',
        });

        effectOptions.forEach((label, value) => {
            effectSelector.appendChild(makeDomElement('option', { value: value }, [label]));
        });

        effectSelector.addEventListener('change', (event) => {
            this.alterVisualEffect(event.target.value);
        });
        controlPanel.appendChild(effectSelector);

        this.#displayContainer.appendChild(controlPanel);
    }

    async initiatePresentation() {
        const sequenceData = await acquireJsonResource(this.#sequenceDataUrl, this.#displayContainer);
        if (sequenceData && sequenceData.frames && sequenceData.frames.length > 0) {
            this.#settings.totalFrames = sequenceData.frames.length;
            this.#settings.frameUrls = sequenceData.frames;
            
            // If already playing due to autoStart, just continue
            if (!this.#playbackHalted && !this.#animationFrameHandle) {
                this.#scheduleNextFrame();
            } else if (this.#playbackHalted) { // If it was explicitly paused, don't auto-start
                // Do nothing, wait for continuePresentation call
            }
        } else {
            console.error('Failed to load sequence data or no frames found.');
        }
    }

    continuePresentation() {
        if (this.#playbackHalted) {
            this.#playbackHalted = false;
            this.#updateControlButtons();
            if (this.#settings.frameUrls) { // Only start if frames are loaded
                this.#scheduleNextFrame();
            } else {
                this.initiatePresentation(); // Load and then start if not already loaded
            }
        }
    }

    suspendPresentation() {
        if (!this.#playbackHalted) {
            this.#playbackHalted = true;
            this.#updateControlButtons();
            if (this.#animationFrameHandle) {
                cancelAnimationFrame(this.#animationFrameHandle);
                this.#animationFrameHandle = null;
            }
        }
    }

    alterVisualEffect(effectName) {
        this.#renderCanvas.className = `sequence-frames-${this.#uniqueIdentifier}`;
        if (effectName !== 'normal') {
            this.#renderCanvas.classList.add(`seq-filter-${effectName}`);
        }
    }

    #scheduleNextFrame = () => {
        if (this.#playbackHalted || !this.#settings.frameUrls) {
            return;
        }

        const currentTimestamp = performance.now();
        const frameIntervalMs = 1000 / this.#settings.frameRatePerSecond;

        if (currentTimestamp - this.#lastFrameRenderTime >= frameIntervalMs) {
            this.#lastFrameRenderTime = currentTimestamp - ((currentTimestamp - this.#lastFrameRenderTime) % frameIntervalMs);

            this.#currentFrameIndex = (this.#currentFrameIndex + 1) % this.#settings.totalFrames;

            this.#frameImage.src = this.#settings.frameUrls[this.#currentFrameIndex];
            this.#renderContext.clearRect(0, 0, this.#renderCanvas.width, this.#renderCanvas.height);
            this.#renderContext.drawImage(this.#frameImage, 0, 0, this.#renderCanvas.width, this.#renderCanvas.height);
        }

        this.#animationFrameHandle = requestAnimationFrame(this.#scheduleNextFrame);
    };

    #updateControlButtons() {
        const playBtn = document.getElementById(`seq-play-${this.#uniqueIdentifier}`);
        const pauseBtn = document.getElementById(`seq-pause-${this.#uniqueIdentifier}`);

        if (playBtn && pauseBtn) {
            if (this.#playbackHalted) {
                playBtn.style.display = 'block';
                pauseBtn.style.display = 'none';
            } else {
                playBtn.style.display = 'none';
                pauseBtn.style.display = 'block';
            }
        }
    }
}

window.MediaSequenceDisplay = MediaSequenceDisplay;