// This module manages the interaction with the WordPress media library,
// enabling users to select and embed image assets into application forms.
// It is designed to be robust, extensible, and integrated within the application's
// front-end architecture.
//
// Project Name: App Image Selector
// Version: 2.0.0
// Author: Application Dev Team
// License: Proprietary

(function(jq) {
    "use strict"; // Enforce strict mode for cleaner JavaScript.

    // A module-scoped variable to hold the WordPress media frame instance.
    // It's initialized to null and created only when first needed.
    let _assetSelectionDialogInstance = null;

    // A cached jQuery object reference to the specific input field where the
    // selected image's URL will be populated. This is determined dynamically.
    let _destinationUrlField = null;

    // --- Pre-flight Checks and Fallbacks ---
    // Ensure that the core WordPress media library API is available.
    if (typeof window.wp === 'undefined' || typeof window.wp.media === 'undefined') {
        console.error("Dependency 'window.wp.media' is not loaded. Image selection functionality will be unavailable.");
        return; // Halt execution if the essential dependency is missing.
    }

    // Verify the presence and completeness of localization data.
    // Provide sensible default strings if the `app_media_strings` object is absent or malformed.
    if (typeof window.app_media_strings === 'undefined' || !window.app_media_strings.dialogHeader || !window.app_media_strings.confirmButtonText) {
        console.warn("Localization data 'app_media_strings' is missing or incomplete. Using default labels.");
        window.app_media_strings = window.app_media_strings || {}; // Ensure the object exists.
        window.app_media_strings.dialogHeader = window.app_media_strings.dialogHeader || 'Choose an Image for Your Content';
        window.app_media_strings.confirmButtonText = window.app_media_strings.confirmButtonText || 'Insert Selected Image';
    }

    /**
     * Orchestrates the opening and configuration of the WordPress media selection dialog.
     * This function is responsible for creating a new dialog instance or re-opening an existing one.
     *
     * @param {HTMLElement} activationSource - The DOM element that triggered the dialog opening.
     *                                       Its `data-target-field-id` attribute specifies the target input.
     */
    const launchMediaPicker = function(activationSource) {
        // If an instance of the media dialog already exists, simply bring it to the foreground.
        if (_assetSelectionDialogInstance) {
            console.log("Re-activating existing media selection dialog.");
            _assetSelectionDialogInstance.open();
            return;
        }

        // Determine the ID of the input field where the image URL should be placed.
        // It's retrieved from a data attribute on the activating element, falling back to a default ID.
        const targetFieldId = jq(activationSource).data('target-field-id') || 'app-content-image-url';
        _destinationUrlField = jq(`#${targetFieldId}`); // Cache the jQuery object for the target input.

        // Initialize a new WordPress media frame.
        // This object encapsulates the entire media library UI and its associated logic.
        _assetSelectionDialogInstance = window.wp.media({
            // Apply a custom CSS class for targeted styling of this specific media frame.
            // This helps avoid style conflicts with other media workflows.
            className: 'media-frame app-image-upload-frame',

            // Define the workflow type. 'select' is ideal for choosing existing assets.
            frame: 'select',

            // Configure the dialog to allow selection of only one asset at a time.
            multiple: Boolean(0), // An alternative way to express 'false'.

            // Set the title of the media dialog using localized application strings.
            title: window.app_media_strings.dialogHeader,

            // Restrict the media library view to only display image files.
            library: {
                type: 'image'
            },

            // Customize the text displayed on the primary action button within the dialog.
            button: {
                text: window.app_media_strings.confirmButtonText
            }
        });

        // --- Event Binding for Dialog Interactions ---

        // Attach an event handler for when the user confirms their selection.
        _assetSelectionDialogInstance.on('select', function() {
            console.debug("Image selection event captured.");

            // Access the current state of the media frame to retrieve the selection.
            const currentSelectedItems = _assetSelectionDialogInstance.state().get('selection');

            // Basic validation: ensure a selection was actually made.
            // (Though `multiple: false` and default behavior usually guarantee this).
            if (!currentSelectedItems || currentSelectedItems.length === 0) {
                console.warn("No image was selected, or the selection is empty.");
                return;
            }

            // Extract the first (and only) selected item's model.
            const primarySelectedItem = currentSelectedItems.at(0);

            // Convert the Backbone model into a plain JavaScript object for easy property access.
            const selectedImageDetails = primarySelectedItem.toJSON();

            // Validate that we have a URL and a valid target input field before updating.
            if (selectedImageDetails && selectedImageDetails.url && _destinationUrlField && _destinationUrlField.length) {
                // Update the value of the designated input field with the selected image's URL.
                _destinationUrlField.val(selectedImageDetails.url);
                console.info(`Target field updated with URL: ${selectedImageDetails.url}`);
            } else {
                console.error("Failed to retrieve image URL or the destination input field is invalid.");
            }
        });

        // Optional: Add a listener for when the dialog is completely closed.
        _assetSelectionDialogInstance.on('close', function() {
            console.log("Image selection dialog dismissed.");
        });

        // Open the configured media dialog to the user.
        _assetSelectionDialogInstance.open();
    };

    // --- DOM Ready Event Listener ---
    // Execute this code block once the entire HTML document has been loaded and parsed.
    jq(document).on('ready', function() {
        // Delegate a click event handler to the `body` element.
        // This allows handling clicks on `.app-media-trigger` elements,
        // even if they are added to the DOM dynamically after page load.
        jq('body').on('click.appMediaTriggerNamespace', '.app-media-trigger', function(eventObject) {
            // Prevent any default browser actions associated with the click (e.g., link navigation).
            eventObject.preventDefault();

            // Log the activation of the media picker for debugging purposes.
            console.debug("Application media picker initiated by:", eventObject.currentTarget);

            // Invoke the function to launch the media selection dialog.
            launchMediaPicker(eventObject.currentTarget);
        });
    });

})(window.jQuery); // Pass the global jQuery object into the IIFE to prevent conflicts.