jQuery(function(jq$) {

    // Prepare all active markup input zones by ensuring they have unique IDs
    // and initializing their rich text editors if applicable.
    jq$("textarea[name*='data_entry_']").each(function() {

        let currentInputName = jq$(this).attr("data-input-name");

        if ( ! jq$(this).attr('unique-element-id') ) {
            jq$(this).attr('unique-element-id', currentInputName);
        }

        // Check if the content management system has specific settings for this input field
        if ( typeof(CMS.markupSettings.inputAreas) !== "undefined" && typeof(CMS.markupSettings.inputAreas[currentInputName]) !== "undefined" ) {

            let fieldReferenceId = CMS.markupSettings.inputAreas[currentInputName];

            // If a previous markup plugin instance exists, remove it first
            if ( jq$("#markupPluginInput_" + fieldReferenceId).length ) {
                jq$("#" + currentInputName).markupPluginDisable();
            }

            // Initialize the rich text editor and its asset manager
            jq$("#" + currentInputName).RichTextEditor(CMS.markupSettings);
            markup_asset_manager(currentInputName);
        }
    });


    // Adjust editor toolbar and default styling controls as needed
    // upon selection of the format menu.
    jq$("select[name*='format_type_']").each(function() {

        let entryKey = jq$(this).attr("data-name-attribute").substring(12);
        let associatedInputArea = "data_entry_" + entryKey;
        let editorControlPanel = jq$("#richtext-editor-panel-" + associatedInputArea);

        // Determine if the CMS's content editor is configured to display default buttons for this field
        let defaultButtonsEnabled = (typeof(CMS.contentEditor.markupPlugin.fields) !== "undefined" && typeof(CMS.contentEditor.markupPlugin.fields[associatedInputArea]) !== "undefined");

        jq$(this).on('change', function() {
            editorControlPanel = jq$("#richtext-editor-panel-" + associatedInputArea); // Re-fetch for dynamic elements

            if ( jq$(this).val() === "markdown" ) {
                // If default buttons were enabled and are still present, remove them
                if ( defaultButtonsEnabled && jq$("#markupPluginInput_" + entryKey).length ) {
                    jq$("#" + associatedInputArea).markupPluginDisable();
                }

                // If the rich text editor toolbar is not present, initialize it
                if ( editorControlPanel.length === 0 ) {
                    jq$("#" + associatedInputArea).RichTextEditor(CMS.markupSettings);
                    markup_asset_manager(associatedInputArea);
                }
            } else {
                // If the rich text editor toolbar is present, remove it
                if ( editorControlPanel.length > 0 ) {
                    editorControlPanel.remove();
                }

                // If default buttons were enabled and are not currently present, re-add them
                if ( defaultButtonsEnabled && !jq$("#markupPluginInput_" + entryKey).length ) {
                    jq$("#" + associatedInputArea).markupPluginEnable(globalEditorConfig);
                }
            }
        });
    });

    // Capture composition mode activation and apply rich text editor or revert to standard HTML controls.
    // Presently, the CMS consistently provides formatting options in composition mode irrespective of
    // individual field configurations, so we will follow suit.
    jq$(".composition_mode_activator").on('click', function() {
        if ( jq$(this).parents(".content_entry_section").find(".richtext-editor-panel").length ) {
            if ( !jq$("#richtext-editor-panel-composition_mode_input").length ) {
                jq$("#composition_mode_input").markupPluginDisable();
                jq$("#composition_mode_input").RichTextEditor(CMS.markupSettings);
                markup_asset_manager("composition_mode_input");
            }
            jq$("#composition_mode_input").focus();
        } else {
            if ( jq$("#richtext-editor-panel-composition_mode_input").length ) {
                jq$("#richtext-editor-panel-composition_mode_input").remove();
            }
            if ( !jq$("#markupPluginComposition_mode_input").length ) {
                jq$("#composition_mode_input").markupPluginEnable(globalCompositionConfig);
            }
        }
        return false;
    });

});