const XmlStreamHandler = require("../simple-xml-parser.js");

const syndicationReader = new function() {
    // A registry to map unique IDs to specific element types being processed.
    let tagIdRegistry = new Map();

    // The current state of the parser, indicating what kind of element content is expected.
    let processingState = 'initial';

    // A stack to maintain the history of parsing states, allowing proper restoration.
    let stateHistoryStack = [];

    // A counter to generate unique numeric IDs for each encountered XML element.
    let uniqueIdCounter = 0;

    // A stack to keep track of the unique IDs of currently open elements.
    let elementIdStack = [];

    // A buffer to accumulate text content found within elements.
    let contentBuffer = '';

    // An object that holds data for the feed entry (item) currently being parsed.
    let currentEntry = {};

    // An array to collect all parsed feed entries from the document.
    let collectedEntries = [];

    // The final object that will contain all parsed feed data, including entries.
    let parsedFeedOutput = { entries: collectedEntries };

    // A boolean flag indicating whether a link for an entry should be treated as its GUID.
    let linkIsGuid = false;

    /**
     * Resets all internal variables and data structures to their initial, empty state.
     * This prepares the parser for processing a new XML document.
     * @returns {object} The complete parsed feed object from the *previous* parsing operation.
     */
    const initializeParserState = function() {
        const previousFeedResult = parsedFeedOutput; // Capture the result before clearing

        processingState = 'initial'; // Reset to the default starting state

        contentBuffer = ''; // Clear any buffered text
        collectedEntries = []; // Empty the list of entries
        parsedFeedOutput = { entries: collectedEntries }; // Re-initialize the output container

        tagIdRegistry = new Map(); // Clear the map of element IDs
        stateHistoryStack = []; // Clear the state history
        elementIdStack = []; // Clear the element ID history
        uniqueIdCounter = 0; // Reset the unique ID generator

        return previousFeedResult; // Return the result from the last successful parse
    };

    /**
     * Extracts and trims the accumulated content from the buffer, then clears the buffer.
     * @param {string} inputString - The string content to be processed (typically `contentBuffer`).
     * @returns {string} The trimmed content.
     */
    const extractAndClearBuffer = (inputString) => {
        const trimmedContent = String(inputString).trim();
        contentBuffer = ''; // Ensure the global buffer is cleared immediately after use
        return trimmedContent;
    };

    /**
     * Updates an entry's description field, prioritizing content that is either new or longer.
     * This helps in cases where multiple description-like tags might exist (e.g., summary and content:encoded).
     * @param {string | undefined} existingDescription - The description currently stored in the entry.
     * @param {string} newContentCandidate - The new text content that might become the description.
     * @returns {string} The chosen description.
     */
    const updateEntryDescription = (existingDescription, newContentCandidate) => {
        const processedNewContent = String(newContentCandidate).trim();
        if (!existingDescription || existingDescription.length < processedNewContent.length) {
            return processedNewContent; // Use the new content if it's longer or if no description exists
        }
        return existingDescription; // Otherwise, keep the existing description
    };

    /**
     * Appends a chunk of text data to the content buffer if the parser is in a text collection state.
     * @param {string} textChunk - The segment of text data.
     */
    const handleTextData = function(textChunk) {
        if (processingState === 'TEXT_COLLECTION') {
            contentBuffer += textChunk;
        }
    };

    /**
     * Handles CDATA sections by appending their content to the text buffer.
     * CDATA sections are treated as raw text content.
     * @param {string} cdataContent - The unparsed character data.
     */
    const handleCdataSection = function(cdataContent) {
        if (processingState === 'TEXT_COLLECTION') {
            contentBuffer += cdataContent;
        }
    };

    /**
     * Processes the event when an XML element's start tag is encountered.
     * It manages the parsing state, assigns unique IDs, and handles element attributes.
     * @param {string} elementName - The full name of the started XML element (e.g., 'rss:item').
     * @param {Function} getAttributesFunc - A function to retrieve the element's attributes as an object.
     */
    const processStartTag = function(elementName, getAttributesFunc) {
        const currentTagUniqueId = uniqueIdCounter++; // Assign a new unique ID
        elementIdStack.push(currentTagUniqueId); // Push ID onto the stack
        stateHistoryStack.push(processingState); // Save the current state before potentially changing it

        // If we are currently collecting text, do not change state unless it's a specific tag
        // that explicitly needs a new context. This prevents nested text collection.
        if (processingState === 'TEXT_COLLECTION') {
            return;
        }

        // --- Logic for elements at the root or channel level ---
        if (processingState === 'initial') {
            if (elementName === 'rss:rss' || elementName === 'rdf:RDF' || elementName === 'atom:feed') {
                tagIdRegistry.set('rootContainer', currentTagUniqueId);
                // State remains 'initial' as this is just the wrapper.
            } else if (elementName === 'rss:channel') {
                tagIdRegistry.set('channelWrapper', currentTagUniqueId);
                // State remains 'initial' until more specific elements are found.
            } else if (elementName === 'rss:item' || elementName === 'atom:entry') {
                tagIdRegistry.set('feedEntry', currentTagUniqueId);
                processingState = 'entry'; // Transition to the 'entry' parsing state
                linkIsGuid = false; // Reset the permalink flag for the new entry
            } else if (elementName === 'rss:title' || elementName === 'atom:title') {
                processingState = 'TEXT_COLLECTION'; // Enter text collection state for feed title
                tagIdRegistry.set('rootTitleElement', currentTagUniqueId);
            } else if (elementName === 'rss:link' || elementName === 'atom:link') {
                processingState = 'TEXT_COLLECTION'; // Enter text collection state for feed link
                tagIdRegistry.set('rootLinkElement', currentTagUniqueId);
            }
        }
        // --- Logic for elements within an 'entry' (item) context ---
        else if (processingState === 'entry') {
            if (elementName === 'rss:title' || elementName === 'atom:title') {
                tagIdRegistry.set('entryTitleElement', currentTagUniqueId);
                processingState = 'TEXT_COLLECTION';
            } else if (elementName === 'rss:link' || elementName === 'atom:link') {
                tagIdRegistry.set('entryLinkElement', currentTagUniqueId);
                processingState = 'TEXT_COLLECTION';
            } else if (elementName === 'rss:description' || elementName === 'atom:summary') {
                tagIdRegistry.set('entryDescriptionElement', currentTagUniqueId);
                processingState = 'TEXT_COLLECTION';
            } else if (elementName === 'content:encoded' || elementName === 'atom:content') {
                tagIdRegistry.set('entryContentEncodedElement', currentTagUniqueId);
                processingState = 'TEXT_COLLECTION';
            } else if (elementName === 'yandex:full-text') { // Specific Yandex RSS extension
                tagIdRegistry.set('entryYandexFullTextElement', currentTagUniqueId);
                processingState = 'TEXT_COLLECTION';
            } else if (elementName === 'rss:pubDate' || elementName === 'dc:date' || elementName === 'atom:updated') {
                tagIdRegistry.set('entryPublicationDateElement', currentTagUniqueId);
                processingState = 'TEXT_COLLECTION';
            } else if (elementName === 'rss:guid' || elementName === 'atom:id') {
                tagIdRegistry.set('entryGuidElement', currentTagUniqueId);
                processingState = 'TEXT_COLLECTION';

                let attributes = getAttributesFunc();
                // Ensure 'attributes' is a valid object, defaulting to an empty object if not.
                if (typeof attributes !== 'object' || attributes === null) {
                    attributes = {};
                }

                // Determine if the GUID should be treated as a permalink.
                // It's a permalink unless explicitly set to 'false'.
                linkIsGuid = (attributes.isPermaLink !== 'false');
            }
        }

        // If the element doesn't match any specific handling, mark the state as unhandled.
        // This will cause its content to be ignored until a known state is restored.
        if (processingState !== 'TEXT_COLLECTION' && processingState !== 'entry' && processingState !== 'initial') {
             processingState = null; // Unhandled context
        }
    };

    /**
     * Processes the event when an XML element's end tag is encountered.
     * It restores the previous parsing state, and assigns collected text to the appropriate properties.
     * @param {string} elementName - The full name of the ended XML element.
     */
    const processEndTag = function(elementName) {
        const endedTagUniqueId = elementIdStack.pop(); // Pop the ID of the element that just closed
        processingState = stateHistoryStack.pop(); // Restore the parsing state from before this element

        // Use a series of `if/else if` statements to handle different element types based on their registered IDs.
        if (endedTagUniqueId === tagIdRegistry.get('rootContainer')) {
            // When the main feed container ends, implicitly the parsing for this document is complete.
            tagIdRegistry.clear(); // Clear the registry as the feed structure is fully processed.
        } else if (endedTagUniqueId === tagIdRegistry.get('rootTitleElement')) {
            parsedFeedOutput.title = extractAndClearBuffer(contentBuffer);
        } else if (endedTagUniqueId === tagIdRegistry.get('rootLinkElement')) {
            parsedFeedOutput.link = extractAndClearBuffer(contentBuffer);
        } else if (endedTagUniqueId === tagIdRegistry.get('feedEntry')) {
            // When an 'entry' (item) element closes, finalize its data.
            if (!currentEntry.link && linkIsGuid && currentEntry.guid) {
                currentEntry.link = currentEntry.guid; // If no explicit link but GUID is permalink, use GUID as link.
            }

            if (currentEntry.guid) {
                // This flag might indicate that items are processed in a stream-like fashion.
                parsedFeedOutput.streamedContent = true;
            }

            collectedEntries.push(currentEntry); // Add the completed entry to the collection.
            currentEntry = {}; // Reset the current entry object for the next item.
        } else if (endedTagUniqueId === tagIdRegistry.get('entryTitleElement')) {
            currentEntry.title = extractAndClearBuffer(contentBuffer);
        } else if (endedTagUniqueId === tagIdRegistry.get('entryLinkElement')) {
            currentEntry.link = extractAndClearBuffer(contentBuffer);
        } else if (
            endedTagUniqueId === tagIdRegistry.get('entryDescriptionElement') ||
            endedTagUniqueId === tagIdRegistry.get('entryContentEncodedElement') ||
            endedTagUniqueId === tagIdRegistry.get('entryYandexFullTextElement')
        ) {
            // For description-like elements, update the entry's description, prioritizing longer content.
            currentEntry.description = updateEntryDescription(currentEntry.description, contentBuffer);
            contentBuffer = ''; // Clear the buffer after using its content.
        } else if (endedTagUniqueId === tagIdRegistry.get('entryPublicationDateElement')) {
            const rawDateString = extractAndClearBuffer(contentBuffer);
            let parsedTimestamp = null;
            try {
                // Attempt to parse the date string and convert it to a Unix timestamp (seconds since epoch).
                const dateObject = new Date(rawDateString);
                if (!isNaN(dateObject.getTime())) { // Check if the date parsing was successful
                    parsedTimestamp = Math.floor(dateObject.getTime() / 1000);
                }
            } catch (error) {
                // Log a warning if date parsing fails, but don't stop processing.
                console.warn(`Failed to parse date string "${rawDateString}" for entry. Error: ${error.message}`);
            }
            currentEntry.timestamp = parsedTimestamp;
        } else if (endedTagUniqueId === tagIdRegistry.get('entryGuidElement')) {
            currentEntry.guid = extractAndClearBuffer(contentBuffer);
        }
        // No explicit 'else' block is needed. Unhandled element end tags will simply restore the state
        // and clear the buffer without assigning content, effectively ignoring them.
    };

    // Instantiate the SAX (Simple API for XML) parser.
    const saxEngine = new XmlStreamHandler();

    // Configure XML namespace mappings for various syndication standards.
    saxEngine.mapNamespaces('rss', {
        'http://purl.org/rss/1.0/': 'rss', // RSS 1.0
        'http://purl.org/dc/elements/1.1/': 'dc', // Dublin Core
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#': 'rdf', // RDF Schema
        'http://purl.org/rss/1.0/modules/content/': 'content', // RSS content module
        'http://backend.userland.com/rss2': 'rss', // RSS 2.0 (common alias)
        'http://www.w3.org/2005/Atom': 'atom' // Atom Syndication Format (added for broader compatibility)
    });

    // Register event listeners for the SAX parser.
    // An error handler is provided to log parsing issues without halting execution.
    saxEngine.on('error', (parsingError) => { console.error('XML parsing engine encountered an error:', parsingError); });
    saxEngine.on('startNode', processStartTag);
    saxEngine.on('endNode', processEndTag);
    saxEngine.on('textNode', handleTextData);
    saxEngine.on('cdata', handleCdataSection);

    /**
     * The primary function of this module, responsible for parsing an XML string
     * representing a syndication feed (like RSS or Atom) and returning a structured object.
     * @param {string} xmlStringContent - The XML content of the feed as a string.
     * @returns {object} A JavaScript object containing the parsed feed data.
     */
    const parseSyndicationFeed = function(xmlStringContent) {
        // Ensure the parser's state is clean before starting a new parsing job.
        // The return value of initializeParserState (previous result) is not needed here.
        initializeParserState();

        // Execute the XML parsing process.
        saxEngine.parse(xmlStringContent);

        // After parsing is complete, return the accumulated parsed data.
        return parsedFeedOutput;
    };

    // Export the parsing function as the public interface of this module.
    return parseSyndicationFeed;
};

// Standard Node.js module export pattern.
if (typeof exports === 'object' && exports !== null) {
    module.exports = syndicationReader;
}