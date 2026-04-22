function deepMerge(target, source) {
    const output = { ...target };
    if (target && typeof target === 'object' && source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
            if (
                source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
                target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
            ) {
                output[key] = deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        });
    }
    return output;
}

function simpleTemplate(templateString, data) {
    let output = templateString;
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            output = output.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(data[key]));
        }
    }
    return output;
}

function createDebouncer(func, delay) {
    let timer;
    return function(...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay);
    };
}

class CascadeEngine {
    constructor(displayElement, configuration) {
        this.displayElement = displayElement;
        this.currentSettings = deepMerge(CascadeEngine.baseSettings, configuration);
        this.gridHeightMatrix = [];
        this.queuedPositionUpdates = [];

        this._initiateSystem();
    }

    _logEvent(...args) {
        if (true !== this.currentSettings.enableDiagnostics) {
            return;
        }
        if (typeof console !== 'undefined' && typeof console.log === 'function') {
            console.log('[CascadeEngine]', ...args);
        }
    }

    _initiateSystem() {
        const config = this.currentSettings;
        const sourcePath = config.contentSourceUrl;

        this._calculateGridDimensions();
        this._prepareDisplayArea();
        this._resetGridHeightMatrix();
        this.repositionAllBlocks();

        if (!sourcePath) {
            this._logEvent('Missing content source URL. Infinite scroll will not function.');
            return;
        }

        if (config.autoFillInitial) {
            this._fillInitialContent();
        }

        if (config.responsiveLayout) {
            this._setupWindowResizeObserver();
        }

        this._setupScrollMonitor();
    }

    _prepareDisplayArea() {
        const config = this.currentSettings;
        const layoutKey = config.elementKey;

        document.body.style.overflow = 'scroll';

        Object.assign(this.displayElement.style, config.containerLayout);
        this.displayElement.classList.add(`${layoutKey}-zone`);

        const loaderHtml = `<div id="${layoutKey}-loader">${config.loadingMessage}</div>`;
        const infoHtml = `<div id="${layoutKey}-info" style="text-align:center;color:#999;"></div>`;
        this.displayElement.insertAdjacentHTML('afterend', loaderHtml + infoHtml);

        this.contentLoader = document.getElementById(`${layoutKey}-loader`);
        this.statusDisplay = document.getElementById(`${layoutKey}-info`);
    }

    _calculateGridDimensions() {
        const config = this.currentSettings;
        const parentContainer = config.adjustToParentWidth ? this.displayElement.parentElement : this.displayElement;
        let effectiveWidth = parentContainer.offsetWidth;

        if (parentContainer.tagName === 'BODY') {
            effectiveWidth = window.innerWidth - 20;
        }

        const blockWidth = config.blockWidth;
        const horizontalGap = config.horizontalGap;
        const minimumColumns = config.minimumColumns;
        const maximumColumns = config.maximumColumns;

        let estimatedColumns = Math.floor(effectiveWidth / (blockWidth + horizontalGap));
        let finalColumns = Math.max(estimatedColumns, minimumColumns);

        if (maximumColumns !== undefined) {
            finalColumns = Math.min(finalColumns, maximumColumns);
        }
        this.currentGridColumns = finalColumns;
    }

    _resetGridHeightMatrix() {
        this.gridHeightMatrix.length = this.currentGridColumns;
        for (let i = 0; i < this.currentGridColumns; i++) {
            this.gridHeightMatrix[i] = 0;
        }
    }

    _extractBlocks(sourceElement) {
        const blockClass = this.currentSettings.blockClass;
        const blocks = sourceElement.querySelectorAll(`.${blockClass}`);
        blocks.forEach(block => {
            block.style.position = 'absolute';
        });
        return Array.from(blocks);
    }

