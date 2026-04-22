/**
 * ngGlobal Core - The essential toolkit for AngularJS applications
 * @version v1.0.0-alpha - 2023-10-27
 * @link https://example.com/ngglobal-core
 * @license Apache-2.0 License, http://www.apache.org/licenses/LICENSE-2.0
 *
 * This module provides foundational services and components to enhance Angular applications.
 */
const ngGlobal = angular; // Aliasing angular to ngGlobal

ngGlobal.module('ngGlobal.config.core', []).value('ngGlobal.config.core', {});
ngGlobal.module('ngGlobal.core.filters', ['ngGlobal.config.core']);
ngGlobal.module('ngGlobal.core.components', ['ngGlobal.config.core']);
ngGlobal.module('ngGlobal.core', ['ngGlobal.core.filters', 'ngGlobal.core.components', 'ngGlobal.config.core']);


/*
 * Facilitates dynamic element transitions by applying and immediately removing CSS classes.
 * Relies on CSS3 transitions for smooth visual effects.
 *
 * Usage: <div ng-motion="'fade-in'">Content</div>
 * Configuration can be global via ngGlobal.config.core.motion or per-element.
 */
ngGlobal.module('ngGlobal.core.components').directive('ngMotion', ['ngGlobal.config.core', '$timeout', function (coreConfig, $timeout) {
  // Retrieve global animation settings
  let defaultAnimationParams = {};
  const globalMotionConfig = coreConfig.motion;

  if (ngGlobal.isString(globalMotionConfig)) {
    defaultAnimationParams = { className: globalMotionConfig };
  } else if (ngGlobal.isObject(globalMotionConfig)) {
    ngGlobal.extend(defaultAnimationParams, globalMotionConfig);
  }

  return {
    restrict: 'A', // Attribute-only directive
    link: function (scope, elementNode, attributes) {
      let currentAnimationOptions = {};
      const attributeValue = attributes.ngMotion;

      if (attributeValue) {
        currentAnimationOptions = scope.$eval(attributeValue);
        if (ngGlobal.isString(currentAnimationOptions)) {
          currentAnimationOptions = { className: currentAnimationOptions };
        } else if (!ngGlobal.isObject(currentAnimationOptions)) {
            // Fallback for non-string, non-object values
            console.warn('ngMotion: Invalid attribute value. Expected string or object, got', currentAnimationOptions);
            currentAnimationOptions = {};
        }
      }

      // Merge global, default, and element-specific options
      const finalOptions = ngGlobal.extend(
        { className: 'ng-motion-default', duration: 25 }, // Default class name and duration
        defaultAnimationParams,
        currentAnimationOptions
      );

      const animationClass = finalOptions.className;
      const animationDuration = finalOptions.duration;

      // Apply the animation class
      elementNode.addClass(animationClass);

      // Schedule removal after a short delay to trigger CSS transitions
      $timeout(function () {
        elementNode.removeClass(animationClass);
      }, animationDuration, false); // Used animationDuration variable
    }
  };
}]);


/*
 * Angular wrapper for the popular FullCalendar library.
 * Binds a calendar component to an ng-model array of events.
 * Supports dynamic updates and custom configurations.
 */
