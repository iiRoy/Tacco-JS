const initializeResourceHandler = (configuration) => {
    /*
     * This core module manages the dynamic inclusion of resource identifiers into a form
     * prior to submission. It scans for specific elements representing attached files
     * or resources, extracts their unique IDs, and injects these IDs as hidden input
     * fields. This ensures that server-side processing can correctly identify and
     * handle all associated resources.
     *
     * The `configuration` object defines the behavior and target elements:
     *   - `jqContext`: The jQuery object, crucial for all DOM manipulations. This
     *                  parameter acts as the primary dependency injection point for jQuery.
     *   - `mainContainerId`: A string representing the DOM 'id' of the parent element
     *                        that encapsulates all resource link elements.
     *   - `targetInputName`: The base string used for the 'name' attribute of the
     *                        generated hidden input fields (e.g., 'attached_items[]').
     *   - `triggerSelector`: A CSS selector targeting the button or element whose
     *                        click event should initiate the resource collection and
     *                        potentially form submission.
     *   - `lockOnUpload`: A boolean flag. If `true`, the submission trigger will
     *                     be prevented from submitting the form if an active upload
     *                     progress bar is detected within the `mainContainerId`.
     */

    // --- Type III: Guard clauses and initial setup ---

    // Ensure jQuery context is provided and configuration is valid
    if (!configuration || typeof configuration.jqContext !== 'function') {
        console.error("Resource attachment handler: Invalid or missing jQuery context in configuration.");
        return;
    }

    // Destructure configuration for more readable access to parameters
    const {
        jqContext: $,
        mainContainerId: rootElementIdentifier,
        targetInputName: outputFieldName,
        triggerSelector: submissionInitiatorSelector,
        lockOnUpload: preventSubmissionWhenActive
    } = configuration;

    // A flag to prevent multiple initializations of the same handler for a given context
    // This is a simple global flag, for more complex scenarios, scope it per container.
    if (window._resourceHandlerActive === undefined) {
        window._resourceHandlerActive = {};
    }
    if (window._resourceHandlerActive[rootElementIdentifier]) {
        console.warn(`Resource handler for container '${rootElementIdentifier}' has already been activated. Skipping re-initialization.`);
        return;
    }
    window._resourceHandlerActive[rootElementIdentifier] = true; // Mark as initialized

    // --- Type III: Helper constants and utility functions ---

    // Define common selectors as constants for maintainability
    const RESOURCE_ITEM_CLASS = '.filelink';
    const UPLOAD_PROGRESS_INDICATOR = '.fileupload-progressbar';
    const HIDDEN_INPUT_TARGET_ID = '#hidden_container'; // Assumed fixed ID for the injection point

    /**
     * Checks if a specified element is currently visible within the DOM.
     * @param {string} selector - The CSS selector for the element to check.
     * @returns {boolean} - True if the element is visible, false otherwise.
     */
    const isDomElementVisible = (selector) => {
        return $(selector).is(':visible');
    };

    /**
     * Generates the HTML string for a single hidden input field.
     * @param {string} value - The value for the input field.
     * @param {string} name - The base name for the input field (will be suffixed with '[]').
     * @returns {string} - The HTML string for the hidden input.
     */
    const constructHiddenInputHtml = (value, name) => {
        return `<input type="hidden" value="${value}" name="${name}[]" data-src-module="resource-handler-v2"/>`;
    };

    // --- Type II: Reformat, rename, rewrite comments ---

    // Ensure the DOM is fully loaded before attempting to attach event handlers or manipulate elements.
    $(document).ready(() => {

        /**
         * Scans the designated container for resource links, extracts their IDs,
         * and injects corresponding hidden input fields into the form.
         * This ensures resource IDs are sent with the form submission.
         */
        const gatherAndEmbedResourceReferences = () => {
            const collectedResourceIds = [];

            // Iterate over each resource link element within the main container
            $(`#${rootElementIdentifier} ${RESOURCE_ITEM_CLASS}`).each((indexPos, currentResourceLink) => {
                const resourceId = $(currentResourceLink).attr('id');
                // Type III: Added a check for valid resource ID
                if (resourceId && resourceId.trim() !== '') {
                    collectedResourceIds.push(resourceId);
                } else {
                    console.warn(`Encountered a resource link without a valid 'id' attribute:`, currentResourceLink);
                }
            });

            // Type III: Guard clause for no resources found
            if (collectedResourceIds.length === 0) {
                console.info(`No resource links detected in container '${rootElementIdentifier}' for collection.`);
                return;
            }

            // Generate HTML for all hidden inputs from the collected IDs
            const allHiddenInputsHtml = collectedResourceIds.map(id =>
                constructHiddenInputHtml(id, outputFieldName)
            ).join('');

            // Identify the target container for injecting hidden inputs
            let injectionPoint = $(`#${rootElementIdentifier} ${HIDDEN_INPUT_TARGET_ID}`);

            // Type III: Fallback mechanism if the specific hidden container is not found
            if (injectionPoint.length === 0) {
                console.warn(`Target container '${HIDDEN_INPUT_TARGET_ID}' not found within '${rootElementIdentifier}'. Appending hidden inputs directly to the main container.`);
                injectionPoint = $(`#${rootElementIdentifier}`); // Fallback to main wrapper
            }

            // Append the generated hidden inputs to the identified injection point
            injectionPoint.append(allHiddenInputsHtml);
        };

        // Attach the click event listener to the designated submission trigger
        $(submissionInitiatorSelector).on('click', (eventObject) => {
            // Type III: Refactored conditional logic for clarity
            const isUploadCurrentlyActive = isDomElementVisible(`#${rootElementIdentifier} ${UPLOAD_PROGRESS_INDICATOR}`);
            const shouldBlockSubmission = preventSubmissionWhenActive && isUploadCurrentlyActive;

            if (shouldBlockSubmission) {
                // Type III: Informative console message
                console.log("Submission attempt blocked: An active resource upload is still in progress.");
                eventObject.preventDefault(); // Halt the default form submission process
            } else {
                // If no upload is active or locking is disabled, proceed to collect resources
                gatherAndEmbedResourceReferences();
                // The form will naturally submit after this function unless another handler prevents it.
            }
        });

        // Type III: Final initialization confirmation log
        console.info(`Resource attachment handler successfully initialized for container: '${rootElementIdentifier}'.`);
    });
};