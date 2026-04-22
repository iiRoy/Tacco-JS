(function(jq$) { // Using an IIFE for scope and passing jQuery as jq$

    // A simulated global configuration object, replacing 'EE'
    // This allows for dynamic settings and better organization.
    window.AppConfig = window.AppConfig || {
        debugMode: true, // Enable/disable detailed console logging
        advancedEditor: {
            // Options for the primary content editor system (replacing TEH_options)
            // Example structure:
            // toolbar: ['bold', 'italic', 'link'],
            // fileBrowser: { url: '/path/to/browser' },
            // ...
            fieldSettings: {
                // Maps original field names to specific editor configurations or IDs
                // e.g., "field_id_1": "config_set_A"
            }
        },
        publicationSettings: {
            // Settings related to publishing, including legacy markup field flags
            // Mimics EE.publish.markitup.fields
            markupFields: {
                // e.g., "field_id_1": true // Indicates default markup is enabled for this field
            }
        }
    };

    // Configuration for the basic markup editor, replacing 'mySettings'
    const basicMarkupEditorConfig = {
        nameSpace: 'basic_markup_control',
        markupSet: [
            { name: 'Bold Text', key: 'B', openWith: '<strong>', closeWith: '</strong>' },
            { name: 'Italic Text', key: 'I', openWith: '<em>', closeWith: '</em>' },
            { name: 'Link Item', key: 'L', openWith: '<a href="[!URL:http://!]">', closeWith: '</a>', placeHolder: 'Your text to link...' }
        ],
        previewParserPath: '~/sets/default/preview.php'
    };

    // Configuration for the compose mode's basic markup editor, replacing 'myWritemodeSettings'
    const composeModeMarkupConfig = {
        nameSpace: 'compose_markup_control',
        markupSet: [
            { name: 'Strong', key: 'S', openWith: '<b>', closeWith: '</b>' },
            { name: 'Emphasize', key: 'E', openWith: '<i>', closeWith: '</i>' },
            { name: 'Unordered List', openWith: '<ul>\n', closeWith: '\n</ul>' },
            { name: 'List Item', openWith: '<li>', closeWith: '</li>' }
        ],
        previewParserPath: '~/sets/default/preview.php'
    };

    // Utility function for conditional logging
    function logAppActivity(message) {
        if (window.AppConfig && AppConfig.debugMode) {
            console.log(`[AppActivity] ${message}`);
        }
    }

    // Placeholder for custom jQuery method definitions
    // In a real application, these would be properly defined as:
    // jq$.fn.initializeContentEditor = function(options) { /* ... */ };
    // jq$.fn.markItUpRemoveLegacy = function() { /* ... */ };
    // jq$.fn.activateDefaultMarkup = function(settings) { /* ... */ };
    // For this clone, we assume these methods exist and are called correctly.
    // Also, teh_filebrowser is renamed to activateMediaBrowser.
    function activateMediaBrowser(elementIdentifier) {
        logAppActivity(`Activating media browser for: ${elementIdentifier}`);
        // Simulate file browser activation
    }


    // Ensure the DOM is fully loaded before executing scripts
    jq$(document).on('ready', function() {

        logAppActivity("DOM ready. Initializing content editing components.");

        // Section 1: Iterate through all relevant textarea elements and set up advanced editors.
        // Targets textareas whose 'name' attribute begins with 'field_id_'.
        jq$('textarea[name^="field_id_"]').each(function(index, currentTextAreaElement) {

            const $currentElement = jq$(currentTextAreaElement);
            const elementFieldName = $currentElement.attr("name");

            // If the element doesn't have an 'id' attribute, assign its 'name' as its 'id'.
            // This ensures consistent referencing for editor initialization.
            if (!$currentElement.attr('id')) {
                $currentElement.attr('id', elementFieldName);
            }
            const actualElementId = $currentElement.attr('id'); // Retrieve the definitive ID

            logAppActivity(`Processing textarea: ${actualElementId} (name: ${elementFieldName})`);

            // Check if the global configuration specifies advanced editor settings for this field.
            const hasAdvancedEditorConfiguration = !!(
                window.AppConfig &&
                AppConfig.advancedEditor &&
                AppConfig.advancedEditor.fieldSettings &&
                AppConfig.advancedEditor.fieldSettings[elementFieldName]
            );

            if (hasAdvancedEditorConfiguration) {
                // If the field is currently using a legacy markItUp instance, remove it first.
                // This prevents conflicts when switching to the advanced editor.
                const legacyMarkupInstanceId = 'legacyMarkupField_' + AppConfig.advancedEditor.fieldSettings[elementFieldName];
                if (jq$('#' + legacyMarkupInstanceId).length > 0) {
                    logAppActivity(`Removing legacy markup from ${actualElementId}`);
                    $currentElement.markItUpRemoveLegacy(); // Renamed from markItUpRemove
                }

                // Initialize the advanced content editor for the current textarea.
                $currentElement.initializeContentEditor(AppConfig.advancedEditor); // Renamed from TextileEditor
                logAppActivity(`Advanced editor initialized for ${actualElementId}.`);

                // Activate the associated media/file browser for this editor instance.
                activateMediaBrowser(actualElementId); // Renamed from teh_filebrowser
            } else {
                logAppActivity(`No advanced editor config found for ${actualElementId}. Skipping initialization.`);
            }
        });

        // Section 2: Manage editor toolbar visibility based on format selection dropdowns.
        // Monitors 'select' elements whose 'name' attribute begins with 'field_ft_'.
        jq$('select[name^="field_ft_"]').each(function(index, formatSelectorElement) {

            const $formatSelector = jq$(formatSelectorElement);
            const selectorNameAttribute = $formatSelector.attr("name");

            // Extract the numeric suffix from the selector's name (e.g., '1' from 'field_ft_1').
            const fieldNumericSuffix = selectorNameAttribute.split('_').pop();
            // Construct the ID for the linked textarea element.
            const correspondingInputId = "field_id_" + fieldNumericSuffix;

            // Determine if the legacy default formatting buttons are enabled for this field.
            // This flag guides whether to activate/deactivate the basic markup editor.
            const isLegacyDefaultMarkupEnabled = !!(
                window.AppConfig &&
                AppConfig.publicationSettings &&
                AppConfig.publicationSettings.markupFields &&
                AppConfig.publicationSettings.markupFields[correspondingInputId]
            );

            logAppActivity(`Monitoring format selector: ${selectorNameAttribute}, linked to: ${correspondingInputId}`);

            // Attach a change event handler to each format selection dropdown.
            $formatSelector.on('change', function() {
                const selectedFormatValue = jq$(this).val();
                let $editorToolbarPanel = jq$('#editor-panel-' + correspondingInputId); // Renamed from textile-toolbar
                const $targetInputArea = jq$('#' + correspondingInputId);

                logAppActivity(`Format changed for ${correspondingInputId} to: ${selectedFormatValue}`);

                if (selectedFormatValue === "textile") {
                    // If 'textile' format is selected:
                    // Ensure any existing legacy basic markup editor is removed.
                    const legacyMarkupFieldIdentifier = 'legacyMarkupField_' + fieldNumericSuffix; // Renamed from markItUpField_id_
                    if (isLegacyDefaultMarkupEnabled && jq$('#' + legacyMarkupFieldIdentifier).length > 0) {
                        logAppActivity(`Textile selected: Removing legacy markup from ${correspondingInputId}.`);
                        $targetInputArea.markItUpRemoveLegacy();
                    }

                    // If the advanced editor toolbar is not present, initialize the advanced editor.
                    if ($editorToolbarPanel.length === 0) {
                        logAppActivity(`Textile selected: Initializing advanced editor for ${correspondingInputId}.`);
                        $targetInputArea.initializeContentEditor(AppConfig.advancedEditor);
                        activateMediaBrowser(correspondingInputId);
                    } else {
                        logAppActivity(`Textile selected: Advanced editor already present for ${correspondingInputId}.`);
                    }
                } else {
                    // If a non-'textile' format is selected:
                    // If the advanced editor toolbar is present, remove it.
                    if ($editorToolbarPanel.length > 0) {
                        logAppActivity(`Non-textile selected: Removing advanced editor toolbar from ${correspondingInputId}.`);
                        $editorToolbarPanel.remove();
                    }

                    // If legacy default markup is enabled and no basic markup instance exists, activate it.
                    const legacyMarkupFieldIdentifier = 'legacyMarkupField_' + fieldNumericSuffix;
                    if (isLegacyDefaultMarkupEnabled && !jq$('#' + legacyMarkupFieldIdentifier).length) {
                        logAppActivity(`Non-textile selected: Activating basic markup for ${correspondingInputId}.`);
                        $targetInputArea.activateDefaultMarkup(basicMarkupEditorConfig); // Renamed from markItUp
                    } else {
                        logAppActivity(`Non-textile selected: Basic markup not activated for ${correspondingInputId} (either not enabled or already present).`);
                    }
                }
            });
        });

        // Section 3: Intercept clicks on 'compose mode' triggers to swap editor types.
        // This handles the dynamic switching between editors in a special 'write mode' or 'compose mode'.
        jq$('.compose_mode_activator').on('click', function(event) {
            // Prevent the default action of the trigger element (e.g., a link or button).
            event.preventDefault();

            logAppActivity("Compose mode activator clicked.");

            const $triggerElement = jq$(this);
            const $parentContentEntryArea = $triggerElement.closest(".content_entry_area"); // Renamed from .publish_field
            const $composeInputArea = jq$('#compose_input_area'); // Renamed from #write_mode_textarea

            // Determine if the parent content area is configured for an advanced editor.
            const isAdvancedModePreferred = $parentContentEntryArea.find(".advanced_editor_panel").length > 0; // Renamed from .textile-toolbar

            // Check for the existence of the advanced editor toolbar in the compose input area.
            const advancedEditorToolbarPresent = jq$('#editor-panel-compose_input_area').length > 0; // Renamed from textile-toolbar-write_mode_textarea

            if (isAdvancedModePreferred) {
                // If advanced editor is preferred for this context:
                if (!advancedEditorToolbarPresent) {
                    logAppActivity("Compose mode: Advanced editor preferred and not present. Initializing...");
                    // Remove any existing basic markup editor first.
                    $composeInputArea.markItUpRemoveLegacy();
                    // Initialize the advanced editor.
                    $composeInputArea.initializeContentEditor(AppConfig.advancedEditor);
                    // Activate the file browser for the compose area.
                    activateMediaBrowser("compose_input_area");
                }
                // Ensure the input area has focus after setup.
                $composeInputArea.focus();
                logAppActivity("Compose mode: Advanced editor active and focused.");
            } else {
                // If advanced editor is not preferred for this context:
                if (advancedEditorToolbarPresent) {
                    logAppActivity("Compose mode: Basic editor preferred but advanced editor present. Removing advanced toolbar...");
                    // Remove the advanced editor toolbar if it's there.
                    jq$('#editor-panel-compose_input_area').remove();
                }
                // If no basic markup editor is present, activate it.
                const legacyMarkupComposeIdentifier = 'legacyMarkupField_compose_input_area'; // Renamed from markItUpWrite_mode_textarea
                if (!jq$('#' + legacyMarkupComposeIdentifier).length) {
                    logAppActivity("Compose mode: Basic editor preferred and not present. Activating basic markup...");
                    $composeInputArea.activateDefaultMarkup(composeModeMarkupConfig); // Renamed from markItUp
                }
                logAppActivity("Compose mode: Basic editor active.");
            }
        });

    });

})(jQuery); // Pass jQuery object to the IIFE