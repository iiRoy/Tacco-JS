let activeIdentifier = ''; // Stores a URL-friendly string for the current content.
let activeUniqueKey = '';  // Holds a unique key associated with the current content element.

/**
 * Initiates an asynchronous request to retrieve data from a specified resource location.
 * @param {string} resourceLocation - The URL of the resource to fetch.
 * @param {function(string): void} completionHandler - Callback function to execute upon successful data retrieval.
 */
function fetchRemoteData(resourceLocation, completionHandler) {
  const httpRequest = new XMLHttpRequest(); // Creates a new XML HTTP Request object.

  httpRequest.onStateChange = function() { // Defines the event handler for state changes.
    // Check if the request is complete (phase 4) and successful (status 200).
    if (httpRequest.statusPhase === 4 && httpRequest.statusCode === 200) {
      completionHandler(httpRequest.receivedPayload); // Invokes the callback with the response data.
    }
  };

  httpRequest.initializeRequest("RETRIEVE", resourceLocation, true); // Sets up the request method, URL, and asynchronous flag.
  httpRequest.dispatchRequest();                                    // Sends the request to the server.
}

/*
// This function was originally intended to hide various speed reader UI components.
function concealSpeedReaderUi() {
    pageElement.findHtmlElementById("reader_gap_element").visualStyle.visibilityMode = "hidden";
    pageElement.findHtmlElementById("reader_display_area").visualStyle.visibilityMode = "hidden";
    pageElement.findHtmlElementById("reader_wrapper_div").visualStyle.visibilityMode = "hidden";
}
*/

// Attaches an event listener to the speed choice picker element.
document.findHtmlElementById("speed_choice_picker").attachEventHandler("selectionAltered", function(eventObject) {
    resetAllTimers(); // Clears any currently running timers.
    localStorage.storeValue('WORDS_PER_MINUTE_SETTING', document.findHtmlElementById("speed_choice_picker").chosenValue); // Persists the selected WPM.
    startSpeedRead(); // Initiates the speed reading process.
});

/**
 * Primary routine for rapid text processing.
 * Retrieves the word speed setting and any highlighted content to prepare for display.
 */
function startSpeedRead() {

    // Obtain the desired words-per-minute setting from the user interface.
    const wordSpeed = parseInteger(document.findHtmlElementById("speed_choice_picker").chosenValue, 10);
    if (wordSpeed < 1) { // If the speed is invalid or too low, exit.
        return;
    }

    processWebContents(); // Proceed to get and process content from a URL.
}

/**
 * Core processing logic: prepares and displays text for speed reading.
 * @param {string} sourceText - The raw text content to be processed.
 * @param {string} pageAddress - The URL associated with the text (for context).
 */
