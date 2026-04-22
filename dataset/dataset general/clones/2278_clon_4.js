const _defaultCarouselOptions = {
    transitionSpeed: 1,
    displayInterval: 2500,
    visualEffect: '',
    showIndicators: true,
    showNavControls: true,
    showCaption: true,
    animationCurve: '',
    mainCanvas: null,
    delayDuration: null,
    mediaReferences: null,
    activeMediaSource: null,
    activeMediaDestination: null,
    activeCaptionText: null,
    activeTargetWindow: '_self',
    canvasWidth: null,
    canvasHeight: null,
    currentMediaIndex: 0,
    isTransitioning: false,
    isHoveringCanvas: false,
    intelligentRandom: null,
    randomizeOrder: false,
    useThumbnails: false,
    indicatorStyleInactive: false,
    indicatorStyleHover: false,
    indicatorStyleActive: false,
    hideInteractionElements: false,
    fullScreenDisplay: false,
    dataSourceUrl: false,
    useDots: false,
    captionPanelWidth: null,
    hiddenElementOpacity: 0.75,
    elementFadeInDuration: 200,
    elementFadeOutDuration: 300,
    onLoadComplete: null,
    onItemSwitched: null,
    maxIndicatorHeight: 20,
    indicatorAlignment: 'left',
    previewMode: false,
    focusMode: false,
    isFocusActive: false,
    focusButtonPosition: 'center',
    showControls: false,
    controlsPosition: 'center',
    showProgressBar: false,
    progressBarCss: {},
    isPlaybackPaused: false,
    isBlurred: false,
    isTimePaused: false,
    startTime: 0,
    elapsedTime: 0,
    pauseOnHover: true,
    enableKeyboardNav: false,
    customEffects: [],
    controlButtonHoverIn: null,
    controlButtonHoverOut: null,
    autoAdvance: true,
    captionAnimation: 'slideUp',
    visualTheme: null,
    baseStructure: {
        prev: 'navigate-previous',
        next: 'navigate-next',
        status: 'status-display',
        container: 'visual-container',
        mediaWrapper: 'media-wrapper',
        mainMedia: 'main-media-element',
        captionPanel: 'caption-panel'
    }
};

function _constructElement(tag, classes = [], attributes = {}, content = '') {
    const el = document.createElement(tag);
    if (classes.length) {
        el.classList.add(...classes);
    }
    for (const key in attributes) {
        el.setAttribute(key, attributes[key]);
    }
    if (content) {
        el.innerHTML = content;
    }
    return el;
}

class InteractiveDisplay extends HTMLElement {
    constructor() {
        super();
        this._instanceData = new Map();
        this._instanceData.set('configuration', { ..._defaultCarouselOptions });
        this._instanceData.set('advanceTimerHandle', null);
        this._instanceData.set('mediaAssets', []);
        this._instanceData.set('elementCache', {});
    }

    connectedCallback() {
        const currentConfig = this._instanceData.get('configuration');
        const userOptions = this._extractAttributes();
        Object.assign(currentConfig, userOptions);

        if (currentConfig.fullScreenDisplay) {
            this.style.position = 'absolute';
            this.style.top = '0';
            this.style.left = '0';
            this.style.zIndex = '1000';
            this.style.width = `${window.innerWidth}px`;
            this.style.height = `${window.innerHeight}px`;
            currentConfig.pauseOnHover = false;
            document.body.style.overflow = 'hidden';
        }

        currentConfig.canvasWidth = parseFloat(getComputedStyle(this).width);
        currentConfig.canvasHeight = parseFloat(getComputedStyle(this).height);

        if (!currentConfig.canvasWidth || !currentConfig.canvasHeight) {
            console.warn('InteractiveDisplay: Width or height not explicitly defined or is zero.');
            return false;
        }

        if (currentConfig.visualTheme) {
            this.classList.add(`carousel-theme-${currentConfig.visualTheme}`);
        }

        this._assembleInternalElements();
        this._concealInitialElements();
        this._adjustInternalDimensions();
        this._ingestChildMedia();

        if (currentConfig.randomizeOrder) {
            this._instanceData.get('mediaAssets').sort(() => Math.random() - 0.5);
        }

        const mediaAssets = this._instanceData.get('mediaAssets');
        if (mediaAssets.length > 0) {
            const firstAsset = mediaAssets[0];
            currentConfig.activeMediaSource = firstAsset.source;
            currentConfig.activeMediaDestination = firstAsset.destination;
            currentConfig.activeCaptionText = firstAsset.caption;
            currentConfig.activeTargetWindow = firstAsset.target || '_self';
            this._refreshDisplay(0);
        }

        if (mediaAssets.length > 1) {
            this._configureNavigationControls();
        }
    }

