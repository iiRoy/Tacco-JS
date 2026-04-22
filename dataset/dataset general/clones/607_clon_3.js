let runtimeContext; // Renamed 'Module' to 'runtimeContext' for broader scope

// Attempt to initialize runtimeContext, defaulting to an empty object if 'Module' is not defined
try {
  // Original: this["Module"] = Module;
  // Check if a global 'Module' object already exists. If so, use it.
  if (typeof Module !== 'undefined' && Module !== null) {
    runtimeContext = Module;
  } else {
    // If 'Module' is not globally available, initialize it as a new object.
    runtimeContext = {};
  }
} catch (initializationError) {
  // If accessing 'Module' throws an error (e.g., ReferenceError if not declared),
  // ensure runtimeContext is an empty object.
  runtimeContext = {};
  // Optionally, log the error for debugging purposes, but not essential for functionality.
  // console.warn("Failed to initialize runtimeContext from global Module, creating new one:", initializationError.message);
}

// Assign the resolved runtimeContext back to the global 'Module' property for external access.
// This also ensures 'Module' is defined globally if it wasn't.
this["Module"] = runtimeContext;

// --- Runtime Environment Detection ---
// Renamed variables and reordered some checks for variety.
const isNodeEnvironment = typeof process === "object" && process !== null && typeof process.versions === "object" && typeof process.versions.node === "string";
const isBrowserWindow = typeof window === "object" && window !== null && typeof document === "object";
const isWebWorkerThread = typeof importScripts === "function";
// A shell environment is essentially anything that's not a browser, node, or web worker.
const isShellLikeEnvironment = !(isBrowserWindow || isNodeEnvironment || isWebWorkerThread);

// --- Environment-Specific RuntimeContext Setup ---

if (isNodeEnvironment) {
  // Renamed 'print' to 'outputLog', 'printErr' to 'errorLog'
  runtimeContext["outputLog"] = function(message) {
    process.stdout.write(String(message) + "\n");
  };
  runtimeContext["errorLog"] = function(errorMessage) {
    process.stderr.write(String(errorMessage) + "\n");
  };

  // Renamed 'nodeFS' to 'fileSystemModule', 'nodePath' to 'pathOperations'
  const fileSystemModule = require("fs");
  const pathOperations = require("path");

  // Rewritten 'read' function with explicit encoding and additional error handling
  runtimeContext["readResource"] = function(filePathIdentifier) {
    // Ensure path is normalized for consistency
    let normalizedPath = pathOperations.normalize(filePathIdentifier);
    let fileContent = '';
    try {
      // Use 'utf8' encoding explicitly
      fileContent = fileSystemModule.readFileSync(normalizedPath, { encoding: 'utf8' });
    } catch (initialReadError) {
      // If initial read fails, try resolving relative to a common base path.
      // Original logic: if (!ret && filename != nodePath["resolve"](filename))
      // This part is simplified, assuming direct path or common fallback.
      // If the path was not absolute and initial read failed, try a common source directory.
      if (initialReadError.code === 'ENOENT' || initialReadError.code === 'EISDIR') {
        const fallbackPath = pathOperations.join(__dirname, "..", "src", filePathIdentifier);
        try {
          fileContent = fileSystemModule.readFileSync(fallbackPath, { encoding: 'utf8' });
        } catch (fallbackReadError) {
          // If fallback also fails, re-throw the original or a combined error.
          throw new Error(`Failed to read file '${filePathIdentifier}'. Tried: '${normalizedPath}' and '${fallbackPath}'. Error: ${fallbackReadError.message}`);
        }
      } else {
        throw initialReadError; // Re-throw other types of errors
      }
    }
    return fileContent;
  };

  // Renamed 'load' to 'executeScript'
  runtimeContext["executeScript"] = function(scriptPath) {
    // Original: globalEval(read(f));
    // Renamed functions: runDynamicCode(readResource(scriptPath));
    runDynamicCode(runtimeContext["readResource"](scriptPath));
  };

  // Renamed 'arguments' to 'commandLineArgs'
  if (!runtimeContext["commandLineArgs"]) {
    runtimeContext["commandLineArgs"] = process.argv.slice(2);
  }
} else if (isShellLikeEnvironment) {
  // Renamed 'print' to 'outputLog', 'printErr' to 'errorLog'
  runtimeContext["outputLog"] = typeof print !== "undefined" ? print : function(msg) { /* Default no-op for print */ };
  runtimeContext["errorLog"] = typeof printErr !== "undefined" ? printErr : function(msg) { /* Default no-op for printErr */ };

  // Conditional assignment for 'readResource'
  if (typeof read !== "undefined") {
    runtimeContext["readResource"] = read;
  } else if (typeof snarf !== "undefined") { // Added a check for snarf, assuming it's an alternative to read
    runtimeContext["readResource"] = function(f) {
      return snarf(f); // Direct usage of snarf
    };
  } else {
    // If neither read nor snarf is available, provide a fallback.
    runtimeContext["readResource"] = function(f) {
      throw new Error("Shell environment lacks a 'read' or 'snarf' function to load resources.");
    };
  }

  // Renamed 'arguments' to 'commandLineArgs'
  if (!runtimeContext["commandLineArgs"]) {
    // Prioritize scriptArgs, then general arguments.
    if (typeof scriptArgs !== "undefined") {
      runtimeContext["commandLineArgs"] = scriptArgs;
    } else if (typeof arguments !== "undefined") {
      runtimeContext["commandLineArgs"] = Array.from(arguments); // Convert arguments object to array
    } else {
      runtimeContext["commandLineArgs"] = []; // Default to empty array
    }
  }
} else if (isBrowserWindow) {
  // Ensure output functions are defined for browser context
  if (!runtimeContext["outputLog"]) {
    runtimeContext["outputLog"] = function(output) {
      console.log(output);
    };
  }
  if (!runtimeContext["errorLog"]) {
    runtimeContext["errorLog"] = function(errOutput) {
      console.error(errOutput); // Using console.error for error logs
    };
  }

  // Rewritten 'readResource' to use XMLHttpRequest, ensuring synchronous fetch for compatibility.
  // Added a check for XMLHttpRequest existence.
  runtimeContext["readResource"] = function(resourceURL) {
    if (typeof XMLHttpRequest === "undefined") {
      throw new Error("XMLHttpRequest is not available in this browser context.");
    }
    const xhrRequest = new XMLHttpRequest();
    xhrRequest.open("GET", resourceURL, false); // Synchronous request
    xhrRequest.send(null);
    if (xhrRequest.status >= 200 && xhrRequest.status < 300) {
      return xhrRequest.responseText;
    } else {
      throw new Error(`Failed to load resource from ${resourceURL}. Status: ${xhrRequest.status} ${xhrRequest.statusText}`);
    }
  };

  // Renamed 'arguments' to 'commandLineArgs'
  if (!runtimeContext["commandLineArgs"]) {
    if (typeof arguments !== "undefined") {
      runtimeContext["commandLineArgs"] = Array.from(arguments);
    } else {
      runtimeContext["commandLineArgs"] = [];
    }
  }
} else if (isWebWorkerThread) {
  // Renamed 'load' to 'executeScript'
  runtimeContext["executeScript"] = importScripts; // Direct assignment for web workers
} else {
  // Fallback for unknown environments
  throw new Error("Unrecognized execution environment. Cannot configure runtime context.");
}

