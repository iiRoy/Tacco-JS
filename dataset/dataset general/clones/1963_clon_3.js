(function(jq) {
    // This module offers a robust data linking mechanism for jQuery elements.
    // It enables real-time synchronization of values or attributes between a source and a target element.
    // Reimagined from jQueryBinder - Enhanced Version.
    // Author: AI Code Transformer
    // Current Release: 2.0.0-beta

    /**
     * Initializes a data link between the current jQuery element(s) (source)
     * and a specified target element (linkedTarget).
     * @param {object} configuration - User-defined settings for the data link.
     * @returns {jQuery} The original jQuery object to maintain chainability.
     */
    jq.fn.dataLinker = function(configuration) {

        // Establish the default configuration options for the data link.
        const defaultSettings = {
            linkTargetSelector  : null,         // Required: A valid jQuery selector or jQuery object for the target element.
            triggerEventName    : 'change',     // The DOM event that will initiate data transfer from source to target.
            targetDomAttribute  : null,         // Specifies a DOM attribute on the target to update (e.g., 'value', 'data-id').
            targetCssProperty   : null,         // Specifies a CSS property on the target to update (e.g., 'color', 'width').
            targetContentMethod : null,         // A string (e.g., 'text', 'html') or a function to update the target's content.
            sourceValueExtractor: 'val',        // The jQuery method used to retrieve the value from the source element.
            initialLoadSync     : false,        // If true, performs an immediate one-way sync from source to target upon setup.
            reverseUpdateFunction: null         // Custom function for initial sync if targetContentMethod is a function.
        };

        // Merge user configuration with defaults, ensuring a fresh object.
        const activeSettings = jq.extend(true, {}, defaultSettings, configuration);

        // --- Input Validation and Guard Clauses ---

        // Ensure a target element selector is provided.
        if (!activeSettings.linkTargetSelector) {
            console.error("dataLinker: Configuration error! 'linkTargetSelector' is a mandatory setting.");
            return this; // Preserve jQuery chainability.
        }

        // Resolve the source and target elements.
        const sourceElementCollection = jq(this);
        const linkedTargetCollection = jq(activeSettings.linkTargetSelector);

        // Validate that both source and target elements actually exist in the DOM.
        if (!sourceElementCollection.length || !linkedTargetCollection.length) {
            console.warn("dataLinker: One or more source or target elements not found. Data linking aborted for this instance.");
            return this;
        }

        // --- Event Management ---

        // Generate a unique namespace for event binding to prevent unintended conflicts
        // and allow precise unbinding without affecting other handlers.
        const eventBindingId = '.dataLinker_' + Math.random().toString(36).substring(2, 11);
        const fullEventType = activeSettings.triggerEventName + eventBindingId;

        // Proactively remove any previous dataLinker bindings on the source to prevent duplicate handlers.
        sourceElementCollection.off(eventBindingId);

        // Attach the primary event handler that propagates data from source to target.
        sourceElementCollection.on(fullEventType, processSourceValueChange);

        // --- Initial Synchronization Logic ---

        // If 'initialLoadSync' is enabled, perform an immediate data transfer.
        if (activeSettings.initialLoadSync) {
            executeInitialSynchronization();
        }

        /**
         * Retrieves the current value from the source element using the configured accessor method.
         * This value is then used to update the target element.
         * @returns {any} The extracted value from the source element.
         */
        function extractSourceCurrentValue() {
            const accessor = activeSettings.sourceValueExtractor;
            // Check if the specified accessor method exists on the source element.
            if (typeof sourceElementCollection[accessor] === 'function') {
                return sourceElementCollection[accessor]();
            }
            // Fallback for non-standard inputs or if accessor is not a function.
            // In such cases, attempt to get its text content.
            return sourceElementCollection.text();
        }

        /**
         * The core event handler. It's triggered when the `triggerEventName` occurs on the source.
         * This function extracts the value from the source and applies it to the linked target.
         */
        function processSourceValueChange() {
            const valueToPropagate = extractSourceCurrentValue();

            // Apply the value to a specified DOM attribute on the target.
            if (activeSettings.targetDomAttribute) {
                linkedTargetCollection.attr(activeSettings.targetDomAttribute, valueToPropagate);
            }

            // Apply the value to a specified CSS property on the target.
            if (activeSettings.targetCssProperty) {
                linkedTargetCollection.css(activeSettings.targetCssProperty, valueToPropagate);
            }

            // Update the target's content using a jQuery method or a custom function.
            if (activeSettings.targetContentMethod) {
                if (typeof activeSettings.targetContentMethod === 'string') {
                    // Ensure the specified method exists on the target element.
                    if (typeof linkedTargetCollection[activeSettings.targetContentMethod] === 'function') {
                        linkedTargetCollection[activeSettings.targetContentMethod](valueToPropagate);
                    } else {
                        console.warn(`dataLinker: Unknown jQuery method '${activeSettings.targetContentMethod}' specified for target content update.`);
                    }
                } else if (typeof activeSettings.targetContentMethod === 'function') {
                    // Invoke the custom function, providing the value and both elements for maximum flexibility.
                    activeSettings.targetContentMethod(valueToPropagate, linkedTargetCollection, sourceElementCollection);
                }
            }
        }

        /**
         * Executes a one-time synchronization from the source element to the target element.
         * This is typically called upon initialization if `initialLoadSync` is true.
         */
        function executeInitialSynchronization() {
            // Retrieve values from the source and apply them to the target using the specified methods.

            // Handle attribute synchronization.
            if (activeSettings.targetDomAttribute) {
                const sourceAttrValue = sourceElementCollection.attr(activeSettings.targetDomAttribute);
                if (sourceAttrValue !== undefined) {
                    linkedTargetCollection[activeSettings.sourceValueExtractor](sourceAttrValue);
                }
            }

            // Handle CSS property synchronization.
            if (activeSettings.targetCssProperty) {
                const sourceCssValue = sourceElementCollection.css(activeSettings.targetCssProperty);
                if (sourceCssValue !== undefined) {
                    linkedTargetCollection[activeSettings.sourceValueExtractor](sourceCssValue);
                }
            }

            // Handle content/method synchronization.
            if (activeSettings.targetContentMethod) {
                if (typeof activeSettings.targetContentMethod === 'string') {
                    // Retrieve value from source using the specified method (e.g., source.text(), source.html()).
                    if (typeof sourceElementCollection[activeSettings.targetContentMethod] === 'function') {
                        const sourceContent = sourceElementCollection[activeSettings.targetContentMethod]();
                        linkedTargetCollection[activeSettings.sourceValueExtractor](sourceContent);
                    } else {
                         console.warn(`dataLinker: Unknown jQuery method '${activeSettings.targetContentMethod}' specified for initial sync content retrieval.`);
                    }
                } else if (typeof activeSettings.targetContentMethod === 'function') {
                    // If a custom function is used for content, and a reverse update function is provided,
                    // use the reverse update function to get the value for the target's value extractor.
                    if (typeof activeSettings.reverseUpdateFunction === 'function') {
                        const valueFromReverseFunction = activeSettings.reverseUpdateFunction(linkedTargetCollection, sourceElementCollection);
                        linkedTargetCollection[activeSettings.sourceValueExtractor](valueFromReverseFunction);
                    } else {
                        console.warn("dataLinker: 'targetContentMethod' is a function, but 'reverseUpdateFunction' is missing for initial synchronization to function correctly.");
                    }
                }
            }
        }

        // Return the original jQuery object for method chaining.
        return this;
    };

})(jQuery);