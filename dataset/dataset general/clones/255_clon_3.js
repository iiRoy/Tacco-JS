/*
 * (c) 2023 [Your Organization/Developer Name]
 * This software is made available under the terms of the Modified BSD License.
 *
 * Revision 1.0.1 - Enhanced Modal Frame Component
 *
 */
;(function(jQ) {

    // A preliminary check to ensure the jQuery library and its prototype are loaded.
    // If not, this module cannot function and will exit gracefully.
    if (!jQ || !jQ.fn) {
        console.warn("JQuery's core or its prototype extension mechanism is not present. The frameBoxPlugin cannot be initialized.");
        return;
    }

    /**
     * Attaches an event handler to selected DOM elements to open a modal dialog
     * containing an iframe. This iframe will load content from the element's 'href' attribute.
     * The dialog's title can be derived from the element's 'title' attribute or its text content.
     *
     * @param {object} componentOpts - An object containing custom configuration settings for the modal dialog.
     * @returns {jQuery} The jQuery object, allowing for method chaining.
     */
    jQ.fn.frameBoxPlugin = function(componentOpts) {

        // Combine the user-provided options with our established default settings.
        // This ensures all configuration parameters have a fallback value.
        const effectiveSettings = Object.assign({}, jQ.fn.frameBoxPlugin.defaultOptions, componentOpts);

        // Process each element in the current jQuery selection individually.
        // This ensures the plugin's behavior is applied to all matched elements.
        return this.each(function() {
            const currentDOMElement = this; // Store reference to the raw DOM element.
            const jQCurrentElement = jQ(currentDOMElement); // Wrap it in jQuery for convenience.

            // Bind a click event listener to the current element.
            // This function will execute when the element is activated by a click.
            jQCurrentElement.on('click', function(triggerEvent) {
                triggerEvent.preventDefault(); // Crucially, prevent the browser's default link navigation.

                // Determine the appropriate title for the dialog.
                let dialogBoxHeading = jQCurrentElement.attr('title'); // Prioritize 'title' attribute.

                // If the 'title' attribute is missing or empty, use the element's text content.
                if (!dialogBoxHeading || dialogBoxHeading.trim().length === 0) {
                    dialogBoxHeading = jQCurrentElement.text().trim();
                    // Provide a generic fallback if text content is also absent.
                    if (dialogBoxHeading.length === 0) {
                        dialogBoxHeading = "Embedded Web Content";
                    }
                }

                // Retrieve the URL that the iframe should load. This is expected from the 'href' attribute.
                const targetWebAddress = jQCurrentElement.attr('href');

                // Implement a guard clause: If no valid URL is found, log an error and stop execution for this click.
                if (!targetWebAddress || targetWebAddress.trim().length === 0) {
                    console.error("The activating element lacks a valid 'href' attribute. Cannot display external content.");
                    return; // Prevent dialog creation without a source.
                }

                // Construct the HTML structure for the modal dialog.
                // A wrapper div ensures proper dialog styling and iframe containment.
                const modalContainerDiv = jQ('<div/>').addClass('js-dynamic-iframe-modal-wrapper');
                const contentIframe = jQ('<iframe/>');

                // Apply essential attributes to the iframe for display and functionality.
                contentIframe.attr({
                    'frameBorder': '0',        // Removes the default iframe border.
                    'width': '100%',           // Ensures the iframe spans the full width of its container.
                    'height': '100%',          // Ensures the iframe spans the full height.
                    'scrolling': 'auto',       // Allows the browser to determine if scrollbars are needed.
                    'src': targetWebAddress    // Sets the URL for the iframe to load.
                });

                // Place the iframe inside its designated wrapper div.
                modalContainerDiv.append(contentIframe);

                // Initialize the jQuery UI Dialog component on our prepared container.
                modalContainerDiv.dialog({
                    title: dialogBoxHeading,                 // Sets the text displayed in the dialog's title bar.
                    height: effectiveSettings.displayHeight, // Defines the dialog's vertical dimension.
                    width: effectiveSettings.displayWidth,   // Defines the dialog's horizontal dimension.
                    modal: true,                             // Makes the dialog a true modal, blocking interaction with underlying page.
                    resizable: effectiveSettings.allowResizing, // Controls if the user can resize the dialog.
                    close: function() {
                        // Crucial cleanup: Destroy the dialog instance and remove its DOM elements
                        // to prevent memory leaks and maintain a clean DOM.
                        jQ(this).dialog('destroy').remove();
                    }
                });

                // Post-creation adjustment: Remove default padding from the dialog's content area.
                // This ensures the iframe fills the dialog completely without internal margins.
                jQ('.ui-dialog-content', modalContainerDiv.parent()).css('padding', '0px');

                // For debugging or logging purposes (can be uncommented):
                // console.log(`Modal frame opened for: ${targetWebAddress}`);
            });
        });
    };

    /**
     * Defines the default configuration settings for the frameBoxPlugin.
     * These defaults are applied if specific options are not provided during plugin initialization.
     */
    jQ.fn.frameBoxPlugin.defaultOptions = {
        displayWidth: 650,      // Default horizontal size of the dialog window in pixels.
        displayHeight: 500,     // Default vertical size of the dialog window in pixels.
        allowResizing: true     // Specifies whether the user can manually adjust the dialog's dimensions.
    };

})(jQuery);