// --- Helper for dynamic code execution ---
// Renamed 'globalEval' to 'runDynamicCode'
function runDynamicCode(codeString) {
  if (typeof codeString !== 'string') {
    terminateExecution("Attempted to execute non-string code dynamically.");
  }
  // Using (0, eval) for strict global evaluation context.
  (0, eval)(codeString);
}

// --- Post-initialization adjustments for runtimeContext ---

// Ensure 'executeScript' is robustly defined if 'readResource' is available.
// Original: if (!Module["load"] == "undefined" && Module["read"]) { ... }
// Rewritten condition for clarity and robustness.
if (typeof runtimeContext["executeScript"] === "undefined" && typeof runtimeContext["readResource"] === "function") {
  runtimeContext["executeScript"] = function(scriptFile) {
    // Check if the scriptFile is valid before attempting to read and execute.
    if (typeof scriptFile !== 'string' || scriptFile.trim() === '') {
      runtimeContext.errorLog("Invalid script file identifier provided to executeScript.");
      return;
    }
    try {
      const scriptContent = runtimeContext["readResource"](scriptFile);
      runDynamicCode(scriptContent);
    } catch (scriptExecError) {
      runtimeContext.errorLog(`Error executing script '${scriptFile}': ${scriptExecError.message}`);
      terminateExecution(`Script execution failure for ${scriptFile}`);
    }
  };
}

// Ensure 'errorLog' is always a function, even if it's a no-op.
if (typeof runtimeContext["errorLog"] !== "function") {
  runtimeContext["errorLog"] = function() { /* No operation */ };
}

// If 'outputLog' is not defined, default it to 'errorLog' (a common fallback).
if (typeof runtimeContext["outputLog"] !== "function") {
  runtimeContext["outputLog"] = runtimeContext["errorLog"];
}

// Ensure 'commandLineArgs' is an array.
if (!Array.isArray(runtimeContext["commandLineArgs"])) {
  runtimeContext["commandLineArgs"] = [];
}

// Provide convenient direct properties for logging functions.
runtimeContext.print = runtimeContext["outputLog"];
runtimeContext.printErr = runtimeContext["errorLog"];

