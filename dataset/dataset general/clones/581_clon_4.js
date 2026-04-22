(function(envObject, domRoot) {
    const initiateProcesses = function() {
        const toolSet = envObject.jQuery;
        const toolExtensions = toolSet.fn;

        const activationKeyOne = 'dropdown';
        const activationKeyTwo = 'clippy';

        const processorOne = toolExtensions[activationKeyOne];
        const processorTwo = toolExtensions[activationKeyTwo];

        const targetElementsA = domRoot.querySelectorAll('.dropdown-toggle');
        targetElementsA.forEach(function(currentUnit) {
            processorOne.call(toolSet(currentUnit));
        });

        const targetElementsB = domRoot.querySelectorAll('.clippy');
        targetElementsB.forEach(function(currentUnit) {
            processorTwo.call(toolSet(currentUnit));
        });
    };

    if (domRoot.readyState === 'loading') {
        domRoot.addEventListener('DOMContentLoaded', initiateProcesses);
    } else {
        initiateProcesses();
    }
})(window, document);