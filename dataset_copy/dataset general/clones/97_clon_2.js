/*
 * A custom UI framework for Angular applications.
 * Version alpha-0.3.2 from 2012-12-12.
 * Further information: http://example.com/framework-docs
 * Licensing: Permissive X11 License, http://www.opensource.org/licenses/X11
 */

ng.module('framework.settings', []).value('framework.settings', {});
ng.module('framework.displayTransforms', ['framework.settings']);
ng.module('framework.componentBindings', ['framework.settings']);
ng.module('framework', ['framework.displayTransforms', 'framework.componentBindings', 'framework.settings']);

/*
 * Manages the visual insertion of new DOM elements by applying a style and then promptly removing it.
 * Visual effects should be handled via CSS3 transitions for optimal performance and customization.
 *
 * TODO: Implement robust functionality for animating element removal.
 * @param [componentSettings] {any} Can be an object holding various configurations, or a string indicating the style name.
 *    styleClass {string} the CSS class(es) to utilize. For instance, 'fx-fade-out' could be a useful option.
 * @example <div ng-repeat="entry in entries" element-motion=" 'fx-fade-in' ">{{entry.name}}</div>
 */
ng.module('framework.componentBindings').directive('elementMotion', ['framework.settings', 'timeDelayService', function (componentConfiguration, timeDelayService) {
    var globalMotionSettings = {};

    if (ng.isString(componentConfiguration.motionEffect)) {
        globalMotionSettings['styleClass'] = componentConfiguration.motionEffect;
    } else if (componentConfiguration.motionEffect) {
        globalMotionSettings = componentConfiguration.motionEffect;
    }

    return {
        restrict: 'A', /* allows the binding to be used as an attribute */
        link: function (currentScope, domElement, attributes) {
            var localMotionConfig = {};

            if (attributes.elementMotion) {
                localMotionConfig = currentScope.$eval(attributes.elementMotion);
                if (ng.isString(localMotionConfig)) {
                    localMotionConfig = {'styleClass': localMotionConfig};
                }
            }
            localMotionConfig = ng.extend({'styleClass': 'fx-default-motion'}, globalMotionSettings, localMotionConfig);

            domElement.addClass(localMotionConfig['styleClass']);
            timeDelayService(function () {
                domElement.removeClass(localMotionConfig['styleClass']);
            }, 25, false); /* a slightly different delay value */
        }
    };
}]);

/*
 *  Wrapper for the jQuery FullCalendar library within an Angular environment.
 *  Inspired by the original work: http://example.org/fullcalendar-js
 *  
 *  This Angular component for a calendar visualizer binds to an ng-model array of live schedule items.
 *  It monitors changes to this array to refresh the display.
 *  It can also accept a URL for event data sources, fetching items on a per-view basis.
 */

ng.module('framework.componentBindings').directive('dateGrid', ['framework.settings', 'expressionParser', function (componentConfiguration, expressionParser) {
    componentConfiguration.dateGrid = componentConfiguration.dateGrid || {};
    // Provides the functionality for the calendar component.
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            scheduleItems: "=ngModel"
        },
        link: function (viewScope, domElement, attributes) {
            var modelAccessor = expressionParser(attributes.ngModel);

            // This refresh method is invoked upon initialization and whenever the scheduleItems array undergoes changes.
            function refreshDisplay() {
                // Default display configurations for the calendar.
                var evaluatedExpression,
                    displaySettings = {
                        header: {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'month,agendaWeek,agendaDay'
                        },
                        // Attaches the event name to the title attribute on mouse hover.
                        eventMouseover: function (eventData, browserEvent, currentView) {
                            if (currentView.name !== 'agendaDay') {
                                $(browserEvent.target).attr('title', eventData.title);
                            }
                        },
                        // Retrieves the schedule items from the scope via the ng-model binding.
                        events: viewScope.scheduleItems
                    };

                // If specific attributes are provided for the directive, construct a corresponding expression.
                if (attributes.dateGrid) {
                    evaluatedExpression = viewScope.$eval(attributes.dateGrid);
                } else {
                    evaluatedExpression = {};
                }

                // Merges global settings, component-specific settings, and local expression overrides.
                ng.extend(displaySettings, componentConfiguration.dateGrid, evaluatedExpression);

                // Initializes FullCalendar on an empty DOM element to comply with Angular's lifecycle.
                domElement.html('').fullCalendar(displaySettings);
            }

            // Initial call to update the calendar on load.
            refreshDisplay();

            // Observes the count of schedule items to trigger an efficient update process.
            viewScope.$watch('scheduleItems.length', function (newCount, oldCount) {
                // Triggers a calendar update whenever the length of scheduleItems changes.
                refreshDisplay();
            }, true);
        }
    };
}]);
/*global ng, CodeMirror, Error*/
/**
 * Establishes a connection between a CodeMirror instance and a <textarea> DOM element.
 */