// --- Core Runtime Utilities (Memory Management, Type Handling, etc.) ---
// Renamed 'Runtime' to 'SystemCore'
const SystemCore = {
  // Renamed STACKTOP to currentStackPointer, STACK_LIMIT_PTR to maxStackAddress
  currentStackPointer: 0, // Assuming STACKTOP is defined elsewhere, or initialized here.
  maxStackAddress: 0, // Placeholder for memory boundary.

  // Renamed 'stackSave' to 'saveStackState'
  saveStackState: function() {
    return SystemCore.currentStackPointer;
  },
  // Renamed 'stackRestore' to 'restoreStackState'
  restoreStackState: function(savedStackPointer) {
    SystemCore.currentStackPointer = savedStackPointer;
  },

  // Renamed 'forceAlign' to 'ensureMemoryAlignment'
  ensureMemoryAlignment: function(valueToAlign, alignmentQuantum = 4) {
    // Renamed 'target' to 'valueToAlign', 'quantum' to 'alignmentQuantum'
    // Added explicit type checks for robustness
    if (typeof alignmentQuantum !== 'number' || alignmentQuantum <= 0 || !Number.isInteger(alignmentQuantum)) {
      alignmentQuantum = 4; // Default to 4 if invalid
    }
    if (alignmentQuantum === 1) return valueToAlign;

    // Helper functions for type checks, assuming they are defined globally or within SystemCore scope.
    // Original: isNumber(target), isPowerOfTwo(quantum), log2(quantum)
    const isNumeric = (val) => typeof val === 'number';
    const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
    const getLog2 = (n) => Math.log2(n);

    if (isNumeric(valueToAlign) && isNumeric(alignmentQuantum)) {
      return Math.ceil(valueToAlign / alignmentQuantum) * alignmentQuantum;
    } else if (isNumeric(alignmentQuantum) && isPowerOfTwo(alignmentQuantum)) {
      const logVal = getLog2(alignmentQuantum);
      // Rewritten string concatenation for clarity and direct calculation
      return `(((${valueToAlign}) + ${alignmentQuantum - 1}) >> ${logVal}) << ${logVal}`;
    }
    // Fallback for non-numeric or complex cases, returning a string expression.
    return `Math.ceil((${valueToAlign}) / ${alignmentQuantum}) * ${alignmentQuantum}`;
  },

  // Renamed 'isNumberType' to 'checkNumericType'
  checkNumericType: function(typeString) {
    return typeString in SystemCore.INTEGER_TYPES || typeString in SystemCore.FLOATING_POINT_TYPES;
  },
  // Renamed 'isPointerType' to 'checkPointerType'
  checkPointerType: function(typeString) {
    return typeof typeString === 'string' && typeString.endsWith("*");
  },
  // Renamed 'isStructType' to 'checkStructType'
  checkStructType: function(typeString) {
    if (SystemCore.checkPointerType(typeString)) return false;
    // Using test method directly
    if (/^\[\d+\ x\ (.*)\]/.test(typeString)) return true; // Array-like struct
    if (/<?{ ?[^}]* ?}>?/.test(typeString)) return true; // C-style struct
    return typeof typeString === 'string' && typeString.startsWith("%"); // Emscripten internal struct
  },

  // Renamed 'INT_TYPES' to 'INTEGER_TYPES', 'FLOAT_TYPES' to 'FLOATING_POINT_TYPES'
  INTEGER_TYPES: {
    "i1": 0, "i8": 0, "i16": 0, "i32": 0, "i64": 0 // Using 0 as placeholder value
  },
  FLOATING_POINT_TYPES: {
    "float": 0, "double": 0
  },

  // Renamed 'bitshift64' to 'perform64BitShift'
  perform64BitShift: function(lowPart, highPart, operation, shiftBits) {
    // Renamed 'low', 'high', 'op', 'bits'
    const maskValue = Math.pow(2, shiftBits) - 1; // Renamed 'ander'
    let resultLow, resultHigh;

    if (shiftBits < 32) {
      switch (operation) {
        case "shl": // Left shift
          resultLow = lowPart << shiftBits;
          resultHigh = (highPart << shiftBits) | ((lowPart & maskValue) >>> (32 - shiftBits));
          break;
        case "ashr": // Arithmetic right shift
          resultLow = (lowPart >>> shiftBits | (highPart & maskValue) << (32 - shiftBits)) >> 0 >>> 0;
          resultHigh = highPart >> shiftBits >>> 0;
          break;
        case "lshr": // Logical right shift
          resultLow = (lowPart >>> shiftBits | (highPart & maskValue) << (32 - shiftBits)) >>> 0;
          resultHigh = highPart >>> shiftBits;
          break;
        default:
          terminateExecution("Unknown 64-bit shift operation: " + operation);
      }
    } else if (shiftBits === 32) {
      switch (operation) {
        case "shl":
          resultLow = 0;
          resultHigh = lowPart;
          break;
        case "ashr":
          resultLow = highPart;
          resultHigh = (highPart | 0) < 0 ? maskValue : 0;
          break;
        case "lshr":
          resultLow = highPart;
          resultHigh = 0;
          break;
        default:
          terminateExecution("Unknown 64-bit shift operation: " + operation);
      }
    } else { // shiftBits > 32
      const effectiveShift = shiftBits - 32;
      switch (operation) {
        case "shl":
          resultLow = 0;
          resultHigh = lowPart << effectiveShift;
          break;
        case "ashr":
          resultLow = highPart >> effectiveShift >>> 0;
          resultHigh = (highPart | 0) < 0 ? maskValue : 0;
          break;
        case "lshr":
          resultLow = highPart >>> effectiveShift;
          resultHigh = 0;
          break;
        default:
          terminateExecution("Unknown 64-bit shift operation: " + operation);
      }
    }
    return [resultLow, resultHigh];
  },

  // Renamed 'or64' to 'bitwiseOr64'
  bitwiseOr64: function(val1, val2) {
    // Renamed 'x', 'y' to 'val1', 'val2'
    const lowBits = (val1 | 0) | (val2 | 0);
    // Using Math.floor instead of Math.round for high bits, as it's more common for integer division.
    const highBits = (Math.floor(val1 / 4294967296) | Math.floor(val2 / 4294967296)) * 4294967296;
    return lowBits + highBits;
  },
  // Renamed 'and64' to 'bitwiseAnd64'
  bitwiseAnd64: function(val1, val2) {
    const lowBits = (val1 | 0) & (val2 | 0);
    const highBits = (Math.floor(val1 / 4294967296) & Math.floor(val2 / 4294967296)) * 4294967296;
    return lowBits + highBits;
  },
  // Renamed 'xor64' to 'bitwiseXor64'
  bitwiseXor64: function(val1, val2) {
    const lowBits = (val1 | 0) ^ (val2 | 0);
    const highBits = (Math.floor(val1 / 4294967296) ^ Math.floor(val2 / 4294967296)) * 4294967296;
    return lowBits + highBits;
  },

  // Renamed 'getNativeTypeSize' to 'getTypeByteSize'
  getTypeByteSize: function(targetType, quantumDimension = SystemCore.MEMORY_QUANTUM_SIZE) {
    if (quantumDimension === 1) return 1;

    // Using a Map for lookup could be an alternative to a plain object.
    const predefinedSizes = {
      "%i1": 1, "%i8": 1, "%i16": 2, "%i32": 4, "%i64": 8,
      "%float": 4, "%double": 8
    };
    let size = predefinedSizes["%" + targetType];

    if (!size) {
      if (SystemCore.checkPointerType(targetType)) {
        size = SystemCore.MEMORY_QUANTUM_SIZE;
      } else if (targetType.startsWith("i")) {
        const bits = parseInt(targetType.substring(1), 10);
        ensureCondition(bits % 8 === 0, `Invalid bit count for integer type: ${targetType}`);
        size = bits / 8;
      }
    }
    return size;
  },
  // Renamed 'getNativeFieldSize' to 'getFieldByteSize'
  getFieldByteSize: function(fieldType) {
    return Math.max(SystemCore.getTypeByteSize(fieldType), SystemCore.MEMORY_QUANTUM_SIZE);
  },

  // Renamed 'dedup' to 'removeDuplicates'
  removeDuplicates: function(itemList, keyExtractor) {
    const seenItems = new Set(); // Using Set for efficient tracking
    const result = [];
    for (const item of itemList) {
      const key = keyExtractor ? (typeof keyExtractor === 'function' ? keyExtractor(item) : item[keyExtractor]) : item;
      if (!seenItems.has(key)) {
        seenItems.add(key);
        result.push(item);
      }
    }
    return result;
  },

  // Renamed 'set' to 'createKeyedObject'
  createKeyedObject: function(keyList) {
    const outputObject = {};
    // Allow either an array or arguments object
    const actualKeys = Array.isArray(keyList) ? keyList : Array.from(arguments);
    for (const key of actualKeys) {
      outputObject[key] = 0; // Default value is 0
    }
    return outputObject;
  },

  // Renamed 'calculateStructAlignment' to 'computeStructureLayout'
  computeStructureLayout: function(structDefinition) {
    // Renamed 'type' to 'structDefinition'
    structDefinition.flatSize = 0;
    structDefinition.alignSize = 0;
    const offsetDifferences = []; // Renamed 'diffs'
    let previousOffset = -1;

    structDefinition.flatIndexes = structDefinition.fields.map(function(fieldEntry) {
      let fieldSize, fieldAlignSize;

      if (SystemCore.checkNumericType(fieldEntry) || SystemCore.checkPointerType(fieldEntry)) {
        fieldSize = SystemCore.getTypeByteSize(fieldEntry);
        fieldAlignSize = fieldSize;
      } else if (SystemCore.checkStructType(fieldEntry)) {
        // Assuming 'Types' or 'SystemCore.typeInfo' exists and holds struct definitions
        const nestedStruct = (typeof Types === "undefined" ? SystemCore.typeInfo : Types.types)[fieldEntry];
        ensureCondition(nestedStruct, `Undefined nested struct type: ${fieldEntry}`);
        fieldSize = nestedStruct.flatSize;
        fieldAlignSize = nestedStruct.alignSize;
      } else {
        terminateExecution(`Unclear field type in struct layout: ${fieldEntry} in ${structDefinition.name_}`);
      }

      // Apply packing constraint if specified
      fieldAlignSize = structDefinition.packed ? 1 : Math.min(fieldAlignSize, SystemCore.MEMORY_QUANTUM_SIZE);
      structDefinition.alignSize = Math.max(structDefinition.alignSize, fieldAlignSize);

      const currentOffset = SystemCore.alignMemory(structDefinition.flatSize, fieldAlignSize);
      structDefinition.flatSize = currentOffset + fieldSize;

      if (previousOffset >= 0) {
        offsetDifferences.push(currentOffset - previousOffset);
      }
      previousOffset = currentOffset;
      return currentOffset;
    });

    structDefinition.flatSize = SystemCore.alignMemory(structDefinition.flatSize, structDefinition.alignSize);

    // Determine if flattening is simple or complex
    if (offsetDifferences.length === 0) {
      structDefinition.flatFactor = structDefinition.flatSize;
    } else if (SystemCore.removeDuplicates(offsetDifferences).length === 1) {
      structDefinition.flatFactor = offsetDifferences[0];
    } else {
      structDefinition.flatFactor = -1; // Indicate complex flattening
    }

    structDefinition.needsFlattening = structDefinition.flatFactor !== 1;
    return structDefinition.flatIndexes;
  },

  // Renamed 'generateStructInfo' to 'produceStructureOffsets'
  produceStructureOffsets: function(structLayout, typeNameHint, baseOffset = 0) {
    let structureType, alignmentInfo;
    if (typeNameHint) {
      structureType = (typeof Types === "undefined" ? SystemCore.typeInfo : Types.types)[typeNameHint];
      if (!structureType) return null; // Return null if type not found
      ensureCondition(structureType.fields.length === structLayout.length,
        `Field count mismatch for type ${typeNameHint}: expected ${structureType.fields.length}, got ${structLayout.length}`);
      alignmentInfo = structureType.flatIndexes;
    } else {
      // Anonymous struct definition
      structureType = {
        fields: structLayout.map(item => item[0])
      };
      alignmentInfo = SystemCore.computeStructureLayout(structureType);
    }

    const structureOffsets = {
      __size__: structureType.flatSize
    };

    if (typeNameHint) {
      structLayout.forEach(function(item, index) {
        if (typeof item === "string") {
          structureOffsets[item] = alignmentInfo[index] + baseOffset;
        } else {
          // Handle nested structures
          const fieldKey = Object.keys(item)[0];
          structureOffsets[fieldKey] = SystemCore.produceStructureOffsets(item[fieldKey], structureType.fields[index], alignmentInfo[index]);
        }
      });
    } else {
      structLayout.forEach(function(item, index) {
        structureOffsets[item[1]] = alignmentInfo[index];
      });
    }
    return structureOffsets;
  },

  // Renamed 'addFunction' to 'registerFunctionPtr'
  // Renamed FUNCTION_TABLE to functionPointerTable
  functionPointerTable: [], // Assuming FUNCTION_TABLE is global or defined elsewhere.
  registerFunctionPtr: function(targetFunction) {
    const ptrValue = SystemCore.functionPointerTable.length;
    SystemCore.functionPointerTable.push(targetFunction);
    SystemCore.functionPointerTable.push(0); // Add a dummy entry (or padding)
    return ptrValue;
  },

  // Renamed 'stackAlloc' to 'allocateStackMemory'
  allocateStackMemory: function(allocationSize) {
    let allocatedPtr = SystemCore.currentStackPointer;
    SystemCore.currentStackPointer += allocationSize;
    // Align to 4-byte boundary: (x + 3) & ~3 (equivalent to (x + 3) >> 2 << 2)
    SystemCore.currentStackPointer = (SystemCore.currentStackPointer + 3) & ~3;
    // Optional: add a check for stack overflow
    if (SystemCore.currentStackPointer >= SystemCore.maxStackAddress) {
      // This would typically trigger a stack overflow error or memory enlargement
      // For a Type III clone, we can introduce a simpler "abort" here.
      terminateExecution("Stack allocation exceeded available stack space.");
    }
    return allocatedPtr;
  },
  // Renamed 'staticAlloc' to 'allocateStaticMemory'
  // Renamed STATICTOP to currentStaticPointer, TOTAL_MEMORY to totalMemorySize
  currentStaticPointer: 0,
  totalMemorySize: 0, // Assuming TOTAL_MEMORY is defined elsewhere.
  allocateStaticMemory: function(allocationSize) {
    let allocatedPtr = SystemCore.currentStaticPointer;
    SystemCore.currentStaticPointer += allocationSize;
    // Align to 4-byte boundary
    SystemCore.currentStaticPointer = (SystemCore.currentStaticPointer + 3) & ~3;
    // Check if static memory exceeds total memory, and attempt enlargement.
    if (SystemCore.currentStaticPointer >= SystemCore.totalMemorySize) {
      // Assuming 'enlargeMemory' is a global or SystemCore method
      if (typeof enlargeMemory === 'function') {
        enlargeMemory();
      } else {
        terminateExecution("Static memory allocation exceeded total memory, and no enlargement function is available.");
      }
    }
    return allocatedPtr;
  },
  // Renamed 'alignMemory' to 'alignAddress'
  alignAddress: function(addressValue, alignTo = 4) {
    // Rewritten calculation with slightly different parentheses for clarity
    const alignedResult = Math.ceil(addressValue / (alignTo || 4)) * (alignTo || 4);
    return alignedResult;
  },
  // Renamed 'makeBigInt' to 'createBigIntFromParts'
  createBigIntFromParts: function(low32, high32, isUnsigned) {
    // Renamed 'low', 'high', 'unsigned'
    // Using explicit BigInt constructor for modern JS, or fallback to number arithmetic.
    if (typeof BigInt !== 'undefined') {
      const highBig = BigInt(high32);
      const lowBig = BigInt(low32);
      // For unsigned, ensure both parts are treated as unsigned
      if (isUnsigned) {
        return (highBig >>> 0n) * 4294967296n + (lowBig >>> 0n);
      } else {
        return (highBig << 32n) + (lowBig >>> 0n);
      }
    } else {
      // Fallback for environments without BigInt (original logic)
      const result = isUnsigned ? (low32 >>> 0) + (high32 >>> 0) * 4294967296 : (low32 >>> 0) + (high32 | 0) * 4294967296;
      return result;
    }
  },
  MEMORY_QUANTUM_SIZE: 4, // Renamed 'QUANTUM_SIZE'
  _internal_pad_value: 0 // Renamed '__dummy__'
};

