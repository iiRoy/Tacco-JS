(function() {
  // This module provides a flexible factory pattern for creating and persisting objects.
  // It supports defining blueprints, building instances, and asynchronous attribute resolution.

  /**
   * @namespace objectUtilities
   * @description A collection of utility functions for object manipulation.
   */
  const objectUtilities = {
    /**
     * Blends properties from a source object into a target object.
     * Properties in the source object will overwrite existing properties in the target.
     * @param {object} primaryTarget - The object to which properties will be added/updated.
     * @param {object} secondarySource - The object whose properties will be copied.
     * @returns {object} The modified primaryTarget object.
     */
    blendProperties: function(primaryTarget, secondarySource) {
      if (!primaryTarget) {
        // If no target is provided, we can't merge into it.
        // Depending on desired behavior, could return secondarySource or throw error.
        // For now, return secondarySource if primaryTarget is falsy, simulating a 'create' if needed.
        return secondarySource || {};
      }
      if (!secondarySource) {
        // No source to blend, return target as is.
        return primaryTarget;
      }

      // Iterate over the source object's own enumerable properties.
      for (const propKey in secondarySource) {
        if (Object.prototype.hasOwnProperty.call(secondarySource, propKey)) {
          primaryTarget[propKey] = secondarySource[propKey];
        }
      }
      return primaryTarget;
    },

    /**
     * Creates a shallow copy of an object.
     * @param {object} originalItem - The object to be copied.
     * @returns {object} A new object with the same properties as originalItem.
     */
    duplicateObject: function(originalItem) {
      if (typeof originalItem !== 'object' || originalItem === null) {
        // Primitive types or null are returned as is (they are immutable by nature).
        return originalItem;
      }
      const clonedItem = {};
      // Utilize the blendProperties function for copying.
      objectUtilities.blendProperties(clonedItem, originalItem);
      return clonedItem;
    },

    /**
     * Retrieves an array of an object's own enumerable property names.
     * @param {object} inputObject - The object from which to get keys.
     * @returns {string[]} An array of property names.
     */
    retrievePropertyNames: function(inputObject) {
      if (typeof inputObject !== 'object' || inputObject === null) {
        // If not a valid object, there are no keys to retrieve.
        return [];
      }
      const propertyList = [];
      for (const currentKey in inputObject) {
        if (Object.prototype.hasOwnProperty.call(inputObject, currentKey)) {
          propertyList.push(currentKey);
        }
      }
      return propertyList;
    }
  };

  /**
   * Asynchronously processes each item in a collection.
   * Ensures that the next item is processed only after the current item's handler completes.
   * @param {Array} dataCollection - The array of items to process.
   * @param {Function} itemProcessor - A function to call for each item: `(item, next)` where `next` continues processing.
   * @param {Function} completionCallback - A function to call once all items have been processed.
   */
  const processItemsAsynchronously = function(dataCollection, itemProcessor, completionCallback) {
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
      // If the collection is empty or invalid, just call the completion callback.
      return completionCallback();
    }

    const totalCount = dataCollection.length;
    let currentItemIndex = -1; // Start before the first element

    const proceedToNextItem = function() {
      currentItemIndex++; // Move to the next index

      if (currentItemIndex < totalCount) {
        const currentElement = dataCollection[currentItemIndex];
        // Execute the processor for the current element, passing the continuation function.
        itemProcessor(currentElement, proceedToNextItem);
      } else {
        // All items processed, invoke the final completion callback.
        completionCallback();
      }
    };

    // Begin the asynchronous processing loop.
    proceedToNextItem();
  };

  /**
   * @private
   * @description Stores all registered factory blueprints.
   * Key: blueprint name (string), Value: { associatedModel: Function, defaultAttributes: object }
   */
  const blueprintRegistry = {};

  /**
   * Registers a new factory blueprint with a given name, model constructor, and default attributes.
   * @param {string} blueprintName - A unique name for the factory blueprint.
   * @param {Function} associatedModel - The constructor function for the model this factory creates.
   * @param {object} defaultAttributes - An object containing default properties for instances.
   */
  const registerBlueprint = function(blueprintName, associatedModel, defaultAttributes) {
    if (!blueprintName || typeof blueprintName !== 'string') {
      throw new Error("Blueprint name must be a non-empty string.");
    }
    if (typeof associatedModel !== 'function') {
      throw new Error(`Blueprint '${blueprintName}' requires a valid model constructor function.`);
    }

    blueprintRegistry[blueprintName] = {
      associatedModel: associatedModel,
      defaultAttributes: defaultAttributes || {} // Ensure defaultAttributes is always an object
    };
    // console.log(`Blueprint '${blueprintName}' registered.`);
  };

  /**
   * Constructs a new instance of a model based on a registered blueprint,
   * applying user-specified attributes and resolving any attribute functions asynchronously.
   * This function does NOT save the instance.
   * @param {string} blueprintIdentifier - The name of the blueprint to use.
   * @param {object|Function} [overrideProperties={}] - User-defined attributes to override defaults, or the callback function.
   * @param {Function} finalCallback - Callback function: `(constructedDocument)`
   */
  const constructInstance = function(blueprintIdentifier, overrideProperties, finalCallback) {
    // Handle overloaded arguments: overrideProperties is optional.
    if (typeof overrideProperties === 'function') {
      finalCallback = overrideProperties;
      overrideProperties = {};
    }
    overrideProperties = overrideProperties || {}; // Ensure it's an object

    const blueprintDefinition = blueprintRegistry[blueprintIdentifier];
    if (!blueprintDefinition) {
      throw new Error(`Factory blueprint '${blueprintIdentifier}' is not defined.`);
    }

    const targetModel = blueprintDefinition.associatedModel;
    // Create a mutable copy of the default attributes.
    const effectiveProperties = objectUtilities.duplicateObject(blueprintDefinition.defaultAttributes);
    // Blend in any user-provided overrides.
    objectUtilities.blendProperties(effectiveProperties, overrideProperties);

    // Asynchronously resolve any attribute functions within effectiveProperties.
    processItemsAsynchronously(
      objectUtilities.retrievePropertyNames(effectiveProperties),
      function(attributeKey, nextAttribute) {
        const attributeValue = effectiveProperties[attributeKey];
        if (typeof attributeValue === 'function') {
          // If the attribute is a function, execute it to get the final value.
          attributeValue(function(resolvedValue) {
            effectiveProperties[attributeKey] = resolvedValue;
            nextAttribute(); // Proceed to the next attribute.
          });
        } else {
          // If it's not a function, no resolution needed, just continue.
          nextAttribute();
        }
      },
      function() {
        // Once all attributes are resolved, instantiate the model.
        const constructedDocument = new targetModel();
        // Assign all resolved properties to the new document.
        objectUtilities.blendProperties(constructedDocument, effectiveProperties);

        // Invoke the final callback with the newly constructed document.
        finalCallback(constructedDocument);
      }
    );
  };

  /**
   * Creates and persists a new instance of a model based on a registered blueprint.
   * This function first builds the instance and then calls its `save` method.
   * @param {string} blueprintId - The name of the blueprint to use.
   * @param {object|Function} [customProperties={}] - User-defined attributes to override defaults, or the completion handler.
   * @param {Function} completionHandler - Callback function: `(persistedInstance)`
   */
  const instantiateAndPersist = function(blueprintId, customProperties, completionHandler) {
    // Handle overloaded arguments.
    if (typeof customProperties === 'function') {
      completionHandler = customProperties;
      customProperties = {};
    }
    customProperties = customProperties || {}; // Ensure it's an object

    // First, construct the instance using the build logic.
    constructInstance(blueprintId, customProperties, function(persistedInstance) {
      // Assuming `persistedInstance` has a `save` method that takes a callback.
      if (typeof persistedInstance.save !== 'function') {
        throw new Error(`Model for blueprint '${blueprintId}' does not have a 'save' method.`);
      }

      persistedInstance.save(function(errDuringSave) {
        if (errDuringSave) {
          console.error(`Error saving instance of blueprint '${blueprintId}':`, errDuringSave);
          throw errDuringSave; // Re-throw or handle appropriately.
        }
        // If save is successful, call the completion handler with the saved instance.
        completionHandler(persistedInstance);
      });
    });
  };

  /**
   * Creates an "association" function. This function, when called, will create a
   * new instance of a related blueprint and return either the instance itself
   * or a specific property from it. Useful for linking factories.
   * @param {string} relatedBlueprint - The name of the blueprint to create for the association.
   * @param {string} [returnProperty] - An optional property name to extract from the created instance.
   * @returns {Function} A function that takes a callback: `(value)` where `value` is the created instance or its property.
   */
  const associateWith = function(relatedBlueprint, returnProperty) {
    return function(callback) {
      // Use the instantiateAndPersist function to create a new entity.
      instantiateAndPersist(relatedBlueprint, function(createdEntity) {
        if (returnProperty) {
          // If a specific property is requested, return that property's value.
          callback(createdEntity[returnProperty]);
        } else {
          // Otherwise, return the entire created entity.
          callback(createdEntity);
        }
      });
    };
  };

  // --- Public API Exposure ---
  // Create the main module object which will be exposed.
  const ObjectFactoryModule = instantiateAndPersist; // Alias 'create' as the primary export.

  ObjectFactoryModule.define = registerBlueprint;
  ObjectFactoryModule.build = constructInstance;
  ObjectFactoryModule.create = instantiateAndPersist;
  ObjectFactoryModule.assoc = associateWith;
  ObjectFactoryModule.version = '1.1.0-alpha'; // Added a version property.

  // Conditional export for Node.js (CommonJS) or browser global.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectFactoryModule;
  } else {
    // For browser environments, attach to the global window object.
    this.ObjectFactory = ObjectFactoryModule;
  }
}());