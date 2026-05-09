let activeContentIdentifier = ''; // Renamed from currentSlug
let displayTargetKey = ''; // Renamed from currentId

/**
 * Fetches content from a specified URI using the modern Fetch API.
 * @param {string} resourceUri - The URL to fetch.
 * @param {function(string): void} processResponse - Callback function to handle the raw response text.
 * @returns {Promise<void>} A promise that resolves when the fetch operation is complete.
 */
async function retrieveExternalContent(resourceUri, processResponse) {
    try {
        const response = await fetch(resourceUri);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const rawData = await response.text();
        processResponse(rawData);
    } catch (error) {
        console.error('Failed to retrieve external content:', error);
        // Provide a user-friendly error message on the UI if possible
        const targetElement = document.getElementById(`reader-output-${displayTargetKey}`);
        if (targetElement) {
            targetElement.textContent = `Error loading content: ${error.message}. Please try again later.`;
        }
    }
}

// The original `hide_glance` function was commented out, so it's removed as a Type III change.

/**
 * Adds an event listener to the speed setting dropdown.
 * When the value changes, it updates local storage and re-initializes the speed reader.
 */
document.getElementById("speed-setting-selector").addEventListener("change", (event) => {
    // Clear any active reading sessions to prevent overlap.
    purgeExistingIntervals();

    // Persist the user's selected reading speed.
    const selectedSpeed = event.target.value;
    localStorage.setItem('RAPID_READ_SPEED', selectedSpeed);

    // Re-initialize the speed reading process with the new setting.
    initializeSpeedReading();
});

/**
 * Main entry point for the rapid reading feature.
 * Retrieves the user's preferred WPM and initiates content processing.
 */
function initializeSpeedReading() {
    const speedInputElem = document.getElementById("speed-setting-selector");
    if (!speedInputElem) {
        console.error("Speed setting selector element not found.");
        return;
    }

    const readSpeedValue = parseInt(speedInputElem.value, 10);

    // Validate the reading speed. If invalid, halt operation.
    if (isNaN(readSpeedValue) || readSpeedValue < 1) {
        console.warn("Invalid reading speed detected. Operation aborted.");
        return;
    }

    // Trigger the process to fetch and prepare article content.
    // The original code calls glanceifyURL without arguments here.
    // Assuming it's meant to fetch the current page's URL and a default ID.
    const currentBrowserUrl = window.location.href;
    fetchAndPrepareArticle(currentBrowserUrl, 'default-reader');
}

/**
 * Core function to preprocess text and manage the rapid display of words.
 * @param {string} textContentInput - The raw text to be displayed.
 * @param {string} originUri - The URL from which the content was fetched.
 */
function executeSpeedReadingDisplay(textContentInput, originUri) {
    const speedInputElem = document.getElementById("speed-setting-selector");
    const calculatedSpeed = parseInt(speedInputElem.value, 10);

    // Calculate the delay between words based on WPM.
    const delayPerWordMs = Math.floor(60000 / calculatedSpeed);

    // Split the input text into individual words, handling multiple spaces.
    let parsedWords = textContentInput.split(/\s+/).filter(word => word.trim() !== '');

    // Comprehensive word preprocessing for reading optimization.
    let processedWords = [];
    for (let i = 0; i < parsedWords.length; i++) {
        let currentWord = parsedWords[i];
        let tempWord = currentWord;

        // Replace periods with specific HTML entity for visual distinction.
        if (tempWord.includes('.')) {
            tempWord = tempWord.replace(/\./g, '&#8226;');
        }

        // Add pauses for longer words or those with internal punctuation.
        const shouldPause = (
            tempWord.length > 8 ||
            tempWord.includes(',') ||
            tempWord.includes(':') ||
            tempWord.includes('-') ||
            tempWord.includes('(')
        ) && !tempWord.includes('.'); // Exclude if already handled by period replacement

        if (shouldPause) {
            processedWords.push(tempWord, tempWord, tempWord); // Triple the word for a longer pause
        } else {
            processedWords.push(tempWord);
        }

        // Add additional blank "words" (spaces) after sentence-ending punctuation.
        if (/[.!?];)]/.test(currentWord.slice(-1))) { // Check last character for common end-punctuation
            processedWords.push(" ", " ", " "); // Add three blank spaces
        }
    }

    // Update the main word list with the processed version.
    parsedWords = processedWords;

    let currentWordIndex = 0;
    let isReaderActive = true;
    const activeIntervals = []; // Store interval IDs for controlled clearing.

    const readerOutputElement = document.getElementById(`reader-output-${displayTargetKey}`);
    if (!readerOutputElement) {
        console.error(`Reader output element "reader-output-${displayTargetKey}" not found.`);
        return;
    }

    // Attach click listener for play/pause functionality.
    readerOutputElement.addEventListener("click", toggleReadState);

    /**
     * Toggles the reading state between playing and paused.
     */
    function toggleReadState() {
        if (isReaderActive) {
            stopReaderLoop();
        } else {
            startReaderLoop();
        }
    }

    /**
     * Updates the displayed word in the UI.
     * @param {number} index - The index of the word to display.
     */
    function updateWordDisplay(index) {
        if (index < 0 || index >= parsedWords.length) {
            // Handle end of text or invalid index.
            stopReaderLoop();
            readerOutputElement.textContent = "End of text. Click to restart.";
            currentWordIndex = 0; // Reset for potential restart
            return;
        }
        const formattedHtml = generateFocusedWordHtml(parsedWords[index]);
        readerOutputElement.innerHTML = formattedHtml;
        currentWordIndex = index;
    }

    /**
     * Initiates the word display loop.
     */
    function startReaderLoop() {
        const controlButton = document.getElementById("read-control-button");
        if (controlButton) {
            controlButton.style.display = "block";
            controlButton.textContent = "Pause";
        }

        isReaderActive = true;

        // Use setInterval for continuous word display.
        const intervalId = setInterval(() => {
            updateWordDisplay(currentWordIndex);
            currentWordIndex++;
            if (currentWordIndex >= parsedWords.length) {
                currentWordIndex = 0; // Loop back to start or stop
                stopReaderLoop();
                readerOutputElement.textContent = "Content finished. Click to replay.";
            }
        }, delayPerWordMs);

        activeIntervals.push(intervalId); // Store the interval ID.
    }

    /**
     * Halts the word display loop.
     */
    function stopReaderLoop() {
        // Clear all intervals associated with this reading session.
        activeIntervals.forEach(clearInterval);
        activeIntervals.length = 0; // Clear the array.

        const controlButton = document.getElementById("read-control-button");
        if (controlButton) {
            controlButton.textContent = "Play";
        }
        isReaderActive = false;
    }

    // Start the reading loop immediately upon function call.
    startReaderLoop();
}