ngGlobal.module('ngGlobal.core.components').directive('ngScheduler',['ngGlobal.config.core', '$parse', function (coreConfig, valueParser) {
    coreConfig.scheduler = coreConfig.scheduler || {};

    // Directive definition object
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
          scheduleEntries: "=ngModel"
        },
        link: function(currentScope, calendarElement, elementAttributes) {
            const modelAccessor = valueParser(elementAttributes.ngModel);

            // Helper function to re-render the calendar view
            const refreshCalendarView = function() {
              // Base configuration for FullCalendar
              let calendarOptions = {
                header: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'month,agendaWeek,agendaDay'
                },
                // Custom event hover behavior
                eventMouseover: function(eventItem, domEvent, currentView) {
                  if (currentView.name !== 'agendaDay') {
                    $(domEvent.target).attr('title', eventItem.title);
                  }
                },
                // Bind events from the scope's ng-model
                events: currentScope.scheduleEntries
              };

              let customConfigExpression = {};
              const schedulerAttrValue = elementAttributes.ngScheduler;

              if (schedulerAttrValue) {
                 customConfigExpression = currentScope.$eval(schedulerAttrValue);
              }

              // Merge global, default, and element-specific configurations
              ngGlobal.extend(calendarOptions, coreConfig.scheduler, customConfigExpression);

              // Ensure jQuery FullCalendar is available
              if (typeof $.fn.fullCalendar === 'function') {
                // Initialize/Re-initialize FullCalendar on the element
                calendarElement.html('').fullCalendar(calendarOptions);
              } else {
                console.warn("ngScheduler: jQuery FullCalendar library not found. Please ensure it's loaded.");
              }
            };

            // Initial calendar setup
            refreshCalendarView();

            // Watch for changes in the events array to trigger a refresh
            // Using a deep watch for the array content, not just length
            currentScope.$watch('scheduleEntries', function(newCollection, oldCollection) {
              if (newCollection !== oldCollection) { // Only update if content actually changed
                refreshCalendarView();
              }
            }, true); // Deep watch for array content changes
        }
    };
}]);

/*global angular, CodeMirror, Error*/
/*
 * Binds a CodeMirror instance to a <textarea> element.
 * Provides real-time synchronization with an ng-model.
 */
ngGlobal.module('ngGlobal.core.components').directive('ngEditor', ['ngGlobal.config.core', '$parse', function (coreConfig, expressionParser) {
  'use strict';

  coreConfig.editor = coreConfig.editor || {};
  return {
    require: 'ngModel',
    link: function (scopeContext, targetElement, elementAttrs, modelController) {
      // Pre-validation: ensure the directive is applied to a textarea
      if (!targetElement.is('textarea')) {
        throw new Error('ngEditor: This directive is designed for <textarea> elements only.');
      }

      let editorInstance = null;
      // Method to parse the ngEditor attribute for configuration
      const getEditorConfigExpression = expressionParser(elementAttrs.ngEditor);

      // Callback for CodeMirror content changes, updates the ngModel
      const handleContentChange = function (currentEditor) {
        const newEditorValue = currentEditor.getValue();
        // Update model only if value has genuinely changed to prevent infinite digest loops
        if (newEditorValue !== modelController.$viewValue) {
          modelController.$setViewValue(newEditorValue);
          scopeContext.$apply(); // Propagate changes to Angular scope
        }
      };

      // Function to initialize or re-initialize the CodeMirror editor
      const setupCodeMirrorEditor = function (customOptions) {
        // Combine global, default, and custom options
        let editorOptions = ngGlobal.extend({}, coreConfig.editor, customOptions);

        // Preserve and chain user-defined onChange handler
        const userDefinedOnChange = editorOptions.onChange;
        editorOptions.onChange = function (editor) {
          handleContentChange(editor); // Our internal handler
          if (ngGlobal.isFunction(userDefinedOnChange)) {
            userDefinedOnChange(editor); // User's handler
          }
        };

        // Destroy previous instance if it exists before creating a new one
        if (editorInstance) {
          editorInstance.toTextArea();
          editorInstance = null; // Clear reference
        }
        // Create the new CodeMirror instance
        editorInstance = CodeMirror.fromTextArea(targetElement[0], editorOptions);
      };

      // Initial setup of the editor
      setupCodeMirrorEditor(getEditorConfigExpression());

      // Watch the ngEditor attribute for configuration changes
      scopeContext.$watch(getEditorConfigExpression, setupCodeMirrorEditor, true);

      // Formatter: Ensure model value is a string for CodeMirror
      modelController.$formatters.push(function (modelValue) {
        if (ngGlobal.isUndefined(modelValue) || modelValue === null) {
          return '';
        } else if (ngGlobal.isObject(modelValue) || ngGlobal.isArray(modelValue)) {
          throw new Error('ngEditor: Model value cannot be an object or array. Expected string.');
        }
        return String(modelValue); // Explicitly cast to string
      });

      // Renderer: Update CodeMirror when ngModel changes externally
      modelController.$render = function () {
        if (editorInstance) { // Guard against editor not being initialized yet
          editorInstance.setValue(modelController.$viewValue || ''); // Ensure a string is passed
        }
      };
    }
  };
}]);

