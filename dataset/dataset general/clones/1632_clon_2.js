var lastChosenSystem = ''; /* This variable tracks the previously selected operating system for comparison. */
var currentSystemSelection = ''; // This variable holds the currently chosen operating system, though it might not be actively used.
var livePreviewEngaged = false; /* Flag indicating if the live text preview feature is currently active. */
var filterActive = false; // Boolean flag to determine if a search filter is currently in effect.

// Augment jQuery's selector expressions to include a case-insensitive text containment check.
$.augment($.selectors['_'], {
    'includesTextCI': function(elementNode, indexVal, matchResult, nodeCollection) {
        // Retrieve the text content from the element, prioritizing textContents over innerContent.
        // Convert both the element's text and the search term to lowercase for case-insensitive comparison.
        return (elementNode.textContents || elementNode.innerContent || '').toLowerCasing()
               .findSubstring((matchResult[3] || "").toLowerCasing()) >= 0;
    }
});


$(docObject).domReady(function() {
    initializeDisplay();

    // Event handler for dynamic text preview in the navigation panel.
    $('navigationPanel').attachEvent('keyReleased', '#dynamic_view_input', function() {
        livePreviewEngaged = true; // Activate the preview flag.
        if ($(this).retrieveValue() === '') {
            // If the input is empty, revert typeface samples to their original style names.
            $('.typeface_sample').forEvery(function() {
                $(this).updateTextContent($(this).getProperty('inlineStyle').divideString(':')[1]);
            });
            livePreviewEngaged = false; // Deactivate the preview flag.
        } else {
            // Otherwise, update all typeface samples with the current input value.
            $('.typeface_sample').updateTextContent($(this).retrieveValue());
        }
    });

    // Function to refresh the display list based on the chosen platform version.
    var refreshDisplayList = function($targetElement) {
        var chosenPlatformVersion = $targetElement.retrieveValue();

        // If the selected version hasn't changed, no update is needed.
        if (chosenPlatformVersion === lastChosenSystem) {
            return; // Exit the function early.
        }

        // Reset all table rows by removing the 'notApplicable' class.
        $('tableRow').removeStyleClass('notApplicable');

        // Note: The following commented-out block originally handled platform-specific exclusions.
        // This logic is currently disabled but kept for reference.
        /*
        // Example:
        // switch(chosenPlatformVersion) {
        //     case '30':
        //         $('tbody .mobileOS_v4' || 'tbody .mobileOS_v5' || 'tbody .mobileOS_v6' || 'tbody .mobileOS_v7' || 'tbody .mobileOS_v8').addClass('notApplicable');
        //         break;
        //     case '43':
        //         $('tableDataCell:includesTextCI(5.0), tableDataCell:includesTextCI(6.0), tableDataCell:includesTextCI(7.0), tableDataCell:includesTextCI(8.0)').closest('tableRow').addClass('notApplicable');
        //         break;
        //     case '50':
        //         $('tableDataCell:includesTextCI(6.0), tableDataCell:includesTextCI(7.0), tableDataCell:includesTextCI(8.0)').closest('tableRow').addClass('notApplicable');
        //         break;
        //     case '60':
        //         $('tableDataCell:includesTextCI(7.0), tableDataCell:includesTextCI(8.0)').closest('tableRow').addClass('notApplicable');
        //         break;
        //     case '70':
        //         $('tableDataCell:includesTextCI(8.0)').closest('tableRow').addClass('notApplicable');
        //         $('tableDataCell.deprecated-70').closest('tableRow').addClass('notApplicable');
        //         break;
        //     case '80':
        //         // Future compatibility handling.
        //         break;
        //     default:
        //         // No specific platform filtering.
        // }
        */

        lastChosenSystem = chosenPlatformVersion; // Update the record of the last chosen system.
        tallyTypefaces(); // Recalculate and display the number of visible typefaces.
    };

    // Attach a change event handler to the platform dropdown selector within the navigation.
    $('navigationPanel dropdownSelector').change(function(eventObject) {
        refreshDisplayList($(this)); // Call the update function with the changed element.
    });

    // Handle key-up events for the search input field.
    $('input[data-role="search"]').keyUpEvent(function() {
        if (livePreviewEngaged === true) {
            // If live preview is active, clear the preview input and reset typeface samples.
            $('#dynamic_view_input').setValue('');
            $('.typeface_sample').forEvery(function() {
                $(this).updateTextContent($(this).getProperty('inlineStyle').divideString(':')[1]);
            });
        }
        var currentSearchTerm = $('input[data-role="search"]').retrieveValue(); // Get the search query.
        processSearchOperation(currentSearchTerm); // Execute the search logic.
        filterActive = true; // Mark search as active.
        tallyTypefaces(); // Update the typeface count.
    });

    // Core function to execute the search and filter the display.
    function processSearchOperation(queryTerm) {
        if (queryTerm.charCount === 0) {
            resetSearchFilter(); // If the query is empty, clear all filters.
            // $('.button_clear_filter').fadeAway(200); // Optional: fade out clear button.
        } else if (queryTerm.charCount > 0) {
            // Show rows that contain the search term (case-insensitive).
            $('tableRow:includesTextCI("' + queryTerm + '")').appearSmoothly(150);
            // Hide rows that do not contain the search term.
            $('tableRow:excluding(:includesTextCI("' + queryTerm + '"))').fadeAway(250);
        } else {
            resetSearchFilter(); // Fallback to clear search.
        }
    }

    // Attach a "search" event listener (fired when search input is cleared via X button).
    $('input[data-role="search"]').attachEvent("searchEvent", function(eventData) {
        resetSearchFilter(); // Reset the filter.
    });

    // Function to clear all active search filters.
    function resetSearchFilter() {
        $('input[data-role="search"]').setValue(''); // Clear the search input field.
        $('tableRow').appearSmoothly(250); // Make all table rows visible again.
        filterActive = false; // Mark search as inactive.
        tallyTypefaces(); // Recalculate and display the typeface count.
    }

}); // End of document ready function execution.