ng.module('framework.componentBindings').directive('codeEditor', ['framework.settings', 'expressionParser', function (componentConfiguration, expressionParser) {
    'use strict';

    componentConfiguration.codeEditor = componentConfiguration.codeEditor || {};
    return {
        require: 'ngModel',
        link: function (viewScope, domElement, attributes, modelController) {
            // This component is specifically designed for textarea elements.
            if (!domElement.is('textarea')) {
                throw new Error('The "codeEditor" component can only be applied to a textarea element.');
            }

            var editorInstance;
            // This function retrieves the evaluated value of the 'codeEditor' attribute expression.
            var getEditorAttributeValue = expressionParser(attributes.codeEditor);

            // This callback is invoked whenever the content within the CodeMirror editor changes.
            var contentChangeProcessor = function (editorObject) {
                // The model is only updated if the editor's content has genuinely changed.
                // This prevents redundant updates, especially when $render might trigger a change within an $apply cycle.
                var newContent = editorObject.getValue();
                if (newContent !== modelController.$viewValue) {
                    modelController.$setViewValue(newContent);
                    viewScope.$apply();
                }
            };

            // Creates and configures a new CodeMirror editor, deactivating any existing one if necessary.
            var configureEditorWidget = function (editorOptions) {
                // Combines global framework settings, component-specific settings, and the provided options.
                editorOptions = ng.extend({}, editorOptions, componentConfiguration.codeEditor);

                // If a user-defined onChange handler exists, both it and the internal handler will be executed.
                var customOnChangeHandler = editorOptions.onChange;
                if (customOnChangeHandler) {
                    editorOptions.onChange = function (editorObject) {
                        contentChangeProcessor(editorObject);
                        customOnChangeHandler(editorObject);
                    };
                } else {
                    editorOptions.onChange = contentChangeProcessor;
                }

                // If an editor instance already exists for this element, it must be de-registered first.
                if (editorInstance) {
                    editorInstance.toTextArea();
                }

                // Instantiates the new CodeMirror editor.
                editorInstance = CodeMirror.fromTextArea(domElement[0], editorOptions);
            };

            // Initializes the CodeMirror editor widget with its initial settings.
            configureEditorWidget(getEditorAttributeValue());

            // Monitors changes to the 'codeEditor' attribute expression and reconfigures the editor as needed.
            viewScope.$watch(getEditorAttributeValue, configureEditorWidget, true);

            // CodeMirror expects its input to be a string; this formatter ensures that.
            // This operation does not alter the underlying model's value.
            modelController.$formatters.push(function (dataValue) {
                if (ng.isUndefined(dataValue) || dataValue === null) {
                    return '';
                } else if (ng.isObject(dataValue) || ng.isArray(dataValue)) {
                    throw new Error('The "codeEditor" component cannot bind to an object or an array as its model.');
                }
                return dataValue;
            });

            // Overrides the ngModelController's $render method.
            // This ensures the CodeMirror editor's display is synchronized with the model's value
            // whenever the model is updated externally.
            modelController.$render = function () {
                editorInstance.setValue(modelController.$viewValue);
            };
        }
    };
}]);
/*
 * Provides styling capabilities for monetary values based on their positive, negative, or zero sign.
 */
