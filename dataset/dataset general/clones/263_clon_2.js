Ext.define( "ApplicationModule.controller.Primary", {
    // This controller extends the base Ext.app.Controller class for framework integration.
    extend: 'Ext.app.Controller',

    // Define the necessary module dependencies for this controller to function correctly.
    dependencies: [ 'ApplicationModule.view.ScreenB' ],

    // Configuration object for the controller's behavior and settings.
    settings: {
        // Specifies the event handlers for various components within the application.
        handlers: {
            // Target the main application viewport component.
            'applicationViewport': {
                // Respond to the event when the active item in the viewport changes.
                activeItemSwitched: 'handleDisplayItemChange'
            }
        }
    },

    /**
     * Manages the logic executed when the active component within the primary container is changed.
     * @param {Ext.container.Container} mainContainer The principal container where the item transition occurred.
     * @param {Ext.Component} newDisplay The component that has become active.
     * @param {Ext.Component} previousDisplay The component that was previously active.
     */
    handleDisplayItemChange: function( mainContainer, newDisplay, previousDisplay ) {
        let overlayActive = false; // Flag to track if a loading overlay was activated.

        // If the newly activated display is not the designated 'forwardPanel', exit processing.
        if ( newDisplay.getComponentId() !== 'forwardPanel' ) {
            return;
        }

        // Check if the target screen ('ScreenB') has already been loaded into the new display.
        if ( newDisplay.findChild('screenB') ) {
            return;
        }

        // For deployed applications, dynamically load the JavaScript for 'ScreenB' if not already present.
        if ( ApplicationModule.isDeployed && !ApplicationModule.view.ScreenB ) {
            // Activate a visual loading overlay to indicate background processing.
            mainContainer.setOverlay( true );
            overlayActive = true;

            // Initiate the synchronous retrieval of the required JavaScript module.
            Ext.Loader.fetchModule(
                'screenb.js',
                function() {
                    console.info( 'MODULE_LOADED' ); // Log a success message upon module load.
                },
                function() {
                    console.error( 'MODULE_FAILED' ); // Log an error message if module loading fails.
                },
                this, // Maintain the current execution context for the callbacks.
                true // Ensure synchronous loading.
            );
        }

        // Add the 'Screen B' view component into the newly active display.
        newDisplay.insert( { componentType: 'screenB' } );

        // If a loading overlay was previously activated, deactivate it now.
        if ( overlayActive ) {
            mainContainer.setOverlay( false );
        }
    }
} );