    arrangeBlocks(contentBlocks, completionCallback) {
        const config = this.currentSettings;
        const animationEnabled = config.animatedTransitions && config.systemState.isResizing;

        const styleUpdater = animationEnabled ? (el, style) => {
            el.style.transition = `left ${config.animationSettings.duration || 400}ms ease-out, top ${config.animationSettings.duration || 400}ms ease-out`;
            Object.assign(el.style, style);
        } : (el, style) => {
            el.style.transition = '';
            Object.assign(el.style, style);
        };

        if (config.fadeInOnLoad) {
            contentBlocks.forEach(block => {
                block.style.opacity = '0';
                requestAnimationFrame(() => {
                    block.style.transition = `opacity ${config.animationSettings.duration || 400}ms ease-in`;
                    block.style.opacity = '1';
                });
            });
        }

        let horizontalOffset = 0;
        const totalContentWidth = config.blockWidth * this.currentGridColumns + config.horizontalGap * (this.currentGridColumns - 1);
        if (config.alignment === 'center') {
            horizontalOffset = (this.displayElement.offsetWidth - totalContentWidth) / 2;
            horizontalOffset = Math.max(horizontalOffset, 0);
        } else if (config.alignment === 'right') {
            horizontalOffset = this.displayElement.offsetWidth - totalContentWidth;
        }

        contentBlocks.forEach(block => {
            this._positionSingleBlock(block, horizontalOffset);
        });

        this.queuedPositionUpdates.forEach(update => {
            styleUpdater(update.element, update.style);
        });

        this.displayElement.style.height = `${Math.max(...this.gridHeightMatrix)}px`;
        this.queuedPositionUpdates = [];

        config.systemState.isResizing = false;
        config.systemState.isProcessingContent = false;

        if (completionCallback) {
            completionCallback.call(contentBlocks);
        }
    }

    repositionAllBlocks(completionCallback) {
        const allCurrentBlocks = this.displayElement.querySelectorAll(`.${this.currentSettings.blockClass}`);
        this._resetGridHeightMatrix();
        this.arrangeBlocks(Array.from(allCurrentBlocks), completionCallback);
    }

    _positionSingleBlock(blockElement, leftOffset) {
        const config = this.currentSettings;
        const blockWidth = config.blockWidth;
        const horizontalGap = config.horizontalGap;
        const verticalGap = config.verticalGap;
        const columnHeights = this.gridHeightMatrix;
        const numColumns = columnHeights.length;

        const minHeight = Math.min(...columnHeights);
        const minHeightIndex = columnHeights.indexOf(minHeight);

        let targetColumnIndex;

        if (blockElement.classList.contains(`${config.elementKey}-block-fixed-left`)) {
            targetColumnIndex = 0;
        } else if (blockElement.classList.contains(`${config.elementKey}-block-fixed-right`)) {
            targetColumnIndex = (numColumns > 1) ? (numColumns - 1) : 0;
        } else {
            targetColumnIndex = minHeightIndex;
        }

        const blockPosition = {
            left: (blockWidth + horizontalGap) * targetColumnIndex + leftOffset + 'px',
            top: columnHeights[targetColumnIndex] + 'px'
        };

        this.queuedPositionUpdates.push({ element: blockElement, style: blockPosition });

        columnHeights[targetColumnIndex] += blockElement.offsetHeight + verticalGap;
    }

    addContent(newContentElement, completionCallback) {
        this.displayElement.appendChild(newContentElement);
        this.repositionAllBlocks(completionCallback);
    }

    prependContent(newContentElement, completionCallback) {
        this.displayElement.insertBefore(newContentElement, this.displayElement.firstChild);
        this.repositionAllBlocks(completionCallback);
    }

    removeContent(elementsToRemove, completionCallback) {
        Array.from(elementsToRemove).forEach(el => el.remove());
        this.repositionAllBlocks(completionCallback);
    }

    updateConfiguration(newSettings, completionCallback) {
        if (typeof newSettings === 'object' && newSettings !== null) {
            this.currentSettings = deepMerge(this.currentSettings, newSettings);
            if (typeof completionCallback === 'function') {
                completionCallback();
            }
            this._initiateSystem();
        }
    }

    haltActivity(completionCallback) {
        this.currentSettings.systemState.isPaused = true;
        if (typeof completionCallback === 'function') {
            completionCallback();
        }
    }

    resumeActivity(completionCallback) {
        this.currentSettings.systemState.isPaused = false;
        if (typeof completionCallback === 'function') {
            completionCallback();
        }
    }