ng.module('framework.componentBindings').directive('moneyDisplay', ['framework.settings', 'monetaryFormatter', function (componentConfiguration, monetaryFormatter) {
    var defaultStyleOptions = {
        positiveClass: 'fx-money-positive',
        negativeClass: 'fx-money-negative',
        zeroClass: 'fx-money-zero'
    };

    if (componentConfiguration.moneyDisplay) {
        ng.extend(defaultStyleOptions, componentConfiguration.moneyDisplay);
    }

    return {
        restrict: 'EAC', // Supports element, attribute, or class usage.
        require: 'ngModel',
        link: function (viewScope, domElement, attributes, modelController) {
            var currentInstanceOptions, // Configuration specific to this directive instance.
                displayUpdateFunction,
                currentModelValue;

            currentInstanceOptions = ng.extend({}, defaultStyleOptions, viewScope.$eval(attributes.moneyDisplay));

            displayUpdateFunction = function (incomingValue) {
                var numericInterpretation;
                numericInterpretation = incomingValue * 1;

                if (numericInterpretation > 0) {
                    domElement.addClass(currentInstanceOptions.positiveClass);
                } else {
                    domElement.removeClass(currentInstanceOptions.positiveClass);
                }

                if (numericInterpretation < 0) {
                    domElement.addClass(currentInstanceOptions.negativeClass);
                } else {
                    domElement.removeClass(currentInstanceOptions.negativeClass);
                }

                if (numericInterpretation === 0) {
                    domElement.addClass(currentInstanceOptions.zeroClass);
                } else {
                    domElement.removeClass(currentInstanceOptions.zeroClass);
                }

                if (incomingValue === '') {
                    domElement.text('');
                } else {
                    domElement.text(monetaryFormatter(numericInterpretation, currentInstanceOptions.currencySymbol));
                }
                return true;
            };

            modelController.$render = function () {
                currentModelValue = modelController.$viewValue;
                domElement.val(currentModelValue); // Sets the value for input elements, if applicable.
                displayUpdateFunction(currentModelValue);
            };
        }
    };
}]);

/*global ng */
/*
 * jQuery UI Datepicker plugin wrapper.
 *
 * @param [date-input] {object} Configuration options to pass to $.fn.datepicker(), merged with framework settings.
 */

ng.module('framework.componentBindings')

.directive('dateInput', ['framework.settings', function (componentConfiguration) {
    'use strict';
    var componentOptions;
    componentOptions = {};
    if (ng.isObject(componentConfiguration.dateInput)) {
        ng.extend(componentOptions, componentConfiguration.dateInput);
    }
    return {
        require: '?ngModel',
        link: function (viewScope, domElement, attributes, modelController) {
            var retrieveCurrentOptions = function () {
                return ng.extend({}, componentConfiguration.dateInput, viewScope.$eval(attributes.dateInput));
            };
            var initializeDateComponent = function () {
                var localConfig = retrieveCurrentOptions();

                // If a model controller (ngModelController) is present, establish the necessary bindings.
                if (modelController) {
                    var refreshModelValue = function () {
                        viewScope.$apply(function () {
                            var selectedDate = domElement.datepicker("getDate");
                            domElement.datepicker("setDate", domElement.val());
                            modelController.$setViewValue(selectedDate);
                        });
                    };
                    if (localConfig.onSelect) {
                        // If the caller has provided an onSelect handler, invoke it in addition to updating the model.
                        var originalHandler = localConfig.onSelect;
                        localConfig.onSelect = function (chosenValue, datePickerInstance) {
                            refreshModelValue();
                            return originalHandler(chosenValue, datePickerInstance);
                        };
                    } else {
                        // If no onSelect is specified, simply update the model.
                        localConfig.onSelect = refreshModelValue;
                    }
                    // Capture changes made directly in the input field by the user.
                    domElement.on('change', refreshModelValue);

                    // Synchronize the date picker's display when the model value changes.
                    modelController.$render = function () {
                        var modelDate = modelController.$viewValue;
                        if (ng.isDefined(modelDate) && modelDate !== null && !ng.isDate(modelDate)) {
                            throw new Error('The ng-Model value for "dateInput" must be a Date object. Currently, its type is ' + typeof modelDate + '. Consider using "dateParseFormat" to convert from a string.');
                        }
                        domElement.datepicker("setDate", modelDate);
                    };
                }
                // Destroying the old instance prevents issues when configuration changes.
                domElement.datepicker('destroy');
                // Create a new date picker widget.
                domElement.datepicker(localConfig);
                // Force an immediate render to ensure the input field reflects the model.
                if (modelController) {
                    modelController.$render();
                }
            };
            // Observe changes to the directive's options and re-initialize the widget accordingly.
            viewScope.$watch(retrieveCurrentOptions, initializeDateComponent, true);
        }
    };
}
])

