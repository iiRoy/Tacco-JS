/*
 * This file contains JavaScript code that relies on external libraries:
 * - 'humane.js' for displaying user notifications and messages.
 * - 'pagedown' (and optionally 'pagedown-extra') for Markdown editing and conversion functionalities.
 */


/*
 * Section: General Utility Functions
 * This section defines common helper functions used across the application to facilitate
 * various operations, particularly communication via WebSockets.
 */

function sendViaWS( url , payload, success, failure )
{
	/*
	 * Serialize the JavaScript payload object into a JSON string.
	 * This is necessary for transmitting data over WebSocket connections.
	 */
	var serialized = JSON.stringify( payload );

	var ws; // Declare a variable to hold the WebSocket instance.

	/*
	 * Check if the 'WebSocket' API is supported by the current browser environment.
	 * This ensures graceful degradation if WebSockets are not available.
	 */
	if ( "WebSocket" in window )
	{
		// If WebSocket is supported, create a new WebSocket connection to the specified URL.
		ws = new WebSocket( url );
	}
	else
	{
		// If WebSockets are not supported, log an error message using humane.js
		// and terminate the function execution.
		humane.log( 'Error: Your browser does not support websockets.' );
		return;
	}

	/*
	 * Assign an event handler for incoming messages received via the WebSocket.
	 * This function will be executed whenever the server sends data to the client.
	 */
	ws.onmessage = function ( evt )
	{
		// Parse the incoming message data, which is expected to be a JSON string.
		var data = JSON.parse( evt.data );

		/*
		 * Debugging line: Uncomment to see received data in the browser console.
		 * console.log( data );
		 */

		// If the received data contains a 'message' field, display it using humane.js.
		if ( data.message )
		{
			humane.log( data.message );
		}

		/*
		 * Handle success or failure callbacks based on the 'data.success' flag.
		 * If 'data.success' is true and a 'success' callback function was provided, invoke it.
		 * Otherwise, if 'data.success' is false and a 'failure' callback was provided, invoke it.
		 */
		if ( data.success && success )
		{
			success( data );
		}
		else if ( !data.success && failure )
		{
			failure( data );
		}

		// Close the WebSocket connection after processing the message.
		ws.close();
	}; /* End of ws.onmessage handler */


	/*
	 * Assign an event handler for when the WebSocket connection is successfully opened.
	 * This function will be executed once the connection is established.
	 */
	ws.onopen = function ()
	{
		/*
		 * Debugging line: Uncomment to see the payload being sent in the browser console.
		 * console.log( "Sending ==> " + serialized );
		 */
		// Send the serialized payload through the established WebSocket connection.
		ws.send( serialized );
	}; /* End of ws.onopen handler */

} /* End of sendViaWS function */



/*
 * Section: Editor Class Definition
 * This section defines the 'Editor' class, which provides functionality
 * for a Markdown editor using Pagedown and integrates WebSocket communication
 * for saving content.
 */

function Editor ( name, url, sanitize, pagedown_extra_options )
{
	// Store the WebSocket URL for this editor instance.
	this.url = url;

	/*
	 * Initialize the data object that will hold the editor's content
	 * and metadata (name, Markdown, HTML, title).
	 */
	var data = {
		name  : name,      // The name associated with this editor instance.
		md    : "",        // Placeholder for Markdown content.
		html  : "",        // Placeholder for rendered HTML content.
		title : ""         // Placeholder for the document's title.
	};

	// Assign the initialized data object to the 'data' property of the Editor instance.
	this.data = data;

	/*
	 * Setup the Pagedown editor components.
	 * This involves configuring the Markdown converter and the editor UI.
	 */

	/*
	 * Ensure the 'sanitize' option defaults to 'true' if it's not explicitly provided
	 * or is undefined. This is a safety measure to prevent XSS by default.
	 */
	sanitize = ( typeof sanitize === "undefined" ) ? true : sanitize;

	/*
	 * Instantiate the Markdown converter.
	 * If 'sanitize' is true, use Pagedown's sanitizing converter; otherwise, use the standard one.
	 */
	var converter = sanitize
		? Markdown.getSanitizingConverter()
		: new Markdown.Converter();

	/*
	 * Initialize Pagedown Extra features.
	 * This extends the base Pagedown functionality with additional Markdown features.
	 */
	var extra = Markdown.Extra.init( converter, pagedown_extra_options );

	// Create a new Pagedown Editor instance, passing in the configured converter.
	var editor = new Markdown.Editor( converter );

	/*
	 * Chain a hook to the converter's "preConversion" event.
	 * This hook fires right before Markdown text is converted to HTML.
	 * It's used here to capture and store the raw Markdown content.
	 */
	converter.hooks.chain( "preConversion", function ( text )
	{
		data.md = text; // Store the current Markdown text in the data object.
		return text;    // Return the text to allow the conversion process to continue.
	} );

	/*
	 * Chain a hook to the converter's "postConversion" event.
	 * This hook fires immediately after Markdown has been converted to HTML.
	 * It's used to apply post-processing fixes, particularly for code blocks.
	 */
	converter.hooks.chain( "postConversion", function ( text )
	{
		/*
		 * Address a potential visual discrepancy between Pagedown's original
		 * code block rendering and Pagedown-Extra's fenced code blocks.
		 * This logic dynamically adds a class for syntax highlighting (e.g., Google Code Prettify or Highlight.js).
		 */
		var preclass = extra.googleCodePrettify
			? ' class="prettyprint"'
			: extra.highlightJs
				? ' class="hljs"'
				: '';

		// Replace generic <pre><code> tags with class-enhanced versions for styling.
		text = text.replace( /<pre><code>/g, "<pre" + preclass + "><code>" );

		data.html = text; // Store the final HTML output in the data object.
		return text;      // Return the processed HTML for display.
	} );

	// Run the Pagedown Editor, which initializes the editor's UI and functionality.
	editor.run();

	// Make the converter instance accessible as a property of the Editor instance.
	this.converter = converter;
} /* End of Editor constructor function */


/*
 * Editor Prototype Method: save
 * This method is responsible for saving the current state of the editor's content
 * (Markdown, HTML, and title) by sending it via a WebSocket connection.
 *
 * @param {string} title - The title to be associated with the saved document.
 */
Editor.prototype.save = function ( title )
{
	// Update the 'title' field in the editor's data object.
	this.data.title = title;

	// Call the general WebSocket sending function to transmit the editor's data.
	sendViaWS( this.url, this.data );
}; /* End of Editor.prototype.save method */