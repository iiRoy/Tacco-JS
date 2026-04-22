var STACK_POINTER_TOP = 0;
var STATIC_POINTER_TOP = 0;
var TOTAL_ALLOC_MEMORY = 0;
var FUNCTION_POINTER_TABLE = [];
var MEM_BUFFER_UINT8 = new Uint8Array(1);
var MEM_BUFFER_UINT16 = new Uint16Array(1);
var MEM_BUFFER_UINT32 = new Uint32Array(1);
var MEM_BUFFER_FLOAT32 = new Float32Array(1);
var temporaryDoubleFloat64 = new Float64Array(1);
var temporaryDoubleInt32 = new Int32Array(temporaryDoubleFloat64.buffer);
function isNumericValue(val) { return typeof val === 'number'; }
function isPowerOfTwoValue(val) { return (val & (val - 1)) === 0 && val !== 0; }
function log2(val) { return Math.log2(val); }
function debugDump(data) { return JSON.stringify(data); }
function expandMemoryCapacity() { console.warn("Memory expansion requested."); }
function storeStringIntoMemory(str, ptr) { /* Placeholder for actual storage logic */ console.log("Storing string:", str, "at", ptr); }
function storeArrayIntoMemory(arr, ptr) { /* Placeholder for actual storage logic */ console.log("Storing array:", arr, "at", ptr); }
function dereferenceToString(ptr) { console.log("Dereferencing pointer:", ptr); return "simulated_string"; }
var TypeDefinitions = { types: {} };
var outputMsg = function() { console.log.apply(console, arguments); };
var outputError = function() { console.error.apply(console, arguments); };
var fetchData = function(f) { console.log("Fetching data from:", f); return ""; };
var grabFileContent = function(f) { console.log("Grabbing file content from:", f); return ""; };
var cliScriptArgs = [];
try {
  self["ProcessingUnit"] = ProcessingUnit;
}
catch (err) {
  self["ProcessingUnit"] = ProcessingUnit = {};
}
var EXEC_ENV_IS_NODEJS = typeof process === "object";
var EXEC_ENV_IS_BROWSER = typeof window === "object";
var EXEC_ENV_IS_WEBWORKER = typeof importScripts === "function";
var EXEC_ENV_IS_STANDALONE = !EXEC_ENV_IS_BROWSER && !EXEC_ENV_IS_NODEJS && !EXEC_ENV_IS_WEBWORKER;
if (EXEC_ENV_IS_NODEJS) {
  ProcessingUnit["outputMsg"] = (function(content) {
    process["stdout"].write(content + "\n");
  });
  ProcessingUnit["outputError"] = (function(content) {
    process["stderr"].write(content + "\n");
  });
  var fileSysUtil = require("fs");
  var pathUtil = require("path");
  ProcessingUnit["readFileContent"] = (function(filePath) {
    filePath = pathUtil["normalize"](filePath);
    var resultData = fileSysUtil["readFileSync"](filePath).toString();
    if (!resultData && filePath != pathUtil["resolve"](filePath)) {
      filePath = pathUtil.join(__dirname, "..", "source", filePath);
      resultData = fileSysUtil["readFileSync"](filePath).toString();
    }
    return resultData;
  });
  ProcessingUnit["scriptLoader"] = (function(fileRef) {
    executeCodeString(ProcessingUnit["readFileContent"](fileRef));
  });
  if (!ProcessingUnit["inputArguments"]) {
    ProcessingUnit["inputArguments"] = process["argv"].slice(2);
  }
}
else if (EXEC_ENV_IS_STANDALONE) {
  ProcessingUnit["outputMsg"] = outputMsg;
  ProcessingUnit["outputError"] = outputError;
  if (typeof fetchData != "undefined") {
    ProcessingUnit["readFileContent"] = fetchData;
  }
  else {
    ProcessingUnit["readFileContent"] = (function(fileId) {
      grabFileContent(fileId);
    });
  }
  if (!ProcessingUnit["inputArguments"]) {
    if (typeof cliScriptArgs != "undefined") {
      ProcessingUnit["inputArguments"] = cliScriptArgs;
    }
    else if (typeof arguments != "undefined") {
      ProcessingUnit["inputArguments"] = arguments;
    }
  }
}
else if (EXEC_ENV_IS_BROWSER) {
  if (!ProcessingUnit["outputMsg"]) {
    ProcessingUnit["outputMsg"] = (function(messageText) {
      console.log(messageText);
    });
  }
  if (!ProcessingUnit["outputError"]) {
    ProcessingUnit["outputError"] = (function(messageText) {
      console.log(messageText);
    });
  }
  ProcessingUnit["fetchResource"] = (function(resourceURL) {
    var ajaxRequest = new XMLHttpRequest;
    ajaxRequest.open("GET", resourceURL, false);
    ajaxRequest.send(null);
    return ajaxRequest.responseText;
  });
  if (!ProcessingUnit["inputArguments"]) {
    if (typeof arguments != "undefined") {
      ProcessingUnit["inputArguments"] = arguments;
    }
  }
}
else if (EXEC_ENV_IS_WEBWORKER) {
  ProcessingUnit["scriptLoader"] = importScripts;
}
else {
  throw "Unidentified execution context. Location unknown?";
}
function executeCodeString(codeToRun) {
  eval.call(null, codeToRun);
}
if (!ProcessingUnit["scriptLoader"] == "undefined" && ProcessingUnit["readFileContent"]) {
  ProcessingUnit["scriptLoader"] = (function(targetFile) {
    executeCodeString(ProcessingUnit["readFileContent"](targetFile));
  });
}
if (!ProcessingUnit["outputError"]) {
  ProcessingUnit["outputError"] = (function() {});
}
if (!ProcessingUnit["outputMsg"]) {
  ProcessingUnit["outputMsg"] = ProcessingUnit["outputError"];
}
if (!ProcessingUnit["inputArguments"]) {
  ProcessingUnit["inputArguments"] = [];
}
ProcessingUnit.outputMsg = ProcessingUnit["outputMsg"];
ProcessingUnit.outputError = ProcessingUnit["outputError"];
var ExecutionCore = {
  memStackSave: (function() {
    return STACK_POINTER_TOP;
  }),
  memStackRestore: (function(savedStackPtr) {
    STACK_POINTER_TOP = savedStackPtr;
  }),
  ensureAlignedAddress: (function(addrTarget, alignQuantum) {
    alignQuantum = alignQuantum || 4;
    if (alignQuantum == 1) return addrTarget;
    if (isNumericValue(addrTarget) && isNumericValue(alignQuantum)) {
      return Math.ceil(addrTarget / alignQuantum) * alignQuantum;
    }
    else if (isNumericValue(alignQuantum) && isPowerOfTwoValue(alignQuantum)) {
      var logarithmVal = log2(alignQuantum);
      return "((((" + addrTarget + ")+" + (alignQuantum - 1) + ")>>" + logarithmVal + ")<<" + logarithmVal + ")";
    }
    return "Math.ceil((" + addrTarget + ")/" + alignQuantum + ")*" + alignQuantum;
  }),
  checkIsNumericType: (function(dataType) {
    return dataType in ExecutionCore.INTEGER_TYPES_MAP || dataType in ExecutionCore.FLOATING_POINT_TYPES_MAP;
  }),
  checkIsPointerType: function checkIsPointerType(dataType) {
    return dataType[dataType.length - 1] == "*";
  },
  checkIsStructType: function checkIsStructType(dataType) {
    if (ExecutionCore.checkIsPointerType(dataType)) return false;
    if (/^\[\d+\ x\ (.*)\]/.test(dataType)) return true;
    if (/<?{ ?[^}]* ?}>?/.test(dataType)) return true;
    return dataType[0] == "%";
  },
  INTEGER_TYPES_MAP: {
    "i1": 0,
    "i8": 0,
    "i16": 0,
    "i32": 0,
    "i64": 0
  },
  FLOATING_POINT_TYPES_MAP: {
    "float": 0,
    "double": 0
  },
  perform64BitShift: (function(lowPart, highPart, operationCode, shiftBits) {
    var maskValue = Math.pow(2, shiftBits) - 1;
    if (shiftBits < 32) {
      switch (operationCode) {
       case "shl":
        return [ lowPart << shiftBits, highPart << shiftBits | (lowPart & maskValue << 32 - shiftBits) >>> 32 - shiftBits ];
       case "ashr":
        return [ (lowPart >>> shiftBits | (highPart & maskValue) << 32 - shiftBits) >> 0 >>> 0, highPart >> shiftBits >>> 0 ];
       case "lshr":
        return [ (lowPart >>> shiftBits | (highPart & maskValue) << 32 - shiftBits) >>> 0, highPart >>> shiftBits ];
      }
    }
    else if (shiftBits == 32) {
      switch (operationCode) {
       case "shl":
        return [ 0, lowPart ];
       case "ashr":
        return [ highPart, (highPart | 0) < 0 ? maskValue : 0 ];
       case "lshr":
        return [ highPart, 0 ];
      }
    }
    else {
      switch (operationCode) {
       case "shl":
        return [ 0, lowPart << shiftBits - 32 ];
       case "ashr":
        return [ highPart >> shiftBits - 32 >>> 0, (highPart | 0) < 0 ? maskValue : 0 ];
       case "lshr":
        return [ highPart >>> shiftBits - 32, 0 ];
      }
    }
    terminateExecution("unknown bitshift64 op: " + [ lowPart, operationCode, shiftBits ]);
  }),
  orOperation64: (function(valX, valY) {
    var lowRes = valX | 0 | (valY | 0);
    var highRes = (Math.round(valX / 4294967296) | Math.round(valY / 4294967296)) * 4294967296;
    return lowRes + highRes;
  }),
  andOperation64: (function(valX, valY) {
    var lowRes = (valX | 0) & (valY | 0);
    var highRes = (Math.round(valX / 4294967296) & Math.round(valY / 4294967296)) * 4294967296;
    return lowRes + highRes;
  }),
  xorOperation64: (function(valX, valY) {
    var lowRes = (valX | 0) ^ (valY | 0);
    var highRes = (Math.round(valX / 4294967296) ^ Math.round(valY / 4294967296)) * 4294967296;
    return lowRes + highRes;
  }),
  retrieveNativeSize: (function(dataType, alignUnitSize) {
    if (ExecutionCore.ALIGNMENT_QUANTUM == 1) return 1;
    var byteCount = {
      "%i1": 1,
      "%i8": 1,
      "%i16": 2,
      "%i32": 4,
      "%i64": 8,
      "%float": 4,
      "%double": 8
    }["%" + dataType];
    if (!byteCount) {
      if (dataType[dataType.length - 1] == "*") {
        byteCount = ExecutionCore.ALIGNMENT_QUANTUM;
      }
      else if (dataType[0] == "i") {
        var bitLength = parseInt(dataType.substr(1));
        verifyCondition(bitLength % 8 == 0, "Bit length must be a multiple of 8.");
        byteCount = bitLength / 8;
      }
    }
    return byteCount;
  }),
  retrieveNativeFieldSize: (function(dataType) {
    return Math.max(ExecutionCore.retrieveNativeSize(dataType), ExecutionCore.ALIGNMENT_QUANTUM);
  }),
  removeDuplicates: function removeDuplicates(dataItems, identifierKey) {
    var seenElements = {};
    if (identifierKey) {
      return dataItems.filter((function(dataItem) {
        if (seenElements[dataItem[identifierKey]]) return false;
        seenElements[dataItem[identifierKey]] = true;
        return true;
      }));
    }
    else {
      return dataItems.filter((function(dataItem) {
        if (seenElements[dataItem]) return false;
        seenElements[dataItem] = true;
        return true;
      }));
    }
  },
  createSetObject: function createSetObject() {
    var inputArgs = typeof arguments[0] === "object" ? arguments[0] : arguments;
    var resultSet = {};
    for (var idx = 0; idx < inputArgs.length; idx++) {
      resultSet[inputArgs[idx]] = 0;
    }
    return resultSet;
  },
  computeStructureAlignment: function computeStructureAlignment(dataType) {
    dataType.linearSize = 0;
    dataType.alignmentSize = 0;
    var differencesArray = [];
    var previousOffset = -1;
    dataType.linearOffsets = dataType.fields.map((function(structField) {
      var byteCount, alignmentSize;
      if (ExecutionCore.checkIsNumericType(structField) || ExecutionCore.checkIsPointerType(structField)) {
        byteCount = ExecutionCore.retrieveNativeSize(structField);
        alignmentSize = byteCount;
      }
      else if (ExecutionCore.checkIsStructType(structField)) {
        byteCount = TypeDefinitions.types[structField].linearSize;
        alignmentSize = TypeDefinitions.types[structField].alignmentSize;
      }
      else {
        throw "Ambiguous type in structure: " + structField + ", within " + dataType.typeNameId + " :: " + debugDump(TypeDefinitions.types[dataType.typeNameId]);
      }
      alignmentSize = dataType.isPacked ? 1 : Math.min(alignmentSize, ExecutionCore.ALIGNMENT_QUANTUM);
      dataType.alignmentSize = Math.max(dataType.alignmentSize, alignmentSize);
      var currentOffset = ExecutionCore.alignMemoryAddress(dataType.linearSize, alignmentSize);
      dataType.linearSize = currentOffset + byteCount;
      if (previousOffset >= 0) {
        differencesArray.push(currentOffset - previousOffset);
      }
      previousOffset = currentOffset;
      return currentOffset;
    }));
    dataType.linearSize = ExecutionCore.alignMemoryAddress(dataType.linearSize, dataType.alignmentSize);
    if (differencesArray.length == 0) {
      dataType.linearFactor = dataType.linearSize;
    }
    else if (ExecutionCore.removeDuplicates(differencesArray).length == 1) {
      dataType.linearFactor = differencesArray[0];
    }
    dataType.requiresFlattening = dataType.linearFactor != 1;
    return dataType.linearOffsets;
  },
  createStructureLayout: (function(structureData, structureTypeName, baseOffset) {
    var dataType, alignment;
    if (structureTypeName) {
      baseOffset = baseOffset || 0;
      dataType = (typeof TypeDefinitions === "undefined" ? ExecutionCore.typeRegistry : TypeDefinitions.types)[structureTypeName];
      if (!dataType) return null;
      verifyCondition(dataType.fields.length === structureData.length, "Field count mismatch for named type " + structureTypeName);
      alignment = dataType.linearOffsets;
    }
    else {
      var dataType = {
        fields: structureData.map((function(fieldItem) {
          return fieldItem[0];
        }))
      };
      alignment = ExecutionCore.computeStructureAlignment(dataType);
    }
    var resultSet = {
      _byteSize_: dataType.linearSize
    };
    if (structureTypeName) {
      structureData.forEach((function(fieldItem, idx) {
        if (typeof fieldItem === "string") {
          resultSet[fieldItem] = alignment[idx] + baseOffset;
        }
        else {
          var propKey;
          for (var k in fieldItem) propKey = k;
          resultSet[propKey] = ExecutionCore.createStructureLayout(fieldItem[propKey], dataType.fields[idx], alignment[idx]);
        }
      }));
    }
    else {
      structureData.forEach((function(fieldItem, idx) {
        resultSet[fieldItem[1]] = alignment[idx];
      }));
    }
    return resultSet;
  }),
  registerFunctionPtr: (function(callbackFn) {
    var resultSet = FUNCTION_POINTER_TABLE.length;
    FUNCTION_POINTER_TABLE.push(callbackFn);
    FUNCTION_POINTER_TABLE.push(0);
    return resultSet;
  }),
  allocateStackMemory: function allocateStackMemory(byteCount) {
    var resultSet = STACK_POINTER_TOP;
    STACK_POINTER_TOP += byteCount;
    STACK_POINTER_TOP = STACK_POINTER_TOP + 3 >> 2 << 2;
    return resultSet;
  },
  allocateStaticMemory: function allocateStaticMemory(byteCount) {
    var resultSet = STATIC_POINTER_TOP;
    STATIC_POINTER_TOP += byteCount;
    STATIC_POINTER_TOP = STATIC_POINTER_TOP + 3 >> 2 << 2;
    if (STATIC_POINTER_TOP >= TOTAL_ALLOC_MEMORY) expandMemoryCapacity();
    return resultSet;
  },
  alignMemoryAddress: function alignMemoryAddress(byteCount, alignQuantum) {
    var resultSet = byteCount = Math.ceil(byteCount / (alignQuantum ? alignQuantum : 4)) * (alignQuantum ? alignQuantum : 4);
    return resultSet;
  },
  constructBigInteger: function constructBigInteger(lowPart, highPart, isUnsigned) {
    var resultSet = isUnsigned ? (lowPart >>> 0) + (highPart >>> 0) * 4294967296 : (lowPart >>> 0) + (highPart | 0) * 4294967296;
    return resultSet;
  },
  ALIGNMENT_QUANTUM: 4,
  _padding_: 0
};
var ErrorTrackingSystem = {
  MAX_PERMITTED_ERRORS: 0,
  errorCount: 0,
  signatureMap: {},
  recordEvent: (function(eventType, isSuccessful, eventSignature) {
    if (!isSuccessful) {
      this.errorCount++;
      if (this.errorCount >= this.MAX_PERMITTED_ERRORS) terminateExecution("\n\nExcessive error corrections detected!");
    }
  }),
  output: (function() {})
};
var _EXCEPTION_OCCURRED_ = false;
var _HALT_PROCESS_ = false;
var _UNDEFINED_VALUE_ = 0;
var temporaryData, temporaryInt, temporaryBigInt, temporaryIntTwo, temporaryBigIntTwo, temporaryPair, temporaryBigIntI, temporaryBigIntR, temporaryBigIntS, temporaryBigIntP, temporaryBigIntD;
var temporaryI64, temporaryI64b;
function terminateExecution(errorMsg) {
  ProcessingUnit.outputMsg(errorMsg + ":\n" + (new Error()).stack);
  _HALT_PROCESS_ = true;
  throw "Verification error: " + errorMsg;
}
function verifyCondition(checkCondition, errorMsg) {
  if (!checkCondition) {
    terminateExecution("Verification failed: " + errorMsg);
  }
}
var currentGlobalContext = self;
function callExternalFunction(functionNameId, outputDataType, inputDataTypes, inputValues) {
  var stackSnapshot = 0;
  function convertToC(paramValue, paramType) {
    if (paramType == "string") {
      if (!stackSnapshot) stackSnapshot = ExecutionCore.memStackSave();
      var resultPtr = ExecutionCore.allocateStackMemory(paramValue.length + 1);
      storeStringIntoMemory(paramValue, resultPtr);
      return resultPtr;
    }
    else if (paramType == "array") {
      if (!stackSnapshot) stackSnapshot = ExecutionCore.memStackSave();
      var resultPtr = ExecutionCore.allocateStackMemory(paramValue.length);
      storeArrayIntoMemory(paramValue, resultPtr);
      return resultPtr;
    }
    return paramValue;
  }
  function convertFromC(paramValue, paramType) {
    if (paramType == "string") {
      return dereferenceToString(paramValue);
    }
    verifyCondition(paramType != "array", "Array type conversion from C is not supported.");
    return paramValue;
  }
  try {
    var targetFunction = eval("_" + functionNameId);
  }
  catch (err) {
    try {
      targetFunction = currentGlobalContext["ProcessingUnit"]["_" + functionNameId];
    }
    catch (err) {}
  }
  verifyCondition(targetFunction, "Unknown function called: " + functionNameId + " (possible removal by optimizer or closure)");
  var argIndex = 0;
  var cCompatibleArgs = inputValues ? inputValues.map((function(currentArg) {
    return convertToC(currentArg, inputDataTypes[argIndex++]);
  })) : [];
  var resultPtr = convertFromC(targetFunction.apply(null, cCompatibleArgs), outputDataType);
  if (stackSnapshot) ExecutionCore.memStackRestore(stackSnapshot);
  return resultPtr;
}
ProcessingUnit["callExternalFunction"] = callExternalFunction;
function wrapExternalFunction(functionNameId, outputDataType, inputDataTypes) {
  return (function() {
    return callExternalFunction(functionNameId, outputDataType, inputDataTypes, Array.prototype.slice.call(arguments));
  });
}
ProcessingUnit["wrapExternalFunction"] = wrapExternalFunction;
function writeMemoryValue(memoryAddress, dataToStore, dataType, unsafeAccess) {
  dataType = dataType || "i8";
  if (dataType[dataType.length - 1] === "*") dataType = "i32";
  switch (dataType) {
   case "i1":
    MEM_BUFFER_UINT8[memoryAddress] = dataToStore;
    break;
   case "i8":
    MEM_BUFFER_UINT8[memoryAddress] = dataToStore;
    break;
   case "i16":
    MEM_BUFFER_UINT16[memoryAddress >> 1] = dataToStore;
    break;
   case "i32":
    MEM_BUFFER_UINT32[memoryAddress >> 2] = dataToStore;
    break;
   case "i64":
    MEM_BUFFER_UINT32[memoryAddress >> 2] = dataToStore;
    break;
   case "float":
    MEM_BUFFER_FLOAT32[memoryAddress >> 2] = dataToStore;
    break;
   case "double":
    temporaryDoubleFloat64[0] = dataToStore, MEM_BUFFER_UINT32[memoryAddress >> 2] = temporaryDoubleInt32[0], MEM_BUFFER_UINT32[memoryAddress + 4 >> 2] = temporaryDoubleInt32[1];
    break;
   default:
    terminateExecution("Invalid type for writeMemoryValue: " + dataType);
  }
}
ProcessingUnit["writeMemoryValue"] = writeMemoryValue;
function readMemoryValue(memoryAddress, dataType, unsafeAccess) {
  dataType = dataType || "i8";
  if (dataType[dataType.length - 1] === "*") dataType = "i32";
  switch (dataType) {
   case "i1":
    return MEM_BUFFER_UINT8[memoryAddress];
   case "i8":
    return MEM_BUFFER_UINT8[memoryAddress];
   case "i16":
    return MEM_BUFFER_UINT16[memoryAddress >> 1];
   case "i32":
    return MEM_BUFFER_UINT32[memoryAddress >> 2];
   case "i64":
    return MEM_BUFFER_UINT32[memoryAddress >> 2];
   case "float":
    return MEM_BUFFER_FLOAT32[memoryAddress >> 2];
   case "double":
    return temporaryDoubleInt32[0] = MEM_BUFFER_UINT32[memoryAddress >> 2], temporaryDoubleInt32[1] = MEM_BUFFER_UINT32[memoryAddress + 4 >> 2], temporaryDoubleFloat64[0];
   default:
    terminateExecution("Invalid type for readMemoryValue: " + dataType);
  }
  return null;
}
ProcessingUnit["readMemoryValue"] = readMemoryValue;
var MEMORY_ALLOC_NORMAL = 0;
var MEMORY_ALLOC_STACK = 1;
var MEMORY_ALLOC_STATIC = 2;
ProcessingUnit["MEMORY_ALLOC_NORMAL"] = MEMORY_ALLOC_NORMAL;