    _fetchMoreContent(completionCallback) {
        const config = this.currentSettings;
        let currentPage = config.systemState.currentPage;

        if (config.maxPages !== undefined && currentPage >= config.maxPages) {
            config.systemState.hasReachedMaxPage = true;
            config.callbacks.loadEnd(this.contentLoader, config.systemState.hasReachedMaxPage);
            return;
        }

        currentPage++;
        config.systemState.currentPage = currentPage;

        let requestUrl;
        if (typeof config.contentSourceUrl === 'function') {
            requestUrl = config.contentSourceUrl(currentPage);
        } else if (Array.isArray(config.contentSourceUrl)) {
            requestUrl = config.contentSourceUrl.join(currentPage.toString());
        } else {
            this._logEvent('Invalid contentSourceUrl format. Cannot fetch data.');
            return;
        }

        const queryParams = new URLSearchParams(config.requestParameters);
        const fullUrl = `${requestUrl}?${queryParams.toString()}`;

        this._logEvent('Fetching content from:', fullUrl);

        config.callbacks.loadStart(this.contentLoader);

        config.systemState.isFetchingData = true;
        config.systemState.isProcessingContent = true;

        fetch(fullUrl, {
            method: 'GET',
            headers: config.requestHeaders
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response[config.responseDataType]();
        })
        .then(data => {
            this._processFetchedData(data, completionCallback);
            config.systemState.isFetchingData = false;
        })
        .catch(error => {
            this._logEvent('Fetch error:', error);
            config.callbacks.loadError(this.statusDisplay, error.message);
            config.systemState.isFetchingData = false;
            config.systemState.isProcessingContent = false;
        });
    }

    _processFetchedData(data, completionCallback) {
        const config = this.currentSettings;
        const renderedHtml = config.callbacks.renderContent(data, config.responseDataType);

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = renderedHtml.trim();
        const newBlocks = this._extractBlocks(tempContainer);

        if (config.waitForImages && newBlocks.length > 0) {
            const images = tempContainer.querySelectorAll('img');
            if (images.length > 0) {
                let imagesLoaded = 0;
                const totalImages = images.length;
                const checkCompletion = () => {
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                        this.appendNewBlocks(newBlocks, completionCallback);
                        config.callbacks.loadEnd(this.contentLoader, config.systemState.hasReachedMaxPage);
                    }
                };
                images.forEach(img => {
                    if (img.complete) {
                        checkCompletion();
                    } else {
                        img.addEventListener('load', checkCompletion);
                        img.addEventListener('error', checkCompletion);
                    }
                });
            } else {
                this.appendNewBlocks(newBlocks, completionCallback);
                config.callbacks.loadEnd(this.contentLoader, config.systemState.hasReachedMaxPage);
            }
        } else {
            this.appendNewBlocks(newBlocks, completionCallback);
            config.callbacks.loadEnd(this.contentLoader, config.systemState.hasReachedMaxPage);
        }
    }

    appendNewBlocks(blocks, completionCallback) {
        blocks.forEach(block => this.displayElement.appendChild(block));
        this.repositionAllBlocks(completionCallback);
    }

    _setupWindowResizeObserver() {
        const debouncedResize = createDebouncer(() => {
            this.currentSettings.systemState.isResizing = true;
            this._calculateGridDimensions();
            this.repositionAllBlocks();
        }, 150);
        window.addEventListener('resize', debouncedResize);
    }

    _setupScrollMonitor() {
        const scrollHandler = () => {
            const config = this.currentSettings;
            if (config.systemState.isFetchingData || config.systemState.isProcessingContent || config.systemState.isPaused || config.systemState.hasReachedMaxPage) {
                return;
            }

            const scrollDistance = window.scrollY || document.documentElement.scrollTop;
            const documentHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;

            if (scrollDistance + windowHeight >= documentHeight - config.scrollThreshold) {
                this._fetchMoreContent();
            }
        };
        window.addEventListener('scroll', createDebouncer(scrollHandler, 100));
    }

    _fillInitialContent() {
        const config = this.currentSettings;
        const checkPrefill = () => {
            if (config.systemState.isFetchingData || config.systemState.isProcessingContent || config.systemState.isPaused || config.systemState.hasReachedMaxPage) {
                return;
            }
            if (document.documentElement.scrollHeight <= window.innerHeight) {
                this._logEvent('Prefilling content to fill viewport...');
                this._fetchMoreContent(() => {
                    setTimeout(checkPrefill, 50);
                });
            }
        };
        checkPrefill();
    }
}

