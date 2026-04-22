class SenseShift {
    #primarySource;
    #secondarySource;
    #displayArea;
    #currentOrientation = 0;
    #debounceIdentifier = 0;
    #motionSuppressed = false;
    #viewBounds = { width: 0, height: 0 };
    #mediaDetails = {};
    #displayObject;
    #temporaryLoader;
    #horizontalExcess;
    #centerAlignment;
    #meterWidth;
    #meterAlignment;
    #markerSize;
    #markerElement;
    #clippingContainer;
    #directionMeter;

    #effectSettings = {
        angularLimit: 20,
        phasedLoading: false,
        invertedMotion: false
    };

    #orientationReadings = [];
    #readingsCapacity = 9;

    constructor(configuration) {
        if (!configuration || !configuration.url) {
            throw new Error('Initial media source is required for SenseShift.');
        }

        this.#primarySource = configuration.url;
        this.#secondarySource = configuration.lowResUrl;
        this.#displayArea = configuration.container || document.body;

        this.#effectSettings.angularLimit = configuration.maxTilt || this.#effectSettings.angularLimit;
        this.#effectSettings.phasedLoading = configuration.lowResUrl || this.#effectSettings.phasedLoading;
        this.#effectSettings.invertedMotion = configuration.reverseTilt || this.#effectSettings.invertedMotion;

        this.#ensureAnimationLoop();

        this.#initializeProcessor();
    }

    #ensureAnimationLoop() {
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.mozRequestAnimationFrame ||
                                          window.webkitRequestAnimationFrame ||
                                          window.msRequestAnimationFrame;
        }
    }

    async #initializeProcessor() {
        const initialAsset = this.#effectSettings.phasedLoading ? this.#secondarySource : this.#primarySource;

        this.#determineDisplayBounds();
        this.#displayArea.innerHTML = '';

        try {
            this.#temporaryLoader = await this.#fetchMediaAsset(initialAsset);
            this.#extractMediaDetails();

            await this.#constructInterface();

            if (this.#effectSettings.phasedLoading) {
                const fullResLoader = await this.#fetchMediaAsset(this.#primarySource);
                this.#displayObject.src = fullResLoader.src;
            }

            this.#registerListeners();
            this.#updateVisualState();
        } catch (problem) {
            console.error('SenseShift failed to activate:', problem);
            this.#displayArea.textContent = 'Media loading error.';
        }
    }

    #determineDisplayBounds() {
        const currentStyle = window.getComputedStyle(this.#displayArea);
        this.#viewBounds = {
            width: parseInt(currentStyle.width, 10),
            height: parseInt(currentStyle.height, 10)
        };
    }

    async #fetchMediaAsset(assetURL) {
        return new Promise((resolve, reject) => {
            const freshImage = new Image();
            freshImage.onload = () => resolve(freshImage);
            freshImage.onerror = (e) => reject(new Error(`Failed to load asset: ${assetURL}, ${e.type}`));
            freshImage.src = assetURL;
        });
    }

    #extractMediaDetails() {
        this.#mediaDetails = {
            width: this.#temporaryLoader.width,
            height: this.#temporaryLoader.height,
            aspectRatio: this.#temporaryLoader.width / this.#temporaryLoader.height,
            source: this.#temporaryLoader.src
        };
        this.#temporaryLoader = null;
    }

    async #constructInterface() {
        const meterPadding = 20;

        const dynamicHTML = `
            <div class="visual-clipping-frame">
                <div class="motion-direction-meter">
                    <div class="motion-indicator-marker"></div>
                </div>
                <img class="shifted-visual-element" src="${this.#mediaDetails.source}" alt="dynamic perspective" />
            </div>
        `;
        this.#displayArea.innerHTML = dynamicHTML;

        this.#clippingContainer = this.#displayArea.querySelector('.visual-clipping-frame');
        this.#directionMeter = this.#displayArea.querySelector('.motion-direction-meter');
        this.#markerElement = this.#displayArea.querySelector('.motion-indicator-marker');
        this.#displayObject = this.#displayArea.querySelector('.shifted-visual-element');

        this.#displayObject.height = this.#viewBounds.height;
        const adjustedMediaWidth = this.#mediaDetails.aspectRatio * this.#displayObject.height;

        this.#horizontalExcess = adjustedMediaWidth - this.#viewBounds.width;
        this.#centerAlignment = this.#horizontalExcess / 2;

        this.#meterWidth = this.#viewBounds.width - meterPadding;
        this.#markerElement.style.width = (this.#markerSize = (this.#viewBounds.width * this.#meterWidth) / adjustedMediaWidth) + 'px';

        this.#meterAlignment = (this.#meterWidth / 2) - (this.#markerSize / 2);

        if (this.#meterAlignment > 0) {
            this.#motionSuppressed = false;
            this.#displayArea.classList.remove('no-transition-effect');
        } else {
            this.#motionSuppressed = true;
            this.#currentOrientation = 0;
            this.#displayArea.classList.add('no-transition-effect');
        }

        this.#updateVisualState();
    }

    #updateVisualState = () => {
        let activeRotation = this.#currentOrientation;

        activeRotation = (activeRotation > 0)
            ? Math.min(activeRotation, this.#effectSettings.angularLimit)
            : Math.max(activeRotation, this.#effectSettings.angularLimit * -1);

        if (!this.#effectSettings.invertedMotion) {
            activeRotation *= -1;
        }

        const pixelShiftAmount = (activeRotation * this.#centerAlignment) / this.#effectSettings.angularLimit;
        this.#applyMediaTranslation( (this.#centerAlignment + pixelShiftAmount) * -1);
        this.#adjustMeterIndicator(activeRotation);

        window.requestAnimationFrame(this.#updateVisualState);
    }

    #adjustMeterIndicator(rotationValue) {
        const indicatorDisplacement = (rotationValue * ((this.#meterWidth - this.#markerSize) / 2)) / this.#effectSettings.angularLimit;
        this.#applyHorizontalTranslation(this.#markerElement, (this.#meterAlignment + indicatorDisplacement));
    }

    #applyMediaTranslation(shiftValue) {
        this.#applyHorizontalTranslation(this.#displayObject, shiftValue);
    }

    #applyHorizontalTranslation(targetElement, value) {
        targetElement.style.transform = `translateX(${Math.round(value)}px)`;
    }

    #registerListeners() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', this.#processOrientationData);
        }

        window.addEventListener('resize', this.#throttleAction(() => {
            this.#displayArea.classList.add('is-resizing-frame');
            this.#determineDisplayBounds();
            this.#constructInterface().then(() => {
                this.#displayArea.classList.remove('is-resizing-frame');
            });
        }, 100));
    }

    #processOrientationData = (eventData) => {
        if (!this.#motionSuppressed) {
            this.#orientationReadings.push(eventData.gamma);
            if (this.#orientationReadings.length > this.#readingsCapacity) {
                this.#orientationReadings.shift();
            }
            this.#currentOrientation = this.#orientationReadings.reduce((accum, val) => accum + val, 0) / this.#orientationReadings.length;
        }
    }

    #throttleAction(operation, delayMs) {
        let timer;
        return function(...args) {
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(() => operation.apply(context, args), delayMs);
        };
    }

    getDisplayElement() {
        return this.#displayArea;
    }
}