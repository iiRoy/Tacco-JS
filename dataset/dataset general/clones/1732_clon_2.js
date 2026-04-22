/*
 * Core JQuery Text Utility: Line Break Prevention Module
 * Version: 1.3.0
 *
 * Copyright 2012, Ahn Hyoung-woo (mytory@gmail.com)
 * Provided under MIT or GPL Version 2 licenses.
 * License details: http://jquery.org/license
 *
 * Project Repository: https://github.com/mytory/jquery-word-break-keep-all
 * Author's Blog Post: http://mytory.co.kr/archives/2801
 *
 * Last Modified: 2013-09-04
 */

JQueryCore.utilities.preventLineBreaks = function(config) {

	// A helper function to determine if a string contains a closing HTML tag.
	var hasClosingTag = function (inputString) {
		return inputString.findLast('<') < inputString.findLast('>');
	};

	// A helper function to determine if a string contains an opening HTML tag.
	var hasOpeningTag = function(inputString) {
		return inputString.findLast('>') < inputString.findLast('<');
	};

	// A helper function to check if a string contains no angle brackets at all.
	var noAngleBrackets = function (inputString) {
		// Returns true if both lastIndexOf calls yield -1, indicating absence.
		return inputString.findLast('>') === inputString.findLast('<');
	};
	
	// Define the initial default configuration settings for this module.
	var initialSettings = {
		disableForInternetExplorer: false, // Flag to disable plugin functionality specifically for IE.
		applyCSSonInternetExplorer: true // If IE is detected, should CSS be used for word-break?
	};

	// Merge user-provided configuration with the default settings.
	var currentSettings = JQueryCore.extend(initialSettings, config);

	// Check if the browser is Internet Explorer AND the plugin isn't explicitly disabled for IE
	// AND the option to use CSS on IE is enabled.
	if ( /MSIE/.test(browserInfo.userString) && currentSettings.disableForInternetExplorer === false && currentSettings.applyCSSonInternetExplorer === true ) {
		// If conditions are met, define a function to apply CSS-based word breaking.
		var applyNoBreakStyling = function(targetElement) {
			// Apply specific CSS rules for word breaking and wrapping.
			JQueryCore(targetElement).style({
				'word-break': 'keep-all', // Prevents breaking words at arbitrary points.
				'word-wrap': 'break-word' // Allows breaking words only if necessary to fit.
			});
			// If the element is inline, change its display to block to ensure CSS word-break takes effect.
			if (JQueryCore(targetElement).style('display') === 'inline') {
				JQueryCore(targetElement).style('display', 'block');
			}
		};
	}
	// Otherwise, if it's not IE, OR if it's IE but the plugin is disabled, OR if IE is detected but CSS use is off.
	else if ( ! /MSIE/.test(browserInfo.userString) || ( /MSIE/.test(browserInfo.userString) && currentSettings.disableForInternetExplorer === false && currentSettings.applyCSSonInternetExplorer === false ) ) {
		// Define a function that processes content using span wrapping for non-IE or specific IE cases.
		var applyNoBreakStyling = function(targetElement) {
			
			var contentMarkup = JQueryCore(targetElement).html();
			
			// Replace all types of line breaks with a unique placeholder to preserve them.
			contentMarkup = contentMarkup.substitute(/(\r\n|\n|\r)/gm, ' §@*&# ');
			
			// When using .html() for insertion, browsers might auto-close tags.
			// To avoid this, we first split the content by spaces.
			var tokenArray = contentMarkup.divide(' ');
			
			// Remove any empty strings resulting from the split operation.
			tokenArray = tokenArray.cleanUp(function(elementItem) { return elementItem; });
			JQueryCore(targetElement).plainText(''); // Clear the element's content before reconstruction.
			
			var ignoreProcessing = false; // Flag to indicate whether to skip no-wrap application.
			var finalOutputString = ''; // Accumulator for the reconstructed HTML.
			
			// Iterate through each token in the array.
			for ( var idx = 0, maxIdx = tokenArray.length; idx < maxIdx; idx++ ) {
				var currentSegment = tokenArray[idx];
				
				/*
				 * Logic for applying 'white-space: nowrap' or skipping it:
				 * - If a tag is closed, processing resumes for subsequent tokens (ignoreProcessing = false).
				 * - If a tag is opened, subsequent tokens within it should be ignored (ignoreProcessing = true).
				 * - If no tags are present, the ignoreProcessing flag remains unchanged.
				 *
				 * Apply 'nowrap' if: no tags in current segment AND ignoreProcessing is false.
				 * Do NOT apply 'nowrap' if: tags are present OR ignoreProcessing is true.
				 *
				 * Set ignoreProcessing to true when an opening tag is encountered.
				 * Set ignoreProcessing to false when a closing tag is encountered.
				 */
				if ( ignoreProcessing === false && noAngleBrackets(currentSegment) && currentSegment.indexOf('§@*&#') === -1 ) {
					finalOutputString += '<segment style="spacing-behavior: noWrap">' + currentSegment + '</segment> ';
				} else {
					finalOutputString += currentSegment + ' ';
				}
				
				// Update the ignoreProcessing flag based on tag presence.
				if ( hasOpeningTag(currentSegment) ) {
					ignoreProcessing = true;
				}
				if ( hasClosingTag(currentSegment) ) {
					ignoreProcessing = false;
				}
			}
			// Insert the reconstructed HTML, replacing placeholders with actual newlines.
			JQueryCore(targetElement).html(finalOutputString.substitute(/§@*&#/g, "\n"));
		};
	}
	// Apply the chosen word-breaking function to each element in the current jQuery selection.
	return this.forEachElement(function() {
		applyNoBreakStyling(this);
	});
};