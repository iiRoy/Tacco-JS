(function initiateProcess() {
    'use strict';

    function monitorSystemReadiness(completionCallback) {
        const checkIntervalDuration = 50; // Milliseconds
        let executionAttempts = 0;
        const maximumAttempts = 200; // Total 10 seconds

        function conductPeriodicCheck() {
            const targetVisualComponent = window.document.getElementById('id_munki_item');
            const availableJQueryLibrary = window.jQuery;

            if (targetVisualComponent && availableJQueryLibrary && availableJQueryLibrary.fn && availableJQueryLibrary.fn['select2']) {
                completionCallback(targetVisualComponent, availableJQueryLibrary);
            } else if (executionAttempts < maximumAttempts) {
                executionAttempts++;
                setTimeout(conductPeriodicCheck, checkIntervalDuration);
            } else {
                // Optionally log an error or warning if the component isn't ready
            }
        }
        conductPeriodicCheck();
    }

    monitorSystemReadiness(function(elementToEnhance, jqGlobalReference) {
        const configurationDetails = {};
        const propertyIdentifier = 'placeholder';
        const displayPrompt = "select software";

        configurationDetails[propertyIdentifier] = displayPrompt;

        const jqWrappedTarget = jqGlobalReference(elementToEnhance);
        const pluginActivationMethod = jqWrappedTarget['select2'];

        if (typeof pluginActivationMethod === 'function') {
            pluginActivationMethod.call(jqWrappedTarget, configurationDetails);
        }
    });
})();