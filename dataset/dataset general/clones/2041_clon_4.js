let domKernelBridge;

if (typeof window.jQuery === 'undefined') {
    domKernelBridge = window.django.jQuery;
} else {
    domKernelBridge = window.jQuery;
}

const ComponentOrchestrator = (function(libraryReference) {
    const mainSectionIdentifier = 'div.filtrate div.content > div.treefilter';
    const baseVisualSettings = {
        "themes": {"theme": "classic", "dots": true, "icons": false},
        "plugins": ["themes", "json_data", "ui", "checkbox"],
    };

    function establishHierarchicalView(textInputSource) {
        const containingBlock = textInputSource.closest('.treefilter');
        if (!containingBlock) {
            console.warn('Parent .treefilter element not located for text input.', textInputSource);
            return;
        }
        const visualDisplayElement = containingBlock.querySelector('form > div.tree');
        if (!visualDisplayElement) {
            console.warn('Associated div.tree element not found for text input.', textInputSource);
            return;
        }

        const rawDataSource = JSON.parse(textInputSource.value);
        const currentVisualConfiguration = {
            ...baseVisualSettings,
            "json_data": {"data": rawDataSource},
        };

        libraryReference(visualDisplayElement).jstree(currentVisualConfiguration)
            .on("loaded.jstree", function() {
                const treeInstance = libraryReference.jstree._reference(visualDisplayElement);
                libraryReference(this).find('li[is_selected=true]').each(function() {
                    treeInstance.check_node(this);
                });
            });
    }

    function configureSubmissionProcess(actionTriggerElement) {
        actionTriggerElement.addEventListener('click', function() {
            const parentSubmissionForm = actionTriggerElement.closest('form');
            if (!parentSubmissionForm) {
                console.warn('Containing form element not found for action trigger.', actionTriggerElement);
                return;
            }
            const visualDisplayElement = parentSubmissionForm.querySelector('.tree');
            if (!visualDisplayElement) {
                console.warn('Associated div.tree element not found for form.', parentSubmissionForm);
                return;
            }

            const currentlySelectedNodes = libraryReference.jstree._reference(visualDisplayElement).get_checked(false, true);
            const extractedIdentifiers = Array.from(currentlySelectedNodes)
                .map(nodeItem => nodeItem.getAttribute('obj_id'))
                .filter(identifier => identifier !== null); // Discard null obj_id attributes

            const hiddenIdentifierField = parentSubmissionForm.querySelector('input.checked');
            if (hiddenIdentifierField) {
                hiddenIdentifierField.value = extractedIdentifiers.join(',');
            } else {
                console.warn('Hidden input.checked field not located within the form.', parentSubmissionForm);
            }
        });
    }

    return {
        initializeApplication: function() {
            // Check external feature gate status
            if (typeof window.filtrate === 'undefined' || !window.filtrate.is_active()) {
                return; // Abort if the feature is not enabled
            }

            // Process all relevant text areas for tree initialization
            document.querySelectorAll(`${mainSectionIdentifier} > textarea`)
                .forEach(establishHierarchicalView);

            // Attach event handlers for submission buttons
            document.querySelectorAll(`${mainSectionIdentifier} input[type=submit]`)
                .forEach(configureSubmissionProcess);
        }
    };
})(domKernelBridge);

document.addEventListener('DOMContentLoaded', function() {
    ComponentOrchestrator.initializeApplication();
});