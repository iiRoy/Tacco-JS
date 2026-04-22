/*
 * Copyright (c) 2014 Konstantin Kobs
 *
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * This file contains the implementation for the ColorHint functionality.
 * It provides code hints for CSS color values within the Brackets editor.
 */

/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/* global define, brackets, $, window */
/*
 * This section defines global variables and JSLint rules for the file.
 * `define` is used for AMD module definition.
 * `brackets`, `$`, `window` are expected global objects.
 */


define(
	function ( require, exports, module ) {

		"use strict" ;

		// Import necessary modules from Brackets.
		var AppInit             = brackets.getModule( "utils/AppInit" ),
			CodeHintManager     = brackets.getModule( "editor/CodeHintManager" ),
			DocumentManager     = brackets.getModule( "document/DocumentManager" ),
			CSSUtils            = brackets.getModule( "language/CSSUtils" ),
			LanguageManager     = brackets.getModule( "language/LanguageManager" ) ;

		/**
		 * @constructor
		 * Represents the ColorHint provider.
		 * This object manages the logic for suggesting color hints in CSS files.
		 */
		function ColorHint( ) {

		}


		/**
		 * Gets the text content of the currently active CSS file.
		 * @returns {string} The full text content of the CSS document.
		 */
		ColorHint.prototype.getCssStyleText = function ( ) {

			var text = this.editor.document.getText( ) ;

			return text ;

		} ;


		/**
		 * Extracts the actual color value from a hint string.
		 * Hint strings can contain HTML for display, this function isolates the color code.
		 * @param {string} string The hint string, potentially including HTML.
		 * @returns {string} The extracted color code (e.g., "RRGGBB").
		 */
		ColorHint.prototype.getColorFromString = function ( string ) {

			var pos = string.lastIndexOf( ">" ) ;
			return string.substring( pos + 1 ) ;

		} ;


		/**
		 * Compares the brightness of two color hint strings.
		 * This is used for sorting color hints by perceived brightness.
		 * @param {string} a First color hint string.
		 * @param {string} b Second color hint string.
		 * @returns {number} -1 if 'a' is brighter, 1 if 'b' is brighter, 0 if equal.
		 */
		ColorHint.prototype.compareBrightness = function ( a, b ) {

			var ch = new ColorHint( ) ;

			// Get the raw color strings from the HTML hints
			var c1 = ch.getColorFromString( a ) ;
			var c2 = ch.getColorFromString( b ) ;

			// Ensure colors are in six-character hexadecimal format for brightness calculation
			var c1 = ch.toSix( c1 ) ;
			var c2 = ch.toSix( c2 ) ;

			// Calculate the brightness for each color
			var b1 = ch.calcBrightness( c1 ) ;
			var b2 = ch.calcBrightness( c2 ) ;

			// Compare the calculated brightness values
			if ( b1 < b2 ) {
				return -1 ;
			}
			if ( b1 > b2 ) {
				return 1 ;
			}
			return 0 ;

		} ;


		/**
		 * Returns an array of all unique color values found in the current file,
		 * filtered by the typed input and sorted by brightness.
		 * @returns {Array.<string>} An array of HTML strings representing color hints.
		 */
		ColorHint.prototype.getAllColors = function ( ) {
			// Retrieve the entire text content of the CSS document.
			var text = this.getCssStyleText( ) ;

			// Regular expression to find hexadecimal color values.
			// It looks for '#', followed by 3 or 6 hex characters,
			// preceded by a space or colon, and followed by a non-word character or semicolon.
			var regex = /[ :]#([0-9a-f]{3}|[0-9a-f]{6})[\W;]/ig ;

			// Extract the filter string from the typed text, converting to lowercase.
			var filter = this.info.values[ 0 ].substr( 1 ).toLowerCase( ) ;

			var matches = [ ] ;
			// Iterate through all matches found by the regex.
			var match = null ;
			while ( ( match = regex.exec( text ) ) !== null ) {

				// The found hex code without the '#' prefix.
				var code = match[ 1 ].toLowerCase( ) ;

				// Convert to 6 characters for consistent comparison.
				var check = this.toSix( code ) ;

				// Attempt to shorten the code to 3 characters if possible for display.
				code = this.toThree( code ) ;

				// Filter out colors that do not match the typed input.
				// Checks both the 3-char and 6-char versions against the filter.
				if ( code.indexOf( filter ) !== 0 && check.indexOf( filter ) !== 0 ) {
					continue ; // Skip to the next match if no part matches the filter.
				}

				// Construct the HTML string for the hint, including a color swatch.
				var html = "<div style='display: inline-block; margin-right: 5px; height: 10px; width: 10px; background: #" + code + ";'></div>" + code ;

				// Add the hint to the array only if it's not already present (to ensure uniqueness).
				if ( matches.indexOf( html ) === -1 ) {
					matches.push( html ) ;
				}

			}

			// Sort the collected color hints based on their brightness.
			matches = matches.sort( this.compareBrightness ) ;

			return matches ;
		} ;


		/**
		 * Calculates the perceived brightness of a hexadecimal color code.
		 * The higher the returned value, the brighter the color.
		 * This calculation uses a weighted average of RGB components.
		 *
		 * @param {string} hexCode The 6-character hexadecimal color string (e.g., "RRGGBB").
		 * @returns {number} A numerical value representing the brightness.
		 */
		ColorHint.prototype.calcBrightness = function ( hexCode ) {
			// Parse the red, green, and blue components from the hex string.
			var r = parseInt( hexCode.substr( 0, 2 ), 16 ) ;
			var g = parseInt( hexCode.substr( 2, 2 ), 16 ) ;
			var b = parseInt( hexCode.substr( 4, 2 ), 16 ) ;

			// Apply the weighted brightness formula.
			return ( ( r * 299 ) + ( g * 587 ) + ( b * 114 ) ) / 1000 ;
		} ;


		/**
		 * Converts a 3-character hex color code to its 6-character equivalent,
		 * or returns the original if it's already 6 characters.
		 *
		 * @param {string} color The 3- or 6-character hex color string (without '#').
		 * @returns {string} The 6-character hex color string.
		 */
		ColorHint.prototype.toSix = function ( color ) {
			if ( color.length === 6 ) {
				return color ;
			}
			else {
				// Expand 3-character (e.g., "ABC") to 6-character (e.g., "AABBCC").
				return color.charAt( 0 ) + color.charAt( 0 ) + color.charAt( 1 ) + color.charAt( 1 ) + color.charAt( 2 ) + color.charAt( 2 ) ;
			}
		} ;


		/**
		 * Attempts to convert a 6-character hex color code to its 3-character shorthand,
		 * if possible. Otherwise, returns the original 6-character code.
		 *
		 * @param {string} color The 6-character hex color string (without '#').
		 * @returns {string} The 3-character or 6-character hex color string.
		 */
		ColorHint.prototype.toThree = function ( color ) {
			if ( color.length === 3 ) {
				return color ; // Already 3 characters.
			}
			else if ( color.charAt( 0 ) === color.charAt( 1 ) && color.charAt( 2 ) === color.charAt( 3 ) && color.charAt( 4 ) === color.charAt( 5 ) ) {
				// If it can be shortened (e.g., "AABBCC" -> "ABC").
				return color.charAt( 0 ) + color.charAt( 2 ) + color.charAt( 4 ) ;
			}
			else {
				return color ; // Cannot be shortened.
			}
		} ;


		/**
		 * Determines if the hint provider can offer hints at the current editor position.
		 * This method is called by the CodeHintManager.
		 *
		 * @param {Object} editor The current editor instance.
		 * @param {string} implicitChar The character just typed, or null if hints are explicitly requested.
		 * @returns {boolean} True if hints can be provided, false otherwise.
		 */
		ColorHint.prototype.hasHints = function ( editor, implicitChar ) {

			this.editor = editor ; // Store the editor instance for later use.

			// Only provide hints if the implicit character typed is '#'.
			return implicitChar ? implicitChar === "#" : false ;

		} ;


		/**
		 * Calculates and returns the array of hints.
		 * This method is called by the CodeHintManager when `hasHints` returns true.
		 *
		 * @param {string} implicitChar The character that triggered the hint request (e.g., '#').
		 * @returns {Object} An object containing hint data, or null if no hints are available.
		 */
		ColorHint.prototype.getHints = function ( implicitChar ) {

			// Retrieve the current cursor position in the editor.
			var cursor = this.editor.getCursorPos( ) ;

			// Get contextual information about the text at the cursor position.
			this.info = CSSUtils.getInfoAtPos( this.editor, cursor ) ;

			// The value currently typed by the user, which might be a partial color.
			var typed = this.info.values[ 0 ] ;

			// Regular expression to check if the typed value looks like a hex color.
			var regex = /^#[a-f0-9]*$/i ;

			// Check if it's a hex color and if hints are still useful (i.e., not a complete 6-char hex yet).
			var hex = regex.test( typed ) && ( typed.length < 7 ) ;

			// If the typed text is not a valid or incomplete hex color, return no hints.
			if ( !hex ) {
				return null ;
			}

			// Retrieve all matching colors from the document.
			var colors = this.getAllColors( ) ;

			// Return the hints object expected by the CodeHintManager.
			return {
				hints: colors,
				match: null,
				selectInitial: true,
				handleWideResults: false
			} ;

		} ;


		/**
		 * Inserts the selected hint into the editor.
		 * This method is called by the CodeHintManager when a hint is chosen.
		 *
		 * @param {string} hint The selected hint string (e.g., HTML with color swatch).
		 */
		ColorHint.prototype.insertHint = function ( hint ) {

			// Calculate the offset from the start of the color value to the '#' character.
			var offset = this.info.offset - 1 ;

			// Extract the pure color code from the hint HTML string.
			var code = this.getColorFromString( hint ) ;

			// Get the current document object from the DocumentManager.
			var currentDoc = DocumentManager.getCurrentDocument( ) ;

			// Get the current cursor position in the editor.
			var pos = this.editor.getCursorPos( ) ;

			// Determine the starting position for the replacement range.
			// It's the current cursor position minus the offset to the '#' character.
			var start = { line: pos.line, ch: pos.ch - offset } ;

			// Replace the existing text (e.g., "#abc" or "#") with the full color code.
			// Using `_codeMirror.replaceRange` directly for Brackets compatibility.
			this.editor._codeMirror.replaceRange( code, start, pos ) ;

		} ;


		// Register the ColorHint provider with the Brackets CodeHintManager
		// once the application is ready.
		AppInit.appReady( function ( ) {
			var colorHints = new ColorHint( ) ;
			CodeHintManager.registerHintProvider( colorHints, [ "css", "scss", "less" ], 0 ) ;
		} ) ;

	}
) ;