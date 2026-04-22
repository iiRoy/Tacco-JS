(function(moduleBuilder) {
  // Standard environment detection and module export logic.
  // This section ensures the library is available across different JavaScript contexts.
  if (typeof define === "function" && define.amd) {
    // Asynchronous Module Definition (AMD) support.
    define([], moduleBuilder);
  } else if (typeof exports === "object") {
    // CommonJS environment support (e.g., Node.js).
    const exportObject = moduleBuilder();
    if (typeof module === "object") {
      // Node.js specific module export.
      module.exports = exportObject;
    } else {
      // General CommonJS export.
      exports = exportObject;
    }
  } else if (typeof window === "object" && window !== null) {
    // Browser environment support.
    window.EnhancedType = moduleBuilder();
  } else if (typeof console === "object" && console.error instanceof Function) {
    // Fallback for unrecognized environments, logs an error.
    console.error("EnhancedType: Unable to determine the execution environment for module export.");
  }

})(function() {

  // A collection of internal utility functions for type manipulation.
  const internalUtils = {
    // Verifies if an entity is a callable function.
    isCallable: function(targetEntity) {
      return typeof targetEntity === 'function';
    },
    // Checks if a value is strictly undefined.
    isAbsent: function(valueToCheck) {
      return valueToCheck === undefined;
    },
    // Determines if an entity is a non-null object.
    isPlainObject: function(potentialObject) {
      return typeof potentialObject === 'object' && potentialObject !== null;
    },
    // Ascertains if an object adheres to a custom property descriptor format.
    // Our descriptors use a 'descriptorFlag: true' to distinguish.
    isPropertyDescriptor: function(entity) {
      return internalUtils.isPlainObject(entity) && entity.hasOwnProperty('descriptorFlag') && entity.descriptorFlag === true;
    },
    // Merges properties from source objects into a target object.
    // Properties are only added if they don't already exist on the target.
    mixinProperties: function(targetObject) {
      const sourceObjects = Array.prototype.slice.call(arguments, 1);
      if (!internalUtils.isPlainObject(targetObject)) {
        // Log a warning if the target is not a valid object, but proceed to return it.
        console.warn("EnhancedType: Attempted to mixin into a non-object target. Target was:", targetObject);
        return targetObject;
      }
      for (let idx = 0; idx < sourceObjects.length; idx++) {
        const currentSource = sourceObjects[idx];
        if (!internalUtils.isPlainObject(currentSource)) {
          // Skip non-object sources, but do not halt the entire mixin process.
          continue;
        }
        for (const propKey in currentSource) {
          // Only add properties if they are not already present on the target.
          if (!targetObject.hasOwnProperty(propKey)) {
            targetObject[propKey] = currentSource[propKey];
          }
        }
      }
      return targetObject;
    },
    // Ensures an object is provided; if not, returns a default empty object.
    ensureObject: function(input, defaultVal = {}) {
      return internalUtils.isPlainObject(input) ? input : defaultVal;
    }
  };

  // Global configuration settings for the type creation system.
  const typeCreationConfig = {
    // An internal Symbol to uniquely identify static property containers.
    _isStaticDefinitionEntity: Symbol('isStaticDefinition'),
    // A flag to enable or disable verbose development mode logging.
    devModeEnabled: false,
    // A flag to enable or disable verbose logging during legacy type assimilation.
    verboseLogging: false
  };

  // A boolean flag to manage the prototype construction phase, preventing
  // unintended constructor calls during inheritance setup.
  let isPrototypingPhaseActive = false;

  // The foundational type (constructor function) from which all other enhanced types inherit.
  const RootType = function() {
    // The base constructor is intentionally lightweight.
    // Specific initialization logic is expected in derived types via 'initializeInstance'.
  };

  // A registry to keep track of all types that have been derived from this root.
  RootType._derivedTypesRegistry = [];
  // An object to hold static properties for the RootType.
  RootType._staticProps = {};

  // Method to facilitate the creation of new types inheriting from the current type (`this`).
  RootType._forgeDerivedType = function(instanceBlueprint, staticBlueprint, buildOptions) {

    // Ensure all input blueprints and options are valid objects, providing defaults if necessary.
    instanceBlueprint = internalUtils.ensureObject(instanceBlueprint);
    staticBlueprint = internalUtils.ensureObject(staticBlueprint);
    buildOptions = internalUtils.ensureObject(buildOptions);

    // Merge global configuration defaults into the specific build options.
    internalUtils.mixinProperties(buildOptions, typeCreationConfig);

    // Alias the current type (the parent in this inheritance chain) for clarity.
    const ParentType = this;

    // Define the constructor function for our new derived type.
    const DerivedType = function() {
      // If the system is currently setting up the prototype chain, bypass the initializer.
      if (isPrototypingPhaseActive) {
        return;
      }

      // Store a non-enumerable reference to the constructor on the instance itself.
      Object.defineProperty(this, '_constructorReference', {
        value: DerivedType,
        writable: false,
        configurable: false
      });

      // Execute the instance's custom initializer method if it is defined.
      if (internalUtils.isCallable(this.initializeInstance)) {
        this.initializeInstance.apply(this, arguments);
      }
    };

    // Begin the prototype construction phase.
    isPrototypingPhaseActive = true;
    // Establish the prototype chain using Object.create, which avoids invoking ParentType's constructor.
    const derivedPrototype = Object.create(ParentType.prototype);
    // End the prototype construction phase.
    isPrototypingPhaseActive = false;

    // Ensure the 'constructor' property of the new prototype correctly points to DerivedType.
    Object.defineProperty(derivedPrototype, 'constructor', {
      value: DerivedType,
      writable: true,
      configurable: true
    });

    // Link the new DerivedType to its ParentType via a non-enumerable property.
    Object.defineProperty(DerivedType, '_parentType', {
      value: ParentType,
      writable: false,
      configurable: false
    });

    // Initialize a registry for types derived from this new DerivedType.
    DerivedType._derivedTypesRegistry = [];
    // Add the new DerivedType to its ParentType's registry of derived types.
    ParentType._derivedTypesRegistry.push(DerivedType);

    // Make the new DerivedType itself extendable by referencing the root forging method.
    DerivedType._forgeDerivedType = RootType._forgeDerivedType;

    // Apply instance-level properties and methods from the blueprint to the derived prototype.
    for (const propKey in instanceBlueprint) {
      const propDefinition = instanceBlueprint[propKey];
      const parentPropDefinition = ParentType.prototype[propKey];

      if (internalUtils.isPropertyDescriptor(propDefinition)) {
        // If the blueprint item is a custom descriptor, define the property with its full configuration.
        Object.defineProperty(derivedPrototype, propKey, propDefinition);
      } else {
        // Otherwise, perform a simple assignment of the value.
        derivedPrototype[propKey] = propDefinition;

        // If both the current and parent properties are distinct functions,
        // provide a hidden reference to the parent's implementation for 'super' calls.
        if (internalUtils.isCallable(propDefinition) &&
          internalUtils.isCallable(parentPropDefinition) &&
          propDefinition !== parentPropDefinition) {

          Object.defineProperty(propDefinition, '_superImplementation', {
            value: parentPropDefinition,
            writable: false, // Prevent modification of this reference
            configurable: true // Allow removal or redefinition of the _superImplementation property itself
          });
        }
      }
    }

    // Finally, assign the prepared derived prototype to the DerivedType constructor.
    DerivedType.prototype = derivedPrototype;

    // Handle static properties (class-level members).
    // Inherit static properties from the ParentType and then mix in new staticBlueprint properties.
    DerivedType._staticProps = internalUtils.ensureObject(Object.create(ParentType._staticProps));
    internalUtils.mixinProperties(DerivedType._staticProps, staticBlueprint);

    // Add a simple logging message if development mode is enabled.
    if (buildOptions.devModeEnabled) {
      console.log(`[EnhancedType DevMode] Successfully forged new type: ${DerivedType.name || 'AnonymousDerivedType'}`);
    }

    // Define a method on the DerivedType to check its ancestry.
    DerivedType.isDescendantOf = function(targetAncestor) {
      if (!internalUtils.isCallable(targetAncestor)) {
        return false; // The target must be a constructor function for comparison.
      }
      let currentParent = this._parentType;
      // Traverse up the parent chain until RootType or no parent is found.
      while (currentParent && currentParent !== RootType) {
        if (currentParent === targetAncestor) {
          return true; // Found the target ancestor in the chain.
        }
        currentParent = currentParent._parentType;
      }
      return false; // Target ancestor was not found.
    };

    return DerivedType;
  };

  // Converts an existing prototype-based constructor (a "legacy" type) into our enhanced type system.
  RootType._assimilateLegacyType = function(legacyConstructor, adaptationOptions) {

    // Pre-validation: ensure the input is indeed a constructor function.
    if (!internalUtils.isCallable(legacyConstructor)) {
      console.error("EnhancedType: Cannot assimilate a non-callable entity as a legacy type. Input was:", legacyConstructor);
      return RootType; // Return the base type as a safe fallback.
    }

    // Extract instance properties from the legacy constructor's prototype.
    const adaptedInstanceProps = internalUtils.ensureObject(legacyConstructor.prototype);
    adaptationOptions = internalUtils.ensureObject(adaptationOptions);

    // Override or add an 'initializeInstance' method to wrap the legacy constructor's behavior.
    adaptedInstanceProps.initializeInstance = function() {
      const currentInstance = this;

      // Construct an instance of the original legacy type using our internal helper.
      const originalObject = RootType._createInstanceWithArguments(legacyConstructor, arguments);

      // Store a hidden, non-writable reference to the original object.
      Object.defineProperty(this, '_legacyOrigin', {
        value: originalObject,
        writable: false,
        configurable: false
      });

      // Transfer own, non-function properties from the original object to the new instance as getters/setters.
      for (const propKey in originalObject) {
        if (originalObject.hasOwnProperty(propKey) && !internalUtils.isCallable(originalObject[propKey])) {
          Object.defineProperty(currentInstance, propKey, {
            enumerable: true, // Make these properties enumerable.
            configurable: true, // Allow future redefinition.
            get: function() {
              return originalObject[propKey];
            },
            set: function(val) {
              originalObject[propKey] = val;
            }
          });
        }
      }
      // Log assimilation if verbose logging is enabled.
      if (adaptationOptions.verboseLogging) {
        console.info(`EnhancedType: Assimilated legacy type: ${legacyConstructor.name || 'AnonymousLegacyType'}`);
      }
    };

    // Finally, create and return our new enhanced type using the derived type forging mechanism.
    return RootType._forgeDerivedType(adaptedInstanceProps, {}, adaptationOptions);
  };

  // Provides an apply-like mechanism for constructing instances of a target type
  // with a given list of arguments.
  RootType._createInstanceWithArguments = function(targetConstructor, invocationArgs) {
    // Validate that the target is indeed a constructor function.
    if (!internalUtils.isCallable(targetConstructor)) {
      throw new TypeError("EnhancedType: Target constructor for instance creation must be a function.");
    }

    // Ensure invocationArgs is an array, converting it if necessary.
    const actualArgs = Array.isArray(invocationArgs) ? invocationArgs : Array.from(invocationArgs || []);

    // A temporary constructor wrapper to correctly apply arguments to the target constructor.
    const TempConstructorWrapper = function() {
      return targetConstructor.apply(this, actualArgs);
    };

    // Maintain the prototype chain for the temporary constructor.
    TempConstructorWrapper.prototype = targetConstructor.prototype;

    // Return a new instance created using the temporary constructor.
    return new TempConstructorWrapper();
  };

  return RootType;
});