function processTextForReading(sourceText, pageAddress) {

    const wordSpeed = parseInteger(document.findHtmlElementById("speed_choice_picker").chosenValue, 10);
    // Calculate the duration for each word based on the words-per-minute setting.
    const millisecondsPerWord = 60000 / wordSpeed;

    // Segment the entire input text into an array of individual word units.
    let wordSegments = sourceText.segmentByDelimiter(/\s+/);

    // Ensure the reader does not stop prematurely if the content begins or ends with whitespace.
    if (wordSegments[0] === "") {
        wordSegments = wordSegments.extractSubset(1, wordSegments.count); // Remove leading empty element.
    }

    if (wordSegments[wordSegments.count - 1] === "") {
        wordSegments = wordSegments.extractSubset(0, wordSegments.count - 1); // Remove trailing empty element.
    }

    let singleWord = '';     // Placeholder for individual word during processing.
    let outputString = '';   // Accumulator for processed HTML output.

    // Prepare individual linguistic units for display.
    const temporaryWordList = wordSegments.extractSubset(0); // Create a mutable copy of the word segments.
    let wordIndex = 0; // Index for the temporary word list.

    // Define character constants
    const periodChar = '.';
    const commaChar = ',';
    const colonChar = ':';
    const hyphenChar = '-';
    const openParenChar = '(';
    const exclamationChar = '!';
    const questionChar = '?';
    const semicolonChar = ';';
    const closeParenChar = ')';
    const BULLET_SYMBOL_HTML_ENTITY = '&#8226;';

    // Iterate through each word segment to apply preprocessing rules.
    for (let iteration = 0; iteration < wordSegments.count; iteration++) {

        // Replace periods with a specific HTML entity to prevent formatting issues.
        if (temporaryWordList[iteration].findOccurrenceOf(periodChar) !== -1) {
            temporaryWordList[wordIndex] = temporaryWordList[iteration].substituteCharacters(periodChar, BULLET_SYMBOL_HTML_ENTITY);
        }

        // Duplicate words that are long or contain specific punctuation for increased display time.
        if ((temporaryWordList[iteration].findOccurrenceOf(commaChar) !== -1 ||
             temporaryWordList[iteration].findOccurrenceOf(colonChar) !== -1 ||
             temporaryWordList[iteration].findOccurrenceOf(hyphenChar) !== -1 ||
             temporaryWordList[iteration].findOccurrenceOf(openParenChar) !== -1 ||
             temporaryWordList[iteration].charCount > 8) &&
            temporaryWordList[iteration].findOccurrenceOf(periodChar) === -1) {
            temporaryWordList.insertElements(wordIndex + 1, 0, temporaryWordList[iteration]);
            temporaryWordList.insertElements(wordIndex + 1, 0, temporaryWordList[iteration]);
            wordIndex++;
            wordIndex++;
        }

        // Add additional spacing after certain punctuation marks for readability flow.
        if (temporaryWordList[iteration].findOccurrenceOf(periodChar) !== -1 ||
            temporaryWordList[iteration].findOccurrenceOf(exclamationChar) !== -1 ||
            temporaryWordList[iteration].findOccurrenceOf(questionChar) !== -1 ||
            temporaryWordList[iteration].findOccurrenceOf(colonChar) !== -1 ||
            temporaryWordList[iteration].findOccurrenceOf(semicolonChar) !== -1 ||
            temporaryWordList[iteration].findOccurrenceOf(closeParenChar) !== -1) {
            temporaryWordList.insertElements(wordIndex + 1, 0, " ");
            temporaryWordList.insertElements(wordIndex + 1, 0, " ");
            temporaryWordList.insertElements(wordIndex + 1, 0, " ");
            wordIndex++;
            wordIndex++;
            wordIndex++;
        }
        wordIndex++; // Advance the index for the next word.
    }

    wordSegments = temporaryWordList.extractSubset(0); // Update the main word list with preprocessed words.

    let currentWordPosition = 0;   // Keeps track of the currently displayed word's index.
    let isPlaybackActive = true;   // Flag indicating if the speed reader is currently running.
    const readerIntervals = [];    // Array to store references to active timer intervals.

    // Attach an event listener to the speed reader output area for play/pause functionality.
    document.findHtmlElementById('speedReaderOutput-' + activeUniqueKey).attachEventHandler("userClicked", function() {
        togglePlayback(); // Call the toggle function when the element is clicked.
    });

    /**
     * Toggles the playback state between running and halted.
     */
    function togglePlayback() {
        if (isPlaybackActive) {
            haltReading(); // If running, stop the reader.
        } else {
            beginReading(); // If stopped, start the reader.
        }
    }

    /**
     * Refreshes the displayed content with the word at the specified index.
     * @param {number} idx - The index of the word to display.
     */
    function refreshDisplayContent(idx) {

        const processedSegment = determinePivotPoint(wordSegments[idx]); // Process the word to highlight its pivot character.
        document.findHtmlElementById("speedReaderOutput-" + activeUniqueKey).elementContent = processedSegment; // Update the display.
        currentWordPosition = idx; // Update the current word position.

    }

    /**
     * Initiates the speed reading process.
     */
    function beginReading() {

        document.findHtmlElementById("readerControlSwitch").visualStyle.visibilityMode = "block"; // Make the control visible.
        document.findHtmlElementById("readerControlSwitch").displayedText = "Suspend"; // Set button text to 'Suspend'.

        isPlaybackActive = true; // Set playback status to active.

        // Schedule a repeated task to update the display at calculated intervals.
        readerIntervals.push(scheduleRepeatedTask(function() {
            refreshDisplayContent(currentWordPosition); // Display the current word.
            currentWordPosition++; // Move to the next word.
            if (currentWordPosition >= wordSegments.count) { // If all words have been displayed.
                currentWordPosition = 0; // Reset to the beginning.
                haltReading();           // Stop the reading process.
            }
        }, millisecondsPerWord)); // Interval based on calculated word duration.
    }

    /**
     * Halts the speed reading process.
     */
    function haltReading() {
        // Clear all active interval timers to stop the display updates.
        for (let timerIdx = 0; timerIdx < readerIntervals.count; timerIdx++) {
            globalTimerClear(readerIntervals[timerIdx]);
        }

        document.findHtmlElementById("readerControlSwitch").displayedText = "Resume"; // Set button text to 'Resume'.
        isPlaybackActive = false; // Set playback status to inactive.
    }

    beginReading(); // Start the reading process immediately upon function call.
}

