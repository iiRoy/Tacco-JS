// This JavaScript code implements a jQuery plugin for a Markdown editor.
// It provides functionality to easily insert Markdown formatting into a textarea.
// The plugin handles common Markdown elements like bold, italic, links, images,
// quotes, and code blocks, enhancing user experience for content creation.

// The entire plugin is encapsulated within an Immediately Invoked Function Expression (IIFE)
// to prevent polluting the global namespace and ensure proper scope for jQuery, window,
// document, and undefined.
; ( function ( $, window, document, undefined ) {

	// Extend jQuery's prototype with the MarkdownEditor plugin.
	// This makes the plugin available on jQuery objects, e.g., $('textarea').MarkdownEditor();
	$.fn.MarkdownEditor = function () {

		// Define helper functions and configuration objects within the plugin's scope.
		// These are not exposed globally and are reused across editor instances.

		// Function to adjust the character offset for text selection,
		// primarily to handle cross-browser differences in newline character representation.
		var adjustOffset = function ( input, offset ) {
				// Retrieve the current value of the input element.
				var val = input.value,
					newOffset = offset; // Initialize newOffset with the original offset.

				// Check if the input value contains Windows-style newlines (\r\n).
				// Some browsers (e.g., Opera) might treat these as two characters,
				// while JavaScript string length counts them as one when normalized.
				if ( val.indexOf( '\r\n' ) > -1 ) {
					// Replace all \r\n with \n to normalize newline characters.
					// Then, slice the string up to the given offset and match all normalized newlines.
					var matches = val.replace( /\r\n/g, '\n' ).slice( 0, offset ).match( /\n/g );
					// If matches are found, add their count to the newOffset.
					// This effectively compensates for the extra character in \r\n.
					newOffset += matches ? matches.length : 0;
				}

				// Return the adjusted offset.
				return newOffset;
			},

			// Function to programmatically set the caret (text cursor) position or selection
			// within a textarea element.
			setCaretToPos = function ( input, selectionStart, selectionEnd ) {
				// Ensure the input element has focus before attempting to set selection.
				input.focus();

				// Modern browsers support setSelectionRange for setting selection.
				if ( input.setSelectionRange ) {
					// Use the adjustOffset helper to ensure correct character counting for newlines.
					input.setSelectionRange( adjustOffset( input, selectionStart ), adjustOffset( input, selectionEnd ) );

				// For older Internet Explorer versions that do not support setSelectionRange,
				// use the createTextRange method.
				} else if ( input.createTextRange ) {
					// Create a text range object.
					var range = input.createTextRange();
					// Collapse the range to its start point.
					range.collapse( true );
					// Move the end of the range to the desired selectionEnd character.
					range.moveEnd( 'character', selectionEnd );
					// Move the start of the range to the desired selectionStart character.
					range.moveStart( 'character', selectionStart );
					// Select the defined range.
					range.select();
				}
			},

			// Function to indent the selected text within a textarea.
			// It handles multi-line selections by prepending a prefix multiple times.
			indent = function ( textArea, prefix, count ) {

				// Determine the start and end of the selection range within the textarea's value.
				// Extend the selection start backwards to the previous line feed character.
				var selection,
					newValue,
					range = {
						start: textArea.value.lastIndexOf( '\n', textArea.selectionStart ),
						end: textArea.selectionEnd
					};

				// If no line feed is found before the selection start,
				// the selection should extend to the very beginning of the text.
				if ( range.start == -1 ) {
					range.start = 0;
				}

				// If the selection currently ends with a newline character,
				// remove it from the selection to prevent indenting a blank line.
				if ( textArea.value.charAt( range.end - 1 ) == '\n' ) {
					range.end -= 1;
				}

				// Extend the selection end forward to the next line feed character.
				range.end = textArea.value.indexOf( '\n', range.end );

				// If no line feed is found after the selection end,
				// the selection should extend to the very end of the text.
				if ( range.end == -1 ) {
					range.end = textArea.value.length;
				}

				// Extract the selected block of text, adding leading and trailing newlines
				// to simplify the regex replacement for multi-line indentation.
				selection = '\n' + textArea.value.substring( range.start, range.end ) + '\n\n';

				// Reconstruct the textarea's value.
				// Start with the text before the modified selection.
				newValue = textArea.value.substring( 0, range.start );
				// Apply the indentation: for each line in the selection,
				// prepend the `prefix` repeated `count` times.
				newValue += selection.replace( /^(?=.+)/mg, Array( count + 1 ).join( prefix ) ); // Add 'count' spaces before line feeds.
				// Append the text after the modified selection.
				newValue += textArea.value.substring( range.end );

				// Update the textarea's value with the newly indented text.
				textArea.value = newValue;
			},

			// Configuration object for various Markdown tags.
			// Each tag specifies its start and end delimiters, and a placeholder text.
			tags = {
				bold: {
					start: '**',
					end: '**',
					placeholder: 'Your bold text'
				}, // Markdown for bold text.
				italic: {
					start: '*',
					end: '*',
					placeholder: 'Your emphasized text'
				}, // Markdown for italic/emphasized text.
				link: {
					start: '[',
					end: '][N]',
					placeholder: 'Add your link title'
				}, // Markdown for links, 'N' is a placeholder for resource index.
				image: {
					start: '![',
					end: '][N]',
					placeholder: 'Add image description'
				}, // Markdown for images, 'N' is a placeholder for resource index.
				quote: {
					start: '',
					end: '',
					placeholder: '\n' + '> Place quoted text here' + '\n'
				}, // Markdown for blockquotes.
				pre: {
					start: '',
					end: '',
					placeholder: '\n' + '    Add your code block here' + '\n'
				}, // Markdown for preformatted code blocks (indented).
				code: {
					start: '`',
					end: '`',
					placeholder: 'Add inline code here'
				}, // Markdown for inline code.
			};

		// The core logic of the plugin, applied to each selected element.
		return this.each( function () {
			// Cache the textarea element and initialize other variables.
			var txt = this, // The current textarea DOM element.
				controls = $( '<div class="controls" />' ), // Container for editor buttons.
				resIdx = 0; // Counter for link/image resource indices, used for [N] references.

			// Insert the control buttons before the textarea.
			$( txt ).before( controls.append(
				// HTML string for the control buttons.
				// Each button has a class corresponding to its Markdown tag type (e.g., c-bold).
				// Access keys are provided for keyboard shortcuts (Alt+key).
				'<a class="c-bold" accesskey="b"><strong>B</strong></a>' +
				'<a class="c-italic" accesskey="i"><em>I</em></a>' +
				'<a class="c-link" accesskey="a">LINK</a>' +
				'<a class="c-image" accesskey="m">I<kbd>m</kbd>age</a>' +
				'<a class="c-quote" accesskey="q"><kbd>Q</kbd>uote</a>' +
				'<a class="c-code" accesskey="c"><kbd>C</kbd>ode</a>'
			) );

			// Attach a keypress event handler to the textarea for keyboard shortcuts.
			$( txt ).on( 'keypress', function ( event ) {
				// If the Alt key is pressed, attempt to trigger a button click based on the pressed character.
				if ( event.altKey ) {
					// Find the control button whose accesskey matches the lowercase version of the pressed character.
					$( 'a[accesskey="' + String.fromCharCode( event.keyCode ).toLowerCase() + '"]', controls ).click();
				}
			} );

			// Attach a click event handler to all control buttons.
			$( 'a', controls ).on( 'click', function ( event ) {
				// Prevent the default action of the anchor tag (e.g., navigating).
				event.preventDefault();
				// Ensure the textarea has focus after a button click.
				txt.focus();

				// Determine the Markdown tag name from the button's class (e.g., "c-bold" -> "bold").
				var tagName = this.className.substr( 2 ),
					// Get the current selection range in the textarea.
					range = {
						start: txt.selectionStart,
						end: txt.selectionEnd
					},
					// Extract the currently selected text.
					selectedText = txt.value.substring( range.start, range.end ),
					// Check for surrounding text (non-whitespace) around the selection.
					// This helps determine if an inline code block is appropriate.
					haveOuterText = $.trim( txt.value.charAt( range.start - 1 ) + txt.value.charAt( range.end ) );

				// Special handling for the 'code' tag:
				// If the selection contains newlines, or there's no surrounding text,
				// or the textarea is empty, it should be treated as a 'pre' (code block).
				tagName = ( tagName === 'code' ) && ( ( selectedText.indexOf( '\n' ) !== -1 ) || ( !haveOuterText ) || ( txt.value.length < 1 ) ) ? 'pre' : tagName;

				// Create a copy of the tag configuration to avoid modifying the original `tags` object.
				var tag = $.extend( {}, tags[ tagName ] ),
					// Get the trimmed version of the placeholder text.
					trimmedPh = $.trim( tag.placeholder ),
					// Calculate the number of leading spaces/newlines removed during trimming.
					spacesRemoved = tag.placeholder.indexOf( trimmedPh );

				// Special adjustment for 'quote' placeholder as it's not trimmed in the same way.
				if ( tagName === 'quote' ) {
					// Adjust trimmedPh for quote as it starts with '> '.
					trimmedPh = trimmedPh.substr( 2 );
					// Adjust spacesRemoved to account for the '> ' prefix.
					spacesRemoved += 2;
				}

				// If the selected text is exactly the placeholder text, do nothing.
				// This prevents re-applying formatting to already placeholder text.
				if ( selectedText === trimmedPh ) {
					return true;
				}

				// Handle special cases for 'link' and 'image' tags, which require user input for a URL.
				if ( $.inArray( tagName, [ 'link', 'image' ] ) !== -1 ) {
					// Prompt the user for a URL.
					var url = prompt( ( tagName !== 'image' ) ? 'Enter the URL' : 'Enter image URL', 'http://' );

					// If a URL is provided by the user.
					if ( url ) {
						// Increment the resource index and update the tag's end delimiter.
						tag.end = tag.end.replace( 'N', ++resIdx );
						// Append the resource definition to the end of the textarea.
						txt.value += '\n\n' + '  [' + resIdx + ']: ' + url;

					} else {
						// If the user cancels the prompt, stop processing for this click.
						return true;
					}
				}

				// Apply the Markdown formatting based on whether text is selected or not.
				// Case 1: No text is selected (range.start equals range.end).
				// Insert the tag's start, placeholder, and end delimiters.
				if ( range.start === range.end ) {
					txt.value = txt.value.substring( 0, range.end ) + tag.start + tag.placeholder + tag.end + txt.value.substring( range.end );
					// Position the caret within the inserted placeholder text for easy editing.
					setCaretToPos( txt, range.end + tag.start.length + spacesRemoved, range.end + tag.start.length + spacesRemoved + trimmedPh.length );

				// Case 2: Text is selected.
				} else {

					// For 'pre' tags (code blocks), apply indentation.
					if ( tagName === 'pre' ) {
						indent( txt, ' ', 4 ); // Indent with 4 spaces.

					// For 'quote' tags, apply blockquote indentation.
					} else if ( tagName === 'quote' ) {
						indent( txt, '> ', 1 ); // Indent with '> '.

					// For all other tags (bold, italic, link, image, inline code),
					// simply wrap the selected text with the tag's start and end delimiters.
					} else {
						txt.value = txt.value.replace( selectedText, tag.start + selectedText + tag.end );
					}

				}

				// Return true to indicate successful processing and potentially allow other handlers to run.
				return true;
			} );

		} ); // End of this.each()

	}; // End of $.fn.MarkdownEditor

// Pass jQuery, window, document, and undefined to the IIFE.
// Undefined is passed explicitly to ensure its value is truly undefined,
// as it can be redefined in older JavaScript environments.
} )( jQuery, window, document );