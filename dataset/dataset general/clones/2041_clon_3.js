let AppJQuery = window.AppJQuery || (window.django && window.django.jQuery);

if (!AppJQuery) {
    console.error("Critical Dependency Missing: AppJQuery reference not found. Filtering features will not be initialized.");
} else {
    AppJQuery(document).ready(function() {
        "use strict";

        // Define constants for the main structural selectors to improve readability and maintainability.
        const PRIMARY_FILTER_SECTION = 'div.filtrate';
        const CONTENT_WRAPPER = 'div.content';
        const TREE_COMPONENT_WRAPPER = 'div.treefilter';
        const BASE_COMPONENT_SELECTOR = `${PRIMARY_FILTER_SECTION} ${CONTENT_WRAPPER} > ${TREE_COMPONENT_WRAPPER}`;

        // Utility function to safely parse JSON strings, providing a default value on failure.
        function safelyParseJson(jsonStringVal, defaultResult = []) {
            if (!jsonStringVal || typeof jsonStringVal !== 'string') {
                return defaultResult;
            }
            try {
                const parsedContent = AppJQuery.parseJSON(jsonStringVal);
                // Ensure the parsed result is a valid object or array, otherwise return default.
                return (typeof parsedContent === 'object' && parsedContent !== null) ? parsedContent : defaultResult;
            } catch (parsingError) {
                console.warn("JSON parsing failed for input:", jsonStringVal, "Error:", parsingError.message);
                return defaultResult;
            }
        }

        // Pre-check: Verify if the filtration module is active. If not, halt further initialization.
        // This serves as an initial guard clause for the entire script's execution.
        if (typeof window.filtrateModule === 'undefined' || !window.filtrateModule.isActive || !window.filtrateModule.isActive()) {
            console.info("Filtration module is not enabled or its status could not be determined. Skipping tree filter setup.");
            return;
        }

        console.log("Initiating setup for filter tree components...");

        // Iterate over each textarea element designated for jstree data within the filter UI.
        AppJQuery(`${BASE_COMPONENT_SELECTOR} > textarea`).each(function() {
            const currentDataTextArea = AppJQuery(this); // Reference to the current textarea.
            const containerFormElement = currentDataTextArea.closest('form'); // Find the closest parent form.

            // Locate the specific div where the jstree will be rendered.
            const treeRenderTarget = containerFormElement.find('div.tree');

            // Validate that the tree rendering target exists.
            if (treeRenderTarget.length === 0) {
                console.error(`Skipping tree initialization: No target 'div.tree' found for textarea (ID: ${currentDataTextArea.attr('id') || 'N/A'}).`);
                return;
            }

            // Define the configuration options for the jstree instance.
            const jstreeVisualThemes = { "theme": "classic", "dots": true, "icons": false };
            const jstreeFunctionalPlugins = [ "themes", "json_data", "ui", "checkbox" ];
            const initialJstreeData = safelyParseJson(currentDataTextArea.val());

            // Initialize the jstree on the designated element with its configuration.
            const jstreeInstanceHandle = treeRenderTarget.jstree({
                "themes" : jstreeVisualThemes,
                "plugins": jstreeFunctionalPlugins,
                "json_data": { "data": initialJstreeData },
            });

            // Attach an event handler to execute actions once the jstree has fully loaded its data.
            jstreeInstanceHandle.on("loaded.jstree", function (loadEventData) {
                const currentTreeContainer = AppJQuery(this); // The DOM element of the loaded tree.
                const jstreeApiReference = AppJQuery.jstree._reference(currentTreeContainer); // Obtain the jstree API.

                // If the API reference is unavailable, log an error and prevent further operations.
                if (!jstreeApiReference) {
                    console.error("JSTree API reference could not be obtained after load. Node checking aborted.");
                    return;
                }

                // Identify and check tree nodes that are pre-marked as selected.
                currentTreeContainer.find('li[is_selected=true]').each(function() {
                    jstreeApiReference.check_node(AppJQuery(this));
                });
            });
        });

        // Set up the click event handler for the submit button within the filter component.
        AppJQuery(`${BASE_COMPONENT_SELECTOR} input[type=submit]`).on('click', function(clickEvent) {
            clickEvent.preventDefault(); // Prevent the default form submission behavior.

            const clickedSubmitButton = AppJQuery(this);
            const containingParentForm = clickedSubmitButton.closest('form'); // Ascend to find the containing form.

            // Ensure the form element exists.
            if (containingParentForm.length === 0) {
                console.error("Submit button's parent form could not be located. Cannot process selection.");
                return;
            }

            const associatedTreeDisplay = containingParentForm.find('.tree'); // Find the jstree's rendering div.

            // Validate the presence of the tree display element.
            if (associatedTreeDisplay.length === 0) {
                console.error("Associated JSTree display element not found within the form. Cannot retrieve checked nodes.");
                return;
            }

            const jstreeInstanceApi = AppJQuery.jstree._reference(associatedTreeDisplay); // Get the JSTree API.

            // Verify the JSTree API is available.
            if (!jstreeInstanceApi) {
                console.error("JSTree API reference is missing for the associated tree. Cannot retrieve checked nodes.");
                return;
            }

            // Retrieve all checked nodes from the jstree, including partially checked parents.
            const rawCheckedNodesCollection = jstreeInstanceApi.get_checked(false, true);

            const collectedObjectIdentifiers = [];
            // Iterate through the collected nodes to extract their 'obj_id' attributes.
            for (let i = 0; i < rawCheckedNodesCollection.length; i++) {
                const currentNodeElement = AppJQuery(rawCheckedNodesCollection[i]);
                const objectIdValue = currentNodeElement.attr('obj_id');

                if (objectIdValue) {
                    collectedObjectIdentifiers.push(objectIdValue);
                } else {
                    console.warn(`Node (ID: ${currentNodeElement.attr('id') || 'N/A'}) found without 'obj_id' attribute; it will be excluded from the submission.`);
                }
            }

            // Concatenate the extracted IDs into a comma-separated string.
            const finalSelectionString = collectedObjectIdentifiers.join(",");

            // Locate the hidden input field that stores the selected values for form submission.
            const targetHiddenInput = containingParentForm.find('input.checked');

            // Update the value of the hidden input, if it exists.
            if (targetHiddenInput.length > 0) {
                targetHiddenInput.val(finalSelectionString);
                console.log("Hidden input 'input.checked' updated with values:", finalSelectionString);
            } else {
                console.error("Target hidden input field 'input.checked' not found within the form. Selection data not saved.");
            }
            // At this point, the form could be manually submitted if needed: containingParentForm.submit();
        });

        console.log("Filter tree component setup completed.");
    });
}