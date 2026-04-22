const ViewPortImgLoader = (() => {
    const loaderConfig = { refreshDelay: 400, eagernessFactor: 3, processingBatchSize: 6 };
    const documentHandle = document;
    const windowHandle = window;

    let currentVisualElements = [];
    let scanLock = false;
    let scanScheduled = false;
    let scanCursor = 0;
    let batchCounter = 0;
    let cachedVisualHeight = 0;
    let cachedVisualWidth = 0;

    const getElementProperty = (targetElement, propertyName) => {
        return targetElement.getAttribute(propertyName);
    };

    const setElementProperty = (targetElement, propertyName, propertyValue) => {
        if (getElementProperty(targetElement, propertyName) !== propertyValue) {
            targetElement.setAttribute(propertyName, propertyValue);
            return true;
        }
        return false;
    };

    const gatherVisualElements = () => {
        currentVisualElements = Array.from(documentHandle.querySelectorAll('img[data-display-sources]'));
    };

    const registerEventHandler = (target, eventType, callback) => {
        target.addEventListener(eventType, callback, false);
    };

    const getWindowHeight = () => {
        return cachedVisualHeight = cachedVisualHeight || (windowHandle.innerHeight || documentHandle.documentElement.clientHeight);
    };

    const getWindowWidth = () => {
        return cachedVisualWidth = (windowHandle.innerWidth || documentHandle.body.parentNode.clientWidth) * (windowHandle.devicePixelRatio || 1);
    };

    const isElementInView = (elementItem) => {
        if (getElementProperty(elementItem, 'data-initial-source')) {
            return true;
        }

        const elementBounds = elementItem.getBoundingClientRect();
        const eagerZoneHeight = loaderConfig.eagernessFactor * getWindowHeight();

        return (
            elementBounds.left >= 0 - eagerZoneHeight &&
            elementBounds.top <= eagerZoneHeight
        );
    };

    const updateElementSource = (imageElement, sourceURL) => {
        if (setElementProperty(imageElement, 'src', sourceURL)) {
            batchCounter++;
        }
    };

    const selectAndApplyOptimalSource = (imageElement) => {
        const sourceSetData = getElementProperty(imageElement, 'data-display-sources');
        if (!sourceSetData) return;

        if (!getElementProperty(imageElement, 'data-initial-source')) {
            setElementProperty(imageElement, 'data-initial-source', getElementProperty(imageElement, 'src'));
        }

        const sourceEntries = sourceSetData.split(/, ?/).map(s => s.trim());
        let chosenSourceURL = null;

        sourceEntries.sort((a, b) => {
            const widthA = parseInt(a.match(/\d+(?=w$)/)?.[0] || '0', 10);
            const widthB = parseInt(b.match(/\d+(?=w$)/)?.[0] || '0', 10);
            return widthB - widthA;
        });

        const matchedSourceEntry = sourceEntries.find(entry => {
            const widthMatch = entry.match(/\d+(?=w$)/);
            if (widthMatch) {
                const descriptorWidth = parseInt(widthMatch[0], 10);
                return descriptorWidth <= cachedVisualWidth;
            }
            return false;
        });

        if (matchedSourceEntry) {
            chosenSourceURL = matchedSourceEntry.split(/ /)[0];
        } else {
            const fallbackEntry = sourceEntries.find(entry => !entry.match(/\d+(?=w$)/)) || sourceEntries[0];
            if (fallbackEntry) {
                chosenSourceURL = fallbackEntry.split(/ /)[0];
            }
        }

        if (chosenSourceURL) {
            updateElementSource(imageElement, chosenSourceURL);
        }
    };

    const processElementRecursively = (currentIndex) => {
        if (currentIndex >= currentVisualElements.length) {
            scanCursor = 0;
            scanLock = false;
            if (scanScheduled) {
                scanScheduled = false;
                setTimeout(initiateVisualScan, loaderConfig.refreshDelay);
            }
            return;
        }

        const currentElement = currentVisualElements[currentIndex];

        if (batchCounter < loaderConfig.processingBatchSize) {
            if (isElementInView(currentElement)) {
                selectAndApplyOptimalSource(currentElement);
            }
            processElementRecursively(currentIndex + 1);
        } else {
            scanCursor = currentIndex;
            setTimeout(() => {
                batchCounter = 0;
                processElementRecursively(scanCursor);
            }, loaderConfig.refreshDelay / 10);
        }
    };

    const initiateVisualScan = () => {
        if (scanLock) {
            scanScheduled = true;
            return;
        }
        scanLock = true;
        batchCounter = 0;
        cachedVisualWidth = getWindowWidth();
        cachedVisualHeight = getWindowHeight();
        processElementRecursively(scanCursor);
    };

    gatherVisualElements();
    registerEventHandler(windowHandle, 'load', initiateVisualScan);
    registerEventHandler(windowHandle, 'orientationchange', () => {
        cachedVisualHeight = 0;
        scanLock = false;
        initiateVisualScan();
    });
    registerEventHandler(windowHandle, 'scroll', initiateVisualScan);
    registerEventHandler(windowHandle, 'orientationchange', initiateVisualScan);

    if (currentVisualElements.length === 0) {
        setTimeout(gatherVisualElements, loaderConfig.refreshDelay);
    }

    return {
        configureSettings: (options) => {
            for (const param in options) {
                if (Object.prototype.hasOwnProperty.call(options, param)) {
                    loaderConfig[param] = options[param];
                }
            }
        },
        addVisualElement: (newImageElement) => {
            currentVisualElements.push(newImageElement);
        },
        activateImmediateLoad: () => {
            currentVisualElements.forEach(element => {
                selectAndApplyOptimalSource(element);
            });
        }
    };
})();