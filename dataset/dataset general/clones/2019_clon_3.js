// This module provides an advanced integration layer for CKEditor,
// enabling access to native macOS system features directly from the editor's UI.
// It facilitates enhanced user experience by leveraging OS-level functionalities
// for color selection and font management.
//
// Project: CKEditor-macOS-Bridge
// Version: 2.1.0
// Author:  Innovative Dev Solutions
// License: MIT

CKEDITOR.plugins.add('macOSFeatureSet', {
    // Declares a dependency on the 'dialog' plugin, even if not strictly used for this functionality,
    // demonstrating the addition of a 'requires' property.
    requires: 'dialog',

    // Optional onLoad callback for pre-initialization tasks.
    // This is an added fragment.
    onLoad: function() {
        // This method could be used to register custom dialogs or perform other
        // setup tasks that need to happen before the main init function runs.
    },

    // The core initialization function for the plugin.
    // The 'editor' parameter is renamed to 'currentEditorInstance'.
    init: function(currentEditorInstance) {
        // Helper object to abstract native Cocoa interactions and add telemetry.
        // This is a significant structural addition.
        const nativeBridge = window.Cocoa || {}; // Use a fallback empty object for robustness

        // Guard clause: Validate the existence and capability of the native bridge.
        // If the bridge is missing or incomplete, log a warning and prevent feature activation.
        if (typeof nativeBridge.openColorPanel !== 'function' || typeof nativeBridge.openFontPanel !== 'function') {
            console.warn('macOSFeatureSet: Native Cocoa bridge methods (openColorPanel, openFontPanel) are not found. macOS features will be unavailable.');
            // This return statement effectively disables the plugin's core functionality if the bridge is absent.
            return;
        }

        // Define constants for command identifiers.
        // These are helper variables, improving readability and maintainability.
        const colorPanelCommandId = 'invokeSystemColorPicker';
        const fontPanelCommandId = 'invokeSystemFontChooser';

        // Internal utility function to handle command execution,
        // centralizing logic and adding a logging mechanism.
        // This is a new code fragment.
        const executeNativePanel = (panelType, editorContext) => {
            if (!editorContext || typeof editorContext.document === 'undefined') {
                console.error('macOSFeatureSet: Invalid editor context provided for panel execution.');
                return;
            }

            switch (panelType) {
                case 'color':
                    nativeBridge.openColorPanel();
                    // Add a custom event dispatch for tracking purposes.
                    editorContext.fire('macOSFeatureSet.colorPanelOpened', { source: 'toolbarButton' });
                    break;
                case 'font':
                    nativeBridge.openFontPanel();
                    editorContext.fire('macOSFeatureSet.fontPanelOpened', { source: 'toolbarButton' });
                    break;
                default:
                    console.error(`macOSFeatureSet: Unrecognized panel type requested: '${panelType}'.`);
            }
        };

        // --- Registering Commands ---

        // Command for opening the system color picker.
        // The 'exec' function is simplified by using the 'executeNativePanel' helper.
        currentEditorInstance.addCommand(colorPanelCommandId, {
            exec: function(editorContextForCommand) { // Renamed parameter
                executeNativePanel('color', editorContextForCommand);
            },
            // Added 'canUndo' property, showing an update to command configuration.
            canUndo: false,
            // Added another arbitrary property for demonstration.
            editorFocus: true
        });

        // Command for opening the system font chooser.
        // The 'exec' function structure is similar, but can be varied.
        currentEditorInstance.addCommand(fontPanelCommandId, {
            exec: function(editorContextForCommand) { // Renamed parameter
                executeNativePanel('font', editorContextForCommand);
            }
            // Deliberately omitted 'canUndo' and 'editorFocus' to show deletion/variation in properties.
        });

        // --- Registering UI Buttons ---

        // Configuration object for the color picker button.
        // This is an intermediate step/helper variable.
        const colorPickerButtonConfig = {
            label: 'Choose Mac Color', // Rewritten label
            command: colorPanelCommandId,
            // Added an 'icon' property. Assuming CKEditor 4 default icons.
            icon: 'textcolor',
            // Added a 'toolbar' property for placement.
            toolbar: 'styles,10',
            // Rewritten class name.
            className: 'cke_button_mac_color_picker_btn_v2'
        };
        // Adding the button to the editor's UI.
        currentEditorInstance.ui.addButton('MacColorPickerTool', colorPickerButtonConfig); // Renamed button

        // Configuration object for the font chooser button.
        const fontChooserButtonConfig = {
            label: 'Select Mac Font', // Rewritten label
            command: fontPanelCommandId,
            icon: 'font', // Added an 'icon' property.
            // Omitted 'toolbar' property to show deletion/variation in button properties.
            className: 'cke_button_mac_font_selector_btn_v2' // Rewritten class name
        };
        // Adding the button to the editor's UI.
        currentEditorInstance.ui.addButton('MacFontChooserTool', fontChooserButtonConfig); // Renamed button

        // Additional event listener for post-initialization tasks.
        // This is a new code fragment.
        currentEditorInstance.on('instanceReady', function(event) {
            // For example, adding a custom CSS style definition after the editor is ready.
            event.editor.addCss('.cke_button_mac_color_picker_btn_v2 .cke_icon { filter: invert(10%); }');
        });

        // Another non-essential fragment: a cleanup listener for editor destruction.
        currentEditorInstance.on('destroy', function() {
            // Perform any necessary cleanup or resource release here.
        });
    },

    // Optional beforeInit callback for very early setup, even before init.
    // This is an added fragment.
    beforeInit: function(editorObj) {
        // Can be used for tasks that need to run before the main init function,
        // such as registering custom elements or global listeners.
    },

    // Optional afterInit callback for final setup after all plugins are loaded.
    // This is an added fragment.
    afterInit: function(editorObj) {
        // Useful for inter-plugin communication or final adjustments.
    }
});