/**
 * Formats a single word for display, highlighting the "pivot" character.
 * This helps the reader to quickly focus on the optimal character.
 * @param {string} wordSegment - The word to format.
 * @returns {string} HTML string with the word segmented and styled.
 */
function generateFocusedWordHtml(wordSegment) {
    const segmentLength = wordSegment.length;
    let focusCharPosition = 1; // Default to first character

    // Determine the optimal character position based on word length.
    if (segmentLength >= 2 && segmentLength <= 5) {
        focusCharPosition = 2; // Second character for shorter words
    } else if (segmentLength >= 6 && segmentLength <= 9) {
        focusCharPosition = 3; // Third character for medium words
    } else if (segmentLength >= 10 && segmentLength <= 13) {
        focusCharPosition = 4; // Fourth character for longer words
    } else if (segmentLength > 13) {
        focusCharPosition = 5; // Fifth character for very long words
    }

    // Decode HTML entities before processing to ensure correct character counting.
    const decodedWord = unescapeHtmlEntities(wordSegment);

    // Create padding dots for visual alignment.
    const leadingDots = '.'.repeat(Math.max(0, 4 - focusCharPosition));
    const trailingDots = '.'.repeat(Math.max(0, 4 - (decodedWord.length - focusCharPosition)));

    // Split the word into three parts: before pivot, pivot, after pivot.
    const startPart = decodedWord.slice(0, focusCharPosition - 1);
    const middlePart = decodedWord.slice(focusCharPosition - 1, focusCharPosition);
    const endPart = decodedWord.slice(focusCharPosition, segmentLength);

    // Construct the HTML output using template literals.
    let finalHtml = `
        <span class='focus-prefix'>${leadingDots}${startPart}</span><span class='focus-pivot'>${middlePart}</span><span class='focus-suffix'>${endPart}${trailingDots}</span>
    `;

    // Replace padding dots with invisible placeholders for consistent spacing.
    finalHtml = finalHtml.replace(/\./g, "<span class='hidden-dot'>.</span>");

    return finalHtml;
}

/**
 * Fetches article content from a given URL using a content extraction API
 * and then initiates the speed reading display.
 * @param {string} articleUrl - The URL of the article to fetch.
 * @param {string} elementIdSuffix - A unique identifier for the reader UI elements.
 */