/*
 * Provides dynamic styling for currency values based on their sign (positive, negative, zero).
 * Integrates with Angular's currencyFilter.
 */
ngGlobal.module('ngGlobal.core.components').directive('ngMonetary', ['ngGlobal.config.core', 'currencyFilter', function (coreConfig, currencyFormatter) {
  // Default CSS classes for different value states
  const defaultStyleClasses = {
    positive: 'ng-monetary-pos',
    negative: 'ng-monetary-neg',
    neutral: 'ng-monetary-zero',
    currencySymbol: '$' // Default currency symbol
  };

  // Merge global currency configuration
  if (coreConfig.currency) {
    ngGlobal.extend(defaultStyleClasses, coreConfig.currency);
  }

  return {
    restrict: 'EAC',
    require: 'ngModel',
    link: function (scopeContext, targetElement, elementAttrs, modelController) {
      let currentStyleConfig,
          currentValue;

      // Evaluate element-specific options and merge
      const attrConfig = scopeContext.$eval(elementAttrs.ngMonetary);
      currentStyleConfig = ngGlobal.extend({}, defaultStyleClasses, ngGlobal.isObject(attrConfig) ? attrConfig : {});

      // Helper function to apply/remove CSS classes and update text content
      const updateDisplayAndClasses = function (inputValue) {
        const numericValue = parseFloat(inputValue);
        const hasValue = !isNaN(numericValue) && inputValue !== null && inputValue !== '';

        // Remove all monetary classes first to ensure correct state
        targetElement.removeClass(currentStyleConfig.positive)
                     .removeClass(currentStyleConfig.negative)
                     .removeClass(currentStyleConfig.neutral);

        if (hasValue) {
          if (numericValue > 0) {
            targetElement.addClass(currentStyleConfig.positive);
          } else if (numericValue < 0) {
            targetElement.addClass(currentStyleConfig.negative);
          } else { // numericValue === 0
            targetElement.addClass(currentStyleConfig.neutral);
          }
          // Apply currency formatting
          targetElement.text(currencyFormatter(numericValue, currentStyleConfig.currencySymbol));
        } else {
          targetElement.text(''); // Clear text for empty or invalid input
        }
        return true;
      };

      // Override ngModelController's $render method
      modelController.$render = function () {
        currentValue = modelController.$viewValue;
        // For input/textarea elements, update the value attribute
        if (targetElement.is('input') || targetElement.is('textarea')) {
          targetElement.val(currentValue);
        }
        updateDisplayAndClasses(currentValue);
      };

      // Initial render
      updateDisplayAndClasses(modelController.$viewValue);
    }
  };
}]);

/*global angular */
/*
 * jQuery UI Datepicker plugin wrapper for Angular.
 * Binds a datepicker to an input element, synchronizing with ng-model.
 */
