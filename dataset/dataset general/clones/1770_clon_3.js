(function moduleInitializer() {
    "use strict";

    // This module offers an advanced object-oriented system for JavaScript.
    // It supports multiple inheritance, method resolution order (MRO),
    // and a robust type checking mechanism.

    let _u; // Placeholder for the utility library (e.g., Underscore.js or Lodash)

    // Determine the execution environment and acquire the utility library.
    if (typeof exports === "object" && typeof module === "object") {
        // Node.js environment
        _u = require("underscore");
        Object.assign(exports, initializeSystem(_u));
    } else if (typeof define === "function" && define.amd) {
        // AMD loader environment
        define(["underscore"], initializeSystem);
    } else {
        // Browser global scope
        if (typeof window !== "undefined" && window._) {
             _u = window._;
        } else if (typeof self !== "undefined" && self._) {
             _u = self._;
        } else {
            // Fallback if underscore is not found globally.
            // In a real scenario, this might throw an error or use a minimal internal utility.
            // For this clone, we assume underscore is available or mock minimal functionality.
            console.warn("Underscore.js not found. Functionality might be limited without it.");
            _u = {
                each: (arr, fn) => arr.forEach(fn),
                map: (arr, fn) => arr.map(fn),
                filter: (arr, fn) => arr.filter(fn),
                extend: Object.assign,
                clone: obj => Object.assign({}, obj),
                toArray: arr => Array.prototype.slice.call(arr),
                find: (arr, fn) => arr.find(fn),
                includes: (arr, val) => arr.includes(val),
                keys: Object.keys,
                // Minimal required for the clone, more would be needed for full compatibility
                chain: (obj) => ({
                    _value: obj,
                    map: function(fn) { this._value = _u.map(this._value, fn); return this; },
                    filter: function(fn) { this._value = _u.filter(this._value, fn); return this; },
                    object: function() {
                        const res = {};
                        this._value.forEach(item => res[item[0]] = item[1]);
                        return res;
                    },
                    value: function() { return this._value; },
                    reverse: function() { this._value.reverse(); return this; },
                }),
            };
        }
        window.classSystem = initializeSystem(_u); // Expose to global namespace
    }

    /**
     * The core factory function that sets up the class system.
     * @param {object} utilityToolkit - The Underscore.js or compatible utility library.
     * @returns {object} The initialized class system object.
     */
    function initializeSystem(utilityToolkit) {
        const classSystem = {}; // The main API object for this system
        const _ = utilityToolkit; // Alias for convenience

        // --- Core Internal Utilities ---

        /**
         * Represents the foundational type in this inheritance system.
         * All custom types ultimately derive from this.
         */
        function BaseConstruct() { /* Intentionally empty */ }

        /**
         * classSystem.BaseObject
         *
         * This serves as the root class for all types within this framework.
         * While it primarily acts as a marker for the system, it's crucial for
         * establishing the base of the inheritance hierarchy.
         * Use classSystem.isInstanceOfType(obj, classSystem.BaseObject) to verify
         * if an object is part of this system.
         */
        classSystem.BaseObject = BaseConstruct;
        _.extend(classSystem.BaseObject, {
            _mroChain: [classSystem.BaseObject], // Method Resolution Order chain
            _typeProperties: { _instanceInitializer: function() {} }, // Initializer for new instances
            _typeId: 1, // Unique identifier for this type
            _parentTypes: [], // Direct parent types
            _typeRegistry: { "1": classSystem.BaseObject } // Map of type IDs to type constructors
        });
        _.extend(classSystem.BaseObject.prototype, {
            _instanceInitializer: classSystem.BaseObject._typeProperties._instanceInitializer
        });

        /**
         * A utility function to create an object with a specified prototype.
         * This acts as a polyfill for Object.create for older environments,
         * ensuring prototype chain integrity.
         * @param {object} prototypeObject - The object to serve as the prototype.
         * @returns {object} A new object with the given prototype.
         */
        const establishPrototype = function(prototypeObject) {
            if (Object.create) {
                return Object.create(prototypeObject);
            }
            // Fallback for environments without Object.create (ES3/ES5 compatible)
            function PrototypeHolder() {}
            PrototypeHolder.prototype = prototypeObject;
            return new PrototypeHolder();
        };
        classSystem._createObjectWithProto = establishPrototype; // Expose for internal use

        let typeIdentifierSequence = 2; // Starts from 2, as BaseObject is 1.
        // Regex to detect if a function explicitly calls '$parentMethod' or equivalent,
        // indicating it might be an overridden method requiring special handling.
        const methodOverridePattern = /\$parentMethod\b/.test(function() { $parentMethod(); }) ? /\$parentMethod\b/ : /.*/;

        /**
         * classSystem.defineStructure([parentTypes,] typeBlueprint)
         *
         * Creates and returns a new class (constructor function).
         *
         * The `typeBlueprint` is an object containing methods and properties
         * to be added to the new class's prototype.
         *
         * `parentTypes` is an optional array of classes from which the new class
         * should inherit. If omitted or an empty array, it will inherit from
         * classSystem.BaseObject by default.
         *
         * @param {Array<Function>|Function} [parentTypes] - One or more parent classes.
         * @param {object} typeBlueprint - An object defining prototype members.
         * @returns {Function} The newly created class constructor.
         */
        classSystem.defineStructure = function() {
            const inputArguments = Array.from(arguments);
            inputArguments.reverse();

            const typeBlueprint = inputArguments[0];
            let parentTypes = inputArguments.length >= 2 ? inputArguments[1] : [];

            // Ensure parentTypes is an array
            if (!Array.isArray(parentTypes)) {
                parentTypes = [parentTypes];
            }

            // Ensure all parent types are properly integrated into this system
            parentTypes.forEach(integrateForeignClass);

            // If no specific parents, default to BaseObject
            if (parentTypes.length === 0) {
                parentTypes = [classSystem.BaseObject];
            }

            // --- Constructor Processing ---
            let instanceInitializer = typeBlueprint.constructor;
            const processedBlueprint = _.clone(typeBlueprint); // Shallow copy

            if (Object.prototype.hasOwnProperty.call(processedBlueprint, 'constructor')) {
                delete processedBlueprint.constructor;
            } else if (Object.prototype.hasOwnProperty.call(processedBlueprint, 'init')) {
                // Retro-compatibility for 'init' method as constructor
                instanceInitializer = processedBlueprint.init;
                delete processedBlueprint.init;
            }

            if (instanceInitializer) {
                processedBlueprint._instanceInitializer = instanceInitializer;
            } else {
                // Default initializer if none provided
                processedBlueprint._instanceInitializer = function() {
                    // Call the parent's initializer if available
                    if (this.$parentMethod) {
                        this.$parentMethod.apply(this, arguments);
                    }
                };
            }

            // --- New Type Creation ---
            const newTypeConstructor = function InstanceType() {
                this.$parentMethod = null; // Temporary holder for parent method calls
                this._instanceInitializer.apply(this, arguments);
            };

            newTypeConstructor._typeProperties = processedBlueprint; // Store processed properties

            // --- MRO (Method Resolution Order) Computation ---
            const parentMROs = parentTypes.map(p => p._mroChain);
            const mroSegments = parentMROs.concat([parentTypes]);
            const computedMRO = [newTypeConstructor].concat(computeLinearization(mroSegments));
            newTypeConstructor._mroChain = computedMRO;

            // --- Prototype Generation ---
            let currentProtoLink = Object.prototype;
            const reversedMRO = computedMRO.slice().reverse(); // Work from BaseObject up to current

            reversedMRO.forEach(ancestorType => {
                const mergedPrototype = classSystem._createObjectWithProto(currentProtoLink);
                _.extend(mergedPrototype, ancestorType._typeProperties);

                // Wrap methods that use $parentMethod for dynamic super-calling
                Object.keys(mergedPrototype).forEach(memberKey => {
                    const member = mergedPrototype[memberKey];
                    // Skip non-functions, methods already wrapped (like _instanceInitializer),
                    // or properties from adapted foreign objects.
                    const isSpecialMethod = memberKey === '_instanceInitializer' ||
                                            ancestorType._isAdaptedForeign;

                    if (typeof member === "function" &&
                        methodOverridePattern.test(member) &&
                        !isSpecialMethod) {

                        mergedPrototype[memberKey] = (function(methodName, methodFunc, parentProto) {
                            return function() {
                                const originalParentMethod = this.$parentMethod;
                                this.$parentMethod = parentProto[methodName]; // Set $parentMethod to the parent's version
                                try {
                                    return methodFunc.apply(this, arguments);
                                } finally {
                                    this.$parentMethod = originalParentMethod; // Restore original $parentMethod
                                }
                            };
                        })(memberKey, member, currentProtoLink); // Pass currentProtoLink to get the parent's method
                    }
                });
                mergedPrototype.constructor = ancestorType; // Set constructor property
                currentProtoLink = mergedPrototype; // Move to the next level in the chain
            });

            // --- Final Class Setup ---
            const uniqueTypeId = typeIdentifierSequence++;
            newTypeConstructor._parentTypes = parentTypes;
            newTypeConstructor.prototype = currentProtoLink;
            newTypeConstructor._typeId = uniqueTypeId;

            // Build the type registry for quick MRO checks
            newTypeConstructor._typeRegistry = {};
            newTypeConstructor._mroChain.forEach(mroEntry => {
                newTypeConstructor._typeRegistry[mroEntry._typeId] = mroEntry;
            });

            // Handle static class initialization method (if present)
            if (newTypeConstructor.prototype.typeInitializer) {
                newTypeConstructor._staticTypeInitializer = newTypeConstructor.prototype.typeInitializer;
                delete newTypeConstructor.prototype.typeInitializer;
            }

            // Execute static initializers up the MRO chain
            newTypeConstructor._mroChain.slice().reverse().forEach(typeInMRO => {
                if (typeInMRO._staticTypeInitializer) {
                    const result = typeInMRO._staticTypeInitializer(newTypeConstructor.prototype);
                    if (result !== undefined) {
                        newTypeConstructor.prototype = result; // Allow initializer to replace prototype
                    }
                }
            });

            return newTypeConstructor;
        };

        /**
         * Computes the Method Resolution Order (MRO) for a given set of type inheritance graphs
         * using the C3 linearization algorithm.
         * @param {Array<Array<Function>>} inheritanceGraphs - An array of MRO lists for parent types,
         *                                                     plus a list of direct parent types.
         * @returns {Array<Function>} The linearized MRO chain.
         * @throws {classSystem.InvalidHierarchyError} If a consistent MRO cannot be formed.
         */
        const computeLinearization = function(inheritanceGraphs) {
            const linearizedMRO = [];
            let workingGraphs = inheritanceGraphs.map(arr => arr.slice()); // Clone to avoid modifying originals

            // Helper to check if a type is in the tail of any other graph
            const isInAnyTail = (type, allGraphs) => {
                return allGraphs.some(graph => graph.slice(1).includes(type));
            };

            while (true) {
                let candidateFound = false;
                for (let i = 0; i < workingGraphs.length; i++) {
                    const currentGraph = workingGraphs[i];
                    if (currentGraph.length === 0) {
                        continue; // Skip empty graphs
                    }

                    const headType = currentGraph[0];
                    if (!isInAnyTail(headType, workingGraphs)) {
                        candidateFound = true;
                        linearizedMRO.push(headType);

                        // Remove the headType from all graphs where it appears
                        workingGraphs = workingGraphs.map(graph =>
                            (graph[0] === headType) ? graph.slice(1) : graph
                        );
                        break; // Restart search from the beginning of the working graphs
                    }
                }

                if (candidateFound) {
                    continue; // Continue the main loop if a candidate was found
                }

                // Check if all graphs are empty
                if (workingGraphs.every(graph => graph.length === 0)) {
                    return linearizedMRO; // MRO successfully computed
                }

                // If no candidate found and not all graphs are empty, it's an error
                throw new classSystem.InvalidHierarchyError(
                    "Unable to establish a consistent method resolution order (MRO)."
                );
            }
        };

        /**
         * Adapts an existing JavaScript class (constructor function) to integrate
         * with this class system, allowing it to participate in MRO and type checks.
         * @param {Function} foreignClass - The external class constructor to adapt.
         */
        const integrateForeignClass = function(foreignClass) {
            if (foreignClass._typeId) {
                return; // Already integrated
            }

            let foreignPrototype = {};
            if (Object.getOwnPropertyNames && Object.getPrototypeOf) {
                // Modern approach to gather all prototype properties
                let current = foreignClass.prototype;
                while (current && current !== Object.prototype) {
                    Object.getOwnPropertyNames(current).forEach(propName => {
                        // Avoid overwriting if property already exists higher in the chain
                        if (!Object.prototype.hasOwnProperty.call(foreignPrototype, propName)) {
                            foreignPrototype[propName] = current[propName];
                        }
                    });
                    current = Object.getPrototypeOf(current);
                }
            } else {
                // Fallback for older browsers (less accurate, only own properties)
                for (const propName in foreignClass.prototype) {
                    if (Object.prototype.hasOwnProperty.call(foreignClass.prototype, propName)) {
                        foreignPrototype[propName] = foreignClass.prototype[propName];
                    }
                }
            }

            // Filter out 'constructor' and '__proto__'
            foreignPrototype = _.chain(foreignPrototype)
                .map((value, key) => [key, value])
                .filter(item => item[0] !== "constructor" && item[0] !== "__proto__")
                .object()
                .value();

            const uniqueTypeId = typeIdentifierSequence++;
            _.extend(foreignClass, {
                _mroChain: [foreignClass, classSystem.BaseObject],
                _typeProperties: _.extend({}, foreignPrototype, {
                    _instanceInitializer: function() {
                        // Call the parent's (BaseObject's) initializer
                        if (this.$parentMethod) {
                            this.$parentMethod.apply(this, arguments);
                        }
                        // Then call the original foreign class constructor
                        const originalParentMethod = this.$parentMethod;
                        this.$parentMethod = null; // Temporarily clear to prevent recursive super calls
                        try {
                            foreignClass.apply(this, arguments);
                        } finally {
                            this.$parentMethod = originalParentMethod; // Restore
                        }
                    }
                }),
                _typeId: uniqueTypeId,
                _parentTypes: [classSystem.BaseObject],
                _typeRegistry: { "1": classSystem.BaseObject }, // BaseObject is always parent
                _isAdaptedForeign: true // Mark as an adapted foreign class
            });
            foreignClass._typeRegistry[uniqueTypeId] = foreignClass;
        };

        /**
         * classSystem.isInstanceOfType(targetObject, comparisonType)
         *
         * Determines if an object is an instance of a given type or a subtype thereof.
         * This method is designed to work correctly with the custom class system,
         * which 'instanceof' cannot fully support due to multiple inheritance.
         *
         * For non-system objects or primitive types, it falls back to standard JavaScript
         * 'instanceof' or 'typeof' checks.
         *
         * @param {*} targetObject - The object to check.
         * @param {Function|string} comparisonType - The type (constructor function) or a
         *                                           string representing a primitive type.
         * @returns {boolean} True if the object is of the specified type, false otherwise.
         */
        classSystem.isInstanceOfType = function(targetObject, comparisonType) {
            const isObject = targetObject !== null && typeof targetObject === "object";
            const hasSystemConstructor = isObject && targetObject.constructor &&
                                         targetObject.constructor._typeRegistry &&
                                         typeof targetObject.constructor._typeId === "number";
            const isSystemType = typeof comparisonType === "function" &&
                                 typeof comparisonType._typeId === "number";

            if (hasSystemConstructor && isSystemType) {
                // Both are part of the class system, use MRO-based check
                return targetObject.constructor._typeRegistry[comparisonType._typeId] !== undefined;
            }

            // Handle primitive type checks (e.g., "string", "number")
            if (typeof comparisonType === "string") {
                return typeof targetObject === comparisonType;
            }

            // Fallback for non-system objects or standard JS types
            return targetObject instanceof comparisonType;
        };

        /**
         * Base class for all custom error types within the system.
         * It inherits from the native JavaScript Error object, ensuring compatibility
         * with standard error handling mechanisms.
         */
        classSystem.BaseApplicationError = classSystem.defineStructure({
            errorName: "classSystem.BaseApplicationError", // Default name for this error type
            defaultExplanation: "", // Default message if none provided
            initializer: function(customMessage) {
                this.message = customMessage || this.defaultExplanation;
                // Capture stack trace, if available, for better debugging
                if (Error.captureStackTrace) {
                    Error.captureStackTrace(this, this.constructor);
                } else {
                    this.stack = (new Error()).stack;
                }
            },
            typeInitializer: function(proto) {
                // This complex logic ensures proper inheritance from native Error.
                // It rebuilds the prototype chain to include Error.prototype.
                const prototypeSegments = [];
                let currentSegment = proto;
                while (currentSegment) {
                    prototypeSegments.push(currentSegment);
                    currentSegment = Object.getPrototypeOf(currentSegment);
                }

                // Create an actual Error instance to get its prototype chain
                let errorInstanceProto = new Error();
                let effectiveProtoChain = errorInstanceProto;

                // Merge our custom prototype segments into the native Error chain
                // from the most basic (Object.prototype) up to our custom proto.
                prototypeSegments.slice().reverse().forEach(segment => {
                    const tempProtoObj = classSystem._createObjectWithProto(effectiveProtoChain);
                    // Copy own properties from the segment to the temporary object
                    Object.getOwnPropertyNames(segment).forEach(propName => {
                        if (propName !== "__proto__" && propName !== "constructor") {
                            tempProtoObj[propName] = segment[propName];
                        }
                    });
                    effectiveProtoChain = tempProtoObj;
                });
                return effectiveProtoChain; // The modified prototype
            }
        });

        /**
         * A specialized error type indicating an invalid argument value was provided.
         * Inherits from classSystem.BaseApplicationError.
         */
        classSystem.InvalidArgumentError = classSystem.defineStructure([classSystem.BaseApplicationError], {
            errorName: "classSystem.InvalidArgumentError"
        });

        /**
         * classSystem.accessParentMember(contextType, targetInstance, memberName)
         *
         * Provides a way to explicitly call a method or access a property from a parent
         * class within the MRO, even if the current method is not directly overriding it.
         * This is useful for more complex inheritance patterns or when "$parentMethod"
         * is not directly available.
         *
         * Note: This method is significantly slower than using `$parentMethod` directly
         * and should only be used when `$parentMethod` is not suitable.
         *
         * @param {Function} contextType - The class from which the search for the parent
         *                                 member should begin (i.e., the class containing
         *                                 the current method definition).
         * @param {object} targetInstance - The instance ('this') on which the method
         *                                  should be invoked or property accessed.
         * @param {string} memberName - The name of the method or property to retrieve.
         * @returns {*} The parent method (bound to targetInstance) or property value.
         * @throws {classSystem.InvalidArgumentError} If the contextType is not found in the instance's MRO.
         */
        classSystem.accessParentMember = function(contextType, targetInstance, memberName) {
            const instanceMRO = targetInstance.constructor._mroChain;
            let positionInMRO = -1;

            for (let i = 0; i < instanceMRO.length; i++) {
                if (instanceMRO[i] === contextType) {
                    positionInMRO = i;
                    break;
                }
            }

            if (positionInMRO === -1) {
                throw new classSystem.InvalidArgumentError(
                    `Class '${contextType.name || 'Anonymous'}' not found in instance's MRO.`
                );
            }

            // Traverse up the prototype chain to find the parent's definition
            // The method resolution order means the 'parent' is at positionInMRO + 1 in MRO.
            // We need to find the prototype corresponding to that MRO entry.
            let parentPrototype = targetInstance.constructor.prototype;
            for (let i = 0; i <= positionInMRO; i++) {
                parentPrototype = Object.getPrototypeOf(parentPrototype);
            }

            let resolvedMember;
            if (memberName === "constructor" || memberName === "init") {
                // Special handling for constructor-like methods
                resolvedMember = parentPrototype._instanceInitializer;
            } else {
                resolvedMember = parentPrototype[memberName];
            }

            if (typeof resolvedMember === "function") {
                return resolvedMember.bind(targetInstance); // Ensure 'this' context is correct
            } else {
                return resolvedMember; // Return property value directly
            }
        };

        return classSystem; // Return the fully configured system
    }
})(); // End module scope