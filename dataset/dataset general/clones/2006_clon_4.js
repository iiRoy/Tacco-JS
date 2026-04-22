(function(creatorFunction) {
  if (typeof define === "function" && define.amd) {
    // Modular AMD
    define([], creatorFunction);
  } else if (typeof exports === "object") {
    // Modular CommonJS
    exports = creatorFunction();
    if (typeof module === "object") {
      // Node.js environment
      module.exports = exports;
    }
  } else if (window) {
    // Browser environment
    window.Blueprint = creatorFunction();
  } else if (typeof console === "object" && console.error instanceof Function) {
    // Error scenario
    console.error("unable to determine execution environment");
  }

})(function() {

  // helper utilities
  var isCallable = function(subject) {
    return typeof subject === "function";
  };
  var isAbsent = function(subject) {
    return subject === undefined;
  };
  var isStructure = function(subject) {
    return typeof subject === "object" && subject !== null;
  };
  var isPropertyScheme = function(subject) {
    return isStructure(subject) && subject.schemeFlag === true;
  };
  var applyDefaults = function(targetObject) {
    var sources = Array.prototype.slice.call(arguments, 1);
    var i, currentSource, key;
    for (i in sources) {
      currentSource = sources[i];
      if (!isStructure(currentSource)) continue;
      for (key in currentSource) {
        if (isAbsent(targetObject[key])) targetObject[key] = currentSource[key];
      }
    }
    return targetObject;
  };

  // base configuration for blueprints
  var baseConfiguration = {
    isInternalBlueprint: false
  };

  // The base prototype for all instances created by any blueprint
  var baseInstanceMold = {};

  // Method for instances to call parent blueprint methods
  baseInstanceMold.callParent = function(methodIdentifier /*, ...args */) {
    var currentUnitDesign = this.designRef;
    if (!currentUnitDesign || !currentUnitDesign.parentDesign || !currentUnitDesign.parentDesign.mold) {
      throw new Error("Parent context for '" + methodIdentifier + "' not found for this unit.");
    }
    var parentMethod = currentUnitDesign.parentDesign.mold[methodIdentifier];
    if (!isCallable(parentMethod)) {
      throw new Error("Parent method '" + methodIdentifier + "' not found or not callable on parent design.");
    }
    var args = Array.prototype.slice.call(arguments, 1);
    return parentMethod.apply(this, args);
  };

  // The fundamental blueprint object (replaces BaseClass)
  var MasterBlueprint = {
    // This is the prototype object for instances of MasterBlueprint.
    // All other blueprint molds will inherit from this.
    mold: baseInstanceMold,
    // This method creates a new instance based on this blueprint's mold.
    spawn: function() {
      var newUnit = Object.create(this.mold);
      // Link the instance back to its blueprint
      newUnit.designRef = this;
      // Call the initializer if it exists on the instance
      if (newUnit.initiate) {
        newUnit.initiate.apply(newUnit, arguments);
      }
      return newUnit;
    },
    // This will be the method to create child blueprints (subclasses)
    evolve: null, // Assigned later
    // Stores blueprints that extend this one
    offspringDesigns: [],
    // Static members for this blueprint
    lineageTraits: {}
  };

  // The core factory function for creating child blueprints (replaces BaseClass._extend)
  var createChildBlueprint = function(parentBlueprint, instanceFeatures, lineageFeatures, config) {
    instanceFeatures = instanceFeatures || {};
    lineageFeatures = lineageFeatures || {};
    config = config || {};

    applyDefaults(config, baseConfiguration);

    var childBlueprint = {};

    // 1. Set up the prototype chain for instances.
    //    The 'mold' is the prototype for instances of this childBlueprint.
    //    It inherits from the parentBlueprint's mold.
    var childMold = Object.create(parentBlueprint.mold);
    childBlueprint.mold = childMold;

    // 2. Assign the instance creation method (reusing the base spawn logic)
    childBlueprint.spawn = MasterBlueprint.spawn;

    // 3. Store parent and offspring references
    childBlueprint.parentDesign = parentBlueprint;
    childBlueprint.offspringDesigns = [];
    parentBlueprint.offspringDesigns.push(childBlueprint);

    // 4. Make this new blueprint extendable itself
    childBlueprint.evolve = function(childInstanceFeatures, childLineageFeatures, childConfig) {
      return createChildBlueprint(childBlueprint, childInstanceFeatures, childLineageFeatures, childConfig);
    };

    // 5. Propagate instance features (methods and properties) to the child's mold
    var featureKey, featureValue;
    for (featureKey in instanceFeatures) {
      featureValue = instanceFeatures[featureKey];

      if (isPropertyScheme(featureValue)) {
        // If it's a property descriptor (scheme), use defineProperty
        Object.defineProperty(childMold, featureKey, featureValue);
      } else {
        // Otherwise, direct assignment
        childMold[featureKey] = featureValue;
        // The `callParent` mechanism is handled by a method on the instance mold itself (baseInstanceMold).
      }
    }

    // 6. Propagate lineage features (static members) to the blueprint object itself.
    //    This significantly diverges from the original's nested class for static members.
    childBlueprint.lineageTraits = {}; // Initialize static members object
    applyDefaults(childBlueprint.lineageTraits, lineageFeatures);

    // 7. Implement `_extends` equivalent
    childBlueprint.isDescendantOf = function(potentialAncestor) {
      if (this.parentDesign === MasterBlueprint) return false;
      if (potentialAncestor === this.parentDesign || potentialAncestor === MasterBlueprint) return true;
      if (!this.parentDesign) return false;
      return this.parentDesign.isDescendantOf(potentialAncestor);
    };

    return childBlueprint;
  };

  // Initialize MasterBlueprint's evolve method using the factory
  MasterBlueprint.evolve = function(instanceFeatures, lineageFeatures, config) {
    return createChildBlueprint(MasterBlueprint, instanceFeatures, lineageFeatures, config);
  };

  // --- `_convert` equivalent (wrapExistingType) ---
  // Transforms an existing constructor function (`LegacyType`) into a new blueprint.
  var wrapExistingType = function(LegacyType, config) {
    var instanceFeatures = {};

    // The 'initiate' method for our new blueprint will handle the construction
    // of the legacy type and property forwarding.
    instanceFeatures.initiate = function() {
      var self = this;

      // Construct the legacy type instance using a helper
      this.legacyInstance = forgeInstanceWithArgs(LegacyType, arguments);

      // Forward properties from the legacy instance to our new instance
      Object.keys(this.legacyInstance).forEach(function(key) {
        // Only wrap own properties, not inherited ones
        if (!self.legacyInstance.hasOwnProperty(key)) {
          return;
        }
        Object.defineProperty(self, key, {
          get: function() {
            return self.legacyInstance[key];
          },
          set: function(val) { // Added set for full mutability forwarding
            self.legacyInstance[key] = val;
          },
          enumerable: true,
          configurable: true
        });
      });
    };

    // Copy methods from the LegacyType's prototype to our new blueprint's instance features
    // This ensures methods are directly on our prototype chain, not just forwarded.
    for (var key in LegacyType.prototype) {
      if (key === 'constructor') continue; // Do not copy the constructor itself
      if (LegacyType.prototype.hasOwnProperty(key) && isCallable(LegacyType.prototype[key])) {
        instanceFeatures[key] = LegacyType.prototype[key];
      }
    }

    // Create and return the new blueprint
    return MasterBlueprint.evolve(instanceFeatures, {}, config);
  };

  // --- `_construct` equivalent (forgeInstanceWithArgs) ---
  // Creates an instance of a given constructor with an array of arguments,
  // providing an `apply`-like behavior for constructors.
  var forgeInstanceWithArgs = function(targetConstructor, argumentArray) {
    argumentArray = argumentArray || [];

    // Create a temporary constructor that applies arguments using `new`.
    // This is a common pattern for `new` with `apply` functionality.
    var TemporaryConstructor = function() {
      return targetConstructor.apply(this, argumentArray);
    };
    TemporaryConstructor.prototype = targetConstructor.prototype;

    return new TemporaryConstructor();
  };

  // Add these global utility methods to the MasterBlueprint
  MasterBlueprint.adaptLegacyBlueprint = wrapExistingType;
  MasterBlueprint.forgeInstanceWithArgs = forgeInstanceWithArgs;

  return MasterBlueprint;
});