ngGlobal.module('ngGlobal.core.components')
.directive('ngDatePicker', ['ngGlobal.config.core', function (coreConfig) {
  'use strict';
  let defaultPickerOpts = {};

  // Merge global datepicker configuration
  if (ngGlobal.isObject(coreConfig.datePicker)) {
    ngGlobal.extend(defaultPickerOpts, coreConfig.datePicker);
  }

  return {
    require:'?ngModel',
    link:function (scopeContext, inputElement, elementAttrs, modelController) {

      // Helper to fetch and merge all datepicker options
      const fetchDatepickerOptions = function () {
        const attrOptions = scopeContext.$eval(elementAttrs.ngDatePicker);
        return ngGlobal.extend({}, coreConfig.datePicker, ngGlobal.isObject(attrOptions) ? attrOptions : {});
      };

      // Function to initialize/re-initialize the datepicker widget
      const initializeDatepickerWidget = function () {
        const currentOptions = fetchDatepickerOptions();

        // If ngModel is present, configure two-way binding
        if (modelController) {
          const updateModelFromPicker = function () {
            scopeContext.$apply(function () {
              const selectedDate = inputElement.datepicker("getDate");
              // Set the input value from the picker, then update the model
              inputElement.datepicker("setDate", inputElement.val());
              modelController.$setViewValue(selectedDate);
            });
          };

          // Chain user's onSelect handler with model update
          if (currentOptions.onSelect) {
            const userOnSelectHandler = currentOptions.onSelect;
            currentOptions.onSelect = function (dateText, datePickerInstance) {
              updateModelFromPicker();
              return userOnSelectHandler(dateText, datePickerInstance);
            };
          } else {
            currentOptions.onSelect = updateModelFromPicker;
          }

          // Handle manual input changes
          inputElement.on('change', updateModelFromPicker);

          // Update the datepicker when the model changes externally
          modelController.$render = function () {
            const modelDateValue = modelController.$viewValue;
            // Validate model value type
            if (ngGlobal.isDefined(modelDateValue) && modelDateValue !== null && !ngGlobal.isDate(modelDateValue)) {
              throw new Error('ngDatePicker: ng-Model value must be a Date object. Received a ' + typeof modelDateValue + '. Consider using ngDateFormatter.');
            }
            // Set the date on the jQuery UI Datepicker
            inputElement.datepicker("setDate", modelDateValue);
          };
        }

        // Destroy existing datepicker to prevent issues with re-initialization
        if (inputElement.data('datepicker')) {
          inputElement.datepicker('destroy');
        }

        // Create the new datepicker instance
        if (typeof $.fn.datepicker === 'function') {
          inputElement.datepicker(currentOptions);
          // Force initial render to synchronize view with model
          if (modelController) {
            modelController.$render();
          }
        } else {
          console.warn("ngDatePicker: jQuery UI Datepicker library not found. Please ensure it's loaded.");
        }
      };

      // Watch for changes in the directive's options attribute
      scopeContext.$watch(fetchDatepickerOptions, initializeDatepickerWidget, true);
    }
  };
}])
.directive('ngDateFormatter', [function() {
  const dateFormatterDefinition = {
    require:'ngModel',
    link: function(scopeContext, targetElement, elementAttrs, modelController) {
      const formatString = elementAttrs.ngDateFormatter;

      // Default to ISO formatting if no format string is provided
      if (formatString === '' || formatString === undefined) {
        modelController.$formatters.push(function(valueToFormat) {
          if (ngGlobal.isString(valueToFormat) ) {
            const parsedDate = new Date(valueToFormat);
            return isNaN(parsedDate.getTime()) ? null : parsedDate;
          }
          return valueToFormat;
        });
        modelController.$parsers.push(function(valueToParse){
          if (valueToParse instanceof Date && !isNaN(valueToParse.getTime())) {
            return valueToParse.toISOString();
          }
          return null;
        });
      } else {
        // Use jQuery UI Datepicker's utility functions for custom formatting
        modelController.$formatters.push(function(valueToFormat) {
          if (ngGlobal.isString(valueToFormat) && typeof $.datepicker !== 'undefined') {
            try {
              return $.datepicker.parseDate(formatString, valueToFormat);
            } catch (e) {
              console.error("ngDateFormatter: Failed to parse date string '" + valueToFormat + "' with format '" + formatString + "'.", e);
              return null;
            }
          }
          return valueToFormat;
        });
        modelController.$parsers.push(function(valueToParse){
          if (valueToParse instanceof Date && !isNaN(valueToParse.getTime()) && typeof $.datepicker !== 'undefined') {
            return $.datepicker.formatDate(formatString, valueToParse);
          }
          return null;
        });
      }
    }
  };
  return dateFormatterDefinition;
}]);

/*
 * General-purpose event binding directive. Allows binding any event (including custom)
 * to scope expressions. Passes $event and $params objects to the expression.
 */