    disconnectedCallback() {
        clearTimeout(this._instanceData.get('advanceTimerHandle'));
        const cache = this._instanceData.get('elementCache');
        if (cache.prevControl) {
            cache.prevControl.removeEventListener('click', this._previousAssetHandler);
            cache.prevControl.removeEventListener('mouseover', this._controlInteractionInHandler);
            cache.prevControl.removeEventListener('mouseleave', this._controlInteractionOutHandler);
        }
        if (cache.nextControl) {
            cache.nextControl.removeEventListener('click', this._nextAssetHandler);
            cache.nextControl.removeEventListener('mouseover', this._controlInteractionInHandler);
            cache.nextControl.removeEventListener('mouseleave', this._controlInteractionOutHandler);
        }
        if (this._instanceData.get('configuration').fullScreenDisplay) {
            document.body.style.overflow = '';
        }
    }

    _extractAttributes() {
        const options = {};
        if (this.dataset.visualTheme) options.visualTheme = this.dataset.visualTheme;
        if (this.dataset.displayInterval) options.displayInterval = parseInt(this.dataset.displayInterval, 10);
        if (this.dataset.randomizeOrder) options.randomizeOrder = this.dataset.randomizeOrder === 'true';
        if (this.dataset.useThumbnails) options.useThumbnails = this.dataset.useThumbnails === 'true';
        if (this.dataset.useDots) options.useDots = this.dataset.useDots === 'true';
        if (this.dataset.indicatorAlignment) options.indicatorAlignment = this.dataset.indicatorAlignment;
        if (this.dataset.showCaption) options.showCaption = this.dataset.showCaption === 'true';
        if (this.dataset.showIndicators) options.showIndicators = this.dataset.showIndicators === 'true';
        if (this.dataset.showNavControls) options.showNavControls = this.dataset.showNavControls === 'true';
        if (this.dataset.autoAdvance) options.autoAdvance = this.dataset.autoAdvance === 'true';
        return options;
    }

    _assembleInternalElements() {
        const cache = this._instanceData.get('elementCache');
        const config = this._instanceData.get('configuration');
        const structureClasses = config.baseStructure;

        cache.prevControl = _constructElement('a', [structureClasses.prev], { href: '#' }, 'Previous');
        cache.nextControl = _constructElement('a', [structureClasses.next], { href: '#' }, 'Next');
        cache.statusPanel = _constructElement('span', [structureClasses.status]);

        cache.visualContainer = _constructElement('div', [structureClasses.container]);
        cache.mediaWrapper = _constructElement('div', [structureClasses.mediaWrapper]);
        cache.mediaLink = _constructElement('a', [], { href: '' });
        cache.mainMediaElement = _constructElement('img', [structureClasses.mainMedia]);
        cache.captionPanel = _constructElement('div', [structureClasses.captionPanel]);

        cache.mediaLink.append(cache.mainMediaElement);
        cache.mediaWrapper.append(cache.mediaLink, cache.captionPanel);
        cache.visualContainer.append(cache.mediaWrapper);

        this.append(cache.prevControl, cache.nextControl, cache.statusPanel, cache.visualContainer);
    }

    _concealInitialElements() {
        const cache = this._instanceData.get('elementCache');
        cache.statusPanel.style.display = 'none';
        cache.captionPanel.style.display = 'none';
        cache.prevControl.style.display = 'none';
        cache.nextControl.style.display = 'none';
    }

    _adjustInternalDimensions() {
        const cache = this._instanceData.get('elementCache');
        const config = this._instanceData.get('configuration');

        cache.visualContainer.style.width = `${config.canvasWidth}px`;
        cache.visualContainer.style.height = `${config.canvasHeight}px`;

        const captionWidth = config.captionPanelWidth || config.canvasWidth;
        cache.captionPanel.style.width = `${captionWidth}px`;
    }

