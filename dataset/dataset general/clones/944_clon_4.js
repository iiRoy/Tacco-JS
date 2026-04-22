function createVisualLoader(visualElements, loaderSettings = {}) {
    return new ContentEnhancer(visualElements, loaderSettings);
}

class ContentEnhancer {
    #renderables;
    #config;
    #eventRegistry = new Map();
    #operationQueue = [];
    #queueProcessingActive = false;
    #viewportDimensions = { w: -1, h: -1 };
    #highDpiMode = false;
    #activeLoadOperations = 0;
    #elementStateMap = new WeakMap();

    constructor(targetElements, customConfig) {
        this.#renderables = Array.from(typeof targetElements === 'string' ? document.querySelectorAll(targetElements) : targetElements);
        this.#config = {
            sourceProp: 'data-source',
            highResProp: 'data-hires',
            defaultVisual: null,
            fillVisual: null,
            viewBuffer: 0,
            viewCheckAxis: 'both', // 'vertical', 'horizontal', 'both'
            revealEffect: 'fade', // 'none', 'fade'
            revealDuration: 400, // milliseconds
            clearSourceProp: true,
            onlyVisible: false,
            initialWaitTime: -1, // ms, -1 for no delay
            useThrottling: true,
            throttleCooldown: 250, // ms
            queueEnabled: true,
            queueDelay: 2, // ms, for setTimeout queue
            scrollSource: window, // Element or window
            onBeforeFetchContent: null,
            onContentFetching: null,
            onContentFetched: null,
            onContentFetchError: null,
            onAllContentFetched: null,
            fallbackViewWidth: 999,
            fallbackViewHeight: 999,
            initialActivationMode: 'auto', // 'immediate' or 'onload'
            combinedEventActivation: false, // If true, events are always bound regardless of initialWaitTime
            ...customConfig
        };

        this.#highDpiMode = window.devicePixelRatio > 1;

        // Apply default visuals and register early error handlers
        this.#renderables.forEach(item => {
            const itemTag = item.tagName.toLowerCase();

