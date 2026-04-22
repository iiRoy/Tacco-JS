/* global jQuery */
/*
 * Bacon.jQuery.js 1.5 - A jQuery plugin for text wrapping
 *
 * Copyright (c) 2011, David Hudson http://davidhudson.me
 * All rights reserved.
 *
 * This software is licensed under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

( function( $ ) {

	// A simple coordinate object constructor.
	coord = function( x,y )
	{
		if ( ! x )
			var x = 0; // Default x to 0 if not provided
		if ( ! y )
			var y = 0; // Default y to 0 if not provided

		return { x: x, y: y };
	}; // End coord function definition

	// Bezier curve basis functions. These define the blending functions for the control points.
	function B1( t ) { return t * t * t; }
	function B2( t ) { return 3 * t * t * ( 1 - t ); }
	function B3( t ) { return 3 * t * ( 1 - t ) * ( 1 - t ); }
	function B4( t ) { return ( 1 - t ) * ( 1 - t ) * ( 1 - t ); }

	/**
	 * Calculates a point on a cubic Bezier curve.
	 *
	 * @param {number} percent - The parameter t, from 0 to 1, representing the position along the curve.
	 * @param {object} C1 - First control point (start point).
	 * @param {object} C2 - Second control point.
	 * @param {object} C3 - Third control point.
	 * @param {object} C4 - Fourth control point (end point).
	 * @returns {object} A coord object representing the point on the curve.
	 */
	function getBezier( percent, C1, C2, C3, C4 ) {
		var pos = new coord();
		// Calculate the x-coordinate
		pos.x = C4.x * B1( percent ) + C3.x * B2( percent ) + C2.x * B3( percent ) + C1.x * B4( percent );
		// Calculate the y-coordinate
		pos.y = C4.y * B1( percent ) + C3.y * B2( percent ) + C2.y * B3( percent ) + C1.y * B4( percent );
		return pos;
	}


	// Define the jQuery plugin 'bacon' on the $.fn object.
	$.fn.bacon = function( options ) {

		// Extend default settings with user-provided options.
		var settings = $.extend( {
			'text-align' : 'justify' // Default text alignment.
		}, options );

		var textNodes, // Will store all text nodes from the original element.
			copy = null, // A jQuery object holding a clone of the current element for processing.
			el = $( this ), // The original element on which the plugin was called.
			recurseThroughNodes, // A function to recursively process nodes and distribute text.
			insertedBreaks, // (Currently unused in the provided code snippet, but declared)
			linesUsed = 0, // Counter for the number of lines actually utilized.
			styleAttr; // (Currently unused) Backup of the element's original style attribute.

		// Create a temporary container for our operations.
		// It's positioned relatively to allow absolute positioning of lines within it.
		var $this = $( "<div></div>" )
						.css( 'position', 'relative' )
						.width( '100%' )
						.height( '100%' );

		// Clone the original element's content and remove a specific class if present.
		copy = el.clone().removeClass( 'demo_bacontext' );
		// Clear the original element's content.
		el.empty();

		// Append our working container to the original element.
		el.append( $this );

		// --- Determine line height and max lines ---
		// Create an invisible test line to accurately measure line height.
		var testLine = $( "<div></div>" )
						.css( 'visibility', 'hidden' )
						.text( 'test' );

		$this.append( testLine );

		// Get the height of a single line.
		var lineHeight = testLine.height();

		// Remove the temporary test line.
		testLine.remove();

		// Calculate the maximum number of lines that can fit based on container height.
		var maxLines = Math.floor( $this.height() / lineHeight );


		// --- Create the empty line containers ---
		for ( i = 0; i < maxLines; i++ ) {
			var pos; // Position object for the current line.
			var thisLine; // jQuery object for the current line div.

			// Determine line coordinates based on the specified 'type' in settings.
			if ( settings.type == 'bezier' ) {
				pos = getBezier( i / maxLines,
					coord( settings.c1.x, settings.c1.y ),
					coord( settings.c2.x, settings.c2.y ),
					coord( settings.c3.x, settings.c3.y ),
					coord( settings.c4.x, settings.c4.y ) );
				thisLine = $( "<div></div>" )
							.addClass( 'line' )
							.css( 'top', pos.y + 'px' )
							.css( 'width', ( $this.width() - pos.x ) + 'px' )
							.css( 'height', 'auto' );
			} else if ( settings.type == 'dualbezier' ) {
				// First Bezier curve for one side.
				pos = getBezier( i / maxLines,
					coord( settings.c1.x, settings.c1.y ),
					coord( settings.c2.x, settings.c2.y ),
					coord( settings.c3.x, settings.c3.y ),
					coord( settings.c4.x, settings.c4.y ) );
				// Second Bezier curve for the other side.
				// Note: Currently uses the same Y coordinates as the first curve.
				pos2 = getBezier( i / maxLines,
					coord( settings.d1.x, settings.c1.y ),
					coord( settings.d2.x, settings.c2.y ),
					coord( settings.d3.x, settings.c3.y ),
					coord( settings.d4.x, settings.c4.y ) );
				thisLine = $( "<div></div>" )
							.addClass( 'line' )
							.css( 'top', pos.y + 'px' )
							.css( 'width', ( $this.width() - pos.x - pos2.x ) + 'px' )
							.css( 'height', 'auto' );
			} else if ( settings.type == 'line' ) {
				// Simple linear progression.
				pos = { x : i * settings.step, y : ( i / maxLines ) * $this.height() };
				thisLine = $( "<div></div>" )
							.addClass( 'line' )
							.css( 'top', pos.y + 'px' )
							.css( 'width', ( $this.width() - pos.x ) + 'px' )
							.css( 'height', 'auto' );
			}

			// Add a 'line_content' div inside each line to hold the text.
			thisLine.append( $( "<div></div>" )
							.addClass( 'line_content' )
							.css( 'text-align', settings['text-align'] ) );

			// Position the line based on alignment setting.
			if ( settings.align == 'right' ) {
				thisLine.css( 'right', pos.x + 'px' );
			} else {
				thisLine.css( 'left', pos.x + 'px' );
			}

			// Append the created line to the main container.
			$this.append( thisLine );
			linesUsed++;
		}

		// --- Fill the created lines with content ---
		// Initialize 'currentLine' to the first line container.
		currentLine = $( ".line:first", $this );

		/**
		 * Recursively traverses the DOM nodes, moving text content into the
		 * generated line containers.
		 *
		 * @param {jQuery} currentNode - The target node in the output structure.
		 * @param {HTMLElement} copyNode - The source node from the cloned content.
		 */
		recurseThroughNodes = function( currentNode, copyNode ) {
			$( copyNode ).contents().each( function() {
				var nextCopy; // For cloned child nodes.

				// If the current node is a text node (nodeType 3).
				if ( this.nodeType == 3 ) {
					// Ensure currentNode is the 'line_content' div.
					if ( $( currentNode ).hasClass( 'line_content' ) )
						currentNode = $( ".line_content", currentLine );
					var currentLineHeight = $( ".line_content", currentLine ).height();
					// Move the text node to the current line content.
					$( this ).appendTo( currentNode );
				} else {
					// If it's an element node, create an empty clone and append it.
					nextCopy = $( this ).clone().empty()
								.appendTo( currentNode );
					// Recursively call for its children.
					recurseThroughNodes( nextCopy, this );
				}

				// Check if the current line content has overflowed.
				if ( $( ".line_content", currentLine ).width() >= currentLine.width()
					|| $( ".line_content", currentLine ).height() > currentLineHeight ) {

					// If we're inside a non-line_content element and it doesn't fit.
					if ( ! $( currentNode ).hasClass( 'line_content' ) ) {
						// Remove the last appended text/element.
						$( this, currentNode ).remove();
						// Move to the next line.
						currentLine = currentLine.next( ".line" );

						// Clone the parent of the overflowing content and append it to the new line.
						currentNode = $( copyNode ).clone().empty()
										.appendTo( $( ".line_content", currentLine ) );
						// Re-append the overflowing content to the new parent.
						currentNode.append( this );
					} else { // If the overflow happened directly in 'line_content'.
						$( this, currentNode ).remove(); // Remove the overflowing content.
						currentLine = currentLine.next( ".line" ); // Move to the next line.
						currentNode = $( ".line_content", currentLine ); // Set new current node.
						$( ".line_content", currentLine ).append( this ); // Append content to new line.
					}
				}
			}); // End .each()
		}; // End recurseThroughNodes function

		// --- Prepare text nodes for splitting ---
		// Find all text nodes: first find all elements, then add the root (copy),
		// then get all contents (including text nodes), then filter out non-text nodes.
		textNodes = copy.find( '*' ).add( copy ).contents()
					.not( copy.find( '*' ) );

		// Split each text node into individual word-level text nodes.
		textNodes.each( function( index, lastNode ) {
			var startOfWord = /\W\b/, // Regex to find the start of a word boundary.
				result; // To store regex exec result.

			while ( startOfWord.exec( lastNode.nodeValue ) !== null ) {
				result = startOfWord.exec( lastNode.nodeValue );
				// Split the text node at the word boundary.
				// result.index + 1 because startOfWord matches the char before the word.
				lastNode = lastNode.splitText( result.index + 1 );
			}
		});

		// --- Execute the text distribution ---
		// Start the recursive process to fill the lines.
		recurseThroughNodes( $( ".line_content", currentLine ), copy );

		// After filling, ensure line content widths are 100% for proper justification.
		$( ".line_content" ).width( '100%' );

		// --- Final cleanup and line spacing adjustment ---
		var totalLinesHeight = 0; // Accumulator for vertical positioning.
		$( ".line", $this ).each( function() {
			$( this ).css( 'top', totalLinesHeight + 'px' ); // Set absolute top position.
			totalLinesHeight += $( '.line_content', this ).height(); // Add current line's height.
			// Append non-breaking spaces to ensure lines always have some content,
			// which can help with rendering and justification in some browsers.
			$( '.line_content', this ).append( ' &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' );
		});
	}; // End $.fn.bacon function

})( jQuery ); // Pass jQuery object as $ argument.