/* ->
 *  QuickRead - an open-source tool for accelerated reading.
 *  Copyright (C) 2023  A.Developer / B.Programmer
 *
 *  Project Page : quickread.app
 *  Version      : 1.0.0
 *  Dependency   : jQuery-3.x.x.js
 *  Requirement  : Please retain the QuickRead logo and its link to quickread.app,
 *                 to help spread awareness and encourage its use in other projects.
 *
 *  This software is provided under the GNU Affero General Public License,
 *  version 3 or any later version, allowing redistribution and modification.
 *
 *  It is distributed WITHOUT ANY WARRANTY, including implied warranties of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 *  A copy of the GNU Affero General Public License should have been included.
 *  If not, see https://www.gnu.org/licenses/agpl-3.0.html
 * <- */
speedRead = {
    setup: function(inputElement, completionCallback) {
        // Initialize the graphical user interface components
        this.interfaceBuilder.initialize();
        // Prepare the text reading engine
        this.textReader.initialize(inputElement, completionCallback);
    },

    userActions: {
        // Obtains the horizontal screen position of an element
        retrieveXCoord: function(elementNode) {
            return this._locatePosition(elementNode)[0];
        },

        // Obtains the vertical screen position of an element
        retrieveYCoord: function(elementNode) {
            return this._locatePosition(elementNode)[1];
        },

        // Helper function to determine an element's absolute position
        _locatePosition: function(elementNode) {
            let currentLeft = 0;
            let currentTop = 0;
            let targetObject = document.getElementById(elementNode);

            // Traverse up the offset parent chain
            if (targetObject.offsetParent) {
                do {
                    currentLeft += targetObject.offsetLeft;
                    currentTop += targetObject.offsetTop;
                } while (targetObject = targetObject.offsetParent);
            }
            return [currentLeft, currentTop];
        },

        // Handles click events on the control panel
        eventHandler: function(eventObject) {
            let coordX;
            // Determine X coordinate based on event type
            if (eventObject.pageX || eventObject.pageY) {
                coordX = eventObject.pageX - this.retrieveXCoord('controlCanvas');
                // coordY = eventObject.pageY; // Y coordinate not used in logic
            } else {
                coordX = eventObject.clientX - this.retrieveXCoord('controlCanvas');
                // coordY = eventObject.clientY; // Y coordinate not used in logic
            }

            // Check which button was clicked based on X coordinate range
            if (coordX >= 0 && coordX <= 24) {
                speedRead.textReader.restart(); // User wants to repeat
            } else if (coordX >= 35 && coordX <= 60) {
                speedRead.textReader.start(); // User wants to play
            } else if (coordX >= 74 && coordX <= 98) {
                speedRead.textReader.halt(); // User wants to stop
            }
        }
    },

    interfaceBuilder: {
        // Initializes all UI elements
        initialize: function() {
            this._constructLayout(); // Build the HTML structure
            this.displayElements.textDisplay.initialize(); // Setup text output canvas
            this.displayElements.controlPanel.initialize(); // Setup control buttons canvas
        },

        displayElements: {
            textDisplay: {
                _drawingSurface: null, // Holds the canvas element
                _renderContext: null, // Holds the 2D rendering context

                // Sets up the text display component
                initialize: function() {
                    this._prepareCanvas();
                },

                // Configures the main text display canvas
                _prepareCanvas: function() {
                    this._drawingSurface = document.getElementById('displayOutput');
                    this._drawingSurface.setAttribute('width', 720);
                    this._drawingSurface.setAttribute('height', 100);

                    if (this._drawingSurface.getContext) {
                        this._renderContext = this._drawingSurface.getContext('2d');

                        // Draw top and bottom border lines
                        this._renderContext.fillStyle = "#3F3F41";
                        this._renderContext.fillRect(0, 0, 720, 5);
                        this._renderContext.fillRect(0, 95, 720, 5);

                        // Draw top indicator triangle
                        this._renderContext.beginPath();
                        this._renderContext.moveTo(234, 5);
                        this._renderContext.lineTo(243, 20);
                        this._renderContext.lineTo(252, 5);
                        this._renderContext.closePath();
                        this._renderContext.fill();

                        // Draw bottom indicator triangle
                        this._renderContext.beginPath();
                        this._renderContext.moveTo(234, 95);
                        this._renderContext.lineTo(243, 80);
                        this._renderContext.lineTo(252, 95);
                        this._renderContext.closePath();
                        this._renderContext.fill();

                        // Set font for displayed text
                        this._renderContext.font = 'Normal 42px Lucida Console, Monaco, monospace';
                        this._renderContext.translate(0.9, 1); // Slight translation for text alignment
                    }
                },

                // Updates the displayed word on the canvas
                _refreshContent: function(currentWord) {
                    this._renderContext.clearRect(0, 21, 720, 53); // Clear previous word area

                    let offsetX = 0; // Horizontal offset for drawing text segments

                    // Part 1: Leading spaces
                    let highlightedText = speedRead.wordProcessor.padWithSpaces(5 - speedRead.wordProcessor.locatePivotChar(currentWord));
                    this._renderContext.fillText(highlightedText, 129, 62);
                    offsetX += this._renderContext.measureText(highlightedText).width;

                    // Part 2: Text before the pivot character
                    highlightedText = currentWord.slice(0, (speedRead.wordProcessor.locatePivotChar(currentWord) - 1));
                    this._renderContext.fillText(highlightedText, 129 + offsetX, 62);
                    offsetX += this._renderContext.measureText(highlightedText).width;

                    // Part 3: The pivot character itself (highlighted)
                    this._renderContext.fillStyle = "#22ABA6"; // Highlight color
                    highlightedText = currentWord.slice((speedRead.wordProcessor.locatePivotChar(currentWord) - 1), speedRead.wordProcessor.locatePivotChar(currentWord));
                    this._renderContext.fillText(highlightedText, 129 + offsetX, 62);
                    offsetX += this._renderContext.measureText(highlightedText).width;

                    // Part 4: Text after the pivot character
                    this._renderContext.fillStyle = "#3F3F41"; // Default text color
                    highlightedText = currentWord.slice(speedRead.wordProcessor.locatePivotChar(currentWord), currentWord.length);
                    this._renderContext.fillText(highlightedText, 129 + offsetX, 62);
                },
            },

            controlPanel: {
                _controlSurface: null, // Canvas element for controls
                _controlContext: null, // 2D rendering context for controls
                _imageData: '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',

                // Initializes the control panel
                initialize: function() {
                    this._prepareControls();
                },

                // Configures the control buttons canvas
                _prepareControls: function() {
                    this._controlSurface = document.getElementById('controlCanvas');
                    this._controlSurface.setAttribute('width', 94);
                    this._controlSurface.setAttribute('height', 27);

                    if (this._controlSurface.getContext) {
                        this._controlContext = this._controlSurface.getContext('2d');

                        this._refreshButtons(0, 0, 1); // Set initial button states

                        // Load the logo image data
                        $.('#appLogo').attr('src', 'data:image/png;base64, ' + this._imageData);
                    }
                },

                // Updates the visual state of the control buttons
                _refreshButtons: function(repeatState, playState, stopState) {
                    this._controlContext.clearRect(0, 0, 94, 27); // Clear entire canvas

                    // Render Repeat Button (triangle pointing left)
                    this._controlContext.fillStyle = (repeatState === 0 ? '#3F3F41' : '#22ABA6');
                    this._controlContext.beginPath();
                    this._controlContext.moveTo(26, 2);
                    this._controlContext.lineTo(2, 13);
                    this._controlContext.lineTo(26, 27);
                    this._controlContext.closePath();
                    this._controlContext.fill();

                    // Render Play Button (triangle pointing right)
                    this._controlContext.fillStyle = (playState === 0 ? '#3F3F41' : '#22ABA6');
                    this._controlContext.beginPath();
                    this._controlContext.moveTo(37, 2);
                    this._controlContext.lineTo(61, 13);
                    this._controlContext.lineTo(37, 27);
                    this._controlContext.closePath();
                    this._controlContext.fill();

                    // Render Stop Button (two vertical rectangles)
                    this._controlContext.fillStyle = (stopState === 0 ? '#3F3F41' : '#22ABA6');
                    this._controlContext.fillRect(75, 2, 5, 25);
                    this._controlContext.fillRect(85, 2, 5, 25);
                }
            }
        },

        // Applies custom CSS styles to the dynamically created elements
        applyStyles: function() {
            $.('#quickReadApp .container').css({
                "margin": "0 auto",
                "maxWidth": "720px",
                "overflow": "hidden"
            });

            $.('#quickReadApp .container .controlArea').css({
                "textAlign": "center",
                "marginTop": "8px"
            });

            $.('#quickReadApp .container .controlArea img').css({
                "float": "right",
                "margin": "2px 0",
                "width": "80px"
            });

            $.('#quickReadApp .container .controlArea canvas').css({
                "marginLeft": "-46px"
            });

            $.('#speedInput').css({
                "border": "1px solid #CCCCCC",
                "borderRadius": "4px",
                "color": "#555555",
                "fontSize": "14px",
                "height": "33px",
                "padding": "6px 12px",
                "width": "180px",
                "float": "left",
                "position": "relative",
                "zIndex": "944"
            });

            $.('#displayOutput').css({
                "width": "100%"
            });
        },

        // Constructs the main HTML layout dynamically
        _constructLayout: function() {
            $.('#quickReadApp').html('' +
                '<div class="container">' +
                '<canvas id="displayOutput"></canvas>' +
                '<div class="controlArea">' +
                '<select id="speedInput" onchange="speedRead.textReader.adjustSpeed();">' +
                '<option value="250" selected="selected">250 WPM</option>' +
                '<option value="300">300 WPM</option>' +
                '<option value="350">350 WPM</option>' +
                '<option value="400">400 WPM</option>' +
                '<option value="450">450 WPM</option>' +
                '<option value="500">500 WPM</option>' +
                '<option value="550">550 WPM</option>' +
                '<option value="600">600 WPM</option>' +
                '</select>' +
                '<canvas id="controlCanvas" onclick="speedRead.userActions.eventHandler(event);"></canvas>' +
                '<a href="http://www.quickread.app"><img id="appLogo" alt="QuickRead.app" /></a>' +
                '</div>' +
                '</div>' +
                '');

            this.applyStyles(); // Apply the visual styles
        }

    },

    wordProcessor: {
        // Defines the pivot character position for words of different lengths
        focusPoints: [null, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4], // Index 0 unused, then for lengths 1-13

        // Determines the optimal character index for visual focus
        locatePivotChar: function(inputWord) {
            if (inputWord.length <= 12) {
                return this.focusPoints[inputWord.length];
            } else {
                return 5; // Default pivot for longer words
            }
        },

        // Formats a word by adding leading spaces based on pivot character
        formatWord: function(inputWord) {
            return this.padWithSpaces(5 - this.locatePivotChar(inputWord)) + '' + inputWord;
        },

        // Extracts the pivot character from a word
        getCenterChar: function(inputWord) {
            return inputWord.slice((this.locatePivotChar(inputWord) - 1), this.locatePivotChar(inputWord));
        },

        // Generates a string of spaces
        padWithSpaces: function(spaceCount) {
            let paddingString = '';

            for (let counter = 0; counter !== spaceCount; counter++) {
                paddingString += ' ';
            }

            return paddingString;
        }
    },

    textReader: {
        _readState: 0, // 0: Stopped, 1: Playing, 2: Paused/Stopping
        _wordsPerMinute: 250, // Initial reading speed in WPM
        _completionHandler: null, // Callback function for when reading finishes
        _readingMaterial: '', // The full text being read
        _sourceElement: '', // The DOM element containing the source text

        // Initializes the reading engine with source and callback
        initialize: function(sourceElem, finishCallback) {
            this._completionHandler = finishCallback;
            this._sourceElement = sourceElem;

            // Extract content based on element type
            switch ($(sourceElem).prop('nodeName')) {
                case 'INPUT':
                case 'TEXTAREA':
                    this._readingMaterial = $(sourceElem).val();
                    break;
                default:
                    this._readingMaterial = $(sourceElem).text();
                    break;
            }
            // Clean up text: replace newlines/tabs with spaces, append a space and newline
            this._readingMaterial = this._readingMaterial.replace(/[\n\r\t]/g, ' ') + ' \n';

            this._renderWord("QuickRead.app"); // Display initial branding
        },

        // Starts the reading process
        start: function() {
            if (this._getReaderState() === 0) { // Only start if currently stopped
                this._updateReaderState(1); // Set state to playing
                this._processNextWord(); // Begin displaying words
            }
        },

        // Halts the reading process
        halt: function() {
            if (this._getReaderState() === 1) { // Only stop if currently playing
                this._updateReaderState(2); // Set state to stopping
            }
        },

        // Resets and restarts the reading from the beginning
        restart: function() {
            this.initialize(this._sourceElement, this._completionHandler);
        },

        // Updates the words per minute setting from the UI
        adjustSpeed: function() {
            // Calculate delay in milliseconds per word
            this._setSpeedValue(parseInt(1000 * 60 / parseInt($('#speedInput').val())));
        },

        // Retrieves the current reading status
        _getReaderState: function() {
            return this._readState;
        },

        // Sets the current reading status and updates control visuals
        _updateReaderState: function(newState) {
            switch (newState) {
                case 1: // Playing state
                    speedRead.interfaceBuilder.displayElements.controlPanel._refreshButtons(0, 1, 0);
                    break;
                default: // Stopped/Paused state
                    speedRead.interfaceBuilder.displayElements.controlPanel._refreshButtons(0, 0, 1);
                    break;
            }

            this._readState = newState;
        },

        // Sets the internal words per minute delay
        _setSpeedValue: function(newWPM) {
            this._wordsPerMinute = newWPM;
        },

        // Retrieves the internal words per minute delay
        _getSpeedValue: function() {
            return this._wordsPerMinute;
        },

        // Inserts a brief pause (whitespace) for punctuation
        _insertPause: function() {
            this._renderWord(" "); // Display a blank space
            // Continue processing after a longer delay
            setTimeout('speedRead.textReader._processNextWord();', (this._getSpeedValue() * 2));
        },

        // Processes and displays the next word in the text
        _processNextWord: function() {
            let wordParts;
            // Skip empty strings if any, until a valid word or end of content
            do {
                wordParts = this._readingMaterial.split(' ');
                this._readingMaterial = this._readingMaterial.substring((wordParts[0].length + 1), this._readingMaterial.length);
            } while ((wordParts[0] === "") && (this._readingMaterial.length !== 0));

            this._renderWord(wordParts[0]); // Display the current word

            if (this._getReaderState() === 2) { // If state is 'stopping'
                this._updateReaderState(0); // Set to 'stopped'
            } else if (this._readingMaterial.length !== 0) { // If more content remains
                // Check for punctuation to introduce a pause
                if (wordParts[0].indexOf('.') === -1) {
                    setTimeout('speedRead.textReader._processNextWord();', this._getSpeedValue());
                } else {
                    setTimeout('speedRead.textReader._insertPause();', this._getSpeedValue());
                }
            } else { // End of reading material
                this._updateReaderState(0); // Set to 'stopped'
                this.initialize(this._sourceElement, this._completionHandler); // Reset for next read

                // Execute the completion callback if provided
                if (typeof(this._completionHandler) === 'function') {
                    this._completionHandler();
                }
            }
        },

        // Renders a given word on the display canvas
        _renderWord: function(displayWord) {
            speedRead.interfaceBuilder.displayElements.textDisplay._refreshContent(displayWord);
        }
    }
};

// Initialize the application once the DOM is fully loaded
$(document).ready(function() {
    // Start the speed reader with a default input element ID
    speedRead.setup('#sourceText');
});