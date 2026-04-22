// This file is a modified version of a jQuery plugin for caret manipulation.
// Original author: C. F., Wong.
// License: MIT License (http://www.opensource.org/licenses/mit-license.php).
//
// This utility provides functions to get and set the caret (cursor) position
// or selection within text input fields or textareas.
// It also offers methods for text replacement and wrapping.
//
// Note: This code handles differences between standard browser APIs
// and older Internet Explorer's document.selection model.

( function ( $ , len , createRange , duplicate ) {

	// Extend jQuery's prototype to add the 'caret' method.
	$.fn.caret = function ( options , opt2 ) {

		// Declare variables to hold the start and end positions of the selection.
		var start
			, end ;

		// Get a direct reference to the DOM element (e.g., textarea or input).
		var textarea = this[ 0 ] ;

		// Get a jQuery-wrapped version of the element for chaining.
		var $textarea = $ ( textarea ) ;

		// Check for the presence of document.selection, which indicates
		// an older IE browser (considered "defective" for modern APIs).
		var isDefective = !! document.selection ;

		// --- Handle setting the caret/selection ---

		// Case 1: Options provided as an object with 'start' and 'end' properties.
		if ( typeof options === "object" && typeof options.start === "number" && typeof options.end === "number" ) {
			start = options.start ;
			end = options.end ;
		}
		// Case 2: Options provided as two separate numbers (start and end).
		else if ( typeof options === "number" && typeof opt2 === "number" ) {
			start = options ;
			end = opt2 ;
		}
		// Case 3: Options provided as a string to search for within the textarea's value.
		else if ( typeof options === "string" ) {
			// Find the first occurrence of the string.
			if ( ( start = textarea.value.indexOf ( options ) ) > -1 ) {
				end = start + options[ len ] ; // End position is start + length of the found string.
			}
			else {
				start = null ; // String not found, so no valid start position.
			}
		}
		// Case 4: Options provided as a RegExp object to search for.
		else if ( options && options.constructor && options.constructor == RegExp ) {
			// Execute the regex on the textarea's value.
			var re = options.exec ( textarea.value ) ;
			if ( re != null ) {
				start = re.index ; // Start position is the regex match index.
				end = start + re[ 0 ][ len ] ; // End position is start + length of the matched text.
			}
		}
		// Case 5: Options provided as a single number (sets both start and end to the same position).
		else if ( typeof options == "number" ) {
			start = options ;
			end = options ;
		}

		// If a valid start position was determined, set the caret/selection.
		if ( typeof start != "undefined" && start !== null ) { // Ensure 'start' is not undefined or null

			// For browsers using document.selection (e.g., IE).
			if ( isDefective ) {
				var selRange = this[ 0 ].createTextRange ( ) ; // Create a text range object.
				selRange.collapse ( true ) ; // Collapse the range to its start point.
				selRange.moveStart ( 'character' , start ) ; // Move the start of the range.
				selRange.moveEnd ( 'character' , end - start ) ; // Adjust the end of the range to create selection.
				selRange.select ( ) ; // Apply the selection.
			}
			// For modern browsers using selectionStart/selectionEnd.
			else {
				this[ 0 ].selectionStart = start ; // Set the start of the selection.
				this[ 0 ].selectionEnd = end ; // Set the end of the selection.
			}

			this[ 0 ].focus ( ) ; // Focus the element after setting the caret.
			return this ; // Return the jQuery object for chaining.
		}
		// --- Handle getting the caret/selection ---
		else {
			var startPos , endPos ; // Variables to store the retrieved positions.

			// For browsers using document.selection (e.g., IE).
			if ( isDefective ) {
				var selection = document.selection ; // Get the document's selection object.

				// Different handling for non-textarea elements (e.g., contenteditable).
				if ( this[ 0 ].tagName.toLowerCase ( ) != "textarea" ) {
					var val = this.val ( ) , // Get the element's value.
						range = selection[ createRange ] ( ) [ duplicate ] ( ) ; // Create and duplicate a text range.

					range.moveEnd ( "character" , val[ len ] ) ; // Move end to the end of the content.

					// Determine start position based on text length.
					startPos = ( range.text == "" ? val[ len ] : val.lastIndexOf ( range.text ) ) ;

					range = selection[ createRange ] ( ) [ duplicate ] ( ) ; // Re-create and duplicate range.
					range.moveStart ( "character" , - val[ len ] ) ; // Move start to the beginning.

					endPos = range.text[ len ] ; // End position is the length of the new range text.
				}
				// Handling for textarea elements.
				else {
					var range = selection[ createRange ] ( ) , // Get the current selection range.
						stored_range = range[ duplicate ] ( ) ; // Duplicate it for manipulation.

					stored_range.moveToElementText ( this[ 0 ] ) ; // Move the duplicated range to cover the whole element.
					stored_range.setEndPoint ( 'EndToEnd' , range ) ; // Set its end point to the selection's end.

					// Calculate start and end positions.
					startPos = stored_range.text[ len ] - range.text[ len ] ;
					endPos = startPos + range.text[ len ] ;
				}
			}
			// For modern browsers using selectionStart/selectionEnd.
			else {
				startPos = textarea.selectionStart ; // Get the start of the selection.
				endPos = textarea.selectionEnd ; // Get the end of the selection.
			}

			// Extract the selected text based on the calculated positions.
			var selectedText = textarea.value.substring ( startPos , endPos ) ;

			// Return an object containing caret information and utility methods.
			return {
				start : startPos , // Start position of the caret/selection.
				end : endPos , // End position of the caret/selection.
				text : selectedText , // The currently selected text.

				// Method to replace the selected text (or insert at caret).
				replace : function ( st , positionAtEnd ) {
					textarea.value = textarea.value.substring ( 0 , startPos ) + st + textarea.value.substring ( endPos ) ;

					// If 'positionAtEnd' is true, place caret at the end of the inserted text.
					if ( !! positionAtEnd ) {
						$textarea.focus ( ) . caret ( startPos + st.length ) ;
					}
					// Otherwise, select the newly inserted text.
					else {
						$textarea.focus ( ) . caret ( startPos , startPos + st.length ) ;
					}
					return textarea.value ; // Return the updated value.
				} ,

				// Method to replace text *within* the current selection.
				replaceInSelection : function ( f , r ) {
					var newText = selectedText.replace ( f , r ) ; // Perform replacement on selected text.
					textarea.value = textarea.value.substring ( 0 , startPos ) + newText + textarea.value.substring ( endPos ) ;

					$textarea.focus ( ) . caret ( startPos , newText.length ) ; // Select the newly inserted text.
					return textarea.value ; // Return the updated value.
				} ,

				// Method to wrap the selected text with 'before' and 'after' strings.
				wrap : function ( before , after ) {
					after = after ? after : before ; // If 'after' is not provided, use 'before'.
					textarea.value = textarea.value.substring ( 0 , startPos ) + before + selectedText + after + textarea.value.substring ( endPos ) ;

					// Select the wrapped text.
					$textarea.focus ( ) . caret ( startPos + before.length , endPos + before.length ) ;
					return textarea.value ; // Return the updated value.
				} ,

				// Method to prepend text to the leading line of the selection.
				prependToLeadingLine : function ( txt ) {
					// Find the last newline character before the selection start.
					var pos = textarea.value.substring ( 0 , startPos ) . lastIndexOf ( "\n" ) ;
					// Insert the text after the newline (or at the beginning of the file).
					textarea.value = textarea.value.substring ( 0 , pos + 1 ) + txt + textarea.value.substr ( pos + 1 ) ;

					// Adjust caret to cover the original selection plus the prepended text.
					$textarea.focus ( ) . caret ( startPos + txt.length , endPos + txt.length ) ;
					return textarea.value ; // Return the updated value.
				} ,

				// Method to prepend text to every line within the selection.
				prependToEveryLine : function ( txt , notIncludingFirstLine ) {
					// Find the start of the first line within the selection.
					var pos = textarea.value[ startPos ] == "\n" ? startPos : textarea.value.substring ( startPos , endPos ) . indexOf ( "\n" ) + startPos ;
					// Find the start of the line just before the selection.
					var pos2 = pos != startPos ? textarea.value.substring ( 0 , startPos ) . lastIndexOf ( "\n" ) : -1 ;

					// Construct the new value by inserting 'txt' at appropriate places.
					var newValue = ( ( startPos == 0 ? txt : "" ) // Prepend to beginning if selection starts at 0.
							+ textarea.value.substring ( 0 , pos2 + 1 )
							+ ( ! notIncludingFirstLine ? txt : "" ) // Prepend to first line if not excluded.
							+ textarea.value.substring ( pos2 + 1 , pos + 1 )
							+ txt // Prepend to the line where 'pos' is found.
							+ textarea.value.substring ( pos + 1 , endPos ) . replace ( /\n/g , "\n" + txt ) // Prepend to subsequent lines.
							+ textarea.value.substr ( endPos ) ) ;

					// Calculate the difference in length for caret adjustment.
					var diff = newValue.length - textarea.value.length ;

					textarea.value = newValue ; // Update the textarea's value.
					$textarea.focus ( ) . caret ( diff ) ; // Set caret based on the length difference.
					return textarea.value ; // Return the updated value.
				}
			} ;
		}
	} ;
} ) ( jQuery , "length" , "createRange" , "duplicate" ) ; // Pass jQuery, "length", "createRange", and "duplicate" as arguments.