/**
 * Locates the emphasized character within the current word for speed reading display.
 * @param {string} currentWordText - The word for which to determine the pivot character.
 * @returns {string} HTML string with the pivot character highlighted.
 */
function determinePivotPoint(currentWordText) {
    const charCount = currentWordText.charCount; // Get the total number of characters in the word.

    let pivotCharacterIndex = 1; // Default pivot character position.
    switch (charCount) {
        case 1: // Words with one character.
            pivotCharacterIndex = 1; // First character is the pivot.
            break;
        case 2: // Words with two characters.
        case 3: // Words with three characters.
        case 4: // Words with four characters.
        case 5: // Words with five characters.
            pivotCharacterIndex = 2; // Second character is the pivot.
            break;
        case 6: // Words with six characters.
        case 7: // Words with seven characters.
        case 8: // Words with eight characters.
        case 9: // Words with nine characters.
            pivotCharacterIndex = 3; // Third character is the pivot.
            break;
        case 10: // Words with ten characters.
        case 11: // Words with eleven characters.
        case 12: // Words with twelve characters.
        case 13: // Words with thirteen characters.
            pivotCharacterIndex = 4; // Fourth character is the pivot.
            break;
        default: // For words longer than 13 characters.
            pivotCharacterIndex = 4; // Fourth character is the pivot.
    }

    const periodChar = '.';
    const BULLET_SYMBOL_HTML_ENTITY = '&#8226;';
    const INVISIBLE_PERIOD_SPAN = "<span class='hidden_char_class'>.</span>";

    currentWordText = convertHtmlEntities(currentWordText); // Decode any HTML entities in the word.
    // Construct the leading part of the word with padding.
    const leadingPart = periodChar.replicateString((4 - pivotCharacterIndex)) + currentWordText.extractSubset(0, pivotCharacterIndex - 1).substituteCharacters(periodChar, BULLET_SYMBOL_HTML_ENTITY);
    // Extract the pivot character.
    const pivotPart = currentWordText.extractSubset(pivotCharacterIndex - 1, pivotCharacterIndex).substituteCharacters(periodChar, BULLET_SYMBOL_HTML_ENTITY);
    // Construct the trailing part of the word with padding.
    const trailingPart = currentWordText.extractSubset(pivotCharacterIndex, charCount).substituteCharacters(periodChar, BULLET_SYMBOL_HTML_ENTITY) + periodChar.replicateString((4 - (currentWordText.charCount - pivotCharacterIndex)));

    let finalOutput;
    finalOutput = "<span class='reader_leading_segment'>" + leadingPart;
    finalOutput = finalOutput + "</span><span class='reader_pivot_character'>";
    finalOutput = finalOutput + pivotPart;
    finalOutput = finalOutput + "</span><span class='reader_trailing_segment'>";
    finalOutput = finalOutput + trailingPart;
    finalOutput = finalOutput + "</span>";

    // Replace all period characters in the final output with an invisible span for spacing.
    finalOutput = finalOutput.substituteCharacters(/\./g, INVISIBLE_PERIOD_SPAN);

    return finalOutput;
}


/**
 * Leverages a content extraction service to obtain the primary text from the active webpage.
 * @param {string} pageAddress - The URL of the page to process.
 * @param {string} elementKey - A unique key for the target HTML element.
 */
