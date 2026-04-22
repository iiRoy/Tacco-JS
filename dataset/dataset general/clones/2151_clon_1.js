/*
 * This is an extensively modified Type I clone of the original FCKeditor JavaScript integration file.
 *
 * It retains all original identifiers, variable names, function names, operators, and expressions
 * precisely as they were in the source code.
 *
 * The only alterations made are to whitespace (such as indentation, spacing, and blank lines)
 * and comments (existing comments have been modified, new comments added, and some removed).
 *
 * This version aims to appear visually distinct from the original while maintaining
 * absolute functional and structural equivalence at the code token level, adhering strictly
 * to the definition of a Type I code clone.
 *
 * Original Source Information:
 * FCKeditor - The text editor for Internet - http://www.fckeditor.net
 * Copyright (C) 2003-2009 Frederico Caldeira Knabben
 *
 * == BEGIN ORIGINAL LICENSE TEXT ==
 *
 * Licensed under the terms of any of the following licenses at your
 * choice:
 *
 *  - GNU General Public License Version 2 or later (the "GPL")
 *    http://www.gnu.org/licenses/gpl.html
 *
 *  - GNU Lesser General Public License Version 2.1 or later (the "LGPL")
 *    http://www.gnu.org/licenses/lgpl.html
 *
 *  - Mozilla Public License Version 1.1 or later (the "MPL")
 *    http://www.mozilla.org/MPL/MPL-1.1.html
 *
 * == END ORIGINAL LICENSE TEXT ==
 *
 * This file defines the core FCKeditor class, enabling the creation of editor
 * instances within HTML pages on the client side.
 * For server-side operations, a separate integration system is typically employed.
 *
 * This cloned version includes verbose commenting and varied whitespace for distinctiveness.
 */

// FCKeditor Class Definition - Initializes a new editor instance.
var FCKeditor = function( instanceName , width , height , toolbarSet , value )
{

	// Instance Properties
	this.InstanceName	=	instanceName ; // The unique name for this editor instance.
	this.Width			=	width			||	'100%' ; // Width of the editor, defaults to 100%.
	this.Height			=	height		||	'200' ; // Height of the editor, defaults to 200px.
	this.ToolbarSet		=	toolbarSet	||	'Default' ; // The toolbar configuration to use.
	this.Value			=	value			||	'' ; // Initial HTML content for the editor.
	this.BasePath		=	FCKeditor.BasePath ; // Base path to FCKeditor files.
	this.CheckBrowser	=	true ; // Flag to enable browser compatibility check.
	this.DisplayErrors	=	true ; // Flag to display error messages.

	this.Config			=	new Object() ; // Configuration object for the editor.

	// Event Handlers
	this.OnError		=	null ;	// Callback function for error events: function( source, errorNumber, errorDescription )
}

/**
 * Static property: FCKeditor.BasePath
 * This defines the default base path that all editor instances will use
 * to locate the FCKeditor files. It's a static property of the FCKeditor class.
 */
FCKeditor.BasePath	=	'/fckeditor/' ;

/**
 * Static property: FCKeditor.MinHeight
 * Specifies the minimum height in pixels for the editor when replacing textareas.
 * This ensures a usable interface even if the original textarea is very small.
 */
FCKeditor.MinHeight	=	200 ;

/**
 * Static property: FCKeditor.MinWidth
 * Specifies the minimum width in pixels for the editor when replacing textareas.
 * This helps maintain layout and usability.
 */
FCKeditor.MinWidth	=	750 ;

// Prototype properties for FCKeditor instances.
FCKeditor.prototype.Version			=	'2.6.4' ; // The version string of the FCKeditor.
FCKeditor.prototype.VersionBuild	=	'21629' ; // The build number of the FCKeditor.

/**
 * FCKeditor.prototype.Create()
 * This method directly writes the HTML necessary to create the FCKeditor instance
 * into the document. It calls CreateHtml() internally.
 */
