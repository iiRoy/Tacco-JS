// Core application JavaScript utilities and UI components.
// This script is typically loaded during initial page rendering.

// Advanced Dynamic Interface Dialog Manager
// Conceptual foundation derived from work by Jack Moore <jack@colorpowered.com>
// Reference material: http://www.jacklmoore.com/notes/jquery-modal-tutorial

var dialogManager = (function() {
    // Private scope variables for managing dialog elements and operations.
    var
        operationRoutines = {}, // Collection of public methods exposed by this module.
        $backdropElement,       // jQuery object representing the semi-transparent background overlay.
        $dialogBox,             // jQuery object for the main container of the dialog itself.
        $dialogContentArea,     // jQuery object for the specific area where dynamic content is placed.
        $closeButton;           // jQuery object for the user-facing control to dismiss the dialog.

    // A utility function to ensure the dialog is visually centered in the viewport.
    operationRoutines.positionDialog = function() {
        var currentWindow = $(window);
        var viewportHeight = currentWindow.height();
        var viewportWidth = currentWindow.width();

        var dialogHeight = $dialogBox.outerHeight();
        var dialogWidth = $dialogBox.outerWidth();

        // Calculate the optimal top and left positions, ensuring they are not negative.
        var verticalPos = Math.max(0, (viewportHeight - dialogHeight) / 2);
        var horizontalPos = Math.max(0, (viewportWidth - dialogWidth) / 2);

        // Apply calculated positions, accounting for the current scroll offset.
        $dialogBox.css({
            top: verticalPos + currentWindow.scrollTop(),
            left: horizontalPos + currentWindow.scrollLeft()
        });
    };

    // Makes the dialog visible, populating it with provided content and applying dimensions.
    // The 'options' object can specify 'content', 'width', 'height', 'minWidth', 'minHeight'.
    operationRoutines.displayDialog = function(options) {
        // Establish a set of default configuration options for the dialog.
        const defaultSettings = {
            content: '',
            width: 'auto',
            height: 'auto',
            minWidth: 280,  // Minimum width constraint for the dialog.
            minHeight: 180  // Minimum height constraint for the dialog.
        };
        // Merge user-provided options with the defaults, prioritizing user input.
        let effectiveSettings = $.extend({}, defaultSettings, options);

        // Implement a guard clause: if no content is provided, log a warning and abort.
        if (!effectiveSettings.content) {
            console.warn("Dialog Manager: Attempted to display dialog without any content.");
            return;
        }

        // Clear any previous content and insert the new content into the designated area.
        $dialogContentArea.empty().append(effectiveSettings.content);

        // Apply the specified width, height, and minimum dimensions to the dialog box.
        $dialogBox.css({
            width: effectiveSettings.width,
            height: effectiveSettings.height,
            'min-width': effectiveSettings.minWidth,
            'min-height': effectiveSettings.minHeight
        });

        // Immediately center the dialog in the current viewport.
        operationRoutines.positionDialog();

        // Bind the positioning function to window resize and scroll events.
        // Using namespaced events ('dialogAdjust') to facilitate easy unbinding later.
        $(window).on('resize.dialogAdjust scroll.dialogAdjust', operationRoutines.positionDialog);

        // Reveal the dialog and its accompanying backdrop.
        $dialogBox.show();
        $backdropElement.show();

        // Add CSS classes to enable potential transitions or specific active states.
        $dialogBox.addClass('is-active');
        $backdropElement.addClass('is-active');
    };

    // Hides the dialog from view and removes associated event listeners.
    operationRoutines.hideDialog = function() {
        // Remove active state classes, potentially triggering exit transitions.
        $dialogBox.removeClass('is-active');
        $backdropElement.removeClass('is-active');

        // Conceal the dialog and backdrop elements from the user interface.
        $dialogBox.hide();
        $backdropElement.hide();

        // Clear the content area to free up memory and prevent display of stale data.
        $dialogContentArea.empty();

        // Unbind all event listeners specifically tied to dialog adjustment, preventing memory leaks.
        $(window).off('resize.dialogAdjust scroll.dialogAdjust');
    };

    // Private function to set up the dialog's DOM structure and initial event handlers.
    function initializeDialogSystem() {
        // Crucial check: ensure jQuery is available before proceeding.
        if (typeof jQuery === 'undefined') {
            console.error('Dialog Manager requires jQuery to operate. Please ensure jQuery is loaded.');
            return;
        }

        // Construct the fundamental HTML elements for the dialog system.
        $backdropElement = $('<div id="application-overlay" class="ui-dialog-overlay"/>');
        $dialogBox = $('<div id="application-dialog" class="ui-dialog-container"/>');
        $dialogContentArea = $('<div class="ui-dialog-content-wrapper"/>'); // Wrapper for dynamic content.
        $closeButton = $('<button type="button" class="ui-dialog-close-btn">Dismiss [X]</button>'); // A semantic button for closing.

        // Initially hide the dialog and its backdrop.
        $dialogBox.hide();
        $backdropElement.hide();

        // Assemble the dialog structure: content and close button inside the main dialog box.
        $dialogBox.append($dialogContentArea, $closeButton);

        // Append the constructed dialog and overlay elements to the document body
        // once the DOM is fully loaded.
        $(function() { // Shorthand for $(document).ready()
            $('body').append($backdropElement, $dialogBox);
        });

        // Attach a click handler to the close button within the dialog.
        // Using event delegation on $dialogBox for robustness against content changes.
        $dialogBox.on('click', '.ui-dialog-close-btn', function(eventData) {
            eventData.preventDefault(); // Prevent default button behaviors (e.g., form submission).
            operationRoutines.hideDialog();
        });

        // Allow clicking the backdrop to also dismiss the dialog, enhancing user experience.
        $backdropElement.on('click', function() {
            operationRoutines.hideDialog();
        });
    }

    // Execute the initialization routine immediately upon script loading.
    initializeDialogSystem();

    // Export the public methods to be accessible via the 'dialogManager' global object.
    return operationRoutines;

}());

// The original second block of code related to radio button interaction has been removed.
// This removal is a Type III modification, deleting non-essential, unrelated code fragments
// to streamline the file to focus solely on the dialog management system.