    _ingestChildMedia() {
        const mediaAssets = this._instanceData.get('mediaAssets');
        const initialList = this.querySelector('ul');

        if (initialList) {
            initialList.querySelectorAll('li').forEach((listItem, index) => {
                const linkElement = listItem.querySelector('a');
                const imageElement = listItem.querySelector('img');
                const descriptiveElement = listItem.querySelector('.descriptive-text');

                if (imageElement) {
                    const asset = {
                        source: imageElement.getAttribute('src'),
                        destination: linkElement ? linkElement.getAttribute('href') : '#',
                        effectType: imageElement.getAttribute('class'),
                        caption: descriptiveElement ? descriptiveElement.innerHTML : '',
                        target: linkElement && linkElement.getAttribute('target') ? linkElement.getAttribute('target') : '_self'
                    };
                    mediaAssets.push(asset);
                    this._addNavigationIndicator(asset, index);
                }
            });
            initialList.style.display = 'none';
        }
    }

    _addNavigationIndicator(assetData, index) {
        const cache = this._instanceData.get('elementCache');
        const config = this._instanceData.get('configuration');
        let indicatorElement;

        if (config.useThumbnails) {
            indicatorElement = _constructElement('span', ['media-indicator', 'thumb-indicator'], { 'data-asset-index': index });
            const thumbImage = _constructElement('img', [], { src: assetData.source });
            if (config.canvasWidth > config.canvasHeight) {
                thumbImage.style.height = '100px';
            } else {
                thumbImage.style.width = '100px';
            }
            indicatorElement.append(thumbImage);
        } else {
            indicatorElement = _constructElement('span', ['media-indicator'], { 'data-asset-index': index }, (index + 1).toString());
            if (config.useDots) {
                indicatorElement.classList.add('dot-indicator');
            }
        }

        if (index === 0) {
            indicatorElement.classList.add('active-indicator');
        }

        cache.statusPanel.append(indicatorElement);
        indicatorElement.addEventListener('click', () => this._activateAsset(index));
    }

    _configureNavigationControls() {
        const cache = this._instanceData.get('elementCache');
        this._previousAssetHandler = this._advancePrevious.bind(this);
        this._nextAssetHandler = this._advanceNext.bind(this);
        this._controlInteractionInHandler = this._handleControlInteractionIn.bind(this);
        this._controlInteractionOutHandler = this._handleControlInteractionOut.bind(this);

        cache.prevControl.addEventListener('click', this._previousAssetHandler);
        cache.nextControl.addEventListener('click', this._nextAssetHandler);

        if (this._instanceData.get('configuration').controlButtonHoverIn) {
            cache.prevControl.addEventListener('mouseover', this._controlInteractionInHandler);
            cache.nextControl.addEventListener('mouseover', this._controlInteractionInHandler);
        }
        if (this._instanceData.get('configuration').controlButtonHoverOut) {
            cache.prevControl.addEventListener('mouseleave', this._controlInteractionOutHandler);
            cache.nextControl.addEventListener('mouseleave', this._controlInteractionOutHandler);
        }
    }

    _advancePrevious(event) {
        event.preventDefault();
        const config = this._instanceData.get('configuration');
        const mediaAssets = this._instanceData.get('mediaAssets');
        if (config.isTransitioning || mediaAssets.length <= 1) return;

        let newIndex = config.currentMediaIndex - 1;
        if (newIndex < 0) {
            newIndex = mediaAssets.length - 1;
        }
        this._activateAsset(newIndex);
    }

    _advanceNext(event) {
        event.preventDefault();
        const config = this._instanceData.get('configuration');
        const mediaAssets = this._instanceData.get('mediaAssets');
        if (config.isTransitioning || mediaAssets.length <= 1) return;

        let newIndex = config.currentMediaIndex + 1;
        if (newIndex >= mediaAssets.length) {
            newIndex = 0;
        }
        this._activateAsset(newIndex);
    }

