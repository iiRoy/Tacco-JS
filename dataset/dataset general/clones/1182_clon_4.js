class BackgroundScaler {
    constructor(configuration) {
        this._settings = this._verifySettings(configuration);
        this._visualMedia = null;
        this._enclosingFrame = null;
        this._viewAdjuster = this._updateDisplay.bind(this);
    }

    _verifySettings(incoming) {
        const confirmed = { ...incoming };
        if (!confirmed.imageSource) {
            throw new Error("BackgroundScaler: 'imageSource' property is mandatory.");
        }
        if (typeof confirmed.imageSource === 'string') {
            confirmed.imageSource = [confirmed.imageSource];
        } else if (!Array.isArray(confirmed.imageSource)) {
            throw new Error("BackgroundScaler: 'imageSource' must be a string or an array of strings.");
        }
        confirmed.alphaLevel = confirmed.alphaLevel === undefined ? 1 : parseFloat(confirmed.alphaLevel);
        confirmed.centerContent = confirmed.centerContent === undefined ? true : !!confirmed.centerContent;
        return confirmed;
    }

    _constructElements() {
        this._enclosingFrame = document.createElement('div');
        this._enclosingFrame.id = `_bg_layer_${Math.random().toString(36).substring(2, 9)}`;
        Object.assign(this._enclosingFrame.style, {
            position: 'fixed',
            top: '0px',
            left: '0px',
            zIndex: '-1',
            overflow: 'hidden',
            visibility: 'hidden',
            opacity: this._settings.alphaLevel,
            width: '100vw',
            height: '100vh'
        });
        document.body.appendChild(this._enclosingFrame);

        this._visualMedia = new Image();
        Object.assign(this._visualMedia.style, {
            position: 'relative',
            display: 'block'
        });
        this._enclosingFrame.appendChild(this._visualMedia);
    }

    _fetchMedia() {
        this._visualMedia.src = this._settings.imageSource[0];

        this._visualMedia.onload = () => {
            this._visualMedia.setAttribute('data-base-width', this._visualMedia.naturalWidth);
            this._visualMedia.setAttribute('data-base-height', this._visualMedia.naturalHeight);
            this._updateDisplay();
            this._enclosingFrame.style.visibility = 'visible';
            document.body.style.overflow = 'auto';
        };
        this._visualMedia.onerror = () => {
            console.error(`BackgroundScaler: Failed to load image from: ${this._settings.imageSource[0]}`);
        };
    }

    _updateDisplay() {
        const baseWidth = parseInt(this._visualMedia.getAttribute('data-base-width'), 10);
        const baseHeight = parseInt(this._visualMedia.getAttribute('data-base-height'), 10);

        if (isNaN(baseWidth) || isNaN(baseHeight)) {
            return;
        }

        const currentViewportWidth = window.innerWidth;
        const currentViewportHeight = window.innerHeight;

        const mediaRatio = baseWidth / baseHeight;
        const viewportRatio = currentViewportWidth / currentViewportHeight;

        let calculatedWidth, calculatedHeight;

        if (mediaRatio > viewportRatio) {
            calculatedHeight = currentViewportHeight;
            calculatedWidth = currentViewportHeight * mediaRatio;
        } else {
            calculatedWidth = currentViewportWidth;
            calculatedHeight = currentViewportWidth / mediaRatio;
        }

        Object.assign(this._visualMedia.style, {
            width: `${calculatedWidth}px`,
            height: `${calculatedHeight}px`,
            left: '0px',
            top: '0px'
        });

        if (this._settings.centerContent) {
            const horizontalOffset = (calculatedWidth - currentViewportWidth) / 2;
            const verticalOffset = (calculatedHeight - currentViewportHeight) / 2;

            if (horizontalOffset > 0) {
                this._visualMedia.style.left = `-${horizontalOffset}px`;
            }
            if (verticalOffset > 0) {
                this._visualMedia.style.top = `-${verticalOffset}px`;
            }
        }
    }

    _establishListeners() {
        window.addEventListener('resize', this._viewAdjuster);
    }

    _prepareEnvironment() {
        document.body.style.overflow = 'hidden';
    }

    deploy() {
        this._prepareEnvironment();
        this._constructElements();
        this._fetchMedia();
        this._establishListeners();
    }
}

function activateBackgroundUtility(options) {
    const scalerInstance = new BackgroundScaler(options);
    scalerInstance.deploy();
    return scalerInstance;
}