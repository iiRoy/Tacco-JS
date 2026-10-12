'use strict';
// Global environment setup for Scala.js runtime
var runtimeGlobal,
  jsEnvInfo = "object" === typeof __ScalaJSEnv && __ScalaJSEnv ? __ScalaJSEnv : {},
  // Reference to the global object (window in browser, global in Node.js, or this)
  globalScope = "object" === typeof jsEnvInfo.global && jsEnvInfo.global ? jsEnvInfo.global : "object" === typeof global && global && global.Object === Object ? global : this;
jsEnvInfo.global = globalScope;
// Expose the Scala.js namespace if 'exports' is available (e.g., Node.js)
jsEnvInfo.exportsNamespace = exports;
// Freeze the essential environment info for immutability
globalScope.Object.freeze(jsEnvInfo);

// Scala.js runtime configuration
var sjsConfig = {
  envInfo: jsEnvInfo,
  semantics: {
    asInstanceOfs: 2,
    arrayIndexOutOfBounds: 2,
    moduleInit: 2,
    strictFloats: !1,
    productionMode: !0
  },
  assumingES6: !1,
  linkerVersion: "0.6.29",
  globalThis: this
};
// Freeze the configuration objects for immutability
globalScope.Object.freeze(sjsConfig);
globalScope.Object.freeze(sjsConfig.semantics);

// Mathematical utility functions (polyfills for Math methods)
var mathMultiply = globalScope.Math.imul || function(valA, valB) {
    var lowA = valA & 65535,
      lowB = valB & 65535;
    return lowA * lowB + ((valA >>> 16 & 65535) * lowB + lowA * (valB >>> 16 & 65535) << 16 >>> 0) | 0;
  },
  mathFround = globalScope.Math.fround || function(valA) {
    return +valA;
  },
  countLeadingZeros32 = globalScope.Math.clz32 || function(valA) {
    if (0 === valA) return 32;
    var count = 1;
    0 === (valA & 4294901760) && (valA <<= 16, count += 16);
    0 === (valA & 4278190080) && (valA <<= 8, count += 8);
    0 === (valA & 4026531840) && (valA <<= 4, count += 4);
    0 === (valA & 3221225472) && (valA <<= 2, count += 2);
    return count + (valA >> 31);
  },
  nextHashId = 0, // Counter for unique hash codes
  objectIdentityMap = globalScope.WeakMap ? new globalScope.WeakMap : null; // WeakMap for object identity hashing

// Function to create an instance checker for a given class ID
function createInstanceChecker(classId) {
  return function(obj, targetClassId) {
    return !(!obj || !obj.$classData || obj.$classData.ih !== targetClassId || obj.$classData.hh !== classId);
  };
}

// Helper to get the first key of an object (used for class data lookup)
function getFirstKey(obj) {
  for (var key in obj) return key;
}

// Creates a JavaScript array with a given initial element (used for Scala arrays)
function createJsArray(clazzData, initialElement) {
  return new clazzData.Ik(initialElement);
}

// Creates a multi-dimensional Scala array
function createScalaArray(classDataRef, dimensions) {
  return populateScalaArray(classDataRef, dimensions, 0);
}

// Recursively populates a multi-dimensional Scala array
function populateScalaArray(classDataRef, dimensions, currentDimIndex) {
  var newArray = new classDataRef.Ik(dimensions[currentDimIndex]);
  if (currentDimIndex < dimensions.length - 1) {
    classDataRef = classDataRef.Xh;
    currentDimIndex += 1;
    for (var i = 0; i < newArray.b.length; i++) newArray.b[i] = populateScalaArray(classDataRef, dimensions, currentDimIndex);
  }
  return newArray;
}

// Safely converts a value to string, handling undefined
function safeToString(value) {
  return void 0 === value ? "undefined" : value.toString();
}

// Determines the Scala type of a given JavaScript value
function getScalaType(value) {
  switch (typeof value) {
    case "string":
      return getClassDataWrapper(StringPrimitiveType);
    case "number":
      var intValue = value | 0;
      return intValue === value ? isBytePrimitiveType(intValue) ? getClassDataWrapper(BytePrimitiveType) : isShortPrimitiveType(intValue) ? getClassDataWrapper(ShortPrimitiveType) : getClassDataWrapper(IntPrimitiveType) : isFloatPrimitiveType(value) ? getClassDataWrapper(FloatPrimitiveType) : getClassDataWrapper(DoublePrimitiveType);
    case "boolean":
      return getClassDataWrapper(BooleanClassData);
    case "undefined":
      return getClassDataWrapper(BoxedUnitObject);
    default:
      return null === value ? value.getHashCode() : value instanceof RuntimeLong ? getClassDataWrapper(LongPrimitiveType) : value && value.$classData ? getClassDataWrapper(value.$classData) : null;
  }
}

