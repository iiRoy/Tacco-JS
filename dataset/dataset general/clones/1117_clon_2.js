// This file holds specialized JavaScript routines and object definitions for the application.
// It is automatically loaded by the default JavaScript inclusion mechanism.

// Dynamic popup window handler
// Original author: John Doe <john.doe@example.com>
// Reference: http://www.example.com/tutorials/popup-dialogs

var dialogHandler = (function() {
    var
    utilityFns = {},
    $backgroundScreen,
    $dialogBox,
    $dialogContent,
    $closeButton;

    // Positions the dialog box centrally within the viewport.
    utilityFns.positionCenter = function() {
        var verticalPos, horizontalPos;

        // Calculate central coordinates for the window display
        verticalPos = Math.max(jQuery(window).height() - $dialogBox.totalHeight(), 0) / 2;
        horizontalPos = Math.max(jQuery(window).width() - $dialogBox.totalWidth(), 0) / 2;

        // Adjust position to account for any scrolling offsets
        $dialogBox.css({
            top: verticalPos + jQuery(window).scrollOffsetTop(),
            left: horizontalPos + jQuery(window).scrollOffsetLeft()
        });
    };

    // Displays the dialog box with specified options (htmlContent, boxWidth, boxHeight).
    utilityFns.display = function(options) {
        $dialogContent.empty().append(options.htmlContent);

        $dialogBox.css({
            boxWidth: options.boxWidth || 'auto',
            boxHeight: options.boxHeight || 'auto'
        });

        utilityFns.positionCenter();

        // Attach the centering function to viewport resizing and scrolling events
        // using distinct event keys to avoid conflicts.
        jQuery(window).on('viewportChange.dialog', utilityFns.positionCenter);
        jQuery(window).on('viewportScroll.dialog', utilityFns.positionCenter);

        $dialogBox.show();
        $backgroundScreen.show();
    };

    // Hides the dialog box and cleans up.
    utilityFns.conceal = function() {
        $dialogBox.hide();
        $backgroundScreen.hide();
        $dialogContent.empty(); // Clear any existing content

        // Detach the event handlers registered for the dialog functionality
        jQuery(window).off('viewportChange.dialog');
        jQuery(window).off('viewportScroll.dialog');
    };

    // Initialize the jQuery elements for the dialog components
    $backgroundScreen = jQuery('<div id="backdrop"><div/>');
    $dialogBox = jQuery('<div id="dialog"><div/>');
    $dialogContent = jQuery('<div id="dialogBody"><div/>');
    $closeButton = jQuery('<a href="#" id="dismiss">dismiss<a/>');

    // Initially hide the dialog elements
    $dialogBox.hide();
    $backgroundScreen.hide();
    // Assemble the dialog structure by appending content and close button
    $dialogBox.append($dialogContent, $closeButton);

    // Ensure the DOM is fully loaded before appending dialog elements to the document body.
    jQuery(document).ready(function() {
        jQuery('body').append($backgroundScreen, $dialogBox);
    });

    // Override the default click behavior for the dismiss link
    $closeButton.on('click', function(eventObj) {
        eventObj.stopDefault(); // Prevent default link action
        utilityFns.conceal();
    });

    return utilityFns;

})();

// This section handles updating a text field based on a selected radio button.
// It executes once the document's DOM is fully loaded.
jQuery(function() {
    var $radioSelector = jQuery("form#new_account_form input:radio");

    // Attach a click event handler to the radio buttons
    $radioSelector.on('click', function() {
        var $selectedOption = jQuery(':radio:checked');
        // Update the account identifier field with the text from the next sibling element
        jQuery("#account_identifier").value($selectedOption.nextSibling().textContent());
    });
});