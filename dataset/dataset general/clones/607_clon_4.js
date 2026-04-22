(function(scopeUniverse) {

  // --- Utility Enums and Constants ---
  const RuntimeEpoch = {
    NODE_CONTEXT: 1,
    WEB_CONTEXT: 2,
    WORKER_CONTEXT: 3,
    SHELL_CONTEXT: 4,
    UNKNOWN_CONTEXT: 0
  };

  const AllocationKind = {
    STANDARD: 0,
    STACK: 1,
    STATIC: 2
  };

  const WordBoundary = 4; // Equivalent to QUANTUM_SIZE

  const DoubleConversionBytes = 8;
  const FloatConversionBytes = 4;

  // --- Helper Functions (Replicating common utilities) ---
  const checkNumeric = (val) => typeof val === 'number';
  const checkPowerOfTwo = (val) => (val & (val - 1)) === 0 && val !== 0;
  const calculateLogBase2 = (val) => Math.log(val) / Math.log(2);
  const performCodeExecution = (codeSnippet) => Function(codeSnippet)(); // Replaces globalEval

  // Minimal mocks for external dependencies not defined in original snippet
  let currentMemoryBuffer = new ArrayBuffer(256 * 1024 * 1024); // Default 256MB
  let byteAccessor = new Uint8Array(currentMemoryBuffer); // HEAP8
  let shortAccessor = new Uint16Array(currentMemoryBuffer); // HEAP16
  let intAccessor = new Uint32Array(currentMemoryBuffer); // HEAP32
  let floatAccessor = new Float32Array(currentMemoryBuffer); // HEAPF32
  let doubleConversionArray = new Float64Array(currentMemoryBuffer, 0, DoubleConversionBytes / Float64Array.BYTES_PER_ELEMENT); // tempDoubleF64
  let intConversionArray = new Int32Array(currentMemoryBuffer, 0, DoubleConversionBytes / Int32Array.BYTES_PER_ELEMENT); // tempDoubleI32
  let funcRegistry = []; // FUNCTION_TABLE

  let stringEncoder = new TextEncoder();
  let stringDecoder = new TextDecoder();

  const writeStringIntoMemory = (textValue, memoryAddress) => {
    const encoded = stringEncoder.encode(textValue);
    for (let i = 0; i < encoded.length; i++) {
      byteAccessor[memoryAddress + i] = encoded[i];
    }
    byteAccessor[memoryAddress + encoded.length] = 0; // Null terminator
  };

  const writeArrayIntoMemory = (arrayValue, memoryAddress) => {
    for (let i = 0; i < arrayValue.length; i++) {
      byteAccessor[memoryAddress + i] = arrayValue[i];
    }
  };

  const readStringFromPointer = (memoryAddress) => {
    let length = 0;
    while (byteAccessor[memoryAddress + length] !== 0) {
      length++;
    }
    const subarray = byteAccessor.subarray(memoryAddress, memoryAddress + length);
    return stringDecoder.decode(subarray);
  };

  // Mock for `Types` and `dump`
  const TypeSchemaRegistry = {
    types: {}, // Mimics Types.types
    // Minimal dump function for debugging, if needed by assert/abort
    displayInfo: (obj) => JSON.stringify(obj, null, 2)
  };

  let totalMemoryLimit = currentMemoryBuffer.byteLength;
  const expandMemoryAllocation = () => {
    // This is a placeholder for `enlargeMemory` which is typically external.
    // In a real Emscripten context, this would expand the ArrayBuffer.
    // For this clone, we'll just throw if we hit the initial limit.
    throw new Error("Memory limit reached. Cannot expand memory dynamically.");
  };

  // --- Core Components ---

  class NumericalOperator {
    shiftQuad(lowPart, highPart, operation, bitsCount) {
      const bitMask = Math.pow(2, bitsCount) - 1;
      if (bitsCount < 32) {
        switch (operation) {
          case "shl":
            return [lowPart << bitsCount, (highPart << bitsCount) | ((lowPart & bitMask << (32 - bitsCount)) >>> (32 - bitsCount))];
          case "ashr":
            return [(lowPart >>> bitsCount | (highPart & bitMask) << (32 - bitsCount)) >> 0 >>> 0, highPart >> bitsCount >>> 0];
          case "lshr":
            return [(lowPart >>> bitsCount | (highPart & bitMask) << (32 - bitsCount)) >>> 0, highPart >>> bitsCount];
        }
      } else if (bitsCount === 32) {
        switch (operation) {
          case "shl":
            return [0, lowPart];
          case "ashr":
            return [highPart, (highPart | 0) < 0 ? bitMask : 0];
          case "lshr":
            return [highPart, 0];
        }
      } else {
        switch (operation) {
          case "shl":
            return [0, lowPart << (bitsCount - 32)];
          case "ashr":
            return [highPart >> (bitsCount - 32) >>> 0, (highPart | 0) < 0 ? bitMask : 0];
          case "lshr":
            return [highPart >>> (bitsCount - 32), 0];
        }
      }
      throw new Error("Invalid 64-bit shift operation: " + [lowPart, highPart, operation, bitsCount].join(', '));
    }

    binaryOrQuad(valX, valY) {
      const lowResult = (valX | 0) | (valY | 0);
      const highResult = (Math.round(valX / 4294967296) | Math.round(valY / 4294967296)) * 4294967296;
      return lowResult + highResult;
    }

    binaryAndQuad(valX, valY) {
      const lowResult = (valX | 0) & (valY | 0);
      const highResult = (Math.round(valX / 4294967296) & Math.round(valY / 4294967296)) * 4294967296;
      return lowResult + highResult;
    }

    binaryXorQuad(valX, valY) {
      const lowResult = (valX | 0) ^ (valY | 0);
      const highResult = (Math.round(valX / 4294967296) ^ Math.round(valY / 4294967296)) * 4294967296;
      return lowResult + highResult;
    }

    formBigInteger(lowVal, highVal, isUnsigned) {
      return isUnsigned ? (lowVal >>> 0) + (highVal >>> 0) * 4294967296 : (lowVal >>> 0) + (highVal | 0) * 4294967296;
    }
  }

  class IssueTracker {
    constructor(workUnitInstance) {
      this.workUnitRef = workUnitInstance;
      this.errorState = false;
      this.tempVal = undefined; // tempValue
      this.tempIntVal = undefined; // tempInt
      this.tempBigIntVal = undefined; // tempBigInt
      // ... other temp variables
      this.correctionAudit = { // CorrectionsMonitor
        maxErrorsAllowed: 0,
        errorsCount: 0,
        signatureMap: {},
        recordObservation: (type, success, signature) => {
          if (!success) {
            this.correctionAudit.errorsCount++;
            if (this.correctionAudit.errorsCount >= this.correctionAudit.maxErrorsAllowed) {
              this.haltExecution("\n\nExceeded maximum allowed corrections!");
            }
          }
        },
        displayReport: () => {}
      };
    }

    haltExecution(message) { // abort
      this.workUnitRef.outputStream(message + ":\n" + (new Error()).stack);
      this.errorState = true;
      throw new Error("Execution Aborted: " + message);
    }

    verifyCondition(condition, message) { // assert
      if (!condition) {
        this.haltExecution("Condition failed: " + message);
      }
    }
  }

  class MemoryOrchestrator {
    constructor(issueTrackerInstance, initialCapacity = 256 * 1024 * 1024) {
      this.errTracker = issueTrackerInstance;
      this.currentMemoryBlock = currentMemoryBuffer; // Use the global mock
      this.byteView = byteAccessor; // HEAP8
      this.shortView = shortAccessor; // HEAP16
      this.intView = intAccessor; // HEAP32
      this.floatView = floatAccessor; // HEAPF32
      this.doubleConversionBuffer = doubleConversionArray; // tempDoubleF64
      this.intConversionBuffer = intConversionArray; // tempDoubleI32

      this.stackPointer = 0; // STACKTOP
      this.staticPointer = 0; // STATICTOP
      this.totalMemoryCapacity = totalMemoryLimit; // TOTAL_MEMORY

      this.callableRegistry = funcRegistry; // FUNCTION_TABLE
    }

    saveStackState() { // stackSave
      return this.stackPointer;
    }

    restoreStackState(savedPointer) { // stackRestore
      this.stackPointer = savedPointer;
    }

    allocateStackSpace(byteSize) { // stackAlloc
      const currentPtr = this.stackPointer;
      this.stackPointer += byteSize;
      this.stackPointer = (this.stackPointer + 3) >> 2 << 2; // Align to 4 bytes
      return currentPtr;
    }

    allocateStaticSpace(byteSize) { // staticAlloc
      const currentPtr = this.staticPointer;
      this.staticPointer += byteSize;
      this.staticPointer = (this.staticPointer + 3) >> 2 << 2; // Align to 4 bytes
      if (this.staticPointer >= this.totalMemoryCapacity) {
        expandMemoryAllocation(); // Calls the external mock
      }
      return currentPtr;
    }

    padMemoryAddress(sizeInput, alignment = WordBoundary) { // alignMemory
      return Math.ceil(sizeInput / alignment) * alignment;
    }

    updateSlot(pointer, value, dataType = "i8") { // setValue
      let effectiveType = dataType;
      if (effectiveType.endsWith("*")) effectiveType = "i32"; // Pointers are 32-bit ints

      switch (effectiveType) {
        case "i1":
        case "i8":
          this.byteView[pointer] = value;
          break;
        case "i16":
          this.shortView[pointer >> 1] = value;
          break;
        case "i32":
        case "i64": // i64 stores only low 32 bits for setValue
          this.intView[pointer >> 2] = value;
          break;
        case "float":
          this.floatView[pointer >> 2] = value;
          break;
        case "double":
          this.doubleConversionBuffer[0] = value;
          this.intView[pointer >> 2] = this.intConversionBuffer[0];
          this.intView[(pointer + 4) >> 2] = this.intConversionBuffer[1];
          break;
        default:
          this.errTracker.haltExecution("Invalid data type for updateSlot: " + dataType);
      }
    }

    fetchSlot(pointer, dataType = "i8") { // getValue
      let effectiveType = dataType;
      if (effectiveType.endsWith("*")) effectiveType = "i32";

      switch (effectiveType) {
        case "i1":
        case "i8":
          return this.byteView[pointer];
        case "i16":
          return this.shortView[pointer >> 1];
        case "i32":
        case "i64": // i64 fetches only low 32 bits for getValue
          return this.intView[pointer >> 2];
        case "float":
          return this.floatView[pointer >> 2];
        case "double":
          this.intConversionBuffer[0] = this.intView[pointer >> 2];
          this.intConversionBuffer[1] = this.intView[(pointer + 4) >> 2];
          return this.doubleConversionBuffer[0];
        default:
          this.errTracker.haltExecution("Invalid data type for fetchSlot: " + dataType);
      }
      return null;
    }
  }

  class LayoutArchitect {
    constructor(issueTrackerInstance, defaultWord = WordBoundary) {
      this.errTracker = issueTrackerInstance;
      this.numericKinds = { // INT_TYPES
        "i1": 0,
        "i8": 0,
        "i16": 0,
        "i32": 0,
        "i64": 0
      };
      this.floatingPointKinds = { // FLOAT_TYPES
        "float": 0,
        "double": 0
      };
      this.defaultWordSize = defaultWord; // QUANTUM_SIZE
    }

    isNumericKind(kind) { // isNumberType
      return kind in this.numericKinds || kind in this.floatingPointKinds;
    }

    isPointerKind(kind) { // isPointerType
      return kind[kind.length - 1] === "*";
    }

    isStructureKind(kind) { // isStructType
      if (this.isPointerKind(kind)) return false;
      if (/^\[\d+\ x\ (.*)\]/.test(kind)) return true;
      if (/<?{ ?[^}]* ?}>?/.test(kind)) return true;
      return kind[0] === "%";
    }

    getNativeBytes(kind, wordSize) { // getNativeTypeSize
      if (this.defaultWordSize === 1) return 1;
      let sizeMap = {
        "%i1": 1,
        "%i8": 1,
        "%i16": 2,
        "%i32": 4,
        "%i64": 8,
        "%float": 4,
        "%double": 8
      };
      let size = sizeMap["%" + kind];
      if (!size) {
        if (kind[kind.length - 1] === "*") {
          size = this.defaultWordSize;
        } else if (kind[0] === "i") {
          const bits = parseInt(kind.substring(1));
          this.errTracker.verifyCondition(bits % 8 === 0, "Integer bit size must be a multiple of 8: " + kind);
          size = bits / 8;
        }
      }
      return size;
    }

    getNativeFieldBytes(kind) { // getNativeFieldSize
      return Math.max(this.getNativeBytes(kind), this.defaultWordSize);
    }

    removeDuplicates(items, keyIdentifier) { // dedup
      const seenItems = {};
      const uniqueItems = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const key = keyIdentifier ? item[keyIdentifier] : item;
        if (!seenItems[key]) {
          seenItems[key] = true;
          uniqueItems.push(item);
        }
      }
      return uniqueItems;
    }

    createKeyedObject() { // set
      const args = typeof arguments[0] === "object" ? arguments[0] : arguments;
      const resultObj = {};
      for (let i = 0; i < args.length; i++) {
        resultObj[args[i]] = 0;
      }
      return resultObj;
    }

    computeStructureLayout(structureDefinition) { // calculateStructAlignment
      structureDefinition.flatSize = 0;
      structureDefinition.alignSize = 0;
      const offsetDifferences = [];
      let previousOffset = -1;
      structureDefinition.flatIndexes = [];

      for (let i = 0; i < structureDefinition.fields.length; i++) {
        const field = structureDefinition.fields[i];
        let fieldSize, fieldAlignSize;

        if (this.isNumericKind(field) || this.isPointerKind(field)) {
          fieldSize = this.getNativeBytes(field);
          fieldAlignSize = fieldSize;
        } else if (this.isStructureKind(field)) {
          const nestedStruct = (TypeSchemaRegistry.types)[field]; // Mimics Types.types
          fieldSize = nestedStruct.flatSize;
          fieldAlignSize = nestedStruct.alignSize;
        } else {
          this.errTracker.haltExecution("Unclear type in struct: " + field + ", in " + structureDefinition.name_ + " :: " + TypeSchemaRegistry.displayInfo(TypeSchemaRegistry.types[structureDefinition.name_]));
        }

        fieldAlignSize = structureDefinition.packed ? 1 : Math.min(fieldAlignSize, this.defaultWordSize);
        structureDefinition.alignSize = Math.max(structureDefinition.alignSize, fieldAlignSize);

        const currentOffset = this.memOrchestrator.padMemoryAddress(structureDefinition.flatSize, fieldAlignSize);
        structureDefinition.flatSize = currentOffset + fieldSize;
        if (previousOffset >= 0) {
          offsetDifferences.push(currentOffset - previousOffset);
        }
        previousOffset = currentOffset;
        structureDefinition.flatIndexes.push(currentOffset);
      }

      structureDefinition.flatSize = this.memOrchestrator.padMemoryAddress(structureDefinition.flatSize, structureDefinition.alignSize);

      if (offsetDifferences.length === 0) {
        structureDefinition.flatFactor = structureDefinition.flatSize;
      } else if (this.removeDuplicates(offsetDifferences).length === 1) {
        structureDefinition.flatFactor = offsetDifferences[0];
      }
      structureDefinition.needsFlattening = structureDefinition.flatFactor !== 1;
      return structureDefinition.flatIndexes;
    }

    generateStructureDescription(structFields, typeName, baseOffset = 0) { // generateStructInfo
      let structType, alignmentIndices;
      if (typeName) {
        structType = (TypeSchemaRegistry.types)[typeName]; // Mimics Types.types
        if (!structType) return null;
        this.errTracker.verifyCondition(structType.fields.length === structFields.length, "Number of named fields must match the type for " + typeName);
        alignmentIndices = structType.flatIndexes;
      } else {
        structType = {
          fields: structFields.map((item) => item[0])
        };
        alignmentIndices = this.computeStructureLayout(structType);
      }

      const returnDescription = {
        _byteSize_: structType.flatSize
      }; // __size__

      if (typeName) {
        for (let i = 0; i < structFields.length; i++) {
          const item = structFields[i];
          if (typeof item === "string") {
            returnDescription[item] = alignmentIndices[i] + baseOffset;
          } else {
            let key;
            for (const k in item) key = k;
            returnDescription[key] = this.generateStructureDescription(item[key], structType.fields[i], alignmentIndices[i]);
          }
        }
      } else {
        for (let i = 0; i < structFields.length; i++) {
          returnDescription[structFields[i][1]] = alignmentIndices[i];
        }
      }
      return returnDescription;
    }
  }

  class InterfaceBridge {
    constructor(memOrchestratorInstance, issueTrackerInstance, workUnitInstance, globalContext) {
      this.memOrchestrator = memOrchestratorInstance;
      this.errTracker = issueTrackerInstance;
      this.workUnitRef = workUnitInstance;
      this.globalContextRef = globalContext;
    }

    transformToC(value, type) { // ccall internal toC
      let stackSnapshot = 0;
      if (type === "string") {
        if (!stackSnapshot) stackSnapshot = this.memOrchestrator.saveStackState();
        const allocatedPtr = this.memOrchestrator.allocateStackSpace(value.length + 1);
        writeStringIntoMemory(value, allocatedPtr);
        return allocatedPtr;
      } else if (type === "array") {
        if (!stackSnapshot) stackSnapshot = this.memOrchestrator.saveStackState();
        const allocatedPtr = this.memOrchestrator.allocateStackSpace(value.length);
        writeArrayIntoMemory(value, allocatedPtr);
        return allocatedPtr;
      }
      return value;
    }

    transformFromC(value, type) { // ccall internal fromC
      if (type === "string") {
        return readStringFromPointer(value);
      }
      this.errTracker.verifyCondition(type !== "array", "Cannot retrieve array from C directly.");
      return value;
    }

    invokeForeignFunction(identifier, resultType, argumentTypes, argumentValues) { // ccall
      let temporaryStack = 0;
      try {
        let targetFunction = null;
        try {
          targetFunction = eval("_" + identifier); // Direct eval attempt
        } catch (e) {
          // Fallback to Module._ident
          targetFunction = this.globalContextRef["WorkUnit"]["_" + identifier];
        }

        this.errTracker.verifyCondition(targetFunction, "Failed to locate native function " + identifier + " (optimizations or closure might have removed it?)");

        let argIndex = 0;
        const cFormattedArgs = argumentValues ? argumentValues.map((arg) => {
          return this.transformToC(arg, argumentTypes[argIndex++]);
        }) : [];

        const functionResult = this.transformFromC(targetFunction.apply(null, cFormattedArgs), resultType);

        if (temporaryStack) this.memOrchestrator.restoreStackState(temporaryStack);
        return functionResult;
      } catch (e) {
        if (temporaryStack) this.memOrchestrator.restoreStackState(temporaryStack);
        throw e;
      }
    }

    createForeignWrapper(identifier, resultType, argumentTypes) { // cwrap
      return (...args) => {
        return this.invokeForeignFunction(identifier, resultType, argumentTypes, args);
      };
    }
  }

  class OperationCenter {
    constructor(globalContext) {
      this.globalContext = globalContext;

      // Module Initialization (Replaces try/catch for Module)
      this.workUnit = globalContext && globalContext["WorkUnit"] ? globalContext["WorkUnit"] : {};
      if (!globalContext["WorkUnit"]) {
        globalContext["WorkUnit"] = this.workUnit;
      }

      this.issueTracker = new IssueTracker(this.workUnit);
      this.numericalOperator = new NumericalOperator();
      this.memOrchestrator = new MemoryOrchestrator(this.issueTracker);
      this.typeArchitect = new LayoutArchitect(this.issueTracker);
      this.interfaceBridge = new InterfaceBridge(this.memOrchestrator, this.issueTracker, this.workUnit, this.globalContext);

      // Link MemoryOrchestrator to TypeArchitect for padMemoryAddress
      this.typeArchitect.memOrchestrator = this.memOrchestrator;

      this.currentRuntimeEnv = OperationCenter.determineRuntimeContext(globalContext);
      this.configureEnvironment();
      this.finalizeWorkUnitSetup();
    }

    static determineRuntimeContext(globalContext) { // ENVIRONMENT_IS_NODE, etc.
      if (typeof globalContext.process === "object" && typeof globalContext.process.versions === "object" && typeof globalContext.process.versions.node !== "undefined") {
        return RuntimeEpoch.NODE_CONTEXT;
      }
      if (typeof globalContext.window === "object" && typeof globalContext.document === "object") {
        return RuntimeEpoch.WEB_CONTEXT;
      }
      if (typeof globalContext.importScripts === "function") {
        return RuntimeEpoch.WORKER_CONTEXT;
      }
      // Shell context: not web, not node, not worker. Check for specific shell globals.
      if (!globalContext.window && !globalContext.process && typeof globalContext.print === "function") {
        return RuntimeEpoch.SHELL_CONTEXT;
      }
      return RuntimeEpoch.UNKNOWN_CONTEXT;
    }

    configureEnvironment() { // if/else if chain for ENVIRONMENT_IS_NODE etc.
      const configMap = {
        [RuntimeEpoch.NODE_CONTEXT]: () => {
          const nodeFs = require("fs");
          const nodePath = require("path");

          this.workUnit.outputStream = (text) => {
            nodeFs.writeSync(process.stdout.fd, text + "\n");
          };
          this.workUnit.errorStream = (text) => {
            nodeFs.writeSync(process.stderr.fd, text + "\n");
          };
          this.workUnit.dataFetcher = (filePath) => {
            filePath = nodePath.normalize(filePath);
            let content = nodeFs.readFileSync(filePath).toString();
            if (!content && filePath !== nodePath.resolve(filePath)) {
              // Assuming __dirname exists in Node context
              filePath = nodePath.join(__dirname, "..", "src", filePath);
              content = nodeFs.readFileSync(filePath).toString();
            }
            return content;
          };
          this.workUnit.scriptLoader = (scriptFile) => {
            performCodeExecution(this.workUnit.dataFetcher(scriptFile));
          };
          if (!this.workUnit.commandArgs) {
            this.workUnit.commandArgs = process.argv.slice(2);
          }
        },
        [RuntimeEpoch.SHELL_CONTEXT]: () => {
          this.workUnit.outputStream = this.globalContext.print;
          this.workUnit.errorStream = this.globalContext.printErr;
          if (typeof this.globalContext.read !== "undefined") {
            this.workUnit.dataFetcher = this.globalContext.read;
          } else {
            this.workUnit.dataFetcher = (fileName) => this.globalContext.snarf(fileName);
          }
          if (!this.workUnit.commandArgs) {
            if (typeof this.globalContext.scriptArgs !== "undefined") {
              this.workUnit.commandArgs = this.globalContext.scriptArgs;
            } else if (typeof this.globalContext.arguments !== "undefined") {
              this.workUnit.commandArgs = this.globalContext.arguments;
            }
          }
        },
        [RuntimeEpoch.WEB_CONTEXT]: () => {
          if (!this.workUnit.outputStream) {
            this.workUnit.outputStream = (text) => console.log(text);
          }
          if (!this.workUnit.errorStream) {
            this.workUnit.errorStream = (text) => console.error(text);
          }
          this.workUnit.dataFetcher = (url) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", url, false); // Synchronous
            xhr.send(null);
            return xhr.responseText;
          };
          if (!this.workUnit.commandArgs) {
            if (typeof this.globalContext.arguments !== "undefined") {
              this.workUnit.commandArgs = this.globalContext.arguments;
            }
          }
        },
        [RuntimeEpoch.WORKER_CONTEXT]: () => {
          this.workUnit.scriptLoader = this.globalContext.importScripts;
        },
        [RuntimeEpoch.UNKNOWN_CONTEXT]: () => {
          this.issueTracker.haltExecution("Unrecognized execution environment. Unable to configure.");
        }
      };

      configMap[this.currentRuntimeEnv]();
    }

    finalizeWorkUnitSetup() { // Post-environment setup adjustments
      if (typeof this.workUnit.scriptLoader === "undefined" && this.workUnit.dataFetcher) {
        this.workUnit.scriptLoader = (file) => {
          performCodeExecution(this.workUnit.dataFetcher(file));
        };
      }

      if (!this.workUnit.errorStream) {
        this.workUnit.errorStream = () => {}; // Default no-op
      }

      if (!this.workUnit.outputStream) {
        this.workUnit.outputStream = this.workUnit.errorStream;
      }

      if (!this.workUnit.commandArgs) {
        this.workUnit.commandArgs = [];
      }

      // Aliasing for direct property access
      this.workUnit.output = this.workUnit.outputStream;
      this.workUnit.errorOutput = this.workUnit.errorStream;

      // Expose core functionalities via WorkUnit (Module)
      this.workUnit.invoke = this.interfaceBridge.invokeForeignFunction.bind(this.interfaceBridge); // ccall
      this.workUnit.wrap = this.interfaceBridge.createForeignWrapper.bind(this.interfaceBridge); // cwrap
      this.workUnit.alterMemory = this.memOrchestrator.updateSlot.bind(this.memOrchestrator); // setValue
      this.workUnit.queryMemory = this.memOrchestrator.fetchSlot.bind(this.memOrchestrator); // getValue

      // Expose allocation constants
      this.workUnit.NORMAL_ALLOC = AllocationKind.STANDARD;
      this.workUnit.STACK_ALLOC = AllocationKind.STACK;
      this.workUnit.STATIC_ALLOC = AllocationKind.STATIC;

      // Expose Runtime-like utilities (selected ones)
      this.workUnit.SystemTools = {
        saveStack: this.memOrchestrator.saveStackState.bind(this.memOrchestrator),
        restoreStack: this.memOrchestrator.restoreStackState.bind(this.memOrchestrator),
        forceAlignment: (target, quantum) => { // forceAlign
          quantum = quantum || WordBoundary;
          if (quantum === 1) return target;
          if (checkNumeric(target) && checkNumeric(quantum)) {
            return Math.ceil(target / quantum) * quantum;
          } else if (checkNumeric(quantum) && checkPowerOfTwo(quantum)) {
            const logValue = calculateLogBase2(quantum);
            return `((((${target})+${(quantum - 1)})>>${logValue})<<${logValue})`;
          }
          return `Math.ceil((${target})/${quantum})*${quantum}`;
        },
        isNumericType: this.typeArchitect.isNumericKind.bind(this.typeArchitect),
        isPointerType: this.typeArchitect.isPointerKind.bind(this.typeArchitect),
        isStructType: this.typeArchitect.isStructureKind.bind(this.typeArchitect),
        intTypes: this.typeArchitect.numericKinds,
        floatTypes: this.typeArchitect.floatingPointKinds,
        bitshift64: this.numericalOperator.shiftQuad.bind(this.numericalOperator),
        or64: this.numericalOperator.binaryOrQuad.bind(this.numericalOperator),
        and64: this.numericalOperator.binaryAndQuad.bind(this.numericalOperator),
        xor64: this.numericalOperator.binaryXorQuad.bind(this.numericalOperator),
        getNativeTypeSize: this.typeArchitect.getNativeBytes.bind(this.typeArchitect),
        getNativeFieldSize: this.typeArchitect.getNativeFieldBytes.bind(this.typeArchitect),
        deduplicate: this.typeArchitect.removeDuplicates.bind(this.typeArchitect),
        createSetObject: this.typeArchitect.createKeyedObject.bind(this.typeArchitect),
        calculateStructLayout: this.typeArchitect.computeStructureLayout.bind(this.typeArchitect),
        generateStructInfo: this.typeArchitect.generateStructureDescription.bind(this.typeArchitect),
        registerFunction: (func) => { // addFunction
          const index = this.memOrchestrator.callableRegistry.length;
          this.memOrchestrator.callableRegistry.push(func);
          this.memOrchestrator.callableRegistry.push(0); // Placeholder for signature, if needed
          return index;
        },
        stackAllocate: this.memOrchestrator.allocateStackSpace.bind(this.memOrchestrator),
        staticAllocate: this.memOrchestrator.allocateStaticSpace.bind(this.memOrchestrator),
        alignMemory: this.memOrchestrator.padMemoryAddress.bind(this.memOrchestrator),
        createBigInteger: this.numericalOperator.formBigInteger.bind(this.numericalOperator),
        wordSize: this.typeArchitect.defaultWordSize,
        _placeholder_: 0 // __dummy__
      };

      // Expose AuditLog (CorrectionsMonitor)
      this.workUnit.AuditLog = this.issueTracker.correctionAudit;

      // Expose assertion/abort directly if needed
      this.workUnit.assert = this.issueTracker.verifyCondition.bind(this.issueTracker);
      this.workUnit.abort = this.issueTracker.haltExecution.bind(this.issueTracker);
    }
  }

  // Instantiate the OperationCenter to kick off the entire setup process
  new OperationCenter(scopeUniverse);

})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : this)));