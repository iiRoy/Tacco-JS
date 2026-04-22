const rateLimitExecution = (fnCall, delayInterval, executeImmediately) => {
    let timerID;
    let lastArgs;
    let lastThis;

    const delayedExecution = () => {
        timerID = null;
        if (!executeImmediately) {
            fnCall.apply(lastThis, lastArgs);
        }
    };

    return function(...currentArgs) {
        lastThis = this;
        lastArgs = currentArgs;

        const isImmediate = executeImmediately && !timerID;
        clearTimeout(timerID);
        timerID = setTimeout(delayedExecution, delayInterval || 150);

        if (isImmediate) {
            fnCall.apply(lastThis, lastArgs);
        }
    };
};

class GridComposer {
    constructor(domElement, customConfiguration) {
        this.targetContainer = domElement;
        this.currentUnits = [];
        this.isLayoutUpdating = false;
        this.layoutConfiguration = {
            itemUnitSelector: '.box',
            minimumUnitDimension: 50,
            unitSpacing: 1,
            centerContainer: false,
            adjustUnitsToFit: true,
            adjustOptions: {
                anyUnitCanResize: true         
            },
            transitionEffects: true,
            transitionSettings: {
                frameDelay: 20,
                durationMs: 100,
                sequentialQueue: true,
                onComplete: () => {}
            }
        };

        Object.assign(this.layoutConfiguration, customConfiguration);

        this.targetContainer.style.position = 'relative';
        this.placementTracker = new Map();
        this.occupiedGrid = new Map();

        window.addEventListener('resize', rateLimitExecution(() => this.adjustLayoutOnResize(), 150));

        this.configureAndStart();
    }

    configureAndStart() {
        this.currentUnits = [];
        this.isLayoutUpdating = false;
        this.currentMaxContainerHeight = 0;
        this.currentMaxContainerWidth = 0;
        this.placementTracker = new Map();
        this.occupiedGrid = new Map();

        this.arrangeVisualUnits();
    }

    arrangeVisualUnits(newElements, placementMethod = 'replace') {
        this.isLayoutUpdating = true;
        let elementsToProcess = newElements ? Array.from(newElements) : Array.from(this.targetContainer.querySelectorAll(this.layoutConfiguration.itemUnitSelector));

        this.itemCount = 0;
        this.totalProcessedItems = 0;
        this.maximumLayoutHeight = 0;
        this.currentLayoutWidth = 0;

        const containerEffectiveWidth = !this.layoutConfiguration.centerContainer ? this.targetContainer.offsetWidth : window.innerWidth;
        this.activeColumns = Math.max(
            this.layoutConfiguration.minimumUnitDimension,
            Math.floor(containerEffectiveWidth / (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing)) + 1
        );

        const preparedUnits = elementsToProcess.map((element, index) => {
            const classAttribute = element.className;
            const sizeMatch = classAttribute.match(/size([0-9]+)/);
            let unitX = 1;
            let unitY = 1;

            if (sizeMatch) {
                const dimStr = sizeMatch[1].toString();
                unitX = parseInt(dimStr[0]) || 1;
                unitY = parseInt(dimStr[1]) || 1;
            }

            const currentPixelWidth = this.layoutConfiguration.minimumUnitDimension * unitX + this.layoutConfiguration.unitSpacing * (unitX - 1);
            const currentPixelHeight = this.layoutConfiguration.minimumUnitDimension * unitY + this.layoutConfiguration.unitSpacing * (unitY - 1);

            element.style.display = 'block';
            element.style.position = 'absolute';
            element.style.width = `${currentPixelWidth}px`;
            element.style.height = `${currentPixelHeight}px`;
            element.setAttribute('data-layout-id', `unit-${index}`);
            element.setAttribute('data-unit-width', currentPixelWidth);

            this.itemCount++;

            return {
                domRef: element,
                originalX: element.offsetLeft,
                originalY: element.offsetTop,
                pixelWidth: currentPixelWidth,
                pixelHeight: currentPixelHeight,
                unitSpanX: unitX,
                unitSpanY: unitY,
                layoutId: `unit-${index}`
            };
        });

        if (placementMethod === 'replace') {
            this.placementTracker = new Map();
            this.currentUnits = [];
        }

        preparedUnits.forEach(unitData => {
            this.determineUnitPosition(unitData, placementMethod);
        });
        
        if (this.totalProcessedItems === this.itemCount) {
            if (this.layoutConfiguration.adjustUnitsToFit) {
                this.optimizeLayoutGaps();
            }
            this.applyVisualTransformations();
            this.isLayoutUpdating = false;
        }
    }

    ensureGridDimension(gridRowIndex) {
        if (!this.placementTracker.has(gridRowIndex)) {
            const rowMap = new Map();
            for (let col = 0; col < this.activeColumns; col++) {
                rowMap.set(col, false);
            }
            this.placementTracker.set(gridRowIndex, rowMap);
        }
    }

