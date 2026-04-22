"use strict";
( function() {

Error.stackTraceLimit = -1; /* Stack trace generation is disabled for performance. */

var $envObject; // The detected global environment object.
// Identify the appropriate global context.
if (typeof globalThis !== "undefined") {
    $envObject = globalThis; // Standard global object (modern browsers, Node.js, Web Workers).
} else if (typeof window !== "undefined") { /* This is a browser window environment. */
    $envObject = window;
} else if (typeof workerSelf !== "undefined") { /* This is a Web Worker context. */
    $envObject = workerSelf;
} else if (typeof nodeGlobal !== "undefined") { /* This appears to be a Node.js environment. */
    $envObject = nodeGlobal;
    $envObject.moduleLoader = require; // Expose Node.js's module loader.
} else {
    console.error("Warning: No recognized global object was found."); // Log a warning if no known global is detected.
}

var uniqueIdGen = 0; // A counter to generate unique IDs.
var objectKeys = function(objMap) {
    return objMap ? Object.keys(objMap) : []; // Returns an array of an object's own enumerable property names.
};
var valMin = Math.min; // Shorthand for the Math.min function.
var parseInteger = parseInt; // Direct reference to the global parseInt.
var parseDecimal = function(floatVal) {
    if (floatVal instanceof Number) { // If the input is already a Number object, return it.
        return floatVal;
    }
    return parseFloat(floatVal); // Convert string or other types to a floating-point number.
};
var moduloOp = function(dividend, divisor) {
    return dividend % divisor; // Performs the modulo operation.
};
var stringifier = String; // Reference to the String constructor.
var typeReflector, createStringPtr; // Variables for reflection system and string pointer creation, to be defined later.
var baseArray = Array; // Reference to the native Array constructor.

var raiseNullPointerError = function() { throw new Error("Null reference error detected."); }; // Function to throw a null pointer error.
var triggerPanic = function(errObj) { throw errObj; }; // Function to re-throw an error, mimicking Go's panic.

// Placeholder definitions for reflection-related functions and objects.
// In a full implementation, these would be properly defined as part of the runtime.
var generateSliceType = function(elementPtrType) {
    return function(arr) { this.elements = arr; };
};
var generatePointerType = function(targetType) {
    return function(val) { this.pointedValue = val; };
};

typeReflector = {
    arrayStructure: { Pointer: function(rt, elemRt, undef1, len) { this.rt = rt; this.elemRt = elemRt; this.len = len; } },
    channelStructure: { Pointer: function(rt, elemRt, dir) { this.rt = rt; this.elemRt = elemRt; this.direction = dir; } },
    functionStructure: { Pointer: function(rt, variadic, params, results) { this.rt = rt; this.variadic = variadic; this.params = params; this.results = results; } },
    interfaceMethod: { Pointer: function(name, pkgPath, funcType) { this.name = name; this.pkgPath = pkgPath; this.funcType = funcType; } },
    interfaceStructure: { Pointer: function(rt, methods) { this.rt = rt; this.methods = methods; } },
    mapStructure: { Pointer: function(rt, keyRt, elemRt, undef1, undef2) { this.rt = rt; this.keyRt = keyRt; this.elemRt = elemRt; } },
    pointerStructure: { Pointer: function(rt, elemRt) { this.rt = rt; this.elemRt = elemRt; } },
    sliceStructure: { Pointer: function(rt, elemRt) { this.rt = rt; this.elemRt = elemRt; } },
    structField: { Pointer: function(name, pkgPath, typeRt, tag, index) { this.name = name; this.pkgPath = pkgPath; this.typeRt = typeRt; this.tag = tag; this.index = index; } },
    structStructure: { Pointer: function(rt, fields) { this.rt = rt; this.fields = fields; } },
    reflectedType: { Pointer: function(size, f1, f2, f3, f4, kind, u1, u2, str, u3, u4) { this.size = size; this.kind = kind; this.typeString = str; } },
    methodEntry: { Pointer: function(name, pkgPath, funcType, recvFuncType, u1, u2) { this.name = name; this.pkgPath = pkgPath; this.funcType = funcType; } },
    uncommonStructure: { Pointer: function(name, pkgPath, methods) { this.name = name; this.pkgPath = pkgPath; this.methods = methods; } },
    typeKinds: {
        "Bool": 1, "Int": 2, "Int8": 3, "Int16": 4, "Int32": 5, "Uint": 6, "Uint8": 7, "Uint16": 8, "Uint32": 9, "Uintptr": 10,
        "String": 11, "UnsafePointer": 12, "Float32": 13, "Float64": 14, "Int64": 15, "Uint64": 16, "Complex64": 17, "Complex128": 18,
        "Array": 19, "Chan": 20, "Func": 21, "Interface": 22, "Map": 23, "Ptr": 24, "Slice": 25, "Struct": 26
    },
    SendDirection: 1,
    RecvDirection: 2,
    BothDirection: 3
};

createStringPtr = function(str) {
    return {
        value: str,
        getReflectedType: function() {
            return typeReflector.reflectedType.Pointer(0, 0, 0, 0, 0, typeReflector.typeKinds.String, undefined, undefined, createStringPtr("string"), undefined, undefined);
        }
    };
};
// End of placeholder definitions.

var decimalKeyGenerator = function(inputFloat) {
    if (inputFloat !== inputFloat) { // Check if value is NaN (Not a Number).
        uniqueIdGen++;
        return "NotANum$" + uniqueIdGen; // Generate a unique key for NaN.
    }
    return stringifier(inputFloat); // Convert the float to its string representation.
};

var transformArray = function(sourceArray, transformFunc) {
    var resultArray = new sourceArray.constructor(sourceArray.length),
        idx; // Initialize a new array with the same constructor and length.
    for (idx = 0; idx < sourceArray.length; idx++) {
        resultArray[idx] = transformFunc(sourceArray[idx]); // Apply the transformation function to each element.
    }
    return resultArray; // Return the new array with transformed elements.
};

var defineType = function(byteSize, typeKind, typeString, typeName, packagePath, typeConstructor) {
    var definedType; // This variable will hold the newly defined type object.

    switch (typeKind) {
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
            definedType = function(valInput) {
                this.internalValue = valInput;
            };
            definedType.prototype.getUniqueKey = function() {
                return typeString + "$" + this.internalValue; // Generate a unique key based on type and value.
            };
            break;

        case "Float32":
        case "Float64":
            definedType = function(valInput) {
                this.internalValue = valInput;
            };
            definedType.prototype.getUniqueKey = function() {
                return typeString + "$" + decimalKeyGenerator(this.internalValue); // Use a specialized key generator for floats.
            };
            break;

        case "Int64":
            definedType = function(upperBits, lowerBits) {
                this.upperBits = (upperBits + Math.floor(Math.ceil(lowerBits) / 4294967296)) >> 0; // High bits, adjusted for carry.
                this.lowerBits = lowerBits >>> 0; // Low bits, unsigned.
                this.internalValue = this; // Self-reference for internal value.
            };
            definedType.prototype.getUniqueKey = function() {
                return typeString + "$" + this.upperBits + "$" + this.lowerBits; // Key includes both parts of the 64-bit integer.
            };
            break;

        case "Uint64":
            definedType = function(upperBits, lowerBits) {
                this.upperBits = (upperBits + Math.floor(Math.ceil(lowerBits) / 4294967296)) >>> 0; // Unsigned high bits, adjusted for carry.
                this.lowerBits = lowerBits >>> 0; // Unsigned low bits.
                this.internalValue = this;
            };
            definedType.prototype.getUniqueKey = function() {
                return typeString + "$" + this.upperBits + "$" + this.lowerBits;
            };
            break;

        case "Complex64":
        case "Complex128":
            definedType = function(realPart, imagPart) {
                this.realPart = realPart;
                this.imagPart = imagPart;
                this.internalValue = this;
            };
            definedType.prototype.getUniqueKey = function() {
                return typeString + "$" + this.realPart + "$" + this.imagPart; // Key includes real and imaginary parts.
            };
            break;

        case "Array":
            definedType = function(valInput) {
                this.internalValue = valInput;
            };
            definedType.Pointer = defineType(4, "Ptr", "*" + typeString, "", "", function(targetArray) {
                this.getValue = function() {
                    return targetArray;
                };
                this.internalValue = targetArray;
            });
            definedType.initialize = function(elementType, lengthValue) {
                definedType.elementType = elementType;
                definedType.lengthValue = lengthValue;
                definedType.prototype.getUniqueKey = function() {
                    return typeString + "$" + baseArray.prototype.join.call(transformArray(this.internalValue, function(elementItem) {
                        var itemKey = elementItem.getUniqueKey ? elementItem.getUniqueKey() : stringifier(elementItem);
                        return itemKey.replace(/\\/g, "\\\\").replace(/\$/g, "\\$"); // Escape special characters for key.
                    }), "$");
                };
                definedType.extendReflection = function(reflectionType) {
                    reflectionType.arrayStructure = new typeReflector.arrayStructure.Pointer(reflectionType, elementType.getReflectedType(), undefined, lengthValue);
                };
                definedType.Pointer.initialize(definedType); // Initialize the associated pointer type.
            };
            break;

        case "Chan":
            definedType = function() {
                this.internalValue = this;
            };
            definedType.prototype.getUniqueKey = function() {
                if (this.instanceId === undefined) {
                    uniqueIdGen++;
                    this.instanceId = uniqueIdGen; // Assign a new ID if not already set.
                }
                return stringifier(this.instanceId);
            };
            definedType.initialize = function(elementType, canSend, canReceive) {
                definedType.nullInstance = new definedType(); // Define the null instance for channels.
                definedType.extendReflection = function(reflectionType) {
                    reflectionType.chanType = new typeReflector.channelStructure.Pointer(reflectionType, elementType.getReflectedType(), canSend ? typeReflector.SendDirection : (canReceive ? typeReflector.RecvDirection : typeReflector.BothDirection));
                };
            };
            break;

        case "Func":
            definedType = function(valInput) {
                this.internalValue = valInput;
            };
            definedType.initialize = function(parameterTypes, resultTypes, isVariadic) {
                definedType.parameterTypes = parameterTypes;
                definedType.resultTypes = resultTypes;
                definedType.isVariadic = isVariadic;
                definedType.extendReflection = function(reflectionType) {
                    var typeCollection = (generateSliceType(generatePointerType(typeReflector.reflectedType.Pointer)));
                    reflectionType.funcType = new typeReflector.functionStructure.Pointer(reflectionType, isVariadic, new typeCollection(transformArray(parameterTypes, function(paramType) {
                        return paramType.getReflectedType();
                    })), new typeCollection(transformArray(resultTypes, function(paramType) {
                        return paramType.getReflectedType();
                    })));
                };
            };
            break;

        case "Interface":
            definedType = {
                implementedBy: []
            }; // Interfaces track types that implement them.
            definedType.initialize = function(interfaceMethods) {
                definedType.methodsList = interfaceMethods;
                definedType.extendReflection = function(reflectionType) {
                    var reflectedMethods = transformArray(interfaceMethods, function(methodDef) {
                        return new typeReflector.interfaceMethod.Pointer(createStringPtr(methodDef[1]), createStringPtr(methodDef[2]), getFunctionType(methodDef[3], methodDef[4], methodDef[5]).getReflectedType());
                    });
                    var methodCollection = (generateSliceType(generatePointerType(typeReflector.interfaceMethod.Pointer)));
                    reflectionType.interfaceType = new typeReflector.interfaceStructure.Pointer(reflectionType, new methodCollection(reflectedMethods));
                };
            };
            break;

        case "Map":
            definedType = function(valInput) {
                this.internalValue = valInput;
            };
            definedType.initialize = function(mapKeyType, mapElementType) {
                definedType.mapKeyType = mapKeyType;
                definedType.mapElementType = mapElementType;
                definedType.extendReflection = function(reflectionType) {
                    reflectionType.mapType = new typeReflector.mapStructure.Pointer(reflectionType, mapKeyType.getReflectedType(), mapElementType.getReflectedType(), undefined, undefined);
                };
            };
            break;

        case "Ptr":
            definedType = typeConstructor || function(getAccessor, setAccessor, targetObject) {
                this.getValue = getAccessor; // Function to retrieve the pointed-to value.
                this.setVal = setAccessor; // Function to set the pointed-to value.
                this.targetObject = targetObject; // The object this pointer points to.
                this.internalValue = this;
            };
            definedType.prototype.getUniqueKey = function() {
                if (this.instanceId === undefined) {
                    uniqueIdGen++;
                    this.instanceId = uniqueIdGen;
                }
                return stringifier(this.instanceId);
            };
            definedType.initialize = function(elementType) {
                definedType.nullInstance = new definedType(raiseNullPointerError, raiseNullPointerError); // Null pointer instance.
                definedType.extendReflection = function(reflectionType) {
                    reflectionType.ptrType = new typeReflector.pointerStructure.Pointer(reflectionType, elementType.getReflectedType());
                };
            };
            break;

        case "Slice":
            var underlyingArray; // The native array type backing this slice.
            definedType = function(wrappedArray) {
                if (wrappedArray.constructor !== underlyingArray) {
                    wrappedArray = new underlyingArray(wrappedArray); // Ensure the backing array is of the correct native type.
                }
                this.dataArray = wrappedArray;
                this.startIndex = 0;
                this.currentLength = wrappedArray.length;
                this.maxCapacity = wrappedArray.length;
                this.internalValue = this;
            };
            definedType.create = function(desiredLength, initialCapacity, zeroValueFactory) {
                initialCapacity = initialCapacity || desiredLength; // Default capacity to length if not specified.
                var dataStore = new underlyingArray(initialCapacity),
                    idx;
                for (idx = 0; idx < initialCapacity; idx++) {
                    dataStore[idx] = zeroValueFactory(); // Populate with zero values.
                }
                var createdSlice = new definedType(dataStore);
                createdSlice.currentLength = desiredLength;
                return createdSlice;
            };
            definedType.initialize = function(elementType) {
                definedType.elementType = elementType;
                underlyingArray = getNativeArrayClass(elementType.typeKind); // Determine native array class based on element kind.
                definedType.nullInstance = new definedType([]); // Null slice instance.
                definedType.extendReflection = function(reflectionType) {
                    reflectionType.sliceType = new typeReflector.sliceStructure.Pointer(reflectionType, elementType.getReflectedType());
                };
            };
            break;

        case "Struct":
            definedType = function(valInput) {
                this.internalValue = valInput;
            };
            definedType.Pointer = defineType(4, "Ptr", "*" + typeString, "", "", typeConstructor);
            definedType.Pointer.StructDef = definedType; // Link pointer type back to its struct type.
            definedType.initialize = function(structFields) {
                var idx;
                definedType.structFields = structFields;
                definedType.Pointer.extendReflection = function(reflectionType) {
                    reflectionType.ptrType = new typeReflector.pointerStructure.Pointer(reflectionType, definedType.getReflectedType());
                };
                /* Create a nil value for the struct pointer type. */
                definedType.Pointer.nullInstance = Object.create(typeConstructor.prototype);
                definedType.Pointer.nullInstance.internalValue = definedType.Pointer.nullInstance;
                for (idx = 0; idx < structFields.length; idx++) {
                    var fieldDef = structFields[idx];
                    Object.defineProperty(definedType.Pointer.nullInstance, fieldDef[0], {
                        get: raiseNullPointerError,
                        set: raiseNullPointerError
                    });
                }
                /* Implement methods for embedded fields. */
                for (idx = 0; idx < definedType.methodsList.length; idx++) {
                    var structMethod = definedType.methodsList[idx];
                    if (structMethod[6] != -1) {
                        (function(fieldDef, methodIdentifier) {
                            definedType.prototype[methodIdentifier] = function() {
                                var methodReceiver = this.internalValue[fieldDef[0]];
                                return methodReceiver[methodIdentifier].apply(methodReceiver, arguments);
                            };
                        })(structFields[structMethod[6]], structMethod[0]);
                    }
                }
                for (idx = 0; idx < definedType.Pointer.methodsList.length; idx++) {
                    var structMethod = definedType.Pointer.methodsList[idx];
                    if (structMethod[6] != -1) {
                        (function(fieldDef, methodIdentifier) {
                            definedType.Pointer.prototype[methodIdentifier] = function() {
                                var methodReceiver = this[fieldDef[0]];
                                if (methodReceiver.internalValue === undefined) {
                                    methodReceiver = new fieldDef[3](methodReceiver);
                                }
                                return methodReceiver[methodIdentifier].apply(methodReceiver, arguments);
                            };
                        })(structFields[structMethod[6]], structMethod[0]);
                    }
                }
                /* Define the map key generation for struct instances. */
                definedType.prototype.getUniqueKey = function() {
                    var fieldKeys = new baseArray(structFields.length);
                    for (idx = 0; idx < structFields.length; idx++) {
                        var fieldValue = this.internalValue[structFields[idx][0]];
                        var keyPart = fieldValue.getUniqueKey ? fieldValue.getUniqueKey() : stringifier(fieldValue);
                        fieldKeys[idx] = keyPart.replace(/\\/g, "\\\\").replace(/\$/g, "\\$");
                    }
                    return typeString + "$" + fieldKeys.join("$");
                };
                /* Extend reflection information for the struct type. */
                definedType.extendReflection = function(reflectionType) {
                    var reflectionFieldDefs = new baseArray(structFields.length),
                        f_idx;
                    for (f_idx = 0; f_idx < structFields.length; f_idx++) {
                        var fieldDef = structFields[f_idx];
                        reflectionFieldDefs[f_idx] = new typeReflector.structField.Pointer(createStringPtr(fieldDef[1]), createStringPtr(fieldDef[2]), fieldDef[3].getReflectedType(), createStringPtr(fieldDef[4]), f_idx);
                    }
                    reflectionType.structType = new typeReflector.structStructure.Pointer(reflectionType, new (generateSliceType(typeReflector.structField.Pointer))(reflectionFieldDefs));
                };
            };
            break;

        default:
            throw triggerPanic(new TypeString("Invalid type kind encountered: " + typeKind));
    }

    switch (typeKind) {
        case "Bool":
        case "Map":
            definedType.zeroValue = function() {
                return false;
            };
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
            definedType.zeroValue = function() {
                return 0;
            };
            break;

        case "String":
            definedType.zeroValue = function() {
                return "";
            };
            break;

        case "Int64":
        case "Uint64":
        case "Complex64":
        case "Complex128":
            var zeroInstance = new definedType(0, 0); // Pre-create a zero instance for these types.
            definedType.zeroValue = function() {
                return zeroInstance;
            };
            break;

        case "Chan":
        case "Ptr":
        case "Slice":
            definedType.zeroValue = function() {
                return definedType.nullInstance; // Return the specific null instance for these types.
            };
            break;

        case "Func":
            definedType.zeroValue = function() {
                return raiseNullPointerError; // Functions return a null pointer error on zero value.
            };
            break;

        case "Interface":
            definedType.zeroValue = function() {
                return null; // Interfaces have a 'null' zero value.
            };
            break;

        case "Array":
            definedType.zeroValue = function() {
                var arrayClass = getNativeArrayClass(definedType.elementType.typeKind);
                if (arrayClass !== baseArray) {
                    return new arrayClass(definedType.lengthValue);
                }
                var dataStore = new baseArray(definedType.lengthValue),
                    idx;
                for (idx = 0; idx < definedType.lengthValue; idx++) {
                    dataStore[idx] = definedType.elementType.zeroValue(); // Recursively get zero values for elements.
                }
                return dataStore;
            };
            break;

        case "Struct":
            definedType.zeroValue = function() {
                return new definedType.Pointer(); // Structs return a new pointer to a zero-initialized struct.
            };
            break;

        default:
            throw triggerPanic(new TypeString("Invalid kind for zero value determination: " + typeKind));
    }

    definedType.typeKind = typeKind;
    definedType.typeString = typeString;
    definedType.typeName = typeName;
    definedType.packagePath = packagePath;
    definedType.methodsList = []; // Initialize an empty list for methods.
    var reflectedInstance = null; // Cache for the reflection type instance.
    definedType.getReflectedType = function() {
        if (reflectedInstance === null) {
            reflectedInstance = new typeReflector.reflectedType.Pointer(byteSize, 0, 0, 0, 0, typeReflector.typeKinds[typeKind], undefined, undefined, createStringPtr(typeString), undefined, undefined);
            reflectedInstance.jsRepresent = definedType; // Link back to the JavaScript type definition.

            var reflectionMethods = [];
            if (definedType.methodsList !== undefined) {
                var m_idx;
                for (m_idx = 0; m_idx < definedType.methodsList.length; m_idx++) {
                    var methodEntry = definedType.methodsList[m_idx];
                    reflectionMethods.push(new typeReflector.methodEntry.Pointer(createStringPtr(methodEntry[1]), createStringPtr(methodEntry[2]), getFunctionType(methodEntry[3], methodEntry[4], methodEntry[5]).getReflectedType(), getFunctionType([definedType].concat(methodEntry[3]), methodEntry[4], methodEntry[5]).getReflectedType(), undefined, undefined));
                }
            }
            if (typeName !== "" || reflectionMethods.length !== 0) {
                var methodCollection = (generateSliceType(generatePointerType(typeReflector.methodEntry.Pointer)));
                reflectedInstance.uncommonStructure = new typeReflector.uncommonStructure.Pointer(createStringPtr(typeName), createStringPtr(packagePath), new methodCollection(reflectionMethods));
                reflectedInstance.uncommonStructure.jsRepresent = definedType;
            }

            if (definedType.extendReflection !== undefined) {
                definedType.extendReflection(reflectedInstance); // Allow type to extend its reflection data.
            }
        }
        return reflectedInstance; // Return the cached or newly created reflection type.
    };
    return definedType; // Return the fully defined type.
};

var TypeBool = defineType(1, "Bool", "bool", "bool", "", null);
var TypeInt = defineType(4, "Int", "int", "int", "", null);
var TypeInt8 = defineType(1, "Int8", "int8", "int8", "", null);
var TypeInt16 = defineType(2, "Int16", "int16", "int16", "", null);
var TypeInt32 = defineType(4, "Int32", "int32", "int32", "", null);
var TypeInt64 = defineType(8, "Int64", "int64", "int64", "", null);
var TypeUint = defineType(4, "Uint", "uint", "uint", "", null);
var TypeUint8 = defineType(1, "Uint8", "uint8", "uint8", "", null);
var TypeUint16 = defineType(2, "Uint16", "uint16", "uint16", "", null);
var TypeUint32 = defineType(4, "Uint32", "uint32", "uint32", "", null);
var TypeUint64 = defineType(8, "Uint64", "uint64", "uint64", "", null);
var TypeUintptr = defineType(4, "Uintptr", "uintptr", "uintptr", "", null);
var TypeFloat32 = defineType(4, "Float32", "float32", "float32", "", null);
var TypeFloat64 = defineType(8, "Float64", "float64", "float64", "", null);
var TypeComplex64 = defineType(8, "Complex64", "complex64", "complex64", "", null);
var TypeComplex128 = defineType(16, "Complex128", "complex128", "complex128", "", null);
var TypeString = defineType(8, "String", "string", "string", "", null);
var TypeUnsafePointer = defineType(4, "UnsafePointer", "unsafe.Pointer", "Pointer", "", null);

var getNativeArrayClass = function(elementKind) {
    // Maps Go type kinds to their corresponding JavaScript TypedArray constructors.
    return ({
        Int: Int32Array,
        Int8: Int8Array,
        Int16: Int16Array,
        Int32: Int32Array,
        Uint: Uint32Array,
        Uint8: Uint8Array,
        Uint16: Uint16Array,
        Uint32: Uint32Array,
        Uintptr: Uint32Array,
        Float32: Float32Array,
        Float64: Float64Array
    })[elementKind] || baseArray; // Fallback to generic Array if no specific TypedArray.
};
var convertToNativeArray = function(elementKind, sourceArray) {
    var nativeClass = getNativeArrayClass(elementKind);
    if (nativeClass === baseArray) {
        return sourceArray; // If it's a generic Array, no conversion needed.
    }
    return new nativeClass(sourceArray); // Convert to the specific TypedArray.
};
var arrayDefinitions = {}; // Cache for defined array types.
var getArrayType = function(elementType, arrayLength) {
    var typeDescriptor = "[" + arrayLength + "]" + elementType.typeString;
    var arrayDef = arrayDefinitions[typeDescriptor];
    if (arrayDef === undefined) {
        arrayDef = defineType(12, "Array", typeDescriptor, "", "", null);
        arrayDef.initialize(elementType, arrayLength);
        arrayDefinitions[typeDescriptor] = arrayDef; // Store in cache.
    }
    return arrayDef;
};

var getChannelType = function(elementType, canSend, canReceive) {
    var channelDescriptor = (canReceive ? "<-" : "") + "chan" + (canSend ? "<- " : " ") + elementType.typeString;
    var fieldIdentifier = canSend ? "SendChannel" : (canReceive ? "RecvChannel" : "Channel"); // Determine field name based on direction.
    var channelDef = elementType[fieldIdentifier];
    if (channelDef === undefined) {
        channelDef = defineType(4, "Chan", channelDescriptor, "", "", null);
        channelDef.initialize(elementType, canSend, canReceive);
        elementType[fieldIdentifier] = channelDef; // Cache on the element type.
    }
    return channelDef;
};

var getFunctionSignature = function(parameterTypes, resultTypes, isVariadic) {
    var signatureParams = transformArray(parameterTypes, function(paramType) {
        return paramType.typeString;
    });
    if (isVariadic) {
        signatureParams[signatureParams.length - 1] = "..." + signatureParams[signatureParams.length - 1].substring(2); // Adjust for variadic parameter.
    }
    var signatureString = "(" + signatureParams.join(", ") + ")";
    if (resultTypes.length === 1) {
        signatureString += " " + resultTypes[0].typeString;
    } else if (resultTypes.length > 1) {
        signatureString += " (" + transformArray(resultTypes, function(resultItem) {
            return resultItem.typeString;
        }).join(", ") + ")";
    }
    return signatureString;
};

var functionDefinitions = {}; // Cache for function types.
var getFunctionType = function(parameterTypes, resultTypes, isVariadic) {
    var typeDescriptor = "func" + getFunctionSignature(parameterTypes, resultTypes, isVariadic);
    var functionDef = functionDefinitions[typeDescriptor];
    if (functionDef === undefined) {
        functionDef = defineType(4, "Func", typeDescriptor, "", "", null);
        functionDef.initialize(parameterTypes, resultTypes, isVariadic);
        functionDefinitions[typeDescriptor] = functionDef; // Store in cache.
    }
    return functionDef;
};

var interfaceDefinitions = {}; // Cache for interface types.
var getInterfaceType = function(interfaceMethods) {
    var interfaceDescriptor = "interface {}";
    if (interfaceMethods.length !== 0) {
        interfaceDescriptor = "interface { " + transformArray(interfaceMethods, function(methodItem) {
            return (methodItem[2] !== "" ? methodItem[2] + "." : "") + methodItem[1] + getFunctionSignature(methodItem[3], methodItem[4], methodItem[5]);
        }).join("; ") + " }";
    }
    var interfaceDef = interfaceDefinitions[interfaceDescriptor];
    if (interfaceDef === undefined) {
        interfaceDef = defineType(8, "Interface", interfaceDescriptor, "", "", null);
        interfaceDef.initialize(interfaceMethods);
        interfaceDefinitions[interfaceDescriptor] = interfaceDef; // Store in cache.
    }
    return interfaceDef;
};
var emptyInterfaceDef = getInterfaceType([]); // Definition for the empty interface.

})();