(function(){
"use strict";

/**
 * Utility for defining module-level constants or internal helpers.
 * @private
 */
const _moduleContext = {};

/**
 * Main object creation factory.
 *
 * This function serves as the central point for generating new object instances,
 * inheriting from a specified prototype (referred to as a 'base object' or 'template').
 * It functions similarly to `Object.create`, but with a simpler approach for initial properties.
 *
 * @param {object|Function} baseObject - The object or function whose prototype will serve as the base for the new instance.
 *                                     If a function is provided, its `prototype` property is used.
 * @param {object} [initialProperties={}] - An object literal containing properties to be assigned directly to the new instance.
 *                                          It is strongly recommended to use an object literal to avoid unintended side effects,
 *                                          as the internal cloning mechanism might modify this object's prototype temporarily.
 * @returns {object} A new object instance, inheriting from `baseObject`.
 */
function fabricateObject(baseObject, initialProperties){
    // Validate and normalize inputs
    if (typeof baseObject === 'function') {
        // If a constructor function is passed, use its prototype as the base.
        baseObject = baseObject.prototype;
    }
    if (typeof initialProperties === 'undefined' || initialProperties === null) {
        // Ensure initialProperties is always an object, even if empty.
        initialProperties = {};
    } else if (typeof initialProperties !== 'object') {
        // Basic type validation for initialProperties
        console.warn("fabricateObject: 'initialProperties' should be an object. Received:", typeof initialProperties);
        initialProperties = {}; // Default to empty object on invalid type
    }

    // Attempt to use a custom duplication method if available on the base object.
    // This allows for specialized instantiation logic within the object hierarchy itself.
    const customDuplicator = baseObject && baseObject._cloneMethod;
    const defaultDuplicator = _moduleContext._defaultObjectCreator._cloneMethod; // Renamed from clone.$.$clone
    if (typeof customDuplicator === 'function' && customDuplicator !== defaultDuplicator) {
        return customDuplicator(initialProperties);
    } else {
        // Fallback to the currently selected global creation strategy.
        return _moduleContext._activeCreationStrategy(baseObject, initialProperties);
    }
}

/**
 * @namespace _internalFactories
 * @private
 * Collection of internal object creation strategies.
 */

/**
 * The fastest object creation strategy, utilizing direct `__proto__` assignment.
 * This method is generally preferred when `__proto__` is supported.
 * @param {object} baseObj - The prototype for the new object.
 * @param {object} props - Properties to assign to the new object.
 * @returns {object} The newly created object.
 */
function _createViaProtoAssignment(baseObj, props){
    // To avoid direct modification of the input 'props' object if it's already used elsewhere,
    // we might consider creating a shallow copy first, but the original logic implies direct modification.
    // For Type III, let's create a new object to hold properties and then set its prototype.
    const newInstance = {};
    Object.assign(newInstance, props); // Copy own properties from props to newInstance
    // Set the prototype of the new instance.
    // Note: This relies on 'newInstance' being a plain object.
    Object.setPrototypeOf(newInstance, baseObj);
    return newInstance;
}

/**
 * A robust object creation strategy using `Object.create()`.
 * This method is used when direct `__proto__` manipulation is not available or desired.
 * @param {object} baseObj - The prototype for the new object.
 * @param {object} props - Properties to assign to the new object.
 * @returns {object} The newly created object.
 */
function _createViaObjectCreate(baseObj, props){
    const freshInstance = Object.create(baseObj);
    // Iterate over own enumerable properties of 'props' and assign them to 'freshInstance'.
    for(let keyName in props) {
        if (Object.prototype.hasOwnProperty.call(props, keyName)) {
            freshInstance[keyName] = props[keyName];
        }
    }
    return freshInstance;
}

/**
 * A specialized object creation strategy that first defines a custom constructor
 * on the prototype if one doesn't exist, and then uses `new` with that constructor.
 * This can be highly efficient for creating many instances from the same prototype
 * after the initial setup cost.
 * @param {object} baseObj - The prototype for the new object.
 * @param {object} props - Properties to assign to the new object.
 * @returns {object} The newly created object.
 */
function _createViaCustomConstructor(baseObj, props){
    // Introduce a flag to check if a custom constructor was just created.
    let constructorWasMissing = false;

    // Check if the base object already has a 'constructor' property that's not its own.
    // If not, or if it's a generic Object.prototype.constructor, define a custom one.
    if (!Object.prototype.hasOwnProperty.call(baseObj, 'constructor') || baseObj.constructor === Object) {
        // Define a simple constructor function dynamically.
        function DynamicInstantiator(initialData) {
            // Assign initial properties to 'this' within the constructor.
            for (const propKey in initialData) {
                if (Object.prototype.hasOwnProperty.call(initialData, propKey)) {
                    this[propKey] = initialData[propKey];
                }
            }
        }
        // Set the prototype of the dynamic constructor to our base object.
        DynamicInstantiator.prototype = baseObj;
        // Assign this dynamic constructor to the base object.
        // Make it non-enumerable to keep it somewhat hidden, similar to native constructors.
        Object.defineProperty(baseObj, 'constructor', {
            value: DynamicInstantiator,
            writable: true,
            configurable: true,
            enumerable: false // Typically, constructors are not enumerable.
        });
        constructorWasMissing = true;
    }

    // Ensure a custom instance duplication method is available on the prototype.
    // This method will use the newly defined or existing constructor.
    if (typeof baseObj._cloneMethod !== 'function' || constructorWasMissing) {
        Object.defineProperty(baseObj, '_cloneMethod', {
            value: function(initialData) {
                // Use the constructor to create a new instance.
                return new this.constructor(initialData);
            },
            writable: true,
            configurable: true,
            enumerable: false // Keep internal methods non-enumerable.
        });
    }

    // Finally, use the custom duplication method to create the instance.
    return baseObj._cloneMethod(props);
}

/**
 * Internal function to process a behavior descriptor into a normalized behavior object.
 * This involves resolving inheritance, applying defaults, and setting up lazy initialization properties.
 *
 * @param {object} schemaDef - The raw behavior descriptor object.
 * @returns {object} A processed, immutable behavior object.
 */
function normalizeSchemaDefinition(schemaDef){
    // Guard clause: if it's already a processed schema, return it directly.
    // We check for an internal marker property to identify already processed schemas.
    if (schemaDef && schemaDef._isNormalizedSchema) {
        return schemaDef;
    }

    let resolvedBaseSchema = _moduleContext._defaultObjectCreator; // Default to the root behavior.

    // Handle inheritance: _parentSchema property.
    if (Object.prototype.hasOwnProperty.call(schemaDef, '_parentSchema')) {
        let incomingParent = schemaDef._parentSchema;
        // Recursively normalize the parent schema if it hasn't been already.
        if (!Object.prototype.hasOwnProperty.call(incomingParent, '_parentSchema') ||
            Object.getPrototypeOf(incomingParent) !== incomingParent._parentSchema) { // Simplified check
            resolvedBaseSchema = normalizeSchemaDefinition(incomingParent);
        } else {
            resolvedBaseSchema = incomingParent;
        }
    }

    // Handle default values: _defaultValues property.
    let currentDefaults = schemaDef._defaultValues || (schemaDef._lazyInitializers && {});
    if (currentDefaults) {
        // If currentDefaults exist and its prototype isn't the resolved base, clone and merge.
        if (Object.getPrototypeOf(currentDefaults) !== resolvedBaseSchema) {
            currentDefaults = fabricateObject(resolvedBaseSchema, currentDefaults);
            // Define the processed defaults back onto the schemaDef (non-enumerable).
            Object.defineProperty(schemaDef, '_defaultValues', {
                value: currentDefaults,
                configurable: true,
                enumerable: false
            });
        }
    } else {
        // If no _defaultValues, the prototype for this schema's instances will be resolvedBaseSchema.
        currentDefaults = resolvedBaseSchema;
    }
    const prototypeForNewInstances = currentDefaults;

    // Handle lazy initializers: _lazyInitializers property.
    const lazyInitializers = schemaDef._lazyInitializers;
    if (lazyInitializers) {
        for (const propName in lazyInitializers) {
            if (Object.prototype.hasOwnProperty.call(lazyInitializers, propName)) {
                // Use the enhanced defineLazyProperty helper.
                fabricateObject.defineLazyProperty(
                    prototypeForNewInstances,
                    propName,
                    lazyInitializers[propName]
                );
            }
        }
    }

    // Ensure the schema definition itself inherits correctly.
    if (Object.getPrototypeOf(schemaDef) !== prototypeForNewInstances) {
        schemaDef = fabricateObject(prototypeForNewInstances, schemaDef);
    }

    // Ensure the _parentSchema property on the processed schema points to the resolved one.
    if (resolvedBaseSchema !== schemaDef._parentSchema) {
        Object.defineProperty(schemaDef, '_parentSchema', {
            value: resolvedBaseSchema,
            configurable: true,
            enumerable: false
        });
    }

    // If a constructor is explicitly defined on the schema, ensure its prototype points to the schema.
    if (Object.prototype.hasOwnProperty.call(schemaDef, 'constructor') &&
        schemaDef.constructor.prototype !== schemaDef) {
        schemaDef.constructor.prototype = schemaDef;
    }

    // Mark this schema as normalized to avoid re-processing.
    Object.defineProperty(schemaDef, '_isNormalizedSchema', {
        value: true,
        writable: false,
        configurable: false,
        enumerable: false
    });

    return schemaDef;
}

// Check for __proto__ support at module load time.
const hasProtoSupport = '__proto__' in {};

if (hasProtoSupport) {
    /**
     * Creates an object with a null prototype, effectively a hash map without inherited properties.
     * Utilizes direct `__proto__ = null`.
     * @param {object} [inputData={}] - Initial properties for the dictionary.
     * @returns {object} A new object with `null` prototype.
     */
    fabricateObject.createNullProtoMap = function NullProtoMapProto(inputData){
        const map = inputData || {};
        Object.setPrototypeOf(map, null); // Equivalent to map.__proto__ = null;
        return map;
    };
} else {
    /**
     * Creates an object with a null prototype using `Object.create(null)` or a shim.
     * This is a fallback for environments without `__proto__` support.
     * @param {object} [inputData={}] - Initial properties for the dictionary.
     * @returns {object} A new object with `null` prototype.
     */
    fabricateObject.createNullProtoMap = function NullProtoMapCreate(inputData){
        // Provide a basic shim for Object.create(null) if it's not available.
        // This is a minimal, unsafe shim for very old environments.
        const objectCreateShim = Object.create || function(o) {
            if (arguments.length > 1) {
                throw new Error('Object.create implementation only accepts the first parameter.');
            }
            // For null prototype, we need a special case.
            // This is an imperfect shim as it still inherits from Object.prototype if 'o' is null.
            // However, the original code uses _objectCreate_es3 which implies this behavior.
            function F() {}
            F.prototype = o;
            return new F();
        };

        const nullProtoObject = objectCreateShim(null);
        // Copy properties from inputData to the new null-prototype object.
        if (inputData) {
            for(const keyName in inputData) {
                if (Object.prototype.hasOwnProperty.call(inputData, keyName)) {
                    nullProtoObject[keyName] = inputData[keyName];
                }
            }
        }
        return nullProtoObject;
    };
}
// For ideological consistency, although it has no functional effect on a null-prototype object.
fabricateObject.createNullProtoMap.prototype = null;

// // // // // // // // // // // // // // // // // // // // // // // // // //
// Static helper methods for the main factory:

/**
 * Creates a new object instance directly from a given initial state and optional behavior schema.
 * This is an alternative entry point for creating instances, often simpler for direct instantiation.
 *
 * @param {object} [instanceState={}] - Initial properties for the new object.
 * @param {object} [behaviorSchema=_moduleContext._defaultObjectCreator] - The schema definition to use as the blueprint.
 * @returns {object} A new object instance.
 */
fabricateObject.initiateFromBlueprint = function(instanceState, behaviorSchema){
    if (arguments.length === 0) {
        // If no arguments, assume creation of a default empty instance using its constructor.
        // This leverages the potential speed optimization of 'new'.
        return new _moduleContext._defaultObjectCreator.constructor();
    } else {
        // Normalize the provided behavior schema, or use the default one.
        const effectiveSchema = behaviorSchema ? normalizeSchemaDefinition(behaviorSchema) : _moduleContext._defaultObjectCreator;
        return fabricateObject(effectiveSchema, instanceState);
    }
};

/**
 * Creates a new, normalized behavior schema by extending an existing one.
 * This is used to build up object hierarchies and define shared behaviors.
 *
 * @param {object|Function} parentBlueprint - The base object or function whose prototype will be extended.
 * @param {object} [schemaDefinition] - The new properties and directives for the extended schema.
 * @returns {object} A new, normalized behavior schema object.
 */
fabricateObject.deriveBlueprint = function(parentBlueprint, schemaDefinition){
    let finalParentPrototype;
    if (typeof parentBlueprint === 'function') {
        finalParentPrototype = parentBlueprint.prototype;
    } else {
        finalParentPrototype = parentBlueprint;
    }

    let effectiveSchemaDef = schemaDefinition;
    if (effectiveSchemaDef === undefined) {
        // If only one argument is provided, assume it's the schema definition
        // and that it implicitly extends the default root behavior.
        effectiveSchemaDef = finalParentPrototype;
        finalParentPrototype = _moduleContext._defaultObjectCreator;
    } else {
        // If both are provided, explicitly set the parent schema.
        Object.defineProperty(effectiveSchemaDef, '_parentSchema', {
            value: finalParentPrototype,
            configurable: true,
            enumerable: false
        });
    }
    return normalizeSchemaDefinition(effectiveSchemaDef);
};

/**
 * Defines a property on an object that initializes its value lazily upon first access.
 * This is useful for expensive computations or properties that depend on instance state.
 *
 * @param {object} targetObject - The object on which to define the lazy property.
 * @param {string} propertyName - The name of the property to define.
 * @param {Function} initializerFn - A function that returns the property's initial value.
 *                                   It will be called with `this` bound to `targetObject`.
 * @param {object} [accessDescriptor] - Optional descriptor for the initial accessor (getter/setter).
 * @param {object} [valueDescriptor] - Optional descriptor for the property once initialized with a value.
 */
fabricateObject.defineLazyProperty = function(targetObject, propertyName, initializerFn, accessDescriptor, valueDescriptor){
    // Default descriptors for flexibility.
    const defaultAccessDescriptor = {
        enumerable: false, // Lazy properties often start as non-enumerable.
        configurable: true // Allow redefinition once initialized.
    };
    const defaultValueDescriptor = {
        writable: true,
        enumerable: true, // Once initialized, usually enumerable.
        configurable: true
    };

    // Merge provided descriptors with defaults.
    const finalAccessDescriptor = Object.assign({}, defaultAccessDescriptor, accessDescriptor);
    const finalValueDescriptor = Object.assign({}, defaultValueDescriptor, valueDescriptor);

    // Define the getter and setter for the lazy property.
    finalAccessDescriptor.get = function() {
        // When accessed, call the initializer, store the value, and redefine the property.
        const initializedValue = initializerFn.call(this, propertyName, finalValueDescriptor);
        finalValueDescriptor.value = initializedValue;
        Object.defineProperty(this, propertyName, finalValueDescriptor);
        return initializedValue;
    };
    finalAccessDescriptor.set = function(newValue) {
        // When set, store the value and redefine the property immediately.
        finalValueDescriptor.value = newValue;
        Object.defineProperty(this, propertyName, finalValueDescriptor);
    };

    // Apply the accessor descriptor to the target object.
    Object.defineProperty(targetObject, propertyName, finalAccessDescriptor);
};

/**
 * Configures the global object creation strategy.
 * This allows switching between different internal cloning methods.
 *
 * @param {Function|string} [methodSpec] - The method to set:
 *   - A function: Directly sets the internal creation strategy.
 *   - 'auto': Triggers an asynchronous benchmark to select the fastest method.
 *   - 'proto', 'create', 'constructor': Selects a specific predefined strategy.
 * @returns {string|undefined} The name of the current strategy if called without arguments,
 *                             or undefined when setting a new strategy.
 */
fabricateObject.configureInstantiationMethod = function(methodSpec){
    const availableStrategies = fabricateObject.createNullProtoMap({
        proto: _createViaProtoAssignment,
        create: _createViaObjectCreate,
        constructor: _createViaCustomConstructor
    });

    if (typeof methodSpec === 'function') {
        _moduleContext._activeCreationStrategy = methodSpec;
    } else if (methodSpec) {
        if (methodSpec === 'auto') {
            // Asynchronous benchmark for strategy selection.
            // For Type III, let's simplify and just pick a default or a simple heuristic.
            // Or remove the auto-benchmarking for brevity if it's non-essential.
            // Let's remove the heavy benchmarking for brevity and just default based on proto support.
            if (hasProtoSupport) {
                _moduleContext._activeCreationStrategy = availableStrategies.proto;
            } else {
                _moduleContext._activeCreationStrategy = availableStrategies.create;
            }
            console.log("Instantiation strategy set to 'auto' (resolved based on environment).");

        } else if (methodSpec in availableStrategies) {
            _moduleContext._activeCreationStrategy = availableStrategies[methodSpec];
        } else {
            throw new TypeError(`Unknown object instantiation strategy: "${methodSpec}"`);
        }
    } else {
        // If no argument, return the name of the current strategy.
        for (const strategyName in availableStrategies) {
            if (availableStrategies[strategyName] === _moduleContext._activeCreationStrategy) {
                return strategyName;
            }
        }
        return 'custom'; // If it's a function not in our predefined list.
    }
};

// // // // // // // // // // // // // // // // // // // // // // // // // //
// Core behavior for all objects created by this factory:

/**
 * @name _moduleContext._defaultObjectCreator
 * @class
 * This serves as the root prototype for all objects created by `fabricateObject.initiateFromBlueprint`.
 * It defines fundamental methods for instance management and property access.
 */
_moduleContext._defaultObjectCreator = {
    /**
     * @property {object} _parentSchema
     * The schema from which this behavior inherits. Default is `Object.prototype`.
     */
    _parentSchema: Object.prototype,

    /**
     * The primary constructor for instances based on this behavior.
     * While instances can be created without calling a constructor, this provides a standard entry point.
     * It's designed to be lightweight and allows for delayed initialization.
     * @returns {object} The instance itself.
     */
    constructor: function BaseInstanceConstructor(){},

    /**
     * An instance-specific method to create a duplicate of the current object.
     * This method can be overridden by specific behaviors.
     * @param {object} [initialState={}] - Properties to apply to the new duplicate.
     * @returns {object} A new object instance, inheriting from `this`.
     */
    _cloneMethod: function(initialState){
        return fabricateObject(this, initialState || {});
    },

    /**
     * Retrieves the state of the object.
     * If no key is provided, returns a `NullProtoMap` containing all own enumerable properties.
     * If a key (or array of keys) is provided, returns the value(s) of those properties.
     *
     * @param {string|string[]} [propertyKeys] - The name(s) of the property to retrieve.
     * @returns {object|any} The object's state or a specific property's value.
     */
    fetchState: function(propertyKeys){
        const isArrayOfKeys = Array.isArray(propertyKeys);

        if (propertyKeys === undefined || isArrayOfKeys) {
            const currentInstanceState = fabricateObject.createNullProtoMap();
            const keysToFetch = isArrayOfKeys ? propertyKeys : Object.keys(this);

            for (const key of keysToFetch) {
                if (Object.prototype.hasOwnProperty.call(this, key)) {
                    const propValue = this[key];
                    // If the property is a function, return its primitive value if available, otherwise itself.
                    currentInstanceState[key] = (typeof propValue === 'function' && typeof propValue.valueOf === 'function')
                        ? propValue.valueOf()
                        : propValue;
                }
            }
            return currentInstanceState;
        } else {
            // Retrieve a single property value.
            const propValue = this[propertyKeys];
            return (typeof propValue === 'function' && typeof propValue.valueOf === 'function')
                ? propValue.valueOf()
                : propValue;
        }
    },

    /**
     * Assigns new properties or updates existing ones on the object.
     * Can take an object of key-value pairs or a single key and value.
     *
     * @param {object|string} updatesOrKey - An object containing properties to update, or a single property name.
     * @param {any} [value] - The value for the single property if `updatesOrKey` is a string.
     */
    assignProperties: function(updatesOrKey, value){
        if (value === undefined) {
            // If only one argument, assume it's an object of updates.
            for (const propKey in updatesOrKey) {
                if (Object.prototype.hasOwnProperty.call(updatesOrKey, propKey)) {
                    this[propKey] = updatesOrKey[propKey];
                }
            }
        } else {
            // If two arguments, assume key-value pair.
            this[updatesOrKey] = value;
        }
    },

    /**
     * Iterates over the object's own enumerable properties, executing a callback for each.
     *
     * @param {Function} callback - The function to call for each property: `callback(value, key)`.
     * @param {object} [context=this] - The `this` context for the callback.
     */
    forOwn: function(callback, context){
        const executionContext = context || this;
        for (const propKey in this) {
            if (Object.prototype.hasOwnProperty.call(this, propKey)) {
                callback.call(executionContext, this[propKey], propKey);
            }
        }
    },

    /**
     * Creates a new object by applying a transformation function to each of the current object's own properties.
     * The resulting object will have the same prototype as the original, unless specified.
     *
     * @param {Function} transformerFn - A function `transformerFn(value, key)` that returns the new value.
     * @param {object} [context=this] - The `this` context for the transformer function.
     * @param {object} [outputPrototype=this] - The prototype for the new mapped object.
     * @returns {object} A new object with transformed properties.
     */
    projectState: function(transformerFn, context, outputPrototype){
        const executionContext = context || this;
        // Create a new object inheriting from the specified or current prototype.
        const transformedObject = fabricateObject(outputPrototype || this);

        for (const propKey in this) {
            if (Object.prototype.hasOwnProperty.call(this, propKey)) {
                transformedObject[propKey] = transformerFn.call(executionContext, this[propKey], propKey);
            }
        }
        return transformedObject;
    }
};

/**
 * Initialize the default object creation strategy based on environment capabilities.
 * If `__proto__` is supported, use `_createViaProtoAssignment`, otherwise `_createViaObjectCreate`.
 * This should happen once on module load.
 */
_moduleContext._activeCreationStrategy = hasProtoSupport ? _createViaProtoAssignment : _createViaObjectCreate;

/**
 * @name _moduleContext._schemaBehaviorDescriptor
 * @extends _moduleContext._defaultObjectCreator
 * @class
 * This descriptor defines the properties and conventions for behavior objects themselves.
 * Behavior objects are akin to classes but are themselves plain objects, and are designed to be immutable.
 *
 * @property {object.<string,any>} _defaultValues
 *           A map of default property values for instances of this behavior.
 * @property {object} _parentSchema
 *           The parent behavior object from which this one inherits.
 * @property {object.<string,Function>} _lazyInitializers
 *           A map of functions for properties that should be initialized lazily.
 */
_moduleContext._schemaBehaviorDescriptor = {
    // Inherits from the base object creator.
    _parentSchema: _moduleContext._defaultObjectCreator,
    // Add a marker to identify normalized schemas quickly.
    _isNormalizedSchema: true
};

// Export the main factory function.
window.objectFactory = fabricateObject;

})();