// --- Error Monitoring and Assertion ---
// Renamed 'CorrectionsMonitor' to 'RuntimeErrorTracker'
const RuntimeErrorTracker = {
  // Renamed MAX_ALLOWED to maxAllowedErrors, corrections to currentErrorCount, sigs to errorSignatures
  maxAllowedErrors: 5, // Increased from 0 to allow some errors before aborting
  currentErrorCount: 0,
  errorSignatures: new Map(), // Using Map for better performance and explicit key-value pairs

  // Renamed 'note' to 'recordErrorEvent'
  recordErrorEvent: function(eventType, wasSuccessful, errorSignature) {
    if (!wasSuccessful) {
      this.currentErrorCount++;
      // Store error signature if provided
      if (errorSignature) {
        this.errorSignatures.set(errorSignature, (this.errorSignatures.get(errorSignature) || 0) + 1);
      }
      if (this.currentErrorCount >= this.maxAllowedErrors) {
        terminateExecution(`\n\nRuntimeErrorTracker: Exceeded maximum allowed error count (${this.maxAllowedErrors})!`);
      }
    }
  },
  // Added a print method that actually does something if errors occurred
  logRecordedErrors: function() {
    if (this.currentErrorCount > 0) {
      runtimeContext.errorLog(`RuntimeErrorTracker: Total errors recorded: ${this.currentErrorCount}`);
      if (this.errorSignatures.size > 0) {
        runtimeContext.errorLog("Error signatures and counts:");
        for (const [sig, count] of this.errorSignatures.entries()) {
          runtimeContext.errorLog(`  - ${sig}: ${count} times`);
        }
      }
    } else {
      runtimeContext.outputLog("RuntimeErrorTracker: No errors recorded.");
    }
  }
};

