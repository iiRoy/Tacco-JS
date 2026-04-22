// Initial global variables and type array polyfills
// These variables are essential for the Nim runtime environment in JavaScript.
var framePtr = null,
  excHandler = 0,
  lastJSError = null;

// Ensure standard Typed Arrays are available,
// falling back to regular Array if they are undefined.
// This provides compatibility across different JavaScript environments.
"undefined" == typeof Int8Array && (Int8Array = Array);
"undefined" == typeof Int16Array && (Int16Array = Array);
"undefined" == typeof Int32Array && (Int32Array = Array);
"undefined" == typeof Uint8Array && (Uint8Array = Array);
"undefined" == typeof Uint16Array && (Uint16Array = Array);
"undefined" == typeof Uint32Array && (Uint32Array = Array);
"undefined" == typeof Float32Array && (Float32Array = Array);
"undefined" == typeof Float64Array && (Float64Array = Array);


// NIM Type Information (NTI) declarations.
// These objects define the structure and kind of various Nim types
// when transpiled to JavaScript.
var NTI3648 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3650 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI37154 = {
    size: 0,
    kind: 24,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3640 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3644 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3660 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI104 = {
    size: 0,
    kind: 31,
    base: null,
    node: null,
    finalizer: null
  },
  NTI14009 = {
    size: 0,
    kind: 18,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3608 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3711 = {
    size: 0,
    kind: 22,
    base: null,
    node: null,
    finalizer: null
  },
  NTI140 = {
    size: 0,
    kind: 29,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3706 = {
    size: 0,
    kind: 22,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3626 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI3656 = {
    size: 0,
    kind: 17,
    base: null,
    node: null,
    finalizer: null
  },
  NTI138 = {
    size: 0,
    kind: 28,
    base: null,
    node: null,
    finalizer: null
  },
  NTI37199 = {
    size: 0,
    kind: 24,
    base: null,
    node: null,
    finalizer: null
  };

// Set base types for NTI objects
NTI37199.base = NTI138;

// NIM Node Information (NNI) declarations and linkages.
// These define the internal structure (fields, types, offsets) of types.
var NNI3656 = {
  kind: 2,
  len: 0,
  offset: 0,
  typ: null,
  name: null,
  sons: []
};
NTI3656.node = NNI3656;
NTI3706.base = NTI3626;
NTI3711.base = NTI3626;

var NNI3626 = {
  kind: 2,
  len: 5,
  offset: 0,
  typ: null,
  name: null,
  sons: [{
    kind: 1,
    offset: "parent",
    len: 0,
    typ: NTI3706,
    name: "parent",
    sons: null
  }, {
    kind: 1,
    offset: "name",
    len: 0,
    typ: NTI140,
    name: "name",
    sons: null
  }, {
    kind: 1,
    offset: "message",
    len: 0,
    typ: NTI138,
    name: "msg",
    sons: null
  }, {
    kind: 1,
    offset: "trace",
    len: 0,
    typ: NTI138,
    name: "trace",
    sons: null
  }, {
    kind: 1,
    offset: "up",
    len: 0,
    typ: NTI3711,
    name: "up",
    sons: null
  }]
};
NTI3626.node = NNI3626;

var NNI3608 = {
  kind: 2,
  len: 0,
  offset: 0,
  typ: null,
  name: null,
  sons: []
};
NTI3608.node = NNI3608;
NTI3626.base = NTI3608;
NTI3656.base = NTI3626;

var NNI14009 = {
  kind: 2,
  len: 2,
  offset: 0,
  typ: null,
  name: null,
  sons: [{
    kind: 1,
    offset: "Field0",
    len: 0,
    typ: NTI140,
    name: "Field0",
    sons: null
  }, {
    kind: 1,
    offset: "Field1",
    len: 0,
    typ: NTI104,
    name: "Field1",
    sons: null
  }]
};
NTI14009.node = NNI14009;

var NNI3660 = {
  kind: 2,
  len: 0,
  offset: 0,
  typ: null,
  name: null,
  sons: []
};
NTI3660.node = NNI3660;
NTI3660.base = NTI3626;

var NNI3644 = {
  kind: 2,
  len: 0,
  offset: 0,
  typ: null,
  name: null,
  sons: []
};
NNI3644.node = NNI3644;

var NNI3640 = {
  kind: 2,
  len: 0,
  offset: 0,
  typ: null,
  name: null,
  sons: []
};
NTI3640.node = NNI3640;
NTI3640.base = NTI3626;
NTI3644.base = NTI3640;
NTI37154.base = NTI138;

var NNI3650 = {
  kind: 2,
  len: 0,
  offset: 0,
  typ: null,
  name: null,
  sons: []
};
NTI3650.node = NNI3650;
NTI3650.base = NTI3626;

var NNI3648 = {
  kind: 2,
  len: 0,
  offset: 0,
  typ: null,
  name: null,
  sons: []
};


/**
 * Constructs a set-like object from a list of arguments.
 * Arguments can be single numbers or arrays representing ranges [start, end].
 * @param {Array<number|Array<number>>} args - Numbers or ranges to include in the set.
 * @returns {Object<number, boolean>} A plain object where keys are numbers in the set and values are true.
 */
function setConstr() {
  var n = {}; // The set object to be constructed.
  for (var e = 0; e < arguments.length; ++e) {
    var l = arguments[e];
    if ("object" == typeof l) {
      // If argument is an array (range)
      for (var r = l[0]; r <= l[1]; ++r) {
        n[r] = !0;
      }
    } else {
      // If argument is a single number
      n[l] = !0;
    }
  }
  return n;
}

NTI3648.node = NNI3648;
NTI3648.base = NTI3626;

// Predefined constant set, likely for type checking or flags.
var ConstSet1 = setConstr(17, 16, 4, 18, 27, 19, 23, 22, 21);

/**
 * Performs a deep copy of Nim types.
 * Handles various Nim 'kind' types (e.g., records, sequences, strings).
 * @param {any} n - The target object to copy into (can be null/undefined for new creation).
 * @param {any} e - The source object to copy from.
 * @param {Object} l - The NTI (Nim Type Information) object describing the type.
 * @returns {any} The copied object.
 */
function nimCopy(n, e, l) {
  var r = null;
  switch (l.kind) {
    case 21:
    case 22:
    case 23:
    case 5:
      // Handle fat pointers or simple assignments for certain kinds
      r = isFatPointer_20201(l) ? [e[0], e[1]] : e;
      break;

    case 19:
      // Handle 'object' types (like JavaScript objects)
      if (null === n || void 0 === n) {
        n = {};
      } else {
        for (var a in n) {
          delete n[a]; // Clear existing properties
        }
      }
      for (var a in e) {
        n[a] = e[a]; // Copy properties from source
      }
      r = n;
      break;

    case 18:
    case 17:
      // Handle complex record types (objects with defined fields)
      nimCopyAux(
        (r =
          null != l.base ?
          nimCopy(n, e, l.base) :
          17 == l.kind ?
          null === n || void 0 === n ? {
            m_type: l
          } :
          n :
          null === n || void 0 === n ? {} : n),
        e,
        l.node
      );
      break;

    case 24:
    case 4:
    case 27:
    case 16:
      // Handle sequence/array types
      if (null === e) {
        r = null;
      } else {
        null === n || void 0 === n ?
          (n = new Array(e.length)) :
          (n.length = e.length);
        r = n;
        for (var t = 0; t < e.length; ++t) {
          r[t] = nimCopy(r[t], e[t], l.base);
        }
      }
      break;

    case 28:
      // Handle string types (Nim strings are often arrays of chars)
      null !== e && (r = e.slice(0));
      break;

    default:
      // Default: direct assignment for scalar types
      r = e;
  }
  return r;
}

/**
 * Converts a JavaScript string literal to a Nim string literal (array of char codes).
 * Nim strings are null-terminated arrays of character codes.
 * @param {string} n - The input JavaScript string.
 * @returns {Array<number>} A null-terminated array of character codes.
 */
function makeNimstrLit(n) {
  for (var e = n.length, l = new Array(e + 1), r = 0; r < e; ++r) {
    l[r] = n.charCodeAt(r);
  }
  l[r] = 0; // Null terminator
  return l;
}

/**
 * Compares two Nim string literals for equality.
 * @param {Array<number>} n - The first Nim string.
 * @param {Array<number>} e - The second Nim string.
 * @returns {boolean} True if the strings are equal, false otherwise.
 */
function eqStrings(n, e) {
  if (n == e) {
    return !0;
  }
  if (!n || !e) {
    return !1;
  }
  var l = n.length;
  if (l != e.length) {
    return !1;
  }
  for (var r = 0; r < l; ++r) {
    if (n[r] != e[r]) {
      return !1;
    }
  }
  return !0;
}

/**
 * Constructs an array of a specified size, initialized with copies of a default value.
 * @param {number} n - The size of the array.
 * @param {any} e - The default value to copy.
 * @param {Object} l - The NTI object for the element type.
 * @returns {Array<any>} The newly constructed array.
 */
function arrayConstr(n, e, l) {
  for (var r = new Array(n), a = 0; a < n; ++a) {
    r[a] = nimCopy(null, e, l);
  }
  return r;
}

/**
 * Converts a C-style string (JavaScript string) to a Nim string (array of UTF-8 char codes).
 * Handles multi-byte UTF-8 characters.
 * @param {string} n - The input C-style string.
 * @returns {Array<number>} A null-terminated array of UTF-8 character codes.
 */
function cstrToNimstr(n) {
  for (var e = n.length, l = new Array(e), r = 0, a = 0; a < e; ++a) {
    var t = n.charCodeAt(a);
    if (t < 128) {
      l[r] = t;
    } else {
      if (t < 2048) {
        l[r] = (t >> 6) | 192;
      } else {
        if (t < 55296 || t >= 57344) {
          l[r] = (t >> 12) | 224;
        } else {
          // Surrogate pair
          ++a;
          t = 65536 + ((1023 & t) << 10 | 1023 & n.charCodeAt(a));
          l[r] = (t >> 18) | 240;
          l[++r] = (t >> 12) & 63 | 128;
        }
        l[++r] = (t >> 6) & 63 | 128;
      }
      l[++r] = 63 & t | 128;
    }
    ++r;
  }
  l[r] = 0; // Null terminator
  return l;
}

/**
 * Converts a Nim string (array of char codes) to a JavaScript string.
 * Handles UTF-8 decoding and URL-encoding for non-ASCII characters.
 * @param {Array<number>} n - The input Nim string.
 * @returns {string} The resulting JavaScript string.
 */
function toJSStr(n) {
  var e = n.length - 1,
    l = new Array(e),
    r = String.fromCharCode,
    a = null,
    t = 0,
    i = 0;
  for (; i < e; ++i) {
    if (null !== a) {
      var s = 2 * (i - t),
        o = n[i].toString(16);
      1 == o.length && (o = "0" + o);
      a[s] = "%";
      a[s + 1] = o;
    } else {
      if (n[i] < 128) {
        l[i] = r(n[i]);
      } else {
        l.length = i; // Truncate and switch to URL-encoding for remaining
        t = i;
        a = new Array(2 * (e - i));
        --i;
      }
    }
  }
  l = l.join("");
  return null === a ? l : l + decodeURIComponent(a.join(""));
}

/**
 * Raises an exception in the Nim runtime.
 * Sets the exception name, generates a traceback, and potentially calls
 * an unhandled exception handler.
 * @param {Object} n - The exception object.
 * @param {string} e - The name of the exception.
 * @throws {Object} The exception object itself.
 */
function raiseException(n, e) {
  n.name = e;
  if (0 == excHandler) {
    unhandledException(n);
  }
  n.trace = nimCopy(null, rawWriteStackTrace_14228(), NTI138);
  throw n;
}

/**
 * Checks if an index `n` is within the valid range [`e`, `l`].
 * If out of bounds, it raises an IndexError.
 * @param {number} n - The index to check.
 * @param {number} e - The lower bound (inclusive).
 * @param {number} l - The upper bound (inclusive).
 * @returns {number} The valid index `n`.
 */
function chckIndx(n, e, l) {
  var r = 0;
  n: do {
    if (e <= n && n <= l) {
      r = n;
      break n;
    }
    raiseIndexError();
  } while (0);
  return r;
}

/**
 * Checks if a value `n` is within the valid range [`e`, `l`].
 * If out of bounds, it raises a RangeError.
 * @param {number} n - The value to check.
 * @param {number} e - The lower bound (inclusive).
 * @param {number} l - The upper bound (inclusive).
 * @returns {number} The valid value `n`.
 */
function chckRange(n, e, l) {
  var r = 0;
  n: do {
    if (e <= n && n <= l) {
      r = n;
      break n;
    }
    raiseRangeError();
  } while (0);
  return r;
}

/**
 * Adds two integers, checking for overflow.
 * If an overflow occurs, it raises an OverflowError.
 * @param {number} n - The first integer.
 * @param {number} e - The second integer.
 * @returns {number} The sum of the two integers.
 */
function addInt(n, e) {
  var l = n + e;
  if (l > 2147483647 || l < -2147483648) {
    raiseOverflow();
  }
  return l;
}

// More constant sets for character classifications, likely for parsing.
var ConstSet2 = setConstr(32, 9, 11, 13, 10, 12),
  ConstSet3 = setConstr([48, 57]),
  ConstSet4 = setConstr([48, 57]);

/**
 * Subtracts two integers, checking for overflow.
 * If an overflow occurs, it raises an OverflowError.
 * @param {number} n - The minuend.
 * @param {number} e - The subtrahend.
 * @returns {number} The difference.
 */
function subInt(n, e) {
  var l = n - e;
  if (l > 2147483647 || l < -2147483648) {
    raiseOverflow();
  }
  return l;
}

/**
 * Multiplies two integers, checking for overflow.
 * If an overflow occurs, it raises an OverflowError.
 * @param {number} n - The first integer.
 * @param {number} e - The second integer.
 * @returns {number} The product.
 */
function mulInt(n, e) {
  var l = n * e;
  if (l > 2147483647 || l < -2147483648) {
    raiseOverflow();
  }
  return l;
}

/**
 * Prints arguments to the console, converting them to JavaScript strings first.
 * Similar to a basic `echo` or `print` function.
 */
function rawEcho() {
  for (var n = "", e = 0; e < arguments.length; ++e) {
    n += toJSStr(arguments[e]);
  }
  console.log(n);
}

// Runtime flags and hooks.
var nimvm_6539 = !1;
process.exitCode = 0; // Standard exit code for success.
var globalRaiseHook_12005 = [null],
  localRaiseHook_12010 = [null],
  outOfMemHook_12013 = [null];

/**
 * Checks if a Nim type (represented by its NTI object) is a "fat pointer".
 * Fat pointers are Nim's way of representing slices or open arrays,
 * containing both a pointer and a length.
 * @param {Object} n - The NTI object of the type.
 * @returns {boolean} True if it's a fat pointer, false otherwise.
 */
function isFatPointer_20201(n) {
  var e = !1;
  n: do {
    e = !(void 0 != ConstSet1[n.base.kind]);
    break n;
  } while (0);
  return e;
}

/**
 * Auxiliary function for `nimCopy`, handling recursive copying based on NNI structure.
 * This function traverses the `node` (NNI) structure of a type to copy its fields.
 * @param {Object} n - The target object.
 * @param {Object} e - The source object.
 * @param {Object} l - The NNI object describing the current type's structure.
 */
function nimCopyAux(n, e, l) {
  switch (l.kind) {
    case 0:
      // Empty kind, do nothing.
      break;

    case 1:
      // Simple field: copy directly using its type.
      n[l.offset] = nimCopy(n[l.offset], e[l.offset], l.typ);
      break;

    case 2:
      // Object with multiple fields (record-like structure).
      var r, a = 0;
      r = l.len - 1;
      var t = 0;
      n: for (; t <= r;) {
        a = t;
        nimCopyAux(n, e, l.sons[a]); // Recursively copy sub-fields.
        t += 1;
      }
      break;

    case 3:
      // Object with a field and additional children (e.g., base type with extensions).
      n[l.offset] = nimCopy(n[l.offset], e[l.offset], l.typ);
      for (var i = 0; i < l.sons.length; ++i) {
        nimCopyAux(n, e, l.sons[i][1]); // Copy additional structures.
      }
      break;
  }
}

/**
 * Splits a Nim string `n` by a single character delimiter `e`.
 * Returns an array of Nim strings.
 * `l` specifies the maximum number of splits (or -1 for all).
 * @param {Array<number>} n - The Nim string to split.
 * @param {number} e - The character code of the delimiter.
 * @param {number} l - The maximum number of splits, or -1 for unlimited.
 * @returns {Array<Array<number>>} An array of Nim strings (char code arrays).
 */
function nsuSplitChar(n, e, l) {
  var r = null;
  r = nimCopy(null, [], NTI37199); // Initialize result as a Nim sequence of strings.
  var a = 0,
    t = l;

  n: do {
    e: for (; a <= (null != n ? n.length - 1 : 0);) {
      var i = a;
      l: for (; a < (null != n ? n.length - 1 : 0) && n[a] != e;) {
        a += 1;
      }
      0 == t && (a = null != n ? n.length - 1 : 0); // If max splits reached, take rest of string.
      var s = nimCopy(null, n.slice(i, a - 1 + 1).concat(0), NTI138); // Slice and null-terminate.
      if (null != r ? r.push(s) : (r = [s]), 0 == t) {
        // If max splits reached, break.
        break n;
      }
      t -= 1;
      a += 1;
    }
  } while (0);

  return r;
}

/**
 * Appends a C-style string `l` to a Nim string `n` (which is in `n[0]`).
 * Modifies the Nim string in place.
 * @param {Array<Array<number>>} n - An array containing the Nim string at index 0.
 * @param {number} e - Unused parameter.
 * @param {string} l - The C-style string to append.
 */
function add_12029(n, e, l) {
  for (var r = n[0].length - 1, a = 0; a < l.length; ++a) {
    n[0][r] = l.charCodeAt(a);
    ++r;
  }
  n[0][r] = 0; // Null-terminate the new end.
}

/**
 * Generates an auxiliary stack trace string from a Nim stack frame.
 * Formats the procedure names and line numbers.
 * @param {Object} n - The current Nim stack frame object.
 * @returns {Array<number>} A Nim string (array of char codes) representing the stack trace fragment.
 */
function auxWriteStackTrace_14004(n) {
  var e = [null],
    l = n,
    r = 0,
    a = 0,
    t = arrayConstr(64, {
      Field0: null,
      Field1: 0
    }, NTI14009); // Array to store frame info.

  n: for (; null != l && r <= 63;) {
    t[r].Field0 = l.procname;
    t[r].Field1 = l.line;
    r += 1;
    a += 1;
    l = l.prev; // Move to previous frame.
  }

  n: for (; null != l;) {
    // Count remaining frames if more than 64.
    a += 1;
    l = l.prev;
  }

  e[0] = nimCopy(null, makeNimstrLit(""), NTI138); // Initialize empty Nim string.

  if (a != r) {
    // If frames were omitted
    null != e[0] ?
      (e[0] = e[0].slice(0, -1).concat(makeNimstrLit("("))) :
      (e[0] = makeNimstrLit("("));
    null != e[0] ?
      (e[0] = e[0].slice(0, -1).concat(cstrToNimstr(a - r + ""))) :
      (e[0] = cstrToNimstr(a - r + ""));
    null != e[0] ?
      (e[0] = e[0].slice(0, -1).concat(makeNimstrLit(" calls omitted) ...\n"))) :
      (e[0] = makeNimstrLit(" calls omitted) ...\n"));
  }

  var i = 0,
    s = r - 1;
  n: for (; 0 <= s;) {
    // Iterate through collected frames in reverse order.
    add_12029(e, 0, t[(i = s)].Field0); // Add procedure name.
    if (0 < t[i].Field1) {
      // If line number exists
      null != e[0] ?
        (e[0] = e[0].slice(0, -1).concat(makeNimstrLit(", line: "))) :
        (e[0] = makeNimstrLit(", line: "));
      null != e[0] ?
        (e[0] = e[0].slice(0, -1).concat(cstrToNimstr(t[i].Field1 + ""))) :
        (e[0] = cstrToNimstr(t[i].Field1 + ""));
    }
    null != e[0] ?
      (e[0] = e[0].slice(0, -1).concat(makeNimstrLit("\n"))) :
      (e[0] = makeNimstrLit("\n"));
    s -= 1;
  }
  return e[0];
}

/**
 * Generates the full raw stack trace Nim string.
 * @returns {Array<number>} A Nim string (array of char codes) of the complete stack trace.
 */
function rawWriteStackTrace_14228() {
  return nimCopy(
    null,
    null != framePtr ?
    makeNimstrLit("Traceback (most recent call last)\n")
    .slice(0, -1)
    .concat(auxWriteStackTrace_14004(framePtr)) :
    makeNimstrLit("No stack traceback available\n"),
    NTI138
  );
}

/**
 * Handles an unhandled exception by formatting an error message
 * and then throwing a JavaScript Error object or string.
 * This is the final catch-all for Nim exceptions.
 * @param {Object} n - The Nim exception object.
 * @throws {Error|string} A JavaScript Error object or string representation of the exception.
 */
function unhandledException(n) {
  var e = [makeNimstrLit("")]; // Initialize empty Nim string for message.

  if (!eqStrings(n.message, null) && !(0 == n.message[0])) {
    // If exception has a message
    null != e[0] ?
      (e[0] = e[0].slice(0, -1).concat(makeNimstrLit("Error: unhandled exception: "))) :
      (e[0] = makeNimstrLit("Error: unhandled exception: "));
    null != e[0] ?
      (e[0] = e[0].slice(0, -1).concat(n.message)) :
      (e[0] = n.message);
  } else {
    // Generic unhandled exception message
    null != e[0] ?
      (e[0] = e[0].slice(0, -1).concat(makeNimstrLit("Error: unhandled exception"))) :
      (e[0] = makeNimstrLit("Error: unhandled exception"));
  }

  // Add exception name and stack trace
  null != e[0] ?
    (e[0] = e[0].slice(0, -1).concat(makeNimstrLit(" ["))) :
    (e[0] = makeNimstrLit(" ["));
  add_12029(e, 0, n.name);
  null != e[0] ?
    (e[0] = e[0].slice(0, -1).concat(makeNimstrLit("]\n"))) :
    (e[0] = makeNimstrLit("]\n"));
  null != e[0] ?
    (e[0] = e[0].slice(0, -1).concat(rawWriteStackTrace_14228())) :
    (e[0] = rawWriteStackTrace_14228());

  var l = toJSStr(e[0]); // Convert Nim string to JS string.
  framePtr = null; // Clear stack trace.
  throw "undefined" != typeof Error ? new Error(l) : l; // Throw JS Error or string.
}

/**
 * Raises a Nim IndexError exception.
 * @throws {Object} An IndexError Nim exception object.
 */
function raiseIndexError() {
  var n = null;
  (n = {
    m_type: NTI3656,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  }).message = nimCopy(null, makeNimstrLit("index out of bounds"), NTI138);
  n.parent = null;
  raiseException(n, "IndexError");
}

/**
 * Raises a Nim RangeError exception.
 * @throws {Object} A RangeError Nim exception object.
 */
function raiseRangeError() {
  var n = null;
  (n = {
    m_type: NTI3660,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  }).message = nimCopy(null, makeNimstrLit("value out of range"), NTI138);
  n.parent = null;
  raiseException(n, "RangeError");
}

/**
 * Raises a Nim OverflowError exception.
 * @throws {Object} An OverflowError Nim exception object.
 */
function raiseOverflow() {
  var n = null;
  (n = {
    m_type: NTI3644,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  }).message = nimCopy(null, makeNimstrLit("over- or underflow"), NTI138);
  n.parent = null;
  raiseException(n, "OverflowError");
}

/**
 * Implements a `map` function similar to Array.prototype.map.
 * Applies a function `e` to each element of a Nim sequence `n`.
 * @param {Array<any>} n - The input Nim sequence (array).
 * @param {Function} e - The mapping function.
 * @returns {Array<any>} A new Nim sequence with the results of applying `e`.
 */
function map_53210(n, e) {
  var l = null,
    r = {
      procname: "map.map",
      prev: framePtr,
      filename: "lib/pure/collections/sequtils.nim",
      line: 0
    };
  framePtr = r;
  r.line = 217;
  l = new Array(chckRange(null != n ? n.length : 0, 0, 2147483647));
  for (var a = 0; a < chckRange(null != n ? n.length : 0, 0, 2147483647); ++a) {
    l[a] = 0;
  }
  r.line = 218;
  var t = 0;
  r.line = 3518;
  var i;
  r.line = 218;
  i = null != n ? n.length : 0;
  r.line = 3519;
  var s = 0;
  r.line = 3520;
  n: for (; s < i;) {
    r.line = 3521;
    t = s;
    r.line = 219;
    l[chckIndx(t, 0, l.length + 0 - 1) - 0] = e(n[chckIndx(t, 0, n.length + 0 - 1) - 0]);
    r.line = 3522;
    s = addInt(s, 1);
  }
  framePtr = r.prev;
  return l;
}

/**
 * Splits a Nim string `n` using a set of delimiter characters `e`.
 * Returns an array of Nim strings.
 * `l` specifies the maximum number of splits (or -1 for all).
 * @param {Array<number>} n - The Nim string to split.
 * @param {Object<number, boolean>} e - A set of character codes that act as delimiters.
 * @param {number} l - The maximum number of splits, or -1 for unlimited.
 * @returns {Array<Array<number>>} An array of Nim strings (char code arrays).
 */
function nsuSplitCharSet(n, e, l) {
  var r = null;
  r = nimCopy(null, [], NTI37154); // Initialize result as a Nim sequence of strings.
  var a = 0,
    t = l;

  n: do {
    e: for (; a <= (null != n ? n.length - 1 : 0);) {
      var i = a;
      l: for (; a < (null != n ? n.length - 1 : 0) && void 0 == e[n[a]];) {
        a += 1;
      }
      0 == t && (a = null != n ? n.length - 1 : 0); // If max splits reached, take rest of string.
      var s = nimCopy(null, n.slice(i, a - 1 + 1).concat(0), NTI138); // Slice and null-terminate.
      if (null != r ? r.push(s) : (r = [s]), 0 == t) {
        // If max splits reached, break.
        break n;
      }
      t -= 1;
      a += 1;
    }
  } while (0);

  return r;
}

/**
 * Parses an integer from a Nim string `n` starting at index `r`.
 * Handles optional sign and digits.
 * @param {Array<number>} n - The Nim string containing the integer.
 * @param {Array<number>} e - A single-element array to store the parsed integer.
 * @param {number} l - Unused parameter (likely an offset within `e`).
 * @param {number} r - The starting index in `n` to begin parsing.
 * @returns {number} The number of characters consumed by the parsing.
 */
function rawParseInt_27995(n, e, l, r) {
  var a = 0,
    t = {
      procname: "parseutils.rawParseInt",
      prev: framePtr,
      filename: "lib/pure/parseutils.nim",
      line: 0
    };
  framePtr = t;
  t.line = 232;
  var i = -1; // Sign multiplier: -1 for positive, 1 for negative.
  t.line = 233;
  var s = r; // Current parsing position.

  // Check for optional sign.
  if (43 == n[chckIndx(s, 0, n.length + 0 - 1) - 0] ?
    (t.line = 234, s = addInt(s, 1)) :
    45 == n[chckIndx(s, 0, n.length + 0 - 1) - 0] &&
    (t.line = 236, s = addInt(s, 1), t.line = 237, i = 1), // If negative, set sign multiplier to 1.
    void 0 != ConstSet3[n[chckIndx(s, 0, n.length + 0 - 1) - 0]])
  ) {
    // If the current character is a digit.
    t.line = 239;
    e[l] = 0; // Initialize parsed value.
    t.line = 240;
    n: for (; void 0 != ConstSet4[n[chckIndx(s, 0, n.length + 0 - 1) - 0]];) {
      // Loop while digits are found.
      t.line = 241;
      e[l] = subInt(
        mulInt(e[l], 10),
        subInt(n[chckIndx(s, 0, n.length + 0 - 1) - 0], 48)
      ); // Accumulate value.
      t.line = 242;
      s = addInt(s, 1);
      t.line = 243;
      e: for (; 95 == n[chckIndx(s, 0, n.length + 0 - 1) - 0];) {
        // Skip underscores (digit separators).
        t.line = 243;
        s = addInt(s, 1);
      }
    }
    t.line = 244;
    e[l] = mulInt(e[l], i); // Apply sign.
    t.line = 245;
    a = subInt(s, r); // Calculate characters consumed.
  }
  framePtr = t.prev;
  return a;
}

/**
 * Parses the "biggest" possible integer from a Nim string.
 * This is an intermediate step for `npuParseInt`.
 * @param {Array<number>} n - The Nim string.
 * @param {Array<number>} e - A single-element array to store the parsed integer.
 * @param {number} l - Unused parameter.
 * @param {number} r - Starting index for parsing.
 * @returns {number} The number of characters consumed.
 */
function npuParseBiggestInt(n, e, l, r) {
  var a,
    t = {
      procname: "parseutils.parseBiggestInt",
      prev: framePtr,
      filename: "lib/pure/parseutils.nim",
      line: 0
    };
  framePtr = t;
  t.line = 253;
  var i = [0]; // Temporary storage for rawParseInt.
  t.line = 256;
  a = rawParseInt_27995(n, i, 0, r);
  t.line = 257;
  e[l] = i[0]; // Copy parsed value to output.
  framePtr = t.prev;
  return a;
}

/**
 * Parses an integer from a Nim string `n`, checking for 32-bit integer overflow.
 * @param {Array<number>} n - The Nim string.
 * @param {Array<number>} e - A single-element array to store the parsed 32-bit integer.
 * @param {number} l - Unused parameter.
 * @param {number} r - Starting index for parsing.
 * @returns {number} The number of characters consumed.
 * @throws {Object} An OverflowError if the parsed integer is outside 32-bit signed range.
 */
function npuParseInt(n, e, l, r) {
  var a,
    t = {
      procname: "parseutils.parseInt",
      prev: framePtr,
      filename: "lib/pure/parseutils.nim",
      line: 0
    };
  framePtr = t;
  t.line = 264;
  var i = [0]; // Temporary storage for biggest integer.
  t.line = 265;
  a = npuParseBiggestInt(n, i, 0, r);

  // Check for 32-bit integer range.
  if (i[0] < -2147483648 || 2147483647 < i[0]) {
    t.line = 268;
    t.line = 2810;
    var s = null;
    t.line = 2811;
    s = {
      m_type: NTI3644,
      parent: null,
      name: null,
      message: null,
      trace: null,
      up: null
    }; // Create OverflowError object.
    t.line = 2812;
    s.message = nimCopy(null, makeNimstrLit("overflow"), NTI138);
    t.line = 2813;
    s.parent = null;
    raiseException(s, "OverflowError");
  } else {
    if (0 != a) {
      // If parsing was successful and within range.
      t.line = 270;
      e[l] = chckRange(i[0], -2147483648, 2147483647); // Store and range-check.
    }
  }
  framePtr = t.prev;
  return a;
}

/**
 * Parses an integer from a Nim string `n`.
 * This is a high-level wrapper that ensures the entire string is consumed
 * and throws a ValueError if parsing fails or is incomplete.
 * @param {Array<number>} n - The Nim string to parse.
 * @returns {number} The parsed integer value.
 * @throws {Object} A ValueError if the string is not a valid integer.
 */
function nsuParseInt(n) {
  var e = [0],
    l = npuParseInt(n, e, 0, 0); // Attempt to parse the integer.

  if (l != (null != n ? n.length - 1 : 0) || 0 == l) {
    // If not all characters were consumed or no characters were parsed.
    var r = null;
    (r = {
      m_type: NTI3650,
      parent: null,
      name: null,
      message: null,
      trace: null,
      up: null
    }).message = nimCopy(
      null,
      makeNimstrLit("invalid integer: ").slice(0, -1).concat(n),
      NTI138
    ); // Create ValueError.
    r.parent = null;
    raiseException(r, "ValueError");
  }
  return e[0];
}

/**
 * Raises a fatal system error (AssertionError).
 * This is usually called when a critical internal invariant is violated.
 * @param {Array<number>} n - The Nim string message for the assertion.
 * @throws {Object} An AssertionError Nim exception object.
 */
function sysFatal_23221(n) {
  var e = {
    procname: "sysFatal.sysFatal",
    prev: framePtr,
    filename: "lib/system.nim",
    line: 0
  };
  framePtr = e;
  e.line = 2830;
  var l = null;
  e.line = 2831;
  l = {
    m_type: NTI3648,
    parent: null,
    name: null,
    message: null,
    trace: null,
    up: null
  }; // Create AssertionError object.
  e.line = 2832;
  l.message = nimCopy(null, n, NTI138);
  e.line = 2833;
  raiseException(l, "AssertionError");
  framePtr = e.prev;
}

/**
 * Wrapper function to raise an assertion error.
 * @param {Array<number>} n - The Nim string message for the assertion.
 * @throws {Object} An AssertionError Nim exception object.
 */
function raiseAssert_23216(n) {
  var e = {
    procname: "system.raiseAssert",
    prev: framePtr,
    filename: "lib/system.nim",
    line: 0
  };
  framePtr = e;
  e.line = 3771;
  sysFatal_23221(n);
  framePtr = e.prev;
}

/**
 * Implements the logic for a failed assertion.
 * @param {Array<number>} n - The Nim string message for the failed assertion.
 * @throws {Object} An AssertionError Nim exception object.
 */
function failedAssertImpl_23239(n) {
  var e = {
    procname: "system.failedAssertImpl",
    prev: framePtr,
    filename: "lib/system.nim",
    line: 0
  };
  framePtr = e;
  e.line = 3778;
  raiseAssert_23216(n);
  framePtr = e.prev;
}

/**
 * The main entry point function for the Nim program.
 * It processes input lines, parses integers, performs an addition, and outputs the result.
 * @param {Array<number>} n - A Nim string representing the entire input.
 */
function main_53001(n) {
  var e = {
    procname: "aoj.main",
    prev: framePtr,
    filename: "aoj.nim",
    line: 0
  };
  framePtr = e;
  e.line = 6;
  var l = nsuSplitChar(n, 10, -1); // Split input by newline character.
  e.line = 7;
  var r = null;
  e.line = 3805;
  var a = 0;
  e.line = 3806;
  var t = null != l ? l.length : 0; // Length of the input lines array.
  e.line = 3807;

  n: for (; a < t;) {
    e.line = 3808;
    r = l[chckIndx(a, 0, l.length + 0 - 1) - 0]; // Get current line.
    e.line = 9;
    var i = map_53210(nsuSplitCharSet(r, ConstSet2, -1), nsuParseInt); // Split line by whitespace and parse integers.
    e.line = 10;
    var s = i[chckIndx(0, 0, i.length + 0 - 1) - 0]; // First integer.
    e.line = 11;
    var o = i[chckIndx(1, 0, i.length + 0 - 1) - 0]; // Second integer.
    e.line = 12;
    rawEcho(cstrToNimstr(addInt(s, o) + "")); // Add integers and print.
    e.line = 3809;
    a = addInt(a, 1); // Increment loop counter.

    if ((null != l ? l.length : 0) != t) {
      // Check for sequence modification during iteration (assertion).
      e.line = 3810;
      failedAssertImpl_23239(
        makeNimstrLit("len(a) == L seq modified while iterating over it")
      );
    }
  }
  framePtr = e.prev;
}

// Immediately Invoked Function Expression (IIFE) for handling standard input/output.
// This sets up event listeners to read lines from stdin and process them.
! function() {
  "use strict";

  var n = []; // Array to store input lines.

  // Create a readline interface to handle input line by line.
  require("readline")
    .createInterface({
      input: process.stdin,
      output: process.stdout
    })
    .on("line", function(e) {
      // Event listener for each new line received.
      n.push(e); // Add line to the array.
    });

  // Event listener for when stdin stream ends.
  process.stdin.on("end", function() {
    // Join all collected lines with newlines and call the main function.
    main_53001(makeNimstrLit(n.join("\n")));
  });
}(); // Execute the IIFE.