String.prototype.segmentTextForDisplay = function(maximumCharactersPerSegment) {
    let combinedSegmentsAccumulator = '';
    let segmentCounter = 1;
    let currentInputSequence = this.toString();

    const processRecursiveSegmentation = (remainingText, lineCount, currentOutput) => {
        if (remainingText.length <= maximumCharactersPerSegment) {
            return [lineCount, currentOutput + remainingText];
        }

        let currentConsideredPortion = remainingText.slice(0, maximumCharactersPerSegment);
        let newlineIndicator = currentConsideredPortion.indexOf('\n');
        let whitespaceBreakpoint = currentConsideredPortion.lastIndexOf(' ');
        
        let effectiveSplitPoint;
        if (newlineIndicator !== -1) {
            effectiveSplitPoint = newlineIndicator;
        } else if (whitespaceBreakpoint !== -1) {
            effectiveSplitPoint = whitespaceBreakpoint;
        } else {
            effectiveSplitPoint = maximumCharactersPerSegment;
        }

        let segmentToAppend = currentConsideredPortion.slice(0, effectiveSplitPoint);
        let subsequentTextRemainder = remainingText.slice(effectiveSplitPoint + 1);

        return processRecursiveSegmentation(subsequentTextRemainder, lineCount + 1, currentOutput + segmentToAppend + '\n');
    };

    return processRecursiveSegmentation(currentInputSequence, segmentCounter, combinedSegmentsAccumulator);
};

CanvasRenderingContext2D.prototype.determineLineRequirement = function(contentString, maxPixelWidth) {
    let measuredPixelWidth = this.measureText(contentString).width;
    if (measuredPixelWidth < maxPixelWidth) {
        return 1;
    }
    let charLimitApproximation = Math.floor(maxPixelWidth * contentString.length / measuredPixelWidth);
    return contentString.segmentTextForDisplay(charLimitApproximation)[0];
};

CanvasRenderingContext2D.prototype.renderMultilineText = function(textValue, startXCoordinate, startYCoordinate, maxRenderWidth, lineSpacingValue) {
    let actualLineSpacing = lineSpacingValue === undefined ? 12 : lineSpacingValue;
    let textPixelDimension = this.measureText(textValue).width;
    let characterBoundary = Math.floor(maxRenderWidth * textValue.length / textPixelDimension);
    let fragmentedTextOutput = textValue.segmentTextForDisplay(characterBoundary)[1];
    let individualTextLines = fragmentedTextOutput.split('\n');

    individualTextLines.forEach((currentLine, lineIndex) => {
        let currentYDrawingPosition = startYCoordinate + (lineIndex + 1) * actualLineSpacing;
        this.fillText(currentLine, startXCoordinate, currentYDrawingPosition);
    });
};

// --- Helper class clones ---

let GraphInteractionController = function(displayInstance) {
    this.display = displayInstance;
    this.latestPointerPosition = {x: 0, y: 0};
    this.initialize = function() {};
};

let InputDeviceHandler = function(displayInstance) {
    this.display = displayInstance;
    this.initialize = function() {};
};

let DataGraphStore = function(displayInstance) {
    this.display = displayInstance;
    this.metadata = null;
    this.payload = null;
    this.branchPointers = {};

    this.initialize = function(metaObject, dataObject) {
        this.metadata = metaObject;
        this.payload = dataObject;
        
        if (metaObject) {
            if (metaObject.blocks) {
                displayInstance.userLaneInformation = metaObject.blocks;
            }
            if (metaObject.heads) {
                this.branchPointers = metaObject.heads;
            }
            this.metadata.timelineDates = metaObject.dates;
            this.metadata.laneBlocks = metaObject.blocks;
        }
    };

    this.obtainCommitRecord = function(index) {
        if (this.payload && index >= 0 && index < this.payload.length) {
            return this.payload[index];
        }
        return null;
    };
};

// --- Main class clone ---

