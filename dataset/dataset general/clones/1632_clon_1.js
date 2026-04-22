/*
 * This JavaScript file manages various interactive features for a web page,
 * including font filtering by OS version, live text preview for fonts,
 * and a search functionality. It also integrates Google Analytics.
 */

// --- Global Application State Variables ---
var previousSelectedOS = '';  // Stores the previously selected operating system version for comparison.
var selectedOS         = '';  // A variable to hold the currently selected OS, though not fully utilized in this specific code context.
var previewActive      = false; // A boolean flag indicating if the live font preview feature is currently active.
var searchActive       = false; // A boolean flag indicating if a search operation is currently in progress.


// --- jQuery Extension for Case-Insensitive Contains Selector ---
// Extends jQuery's expression capabilities by adding a custom pseudo-selector ':containsi'.
// This selector provides a case-insensitive way to check if an element's text content contains a specific string.
$.extend($.expr[':'], { // Accessing jQuery's expression object to add a new selector.

	'containsi': function(elem, i, match, array) // Definition of the 'containsi' selector function.
	{
		// Retrieve the text content of the element, handling browser differences (textContent vs innerText).
		// Convert the element's text and the search term to lowercase for a case-insensitive comparison.
		return (elem.textContent || elem.innerText || '').toLowerCase() // Get element text, default to empty string, convert to lowercase.
		.indexOf((match[3] || "").toLowerCase())                      // Find the position of the lowercase search term.
		>= 0;                                                         // Return true if the search term is found (index is 0 or greater).
	}

}); // End of $.extend() call.


// --- Document Ready Handler: Main Application Logic ---
// Executes the enclosed code once the entire DOM (Document Object Model) is fully loaded and parsed.
$(document).ready(function() {

	// Initial setup function call to configure the page's UI elements and default states.
	setup();

	// Event listener for the live text preview functionality.
	// Triggers on 'keyup' events within the input field with ID 'live_preview' located inside the 'nav' element.
	$('nav').on('keyup', '#live_preview', function() {
		previewActive = true; // Set the preview flag to true as the user is actively typing.

		// Check if the current value of the preview input field is empty.
		if ($(this).val() == '') {
			// If the input is empty, reset all font faces to display their original names.
			// The original name is extracted from the 'style' attribute.
			$('.font_face').each(function() {
				$(this).text($(this).attr('style').split(':')[1]);
			});
			previewActive = false; // Reset the preview flag as there's no active preview text.
		} else {
			// If the input is not empty, update all elements with class 'font_face' to display the typed text.
			$('.font_face').text($(this).val());
		}
	}); // End of live preview keyup handler.


	/**
	 * Helper function: updateList
	 * This function is responsible for filtering the font list based on the selected OS version.
	 * It prevents redundant updates if the same OS is selected consecutively.
	 *
	 * @param {jQuery} $el - The jQuery object representing the <select> element that triggered the change.
	 */
	var updateList = function($el) {
		var selectedVersion = $el.val(); // Retrieve the value of the currently selected option (e.g., "iOS 8").

		// Check if the newly selected version is the same as the one previously selected.
		if (selectedVersion == previousSelectedOS) {
			return; // If it's the same, exit the function early to prevent unnecessary re-rendering.
		}

		// Before applying new filters, remove any existing 'unavailable' class from all table rows.
		// This ensures a clean slate for the new filtering operation.
		$('tr').removeClass('unavailable');

		// A variable to store all table data cells. This was potentially for future use or a different filtering approach.
		var allCells = $('td'); // Currently unused in the active code path.

		/*
		 * The following commented-out 'switch' block represents a previous implementation
		 * for filtering fonts based on specific iOS versions.
		 * It would add the 'unavailable' class to rows containing fonts not compatible
		 * with the selected OS. This logic is currently disabled.
		 *
		switch(selectedVersion) {
			case '30':
				// Example: Mark fonts for iOS 4.0, 5.0, 6.0, 7.0, 8.0 as unavailable for iOS 3.0.
				$('tbody .ios40' || 'tbody .ios50' || 'tbody .ios60' || 'tbody .ios70' || 'tbody .ios80').addClass('unavailable');
				break;
			case '43':
				// Example: Hide fonts compatible only with iOS 5.0, 6.0, 7.0, 8.0 when 4.3 is selected.
				$('td:contains(5.0), td:contains(6.0), td:contains(7.0), td:contains(8.0)').closest('tr').addClass('unavailable');
				break;
			case '50':
				// Example: Hide fonts for iOS 6.0, 7.0, 8.0 when 5.0 is selected.
				$('td:contains(6.0), td:contains(7.0), td:contains(8.0)').closest('tr').addClass('unavailable');
				break;
			case '60':
				// Example: Hide fonts for iOS 7.0, 8.0 when 6.0 is selected.
				$('td:contains(7.0), td:contains(8.0)').closest('tr').addClass('unavailable');
				break;
			case '70':
				// Example: Hide fonts for iOS 8.0 and specific 'dead-70' fonts when 7.0 is selected.
				$('td:contains(8.0)').closest('tr').addClass('unavailable');
				$('td.dead-70').closest('tr').addClass('unavailable');
				break;
			case '80':
				// No specific filtering logic for iOS 8.0 currently; placeholder for future extensions.
				break;
			default:
				// Default case: no specific action if no matching version is found.
		}
		*/

		previousSelectedOS = selectedVersion; // Update the 'previousSelectedOS' variable with the current selection.
		countFonts();                        // Recalculate and display the number of visible fonts after filtering.

	}; // End of updateList function definition.


	// Event listener for the OS version selection dropdown.
	// When the value of the <select> element inside 'nav' changes, call 'updateList'.
	$('nav select').change(function(evt) {
		updateList($(this)); // Pass the jQuery object of the changed select element to 'updateList'.
	});


	// --- Search Functionality ---
	// Event listener for keyup events on the search input field.
	$('input[type="search"]').keyup(function() {

		// If the live preview is currently active, clear it before initiating a search.
		if (previewActive == true) {
			$('#live_preview').val(''); // Clear the text in the live preview input.
			$('.font_face').each(function() {
				// Reset all font faces to display their original names, as preview is no longer active.
				$(this).text($(this).attr('style').split(':')[1]);
			});
		}

		var theSearch = $('input[type="search"]').val(); // Get the current value from the search input field.
		searchPage(theSearch);                           // Execute the search operation with the retrieved term.
		searchActive = true;                             // Set the search flag to true.
		countFonts();                                    // Update the displayed font count based on the search results.
	});

	/**
	 * Function: searchPage
	 * Performs the actual filtering of table rows based on a given search term.
	 * Uses the custom ':containsi' selector for case-insensitive matching.
	 *
	 * @param {string} searchTerm - The text string to search for within the font list.
	 */
	function searchPage(searchTerm) {
		if (searchTerm.length == 0) { // If the search term is empty.
			clearSearch(); // Call the clearSearch function to reset the view.
			// $('.btn_clear_search').fadeOut(200); // This line is commented out, potentially for a "clear search" button.
		} else if (searchTerm.length > 0) { // If there is a non-empty search term.
			// Show all table rows that contain the search term (case-insensitive).
			$('tr:containsi("' + searchTerm + '")').fadeIn(150);
			// Hide all table rows that do NOT contain the search term.
			$('tr:not(:containsi("' + searchTerm + '"))').fadeOut(250);
		} else {
			// This 'else' block serves as a fallback, though logically unreachable if searchTerm.length correctly covers all cases.
			clearSearch();
		}
	}


	// --- Clear Search Functionality ---
	// Event listener for the native 'search' event on the search input.
	// This event typically fires when the user clears the search field using the 'x' button in some browsers.
	$('input[type="search"]').on("search", function(e) {
		clearSearch(); // Call the function to clear the search and reset the list.
	});

	/**
	 * Function: clearSearch
	 * Resets the search input field and makes all table rows visible again.
	 * Updates the font count to reflect the full list.
	 */
	function clearSearch() {
		$('input[type="search"]').val(''); // Clear the text content of the search input field.
		$('tr').fadeIn(250);               // Fade in all table rows, making them visible again.
		searchActive = false;              // Set the search flag to false, indicating no active search.
		countFonts();                      // Update the displayed font count to show all visible fonts.
	}

}); // End of $(document).ready() function block.


