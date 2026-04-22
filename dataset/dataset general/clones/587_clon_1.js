/*
 * HTML5 Parser By Sam Blowes
 *
 * Designed for HTML5 documents
 *
 * Original code by John Resig (ejohn.org)
 * http://ejohn.org/blog/pure-javascript-html-parser/
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Example Usage:
 * // Parse an HTML string with custom handlers:
 * HTMLParser( htmlString, {
 *     start: function( tag, attrs, unary ) { /* handle start tag *\/ },
 *     end: function( tag ) { /* handle end tag *\/ },
 *     chars: function( text ) { /* handle character data *\/ },
 *     comment: function( text ) { /* handle comments *\/ }
 * } );
 *
 * // Convert HTML to an XML string representation:
 * // var xmlOutput = HTMLtoXML( htmlString );
 *
 * // Convert HTML to a DOM Document object:
 * // var domDocument = HTMLtoDOM( htmlString );
 *
 * // Inject HTML into an existing DOM node (e.g., document.body):
 * // HTMLtoDOM( htmlString, document.body );
 *
 */

// This is an Immediately Invoked Function Expression (IIFE)
// to create a private scope for the parser's internal variables and functions.
( function( ) {

	// Regular Expressions used for identifying and parsing HTML tags and attributes.

	// Regex for matching a start tag, capturing the tag name, attributes, and unary status.
	var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;

	// Regex for matching an end tag, capturing the tag name.
	var endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/;

	// Regex for matching individual attributes within a tag, capturing name and value.
	var attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;


	// Helper maps for classifying HTML 5 elements based on their behavior.

	// Elements that are always empty (self-closing) and do not have closing tags.
	var empty = makeMap( "area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr" );

	// Block-level elements. These typically start on a new line and take up full width.
	var block = makeMap( "address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video" );

	// Inline elements. These typically flow within text and only take up as much width as needed.
	var inline = makeMap( "a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var" );

	// Elements that can optionally be self-closing or implicitly close themselves.
	var closeSelf = makeMap( "colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr" );

	// Attributes that are boolean in nature (their presence implies 'true').
	// Their value is often just their name, e.g., <input disabled>.
	var fillAttrs = makeMap( "checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected" );

	// Special elements whose content should be treated as raw text, not parsed for nested tags.
	var special = makeMap( "script,style" );


	// The primary HTML parsing function, exposed globally as `HTMLParser`.
	// Takes an HTML string and a handler object with callback methods for different HTML events.
	this.HTMLParser = function( html, handler ) {
		var index,
			chars,
			match,
			stack = [], // This stack keeps track of currently open HTML tags.
			last = html; // Stores the remaining HTML string from the previous iteration to detect infinite loops.

		// Extend the stack array with a utility method to access the top element.
		stack.last = function( ) {
			return this[ this.length - 1 ];
		};

		// Main parsing loop: continues as long as there's HTML content left.
		while ( html ) {
			chars = true; // Assume we are going to parse character data by default in this iteration.

			// Check if we are currently inside a 'special' tag (like <script> or <style>)
			// or if the stack is empty (meaning we're not inside any tag).
			if ( !stack.last( ) || !special[ stack.last( ) ] ) {

				// --- Attempt to parse a comment tag: <!-- ... --> ---
				if ( html.indexOf( "<!--" ) == 0 ) {
					index = html.indexOf( "-->" );

					if ( index >= 0 ) {
						// If a comment handler is defined, invoke it with the comment text.
						if ( handler.comment )
							handler.comment( html.substring( 4, index ) );
						html = html.substring( index + 3 ); // Advance the HTML string past the comment.
						chars = false; // No character data was parsed, so reset the flag.
					}

				}
				// --- Attempt to parse an end tag: </tag> ---
				else if ( html.indexOf( "</" ) == 0 ) {
					match = html.match( endTag );

					if ( match ) {
						html = html.substring( match[ 0 ].length ); // Consume the matched end tag.
						match[ 0 ].replace( endTag, parseEndTag ); // Process the end tag through the helper.
						chars = false; // Again, no character data.
					}

				}
				// --- Attempt to parse a start tag: <tag ...> ---
				else if ( html.indexOf( "<" ) == 0 ) {
					match = html.match( startTag );

					if ( match ) {
						html = html.substring( match[ 0 ].length ); // Consume the matched start tag.
						match[ 0 ].replace( startTag, parseStartTag ); // Process the start tag through the helper.
						chars = false; // No character data here either.
					}
				}

				// If `chars` is still true, it means no tag or comment was parsed,
				// so the remaining content must be character data.
				if ( chars ) {
					index = html.indexOf( "<" ); // Find the next potential tag or end of string.

					// Extract the text content.
					var text = index < 0 ? html : html.substring( 0, index );
					html = index < 0 ? "" : html.substring( index ); // Update the remaining HTML.

					// If a characters handler is defined, invoke it.
					if ( handler.chars )
						handler.chars( text );
				}

			} else {
				// We are inside a special tag (e.g., <script>, <style>).
				// In this case, we consume all content until its corresponding closing tag.
				html = html.replace( new RegExp( "([\\s\\S]*?)<\\/" + stack.last( ) + "[^>]*>" ), function( all, text ) {
					// Remove any nested comments or CDATA sections from the raw text content.
					text = text.replace( /<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2" );
					if ( handler.chars )
						handler.chars( text ); // Pass the processed raw text to the handler.

					return ""; // Replace the matched content (including closing tag) with an empty string.
				} );

				// Manually call `parseEndTag` for the special element.
				parseEndTag( "", stack.last( ) );
			}

			// Critical check: if no progress was made in consuming HTML, it indicates a parse error.
			if ( html == last )
				throw "Parse Error: " + html;
			last = html; // Update `last` for the next iteration's error check.
		}

		// After the main loop finishes, ensure any remaining open tags on the stack are closed.
		parseEndTag( );


		// --- Helper function to process a matched start tag ---
		function parseStartTag( tag, tagName, rest, unary ) {
			tagName = tagName.toLowerCase( ); // Normalize tag names to lowercase for consistent handling.

			// If the current tag is a block-level element, close any inline elements that are currently open on the stack.
			if ( block[ tagName ] ) {
				while ( stack.last( ) && inline[ stack.last( ) ] ) {
					parseEndTag( "", stack.last( ) );
				}
			}

			// If this tag is one that can close itself and matches the last open tag on the stack, close it.
			if ( closeSelf[ tagName ] && stack.last( ) == tagName ) {
				parseEndTag( "", tagName );
			}

			// Determine if the tag is unary (self-closing, e.g., <img />, <br>).
			// This is based on the `empty` map or an explicit `/` in the tag.
			unary = empty[ tagName ] || !!unary;

			// If the tag is not unary, push its name onto the stack to mark it as open.
			if ( !unary )
				stack.push( tagName );

			// If a start handler is provided by the user, prepare and call it.
			if ( handler.start ) {
				var attrs = []; // Array to collect parsed attributes.

				// Iterate over all attributes in the `rest` string using the `attr` regex.
				rest.replace( attr, function( match, name ) {
					// Determine the attribute value based on which capture group matched (double quotes, single quotes, or unquoted).
					// Also handles boolean attributes by using their name as value if they are in `fillAttrs`.
					var value = arguments[ 2 ] ? arguments[ 2 ] :
						arguments[ 3 ] ? arguments[ 3 ] :
						arguments[ 4 ] ? arguments[ 4 ] :
						fillAttrs[ name ] ? name : "";

					// Store the attribute details, including an escaped version of the value for XML output.
					attrs.push( {
						name:    name,
						value:   value,
						escaped: value.replace( /(^|[^\\])"/g, '$1\\\"' ) // Escape double quotes.
					} );
				} );

				// Finally, invoke the start handler with the tag name, attributes array, and unary status.
				if ( handler.start )
					handler.start( tagName, attrs, unary );
			}
		}


		// --- Helper function to process a matched end tag ---
		function parseEndTag( tag, tagName ) {
			// If `tagName` is not provided, it signifies a cleanup phase, so close all remaining tags.
			if ( !tagName ) {
				var pos = 0; // Start searching from the beginning of the stack.
			}
			// Otherwise, search for the specific `tagName` from the top of the stack downwards.
			else {
				for ( var pos = stack.length - 1; pos >= 0; pos-- )
					if ( stack[ pos ] == tagName )
						break; // Found the matching start tag.
			}

			// If a matching tag was found (or `pos` is 0 for full cleanup).
			if ( pos >= 0 ) {
				// Close all elements on the stack from the current top down to the found `pos`.
				for ( var i = stack.length - 1; i >= pos; i-- )
					if ( handler.end )
						handler.end( stack[ i ] ); // Invoke the end handler for each closed tag.

				// Truncate the stack to effectively remove the closed elements.
				stack.length = pos;
			}
		}
	}; // End of HTMLParser function definition.


	// Exposes a utility function to convert an HTML string into an XML string.
	this.HTMLtoXML = function( html ) {
		var results = ""; // This variable will accumulate the XML output.

		// Use the core HTMLParser with a specialized handler to build the XML string.
		HTMLParser( html, {
			start: function( tag, attrs, unary ) {
				results += "<" + tag; // Begin with the start tag.

				// Append all attributes to the tag, using their escaped values.
				for ( var i = 0; i < attrs.length; i++ )
					results += " " + attrs[ i ].name + '="' + attrs[ i ].escaped + '"';
				results += ">"; // Close the start tag.
			},
			end: function( tag ) {
				results += "</" + tag + ">"; // Append the corresponding end tag.
			},
			chars: function( text ) {
				results += text; // Append character data directly.
			},
			comment: function( text ) {
				results += "<!--" + text + "-->"; // Append HTML comments.
			}
		} );

		return results; // Return the final XML string.
	};


	// Exposes a utility function to convert an HTML string into a DOM Document object.
	this.HTMLtoDOM = function( html, doc ) {
		// Elements that are expected to appear only once in a valid HTML document.
		var one = makeMap( "html,head,body,title" );

		// Defines structural relationships for certain elements, specifying where they should be appended.
		var structure = {
			link: "head",
			base: "head"
		};

		// If no document object is provided, attempt to create a new one.
		if ( !doc ) {
			if ( typeof DOMDocument != "undefined" )
				doc = new DOMDocument( ); // For older or specific environments.
			else if ( typeof document != "undefined" && document.implementation && document.implementation.createDocument )
				doc = document.implementation.createDocument( "", "", null ); // Modern browser standard.
			else if ( typeof ActiveX != "undefined" )
				doc = new ActiveXObject( "Msxml.DOMDocument" ); // Internet Explorer specific.

		} else {
			// If a node or document is provided, ensure we get the root owner document.
			doc = doc.ownerDocument ||
				doc.getOwnerDocument && doc.getOwnerDocument( ) ||
				doc;
		}

		var elems = [], // A stack to keep track of parent elements for appending nodes.
			documentElement = doc.documentElement || // The root element of the document.
				doc.getDocumentElement && doc.getDocumentElement( ); // Fallback for older DOM implementations.

		// If the document is initially empty (no documentElement), pre-populate it with a basic HTML structure.
		if ( !documentElement && doc.createElement ) ( function( ) {
			var htmlEl = doc.createElement( "html" );
			var headEl = doc.createElement( "head" );
			headEl.appendChild( doc.createElement( "title" ) ); // Add a title element to the head.
			htmlEl.appendChild( headEl );
			htmlEl.appendChild( doc.createElement( "body" ) ); // Add a body element.
			doc.appendChild( htmlEl ); // Append the html element to the document.
		} )( ); // Self-executing anonymous function.

		// If the document has `getElementsByTagName`, find the unique elements and map them.
		if ( doc.getElementsByTagName )
			for ( var i in one )
				one[ i ] = doc.getElementsByTagName( i )[ 0 ];

		// Initialize the current parent node for appending new elements.
		// Defaults to `body` if it exists, otherwise it might be `null`.
		var curParentNode = one.body;

		// Use the HTMLParser to build the DOM structure.
		HTMLParser( html, {
			start: function( tagName, attrs, unary ) {
				// If the tag is one of the unique, pre-built elements (like html, head, body),
				// just update the current parent and skip creating a new element.
				if ( one[ tagName ] ) {
					curParentNode = one[ tagName ];
					if ( !unary ) {
						elems.push( curParentNode ); // Push onto stack if it's not unary.
					}
					return; // Skip the rest of this handler for pre-built elements.
				}

				// Create a new DOM element for the current tag.
				var elem = doc.createElement( tagName );

				// Set all attributes for the newly created element.
				for ( var attrIdx in attrs )
					elem.setAttribute( attrs[ attrIdx ].name, attrs[ attrIdx ].value );

				// Append the new element based on structural rules or to the current parent.
				if ( structure[ tagName ] && typeof one[ structure[ tagName ] ] != "boolean" )
					one[ structure[ tagName ] ].appendChild( elem ); // E.g., append <link> to <head>.
				else if ( curParentNode && curParentNode.appendChild )
					curParentNode.appendChild( elem ); // Append to the general current parent.

				// If the element is not unary, push it onto the stack and make it the new current parent.
				if ( !unary ) {
					elems.push( elem );
					curParentNode = elem;
				}
			},
			end: function( tag ) {
				elems.length -= 1; // Pop the last element from the stack.

				// Update the current parent node to the new top of the stack.
				curParentNode = elems[ elems.length - 1 ];
			},
			chars: function( text ) {
				// Create a text node and append it to the current parent.
				curParentNode.appendChild( doc.createTextNode( text ) );
			},
			comment: function( text ) {
				// This handler is currently empty, but could be used to create DOM comment nodes:
				// curParentNode.appendChild( doc.createComment( text ) );
			}
		} );

		return doc; // Return the fully constructed DOM Document.
	};


	// A simple helper function to create a hash map (object) from a comma-separated string.
	// Each item in the string becomes a key in the object with a value of `true`.
	function makeMap( str ) {
		var obj = {}, // The empty object to be populated.
			items = str.split( "," ); // Split the input string into an array of items.
		for ( var i = 0; i < items.length; i++ )
			obj[ items[ i ] ] = true; // Assign `true` for each item.
		return obj; // Return the created map.
	}

} )( ); // Execute the IIFE.