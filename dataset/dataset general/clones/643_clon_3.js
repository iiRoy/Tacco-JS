/*
 * Component Integration Framework
 *
 * This software is provided under the MIT License.
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
 * @author     Corey Ahnson <corey.ahnson@example.com>
 * @license    https://opensource.org/licenses/MIT
 */
(function (jq) {
  'use strict';

  // Ensure jQuery is available before proceeding.
  if (typeof jq === 'undefined') {
    console.error('Corey Ahnson Component Framework requires jQuery to be loaded.');
    return;
  }

  const
    // A unique key for our component management system.
    componentManagerKey = 'componentManager',

    // Prefix for data attributes and internal identifiers to prevent collisions.
    dataInstanceKeyPrefix = componentManagerKey + '__';

  /**
   * Establishes a new jQuery component.
   * This function acts as a factory for creating structured jQuery plugins.
   *
   * @param {Object} definitionObject - The configuration object for the new component.
   * @returns {Function} The constructor function for the newly defined component.
   */
  jq[componentManagerKey] = function (definitionObject) {
    let ComponentConstructor, componentId, hasInitializedFirstInstance; // Declare variables up front.

    // Initialize the component definition, ensuring it's an object.
    const componentDefinition = definitionObject || {};

    /**
     * The actual constructor for individual component instances.
     * This function runs when a component is first initialized on a DOM element.
     * @param {HTMLElement} hostElement - The raw DOM element this component is attached to.
     * @param {Object} initializationOptions - User-provided options for this specific instance.
     */
    ComponentConstructor = function (hostElement, initializationOptions) {
      const currentElement = jq(hostElement);

      // Store a reference to this instance on the DOM element's data.
      this.hostElement = currentElement.data(dataInstanceKeyPrefix + componentId, this);

      // Merge default settings with user-provided options.
      const resolvedOptions = Object.assign({}, ComponentConstructor.defaultSettings, initializationOptions);
      this.currentSettings = resolvedOptions;

      // Execute a global setup function only once for the very first instance of this component type.
      if (!hasInitializedFirstInstance && typeof componentDefinition.globalSetup === 'function') {
        hasInitializedFirstInstance = true;
        componentDefinition.globalSetup.call(ComponentConstructor); // Call in the context of the static constructor.
      }

      // Execute the instance-specific constructor logic if defined.
      if (typeof componentDefinition.instanceInit === 'function') {
        componentDefinition.instanceInit.call(this); // Call in the context of the current instance.
      }
    };

    // Determine the unique identifier for this component type.
    componentId = componentDefinition.id || `${componentManagerKey}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    if (!componentId || typeof componentId !== 'string') {
        console.warn(`Invalid or missing component ID. Generated a fallback: ${componentId}`);
    }

    // --- Static Utility Methods for the Component Constructor ---

    /**
     * Prepends the component's unique prefix to a given string, typically for data attributes or custom events.
     * Ensures consistent naming conventions across the component.
     * @param {string} inputString - The base string to prefix.
     * @returns {string} The prefixed string.
     */
    ComponentConstructor.applyComponentPrefix = function (inputString) {
      // Clean leading/trailing whitespace, then prefix each word/segment.
      const cleanedString = String(inputString || '').trim();
      if (!cleanedString) return '';
      return cleanedString.replace(/(\s+|^)/g, `$1${dataInstanceKeyPrefix}${componentId}-`);
    };

    /**
     * Appends a namespace to event strings, useful for event binding/unbinding.
     * This helps in managing events specific to a component instance or type.
     * @param {string} eventNames - One or more event names (space-separated).
     * @param {string} [subNamespace] - An optional additional sub-namespace for more specificity.
     * @returns {string} The namespaced event string.
     */
    ComponentConstructor.applyEventNamespace = function (eventNames, subNamespace) {
      const baseNamespace = `.${dataInstanceKeyPrefix}${componentId}`;
      const fullNamespace = subNamespace ? `${baseNamespace}.${subNamespace}` : baseNamespace;
      return String(eventNames || '').trim().replace(/(\s+|$)/g, `${fullNamespace}$1`);
    };

    /**
     * Retrieves the unique identifier for this component type.
     * @returns {string} The component's ID.
     */
    ComponentConstructor.getComponentIdentifier = function () {
      return componentId;
    };

    // --- Static Properties for the Component Constructor ---

    // Define default settings for all instances of this component type.
    ComponentConstructor.defaultSettings = Object.assign({}, componentDefinition.defaultOptions);

    // Process and store predefined custom events with their generated prefixed names.
    if (Array.isArray(componentDefinition.customEvents)) {
      ComponentConstructor.eventAliases = {};
      componentDefinition.customEvents.forEach(function (eventName) {
        // Example: 'componentReady' becomes 'componentManager__myComponent-componentReady'
        ComponentConstructor.eventAliases[eventName] = ComponentConstructor.applyComponentPrefix(eventName);
      });
    }

    // Extend the component's prototype with methods defined in the definition object.
    Object.assign(ComponentConstructor.prototype, componentDefinition.instanceMethods);

    // --- Integrate the Component with jQuery's Plugin System ---

    // Make the component constructor directly accessible via `jq.MyComponentName`.
    jq[componentId] = ComponentConstructor;

    /**
     * Defines the jQuery plugin method for this component.
     * This allows users to instantiate and interact with the component via `jq('.selector').myComponentName(options);`.
     * @param {string|Object} actionOrOptions - A method name string, or an object of options for instantiation.
     * @returns {jQuery|any} The jQuery object for chaining, or a return value from a called method.
     */
    jq.fn[componentId] = function (actionOrOptions) {
      const methodArgs = Array.prototype.slice.call(arguments, 1);
      let invocationResult;
      let hasResultBeenSet = false; // Flag to ensure we only capture the first method's return.

      // Iterate over each selected DOM element.
      this.each(function () {
        const currentTargetElement = jq(this);
        let componentInstance = currentTargetElement.data(dataInstanceKeyPrefix + componentId);

        // If no instance exists, create one (assuming `actionOrOptions` is not a method call).
        if (!componentInstance) {
          const initOpts = typeof actionOrOptions === 'object' ? actionOrOptions : {};
          componentInstance = new ComponentConstructor(this, initOpts);
          // If the primary action was a method call but no instance existed, we defer.
          if (typeof actionOrOptions === 'string') {
              console.warn(`Component '${componentId}' not initialized on element. Method '${actionOrOptions}' ignored.`);
              return; // Skip method call for uninitialized instances.
          }
        }

        // If `actionOrOptions` is a string, it's a method call.
        if (typeof actionOrOptions === 'string') {
          const targetMethod = componentInstance[actionOrOptions];

          // Check if the requested method exists on the instance.
          if (typeof targetMethod === 'function') {
            // Only capture the result from the first element's method call.
            if (!hasResultBeenSet) {
              invocationResult = targetMethod.apply(componentInstance, methodArgs);
              hasResultBeenSet = true;
            }
          } else if (typeof componentDefinition.fallbackMethod === 'function') {
            // If a fallback method is defined, call it for unknown methods.
            if (!hasResultBeenSet) {
              invocationResult = componentDefinition.fallbackMethod.call(componentInstance, actionOrOptions, methodArgs);
              hasResultBeenSet = true;
            }
          } else {
            console.warn(`Method "${actionOrOptions}" not found on component "${componentId}" instance.`);
          }
        }
      });

      // If a method returned a value, return that value, breaking the chain.
      if (hasResultBeenSet && typeof invocationResult !== 'undefined') {
        return invocationResult;
      }

      // Otherwise, return the jQuery object for method chaining.
      return this;
    };

    // Return the constructor for advanced prototyping or direct access.
    return ComponentConstructor;
  };

  /**
   * Checks if a given jQuery element has an instance of a specific component attached.
   * @param {jQuery} targetElement - The jQuery element to check.
   * @param {string} componentIdentifier - The ID of the component type.
   * @returns {boolean} True if the component is attached, false otherwise.
   */
  jq[componentManagerKey].isComponentAttached = function (targetElement, componentIdentifier) {
    if (!targetElement || !componentIdentifier) {
        console.error('Invalid arguments for isComponentAttached.');
        return false;
    }
    const instance = targetElement.data(dataInstanceKeyPrefix + componentIdentifier);
    return instance instanceof jq[componentIdentifier];
  };

  /**
   * Retrieves an instance of a specific component attached to a jQuery element.
   * @param {jQuery} targetElement - The jQuery element.
   * @param {string} componentIdentifier - The ID of the component type.
   * @returns {Object|undefined} The component instance, or undefined if not found.
   */
  jq[componentManagerKey].getComponentInstance = function (targetElement, componentIdentifier) {
    if (!targetElement || !componentIdentifier) {
        console.error('Invalid arguments for getComponentInstance.');
        return undefined;
    }
    return targetElement.data(dataInstanceKeyPrefix + componentIdentifier);
  };

}(jQuery));