let VisualGraphRenderer = function(viewPortId, plotWidth, plotHeight, nameColumnWidth, metadataObject, graphPayload) {
    this.domElement = document.getElementById(viewPortId);
    this.plotHeight = plotHeight === undefined ? 600 : plotHeight;
    this.plotWidth = plotWidth === undefined ? 920 : plotWidth;
    this.domElement.width = this.plotWidth;
    this.domElement.height = this.plotHeight;

    this.nameColumnWidth = nameColumnWidth === undefined ? 100 : nameColumnWidth;
    
    this.horizontalShift = this.nameColumnWidth;
    this.verticalShift = 40;

    this.hoveredElements = [];
    this.cachedImages = {};

    this.renderLabels = true;

    this.maximumXExtent = -this.plotWidth + (this.horizontalShift * 2);
    this.maximumYExtent = -this.plotHeight + (this.verticalShift * 2) + 100;
    this.dataLoadingInProgress = false;
    this.paletteColors = ["#000000", "#FF0000", "#0000FF", "#7CFC00", "#FF00FF", "#FFFF00", "#FFA500", "#00FFFF", "#FF69B4", "#CD853F"];

    this.userLaneInformation = [];

    this.interactionController = new GraphInteractionController(this);
    this.interactionController.initialize();
    this.inputHandler = new InputDeviceHandler(this);
    this.inputHandler.initialize();

    this.dataStore = new DataGraphStore(this);
    this.dataStore.initialize(metadataObject, graphPayload);
};

