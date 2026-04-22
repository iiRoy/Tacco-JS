// This module introduces an advanced inheritance system for Backbone's core components.
// It synthesizes patterns observed in Backbone.js's object extension utilities
// and John Resig's classic Simple JavaScript Inheritance technique, providing a '_super' call mechanism.
// The author claims no originality for the underlying concepts, only for their integration and adaptation.
(function(globalContext, moduleBootstrapper) {

  // First, attempt to detect and configure for Asynchronous Module Definition (AMD) environments.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'backbone'], function(utilityLibrary, frameworkCore) {
      // Even in AMD, we execute the bootstrapper to potentially set up global references
      // for compatibility with other scripts that might expect global `_` and `Backbone`.
      moduleBootstrapper( utilityLibrary, frameworkCore);
    });

  // Next, check for Node.js or CommonJS module systems.
  } else if (typeof exports !== 'undefined' && typeof require === 'function') {
    const utilityLibrary = require('underscore');
    const frameworkCore = require('backbone');
    moduleBootstrapper(utilityLibrary, frameworkCore);

  // If no module loader is identified, proceed with a traditional browser global context.
  } else {
    // Implement robust checks for global objects before attempting access. (Type III: Guard clause)
    if (!globalContext) {
        console.error("The global context (e.g., 'window' in browsers) is unavailable. Module initialization aborted.");
        return;
    }
    // Provide a warning if expected global libraries are not found, but proceed to avoid hard errors.
    if (!globalContext._ || !globalContext.Backbone) {
        console.warn("Underscore or Backbone global objects were not found. Proceeding with initialization, but functionality may be compromised.");
    }
    moduleBootstrapper(globalContext._, globalContext.Backbone); // Pass global references
  }

}(this, function moduleBootstrapper(utilityLibrary, frameworkCore) { // Renamed factory to moduleBootstrapper, parameters renamed

    // A utility function to merge properties from one or more source objects into a target object.
    // This serves as a replacement for `_.extend` for Type III changes.
    const propertyMerger = function(targetObject, ...sourceObjects) {
        if (!targetObject || typeof targetObject !== 'object') {
            console.error("Invalid target provided for property merging. Must be an object.");
            return targetObject;
        }
        for (const currentSource of sourceObjects) {
            if (currentSource && typeof currentSource === 'object') {
                for (const keyIdentifier in currentSource) {
                    // Ensure the property is directly owned by the source object.
                    if (Object.prototype.hasOwnProperty.call(currentSource, keyIdentifier)) {
                        targetObject[keyIdentifier] = currentSource[keyIdentifier];
                    }
                }
            }
        }
        return targetObject;
    };

    // Before patching, confirm that the Backbone framework object is properly loaded and accessible.
    // (Type III: Added a validation/guard clause)
    if (!frameworkCore || typeof frameworkCore.Model === 'undefined' || typeof frameworkCore.Collection === 'undefined') {
        console.error("Backbone framework is not fully loaded or accessible. The extended inheritance patch cannot be applied.");
        return;
    }

    // Define the list of Backbone base components whose 'extend' methods will be enhanced.
    // (Type III: Introduced an array for clarity and maintainability)
    const backboneClassesToEnhance = [
        frameworkCore.Model,
        frameworkCore.Collection,
        frameworkCore.Router,
        frameworkCore.View
    ];

    // Iterate through the identified Backbone components and override their 'extend' method.
    // This modification introduces the '_super' call functionality.
    for (const ComponentClass of backboneClassesToEnhance) {
        // Ensure the component class and its 'extend' method exist before attempting to patch.
        if (ComponentClass && typeof ComponentClass.extend === 'function') { // Type III: Added robust checks
            ComponentClass.extend = function(prototypeProperties, staticProperties) { // Parameter renaming
                // Delegate the actual inheritance logic to our custom function.
                const newDerivedClass = constructInheritedType(this, prototypeProperties, staticProperties); // Variable renaming
                // Crucially, ensure the newly created class can also be extended further.
                // It inherits the 'extend' method from its parent (this).
                newDerivedClass.extend = this.extend;
                return newDerivedClass;
            };
        } else {
            console.warn(`Skipping 'extend' patch for a Backbone component, as it appears to be missing or invalid.`);
        }
    }

    // A specialized function to throw an error when a '_super' call targets a non-existent parent method.
    // (Renamed from unImplementedSuper)
    const parentMethodMissingError = function(methodNameIdentifier){
        throw new Error(`Attempted to call '_super' on method '${methodNameIdentifier}', but no such method exists in the parent class.`); // Enhanced error message
    };

    // A regular expression used to detect if a function's source code contains the '_super' keyword.
    // This helps determine which methods require wrapping.
    const superInvocationRegex = /\b_super\b/; // Renamed from fnTest

    /**
     * Creates a proxy function that enables `this._super()` calls within overridden methods.
     * @param {object} baseClassPrototype - The prototype object of the parent class.
     * @param {string} memberName - The name of the method being proxied.
     * @param {function} originalMemberFunction - The method from the derived class that might call _super.
     * @returns {function} The wrapped function, ready for execution.
     */
    const createSuperProxy = function(baseClassPrototype, memberName, originalMemberFunction) { // Function and parameter renaming
        const proxiedMember = function() { // Renamed from wrapper
            // Safely store any existing `_super` reference to restore it later,
            // preventing conflicts in nested `_super` calls.
            const temporarySuperReference = this._super; // Variable renaming

            // Set `this._super` to the parent's implementation of the current method.
            const actualParentMethod = baseClassPrototype[memberName];
            if (typeof actualParentMethod === 'function') { // Type III: Added explicit type check
                this._super = actualParentMethod;
            } else {
                // If the parent method isn't a function, use our error handler.
                this._super = parentMethodMissingError(memberName);
            }

            let executionResult; // Renamed from ret
            try {
                // Execute the original derived class method, now with `this._super` available.
                executionResult = originalMemberFunction.apply(this, arguments);
            } finally {
                // Always restore the `_super` reference to its original state.
                this._super = temporarySuperReference;
            }
            return executionResult;
        };

        // Transfer any additional properties (e.g., custom attributes) from the original function
        // to the new proxy function. This maintains metadata.
        for (const propertyIdentifier in originalMemberFunction) { // Renamed from prop
            if (Object.prototype.hasOwnProperty.call(originalMemberFunction, propertyIdentifier)) {
                proxiedMember[propertyIdentifier] = originalMemberFunction[propertyIdentifier];
                // The original implementation moved properties by deleting from the source.
                // We retain this behavior for clone fidelity, making it explicit.
                delete originalMemberFunction[propertyIdentifier];
            }
        }

        return proxiedMember;
    };

    // A blank constructor function used solely for establishing the prototype chain.
    // This prevents the parent's constructor from being inadvertently called during prototype setup.
    const prototypeLinkerConstructor = function(){}; // Renamed from ctor

    /**
     * The core inheritance function, responsible for creating a new class.
     * It handles prototype chain setup, property merging, and method wrapping for '_super' calls.
     * @param {function} baseType - The constructor function of the class being extended.
     * @param {object} [instanceDefinition] - An object defining prototype properties and methods for the new class.
     * @param {object} [classDefinition] - An object defining static properties and methods for the new class's constructor.
     * @returns {function} The newly constructed child class constructor.
     */
    const constructInheritedType = function(baseType, instanceDefinition, classDefinition) { // Renamed function and parameters
        let newDerivedClass; // Renamed from child
        const basePrototype = baseType.prototype; // Renamed from parentProto

        // Ensure optional definition objects are at least empty objects to avoid errors.
        // (Type III: Added guard for optional parameters)
        instanceDefinition = instanceDefinition || {};
        classDefinition = classDefinition || {};

        // Determine the constructor function for the new derived class.
        // It can be explicitly provided in `instanceDefinition` or default to calling the base type's constructor.
        if (instanceDefinition.hasOwnProperty('constructor') && typeof instanceDefinition.constructor === 'function') { // Added type check for robustness
            newDerivedClass = instanceDefinition.constructor;
        } else {
            // Default constructor simply invokes the base type's constructor with all arguments.
            newDerivedClass = function(...invocationArgs){ return baseType.apply(this, invocationArgs); }; // Type III: Used spread operator for arguments
        }

        // Apply static properties from the base type and then from the provided class definition.
        // (Type III: Using custom propertyMerger)
        propertyMerger(newDerivedClass, baseType, classDefinition);

        // Establish the prototype chain without invoking the base type's constructor.
        // This is a common pattern for classical inheritance in JavaScript.
        prototypeLinkerConstructor.prototype = basePrototype;
        const derivedClassPrototype = new prototypeLinkerConstructor(); // Type III: Introduced intermediate variable
        newDerivedClass.prototype = derivedClassPrototype;

        // Apply instance properties and methods to the new class's prototype.
        if (instanceDefinition) { // Redundant check due to `|| {}` above, but harmless.
            // First, merge all properties directly.
            // (Type III: Using custom propertyMerger)
            propertyMerger(newDerivedClass.prototype, instanceDefinition);

            // Then, iterate through the instance methods to identify and wrap those that use '_super'.
            for (const memberName in instanceDefinition) { // Renamed from name
                // Only process properties directly owned by the instance definition.
                if (Object.prototype.hasOwnProperty.call(instanceDefinition, memberName)) {
                    const currentPrototypeMember = instanceDefinition[memberName];
                    // Check if the member is a function and if its string representation contains '_super'.
                    if (typeof currentPrototypeMember === "function" && superInvocationRegex.test(currentPrototypeMember.toString())) {
                        // Replace the original method with our proxy that enables '_super' calls.
                        newDerivedClass.prototype[memberName] = createSuperProxy(basePrototype, memberName, currentPrototypeMember);
                    }
                }
            }
        }

        // Correctly set the `constructor` property on the derived class's prototype.
        newDerivedClass.prototype.constructor = newDerivedClass;

        // Provide a convenient reference to the parent's prototype, useful for direct access.
        newDerivedClass.__base_prototype_reference__ = basePrototype; // Renamed from __super__

        return newDerivedClass;
    };

    // The primary objective of this module is to patch Backbone's 'extend' methods.
    // Therefore, the bootstrapper function itself does not need to return a value,
    // as its side effect (the patching) is the desired outcome.
    // (Type III: Removed the explicit return statement, as it's not consumed by the UMD wrapper)

}));