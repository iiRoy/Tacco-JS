class GridComposer {
    static instanceRecord = '__gridComposerInstance__';

    static defaultSettings = {
        tileSelector: '.tile-unit',
        enableTransitions: true,
        observeWindowResize: true,
        eventTriggers: null, // Custom events to listen for
        transitionDuration: 300, // in milliseconds
        transitionEasing: 'ease-out',
        transitionStagger: 0, // in milliseconds
        horizontalSpacing: 0,
        verticalSpacing: 0,
        baseTileWidth: null, // If null, uses first element's width or container width
        persistCallback: false,
        layoutCompletionCallback: null,
        incomingItems: null, // Content to append
        visualAssetSelector: 'img',
        // Internal flags and state, not directly configured by user
        _isActivated: false,
        _isTransitioning: false,
        _resizeHandle: null,
        _styleUpdateQueue: [],
        _layoutFrontier: [], // Replaces original's currentPos
        _containerDimensionX: 0,
        _currentTransitionDelay: 0,
        _activeTransitionCount: 0,
        _currentContainerDimensionY: 0,
        _effectiveTileDimensionX: 0,
        _hostElement: null,
        _viewportYStart: 0,
        _viewportYEnd: 0,
        _hasTransitionSupport: false,
        _transformProp: '',
        _transitionProp: ''
    };

    constructor(targetElement, initialConfiguration = {}) {
        if (!targetElement || !(targetElement instanceof HTMLElement)) {
            throw new Error('GridComposer: Target element must be a valid DOM element.');
        }

        if (targetElement[GridComposer.instanceRecord]) {
            return targetElement[GridComposer.instanceRecord];
        }
        targetElement[GridComposer.instanceRecord] = this;

        this._hostElement = targetElement;
        this._config = Object.assign({}, GridComposer.defaultSettings);
        Object.assign(this._config, initialConfiguration);

        this._initializeAnimationProperties();
        this._throttledLayoutUpdate = this._createThrottler(this._processLayout.bind(this), 400);
        this._throttledExternalEvents = this._createThrottler(this._processLayout.bind(this), 400);

        if (!this._config._isActivated) {
            this.processLayout(initialConfiguration);
        }
    }

    // Public interface methods
    processLayout(additionalConfiguration = {}) {
        Object.assign(this._config, additionalConfiguration);
        this._config._hostElement = this._hostElement;

        const wasPreviouslyActivated = this._config._isActivated;
        this._config._isActivated = true;

        this._config._styleUpdateQueue = [];
        this._config._currentTransitionDelay = 0;
        this._config._activeTransitionCount = 0;

        this._config._isTransitioning = this._config.enableTransitions && wasPreviouslyActivated && !this._config.incomingItems;

        this._refreshViewportDimensions();
        this._determineHostDimensions();

        if (!wasPreviouslyActivated) {
            this._setupHostBindings();
        }

        const presentItems = this._gatherItems(this._hostElement, this._config.tileSelector);
        const newElements = this._ingestNewContent(this._config.incomingItems);
        let itemsForPositioning = presentItems;

        if (newElements && newElements.length > 0) {
            newElements.forEach(item => this._hostElement.appendChild(item));
            itemsForPositioning = [...presentItems, ...newElements];
            this._config.incomingItems = null;
        }

        if (itemsForPositioning.length === 0) {
            this._hostElement.style.height = '0px';
            this._executeLayoutCallback();
            return;
        }

        this._prepareItemsForArrangement(itemsForPositioning);

        this._loadAllVisualAssets(itemsForPositioning).then(() => {
            this._calculateItemPlacement(itemsForPositioning);
            this._applyQueuedStyleUpdates();
            this._adjustHostHeight();
            this._executeLayoutCallback();
        }).catch(err => {
            console.warn('GridComposer: Some visual assets failed to load, proceeding with layout:', err);
            this._calculateItemPlacement(itemsForPositioning);
            this._applyQueuedStyleUpdates();
            this._adjustHostHeight();
            this._executeLayoutCallback();
        });
    }

    addGridItems(newContentSource, additionalConfiguration = {}) {
        Object.assign(this._config, additionalConfiguration);
        this._config.incomingItems = newContentSource;
        this._config._hostElement = this._hostElement;

        if (this._config._isActivated && this._config.incomingItems) {
            this.processLayout(additionalConfiguration);
        }
    }

    dismantle() {
        this._removeHostBindings();
        const allItems = this._gatherItems(this._hostElement, this._config.tileSelector);
        allItems.forEach(item => {
            item.style.cssText = '';
        });
        this._hostElement.style.cssText = '';
        delete this._hostElement[GridComposer.instanceRecord];
        return true;
    }

    // Internal utility methods
    _initializeAnimationProperties() {
        const docStyle = document.documentElement.style;
        const transformNames = ['transform', 'webkitTransform', 'MozTransform', 'msTransform'];
        const transitionNames = ['transition', 'webkitTransition', 'MozTransition', 'msTransition'];

        for (const prop of transformNames) {
            if (prop in docStyle) {
                this._config._transformProp = prop;
                this._config._hasTransitionSupport = true;
                break;
            }
        }
        for (const prop of transitionNames) {
            if (prop in docStyle) {
                this._config._transitionProp = prop;
                break;
            }
        }

        if (this._config._hasTransitionSupport && this._config._transformProp && this._config._transitionProp) {
            const transitionValue = `${this._config._transformProp} ${this._config.transitionDuration}ms ${this._config.transitionEasing}`;
            this._config._transitionStyleValue = transitionValue;
        } else {
            this._config._hasTransitionSupport = false;
        }
    }

    _createThrottler(action, interval) {
        let timer;
        return function(...args) {
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(() => action.apply(context, args), interval);
        };
    }

    _refreshViewportDimensions() {
        this._config._viewportYStart = window.pageYOffset || document.documentElement.scrollTop;
        this._config._viewportYEnd = this._config._viewportYStart + window.innerHeight;
    }

    _determineHostDimensions() {
        this._config._containerDimensionX = this._hostElement.offsetWidth;
        if (!this._config.baseTileWidth) {
            const firstItem = this._gatherItems(this._hostElement, this._config.tileSelector)[0];
            this._config._effectiveTileDimensionX = firstItem ? firstItem.offsetWidth : this._config._containerDimensionX;
        } else {
            this._config._effectiveTileDimensionX = this._config.baseTileWidth;
        }
    }

    _gatherItems(parentContainer, itemQuery) {
        return Array.from(parentContainer.querySelectorAll(itemQuery));
    }

    _ingestNewContent(contentSource) {
        if (!contentSource) return null;

        let derivedElements = [];
        if (typeof contentSource === 'string') {
            const tempWrapper = document.createElement('div');
            tempWrapper.innerHTML = contentSource.trim();
            derivedElements = Array.from(tempWrapper.children);
        } else if (contentSource instanceof HTMLElement) {
            derivedElements = [contentSource];
        } else if (Array.isArray(contentSource) && contentSource.every(el => el instanceof HTMLElement)) {
            derivedElements = contentSource;
        } else if (contentSource instanceof NodeList || contentSource instanceof HTMLCollection) {
            derivedElements = Array.from(contentSource);
        }

        return derivedElements.filter(el => el.matches(this._config.tileSelector || '*'));
    }

    _prepareItemsForArrangement(items) {
        items.forEach(item => {
            if (item.style.display !== 'none') {
                item.style.display = 'block';
            }
            item.style.position = 'absolute';
        });
    }

    _loadAllVisualAssets(items) {
        const imageElements = items.flatMap(item => Array.from(item.querySelectorAll(this._config.visualAssetSelector)));
        const assetPromises = imageElements.map(img => {
            return new Promise((resolve, reject) => {
                if (img.complete && img.naturalHeight !== 0) {
                    resolve();
                } else {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error(`Asset load failed: ${img.src}`));
                }
            });
        });
        return Promise.all(assetPromises);
    }

    _calculateItemPlacement(items) {
        const { _containerDimensionX, horizontalSpacing, verticalSpacing, baseTileWidth } = this._config;

        let currentLayoutFrontier = this._hostElement[GridComposer.instanceRecord + '_layoutFrontier'] || [[0, 0]];

        // Pre-populate frontier for fixed columns if baseTileWidth is set and it's an initial layout
        if (baseTileWidth && currentLayoutFrontier.length === 1 && currentLayoutFrontier[0][0] === 0 && currentLayoutFrontier[0][1] === 0) {
            const calculatedColumnCount = Math.max(1, Math.floor(_containerDimensionX / (baseTileWidth + horizontalSpacing)));
            currentLayoutFrontier = [];
            for (let col = 0; col < calculatedColumnCount; col++) {
                currentLayoutFrontier.push([col * (baseTileWidth + horizontalSpacing), 0]);
            }
        }

        items.forEach((item) => {
            const itemDimensionX = item.offsetWidth;
            const itemDimensionY = item.offsetHeight;

            let topScore = -Infinity;
            let finalX = 0;
            let finalY = 0;
            let chosenFrontierStartIndex = 0;
            let chosenFrontierEndIndex = 0;

            for (let i = 0; i < currentLayoutFrontier.length; i++) {
                const candidateX = currentLayoutFrontier[i][0];
                if (candidateX + itemDimensionX > _containerDimensionX) {
                    continue;
                }

                let candidateY = currentLayoutFrontier[i][1];
                let j = i + 1;
                while (j < currentLayoutFrontier.length && (currentLayoutFrontier[j][0] - candidateX < itemDimensionX)) {
                    candidateY = Math.max(candidateY, currentLayoutFrontier[j][1]);
                    j++;
                }

                const currentPlacementTotalHeight = candidateY + itemDimensionY;
                const scoreForThisPlacement = -currentPlacementTotalHeight; // Maximize negative height to minimize height

                if (scoreForThisPlacement > topScore) {
                    topScore = scoreForThisPlacement;
                    finalX = candidateX;
                    finalY = candidateY;
                    chosenFrontierStartIndex = i;
                    chosenFrontierEndIndex = j;
                }
            }

            this._queueStyleUpdate(item, { x: finalX + horizontalSpacing, y: finalY + verticalSpacing });

            // Update layout frontier based on placement
            const itemRightEdge = currentLayoutFrontier[chosenFrontierStartIndex][0] + itemDimensionX;
            const itemBottomEdge = finalY + itemDimensionY;

            // Replicate original's splice logic
            currentLayoutFrontier[chosenFrontierStartIndex][1] = itemBottomEdge;

            const originalLastFrontierY = (chosenFrontierEndIndex > 0 && chosenFrontierEndIndex <= currentLayoutFrontier.length) ? currentLayoutFrontier[chosenFrontierEndIndex - 1][1] : itemBottomEdge;
            const originalLastFrontierX = (chosenFrontierEndIndex < currentLayoutFrontier.length) ? currentLayoutFrontier[chosenFrontierEndIndex][0] : _containerDimensionX;

            const spliceArguments = [chosenFrontierStartIndex + 1, chosenFrontierEndIndex - chosenFrontierStartIndex - 1];
            if (itemRightEdge < originalLastFrontierX) {
                spliceArguments.push([itemRightEdge, originalLastFrontierY]);
            }
            currentLayoutFrontier.splice(...spliceArguments);
        });

        this._hostElement[GridComposer.instanceRecord + '_layoutFrontier'] = currentLayoutFrontier;
        this._config._currentContainerDimensionY = Math.max(0, ...currentLayoutFrontier.map(p => p[1]));
    }

    _queueStyleUpdate(targetElement, newCoordinates) {
        const { _isTransitioning, _hasTransitionSupport, _transformProp, transitionStagger, _viewportYStart, _viewportYEnd } = this._config;

        const currentOffsetX = targetElement.offsetLeft;
        const currentOffsetY = targetElement.offsetTop;
        const elementHeight = targetElement.offsetHeight;

        const coordinatesChanged = currentOffsetX !== newCoordinates.x || currentOffsetY !== newCoordinates.y;

        let shouldTransition = false;
        if (_isTransitioning && _hasTransitionSupport && !targetElement.classList.contains('no-animation') && coordinatesChanged) {
            const currentGlobalY = targetElement.getBoundingClientRect().top + _viewportYStart;
            const newGlobalY = newCoordinates.y;

            if (
                (currentGlobalY + elementHeight > _viewportYStart && currentGlobalY < _viewportYEnd) ||
                (newGlobalY + elementHeight > _viewportYStart && newGlobalY < _viewportYEnd)
            ) {
                shouldTransition = true;
            }
        }

        const updateEntry = {
            element: targetElement,
            targetX: newCoordinates.x,
            targetY: newCoordinates.y,
            useTransition: shouldTransition,
            delay: shouldTransition ? this._config._currentTransitionDelay : 0
        };

        this._config._styleUpdateQueue.push(updateEntry);

        if (shouldTransition) {
            this._config._currentTransitionDelay += transitionStagger;
        }
    }

    _applyQueuedStyleUpdates() {
        const { _styleUpdateQueue, _transitionProp, _transitionStyleValue, transitionDuration, layoutCompletionCallback, _config } = this._config;
        this._config._activeTransitionCount = 0;

        if (_styleUpdateQueue.length === 0) {
            if (!this._config.persistCallback && typeof layoutCompletionCallback === 'function') {
                layoutCompletionCallback(this._config);
            }
            return;
        }

        _styleUpdateQueue.forEach(entry => {
            const { element, targetX, targetY, useTransition, delay } = entry;
            const transformCommand = `translate3d(${targetX}px, ${targetY}px, 0)`;

            if (useTransition) {
                this._config._activeTransitionCount++;

                const transitionComplete = () => {
                    element.removeEventListener('transitionend', transitionComplete);
                    element.style[_transitionProp] = '';
                    this._config._activeTransitionCount--;
                    if (this._config._activeTransitionCount === 0 && _config.persistCallback) {
                        if (typeof layoutCompletionCallback === 'function') {
                            layoutCompletionCallback(this._config);
                        }
                    }
                };

                element.addEventListener('transitionend', transitionComplete);

                element.style[_transitionProp] = _transitionStyleValue;
                if (delay > 0) {
                    element.style.transitionDelay = `${delay}ms`;
                } else {
                    element.style.transitionDelay = '';
                }

                // Force reflow to ensure transition property is applied before transform
                // eslint-disable-next-line no-unused-expressions
                element.offsetWidth;

                element.style[this._config._transformProp] = transformCommand;
            } else {
                element.style[this._config._transformProp] = transformCommand;
                element.style.transitionDelay = '';
                element.style[_transitionProp] = '';
            }
        });

        if (this._config._activeTransitionCount === 0 && !this._config.persistCallback) {
             if (typeof layoutCompletionCallback === 'function') {
                layoutCompletionCallback(this._config);
            }
        }
    }

    _adjustHostHeight() {
        const { _currentContainerDimensionY, _isTransitioning, _hasTransitionSupport, transitionDuration, _transformProp, _transitionProp } = this._config;
        const currentHostHeight = this._hostElement.offsetHeight;

        if (currentHostHeight !== _currentContainerDimensionY) {
            if (_isTransitioning && _hasTransitionSupport) {
                this._hostElement.style[_transitionProp] = `height ${transitionDuration}ms ${this._config.transitionEasing}`;
                this._hostElement.style.height = `${_currentContainerDimensionY}px`;
            } else {
                this._hostElement.style.height = `${_currentContainerDimensionY}px`;
            }
        }
    }

    _executeLayoutCallback() {
        const { layoutCompletionCallback, persistCallback, _activeTransitionCount } = this._config;
        if (_activeTransitionCount === 0 && typeof layoutCompletionCallback === 'function' && !persistCallback) {
            layoutCompletionCallback(this._config);
        }
    }

    _setupHostBindings() {
        if (this._config.observeWindowResize) {
            window.addEventListener('resize', this._throttledLayoutUpdate);
        }
        if (this._config.eventTriggers) {
            this._hostElement.addEventListener(this._config.eventTriggers, this._throttledExternalEvents);
        }
    }

    _removeHostBindings() {
        window.removeEventListener('resize', this._throttledLayoutUpdate);
        if (this._config.eventTriggers) {
            this._hostElement.removeEventListener(this._config.eventTriggers, this._throttledExternalEvents);
        }
    }
}