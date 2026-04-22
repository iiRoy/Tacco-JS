(function pageInteractionUtilities() {
    const observationConfiguration = { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] };

    const errorStatusMonitor = new MutationObserver(function(recordList) {
        const impactedBlocks = new Set();

        recordList.forEach(function(currentRecord) {
            // If child nodes were added or removed
            if (currentRecord.type === 'childList') {
                [...currentRecord.addedNodes, ...currentRecord.removedNodes].forEach(node => {
                    if (node.nodeType === 1) { // Ensure it's an element node
                        let potentialBlock = node.closest('section[data-input-block]');
                        if (potentialBlock) impactedBlocks.add(potentialBlock);
                        // Also check if the node itself contains an error indicator
                        if (node.querySelector('span[data-validation-display="failed"]')) {
                            potentialBlock = node.closest('section[data-input-block]');
                            if (potentialBlock) impactedBlocks.add(potentialBlock);
                        }
                    }
                });
            }
            // If an attribute (like class) changed on an element
            else if (currentRecord.type === 'attributes' && currentRecord.attributeName === 'class') {
                let potentialBlock = currentRecord.target.closest('section[data-input-block]');
                if (potentialBlock) impactedBlocks.add(potentialBlock);
                // If the target itself is an error indicator, its parent block needs re-evaluation
                if (currentRecord.target.matches('span[data-validation-display="failed"]')) {
                    potentialBlock = currentRecord.target.closest('section[data-input-block]');
                    if (potentialBlock) impactedBlocks.add(potentialBlock);
                }
            }
        });

        // Process each unique affected block to synchronize its state
        impactedBlocks.forEach(blockElement => {
            const hasProblem = blockElement.querySelector('span[data-validation-display="failed"]');
            if (hasProblem) {
                blockElement.classList.add('problem-state');
            } else {
                blockElement.classList.remove('problem-state');
            }
        });
    });

    // Start observing the document body for changes once the DOM is fully loaded.
    // This replaces the global $.validator.setDefaults highlight/unhighlight functionality.
    document.addEventListener('DOMContentLoaded', function() {
        errorStatusMonitor.observe(document.body, observationConfiguration);
    });

})();

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initial styling for validation messages.
    // Original: $('span.field-validation-valid, span.field-validation-error').each(function () { $(this).addClass('help-inline'); });
    Array.from(document.querySelectorAll('span[data-validation-display="passed"], span[data-validation-display="failed"]'))
        .forEach(function(messageContainer) {
            messageContainer.classList.add('support-text');
        });

    // Function to synchronize the 'problem-state' class on input blocks.
    // This centralizes the logic for applying/removing the 'problem-state' class based on child error messages.
    function synchronizeGroupValidity(containerElement) {
        const structuralBlocks = containerElement.querySelectorAll('section[data-input-block]');
        structuralBlocks.forEach(function(currentBlock) {
            const problemIndicator = currentBlock.querySelector('span[data-validation-display="failed"]');
            if (problemIndicator) {
                currentBlock.classList.add('problem-state');
            } else {
                currentBlock.classList.remove('problem-state');
            }
        });
    }

    // 2. Initial error state application on page load.
    // Original: $('form').each(function () { $(this).find('div.control-group').each(function () { ... }); });
    // This applies 'problem-state' to blocks that already have server-side or pre-rendered errors.
    synchronizeGroupValidity(document);

    // 3. Form submission logic: Updates error states for all input blocks within the submitted form.
    // Original: $('form').submit(function () { ... });
    Array.from(document.querySelectorAll('form[data-form-type="validation"]'))
        .forEach(function(interactiveForm) {
            interactiveForm.addEventListener('submit', function(evt) {
                // The original code's `$(this).valid()` call is part of an external validation plugin.
                // We assume that plugin (or an equivalent mechanism) updates the
                // `span[data-validation-display="failed"]` elements before this event listener fires.
                // Our role here is to ensure the parent 'section[data-input-block]' elements reflect these changes.
                synchronizeGroupValidity(interactiveForm);
                // The default form submission is not prevented here, matching the original's behavior.
                // If validation fails, the external validation plugin would typically prevent submission.
            });
        });
});