VisualGraphRenderer.prototype = {
    updateVisuals: function() {
        if (!this.dataStore.metadata || !this.dataStore.payload) {
            return;
        }

        if (this.domElement.getContext) {
            let renderContext = this.domElement.getContext('2d');
            renderContext.font = "small sans-serif";
            this.illustrateBackgroundLanes(renderContext);
            this.plotGraphElements(renderContext);
            this.layoutNameLabels(renderContext);
            this.paintTimeBars(renderContext);
            this.paintDateBars(renderContext);
            this.annotateTimeline(renderContext);
            
            renderContext.fillStyle = "black";
            renderContext.fillRect(0, 0, this.nameColumnWidth, 20);
            renderContext.fillStyle = "rgb(64,64,64)";
            renderContext.fillRect(0, 20, this.nameColumnWidth, 20);
            if (this.activeTooltipPoint) {
                this.displayTooltip(renderContext, this.activeTooltipPoint);
            }
        }
    },
    displayTooltip: function(renderContext, tooltipData) {
        let originX = (this.nameColumnWidth * 2) + (20 * tooltipData.timelinePosition) - this.horizontalShift + 10;
        let originY = 80 + 20 * tooltipData.laneIndex - this.verticalShift - 10;
        
        renderContext.font = "small sans-serif";
        renderContext.fillStyle = "black";
        let textLineCount = renderContext.determineLineRequirement(tooltipData.messageContent, 400 - 15 - 15);
        let boxHeight = 70 + textLineCount * 15 + 5;

        if (originX + 10 + 400 > this.plotWidth) {
            originX = this.plotWidth - 400 - 10;
        } else if (originX + 10 < this.nameColumnWidth) {
            originX = this.nameColumnWidth + 10;
        } else {
            originX += 10;
        }

        if (originY + 10 + boxHeight > this.plotHeight) {
            originY = Math.max(40, originY - 10 - boxHeight);
        } else if (originY < 40) {
            originY = 40 + 10;
        } else {
            originY += 10;
        }
        
        renderContext.beginPath();
        renderContext.strokeStyle = "black";
        renderContext.fillStyle = "white";
        renderContext.lineWidth = "2";
        renderContext.moveTo(originX, originY + 5);
        renderContext.quadraticCurveTo(originX, originY, originX + 5, originY);
        renderContext.lineTo(originX + 400 - 5, originY);
        renderContext.quadraticCurveTo(originX + 400, originY, originX + 400, originY + 5);
        renderContext.lineTo(originX + 400, originY + boxHeight - 5);
        renderContext.quadraticCurveTo(originX + 400, originY + boxHeight, originX + 395, originY + boxHeight);
        renderContext.lineTo(originX + 5, originY + boxHeight);
        renderContext.quadraticCurveTo(originX, originY + boxHeight, originX, originY + boxHeight - 5);
        renderContext.lineTo(originX, originY + 5);
        renderContext.fill();
        renderContext.stroke();

        if (!this.cachedImages[tooltipData.gravatarHash]) {
            this.cachedImages[tooltipData.gravatarHash] = new Image();
            this.cachedImages[tooltipData.gravatarHash].src = "http://www.gravatar.com/avatar/" + tooltipData.gravatarHash + "?s=32";
            let selfRef = this;
            this.cachedImages[tooltipData.gravatarHash].onload = function() {
                if (tooltipData === selfRef.activeTooltipPoint)
                    renderContext.drawImage(selfRef.cachedImages[tooltipData.gravatarHash], originX + 15, originY + 15);
            };
        } else {
            renderContext.drawImage(this.cachedImages[tooltipData.gravatarHash], originX + 15, originY + 15);
        }
        
        renderContext.fillStyle = "black";
        renderContext.font = "medium sans-serif";
        renderContext.fillText(tooltipData.authorName, originX + 15 + 32 + 15, originY + 35);
        
        renderContext.font = "small sans-serif";
        renderContext.fillStyle = "grey";
        renderContext.fillText(tooltipData.commitIdentifier, originX + 15, originY + 65);
        
        renderContext.font = "small sans-serif";
        renderContext.fillStyle = "black";
        this.renderMultilineText(tooltipData.messageContent, originX + 15, originY + 70, 400 - 15 - 15);
    },
    paintTimeBars: function(renderContext) {
        renderContext.fillStyle = "black";
        renderContext.fillRect(0, 0, this.plotWidth, 20);
    },
    paintDateBars: function(renderContext) {
        renderContext.fillStyle = "rgb(64,64,64)";
        renderContext.fillRect(0, 20, this.plotWidth, 20);
    },
    renderNameStrip: function(renderContext, indexVal) {
        let fillPatternA = "rgb(235,235,255)";
        let fillPatternB = "rgb(224,224,255)";
        let entityDetails = this.dataStore.metadata.laneBlocks[indexVal];
        let verticalStart = 80 + entityDetails.startPosition * 20;
        let verticalEnd = verticalStart + entityDetails.elementCount * 20;
        
        if ( (verticalStart - this.verticalShift >= 40 && verticalStart - this.verticalShift <= this.plotHeight) ||
             (verticalEnd - this.verticalShift >= 40 && verticalEnd - this.verticalShift <= this.plotHeight) ) {
            
            if (this.interactionController.latestPointerPosition.y > verticalStart - this.verticalShift &&
                this.interactionController.latestPointerPosition.y <= verticalEnd - this.verticalShift &&
                this.interactionController.latestPointerPosition.x <= this.nameColumnWidth) {
                renderContext.fillStyle = "rgb(223,223,243)";
                renderContext.fillRect(0, verticalStart - this.verticalShift, this.nameColumnWidth, entityDetails.elementCount * 20);
            } else if (indexVal % 2 === 1) {
                renderContext.fillStyle = fillPatternB;
                renderContext.fillRect(0, verticalStart - this.verticalShift, this.nameColumnWidth, entityDetails.elementCount * 20);
            }
            
            renderContext.strokeStyle = "rgb(222,222,222)";
            renderContext.lineWidth = "1";
            renderContext.beginPath();
            renderContext.moveTo(this.nameColumnWidth, verticalStart - this.verticalShift + 0.5);
            renderContext.lineTo(0.5, verticalStart - this.verticalShift + 0.5);
            renderContext.lineTo(0.5, verticalEnd - this.verticalShift + 0.5);
            renderContext.lineTo(this.nameColumnWidth, verticalEnd - this.verticalShift + 0.5);
            renderContext.stroke();
            
            renderContext.fillStyle = "black";
            renderContext.fillText(entityDetails.identifier, 5, (verticalStart + verticalEnd) / 2 - this.verticalShift + 5, this.nameColumnWidth - 10);
        }
    },
    layoutNameLabels: function(renderContext) {
        renderContext.save();
        renderContext.fillStyle = "rgb(235,235,255)";
        renderContext.fillRect(0, 40, this.nameColumnWidth, this.plotHeight - 40);
        for (let iteratorA = 0; iteratorA < this.dataStore.metadata.laneBlocks.length; iteratorA++) {
            this.renderNameStrip(renderContext, iteratorA);
        }
        renderContext.restore();
    },
    illustrateBackgroundLanes: function(renderContext) {
        let laneFillColors = ["rgb(245,245,255)", "rgb(240,240,255)"];
        let currentYAccumulator = 80;
        renderContext.save();
        renderContext.fillStyle = laneFillColors[0];
        renderContext.fillRect(this.nameColumnWidth, 40, this.plotWidth - this.nameColumnWidth, this.plotHeight - 40);
        for (let laneIterator = 0; laneIterator < this.dataStore.metadata.laneBlocks.length; laneIterator++) {
            let entityDetails = this.dataStore.metadata.laneBlocks[laneIterator];
            let targetY = currentYAccumulator + entityDetails.elementCount * 20;
            if ( (currentYAccumulator - this.verticalShift >= 40 && currentYAccumulator - this.verticalShift <= this.plotHeight) ||
                 (targetY - this.verticalShift >= 40 && targetY - this.verticalShift <= this.plotHeight) ) {
                if (laneIterator % 2 === 1) {
                    renderContext.fillStyle = laneFillColors[1];
                    renderContext.fillRect(this.nameColumnWidth, currentYAccumulator - this.verticalShift, this.plotWidth - this.nameColumnWidth, entityDetails.elementCount * 20);
                }
                renderContext.lineWidth = "1";
                renderContext.strokeStyle = "rgb(222,222,222)";
                renderContext.strokeRect(0.5, currentYAccumulator - this.verticalShift + 0.5, this.plotWidth - 0.5, entityDetails.elementCount * 20);
            }
            currentYAccumulator += entityDetails.elementCount * 20;
        }
        renderContext.restore();
    },
    annotateTimeline: function(renderContext) {
        let monthAbbreviationsMap = {
            "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
            "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec"
        };
        let previousDateComponents;
        let currentDateComponents;
        let minIndex = Math.floor((this.horizontalShift - this.nameColumnWidth) / 20);
        if (minIndex <= 0) {
            previousDateComponents = [1970, 1, 1];
        } else {
            previousDateComponents = this.dataStore.metadata.timelineDates[minIndex - 1].split("-");
        }

        for (let timeIterator = minIndex; timeIterator <= Math.floor((this.horizontalShift - this.nameColumnWidth + this.plotWidth) / 20); timeIterator++) {
            let dateValue = this.dataStore.metadata.timelineDates[timeIterator];
            if (!dateValue)
                continue;
            currentDateComponents = dateValue.split("-");
            let xCoordinate = (2 * this.nameColumnWidth) + 20 * timeIterator - this.horizontalShift;
            
            if (currentDateComponents[0] !== previousDateComponents[0] || currentDateComponents[1] !== previousDateComponents[1]) {
                renderContext.fillStyle = "white";
                renderContext.fillText(monthAbbreviationsMap[currentDateComponents[1]], xCoordinate, 15);
            }
            
            if (currentDateComponents[0] !== previousDateComponents[0] || currentDateComponents[1] !== previousDateComponents[1] || currentDateComponents[2] !== previousDateComponents[2]) {
                renderContext.fillStyle = "rgb(192,192,192)";
                renderContext.fillText(currentDateComponents[2], xCoordinate, 35);
            }
            previousDateComponents = currentDateComponents;
        }
    },
    placeBranchMarker: function(renderContext, markerLabel, markerX, markerY) {
        renderContext.save();
        renderContext.font = "10px monospace";
        let labelWidth = renderContext.measureText(markerLabel).width;
        
        renderContext.beginPath();
        renderContext.fillStyle = "black";
        renderContext.globalAlpha = 0.8;
        renderContext.moveTo(markerX, markerY);
        renderContext.lineTo(markerX - 4, markerY + 10);
        renderContext.quadraticCurveTo(markerX - 8, markerY + 10, markerX - 8, markerY + 15);
        renderContext.lineTo(markerX - 8, markerY + 15 + labelWidth);
        renderContext.quadraticCurveTo(markerX - 8, markerY + 15 + labelWidth + 5, markerX - 4, markerY + 15 + labelWidth + 5);
        renderContext.lineTo(markerX + 4, markerY + 15 + labelWidth + 5);
        renderContext.quadraticCurveTo(markerX + 8, markerY + 15 + labelWidth + 5, markerX + 8, markerY + 15 + labelWidth);
        renderContext.lineTo(markerX + 8, markerY + 15);
        renderContext.quadraticCurveTo(markerX + 8, markerY + 10, markerX + 4, markerY + 10);
        renderContext.lineTo(markerX, markerY);
        renderContext.fill();
        
        renderContext.globalAlpha = 1.0;
        renderContext.fillStyle = "white";
        renderContext.textBaseline = "middle";
        renderContext.rotate(Math.PI / 2);
        renderContext.fillText(markerLabel, markerY + 15, -markerX);
        renderContext.rotate(-Math.PI / 2);
        renderContext.restore();
        return labelWidth + 5 + 15;
    },
    plotCommitPoints: function(renderContext) {
        this.hoveredElements = [];
        for (let timeIterator = Math.floor((this.horizontalShift - this.nameColumnWidth) / 20); timeIterator <= Math.floor((this.horizontalShift - this.nameColumnWidth + this.plotWidth) / 20); timeIterator++) {
            let commitRecord = this.dataStore.obtainCommitRecord(timeIterator);
            if (!commitRecord)
                continue;
            let currentX = (this.nameColumnWidth * 2) + (20 * commitRecord.timelinePosition) - this.horizontalShift + 10;
            let currentY = 80 + 20 * commitRecord.laneIndex - this.verticalShift - 10;
            
            if (currentX > this.nameColumnWidth - 20 && currentX < this.plotWidth + 20 && currentY > 20 && currentY < this.plotHeight + 20) {
                renderContext.beginPath();
                if (commitRecord === this.activeTooltipPoint) {
                    renderContext.fillStyle = "white";
                    renderContext.arc(currentX, currentY, 6, 0, (Math.PI * 2), false);
                    renderContext.fill();
                    renderContext.beginPath();
                    renderContext.fillStyle = this.paletteColors[(commitRecord.laneIndex - 1) % this.paletteColors.length];
                    renderContext.arc(currentX, currentY, 5, 0, (Math.PI * 2), false);
                    renderContext.fill();
                } else {
                    renderContext.fillStyle = this.paletteColors[(commitRecord.laneIndex - 1) % this.paletteColors.length];
                    renderContext.arc(currentX, currentY, 3, 0, (Math.PI * 2), false);
                    renderContext.fill();
                }
                this.hoveredElements.push({"xCoord": currentX, "yCoord": currentY, "commitInfo": commitRecord});
            }
        }
    },
    addBranchIndicators: function(renderContext) {
        if (!this.renderLabels) return;
        for (let timeIterator = Math.floor((this.horizontalShift - this.nameColumnWidth) / 20); timeIterator <= Math.floor((this.horizontalShift - this.nameColumnWidth + this.plotWidth) / 20); timeIterator++) {
            let commitRecord = this.dataStore.obtainCommitRecord(timeIterator);
            if (!commitRecord)
                continue;
            let currentX = (this.nameColumnWidth * 2) + (20 * commitRecord.timelinePosition) - this.horizontalShift + 10;
            let currentY = 80 + 20 * commitRecord.laneIndex - this.verticalShift - 10;
            let markerYPosition = currentY + 5;
            if (this.dataStore.branchPointers[this.userLaneInformation[commitRecord.laneIndex - 1].name] && this.dataStore.branchPointers[this.userLaneInformation[commitRecord.laneIndex - 1].name][commitRecord.commitIdentifier]) {
                for (let labelIterator = 0; labelIterator < this.dataStore.branchPointers[this.userLaneInformation[commitRecord.laneIndex - 1].name][commitRecord.commitIdentifier].length; labelIterator++) {
                    let markerLabel = this.dataStore.branchPointers[this.userLaneInformation[commitRecord.laneIndex - 1].name][commitRecord.commitIdentifier][labelIterator];
                    markerYPosition += this.placeBranchMarker(renderContext, markerLabel, currentX, markerYPosition) + 5;
                }
            }
        }
    },
    isPathSegmentVisible: function(sourceX, sourceY, targetX, targetY) {
        const minCanvasX = this.nameColumnWidth - 20;
        const maxCanvasX = this.plotWidth + 20;
        const minCanvasY = 20;
        const maxCanvasY = this.plotHeight + 20;

        const minSegmentX = Math.min(sourceX, targetX);
        const maxSegmentX = Math.max(sourceX, targetX);
        const minSegmentY = Math.min(sourceY, targetY);
        const maxSegmentY = Math.max(sourceY, targetY);
        
        const intersectsHorizontal = (minSegmentX < maxCanvasX && maxSegmentX > minCanvasX);
        const intersectsVertical = (minSegmentY < maxCanvasY && maxSegmentY > minCanvasY);
        
        return intersectsHorizontal && intersectsVertical;
    },
    connectCommitPaths: function(renderContext) {
        for (let timeIterator = this.dataStore.metadata.timelineDates.length - 1; timeIterator >= Math.floor((this.horizontalShift - this.nameColumnWidth) / 20); timeIterator--) {
            let currentCommit = this.dataStore.obtainCommitRecord(timeIterator);
            if (!currentCommit)
                continue;
            let currentX = (this.nameColumnWidth * 2) + (20 * currentCommit.timelinePosition) - this.horizontalShift + 10;
            let currentY = 80 + 20 * currentCommit.laneIndex - this.verticalShift - 10;
            renderContext.strokeStyle = this.paletteColors[(currentCommit.laneIndex - 1) % this.paletteColors.length];
            renderContext.lineWidth = 2;

            let primaryPathTaken = false;
            for (let parentIterator = 0; parentIterator < currentCommit.ancestors.length; parentIterator++) {
                let parentDetails = currentCommit.ancestors[parentIterator];
                if (parentDetails[2] === currentCommit.laneIndex) {
                    primaryPathTaken = true;
                }
            }
            
            for (let parentIterator = 0; parentIterator < currentCommit.ancestors.length; parentIterator++) {
                let parentDetails = currentCommit.ancestors[parentIterator];
                let destinationX = (this.nameColumnWidth * 2) + (20 * parentDetails[1]) - this.horizontalShift + 10;
                let destinationY = 80 + 20 * parentDetails[2] - this.verticalShift - 10;

                if (!this.isPathSegmentVisible(currentX, currentY, destinationX, destinationY))
                    continue;
                
                if (parentDetails[2] === currentCommit.laneIndex) {
                    renderContext.beginPath();
                    renderContext.strokeStyle = this.paletteColors[(currentCommit.laneIndex - 1) % this.paletteColors.length];
                    renderContext.moveTo(currentX - 5, currentY);
                    renderContext.lineTo(destinationX + 5, currentY);
                    renderContext.stroke();
                } else if (parentDetails[2] > currentCommit.laneIndex) {
                    renderContext.beginPath();
                    renderContext.lineWidth = 2;
                    renderContext.strokeStyle = this.paletteColors[(parentDetails[2] - 1) % this.paletteColors.length];
                    renderContext.fillStyle = this.paletteColors[(parentDetails[2] - 1) % this.paletteColors.length];
                    renderContext.moveTo(destinationX + 5, destinationY);
                    renderContext.lineTo(currentX - 11, destinationY);
                    renderContext.lineTo(currentX - 11, currentY + 13);
                    renderContext.lineTo(currentX - 9, currentY + 9);
                    renderContext.stroke();
                    
                    renderContext.beginPath();
                    renderContext.lineWidth = 1;
                    renderContext.moveTo(currentX - 5, currentY + 5);
                    renderContext.lineTo(currentX - 13, currentY + 8);
                    renderContext.lineTo(currentX - 7, currentY + 14);
                    renderContext.lineTo(currentX - 5, currentY + 5);
                    renderContext.fill();
                } else {
                    if (primaryPathTaken === false) {
                        renderContext.beginPath();
                        renderContext.strokeStyle = this.paletteColors[(currentCommit.laneIndex - 1) % this.paletteColors.length];
                        renderContext.fillStyle = this.paletteColors[(currentCommit.laneIndex - 1) % this.paletteColors.length];
                        
                        renderContext.lineWidth = 1;
                        renderContext.moveTo(currentX - 5, currentY);
                        renderContext.lineTo(currentX - 5 - 9, currentY - 3.5);
                        renderContext.lineTo(currentX - 5 - 9, currentY + 3.5);
                        renderContext.lineTo(currentX - 5, currentY);
                        renderContext.fill();
                        
                        renderContext.beginPath();
                        renderContext.lineWidth = 2;
                        renderContext.moveTo(currentX - 5 - 8, currentY);
                        renderContext.lineTo(destinationX, currentY);
                        renderContext.lineTo(destinationX, destinationY + 5);
                        renderContext.stroke();
                    } else {
                        renderContext.beginPath();
                        renderContext.lineWidth = 2;
                        renderContext.strokeStyle = this.paletteColors[(currentCommit.laneIndex - 1) % this.paletteColors.length];
                        renderContext.fillStyle = this.paletteColors[(currentCommit.laneIndex - 1) % this.paletteColors.length];
                        renderContext.moveTo(destinationX, destinationY + 5);
                        renderContext.lineTo(destinationX, currentY - 12);
                        renderContext.lineTo(currentX - 12, currentY - 12);
                        renderContext.lineTo(currentX - 9, currentY - 9);
                        renderContext.stroke();
                        
                        renderContext.beginPath();
                        renderContext.lineWidth = 1;
                        renderContext.moveTo(currentX - 5, currentY - 5);
                        renderContext.lineTo(currentX - 13, currentY - 8);
                        renderContext.lineTo(currentX - 7, currentY - 14);
                        renderContext.lineTo(currentX - 5, currentY - 5);
                        renderContext.fill();
                    }
                }
            }
        }
    },
    plotGraphElements: function(renderContext) {
        this.connectCommitPaths(renderContext);
        this.plotCommitPoints(renderContext);
        this.addBranchIndicators(renderContext);
    }
};