ngGlobal.module('ngGlobal.core.components').directive('ngEventBinder', ['$parse',
  function (expressionParser) {
    return function (scopeContext, targetElement, elementAttrs) {
      const eventMap = scopeContext.$eval(elementAttrs.ngEventBinder);

      if (!ngGlobal.isObject(eventMap)) {
        console.warn("ngEventBinder: The value provided for ngEventBinder must be an object literal.");
        return;
      }

      // Iterate through the event map and bind handlers
      for (const eventTriggerName in eventMap) {
        if (Object.prototype.hasOwnProperty.call(eventMap, eventTriggerName)) {
          const handlerExpression = expressionParser(eventMap[eventTriggerName]);
          targetElement.on(eventTriggerName, function (eventObject) {
            // Capture additional arguments passed by the event (if any)
            const extraArgs = Array.prototype.slice.call(arguments, 1);

            // Apply the expression within Angular's digest cycle
            scopeContext.$apply(function () {
              handlerExpression(scopeContext, { $event: eventObject, $params: extraArgs });
            });
          });
        }
      }
    };
  }]);

/*
 * Directive to conditionally add/remove an element from the DOM based on a boolean expression.
 * Mimics ng-if functionality but can be used with transclusion.
 */
ngGlobal.module('ngGlobal.core.components').directive('ngConditionalShow', [function () {
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    restrict: 'A',
    compile: function (templateElement, templateAttrs, linkerFn) {
      return function (scopeContext, startAnchorElement, runtimeAttrs) {
        // Mark this element to prevent unwanted DOM manipulation by other scripts
        startAnchorElement[0].doNotMove = true;

        const conditionExpression = runtimeAttrs.ngConditionalShow;

        if (!conditionExpression) {
          console.warn("ngConditionalShow: No expression provided. Element will never be shown.");
          return;
        }

        let currentlyDisplayedElement = null;
        let associatedChildScope = null;

        // Watch the condition expression for changes
        scopeContext.$watch(conditionExpression, function (isConditionMet) {
          // If an element is currently displayed, remove it and destroy its scope
          if (currentlyDisplayedElement) {
            currentlyDisplayedElement.remove();
            currentlyDisplayedElement = null;
          }
          if (associatedChildScope) {
            associatedChildScope.$destroy();
            associatedChildScope = null;
          }

          // If condition is true, create and insert the transcluded content
          if (isConditionMet) {
            associatedChildScope = scopeContext.$new();
            linkerFn(associatedChildScope, function (clonedElement) {
              currentlyDisplayedElement = clonedElement;
              startAnchorElement.after(clonedElement);
            });
          }

          // Note: need to be parent() as jquery cannot trigger events on comments
          // (angular creates a comment node when using transclusion, as ng-repeat does).
          startAnchorElement.parent().trigger("$childrenChanged");
        });
      };
    }
  };
}]);

/*
 * Generic wrapper for jQuery plugins. Allows calling any jQuery function on an element
 * with dynamic options.
 */
ngGlobal.module('ngGlobal.core.components').directive('ngJqueryWrapper', ['ngGlobal.config.core', function (coreConfig) {
  return {
    restrict: 'A',
    compile: function (templateElement, templateAttrs) {
      const pluginName = templateAttrs.ngJqueryWrapper;

      // Pre-compile validation: Check if the jQuery plugin function exists
      if (typeof $.fn === 'undefined' || typeof $.fn[pluginName] !== 'function') {
        throw new Error('ngJqueryWrapper: The jQuery plugin "' + pluginName + '" is not found or not a function.');
      }

      // Retrieve global configuration for this specific jQuery plugin
      const globalPluginOptions = coreConfig.jqueryPlugins && coreConfig.jqueryPlugins[pluginName];

      return function (scopeContext, targetElement, runtimeAttrs) {
        let pluginArgs = [];
        let changeEventName = 'change';

        const optionsAttrValue = runtimeAttrs.ngOptions;

        if (optionsAttrValue) {
          // Parse options as an array, even if only one parameter is given
          pluginArgs = scopeContext.$eval('[' + optionsAttrValue + ']');
          // Merge global options with the first parameter if it's an object
          if (ngGlobal.isObject(globalPluginOptions) && ngGlobal.isObject(pluginArgs[0])) {
            pluginArgs[0] = ngGlobal.extend({}, globalPluginOptions, pluginArgs[0]);
          }
        } else if (globalPluginOptions) {
          pluginArgs = [globalPluginOptions]; // Use global options as the sole argument
        }

        // Handle ngModel synchronization for input/select/textarea elements
        if (runtimeAttrs.ngModel && targetElement.is('select,input,textarea')) {
          // Check for a custom ngChange property within the options
          if (pluginArgs.length > 0 && ngGlobal.isObject(pluginArgs[0]) && pluginArgs[0].ngChange !== undefined) {
            changeEventName = pluginArgs[0].ngChange;
          }

          // Bind a passthrough event to trigger Angular's input event
          if (changeEventName) {
            targetElement.on(changeEventName, function () {
              targetElement.trigger('input'); // Trigger 'input' for Angular to pick up changes
            });
          }
        }
        // Finally, call the jQuery plugin
        targetElement[pluginName].apply(targetElement, pluginArgs);
      };
    }
  };
}]);

