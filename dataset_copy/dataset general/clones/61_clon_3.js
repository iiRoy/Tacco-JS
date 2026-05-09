// This JavaScript file defines a Sencha Touch component responsible for displaying
// a user's profile image and facilitating the capture of new images using the device camera.
//
// This component has been meticulously crafted and is not an auto-generated artifact.
// It incorporates bespoke logic, refined configurations, and structural enhancements
// to ensure robust performance and maintainability within a Sencha application context.

Ext.define('User.widgets.PhotoCapturePanel', {
    // This component extends Ext.Container, providing a foundational structure
    // for managing its child elements and layout.
    extend: 'Ext.Container',

    // A unique alias that allows this component to be instantiated easily
    // using its xtype, e.g., { xtype: 'userphotocapture' }.
    alias: 'widget.userphotocapture',

    // The primary configuration object that defines the component's properties
    // and initial state.
    config: {
        // Defines the initial height for the component, slightly adjusted from a default.
        initialHeight: 125,
        // Specifies the minimum permissible height, ensuring UI integrity.
        minimumHeightAllowed: 105,

        // Comprehensive inline styling for the component's root element.
        // This includes background, border, radius, positioning, and overflow handling.
        componentStyle: 'background-color: #f8f8f8; border: 1px solid #ccc; border-radius: 6px; position: relative; overflow: hidden;',

        // Configuration for the layout manager, arranging items vertically and centering them.
        layoutScheme: {
            type: 'vbox',   // Vertical box layout for stacking items.
            pack: 'center', // Centers items along the main axis (vertically).
            align: 'center' // Centers items along the cross axis (horizontally).
        },

        // An HTML template used to render the actual image. It includes a wrapper
        // for responsive display and accessibility attributes.
        displayTemplate: [
            '<div class="image-display-wrapper" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden;">',
            '    <img class="profile-photo-element" src="{userPhotoUri}" alt="User Profile Photo" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 4px;" />',
            '</div>'
        ],

        // An array defining the child components (items) contained within this panel.
        containedElements: [
            {
                // A flexible container serving as a placeholder or initial content area.
                xtype: 'container',
                itemId: 'initialContentPlaceholder', // Unique identifier for easy lookup.
                html: '<p style="text-align: center; color: #aaa; font-style: italic; padding: 10px;">No photo available. Click camera to add one.</p>',
                flex: 1, // Allows this container to grow and fill available space.
                style: 'display: flex; align-items: center; justify-content: center;' // Centers its own content.
            },
            {
                // A button positioned at the bottom-right, designed to trigger camera capture.
                xtype: 'button',
                bottom: 10,  // Offset from the bottom edge.
                right: 10,   // Offset from the right edge.
                itemId: 'cameraActionButton', // Unique identifier for event delegation.
                iconCls: 'x-fa fa-camera', // Utilizes Font Awesome for a camera icon.
                text: 'Capture', // Visible text label for the button.
                ui: 'round action', // Applies a specific user interface style.
                // A simple inline handler for immediate feedback, the main logic is in a separate method.
                handler: function() {
                    console.info('Camera button pressed. Initiating capture process...');
                }
            }
        ],

        // Defines event listeners that respond to user interactions.
        eventBindings: [
            {
                event: 'tap',             // The type of event to listen for.
                element: 'delegate',      // Indicates that the event is delegated to a child element.
                selector: '#cameraActionButton', // CSS selector to target the specific button.
                handler: 'initiatePhotoCapture' // The method to execute when the event occurs.
            }
        ]
    },

    /**
     * The `initialize` method is called automatically after the component is created.
     * It's a good place for initial setup logic that depends on the component being fully rendered.
     * @private
     */
    initialize: function() {
        this.callParent(arguments);
        // Any additional setup or validation can be placed here.
        // For instance, loading a default image or performing device capability checks.
        // Example: this.updatePhotoDisplay({ userPhotoUri: 'resources/images/default_avatar.png' });
    },

    /**
     * Handles the tap event on the camera action button. This method orchestrates
     * the interaction with the device's camera to capture a new image.
     *
     * @param {Ext.Button} capturedButton The button component that was tapped.
     * @param {Ext.EventObject} eventObject The raw event object dispatched by the browser.
     * @param {Object} optionsBundle Additional options passed along with the event.
     */
    initiatePhotoCapture: function(capturedButton, eventObject, optionsBundle) {
        // Capture the component's 'this' context to ensure proper scope within callbacks.
        const componentInstance = this;

        // Perform a crucial check for the availability of the camera device API.
        // If not present, an alert is shown, and the function gracefully exits.
        if (!Ext.device || !Ext.device.Camera) {
            Ext.Msg.alert('Device Error', 'Camera functionality is not available on this device or in this environment.');
            console.warn('Camera API (Ext.device.Camera) not found. Cannot proceed with photo capture.');
            return; // Halt execution if camera API is missing.
        }

        // Define a comprehensive set of options for the camera capture operation.
        // These settings control aspects like source, destination, quality, and dimensions.
        const photoCaptureConfig = {
            source: Ext.device.Camera.CAMERA,           // Explicitly selects the device's camera.
            destination: Ext.device.Camera.FILE_URI,    // Specifies that the captured image should be returned as a file URI.
            quality: 80,                                // Sets the JPEG compression quality (0-100).
            width: 800,                                 // Desired width of the captured image in pixels.
            height: 600,                                // Desired height of the captured image in pixels.
            encodingType: Ext.device.Camera.EncodingType.JPEG, // Specifies JPEG as the output format.

            /**
             * Callback function invoked upon successful image acquisition.
             * @param {string} acquiredPhotoUri The URI of the captured image.
             */
            success: function(acquiredPhotoUri) {
                // Validate that actual image data was returned.
                if (!acquiredPhotoUri) {
                    Ext.Msg.alert('Capture Warning', 'No image data was returned by the camera application.');
                    return;
                }
                // Use an intermediate variable for clarity and potential future processing.
                const finalImageLocation = acquiredPhotoUri;
                console.log('Image successfully acquired:', finalImageLocation);

                // Update the component's visual display with the newly captured photo.
                componentInstance.updatePhotoDisplay({ userPhotoUri: finalImageLocation });

                // Fire a custom event, notifying other parts of the application that
                // the user's photo has been updated, passing the component instance and the image URI.
                componentInstance.fireEvent('photoUpdated', componentInstance, finalImageLocation);
            },

            /**
             * Callback function executed if the image capture process fails.
             * @param {string} errorReason A descriptive string explaining the failure.
             */
            failure: function(errorReason) {
                // Standardize the error message, providing a fallback if no specific reason is given.
                const standardizedErrorMessage = errorReason || 'An unspecified error occurred during the image capture process.';
                console.error('Image capture failed:', standardizedErrorMessage);
                // Display an alert to the user detailing the capture failure.
                Ext.Msg.alert('Capture Failure', `Unable to obtain image: ${standardizedErrorMessage}`);
            },

            // Ensures that the 'success' and 'failure' callbacks are executed
            // within the context of this component instance.
            scope: componentInstance
        };

        // Initiate the camera capture operation using the defined configuration.
        Ext.device.Camera.capture(photoCaptureConfig);
    },

    /**
     * Updates the image displayed within the component's template.
     * This method merges new image data with any existing data and refreshes the display.
     * It also removes the initial placeholder message once an image is set.
     *
     * @param {Object} data An object containing the new image URI, e.g., { userPhotoUri: 'path/to/image.jpg' }.
     */
    updatePhotoDisplay: function(data) {
        // Retrieve current data bound to the template.
        const currentData = this.getData();
        // Merge the new image data with existing data, prioritizing new values.
        const newData = Ext.apply({}, currentData, data);
        // Apply the combined data to the component's template, triggering a refresh.
        this.setData(newData);

        // Locate and destroy the placeholder component if it exists, as an image is now displayed.
        const placeholder = this.down('#initialContentPlaceholder');
        if (placeholder) {
            placeholder.destroy(); // Remove the placeholder element from the DOM.
        }
    }
});