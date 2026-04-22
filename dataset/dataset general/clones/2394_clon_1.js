var EasySax = require("../easysax.js") ;

/*
 * This line was commented out in the original source.
 * It remains commented out, preserving its original intent.
 */
//var crypto = require('crypto') ;


// Main parser logic encapsulated within an immediately invoked function expression (IIFE) structure.
var rssParser = new function ( ) {


	// Declare internal variables using a concise syntax.
	var u
	  , unids = { } /* Object to store unique node IDs */
	  , context = 'root' // Current parsing context, initialized to 'root'

	  , cnxStack = [ ] /* Stack to manage context transitions */
	  , unidnext = 0 // Counter for generating unique IDs
	  , unidstack = [ ] /* Stack to track node IDs */

	  , text = '' // Accumulator for text content within nodes
	  , item = { } // Object to store properties of a single RSS item
	  , items = [ ] /* Array to collect all parsed RSS items */
	  , feed = { items : items } // Main feed object, containing items array

	  , isPermaLink = false /* Flag for RSS guid attribute */
	  ; // End of variable declarations.


	/**
	 * Resets all internal state variables of the parser.
	 * This function is crucial for processing multiple RSS feeds with the same parser instance.
	 * @returns {object} The parsed feed object from the previous run.
	 */
	function reset ( ) {
		// Store the current feed object before resetting to return it.
		var _feed = feed ;

		// Reset parsing context to its initial state.
		context = 'root' ;

		// Clear text buffer and item-related data.
		text = '' ;
		items = [ ] ;
		feed = { items : items } ; // Re-initialize feed with a new items array reference.

		// Reset ID management and context stacks.
		unids = { } ;
		cnxStack = [ ] ;
		unidstack = [ ] ;
		unidnext = 0 ;

		// Return the feed object that was just processed.
		return _feed ;
	} /* End of reset function */


	/*
	 * Handler for text nodes encountered during parsing.
	 * Appends text to the 'text' buffer if in a 'TEXT' context.
	 * @param {string} x - The raw text content.
	 * @param {function} uq - A function to unquote the text.
	 */
	function onTextNode ( x , uq ) {
		// Check the current parsing context.
		switch ( context ) {

			case 'TEXT' :
				text += uq ( x ) ; // Unquote and append text.
				break ;

		} ; // End of switch statement.
	} ; // End of onTextNode.


	/*
	 * Handler for CDATA sections.
	 * CDATA content is treated as raw text and appended directly.
	 * @param {string} x - The CDATA content.
	 */
	function onCDATA ( x ) {
		// Only append CDATA if in a text-gathering context.
		switch ( context ) {

			case 'TEXT' :
				text += x ; // Append CDATA content.
				break ;

		} ; // End of switch.
	} ; // End of onCDATA.


	/*
	 * Handler for the start of an XML element (node).
	 * Manages context changes and stores unique IDs for specific nodes.
	 * @param {string} elem - The name of the started element.
	 * @param {function} attr - A function to retrieve element attributes.
	 */
	function onStartNode ( elem , attr ) {
		var unid = unidnext ++ /* Generate a new unique ID */
		  , attrs /* Variable to hold attributes */
		  ;

		// Push current ID and context onto their respective stacks.
		unidstack.push ( unid ) ;
		cnxStack.push ( context ) ;

		// If context is null, it means we are in an ignored section, so just return.
		if ( ! context ) return ;


		// Handle node based on the current context.
		switch ( context ) {

			// If current context is 'TEXT', we are inside a text node, so ignore nested elements.
			case 'TEXT' : return ;


			// Handling logic for the 'root' context (top-level elements).
			case 'root' :
				// Check for main RSS/RDF feed elements.
				if ( elem === 'rss:rss' || elem === 'rdf:RDF' ) {
					// Store the unique ID for the root element.
					unids.root = unid ;
					return ;
				} ;

				// Check for the RSS channel element.
				if ( elem === 'rss:channel' ) {
					// No specific action needed, just acknowledge.
					return ;
				} ;


				// Check for an RSS item element.
				if ( elem === 'rss:item' ) {
					unids.item = unid ; // Store item's unique ID.
					context = 'item' ; // Change context to 'item'.
					isPermaLink = false ; // Reset permalink flag for new item.
					return ;
				} ;

				// Handle root-level title.
				if ( elem === 'rss:title' ) {
					context = 'TEXT' ; // Switch to text-gathering context.
					unids.rootTitle = unid ; // Store root title ID.
					return ;
				} ;

				// Handle root-level link.
				if ( elem === 'rss:link' ) {
					context = 'TEXT' ; // Switch to text-gathering context.
					unids.rootLink = unid ; // Store root link ID.
					return ;
				} ;

				break ; // Exit root context handling.

			// Handling logic for elements within an 'item' context.
			case 'item' :

				// Item title.
				if ( elem === 'rss:title' ) {
					unids.itemTitle = unid ;
					context = 'TEXT' ;
					return ;
				} ;

				// Item link.
				if ( elem === 'rss:link' ) {
					unids.itemLink = unid ;
					context = 'TEXT' ;
					return ;
				} ;

				// Item description.
				if ( elem === 'rss:description' ) {
					unids.itemDescription = unid ;
					context = 'TEXT' ;
					return ;
				} ;

				// Content encoded (e.g., for full article content, often used by Yandex).
				if ( elem === 'content:encoded' ) { // yandex бля - original comment
					unids.itemContentEncoded = unid ;
					context = 'TEXT' ;
					return ;
				} ;

				// Yandex specific full-text element.
				if ( elem === 'yandex:full-text' ) { // yandex бля - original comment
					unids.itemYandexFullText = unid ;
					context = 'TEXT' ;
					return ;
				} ;

				// Publication date (RSS or Dublin Core).
				if ( elem === 'rss:pubDate' || elem === 'dc:date' ) {
					unids.itemPubDate = unid ;
					context = 'TEXT' ;
					return ;

				} ;

				// GUID (Globally Unique Identifier) for the item.
				if ( elem === 'rss:guid' ) {
					unids.itemID = unid ;
					context = 'TEXT' ;

					attrs = attrs || attr ( ) ; // Retrieve attributes for the current element.
					if ( attrs === null ) {
						// Error parser - original comment, implies error handling might be here.
						//return; // This line was commented out in the original.
						attrs = false ; // Assign false if attributes are null.
					} ;

					// Determine if the GUID is a permalink.
					isPermaLink = attrs.isPermaLink !== 'false' ;
					return ;
				} ;

				break ; // Exit item context handling.
		} ;


		// If no specific handler matched, set context to null to ignore this branch.
		context = null ;
	} ; // End of onStartNode.


	/*
	 * Handler for the end of an XML element (node).
	 * Pops context and ID from stacks and processes collected text for relevant nodes.
	 * @param {string} elem - The name of the ended element.
	 */
	function onEndNode ( elem ) {
		var unid = unidstack.pop ( unid ) /* Retrieve the last unique ID */
		  , x /* Temporary variable for processing */
		  ;
		context = cnxStack.pop ( context ) ; // Restore previous context.

		// Process collected text based on the unique ID of the ended node.
		switch ( unid ) {

			case unids.root :
				// Feed items are already being populated in the 'items' array.
				// This line was commented out in the original: //feed.items = items;

				unids = { } ; // Clear unique IDs after processing root.
				break ;

			case unids.rootTitle :
				feed.title = String ( text ).trim ( ) ; // Assign trimmed title to feed.
				text = '' ; // Clear text buffer.
				break ;

			case unids.rootLink :
				feed.link = String ( text ).trim ( ) ; // Assign trimmed link to feed.
				text = '' ; // Clear text buffer.
				break ;

			case unids.item :
				// If no specific link is found but permalink is true and GUID exists, use GUID as link.
				if ( ! item.link && isPermaLink && item.guid ) {
					item.link = item.guid ;
				} ;

				// If an item has a GUID, mark the feed as streamed.
				if ( item.guid ) {
					feed.streamed = true ;
				} ;

				items.push ( item ) ; // Add the completed item to the items array.

				item = { } ; // Reset item object for the next item.
				break ;

			case unids.itemTitle :
				item.title = text ; // Assign title to item.
				text = '' ; // Clear text buffer.
				break ;

			case unids.itemLink :
				item.link = text ; // Assign link to item.
				text = '' ; // Clear text buffer.
				break ;

			case unids.itemDescription :
			case unids.itemContentEncoded : // yandex бля - original comment
			case unids.itemYandexFullText : // yandex бля - original comment
				text = String ( text ).trim ( ) ; // Trim description text.
				// Assign description if it's longer or if no description exists yet.
				if ( ! item.desc || item.desc.length < text.length ) {
					item.desc = text ;
				} ;

				text = '' ; // Clear text buffer.
				break ;


			case unids.itemPubDate :
				// Convert publication date to Unix timestamp (seconds).
				x = Math.floor ( + new Date ( text ) / 1000 ) ;
				// Check for invalid date conversion (NaN).
				if ( x != x ) x = null ;

				item.utime = x ; // Assign Unix timestamp to item.
				text = '' ; // Clear text buffer.
				break ;

			case unids.itemID :
				item.guid = String ( text ).trim ( ) ; // Assign trimmed GUID to item.
				text = '' ; // Clear text buffer.
				break ;

		} ; // End of switch (unid).
	} ; // End of onEndNode.




	// Initialize the EasySax parser instance.
	var parser = new EasySax ( ) ;

	// Define namespace mappings for the parser.
	parser.ns ( 'rss' , {
		//'http://search.yahoo.com/mrss/': 'media', // This line was commented out in the original.
		'http://purl.org/rss/1.0/' : 'rss' ,
		'http://purl.org/dc/elements/1.1/' : 'dc' ,
		'http://www.w3.org/1999/02/22-rdf-syntax-ns#' : 'rdf' ,
		'http://purl.org/rss/1.0/modules/content/' : 'content' ,
		'http://backend.userland.com/rss2' : 'rss'
	} ) ;

	// Set up event handlers for the parser.
	parser.on ( 'error' , null ) ; // Error handler (set to null, meaning errors might be ignored or default behavior).
	parser.on ( 'startNode' , onStartNode ) ; // Handler for starting elements.
	parser.on ( 'endNode' , onEndNode ) ; // Handler for ending elements.
	parser.on ( 'textNode' , onTextNode ) ; // Handler for text content.
	parser.on ( 'cdata' , onCDATA ) ; // Handler for CDATA sections.


	/**
	 * Public function to parse an RSS XML string.
	 * @param {string} xml - The RSS XML content as a string.
	 * @returns {object} The parsed feed object.
	 */
	function rssParser ( xml ) {
		parser.parse ( xml ) ; // Delegate actual parsing to EasySax.
		return reset ( ) ; // Reset state and return the parsed feed.
	} ; // End of public rssParser function.

	// Return the public rssParser function, effectively making it the 'constructor' result.
	return rssParser ;
} ; // End of rssParser module definition.


// Export the rssParser function if running in a Node.js-like environment.
if ( typeof exports === 'object' && this == exports ) {
	module.exports = rssParser ;
} ;