    markSpaceOccupied(positionedBlock) {
        const { gridX, gridY, unitSpanX, unitSpanY } = positionedBlock;
        for (let h = 0; h < unitSpanY; h++) {
            for (let w = 0; w < unitSpanX; w++) {
                const currentGridY = gridY + h;
                const currentGridX = gridX + w;
                if (!this.occupiedGrid.has(currentGridY)) {
                    this.occupiedGrid.set(currentGridY, new Map());
                }
                this.occupiedGrid.get(currentGridY).set(currentGridX, true);
            }
        }
    }

    countMapEntries(inputMap) {
        return inputMap.size;
    }

    optimizeLayoutGaps() {
        this.occupiedGrid = new Map();
        this.currentUnits.forEach(unit => {
            this.markSpaceOccupied(unit);
        });

        const sortedUnits = [...this.currentUnits].sort((a, b) => b.gridY - a.gridY);
        const highestUnitY = sortedUnits.length > 0 ? sortedUnits[0].gridY : 0;
        const totalGridRows = this.countMapEntries(this.occupiedGrid);

        let potentialGap = {};

        for (const [yCoord, rowMap] of this.occupiedGrid.entries()) {
            let remainingRows = totalGridRows - yCoord;
            for (const [xCoord, isOccupied] of rowMap.entries()) {
                if (!isOccupied && yCoord < highestUnitY) {
                    if (!potentialGap.gridY) potentialGap.gridY = yCoord;
                    if (!potentialGap.gridX) potentialGap.gridX = xCoord;
                    
                    potentialGap.unitSpanX = (potentialGap.unitSpanX || 0) + 1;
                    potentialGap.unitSpanY = 1; 

                    let additionalHeightUnits = 0;
                    for (let rowOffset = 1; rowOffset < remainingRows; rowOffset++) {
                        const nextY = yCoord + rowOffset;
                        if (this.occupiedGrid.has(nextY) && this.occupiedGrid.get(nextY).get(xCoord) === false) {
                            additionalHeightUnits++;
                            this.occupiedGrid.get(nextY).set(xCoord, true);
                        } else {
                            break;
                        }
                    }
                    potentialGap.unitSpanY += additionalHeightUnits;
                    potentialGap.isReady = true;

                } else if (potentialGap.isReady) {
                    const targetUnitPixelWidth = potentialGap.unitSpanX * (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing) - this.layoutConfiguration.unitSpacing;
                    const targetUnitPixelHeight = potentialGap.unitSpanY * (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing) - this.layoutConfiguration.unitSpacing;

                    for (let i = 0; i < this.currentUnits.length; i++) {
                        const existingUnit = this.currentUnits[i];
                        if (potentialGap.gridY <= existingUnit.gridY &&
                            (this.layoutConfiguration.adjustOptions.anyUnitCanResize ||
                             (targetUnitPixelWidth <= existingUnit.pixelWidth && targetUnitPixelHeight <= existingUnit.pixelHeight))
                        ) {
                            const newX = potentialGap.gridX * (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing);
                            const newY = potentialGap.gridY * (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing);

                            existingUnit.domRef.classList.add('layout-moved');
                            
                            existingUnit.finalX = newX;
                            existingUnit.finalY = newY;
                            existingUnit.gridX = potentialGap.gridX;
                            existingUnit.gridY = potentialGap.gridY;
                            
                            if (this.layoutConfiguration.adjustOptions.anyUnitCanResize) {
                                existingUnit.pixelWidth = targetUnitPixelWidth;
                                existingUnit.pixelHeight = targetUnitPixelHeight;
                                existingUnit.domRef.style.width = `${targetUnitPixelWidth}px`;
                                existingUnit.domRef.style.height = `${targetUnitPixelHeight}px`;
                            }
                            
                            potentialGap = {};
                            break;
                        }
                    }
                    potentialGap = {};
                }
            }
        }
    }

    determineUnitPosition(unitData, placementMethod) {
        this.totalProcessedItems++;
        let currentGridY = 0;

        if (unitData.unitSpanX > this.activeColumns) {
            this.activeColumns = unitData.unitSpanX;
        }

        for (let attemptY = 0; ; attemptY++) {
            currentGridY = attemptY;

            for (let y = 0; y < unitData.unitSpanY; y++) {
                this.ensureGridDimension(currentGridY + y);
            }

            for (let currentGridX = 0; currentGridX <= (this.activeColumns - unitData.unitSpanX); currentGridX++) {
                let canFit = true;

                for (let y = 0; y < unitData.unitSpanY; y++) {
                    for (let x = 0; x < unitData.unitSpanX; x++) {
                        const targetY = currentGridY + y;
                        const targetX = currentGridX + x;

                        if (!this.placementTracker.has(targetY) || this.placementTracker.get(targetY).get(targetX)) {
                            canFit = false;
                            break;
                        }
                    }
                    if (!canFit) break;
                }

                if (canFit) {
                    for (let y = 0; y < unitData.unitSpanY; y++) {
                        for (let x = 0; x < unitData.unitSpanX; x++) {
                            this.placementTracker.get(currentGridY + y).set(currentGridX + x, true);
                        }
                    }

                    const finalPixelX = currentGridX * (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing);
                    const finalPixelY = currentGridY * (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing);

                    this.registerArrangedUnit(unitData.domRef, finalPixelX, finalPixelY, unitData.pixelWidth, unitData.pixelHeight, unitData.unitSpanX, unitData.unitSpanY, currentGridX, currentGridY, placementMethod);
                    return;
                }
            }
        }
    }

