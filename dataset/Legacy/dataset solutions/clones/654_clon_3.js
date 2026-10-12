var callStackPtr = null,
    exceptionHandlerCount = 0,
    lastJsErrorObj = null;

// Polyfills for Typed Arrays if not defined
function ensureTypedArray(typeName, constructor) {
    if (typeof globalThis[typeName] === "undefined") {
        globalThis[typeName] = constructor;
    }
}
ensureTypedArray("Int8Array", Array);
ensureTypedArray("Int16Array", Array);
ensureTypedArray("Int32Array", Array);
ensureTypedArray("Uint8Array", Array);
ensureTypedArray("Uint16Array", Array);
ensureTypedArray("Uint32Array", Array);
ensureTypedArray("Float32Array", Array);
ensureTypedArray("Float64Array", Array);

// Helper for Nim Type Information (NTI) objects
function createNimTypeInfo(kind, base = null, node = null, finalizer = null) {
    return { size: 0, kind: kind, base: base, node: node, finalizer: finalizer };
}

// Helper for Nim Node Information (NNI) objects
function createNimNodeInfo(kind, len, sons = []) {
    return { kind: kind, len: len, offset: 0, typ: null, name: null, sons: sons };
}

// Nim Type Information declarations
var nimTypeInfo3648 = createNimTypeInfo(17);
var nimTypeInfo3650 = createNimTypeInfo(17);
var nimTypeInfo37154 = createNimTypeInfo(24);
var nimTypeInfo3640 = createNimTypeInfo(17);
var nimTypeInfo3644 = createNimTypeInfo(17);
var nimTypeInfo3660 = createNimTypeInfo(17);
var nimTypeInfo104 = createNimTypeInfo(31);
var nimTypeInfo14009 = createNimTypeInfo(18);
var nimTypeInfo3608 = createNimTypeInfo(17);
var nimTypeInfo3711 = createNimTypeInfo(22);
var nimTypeInfo140 = createNimTypeInfo(29);
var nimTypeInfo3706 = createNimTypeInfo(22);
var nimTypeInfo3626 = createNimTypeInfo(17);
var nimTypeInfo3656 = createNimTypeInfo(17);
var nimTypeInfo138 = createNimTypeInfo(28);
var nimTypeInfo37199 = createNimTypeInfo(24, nimTypeInfo138); // Base set here

// Nim Node Information declarations and assignments
nimTypeInfo3656.node = createNimNodeInfo(2, 0);

nimTypeInfo3706.base = nimTypeInfo3626;
nimTypeInfo3711
