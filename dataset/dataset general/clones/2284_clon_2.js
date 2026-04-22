/*
 * Script for handling asset selection within the custom plugin interface.
 *
 * @version 2.0.0
 *
 * @module CustomMediaHandler
 * @developer Jane Doe
 */
(function( $dom ){

    // This variable will hold our specialized file selection dialog instance.
    let assetManagerModal;

    // Attach an event listener to the document body for opening the file picker.
    $dom(document.body).on('click.launchImageSelector', '.launch-asset-picker', function( evt ){

        // Prevent the browser's default action for the event.
        evt.haltAction();

        // If the selection dialog already exists, just display it again.
        if ( assetManagerModal ) {
            assetManagerModal.display();
            return;
        }

        /*
         * The file selection dialog hasn't been initialized yet. Let's create it.
         *
         * Review the WordPress media API for more options that can be configured.
         */
        assetManagerModal = wp.media.frames.customMediaPicker = wp.media({

            // Assigning a unique CSS class to prevent style conflicts with other media modals.
            cssClass: 'modal-window asset-picker-modal',

            // We want a simple selection interface, not a full post-attachment workflow.
            displayType: 'choose',

            // Restrict the user to selecting only one item at a time.
            allowMultiSelection: false,

            // Set the title for our custom dialog, sourced from localized data.
            dialogTitle: custom_plugin_data.modal_title,

            // Filter the media library to show only pictures.
            collection: {
                dataType: 'picture'
            },

            // Customize the text on the confirmation button.
            confirmButton: {
                label: custom_plugin_data.select_btn_label
            }
        });

        /*
         * ========================================================================
         * EVENT ATTACHMENTS
         *
         * This section is dedicated to setting up event handlers for the dialog
         * before it becomes visible to the user.
         *
         * Explore the wp-includes/js/media-views.js file for a comprehensive list
         * of available events.
         * ========================================================================
         */

        /*
         * We're now listening for the 'choose' event, which fires when an item is selected.
         * Since multi-selection is disabled, we're guaranteed to get a single item.
         *
         * The process involves getting the current state, fetching the selected items,
         * taking the first one, and converting it to a JSON object for easy data extraction.
         *
         * The 'sourceUrl' property from this object will be used to populate our input field.
         */
        assetManagerModal.on('choose', function(){

            // Retrieve the chosen asset and convert its details to a JavaScript object.
            const pickedFile = assetManagerModal.getCurrentState().fetch('chosenItems').first().exportToJson();

            // Update the value of our designated input field with the asset's direct link.
            $dom('#plugin-image-input').setValue(pickedFile.sourceUrl);
        });

        // Finally, open the asset selection dialog for the user.
        assetManagerModal.display();
    });

})( jQuery );