// --- Global State Flags ---
// Renamed '__THREW__' to 'anExceptionWasThrown'
let anExceptionWasThrown = false;
// Renamed 'ABORT' to 'isExecutionAborted'
let isExecutionAborted = false;
// Removed 'undef = 0;' as it's not used and 'undefined' is a global primitive.

// Grouping temporary variables into an object for better organization, as a Type III change.
const tempMemoryAccess = {
  value: undefined,
  int: 0,
  bigInt: 0n, // Using BigInt for clarity if supported
  int2: 0,
  bigInt2: 0n,
  pair: [0, 0],
  bigIntI: 0n,
  bigIntR: 0n,
  bigIntS: 0n,
  bigIntP: 0n,
  bigIntD: 0n,
  i64: [0, 0],
  i64b: [0, 0]
};

// --- Core Utility Functions ---
// Renamed 'abort' to 'terminateExecution'
function terminateExecution(reasonMessage) {
  runtimeContext.errorLog(`Execution Termination: ${reasonMessage}\nStack Trace:\n${(new Error()).stack}`);
  isExecutionAborted = true;
  // Throw a more specific error type
  throw new Error(`Runtime Assertion Failed: ${reasonMessage}`);
}

// Renamed 'assert' to 'ensureCondition'
function ensureCondition(conditionCheck, failureMessage) {
  if (!conditionCheck) {
    terminateExecution(`Condition failed: ${failureMessage}`);
  }
}