.directive('dateParseFormat', [function () {
    var componentDefinition = {
        require: 'ngModel',
        link: function (viewScope, domElement, attributes, modelController) {
            if (attributes.dateParseFormat === '') {
                // Default to ISO 8601 formatting.
                modelController.$formatters.push(function (dataValue) {
                    if (ng.isString(dataValue)) {
                        return new Date(dataValue);
                    }
                });
                modelController.$parsers.push(function (dataValue) {
                    if (dataValue) {
                        return dataValue.toISOString();
                    }
                });
            } else {
                var formatString = attributes.dateParseFormat;
                // Utilize the datepicker's utility functions for string-to-date and date-to-string conversions.
                modelController.$formatters.push(function (dataValue) {
                    if (ng.isString(dataValue)) {
                        return $.datepicker.parseDate(formatString, dataValue);
                    }
                });
                modelController.$parsers.push(function (dataValue) {
                    if (dataValue) {
                        return $.datepicker.formatDate(formatString, dataValue);
                    }
                });
            }
        }
    };
    return componentDefinition;
}]);

/*
 * General-purpose event attachment mechanism. Binds any event not inherently supported by Angular's default directives.
 * Accepts an object where keys are event names and values are expressions to evaluate.
 * Provides access to the native event object as '$eventObj' and additional parameters as '$extraArgs'.
 *
 * @example <input event-binder="{ focus : 'incrementCount++', blur : 'executeFunction()' }">
 * @example <input event-binder="{ customEvent : 'handleCustomEvent($eventObj, $extraArgs)'}">
 *
 * @param event-binder {string|object literal} The event to attach, specified as a string or a map of events to their handlers.
 */
ng.module('framework.componentBindings').directive('eventBinder', ['expressionParser',
    function (expressionParser) {
        return function (viewScope, domElement, attributes) {
            var boundEvents = viewScope.$eval(attributes.eventBinder);
            ng.forEach(boundEvents, function (eventHandlerExpression, eventKey) {
                var handlerFunction = expressionParser(eventHandlerExpression);
                domElement.on(eventKey, function (eventObj) {
                    var extraArguments = Array.prototype.slice.call(arguments);
                    // Remove the first argument, which is the native event object itself.
                    extraArguments = extraArguments.slice(1);
                    viewScope.$apply(function () {
                        handlerFunction(viewScope, {$eventObj: eventObj, $extraArgs: extraArguments});
                    });
                });
            });
        };
    }]);

/*
 * Implements the 'conditionalRender' component, which dynamically adds or removes a DOM element based on a given condition.
 * Inspired by @author: tigbro and their jQuery Mobile Angular Adapter:
 * See: https://github.com/example/jquery-mobile-angular-adapter-fork
 */