async function fetchAndPrepareArticle(articleUrl, elementIdSuffix) {
    // Clear any previous intervals to ensure a clean start.
    purgeExistingIntervals();

    // Update global identifiers for the current reading session.
    activeContentIdentifier = generateUrlSlug(articleUrl);
    displayTargetKey = elementIdSuffix;

    // Display loading indicators.
    const articleHolder = document.getElementById(`reader-output-${displayTargetKey}-holder`);
    const loadingMessageArea = document.getElementById(displayTargetKey);

    if (articleHolder) articleHolder.style.display = 'block';
    if (loadingMessageArea) {
        loadingMessageArea.textContent = 'Loading article...';
        loadingMessageArea.style.display = 'block';
    }

    // Use a placeholder/example token. In a real application, this would be secured.
    const contentApiToken = 'a1b2c3d4e5f678901234567890abcdef'; // Renamed from diffbot_token
    const contentApiEndpoint = `https://api.diffbot.com/v2/article?url=${encodeURIComponent(articleUrl)}&token=${contentApiToken}`;

    await retrieveExternalContent(contentApiEndpoint, (rawData) => {
        let parsedData;
        try {
            parsedData = JSON.parse(rawData);
        } catch (e) {
            console.error("Failed to parse API response:", e);
            if (loadingMessageArea) {
                loadingMessageArea.textContent = "Error: Could not parse article data.";
            }
            return;
        }

        if (parsedData.error) {
            const errorMessage = parsedData.error.message || "Article extraction failed. Try selecting text instead.";
            const targetOutput = document.getElementById(`reader-output-${displayTargetKey}`);
            if (targetOutput) {
                targetOutput.textContent = errorMessage;
            }
            if (loadingMessageArea) loadingMessageArea.style.display = 'none'; // Hide loading message on error
            return;
        }

        // Persist metadata (e.g., in a database or local storage, if applicable).
        // The original `createOrUpdate` function was not provided, so this is a placeholder.
        persistArticleMetadata(articleUrl, parsedData.title);

        // Construct the full text content for rapid reading.
        let articleTitle = '';
        if (parsedData.title && parsedData.title !== "") {
            articleTitle = parsedData.title + ". ";
        }

        let articleAuthor = '';
        if (parsedData.author) {
            articleAuthor = "By " + parsedData.author + ". ";
        }

        let articleBody = parsedData.text || '';
        articleBody = articleBody.trim(); // Remove leading/trailing whitespace.
        articleBody = articleBody.replace(/\s+/g, ' '); // Condense multiple spaces.

        const preambleText = "Article starting in five. Four. Three. Two. One. ";
        let fullTextContent = preambleText + articleTitle + articleAuthor + articleBody;

        // Ensure proper spacing after punctuation for better readability.
        fullTextContent = fullTextContent.replace(/\./g, '. ').replace(/\?/g, '? ').replace(/!/g, '! ');

        if (loadingMessageArea) loadingMessageArea.style.display = 'none'; // Hide loading message
        if (articleHolder) articleHolder.style.display = 'block'; // Ensure the holder is visible

        // Initiate the rapid reading display.
        executeSpeedReadingDisplay(fullTextContent, articleUrl);
    });
}

//////
// Utility Functions
//////

// In a real application, you might manage interval IDs more explicitly
// by storing them in an array specific to the reader component.
const activeRapidReaderIntervals = new Set(); // Global set to track all intervals created by the reader.

/**
 * Clears all currently active intervals created by the rapid reader.
 * This prevents multiple reading sessions from running concurrently.
 */
function purgeExistingIntervals() {
    activeRapidReaderIntervals.forEach(clearInterval);
    activeRapidReaderIntervals.clear(); // Empty the set after clearing.
    // Also, reset any UI elements that might be stuck in a "playing" state.
    const controlButton = document.getElementById("read-control-button");
    if (controlButton) {
        controlButton.textContent = "Play";
        // Optionally hide the button if no content is loaded.
        // controlButton.style.display = "none";
    }
    const readerOutputElement = document.getElementById(`reader-output-${displayTargetKey}`);
    if (readerOutputElement) {
        readerOutputElement.innerHTML = ''; // Clear displayed text
    }
}

// The original String.prototype.repeat polyfill is removed, assuming modern browser support.
// If targeting older browsers, it would need to be re-added or an alternative used.

/**
 * Decodes HTML entities in a string.
 * @param {string} encodedString - The string potentially containing HTML entities.
 * @returns {string} The string with HTML entities decoded.
 */
function unescapeHtmlEntities(encodedString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(encodedString, 'text/html');
    return doc.documentElement.textContent;
}

/**
 * Generates a simple slug from a URL. (Placeholder implementation)
 * @param {string} url - The URL to convert.
 * @returns {string} A basic slug.
 */
function generateUrlSlug(url) {
    // This is a very basic slug generator. A robust one would be more complex.
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.split('/').filter(Boolean).join('-') || 'home';
    } catch (e) {
        return 'unknown-path';
    }
}

/**
 * Placeholder function for persisting article metadata.
 * In a real application, this would interact with a backend or local storage.
 * @param {string} url - The URL of the article.
 * @param {string} title - The title of the article.
 */
function persistArticleMetadata(url, title) {
    console.log(`Metadata persisted: URL - ${url}, Title - ${title}`);
    // Example: localStorage.setItem(`article_${generateUrlSlug(url)}_title`, title);
}

// Initial setup to ensure the reader is ready.
document.addEventListener('DOMContentLoaded', () => {
    const speedSelector = document.getElementById("speed-setting-selector");
    if (speedSelector) {
        // Restore WPM from localStorage or set a default.
        const storedWPM = localStorage.getItem('RAPID_READ_SPEED');
        if (storedWPM) {
            speedSelector.value = storedWPM;
        } else {
            speedSelector.value = '300'; // Default WPM
            localStorage.setItem('RAPID_READ_SPEED', '300');
        }
    }

    // Ensure the read control button is initially set up.
    const controlButton = document.getElementById("read-control-button");
    if (controlButton) {
        controlButton.textContent = "Play"; // Default state
        // The button's display style will be managed by startReaderLoop/stopReaderLoop
    }
});