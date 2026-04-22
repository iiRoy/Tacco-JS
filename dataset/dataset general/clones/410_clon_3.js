/*
 * JQ.FileBeautifier.js
 * -------------------------------------------------------------
 * A jQuery-based utility for enhancing the visual presentation
 * of standard HTML file input elements.
 *
 * This script provides a CSS-friendly wrapper for <input type="file">,
 * making it easier to customize its appearance across different browsers.
 *
 * License: MIT - Use, modify, and distribute freely.
 *
 * Inspired by prior work on file input styling techniques.
 */
(function($) {
    // Define default configuration options for the plugin.
    const defaultBeautifierOptions = {
        buttonText: 'Select File...', // Default text for the custom button
        displayFullPath: false,       // Flag to show the full file path or just the filename
        customClass: ''               // Optional class to add to the main wrapper
    };

    /**
     * Helper function to generate a unique identifier.
     * @returns {string} A string representing a unique ID.
     */
    function generateUniqueInputId() {
        // Using a combination of timestamp and a larger random number for uniqueness.
        const timestamp = Date.now();
        const randomNumber = Math.floor(Math.random() * 987654);
        return `fb_${timestamp}_${randomNumber}`;
    }

    $.fn.decorateFileUpload = function(userConfig) {
        // Validate input: Ensure a jQuery object is present.
        if (this.length === 0) {
            console.warn("decorateFileUpload: No elements selected to apply styling.");
            return this; // Return the original jQuery object to maintain chainability.
        }

        // Merge user-provided configuration with default settings.
        // Ensure userConfig is an object to prevent errors during $.extend.
        const pluginConfiguration = $.extend({}, defaultBeautifierOptions, typeof userConfig === 'object' ? userConfig : {});

        // Iterate over each selected file input element.
        return this.each(function() {
            const originalInput = $(this); // Reference to the current native file input.

            // Check if the element has already been processed to prevent re-initialization.
            // Using a different data attribute name.
            if (originalInput.data('file-enhanced')) {
                // If already enhanced, skip this element.
                return;
            }

            // Generate a unique ID for this specific file input instance.
            const instanceIdentifier = generateUniqueInputId();

            // Create the visible text input field to display the selected file name.
            const fileNameDisplay = $('<input type="text" readonly="readonly">')
                .css({
                    'display': 'block', // This will be treated as a flex item
                    'margin': '0px',
                    'padding': '2px 8px', // Slightly different padding
                    'box-sizing': 'border-box', // Added box-sizing
                    'min-width': '100px' // Ensure it has a minimum width
                })
                .addClass(`fb-display-name fb-instance-${instanceIdentifier}`);

            // Create the custom button wrapper that will overlay the real input.
            const customButton = $("<span>") // Changed from <div> to <span> for potential inline-block usage
                .css({
                    'overflow': 'hidden',
                    'position': 'relative',
                    'display': 'inline-block', // This will be treated as a flex item
                    'white-space': 'nowrap',
                    'text-align': 'center',
                    'vertical-align': 'middle', // Added vertical alignment
                    'cursor': 'pointer',
                    'padding': '2px 10px' // Slightly different padding
                })
                .addClass(`fb-action-button fb-instance-${instanceIdentifier}`)
                .html(pluginConfiguration.buttonText);

            // Insert the display field before the original input and wrap the original input
            // with the custom button.
            originalInput.before(fileNameDisplay);
            originalInput.wrap(customButton);

            // Now wrap both the display field and the custom button (which contains the original input)
            // into a main container.
            $(`.fb-instance-${instanceIdentifier}`).wrapAll(`<div class="fb-main-container" id="fb-container-${instanceIdentifier}" />`);

            // Apply styles to the main container.
            const mainContainer = $(`#fb-container-${instanceIdentifier}`);
            mainContainer.css({
                'overflow': 'hidden',
                'display': 'inline-flex', // Changed from inline-block to inline-flex for better alignment
                'align-items': 'stretch' // Ensure children stretch vertically
            });

            // If a custom class was provided in the configuration, add it to the main container.
            if (pluginConfiguration.customClass) {
                mainContainer.addClass(pluginConfiguration.customClass);
            }

            // Copy original classes to the new main container, if desired.
            // This copies classes from the original input to the new visual container.
            const originalClasses = originalInput.attr("class");
            if (originalClasses) {
                mainContainer.addClass(originalClasses);
            }

            // Style the original file input to make it invisible but still functional.
            originalInput
                .css({
                    'opacity': 0,
                    'position': 'absolute',
                    'border': 'none',
                    'margin': '0px',
                    'padding': '0px',
                    'top': '0px',
                    'right': '0px',
                    'cursor': 'pointer',
                    'height': '100%', // Use 100% height relative to its parent (customButton)
                    'width': '100%',  // Use 100% width
                    'font-size': '999px', // Large font size to ensure it covers the button area
                    'z-index': 1        // Ensure it's above the button text
                })
                .addClass('fb-invisible-input');

            // Attach the change event handler to update the displayed file name.
            originalInput.on("change", function() {
                let selectedFilePath = $(this).val(); // Use 'this' as it's within the event context.

                // Determine whether to show the full path or just the filename.
                if (pluginConfiguration.displayFullPath) {
                    fileNameDisplay.val(selectedFilePath);
                } else {
                    // Split the path by common directory separators and get the last segment.
                    const pathSegments = selectedFilePath.split(/[\\/]/);
                    const actualFileName = pathSegments[pathSegments.length - 1];
                    fileNameDisplay.val(actualFileName);
                }
            });

            // Mark the original input as enhanced to prevent re-processing.
            originalInput.data('file-enhanced', true);
        });
    };
})(jQuery);