(function ($) {

    // Utility function for generating random numbers within a range.
    // This was missing from the original code but used.
    if (typeof Math.randomRange === 'undefined') {
        Math.randomRange = function(minVal, maxVal, floatPrecision) {
            if (typeof floatPrecision === 'undefined') {
                floatPrecision = 0;
            }
            var rand = Math.random() * (maxVal - minVal) + minVal;
            return parseFloat(rand.toFixed(floatPrecision));
        };
    }

    /**
     * jQuery integration for the Word Canvas Visualizer.
     * Initializes a canvas-based word cloud display within a designated container.
     *
     * @param {string} hostElementRef - CSS selector for the DOM element where the word cloud will be rendered.
     * @license GNU General Public License v3 or later
     * @author Altered from Pete Warden's OpenWordCloud
     */
    $.fn.CloudCanvasRenderer = function(hostElementRef) {

        /**
         * Core initialization logic for the word cloud instance.
         * Sets up canvas elements, configuration, and event listeners.
         * @param {string} targetContainerSelector - The selector for the target HTML element.
         */
        this.initializeDisplay = function(targetContainerSelector) {
            const $targetContainer = $(targetContainerSelector);

            // Validate target container
            if ($targetContainer.length === 0) {
                console.error("CloudCanvasRenderer: Target container not found for selector:", targetContainerSelector);
                return;
            }

            this.viewPortWidth = $targetContainer.width();
            this.viewPortHeight = $targetContainer.height();

            // Basic HTML5 Canvas API capability check
            const canvasApiAvailable = (function() {
                try {
                    return !!document.createElement('canvas').getContext('2d');
                } catch (e) {
                    return false;
                }
            })();

            if (!canvasApiAvailable) {
                $targetContainer.html(
                    '<p style="text-align: center; color: #888; font-family: sans-serif; padding: 20px;">' +
                    'Your browser needs HTML5 Canvas support to display this content.<br>' +
                    'Please update to a modern browser like Firefox, Chrome, or Safari.' +
                    '</p>'
                );
                return; // Exit if canvas is not supported
            }

            // Create the primary display canvas
            this.mainDisplayCanvas = this.generateCanvasElement(this.viewPortWidth, this.viewPortHeight);

            // Clear the host and append the new canvas
            $targetContainer.empty().append(this.mainDisplayCanvas);

            // Retain reference to 'this' for callbacks
            const selfRef = this;

            // Set up a periodic rendering tick
            this.renderTickInterval = setInterval(function() {
                selfRef.animationTick();
            }, 500); // Half-second interval for updates

            // Default configuration parameters for the word cloud
            this.configParams = {
                'bgColor': '#ffffff',
                'txtColor': '#000000',
                'fontFamily': 'Baskerville, Times New Roman, Serif',
                'minFontSize': 16,
                'maxFontSize': 64,
                'paddingPx': 1,
                'rotationMode': 'random', // 'none', 'right-angle', 'random'
                'shapeImgSrc': 'none', // URL to an image or 'text'
                'maxAttemptsPerWord': 1500, // Max tries to place a single word
                'minSpreadDist': 2, // Minimum distance for 'outwards' strategy
                'maxSpreadDist': 4, // Maximum distance for 'outwards' strategy
                'sortWordsByMagnitude': true, // Sort words by size descending
                'shapeTxtContent': "SHAPE\nTEXT", // Text to use if shapeImgSrc is 'text'
                'placementStrategy': 'spiral', // 'random', 'outwards', 'spiral'
                'angularStep': (Math.PI / 40), // For spiral placement
                'renderPaused': false,
                'renderStopped': false,
                'failTimeoutMs': 2 * 60 * 1000, // Time before stopping if no words can be placed
                'hdRenderFactor': 2 // High-definition scaling factor for collision detection
            };

            // Internal state variables
            this.wordRenderQueue = []; // Words awaiting placement
            this.backgroundCanvas = this.generateCanvasElement(this.viewPortWidth, this.viewPortHeight); // Stores already placed words
            this.highResBackgroundCanvas = this.generateCanvasElement((this.viewPortWidth * this.configParams.hdRenderFactor), (this.viewPortHeight * this.configParams.hdRenderFactor)); // High-res for precise collision
            this.shapeMaskCanvas = this.generateCanvasElement(this.viewPortWidth, this.viewPortHeight); // Mask for custom shapes
            this.currentWordTestMask = this.generateCanvasElement(this.viewPortWidth, this.viewPortHeight); // Mask for current word
            this.collisionTestBuffer = this.generateCanvasElement(this.viewPortWidth, this.viewPortHeight); // General purpose mask buffer
            this.backgroundPixelData = null; // Stored pixel data from backgroundCanvas (for optimization)
            this.previousRenderWasPaused = false;
            this.idleTimeAccumulator = 0; // Tracks time since last successful word placement
            this.loopWordSupply = false; // If true, words are regenerated after all are placed
        };

        /**
         * Creates a new jQuery-wrapped canvas element.
         * @param {number} elementWidth - The desired width of the canvas.
         * @param {number} elementHeight - The desired height of the canvas.
         * @returns {jQuery} A jQuery object containing the new canvas.
         */
        this.generateCanvasElement = function(elementWidth, elementHeight) {
            return $('<canvas>')
                .attr('width', elementWidth)
                .attr('height', elementHeight);
        };

        /**
         * Retrieves the 2D rendering context for a given canvas.
         * @param {jQuery} canvasElement - The jQuery-wrapped canvas element.
         * @returns {CanvasRenderingContext2D} The 2D rendering context.
         */
        this.getCanvasContext = function(canvasElement) {
            // Note: Original code commented out context.save/restore due to Safari bug.
            // We follow that pattern and only return the context directly.
            return canvasElement.get(0).getContext('2d');
        };

        /**
         * Converts a hexadecimal color number to an RGBA string.
         * @param {number} hexColorValue - The color as a hexadecimal number (e.g., 0xFF0000 for red).
         * @param {number} [alphaValue=1.0] - The alpha transparency value (0.0 to 1.0).
         * @returns {string} The RGBA color string.
         */
        this.rgbaFromHexAndAlpha = function(hexColorValue, alphaValue = 1.0) {
            const red = (hexColorValue >> 16) & 0xff;
            const green = (hexColorValue >> 8) & 0xff;
            const blue = (hexColorValue >> 0) & 0xff;
            return `rgba(${red}, ${green}, ${blue}, ${alphaValue})`;
        };

        /**
         * The primary animation loop callback.
         * Simply triggers a frame render.
         */
        this.animationTick = function() {
            this.renderFrame();
        };

        /**
         * Renders a single frame of the word cloud.
         * Manages paused/stopped states, updates word positions, and draws to the canvas.
         */
        this.renderFrame = function() {
            const {
                renderPaused,
                renderStopped
            } = this.configParams;
            const isRenderingSuspended = renderPaused || renderStopped;

            // Handle paused state: only redraw if state just changed
            if (isRenderingSuspended) {
                if (!this.previousRenderWasPaused) {
                    const ctx = this.getCanvasContext(this.mainDisplayCanvas);
                    this.positionWords(ctx); // Still attempt to position words even if paused, to update internal state
                    ctx.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);
                    ctx.drawImage(this.backgroundCanvas.get(0), 0, 0, this.viewPortWidth, this.viewPortHeight);
                }
                this.previousRenderWasPaused = isRenderingSuspended;
                return;
            }

            // Prevent re-entrant calls to draw
            if (this.isDrawingInProgress) {
                return;
            }
            this.isDrawingInProgress = true;

            const ctx = this.getCanvasContext(this.mainDisplayCanvas);

            // Attempt to find positions for new words
            this.positionWords(ctx);

            // Clear the main display and draw the accumulated words
            ctx.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);
            ctx.drawImage(this.backgroundCanvas.get(0), 0, 0, this.viewPortWidth, this.viewPortHeight);

            // Draw the current word being attempted, if any
            const currentWordItem = this.retrieveNextWord();
            if (currentWordItem && !currentWordItem.hasBeenPlaced) { // Only draw if not yet placed
                const {
                    txtColor
                } = this.configParams;
                let drawColor = txtColor;

                // Dynamic rainbow color generation
                if (txtColor === 'rainbow') {
                    drawColor = this.generateRainbowColor();
                }

                ctx.fillStyle = drawColor;
                ctx.globalCompositeOperation = 'source-over'; // Ensure normal blending

                this.renderSingleWord(ctx, currentWordItem);
            }

            this.isDrawingInProgress = false;
            this.previousRenderWasPaused = isRenderingSuspended;
        };

        /**
         * Initiates word cloud generation from a raw text string.
         * @param {string} sourceText - The input text.
         */
        this.populateFromText = function(sourceText) {
            if (typeof sourceText !== 'string' || sourceText.trim() === '') {
                console.warn("CloudCanvasRenderer: No valid text provided for word cloud generation.");
                return;
            }
            const frequencyMap = this.analyzeTextFrequencies(sourceText);
            this.loadFromFrequencyMap(frequencyMap);
        };

        /**
         * Analyzes text to generate word frequencies, filtering common words.
         * @param {string} inputTxt - The text to analyze.
         * @returns {Object.<string, number>} An object mapping words to their frequencies.
         */
        this.analyzeTextFrequencies = function(inputTxt) {
            // A comprehensive list of common English stop words
            const commonFilterWords = [
                "a", "about", "above", "accordingly", "after", "again", "against", "ah", "all", "also", "although", "always", "am", "among", "amongst", "an",
                "and", "any", "anymore", "anyone", "are", "as", "at", "away", "be", "been", "begin", "beginning", "beginnings", "begins", "begone", "begun", "being",
                "below", "between", "but", "by", "ca", "can", "cannot", "come", "could", "did", "do", "doing", "during", "each", "either", "else", "end", "et",
                "etc", "even", "ever", "far", "ff", "following", "for", "from", "further", "furthermore", "get", "go", "goes", "going", "got", "had", "has", "have", "he", "her",
                "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "last", "lastly", "less", "many", "may", "me",
                "might", "more", "must", "my", "myself", "near", "nearly", "never", "new", "next", "no", "not", "now", "o", "of", "off", "often", "oh", "on", "only",
                "or", "other", "otherwise", "our", "ourselves", "out", "over", "perhaps", "put", "puts", "quite", "s", "said", "saw", "say", "see", "seen", "shall",
                "she", "should", "since", "so", "some", "such", "t", "than", "that", "the", "their", "them", "themselves", "then", "there", "therefore", "these", "they",
                "this", "those", "though", "throughout", "thus", "to", "too", "toward", "unless", "until", "up", "upon", "us", "ve", "very", "was", "we",
                "were", "what", "whatever", "when", "where", "which", "while", "who", "whom", "whomever", "whose", "why", "with", "within", "without", "would",
                "yes", "your", "yours", "yourself", "yourselves", "rt", "http", "www", "com", "you", "de", "re", "ll", "ex", "didn", "mr", "mrs", "just", "like", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"
            ];

            // Regex for filtering
            const filterWordsRegex = new RegExp('\\b(' + commonFilterWords.join('|') + ')\\b', 'gi');
            const nonAlphaNumericRegex = /[^a-z0-9\s]/gi; // Added \s to keep spaces for splitting
            const multiSpaceRegex = /\s+/gi;
            const singleCharWordRegex = /\b[a-z0-9]\b/gi; // Matches single letter/digit words

            // Clean the text:
            // 1. Remove non-alphanumeric characters (except spaces)
            // 2. Remove stop words
            // 3. Normalize multiple spaces to single spaces
            // 4. Remove single character words
            const cleanedText = inputTxt
                .toLowerCase()
                .replace(nonAlphaNumericRegex, ' ')
                .replace(filterWordsRegex, ' ')
                .replace(multiSpaceRegex, ' ')
                .replace(singleCharWordRegex, ' ')
                .trim();

            const tokenizedWords = cleanedText.split(' ').filter(word => word.length > 0); // Filter out empty strings

            const frequencyMap = {};
            for (const wordToken of tokenizedWords) {
                frequencyMap[wordToken] = (frequencyMap[wordToken] || 0) + 1;
            }

            return frequencyMap;
        };

        /**
         * Populates the word cloud from a pre-calculated frequency map.
         * @param {Object.<string, number>} frequencyMap - Word frequencies.
         */
        this.loadFromFrequencyMap = function(frequencyMap) {
            let highestFrequencyCount = 1; // Minimum frequency is 1, so start here
            for (const word in frequencyMap) {
                const currentFreq = frequencyMap[word];
                if (currentFreq > highestFrequencyCount) {
                    highestFrequencyCount = currentFreq;
                }
            }

            const {
                minFontSize,
                maxFontSize
            } = this.configParams;
            const sizeRangeDelta = (maxFontSize - minFontSize);

            const sizedWordList = [];
            for (const wordEntry in frequencyMap) {
                const currentFreq = frequencyMap[wordEntry];
                // Normalize frequency (0 to 1), with 1 being the max frequency
                const normalizedFreqFactor = highestFrequencyCount > 1 ? ((currentFreq - 1) / (highestFrequencyCount - 1)) : 0;
                const computedFontSize = minFontSize + (normalizedFreqFactor * sizeRangeDelta);
                sizedWordList.push({
                    text: wordEntry,
                    size: computedFontSize
                });
            }

            this.initiateLayoutWithSizes(sizedWordList, false); // Not infinite words
        };

        /**
         * Generates words with random sizes for testing/small inputs.
         * @param {string} sourceText - Small text to tokenize and size randomly.
         */
        this.generateRandomSizedWords = function(sourceText) {
            if (typeof sourceText !== 'string' || sourceText.trim() === '') {
                console.warn("CloudCanvasRenderer: No text provided for random sized word generation.");
                return;
            }
            const frequencyMap = this.analyzeTextFrequencies(sourceText);

            const {
                minFontSize,
                maxFontSize
            } = this.configParams;
            const sizeRangeDelta = (maxFontSize - minFontSize);

            const sizedWordList = [];
            for (const wordEntry in frequencyMap) {
                // Apply a non-linear random factor for more varied sizes
                let randomFactor = Math.random();
                randomFactor *= randomFactor; // Quadratic distribution
                randomFactor *= randomFactor; // Quartic distribution
                const computedFontSize = minFontSize + (randomFactor * sizeRangeDelta);
                sizedWordList.push({
                    text: wordEntry,
                    size: computedFontSize
                });
            }

            this.initiateLayoutWithSizes(sizedWordList, true); // Allow infinite words
        };

        /**
         * Main logic for placing words on the canvas.
         * Attempts to find a non-colliding position for each word in the queue.
         */
        this.positionWords = function() {
            const {
                placementStrategy,
                maxAttemptsPerWord,
                minSpreadDist,
                maxSpreadDist,
                failTimeoutMs
            } = this.configParams;

            const centerX = (this.viewPortWidth / 2);
            const centerY = (this.viewPortHeight / 2);

            // Process words until a time limit is reached or all words are placed
            const iterationStartTime = new Date().getTime();
            const timeBudgetMs = 250; // Max time to spend positioning words per frame

            while (true) {
                const currentWordItem = this.retrieveNextWord();

                if (!currentWordItem) {
                    // No more words to place
                    if (this.loopWordSupply && this.wordRenderQueue.length === 0) {
                        // If infinite words and queue is empty, repopulate
                        this.initiateLayoutWithSizes(this.initialWordSizeData, true);
                        continue; // Try again with new words
                    }
                    break;
                }

                // If word has already been placed, skip it
                if (currentWordItem.hasBeenPlaced) {
                    // Move to the next word in the queue
                    // We need to re-add it if loopWordSupply is true, or remove it if not.
                    // For now, let's assume retrieveNextWord handles this correctly (by returning non-placed words).
                    // This implies retrieveNextWord might need to filter placed words, or they are removed on placement.
                    // Let's assume retrieveNextWord returns the next *unplaced* word.
                    // Original code implied words remain in 'this.words' even after placement.
                    // I will modify `retrieveNextWord` to iterate through `wordRenderQueue` and return the first unplaced.
                    // If it returns a placed word, we should skip it here.
                    // The original `getCurrentWord` did not remove words, it just checked `isPositioned`.
                    // So, the `while(true)` loop needs to ensure it only works on *unplaced* words.
                }

                // Initialize word position/rotation if it's the first attempt
                if (currentWordItem.placementAttempts === 0) {
                    switch (placementStrategy) {
                        case 'outwards':
                            {
                                const initialAngle = (Math.random() * Math.PI * 2) - Math.PI;
                                const initialDistance = Math.randomRange(minSpreadDist, maxSpreadDist, 0.01);
                                currentWordItem.stepX = Math.cos(initialAngle) * initialDistance;
                                currentWordItem.stepY = Math.sin(initialAngle) * initialDistance;
                                currentWordItem.posX = centerX + currentWordItem.stepX;
                                currentWordItem.posY = centerY + currentWordItem.stepY;
                                break;
                            }
                        case 'spiral':
                            {
                                currentWordItem.currentAngle = (Math.random() * Math.PI * 2) - Math.PI;
                                currentWordItem.angleIncrement = (Math.random() < 0.5) ? (Math.PI / 20) : (-Math.PI / 20);
                                currentWordItem.radiusIncrement = 0.3;
                                currentWordItem.currentRadius = currentWordItem.radiusIncrement; // Start slightly out
                                const deltaX = currentWordItem.currentRadius * Math.cos(currentWordItem.currentAngle);
                                const deltaY = currentWordItem.currentRadius * Math.sin(currentWordItem.currentAngle);
                                currentWordItem.posX = centerX + deltaX;
                                currentWordItem.posY = centerY + deltaY;
                                break;
                            }
                        case 'random':
                        default:
                            {
                                currentWordItem.posX = Math.randomRange(0, this.viewPortWidth - 1);
                                currentWordItem.posY = Math.randomRange(0, this.viewPortHeight - 1);
                                break;
                            }
                    }
                    currentWordItem.currentRotation = this.calculateWordRotation();
                }

                // Attempt to place the word
                while (currentWordItem.placementAttempts < maxAttemptsPerWord) {

                    if (this.checkCollisionAndBounds(currentWordItem)) {
                        break; // Word fits, exit inner loop
                    }

                    // Update word position based on placement strategy
                    switch (placementStrategy) {
                        case 'random':
                            {
                                currentWordItem.posX = Math.randomRange(0, this.viewPortWidth - 1);
                                currentWordItem.posY = Math.randomRange(0, this.viewPortHeight - 1);
                                currentWordItem.currentRotation = this.calculateWordRotation();
                                break;
                            }
                        case 'outwards':
                            {
                                currentWordItem.posX += currentWordItem.stepX;
                                currentWordItem.posY += currentWordItem.stepY;

                                // If word goes out of bounds, reset its starting point
                                if (currentWordItem.posX < 0 || currentWordItem.posX > this.viewPortWidth ||
                                    currentWordItem.posY < 0 || currentWordItem.posY > this.viewPortHeight) {
                                    const newAngle = (Math.random() * Math.PI * 2) - Math.PI;
                                    const newDistance = Math.randomRange(minSpreadDist, maxSpreadDist, 0.01);
                                    currentWordItem.stepX = Math.cos(newAngle) * newDistance;
                                    currentWordItem.stepY = Math.sin(newAngle) * newDistance;
                                    currentWordItem.posX = centerX + currentWordItem.stepX;
                                    currentWordItem.posY = centerY + currentWordItem.stepY;
                                }
                                break;
                            }
                        case 'spiral':
                            {
                                currentWordItem.currentAngle += currentWordItem.angleIncrement;
                                currentWordItem.currentRadius += currentWordItem.radiusIncrement;

                                const deltaX = currentWordItem.currentRadius * Math.cos(currentWordItem.currentAngle);
                                const deltaY = currentWordItem.currentRadius * Math.sin(currentWordItem.currentAngle);

                                currentWordItem.posX = centerX + deltaX;
                                currentWordItem.posY = centerY + deltaY;
                                currentWordItem.currentRotation = this.calculateWordRotation();

                                // If spiral exceeds canvas dimensions, reset it
                                if (currentWordItem.currentRadius > Math.max((this.viewPortWidth / 2), (this.viewPortHeight / 2))) {
                                    currentWordItem.currentAngle = (Math.random() * Math.PI * 2) - Math.PI;
                                    currentWordItem.angleIncrement = (Math.random() < 0.5) ? (Math.PI / 20) : (-Math.PI / 20);
                                    currentWordItem.radiusIncrement = 0.3;
                                    currentWordItem.currentRadius = currentWordItem.radiusIncrement;
                                    const resetDeltaX = currentWordItem.currentRadius * Math.cos(currentWordItem.currentAngle);
                                    const resetDeltaY = currentWordItem.currentRadius * Math.sin(currentWordItem.currentAngle);
                                    currentWordItem.posX = centerX + resetDeltaX;
                                    currentWordItem.posY = centerY + resetDeltaY;
                                    currentWordItem.currentRotation = this.calculateWordRotation();
                                }
                                break;
                            }
                    }

                    currentWordItem.placementAttempts += 1;

                    // Check if we've exceeded our time budget for this frame
                    const currentTime = new Date().getTime();
                    const elapsedSinceStart = (currentTime - iterationStartTime);
                    if (elapsedSinceStart > timeBudgetMs) {
                        this.idleTimeAccumulator += elapsedSinceStart;
                        if (this.idleTimeAccumulator > failTimeoutMs) {
                            this.configParams.renderStopped = true; // Stop rendering if too much time spent failing
                        }
                        return; // Return to allow other browser tasks
                    }
                }

                // If a position was found within the max attempts, commit the word
                if (currentWordItem.placementAttempts < maxAttemptsPerWord) {
                    this.commitWordToCanvas(currentWordItem);
                    this.idleTimeAccumulator = 0; // Reset idle timer on success
                    currentWordItem.hasBeenPlaced = true; // Mark as placed
                } else {
                    // If word couldn't be placed, mark it as failed and move on
                    currentWordItem.hasBeenPlaced = true; // Treat as placed to remove it from active attempts
                    currentWordItem.placementAttempts = 0; // Reset for potential future re-attempt if loopWordSupply
                }
            }
        };

        /**
         * Initializes the word cloud layout process with a given list of sized words.
         * @param {Array<Object>} sizedWordData - An array of objects, each with 'text' and 'size' properties.
         * @param {boolean} shouldLoopSupply - If true, words will be re-added to the queue after all are placed.
         */
        this.initiateLayoutWithSizes = function(sizedWordData, shouldLoopSupply) {
            if (!Array.isArray(sizedWordData)) {
                console.error("CloudCanvasRenderer: Invalid word size data provided. Expected an array.");
                return;
            }

            this.initialWordSizeData = sizedWordData; // Store for potential looping
            this.wordRenderQueue = [];
            this.configParams.renderPaused = false;
            this.configParams.renderStopped = false;
            this.loopWordSupply = shouldLoopSupply;

            const {
                shapeImgSrc
            } = this.configParams;

            // Determine if a custom shape mask is needed
            if (shapeImgSrc === 'none' || shapeImgSrc === 'text') {
                this.customShapeImage = null;
                this.beginLayoutAfterShapeLoad();
            } else {
                this.customShapeImage = new Image();
                const pluginInstance = this;
                this.customShapeImage.onload = function() {
                    pluginInstance.beginLayoutAfterShapeLoad();
                };
                this.customShapeImage.onerror = function() {
                    console.warn(`CloudCanvasRenderer: Failed to load shape image from ${shapeImgSrc}. Proceeding without shape mask.`);
                    pluginInstance.customShapeImage = null; // Fallback to no shape
                    pluginInstance.beginLayoutAfterShapeLoad();
                };
                this.customShapeImage.src = shapeImgSrc;
            }
        };

        /**
         * Continues the layout process after any custom shape image has loaded.
         * Prepares canvases and sorts words.
         */
        this.beginLayoutAfterShapeLoad = function() {
            this.isDrawingInProgress = false; // Reset drawing flag

            // Prepare word objects for placement
            for (const wordEntry of this.initialWordSizeData) {
                // Clone to prevent modifying original data if looping
                this.wordRenderQueue.push({
                    text: wordEntry.text,
                    size: wordEntry.size,
                    hasBeenPlaced: false,
                    placementAttempts: 0,
                    posX: 0,
                    posY: 0,
                    currentRotation: 0,
                    stepX: 0,
                    stepY: 0,
                    currentAngle: 0,
                    angleIncrement: 0,
                    radiusIncrement: 0,
                    currentRadius: 0
                });
            }

            // Sort words if configured to do so (largest first for better packing)
            if (this.configParams.sortWordsByMagnitude) {
                this.wordRenderQueue.sort((itemA, itemB) => itemB.size - itemA.size);
            }

            // Initialize background canvases
            const bgCtx = this.getCanvasContext(this.backgroundCanvas);
            bgCtx.fillStyle = this.configParams.bgColor;
            bgCtx.fillRect(0, 0, this.viewPortWidth, this.viewPortHeight);

            const hdBgCtx = this.getCanvasContext(this.highResBackgroundCanvas);
            hdBgCtx.fillStyle = this.configParams.bgColor;
            hdBgCtx.fillRect(0, 0, (this.viewPortWidth * this.configParams.hdRenderFactor), (this.viewPortHeight * this.configParams.hdRenderFactor));

            // Apply custom shape mask if specified
            const maskCtx = this.getCanvasContext(this.shapeMaskCanvas);
            maskCtx.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);

            if (this.customShapeImage) {
                this.applyShapeToMaskCanvas(maskCtx, this.customShapeImage);
            } else if (this.configParams.shapeImgSrc === 'text') {
                this.applyShapeToMaskCanvas(maskCtx, null, this.configParams.shapeTxtContent);
            }
            // If no shape image or text, mask remains clear (all words can be placed)

            // Invalidate cached pixel data
            this.backgroundPixelData = null;
        };

        /**
         * Retrieves the next unplaced word from the queue.
         * @returns {Object|null} The next word object or null if none available.
         */
        this.retrieveNextWord = function() {
            // Find the first word that hasn't been placed yet
            for (const word of this.wordRenderQueue) {
                if (!word.hasBeenPlaced) {
                    return word;
                }
            }
            return null; // All words placed
        };

        /**
         * Determines the rotation for a word based on configuration.
         * @returns {number} The rotation angle in radians.
         */
        this.calculateWordRotation = function() {
            switch (this.configParams.rotationMode) {
                case 'none':
                    return 0;
                case 'right-angle':
                    return (Math.random() < 0.5) ? 0 : (Math.PI / 2);
                case 'random':
                    return (Math.random() * Math.PI * 2) - Math.PI; // Full random rotation
                default:
                    return 0;
            }
        };

        /**
         * Generates a random color from a rainbow spectrum.
         * @returns {string} An RGBA color string.
         */
        this.generateRainbowColor = function() {
            const hue = Math.floor(Math.random() * 360);
            return `hsl(${hue}, 100%, 50%)`; // Full saturation and lightness
        };

        /**
         * Draws a single word onto a canvas context.
         * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
         * @param {Object} wordData - The word object with text, size, posX, posY, rotation.
         */
        this.renderSingleWord = function(ctx, wordData) {
            ctx.save(); // Save context state before transformations
            ctx.font = `${wordData.size}px ${this.configParams.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(wordData.posX, wordData.posY);
            ctx.rotate(wordData.currentRotation);
            ctx.fillText(wordData.text, 0, 0);
            ctx.restore(); // Restore context state
        };

        /**
         * Checks if a word can be placed at its current position without collision.
         * This is the core collision detection logic.
         * @param {Object} wordData - The word object to check.
         * @returns {boolean} True if the word fits, false otherwise.
         */
        this.checkCollisionAndBounds = function(wordData) {
            const {
                paddingPx,
                hdRenderFactor
            } = this.configParams;

            // 1. Get word bounding box
            const wordBounds = this.calculateWordDimensions(wordData);
            const {
                left,
                top,
                right,
                bottom
            } = wordBounds;

            // 2. Check if the word is within the main canvas boundaries
            if (left < 0 || top < 0 || right > this.viewPortWidth || bottom > this.viewPortHeight) {
                return false; // Out of bounds
            }

            // 3. Render the current word onto a temporary mask canvas
            const wordMaskCtx = this.getCanvasContext(this.currentWordTestMask);
            wordMaskCtx.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);
            wordMaskCtx.fillStyle = '#000000'; // Draw word in black for mask
            this.renderSingleWord(wordMaskCtx, wordData);

            // 4. Retrieve pixel data for the word mask and existing words mask
            const wordMaskPixels = this.extractPixelsFromMask(this.currentWordTestMask);

            // 5. If a shape mask is active, check against it first
            if (this.customShapeImage || this.configParams.shapeImgSrc === 'text') {
                const shapeMaskPixels = this.retrieveShapeMaskPixels();
                if (this.detectPixelOverlap(wordMaskPixels, shapeMaskPixels, paddingPx, true)) {
                    return false; // Word collides with the 'negative' space of the shape mask
                }
            }

            // 6. Retrieve pixel data for existing words, scaled for HD
            const existingWordsPixels = this.retrieveWordMaskPixels();

            // 7. Check for collision between current word and existing words
            return !this.detectPixelOverlap(wordMaskPixels, existingWordsPixels, paddingPx, false);
        };

        /**
         * Commits a successfully placed word to the background canvas.
         * @param {Object} wordData - The word object to commit.
         */
        this.commitWordToCanvas = function(wordData) {
            const {
                hdRenderFactor,
                txtColor
            } = this.configParams;

            // Draw to the low-res background canvas
            const bgCtx = this.getCanvasContext(this.backgroundCanvas);
            bgCtx.fillStyle = txtColor === 'rainbow' ? this.generateRainbowColor() : txtColor;
            this.renderSingleWord(bgCtx, wordData);

            // Draw to the high-res background canvas for precise future collision checks
            const hdBgCtx = this.getCanvasContext(this.highResBackgroundCanvas);
            hdBgCtx.save();
            hdBgCtx.scale(hdRenderFactor, hdRenderFactor);
            hdBgCtx.fillStyle = '#000000'; // Draw in black for mask purposes
            this.renderSingleWord(hdBgCtx, wordData);
            hdBgCtx.restore();

            // Invalidate cached pixel data as the background has changed
            this.backgroundPixelData = null;
        };

        /**
         * Renders text or an image onto a mask canvas for shaping the word cloud.
         * @param {CanvasRenderingContext2D} ctx - The context of the shape mask canvas.
         * @param {Image|null} [imageToDraw=null] - An image to draw as the mask.
         * @param {string|null} [textToDraw=null] - Text to render as the mask.
         */
        this.applyShapeToMaskCanvas = function(ctx, imageToDraw = null, textToDraw = null) {
            ctx.clearRect(0, 0, this.viewPortWidth, this.viewPortHeight);
            ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'; // Default fill as white
            ctx.fillRect(0, 0, this.viewPortWidth, this.viewPortHeight); // Fill entire mask white (allowed area)
            ctx.fillStyle = '#000000'; // Draw shape in black (forbidden area)

            if (imageToDraw) {
                // Calculate dimensions to fit image within canvas while maintaining aspect ratio
                const aspectRatio = imageToDraw.width / imageToDraw.height;
                let drawWidth = this.viewPortWidth;
                let drawHeight = this.viewPortWidth / aspectRatio;

                if (drawHeight > this.viewPortHeight) {
                    drawHeight = this.viewPortHeight;
                    drawWidth = this.viewPortHeight * aspectRatio;
                }

                const drawX = (this.viewPortWidth - drawWidth) / 2;
                const drawY = (this.viewPortHeight - drawHeight) / 2;

                ctx.drawImage(imageToDraw, drawX, drawY, drawWidth, drawHeight);
            } else if (textToDraw) {
                const lines = textToDraw.split("\n");
                const initialFontSize = 64; // Starting point for size calculation
                const lineHeightFactor = 1.2; // Line height multiplier

                // Simple auto-sizing for text shape
                let currentFontSize = initialFontSize;
                let totalTextHeight = lines.length * (currentFontSize * lineHeightFactor);
                let longestLineWidth = 0;

                // Adjust font size until text fits or reaches a reasonable minimum
                while (totalTextHeight > this.viewPortHeight * 0.9 || longestLineWidth > this.viewPortWidth * 0.9) {
                    if (currentFontSize <= 10) break; // Prevent infinite loop
                    currentFontSize -= 2;
                    ctx.font = `${currentFontSize}px ${this.configParams.fontFamily}`;
                    totalTextHeight = lines.length * (currentFontSize * lineHeightFactor);
                    longestLineWidth = 0;
                    for (const line of lines) {
                        longestLineWidth = Math.max(longestLineWidth, ctx.measureText(line).width);
                    }
                }

                ctx.font = `${currentFontSize}px ${this.configParams.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const startY = (this.viewPortHeight - totalTextHeight) / 2 + (currentFontSize * lineHeightFactor / 2);

                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], this.viewPortWidth / 2, startY + (i * currentFontSize * lineHeightFactor));
                }
            }
            // The black pixels drawn above represent the 'forbidden' area for words.
            // White pixels are the 'allowed' area.
        };

        /**
         * Calculates the bounding box of a word if it were drawn at its current position.
         * @param {Object} wordData - The word object.
         * @returns {Object} An object with left, top, right, bottom coordinates.
         */
        this.calculateWordDimensions = function(wordData) {
            const tempCtx = this.getCanvasContext(this.collisionTestBuffer); // Use a temporary buffer
            tempCtx.font = `${wordData.size}px ${this.configParams.fontFamily}`;
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';

            const metrics = tempCtx.measureText(wordData.text);
            const textWidth = metrics.width;
            const textHeight = wordData.size; // Approximation, can be more precise with metrics.actualBoundingBoxAscent etc.

            // Simple AABB for unrotated text, then expand to cover rotation
            let unrotatedLeft = wordData.posX - (textWidth / 2);
            let unrotatedTop = wordData.posY - (textHeight / 2);
            let unrotatedRight = wordData.posX + (textWidth / 2);
            let unrotatedBottom = wordData.posY + (textHeight / 2);

            // For rotated text, the bounding box can be larger.
            // A simple way is to take the diagonal and use that for max dimension.
            // This overestimates but ensures no clipping.
            const diagonal = Math.sqrt(textWidth * textWidth + textHeight * textHeight);
            const halfDiagonal = diagonal / 2;

            // Centered at posX, posY
            const left = wordData.posX - halfDiagonal;
            const right = wordData.posX + halfDiagonal;
            const top = wordData.posY - halfDiagonal;
            const bottom = wordData.posY + halfDiagonal;

            return {
                left: Math.floor(left),
                top: Math.floor(top),
                right: Math.ceil(right),
                bottom: Math.ceil(bottom)
            };
        };

        /**
         * Extracts pixel data (ImageData) from a canvas context.
         * @param {jQuery} canvasElement - The jQuery-wrapped canvas.
         * @returns {ImageData} The ImageData object for the canvas.
         */
        this.extractPixelsFromMask = function(canvasElement) {
            const ctx = this.getCanvasContext(canvasElement);
            return ctx.getImageData(0, 0, this.viewPortWidth, this.viewPortHeight);
        };

        /**
         * Checks if a pixel in ImageData is considered 'opaque' (non-transparent/black for masks).
         * @param {ImageData} imageData - The ImageData object.
         * @param {number} x - X coordinate.
         * @param {number} y - Y coordinate.
         * @returns {boolean} True if the pixel is opaque, false otherwise.
         */
        this.isMaskPixelOpaque = function(imageData, x, y) {
            if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
                return false; // Out of bounds is transparent
            }
            const pixelIndex = (y * imageData.width + x) * 4;
            // For a black/white mask, we check the alpha channel (index 3) or red channel (index 0)
            // If it's a black (0,0,0) on white (255,255,255) mask, check red channel.
            return imageData.data[pixelIndex] < 128; // If red component is low, it's part of the mask
        };

        /**
         * Retrieves the pixel data for the shape mask canvas.
         * Caches the data for performance.
         * @returns {ImageData} Pixel data for the shape mask.
         */
        this.retrieveShapeMaskPixels = function() {
            if (!this._shapeMaskPixelCache) {
                this._shapeMaskPixelCache = this.extractPixelsFromMask(this.shapeMaskCanvas);
            }
            return this._shapeMaskPixelCache;
        };

        /**
         * Retrieves the pixel data for the high-resolution existing words canvas.
         * Caches the data for performance.
         * @returns {ImageData} Pixel data for existing words.
         */
        this.retrieveWordMaskPixels = function() {
            if (!this.backgroundPixelData) {
                const hdCtx = this.getCanvasContext(this.highResBackgroundCanvas);
                this.backgroundPixelData = hdCtx.getImageData(0, 0, this.viewPortWidth * this.configParams.hdRenderFactor, this.viewPortHeight * this.configParams.hdRenderFactor);
            }
            return this.backgroundPixelData;
        };


        /**
         * Detects if there is any pixel overlap between two mask images.
         * @param {ImageData} currentWordMask - Pixel data for the current word.
         * @param {ImageData} existingContentMask - Pixel data for existing content (shape or other words).
         * @param {number} separationPadding - Minimum pixel separation required.
         * @param {boolean} invertExistingMask - If true, treats black pixels in existingContentMask as 'allowed' (e.g., for shape mask).
         * @returns {boolean} True if overlap (collision) is detected, false otherwise.
         */
        this.detectPixelOverlap = function(currentWordMask, existingContentMask, separationPadding, invertExistingMask) {
            const scale = this.configParams.hdRenderFactor; // Scale factor for existingContentMask
            const scaledWidth = this.viewPortWidth * scale;
            const scaledHeight = this.viewPortHeight * scale;

            // Iterate over the pixels of the current word mask
            for (let y = 0; y < currentWordMask.height; y++) {
                for (let x = 0; x < currentWordMask.width; x++) {
                    // If the current word has an opaque pixel at (x, y)
                    if (this.isMaskPixelOpaque(currentWordMask, x, y)) {
                        // Check for collisions in the surrounding area of the existing content mask
                        for (let dy = -separationPadding; dy <= separationPadding; dy++) {
                            for (let dx = -separationPadding; dx <= separationPadding; dx++) {
                                const checkX = Math.round((x + dx) * scale);
                                const checkY = Math.round((y + dy) * scale);

                                if (checkX >= 0 && checkX < scaledWidth && checkY >= 0 && checkY < scaledHeight) {
                                    const pixelIndex = (checkY * scaledWidth + checkX) * 4;
                                    const existingMaskAlpha = existingContentMask.data[pixelIndex + 3]; // Alpha channel
                                    const existingMaskRed = existingContentMask.data[pixelIndex]; // Red channel for black/white mask

                                    let isExistingOpaque = (existingMaskAlpha > 0 && existingMaskRed < 128); // Consider black/opaque

                                    if (invertExistingMask) {
                                        isExistingOpaque = !isExistingOpaque; // Invert logic for shape mask
                                    }

                                    if (isExistingOpaque) {
                                        return true; // Collision detected
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false; // No collision
        };

        // Initialize the plugin instance
        this.initializeDisplay(hostElementRef);

        return this; // Return the plugin instance for chaining
    };

})(jQuery);