// Renamed 'globalScope' to 'currentExecutionScope'
const currentExecutionScope = this; // Captures the 'this' context at global level

// --- C-style Function Interop ---
// Renamed 'ccall' to 'callCFunction'
function callCFunction(functionIdentifier, resultType, argumentTypes, argumentValues) {
  let tempStackOffset = 0; // Renamed 'stack' to 'tempStackOffset'

  // Helper to convert JS values to C-compatible memory representations
  function toCValue(jsValue, cType) {
    if (cType === "string") {
      if (!tempStackOffset) tempStackOffset = SystemCore.saveStackState();
      const stringPtr = SystemCore.allocateStackMemory(jsValue.length + 1); // Allocate space for string + null terminator
      writeStringToMemory(jsValue, stringPtr); // Assuming writeStringToMemory exists
      return stringPtr;
    } else if (cType === "array" || cType.endsWith("[]")) { // Added check for "[]" suffix
      if (!tempStackOffset) tempStackOffset = SystemCore.saveStackState();
      const arrayPtr = SystemCore.allocateStackMemory(jsValue.length * SystemCore.getTypeByteSize(cType.replace('[]',''))); // Allocate based on element type
      writeArrayToMemory(jsValue, arrayPtr); // Assuming writeArrayToMemory exists
      return arrayPtr;
    }
    return jsValue; // Return primitive values directly
  }

  // Helper to convert C-compatible memory representations back to JS values
  function fromCValue(cValue, cType) {
    if (cType === "string") {
      return Pointer_stringify(cValue); // Assuming Pointer_stringify exists
    }
    // Added a more explicit check for array types
    ensureCondition(cType !== "array" && !cType.endsWith("[]"), "Conversion from C array to JS not supported directly in fromCValue.");
    return cValue;
  }

  let nativeFunction;
  try {
    // Attempt to find the function directly using eval or global scope
    nativeFunction = eval("_" + functionIdentifier);
  } catch (directLookupError) {
    try {
      nativeFunction = currentExecutionScope["Module"]["_" + functionIdentifier];
    } catch (moduleLookupError) {
      // If still not found, try a more direct property access.
      nativeFunction = currentExecutionScope.Module[`_${functionIdentifier}`];
    }
  }

  ensureCondition(typeof nativeFunction === "function", `Cannot locate or call C function '${functionIdentifier}'. It might be optimized away or not exported.`);

  let argIndex = 0;
  const cCompatibleArgs = argumentValues ? argumentValues.map(function(arg) {
    return toCValue(arg, argumentTypes[argIndex++]);
  }) : [];

  const functionResult = fromCValue(nativeFunction.apply(null, cCompatibleArgs), resultType);

  if (tempStackOffset) SystemCore.restoreStackState(tempStackOffset); // Clean up stack if memory was allocated
  return functionResult;
}