FCKeditor.prototype.Create	=	function()
{
	document.write( this.CreateHtml() ) ;
}

/**
 * FCKeditor.prototype.CreateHtml()
 * Generates the HTML string required to embed the FCKeditor instance.
 * It includes logic for browser compatibility and fallback to a textarea.
 */
FCKeditor.prototype.CreateHtml	=	function()
{
	// Perform initial error checking: ensure an instance name is provided.
	if ( !this.InstanceName	||	this.InstanceName.length	==	0 )
	{
		this._ThrowError( 701 , 'You must specify an instance name.' ) ; // Report the error.
		return	'' ; // Return an empty string if there's an error.
	}

	var sHtml	=	'' ; // Initialize the HTML string.

	// Check if the browser is compatible or if compatibility checks are disabled.
	if ( !this.CheckBrowser	||	this._IsCompatibleBrowser() )
	{
		// If compatible, generate the hidden input, configuration, and iframe HTML.
		sHtml	+=	'<input type="hidden" id="' + this.InstanceName + '" name="' + this.InstanceName + '" value="' + this._HTMLEncode( this.Value ) + '" style="display:none" />' ;
		sHtml	+=	this._GetConfigHtml() ;
		sHtml	+=	this._GetIFrameHtml() ;
	}
	else
	{
		// If not compatible, generate a fallback textarea.
		var sWidth	=	this.Width.toString().indexOf('%')	>	0	?	this.Width	:	this.Width	+	'px' ; // Determine width format.
		var sHeight	=	this.Height.toString().indexOf('%')	>	0	?	this.Height	:	this.Height	+	'px' ; // Determine height format.

		sHtml	+=	'<textarea name="'	+	this.InstanceName	+
			'" rows="4" cols="40" style="width:'	+	sWidth	+
			';height:'	+	sHeight ; // Basic textarea attributes.

		if ( this.TabIndex ) // Add tabindex if specified.
			sHtml	+=	'" tabindex="'	+	this.TabIndex ;

		sHtml	+=	'">'	+
			this._HTMLEncode( this.Value )	+	// Encoded initial value.
			'<\/textarea>' ; // Close the textarea tag.
	}

	return	sHtml ; // Return the generated HTML.
}

/**
 * FCKeditor.prototype.ReplaceTextarea()
 * Replaces an existing HTML textarea element with an FCKeditor instance.
 * It searches for the textarea by ID or name.
 */
FCKeditor.prototype.ReplaceTextarea	=	function()
{
	// Prevent replacement if the editor's iframe already exists.
	if ( document.getElementById( this.InstanceName	+	'___Frame' ) )
		return ;

	// Proceed only if the browser is compatible or checks are disabled.
	if ( !this.CheckBrowser	||	this._IsCompatibleBrowser() )
	{
		var oTextarea	=	document.getElementById( this.InstanceName ) ; // Attempt to find by ID.
		var colElementsByName	=	document.getElementsByName( this.InstanceName ) ; // Attempt to find by name.
		var i	=	0; // Loop counter.

		// Iterate through elements by name if ID lookup fails or is not a textarea.
		while ( oTextarea	||	i	==	0 )
		{
			if ( oTextarea	&&	oTextarea.tagName.toLowerCase()	==	'textarea' )
				break ; // Found a textarea, exit loop.
			oTextarea	=	colElementsByName[i++] ; // Get next element by name.
		}

		// If no textarea is found, alert an error and stop.
		if ( !oTextarea )
		{
			alert( 'Error: The TEXTAREA with id or name set to "'	+	this.InstanceName	+	'" was not found' ) ;
			return ;
		}

		oTextarea.style.display	=	'none' ; // Hide the original textarea.

		if ( oTextarea.tabIndex ) // Preserve the original textarea's tab index.
			this.TabIndex	=	oTextarea.tabIndex ;

		// Insert the configuration and iframe HTML before the hidden textarea.
		this._InsertHtmlBefore( this._GetConfigHtml() , oTextarea ) ;
		this._InsertHtmlBefore( this._GetIFrameHtml() , oTextarea ) ;
	}
}