            if (itemTag === "img" && this.#config.defaultVisual && !item.getAttribute("src")) {
                item.setAttribute("src", this.#config.defaultVisual);
            } else if (itemTag !== "img" && this.#config.fillVisual && (!item.style.backgroundImage || item.style.backgroundImage === "none")) {
                item.style.backgroundImage = `url(${this.#config.fillVisual})`;
            }

            // Queue error handler registration
            if (typeof this.#config.onContentFetchError === 'function') {
                this.#addOperationToQueue(() => {
                    const errorCallback = () => this.#invokeListener(this.#config.onContentFetchError, item);
                    item.addEventListener('error', errorCallback);
                    this.#eventRegistry.set(item, errorCallback);
                }, item); // Pass item as context
            }
        });

        // Determine when to activate the core loading logic
        if (this.#config.initialActivationMode === 'immediate') {
            this.#activateCoreLogic();
        } else { // 'onload' or 'auto' (default)
            window.addEventListener('load', this.#activateCoreLogic.bind(this));
        }
    }

    #activateCoreLogic() {
        // If a delay is set, schedule a full content scan after that delay
        if (this.#config.initialWaitTime >= 0) {
            setTimeout(() => this.#scanForContent(true), this.#config.initialWaitTime);
        }

        // If no delay, or if combined event activation is enabled, perform an immediate scan and bind events
        if (this.#config.initialWaitTime < 0 || this.#config.combinedEventActivation) {
            this.#scanForContent(); // Initial scan

            const throttledScanAction = this.#createThrottledCallable(
                this.#config.throttleCooldown,
                (eventData, ignoreThrottling) => {
                    if (eventData.type === 'resize') {
                        this.#viewportDimensions.w = -1;
                        this.#viewportDimensions.h = -1;
                    }
                    this.#addOperationToQueue(() => this.#scanForContent(eventData.all), null, true);
                }
            );

            const eventContainer = this.#config.scrollSource === window ? window : document.querySelector(this.#config.scrollSource);
            if (eventContainer) {
                this.#eventRegistry.set('scroll', throttledScanAction);
                this.#eventRegistry.set('resize', throttledScanAction);
                eventContainer.addEventListener('scroll', throttledScanAction);
                window.addEventListener('resize', throttledScanAction); // Always listen to window resize
            }
        }
    }

    #createThrottledCallable(delayMs, targetFunction) {
        let executionTimer = null;
        let lastInvocationTime = 0;

        return (triggerEvent, bypassDelay) => {
            const currentTime = Date.now();
            const timeSinceLastCall = currentTime - lastInvocationTime;

            const performAction = () => {
                lastInvocationTime = currentTime;
                targetFunction.call(undefined, triggerEvent);
            };

            clearTimeout(executionTimer);

            if (timeSinceLastCall > delayMs || !this.#config.useThrottling || bypassDelay) {
                performAction();
            } else {
                executionTimer = setTimeout(() => {
                    performAction();
                }, delayMs - timeSinceLastCall);
            }
        };
    }

    #scanForContent(processAll = false) {
        if (!this.#renderables.length) {
            return this.disableLoader();
        }

        let contentWasIdentified = false;
        const nextRenderables = [];

        this.#renderables.forEach(item => {
            if (this.#elementStateMap.has(item)) { // Already processed
                nextRenderables.push(item);
                return;
            }

            if (this.#isItemInView(item) || processAll) {
                const sourceIdentifier = item.getAttribute(this.#config.sourceProp);
                const itemTag = item.tagName.toLowerCase();
                const currentSource = itemTag === 'img' ? item.getAttribute('src') : (item.style.backgroundImage || 'none').replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');

                if (sourceIdentifier && sourceIdentifier !== currentSource && (item.offsetParent !== null || !this.#config.onlyVisible)) {
                    contentWasIdentified = true;
                    this.#elementStateMap.set(item, true); // Mark as handled
                    this.#addOperationToQueue(() => this.#handleSingleItem(item, itemTag));
                } else {
                    nextRenderables.push(item);
                }
            } else {
                nextRenderables.push(item);
            }
        });

        this.#renderables = nextRenderables;

        if (contentWasIdentified) {
            this.#addOperationToQueue(() => {
                // The filtering logic is now integrated directly into the `forEach` loop above
                // by building `nextRenderables` with only unprocessed items.
            });
        }
    }

    #handleSingleItem(itemElement, itemTag) {
        const contentFetcher = new Image();
        this.#activeLoadOperations++;

        contentFetcher.onerror = () => {
            this.#invokeListener(this.#config.onContentFetchError, itemElement);
            this.#reduceActiveLoads();
        };

        let fetchInitiated = false;
        contentFetcher.onload = () => {
            const applyVisuals = () => {
                if (!fetchInitiated) return setTimeout(applyVisuals, 10);

                itemElement.style.opacity = '0';
                itemElement.style.transition = `opacity ${this.#config.revealDuration}ms ease-in-out`;
                itemElement.style.display = 'none';

                if (itemTag === 'img') {
                    itemElement.setAttribute('src', contentFetcher.src);
                } else {
                    itemElement.style.backgroundImage = `url(${contentFetcher.src})`;
                }

                if (this.#config.revealEffect === 'fade') {
                    itemElement.style.display = '';
                    requestAnimationFrame(() => {
                        itemElement.style.opacity = '1';
                    });
                } else {
                    itemElement.style.display = '';
                    itemElement.style.opacity = '1';
                }

                if (this.#config.clearSourceProp) {
                    itemElement.removeAttribute(this.#config.sourceProp);
                    itemElement.removeAttribute(this.#config.highResProp);
                }

                this.#invokeListener(this.#config.onContentFetched, itemElement);
                contentFetcher.onerror = null;
                contentFetcher.onload = null;
                this.#reduceActiveLoads();
            };
            applyVisuals();
        };

        this.#invokeListener(this.#config.onBeforeFetchContent, itemElement);

        const chosenSource = this.#highDpiMode && itemElement.hasAttribute(this.#config.highResProp)
            ? itemElement.getAttribute(this.#config.highResProp)
            : itemElement.getAttribute(this.#config.sourceProp);

        contentFetcher.src = chosenSource;

        this.#invokeListener(this.#config.onContentFetching, itemElement);
        fetchInitiated = true;

        if (contentFetcher.complete) { // Handle cached images
            contentFetcher.onload();
        }
    }

    #isItemInView(element) {
        const boundary = element.getBoundingClientRect();
        const buffer = this.#config.viewBuffer;

        const currentViewWidth = this.#getViewportDimension('w');
        const currentViewHeight = this.#getViewportDimension('h');

        const verticalOverlap = (currentViewHeight + buffer > boundary.top) && (-buffer < boundary.bottom);
        const horizontalOverlap = (currentViewWidth + buffer > boundary.left) && (-buffer < boundary.right);

        if (this.#config.viewCheckAxis === 'vertical') return verticalOverlap;
        if (this.#config.viewCheckAxis === 'horizontal') return horizontalOverlap;

        return verticalOverlap && horizontalOverlap;
    }

    #getViewportDimension(dimensionKey) {
        const key = dimensionKey === 'w' ? 'w' : 'h';
        const fallbackConfigKey = dimensionKey === 'w' ? 'fallbackViewWidth' : 'fallbackViewHeight';

        if (this.#viewportDimensions[key] >= 0) {
            return this.#viewportDimensions[key];
        }

        let calculatedValue;
        if (dimensionKey === 'w') {
            calculatedValue = window.innerWidth || document.documentElement.clientWidth || document.body.offsetWidth;
        } else {
            calculatedValue = window.innerHeight || document.documentElement.clientHeight || document.body.offsetHeight;
        }

        return this.#viewportDimensions[key] = calculatedValue || this.#config[fallbackConfigKey];
    }

    #reduceActiveLoads() {
        this.#activeLoadOperations--;
        if (!this.#renderables.length && this.#activeLoadOperations <= 0) {
            this.#invokeListener(this.#config.onAllContentFetched, null);
        }
    }

    #invokeListener(listenerFunction, targetElement) {
        if (typeof listenerFunction === 'function') {
            // Replicate original's behavior of queuing callbacks
            this.#addOperationToQueue(() => listenerFunction(targetElement), null, false);
        }
    }

    #addOperationToQueue(actionCallable, actionContext = null, isCriticalScan = false) {
        if (!this.#config.queueEnabled) {
            actionCallable.call(actionContext || window);
            return;
        }

        const criticalScanAlreadyQueued = this.#operationQueue.some(op => op.isCriticalScan);
        if (isCriticalScan && criticalScanAlreadyQueued) {
            return;
        }

        this.#operationQueue.push({ callable: actionCallable, context: actionContext, isCriticalScan: isCriticalScan });

        if (!this.#queueProcessingActive) {
            this.#scheduleNextQueueItem();
        }
    }

    #scheduleNextQueueItem() {
        if (this.#operationQueue.length === 0) {
            this.#queueProcessingActive = false;
            return;
        }

        this.#queueProcessingActive = true;
        setTimeout(() => {
            const operationToExecute = this.#operationQueue.shift();
            if (operationToExecute) {
                operationToExecute.callable.call(operationToExecute.context || window);
            }
            this.#scheduleNextQueueItem();
        }, this.#config.queueDelay);
    }

    disableLoader() {
        this.#eventRegistry.forEach((handler, key) => {
            if (typeof key === 'string') {
                const container = this.#config.scrollSource === window ? window : document.querySelector(this.#config.scrollSource);
                if (container) {
                    if (key === 'scroll') container.removeEventListener('scroll', handler);
                    if (key === 'resize') window.removeEventListener('resize', handler);
                }
            } else {
                key.removeEventListener('error', handler);
            }
        });
        this.#eventRegistry.clear();
        this.#renderables = [];
        this.#operationQueue = [];
        this.#queueProcessingActive = false;
        clearTimeout(this.#queueProcessingActive);
    }
}