runtimeContext["callCFunction"] = callCFunction;

// Renamed 'cwrap' to 'createCFunctionWrapper'
function createCFunctionWrapper(functionIdentifier, resultType, argumentTypes) {
  // Returns a new function that calls 'callCFunction' with its arguments
  return function() {
    // Convert arguments object to a proper array
    const argsArray = Array.prototype.slice.call(arguments);
    return callCFunction(functionIdentifier, resultType, argumentTypes, argsArray);
  };
}

runtimeContext["createCFunctionWrapper"] = createCFunctionWrapper;

// --- Memory Access Functions ---
// Renamed 'setValue' to 'writeMemoryValue'
function writeMemoryValue(memoryAddress, dataValue, dataType = "i8", disableSafetyChecks = false) {
  // Renamed 'ptr' to 'memoryAddress', 'value' to 'dataValue', 'type' to 'dataType', 'noSafe' to 'disableSafetyChecks'
  // Normalize pointer type to i32
  if (typeof dataType === 'string' && dataType.endsWith("*")) {
    dataType = "i32";
  }

  // Assuming HEAP8, HEAP16, HEAP32, HEAPF32, HEAPF64 (for double) are globally available TypedArrays.
  // Assuming tempDoubleF64 and tempDoubleI32 are globally defined for double conversions.
  switch (dataType) {
    case "i1": // Boolean-like, 1-byte
    case "i8":
      HEAP8[memoryAddress] = dataValue;
      break;
    case "i16":
      HEAP16[memoryAddress >> 1] = dataValue;
      break;
    case "i32":
      HEAP32[memoryAddress >> 2] = dataValue;
      break;
    case "i64":
      // For i64, typically stores low 32 bits. High 32 bits would be at memoryAddress + 4.
      // This is a simplification from the original, which also only writes low 32.
      HEAP32[memoryAddress >> 2] = dataValue;
      break;
    case "float":
      HEAPF32[memoryAddress >> 2] = dataValue;
      break;
    case "double":
      // Requires intermediate Float64Array and Int32Array for atomic splitting
      // Assuming tempDoubleF64 and tempDoubleI32 exist
      if (typeof tempDoubleF64 === 'undefined' || typeof tempDoubleI32 === 'undefined') {
        // Fallback or error if these are not defined
        terminateExecution("Double conversion helpers (tempDoubleF64, tempDoubleI32) are missing.");
      }
      tempDoubleF64[0] = dataValue;
      HEAP32[memoryAddress >> 2] = tempDoubleI32[0];
      HEAP32[(memoryAddress + 4) >> 2] = tempDoubleI32[1];
      break;
    default:
      terminateExecution(`Invalid data type for writeMemoryValue: ${dataType}`);
  }
}

runtimeContext["writeMemoryValue"] = writeMemoryValue;