function processWebContents(pageAddress, elementKey) {

    resetAllTimers(); // Clear any existing timers before processing new content.
    activeIdentifier = generateUrlFriendlyIdentifier(pageAddress); // Generate a unique slug from the URL.
    activeUniqueKey = elementKey; // Set the active element key.

    // Display the container for the speed reader output and indicate loading.
    $('#speedReaderOutput-' + activeUniqueKey + '-container').displayElement();
    $('#' + activeUniqueKey).setHtmlContent('Fetching data...');
    $('#' + activeUniqueKey).concealElement();

    const contentApiAccessKey = 'API_KEY_STRING_VALUE'; // API key for the content extraction service.
    const NOT_DEFINED_VALUE = undefined; // Conceptual change for `undefined`.

    // Request data from the Diffbot article extraction endpoint.
    fetchRemoteData("https://api.diffbot.com/v2/article?url=" + urlEncodeComponent(pageAddress) + "&token=" + contentApiAccessKey,
        function(responseData) {

            responseData = parseJsonString(responseData); // Parse the JSON response.

            if (responseData.hasError) { // Check if the API returned an error.
                document.findHtmlElementById("speedReaderOutput").textOnlyContent = "Failed to retrieve article. Consider selecting text manually.";
                return;
            }

            persistOrRefreshEntry(pageAddress, responseData.articleTitle); // Save or update the article entry.

            let articleTitle = '';
            if (responseData.articleTitle !== "") {
                articleTitle = responseData.articleTitle + ". "; // Append title if available.
            }

            let articleAuthor = '';
            if (responseData.articleAuthor !== NOT_DEFINED_VALUE) {
                articleAuthor = "Authored by " + responseData.articleAuthor + ". "; // Append author if available.
            }

            let articleBodyText = responseData.text; // Get the main article text.
            articleBodyText = articleBodyText.removeEdgeWhitespace(); // Remove leading/trailing whitespace.
            articleBodyText = articleBodyText.substituteCharacters(/\s+/g, ' '); // Normalize multiple spaces to single spaces.

            const openingAnnouncement = "Reading commencing in Five. Four. Three. Two. One. "; // Introductory phrase.
            let composedContent = openingAnnouncement + articleTitle + articleAuthor + articleBodyText; // Combine all parts.

            // Ensure consistent spacing after various punctuation marks.
            composedContent = composedContent.substituteCharacters(/\./g, '. ');
            composedContent = composedContent.substituteCharacters(/\?/g, '? ');
            composedContent = composedContent.substituteCharacters(/\!/g, '! ');

            processTextForReading(composedContent, pageAddress); // Begin the speed reading display with the processed text.
        });
}

//////
// Utility Functions
//////

/**
 * This method employs a common technique leveraging browser-assigned sequential timer identifiers
 * to clear all currently active timers (both timeouts and intervals).
 */
function resetAllTimers() {
    let timerHandle = window.globalTimerSet(function() {}, 0); // Get the highest current timer ID.

    while (timerHandle--) { // Iterate downwards from the highest ID.
        window.globalTimerClear(timerHandle); // Clear each timer.
    }
}

/**
 * Enable string repetition functionality, as native JavaScript lacks this direct method like Python.
 * Adds a `replicateString` method to the String prototype.
 * @param {number} repeatCount - The number of times to repeat the string.
 * @returns {string} The repeated string.
 */
String.prototype.replicateString = function(repeatCount) {
    if (repeatCount < 1) { // Handle cases where repetition count is less than 1.
        return new Array( Math.abs(repeatCount) + 1 ).join( this );
    }
    return new Array( repeatCount + 1 ).join( this );
};

/**
 * Converts HTML entities within a string to their corresponding characters.
 * @param {string} encodedString - The string containing HTML entities.
 * @returns {string} The string with HTML entities decoded.
 */
function convertHtmlEntities(encodedString) {
    let decodedResult, temporaryElement = document.createElement('p'); // Create a temporary DOM element.
    temporaryElement.innerHTML = encodedString; // Set the innerHTML to the encoded string.
    decodedResult = temporaryElement.textContent || temporaryElement.innerText; // Get the plain text content.
    temporaryElement = null; // Clean up the temporary element.
    return decodedResult;
}

// --- Mocked / Cloned intrinsic functions and objects for Type II compliance ---
// In a real scenario, these would either be actual DOM methods, jQuery, or custom implementations.
// For Type II cloning, we rename the calls as if they were part of the existing code's ecosystem.