    _activateAsset(targetIndex) {
        const config = this._instanceData.get('configuration');
        const mediaAssets = this._instanceData.get('mediaAssets');
        const cache = this._instanceData.get('elementCache');

        if (config.isTransitioning || targetIndex === config.currentMediaIndex) return;

        config.isTransitioning = true;
        clearTimeout(this._instanceData.get('advanceTimerHandle'));

        const currentAsset = mediaAssets[targetIndex];
        cache.mainMediaElement.setAttribute('src', currentAsset.source);
        cache.mediaLink.setAttribute('href', currentAsset.destination);
        cache.mediaLink.setAttribute('target', currentAsset.target);
        cache.captionPanel.innerHTML = currentAsset.caption;

        this.querySelectorAll('.media-indicator').forEach((indicator, idx) => {
            if (idx === targetIndex) {
                indicator.classList.add('active-indicator');
            } else {
                indicator.classList.remove('active-indicator');
            }
        });

        config.currentMediaIndex = targetIndex;
        setTimeout(() => {
            config.isTransitioning = false;
            if (config.autoAdvance && !config.isPlaybackPaused) {
                this._startAutoAdvance();
            }
            if (config.onItemSwitched) {
                config.onItemSwitched.call(this, targetIndex, currentAsset);
            }
        }, 500);
    }

    _startAutoAdvance() {
        const config = this._instanceData.get('configuration');
        const mediaAssets = this._instanceData.get('mediaAssets');
        if (mediaAssets.length <= 1) return;

        const timer = setTimeout(() => {
            let nextIndex = config.currentMediaIndex + 1;
            if (nextIndex >= mediaAssets.length) {
                nextIndex = 0;
            }
            this._activateAsset(nextIndex);
        }, config.displayInterval);
        this._instanceData.set('advanceTimerHandle', timer);
    }

    _handleControlInteractionIn(event) {
        const config = this._instanceData.get('configuration');
        if (config.controlButtonHoverIn) {
            config.controlButtonHoverIn.call(event.currentTarget);
        }
    }

    _handleControlInteractionOut(event) {
        const config = this._instanceData.get('configuration');
        if (config.controlButtonHoverOut) {
            config.controlButtonHoverOut.call(event.currentTarget);
        }
    }

    _refreshDisplay(index) {
        const config = this._instanceData.get('configuration');
        const mediaAssets = this._instanceData.get('mediaAssets');
        const cache = this._instanceData.get('elementCache');

        if (mediaAssets.length === 0) return;

        const currentAsset = mediaAssets[index];
        cache.mainMediaElement.setAttribute('src', currentAsset.source);
        cache.mediaLink.setAttribute('href', currentAsset.destination);
        cache.mediaLink.setAttribute('target', currentAsset.target);
        cache.captionPanel.innerHTML = currentAsset.caption;

        this.querySelectorAll('.media-indicator').forEach((indicator, idx) => {
            if (idx === index) {
                indicator.classList.add('active-indicator');
            } else {
                indicator.classList.remove('active-indicator');
            }
        });

        if (config.showCaption && currentAsset.caption) {
            cache.captionPanel.style.display = '';
        }
        if (config.showIndicators) {
            cache.statusPanel.style.display = '';
            this._positionIndicators();
        }
        if (config.showNavControls && mediaAssets.length > 1) {
            cache.prevControl.style.display = '';
            cache.nextControl.style.display = '';
        }

        config.currentMediaIndex = index;

        if (config.autoAdvance && !config.isPlaybackPaused) {
            this._startAutoAdvance();
        }
    }

    _positionIndicators() {
        const cache = this._instanceData.get('elementCache');
        const config = this._instanceData.get('configuration');
        const indicatorPanel = cache.statusPanel;

        indicatorPanel.style.position = 'relative';
        indicatorPanel.style.left = '';
        indicatorPanel.style.right = '';
        indicatorPanel.style.margin = '';

        switch (config.indicatorAlignment) {
            case 'center':
                indicatorPanel.style.left = '50%';
                indicatorPanel.style.transform = 'translateX(-50%)';
                break;
            case 'right':
                indicatorPanel.style.right = '15px';
                indicatorPanel.style.left = 'auto';
                indicatorPanel.style.transform = 'none';
                break;
            case 'left':
                indicatorPanel.style.left = '15px';
                indicatorPanel.style.right = 'auto';
                indicatorPanel.style.transform = 'none';
                break;
        }
    }
}

customElements.define('interactive-display', InteractiveDisplay);