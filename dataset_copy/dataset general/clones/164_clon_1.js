//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// File: alto_view.js
// Description: This JavaScript file provides a viewer and editor interface for ALTO data,
//              which is represented in JSON format.
//
// Project Details: For comprehensive information and specifications, please refer to:
//                  http://opendatachallenge.kbresearch.nl/
//
// Copyright Information:
// Copyright (C) 2011 R. van der Ark, Koninklijke Bibliotheek - National Library of the Netherlands
//
// License:
// This software is free; you are permitted to redistribute it and/or modify it.
// It is distributed under the terms of the GNU General Public License (GPL),
// as published by the Free Software Foundation. You may choose either version 3
// of the License, or, at your discretion, any later version.
//
// Disclaimer:
// This program is provided in the hope that it will be useful to you,
// but it comes WITHOUT ANY WARRANTY. This includes, without limitation,
// the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
// For more detailed information, please consult the GNU General Public License.
//
// License Availability:
// If you have not received a copy of the GNU General Public License with this program,
// you can find one online at: <http://www.gnu.org/licenses/>.
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var AltoView = Class.create( {


	initialize : function ( alto , image_client , text_container , words , zc ) {
		// Initialize the AltoView instance with provided data and clients.
		this.alto          = alto ;
		this.words         = ( words ? words . toLowerCase ( ) . split ( " " ) : [ ] ) ; // Process words, convert to lowercase and split.
		this.imageClient   = image_client ;
		this.imageContainer = this . imageClient . container ; // Reference to the image client's container.
		this.textContainer = $ ( text_container ) ; // Convert text container ID to a Prototype element.
		this.lineHighlight = null ; // Stores the currently highlighted line overlay.
		this.blockAreas    = [ ] ; // Array to hold text block overlay areas.
		this.updates       = [ ] ; // Array to track updates made to the ALTO data.
		this.readorder     = [ ] ; // Stores the reading order of words.
		this.current_edit  = null ; // Holds the reference to the currently active text edit.
		this.lockLineClick = false ; // Flag to prevent line clicks during segmentation editing.
		this.broadestLine  = 0 ; // Keeps track of the widest line encountered for zoom calculations.

		// Initiate the rendering of the ALTO text content.
		this.renderText ( ) ;
	} ,

	renderText : function ( ) {
		var _this = this ; // Cache 'this' for use within nested functions.

		// Iterate over each text block in the ALTO data.
		this.alto.blocks.each( function ( textBlock ) {
			// Render the current text block visually.
			_this.renderTextBlock( textBlock ) ;

			// Add an overlay to the image client for the current text block.
			_this.blockAreas.push( _this.imageClient.addOverlay(
				textBlock.hpos,
				textBlock.vpos,
				textBlock.width,
				textBlock.height,
				"red",
				true,
				textBlock.id + "_box",
				function ( e ) {
					// Event handler for clicking on the text block overlay.
					// Scroll the text container to bring the corresponding text block into view.
					_this.textContainer.scrollTop = $ ( this.id.replace ( "_box" , "" ) ) . offsetTop - ( Prototype.Browser.IE ? 0 : _this.textContainer.offsetTop ) ;

					// Apply a highlight effect to the corresponding text block in the text container.
					new Effect.Highlight ( this.id.replace ( "_box" , "" ) , { startcolor: '#ffff99' , endcolor: '#ffffff' } ) ;

					// Adjust the image client's position to center the clicked text block.
					_this.imageClient.setPosition ( textBlock.hpos * _this.imageClient.getZoom ( ) , ( textBlock.vpos * _this.imageClient.getZoom ( ) ) ) ;

					// Re-render the image client to reflect the new position.
					_this.imageClient.render ( ) ;
				}
			) ) ;
		} ) ;
	} ,


	renderTextBlock : function ( textBlock ) {
		var _this = this ; // Store 'this' context for inner scopes.
		var textDiv = new Element ( "div" , { "id" : textBlock.id } ) ; // Create a div for the text block.

		// Iterate through each line within the text block.
		textBlock.lines.each( function ( textLine ) {
			var lineDiv = new Element ( "div" , { "id" : textLine.id , "class" : "altoLineDiv" } ) ; // Create a div for the text line.

			// Add mouseover event listener to highlight the line.
			lineDiv.observe ( "mouseover" , function ( e ) {
				this.style.backgroundColor = "#dfd" ; // Change background color on hover.
				this.style.cursor          = "pointer" ; // Indicate clickable element.
				_this.highlightTextLine ( textLine ) ; // Highlight the corresponding image line.
			} ) ;

			// Add mousemove event listener for showing corrector link.
			lineDiv.observe ( "mousemove" , function ( e ) {
				// Hide all corrector links first.
				$$ ( '.seg_corrector' ) . each ( Element.hide ) ;
				// If mouse is near the right edge of the line div, show the corrector.
				if ( e.clientX > ( this.cumulativeOffset ( ) [ 0 ] + this.getWidth ( ) - 40 ) )
					$ ( this.id + ":corrector1" ) . show ( ) ;
			} ) ;

			// Append segmentation link (e.g., '...') to the line.
			_this.appendSegLink ( lineDiv ) ;

			// Iterate through each word (string) in the text line.
			textLine.strings.each ( function ( word ) {
				// Only process words that are not marked for deletion.
				if ( ! word [ "delete" ] ) {
					// Add the word's ID to the read order.
					_this.readorder.push ( textBlock.id + ":" + textLine.id + ":" + word.id ) ;

					// Create a span element for the word.
					var span = new Element ( "span" , { "id" : textBlock.id + ":" + textLine.id + ":" + word.id } ) ;
					span.insert ( word.content ) ; // Insert the word's content.

					// If the word has been updated, color it green.
					if ( word.updated )
						span.style.color = "green" ;

					lineDiv.insert ( span ) ; // Insert the word span into the line div.
					lineDiv.insert ( "&nbsp;" ) ; // Add a non-breaking space after the word.

					// Add click event to edit the word.
					span.observe ( "click" , function ( e ) {
						_this.editWord ( this ) ;
					} ) ;

					// Add mouseover event to highlight the word.
					span.observe ( "mouseover" , function ( e ) {
						this.style.backgroundColor = "#ddf" ; // Change background color on hover.
						this.style.cursor          = "pointer" ; // Indicate clickable element.
						_this.highlightWord ( word ) ; // Highlight the corresponding image word.
					} ) ;

					// Add mouseout event to reset word background.
					span.observe ( "mouseout" , function ( e ) {
						this.style.backgroundColor = "transparent" ; // Reset background color.
					} ) ;
				}
			} ) ;

			// Add click event listener for the entire line div.
			lineDiv.observe ( "click" , function ( e ) {
				// Zoom to the clicked line's position on the image.
				_this.zoomToLineAt ( textLine , textBlock , _this.scrolledLinePos ( this ) ) ;
				_this.highlightTextLine ( textLine ) ; // Highlight the line on the image.

				// If no input element is currently active and line click is not locked, edit the first word.
				if ( ! this.childElements ( ) . detect ( function ( e ) { return e.id.match ( /_input$/ ) ; } ) && ! _this.lockLineClick )
					_this.editWord ( this.childElements ( ) [ 0 ] ) ;
			} ) ;

			// Add mouseout event listener for the entire line div.
			lineDiv.observe ( "mouseout" , function ( e ) {
				this.style.backgroundColor = "transparent" ; // Reset background color of the line.
			} ) ;

			// Update the broadest line if the current line is wider.
			_this.broadestLine = _this.broadestLine > textLine.width ? _this.broadestLine : textLine.width ;

			textDiv.insert ( lineDiv ) ; // Insert the line div into the text block div.

			// If segments are not valid, append a "correct segments" link.
			if ( ! _this.validateSegments ( lineDiv ) )
				_this.appendCorrectSegLink ( lineDiv ) ;
		} ) ;

		// Insert the completed text block div into the main text container.
		this.textContainer.insert ( textDiv ) ;
		// Add a line break after each text block for visual separation.
		this.textContainer.insert ( new Element ( "br" ) ) ;
	} ,


	findLine : function ( lineId ) {
		// Iterate through all text blocks.
		for ( i = 0 ; i < this.alto.blocks.length ; ++i ) {
			// Find the line with the matching ID within the current block's lines.
			var curLine = this.alto.blocks [ i ] . lines . detect ( function ( l ) { return l.id == lineId ; } ) ;
			if ( curLine ) {
				return curLine ; // Return the found line.
			}
		} ;
		return null ; // Return null if no line is found.
	} ,


	findWord : function ( wordId ) {
		// Remove block and line ID prefixes from the word ID.
		wordId = wordId.replace ( /.*:/ , "" ) ;

		// Iterate through all text blocks.
		for ( i = 0 ; i < this.alto.blocks.length ; ++i ) {
			// Iterate through all lines within the current text block.
			for ( j = 0 ; j < this.alto.blocks [ i ] . lines.length ; ++j ) {
				// Find the word with the matching ID within the current line's strings.
				var curWord = this.alto.blocks [ i ] . lines [ j ] . strings . detect ( function ( w ) { return w.id == wordId ; } ) ;
				if ( curWord ) {
					return curWord ; // Return the found word.
				}
			}
		} ;
		return null ; // Return null if no word is found.
	} ,


	scrolledLinePos : function ( textDiv ) {
		// Calculate the position of the textDiv relative to the scroll position.
		return textDiv.offsetTop - this.scrollPosition ( ) ;
	} ,


	scrollPosition : function ( ) {
		// Get the current scroll position of the text container, adjusting for IE browser differences.
		return this.textContainer.scrollTop + ( Prototype.Browser.IE ? 0 : this.textContainer.offsetTop ) ;
	} ,


	zoomToLineAt : function ( textLine , textBlock , atPosition ) {
		// Calculate a new zoom level based on the broadest line and page width.
		var newZoom = 1.0 - ( ( this.broadestLine + 60 ) / this.alto.page_width ) ;

		// Ensure the zoom level does not fall below a minimum threshold.
		if ( newZoom < 0.5 )
			newZoom = 0.5 ;

		// Adjust zoom if the line width at the current zoom exceeds the image container width.
		if ( newZoom * textLine.width > parseInt ( this.imageContainer.style.width ) + 60 ) {
			newZoom *= parseInt ( this.imageContainer.style.width ) / ( newZoom * ( this.broadestLine + 60 ) ) ;
		}

		// Set the calculated zoom level on the image client.
		this.imageClient.setZoom ( newZoom ) ; // Original comment: //1.0 - (textLine.width  / this.alto.page_width));

		// Position the image client to center the text line, adjusting for scroll position.
		this.imageClient.setPosition ( ( textLine.hpos * this.imageClient.getZoom ( ) ) - 20 , ( textLine.vpos * this.imageClient.getZoom ( ) ) - atPosition ) ;

		// Re-render the image client to apply the new zoom and position.
		this.imageClient.render ( ) ;
	} ,


	highlightTextLine : function ( textLine ) {
		// If there's an existing line highlight, remove it first.
		if ( this.lineHighlight )
			this.imageClient.dropOverlay ( this.lineHighlight ) ;

		// Add a new blue overlay to highlight the specified text line.
		this.lineHighlight = this.imageClient.addOverlay ( textLine.hpos , textLine.vpos , textLine.width , textLine.height , "blue" ) ;
	} ,


	highlightWord : function ( wrd , setColor ) {
		// If there's an existing word highlight, remove it first.
		if ( this.wordHighlight )
			this.imageClient.dropOverlay ( this.wordHighlight ) ;

		// Add a new overlay to highlight the specified word.
		// Use 'setColor' if provided, otherwise default to "blue".
		this.wordHighlight = this.imageClient.addOverlay ( wrd.hpos , wrd.vpos , wrd.width , wrd.height , ( setColor ? setColor : "blue" ) ) ;
	} ,


	appendCorrectSegLink : function ( lineDiv ) {
		// Create an anchor element for the "corrector" link.
		var correctLink = new Element ( "a" , {
			"style" : "color: red; font-weight: bold; margin-right: 40px; text-decoration: underline" ,
			"id"    : lineDiv.id + ":corrector"
		} ) ;

		correctLink.insert ( "!!!" ) ; // Set link text.
		lineDiv.insert ( correctLink ) ; // Insert link into the line div.

		var _this = this ; // Cache 'this' for event handler.
		// Add click event listener to the corrector link.
		correctLink.observe ( "click" , function ( e ) {
			_this.saveCurrentUpdate ( ) ; // Save any ongoing edits.
			_this.lockLineClick = true ; // Lock line clicks during segmentation editing.
			// Initialize a new SegEdit instance for the line.
			new SegEdit ( _this.findLine ( lineDiv.id ) , _this.imageClient , lineDiv , _this ) ;
		} ) ;
	} ,


	appendSegLink : function ( lineDiv ) {
		// Create an anchor element for the segmentation link.
		var correctLink = new Element ( "a" , {
			"style" : "float: right; color: blue; font-weight: bold; margin-right: 3px; text-decoration: underline" ,
			"class" : "seg_corrector" ,
			"id"    : lineDiv.id + ":corrector1"
		} ) ;

		correctLink.insert ( "..." ) ; // Set link text.
		lineDiv.insert ( correctLink ) ; // Insert link into the line div.

		var _this = this ; // Cache 'this' for event handler.
		// Add click event listener to the segmentation link.
		correctLink.observe ( "click" , function ( e ) {
			_this.saveCurrentUpdate ( ) ; // Save any ongoing edits.
			_this.lockLineClick = true ; // Lock line clicks during segmentation editing.
			// Initialize a new SegEdit instance for the line.
			new SegEdit ( _this.findLine ( lineDiv.id ) , _this.imageClient , lineDiv , _this ) ;
		} ) ;
		correctLink.hide ( ) ; // Hide the link by default.
	} ,


	updateSegments : function ( deletions , resizings , insertions , contentUpdates , lineDiv ) {
		var _this    = this ; // Store 'this' context for inner functions.
		var altoLine = this.findLine ( lineDiv.id ) ; // Get the ALTO line object.

		// Process insertions.
		insertions.each ( function ( insert ) {
			var spans = lineDiv.childElements ( ) ; // Get all child spans in the line div.
			// Iterate through existing spans to find the correct insertion point.
			for ( var i = 0 ; i < spans.length ; ++i ) {
				var word     = _this.findWord ( spans [ i ] . id ) ;
				var nextWord = ( i == spans.length - 1 ? null : _this.findWord ( spans [ i + 1 ] . id ) ) ;

				// Determine if the new word should be inserted between 'word' and 'nextWord' or after 'word' if it's the last.
				if ( ( word && nextWord && word.hpos < insert.hpos && nextWord.hpos > insert.hpos ) || ( word && ! nextWord && word.hpos < insert.hpos ) ) {
					// Create a new span for the inserted word.
					var newSpan = new Element ( "span" , { "id" : lineDiv.ancestors ( ) [ 0 ] . id + ":" + lineDiv.id + ":" + insert.id , "style" : "color: green" } ) ;
					newSpan.insert ( insert.content ) ; // Insert the word content.
					spans [ i ] . insert ( { after : newSpan } ) ; // Insert new span after the current span.
					newSpan.insert ( { before : "&nbsp;" } ) ; // Add a non-breaking space before the new span.

					altoLine.strings.splice ( i , 0 , insert ) ; // Insert into the ALTO line's strings array.
					_this.readorder.splice ( _this.readorder.indexOf ( spans [ i ] . id ) + 1 , 0 , newSpan.id ) ; // Update read order.

					// Attach event listeners for the new span.
					newSpan.observe ( "click" , function ( e ) {
						_this.editWord ( this ) ;
					} ) ;

					newSpan.observe ( "mouseover" , function ( e ) {
						this.style.backgroundColor = "#ddf" ;
						this.style.cursor          = "pointer" ;
						_this.highlightWord ( insert ) ;
					} ) ;

					newSpan.observe ( "mouseout" , function ( e ) {
						this.style.backgroundColor = "transparent" ;
					} ) ;

					// Record the insertion update fields.
					_this.insertUpdateField ( "insert" , newSpan.id , "after" , spans [ i ] . id ) ;
					_this.insertUpdateField ( "insert" , newSpan.id , "width" , insert.width ) ;
					_this.insertUpdateField ( "insert" , newSpan.id , "hpos" , insert.hpos ) ;
					_this.insertUpdateField ( "insert" , newSpan.id , "vpos" , insert.vpos ) ;
					_this.insertUpdateField ( "insert" , newSpan.id , "height" , insert.height ) ;
					_this.insertUpdateField ( "insert" , newSpan.id , "content" , insert.content ) ;
					break ; // Exit loop after successful insertion.
				}
			}
		} ) ;

		// Process content updates.
		contentUpdates.each ( function ( cu ) {
			// Update the inner HTML of the corresponding span.
			$ ( lineDiv.ancestors ( ) [ 0 ] . id + ":" + lineDiv.id + ":" + cu.id ) . innerHTML = cu.content ;
			// Record the content update field.
			_this.insertUpdateField ( "update" , lineDiv.ancestors ( ) [ 0 ] . id + ":" + lineDiv.id + ":" + cu.id , "content" , cu.content ) ;
		} ) ;

		// Process resizings.
		resizings.each ( function ( resize ) {
			var word = _this.findWord ( resize.id ) ; // Find the word object.
			if ( word ) {
				word.hpos  += resize.left ; // Adjust horizontal position.
				word.width += resize.width ; // Adjust width.
				// Record the resizing update fields.
				_this.insertUpdateField ( "update" , resize.id , "width" , word.width ) ;
				_this.insertUpdateField ( "update" , resize.id , "hpos" , word.hpos ) ;
			}
		} ) ;

		// Process deletions.
		deletions.each ( function ( d ) {
			$ ( d ) . remove ( ) ; // Remove the element from the DOM.
			_this.readorder.remove ( _this.readorder.indexOf ( d ) ) ; // Remove from read order.
			_this.insertUpdateField ( "update" , d , "delete" , "true" ) ; // Record as deleted.
		} ) ;

		// If segments are now valid and a corrector link exists, remove it.
		if ( this.validateSegments ( lineDiv ) && $ ( lineDiv.id + ":corrector" ) )
			$ ( lineDiv.id + ":corrector" ) . remove ( ) ;
	} ,


	insertUpdateField : function ( action , id , key , value ) {
		// Search for an existing hidden input field for this specific update.
		var existing = $$ ( "#update_form input" ) . detect ( function ( inp ) {
			return inp.getAttribute ( "name" ) == action + "[" + id + "][" + key + "]" ;
		} ) ;

		// If an existing field is found, update its value.
		if ( existing ) {
			existing.value = value ;
		} else {
			// Otherwise, create a new hidden input field and insert it into the update form.
			$ ( 'update_form' ) . insert ( new Element ( "input" , {
				"name"  : action + "[" + id + "][" + key + "]" ,
				"value" : value ,
				"type"  : "hidden"
			} ) ) ;
		}
	} ,


	validateSegments : function ( lineDiv ) {
		var spans = lineDiv.childElements ( ) ; // Get all child span elements of the line div.

		// Iterate through each span to validate its content.
		for ( var x = 0 ; x < spans.length ; x ++ ) {
			// Check for invalid segment content:
			// 1. Span contains only a non-breaking space.
			// 2. Span contains only a regular space.
			// 3. Span contains multiple non-whitespace words separated by whitespace.
			if ( spans [ x ] . innerHTML == "&nbsp;" || spans [ x ] . innerHTML == " " || spans [ x ] . innerHTML . match ( /[^\s]+\s+[^\s]+/ ) ) {
				return false ; // Validation failed.
			}
		}
		return true ; // All segments are valid.
	} ,


	saveCurrentUpdate : function ( ) {
		// Check if there is an active word edit.
		if ( this.current_edit ) {
			var span    = $ ( this.current_edit.input.name ) ; // Get the original span element.
			var lineDiv = this.current_edit.input.ancestors ( ) [ 0 ] ; // Get the parent line div.

			this.current_edit.input.stopObserving ( "keypress" ) ; // Stop observing keypress on the input.

			// If the input value is empty, replace it with a non-breaking space.
			if ( this.current_edit.input.value == "" )
				this.current_edit.input.value = "&nbsp;" ;

			// If the input value has changed from the original span content.
			if ( this.current_edit.input.value != span.innerHTML ) {
				this.updates [ this.current_edit.input.name ] = this.current_edit.input.value ; // Store the update.

				// Insert or update the hidden field for this content change.
				this.insertUpdateField ( "update" , this.current_edit.input.name , "content" , this.current_edit.input.value ) ;

				span.style.color = "green" ; // Change span color to indicate update.
			}

			span.innerHTML = this.current_edit.input.value ; // Update the span's content.
			span.show ( ) ; // Show the original span (which was hidden for editing).

			// Validate segments after update.
			if ( this.validateSegments ( lineDiv ) ) {
				// If segments are valid and a corrector link exists, remove it.
				if ( $ ( lineDiv.id + ":corrector" ) )
					$ ( lineDiv.id + ":corrector" ) . remove ( ) ;
			} else if ( ! $ ( lineDiv.id + ":corrector" ) ) {
				// If segments are invalid and no corrector link exists, append one.
				this.appendCorrectSegLink ( lineDiv ) ;
			}

			// Stop observing events and remove the input field.
			this.current_edit.input.stopObserving ( "mouseover" ) ;
			this.current_edit.input.stopObserving ( "keydown" ) ;
			this.current_edit.input.remove ( ) ;
			this.current_edit = null ; // Clear the current edit reference.
		}
		return true ; // Indicate that the update was processed (or there was no current edit).
	} ,


	editWord : function ( elem ) {
		// Only proceed if the current edit can be saved successfully.
		if ( this.saveCurrentUpdate ( ) ) {
			// Create a new input element for editing the word.
			var input = new Element ( "input" , {
				"type"  : "text" ,
				"value" : elem.innerHTML.replace ( "&nbsp;" , "" ) , // Remove non-breaking spaces for editing.
				"name"  : elem.id ,
				"style" : "width: " + ( 10 * elem.innerHTML.length ) + "px; color: " + elem.style.color ,
				"id"    : elem.id + "_input"
			} ) ;

			// Highlight the word on the image with a specific color (e.g., green-ish).
			this.highlightWord ( this.findWord ( elem.id ) , "#2A2" ) ;

			this.current_edit = { "input" : input } ; // Store the new input element as the current edit.
			elem.hide ( ) ; // Hide the original word span.
			elem.insert ( { after : input } ) ; // Insert the input field after the original span.

			var _this = this ; // Cache 'this' for use in event handlers.

			// Add mouseover event to highlight the word on image when hovering over input.
			input.observe ( "mouseover" , function ( e ) {
				_this.highlightWord ( _this.findWord ( this.name ) ) ;
			} ) ;

			// Add keydown event listener for navigation and saving.
			input.observe ( "keydown" , function ( e ) {
				var k = e.keyCode || e.which ; // Get the key code.

				if ( k == 9 ) { // Tab key.
					_this.saveCurrentUpdate ( ) ; // Save current edit.
					if ( e.shiftKey == 1 )
						_this.editPrevNext ( this.name , -1 ) ; // Shift+Tab: previous word.
					else
						_this.editPrevNext ( this.name , 1 ) ; // Tab: next word.
					return preventDefault ( e ) ; // Prevent default tab behavior.
				} else if ( k == 13 ) { // Enter key.
					_this.saveCurrentUpdate ( ) ; // Save current edit.
					return preventDefault ( e ) ; // Prevent default form submission.
				} else if ( k == 38 ) { // Up arrow key.
					_this.editUpDown ( this.ancestors ( ) [ 0 ] . id , -1 ) ; // Move to line above.
					return preventDefault ( e ) ;
				} else if ( k == 40 ) { // Down arrow key.
					_this.editUpDown ( this.ancestors ( ) [ 0 ] . id , 1 ) ; // Move to line below.
					return preventDefault ( e ) ;
				} else if ( k == 39 || k == 37 ) { // Left/Right arrow keys.
					var caretPos = null ;
					if ( document.selection ) { // For IE.
						var r = document.selection.createRange ( ) ;
						r.moveEnd ( 'character' , this.value.length ) ;
						caretPos = this.value.lastIndexOf ( r.text ) ;
					} else { // For other browsers.
						caretPos = this.selectionStart ;
					}

					if ( caretPos == 0 && k == 37 ) { // Left arrow at start of word.
						_this.editPrevNext ( this.name , -1 ) ; // Move to previous word.
						return preventDefault ( e ) ;
					} else if ( caretPos == this.value.length && k == 39 ) { // Right arrow at end of word.
						_this.editPrevNext ( this.name , 1 ) ; // Move to next word.
						return preventDefault ( e ) ;
					}
				}
			} ) ;

			// Set a timeout to focus and select the text in the new input field.
			window.setTimeout ( "$('" + elem.id + "_input').focus(); $('" + elem.id + "_input').select()" , 50 ) ;
		}
	} ,


	editPrevNext : function ( word_id , direction ) {
		var i = 0 ;
		// Find the index of the current word in the read order.
		for ( i = 0 ; i < this.readorder.length ; ++i )
			if ( this.readorder [ i ] == word_id )
				break ;

		// If a next/previous word exists in the read order.
		if ( this.readorder [ i + direction ] ) {
			// Edit the target word.
			this.editWord ( $ ( this.readorder [ i + direction ] ) ) ;
			var editDiv = $ ( this.readorder [ i + direction ] ) . ancestors ( ) [ 0 ] ; // Get the line div of the target word.

			// If the target word is in a different line, zoom to that line.
			if ( $ ( word_id ) . ancestors ( ) [ 0 ] != editDiv )
				this.zoomToLineAt ( this.findLine ( editDiv.id ) , null , this.scrolledLinePos ( editDiv ) ) ;
		}
	} ,


	editUpDown : function ( div_id , direction ) {
		// Get an array of IDs for all line divs within the text container.
		var lineDivIds = $$ ( "#" + this.textContainer.id + " div.altoLineDiv" ) . map ( function ( d ) {
			return d.id ;
		} ) ;

		var curIndex = lineDivIds.indexOf ( div_id ) ; // Find the index of the current line div.

		// If a line exists at the target up/down position.
		if ( lineDivIds [ curIndex + direction ] ) {
			var editDiv = $ ( lineDivIds [ curIndex + direction ] ) ; // Get the target line div.
			this.editWord ( editDiv.childElements ( ) [ 1 ] ) ; // Edit the second child element (first word span).
			this.zoomToLineAt ( this.findLine ( editDiv.id ) , null , this.scrolledLinePos ( editDiv ) ) ; // Zoom to the target line.
		}
	}

} ) ;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////