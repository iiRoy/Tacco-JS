const VisualCarouselEngine = (function() {

    function generateUniqueKey() {
        return 'carousel_' + (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
    }

    function createDomNode(tag) {
        return document.createElement(tag);
    }

    function fetchElementById(id) {
        return document.getElementById(id);
    }

    function appendNodeToParent(parent, child) {
        parent.appendChild(child);
    }

    function outputLogMessage(level, message) {
        if (window.console) {
            window.console[level](message);
        } else if (window.opera) {
            opera.postError(level + ': ' + message);
        } else {
            window.document.title = level + ': ' + message;
        }
    }

    const defaultSettings = {
        mediaArray: null,
        displayWidth: 128,
        displayHeight: 128,
        loadingTimeout: 3000,
        animationFrames: 20,
        cycleDelay: 5000,
        animationScript: '',
        disableIeFade: false
    };

    class CarouselInstance {
        constructor(hostElement, userSettings) {
            if (!hostElement || hostElement.tagName.toUpperCase() !== "DIV" || hostElement._carouselActive) {
                outputLogMessage('error', '[exit] VisualCarouselEngine.initiateCarousel(): Invalid host element or already active.');
                return null;
            }

            this.hostNode = hostElement;
            this.hostNode._carouselActive = true; 

            this.config = Object.assign({}, defaultSettings, userSettings);

            this.hostNodeKey = this.hostNode.id || generateUniqueKey();
            this.hostNode.id = this.hostNodeKey;

            this.processedMedia = [];
            this.currentDisplayIndex = 0;
            this.lastDisplayIndex = 0;
            this.animationHandle = null;
            this.preloadHandle = null;
            this.fadeHandle = null;

            this.browserInfo = this._detectBrowserCapabilities();

            this.config.displayWidth = Math.max(32, parseInt(this.config.displayWidth, 10));
            this.config.displayHeight = Math.max(32, parseInt(this.config.displayHeight, 10));
            this.config.loadingTimeout = Math.max(1000, parseInt(this.config.loadingTimeout, 10));
            this.config.animationFrames = Math.max(1, Math.min(100, parseInt(this.config.animationFrames, 10)));
            this.config.cycleDelay = Math.max(1000, parseInt(this.config.cycleDelay, 10)) +
                                    (this.browserInfo.isTrident && this.config.disableIeFade ? 0 : (this.config.animationFrames * 30));

            this.isPureImages = (this.config.animationScript === '');
            this.scriptModuleRef = null;

            if (!this.isPureImages) {
                if (window[this.config.animationScript] && typeof window[this.config.animationScript].add === 'function') {
                    this.scriptModuleRef = window[this.config.animationScript];
                } else {
                    outputLogMessage('error', '[exit] VisualCarouselEngine.initiateCarousel(): Unsupported animation script module.');
                    this.hostNode._carouselActive = false;
                    return null;
                }
            }

            if (Array.isArray(this.config.mediaArray) && this.config.mediaArray.length >= 1) {
                this.hostNode.innerHTML = '';
                this._processMediaSources(0, 0);
            } else {
                outputLogMessage('error', '[exit] VisualCarouselEngine.initiateCarousel(): Insufficient media sources.');
                this.hostNode._carouselActive = false;
                return null;
            }
            return this;
        }

        _detectBrowserCapabilities() {
            const isTrident = document.all && document.namespaces && !window.opera && (!document.documentMode || document.documentMode < 9);
            const hasCanvas = createDomNode('canvas').getContext ? true : false;
            return {
                isTrident: isTrident,
                noXMLHttpRequest: isTrident && !window.XMLHttpRequest,
                supportsCanvas: hasCanvas
            };
        }

        _processMediaSources(sourceIndex, loadedCount) {
            if (!this.hostNode._carouselActive) {
                outputLogMessage('warn', 'VisualCarouselEngine._processMediaSources(): Carousel not active.');
                return;
            }

            if (this.preloadHandle) {
                clearTimeout(this.preloadHandle);
            }

            if (sourceIndex < this.config.mediaArray.length) {
                this.preloadHandle = setTimeout(() => {
                    this._processMediaSources(sourceIndex + 1, loadedCount);
                }, this.config.loadingTimeout);

                const currentSource = this.config.mediaArray[sourceIndex];
                const tempImage = new Image();

                tempImage.onabort = tempImage.onerror = () => {
                    clearTimeout(this.preloadHandle);
                    this._processMediaSources(sourceIndex + 1, loadedCount);
                };

                tempImage.onload = () => {
                    if (tempImage.width >= 32 && tempImage.height >= 32) {
                        currentSource.isLoaded = true;
                        this.processedMedia.push(currentSource);

                        const imageElement = createDomNode('img');
                        imageElement.id = `${this.hostNodeKey}_${loadedCount}`;
                        imageElement.src = tempImage.src;
                        imageElement.style.position = 'absolute';
                        imageElement.style.display = 'block';
                        imageElement.style.visibility = 'hidden';
                        imageElement.width = this.config.displayWidth;
                        imageElement.height = this.config.displayHeight;
                        imageElement.style.width = `${this.config.displayWidth}px`;
                        imageElement.style.height = `${this.config.displayHeight}px`;
                        imageElement.style.left = '0px';
                        imageElement.style.top = '0px';
                        appendNodeToParent(this.hostNode, imageElement);

                        if (!this.isPureImages && this.scriptModuleRef) {
                            let optionsObject = null;
                            if (currentSource.options && typeof currentSource.options === 'string' && currentSource.options !== '') {
                                try {
                                    optionsObject = JSON.parse(currentSource.options);
                                } catch (e) {
                                    outputLogMessage('error', `Failed to parse options for external script: ${currentSource.options}`);
                                }
                            }
                            this.scriptModuleRef.add(imageElement, optionsObject);
                        }
                        loadedCount++;
                    }
                    clearTimeout(this.preloadHandle);
                    if (this.browserInfo.isTrident) {
                        tempImage.onload = null;
                    }
                    this._processMediaSources(sourceIndex + 1, loadedCount);
                };
                tempImage.src = currentSource.source;
            } else {
                this.currentDisplayIndex = 0;
                this.lastDisplayIndex = 0;
                if (this.processedMedia.length > 0) {
                    this.startAnimationCycle();
                } else {
                    outputLogMessage('error', 'VisualCarouselEngine._processMediaSources(): No valid images loaded.');
                    this.hostNode._carouselActive = false;
                }
            }
        }

        startAnimationCycle() {
            if (!this.hostNode._carouselActive || this.processedMedia.length === 0) {
                outputLogMessage('warn', 'VisualCarouselEngine.startAnimationCycle(): Carousel not active or no media.');
                return;
            }

            const currentElement = fetchElementById(`${this.hostNodeKey}_${this.currentDisplayIndex}`);
            if (currentElement) {
                currentElement.style.visibility = 'visible';
            }

            if (this.processedMedia.length > 1) {
                if (this.animationHandle) {
                    clearInterval(this.animationHandle);
                }
                this.animationHandle = setInterval(() => {
                    this.currentDisplayIndex = (this.currentDisplayIndex < (this.processedMedia.length - 1) ? this.currentDisplayIndex + 1 : 0);
                    this._performFadeTransition();
                }, this.config.cycleDelay);
            }
        }

        _performFadeTransition() {
            let currentOpacity = 0;
            let previousOpacity = 100;
            let frameCounter = 0;
            const totalFrames = this.config.animationFrames;
            const opacityStep = 100 / totalFrames;

            const incomingElement = fetchElementById(`${this.hostNodeKey}_${this.currentDisplayIndex}`);
            const outgoingElement = fetchElementById(`${this.hostNodeKey}_${this.lastDisplayIndex}`);

            if (!incomingElement || !outgoingElement) {
                outputLogMessage('error', 'VisualCarouselEngine._performFadeTransition(): Elements not found.');
                if (this.fadeHandle) {
                    clearInterval(this.fadeHandle);
                }
                return;
            }

            if (this.browserInfo.isTrident && this.config.disableIeFade) {
                outgoingElement.style.visibility = 'hidden';
                incomingElement.style.visibility = 'visible';
                this.lastDisplayIndex = this.currentDisplayIndex;
                return;
            }

            if (this.browserInfo.isTrident) {
                outgoingElement.style.filter = "alpha(opacity=100)";
                incomingElement.style.filter = "alpha(opacity=0)";
            } else {
                outgoingElement.style.opacity = 1;
                incomingElement.style.opacity = 0;
            }
            outgoingElement.style.visibility = 'visible';
            incomingElement.style.visibility = 'visible';

            if (this.fadeHandle) {
                clearInterval(this.fadeHandle);
            }

            this.fadeHandle = setInterval(() => {
                currentOpacity += opacityStep;
                previousOpacity -= opacityStep;
                frameCounter++;

                if (this.browserInfo.isTrident) {
                    incomingElement.style.filter = `alpha(opacity=${Math.round(currentOpacity)})`;
                    outgoingElement.style.filter = `alpha(opacity=${Math.round(previousOpacity)})`;
                } else {
                    incomingElement.style.opacity = currentOpacity / 100;
                    outgoingElement.style.opacity = previousOpacity / 100;
                }

                if (frameCounter >= totalFrames) {
                    clearInterval(this.fadeHandle);
                    if (this.browserInfo.isTrident) {
                        incomingElement.style.filter = "alpha(opacity=100)";
                        incomingElement.style.filter = "";
                        outgoingElement.style.filter = "alpha(opacity=0)";
                    } else {
                        incomingElement.style.opacity = 1;
                        outgoingElement.style.opacity = 0;
                    }
                    outgoingElement.style.visibility = 'hidden';
                    this.lastDisplayIndex = this.currentDisplayIndex;
                }
            }, 30);
        }

        haltAnimationCycle() {
            if (this.hostNode._carouselActive && this.animationHandle) {
                clearInterval(this.animationHandle);
                this.animationHandle = null;
            } else {
                outputLogMessage('warn', 'VisualCarouselEngine.haltAnimationCycle(): Carousel not active or no animation running.');
            }
        }

        clearCarousel() {
            if (this.hostNode._carouselActive) {
                this.haltAnimationCycle();
                if (this.preloadHandle) {
                    clearTimeout(this.preloadHandle);
                }
                if (this.fadeHandle) {
                    clearInterval(this.fadeHandle);
                }

                const childImages = this.hostNode.querySelectorAll(`img[id^="${this.hostNodeKey}_"]`);
                childImages.forEach(img => img.remove());

                if (!this.browserInfo.isTrident) {
                    const canvasElements = this.hostNode.getElementsByTagName('canvas');
                    Array.from(canvasElements).forEach(canvas => canvas.remove());
                }

                this.hostNode.innerHTML = '';
                this.hostNode._carouselActive = false;
                if (this.hostNode.id.startsWith('carousel_')) { // Only remove if we generated it
                    delete this.hostNode.id;
                }
                this.processedMedia = [];
                this.currentDisplayIndex = 0;
                this.lastDisplayIndex = 0;
                this.config.mediaArray = null;
                outputLogMessage('info', 'VisualCarouselEngine.clearCarousel(): Carousel dismantled.');
            } else {
                outputLogMessage('warn', 'VisualCarouselEngine.clearCarousel(): Carousel not active.');
            }
        }
    }

    return {
        defaultMediaSources: null,
        defaultViewWidth: 128,
        defaultViewHeight: 128,
        defaultLoadDuration: 3000,
        defaultSlideFrames: 20,
        defaultSlideInterval: 5000,
        defaultAnimationModule: '',
        defaultNoIeOpacity: false,

        initiateCarousel: function(hostElement, options) {
            const mergedOptions = Object.assign({}, {
                mediaArray: VisualCarouselEngine.defaultMediaSources,
                displayWidth: VisualCarouselEngine.defaultViewWidth,
                displayHeight: VisualCarouselEngine.defaultViewHeight,
                loadingTimeout: VisualCarouselEngine.defaultLoadDuration,
                animationFrames: VisualCarouselEngine.defaultSlideFrames,
                cycleDelay: VisualCarouselEngine.defaultSlideInterval,
                animationScript: VisualCarouselEngine.defaultAnimationModule,
                disableIeFade: VisualCarouselEngine.defaultNoIeOpacity
            }, options);
            
            return new CarouselInstance(hostElement, mergedOptions);
        },
        startAnimation: function(carouselInstance) {
            if (carouselInstance instanceof CarouselInstance) {
                carouselInstance.startAnimationCycle();
            } else {
                outputLogMessage('warn', 'VisualCarouselEngine.startAnimation(): Invalid carousel instance.');
            }
        },
        stopAnimation: function(carouselInstance) {
            if (carouselInstance instanceof CarouselInstance) {
                carouselInstance.haltAnimationCycle();
            } else {
                outputLogMessage('warn', 'VisualCarouselEngine.stopAnimation(): Invalid carousel instance.');
            }
        },
        disposeCarousel: function(carouselInstance) {
            if (carouselInstance instanceof CarouselInstance) {
                carouselInstance.clearCarousel();
            } else {
                outputLogMessage('warn', 'VisualCarouselEngine.disposeCarousel(): Invalid carousel instance.');
            }
        },
        engineVersion: 1.0,
        releaseDate: '2024-01-01 00:00:00'
    };
})();