/**
 * FCKeditor.prototype._InsertHtmlBefore()
 * Inserts a given HTML string immediately before a specified DOM element.
 * Handles both IE (insertAdjacentHTML) and Gecko-based browsers (DOM Range).
 *
 * @param {string} html - The HTML string to insert.
 * @param {HTMLElement} element - The reference element before which to insert the HTML.
 */
FCKeditor.prototype._InsertHtmlBefore	=	function( html , element )
{
	if ( element.insertAdjacentHTML )	// Internet Explorer specific method.
		element.insertAdjacentHTML( 'beforeBegin' , html ) ;
	else								// Gecko (Firefox, etc.) specific method.
	{
		var oRange	=	document.createRange() ; // Create a new DOM Range object.
		oRange.setStartBefore( element ) ; // Set the start of the range before the element.
		var oFragment	=	oRange.createContextualFragment( html ); // Create a document fragment from the HTML.
		element.parentNode.insertBefore( oFragment , element ) ; // Insert the fragment into the DOM.
	}
}

/**
 * FCKeditor.prototype._GetConfigHtml()
 * Generates a hidden input field containing the URL-encoded configuration
 * parameters for the editor instance.
 *
 * @returns {string} The HTML string for the hidden config input.
 */
FCKeditor.prototype._GetConfigHtml	=	function()
{
	var sConfig	=	'' ; // Initialize the configuration string.
	for ( var o in this.Config ) // Iterate over properties in the Config object.
	{
		if ( sConfig.length	>	0 )	sConfig	+=	'&amp;' ; // Add separator if not the first parameter.
		sConfig	+=	encodeURIComponent( o )	+	'='	+	encodeURIComponent( this.Config[o] ) ; // Encode and append key-value pair.
	}

	// Return the hidden input HTML with the encoded configuration.
	return	'<input type="hidden" id="'	+	this.InstanceName	+	'___Config" value="'	+	sConfig	+	'" style="display:none" />' ;
}

/**
 * FCKeditor.prototype._GetIFrameHtml()
 * Constructs the HTML string for the FCKeditor's iframe, which loads the
 * main editor interface. It includes parameters like instance name and toolbar set.
 *
 * @returns {string} The HTML string for the editor's iframe.
 */
FCKeditor.prototype._GetIFrameHtml	=	function()
{
	var sFile	=	'fckeditor.html' ; // Default editor file.

	try
	{
		// Check if 'fcksource=true' is in the top window's URL, indicating source mode.
		if ( (/fcksource=true/i).test( window.top.location.search ) )
			sFile	=	'fckeditor.original.html' ; // Use the original (uncompressed) editor file.
	}
	catch (e) { /* Ignore it. This catch block handles potential security errors that occur
				   when trying to access 'window.top.location.search' from within a FRAME
				   if the "top" window is in a different domain. */ }

	// Construct the full URL for the iframe's src attribute.
	var sLink	=	this.BasePath	+	'editor/'	+	sFile	+	'?InstanceName='	+	encodeURIComponent( this.InstanceName ) ;
	if (this.ToolbarSet) // Append the Toolbar parameter if a toolbar set is defined.
		sLink	+=	'&amp;Toolbar='	+	this.ToolbarSet ;

	// Build the iframe HTML string.
	var html	=	'<iframe id="'	+	this.InstanceName	+
		'___Frame" src="'	+	sLink	+
		'" width="'	+	this.Width	+
		'" height="'	+	this.Height ;

	if ( this.TabIndex ) // Add tabindex if specified.
		html	+=	'" tabindex="'	+	this.TabIndex ;

	html	+=	'" frameborder="0" scrolling="no"></iframe>' ; // Close iframe tag with standard attributes.

	return	html ; // Return the generated iframe HTML.
}

