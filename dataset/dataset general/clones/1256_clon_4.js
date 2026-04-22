class GridAligner {
    #housingElement;
    #unitDimension;
    #spacingValue;
    #dataItems;
    #occupiedGridCells;
    #currentMaxRows;
    #isInitialized;
    #maxItemCellWidth;
    #layoutColumns;
    #transitionDelay;
    #animationTracker;
    #managedElements;
    #sizeMonitor;

    constructor(canvasIdentifier, baseDimension, gapSize, itemSpecs, fadeDuration) {
        this.initializeParameters(canvasIdentifier, baseDimension, gapSize, itemSpecs, fadeDuration);
        this.determineMaxItemWidth();
        this.calculateLayoutColumns();
        this.configureResizeMonitoring();
        this.performLayoutAndDisplay();
    }

    initializeParameters(idOrElement, baseDim, gap, specs, delay) {
        this.#housingElement = typeof idOrElement === 'string' ?
            document.getElementById(idOrElement) : idOrElement;
        this.#unitDimension = baseDim;
        this.#spacingValue = gap;
        this.#dataItems = specs;
        this.#currentMaxRows = 1;
        this.#isInitialized = false;
        this.#maxItemCellWidth = 1;
        this.#transitionDelay = delay;
        this.#animationTracker = 0;
        this.#managedElements = [];
        this.#occupiedGridCells = new Set();
    }

    determineMaxItemWidth() {
        this.#maxItemCellWidth = this.#dataItems.reduce((max, item) => Math.max(max, item.width), 1);
    }

    calculateLayoutColumns() {
        const availableWidth = this.#housingElement.offsetWidth;
        const effectiveUnitSize = this.#unitDimension + this.#spacingValue;
        this.#layoutColumns = Math.max(Math.floor(availableWidth / effectiveUnitSize), this.#maxItemCellWidth);
    }

    configureResizeMonitoring() {
        const resizeHandler = (entries) => {
            for (let entry of entries) {
                if (entry.target === this.#housingElement) {
                    const newColumnEstimate = Math.max(Math.floor(entry.contentRect.width / (this.#unitDimension + this.#spacingValue)), this.#maxItemCellWidth);
                    if (newColumnEstimate !== this.#layoutColumns) {
                        this.#currentMaxRows = 1;
                        this.#layoutColumns = newColumnEstimate;
                        this.performLayoutAndDisplay();
                    }
                }
            }
        };
        this.#sizeMonitor = new ResizeObserver(resizeHandler);
        this.#sizeMonitor.observe(this.#housingElement);
    }

    _locateFittingBlock(blockWidthUnits, blockHeightUnits) {
        if (blockWidthUnits > this.#maxItemCellWidth) {
            this.#maxItemCellWidth = blockWidthUnits;
        }

        let currentY = 0;
        while (currentY < this.#currentMaxRows) {
            for (let currentX = 0; currentX < this.#layoutColumns; currentX++) {
                if (!this.#occupiedGridCells.has(`${currentY}_${currentX}`)) {
                    let allClear = true;

                    if ((currentX + blockWidthUnits) > this.#layoutColumns) {
                        allClear = false;
                    }
                    if ((currentY + blockHeightUnits) > this.#currentMaxRows) {
                        allClear = false;
                    }

                    if (allClear) {
                        for (let checkY = 0; checkY < blockHeightUnits; checkY++) {
                            for (let checkX = 0; checkX < blockWidthUnits; checkX++) {
                                if (this.#occupiedGridCells.has(`${currentY + checkY}_${currentX + checkX}`)) {
                                    allClear = false;
                                    break;
                                }
                            }
                            if (!allClear) break;
                        }
                    }

                    if (allClear) {
                        for (let markY = 0; markY < blockHeightUnits; markY++) {
                            for (let markX = 0; markX < blockWidthUnits; markX++) {
                                this.#occupiedGridCells.add(`${currentY + markY}_${currentX + markX}`);
                            }
                        }

                        this.#currentMaxRows = Math.max(this.#currentMaxRows, currentY + blockHeightUnits);

                        const pixelLeft = currentX * (this.#unitDimension + this.#spacingValue);
                        const pixelTop = currentY * (this.#unitDimension + this.#spacingValue);
                        return { topPx: pixelTop, leftPx: pixelLeft };
                    }
                }
            }
            currentY++;
        }

        const originalRows = this.#currentMaxRows;
        const newRowsToAdd = Math.ceil(originalRows / 2);
        this.#currentMaxRows += newRowsToAdd;

        return this._locateFittingBlock(blockWidthUnits, blockHeightUnits);
    }

    performLayoutAndDisplay() {
        this.#occupiedGridCells.clear();
        this.#currentMaxRows = 1;
        
        const obtainPosition = (blockWidth, blockHeight) => {
            return this._locateFittingBlock(blockWidth, blockHeight);
        };

        if (!this.#isInitialized) {
            const tempFragment = document.createDocumentFragment();

            this.#dataItems.forEach((item) => {
                const placement = obtainPosition(item.width, item.height);

                const itemDiv = document.createElement('div');
                itemDiv.className = 'grid-item-block';
                if (this.#transitionDelay !== undefined) {
                    itemDiv.classList.add('fading-hidden', 'fading-transition');
                }
                itemDiv.style.width = ((item.width * this.#unitDimension) + ((item.width - 1) * this.#spacingValue)) + 'px';
                itemDiv.style.height = ((item.height * this.#unitDimension) + ((item.height - 1) * this.#spacingValue)) + 'px';
                itemDiv.style.top = placement.topPx + 'px';
                itemDiv.style.left = placement.leftPx + 'px';
                itemDiv.innerHTML = item.content;
                tempFragment.appendChild(itemDiv);
            });

            const totalLayoutHeightPx = (this.#currentMaxRows * this.#unitDimension) + ((this.#currentMaxRows - 1) * this.#spacingValue);

            const containerWrapper = document.createElement('div');
            containerWrapper.className = 'grid-container-wrapper';
            containerWrapper.style.height = totalLayoutHeightPx + 'px';
            containerWrapper.appendChild(tempFragment);

            this.#housingElement.innerHTML = '';
            this.#housingElement.appendChild(containerWrapper);

            this.#housingElement.style.height = totalLayoutHeightPx + 'px';
            this.#housingElement.style.minWidth = ((this.#unitDimension + this.#spacingValue) * this.#maxItemCellWidth) + 'px';

            this.#managedElements = Array.from(this.#housingElement.querySelectorAll('.grid-item-block'));

            if (this.#transitionDelay !== undefined) {
                this.#animationTracker = 0;
                this._startSequentialFadeIn();
            }
            this.#isInitialized = true;
        } else {
            this.#dataItems.forEach((item, index) => {
                const placement = obtainPosition(item.width, item.height);

                const existingDiv = this.#managedElements[index];
                if (existingDiv) {
                    existingDiv.style.top = placement.topPx + 'px';
                    existingDiv.style.left = placement.leftPx + 'px';
                    existingDiv.style.width = ((item.width * this.#unitDimension) + ((item.width - 1) * this.#spacingValue)) + 'px';
                    existingDiv.style.height = ((item.height * this.#unitDimension) + ((item.height - 1) * this.#spacingValue)) + 'px';
                }
            });

            const totalLayoutHeightPx = (this.#currentMaxRows * this.#unitDimension) + ((this.#currentMaxRows - 1) * this.#spacingValue);
            this.#housingElement.style.height = totalLayoutHeightPx + 'px';
            const wrapper = this.#housingElement.querySelector('.grid-container-wrapper');
            if (wrapper) {
                wrapper.style.height = totalLayoutHeightPx + 'px';
            }
        }
    }

    _startSequentialFadeIn() {
        if (this.#animationTracker < this.#managedElements.length) {
            const currentElement = this.#managedElements[this.#animationTracker];
            if (currentElement) {
                currentElement.classList.remove('fading-hidden');
            }
            this.#animationTracker++;
            setTimeout(() => this._startSequentialFadeIn(), this.#transitionDelay);
        }
    }

    adjustSpacing(newGap) {
        this.#spacingValue = newGap;
        this.calculateLayoutColumns();
        this.performLayoutAndDisplay();
    }

    updateBaseDimension(newDim) {
        this.#unitDimension = newDim;
        this.calculateLayoutColumns();
        this.performLayoutAndDisplay();
    }

    supplyNewData(itemsCollection) {
        this.#dataItems = itemsCollection;
        this.determineMaxItemWidth();
        this.calculateLayoutColumns();
        this.#housingElement.innerHTML = '';
        this.#isInitialized = false;
        this.performLayoutAndDisplay();
    }

    appendNewData(additionalItems) {
        this.#dataItems = this.#dataItems.concat(additionalItems);
        this.determineMaxItemWidth();
        this.calculateLayoutColumns();
        this.#housingElement.innerHTML = '';
        this.#isInitialized = false;
        this.performLayoutAndDisplay();
    }

    setAnimationInterval(intervalMs) {
        this.#transitionDelay = intervalMs;
    }

    destroy() {
        if (this.#sizeMonitor) {
            this.#sizeMonitor.disconnect();
        }
        this.#housingElement.innerHTML = '';
        this.#housingElement = null;
        this.#dataItems = null;
        this.#occupiedGridCells = null;
        this.#managedElements = null;
        this.#sizeMonitor = null;
    }
}