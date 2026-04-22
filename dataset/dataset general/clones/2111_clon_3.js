// This module facilitates the dynamic assembly and configuration of form elements.
// It allows users to drag-and-drop components, modify their properties, and
// visualize the resulting form structure and underlying HTML code.
//
// All rights reserved by the original author.
// Adaptations and modifications for enhanced flexibility and maintainability.

// Ensure jQuery is loaded before this script executes, as core functionality relies on it.
jQuery(function($) { // jQuery's document ready shorthand, passing jQuery as '$'
    "use strict"; // Enforce stricter parsing and error handling for the entire module.

    // Centralized manager for all form building operations and element states.
    const widgetManager = {
        // Reference to the currently selected or active form element being configured.
        activeElementRef: null,

        // The HTTP method to be used when the generated form is submitted.
        submissionMethod: "POST",

        // The URL endpoint where the form data will be sent upon submission.
        targetURL: "",

        // Character used to separate the value from the display text in option-based inputs.
        optionValueSeparator: '=',

        // Assigns a new element as the currently active one for configuration.
        // @param {jQuery} elementNode - The jQuery object representing the DOM element.
        setActiveWidget: function(elementNode) {
            // Basic validation for the input.
            if (!elementNode || !elementNode.jquery || elementNode.length === 0) {
                console.warn("Attempted to set an invalid or empty widget reference.");
                return;
            }
            this.activeElementRef = elementNode;
            // Optionally, add a visual indicator to the active element.
            // this.activeElementRef.addClass('is-active-config');
        },

        // Retrieves the currently active form element.
        // @returns {jQuery|null} The active element's jQuery object, or null if none is set.
        fetchCurrentWidget: function() {
            return this.activeElementRef;
        },

        // Transforms a given string into a URL-friendly and attribute-safe identifier.
        // This involves trimming, replacing spaces, removing non-alphanumeric characters, and lowercasing.
        // @param {string} inputString - The raw string to be sanitized.
        // @returns {string} The cleaned, URL-safe string.
        formatIdentifier: function(inputString) {
            // Early exit for invalid inputs.
            if (typeof inputString !== 'string' || inputString === null) {
                return '';
            }
            // Chain of string transformations for robust sanitization.
            let processedName = inputString
                                .trim()                         // Remove leading/trailing whitespace.
                                .replace(/\s+/g, '_')           // Replace all spaces with single underscores.
                                .replace(/[^\w-]/g, '')         // Remove non-word characters and non-hyphens.
                                .toLowerCase();                 // Convert to lowercase for consistency.

            // Ensure the identifier doesn't start with an underscore if it's the only character.
            if (processedName.startsWith('_') && processedName.length > 1) {
                processedName = processedName.substring(1);
            } else if (processedName === '_') { // Handle cases where only underscore remains
                return '';
            }
            return processedName;
        },

        // Cleans up the generated HTML content by removing builder-specific classes,
        // temporary attributes, and redundant elements like close buttons.
        // @param {string} rawHtmlContent - The HTML string to be purified.
        // @returns {string} The cleaned HTML string.
        purifyHtmlOutput: function(rawHtmlContent) {
            // Validate input type.
            if (typeof rawHtmlContent !== 'string' || rawHtmlContent === null) {
                return '';
            }
            // Remove build-time specific artifacts.
            let purified = rawHtmlContent
                            .replace(/\t/g, '')                                 // Strip tab characters.
                            .replace(/ ui-draggable| element\b/gi, '')          // Remove draggable and element classes.
                            .replace(/<div class="close">.*?<\/div>/g, '')     // Remove the original close button HTML.
                            .replace(/ data-[a-z0-9-]+="[^"]*"/g, '');          // Remove all custom data attributes.

            return purified.trim(); // Final trim to clean up any remaining whitespace.
        },

        // Reconstructs and updates the full HTML source code of the form in the CodeMirror editor.
        regenerateFormMarkup: function() {
            const formContainer = $("#content"); // Assuming #content holds the form elements.
            if (!formContainer.length) {
                console.error("Form content container (#content) not found. Cannot generate markup.");
                return;
            }

            // Construct the complete form HTML using template literals for clarity.
            const completeFormHtml = `<form method="${this.submissionMethod}" action="${this.targetURL}" class="form-horizontal">\n` +
                                     formContainer.html() +
                                     `\n</form>`;

            // Assuming 'codeMirrorInstance' is globally accessible and initialized.
            // This part is specific to CodeMirror; ensure it's available.
            if (typeof codeMirrorInstance !== 'undefined' && codeMirrorInstance && typeof codeMirrorInstance.setValue === 'function') {
                const cleanedMarkup = this.purifyHtmlOutput(completeFormHtml);
                codeMirrorInstance.setValue(cleanedMarkup);

                // Auto-format the generated code for readability.
                codeMirrorInstance.autoFormatRange(
                    { line: 0, ch: 0 },
                    { line: codeMirrorInstance.lastLine() + 1, ch: 0 }
                );
            } else {
                console.warn("CodeMirror instance not found or not initialized. Cannot update source display.");
                // Fallback: log the cleaned HTML to console.
                console.log("Generated Form HTML (unformatted):\n", this.purifyHtmlOutput(completeFormHtml));
            }
        },

        // Adds a new component (widget) to the form preview area.
        // @param {jQuery} componentTemplate - The jQuery object of the component to add.
        insertNewComponent: function(componentTemplate) {
            if (!componentTemplate || !componentTemplate.jquery || componentTemplate.length === 0) {
                console.error("Invalid component template provided for insertion. Aborting.");
                return;
            }

            // Clone the component to avoid modifying the original template.
            const newWidgetInstance = componentTemplate.clone();

            // Apply standard classes and attributes for a form element.
            newWidgetInstance
                .removeClass('component')               // Remove the 'component' class from the template.
                .addClass('element-editable')           // Add a class indicating it's an editable form element.
                .removeAttr('id');                      // Remove any template-specific ID.

            // Prepend a clickable close/remove button for the user.
            const removeButtonHtml = '<button type="button" class="form-element-delete" aria-label="Remove element from form">&times;</button>';
            newWidgetInstance.prepend(removeButtonHtml);

            // Append the newly configured widget to the form content area.
            const formContentArea = $("#content");
            if (formContentArea.length) {
                formContentArea.append(newWidgetInstance);
            } else {
                console.error("Form content area (#content) not found. Cannot add component.");
                return;
            }

            // Hide the options modal after adding the component.
            const configModal = $("#options_modal");
            if (configModal.length && typeof configModal.modal === 'function') { // Check if modal function exists
                configModal.modal('hide');
            } else {
                console.warn("Options modal (#options_modal) not found or modal function not available when attempting to hide.");
            }

            // Refresh the displayed source code with the new element.
            this.regenerateFormMarkup();
        },

        // Opens the configuration panel (modal) for a specific widget type.
        // It fetches the appropriate settings form and populates it.
        // @param {string} widgetTypeIdentifier - The string identifier for the widget type (e.g., 'text', 'checkbox').
        // @param {jQuery} clickedElement - The jQuery object of the element that was clicked, to be configured.
        // @returns {Promise<boolean>} A promise resolving to true on success, false on failure.
        displayWidgetSettings: function(widgetTypeIdentifier, clickedElement) {
            // Input validation for the widget type.
            if (typeof widgetTypeIdentifier !== 'string' || !widgetTypeIdentifier.trim()) {
                console.error("Invalid widget type identifier provided. Configuration aborted.");
                return Promise.resolve(false);
            }

            // Ensure the clicked element is a valid jQuery object.
            if (!clickedElement || !clickedElement.jquery || clickedElement.length === 0) {
                console.error("No valid element provided for configuration. Aborting.");
                return Promise.resolve(false);
            }

            const settingsModal = $("#options_modal");
            const modalBodyContainer = settingsModal.find('.modal-body');

            if (!settingsModal.length || !modalBodyContainer.length) {
                console.error("Configuration modal or its body not found on the page. Cannot display settings.");
                return Promise.resolve(false);
            }

            // Construct the path to the settings HTML fragment.
            const settingsPath = `options/${widgetTypeIdentifier}.html`;

            // Use jQuery's AJAX method for fetching the HTML content.
            return $.ajax({
                url: settingsPath,
                method: "GET",
                dataType: "html",
                cache: false // Prevent caching of options HTML.
            })
            .done(function(data) {
                // Ensure data is not empty or malformed.
                if (typeof data === 'undefined' || data === null || data.trim().length === 0) {
                    console.warn(`No configuration data received for type: ${widgetTypeIdentifier}. Modal content will be empty.`);
                    modalBodyContainer.html('<p class="text-warning">No settings available for this component type.</p>');
                    // Even if data is empty, we proceed to show the modal, but with a warning.
                } else {
                    // Load the fetched HTML into the modal body.
                    modalBodyContainer.html(data);
                }

                // Store the widget type in the modal's data attributes.
                settingsModal.data('widget-type', widgetTypeIdentifier);

                // Set the element that triggered this action as the currently active widget.
                widgetManager.setActiveWidget(clickedElement);

                // Dynamically call the specific 'get' method for this widget type
                // to populate the settings fields with the element's current values.
                const typeHandler = widgetManager[widgetTypeIdentifier];
                if (typeHandler && typeof typeHandler.populateSettings === 'function') {
                    typeHandler.populateSettings();
                } else {
                    console.warn(`No 'populateSettings' method found for widget type: ${widgetTypeIdentifier}. Fields will not be pre-filled.`);
                }

                // Display the configuration modal to the user.
                if (typeof settingsModal.modal === 'function') {
                    settingsModal.modal('show');
                } else {
                    console.warn("Bootstrap modal function not available. Cannot show configuration modal.");
                }

                return true; // Indicate success of the AJAX call.
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error(`Failed to load options for ${widgetTypeIdentifier}: ${textStatus} - ${errorThrown}`);
                modalBodyContainer.html(`<p class="text-danger">Error loading settings for ${widgetTypeIdentifier}. Please ensure the HTML file exists.</p>`);
                if (typeof settingsModal.modal === 'function') {
                    settingsModal.modal('show'); // Still show modal with error message.
                }
                return false; // Indicate failure of the AJAX call.
            });
        },

        // --- Internal Helper for parsing option strings (used by select, checkbox, radio) ---
        // Converts a single line of option text (e.g., "value=Display Text") into an object.
        // @param {string} optionText - The raw string for one option.
        // @param {string} separator - The character used to split value from display.
        // @returns {{value: string, display: string}} An object with parsed value and display text.
        _parseOptionString: function(optionText, separator) {
            const result = { value: '', display: '' };
            if (typeof optionText !== 'string' || !optionText.trim()) {
                return result;
            }
            const trimmedText = optionText.trim();
            const sepIndex = trimmedText.indexOf(separator);

            if (sepIndex !== -1) {
                result.value = trimmedText.substring(0, sepIndex).trim();
                result.display = trimmedText.substring(sepIndex + separator.length).trim();
            } else {
                result.display = trimmedText;
                result.value = widgetManager.formatIdentifier(trimmedText); // Default value if no separator specified.
            }
            return result;
        },

        // --- Configuration objects for various form component types ---

        // Settings and logic for a form title (legend) element.
        headerSettings: {
            // Base CSS selector for identifying input fields within the modal for this type.
            optionFieldPrefix: '.options_title_',

            // Populates the modal fields with current values from the active legend element.
            populateSettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) {
                    console.warn("No active element to retrieve header settings from.");
                    return;
                }
                const currentLegend = activeElement.find('legend');
                if (currentLegend.length) {
                    const nameInput = $(`${this.optionFieldPrefix}name`);
                    nameInput.val(currentLegend.text());
                    // Set focus if the input exists.
                    if (nameInput.length) {
                        nameInput.focus();
                    }
                } else {
                    console.warn("Legend element not found within the active widget for header settings.");
                }
            },

            // Applies the values from the modal fields back to the active legend element.
            applySettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) {
                    console.warn("No active element to apply header settings to.");
                    return;
                }
                const newLegendText = $(`${this.optionFieldPrefix}name`).val();
                activeElement.find('legend').text(newLegendText);
            }
        },

        // Settings and logic for a standard text input field.
        textInputControls: {
            optionFieldPrefix: '.options_text_',

            populateSettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const inputField = activeElement.find('input[type="text"]');
                const labelElement = activeElement.find('label');

                // Pre-fill modal inputs with current element attributes/text.
                $(`${this.optionFieldPrefix}name`).val(inputField.attr('name') || '');
                $(`${this.optionFieldPrefix}label`).val(labelElement.text() || '');
                $(`${this.optionFieldPrefix}placeholder`).val(inputField.attr('placeholder') || '');
            },

            applySettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const inputField = activeElement.find('input[type="text"]');
                const labelElement = activeElement.find('label');

                const rawNameValue = $(`${this.optionFieldPrefix}name`).val();
                const fieldName = widgetManager.formatIdentifier(rawNameValue);
                const fieldLabel = $(`${this.optionFieldPrefix}label`).val();
                const fieldPlaceholder = $(`${this.optionFieldPrefix}placeholder`).val();

                // Update attributes on the input element.
                inputField.attr({
                    'name': fieldName,
                    'placeholder': fieldPlaceholder,
                    'id': fieldName // Ensure ID matches name for accessibility.
                });

                // Update label text and 'for' attribute.
                labelElement.text(fieldLabel).attr('for', fieldName);
            }
        },

        // Settings and logic for a textarea element.
        multilineTextInput: {
            optionFieldPrefix: '.options_textarea_',

            populateSettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const textareaField = activeElement.find('textarea');
                const labelElement = activeElement.find('label');

                $(`${this.optionFieldPrefix}name`).val(textareaField.attr('name') || '');
                $(`${this.optionFieldPrefix}label`).val(labelElement.text() || '');
                $(`${this.optionFieldPrefix}placeholder`).val(textareaField.attr('placeholder') || '');
            },

            applySettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const textareaElement = activeElement.find('textarea');
                const labelElement = activeElement.find('label');

                const fieldName = widgetManager.formatIdentifier($(`${this.optionFieldPrefix}name`).val());
                const fieldLabel = $(`${this.optionFieldPrefix}label`).val();
                const fieldPlaceholder = $(`${this.optionFieldPrefix}placeholder`).val();

                textareaElement.attr({
                    'name': fieldName,
                    'placeholder': fieldPlaceholder,
                    'id': fieldName // Set ID for accessibility.
                });
                labelElement.text(fieldLabel).attr('for', fieldName);
            }
        },

        // Base logic for select box options (both single and multiple).
        // This object isn't directly exposed as a type, but its methods are reused.
        _selectOptionHandler: {
            // Extracts current options from a <select> element into a formatted string.
            // @param {jQuery} selectElement - The jQuery object of the <select> element.
            // @returns {string} A multi-line string of options (e.g., "value=Display Text\n...").
            extractOptionsToString: function(selectElement) {
                const optionsStringArray = [];
                const separator = widgetManager.optionValueSeparator;

                selectElement.find('option').each(function() {
                    const $option = $(this);
                    const optionVal = $option.val();
                    const optionText = $option.text().trim();

                    // Include the value part only if it's different from the sanitized display text
                    // or if it's explicitly set and not empty.
                    const valPart = (optionVal && widgetManager.formatIdentifier(optionText) !== optionVal) ?
                                    `${optionVal}${separator}` : '';
                    optionsStringArray.push(`${valPart}${optionText}`);
                });
                return optionsStringArray.join('\n');
            },

            // Generates <option> HTML tags from a multi-line string of options.
            // @param {string} optionsBlob - Multi-line string of options from the modal textarea.
            // @returns {string} HTML string containing <option> tags.
            generateOptionsHtml: function(optionsBlob) {
                let generatedHtml = '';
                const separator = widgetManager.optionValueSeparator;
                // Split by newline and filter out any empty lines.
                const lines = optionsBlob.split(/\r?\n/).filter(line => line.trim().length > 0);

                if (lines.length === 0) {
                    console.warn("No options provided in the options blob. Select box will be empty.");
                    return '';
                }

                $.each(lines, function(index, line) {
                    const parsed = widgetManager._parseOptionString(line, separator);
                    // Fallback to formatted display text if no explicit value is provided.
                    const optionValue = parsed.value || widgetManager.formatIdentifier(parsed.display);
                    generatedHtml += `<option value="${optionValue}">${parsed.display}</option>\n`;
                });
                return generatedHtml;
            }
        },

        // Settings for a single-selection dropdown (select).
        singleSelectControl: {
            optionFieldPrefix: '.options_select_basic_', // Original name was `select_basic`

            populateSettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const selectElement = activeElement.find('select');
                const labelElement = activeElement.find('label');

                $(`${this.optionFieldPrefix}name`).val(selectElement.attr('name') || '');
                $(`${this.optionFieldPrefix}label`).val(labelElement.text() || '');
                $(`${this.optionFieldPrefix}options`).val(widgetManager._selectOptionHandler.extractOptionsToString(selectElement));
            },

            applySettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const selectElement = activeElement.find('select');
                const labelElement = activeElement.find('label');

                const fieldName = widgetManager.formatIdentifier($(`${this.optionFieldPrefix}name`).val());
                const fieldLabel = $(`${this.optionFieldPrefix}label`).val();
                const optionsBlob = $(`${this.optionFieldPrefix}options`).val();

                selectElement.attr({
                    'name': fieldName,
                    'id': fieldName // Match ID to name for accessibility.
                });
                labelElement.text(fieldLabel).attr('for', fieldName);
                selectElement.html(widgetManager._selectOptionHandler.generateOptionsHtml(optionsBlob));
            }
        },

        // Settings for a multiple-selection dropdown (select multiple).
        multiSelectControl: {
            optionFieldPrefix: '.options_select_multiple_', // Original name was `select_multiple`

            populateSettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const selectElement = activeElement.find('select');
                const labelElement = activeElement.find('label');

                // Remove '[]' from the name for display in the input field.
                const currentName = (selectElement.attr('name') || '').replace(/\[\]$/, '');
                $(`${this.optionFieldPrefix}name`).val(currentName);
                $(`${this.optionFieldPrefix}label`).val(labelElement.text() || '');
                $(`${this.optionFieldPrefix}options`).val(widgetManager._selectOptionHandler.extractOptionsToString(selectElement));
            },

            applySettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const selectElement = activeElement.find('select');
                const labelElement = activeElement.find('label');

                const fieldNameBase = widgetManager.formatIdentifier($(`${this.optionFieldPrefix}name`).val());
                const fieldName = `${fieldNameBase}[]`; // Append '[]' for multiple selection.
                const fieldLabel = $(`${this.optionFieldPrefix}label`).val();
                const optionsBlob = $(`${this.optionFieldPrefix}options`).val();

                selectElement.attr({
                    'name': fieldName,
                    'id': fieldNameBase, // ID should not contain '[]' for HTML validity.
                    'multiple': 'multiple' // Ensure it's marked as multiple.
                });
                labelElement.text(fieldLabel).attr('for', fieldNameBase);
                selectElement.html(widgetManager._selectOptionHandler.generateOptionsHtml(optionsBlob));
            }
        },

        // Settings for checkbox groups.
        checkboxGroup: {
            optionFieldPrefix: '.options_checkbox_',

            populateSettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const optionsStringArray = [];
                const separator = widgetManager.optionValueSeparator;

                // Find the main label, typically the first one that's a direct child or a sibling of controls.
                const mainLabel = activeElement.find('> label:first-of-type');
                // Get the name from the first checkbox, assuming all in the group share it.
                const currentName = activeElement.find('input[type="checkbox"]').first().attr('name') || '';

                activeElement.find('input[type="checkbox"]').each(function() {
                    const $checkbox = $(this);
                    const checkboxVal = $checkbox.val();
                    // Get the text from the label directly associated with this specific checkbox.
                    const relatedLabelText = $checkbox.closest('label').text().trim();

                    // If value is explicitly set and not just 'on', include it.
                    const valPart = (checkboxVal && checkboxVal !== 'on' && checkboxVal !== widgetManager.formatIdentifier(relatedLabelText)) ?
                                    `${checkboxVal}${separator}` : '';
                    optionsStringArray.push(`${valPart}${relatedLabelText}`);
                });

                $(`${this.optionFieldPrefix}name`).val(currentName);
                $(`${this.optionFieldPrefix}label`).val(mainLabel.text() || '');
                $(`${this.optionFieldPrefix}options`).val(optionsStringArray.join('\n'));
            },

            applySettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const mainLabel = activeElement.find('> label:first-of-type');
                const controlsContainer = activeElement.find('.controls');

                const fieldNameBase = widgetManager.formatIdentifier($(`${this.optionFieldPrefix}name`).val());
                const fieldLabelText = $(`${this.optionFieldPrefix}label`).val();
                const optionsBlob = $(`${this.optionFieldPrefix}options`).val();

                let generatedHtml = '';
                const separator = widgetManager.optionValueSeparator;
                const lines = optionsBlob.split(/\r?\n/).filter(line => line.trim().length > 0);

                if (lines.length === 0) {
                    console.warn("No options provided for checkbox group. Will render empty controls.");
                    controlsContainer.empty();
                    return;
                }

                $.each(lines, function(index, line) {
                    const parsed = widgetManager._parseOptionString(line, separator);
                    const optionValue = parsed.value || widgetManager.formatIdentifier(parsed.display);
                    const optionId = `${fieldNameBase}_${index}`; // Generate unique ID for each checkbox.

                    generatedHtml += `<div class="checkbox"><label for="${optionId}">\n` +
                                     `<input type="checkbox" name="${fieldNameBase}" id="${optionId}" value="${optionValue}">\n` +
                                     `${parsed.display}\n` +
                                     `</label></div>\n`;
                });

                mainLabel.text(fieldLabelText);
                controlsContainer.html(generatedHtml);
            }
        },

        // Settings for radio button groups.
        radioButtonGroup: {
            optionFieldPrefix: '.options_radio_',

            populateSettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const optionsStringArray = [];
                const separator = widgetManager.optionValueSeparator;

                const mainLabel = activeElement.find('> label:first-of-type');
                const currentName = activeElement.find('input[type="radio"]').first().attr('name') || '';

                activeElement.find('input[type="radio"]').each(function() {
                    const $radio = $(this);
                    const radioVal = $radio.val();
                    const relatedLabelText = $radio.closest('label').text().trim();

                    const valPart = (radioVal && radioVal !== 'on' && radioVal !== widgetManager.formatIdentifier(relatedLabelText)) ?
                                    `${radioVal}${separator}` : '';
                    optionsStringArray.push(`${valPart}${relatedLabelText}`);
                });

                $(`${this.optionFieldPrefix}name`).val(currentName);
                $(`${this.optionFieldPrefix}label`).val(mainLabel.text() || '');
                $(`${this.optionFieldPrefix}options`).val(optionsStringArray.join('\n'));
            },

            applySettings: function() {
                const activeElement = widgetManager.fetchCurrentWidget();
                if (!activeElement || !activeElement.length) return;

                const mainLabel = activeElement.find('> label:first-of-type');
                const controlsContainer = activeElement.find('.controls');

                const fieldNameBase = widgetManager.formatIdentifier($(`${this.optionFieldPrefix}name`).val());
                const fieldLabelText = $(`${this.optionFieldPrefix}label`).val();
                const optionsBlob = $(`${this.optionFieldPrefix}options`).val();

                let generatedHtml = '';
                const separator = widgetManager.optionValueSeparator;
                const lines = optionsBlob.split(/\r?\n/).filter(line => line.trim().length > 0);

                if (lines.length === 0) {
                    console.warn("No options provided for radio button group. Will render empty controls.");
                    controlsContainer.empty();
                    return;
                }

                $.each(lines, function(index, line) {
                    const parsed = widgetManager._parseOptionString(line, separator);
                    const optionValue = parsed.value || widgetManager.formatIdentifier(parsed.display);
                    const optionId = `${fieldNameBase}_${index}`; // Generate unique ID for each radio button.

                    generatedHtml += `<div class="radio"><label for="${optionId}">\n` +
                                     `<input type="radio" name="${fieldNameBase}" id="${optionId}" value="${optionValue}">\n` +
                                     `${parsed.display}\n` +
                                     `</label></div>\n`;
                });

                mainLabel.text(fieldLabelText);
                controlsContainer.html(generatedHtml);
            }
        }
    };

    // Note: The original code implies certain event handlers exist elsewhere
    // that call methods on 'form_builder'. For this clone, we would expect
    // equivalent event handlers to call methods on 'widgetManager'.
    // Example event handlers (commented out as they are external to this module's definition):
    // $(document).on('click', '.component-draggable', function() {
    //     widgetManager.insertNewComponent($(this));
    // });
    // $(document).on('click', '.element-editable', function() {
    //     const elementType = $(this).data('widget-type'); // Assuming data-widget-type attribute exists
    //     widgetManager.displayWidgetSettings(elementType, $(this));
    // });
    // $(document).on('click', '#options_modal .save-btn', function() {
    //     const type = $('#options_modal').data('widget-type');
    //     if (type && widgetManager[type] && typeof widgetManager[type].applySettings === 'function') {
    //         widgetManager[type].applySettings();
    //         widgetManager.regenerateFormMarkup();
    //         $('#options_modal').modal('hide');
    //     }
    // });
    // $(document).on('click', '.form-element-delete', function() {
    //     $(this).closest('.element-editable').remove();
    //     widgetManager.regenerateFormMarkup();
    // });

}); // End of jQuery document ready.