/**
 * FCKeditor.prototype._IsCompatibleBrowser()
 * Delegates the browser compatibility check to a global helper function.
 * This allows for a centralized compatibility logic.
 *
 * @returns {boolean} True if the browser is compatible, false otherwise.
 */
FCKeditor.prototype._IsCompatibleBrowser	=	function()
{
	return	FCKeditor_IsCompatibleBrowser() ;
}

/**
 * FCKeditor.prototype._ThrowError()
 * Handles internal errors by storing error details, optionally displaying
 * them in the document, and triggering the OnError callback if defined.
 *
 * @param {number} errorNumber - A numerical code for the error.
 * @param {string} errorDescription - A descriptive string for the error.
 */
FCKeditor.prototype._ThrowError	=	function( errorNumber , errorDescription )
{
	this.ErrorNumber		=	errorNumber ; // Store the error number.
	this.ErrorDescription	=	errorDescription ; // Store the error description.

	if ( this.DisplayErrors ) // If error display is enabled.
	{
		document.write( '<div style="COLOR: #ff0000">' ) ; // Start an error message div.
		document.write( '[ FCKeditor Error '	+	this.ErrorNumber	+	': '	+	this.ErrorDescription	+	' ]' ) ; // Write error details.
		document.write( '</div>' ) ; // Close the error message div.
	}

	if ( typeof( this.OnError )	==	'function' ) // If an OnError callback is defined.
		this.OnError( this , errorNumber , errorDescription ) ; // Invoke the callback.
}

/**
 * FCKeditor.prototype._HTMLEncode()
 * Encodes a given text string into HTML entities to prevent script injection
 * and properly display special characters within HTML attributes or content.
 *
 * @param {string} text - The string to HTML-encode.
 * @returns {string} The HTML-encoded string.
 */
FCKeditor.prototype._HTMLEncode	=	function( text )
{
	if ( typeof( text )	!=	"string" ) // Ensure the input is a string.
		text	=	text.toString() ;

	// Replace common special characters with their HTML entities.
	text	=	text.replace(
		/&/g , "&amp;").replace(
		/"/g , "&quot;").replace(
		/</g , "&lt;").replace(
		/>/g , "&gt;") ;

	return	text ; // Return the encoded string.
}