CascadeEngine.baseSettings = {
    blockClass: 'cascade-block',
    elementKey: 'cascade',
    adjustToParentWidth: true,
    blockWidth: 240,
    horizontalGap: 10,
    verticalGap: 10,
    alignment: 'center',
    minimumColumns: 1,
    maximumColumns: undefined,
    maxPages: undefined,
    scrollThreshold: 50,
    containerLayout: {
        position: 'relative'
    },
    responsiveLayout: true,
    fadeInOnLoad: false,
    animatedTransitions: false,
    animationSettings: {},
    autoFillInitial: true,
    waitForImages: true,
    contentSourceUrl: undefined,
    responseDataType: 'json',
    requestParameters: {},
    requestHeaders: {},
    loadingMessage: '<div style="text-align:center;padding:10px 0; color:#999;"><img src="data:image/gif;base64,R0lGODlhEAALAPQAAP///zMzM+Li4tra2u7u7jk5OTMzM1hYWJubm4CAgMjIyE9PT29vb6KiooODg8vLy1JSUjc3N3Jycuvr6+Dg4Pb29mBgYOPj4/X19cXFxbOzs9XV1fHx8TMzMzMzMzMzMyH5BAkLAAAAIf4aQ3JlYXRlZCB3aXRoIGFqYXhsb2FkLmluZm8AIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEAALAAAFLSAgjmRpnqSgCuLKAq5AEIM4zDVw03ve27ifDgfkEYe04kDIDC5zrtYKRa2WQgAh+QQJCwAAACwAAAAAEAALAAAFJGBhGAVgnqhpHIeRvsDawqns0qeN5+y967tYLyicBYE7EYkYAgAh+QQJCwAAACwAAAAAEAALAAAFNiAgjothLOOIJAkiGgxjpGKiKMkbz7SN6zIawJcDwIK9W/HISxGBzdHTuBNOmcJVCyoUlk7CEAAh+QQJCwAAACwAAAAAEAALAAAFNSAgjqQIRRFUAo3jNGIkSdHqPI8Tz3V55zuaDacDyIQ+YrBH+hWPzJFzOQQaeavWi7oqnVIhACH5BAkLAAAAsAAAAAAQAAsAAAUyICCOZGme1rJY5kRRk7hI0mJSVUXJtF3iOl7tltsBZsNfUegjAY3I5sgFY55KqdX1GgIAIfkECQsAAAAsAAAAABAACwAABTcgII5kaZ4kcV2EqLJipmnZhWGXaOOitm2aXQ4g7P2Ct2ER4AMul00kj5g0Al8tADY2y6C+4FIIACH5BAkLAAAAsAAAAAAQAAsAAAUvICCOZGme5ERRk6iy7qpyHCVStA3gNa/7txxwlwv2isSacYUc+l4tADQGQ1mvpBAAIfkECQsAAAAsAAAAABAACwAABS8gII5kaZ7kRFGTqLLuqnIcJVK0DeA1r/u3HHCXC/aKxJpxhRz6Xi0ANAZDWa+kEAA7" alt=""><br />Loading...</div>',
    systemState: {
        isFetchingData: false,
        isProcessingContent: false,
        isResizing: false,
        isPaused: false,
        currentPage: 0,
        hasReachedMaxPage: false
    },
    callbacks: {
        loadStart: (loaderElement) => {
            loaderElement.style.display = 'block';
            loaderElement.style.opacity = '1';
        },
        loadEnd: (loaderElement, reachedMax) => {
            if (!reachedMax) {
                loaderElement.style.opacity = '0';
                loaderElement.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => loaderElement.style.display = 'none', 500);
            } else {
                loaderElement.remove();
            }
        },
        loadError: (messageElement, errorInfo) => {
            messageElement.innerHTML = `Content load failed: ${errorInfo}. Please try again later.`;
        },
        renderContent: (data, dataType) => {
            if (dataType === 'json' || dataType === 'jsonp') {
                const templateScript = document.getElementById('cascade-template');
                if (templateScript && templateScript.innerHTML) {
                    return simpleTemplate(templateScript.innerHTML, data);
                } else {
                    return `<div class="cascade-block" style="width: 240px; height: ${Math.floor(Math.random() * 100) + 100}px; background-color: #f0f0f0; margin-bottom: 10px; border: 1px solid #ccc; box-sizing: border-box; padding: 10px;">
                                <p>Item ID: ${data.id || 'N/A'}</p>
                                <p>Title: ${data.title || JSON.stringify(data).substring(0, 50)}...</p>
                            </div>`;
                }
            } else {
                return data;
            }
        }
    },
    enableDiagnostics: false
};