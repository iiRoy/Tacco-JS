'use strict';

/**
 * Utility for implementing Toggle Widget as a directive within an Angular application.
 * @NOTE Consider implementing Toggle Widget as a service in the future.
 */
angular.module('ToggleWidget', [])
    .directive('toggleControl', ['$globalScope', '$delayService', '$debugLog', '$expressionParser', function($globalScope, $delayService, $debugLog, $expressionParser) {

        /**
         * Initializes the provided HTML element as a Toggle Widget.
         *
         * The delay service is utilized as a workaround for compatibility within tabbed interfaces.
         *
         * @param currentScope            The current Angular scope.
         * @param htmlElement             The DOM element to be transformed.
         * @param elementAttributes       Attributes associated with the HTML element.
         * @param dataModel               The ngModel controller for data binding.
         */
        function bindToggleComponent(currentScope, htmlElement, elementAttributes, dataModel) {
            if (!dataModel) {
                return false;
            }

            var configOptions = {}; // Configuration object for the widget.
            try {
                configOptions = $expressionParser(elementAttributes.toggleControl)(currentScope);
            } catch (parsingError) {
                // Ignore parsing errors for now.
            }

            var widgetInstance; // The actual Toggle Widget instance.
            var priorDisabledState; // Stores the previous disabled state to detect changes.

            // Observe changes to the 'disabled' attribute to trigger widget re-initialization.
            elementAttributes.$observe('disabled', function(attributeValue) {
                if (attributeValue === undefined || attributeValue === priorDisabledState) {
                    return; // No meaningful change, or first run.
                } else {
                    priorDisabledState = attributeValue; // Update the stored state.
                }
                setupToggleWidget(); // Re-create the widget.
            });

            function setupToggleWidget() {
                $delayService(function() {
                    // Remove any existing widget instance before creating a new one.
                    if (widgetInstance) {
                        angular.element(widgetInstance.switcher).remove();
                    }
                    // Create a new Toggle Widget instance reflecting the latest attributes.
                    widgetInstance = new $globalScope.Switchery(htmlElement[0], configOptions);
                    var toggleElement = widgetInstance.element;
                    toggleElement.checked = currentScope.initialSetting; // Set initial check state.
                    widgetInstance.setPosition(false); // Adjust position if needed.
                    toggleElement.addEventListener('change', function(changeEvent) {
                        currentScope.$apply(function() {
                            dataModel.$setViewValue(toggleElement.checked); // Update model on change.
                        });
                    });
                }, 0); // Execute immediately after current digest cycle.
            }
            setupToggleWidget(); // Initial setup of the widget.
        }

        return {
            require: 'ngModel', // Requires ngModel for data binding.
            restrict: 'AE', // Can be used as an attribute or an element.
            scope: {
                initialSetting: '=ngModel'
            }, // Isolate scope with two-way binding to ngModel.
            link: bindToggleComponent // The linking function for the directive.
        };
    }]);