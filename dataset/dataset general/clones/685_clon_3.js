// This module is responsible for setting up a custom development tool panel
// within the Chrome browser's developer console interface.
// It aims to provide a specialized view or functionality for a specific application context.

(function() { // Encapsulate the panel creation logic within an IIFE to avoid global pollution.

    // Define constant values for the panel's configuration.
    // Using descriptive variables enhances readability and future maintenance.
    const panelIdentifier = "Code Insight"; // The visible name that will appear on the DevTools tab.
    const iconAssetPath = '';               // Path to an optional 16x16 pixel icon. An empty string means no custom icon.
    const contentHtmlFile = 'view_panel.html'; // The HTML document that will be loaded into the panel's iframe.

    /**
     * A handler function invoked by the Chrome DevTools API after the panel
     * has been successfully instantiated. It receives a reference to the new panel.
     * @param {chrome.devtools.panels.ExtensionPanel} panelInstance - The object representing the newly created panel.
     */
    function onPanelCreationComplete(panelInstance) {
        // Execute conditional logic based on the success of panel creation.
        if (panelInstance) {
            // Log a confirmation message to the extension's background console.
            console.log(`[DevTools Setup] Panel '${panelIdentifier}' was successfully initialized.`);

            // Further actions could be performed here, such as:
            // - Storing the 'panelInstance' for later programmatic interaction.
            // - Attaching event listeners (e.g., onShown, onHidden, onSearch).
            // panelInstance.onShown.addListener(() => console.info(`'${panelIdentifier}' panel became visible.`));
            // panelInstance.onHidden.addListener(() => console.info(`'${panelIdentifier}' panel was hidden.`));

        } else {
            // Report an error if the panel creation failed for some reason.
            console.error(`[DevTools Setup] Failed to establish panel '${panelIdentifier}'.`);
        }
    }

    // Perform a runtime check to ensure the DevTools API is available.
    // This is a robust guard clause, though typically `chrome.devtools` is guaranteed in this context.
    if (typeof chrome !== 'undefined' && chrome.devtools && chrome.devtools.panels) {
        // Proceed to create the new panel using the DevTools API.
        // The API expects the title, icon path, HTML page path, and a callback.
        chrome.devtools.panels.create(
            panelIdentifier,      // The display name for the panel tab.
            iconAssetPath,        // Path to the panel icon, or empty for none.
            contentHtmlFile,      // The HTML file that forms the panel's user interface.
            onPanelCreationComplete // The callback to execute once the panel is ready.
        );
    } else {
        // Warn if the API is missing, which could indicate an incorrect script context.
        console.warn("[DevTools Setup] Chrome DevTools API not detected. Panel creation skipped.");
    }

})(); // End of the Immediately Invoked Function Expression.