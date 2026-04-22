class LexiconLayoutEngine {
    constructor(hostElementHandle, configurationSettings) {
        if (!hostElementHandle) {
            throw new Error("A valid DOM element must be provided for the LexiconLayoutEngine.");
        }

        this.hostElement = hostElementHandle;
        this.displayAreaWidth = this.hostElement.offsetWidth;
        this.displayAreaHeight = this.hostElement.offsetHeight;

        const supportsCanvasAPI = !!document.createElement('canvas').getContext;
        if (!supportsCanvasAPI) {
            this.hostElement.innerHTML = '<br><br><center>This component requires HTML5 Canvas support, available in modern browsers.</center>';
            return;
        }

        this.configuration = {
            'backgroundShade': '#ffffff',
            'glyphColor': '#000000',
            'typeface': 'Baskerville, Times New Roman, Serif',
            'minGlyphSize': 16,
            'maxGlyphSize': 64,
            'padding': 1,
            'orientationStrategy': 'random',
            'boundaryImage': 'none',
            'maxPlacementAttempts': 1500,
            'minTravelDistance': 2,
            'maxTravelDistance': 4,
            'sortBySizeMetric': true,
            'boundaryText': "VISUAL\nTEXT",
            'searchPattern': 'spiral',
            'angleIncrement': (Math.PI / 40),
            'isOperationPaused': false,
            'isOperationStopped': false,
            'inactivityTimeoutMillis': 2 * 60 * 1000,
            'highDPIFactor': 2,
            ...configurationSettings
        };

        const primaryCanvasOutput = this.constructOffscreenBuffer(this.displayAreaWidth, this.displayAreaHeight);
        this.primaryCanvas = primaryCanvasOutput.element;
        this.primaryRenderContext = primaryCanvasOutput.context;

        this.hostElement.innerHTML = '';
        this.hostElement.appendChild(this.primaryCanvas);

        const compositeLayerOutput = this.constructOffscreenBuffer(this.displayAreaWidth, this.displayAreaHeight);
        this.compositeTermLayer = compositeLayerOutput.element;
        this.compositeRenderContext = compositeLayerOutput.context;

        const highResCompositeLayerOutput = this.constructOffscreenBuffer(
            this.displayAreaWidth * this.configuration.highDPIFactor,
            this.displayAreaHeight * this.configuration.highDPIFactor
        );
        this.highResCompositeLayer = highResCompositeLayerOutput.element;
        this.highResRenderContext = highResCompositeLayerOutput.context;

        const occupiedSpaceMaskOutput = this.constructOffscreenBuffer(this.displayAreaWidth, this.displayAreaHeight);
        this.occupiedSpaceMask = occupiedSpaceMaskOutput.element;
        this.occupiedSpaceContext = occupiedSpaceMaskOutput.context;

        const prospectiveTermMaskOutput = this.constructOffscreenBuffer(this.displayAreaWidth, this.displayAreaHeight);
        this.prospectiveTermMask = prospectiveTermMaskOutput.element;
        this.prospectiveTermContext = prospectiveTermMaskOutput.context;

        const temporaryProbeMaskOutput = this.constructOffscreenBuffer(this.displayAreaWidth, this.displayAreaHeight);
        this.temporaryProbeMask = temporaryProbeMaskOutput.element;
        this.temporaryProbeContext = temporaryProbeMaskOutput.context;

        this.occupiedPixelDataSnapshot = null;
        this.previousFrameWasIdle = false;
        this.accumulatedInactivityTime = 0;
        this.perpetualTermMode = false;
        this.queuedTerms = [];
        this.currentTermForPlacement = null;
        this.isVisualsBeingUpdated = false;

        this.animationFrameIdentifier = null;
        this.hueRotation = 0;

        this.frameUpdateLoop = this.frameUpdateLoop.bind(this);
    }

    constructOffscreenBuffer(dimensionWidth, dimensionHeight) {
        const bufferElement = document.createElement('canvas');
        bufferElement.width = dimensionWidth;
        bufferElement.height = dimensionHeight;
        const bufferContext = bufferElement.getContext('2d');
        return { element: bufferElement, context: bufferContext };
    }

    convertNumericColorToRGBA(colorValueNumeric, alphaValue = 1.0) {
        const redChan = (colorValueNumeric >> 16) & 0xff;
        const greenChan = (colorValueNumeric >> 8) & 0xff;
        const blueChan = (colorValueNumeric >> 0) & 0xff;
        return `rgba(${redChan},${greenChan},${blueChan},${alphaValue})`;
    }

    generateCyclicHueColor() {
        this.hueRotation = (this.hueRotation + 1) % 360;
        return `hsl(${this.hueRotation}, 100%, 50%)`;
    }

    frameUpdateLoop() {
        if (this.configuration.isOperationStopped) {
            cancelAnimationFrame(this.animationFrameIdentifier);
            return;
        }

        const currentOperationPaused = this.configuration.isOperationPaused;
        if (currentOperationPaused) {
            if (!this.previousFrameWasIdle) {
                this.renderVisuals();
            }
            this.previousFrameWasIdle = true;
            this.animationFrameIdentifier = requestAnimationFrame(this.frameUpdateLoop);
            return;
        }
        this.previousFrameWasIdle = false;

        if (this.isVisualsBeingUpdated) {
            this.animationFrameIdentifier = requestAnimationFrame(this.frameUpdateLoop);
            return;
        }
        this.isVisualsBeingUpdated = true;

        this.attemptLayoutIteration();
        this.renderVisuals();

        this.isVisualsBeingUpdated = false;
        this.animationFrameIdentifier = requestAnimationFrame(this.frameUpdateLoop);
    }

    renderVisuals() {
        this.primaryRenderContext.clearRect(0, 0, this.displayAreaWidth, this.displayAreaHeight);
        this.primaryRenderContext.drawImage(this.compositeTermLayer, 0, 0, this.displayAreaWidth, this.displayAreaHeight);

        const currentTerm = this.retrieveNextPendingTerm(false);
        if (currentTerm && !currentTerm.isPlaced) {
            let termDisplayColor = this.configuration.glyphColor;
            if (termDisplayColor === 'rainbow') {
                termDisplayColor = this.generateCyclicHueColor();
            }

            this.primaryRenderContext.fillStyle = termDisplayColor;
            this.primaryRenderContext.globalCompositeOperation = 'source-over';
            this.drawIndividualTerm(this.primaryRenderContext, currentTerm);
        }
    }

    initializeFromCorpus(rawTextInput) {
        const termFrequencies = this.deriveTermCounts(rawTextInput);
        this.configureFromCounts(termFrequencies);
    }

    deriveTermCounts(corpusContent) {
        const commonLexicon = new Set([
            "a", "about", "above", "accordingly", "after", "again", "against", "ah", "all", "also", "although", "always", "am", "among", "amongst", "an",
            "and", "any", "anymore", "anyone", "are", "as", "at", "away", "be", "been",
            "begin", "beginning", "beginnings", "begins", "begone", "begun", "being",
            "below", "between", "but", "by", "ca", "can", "cannot", "come", "could",
            "did", "do", "doing", "during", "each", "either", "else", "end", "et",
            "etc", "even", "ever", "far", "ff", "following", "for", "from", "further", "furthermore",
            "get", "go", "goes", "going", "got", "had", "has", "have", "he", "her",
            "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into",
            "is", "it", "its", "itself", "last", "lastly", "less", "many", "may", "me",
            "might", "more", "must", "my", "myself", "near", "nearly", "never", "new",
            "next", "no", "not", "now", "o", "of", "off", "often", "oh", "on", "only",
            "or", "other", "otherwise", "our", "ourselves", "out", "over", "perhaps",
            "put", "puts", "quite", "s", "said", "saw", "say", "see", "seen", "shall",
            "she", "should", "since", "so", "some", "such", "t", "than", "that", "the",
            "their", "them", "themselves", "then", "there", "therefore", "these", "they",
            "this", "those", "though", "throughout", "thus", "to", "too",
            "toward", "unless", "until", "up", "upon", "us", "ve", "very", "was", "we",
            "were", "what", "whatever", "when", "where", "which", "while", "who",
            "whom", "whomever", "whose", "why", "with", "within", "without", "would",
            "yes", "your", "yours", "yourself", "yourselves", "rt", "http", "www", "com", "you", "de",
            "re", "ll", "ex", "didn", "mr", "mrs"
        ]);

        const processedText = corpusContent.toLowerCase()
                                          .replace(/[^a-z0-9\s]/g, ' ')
                                          .replace(/\s+/g, ' ')
                                          .trim();

        const tokenizedTerms = processedText.split(' ').filter(term => term.length > 1 && !commonLexicon.has(term));

        const termOccurrenceCounts = new Map();
        tokenizedTerms.forEach(term => {
            termOccurrenceCounts.set(term, (termOccurrenceCounts.get(term) || 0) + 1);
        });

        return termOccurrenceCounts;
    }

    configureFromCounts(termCountsMap) {
        let maximumCount = 1;
        for (const count of termCountsMap.values()) {
            if (count > maximumCount) {
                maximumCount = count;
            }
        }

        const smallestSize = parseInt(this.configuration.minGlyphSize);
        const largestSize = parseInt(this.configuration.maxGlyphSize);
        const sizeDifference = (largestSize - smallestSize);

        const calculatedTermDescriptions = [];
        for (const [termContent, termCount] of termCountsMap.entries()) {
            const relativeOccurrence = (termCount - 1) / (maximumCount - 1);
            const termDisplaySize = smallestSize + (relativeOccurrence * sizeDifference);
            calculatedTermDescriptions.push({ content: termContent, size: termDisplaySize });
        }

        this.prepareLayout(calculatedTermDescriptions, false);
    }

    configureFromRandomCounts(rawInputString) {
        const uniqueTerms = this.deriveTermCounts(rawInputString);

        const smallestSize = parseInt(this.configuration.minGlyphSize);
        const largestSize = parseInt(this.configuration.maxGlyphSize);
        const sizeDifference = (largestSize - smallestSize);

        const calculatedTermDescriptions = [];
        for (const [termContent] of uniqueTerms.entries()) {
            let randomModifier = Math.random();
            randomModifier *= randomModifier;
            randomModifier *= randomModifier;
            const termDisplaySize = smallestSize + (randomModifier * sizeDifference);
            calculatedTermDescriptions.push({ content: termContent, size: termDisplaySize });
        }

        this.prepareLayout(calculatedTermDescriptions, true);
    }

    prepareLayout(termDescriptions, perpetualMode) {
        this.originalTermDescriptions = termDescriptions;
        this.queuedTerms = [];
        this.configuration.isOperationPaused = false;
        this.configuration.isOperationStopped = false;
        this.perpetualTermMode = perpetualMode;
        this.accumulatedInactivityTime = 0;

        const boundarySource = this.configuration.boundaryImage;
        if (boundarySource === 'none' || boundarySource === 'text') {
            this.boundaryGraphic = null;
            this.finalizeLayoutPreparation();
        } else {
            this.boundaryGraphic = new Image();
            this.boundaryGraphic.onload = () => this.finalizeLayoutPreparation();
            this.boundaryGraphic.src = boundarySource;
        }
    }

    finalizeLayoutPreparation() {
        this.isVisualsBeingUpdated = false;

        this.originalTermDescriptions.forEach(termData => {
            this.queuedTerms.push({
                ...termData,
                isPlaced: false,
                placementAttempts: 0,
                xCoord: 0, yCoord: 0, rotationAngle: 0,
                trajectoryX: 0, trajectoryY: 0,
                spiralOrientation: 0, spiralAngularVelocity: 0, spiralRadius: 0, spiralRadialVelocity: 0
            });
        });

        if (this.configuration.sortBySizeMetric) {
            this.queuedTerms.sort((descA, descB) => (descB.size - descA.size));
        }

        this.compositeRenderContext.fillStyle = this.configuration.backgroundShade;
        this.compositeRenderContext.fillRect(0, 0, this.displayAreaWidth, this.displayAreaHeight);

        this.highResRenderContext.fillStyle = this.configuration.backgroundShade;
        this.highResRenderContext.fillRect(0, 0,
            this.displayAreaWidth * this.configuration.highDPIFactor,
            this.displayAreaHeight * this.configuration.highDPIFactor
        );

        this.occupiedSpaceContext.clearRect(0, 0, this.displayAreaWidth, this.displayAreaHeight);
        this.establishBoundaryDefinition();

        if (!this.animationFrameIdentifier) {
            this.animationFrameIdentifier = requestAnimationFrame(this.frameUpdateLoop);
        }
    }

    establishBoundaryDefinition() {
        const boundaryType = this.configuration.boundaryImage;
        if (boundaryType !== 'none') {
            this.occupiedSpaceContext.fillStyle = 'rgba(255, 255, 255, 1.0)';
            this.occupiedSpaceContext.fillRect(0, 0, this.displayAreaWidth, this.displayAreaHeight);
            this.occupiedSpaceContext.fillStyle = '#000000';

            if (boundaryType === 'text') {
                const textLines = this.configuration.boundaryText.split("\n");
                let initialFontSize = 64;
                let estimatedLineHeight = (initialFontSize * 1.2);
                
                this.temporaryProbeContext.font = `${initialFontSize}px ${this.configuration.typeface}`;
                let maxTextWidth = 0;
                let totalTextHeight = 0;
                textLines.forEach(line => {
                    maxTextWidth = Math.max(maxTextWidth, this.temporaryProbeContext.measureText(line).width);
                    totalTextHeight += estimatedLineHeight;
                });
                
                let scalingFactor = 1;
                if (maxTextWidth > this.displayAreaWidth || totalTextHeight > this.displayAreaHeight) {
                    scalingFactor = Math.min(this.displayAreaWidth / maxTextWidth, this.displayAreaHeight / totalTextHeight);
                }
                
                initialFontSize *= scalingFactor;
                estimatedLineHeight *= scalingFactor;

                this.occupiedSpaceContext.font = `${initialFontSize}px ${this.configuration.typeface}`;
                this.occupiedSpaceContext.textAlign = 'center';
                this.occupiedSpaceContext.textBaseline = 'middle';

                const startVerticalPosition = (this.displayAreaHeight / 2) - (totalTextHeight * scalingFactor / 2) + (estimatedLineHeight / 2);
                textLines.forEach((line, index) => {
                    this.occupiedSpaceContext.fillText(line, this.displayAreaWidth / 2, startVerticalPosition + (index * estimatedLineHeight));
                });

            } else if (this.boundaryGraphic) {
                const imgOriginalWidth = this.boundaryGraphic.width;
                const imgOriginalHeight = this.boundaryGraphic.height;
                const imgAspectRatio = imgOriginalWidth / imgOriginalHeight;

                let targetDrawWidth = this.displayAreaWidth;
                let targetDrawHeight = this.displayAreaHeight;

                if (targetDrawWidth / targetDrawHeight > imgAspectRatio) {
                    targetDrawWidth = targetDrawHeight * imgAspectRatio;
                } else {
                    targetDrawHeight = targetDrawWidth / imgAspectRatio;
                }

                const horizontalOffset = (this.displayAreaWidth - targetDrawWidth) / 2;
                const verticalOffset = (this.displayAreaHeight - targetDrawHeight) / 2;

                this.occupiedSpaceContext.drawImage(this.boundaryGraphic, horizontalOffset, verticalOffset, targetDrawWidth, targetDrawHeight);
            }
        }
        this.occupiedPixelDataSnapshot = this.occupiedSpaceContext.getImageData(0, 0, this.displayAreaWidth, this.displayAreaHeight).data;
    }

    attemptLayoutIteration() {
        const midPointX = this.displayAreaWidth / 2;
        const midPointY = this.displayAreaHeight / 2;
        const layoutStrategy = this.configuration.searchPattern;

        let currentTerm = this.retrieveNextPendingTerm(true);
        if (!currentTerm) {
            if (this.perpetualTermMode) {
                this.originalTermDescriptions.forEach(termData => {
                    this.queuedTerms.push({
                        ...termData,
                        isPlaced: false,
                        placementAttempts: 0,
                        xCoord: 0, yCoord: 0, rotationAngle: 0,
                        trajectoryX: 0, trajectoryY: 0,
                        spiralOrientation: 0, spiralAngularVelocity: 0, spiralRadius: 0, spiralRadialVelocity: 0
                    });
                });
                if (this.configuration.sortBySizeMetric) {
                    this.queuedTerms.sort((descA, descB) => (descB.size - descA.size));
                }
                currentTerm = this.retrieveNextPendingTerm(true);
                if (!currentTerm) return;
            } else {
                this.configuration.isOperationStopped = true;
                return;
            }
        }

        const minimumTravel = this.configuration.minTravelDistance;
        const maximumTravel = this.configuration.maxTravelDistance;

        if (currentTerm.placementAttempts === 0) {
            if (layoutStrategy === 'outwards') {
                const startingAngle = (Math.random() * Math.PI * 2) - Math.PI;
                const startingDistance = this.getRandomValueInRange(minimumTravel, maximumTravel, 0.01);

                currentTerm.trajectoryX = Math.cos(startingAngle) * startingDistance;
                currentTerm.trajectoryY = Math.sin(startingAngle) * startingDistance;

                currentTerm.xCoord = midPointX + currentTerm.trajectoryX;
                currentTerm.yCoord = midPointY + currentTerm.trajectoryY;
            } else if (layoutStrategy === 'spiral') {
                currentTerm.spiralOrientation = (Math.random() * Math.PI * 2) - Math.PI;
                currentTerm.spiralAngularVelocity = (Math.random() < 0.5) ? (Math.PI / 20) : (-Math.PI / 20);
                currentTerm.spiralRadialVelocity = 0.3;
                currentTerm.spiralRadius = currentTerm.spiralRadialVelocity;

                const spiralOffset_X = currentTerm.spiralRadius * Math.cos(currentTerm.spiralOrientation);
                const spiralOffset_Y = currentTerm.spiralRadius * Math.sin(currentTerm.spiralOrientation);

                currentTerm.xCoord = midPointX + spiralOffset_X;
                currentTerm.yCoord = midPointY + spiralOffset_Y;
            } else {
                currentTerm.xCoord = this.getRandomValueInRange(0, this.displayAreaWidth - 1);
                currentTerm.yCoord = this.getRandomValueInRange(0, this.displayAreaHeight - 1);
            }
            currentTerm.rotationAngle = this.determineTermOrientation();
        }

        const iterationStartTime = performance.now();
        let positionFound = false;

        while (currentTerm.placementAttempts < this.configuration.maxPlacementAttempts) {
            if (this.detectSpatialCollision(currentTerm)) {
                positionFound = true;
                break;
            }

            if (layoutStrategy === 'random') {
                currentTerm.xCoord = this.getRandomValueInRange(0, this.displayAreaWidth - 1);
                currentTerm.yCoord = this.getRandomValueInRange(0, this.displayAreaHeight - 1);
                currentTerm.rotationAngle = this.determineTermOrientation();
            } else {
                if (layoutStrategy === 'outwards') {
                    currentTerm.xCoord += currentTerm.trajectoryX;
                    currentTerm.yCoord += currentTerm.trajectoryY;
                } else { // spiral
                    currentTerm.spiralOrientation += currentTerm.spiralAngularVelocity;
                    currentTerm.spiralRadius += currentTerm.spiralRadialVelocity;

                    const spiralOffset_X = currentTerm.spiralRadius * Math.cos(currentTerm.spiralOrientation);
                    const spiralOffset_Y = currentTerm.spiralRadius * Math.sin(currentTerm.spiralOrientation);

                    currentTerm.xCoord = midPointX + spiralOffset_X;
                    currentTerm.yCoord = midPointY + spiralOffset_Y;
                    currentTerm.rotationAngle = this.determineTermOrientation();
                }

                if (layoutStrategy === 'outwards') {
                    if (currentTerm.xCoord < 0 || currentTerm.xCoord > this.displayAreaWidth ||
                        currentTerm.yCoord < 0 || currentTerm.yCoord > this.displayAreaHeight) {
                        const newTrajectoryAngle = (Math.random() * Math.PI * 2) - Math.PI;
                        const newTrajectoryDistance = this.getRandomValueInRange(minimumTravel, maximumTravel, 0.01);
                        currentTerm.trajectoryX = Math.cos(newTrajectoryAngle) * newTrajectoryDistance;
                        currentTerm.trajectoryY = Math.sin(newTrajectoryAngle) * newTrajectoryDistance;
                        currentTerm.xCoord = midPointX + currentTerm.trajectoryX;
                        currentTerm.yCoord = midPointY + currentTerm.trajectoryY;
                    }
                } else if (layoutStrategy === 'spiral') {
                    if (currentTerm.spiralRadius > Math.max(midPointX, midPointY) * 1.5) {
                        currentTerm.spiralOrientation = (Math.random() * Math.PI * 2) - Math.PI;
                        currentTerm.spiralAngularVelocity = (Math.random() < 0.5) ? (Math.PI / 20) : (-Math.PI / 20);
                        currentTerm.spiralRadialVelocity = 0.3;
                        currentTerm.spiralRadius = currentTerm.spiralRadialVelocity;
                        const resetSpiralOffset_X = currentTerm.spiralRadius * Math.cos(currentTerm.spiralOrientation);
                        const resetSpiralOffset_Y = currentTerm.spiralRadius * Math.sin(currentTerm.spiralOrientation);
                        currentTerm.xCoord = midPointX + resetSpiralOffset_X;
                        currentTerm.yCoord = midPointY + resetSpiralOffset_Y;
                        currentTerm.rotationAngle = this.determineTermOrientation();
                    }
                }
            }

            currentTerm.placementAttempts++;

            const currentTime = performance.now();
            if ((currentTime - iterationStartTime) > 200) {
                this.accumulatedInactivityTime += (currentTime - iterationStartTime);
                if (this.accumulatedInactivityTime > this.configuration.inactivityTimeoutMillis) {
                    this.configuration.isOperationStopped = true;
                }
                return;
            }
        }

        if (positionFound) {
            this.commitTermToLayout(currentTerm);
            this.accumulatedInactivityTime = 0;
            currentTerm.isPlaced = true;
        } else {
            if (this.perpetualTermMode) {
                currentTerm.placementAttempts = 0;
                this.queuedTerms.push(currentTerm);
            }
        }
        this.currentTermForPlacement = null;
    }

    retrieveNextPendingTerm(removeFromQueue = true) {
        if (!this.currentTermForPlacement && this.queuedTerms.length > 0) {
            this.currentTermForPlacement = removeFromQueue ? this.queuedTerms.shift() : this.queuedTerms[0];
        }
        return this.currentTermForPlacement;
    }

    determineTermOrientation() {
        switch (this.configuration.orientationStrategy) {
            case 'horizontal': return 0;
            case 'vertical': return Math.PI / 2;
            case 'random': return Math.random() < 0.5 ? 0 : Math.PI / 2;
            case 'any': return Math.random() * Math.PI * 2;
            default: return 0;
        }
    }

    drawIndividualTerm(drawingContext, termDescription, scaleFactor = 1) {
        drawingContext.save();
        drawingContext.font = `${termDescription.size * scaleFactor}px ${this.configuration.typeface}`;
        drawingContext.textAlign = 'center';
        drawingContext.textBaseline = 'middle';

        drawingContext.translate(termDescription.xCoord * scaleFactor, termDescription.yCoord * scaleFactor);
        drawingContext.rotate(termDescription.rotationAngle);

        drawingContext.fillText(termDescription.content, 0, 0);
        drawingContext.restore();
    }

    detectSpatialCollision(termDescription) {
        this.prospectiveTermContext.clearRect(0, 0, this.displayAreaWidth, this.displayAreaHeight);
        this.prospectiveTermContext.fillStyle = 'rgba(0, 0, 0, 1)';
        this.drawIndividualTerm(this.prospectiveTermContext, termDescription);

        const newTermPixels = this.prospectiveTermContext.getImageData(0, 0, this.displayAreaWidth, this.displayAreaHeight).data;
        const existingMaskPixels = this.occupiedPixelDataSnapshot || new Uint8ClampedArray(this.displayAreaWidth * this.displayAreaHeight * 4).fill(0);

        for (let pixelIndex = 3; pixelIndex < newTermPixels.length; pixelIndex += 4) {
            if (newTermPixels[pixelIndex] > 0 && existingMaskPixels[pixelIndex] > 0) {
                return false;
            }
        }
        return true;
    }

    commitTermToLayout(termDescription) {
        this.compositeRenderContext.fillStyle = this.configuration.glyphColor;
        this.drawIndividualTerm(this.compositeRenderContext, termDescription);

        this.highResRenderContext.fillStyle = this.configuration.glyphColor;
        this.drawIndividualTerm(this.highResRenderContext, termDescription, this.configuration.highDPIFactor);

        this.drawIndividualTerm(this.occupiedSpaceContext, termDescription);
        this.occupiedPixelDataSnapshot = this.occupiedSpaceContext.getImageData(0, 0, this.displayAreaWidth, this.displayAreaHeight).data;
    }

    getRandomValueInRange(minVal, maxVal, stepVal = 1) {
        return Math.floor(Math.random() * ((maxVal - minVal) / stepVal + 1)) * stepVal + minVal;
    }

    feedText(textContent) {
        this.initializeFromCorpus(textContent);
    }

    feedRandomText(textContent) {
        this.configureFromRandomCounts(textContent);
    }

    updateConfiguration(newOptions) {
        Object.assign(this.configuration, newOptions);
        if (newOptions.boundaryImage || newOptions.boundaryText || newOptions.sortBySizeMetric ||
            newOptions.minGlyphSize || newOptions.maxGlyphSize) {
            if (this.originalTermDescriptions) {
                this.prepareLayout(this.originalTermDescriptions.map(t => ({...t})), this.perpetualTermMode);
            }
        }
    }

    pauseGeneration() {
        this.configuration.isOperationPaused = true;
    }

    resumeGeneration() {
        this.configuration.isOperationPaused = false;
        if (!this.animationFrameIdentifier && !this.configuration.isOperationStopped) {
            this.animationFrameIdentifier = requestAnimationFrame(this.frameUpdateLoop);
        }
    }

    stopGeneration() {
        this.configuration.isOperationStopped = true;
        cancelAnimationFrame(this.animationFrameIdentifier);
        this.animationFrameIdentifier = null;
    }
}