    registerArrangedUnit(elementRef, pX, pY, pW, pH, uCols, uRows, gX, gY, method) {
        const arrangedUnit = {
            domRef: elementRef,
            finalX: pX,
            finalY: pY,
            pixelWidth: pW,
            pixelHeight: pH,
            unitSpanX: uCols,
            unitSpanY: uRows,
            gridX: gX,
            gridY: gY
        };

        if (method === 'prepend') {
            this.currentUnits.unshift(arrangedUnit);
        } else {
            this.currentUnits.push(arrangedUnit);
        }
    }

    calculateOverallHeight(unitsCollection) {
        let maxReachY = 0;
        unitsCollection.forEach(unit => {
            const unitBottom = unit.finalY + unit.pixelHeight;
            if (unitBottom > maxReachY) {
                maxReachY = unitBottom;
            }
        });
        return maxReachY;
    }

    calculateOverallWidth(unitsCollection) {
        let maxReachX = 0;
        unitsCollection.forEach(unit => {
            const unitRight = unit.finalX + unit.pixelWidth;
            if (unitRight > maxReachX) {
                maxReachX = unitRight;
            }
        });
        return maxReachX;
    }

    applyVisualTransformations() {
        this.targetContainer.style.height = `${this.calculateOverallHeight(this.currentUnits)}px`;
        if (this.layoutConfiguration.centerContainer) {
            this.targetContainer.style.width = `${this.calculateOverallWidth(this.currentUnits)}px`;
            this.targetContainer.style.marginLeft = 'auto';
            this.targetContainer.style.marginRight = 'auto';
        } else {
            this.targetContainer.style.width = '100%';
            this.targetContainer.style.marginLeft = '0';
            this.targetContainer.style.marginRight = '0';
        }

        const sortedForAnimation = [...this.currentUnits].reverse();
        const { frameDelay, durationMs, sequentialQueue, onComplete } = this.layoutConfiguration.transitionSettings;

        let animationCounter = 0;
        let totalAnimated = 0;

        sortedForAnimation.forEach((unit, index) => {
            const currentLeft = unit.domRef.offsetLeft;
            const currentTop = unit.domRef.offsetTop;

            unit.domRef.setAttribute('data-current-y', currentTop);
            unit.domRef.setAttribute('data-current-x', currentLeft);

            if (this.layoutConfiguration.transitionEffects && (currentLeft !== unit.finalX || currentTop !== unit.finalY)) {
                animationCounter++;
                if (sequentialQueue) {
                    setTimeout(() => {
                        unit.domRef.style.transition = `transform ${durationMs}ms ease-out`;
                        unit.domRef.style.transform = `translate(${unit.finalX}px, ${unit.finalY}px)`;
                        totalAnimated++;
                        if (totalAnimated === animationCounter) {
                            onComplete(this.currentUnits);
                        }
                    }, index * frameDelay);
                } else {
                    setTimeout(() => {
                        unit.domRef.style.transition = `transform ${durationMs}ms ease-out`;
                        unit.domRef.style.transform = `translate(${unit.finalX}px, ${unit.finalY}px)`;
                        totalAnimated++;
                        if (totalAnimated === animationCounter) {
                            onComplete(this.currentUnits);
                        }
                    }, 0);
                }
            } else if (currentLeft !== unit.finalX || currentTop !== unit.finalY) {
                unit.domRef.style.transition = 'none';
                unit.domRef.style.transform = `translate(${unit.finalX}px, ${unit.finalY}px)`;
            }
        });

        if (animationCounter === 0) {
            onComplete(this.currentUnits);
        }
    }

    addUnits(elementsToAdd) {
        this.isLayoutUpdating = true;
        this.arrangeVisualUnits(elementsToAdd, 'append');
    }

    insertUnits(elementsToAdd) {
        this.isLayoutUpdating = true;
        this.arrangeVisualUnits(elementsToAdd, 'prepend');
    }

    adjustLayoutOnResize() {
        const currentContainerWidth = this.targetContainer.offsetWidth;
        const currentCalculatedColumns = Math.max(
            this.layoutConfiguration.minimumUnitDimension,
            Math.floor(currentContainerWidth / (this.layoutConfiguration.minimumUnitDimension + this.layoutConfiguration.unitSpacing)) + 1
        );

        if (!this.isLayoutUpdating && currentCalculatedColumns !== this.activeColumns) {
            this.isLayoutUpdating = true;
            this.arrangeVisualUnits();
        }
    }
}

const initGridLayout = (containerSelector, config = {}) => {
    const containerElement = document.querySelector(containerSelector);
    if (!containerElement) {
        console.error('GridComposer: Target container not found.', containerSelector);
        return null;
    }
    return new GridComposer(containerElement, config);
};