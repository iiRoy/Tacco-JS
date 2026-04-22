/*
 *  ==============================================================
 *  Responsive Prototype Tool - Version 1.0.0
 *  A utility crafted to assist developers in testing and modifying
 *  responsive web design prototypes directly within the browser environment.
 *  More information: http://git.io/mqhP-w
 *
 *  Authored by: Michael Lancaster
 *  Licensed under the MIT License.
 *  --------------------------------------------------------------
 *  This file contains core functionalities for UI enhancements.
 */


// This section encapsulates the logic for enabling content editable features
// and applying visual highlighting to designated DOM elements.
// The functionality is provided as a jQuery plugin.
( function ( $ ) {

	$.fn.editableText = function ( element ) {
		return this . each ( function () {

			// Iterate over each selected element to apply attributes
			$( this ) . each ( function () {

				// Make the element's content directly editable by the user
				$( this ) . attr ( 'contenteditable', 'true' );
				// Apply a subtle border for visual indication of editability
				$( this ) . css ( 'border', '1px solid rgba(0, 0, 0, 0.3)' );

			} ); // End of inner each()
		} ); // End of outer each()
	}; // End of $.fn.editableText definition

} ) ( jQuery ); // Immediately Invoked Function Expression (IIFE) for scope isolation


// This module provides a jQuery plugin for handling drag-and-drop image uploads.
// It allows users to drag image files onto specific elements, which then update
// their 'src' attribute to display the dropped image.
( function ( $ ) {

	$.fn.dragNdropImage = function ( element ) {
		return this . each ( function () {

			// The inner loop ensures that each individual element is processed.
			$( this ) . each ( function () {

				// 'dataTransfer' property is essential for accessing files
				// when using the HTML5 Drag and Drop API.
				jQuery . event . props . push ( 'dataTransfer' );

				// Attach a 'drop' event listener to the current element.
				$( this ) . on ( 'drop', function ( event ) {

					// Prevent the default browser behavior (e.g., opening the file).
					event . preventDefault ();

					// Extract the dropped file(s) from the event's dataTransfer object.
					var elImg = event . dataTransfer . files,
						// Create a URL for the first dropped image file.
						imgURL = window . URL . createObjectURL ( elImg[0] );

					// Update the 'src' attribute of the element to display the new image.
					$( this ) . attr ( 'src', imgURL );

				} ); // End of 'drop' event handler

				// Attach a 'dragover' event listener to provide visual feedback.
				$( this ) . on ( 'dragover', function ( event ) {

					// Change opacity to indicate the element is a valid drop target.
					$( this ) . css ( 'opacity', '0.5' );
					// Return false to prevent default handling and allow dropping.
					return false ;
				} ); // End of 'dragover' event handler

				// Attach a 'dragleave' event listener to revert visual feedback.
				$( this ) . on ( 'dragleave', function ( event ) {

					// Restore original opacity when the drag operation leaves the element.
					$( this ) . css ( 'opacity', '1' );
					// Return false to prevent default handling.
					return false ;
				} ); // End of 'dragleave' event handler

			} ); // End of inner each()
		} ); // End of outer each()
	}; // End of $.fn.dragNdropImage definition

} ) ( jQuery ); // IIFE for drag-and-drop functionality


// This block executes once the DOM (Document Object Model) is fully loaded.
// It's a shorthand for $(document).ready(function() { ... });
$( function () {

	// Initialize the 'editableText' plugin on all paragraph and heading 4 elements.
	// This enables users to directly edit the content of these elements in the browser.
	$( 'p, h4' ) . editableText ();

	// Initialize the 'dragNdropImage' plugin on all image elements.
	// This allows users to drag and drop image files onto <img> tags to change their source.
	$( 'img' ) . dragNdropImage ();

} ); // End of document ready function