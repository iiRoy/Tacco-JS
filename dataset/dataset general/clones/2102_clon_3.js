// A more robust and refactored module for toggle controls.

// Define our primary application module for interactive UI elements.
angular.module('ToggleControlModule', [])
    // Register a specialized directive for creating an enhanced toggle switch.
    // This directive leverages a third-party library to provide a custom visual toggle.
    .directive('toggleSwitch', ['globalScope', 'deferExecution', 'expressionEvaluator', function(globalScope, deferExecution, expressionEvaluator) {

        // Internal helper function to set up the toggle switch behavior and synchronize with ngModel.
        // It handles initial rendering, attribute observation, and model updates.
        function bindToggleBehavior(componentScope, elementRef, attributeSet, modelController) {
            // Crucial validation: if no ngModel controller is provided, this directive cannot function.
            // This ensures the directive is only applied where a model can be bound.
            if (!modelController) {
                console.warn('Toggle Switch directive requires ngModel. Skipping initialization.');
                return; // Exit early if ngModel is missing.
            }

            let controlConfig = {}; // Configuration object for the underlying toggle library.
            const defaultControlOptions = {}; // A baseline for toggle configuration.

            // Attempt to parse configuration from the directive's attribute.
            // Provide a default empty object if parsing fails or yields nothing.
            try {
                const parsedOptions = expressionEvaluator(attributeSet.toggleSwitch)(componentScope);
                if (typeof parsedOptions === 'object' && parsedOptions !== null) {
                    controlConfig = angular.extend({}, defaultControlOptions, parsedOptions);
                }
            } catch (parsingError) {
                console.error('Error parsing toggleSwitch attribute configuration:', parsingError);
                // Fallback to default empty config if parsing fails.
                controlConfig = defaultControlOptions;
            }

            let toggleInstance = null; // Holds the instance of the third-party toggle object.
            let lastKnownDisableState; // Stores the previous value of the 'disabled' attribute for change detection.
            let isControlInitialized = false; // Flag to track if the switch has been set up initially.

            // Watch for changes in the 'disabled' attribute to dynamically enable/disable the switch.
            attributeSet.$observe('disabled', function(currentDisableState) {
                // If the attribute value hasn't changed or is undefined, no action is needed.
                // This prevents unnecessary re-initializations.
                if (currentDisableState === undefined || currentDisableState === lastKnownDisableState) {
                    return;
                }

                // Update the last known state for future comparisons.
                lastKnownDisableState = currentDisableState;
                // Re-initialize the switch to apply the new disabled state.
                setupToggleComponent();
            });

            // Function to handle updating the ngModel when the toggle state changes.
            const updateModelValue = function(currentCheckedState) {
                componentScope.$apply(function() {
                    modelController.$setViewValue(currentCheckedState);
                });
            };

            // Core function to initialize or re-initialize the visual toggle component.
            function setupToggleComponent() {
                // Use deferExecution (angular's $timeout) to ensure DOM rendering is complete,
                // especially useful in scenarios like tab switching or dynamic content loading.
                deferExecution(function() {
                    // Before creating a new instance, clean up any existing one to prevent memory leaks
                    // and ensure the DOM is properly updated.
                    if (toggleInstance) {
                        // The 'switcher' property typically refers to the wrapper element created by the library.
                        globalScope.angular.element(toggleInstance.switcher).remove();
                        toggleInstance = null; // Clear the reference.
                    }

                    // Ensure the target element exists before attempting to initialize the switchery component.
                    if (!elementRef[0]) {
                        console.error('Target element for toggle switch not found. Cannot initialize.');
                        return;
                    }
                    
                    // Validate that Switchery constructor is available before proceeding.
                    if (typeof globalScope.Switchery !== 'function') {
                        console.error('Switchery library not found on window object. Please ensure it is loaded.');
                        return;
                    }

                    // Create a new instance of the Switchery toggle.
                    toggleInstance = new globalScope.Switchery(elementRef[0], controlConfig);
                    const inputElement = toggleInstance.element; // Get the underlying native input element.

                    // Set the initial checked state based on the ngModel's initial value.
                    // This ensures the visual state matches the model's data.
                    inputElement.checked = componentScope.initValue;
                    
                    // Explicitly set the visual position of the toggle to reflect its checked state.
                    // This is sometimes needed for proper initial rendering, especially in edge cases.
                    toggleInstance.setPosition(false);

                    // Attach an event listener to the native input element to detect changes.
                    // When the user interacts with the toggle, update the ngModel.
                    inputElement.addEventListener('change', function(eventObject) {
                        updateModelValue(inputElement.checked); // Pass the new state to the model updater.
                    });

                    isControlInitialized = true; // Mark as initialized.
                    // Apply initial disabled state based on attribute.
                    if (attributeSet.disabled) {
                        toggleInstance.disable();
                    } else {
                        toggleInstance.enable();
                    }
                    
                }, 0); // Execute immediately after current digest cycle.
            }

            // Perform the initial setup of the toggle switch when the directive links.
            setupToggleComponent();
        }

        // Directive Definition Object (DDO)
        return {
            require: 'ngModel', // This directive requires ngModel to function correctly.
            restrict: 'AE',    // Can be used as an attribute or an element.
            // Isolate scope: 'initValue' is bound to the ngModel's value.
            // This provides a clear channel for initial value and updates from the model.
            scope: {
                initValue: '=ngModel'
            },
            link: bindToggleBehavior // The linking function that sets up the directive's behavior.
        };
    }]);