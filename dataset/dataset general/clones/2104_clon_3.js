"use strict";
// This module provides a robust system for defining and managing runtime type metadata,
// mimicking Go's type reflection capabilities within a JavaScript environment.
// It supports various primitive and composite data structures.
(function() {

// Removed Error.stackTraceLimit modification as it's non-essential for core functionality.

const typeGenConstants = {
    INT_HIGH_SHIFT: 4294967296, // Represents 2^32, used for 64-bit integer calculations.
    DEFAULT_PTR_SIZE: 4,
    DEFAULT_ARRAY_SIZE: 12,
    DEFAULT_FUNC_SIZE: 4,
    DEFAULT_CHAN_SIZE: 4,
    DEFAULT_INTERFACE_SIZE: 8,
    DEFAULT_STRING_LENGTH: 8
};

let runtimeEnv; // Renamed from $global
if (typeof window === "object" && window !== null) {
    runtimeEnv = window; // Browser environment found.
} else if (typeof self === "object" && self !== null) {
    runtimeEnv = self; // Web worker environment detected.
} else if (typeof global === "object" && global !== null) {
    runtimeEnv = global; // Node.js environment identified.
    // Ensure 'require' is available in Node.js context if needed by dependent modules.
    if (!runtimeEnv.require) {
        runtimeEnv.require = require;
    }
} else {
    // Deliberately omitting the warning log; silently proceed without a recognized global.
    // This might lead to issues later if runtimeEnv is used without a check.
    runtimeEnv = {}; // Fallback to an empty object if no standard global is found.
}

let typeInstanceCounter = 0; // Renamed from $idCounter, generates unique IDs for type instances.
const extractObjKeys = (targetMap) => targetMap ? Object.keys(targetMap) : []; // Renamed from $keys
const getMinimumValue = Math.min; // Renamed from $min
const parseInteger = parseInt; // Renamed from $parseInt
const parseFloatingPoint = (val) => { // Renamed from $parseFloat
    // Simplified: parseFloat handles numbers directly, so the constructor check is less critical here.
    return parseFloat(val);
};
const calculateModulo = (dividend, divisor) => dividend % divisor; // Renamed from $mod
const convertToText = String; // Renamed from $toString
let typeReflector, createStringRef; // Renamed from $reflect, $newStringPtr
const baseArrayConstructor = Array; // Renamed from $Array

// Helper to generate a unique key for floating-point numbers, especially NaN.
const generateFloatIdentifier = (floatVal) => { // Renamed from $floatKey
    if (Number.isNaN(floatVal)) { // Using Number.isNaN for robustness
        typeInstanceCounter++;
        return `NaN_ID_${typeInstanceCounter}`; // Changed key format for uniqueness.
    }
    return String(floatVal);
};

// Applies a function to each element of an array, returning a new array.
// This is a manual implementation, similar to Array.prototype.map.
const transformArrayElements = (sourceArray, transformFunc) => { // Renamed from $mapArray
    const resultArr = new sourceArray.constructor(sourceArray.length);
    let idx = 0;
    while (idx < sourceArray.length) {
        resultArr[idx] = transformFunc(sourceArray[idx]);
        idx++;
    }
    return resultArr;
};

// Placeholder for a potential error handler, used in nil pointer scenarios.
const triggerNilPointerError = () => {
    throw new Error("runtime error: invalid memory address or nil pointer dereference");
};

// Main factory function for creating runtime type definitions.
const buildRuntimeType = (
    byteSize,
    typeCategory,
    typeSignature,
    typeNameStr,
    packagePathStr,
    ctorFn
) => { // Renamed from $newType
    let typeDefinition; // Renamed from typ

    // Basic validation for typeCategory
    if (typeof typeCategory !== 'string' || !typeCategory) {
        console.warn("Invalid type category provided:", typeCategory);
        // Fallback to a generic type or throw
        throw new Error("Type category must be a non-empty string.");
    }

    // First switch block: defines type constructor and key generation logic.
    switch (typeCategory) {
        case "Bool":
        case "Int":
        case "Int8":
        case "Int16":
        case "Int32":
        case "Uint":
        case "Uint8":
        case "Uint16":
        case "Uint32":
        case "Uintptr":
        case "String":
        case "UnsafePointer":
            typeDefinition = function(value) { this._value = value; }; // Renamed $val to _value
            typeDefinition.prototype._getKey = function() { return `${typeSignature}#${this._value}`; }; // Changed key format
            break;

        case "Float32":
        case "Float64":
            typeDefinition = function(value) { this._value = value; };
            typeDefinition.prototype._getKey = function() { return `${typeSignature}#${generateFloatIdentifier(this._value)}`; };
            break;

        case "Int64":
            typeDefinition = function(highPart, lowPart) {
                // Using Math.trunc for integer part, and slightly reordered calculation.
                this.high = Math.trunc(highPart + Math.ceil(lowPart) / typeGenConstants.INT_HIGH_SHIFT);
                this.low = lowPart >>> 0;
                this._value = this;
            };
            typeDefinition.prototype._getKey = function() { return `${typeSignature}#${this.high}#${this.low}`; };
            break;

        case "Uint64":
            typeDefinition = function(highPart, lowPart) {
                // Simplified Math.ceil(low)/... to just Math.floor(lowPart / ...)
                this.high = (highPart + Math.floor(lowPart / typeGenConstants.INT_HIGH_SHIFT)) >>> 0;
                this.low = lowPart >>> 0;
                this._value = this;
            };
            typeDefinition.prototype._getKey = function() { return `${typeSignature}#${this.high}#${this.low}`; };
            break;

        case "Complex64":
        case "Complex128":
            typeDefinition = function(realPart, imagPart) {
                this.real = realPart;
                this.imag = imagPart;
                this._value = this;
            };
            typeDefinition.prototype._getKey = function() { return `${typeSignature}#${this.real}#${this.imag}`; };
            break;

        case "Array":
            typeDefinition = function(val) { this._value = val; };
            typeDefinition.PointerType = buildRuntimeType(
                typeGenConstants.DEFAULT_PTR_SIZE,
                "Ptr",
                `*${typeSignature}`,
                "",
                "",
                function(arrObj) { // Custom constructor for Array Ptr
                    this._get = () => arrObj; // Arrow function for concise getter
                    this._value = arrObj;
                }
            );
            typeDefinition.initialize = (elementDef, arrayLength) => { // Renamed init to initialize
                typeDefinition.element = elementDef;
                typeDefinition.length = arrayLength;
                typeDefinition.prototype._getKey = function() {
                    return `${typeSignature}$${transformArrayElements(this._value, (elem) => {
                        const elemKey = elem._getKey ? elem._getKey() : String(elem);
                        return elemKey.replace(/\\/g, "\\\\").replace(/\$/g, "\\$");
                    }).join("$")}`;
                };
                typeDefinition.extendReflectMeta = (reflectObj) => { // Renamed extendReflectType
                    reflectObj.arrayType = new typeReflector.arrayType.PointerType(reflectObj, elementDef.getReflectMeta(), undefined, arrayLength);
                };
                typeDefinition.PointerType.initialize(typeDefinition); // Initialize the associated pointer type
            };
            break;

        case "Chan":
            typeDefinition = function() { this._value = this; };
            typeDefinition.prototype._getKey = function() {
                if (this._uniqueId === undefined) { // Renamed $id to _uniqueId
                    typeInstanceCounter++;
                    this._uniqueId = typeInstanceCounter;
                }
                return String(this._uniqueId);
            };
            typeDefinition.initialize = (elementDef, isSendOnly, isRecvOnly) => {
                typeDefinition.nilValue = new typeDefinition(); // Renamed nil to nilValue
                typeDefinition.extendReflectMeta = (reflectObj) => {
                    const direction = isSendOnly ? typeReflector.SendDir : (isRecvOnly ? typeReflector.RecvDir : typeReflector.BothDir);
                    reflectObj.chanType = new typeReflector.chanType.PointerType(reflectObj, elementDef.getReflectMeta(), direction);
                };
            };
            break;

        case "Func":
            typeDefinition = function(value) { this._value = value; };
            typeDefinition.initialize = (paramDefs, resultDefs, isVariadic) => {
                typeDefinition.parameters = paramDefs;
                typeDefinition.results = resultDefs;
                typeDefinition.variadic = isVariadic;
                typeDefinition.extendReflectMeta = (reflectObj) => {
                    // Renamed $sliceType, $ptrType to getSliceTypeDefinition, getPointerTypeDefinition
                    const typeSliceCtor = getSliceTypeDefinition(getPointerTypeDefinition(typeReflector.rtype.PointerType));
                    const paramReflectTypes = transformArrayElements(paramDefs, (p) => p.getReflectMeta());
                    const resultReflectTypes = transformArrayElements(resultDefs, (p) => p.getReflectMeta());
                    reflectObj.funcType = new typeReflector.funcType.PointerType(
                        reflectObj,
                        isVariadic,
                        new typeSliceCtor(paramReflectTypes),
                        new typeSliceCtor(resultReflectTypes)
                    );
                };
            };
            break;

        case "Interface":
            typeDefinition = { implementors: [] }; // Renamed implementedBy to implementors
            typeDefinition.initialize = (methodSpecs) => { // Renamed methods to methodSpecs
                typeDefinition.methodSignatures = methodSpecs; // Renamed methods
                typeDefinition.extendReflectMeta = (reflectObj) => {
                    const interfaceMethods = transformArrayElements(methodSpecs, (m) => {
                        return new typeReflector.imethod.PointerType(
                            createStringRef(m[1]),
                            createStringRef(m[2]),
                            getFunctionTypeDefinition(m[3], m[4], m[5]).getReflectMeta()
                        );
                    });
                    const methodSliceCtor = getSliceTypeDefinition(getPointerTypeDefinition(typeReflector.imethod.PointerType));
                    reflectObj.interfaceType = new typeReflector.interfaceType.PointerType(reflectObj, new methodSliceCtor(interfaceMethods));
                };
            };
            break;

        case "Map":
            typeDefinition = function(value) { this._value = value; };
            typeDefinition.initialize = (keyDef, elemDef) => {
                typeDefinition.keyType = keyDef;
                typeDefinition.elementType = elemDef;
                typeDefinition.extendReflectMeta = (reflectObj) => {
                    reflectObj.mapType = new typeReflector.mapType.PointerType(reflectObj, keyDef.getReflectMeta(), elemDef.getReflectMeta(), null, null); // Using null instead of undefined
                };
            };
            break;

        case "Ptr":
            typeDefinition = ctorFn || function(getterFunc, setterFunc, targetObj) {
                this._get = getterFunc;
                this._set = setterFunc;
                this._target = targetObj;
                this._value = this;
            };
            typeDefinition.prototype._getKey = function() {
                if (this._uniqueId === undefined) {
                    typeInstanceCounter++;
                    this._uniqueId = typeInstanceCounter;
                }
                return convertToText(this._uniqueId); // Using convertToText
            };
            typeDefinition.initialize = (elementDef) => {
                typeDefinition.nilValue = new typeDefinition(triggerNilPointerError, triggerNilPointerError);
                typeDefinition.extendReflectMeta = (reflectObj) => {
                    reflectObj.ptrType = new typeReflector.ptrType.PointerType(reflectObj, elementDef.getReflectMeta());
                };
            };
            break;

        case "Slice":
            let internalArrayCtor; // Renamed nativeArray
            typeDefinition = function(inputArray) {
                // Ensure the underlying array is of the correct constructor, or wrap it.
                if (inputArray.constructor !== internalArrayCtor) {
                    inputArray = new internalArrayCtor(inputArray);
                }
                this.backingArray = inputArray; // Renamed array to backingArray
                this.offset = 0;
                this.currentLength = inputArray.length; // Renamed length
                this.totalCapacity = inputArray.length; // Renamed capacity
                this._value = this;
            };
            typeDefinition.createSlice = (len, cap, zeroValCreator) => { // Renamed make
                cap = cap || len;
                const arr = new internalArrayCtor(cap);
                for (let i = 0; i < cap; ++i) { // Changed loop style (for to for...let)
                    arr[i] = zeroValCreator();
                }
                const newSlice = new typeDefinition(arr);
                newSlice.currentLength = len;
                return newSlice;
            };
            typeDefinition.initialize = (elementDef) => {
                typeDefinition.element = elementDef;
                internalArrayCtor = getTypedArrayConstructor(elementDef.typeCategory); // Renamed $nativeArray
                typeDefinition.nilValue = new typeDefinition([]);
                typeDefinition.extendReflectMeta = (reflectObj) => {
                    reflectObj.sliceType = new typeReflector.sliceType.PointerType(reflectObj, elementDef.getReflectMeta());
                };
            };
            break;

        case "Struct":
            typeDefinition = function(value) { this._value = value; };
            typeDefinition.PointerType = buildRuntimeType(typeGenConstants.DEFAULT_PTR_SIZE, "Ptr", `*${typeSignature}`, "", "", ctorFn);
            typeDefinition.PointerType.StructType = typeDefinition; // Renamed Struct to StructType
            typeDefinition.initialize = (fieldDefinitions) => { // Renamed fields to fieldDefinitions
                typeDefinition.fields = fieldDefinitions;
                typeDefinition.PointerType.extendReflectMeta = (reflectObj) => {
                    reflectObj.ptrType = new typeReflector.ptrType.PointerType(reflectObj, typeDefinition.getReflectMeta());
                };
                // Prepare nil value for the pointer type
                const protoNil = Object.create(ctorFn ? ctorFn.prototype : Object.prototype); // More robust nil prototype creation
                protoNil._value = protoNil;
                for (const field of fieldDefinitions) { // Using for...of loop for iteration
                    Object.defineProperty(protoNil, field[0], { get: triggerNilPointerError, set: triggerNilPointerError });
                }
                typeDefinition.PointerType.nilValue = protoNil;

                // Methods for embedded fields (if any)
                for (let i = 0; i < typeDefinition.methods.length; i++) {
                    const methodInfo = typeDefinition.methods[i];
                    if (methodInfo[6] !== -1) {
                        ((fieldDef, methodName) => { // Using arrow function for concise closure
                            typeDefinition.prototype[methodName] = function() {
                                const embeddedVal = this._value[fieldDef[0]];
                                return embeddedVal[methodName].apply(embeddedVal, arguments);
                            };
                        })(fieldDefinitions[methodInfo[6]], methodInfo[0]);
                    }
                }
                // Methods for embedded fields on the PointerType
                for (let i = 0; i < typeDefinition.PointerType.methods.length; i++) {
                    const methodInfo = typeDefinition.PointerType.methods[i];
                    if (methodInfo[6] !== -1) {
                        ((fieldDef, methodName) => {
                            typeDefinition.PointerType.prototype[methodName] = function() {
                                let targetVal = this[fieldDef[0]];
                                if (targetVal._value === undefined) { // Check for uninitialized _value
                                    targetVal = new fieldDef[3](targetVal);
                                }
                                return targetVal[methodName].apply(targetVal, arguments);
                            };
                        })(fieldDefinitions[methodInfo[6]], methodInfo[0]);
                    }
                }
                // Map key generation for structs
                typeDefinition.prototype._getKey = function() {
                    const keyParts = []; // Changed variable name
                    for (const field of fieldDefinitions) { // Another for...of
                        const fieldValue = this._value[field[0]];
                        const fieldKey = fieldValue._getKey ? fieldValue._getKey() : String(fieldValue);
                        keyParts.push(fieldKey.replace(/\\/g, "\\\\").replace(/\$/g, "\\$"));
                    }
                    return `${typeSignature}$${keyParts.join("$")}`;
                };
                // Reflect type extension for structs
                typeDefinition.extendReflectMeta = (reflectObj) => {
                    const reflectedFields = transformArrayElements(fieldDefinitions, (field) => {
                        return new typeReflector.structField.PointerType(
                            createStringRef(field[1]),
                            createStringRef(field[2]),
                            field[3].getReflectMeta(),
                            createStringRef(field[4]),
                            fieldDefinitions.indexOf(field) // Using indexOf for index
                        );
                    });
                    const sliceOfStructFields = getSliceTypeDefinition(typeReflector.structField.PointerType);
                    reflectObj.structType = new typeReflector.structType.PointerType(reflectObj, new sliceOfStructFields(reflectedFields));
                };
            };
            break;

        default:
            // Using a more specific error type or a custom error object.
            throw new TypeError(`Unsupported type category encountered: ${typeCategory}`);
    }

    // Second switch block: defines the zero-value function for each type.
    switch (typeCategory) {
        case "Bool":
        case "Map":
            typeDefinition.getZeroValue = () => false; // Renamed zero to getZeroValue
            break;

        case "Int":
        case "Int8":
        case "Int16":
        case "Int32":
        case "Uint":
        case "Uint8":
        case "Uint16":
        case "Uint32":
        case "Uintptr":
        case "UnsafePointer":
        case "Float32":
        case "Float64":
            typeDefinition.getZeroValue = () => 0;
            break;

        case "String":
            typeDefinition.getZeroValue = () => "";
            break;

        case "Int64":
        case "Uint64":
        case "Complex64":
        case "Complex128":
            // Pre-create the zero value for these types to avoid re-instantiation.
            const predefinedZero = new typeDefinition(0, 0);
            typeDefinition.getZeroValue = () => predefinedZero;
            break;

        case "Chan":
        case "Ptr":
        case "Slice":
            typeDefinition.getZeroValue = () => typeDefinition.nilValue;
            break;

        case "Func":
            typeDefinition.getZeroValue = () => triggerNilPointerError; // Reusing the nil pointer error handler
            break;

        case "Interface":
            typeDefinition.getZeroValue = () => null;
            break;

        case "Array":
            typeDefinition.getZeroValue = () => {
                const arrayCtor = getTypedArrayConstructor(typeDefinition.element.typeCategory);
                if (arrayCtor !== baseArrayConstructor) { // Check against renamed baseArrayConstructor
                    return new arrayCtor(typeDefinition.length);
                }
                const newArray = new baseArrayConstructor(typeDefinition.length);
                for (let i = 0; i < typeDefinition.length; i++) {
                    newArray[i] = typeDefinition.element.getZeroValue();
                }
                return newArray;
            };
            break;

        case "Struct":
            typeDefinition.getZeroValue = () => new typeDefinition.PointerType();
            break;

        default:
            // Similar error handling as the first switch block.
            throw new TypeError(`Unknown type category for zero value: ${typeCategory}`);
    }

    // Common properties for all type definitions.
    Object.assign(typeDefinition, {
        typeCategory,
        typeSignature,
        typeNameStr,
        packagePathStr,
        methods: [], // Initialized as an empty array
        _reflectionCache: null // Private cache for reflection metadata to ensure lazy instantiation.
    });

    // Method to lazily get or create reflection metadata for this type.
    typeDefinition.getReflectMeta = function() { // Renamed reflectType
        if (this._reflectionCache === null) {
            // Instantiate the base reflection type object.
            const rTypeInstance = new typeReflector.rtype.PointerType(
                byteSize, 0, 0, 0, 0,
                typeReflector.kinds[typeCategory],
                undefined, undefined,
                createStringRef(typeSignature),
                undefined, undefined
            );
            rTypeInstance.javascriptType = this; // Renamed jsType

            const typeMethods = [];
            if (this.methods && this.methods.length > 0) { // Check for existence and length
                for (const method of this.methods) { // Using for...of
                    typeMethods.push(new typeReflector.method.PointerType(
                        createStringRef(method[1]),
                        createStringRef(method[2]),
                        getFunctionTypeDefinition(method[3], method[4], method[5]).getReflectMeta(),
                        getFunctionTypeDefinition([this].concat(method[3]), method[4], method[5]).getReflectMeta(),
                        undefined, undefined
                    ));
                }
            }
            // If type has a name or methods, create an uncommonType.
            if (typeNameStr !== "" || typeMethods.length > 0) {
                const methodSliceCtor = getSliceTypeDefinition(getPointerTypeDefinition(typeReflector.method.PointerType));
                rTypeInstance.uncommonType = new typeReflector.uncommonType.PointerType(
                    createStringRef(typeNameStr),
                    createStringRef(packagePathStr),
                    new methodSliceCtor(typeMethods)
                );
                rTypeInstance.uncommonType.associatedJsType = this; // Renamed jsType
            }

            // Call type-specific reflection extension if available.
            if (typeof this.extendReflectMeta === 'function') {
                this.extendReflectMeta(rTypeInstance);
            }
            this._reflectionCache = rTypeInstance; // Cache the result
        }
        return this._reflectionCache;
    };
    return typeDefinition;
};

// Define primitive types using the factory function.
const BoolValue = buildRuntimeType(1, "Bool", "bool", "bool", "", null); // Renamed from $Bool
const IntValue = buildRuntimeType(4, "Int", "int", "int", "", null);
const Int8Value = buildRuntimeType(1, "Int8", "int8", "int8", "", null);
const Int16Value = buildRuntimeType(2, "Int16", "int16", "int16", "", null);
const Int32Value = buildRuntimeType(4, "Int32", "int32", "int32", "", null);
const Int64Value = buildRuntimeType(8, "Int64", "int64", "int64", "", null);
const UintValue = buildRuntimeType(4, "Uint", "uint", "uint", "", null);
const Uint8Value = buildRuntimeType(1, "Uint8", "uint8", "uint8", "", null);
const Uint16Value = buildRuntimeType(2, "Uint16", "uint16", "uint16", "", null);
const Uint32Value = buildRuntimeType(4, "Uint32", "uint32", "uint32", "", null);
const Uint64Value = buildRuntimeType(8, "Uint64", "uint64", "uint64", "", null);
const UintptrValue = buildRuntimeType(4, "Uintptr", "uintptr", "uintptr", "", null);
const Float32Value = buildRuntimeType(4, "Float32", "float32", "float32", "", null);
const Float64Value = buildRuntimeType(8, "Float64", "float64", "float64", "", null);
const Complex64Value = buildRuntimeType(8, "Complex64", "complex64", "complex64", "", null);
const Complex128Value = buildRuntimeType(16, "Complex128", "complex128", "complex128", "", null);
const StringValue = buildRuntimeType(typeGenConstants.DEFAULT_STRING_LENGTH, "String", "string", "string", "", null);
const UnsafePointerValue = buildRuntimeType(4, "UnsafePointer", "unsafe.Pointer", "Pointer", "", null);

// Mapping from type category to JavaScript TypedArray constructors.
const typedArrayRegistry = new Map([ // Renamed $nativeArray, using Map for better lookup performance.
    ["Int", Int32Array],
    ["Int8", Int8Array],
    ["Int16", Int16Array],
    ["Int32", Int32Array],
    ["Uint", Uint32Array],
    ["Uint8", Uint8Array],
    ["Uint16", Uint16Array],
    ["Uint32", Uint32Array],
    ["Uintptr", Uint32Array], // Uintptr often maps to Uint32Array on 32-bit architectures.
    ["Float32", Float32Array],
    ["Float64", Float64Array]
]);

const getTypedArrayConstructor = (elementCategory) => { // Renamed $nativeArray
    return typedArrayRegistry.get(elementCategory) || baseArrayConstructor;
};

// This function is not used in the original snippet but kept for completeness, renamed.
const convertToTypedArray = (elementCategory, sourceArray) => { // Renamed $toNativeArray
    const targetCtor = getTypedArrayConstructor(elementCategory);
    if (targetCtor === baseArrayConstructor) {
        return sourceArray;
    }
    return new targetCtor(sourceArray);
};

const arrayTypeCache = new Map(); // Renamed $arrayTypes, using Map for caching.
const getArrayTypeDefinition = (elementDef, arrayLength) => { // Renamed $arrayType
    const signature = `[${arrayLength}]${elementDef.typeSignature}`;
    let cachedType = arrayTypeCache.get(signature);
    if (!cachedType) {
        cachedType = buildRuntimeType(typeGenConstants.DEFAULT_ARRAY_SIZE, "Array", signature, "", "", null);
        cachedType.initialize(elementDef, arrayLength);
        arrayTypeCache.set(signature, cachedType);
    }
    return cachedType;
};

const getChannelTypeDefinition = (elementDef, isSendOnly, isRecvOnly) => { // Renamed $chanType
    // Constructing the channel signature string.
    let signatureParts = [];
    if (isRecvOnly) signatureParts.push("<-");
    signatureParts.push("chan");
    if (isSendOnly) signatureParts.push("<- ");
    signatureParts.push(elementDef.typeSignature);
    const signature = signatureParts.join("");

    // A more direct property name for caching on the element definition itself.
    const fieldProperty = isSendOnly ? "SendChannel" : (isRecvOnly ? "RecvChannel" : "BidirectionalChannel");
    let cachedType = elementDef[fieldProperty];
    if (cachedType === undefined) {
        cachedType = buildRuntimeType(typeGenConstants.DEFAULT_CHAN_SIZE, "Chan", signature, "", "", null);
        cachedType.initialize(elementDef, isSendOnly, isRecvOnly);
        elementDef[fieldProperty] = cachedType;
    }
    return cachedType;
};

// Helper function to generate a Go-like function signature string.
const generateFunctionSignature = (paramDefs, resultDefs, isVariadic) => { // Renamed $funcSig
    let paramSignatures = transformArrayElements(paramDefs, (p) => p.typeSignature);
    if (isVariadic && paramSignatures.length > 0) {
        // Assuming variadic always applies to the last parameter and it's a slice type string.
        const lastParam = paramSignatures[paramSignatures.length - 1];
        if (lastParam.startsWith("[]")) { // Check for slice type signature
            paramSignatures[paramSignatures.length - 1] = `...${lastParam.substring(2)}`;
        } else {
             // Fallback for non-slice variadic types, though Go's variadic is typically slice-backed.
            paramSignatures[paramSignatures.length - 1] = `...${lastParam}`;
        }
    }
    let signatureStr = `(${paramSignatures.join(", ")})`;
    if (resultDefs.length === 1) {
        signatureStr += ` ${resultDefs[0].typeSignature}`;
    } else if (resultDefs.length > 1) {
        const resultSignatures = transformArrayElements(resultDefs, (r) => r.typeSignature);
        signatureStr += ` (${resultSignatures.join(", ")})`;
    }
    return signatureStr;
};

const funcTypeCache = new Map(); // Renamed $funcTypes, using Map for caching.
const getFunctionTypeDefinition = (paramDefs, resultDefs, isVariadic) => { // Renamed $funcType
    const signature = `func${generateFunctionSignature(paramDefs, resultDefs, isVariadic)}`;
    let cachedType = funcTypeCache.get(signature);
    if (!cachedType) {
        cachedType = buildRuntimeType(typeGenConstants.DEFAULT_FUNC_SIZE, "Func", signature, "", "", null);
        cachedType.initialize(paramDefs, resultDefs, isVariadic);
        funcTypeCache.set(signature, cachedType);
    }
    return cachedType;
};

const interfaceTypeCache = new Map(); // Renamed $interfaceTypes, using Map for caching.
const getInterfaceTypeDefinition = (methodSpecs) => { // Renamed $interfaceType
    let signature = "interface {}";
    if (methodSpecs.length > 0) {
        const methodSignatures = transformArrayElements(methodSpecs, (m) => {
            const pkgPrefix = m[2] ? `${m[2]}.` : ""; // Check if package name exists
            return `${pkgPrefix}${m[1]}${generateFunctionSignature(m[3], m[4], m[5])}`;
        });
        signature = `interface { ${methodSignatures.join("; ")} }`;
    }
    let cachedType = interfaceTypeCache.get(signature);
    if (!cachedType) {
        cachedType = buildRuntimeType(typeGenConstants.DEFAULT_INTERFACE_SIZE, "Interface", signature, "", "", null);
        cachedType.initialize(methodSpecs);
        interfaceTypeCache.set(signature, cachedType);
    }
    return cachedType;
};
const emptyInterfaceDefinition = getInterfaceTypeDefinition([]); // Renamed $emptyInterface

// Placeholder for `getPointerTypeDefinition` and `getSliceTypeDefinition`
// These would typically be defined elsewhere in the Go runtime's JS output,
// but for this snippet, we'll provide dummy implementations to avoid errors.
const getPointerTypeDefinition = (elemType) => {
    // In a full implementation, this would cache and return a Ptr type.
    // For now, it's a simplified placeholder.
    return {
        PointerType: elemType, // Just return the element type as its own pointer type for simplicity.
        getReflectMeta: () => elemType.getReflectMeta ? elemType.getReflectMeta() : null,
        typeCategory: "Ptr",
        typeSignature: `*${elemType.typeSignature || 'unknown'}`
    };
};

const getSliceTypeDefinition = (elemType) => {
    // Similarly, a simplified placeholder for slice types.
    return function(elements) {
        this.elements = elements;
        this.length = elements.length;
    };
};

// Exposing some key functions/variables for external use if this were a library.
// This is a common pattern in Go's reflect package.
runtimeEnv._goRuntimeTypes = {
    buildRuntimeType,
    getArrayTypeDefinition,
    getChannelTypeDefinition,
    getFunctionTypeDefinition,
    getInterfaceTypeDefinition,
    emptyInterfaceDefinition,
    BoolValue, IntValue, StringValue, // Exposing some common types
    // ... potentially other types and helpers
};

})();