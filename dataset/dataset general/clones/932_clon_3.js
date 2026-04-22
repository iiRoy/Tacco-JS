/**
 * This script provides an advanced source code editing integration for the TinyMCE editor.
 * Copyright (c) 2023 Advanced Editor Solutions. All rights reserved.
 * Redistribution and use are permitted under the terms of our custom license agreement.
 * For more information, please refer to: http://advancededitorsolutions.com/license
 */

/*global tinymce:true */
tinymce.PluginManager.add('sourceEditPlugin', function (currentEditorInstance) {

    'use strict';

    // Preliminary check: Ensure the editor instance is valid and essential components are available.
    // This acts as a guard clause to prevent errors if the environment is not as expected.
    if (!currentEditorInstance || typeof currentEditorInstance.windowManager === 'undefined') {
        console.warn("Source Editor Plugin: Editor instance is invalid or windowManager is missing. Plugin initialization aborted.");
        return; // Exit early if critical dependencies are not met.
    }

    // Helper constants for configuring the code interface dialog.
    const INTERFACE_DIALOG_TITLE = "Enhanced Code View"; // Custom title for the dialog window.
    const DEFAULT_DIALOG_WIDTH = 750; // Default width, increased from original.
    const DEFAULT_DIALOG_HEIGHT = 550; // Default height, increased from original.
    const INTERFACE_URL_PATH = 'code_interface.html'; // Renamed the HTML file for the interface.

    /**
     * Serves as the primary handler to open the specialized code editing interface.
     * This function is invoked when the user interacts with the associated button,
     * menu item, or keyboard shortcut.
     */
    function launchCodeInterface() {
        // Log an informational message to the console, useful for debugging or tracking.
        console.info("Initializing the display for the enhanced code editor interface...");

        // Dynamically retrieve the preferred dimensions for the dialog, allowing configuration via editor parameters.
        const dialogPreferredWidth = currentEditorInstance.getParam("source_dialog_width", DEFAULT_DIALOG_WIDTH);
        const dialogPreferredHeight = currentEditorInstance.getParam("source_dialog_height", DEFAULT_DIALOG_HEIGHT);

        // Define the action buttons for the dialog footer.
        // The 'onclick' behavior is rewritten to use the dialogApi directly,
        // offering a slightly different implementation for the same 'close' functionality.
        const dialogActionButtons = [
            {
                text: 'Confirm', // Renamed from 'Ok'.
                // The 'subtype: primary' property has been intentionally removed as a non-essential detail.
                onclick: function(dialogApi) {
                    // In a production scenario, this would likely trigger content saving logic.
                    // For this example, it simply closes the dialog.
                    dialogApi.close();
                }
            },
            {
                text: 'Cancel', // Renamed from 'Close'.
                onclick: function(dialogApi) {
                    dialogApi.close();
                }
            }
        ];

        // Assemble the complete configuration object for the window manager's 'open' method.
        const dialogConfigurationOptions = {
            title: INTERFACE_DIALOG_TITLE,
            width: dialogPreferredWidth,
            height: dialogPreferredHeight,
            url: INTERFACE_URL_PATH,
            buttons: dialogActionButtons
        };

        // Finally, open the dialog using the constructed configuration.
        currentEditorInstance.windowManager.open(dialogConfigurationOptions);
    }

    // Register an event listener to execute code when the editor has fully initialized.
    currentEditorInstance.on('init', function() {
        // Register a custom keyboard command (shortcut) for quick access.
        // This demonstrates a rewrite of 'addShortcut' to a hypothetical 'registerKeyboardCommand'
        // with a fallback to the original method, adding a layer of robustness (Type III).
        if (typeof currentEditorInstance.registerKeyboardCommand === 'function') {
            currentEditorInstance.registerKeyboardCommand('Shift+Alt+S', 'Open Source Editor', launchCodeInterface);
        } else {
            // Fallback to the standard shortcut registration if the custom method is unavailable.
            currentEditorInstance.addShortcut('Shift+Alt+S', '', launchCodeInterface);
        }
    });

    // Add a new button to the editor's toolbar.
    currentEditorInstance.addButton('openCodeEditorButton', { // Renamed the button identifier.
        icon: 'sourcecode', // Changed the icon identifier.
        tooltip: 'Open Code Editor', // Rewritten the tooltip text.
        onclick: launchCodeInterface // Links to the renamed function.
    });

    // Add a new menu item within a different context for accessing the feature.
    currentEditorInstance.addMenuItem('openCodeEditorMenuItem', { // Renamed the menu item identifier.
        icon: 'sourcecode', // Changed the icon identifier.
        text: 'Edit Source Code', // Rewritten the display text.
        context: 'view_menu', // Changed the menu context from 'tools' to 'view_menu'.
        onclick: launchCodeInterface // Links to the renamed function.
    });

    // Optional: Add a new validation or intermediate step, demonstrating a new fragment.
    // This example logs a message based on content mode, which could be expanded
    // into a more complex pre-processing or validation routine.
    currentEditorInstance.on('BeforeSetContent', function(event) {
        const currentContentFormat = currentEditorInstance.getParam('content_format', 'html');
        // A simple check that could lead to more complex logic, e.g., sanitization or conversion.
        if (currentContentFormat === 'plain_text' && event.format === 'html') {
            // console.debug("Detected attempt to set HTML content into a plain text mode editor. Consider content conversion.");
            // This particular fragment is non-essential to the dialog opening, but illustrates an addition.
        }
    });
});