// Compares two values for equality, handling different primitive types and Scala objects
function areEqualUntyped(valA, valB) {
  return valA && valA.$classData || null === valA ? valA.t(valB) : "number" === typeof valA ? "number" === typeof valB && (valA === valB ? 0 !== valA || 1 / valA === 1 / valB : valA !== valA && valB !== valB) : valA === valB;
}

// Computes the hash code for a given value
function computeHashCode(value) {
  switch (typeof value) {
    case "string":
      return stringHashCode(getRegexPatternCompanionObject(), value);
    case "number":
      return longToDoubleConverter(getDoubleCompanionObject(), value);
    case "boolean":
      return value ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      return value && value.$classData || null === value ? value.z() : null === objectIdentityMap ? 42 : getOrAssignHashCode(value);
  }
}

// Ensures a number is within the 32-bit integer range
function toIntChecked(value) {
  return 2147483647 < value ? 2147483647 : -2147483648 > value ? -2147483648 : value | 0;
}

// Copies a slice of an array to another array
function copyArrayElements(sourceArray, sourcePos, destArray, destPos, length) {
  sourceArray = sourceArray.b;
  destArray = destArray.b;
  if (sourceArray !== destArray || destPos < sourcePos || (sourcePos + length | 0) < destPos) {
    for (var i = 0; i < length; i = i + 1 | 0) destArray[destPos + i | 0] = sourceArray[sourcePos + i | 0];
  } else {
    for (i = length - 1 | 0; 0 <= i; i = i - 1 | 0) destArray[destPos + i | 0] = sourceArray[sourcePos + i | 0];
  }
}

// Gets or assigns a unique identity hash code to an object
var getOrAssignHashCode = null !== objectIdentityMap ? function(obj) {
  switch (typeof obj) {
    case "string":
    case "number":
    case "boolean":
    case "undefined":
      return computeHashCode(obj);
    default:
      if (null === obj) return 0;
      var hash = objectIdentityMap.get(obj);
      if (void 0 === hash) {
        nextHashId = hash = nextHashId + 1 | 0;
        objectIdentityMap.set(obj, hash);
      }
      return hash;
  }
} : function(obj) {
  if (obj && obj.$classData) {
    var existingHash = obj.$idHashCode$0;
    if (void 0 !== existingHash) return existingHash;
    // If the object is sealed, it can't have properties added, so return a default hash
    if (globalScope.Object.isSealed(obj)) return 42;
    nextHashId = existingHash = nextHashId + 1 | 0;
    return obj.$idHashCode$0 = existingHash;
  }
  return null === obj ? 0 : computeHashCode(obj);
};

// Checks if a number is a valid 8-bit signed integer
function isBytePrimitiveType(value) {
  return "number" === typeof value && value << 24 >> 24 === value && 1 / value !== 1 / -0;
}

// Checks if a number is a valid 16-bit signed integer
function isShortPrimitiveType(value) {
  return "number" === typeof value && value << 16 >> 16 === value && 1 / value !== 1 / -0;
}

// Checks if a number is a valid 32-bit signed integer
function isIntPrimitiveType(value) {
  return "number" === typeof value && (value | 0) === value && 1 / value !== 1 / -0;
}

// Checks if a number is a float (any number that isn't a precise integer)
function isFloatPrimitiveType(value) {
  return "number" === typeof value;
}

// Converts a Long object to its internal representation (or null sentinel)
function toLongRef(value) {
  return null === value ? getRuntimeLong().mg : value;
}

// Base class data structure for all Scala.js classes
function ScalaClassData() {
  this.Ij = this.Ik = void 0;
  this.hh = this.Xh = this.qa = null;
  this.ih = 0;
  this.Ol = null;
  this.bj = "";
  this.Od = this.$i = this.aj = void 0;
  this.name = "";
  this.isRawJSType = this.isArrayClass = this.isInterface = this.isPrimitive = !1;
  this.isInstance = void 0;
}

// Creates class data for primitive types
function createPrimitiveClassData(value, signature, className) {
  var classData = new ScalaClassData();
  classData.qa = {};
  classData.Xh = null;