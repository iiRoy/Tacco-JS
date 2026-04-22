(function () {
    const GRID_UNIT_DIMENSION = 48;

    const setElementPosition = (targetElement, xCoord, yCoord) => {
        targetElement.style.left = xCoord * GRID_UNIT_DIMENSION + 'px';
        targetElement.style.top = yCoord * GRID_UNIT_DIMENSION + 'px';
    };

    const puzzleLayouts = [
        ["xxxxxxxxxxxxxx", "x            x", "x            x", "x      r     x", "x      xx    x", "x  g     r b x", "xxbxxxg xxxxxx", "xxxxxxxxxxxxxx"],
        ["xxxxxxxxxxxxxx", "x            x", "x            x", "x            x", "x     g   g  x", "x   r r   r  x", "xxxxx x x xxxx", "xxxxxxxxxxxxxx"],
        ["xxxxxxxxxxxxxx", "x            x", "x            x", "x   bg  x g  x", "xxx xxxrxxx  x", "x      b     x", "xxx xxxrxxxxxx", "xxxxxxxxxxxxxx"],
        ["xxxxxxxxxxxxxx", "x            x", "x       r    x", "x       b    x", "x       x    x", "x b r        x", "x b r      b x", "xxx x      xxx", "xxxxx xxxxxxxx", "xxxxxxxxxxxxxx"],
        ["xxxxxxxxxxxxxx", "x            x", "x            x", "xrg  gg      x", "xxx xxxx xx  x", "xrg          x", "xxxxx  xx   xx", "xxxxxx xx  xxx", "xxxxxxxxxxxxxx"],
        ["xxxxxxxxxxxxxx", "xxxxxxx      x", "xxxxxxx g    x", "x       xx   x", "x r   b      x", "x x xxx x g  x", "x         x bx", "x       r xxxx", "x   xxxxxxxxxx", "xxxxxxxxxxxxxx"]
    ];

    let currentBlobIdentifier = 0;

    class SpatialUnit {
        constructor(parentBlob, relativeX, relativeY, unitColor) {
            this.parent = parentBlob;
            this.relativeX = relativeX;
            this.relativeY = relativeY;
            this.visualElement = document.createElement('div');
            this.visualElement.className = 'unit blob-unit ' + unitColor;
        }
    }

    class BlobObject {
        constructor(interactionCanvas, initialX, initialY, objectColor) {
            this.uniqueIdentifier = currentBlobIdentifier++;
            this.anchorX = initialX;
            this.anchorY = initialY;
            this.objectColor = objectColor;
            this.visualContainer = document.createElement('div');
            setElementPosition(this.visualContainer, this.anchorX, this.anchorY);
            this.visualContainer.className = 'unit blob-container';

            const initialUnit = new SpatialUnit(this, 0, 0, this.objectColor);
            this.visualContainer.appendChild(initialUnit.visualElement);
            this.spatialUnits = [initialUnit];

            this.visualContainer.addEventListener('contextmenu', (evt) => {
                evt.preventDefault();
                interactionCanvas.initiateMovement(this.uniqueIdentifier, 1, 0);
            });
            this.visualContainer.addEventListener('click', (evt) => {
                interactionCanvas.initiateMovement(this.uniqueIdentifier, -1, 0);
            });

            let touchStartCoord = 0;
            this.visualContainer.addEventListener('touchstart', (evt) => {
                touchStartCoord = evt.touches[0].pageX;
            });
            this.visualContainer.addEventListener('touchmove', (evt) => {
                const deltaX = evt.touches[0].pageX - touchStartCoord;
                if (Math.abs(deltaX) > 10) {
                    const motionDirection = deltaX > 0 ? 1 : -1;
                    interactionCanvas.initiateMovement(this.uniqueIdentifier, motionDirection, 0);
                    touchStartCoord = evt.touches[0].pageX;
                }
            });
        }

        getAbsoluteUnitCoordinates() {
            return this.spatialUnits.map(unit => [this.anchorX + unit.relativeX, this.anchorY + unit.relativeY]);
        }

        updateAnchorPosition(newX, newY) {
            this.anchorX = newX;
            this.anchorY = newY;
            setElementPosition(this.visualContainer, this.anchorX, this.anchorY);
        }

        absorbOtherBlob(otherBlob) {
            const relativeShiftX = otherBlob.anchorX - this.anchorX;
            const relativeShiftY = otherBlob.anchorY - this.anchorY;

            otherBlob.spatialUnits.forEach(unit => {
                this.spatialUnits.push(unit);
                unit.parent = this;
                unit.relativeX += relativeShiftX;
                unit.relativeY += relativeShiftY;
                setElementPosition(unit.visualElement, unit.relativeX, unit.relativeY);
                this.visualContainer.appendChild(unit.visualElement);
            });

            otherBlob.spatialUnits = [];
            otherBlob.visualContainer.parentNode.removeChild(otherBlob.visualContainer);

            this.spatialUnits.forEach(unitA => {
                unitA.visualElement.style.border = '';
                this.spatialUnits.forEach(unitB => {
                    if (unitA === unitB) return;
                    if (unitB.relativeX === unitA.relativeX + 1 && unitB.relativeY === unitA.relativeY) {
                        unitA.visualElement.style.borderRight = 'none';
                    } else if (unitB.relativeX === unitA.relativeX - 1 && unitB.relativeY === unitA.relativeY) {
                        unitA.visualElement.style.borderLeft = 'none';
                    } else if (unitB.relativeX === unitA.relativeX && unitB.relativeY === unitA.relativeY + 1) {
                        unitA.visualElement.style.borderBottom = 'none';
                    } else if (unitB.relativeX === unitA.relativeX && unitB.relativeY === unitA.relativeY - 1) {
                        unitA.visualElement.style.borderTop = 'none';
                    }
                });
            });
        }
    }

    class InteractionCanvas {
        constructor(displayElement, schematic) {
            this.displayElement = displayElement;
            this.blobEntities = [];
            this.isProcessingAction = false;

            this.constructPlayfield(schematic);
            this.delineateBoundaries();

            ['contextmenu', 'click', 'touchstart', 'touchmove'].forEach(event => {
                this.displayElement.addEventListener(event, (e) => {
                    e.preventDefault();
                    if (this.isProcessingAction) {
                        e.stopPropagation();
                    }
                }, true);
            });

            this.resolveFusions();
        }

        constructPlayfield(schematic) {
            const gridTable = document.createElement('table');
            this.displayElement.appendChild(gridTable);

            this.boardData = schematic.map((rowString, yIdx) => {
                const rowChars = rowString.split('');
                const tableRow = document.createElement('tr');
                gridTable.appendChild(tableRow);

                return rowChars.map((char, xIdx) => {
                    let cellState = { type: 'empty', contentId: null };
                    let visualCell = null;

                    switch (char) {
                        case 'x':
                            visualCell = document.createElement('td');
                            visualCell.className = 'grid-cell boundary';
                            tableRow.appendChild(visualCell);
                            cellState.type = 'wall';
                            break;
                        case 'r':
                        case 'g':
                        case 'b':
                            visualCell = document.createElement('td');
                            visualCell.className = 'transparent';
                            tableRow.appendChild(visualCell);

                            const newBlob = new BlobObject(this, xIdx, yIdx, char === 'r' ? 'red' : char === 'g' ? 'green' : 'blue');
                            this.displayElement.appendChild(newBlob.visualContainer);
                            this.blobEntities.push(newBlob);
                            cellState.type = 'blob';
                            cellState.contentId = newBlob.uniqueIdentifier;
                            break;
                        default:
                            visualCell = document.createElement('td');
                            visualCell.className = 'transparent';
                            tableRow.appendChild(visualCell);
                            break;
                    }
                    return { ...cellState, visual: visualCell };
                });
            });
        }

        delineateBoundaries() {
            const numRows = this.boardData.length;
            const numCols = this.boardData[0].length;

            for (let y = 0; y < numRows; y++) {
                for (let x = 0; x < numCols; x++) {
                    const currentCell = this.boardData[y][x];
                    if (currentCell.type !== 'wall') continue;

                    const borderThickness = 'solid 1px #777';
                    const adjacentChecks = [
                        { attribute: 'borderBottom', dx: 0, dy: 1 },
                        { attribute: 'borderTop', dx: 0, dy: -1 },
                        { attribute: 'borderLeft', dx: -1, dy: 0 },
                        { attribute: 'borderRight', dx: 1, dy: 0 }
                    ];

                    adjacentChecks.forEach(({ attribute, dx, dy }) => {
                        const neighborY = y + dy;
                        const neighborX = x + dx;

                        if (neighborY >= 0 && neighborY < numRows && neighborX >= 0 && neighborX < numCols) {
                            const neighborCell = this.boardData[neighborY][neighborX];
                            if (neighborCell.type !== 'wall') {
                                currentCell.visual.style[attribute] = borderThickness;
                            }
                        } else {
                            currentCell.visual.style[attribute] = borderThickness;
                        }
                    });
                }
            }
        }

        awaitTransitionCompletion(callback) {
            const transitionEvents = ['transitionend', 'webkitTransitionEnd'];
            let timer = null;

            const cleanupAndExecute = () => {
                transitionEvents.forEach(eventName => this.displayElement.removeEventListener(eventName, handler));
                if (timer) clearTimeout(timer);
                setTimeout(callback, 0);
            };

            const handler = (e) => {
                if (e.target.classList.contains('blob-container')) {
                    cleanupAndExecute();
                }
            };

            transitionEvents.forEach(eventName => this.displayElement.addEventListener(eventName, handler));
            timer = setTimeout(cleanupAndExecute, 300); // Fallback timeout
        }

        initiateMovement(blobIdToMove, motionDeltaX, motionDeltaY) {
            if (this.isProcessingAction) return;

            const initialBlob = this.blobEntities.find(b => b.uniqueIdentifier === blobIdToMove);
            if (!initialBlob) return;

            const participatingBlobIds = this.determineMovingGroup(blobIdToMove, motionDeltaX, motionDeltaY);
            if (participatingBlobIds.length === 0) return;

            this.isProcessingAction = true;

            const movingBlobObjects = participatingBlobIds.map(id => this.blobEntities.find(b => b.uniqueIdentifier === id));

            this.shiftObjects(movingBlobObjects, motionDeltaX, motionDeltaY);

            this.awaitTransitionCompletion(() => {
                this.triggerDescent(() => {
                    this.resolveFusions();
                    this.isProcessingAction = false;
                });
            });
        }

        determineMovingGroup(startingBlobId, dirX, dirY) {
            const processingQueue = [startingBlobId];
            const alreadyVisited = new Set([startingBlobId]);
            const movementCandidates = [];

            let queueHead = 0;
            while (queueHead < processingQueue.length) {
                const currentBlobId = processingQueue[queueHead++];
                const currentBlob = this.blobEntities.find(b => b.uniqueIdentifier === currentBlobId);
                if (!currentBlob) continue;

                movementCandidates.push(currentBlobId);

                const currentBlobAbsoluteUnits = currentBlob.getAbsoluteUnitCoordinates();
                for (const [unitX, unitY] of currentBlobAbsoluteUnits) {
                    const nextX = unitX + dirX;
                    const nextY = unitY + dirY;

                    if (nextY < 0 || nextY >= this.boardData.length || nextX < 0 || nextX >= this.boardData[0].length) {
                        return [];
                    }

                    const targetCell = this.boardData[nextY][nextX];

                    if (targetCell.type === 'wall') {
                        return [];
                    }
                    if (targetCell.type === 'blob' && !alreadyVisited.has(targetCell.contentId)) {
                        alreadyVisited.add(targetCell.contentId);
                        processingQueue.push(targetCell.contentId);
                    }
                }
            }
            return movementCandidates;
        }

        shiftObjects(blobGroup, dx, dy) {
            blobGroup.forEach(blob => {
                blob.getAbsoluteUnitCoordinates().forEach(([x, y]) => {
                    if (y >= 0 && y < this.boardData.length && x >= 0 && x < this.boardData[0].length) {
                         if (this.boardData[y][x].contentId === blob.uniqueIdentifier) {
                            this.boardData[y][x].type = 'empty';
                            this.boardData[y][x].contentId = null;
                         }
                    }
                });
            });

            blobGroup.forEach(blob => {
                blob.updateAnchorPosition(blob.anchorX + dx, blob.anchorY + dy);
                blob.getAbsoluteUnitCoordinates().forEach(([x, y]) => {
                    if (y >= 0 && y < this.boardData.length && x >= 0 && x < this.boardData[0].length) {
                        this.boardData[y][x].type = 'blob';
                        this.boardData[y][x].contentId = blob.uniqueIdentifier;
                    }
                });
            });
        }

        triggerDescent(completionCallback) {
            let anyBlobMoved = false;
            let currentIterationHadMovement = true;
            while (currentIterationHadMovement) {
                currentIterationHadMovement = false;
                const blobsEligibleForFall = [];
                this.blobEntities.forEach(blob => {
                    const groupIfFalling = this.determineMovingGroup(blob.uniqueIdentifier, 0, 1);
                    if (groupIfFalling.length === 1 && groupIfFalling[0] === blob.uniqueIdentifier) {
                        blobsEligibleForFall.push(blob);
                    }
                });

                if (blobsEligibleForFall.length > 0) {
                    this.shiftObjects(blobsEligibleForFall, 0, 1);
                    currentIterationHadMovement = true;
                    anyBlobMoved = true;
                }
            }

            if (anyBlobMoved) {
                this.awaitTransitionCompletion(completionCallback);
            } else {
                completionCallback();
            }
        }

        resolveFusions() {
            let mergeOccurred = false;
            let workingBlobList = [...this.blobEntities];

            for (let i = 0; i < workingBlobList.length; i++) {
                const blobA = workingBlobList[i];
                if (!blobA || blobA.spatialUnits.length === 0) continue;

                const blobAUnits = blobA.getAbsoluteUnitCoordinates();
                for (const [unitX, unitY] of blobAUnits) {
                    const adjacencyDirections = [[1, 0], [0, 1]];
                    for (const [dx, dy] of adjacencyDirections) {
                        const neighborX = unitX + dx;
                        const neighborY = unitY + dy;

                        if (neighborY < 0 || neighborY >= this.boardData.length || neighborX < 0 || neighborX >= this.boardData[0].length) {
                            continue;
                        }

                        const neighborCell = this.boardData[neighborY][neighborX];
                        if (neighborCell.type === 'blob' && neighborCell.contentId !== blobA.uniqueIdentifier) {
                            const blobB = this.blobEntities.find(b => b.uniqueIdentifier === neighborCell.contentId);
                            if (blobB && blobB.objectColor === blobA.objectColor) {
                                blobA.absorbOtherBlob(blobB);
                                this.blobEntities = this.blobEntities.filter(b => b.uniqueIdentifier !== blobB.uniqueIdentifier);
                                mergeOccurred = true;
                                workingBlobList = [...this.blobEntities];
                                i = -1;
                                break;
                            }
                        }
                    }
                    if (mergeOccurred && i === -1) break;
                }
                if (mergeOccurred && i === -1) break;
            }

            if (mergeOccurred) {
                this.assessVictoryCondition();
            }
        }

        assessVictoryCondition() {
            const distinctColors = new Set();
            this.blobEntities.forEach(blob => distinctColors.add(blob.objectColor));

            if (distinctColors.size === this.blobEntities.length) {
                alert("Challenge conquered! Proceed to the next level!");
            }
        }
    }

    let currentLevelNumber = parseInt(location.search.substring(1), 10) || 1;
    const gameAreaContainer = document.getElementById('map');
    let currentInteractionCanvas = new InteractionCanvas(gameAreaContainer, puzzleLayouts[currentLevelNumber - 1]);
    window.gameInstance = currentInteractionCanvas;

    const levelSelectionDropdown = document.getElementById('level');
    for (let l = 1; l <= puzzleLayouts.length; l++) {
        const levelOption = document.createElement('option');
        levelOption.value = l;
        levelOption.textContent = `Phase ${l}`;
        levelSelectionDropdown.appendChild(levelOption);
    }
    levelSelectionDropdown.value = currentLevelNumber;

    levelSelectionDropdown.addEventListener('change', () => {
        location.search = '?' + levelSelectionDropdown.value;
    });

    document.getElementById('reset').addEventListener('click', () => {
        gameAreaContainer.innerHTML = '';
        currentInteractionCanvas = new InteractionCanvas(gameAreaContainer, puzzleLayouts[currentLevelNumber - 1]);
        window.gameInstance = currentInteractionCanvas;
    });

})();