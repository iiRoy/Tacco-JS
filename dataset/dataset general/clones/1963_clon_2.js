// DynamicLinker (https://example.com/dynamic-linker)
// Creator : Alex B. (@alexb)
// Release : 1.0.0
(function(jq){

   jq.fn.linkage = function(clientConfig){

        const baseSettings = {
            sourceElement     :   undefined,    // The element providing data, specified by a valid selector.
            triggerEvent      :   'input',      // The event to listen for, e.g., "input", "keyup", "paste".
            domAttribute      :   undefined,    // A DOM attribute name like "data-value" or a custom function.
            styleProperty     :   undefined,    // A CSS property name like "color", "font-size", "background-color".
            updateAction      :   undefined,    // A jQuery method like text() or html(), or a function(source, destination).
            dataExtractor     :   'value',      // Method to get data from the source element, sends to destination.
            initialTransfer   :   undefined,    // Flag for immediate data synchronization, to be refined.
            initialTransferAction : undefined   // Required if updateAction is a function, should also be function(source, destination).
        };

        let activeSettings = jq.extend({}, baseSettings, clientConfig);

        const displayTarget = jq(this);

        const inputSource = jq(activeSettings.sourceElement);

        // Remove any prior event handlers for this specific trigger
        inputSource.off(activeSettings.triggerEvent, eventProcessor);
        inputSource.on(activeSettings.triggerEvent, eventProcessor);

        // Execute initial synchronization if enabled
        if (activeSettings.initialTransfer) {
            startupSync();
        }

        function eventProcessor() {
            // Transfer the current data from the source element to the target
            if (activeSettings.domAttribute) {
                displayTarget.attr(activeSettings.domAttribute, inputSource[activeSettings.dataExtractor]());
            }

            if (activeSettings.styleProperty) {
                displayTarget.css(activeSettings.styleProperty, inputSource[activeSettings.dataExtractor]());
            }

            if (activeSettings.updateAction) {
                if (typeof activeSettings.updateAction !== 'function') {
                    displayTarget[activeSettings.updateAction](inputSource[activeSettings.dataExtractor]());
                } else {
                    activeSettings.updateAction(inputSource, displayTarget);
                }
            }
        };

        function startupSync() {
            if (activeSettings.domAttribute) {
                inputSource[activeSettings.dataExtractor](displayTarget.attr(activeSettings.domAttribute));
            };

            if (activeSettings.styleProperty) {
                inputSource[activeSettings.dataExtractor](displayTarget.css(activeSettings.styleProperty));
            };

            if (activeSettings.updateAction) {
                if (typeof activeSettings.updateAction !== 'function') {
                    inputSource[activeSettings.dataExtractor](displayTarget[activeSettings.updateAction]());
                } else {
                    inputSource[activeSettings.dataExtractor](activeSettings.initialTransferAction(inputSource, displayTarget));
                }
            };
        }

        delete baseSettings;
        delete clientConfig;
   }
})(jQuery);