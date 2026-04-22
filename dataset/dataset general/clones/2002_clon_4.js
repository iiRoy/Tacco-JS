+function ($) {
    "use strict";

    // --- Core Item Manager (replaces ListGroup) ---
    // A factory function to manage selection state and UI for a collection of elements.
    function createSelectionManager(containerElement, initialSettings) {
        const activeKeysTracker = new Set(); // Stores the data-key values of currently selected items
        const configuration = {
            multiSelectMode: false, // Corresponds to original's options.toggle == 'items'
            onChoiceInteraction: null, // Corresponds to original's options.click
            ...initialSettings
        };

        // Internal helper to update the visual class of an option element
        function updateVisualClass(optionElement, shouldBeActive) {
            if (shouldBeActive) {
                optionElement.classList.add('selected-choice');
            } else {
                optionElement.classList.remove('selected-choice');
            }
        }

        // Renders the current selection state onto the UI
        function renderOptionStates() {
            containerElement.querySelectorAll('[data-key]').forEach(function(optionElement) {
                const itemKey = optionElement.getAttribute('data-key');
                updateVisualClass(optionElement, activeKeysTracker.has(itemKey));
            });
        }

        // Handles click events on individual choice options
        function handleChoiceElementClick(event) {
            const interactedOption = event.target.closest('[data-key]');
            if (!interactedOption || interactedOption.classList.contains('choice-unavailable')) {
                return; // Ignore clicks on non-option elements or disabled options
            }

            const optionIdentifier = interactedOption.getAttribute('data-key');

            if (configuration.multiSelectMode) {
                // Toggle selection for multi-select
                if (activeKeysTracker.has(optionIdentifier)) {
                    activeKeysTracker.delete(optionIdentifier);
                } else {
                    activeKeysTracker.add(optionIdentifier);
                }
            } else {
                // Single-select behavior: clear all others, then select current
                activeKeysTracker.clear();
                activeKeysTracker.add(optionIdentifier);
            }

            renderOptionStates(); // Update the UI to reflect new state
            interactedOption.blur(); // Remove focus from the clicked element

            if (typeof configuration.onChoiceInteraction === 'function') {
                // Call the user-defined callback with the clicked element as 'this' and current active keys
                configuration.onChoiceInteraction.call(interactedOption, Array.from(activeKeysTracker));
            }
            event.preventDefault(); // Prevent default action for links or buttons
        }

        // Public interface for the selection manager
        const managerInterface = {
            // Activates specific choice options by their data-key values
            activateOptions: function(keysToEnable) {
                if (!Array.isArray(keysToEnable)) {
                    keysToEnable = [keysToEnable];
                }
                keysToEnable.forEach(key => activeKeysTracker.add(String(key)));
                renderOptionStates();
                return this;
            },

            // Deactivates specific choice options or all options
            deactivateOptions: function(keysToDisable) {
                if (keysToDisable === '*') {
                    activeKeysTracker.clear(); // Clear all active keys
                } else {
                    if (!Array.isArray(keysToDisable)) {
                        keysToDisable = [keysToDisable];
                    }
                    keysToDisable.forEach(key => activeKeysTracker.delete(String(key)));
                }
                renderOptionStates();
                return this;
            },

            // Returns an array of currently active data-key values
            retrieveActiveKeys: function() {
                return Array.from(activeKeysTracker);
            },

            // Initializes the manager by attaching event listeners and rendering initial state
            initialize: function() {
                containerElement.addEventListener('click', handleChoiceElementClick);
                if (configuration.multiSelectMode) {
                    containerElement.setAttribute('data-selection-mode', 'multiple');
                }
                renderOptionStates(); // Initial UI render
            }
        };

        managerInterface.initialize();
        return managerInterface;
    }

    // --- Select Element Integration (replaces SelectList) ---
    // A factory function to transform a <select> element into a custom visual selection component.
    function createEnhancedSelector(originalSelectElement, transformationSettings) {
        const visualComponent = document.createElement('div'); // Using a div instead of a ul
        visualComponent.classList.add('visual-choice-box'); // Custom class name
        visualComponent.setAttribute('role', 'listbox'); // For accessibility

        if (originalSelectElement.multiple) {
            visualComponent.setAttribute('data-selection-mode', 'multiple');
        }

        // Populate the visual component based on the original <select>'s options
        Array.from(originalSelectElement.options).forEach(option => {
            const choiceVisual = document.createElement('span'); // Using a span instead of an anchor
            choiceVisual.classList.add('choice-option'); // Custom class name
            choiceVisual.setAttribute('data-key', option.value);
            choiceVisual.textContent = option.textContent;
            choiceVisual.setAttribute('tabindex', '0'); // Make it focusable

            if (option.disabled) {
                choiceVisual.classList.add('choice-unavailable');
            }
            if (option.style.display === 'none') {
                choiceVisual.classList.add('choice-hidden');
            }
            visualComponent.appendChild(choiceVisual);
        });

        originalSelectElement.parentNode.insertBefore(visualComponent, originalSelectElement);
        originalSelectElement.style.display = 'none'; // Hide the original select element

        let selectionController; // Will hold the instance of createSelectionManager

        // Synchronizes the original <select>'s value to the visual component's state
        function propagateSelectValueToVisual() {
            const selectedValues = $(originalSelectElement).val(); // Use jQuery val() for consistency
            selectionController.deactivateOptions('*'); // Clear all visual selections
            if (selectedValues !== null && selectedValues !== undefined) {
                const valuesToActivate = Array.isArray(selectedValues) ? selectedValues : [selectedValues];
                selectionController.activateOptions(valuesToActivate);
            }
        }

        // Synchronizes the visual component's state back to the original <select> element
        function propagateVisualStateToSelect(activeKeysFromVisual) {
            let finalValueForSelect = activeKeysFromVisual;
            if (!originalSelectElement.multiple && activeKeysFromVisual.length === 1) {
                finalValueForSelect = activeKeysFromVisual[0];
            } else if (!originalSelectElement.multiple && activeKeysFromVisual.length === 0) {
                finalValueForSelect = ''; // Single select with no active choice should be empty string
            }
            // Update the original select's value and trigger its change event
            $(originalSelectElement).val(finalValueForSelect).trigger('change');
        }

        // Initialize the selection manager for the newly created visual component
        selectionController = createSelectionManager(visualComponent, {
            multiSelectMode: originalSelectElement.multiple,
            onChoiceInteraction: function(activeKeys) {
                // 'this' refers to the clicked choiceVisual element, preserving original callback context
                propagateVisualStateToSelect(activeKeys); // Update the hidden select
                if (typeof transformationSettings === 'object' && transformationSettings.onChoiceClick) {
                    transformationSettings.onChoiceClick.call(this, activeKeys); // Call user-defined callback
                }
            }
        });

        // Initial synchronization from the original select element to the visual component
        propagateSelectValueToVisual();

        // Listen for 'change' events on the original select to keep the visual component updated
        $(originalSelectElement).on('change', propagateSelectValueToVisual);

        // Public API for the enhanced selector (used by the jQuery plugin)
        const enhancedApi = {
            getVisualElement: () => visualComponent,
            getUnderlyingSelect: () => originalSelectElement,
            activateOptions: (keys) => selectionController.activateOptions(keys),
            deactivateOptions: (keys) => selectionController.deactivateOptions(keys),
            retrieveActiveKeys: () => selectionController.retrieveActiveKeys()
        };

        return enhancedApi;
    }

    // --- jQuery Plugin Definition (replaces $.fn.listgroup) ---
    $.fn.choiceBox = function(actionOrConfiguration) {
        return this.each(function() {
            const currentDomElement = this;
            let componentManager = $(currentDomElement).data('choiceBoxController');

            if (!componentManager) {
                // Initialize the component if it hasn't been already
                if (currentDomElement.tagName.toLowerCase() === 'select') {
                    // For <select> elements, create the enhanced selector
                    componentManager = createEnhancedSelector(currentDomElement, actionOrConfiguration);
                } else {
                    // For other elements (e.g., a div acting as a choice container)
                    const managerConfig = {
                        multiSelectMode: $(currentDomElement).attr('data-selection-mode') === 'multiple',
                        onChoiceInteraction: typeof actionOrConfiguration === 'object' && actionOrConfiguration.onChoiceClick ? actionOrConfiguration.onChoiceClick : null
                    };
                    componentManager = createSelectionManager(currentDomElement, managerConfig);
                }
                $(currentDomElement).data('choiceBoxController', componentManager);
            }

            // Handle method calls or configuration updates
            if (typeof actionOrConfiguration === 'object') {
                if (actionOrConfiguration.activate) {
                    componentManager.activateOptions(actionOrConfiguration.activate);
                }
                if (actionOrConfiguration.deactivate) {
                    componentManager.deactivateOptions(actionOrConfiguration.deactivate);
                }
            }
        });
    };

    // Auto-initialization on DOM ready
    $(function() {
        // Automatically initialize elements with 'visual-choice-box' class or <select> elements
        // explicitly marked for transformation with 'data-visual-choice-box-init' attribute.
        $('.visual-choice-box, select[data-visual-choice-box-init]').choiceBox();
    });

}(jQuery);