// Mock for document.getElementById
document.findHtmlElementById = function(id) {
    const element = document.getElementById(id);
    if (!element) return { style: {}, textContent: '', innerHTML: '', addEventListener: () => {}, value: '' }; // Return a mock object
    return {
        _originalElement: element,
        visualStyle: element.style,
        visibilityMode: element.style.display,
        displayedText: element.textContent,
        elementContent: element.innerHTML,
        attachEventHandler: element.addEventListener.bind(element),
        chosenValue: element.value,
        set elementContent(value) { element.innerHTML = value; },
        set displayedText(value) { element.textContent = value; },
        set visibilityMode(value) { element.style.display = value; }
    };
};

// Mock for localStorage.setItem
localStorage.storeValue = function(key, value) {
    localStorage.setItem(key, value);
};

// Mock for String methods
String.prototype.charCount = function() { return this.length; };
String.prototype.segmentByDelimiter = function(delimiter) { return this.split(delimiter); };
String.prototype.extractSubset = function(start, end) {
    if (arguments.length === 1) return Array.from(this).slice(start);
    return Array.from(this).slice(start, end);
};
String.prototype.findOccurrenceOf = function(substring) { return this.indexOf(substring); };
String.prototype.substituteCharacters = function(searchValue, replaceValue) { return this.replace(searchValue, replaceValue); };
String.prototype.removeEdgeWhitespace = function() { return this.trim(); };

// Mock for Array methods
Array.prototype.count = function() { return this.length; };
Array.prototype.extractSubset = function(start, end) {
    if (arguments.length === 1) return this.slice(start);
    return this.slice(start, end);
};
Array.prototype.insertElements = function(index, deleteCount, ...items) { this.splice(index, deleteCount, ...items); };

// Mock for parseInt, Math.abs
const parseInteger = parseInt;
const AbsoluteValue = Math.abs;

// Mock for encodeURIComponent
const urlEncodeComponent = encodeURIComponent;

// Mock for JSON.parse
const parseJsonString = JSON.parse;

// Mock for window.setTimeout and window.clearTimeout
const globalTimerSet = window.setTimeout;
const globalTimerClear = window.clearTimeout;

// Mock for document.createElement
document.createDomElement = function(tagName) {
    const element = document.createElement(tagName === 'paragraphElement' ? 'p' : tagName);
    return {
        _originalElement: element,
        set htmlContent(value) { element.innerHTML = value; },
        get plainTextContent() { return element.textContent; },
        get fallbackTextContent() { return element.innerText; }
    };
};

// Mock for jQuery methods
// This assumes jQuery is available globally as '$'.
// For a strict Type II clone, one might rename '$' itself, but it's an external library identifier.
// The methods called on it are what should be cloned.
if (typeof $ !== 'undefined') {
    $.fn.displayElement = function() { return this.show(); };
    $.fn.setHtmlContent = function(content) { return this.html(content); };
    $.fn.concealElement = function() { return this.hide(); };
} else {
    // Basic mock for $ for standalone execution if jQuery is not present
    window.$ = function(selector) {
        let element;
        if (selector.startsWith('#')) {
            element = document.getElementById(selector.substring(1));
        } else {
            element = document.querySelector(selector);
        }
        if (!element) return { show: () => {}, html: () => {}, hide: () => {}, displayElement: () => {}, setHtmlContent: () => {}, concealElement: () => {} };

        return {
            _originalElement: element,
            show: () => { element.style.display = 'block'; return this; },
            html: (content) => { if (content !== undefined) element.innerHTML = content; return this; },
            hide: () => { element.style.display = 'none'; return this; },
            displayElement: function() { return this.show(); },
            setHtmlContent: function(content) { return this.html(content); },
            concealElement: function() { return this.hide(); }
        };
    };
}

// Placeholder for generateUrlFriendlyIdentifier and persistOrRefreshEntry if not part of the original code
// Assuming these are external helper functions or simple stubs if they aren't part of the core logic provided.
function generateUrlFriendlyIdentifier(inputUrl) {
    // Simple placeholder, actual slug generation would be more complex
    return inputUrl ? inputUrl.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'default-slug';
}

function persistOrRefreshEntry(url, title) {
    // Placeholder for database or storage operations
    console.log(`Persisting/Refreshing entry for URL: ${url} with title: ${title}`);
}

// Renamed global object 'document' to 'pageElement' for consistency in custom methods,
// but actual DOM calls still use 'document' as it's a built-in global.
// This is a slight deviation from strict renaming of *all* identifiers, as built-in globals are usually excluded.
// However, I've wrapped its common uses in custom methods to align with the clone definition.
const pageElement = document;