(function (domInterface) {
  'use strict';

  // Core identifier for the module management system
  const coreTag = 'componentSystem';

  // Prefix used for internal data keys and generated labels to avoid conflicts
  const privateIdentifier = coreTag + '__';

  // Central registry for all component instances:
  // Maps raw DOM elements to another Map, which then maps module tags to component instances.
  const instanceRegistry = new WeakMap(); // WeakMap<HTMLElement, Map<string, ComponentInstance>>

  // A Set to keep track of which module types have had their global 'setup' function invoked
  const moduleGlobalSetupTracker = new Set();

  /**
   * Retrieves an active component instance associated with a given DOM node and module tag.
   * @param {object} nodeWrapper - The jQuery-wrapped DOM element.
   * @param {string} moduleTag - The unique identifier for the module type.
   * @returns {object|undefined} The component instance, or undefined if not found.
   */
  const retrieveComponentInstance = (nodeWrapper, moduleTag) => {
    const actualNode = nodeWrapper.get(0); // Get the raw DOM element from the jQuery object
    if (!actualNode) return undefined;
    const nodeInstances = instanceRegistry.get(actualNode);
    return nodeInstances ? nodeInstances.get(moduleTag) : undefined;
  };

  /**
   * Checks if a specific module component is attached to a given DOM node.
   * @param {object} nodeWrapper - The jQuery-wrapped DOM element.
   * @param {string} moduleTag - The unique identifier for the module type.
   * @returns {boolean} True if an instance is attached, false otherwise.
   */
  const checkComponentAttachment = (nodeWrapper, moduleTag) => {
    const instance = retrieveComponentInstance(nodeWrapper, moduleTag);
    // Ensure the instance is of the correct constructor type globally registered by jQuery
    return instance instanceof domInterface[moduleTag];
  };

  /**
   * The main factory function that defines and registers a new module type.
   * This function replaces the original `$[easyPlug]` utility.
   * @param {object} blueprint - The configuration object for the new module.
   * @returns {class} The ComponentController class for the newly defined module.
   */
  const moduleDefinitionProducer = (blueprint) => {
    blueprint = blueprint || {};

    // Generate a unique identifier for this module if not provided
    const moduleTag = blueprint.label || (coreTag + '_' + Date.now());

    /**
     * The actual ComponentController class, which serves as the constructor
     * for individual instances of this module type. This replaces the `Plugin` constructor.
     */
    class ComponentController {
      /**
       * Creates an instance of ComponentController.
       * @param {object} nodeWrapper - The jQuery-wrapped DOM element this component controls.
       * @param {object} componentConfiguration - Specific settings for this instance.
       */
      constructor(nodeWrapper, componentConfiguration) {
        this.baseElement = nodeWrapper; // Stores the jQuery-wrapped element
        // Merge default options with instance-specific configuration
        this.options = domInterface.extend({}, ComponentController.defaults, componentConfiguration);

        const actualNode = nodeWrapper.get(0); // Get the raw DOM element
        let nodeInstances = instanceRegistry.get(actualNode);
        if (!nodeInstances) {
          nodeInstances = new Map();
          instanceRegistry.set(actualNode, nodeInstances);
        }
        nodeInstances.set(moduleTag, this); // Store this instance in the registry

        // Invoke the global 'setup' method from the blueprint, but only once per module type
        if (!moduleGlobalSetupTracker.has(moduleTag) && typeof blueprint.setup === 'function') {
          moduleGlobalSetupTracker.add(moduleTag);
          // Call 'setup' with the ComponentController class as 'this' context
          Reflect.apply(blueprint.setup, ComponentController, []);
        }

        // Invoke the instance-specific 'mount' method from the blueprint
        if (typeof blueprint.mount === 'function') {
          // Call 'mount' with the current instance as 'this' context
          Reflect.apply(blueprint.mount, this, []);
        }
      }

      /**
       * Static method to format a generic string by prepending the module's private identifier
       * and tag. Useful for custom event names or data attributes.
       * @param {string} genericInput - The string to format.
       * @returns {string} The formatted string.
       */
      static formatLabel(genericInput) {
        const trimmed = String(genericInput).trim();
        // Split by whitespace, map each part to the prefixed format, then join
        return trimmed.split(/\s+/).map(part => `${privateIdentifier}${moduleTag}-${part}`).join(' ');
      }

      /**
       * Static method to format a global context string (e.g., event names) with the module's
       * unique namespace.
       * @param {string} globalContext - The global context string (e.g., "click focus").
       * @param {string} [localContext] - An optional local context string to append.
       * @returns {string} The namespaced context string.
       */
      static formatContext(globalContext, localContext) {
        const trimmedGlobal = String(globalContext).trim();
        const fullNamespace = `.${privateIdentifier}${moduleTag}${localContext ? '.' + localContext : ''}`;
        // Split by whitespace, append the full namespace to each part, then join
        return trimmedGlobal.split(/\s+/).map(part => `${part}${fullNamespace}`).join(' ');
      }

      /**
       * Static method to retrieve the unique identifier for this module type.
       * @returns {string} The module's tag.
       */
      static getIdentifier() {
        return moduleTag;
      }
    }

    // Apply default configuration values from the blueprint
    ComponentController.defaults = domInterface.extend({}, blueprint.defaults);

    // Process and store action names (equivalent to 'events' in the original)
    if (blueprint.actions) {
      ComponentController.actions = {};
      blueprint.actions.forEach(actionName => {
        ComponentController.actions[actionName] = ComponentController.formatLabel(actionName);
      });
    }

    // Extend the ComponentController's prototype with methods provided in the blueprint
    domInterface.extend(ComponentController.prototype, blueprint.prototype);

    // Register the ComponentController class directly on the jQuery object
    domInterface[moduleTag] = ComponentController;

    /**
     * Define the jQuery plugin method (`$.fn[moduleTag]`). This allows users to
     * interact with the module via jQuery's chainable methods.
     * @param {string|object} operation - A method name string or an initial configuration object.
     * @param {...any} operationArguments - Arguments for the method call.
     * @returns {object} The result of the method call or the jQuery object for chaining.
     */
    domInterface.fn[moduleTag] = function (operation, ...operationArguments) {
      let invocationResult; // Stores the result of a method call, if any
      const isMethodInvocation = typeof operation === 'string';
      // If not a method call, 'operation' is the initial configuration
      const initialConfiguration = isMethodInvocation ? {} : (operation || {});

      // Iterate over each element in the jQuery collection
      this.each(function () {
        const currentElementWrapper = domInterface(this);
        let currentComponentInstance = retrieveComponentInstance(currentElementWrapper, moduleTag);

        // If no instance exists for this element, create a new one
        if (!currentComponentInstance) {
          currentComponentInstance = new ComponentController(currentElementWrapper, initialConfiguration);
        }

        // If a method is being called and no result has been obtained yet from a previous element
        if (invocationResult === undefined && isMethodInvocation) {
          // If the method exists on the instance, call it
          if (typeof currentComponentInstance[operation] === 'function') {
            invocationResult = Reflect.apply(currentComponentInstance[operation], currentComponentInstance, operationArguments);
          // Otherwise, if a general 'execute' method exists in the blueprint, call it
          } else if (typeof blueprint.execute === 'function') {
            invocationResult = Reflect.apply(blueprint.execute, currentComponentInstance, [operation, operationArguments]);
          }
        }
      });

      // If a method call produced a result, return it to break the chain
      if (invocationResult !== undefined) {
        return invocationResult;
      }

      // Otherwise, return the jQuery object for chainability
      return this;
    };

    return ComponentController;
  };

  // Expose the module definition producer and utility functions globally via jQuery
  domInterface[coreTag] = moduleDefinitionProducer;
  domInterface[coreTag].checkModule = checkComponentAttachment;
  domInterface[coreTag].fetchInstance = retrieveComponentInstance;

}(jQuery));