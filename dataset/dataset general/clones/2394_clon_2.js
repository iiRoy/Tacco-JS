var SimpleSaxParser = require("../easysax.js"); // Import the SAX parsing utility

var feedProcessor = new function() {
	var
	  // Registry for unique identifiers associated with specific XML elements.
	  tagIdentifiers = {},

	  // Current parsing context, e.g., 'root', 'item', 'TEXT_CAPTURE_STATE'.
	  parsingState = 'root',

	  // Stack to store previous parsing contexts.
	  stateStack = [],

	  // Counter for generating unique IDs for elements.
	  idCounter = 0,

	  // Stack to store unique IDs of active elements.
	  tagIdStack = [],

	  // Buffer to accumulate text content within a node.
	  collectedText = '',

	  // Object to hold data for the current item/entry being parsed.
	  parsedEntry = {},

	  // Array to store all parsed entries.
	  entryList = [],

	  // The final object representing the parsed feed.
	  outputFeed = {entries: entryList},

	  // Flag indicating if a link is a permanent link.
	  linkIsPerma = false;

	// Function to reset all internal state variables to their initial values.
	function reinitializeParser() {
		var previousResult = outputFeed; // Store the result before clearing.

		parsingState = 'root'; // Reset context to the top level.

		collectedText = ''; // Clear accumulated text.
		entryList = [];     // Clear the list of entries.
		outputFeed = {entries: entryList}; // Reinitialize the feed object.

		tagIdentifiers = {}; // Clear identifier registry.
		stateStack = [];     // Clear context stack.
		tagIdStack = [];     // Clear ID stack.
		idCounter = 0;       // Reset ID counter.

		return previousResult; // Return the feed parsed in the last run.
	};


	// Handler for text nodes encountered during parsing.
	function handleTextContent(nodeValue, unescapeFunction) {
		// Only append text if the current state is set to capture text.
		if (parsingState === 'TEXT_CAPTURE_STATE') {
			collectedText += unescapeFunction(nodeValue);
		}
	};

	// Handler for CDATA sections.
	function handleCdataSection(rawContent) {
		// Append CDATA content if in text capture mode.
		if (parsingState === 'TEXT_CAPTURE_STATE') {
			collectedText += rawContent;
		}
	};

	// Handler for the start of an XML element (opening tag).
	function processOpeningTag(tagName, getAttributes) {
		var elementId = idCounter++, // Assign a unique ID to this element.
		    tagAttributes;           // Variable to hold element attributes.

		tagIdStack.push(elementId);  // Push the new ID onto the stack.
		stateStack.push(parsingState); // Save the current parsing state.

		if (!parsingState) return; // If context is null, do nothing.


		// If we're in text capture state, ignore nested elements for text accumulation.
		if (parsingState === 'TEXT_CAPTURE_STATE') return;


		// State machine for handling different parsing contexts.
		switch(parsingState) {
			case 'root': // Handling elements at the top level of the feed.
				if (tagName === 'rss:rss' || tagName === 'rdf:RDF') {
					tagIdentifiers.rootTag = elementId; // Mark the root element.
					return;
				}
				
				if (tagName === 'rss:channel') {
					return; // Channel element, no specific action needed here beyond context.
				}


				if (tagName === 'rss:item') {
					tagIdentifiers.itemTag = elementId; // Mark the start of an item.
					parsingState = 'item';              // Change context to 'item'.
					linkIsPerma = false;                // Reset permalink flag for new item.
					return;
				}
				
				if (tagName === 'rss:title') {
					parsingState = 'TEXT_CAPTURE_STATE'; // Prepare to capture title text.
					tagIdentifiers.rootTitleTag = elementId;
					return;
				}
				
				if (tagName === 'rss:link') {
					parsingState = 'TEXT_CAPTURE_STATE'; // Prepare to capture link text.
					tagIdentifiers.rootLinkTag = elementId;
					return;
				}

				break;

			case 'item': // Handling elements within an 'item' context.
				
				if (tagName === 'rss:title') {
					tagIdentifiers.itemTitleTag = elementId;
					parsingState = 'TEXT_CAPTURE_STATE'; // Capture item title.
					return;
				}
				
				if (tagName === 'rss:link') {
					tagIdentifiers.itemLinkTag = elementId;
					parsingState = 'TEXT_CAPTURE_STATE'; // Capture item link.
					return;
				}
				
				if (tagName === 'rss:description') {
					tagIdentifiers.itemDescriptionTag = elementId;
					parsingState = 'TEXT_CAPTURE_STATE'; // Capture item description.
					return;
				}

				if (tagName === 'content:encoded') {  // Specific for content:encoded element.
					tagIdentifiers.itemContentEncodedTag = elementId;
					parsingState = 'TEXT_CAPTURE_STATE'; // Capture encoded content.
					return;
				}

				if (tagName === 'yandex:full-text') {  // Specific for Yandex full-text.
					tagIdentifiers.itemYandexFullTextTag = elementId;
					parsingState = 'TEXT_CAPTURE_STATE'; // Capture Yandex full text.
					return;
				}

				if (tagName === 'rss:pubDate' || tagName === 'dc:date') {
					tagIdentifiers.itemPubDateTag = elementId;
					parsingState = 'TEXT_CAPTURE_STATE'; // Capture publication date.
					return;
					
				}

				if (tagName === 'rss:guid') {
					tagIdentifiers.itemIdentifierTag = elementId;
					parsingState = 'TEXT_CAPTURE_STATE'; // Capture GUID.

					tagAttributes = tagAttributes || getAttributes(); // Retrieve attributes.
					if (tagAttributes === null) {
						// Error handling could go here, but currently, it just sets a default.
						tagAttributes = false;
					}

					// Determine if it's a permalink based on attribute.
					linkIsPerma = tagAttributes.isPermaLink !== 'false';
					return;
				}

				break;
		}
		

		parsingState = null; // If no specific handler, set context to null to ignore children.
	};

	// Handler for the end of an XML element (closing tag).
	function processClosingTag(tagName) {
		var closedElementId = tagIdStack.pop(), // Pop the ID of the element just closed.
		    tempValue;                          // Temporary variable for processing.
		parsingState = stateStack.pop(); // Restore the previous parsing state.

		// Process based on the unique ID of the closed element.
		switch(closedElementId) {
			case tagIdentifiers.rootTag:
				// The root RSS element has closed.
				// No specific action needed here beyond context reset, as items are collected incrementally.
				tagIdentifiers = {}; // Clear all registered IDs as parsing is complete for this feed.
				break;

			case tagIdentifiers.rootTitleTag:
				outputFeed.title = String(collectedText).trim(); // Set feed title.
				collectedText = ''; // Clear text buffer.
				break;
			
			case tagIdentifiers.rootLinkTag:
				outputFeed.link = String(collectedText).trim(); // Set feed link.
				collectedText = ''; // Clear text buffer.
				break;

			case tagIdentifiers.itemTag:
				// An item element has closed.
				if (!parsedEntry.link && linkIsPerma && parsedEntry.guid) {
					parsedEntry.link = parsedEntry.guid; // If no link and permalink, use GUID as link.
				}

				if (parsedEntry.guid) {
					outputFeed.streamed = true; // Indicate that items have GUIDs.
				}

				entryList.push(parsedEntry); // Add the completed item to the list.

				parsedEntry = {}; // Reset for the next item.
				break;

			case tagIdentifiers.itemTitleTag:
				parsedEntry.title = collectedText; // Set item title.
				collectedText = ''; // Clear text buffer.
				break;

			case tagIdentifiers.itemLinkTag:
				parsedEntry.link = collectedText; // Set item link.
				collectedText = ''; // Clear text buffer.
				break;

			case tagIdentifiers.itemDescriptionTag:
			case tagIdentifiers.itemContentEncodedTag: // For content:encoded
			case tagIdentifiers.itemYandexFullTextTag: // For Yandex full-text
				collectedText = String(collectedText).trim();
				// Prioritize longer descriptions if multiple are found.
				if (!parsedEntry.description || parsedEntry.description.length < collectedText.length) {
					parsedEntry.description = collectedText;
				}

				collectedText = ''; // Clear text buffer.
				break;


			case tagIdentifiers.itemPubDateTag:
				tempValue = Math.floor(+new Date(collectedText)/1000); // Convert date string to Unix timestamp.
				if (isNaN(tempValue)) tempValue = null; // Handle invalid dates.

				parsedEntry.unixTime = tempValue; // Set item's Unix time.
				collectedText = ''; // Clear text buffer.
				break;
			
			case tagIdentifiers.itemIdentifierTag:
				parsedEntry.guid = String(collectedText).trim(); // Set item's GUID.
				collectedText = ''; // Clear text buffer.
				break;
			
		}
	};
	


	// Create an instance of the SAX parser.
	var saxProcessor = new SimpleSaxParser();

	// Configure namespaces for the parser.
	saxProcessor.ns('rss', {
		'http://purl.org/rss/1.0/': 'rss', // RSS 1.0 Namespace
		'http://purl.org/dc/elements/1.1/': 'dc', // Dublin Core Namespace
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#' : 'rdf', // RDF Syntax Namespace
		'http://purl.org/rss/1.0/modules/content/': 'content', // Content Module Namespace
		'http://backend.userland.com/rss2': 'rss' // RSS 2.0 Namespace
	});

	// Register event handlers for the SAX parser.
	saxProcessor.on('parseError', null);          // Ignore parsing errors for now.
	saxProcessor.on('beginNode', processOpeningTag); // Handle element start.
	saxProcessor.on('endNode', processClosingTag);   // Handle element end.
	saxProcessor.on('textFragment', handleTextContent); // Handle text content.
	saxProcessor.on('cdataSection', handleCdataSection); // Handle CDATA sections.


	// The main function exposed by this module to parse an RSS/Atom XML string.
	function parseFeedDocument(xmlString) {
		saxProcessor.parse(xmlString); // Parse the input XML.
		return reinitializeParser();    // Reset state and return the parsed feed object.
	};
	
	return parseFeedDocument; // Return the public parsing function.
};


// Module export for Node.js environments.
if (typeof exports === 'object' && this === exports) {
	module.exports = feedProcessor;
}