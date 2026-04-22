// @license Open-source project, free to modify and distribute.
// This module provides advanced content insertion capabilities for CKEditor.
//
// Developer: [Your Name/Org]
// Version: 1.0.0
//
// This file defines the configuration and plugin logic for a flexible content snippet picker.

/**
 * Configuration array for defining content snippets that can be inserted into the editor.
 *
 * Each snippet object can have the following properties:
 *    'contentPayload': The actual HTML or text value to insert. (Required for insertable items)
 *    'displayText': The visible name for the snippet in the dropdown.
 *    'ariaLabel': The accessibility label (also used as the tooltip) for the snippet.
 *    'isGroup': Set to true to make this item a non-clickable group header for organizational purposes.
 *
 * If 'contentPayload' is missing but 'displayText' is present, the item will be treated as a group header.
 * If 'displayText' is not provided for an insertable item, 'contentPayload' will be used.
 * If 'ariaLabel' is not provided, 'displayText' (or 'contentPayload') will be used.
 */
if (typeof CKEDITOR !== 'undefined' && CKEDITOR.config) {
    CKEDITOR.config.template_snippets_config = [
        { displayText: 'User Name', contentPayload: '{{USERNAME}}', ariaLabel: 'Insert current user name placeholder' },
        { displayText: 'Date/Time', isGroup: true }, // Group header definition
        { displayText: 'Current Date', contentPayload: '{{CURRENT_DATE}}', ariaLabel: 'Insert current date placeholder' },
        { displayText: 'Current Time', contentPayload: '{{CURRENT_TIME}}' }, // Label defaults to display text
        { displayText: 'Contact Info', isGroup: true },
        { displayText: 'Email Address', contentPayload: 'user@example.com', ariaLabel: 'Insert example email address' },
        { contentPayload: '123-456-7890' } // Display text defaults to content payload
    ];

    /**
     * Text to display on the button itself.
     */
    CKEDITOR.config.snippet_button_label = 'Snippets';

    /**
     * Tooltip text shown when hovering over the button.
     */
    CKEDITOR.config.snippet_button_tooltip = 'Insert pre-defined content snippets';

    /**
     * Accessibility voice label for the button.
     */
    CKEDITOR.config.snippet_button_a11y_label = 'Content Snippet Selector';
}


// Main CKEditor plugin definition for the snippet insertion feature.
CKEDITOR.plugins.add('snippet_picker_plus',
{
    // Declares dependencies on other CKEditor plugins; 'richcombo' is essential for dropdown functionality.
    dependencies : ['richcombo'],

    /**
     * Initializes the plugin for a given editor instance.
     * @param {CKEDITOR.editor} ckEditorInstance The CKEditor instance being initialized.
     */
    init : function( ckEditorInstance )
    {
        // Retrieve the current editor's configuration.
        const currentConfig = ckEditorInstance.config;

        // Fetch the list of content snippets from the configuration, defaulting to an empty array if not defined.
        const availableSnippets = Array.isArray(currentConfig.template_snippets_config)
                                ? currentConfig.template_snippets_config
                                : [];

        // Add a new rich combo dropdown to the editor's UI.
        ckEditorInstance.ui.addRichCombo('snippet_commander',
        {
            // Button properties
            label:      currentConfig.snippet_button_label,
            title:      currentConfig.snippet_button_tooltip,
            voiceLabel: currentConfig.snippet_button_a11y_label,
            toolbar:    'insert', // Place this button in the 'insert' toolbar group.
            className:  'cke_button_snippet_picker', // Custom CSS class for styling.
            multiSelect: false, // Ensure only one item can be selected at a time.

            // Panel properties (the dropdown list itself)
            panel:
            {
                css: [ ckEditorInstance.config.contentsCss, CKEDITOR.skin.getPath('editor') ], // Apply editor's content CSS and skin CSS.
                voiceLabel: ckEditorInstance.lang.panelVoiceLabel // Accessibility label for the dropdown panel.
            },

            /**
             * Populates the rich combo dropdown list with defined snippets.
             * This function is called when the dropdown is opened for the first time.
             */
            init: function()
            {
                // Iterate over each snippet definition.
                for (let i = 0; i < availableSnippets.length; i++)
                {
                    const currentItem = availableSnippets[i];

                    // Ensure the current item is a valid object before processing.
                    if (typeof currentItem !== 'object' || currentItem === null) {
                        console.warn('Invalid snippet configuration item found; skipping:', currentItem);
                        continue;
                    }

                    // Check if the item is designated as a group header.
                    if (currentItem.isGroup === true) {
                        // If it's a group header, add it to the dropdown. Display text is required.
                        if (currentItem.displayText) {
                            this.startGroup(currentItem.displayText);
                        } else {
                            // If a group header lacks display text, it's problematic, skip or log.
                            console.warn('Group header snippet missing displayText; skipping:', currentItem);
                        }
                    }
                    // Otherwise, it's an insertable content snippet.
                    else if (currentItem.contentPayload) {
                        // Determine the display name, defaulting to contentPayload if displayText is missing.
                        const itemDisplayName = currentItem.displayText || currentItem.contentPayload;
                        // Determine the accessibility label, defaulting to itemDisplayName if ariaLabel is missing.
                        const itemAriaLabel = currentItem.ariaLabel || itemDisplayName;

                        // Add the actual insertable item to the dropdown.
                        // Parameters: value (to insert), text (to display), label (for accessibility/tooltip)
                        this.add(currentItem.contentPayload, itemDisplayName, itemAriaLabel);
                    } else {
                        // If an item is neither a group nor has contentPayload, it's invalid.
                        console.warn('Snippet item missing contentPayload or isGroup flag; skipping:', currentItem);
                    }
                }
            },

            /**
             * Handles the action when an item is selected from the rich combo dropdown.
             * @param {string} selectedValue The 'value' of the selected item (i.e., the contentPayload).
             */
            onClick: function( selectedValue )
            {
                // Ensure a value was actually selected and is a string.
                if (!selectedValue || typeof selectedValue !== 'string') {
                    console.warn('Attempted to insert an invalid or empty snippet value.');
                    return;
                }

                ckEditorInstance.focus(); // Set focus back to the editor.
                ckEditorInstance.fire( 'saveSnapshot' ); // Save the editor's state for undo.
                ckEditorInstance.insertHtml(selectedValue); // Insert the selected content into the editor.
                ckEditorInstance.fire( 'saveSnapshot' ); // Save another snapshot after insertion for a distinct undo step.
            }
        });
    }
});