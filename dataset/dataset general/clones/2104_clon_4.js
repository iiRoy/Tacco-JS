(() => {
    'use strict';

    Reflect.set(Error, 'stackTraceLimit', -1);

    let runtimeEnvironment;
    if (typeof window !== 'undefined') {
        runtimeEnvironment = window;
    } else if (typeof self !== 'undefined') {
        runtimeEnvironment = self;
    } else if (typeof global !== 'undefined') {
        runtimeEnvironment = global;
        runtimeEnvironment.retrieveModule = require;
    } else {
        console.warn('Environment warning: no primary context object located.');
    }

    const uniqueIdentifierSource = (() => {
        let currentId = 0;
        return {
            next: () => `UID_${++currentId}`
        };
    })();

    const objectPropertyExtractor = (obj) => obj ? Reflect.ownKeys(obj).filter(key => typeof key === 'string') : [];
    const numericalMinimum = Math.min;
    const integerParser = parseInt;
    const floatingPointParser = (val) => (typeof val === 'number') ? val : parseFloat(val);
    const moduloOperation = (x, y) => x % y;
    const stringConversion = String;
    const genericListConstructor = Array;

    const nanSymbolRegistry = new WeakMap();
    const floatingPointKeyProducer = (num) => {
        if (num !== num) {
            if (!nanSymbolRegistry.has(num)) {
                nanSymbolRegistry.set(num, uniqueIdentifierSource.next());
            }
            return `NaN_KEY_${nanSymbolRegistry.get(num)}`;
        }
        return stringConversion(num);
    };

    const transformListElements = (list, processingFunction) => {
        const newList = new list.constructor(list.length);
        for (let i = 0; i < list.length; i++) {
            newList[i] = processingFunction(list[i]);
        }
        return newList;
    };

    const typeMetadataSystem = {};
    typeMetadataSystem.arrayType = class { constructor(rt, elemRt, len) { this.runtimeType = rt; this.elementTypeRuntime = elemRt; this.length = len; } };
    typeMetadataSystem.chanType = class { constructor(rt, elemRt, dir) { this.runtimeType = rt; this.elementTypeRuntime = elemRt; this.direction = dir; } };
    typeMetadataSystem.funcType = class { constructor(rt, variadic, paramRts, resultRts) { this.runtimeType = rt; this.isVariadic = variadic; this.parameterRuntimeTypes = paramRts; this.resultRuntimeTypes = resultRts; } };
    typeMetadataSystem.interfaceType = class { constructor(rt, methods) { this.runtimeType = rt; this.interfaceMethods = methods; } };
    typeMetadataSystem.mapType = class { constructor(rt, keyRt, elemRt) { this.runtimeType = rt; this.keyRuntimeType = keyRt; this.elementRuntimeType = elemRt; } };
    typeMetadataSystem.ptrType = class { constructor(rt, elemRt) { this.runtimeType = rt; this.elementTypeRuntime = elemRt; } };
    typeMetadataSystem.sliceType = class { constructor(rt, elemRt) { this.runtimeType = rt; this.elementTypeRuntime = elemRt; } };
    typeMetadataSystem.structType = class { constructor(rt, fields) { this.runtimeType = rt; this.structureFields = fields; } };
    typeMetadataSystem.rtype = class { constructor(size, align, fieldAlign, methodsOffset, gcdata, kind, pkgPath, name, string) {
        Object.assign(this, { size, align, fieldAlign, methodsOffset, gcdata, kind, pkgPath, name, string });
    } };
    typeMetadataSystem.structField = class { constructor(name, pkgPath, typeRef, tag, index) { Object.assign(this, { name, pkgPath, typeRef, tag, index }); } };
    typeMetadataSystem.method = class { constructor(name, pkgPath, typeRef, funcTypeRef) { Object.assign(this, { name, pkgPath, typeRef, funcTypeRef }); } };
    typeMetadataSystem.imethod = class { constructor(name, pkgPath, typeRef) { Object.assign(this, { name, pkgPath, typeRef }); } };
    typeMetadataSystem.uncommonType = class { constructor(name, pkgPath, methods) { Object.assign(this, { name, pkgPath, methods }); } };

    typeMetadataSystem.SendDir = Symbol('SendDir');
    typeMetadataSystem.RecvDir = Symbol('RecvDir');
    typeMetadataSystem.BothDir = Symbol('BothDir');

    typeMetadataSystem.kinds = {
        "Bool": "Bool", "Int": "Int", "Int8": "Int8", "Int16": "Int16", "Int32": "Int32",
        "Uint": "Uint", "Uint8": "Uint8", "Uint16": "Uint16", "Uint32": "Uint32", "Uintptr": "Uintptr",
        "String": "String", "UnsafePointer": "UnsafePointer", "Float32": "Float32", "Float64": "Float64",
        "Int64": "Int64", "Uint64": "Uint64", "Complex64": "Complex64", "Complex128": "Complex128",
        "Array": "Array", "Chan": "Chan", "Func": "Func", "Interface": "Interface", "Map": "Map",
        "Ptr": "Ptr", "Slice": "Slice", "Struct": "Struct"
    };

    const stringPointerCreator = (str) => ({ value: str });
    const nilPointerThrower = () => { throw new Error('Attempted operation on nil pointer'); };

    const nativeArrayProvider = (elementTypeKind) => {
        const kindMap = {
            Int: Int32Array, Int8: Int8Array, Int16: Int16Array, Int32: Int32Array,
            Uint: Uint32Array, Uint8: Uint8Array, Uint16: Uint16Array, Uint32: Uint32Array, Uintptr: Uint32Array,
            Float32: Float32Array, Float64: Float64Array
        };
        return kindMap[elementTypeKind] || genericListConstructor;
    };

    let typeDefinitionBuilder; // Forward declaration

    const typeKindBlueprints = {
        "Bool": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => false,
            initSpecifics: null,
            extendReflection: null
        },
        "Int": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => 0,
            initSpecifics: null,
            extendReflection: null
        },
        "String": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => "",
            initSpecifics: null,
            extendReflection: null
        },
        "UnsafePointer": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => 0,
            initSpecifics: null,
            extendReflection: null
        },
        "Float32": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${floatingPointKeyProducer(this.value)}`; },
            getZeroValue: () => 0,
            initSpecifics: null,
            extendReflection: null
        },
        "Float64": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${floatingPointKeyProducer(this.value)}`; },
            getZeroValue: () => 0,
            initSpecifics: null,
            extendReflection: null
        },
        "Int64": {
            createConstructor: () => function(high, low) {
                this.highPart = (high + Math.floor(Math.ceil(low) / 4294967296)) >> 0;
                this.lowPart = low >>> 0;
                this.value = this;
            },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.highPart}$${this.lowPart}`; },
            getZeroValue: null,
            initSpecifics: null,
            extendReflection: null
        },
        "Uint64": {
            createConstructor: () => function(high, low) {
                this.highPart = (high + Math.floor(Math.ceil(low) / 4294967296)) >>> 0;
                this.lowPart = low >>> 0;
                this.value = this;
            },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.highPart}$${this.lowPart}`; },
            getZeroValue: null,
            initSpecifics: null,
            extendReflection: null
        },
        "Complex64": {
            createConstructor: () => function(real, imag) {
                this.realPart = real;
                this.imaginaryPart = imag;
                this.value = this;
            },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.realPart}$${this.imaginaryPart}`; },
            getZeroValue: null,
            initSpecifics: null,
            extendReflection: null
        },
        "Complex128": {
            createConstructor: () => function(real, imag) {
                this.realPart = real;
                this.imaginaryPart = imag;
                this.value = this;
            },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.realPart}$${this.imaginaryPart}`; },
            getZeroValue: null,
            initSpecifics: null,
            extendReflection: null
        },
        "Array": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix, elemDesc) => function() {
                return `${prefix}$${genericListConstructor.prototype.join.call(transformListElements(this.value, (e) => {
                    const k = e.computeKey ? e.computeKey() : stringConversion(e);
                    return k.replace(/\\/g, "\\\\").replace(/\$/g, "\\$");
                }), "$")}`;
            },
            getZeroValue: null,
            initSpecifics: (typeObj, elemDesc, len, builderFunc) => {
                typeObj.elem = elemDesc;
                typeObj.len = len;
                typeObj.PointerType = builderFunc(4, "Ptr", "*" + typeObj.string, "", "", function(arrayInstance) {
                    this.getter = () => arrayInstance;
                    this.value = arrayInstance;
                });
                typeObj.PointerType.targetType = typeObj;
                typeObj.PointerType.prototype.computeKey = function() {
                    if (this.identifier === undefined) {
                        this.identifier = uniqueIdentifierSource.next();
                    }
                    return stringConversion(this.identifier);
                };
            },
            extendReflection: (rt, elemDesc, len) => {
                rt.arrayType = new typeMetadataSystem.arrayType(rt, elemDesc.runtimeType(), undefined, len);
            }
        },
        "Chan": {
            createConstructor: () => function() { this.value = this; },
            createKeyMethod: (prefix) => function() {
                if (this.identifier === undefined) {
                    this.identifier = uniqueIdentifierSource.next();
                }
                return stringConversion(this.identifier);
            },
            getZeroValue: null,
            initSpecifics: (typeObj, elemDesc, sendOnly, recvOnly) => {
                typeObj.elem = elemDesc;
                typeObj.nil = new typeObj();
                typeObj.extendReflection = (rt) => {
                    rt.chanType = new typeMetadataSystem.chanType(rt, elemDesc.runtimeType(), sendOnly ? typeMetadataSystem.SendDir : (recvOnly ? typeMetadataSystem.RecvDir : typeMetadataSystem.BothDir));
                };
            },
            extendReflection: null
        },
        "Func": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => nilPointerThrower,
            initSpecifics: (typeObj, params, results, variadic, builderFunc, customCtor, typeFactoriesRef) => {
                typeObj.params = params;
                typeObj.results = results;
                typeObj.variadic = variadic;
                typeObj.extendReflection = (rt) => {
                    const ptrRtype = builderFunc(null, "Ptr", `*${typeMetadataSystem.rtype.name}`, "", "", null);
                    const sliceOfPtrRtype = typeFactoriesRef.sliceType(ptrRtype);
                    rt.funcType = new typeMetadataSystem.funcType(rt, variadic,
                        new sliceOfPtrRtype(transformListElements(params, p => p.runtimeType())),
                        new sliceOfPtrRtype(transformListElements(results, r => r.runtimeType()))
                    );
                };
            },
            extendReflection: null
        },
        "Interface": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => null,
            initSpecifics: (typeObj, methods, builderFunc, customCtor, typeFactoriesRef) => {
                typeObj.interfaceMethods = methods;
                typeObj.extendReflection = (rt) => {
                    const iMethods = transformListElements(methods, (m) => {
                        const funcTypeRef = typeFactoriesRef.functionType(m[3], m[4], m[5]);
                        return new typeMetadataSystem.imethod(stringPointerCreator(m[1]), stringPointerCreator(m[2]), funcTypeRef.runtimeType());
                    });
                    const ptrImethod = builderFunc(null, "Ptr", `*${typeMetadataSystem.imethod.name}`, "", "", null);
                    const sliceOfPtrImethod = typeFactoriesRef.sliceType(ptrImethod);
                    rt.interfaceType = new typeMetadataSystem.interfaceType(rt, new sliceOfPtrImethod(iMethods));
                };
            },
            extendReflection: null
        },
        "Map": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => null,
            initSpecifics: (typeObj, keyDesc, elemDesc) => {
                typeObj.keyDescriptor = keyDesc;
                typeObj.elementDescriptor = elemDesc;
                typeObj.extendReflection = (rt) => {
                    rt.mapType = new typeMetadataSystem.mapType(rt, keyDesc.runtimeType(), elemDesc.runtimeType());
                };
            },
            extendReflection: null
        },
        "Ptr": {
            createConstructor: (customConstructor) => customConstructor || function(getterFunc, setterFunc, targetObj) {
                this.getter = getterFunc;
                this.setter = setterFunc;
                this.targetObject = targetObj;
                this.value = this;
            },
            createKeyMethod: (prefix) => function() {
                if (this.identifier === undefined) {
                    this.identifier = uniqueIdentifierSource.next();
                }
                return stringConversion(this.identifier);
            },
            getZeroValue: null,
            initSpecifics: (typeObj, elemDesc) => {
                typeObj.elem = elemDesc;
                typeObj.nil = new typeObj(nilPointerThrower, nilPointerThrower);
                typeObj.extendReflection = (rt) => {
                    rt.ptrType = new typeMetadataSystem.ptrType(rt, elemDesc.runtimeType());
                };
            },
            extendReflection: null
        },
        "Slice": {
            createConstructor: () => {
                let currentNativeArrayConstructor;
                return function(arr) {
                    if (currentNativeArrayConstructor && arr.constructor !== currentNativeArrayConstructor) {
                        arr = new currentNativeArrayConstructor(arr);
                    }
                    this.backingArray = arr;
                    this.offset = 0;
                    this.length = arr.length;
                    this.capacity = arr.length;
                    this.value = this;
                };
            },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: null,
            initSpecifics: (typeObj, elemDesc) => {
                typeObj.elem = elemDesc;
                typeObj.currentNativeArrayConstructor = nativeArrayProvider(elemDesc.kind);
                typeObj.nil = new typeObj([]);
                typeObj.make = (len, cap, zeroFn) => {
                    cap = cap || len;
                    const arr = new typeObj.currentNativeArrayConstructor(cap);
                    for (let i = 0; i < cap; i++) {
                        arr[i] = zeroFn();
                    }
                    const slice = new typeObj(arr);
                    slice.length = len;
                    return slice;
                };
                typeObj.extendReflection = (rt) => {
                    rt.sliceType = new typeMetadataSystem.sliceType(rt, elemDesc.runtimeType());
                };
            },
            extendReflection: null
        },
        "Struct": {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix, fields) => function() {
                const keys = transformListElements(fields, (field) => {
                    const v = this.value[field[0]];
                    const k = v.computeKey ? v.computeKey() : stringConversion(v);
                    return k.replace(/\\/g, "\\\\").replace(/\$/g, "\\$");
                });
                return `${prefix}$${keys.join("$")}`;
            },
            getZeroValue: null,
            initSpecifics: (typeObj, fields, builderFunc, customPtrConstructor, typeFactoriesRef) => {
                typeObj.fields = fields;
                typeObj.PointerType = builderFunc(4, "Ptr", "*" + typeObj.string, "", "", customPtrConstructor);
                typeObj.PointerType.targetType = typeObj;
                typeObj.PointerType.Struct = typeObj;
                typeObj.PointerType.extendReflection = (rt) => {
                    rt.ptrType = new typeMetadataSystem.ptrType(rt, typeObj.runtimeType());
                };
                typeObj.PointerType.nil = Object.create(customPtrConstructor ? customPtrConstructor.prototype : Object.prototype);
                typeObj.PointerType.nil.value = typeObj.PointerType.nil;
                for (const field of fields) {
                    Object.defineProperty(typeObj.PointerType.nil, field[0], { get: nilPointerThrower, set: nilPointerThrower });
                }

                for (const method of typeObj.methods) {
                    if (method[6] != -1) {
                        const field = fields[method[6]];
                        typeObj.prototype[method[0]] = function() {
                            const val = this.value[field[0]];
                            return val[method[0]].apply(val, arguments);
                        };
                    }
                }
                for (const method of typeObj.PointerType.methods) {
                    if (method[6] != -1) {
                        const field = fields[method[6]];
                        typeObj.PointerType.prototype[method[0]] = function() {
                            let val = this[field[0]];
                            if (val && val.value === undefined && field[3] && field[3].prototype && field[3].prototype.constructor) {
                                val = new field[3](val);
                            }
                            return val[method[0]].apply(val, arguments);
                        };
                    }
                }
            },
            extendReflection: (rt, fields, elemDesc, len, keyDesc, elementDesc, fieldsForReflection, typeFactoriesRef) => {
                const reflectFields = transformListElements(fieldsForReflection, (field, i) => {
                    return new typeMetadataSystem.structField(stringPointerCreator(field[1]), stringPointerCreator(field[2]), field[3].runtimeType(), stringPointerCreator(field[4]), i);
                });
                const ptrStructField = typeDefinitionBuilder(null, "Ptr", `*${typeMetadataSystem.structField.name}`, "", "", null);
                const sliceOfPtrStructField = typeFactoriesRef.sliceType(ptrStructField);
                rt.structType = new typeMetadataSystem.structType(rt, new sliceOfPtrStructField(reflectFields));
            }
        }
    };

    const primitiveKinds = ["Int8", "Int16", "Int32", "Uint", "Uint8", "Uint16", "Uint32", "Uintptr"];
    primitiveKinds.forEach(kind => {
        typeKindBlueprints[kind] = {
            createConstructor: () => function(v) { this.value = v; },
            createKeyMethod: (prefix) => function() { return `${prefix}$${this.value}`; },
            getZeroValue: () => 0,
            initSpecifics: null,
            extendReflection: null
        };
    });

    typeDefinitionBuilder = (size, kind, representation, label, packagePath, customConstructor) => {
        const blueprint = typeKindBlueprints[kind];
        if (!blueprint) {
            throw new Error(`Invalid kind: ${kind}`);
        }

        const typeInstance = blueprint.createConstructor(customConstructor);
        typeInstance.prototype.computeKey = blueprint.createKeyMethod(representation, typeInstance.fields);

        typeInstance.kind = kind;
        typeInstance.string = representation;
        typeInstance.typeName = label;
        typeInstance.pkgPath = packagePath;
        typeInstance.methods = [];

        if (blueprint.initSpecifics) {
            blueprint.initSpecifics(typeInstance, typeInstance.elem, typeInstance.len, typeDefinitionBuilder, customConstructor, typeFactories);
        }

        typeInstance.retrieveZeroValue = () => {
            if (kind === "Chan" || kind === "Ptr" || kind === "Slice") {
                return typeInstance.nil;
            } else if (kind === "Array") {
                const arrClass = nativeArrayProvider(typeInstance.elem.kind);
                if (arrClass !== genericListConstructor) {
                    return new arrClass(typeInstance.len);
                }
                const arr = new genericListConstructor(typeInstance.len);
                for (let i = 0; i < typeInstance.len; i++) {
                    arr[i] = typeInstance.elem.retrieveZeroValue();
                }
                return arr;
            } else if (kind === "Struct") {
                return new typeInstance.PointerType();
            } else if (["Int64", "Uint64", "Complex64", "Complex128"].includes(kind)) {
                return new typeInstance(0, 0);
            }
            return blueprint.getZeroValue();
        };


        let runtimeTypeCache = null;
        typeInstance.runtimeType = () => {
            if (runtimeTypeCache === null) {
                runtimeTypeCache = new typeMetadataSystem.rtype(size, 0, 0, 0, 0, typeMetadataSystem.kinds[kind], undefined, undefined, stringPointerCreator(representation));
                runtimeTypeCache.jsType = typeInstance;

                const methodDescriptors = [];
                if (typeInstance.methods !== undefined) {
                    for (const m of typeInstance.methods) {
                        const receiverType = (kind === "Ptr" && typeInstance.targetType) ? typeInstance.targetType : typeInstance;
                        const funcTypeRef = typeFactories.functionType([receiverType].concat(m[3]), m[4], m[5]);
                        methodDescriptors.push(new typeMetadataSystem.method(stringPointerCreator(m[1]), stringPointerCreator(m[2]), funcTypeRef.runtimeType(), funcTypeRef.runtimeType()));
                    }
                }
                if (label !== "" || methodDescriptors.length !== 0) {
                    const ptrMethod = typeDefinitionBuilder(null, "Ptr", `*${typeMetadataSystem.method.name}`, "", "", null);
                    const sliceOfPtrMethod = typeFactories.sliceType(ptrMethod);
                    runtimeTypeCache.uncommonType = new typeMetadataSystem.uncommonType(stringPointerCreator(label), stringPointerCreator(packagePath), new sliceOfPtrMethod(methodDescriptors));
                    runtimeTypeCache.uncommonType.jsType = typeInstance;
                }

                if (blueprint.extendReflection) {
                    blueprint.extendReflection(runtimeTypeCache, typeInstance.elem, typeInstance.len, typeInstance.keyDescriptor, typeInstance.elementDescriptor, typeInstance.fields, typeFactories);
                } else if (typeInstance.extendReflection) {
                    typeInstance.extendReflection(runtimeTypeCache);
                }
            }
            return runtimeTypeCache;
        };
        return typeInstance;
    };

    const BooleanKind = typeDefinitionBuilder(1, "Bool", "bool", "bool", "", null);
    const IntegerKind = typeDefinitionBuilder(4, "Int", "int", "int", "", null);
    const SignedByteKind = typeDefinitionBuilder(1, "Int8", "int8", "int8", "", null);
    const SignedShortKind = typeDefinitionBuilder(2, "Int16", "int16", "int16", "", null);
    const SignedIntegerKind = typeDefinitionBuilder(4, "Int32", "int32", "int32", "", null);
    const LongIntegerKind = typeDefinitionBuilder(8, "Int64", "int64", "int64", "", null);
    const UnsignedIntegerKind = typeDefinitionBuilder(4, "Uint", "uint", "uint", "", null);
    const UnsignedByteKind = typeDefinitionBuilder(1, "Uint8", "uint8", "uint8", "", null);
    const UnsignedShortKind = typeDefinitionBuilder(2, "Uint16", "uint16", "uint16", "", null);
    const UnsignedLongKind = typeDefinitionBuilder(4, "Uint32", "uint32", "uint32", "", null);
    const UnsignedLongLongKind = typeDefinitionBuilder(8, "Uint64", "uint64", "uint64", "", null);
    const PointerSizeUnsignedKind = typeDefinitionBuilder(4, "Uintptr", "uintptr", "uintptr", "", null);
    const SinglePrecisionFloatKind = typeDefinitionBuilder(4, "Float32", "float32", "float32", "", null);
    const DoublePrecisionFloatKind = typeDefinitionBuilder(8, "Float64", "float64", "float64", "", null);
    const ComplexFloat32Kind = typeDefinitionBuilder(8, "Complex64", "complex64", "complex64", "", null);
    const ComplexFloat64Kind = typeDefinitionBuilder(16, "Complex128", "complex128", "complex128", "", null);
    const StringKind = typeDefinitionBuilder(8, "String", "string", "string", "", null);
    const UnsafePointerKind = typeDefinitionBuilder(4, "UnsafePointer", "unsafe.Pointer", "Pointer", "", null);

    const typeFactories = {};

    typeFactories.arrayTypeCache = {};
    typeFactories.arrayType = (elemDescription, length) => {
        const key = `[${length}]${elemDescription.string}`;
        if (!typeFactories.arrayTypeCache[key]) {
            typeFactories.arrayTypeCache[key] = typeDefinitionBuilder(12, "Array", key, "", "", null);
        }
        return typeFactories.arrayTypeCache[key];
    };

    typeFactories.channelTypeCache = {};
    typeFactories.channelType = (elemDescription, sendOnly, recvOnly) => {
        const prefix = (recvOnly ? "<-" : "") + "chan" + (sendOnly ? "<- " : " ");
        const key = prefix + elemDescription.string;
        const fieldName = sendOnly ? "SendChannel" : (recvOnly ? "RecvChannel" : "Channel");
        if (!elemDescription[fieldName]) {
            const newType = typeDefinitionBuilder(4, "Chan", key, "", "", null);
            newType.elem = elemDescription;
            newType.sendOnly = sendOnly;
            newType.recvOnly = recvOnly;
            elemDescription[fieldName] = newType;
        }
        return elemDescription[fieldName];
    };

    const generateFunctionSignature = (parameterDescriptors, resultDescriptors, isVariadic) => {
        const paramStrings = transformListElements(parameterDescriptors, p => p.string);
        if (isVariadic) {
            paramStrings[paramStrings.length - 1] = "..." + paramStrings[paramStrings.length - 1].substring(2);
        }
        let signature = "(" + paramStrings.join(", ") + ")";
        if (resultDescriptors.length === 1) {
            signature += " " + resultDescriptors[0].string;
        } else if (resultDescriptors.length > 1) {
            signature += " (" + transformListElements(resultDescriptors, r => r.string).join(", ") + ")";
        }
        return signature;
    };

    typeFactories.functionTypeCache = {};
    typeFactories.functionType = (parameterDescriptors, resultDescriptors, isVariadic) => {
        const signature = "func" + generateFunctionSignature(parameterDescriptors, resultDescriptors, isVariadic);
        if (!typeFactories.functionTypeCache[signature]) {
            const newType = typeDefinitionBuilder(4, "Func", signature, "", "", null);
            newType.params = parameterDescriptors;
            newType.results = resultDescriptors;
            newType.variadic = isVariadic;
            typeFactories.functionTypeCache[signature] = newType;
        }
        return typeFactories.functionTypeCache[signature];
    };

    typeFactories.interfaceTypeCache = {};
    typeFactories.interfaceType = (methodDefinitions) => {
        let signature = "interface {}";
        if (methodDefinitions.length !== 0) {
            signature = "interface { " + transformListElements(methodDefinitions, (m) => {
                return (m[2] !== "" ? m[2] + "." : "") + m[1] + generateFunctionSignature(m[3], m[4], m[5]);
            }).join("; ") + " }";
        }
        if (!typeFactories.interfaceTypeCache[signature]) {
            const newType = typeDefinitionBuilder(8, "Interface", signature, "", "", null);
            newType.interfaceMethods = methodDefinitions;
            typeFactories.interfaceTypeCache[signature] = newType;
        }
        return typeFactories.interfaceTypeCache[signature];
    };

    typeFactories.emptyInterface = typeFactories.interfaceType([]);

    typeFactories.sliceTypeCache = {};
    typeFactories.sliceType = (elemDesc) => {
        const key = `[]${elemDesc.string}`;
        if (!typeFactories.sliceTypeCache[key]) {
            const sliceType = typeDefinitionBuilder(4, "Slice", key, "", "", null);
            sliceType.elem = elemDesc;
            typeFactories.sliceTypeCache[key] = sliceType;
        }
        return typeFactories.sliceTypeCache[key];
    };

})();