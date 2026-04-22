Ext.define("AppModule.control.PrimaryScreen", {
    // This component extends the base ExtJS application controller.
    extend: 'Ext.app.Controller',

    // Declare required views for this controller's operation.
    requires: ['AppModule.view.SecondScreen'],

    // Configuration object for controller settings, including event handlers.
    settings : {
        eventHandlers : {
            // Target the primary application container for event listening.
            'primaryContainer' : {
                // Listen for changes in the active item of the container.
                itemActivated : 'handlePanelCardActivation'
            }
        }
    },

    /**
     * @method handlePanelCardActivation
     * Manages the display and dynamic loading logic when a new card is activated
     * within the primary application panel. It ensures that the 'SecondScreen'
     * is loaded and displayed only when necessary.
     * @param {Ext.container.Container} hostPanel The parent panel managing the cards.
     * @param {Ext.Component} activatedItem The newly activated component (card).
     * @param {Ext.Component} previousItem The component that was previously active.
     * @returns {void}
     */
    handlePanelCardActivation: function(hostPanel, activatedItem, previousItem) {
        // Initial check for host panel validity.
        if (!hostPanel) {
            console.error('Dynamic card activation: Host panel is undefined. Aborting.');
            return;
        }

        let maskApplied = false; // Flag to indicate if a loading mask was displayed.
        const targetScreenIdentifier = 'targetScreenId'; // Identifier for the specific card we are interested in.
        const componentXtype = 'secondScreen'; // The xtype string for the component to be added.
        const executionScope = this; // Explicitly capture the 'this' context for callbacks.

        // --- Type III: Combined and rephrased initial exit conditions. ---
        // If the activated item is not the target card, or if the second screen is already present,
        // then there's no need to proceed with dynamic loading or adding.
        if (activatedItem.getItemId() !== targetScreenIdentifier || activatedItem.query(componentXtype).length > 0) {
            console.info('Dynamic card activation: Skipping processing for item "%s". Either not target or content exists.', activatedItem.getItemId());
            return;
        }

        // --- Type III: Introduced an intermediate variable for clarity. ---
        // Determine if dynamic script loading is required based on application build status
        // and whether the target view class is already defined.
        const requiresScriptLoad = AppModule.isCompiled && !AppModule.view.SecondScreen;

        if (requiresScriptLoad) {
            // --- Type III: Enhanced mask configuration for better user feedback. ---
            // Apply a loading mask to the host panel to indicate ongoing operation.
            hostPanel.setMasked({ xtype: 'loadmask', message: 'Fetching module data...', indicator: true });
            maskApplied = true; // Update the flag.

            const scriptResourcePath = 'second_screen.js'; // The path to the JavaScript file to load.
            const performSynchronousLoad = true; // Flag for synchronous script loading.

            // --- Type III: Rewritten loader callbacks for better structure and logging. ---
            const scriptLoadSuccessHandler = function() {
                console.info('Dynamic card activation: Module script "%s" loaded successfully.', scriptResourcePath);
                // Additional actions could be performed here upon successful script load.
            };

            const scriptLoadErrorHandler = function() {
                console.error('Dynamic card activation: Failed to load module script "%s".', scriptResourcePath);
                // Error handling, e.g., showing a user-facing error message.
            };

            // Execute the dynamic script loading.
            Ext.Loader.loadScript(
                scriptResourcePath,
                scriptLoadSuccessHandler,
                scriptLoadErrorHandler,
                executionScope, // Use the captured scope.
                performSynchronousLoad
            );
        }

        // --- Type III: Wrapped component addition in a try-catch for robustness. ---
        // Attempt to add the 'SecondScreen' component to the newly activated item.
        // This will create and render the component.
        try {
            activatedItem.add({ xtype: componentXtype });
            console.log('Dynamic card activation: "%s" component successfully added to the activated item.', componentXtype);
        } catch (componentError) {
            console.error('Dynamic card activation: Failed to add "%s" component. Error:', componentXtype, componentError.message);
            // Consider more specific error handling or user notification here.
        }

        // --- Type III: Rewritten mask removal logic. ---
        // If a mask was applied earlier, ensure it is removed now that operations are complete.
        if (maskApplied) {
            hostPanel.setMasked(false);
            console.log('Dynamic card activation: Loading mask removed from host panel.');
        }
    }
});