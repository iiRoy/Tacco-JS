/**
 *
 * @license   Copyright © 2013 Stuart Sillitoe <stuart@vericode.co.uk>
 * This code is provided as open source, and you are free to modify it as you see fit.
 *
 * Authored by:
 * Stuart Sillitoe
 * stuartsillitoe.co.uk
 *
 */


/**
 * This section defines a list of dictionaries, each specifying strings
 * that can be inserted into the editor.
 *
 * Each dictionary for an insertable string may contain up to three keys:
 *
 *   - 'value': The actual content string to be inserted. This is the only mandatory key.
 *   - 'name' : A user-friendly name for the string, displayed in the dropdown menu.
 *   - 'label': A voice label, also utilized as the tooltip text for the string.
 *
 * If 'name' is not provided, the 'value' will be used as the name.
 * If 'label' is not provided, the 'name' (or 'value' if name is absent) will be used as the label.
 *
 * Should the 'value' key be absent, but 'name' is present, the entry will be treated
 * as a group header within the dropdown. These headers are not clickable and do not insert content;
 * their purpose is purely for organizational structure.
 */
CKEDITOR.config.strinsert_strings = [
    {
        'name' : 'Name',       /* Display name for this entry */
        'value': '*|VALUE|*'   /* The content to be inserted */
    },
    {
        'name': 'Group 1'      /* This entry acts as a group header */
    },
    {
        'name' : 'Another name',     /* A different display name */
        'value': 'totally_different', /* Unique value for insertion */
        'label': 'Good looking'      /* Custom voice label/tooltip */
    }
];


/**
 * Defines the primary text to be displayed on the button itself.
 */
CKEDITOR.config.strinsert_button_label = 'Insert';


/**
 * Specifies the tooltip text that appears when the user hovers over the button.
 */
CKEDITOR.config.strinsert_button_title = 'Insert content';


/**
 * Sets the descriptive text for screen readers or voice control systems,
 * enhancing accessibility.
 */
CKEDITOR.config.strinsert_button_voice = 'Insert content';


CKEDITOR.plugins.add(
    'strinsert',
    {
        requires: [ 'richcombo' ], // This plugin depends on the 'richcombo' plugin.

        init: function (editor) {

            // Retrieve the editor's configuration settings.
            var config = editor.config;

            // Fetch the predefined list of insertable strings from the configuration.
            var strings = config.strinsert_strings;


            // Add a new rich combo (dropdown) UI element to the editor.
            editor.ui.addRichCombo(
                'strinsert',
                {
                    // Configuration for the rich combo button itself.
                    label:      config.strinsert_button_label,    // Button text.
                    title:      config.strinsert_button_title,    // Tooltip text.
                    voiceLabel: config.strinsert_button_voice,    // Accessibility label.
                    toolbar:    'insert',                         // Toolbar group it belongs to.
                    className:  'cke_format',                     // CSS class for styling.
                    multiSelect: false,                           // Disallow multiple selections.

                    // Panel configuration for the dropdown list.
                    panel: {
                        css: [
                            editor.config.contentsCss,            // Editor's content CSS.
                            CKEDITOR.skin.getPath('editor')       // CKEDITOR skin's editor CSS.
                        ],
                        voiceLabel: editor.lang.panelVoiceLabel   // Accessibility label for the panel.
                    },


                    // Initialization function for populating the dropdown list.
                    init: function () {
                        var lastgroup = ''; // Variable to track the last group (not used in current logic, but kept).

                        // Iterate through each string definition in the configuration.
                        for (var i = 0, len = strings.length; i < len; i++) {
                            string = strings[i]; // Get the current string definition object.

                            // Check if the current definition has a 'value' key.
                            if (!string.value) {
                                // If 'value' is absent, it's a group header.
                                this.startGroup(string.name); // Create a new group in the dropdown.
                            } else {
                                // If 'value' is present, it's an insertable string entry.

                                // If 'name' is not provided, use the 'value' as the name.
                                if (!string.name) {
                                    string.name = string.value;
                                }

                                // If 'label' is not provided, use the (now defined) 'name' as the label.
                                if (!string.label) {
                                    string.label = string.name;
                                }

                                // Add the insertable string to the dropdown list.
                                this.add(string.value, string.name, string.label);
                            }
                        }
                    },


                    // Callback function executed when an item in the dropdown is clicked.
                    onClick: function (value) {

                        editor.focus();                       // Ensure the editor has focus.
                        editor.fire('saveSnapshot');          // Save the current state for undo.
                        editor.insertHtml(value);             // Insert the selected HTML content.
                        editor.fire('saveSnapshot');          // Save the state again after insertion.
                    }

                }
            );
        }
    }
);