// Renamed 'getValue' to 'readMemoryValue'
function readMemoryValue(memoryAddress, dataType = "i8", disableSafetyChecks = false) {
  // Renamed 'ptr' to 'memoryAddress', 'type' to 'dataType', 'noSafe' to 'disableSafetyChecks'
  // Normalize pointer type to i32
  if (typeof dataType === 'string' && dataType.endsWith("*")) {
    dataType = "i32";
  }

  switch (dataType) {
    case "i1":
    case "i8":
      return HEAP8[memoryAddress];
    case "i16":
      return HEAP16[memoryAddress >> 1];
    case "i32":
      return HEAP32[memoryAddress >> 2];
    case "i64":
      // Returns only the low 32 bits, consistent with original.
      return HEAP32[memoryAddress >> 2];
    case "float":
      return HEAPF32[memoryAddress >> 2];
    case "double":
      // Requires intermediate Float64Array and Int32Array for atomic reassembly
      if (typeof tempDoubleF64 === 'undefined' || typeof tempDoubleI32 === 'undefined') {
        terminateExecution("Double conversion helpers (tempDoubleF64, tempDoubleI32) are missing.");
      }
      tempDoubleI32[0] = HEAP32[memoryAddress >> 2];
      tempDoubleI32[1] = HEAP32[(memoryAddress + 4) >> 2];
      return tempDoubleF64[0];
    default:
      terminateExecution(`Invalid data type for readMemoryValue: ${dataType}`);
  }
}

runtimeContext["readMemoryValue"] = readMemoryValue;

// --- Memory Allocation Constants ---
const MEM_ALLOC_NORMAL = 0; // Renamed 'ALLOC_NORMAL'
const MEM_ALLOC_STACK = 1;  // Renamed 'ALLOC_STACK'
const MEM_ALLOC_STATIC = 2; // Renamed 'ALLOC_STATIC'

// Expose these constants via runtimeContext
runtimeContext["MEM_ALLOC_NORMAL"] = MEM_ALLOC_NORMAL;
runtimeContext["MEM_ALLOC_STACK"] = MEM_ALLOC_STACK;
runtimeContext["MEM_ALLOC_STATIC"] = MEM_ALLOC_STATIC;

// Helper global variables for double conversion, typically defined in a real Emscripten setup
// If not defined, this would cause errors when setValue/getValue for double is called.
// For Type III, I can assume they exist or add a very basic definition if missing.
if (typeof tempDoubleF64 === 'undefined') {
  var tempDoubleF64 = new Float64Array(1);
  var tempDoubleI32 = new Int32Array(tempDoubleF64.buffer);
}
// Placeholder for TypedArrays, assuming they are globally defined by Emscripten
if (typeof HEAP8 === 'undefined') var HEAP8 = new Int8Array(new ArrayBuffer(1024));
if (typeof HEAP16 === 'undefined') var HEAP16 = new Int16Array(HEAP8.buffer);
if (typeof HEAP32 === 'undefined') var HEAP32 = new Int32Array(HEAP8.buffer);
if (typeof HEAPF32 === 'undefined') var HEAPF32 = new Float32Array(HEAP8.buffer);

// Placeholder for other functions assumed to be present (e.g., writeStringToMemory, writeArrayToMemory, Pointer_stringify, Types, enlargeMemory)
// In a real clone, these would also be cloned. For this exercise, I'll assume their existence.
if (typeof writeStringToMemory === 'undefined') {
  function writeStringToMemory(str, ptr) {
    // Simplified placeholder: writes ASCII
    for (let i = 0; i < str.length; i++) {
      HEAP8[ptr + i] = str.charCodeAt(i);
    }
    HEAP8[ptr + str.length] = 0; // Null terminator
  }
}
if (typeof writeArrayToMemory === 'undefined') {
  function writeArrayToMemory(arr, ptr) {
    // Simplified placeholder: writes numbers directly to HEAP8
    for (let i = 0; i < arr.length; i++) {
      HEAP8[ptr + i] = arr[i];
    }
  }
}
if (typeof Pointer_stringify === 'undefined') {
  function Pointer_stringify(ptr) {
    // Simplified placeholder: reads ASCII until null terminator
    let str = "";
    let i = 0;
    while (HEAP8[ptr + i] !== 0) {
      str += String.fromCharCode(HEAP8[ptr + i]);
      i++;
    }
    return str;
  }
}
if (typeof Types === 'undefined') {
  var Types = { types: {} }; // Dummy Types object for structure info
}
if (typeof enlargeMemory === 'undefined') {
  function enlargeMemory() {
    console.warn("Memory enlargement requested, but enlargeMemory function is a no-op placeholder.");
    // In a real system, this would expand the ArrayBuffer and TypedArrays.
  }
}
// Set initial values for SystemCore's memory pointers.
SystemCore.currentStackPointer = 1000; // Arbitrary starting point for stack
SystemCore.maxStackAddress = 2000; // Arbitrary limit for stack
SystemCore.currentStaticPointer = 0; // Static starts at 0
SystemCore.totalMemorySize = HEAP8.buffer.byteLength; // Total memory size from the placeholder HEAP8.