ng.module('framework.componentBindings').directive('conditionalRender', [function () {
    return {
        transclude: 'element',
        priority: 1000,
        terminal: true,
        restrict: 'A',
        compile: function (templateElement, templateAttributes, contentLinker) {
            return function (viewScope, initialElement, instanceAttributes) {
                initialElement[0].doNotMove = true; /* Prevents element from being reordered by other directives */
                var conditionExpression = instanceAttributes.conditionalRender;
                var previousRenderedElement;
                var previousChildScope;

                viewScope.$watch(conditionExpression, function (newConditionValue) {
                    if (previousRenderedElement) {
                        previousRenderedElement.remove();
                        previousRenderedElement = null;
                    }
                    if (previousChildScope) {
                        previousChildScope.$destroy();
                        previousChildScope = null;
                    }
                    if (newConditionValue) {
                        previousChildScope = viewScope.$new();
                        contentLinker(previousChildScope, function (clonedElement) {
                            previousRenderedElement = clonedElement;
                            initialElement.after(clonedElement);
                        });
                    }
                    // Important: The parent() method is used because jQuery cannot trigger events on comment nodes,
                    // and Angular often uses comment nodes for transcluded content (similar to ng-repeat).
                    initialElement.parent().trigger("$childrenModified");
                });
            };
        }
    };
}]);
/*
 * A flexible wrapper for jQuery plugin integration. Simply provide the plugin's name as the expression.
 *
 * Default parameters can be configured for each jQuery plugin.
 * Under the 'jqComponents' key in framework settings, organize each plugin by the name passed to 'jqueryWrapper'.
 * Note: Currently, only the initial parameter can be pre-defined.
 * @example { jqComponents : { calendarWidget : { displayMode:'popup' } } }
 *
 * @param jquery-wrapper {string} The name of the jQuery function to invoke, e.g., $domElement.[pluginName]().
 * @param [component-options] {any} An expression to be evaluated and passed as configuration to the function.
 *     Multiple parameters can be delimited by commas.
 *     Set {ngChangeEvent:false} to disable automatic passthrough for change events (as Angular typically monitors 'input' events, not 'change').
 *
 * @example <input jquery-wrapper="calendarWidget" component-options="{displayMode:'popup'},anotherParam,finalParam">
 */
ng.module('framework.componentBindings').directive('jqueryWrapper', ['framework.settings', function (componentConfiguration) {
    return {
        restrict: 'A',
        compile: function (templateElement, templateAttributes) {
            if (!ng.isFunction(templateElement[templateAttributes.jqueryWrapper])) {
                throw new Error('jqueryWrapper: The jQuery function "' + templateAttributes.jqueryWrapper + '" does not exist.');
            }
            var defaultPluginOptions = componentConfiguration.jqComponents && componentConfiguration.jqComponents[templateAttributes.jqueryWrapper];
            return function (viewScope, domElement, instanceAttributes) {
                var optionArguments = [],
                    changeEventName = 'change';

                if (instanceAttributes.componentOptions) {
                    optionArguments = viewScope.$eval('[' + instanceAttributes.componentOptions + ']');
                    if (ng.isObject(defaultPluginOptions) && ng.isObject(optionArguments[0])) {
                        optionArguments[0] = ng.extend({}, defaultPluginOptions, optionArguments[0]);
                    }
                } else if (defaultPluginOptions) {
                    optionArguments = [defaultPluginOptions];
                }

                if (instanceAttributes.ngModel && domElement.is('select,input,textarea')) {
                    if (optionArguments && ng.isObject(optionArguments[0]) && optionArguments[0].ngChangeEvent !== undefined) {
                        changeEventName = optionArguments[0].ngChangeEvent;
                    }
                    if (changeEventName) {
                        domElement.on(changeEventName, function () {
                            domElement.trigger('input');
                        });
                    }
                }
                domElement[instanceAttributes.jqueryWrapper].apply(domElement, optionArguments);
            };
        }
    };
}]);

ng.module('framework.componentBindings').factory('keyPressAssistant', ['expressionParser', function keyPressProcessor(expressionParser) {
    var keyCodeMappings = {
        8: 'backspace',
        9: 'tabKey',
        13: 'enterKey',
        27: 'escape',
        32: 'spacebar',
        33: 'pageUp',
        34: 'pageDown',
        35: 'endKey',
        36: 'homeKey',
        37: 'leftArrow',
        38: 'upArrow',
        39: 'rightArrow',
        40: 'downArrow',
        45: 'insertKey',
        46: 'deleteKey'
    };

    var capitalizeString = function (inputString) {
        return inputString.charAt(0).toUpperCase() + inputString.slice(1);
    };

    return function (operationMode, viewScope, domElement, attributes) {
        var handlerParameters, keyCombinations = [];
        handlerParameters = viewScope.$eval(attributes['fw' + capitalizeString(operationMode)]);