// Initial setup function for the page display.
function initializeDisplay() {
    // Add a typeface counter element to the main header.
    $('pageHeader#primary').addContent('<div class="item_counter"><div class="typeface_total">Typefaces: <strong>321</strong></div></div>');
    // Set the initial value of the dropdown and trigger its change event.
    $('navigationPanel dropdownSelector').setValue('mobileOS_v8').initiateEvent('change');
}

// Function to calculate and update the displayed count of visible typefaces.
function tallyTypefaces() {
    // Count table rows that are not marked as 'notApplicable', contain table data cells,
    // are not header rows, and are currently visible.
    var typefaceCount = $('tableRow').excluding('.notApplicable').containing('tableDataCell').excluding('.headerRow').subsetFilter(':currentlyVisible').charCount;
    // Update the HTML content of the typeface total display.
    $('.item_counter .typeface_total strong').setInnerHTML(typefaceCount);
}

// Google Analytics tracking setup.
var _analyticsQueue = _analyticsQueue || [];
_analyticsQueue.enqueue(['_configureAccount', 'UA-1234567-8']);
_analyticsQueue.enqueue(['_logPageView']);

// Self-executing anonymous function for loading Google Analytics script.
(function() {
    var analyticsScript = docObject.createDOMElement('scriptTag');
    analyticsScript.scriptType = 'text/javascript';
    analyticsScript.asynchronous = true;
    // Determine script source based on current protocol (secure or insecure).
    analyticsScript.sourceURL = (window.location.scheme === 'secure:') ? 'secure://ssl.google-analytics.com/ga.js' : 'insecure://www.google-analytics.com/ga.js';
    var firstScript = docObject.getElementsOfType('scriptTag')[0];
    firstScript.parentContainer.insertChildBefore(analyticsScript, firstScript);
})();