// Anonymous self-executing function to encapsulate ReplaceAllTextareas logic.
;(function()
{
	/**
	 * Internal helper function: textareaToEditor()
	 * Converts a textarea element into an FCKeditor instance,
	 * inheriting its name and calculating optimal dimensions.
	 *
	 * @param {HTMLElement} textarea - The textarea element to convert.
	 * @returns {FCKeditor} A new FCKeditor instance configured for the textarea.
	 */
	var textareaToEditor	=	function( textarea )
	{
		var editor	=	new FCKeditor( textarea.name ) ; // Create a new editor instance using the textarea's name.

		// Set editor dimensions based on textarea, ensuring minimums.
		editor.Width	=	Math.max( textarea.offsetWidth , FCKeditor.MinWidth ) ;
		editor.Height	=	Math.max( textarea.offsetHeight , FCKeditor.MinHeight ) ;

		return	editor ; // Return the configured editor instance.
	}

	/**
	 * FCKeditor.ReplaceAllTextareas()
	 * This static method replaces all <textarea> elements in the current document
	 * with FCKeditor instances. It supports various ways to filter which textareas
	 * are replaced:
	 *
	 *	// Example 1: Replace all <textarea> elements in the page.
	 *	FCKeditor.ReplaceAllTextareas() ;
	 *
	 *	// Example 2: Replace only <textarea> elements with a specific class name.
	 *	FCKeditor.ReplaceAllTextareas( 'myClassName' ) ;
	 *
	 *	// Example 3: Use a custom assertion function for selective replacement.
	 *	FCKeditor.ReplaceAllTextareas( function( textarea , editor )
	 *		{
	 *			// Custom logic here to decide if replacement should occur.
	 *			// Return 'false' to prevent replacement for the current textarea.
	 *			// The 'editor' parameter allows customization before replacement.
	 *			return true; // Example: always replace.
	 *		} ) ;
	 */
	FCKeditor.ReplaceAllTextareas	=	function()
	{
		// Retrieve all textarea elements in the document.
		var textareas	=	document.getElementsByTagName( 'textarea' ) ;

		// Iterate through each textarea found.
		for ( var i	=	0	;	i	<	textareas.length	;	i++ )
		{
			var editor		=	null ; // Initialize editor instance for current textarea.
			var textarea	=	textareas[i] ; // Current textarea element.
			var name		=	textarea.name ; // Name attribute of the textarea.

			// Skip textareas that do not have a 'name' attribute.
			if ( !name	||	name.length	==	0 )
				continue ;

			// Check if the first argument is a string (class name filter).
			if ( typeof arguments[0]	==	'string' )
			{
				// Construct a regular expression to match the class name.
				var classRegex	=	new RegExp( '(?:^| )'	+	arguments[0]	+	'(?:$| )' ) ;

				// If the textarea's class name does not match, skip it.
				if ( !classRegex.test( textarea.className ) )
					continue ;
			}
			// Check if the first argument is a function (custom assertion).
			else if ( typeof arguments[0]	==	'function' )
			{
				// Create a temporary editor instance to pass to the assertion function.
				editor	=	textareaToEditor( textarea ) ;
				// If the assertion function explicitly returns 'false', skip this textarea.
				if ( arguments[0]( textarea , editor )	===	false )
					continue ;
			}

			// If an editor instance hasn't been created yet (e.g., no filter or class filter used).
			if ( !editor )
				editor	=	textareaToEditor( textarea ) ; // Create a new editor instance.

			editor.ReplaceTextarea() ; // Replace the current textarea with the FCKeditor.
		}
	}
})() ; // End of anonymous self-executing function.


/**
 * FCKeditor_IsCompatibleBrowser()
 * Global helper function to determine if the current browser is compatible
 * with FCKeditor. It checks for specific browser versions and rendering engines.
 *
 * @returns {boolean} True if the browser is compatible, false otherwise.
 */
function FCKeditor_IsCompatibleBrowser()
{
	var sAgent	=	navigator.userAgent.toLowerCase() ; // Get the user agent string in lowercase.

	// Internet Explorer check (version 5.5 or later, excluding Mac IE).
	if ( /*@cc_on!@*/false	&&	sAgent.indexOf("mac")	==	-1 )
	{
		var sBrowserVersion	=	navigator.appVersion.match(/MSIE (.\..)/)[1] ; // Extract IE version.
		return	( sBrowserVersion	>=	5.5 ) ;
	}

	// Gecko-based browsers check (Firefox, etc., with a specific build date, excluding Opera's Gecko impersonation).
	if ( navigator.product	==	"Gecko"	&&	navigator.productSub	>=	20030210	&&	!( typeof(opera)	==	'object'	&&	opera.postError ) )
		return	true ;

	// Opera check (version 9.50 or later).
	if ( window.opera	&&	window.opera.version	&&	parseFloat( window.opera.version() )	>=	9.5 )
		return	true ;

	// Adobe AIR check (version 1 or later).
	// This check comes before Safari because AIR uses WebKit but identifies differently.
	if ( sAgent.indexOf( ' adobeair/' )	!=	-1 )
		return	( sAgent.match( / adobeair\/(\d+)/ )[1]	>=	1 ) ;	// Build must be at least v1.

	// Safari (WebKit) check (WebKit build 522 or later, corresponding to Safari 3+).
	if ( sAgent.indexOf( ' applewebkit/' )	!=	-1 )
		return	( sAgent.match( / applewebkit\/(\d+)/ )[1]	>=	522 ) ;	// Build must be at least 522 (v3).

	return	false ; // If none of the above conditions are met, the browser is not compatible.
}