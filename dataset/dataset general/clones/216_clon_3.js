// A reimagined rapid reading utility
// Copyright (C) 2023 A.Developer / E.Engineer
//
// Project Home: rapidreader.dev (fictional)
// Version: 1.0.0
// Dependencies: jQuery 1.9.1+ (or compatible)
// Note: Please retain the project branding and link for attribution.
//
// This software is provided under the terms of the MIT License.
// You are free to use, modify, and distribute it, provided the original
// copyright notice and license are included.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

let SpeedReaderApp = {
    // Entry point: Initializes the entire application
    bootstrap: function(targetElement, completionCallback) {
        // Validate inputs early for robustness
        if (!jQuery(targetElement).length) {
            console.error('SpeedReaderApp: Target element not found for content acquisition:', targetElement);
            return;
        }
        if (completionCallback && typeof completionCallback !== 'function') {
            console.warn('SpeedReaderApp: Provided completion callback is not a valid function.');
        }

        // Proceed with UI construction and engine setup
        this.componentFactory.initializeComponents();
        this.readingEngine.prepareContent(targetElement, completionCallback);
    },

    // Module for handling user input and interface events
    userInteractionHandler: {
        // Retrieves the X coordinate of an element relative to the viewport
        getScreenX: function(domElement) {
            if (!domElement) return 0;
            // Using modern DOM API for element positioning
            const rect = domElement.getBoundingClientRect();
            return rect.left;
        },

        // Retrieves the Y coordinate of an element relative to the viewport
        getScreenY: function(domElement) {
            if (!domElement) return 0;
            // Using modern DOM API for element positioning
            const rect = domElement.getBoundingClientRect();
            return rect.top;
        },

        // Dispatches actions based on clicks on the control canvas
        handleControlClicks: function(eventObject) {
            // Basic event object validation
            if (!eventObject || (typeof eventObject.pageX === 'undefined' && typeof eventObject.clientX === 'undefined')) {
                console.warn("Invalid event object received by handleControlClicks.");
                return;
            }

            const controlsCanvas = jQuery('#reader-controls-canvas')[0];
            if (!controlsCanvas) {
                console.error("Control canvas element is missing from the DOM.");
                return;
            }

            let clickPositionX;
            // Determine X coordinate relative to the canvas
            if (eventObject.pageX !== undefined) {
                clickPositionX = eventObject.pageX - this.getScreenX(controlsCanvas);
            } else {
                clickPositionX = eventObject.clientX - this.getScreenX(controlsCanvas);
            }

            // Define interactive regions for control buttons
            const controlZones = {
                replay: { minX: 0, maxX: 28 },
                start:  { minX: 32, maxX: 64 },
                halt:   { minX: 70, maxX: 100 } // Canvas width is 94, so max 94 is more accurate
            };

            // Execute corresponding engine action based on click zone
            if (clickPositionX >= controlZones.replay.minX && clickPositionX <= controlZones.replay.maxX) {
                SpeedReaderApp.readingEngine.restartPlayback();
            } else if (clickPositionX >= controlZones.start.minX && clickPositionX <= controlZones.start.maxX) {
                SpeedReaderApp.readingEngine.beginPlayback();
            } else if (clickPositionX >= controlZones.halt.minX && clickPositionX <= controlZones.halt.maxX) {
                SpeedReaderApp.readingEngine.pausePlayback();
            } else {
                // Log clicks outside active control areas
                console.debug("Click detected outside defined control button regions at X:", clickPositionX);
            }
        }
    },

    // Module responsible for rendering and styling the application's user interface
    componentFactory: {
        // Orchestrates the initialization of all UI parts
        initializeComponents: function() {
            this.constructUserInterface();
            this.drawingSurface.displayCanvas.initDisplay();
            this.drawingSurface.controlCanvas.initControls();
        },

        // Sub-module dealing with HTML5 Canvas drawing operations
        drawingSurface: {
            displayCanvas: {
                _outputCanvasElement: null,
                _renderingContext: null,

                // Sets up the main canvas for word display
                initDisplay: function() {
                    this._outputCanvasElement = document.getElementById('reader-output-canvas');
                    if (!this._outputCanvasElement) {
                        console.error("Display canvas 'reader-output-canvas' not found during initialization.");
                        return;
                    }
                    // Configure canvas dimensions
                    this._outputCanvasElement.width = 720;
                    this._outputCanvasElement.height = 100;

                    if (this._outputCanvasElement.getContext) {
                        this._renderingContext = this._outputCanvasElement.getContext('2d');
                        // Apply text styling
                        this._renderingContext.font = 'Normal 42px "Lucida Console", Monaco, monospace';
                        this._renderingContext.textBaseline = 'middle'; // Vertically center text
                        this._renderingContext.translate(0.9, 1); // Minor pixel alignment adjustment

                        // Draw static decorative elements (top/bottom borders)
                        this._renderingContext.fillStyle = "#3F3F41";
                        this._renderingContext.fillRect(0, 0, this._outputCanvasElement.width, 5); // Top bar
                        this._renderingContext.fillRect(0, this._outputCanvasElement.height - 5, this._outputCanvasElement.width, 5); // Bottom bar

                        // Draw top alignment indicators (triangles)
                        this._renderingContext.beginPath();
                        this._renderingContext.moveTo(234, 5);
                        this._renderingContext.lineTo(243, 20);
                        this._renderingContext.lineTo(252, 5);
                        this._renderingContext.closePath();
                        this._renderingContext.fill();

                        // Draw bottom alignment indicators (triangles)
                        this._renderingContext.beginPath();
                        this._renderingContext.moveTo(234, 95);
                        this._renderingContext.lineTo(243, 80);
                        this._renderingContext.lineTo(252, 95);
                        this._renderingContext.closePath();
                        this._renderingContext.fill();

                        // Display an initial welcoming message
                        this._renderingContext.fillStyle = "#AAAAAA";
                        this._renderingContext.fillText("Ready to read!", 200, 50);
                    } else {
                        console.error("HTML5 Canvas API is not supported by this browser.");
                    }
                },

                // Renders a given word onto the canvas with a highlighted focal character
                presentWord: function(currentWord) {
                    if (!this._renderingContext) {
                        console.error("Rendering context not available for word display.");
                        return;
                    }

                    // Clear the previous word's display area
                    this._renderingContext.clearRect(0, 21, 720, 53);

                    let drawCursorX = 0; // Tracks current X position for text rendering
                    const focalCharIdx = SpeedReaderApp.textProcessor.getFocalCharIndex(currentWord);
                    const leadingWhitespace = SpeedReaderApp.textProcessor.generatePadding(5 - focalCharIdx);

                    // Render leading whitespace for optical alignment
                    this._renderingContext.fillStyle = "#3F3F41";
                    this._renderingContext.fillText(leadingWhitespace, 129, 62);
                    drawCursorX += this._renderingContext.measureText(leadingWhitespace).width;

                    // Render characters before the focal point
                    const preFocalSegment = currentWord.substring(0, focalCharIdx - 1);
                    this._renderingContext.fillText(preFocalSegment, 129 + drawCursorX, 62);
                    drawCursorX += this._renderingContext.measureText(preFocalSegment).width;

                    // Render the focal character with a distinct highlight color
                    this._renderingContext.fillStyle = "#22ABA6";
                    const focalCharacter = currentWord.substring(focalCharIdx - 1, focalCharIdx);
                    this._renderingContext.fillText(focalCharacter, 129 + drawCursorX, 62);
                    drawCursorX += this._renderingContext.measureText(focalCharacter).width;

                    // Render characters following the focal point
                    this._renderingContext.fillStyle = "#3F3F41";
                    const postFocalSegment = currentWord.substring(focalCharIdx, currentWord.length);
                    this._renderingContext.fillText(postFocalSegment, 129 + drawCursorX, 62);
                },
            },

            controlCanvas: {
                _controlCanvasElement: null,
                _controlRenderingContext: null,
                // Base64 encoded image data for the branding logo
                _brandingImageData: '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',

                // Initializes the control canvas for playback buttons
                initControls: function() {
                    this._controlCanvasElement = document.getElementById('reader-controls-canvas');
                    if (!this._controlCanvasElement) {
                        console.error("Control canvas 'reader-controls-canvas' not found during initialization.");
                        return;
                    }
                    // Set fixed dimensions for the control canvas
                    this._controlCanvasElement.width = 94;
                    this._controlCanvasElement.height = 27;

                    if (this._controlCanvasElement.getContext) {
                        this._controlRenderingContext = this._controlCanvasElement.getContext('2d');
                        // Set initial visual state: Stop button active
                        this.updateControlVisuals(false, false, true);

                        // Load and display the branding logo
                        jQuery('#reader-branding-logo').prop('src', 'data:image/png;base64, ' + this._brandingImageData);
                    } else {
                        console.error("HTML5 Canvas API is not supported by this browser for controls.");
                    }
                },

                // Updates the visual state of the control buttons (repeat, play, stop)
                updateControlVisuals: function(isRepeatActive, isPlayActive, isStopActive) {
                    if (!this._controlRenderingContext) {
                        console.error("Control rendering context not available for visual updates.");
                        return;
                    }

                    this._controlRenderingContext.clearRect(0, 0, 94, 27); // Clear entire canvas area

                    const activeColor = '#22ABA6';
                    const inactiveColor = '#3F3F41';

                    // Internal helper function to draw a triangle button
                    const drawTriangleButton = (ctx, startX, startY, height, baseWidth, isPointingLeft, isActive) => {
                        ctx.fillStyle = isActive ? activeColor : inactiveColor;
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        if (isPointingLeft) {
                            ctx.lineTo(startX - baseWidth, startY + height / 2);
                        } else {
                            ctx.lineTo(startX + baseWidth, startY + height / 2);
                        }
                        ctx.lineTo(startX, startY + height);
                        ctx.closePath();
                        ctx.fill();
                    };

                    // Internal helper function to draw a stop button (two vertical bars)
                    const drawStopButton = (ctx, startX, startY, barWidth, barHeight, isActive) => {
                        ctx.fillStyle = isActive ? activeColor : inactiveColor;
                        ctx.fillRect(startX, startY, barWidth, barHeight);
                        ctx.fillRect(startX + barWidth + 5, startY, barWidth, barHeight); // Second bar
                    };

                    // Render Repeat Button (left-pointing triangle)
                    drawTriangleButton(this._controlRenderingContext, 26, 2, 25, 24, true, isRepeatActive);

                    // Render Play Button (right-pointing triangle)
                    drawTriangleButton(this._controlRenderingContext, 37, 2, 25, 24, false, isPlayActive);

                    // Render Stop Button (two vertical rectangles)
                    drawStopButton(this._controlRenderingContext, 75, 2, 5, 25, isStopActive);
                }
            }
        },

        // Dynamically injects CSS rules into the document's head
        styleInjector: function() {
            const cssBlock = `
                /* Styles for the SpeedReader application container */
                #speed-reader-container .reader-wrapper {
                    display: block; /* Ensures block-level behavior for margin auto */
                    margin-left: auto;
                    margin-right: auto;
                    max-width: 720px;
                    overflow: hidden;
                    border: 1px solid #E0E0E0; /* Added a subtle border */
                    box-shadow: 0px 2px 5px rgba(0,0,0,0.1); /* Added a subtle shadow effect */
                    background-color: #FFFFFF; /* Ensure a clean background */
                }
                /* Styles for the control panel containing buttons and selector */
                #speed-reader-container .reader-wrapper .control-panel {
                    text-align: center;
                    margin-top: 10px;
                    padding-bottom: 5px;
                }
                /* Styles for the branding logo image */
                #speed-reader-container .reader-wrapper .control-panel img.branding-logo {
                    float: right;
                    margin: 2px 0;
                    width: 80px;
                    height: 21px; /* Explicit height for consistent rendering */
                    vertical-align: middle; /* Aligns with other inline-block elements */
                }
                /* Styles for the controls canvas */
                #speed-reader-container .reader-wrapper .control-panel canvas#reader-controls-canvas {
                    margin-left: -46px; /* Original offset */
                    cursor: pointer; /* Indicates interactivity */
                    vertical-align: middle;
                }
                /* Styles for the Words Per Minute selector dropdown */
                #reading-speed-selector {
                    border: 1px solid #CCCCCC;
                    border-radius: 4px;
                    color: #555555;
                    font-size: 14px;
                    height: 33px;
                    padding: 6px 12px;
                    width: 180px;
                    float: left;
                    position: relative;
                    z-index: 944;
                    box-sizing: border-box; /* Includes padding and border in the element's total width and height */
                    appearance: none; /* Remove default dropdown arrow */
                    background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%204%205%22%3E%3Cpath%20fill%3D%22%23444%22%20d%3D%22M2%200L0%202h4zm0%205L0%203h4z%22%2F%3E%3C%2Fsvg%3E'); /* Custom dropdown arrow */
                    background-repeat: no-repeat;
                    background-position: right 8px center;
                    background-size: 8px 10px;
                }
                /* Styles for the main output canvas */
                canvas#reader-output-canvas {
                    width: 100%;
                    background-color: #F8F8F8; /* Light background for readability */
                    display: block; /* Prevents extra space below the canvas */
                }
            `;
            // Append the generated CSS to the document's head
            jQuery('<style type="text/css"></style>')
                .html(cssBlock)
                .appendTo('head');
        },

        // Assembles the initial HTML structure of the application
        constructUserInterface: function() {
            const targetContainer = jQuery('#speed-reader-container');
            if (!targetContainer.length) {
                console.error("Target container '#speed-reader-container' for UI construction is not present.");
                return;
            }

            // Using template literals for cleaner HTML string construction
            const generatedHtml = `
                <div class="reader-wrapper">
                    <canvas id="reader-output-canvas" aria-label="Speed reader display area"></canvas>
                    <div class="control-panel">
                        <select id="reading-speed-selector" onchange="SpeedReaderApp.readingEngine.adjustWordsPerMinute();" aria-label="Select reading speed in words per minute">
                            <option value="250">250 WPM</option>
                            <option value="300" selected>300 WPM</option> <!-- Changed default selection -->
                            <option value="350">350 WPM</option>
                            <option value="400">400 WPM</option>
                            <option value="450">450 WPM</option>
                            <option value="500">500 WPM</option>
                            <option value="550">550 WPM</option>
                            <option value="600">600 WPM</option>
                            <option value="650">650 WPM</option> <!-- Added an extra speed option -->
                        </select>
                        <canvas id="reader-controls-canvas" onclick="SpeedReaderApp.userInteractionHandler.handleControlClicks(event);" aria-label="Playback controls"></canvas>
                        <a href="http://www.vastr.de" target="_blank" rel="noopener noreferrer" title="Visit Vastr.de"><img id="reader-branding-logo" class="branding-logo" alt="Vastr.de" /></a>
                    </div>
                </div>
            `;
            targetContainer.html(generatedHtml);
            this.styleInjector(); // Apply the associated CSS after elements are in place
        }
    },

    // Module for processing and analyzing text content
    textProcessor: {
        // A Map to define the optimal focal character index based on word length
        focalPointMap: new Map([
            [1, 1], [2, 1], [3, 2], [4, 2], [5, 2], [6, 2], [7, 3], [8, 3], [9, 3], [10, 3], [11, 4], [12, 4], [13, 5], [14, 5] // Extended map
        ]),

        // Determines the character index to highlight within a given word
        getFocalCharIndex: function(inputWord) {
            // Handle edge cases for invalid or empty words
            if (!inputWord || inputWord.length === 0) return 1;
            const wordLen = inputWord.length;
            // Use the map, or default to 5 for longer words
            return this.focalPointMap.get(wordLen) || 5;
        },

        // Generates a string of leading spaces for visual alignment on the canvas
        generatePadding: function(spaceCount) {
            // Ensure a non-negative count to prevent errors
            if (spaceCount < 0) return '';
            // Efficiently create a string of spaces
            return Array(spaceCount + 1).join(' ');
        },
    },

    // Module encapsulating the core word reading and timing logic
    readingEngine: {
        _playbackStatus: 0, // 0: Stopped/Ready, 1: Playing, 2: Paused
        _currentWpmDelay: 200, // Default delay in milliseconds per word (300 WPM)
        _callbackOnCompletion: null,
        _processedContentArray: [], // Stores words to be displayed
        _sourceDOMElement: '',
        _currentWordPosition: 0, // Index of the next word to display
        _playbackTimerId: null, // Holds the ID returned by setTimeout for cancellation

        // Initializes the reading engine with content from a source element and an optional callback
        prepareContent: function(sourceElement, onFinishCallback) {
            this._sourceDOMElement = sourceElement;
            this._callbackOnCompletion = onFinishCallback;
            this._currentWordPosition = 0;
            this._playbackStatus = 0; // Reset status to stopped/ready

            let rawSourceText = '';
            const $source = jQuery(sourceElement);

            // Extract text based on element type
            if ($source.is('input, textarea')) {
                rawSourceText = $source.val();
            } else {
                rawSourceText = $source.text();
            }

            // Advanced text cleaning: replace multiple whitespace/newlines with single space, trim, split by diverse delimiters
            rawSourceText = rawSourceText
                .replace(/[\n\r\t]+/g, ' ') // Consolidate newlines/tabs
                .replace(/(\s*-\s*)/g, ' $1 ') // Add spaces around hyphens for better splitting
                .trim(); // Remove leading/trailing whitespace

            // Split into words, considering various punctuation as word boundaries but keeping them attached to words
            // This regex splits by spaces, but also captures punctuation that might follow a word
            this._processedContentArray = rawSourceText
                .split(/(\s+|(?=[.,!?;:()]))/) // Split by whitespace OR lookahead for punctuation
                .filter(segment => segment && segment.trim().length > 0) // Remove empty or pure whitespace segments
                .map(segment => segment.trim()); // Trim individual segments

            // Add a special marker word to ensure final display and callback trigger
            this._processedContentArray.push("[END]");

            SpeedReaderApp.componentFactory.drawingSurface.displayCanvas.presentWord("SpeedReader"); // Initial display message
            this._updateDisplayState(0); // Set control visuals to 'stopped'
        },

        // Initiates or resumes the word playback cycle
        beginPlayback: function() {
            if (this._playbackStatus !== 1) { // Only start if not already playing
                this._updateDisplayState(1); // Transition to playing state
                this._startWordDisplayLoop();
            }
        },

        // Pauses the current word playback
        pausePlayback: function() {
            if (this._playbackStatus === 1) { // Only pause if currently playing
                clearTimeout(this._playbackTimerId); // Halt the current timer
                this._updateDisplayState(2); // Transition to paused state
                SpeedReaderApp.componentFactory.drawingSurface.displayCanvas.presentWord("Paused.");
            }
        },

        // Resets and restarts the playback from the beginning of the content
        restartPlayback: function() {
            clearTimeout(this._playbackTimerId); // Clear any active timer
            // Re-initialize content to reset word position and internal state
            this.prepareContent(this._sourceDOMElement, this._callbackOnCompletion);
            this._updateDisplayState(0); // Set controls to 'stopped' state
            SpeedReaderApp.componentFactory.drawingSurface.displayCanvas.presentWord("Restarted.");
        },

        // Adjusts the reading speed (Words Per Minute) based on user selection
        adjustWordsPerMinute: function() {
            const selectedWpm = parseInt(jQuery('#reading-speed-selector').val(), 10);
            if (isNaN(selectedWpm) || selectedWpm <= 50) { // Add lower bound validation
                console.warn("Invalid WPM selected (must be > 50), defaulting to 250.");
                this._currentWpmDelay = 60000 / 250;
                jQuery('#reading-speed-selector').val(250); // Reset selector visually
            } else {
                this._currentWpmDelay = Math.floor(60000 / selectedWpm); // Calculate delay in ms
            }
            console.log(`WPM set to: ${selectedWpm}, corresponding delay: ${this._currentWpmDelay}ms`);
        },

        // Internal method to update the playback status and corresponding UI controls
        _updateDisplayState: function(newStatus) {
            this._playbackStatus = newStatus;
            let repeat = false, play = false, stop = false;

            // Map internal status to visual control states
            switch (newStatus) {
                case 1: // Playing
                    play = true;
                    break;
                case 2: // Paused
                    stop = true;
                    break;
                case 0: // Stopped/Ready
                default:
                    stop = true; // Default to stop button active
                    break;
            }
            SpeedReaderApp.componentFactory.drawingSurface.controlCanvas.updateControlVisuals(repeat, play, stop);
        },

        // Recursive function driving the word display sequence
        _startWordDisplayLoop: function() {
            // Guard clause: If not in playing state, stop the loop
            if (this._playbackStatus !== 1) {
                clearTimeout(this._playbackTimerId);
                return;
            }

            // Check if all words have been presented
            if (this._currentWordPosition >= this._processedContentArray.length) {
                this._completePlayback();
                return;
            }

            const wordToPresent = this._processedContentArray[this._currentWordPosition];
            this._currentWordPosition++;

            SpeedReaderApp.componentFactory.drawingSurface.displayCanvas.presentWord(wordToPresent);

            let calculatedDelay = this._currentWpmDelay;

            // Dynamic delay adjustments for improved reading flow
            if (wordToPresent.match(/[.!?]$/)) { // Words ending in sentence-final punctuation
                calculatedDelay *= 2.5; // Longer pause
            } else if (wordToPresent.match(/[,;:]$/)) { // Words ending in commas, semicolons, colons
                calculatedDelay *= 1.5; // Moderate pause
            } else if (wordToPresent.length > 9) { // Longer words receive a slight extra pause
                calculatedDelay *= 1.1;
            } else if (wordToPresent === "[END]") { // Special end marker word
                calculatedDelay = 0; // No delay for the final trigger
            }

            // Schedule the next word display
            this._playbackTimerId = setTimeout(() => this._startWordDisplayLoop(), calculatedDelay);
        },

        // Actions to perform when playback concludes
        _completePlayback: function() {
            clearTimeout(this._playbackTimerId); // Ensure no lingering timers
            this._updateDisplayState(0); // Reset controls to stopped
            SpeedReaderApp.componentFactory.drawingSurface.displayCanvas.presentWord("Finished!");

            // Execute the user-provided callback if it exists
            if (typeof(this._callbackOnCompletion) === 'function') {
                this._callbackOnCompletion();
            }
            // Optionally, the app could automatically restart from beginning or display a prompt
            // For now, it simply stops and displays "Finished!"
        }
    }
};

// Application entry point: DOM ready handler
jQuery(document).ready(function() {
    // Initialize the SpeedReader with a default source element.
    // Make sure an element with ID 'reader-source-text' exists in your HTML,
    // e.g., <textarea id="reader-source-text">Your text here...</textarea>
    SpeedReaderApp.bootstrap('#reader-source-text');
});