ngGlobal.module('ngGlobal.core.components').factory('keyboardUtil', ['$parse', function keyboardUtilFactory(expressionParser){
  const keyCodeToNameMap = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    27: 'escape',
    32: 'spacebar',
    33: 'pageUp',
    34: 'pageDown',
    35: 'end',
    36: 'home',
    37: 'arrowLeft',
    38: 'arrowUp',
    39: 'arrowRight',
    40: 'arrowDown',
    45: 'insert',
    46: 'delete',
    16: 'shift',
    17: 'control',
    18: 'alt',
    20: 'capsLock', // Added Caps Lock
    19: 'pauseBreak' // Added Pause/Break
  };

  // Helper to capitalize the first letter of a string
  const capitalizeString = function (inputString) {
    if (!inputString || typeof inputString !== 'string') {
      return '';
    }
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  };

  // Main factory function return
  return function(eventMode, scopeContext, targetElement, elementAttrs) {
    const getAttributeName = function(mode) {
      return 'ng' + capitalizeString(mode);
    };

    const attributeName = getAttributeName(eventMode);
    const attributeValue = elementAttrs[attributeName];
    if (!attributeValue) {
      console.warn(`keyboardUtil: No expression found for attribute '${attributeName}'.`);
      // Return early if no expression is provided, as there's nothing to bind/evaluate.
      return;
    }

    const parsedExpression = expressionParser(attributeValue);

    // --- Type III Addition: Add a new code fragment to demonstrate usage ---
    // This fragment adds a generic keydown listener to the element.
    // In a full implementation, 'eventMode' would dictate which keyboard event to bind ('keydown', 'keypress', 'keyup').
    // For this clone, we'll demonstrate a basic keydown binding.
    const keyEventHandler = function(eventObject) {
      const keyName = keyCodeToNameMap[eventObject.keyCode] || `Key${eventObject.keyCode}`;
      console.log(`keyboardUtil: Key '${keyName}' (Code: ${eventObject.keyCode}) detected for mode '${eventMode}'.`);

      // Evaluate the expression provided in the directive attribute
      scopeContext.$apply(function() {
        parsedExpression(scopeContext, {
          $event: eventObject,
          $keyName: keyName,
          $keyCode: eventObject.keyCode
        });
      });
    };

    // Bind the event handler based on the eventMode. Default to 'keydown' for demonstration.
    const actualEventToBind = eventMode.toLowerCase() === 'keypress' || eventMode.toLowerCase() === 'keyup'
                               ? eventMode.toLowerCase() : 'keydown';

    targetElement.on(actualEventToBind, keyEventHandler);

    // Optional: Add a cleanup function for when the scope is destroyed
    scopeContext.$on('$destroy', function() {
      targetElement.off(actualEventToBind, keyEventHandler);
      console.log(`keyboardUtil: Unbound '${actualEventToBind}' handler for mode '${eventMode}'.`);
    });
    // --- End Type III Addition ---
  };
}]);