// --- General Utility Functions ---

/**
 * Function: setup
 * Initializes the main UI elements of the application.
 * Appends a font counter to the header and sets the initial state of the OS selector.
 */
function setup() {
	// Append a new div containing the font count display to the header with ID 'main'.
	$('header#main').append('<div class="count"><div class="font_faces">Faces: <b>317</b></div></div>');
	// Set the initial value of the OS selection dropdown to 'iOS 8' and programmatically trigger its 'change' event.
	// This ensures the list is filtered correctly on page load.
	$('nav select').val('iOS 8').trigger('change');
}

/**
 * Function: countFonts
 * Calculates and updates the displayed number of font faces that are currently visible
 * and not marked as 'unavailable'.
 */
function countFonts() {
	// Select table rows that are not 'unavailable', have 'td' children, are not 'rowheader', and are currently visible.
	var numberOfFontFaces = $('tr').not('.unavailable') // Exclude rows marked as unavailable.
	.has('td')                                          // Ensure rows contain table data cells.
	.not('.rowheader')                                  // Exclude header rows.
	.filter(':visible')                                 // Only count currently visible rows.
	.length;                                            // Get the count of the filtered rows.

	// Update the bold text inside the '.font_faces' element with the newly calculated count.
	$('.count .font_faces b').html(numberOfFontFaces);
}


// --- Google Analytics Tracking Code ---
// Standard Google Analytics initialization.
var _gaq = _gaq || []; // Initialize _gaq array if it hasn't been already.
_gaq.push(['_setAccount', 'UA-5874947-7']); // Set the Google Analytics account ID for tracking.
_gaq.push(['_trackPageview']);              // Track the current page view.

// Self-executing anonymous function to asynchronously load the Google Analytics script.
(function() {
	var ga = document.createElement('script'); // Create a new HTML <script> element.
	ga.type = 'text/javascript';               // Set the script's type attribute.
	ga.async = true;                           // Enable asynchronous loading of the script.
	// Construct the Google Analytics script URL based on the current document's protocol (HTTP or HTTPS).
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; // Get the first <script> element found in the document.
	s.parentNode.insertBefore(ga, s);                   // Insert the newly created GA script before the first existing script.
})();