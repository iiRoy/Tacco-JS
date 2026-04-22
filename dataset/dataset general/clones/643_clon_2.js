/*
 * quickConnect Library
 *
 * This software is provided under the MIT License.
 *
 * Copyright (c) 2023 [Your Name/Org]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author     Developer X <dev.x@example.com>
 * @license    http://opensource.org/licenses/MIT
 */
(function(jqObj) {
  'use strict';

  var
    // Alias for the main system entry point
    quickAdapter = 'quickAdapter',

    // Unique prefix for component data and event names
    modulePrefix = quickAdapter + '_';

  // The primary entry point for defining new jQuery components
  jqObj[quickAdapter] = function(configDescriptor) {
    var ComponentClass, componentName, isInitialized, idx;

    // Ensure the descriptor is an object
    configDescriptor = configDescriptor || {};

    // Constructor for individual component instances
    ComponentClass = function(targetElement, userOptions) {
      // Store a reference to this component instance on the DOM element
      this.targetElement = jqObj(targetElement).data(modulePrefix + componentName, this);

      // Merge default settings with user-provided options
      this.userOptions = jqObj.extend({}, ComponentClass.defaultSettings, userOptions);

      // Perform initial setup if this is the first instance of this component type
      if (!isInitialized && typeof configDescriptor.setupModule === 'function') {
        isInitialized = true;
        configDescriptor.setupModule.call(ComponentClass);
      }

      // Call the component's custom constructor if provided
      if (typeof configDescriptor.buildComponent === 'function') {
        configDescriptor.buildComponent.call(this);
      }
    };

    // Assign a name to this component type
    componentName = configDescriptor.name || quickAdapter + (new Date().getTime());

    // --- Static methods for the ComponentClass ---

    // Adds a unique prefix to a given string, typically for data attributes or custom events
    ComponentClass.prependIdentifier = function(originalString) {
      // Remove leading/trailing whitespace, then prepend the unique identifier
      return originalString.replace(/^[\s]+|[\s]+$/g, '').replace(/([\s])+|^/g, '$1' + modulePrefix + componentName + '-');
    };

    // Appends a specific namespace to event names for scoped binding
    ComponentClass.affixScope = function(baseEvents, specificScope) {
      // Clean whitespace, then append the component's unique namespace
      return baseEvents.replace(/^[\s]+|[\s]+$/g, '').replace(/([\s])+|$/g, '.' + modulePrefix + componentName + ((specificScope && '.' + specificScope) || '') + '$1');
    };

    // Retrieves the unique name assigned to this component
    ComponentClass.getComponentName = function() {
      return componentName;
    };

    // --- Static properties for the ComponentClass ---

    // Default configuration settings for all instances
    ComponentClass.defaultSettings = jqObj.extend({}, configDescriptor.defaultSettings);

    // Process and store custom component events if defined
    if (configDescriptor.componentEvents) {
      ComponentClass.componentEvents = {};
      for (idx = 0; idx < configDescriptor.componentEvents.length; idx++) {
        // Formatted event name: 'quickAdapter_componentName-eventName'
        ComponentClass.componentEvents[configDescriptor.componentEvents[idx]] = ComponentClass.prependIdentifier(configDescriptor.componentEvents[idx]);
      }
    }

    // Extend the component's prototype with methods from the descriptor
    jqObj.extend(ComponentClass.prototype, configDescriptor.instanceMethods);

    // --- Integration with jQuery ---

    // Expose the ComponentClass constructor directly on the jQuery object
    jqObj[componentName] = ComponentClass;

    // Define the jQuery plugin method for this component
    jqObj.fn[componentName] = function(actionCommand) {
      var
        operationResult,
        methodArguments = Array.prototype.slice.call(arguments, 1);

      // Iterate over each selected DOM element
      this.each(function() {
        var componentInstance, currentElement = jqObj(this);

        // Retrieve an existing component instance or create a new one
        componentInstance = currentElement.data(modulePrefix + componentName) || new ComponentClass(currentElement, actionCommand);

        // Execute a method on the instance, but only capture the result once
        if (operationResult === undefined) {
          // If the actionCommand matches an instance method, call it
          if (typeof componentInstance[actionCommand] === 'function') {
            operationResult = componentInstance[actionCommand].apply(componentInstance, methodArguments);

          // Otherwise, if an 'executeAction' handler is defined, use that
          } else if (typeof configDescriptor.executeAction === 'function' && typeof actionCommand === 'string') {
            operationResult = configDescriptor.executeAction.call(componentInstance, actionCommand, methodArguments);
          }
        }
      });

      // If a method returned a value, break the chain and return it
      if (operationResult !== undefined) {
        return operationResult;
      }

      // Otherwise, maintain chainability
      return this;
    };

    // Return the ComponentClass constructor for direct access and further extension
    return ComponentClass;
  };

  // Helper: Determine if a specific component is attached to an element
  jqObj[quickAdapter].isLinkedTo = function(targetElement, componentAlias) {
    return targetElement.data(modulePrefix + componentAlias) instanceof jqObj[componentAlias];
  };

  // Helper: Retrieve an existing component instance from an element
  jqObj[quickAdapter].retrieveInstance = function(targetElement, componentAlias) {
    return targetElement.data(modulePrefix + componentAlias);
  };

}(jQuery));