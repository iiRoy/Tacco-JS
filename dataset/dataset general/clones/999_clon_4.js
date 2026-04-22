(function (globalWindow, documentRef) {
    "use strict";

    // --- Core Utility Functions ---

    const checkTextual = (potentialText) => typeof potentialText === "string";

    const checkPercentual = (potentialText) => checkTextual(potentialText) && potentialText.endsWith('%');

    const checkScrollableElement = (targetElement) => {
        return (
            targetElement &&
            !(targetElement.style.overflow && targetElement.style.overflow === 'hidden') &&
            ((targetElement.clientWidth && targetElement.scrollWidth > targetElement.clientWidth) ||
             (targetElement.clientHeight && targetElement.scrollHeight > targetElement.clientHeight))
        );
    };

    const calculateDimensionValue = (initialValue, dimensionType) => {
        let numericalResult = parseInt(initialValue, 10) || 0;

        if (dimensionType && checkPercentual(initialValue)) {
            // Using window dimensions as a substitute for a custom viewport function
            const viewportDimensions = {
                width: globalWindow.innerWidth,
                height: globalWindow.innerHeight
            };
            numericalResult = viewportDimensions[dimensionType] / 100 * numericalResult;
        }

        return Math.ceil(numericalResult);
    };

    const formatDimensionPixels = (rawMeasurement, dimensionType) => {
        return calculateDimensionValue(rawMeasurement, dimensionType) + 'px';
    };

    const isPlainObject = (candidate) => {
        return typeof candidate === 'object' && candidate !== null && candidate.constructor === Object;
    };

    const isAnArray = (candidate) => Array.isArray(candidate);

    const deepMergeConfiguration = (mainTarget, ...inputSources) => {
        if (!mainTarget || typeof mainTarget !== 'object') {
            mainTarget = {};
        }
        for (const sourceObject of inputSources) {
            if (sourceObject && typeof sourceObject === 'object') {
                for (const key in sourceObject) {
                    if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
                        if (isPlainObject(sourceObject[key])) {
                            if (!isPlainObject(mainTarget[key])) {
                                mainTarget[key] = {};
                            }
                            deepMergeConfiguration(mainTarget[key], sourceObject[key]);
                        } else if (isAnArray(sourceObject[key])) {
                            mainTarget[key] = [...sourceObject[key]];
                        } else {
                            mainTarget[key] = sourceObject[key];
                        }
                    }
                }
            }
        }
        return mainTarget;
    };

    // A simple event system for internal callbacks
    class CustomEventHandler {
        constructor() {
            this.registeredCallbacks = {};
        }

        subscribe(eventName, callbackFunction) {
            if (!this.registeredCallbacks[eventName]) {
                this.registeredCallbacks[eventName] = [];
            }
            this.registeredCallbacks[eventName].push(callbackFunction);
        }

        unsubscribe(eventName, callbackFunction) {
            if (this.registeredCallbacks[eventName]) {
                this.registeredCallbacks[eventName] = this.registeredCallbacks[eventName].filter(cb => cb !== callbackFunction);
            }
        }

        publish(eventName, ...args) {
            if (this.registeredCallbacks[eventName]) {
                let preventAction = false;
                for (const callback of this.registeredCallbacks[eventName]) {
                    if (callback(...args) === false) {
                        preventAction = true;
                    }
                }
                return !preventAction;
            }
            return true;
        }
    }

    // Basic browser detection for legacy compatibility (mimicking original)
    const isLegacyBrowser = globalWindow.navigator.userAgent.match(/msie/i);

    // --- Primary Content Display Manager Class ---

    class ContentDisplayManager {
        constructor() {
            this.eventBus = new CustomEventHandler();
            this.standardSettings = {
                contentPadding: 15,
                contentMargin: 20,

                baseWidth: 800,
                baseHeight: 600,
                minimumWidth: 100,
                minimumHeight: 100,
                maximumWidth: 9999,
                maximumHeight: 9999,
                pixelDensityFactor: 1,

                autoSizeContent: true,
                autoHeightContent: false,
                autoWidthContent: false,

                responsiveResize: true,
                centerAutomatically: !('ontouchstart' in documentRef.documentElement),
                fitToViewport: true,
                maintainAspectRatio: false,
verticalAlignmentRatio: 0.5,
                horizontalAlignmentRatio: 0.5,

                scrollBehavior: 'auto',
                containerStyleClass: '',

                navigationArrows: true,
                closeButton: true,
                clickToClose: false,
                nextItemClick: false,
                mouseWheelNavigation: true,
                autoAdvance: false,
                advanceInterval: 3000,
                preloadCount: 3,
                modalBlock: false,
                loopContent: true,

                ajaxConfiguration: {
                    requestType: 'html',
                    headers: { 'X-ContentDisplay': true }
                },
                iframeConfiguration: {
                    scrollBehavior: 'auto',
                    preloadIframe: true
                },
                flashConfiguration: {
                    windowMode: 'transparent',
                    allowFullscreen: 'true',
                    allowScriptAccess: 'always'
                },

                keyMappings: {
                    nextItem: {
                        13: 'left',
                        34: 'up',
                        39: 'left',
                        40: 'up'
                    },
                    prevItem: {
                        8: 'right',
                        33: 'down',
                        37: 'right',
                        38: 'down'
                    },
                    closeDisplay: [27],
                    togglePlayback: [32],
                    toggleFullscreen: [70]
                },

                itemDirection: {
                    next: 'left',
                    prev: 'right'
                },

                allowScrollOutside: true,

                startingIndex: 0,
                contentType: null,
                contentSource: null,
                contentBody: null,
                contentTitle: null,

                templateLiterals: {
                    mainWrapper: '<div class="content-portal-wrapper" tabIndex="-1"><div class="content-portal-skin"><div class="content-portal-outer"><div class="content-portal-inner"></div></div></div></div>',
                    imageDisplay: '<img class="content-portal-image" src="{source}" alt="" />',
                    iframeDisplay: '<iframe id="content-portal-frame{random}" name="content-portal-frame{random}" class="content-portal-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (isLegacyBrowser ? ' allowtransparency="true"' : '') + '></iframe>',
                    errorMessage: '<p class="content-portal-error">The requested material cannot be loaded.<br/>Please try again later.</p>',
                    closeButtonHtml: '<a title="Close" class="content-portal-control content-portal-close" href="javascript:;"></a>',
                    nextButton: '<a title="Next" class="content-portal-control content-portal-next" href="javascript:;"><span></span></a>',
                    prevButton: '<a title="Previous" class="content-portal-control content-portal-prev" href="javascript:;"><span></span></a>',
                    loadingIndicator: '<div id="content-portal-loading"><div></div></div>'
                },

                // Animation properties
                openEffect: 'fade',
                openDuration: 250,
                openTransition: 'swing',
                openWithOpacity: true,
                openMethod: 'zoomIn',

                closeEffect: 'fade',
                closeDuration: 250,
                closeTransition: 'swing',
                closeWithOpacity: true,
                closeMethod: 'zoomOut',

                nextEffect: 'elastic',
                nextDuration: 250,
                nextTransition: 'swing',
                nextMethod: 'changeIn',

                prevEffect: 'elastic',
                prevDuration: 250,
                prevTransition: 'swing',
                prevMethod: 'changeOut',

                // Helper modules
                assistantModules: {
                    overlay: true,
                    titleBar: true
                },

                // Callbacks
                onDisplayCancel: () => {},
                onBeforeMaterialLoad: () => {},
                onAfterMaterialLoad: () => {},
                onBeforeDisplayShow: () => {},
                onAfterDisplayShow: () => {},
                onBeforeMaterialChange: () => {},
                onBeforeDisplayClose: () => {},
                onAfterDisplayClose: () => {}
            };

            this.materialCollection = [];
            this.sessionOptions = {};
            this.previousItem = null;
            this.pendingItem = null;
            this.activeItem = null;
            this.isDisplayActive = false;
            this.isDisplayOpen = false;
            this.hasBeenFullyOpened = false;
            this.closureInitiated = false;

            this.mainContainer = null;
            this.skinElement = null;
            this.outerElement = null;
            this.innerElement = null;

            this.playbackControl = {
                timerId: null,
                isPlaybackActive: false
            };

            this.ajaxRequestHandle = null;
            this.imagePreloadHandle = null;

            // Placeholder for animation transition logic
            this.animationTransitions = {
                zoomIn: () => this._finalizeDisplayShow(),
                zoomOut: () => this._finalizeDisplayClose(null),
                changeIn: () => this._finalizeMaterialChange(),
                changeOut: () => this._finalizeMaterialChange(),
                fade: () => this._finalizeDisplayShow(), // Simplified
                elastic: () => this._finalizeDisplayShow() // Simplified
            };
        }

        // --- Public Interface Methods ---

        showContent(contentGroup, presentationOptions) {
            if (!contentGroup) {
                return;
            }

            if (!isPlainObject(presentationOptions)) {
                presentationOptions = {};
            }

            if (this.dismissContent(true) === false) {
                return;
            }

            if (!isAnArray(contentGroup)) {
                contentGroup = (contentGroup instanceof Element) ? [contentGroup] : [contentGroup];
            }

            this.materialCollection = contentGroup.map((item, index) => {
                let itemData = {};
                let sourceUri, itemLabel, itemContentBody, inferredType, urlSegments, contentSelector;

                if (typeof item === "object" && item !== null) {
                    if (item instanceof Element) {
                        itemData = {
                            contentSource: item.dataset.displaySource || item.getAttribute('href'),
                            contentTitle: item.dataset.displayTitle || item.getAttribute('title') || '',
                            isDOMElement: true,
                            originalElement: item
                        };
                    } else {
                        itemData = { ...item };
                    }
                }

                sourceUri = presentationOptions.contentSource || itemData.contentSource || (checkTextual(item) ? item : null);
                itemLabel = presentationOptions.contentTitle !== undefined ? presentationOptions.contentTitle : itemData.contentTitle || '';

                itemContentBody = presentationOptions.contentBody || itemData.contentBody;
                inferredType = itemContentBody ? 'html' : (presentationOptions.contentType || itemData.contentType);

                if (!inferredType && itemData.isDOMElement) {
                    inferredType = itemData.originalElement.dataset.displayType;
                    if (!inferredType) {
                        const classPatternMatch = itemData.originalElement.className.match(/content-portal\.(\w+)/);
                        inferredType = classPatternMatch ? classPatternMatch[1] : null;
                    }
                }

                if (checkTextual(sourceUri)) {
                    if (!inferredType) {
                        if (sourceUri.match(/\.(jpe?g|gif|png|bmp|webp)(\?.*)?$/i)) {
                            inferredType = 'image';
                        } else if (sourceUri.match(/\.(swf)(\?.*)?$/i)) {
                            inferredType = 'flash';
                        } else if (sourceUri.charAt(0) === '#') {
                            inferredType = 'inline';
                        } else if (checkTextual(item)) {
                            inferredType = 'html';
                            itemContentBody = item;
                        }
                    }

                    if (inferredType === 'ajax') {
                        urlSegments = sourceUri.split(/\s+/, 2);
                        sourceUri = urlSegments.shift();
                        contentSelector = urlSegments.shift();
                    }
                }

                if (!itemContentBody) {
                    if (inferredType === 'inline') {
                        if (sourceUri) {
                            itemContentBody = documentRef.querySelector(checkTextual(sourceUri) ? sourceUri.replace(/.*(?=#[^\s]+$)/, '') : sourceUri);
                        } else if (itemData.isDOMElement) {
                            itemContentBody = itemData.originalElement;
                        }
                    } else if (inferredType === 'html') {
                        itemContentBody = sourceUri;
                    } else if (!inferredType && !sourceUri && itemData.isDOMElement) {
                        inferredType = 'inline';
                        itemContentBody = itemData.originalElement;
                    }
                }

                return {
                    contentSource: sourceUri,
                    contentType: inferredType,
                    contentBody: itemContentBody,
                    contentTitle: itemLabel,
                    contentSelector: contentSelector
                };
            });

            this.sessionOptions = deepMergeConfiguration({}, this.standardSettings, presentationOptions);

            if (presentationOptions.keyMappings !== undefined) {
                this.sessionOptions.keyMappings = presentationOptions.keyMappings ? deepMergeConfiguration({}, this.standardSettings.keyMappings, presentationOptions.keyMappings) : false;
            }

            return this._initiateDisplay(this.sessionOptions.startingIndex);
        }

        abortOperation() {
            if (this.eventBus.publish('onDisplayCancel') === false) {
                return;
            }

            this._hideLoadingIndicator();

            if (!this.pendingItem) {
                return;
            }

            if (this.ajaxRequestHandle) {
                this.ajaxRequestHandle.abort();
            }
            this.ajaxRequestHandle = null;

            if (this.imagePreloadHandle) {
                this.imagePreloadHandle.onload = this.imagePreloadHandle.onerror = null;
            }

            if (this.pendingItem.wrapperElement) {
                this.pendingItem.wrapperElement.style.transition = 'none';
                this.eventBus.publish('onReset', this.pendingItem.wrapperElement);
                this.pendingItem.wrapperElement.remove();
            }

            this.pendingItem = null;

            if (!this.activeItem) {
                this._finalizeDisplayClose(null);
            }
        }

        dismissContent(forceImmediate = false) {
            this.abortOperation();

            if (this.eventBus.publish('onBeforeDisplayClose') === false) {
                return false;
            }

            this._deregisterGlobalEvents();

            if (!this.isDisplayActive) {
                return;
            }

            if (!this.isDisplayOpen || forceImmediate === true) {
                const existingWrappers = documentRef.querySelectorAll('.content-portal-wrapper');
                existingWrappers.forEach(wrap => {
                    wrap.style.transition = 'none';
                    this.eventBus.publish('onReset', wrap);
                    wrap.remove();
                });

                this._finalizeDisplayClose(null);
            } else {
                this.isDisplayOpen = false;
                this.hasBeenFullyOpened = false;
                this.closureInitiated = true;

                const dynamicItems = documentRef.querySelectorAll('.content-portal-control, .content-portal-item');
                dynamicItems.forEach(item => item.remove());

                if (this.mainContainer) {
                    this.mainContainer.style.transition = 'none';
                    this.mainContainer.classList.remove('content-portal-opened');
                }

                const closeAnimationMethod = this.sessionOptions.closeMethod;
                if (this.animationTransitions[closeAnimationMethod]) {
                    this.animationTransitions[closeAnimationMethod]();
                } else {
                    this._finalizeDisplayClose(null);
                }
            }
            return true;
        }

        controlSequence(actionState) {
            const clearSequence = () => {
                clearTimeout(this.playbackControl.timerId);
            };

            const setSequence = () => {
                clearSequence();
                if (this.activeItem && this.playbackControl.isPlaybackActive) {
                    this.playbackControl.timerId = setTimeout(() => this.moveForward(), this.activeItem.advanceInterval || this.sessionOptions.advanceInterval);
                }
            };

            const stopSequence = () => {
                clearSequence();
                documentRef.removeEventListener('cancelDisplay.playback', stopSequence);
                documentRef.removeEventListener('beforeDisplayClose.playback', stopSequence);
                documentRef.removeEventListener('updateDisplay.playback', setSequence);
                documentRef.removeEventListener('beforeMaterialLoad.playback', clearSequence);
                this.playbackControl.isPlaybackActive = false;
                this.eventBus.publish('onPlaybackEnd');
            };

            const startSequence = () => {
                if (this.activeItem && (this.activeItem.loopContent || this.activeItem.index < this.materialCollection.length - 1)) {
                    this.playbackControl.isPlaybackActive = true;
                    documentRef.addEventListener('cancelDisplay.playback', stopSequence);
                    documentRef.addEventListener('beforeDisplayClose.playback', stopSequence);
                    documentRef.addEventListener('updateDisplay.playback', setSequence);
                    documentRef.addEventListener('beforeMaterialLoad.playback', clearSequence);
                    setSequence();
                    this.eventBus.publish('onPlaybackStart');
                }
            };

            if (actionState === true || (!this.playbackControl.isPlaybackActive && actionState !== false)) {
                startSequence();
            } else {
                stopSequence();
            }
        }

        moveForward(directionHint) {
            const currentDisplayItem = this.activeItem;
            if (currentDisplayItem) {
                if (!checkTextual(directionHint)) {
                    directionHint = currentDisplayItem.itemDirection.next || this.sessionOptions.itemDirection.next;
                }
                this._navigateToItem(currentDisplayItem.index + 1, directionHint, 'next');
            }
        }

        moveBackward(directionHint) {
            const currentDisplayItem = this.activeItem;
            if (currentDisplayItem) {
                if (!checkTextual(directionHint)) {
                    directionHint = currentDisplayItem.itemDirection.prev || this.sessionOptions.itemDirection.prev;
                }
                this._navigateToItem(currentDisplayItem.index - 1, directionHint, 'prev');
            }
        }

        // --- Internal Management Methods ---

        _initiateDisplay(startingPosition) {
            this.pendingItem = this.materialCollection[startingPosition];
            if (!this.pendingItem) return false;

            this.pendingItem = deepMergeConfiguration({}, this.sessionOptions, this.pendingItem);
            this.pendingItem.index = startingPosition;

            if (this.eventBus.publish('beforeLoad', this.pendingItem) === false) {
                return false;
            }
            this._showLoadingIndicator();
            this._loadContent(this.pendingItem);
            return true;
        }

        _loadContent(item) {
            setTimeout(() => {
                this.eventBus.publish('onAfterMaterialLoad', item);
                this._constructDisplay(item);
            }, 100);
        }

        _constructDisplay(item) {
            this.mainContainer = documentRef.createElement('div');
            this.mainContainer.className = 'content-portal-wrapper';
            this.mainContainer.innerHTML = this.sessionOptions.templateLiterals.mainWrapper;
            documentRef.body.appendChild(this.mainContainer);

            this.innerElement = this.mainContainer.querySelector('.content-portal-inner');
            if (item.contentBody) {
                if (item.contentBody instanceof Element) {
                    this.innerElement.appendChild(item.contentBody);
                } else if (checkTextual(item.contentBody)) {
                    this.innerElement.innerHTML = item.contentBody;
                }
            } else if (item.contentSource) {
                if (item.contentType === 'image') {
                    const img = documentRef.createElement('img');
                    img.className = 'content-portal-image';
                    img.src = item.contentSource;
                    this.innerElement.appendChild(img);
                } else if (item.contentType === 'iframe') {
                    const iframe = documentRef.createElement('iframe');
                    iframe.src = item.contentSource;
                    iframe.id = `content-portal-frame${Math.floor(Math.random() * 100000)}`;
                    this.innerElement.appendChild(iframe);
                }
            }

            item.wrapperElement = this.mainContainer;
            this._hideLoadingIndicator();
            this._displayActiveContent(item);
        }

        _displayActiveContent(item) {
            if (this.eventBus.publish('onBeforeDisplayShow', item) === false) {
                return;
            }

            this.isDisplayActive = true;
            this.activeItem = item;
            this.mainContainer.classList.add('content-portal-opened');

            const openAnimationMethod = this.sessionOptions.openMethod;
            if (this.animationTransitions[openAnimationMethod]) {
                this.animationTransitions[openAnimationMethod]();
            } else {
                this._finalizeDisplayShow();
            }
        }

        _finalizeDisplayShow() {
            this.isDisplayOpen = true;
            this.hasBeenFullyOpened = true;
            this.pendingItem = null;
            this.eventBus.publish('onAfterDisplayShow', this.activeItem);
            this._registerGlobalEvents();
        }

        _finalizeDisplayClose(item) {
            this.activeItem = null;
            this.isDisplayActive = false;
            this.isDisplayOpen = false;
            this.hasBeenFullyOpened = false;
            this.closureInitiated = false;
            if (this.mainContainer) {
                this.mainContainer.remove();
                this.mainContainer = null;
            }
            this.eventBus.publish('onAfterDisplayClose');
        }

        _finalizeMaterialChange() {
            // Placeholder for post-transition actions
        }

        _hideLoadingIndicator() {
            const loadingElement = documentRef.getElementById('content-portal-loading');
            if (loadingElement) loadingElement.remove();
        }

        _showLoadingIndicator() {
            const loadingTemplate = this.sessionOptions.templateLiterals.loadingIndicator;
            const tempDiv = documentRef.createElement('div');
            tempDiv.innerHTML = loadingTemplate;
            documentRef.body.appendChild(tempDiv.firstElementChild);
        }

        _navigateToItem(targetIndex, direction, type) {
            if (this.eventBus.publish('onBeforeMaterialChange', this.activeItem, targetIndex) === false) {
                return;
            }

            let finalIndex = targetIndex;
            if (this.activeItem.loopContent) {
                if (finalIndex < 0) {
                    finalIndex = this.materialCollection.length - 1;
                } else if (finalIndex >= this.materialCollection.length) {
                    finalIndex = 0;
                }
            } else {
                if (finalIndex < 0 || finalIndex >= this.materialCollection.length) {
                    return;
                }
            }

            this.previousItem = this.activeItem;
            this.pendingItem = this.materialCollection[finalIndex];
            this.pendingItem.index = finalIndex;

            this.pendingItem = deepMergeConfiguration({}, this.sessionOptions, this.pendingItem);

            this._loadContent(this.pendingItem);
        }

        _registerGlobalEvents() {
            documentRef.addEventListener('keydown', this._handleKeyboardInput.bind(this));
            globalWindow.addEventListener('resize', this._handleWindowResize.bind(this));
        }

        _deregisterGlobalEvents() {
            documentRef.removeEventListener('keydown', this._handleKeyboardInput.bind(this));
            globalWindow.removeEventListener('resize', this._handleWindowResize.bind(this));
        }

        _handleKeyboardInput(event) {
            const keySettings = this.sessionOptions.keyMappings;
            if (!keySettings) return;

            const inputKeyCode = event.keyCode;

            if (keySettings.closeDisplay && keySettings.closeDisplay.includes(inputKeyCode)) {
                event.preventDefault();
                this.dismissContent();
            }
            if (keySettings.nextItem) {
                for (const key in keySettings.nextItem) {
                    if (parseInt(key, 10) === inputKeyCode) {
                        event.preventDefault();
                        this.moveForward(keySettings.nextItem[key]);
                        return;
                    }
                }
            }
            if (keySettings.prevItem) {
                for (const key in keySettings.prevItem) {
                    if (parseInt(key, 10) === inputKeyCode) {
                        event.preventDefault();
                        this.moveBackward(keySettings.prevItem[key]);
                        return;
                    }
                }
            }
            if (keySettings.togglePlayback && keySettings.togglePlayback.includes(inputKeyCode)) {
                event.preventDefault();
                this.controlSequence();
            }
            if (keySettings.toggleFullscreen && keySettings.toggleFullscreen.includes(inputKeyCode)) {
                event.preventDefault();
            }
        }

        _handleWindowResize() {
            if (this.isDisplayActive && this.sessionOptions.responsiveResize) {
                this.eventBus.publish('updateDisplay');
            }
        }
    }

    // --- Global Access Point (Singleton-like behavior) ---

    let currentPortalInstance = null;

    const establishContentPortal = function () {
        if (!currentPortalInstance) {
            currentPortalInstance = new ContentDisplayManager();
        }
        return currentPortalInstance.showContent.apply(currentPortalInstance, arguments);
    };

    // Expose public methods
    establishContentPortal.showContent = function () {
        if (!currentPortalInstance) {
            currentPortalInstance = new ContentDisplayManager();
        }
        return currentPortalInstance.showContent.apply(currentPortalInstance, arguments);
    };

    establishContentPortal.abortOperation = function () {
        if (!currentPortalInstance) return;
        return currentPortalInstance.abortOperation.apply(currentPortalInstance, arguments);
    };

    establishContentPortal.dismissContent = function () {
        if (!currentPortalInstance) return;
        return currentPortalInstance.dismissContent.apply(currentPortalInstance, arguments);
    };

    establishContentPortal.controlSequence = function () {
        if (!currentPortalInstance) return;
        return currentPortalInstance.controlSequence.apply(currentPortalInstance, arguments);
    };

    establishContentPortal.moveForward = function () {
        if (!currentPortalInstance) return;
        return currentPortalInstance.moveForward.apply(currentPortalInstance, arguments);
    };

    establishContentPortal.moveBackward = function () {
        if (!currentPortalInstance) return;
        return currentPortalInstance.moveBackward.apply(currentPortalInstance, arguments);
    };

    // Expose version and event system
    Object.defineProperty(establishContentPortal, 'currentVersion', {
        get: () => currentPortalInstance ? currentPortalInstance.standardSettings.version : '2.1.5-vanilla'
    });

    establishContentPortal.on = function(eventName, callback) {
        if (!currentPortalInstance) {
            currentPortalInstance = new ContentDisplayManager();
        }
        currentPortalInstance.eventBus.subscribe(eventName, callback);
    };
    establishContentPortal.off = function(eventName, callback) {
        if (!currentPortalInstance) return;
        currentPortalInstance.eventBus.unsubscribe(eventName, callback);
    };
    establishContentPortal.trigger = function(eventName, ...args) {
        if (!currentPortalInstance) return;
        return currentPortalInstance.eventBus.publish(eventName, ...args);
    };

    // Make it globally accessible
    globalWindow.establishContentPortal = establishContentPortal;

})(window, document);