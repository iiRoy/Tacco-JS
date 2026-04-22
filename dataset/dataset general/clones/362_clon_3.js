(function($, document, window) {

    // Centralized configuration for UI elements and classes.
    // This allows for easier modification and enhances maintainability.
    const UI_ELEMENT_SETTINGS = {
        htmlRootElement: 'html',
        noScriptIndicatorClass: 'no-script-enabled',
        scriptActiveIndicatorClass: 'script-active',
        radioInputQuery: 'input[type="radio"]',
        checkboxInputQuery: 'input[type="checkbox"]',
        customRadioVisualClass: 'custom-radio-shell',
        customCheckboxVisualClass: 'custom-checkbox-shell',
        linkedControlIdentifierAttr: 'data-associated-id',
        controlGroupLabelAttr: 'data-group-name',
        selectionStateAttr: 'data-current-state',
        visualHideOffset: '-9999px',
        visualShowOffset: '0',
        radioMarkerSymbol: '&bull;',
        checkboxCheckmarkSymbol: '&#10003;',
        selectedVisualClass: 'is-active-selection'
    };

    // Utility for generating unique identifiers for dynamically created elements.
    let globalIdSequence = 0;
    const generateUniqueControlId = () => `control-id-${globalIdSequence++}`;

    // Function to synchronize the visual state of a custom checkbox proxy with its original input.
    function synchronizeCheckboxVisual(proxyElement, originalCheckbox) {
        const isCurrentlyChecked = originalCheckbox.prop('checked');
        proxyElement.toggleClass(UI_ELEMENT_SETTINGS.selectedVisualClass, isCurrentlyChecked);
        proxyElement.attr(UI_ELEMENT_SETTINGS.selectionStateAttr, isCurrentlyChecked ? 'true' : 'false');
    }

    // Main script execution block, ensuring the DOM is fully loaded.
    $(document).ready(function() {

        // Part 1: Initial JavaScript detection and HTML class update.
        // This helps in applying JS-dependent styles or functionalities.
        const pageRoot = $(UI_ELEMENT_SETTINGS.htmlRootElement);
        if (pageRoot.hasClass(UI_ELEMENT_SETTINGS.noScriptIndicatorClass)) {
            pageRoot.removeClass(UI_ELEMENT_SETTINGS.noScriptIndicatorClass);
        }
        pageRoot.addClass(UI_ELEMENT_SETTINGS.scriptActiveIndicatorClass);
        // console.info("Scripting environment active; root HTML classes updated.");


        // Part 2: Custom styling implementation for radio button inputs.
        // This section iterates through all radio inputs to create corresponding visual proxies.
        let radioInputIndex = 0; // Distinct counter for radio buttons.
        const allApplicationRadioInputs = $(UI_ELEMENT_SETTINGS.radioInputQuery);

        if (allApplicationRadioInputs.length > 0) { // Safety check: proceed only if radios exist.
            allApplicationRadioInputs.each(function() {
                const currentRadioInput = $(this);
                const uniqueProxyId = generateUniqueControlId(); // Generate a unique ID for this control.
                const originalInputName = currentRadioInput.attr('name');

                // Link the original input to its custom proxy via a data attribute.
                currentRadioInput.attr(UI_ELEMENT_SETTINGS.linkedControlIdentifierAttr, uniqueProxyId);
                // Visually hide the original radio button while keeping it functional and accessible.
                currentRadioInput.css({ 'position': 'absolute', 'clip': 'rect(0 0 0 0)', 'overflow': 'hidden', 'margin': '-1px', 'border': '0', 'padding': '0', 'width': '1px', 'height': '1px' }); // More robust hiding technique.

                // Construct the custom visual replacement span element.
                const radioProxySpan = $('<span></span>', {
                    'class': UI_ELEMENT_SETTINGS.customRadioVisualClass,
                    'id': uniqueProxyId, // The ID links back to the original input.
                    [UI_ELEMENT_SETTINGS.controlGroupLabelAttr]: originalInputName, // Store the group name for easy lookup.
                    'html': UI_ELEMENT_SETTINGS.radioMarkerSymbol, // Use a symbol from the config.
                    'css': { 'text-indent': UI_ELEMENT_SETTINGS.visualHideOffset } // Default hidden visual state.
                });

                // If the original radio is initially selected, update the proxy's visual to reflect this.
                if (currentRadioInput.prop('checked')) {
                    radioProxySpan.css('text-indent', UI_ELEMENT_SETTINGS.visualShowOffset);
                }

                // Insert the custom visual element directly after the original input.
                currentRadioInput.after(radioProxySpan);
                radioInputIndex++;
            });

            // Event handling for clicks on the custom radio button proxies.
            // Using event delegation for efficiency, especially with dynamically added content.
            $(document).on('click', `.${UI_ELEMENT_SETTINGS.customRadioVisualClass}`, function(evt) {
                const clickedProxyElement = $(this);
                const linkedElementId = clickedProxyElement.attr(UI_ELEMENT_SETTINGS.linkedControlIdentifierAttr);
                const groupIdentifier = clickedProxyElement.attr(UI_ELEMENT_SETTINGS.controlGroupLabelAttr);

                // Basic validation for essential attributes.
                if (!linkedElementId || !groupIdentifier) {
                    // console.warn("Missing essential data attributes on radio proxy:", clickedProxyElement);
                    return;
                }

                const targetOriginalRadioInput = $(`${UI_ELEMENT_SETTINGS.radioInputQuery}[${UI_ELEMENT_SETTINGS.linkedControlIdentifierAttr}="${linkedElementId}"]`);
                const allProxiesInGroup = $(`.${UI_ELEMENT_SETTINGS.customRadioVisualClass}[${UI_ELEMENT_SETTINGS.controlGroupLabelAttr}="${groupIdentifier}"]`);
                const allOriginalRadiosInGroup = $(`${UI_ELEMENT_SETTINGS.radioInputQuery}[name="${groupIdentifier}"]`);

                // Ensure correct radio group behavior: deselect all others, then select the target.
                allOriginalRadiosInGroup.prop('checked', false); // Explicitly uncheck all radios in the group.
                targetOriginalRadioInput.prop('checked', true); // Mark the specific radio as checked.

                // Update the visual state for all proxies within the same group.
                allProxiesInGroup.css('text-indent', UI_ELEMENT_SETTINGS.visualHideOffset); // Hide all proxy visuals.
                clickedProxyElement.css('text-indent', UI_ELEMENT_SETTINGS.visualShowOffset); // Show the clicked proxy's visual.

                // Trigger a 'change' event on the original input, allowing other scripts to react.
                targetOriginalRadioInput.trigger('change');
                // console.debug(`Radio group "${groupIdentifier}" item with ID "${linkedElementId}" selected.`);
            });
        }


        // Part 3: Custom styling implementation for checkbox inputs.
        // This section processes all checkbox inputs to generate their custom visual counterparts.
        let checkboxInputIndex = 0; // Distinct counter for checkbox buttons.
        const allApplicationCheckboxInputs = $(UI_ELEMENT_SETTINGS.checkboxInputQuery);

        if (allApplicationCheckboxInputs.length > 0) { // Safety check: proceed only if checkboxes exist.
            allApplicationCheckboxInputs.each(function() {
                const currentCheckboxInput = $(this);
                const uniqueProxyId = generateUniqueControlId(); // Generate a unique ID.
                const originalInputName = currentCheckboxInput.attr('name');
                const isInitiallyChecked = currentCheckboxInput.prop('checked'); // Get initial state using .prop().

                currentCheckboxInput.attr(UI_ELEMENT_SETTINGS.linkedControlIdentifierAttr, uniqueProxyId);
                currentCheckboxInput.css({ 'position': 'absolute', 'clip': 'rect(0 0 0 0)', 'overflow': 'hidden', 'margin': '-1px', 'border': '0', 'padding': '0', 'width': '1px', 'height': '1px' }); // Robust hiding.

                // Construct the custom visual replacement span element for the checkbox.
                const checkboxProxySpan = $('<span></span>', {
                    'class': UI_ELEMENT_SETTINGS.customCheckboxVisualClass,
                    'id': uniqueProxyId,
                    [UI_ELEMENT_SETTINGS.controlGroupLabelAttr]: originalInputName,
                    'html': UI_ELEMENT_SETTINGS.checkboxCheckmarkSymbol,
                    [UI_ELEMENT_SETTINGS.selectionStateAttr]: isInitiallyChecked ? 'true' : 'false' // Store initial selection state.
                });

                // Apply the 'selected' visual class if the checkbox is initially checked.
                if (isInitiallyChecked) {
                    checkboxProxySpan.addClass(UI_ELEMENT_SETTINGS.selectedVisualClass);
                }

                currentCheckboxInput.after(checkboxProxySpan);
                checkboxInputIndex++;
            });

            // Event handling for clicks on the custom checkbox proxies.
            $(document).on('click', `.${UI_ELEMENT_SETTINGS.customCheckboxVisualClass}`, function(evt) {
                const clickedProxyElement = $(this);
                const linkedElementId = clickedProxyElement.attr(UI_ELEMENT_SETTINGS.linkedControlIdentifierAttr);

                if (!linkedElementId) { // Basic validation.
                    // console.warn("Missing linked ID on checkbox proxy:", clickedProxyElement);
                    return;
                }

                const targetOriginalCheckboxInput = $(`${UI_ELEMENT_SETTINGS.checkboxInputQuery}[${UI_ELEMENT_SETTINGS.linkedControlIdentifierAttr}="${linkedElementId}"]`);

                // Toggle the 'checked' property of the hidden original checkbox.
                const newCheckedState = !targetOriginalCheckboxInput.prop('checked');
                targetOriginalCheckboxInput.prop('checked', newCheckedState);

                // Update the visual state of the proxy using the helper function.
                synchronizeCheckboxVisual(clickedProxyElement, targetOriginalCheckboxInput);

                // Trigger a 'change' event on the original input.
                targetOriginalCheckboxInput.trigger('change');
                // console.debug(`Checkbox with ID "${linkedElementId}" toggled to: ${newCheckedState}.`);
            });
        }
    });

})(jQuery, document, window); // Passing global objects as arguments for better module encapsulation.