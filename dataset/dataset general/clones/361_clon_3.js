angular.module('ngDojoWrapper', []).directive('dojoComponentEmbedder', ['$asyncScheduler', function($asyncScheduler) {

    // Internal utility function to safely parse attribute strings into JavaScript configuration objects.
    // This handles various forms of object literals often found in HTML attributes,
    // attempting JSON parsing first for strictness, then falling back to a safer evaluation.
    const parseConfigurationString = (configSource) => {
        // Guard clause for invalid or empty input strings.
        if (!configSource || typeof configSource !== 'string' || configSource.trim().length === 0) {
            console.debug("No valid configuration string provided. Returning an empty object.");
            return {};
        }

        let processedConfig = {};
        try {
            // Attempt to parse the string as a strict JSON object.
            // This is the most secure method if the input adheres to JSON standards.
            processedConfig = JSON.parse(configSource);
        } catch (jsonParseError) {
            // If JSON parsing fails, the string might be a JavaScript object literal (e.g., unquoted keys).
            // We'll wrap it and use the Function constructor for a safer form of evaluation than direct `eval()`.
            // The original code wrapped in `[{...}]` to create an array of objects, so we mimic that.
            const scriptToEvaluate = '[{' + configSource + '}]';
            try {
                const evaluationResult = (new Function('return ' + scriptToEvaluate))();
                // Ensure the result is an array containing at least one object.
                if (Array.isArray(evaluationResult) && evaluationResult.length > 0 && typeof evaluationResult[0] === 'object') {
                    processedConfig = evaluationResult[0];
                } else {
                    console.error("Evaluation of configuration string yielded an unexpected or non-object result:", evaluationResult);
                    return {}; // Return empty on unexpected evaluation result.
                }
            } catch (evaluationError) {
                console.error(`Failed to interpret configuration string "${configSource}". JSON error: ${jsonParseError.message}. Evaluation error: ${evaluationError.message}.`, {
                    originalInput: configSource,
                    jsonParseIssue: jsonParseError,
                    evalIssue: evaluationError
                });
                return {}; // Return empty object on any parsing or evaluation failure.
            }
        }
        return processedConfig;
    };

    // Define a constant array for Dojo widget types that require 'item' property handling.
    const SELECT_LIKE_WIDGET_TYPES = Object.freeze([
        'dijit/form/FilteringSelect',
        'dijit/form/Select',
        'dijit/form/ComboBox' // Adding ComboBox as it often uses 'item'
    ]);

    // The directive definition object for Angular.
    return {
        restrict: "A", // This directive is activated only when used as an attribute.
        replace: false, // Specifies that the directive's template should not replace the original element. (Default value)
        transclude: false, // Specifies that the content inside the directive should not be transcluded. (Default value)
        require: '?ngModel', // Optionally attempts to inject the ngModelController if present on the element.

        // Define an isolated scope for the directive to prevent prototypal inheritance and promote component-like behavior.
        scope: {
            modelValue: '=ngModel', // Bi-directional binding for the core model value.
            elementClicked: '&ngClick', // Expression binding for handling click events.
            valueModified: '&ngChange', // Expression binding for handling value change events.
            dataStoreProvider: '&dojoStore', // Expression binding for a function that returns a Dojo data store.
            componentProperties: '@dojoProps', // One-way string binding for Dojo widget initialization properties.
            renderedTextValue: '=?dojoDisplayValue' // Optional bi-directional binding for the displayed text value of the widget.
        },

        /**
         * The linking function, executed after the template has been cloned.
         * It's responsible for DOM manipulation, setting up event listeners, and watches.
         * @param {object} componentScope - The isolated scope of this directive.
         * @param {object} hostElement - The jQuery/jqLite wrapped element that this directive is on.
         * @param {object} componentAttributes - A hash of normalized attributes from the host element.
         * @param {object} modelController - The ngModelController instance, if `require: '?ngModel'` was met.
         */
        link: function(componentScope, hostElement, componentAttributes, modelController) {
            let integratedDojoWidget = null; // A private variable to hold the instantiated Dojo widget instance.

            // Determine the Dojo widget path from the attribute. Provide a sensible default if it's missing.
            const targetDojoWidgetPath = componentAttributes.dojoComponentEmbedder || 'dijit/form/TextBox';
            if (!componentAttributes.dojoComponentEmbedder) {
                console.warn(`'dojoComponentEmbedder' attribute was not explicitly defined. Defaulting to '${targetDojoWidgetPath}'.`);
            }

            // Asynchronously load the necessary Dojo modules using the global 'require' function.
            // This ensures all Dojo dependencies are met before we attempt to create the widget.
            require(["dojo/domReady", "dijit/dijit", targetDojoWidgetPath, "dojo/on", "dojo/topic", "dojo/store/Memory"],
                function(domReadyCallback, dijitBaseRegistry, DojoWidgetClassConstructor, eventConnector, dojoTopic, MemoryStore) {

                    // Ensure the DOM is fully loaded and ready before attempting to instantiate the Dojo widget.
                    domReadyCallback(function() {
                        try {
                            // Instantiate the Dojo widget, attaching it to the native DOM element of the Angular host element.
                            integratedDojoWidget = new DojoWidgetClassConstructor({}, hostElement[0]);
                            console.info(`Dojo widget '${targetDojoWidgetPath}' successfully instantiated on element:`, hostElement[0]);

                            // --- Angular Scope Watchers and Attribute Observers for Data Synchronization ---

                            // Observe changes to the 'componentProperties' attribute string.
                            // This allows dynamic updates to the Dojo widget's configuration properties.
                            componentAttributes.$observe('componentProperties', (newPropsString) => {
                                if (newPropsString) {
                                    const parsedProperties = parseConfigurationString(newPropsString);
                                    if (Object.keys(parsedProperties).length > 0) {
                                        integratedDojoWidget.set(parsedProperties);
                                        console.debug("Dojo widget properties dynamically updated:", parsedProperties);
                                    }
                                } else {
                                    console.debug("The 'componentProperties' attribute is empty or undefined. No widget properties were updated.");
                                }
                            });

                            // Watch the result of the 'dataStoreProvider' function.
                            // If the function's return value changes, update the Dojo widget's 'store' property.
                            componentScope.$watch(componentScope.dataStoreProvider, (newStoreInstance) => {
                                // Only update if the widget exists and a new store value is provided.
                                if (integratedDojoWidget && newStoreInstance !== undefined) {
                                    integratedDojoWidget.set('store', newStoreInstance);
                                    console.debug("Dojo widget data store assigned or updated.");
                                } else if (integratedDojoWidget) {
                                    console.debug("dataStoreProvider returned undefined. Widget store not explicitly updated.");
                                }
                            }, true); // Using a deep watch (true) might be useful if the store's internal data changes.

                            // Watch for changes in the Angular 'modelValue' (ngModel).
                            // This propagates Angular's model state to the Dojo widget.
                            componentScope.$watch('modelValue', (updatedAngularModel) => {
                                if (!integratedDojoWidget) return; // Exit if the widget hasn't been instantiated.

                                if (updatedAngularModel !== undefined) {
                                    const currentWidgetIdentifier = targetDojoWidgetPath;
                                    const isSelectControl = SELECT_LIKE_WIDGET_TYPES.includes(currentWidgetIdentifier);

                                    if (isSelectControl) {
                                        // For select-like widgets, the 'item' property is typically used to set the selected data object.
                                        integratedDojoWidget.set('item', updatedAngularModel);
                                        console.debug(`Setting 'item' property on select widget to:`, updatedAngularModel);
                                    } else {
                                        // For general form elements (e.g., TextBox), 'value' is the primary property.
                                        integratedDojoWidget.set('value', updatedAngularModel);
                                        console.debug(`Setting 'value' property on widget to:`, updatedAngularModel);

                                        // Additionally, if the model is a boolean, update the 'checked' property (e.g., for CheckBox).
                                        if (typeof updatedAngularModel === 'boolean') {
                                            integratedDojoWidget.set('checked', updatedAngularModel);
                                            console.debug(`Setting 'checked' property on widget to:`, updatedAngularModel);
                                        }
                                    }

                                    // If ngModelController is available, update its view value and render to reflect the model.
                                    if (modelController) {
                                        modelController.$setViewValue(updatedAngularModel);
                                        modelController.$render(); // Forces the view to update based on the model.
                                    }
                                } else {
                                    // If the Angular model becomes undefined, clear corresponding widget properties.
                                    integratedDojoWidget.set('value', null);
                                    integratedDojoWidget.set('item', null);
                                    integratedDojoWidget.set('checked', false);
                                    console.debug("Angular modelValue is undefined. Clearing relevant widget properties.");
                                }
                            }, true); // Deep watch for modelValue if it's an object or array.

                            // --- Dojo Widget Event Handlers for UI to Angular Synchronization ---

                            // Connect to the Dojo widget's "blur" event.
                            eventConnector(integratedDojoWidget, "blur", () => {
                                if (integratedDojoWidget && integratedDojoWidget.displayedValue !== undefined) {
                                    // Update the 'renderedTextValue' scope property within an Angular digest cycle.
                                    $asyncScheduler(() => {
                                        componentScope.renderedTextValue = integratedDojoWidget.displayedValue;
                                        console.debug("Widget blur event detected: 'renderedTextValue' updated to:", componentScope.renderedTextValue);
                                    });
                                }
                            });

                            // Connect to the Dojo widget's "change" event.
                            eventConnector(integratedDojoWidget, "change", (dojoEventPayload) => {
                                let newModelDataFromWidget;
                                const currentWidgetIdentifier = targetDojoWidgetPath;
                                const isSelectControl = SELECT_LIKE_WIDGET_TYPES.includes(currentWidgetIdentifier);

                                if (isSelectControl) {
                                    // For select-like widgets, the 'item' property of the widget instance usually holds the selected data.
                                    // In Dojo event handlers, 'this' refers to the widget instance.
                                    newModelDataFromWidget = integratedDojoWidget.item;
                                } else {
                                    // For other widget types, the 'dojoEventPayload' directly contains the new value.
                                    newModelDataFromWidget = dojoEventPayload;
                                }

                                // Use $asyncScheduler to ensure Angular's digest cycle is initiated after the Dojo event.
                                $asyncScheduler(() => {
                                    componentScope.modelValue = newModelDataFromWidget; // Update Angular's ngModel.
                                    console.debug("Widget change event detected: 'modelValue' updated to:", newModelDataFromWidget);

                                    // If ngModelController is present, inform it of the view change.
                                    if (modelController) {
                                        modelController.$setViewValue(newModelDataFromWidget);
                                        // Optional: modelController.$validate(); // Trigger validation if needed.
                                    }

                                    // Manually trigger a digest cycle to propagate changes throughout Angular's scope.
                                    // $evalAsync is generally safer than $apply as it doesn't throw if a digest is already in progress.
                                    componentScope.$evalAsync(() => {
                                        // Execute the 'valueModified' (ngChange) expression if it was provided.
                                        if (componentScope.valueModified) {
                                            componentScope.valueModified();
                                            console.debug("ngChange expression invoked.");
                                        }
                                    });
                                });
                            });

                            // Connect to the Dojo widget's "click" event.
                            eventConnector(integratedDojoWidget, 'click', () => {
                                // Trigger the 'elementClicked' (ngClick) expression within an Angular digest cycle.
                                $asyncScheduler(() => {
                                    componentScope.$evalAsync(() => {
                                        if (componentScope.elementClicked) {
                                            componentScope.elementClicked();
                                            console.debug("ngClick expression invoked.");
                                        }
                                    });
                                });
                            });

                            // Crucial step: Call startup() on the Dojo widget instance.
                            // This method is vital for many Dojo widgets to finalize their rendering and lifecycle.
                            integratedDojoWidget.startup();
                            console.log("Dojo widget startup() method called.");

                        } catch (instantiationError) {
                            console.error("An error occurred during Dojo widget instantiation:", instantiationError);
                            // As a fallback, update the host element to show an error message.
                            hostElement.text("Error: Failed to load Dojo widget.");
                        }

                        // --- Cleanup on Angular Scope Destruction ---
                        // Register a listener for the '$destroy' event of the Angular scope.
                        // This is essential to prevent memory leaks by properly destroying the Dojo widget instance.
                        componentScope.$on('$destroy', () => {
                            if (integratedDojoWidget && integratedDojoWidget.destroy) {
                                // Ensure the widget has a 'destroy' method before calling it.
                                integratedDojoWidget.destroy();
                                integratedDojoWidget = null; // Clear the reference to aid garbage collection.
                                console.info("Dojo widget instance successfully destroyed during Angular scope cleanup.");
                            }
                        });
                    });
                }); // End of require callback function.
        } // End of link function definition.
    }; // End of directive definition object.
}]); // End of directive declaration.