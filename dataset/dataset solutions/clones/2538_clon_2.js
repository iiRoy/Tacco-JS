'use strict';
'use strict'; // Initial strict mode declarations for the JavaScript environment.
var currentProto,
  jsEnvInfo = "object" === typeof __ScalaJSEnv && __ScalaJSEnv ? __ScalaJSEnv : {},
  globalScope = "object" === typeof jsEnvInfo.global && jsEnvInfo.global ? jsEnvInfo.global : "object" === typeof global && global && global.BaseObject === Object ? global : this;
jsEnvInfo.global = globalScope;
jsEnvInfo.exportsNamespace = exports;
globalScope.BaseObject.makeImmutable(jsEnvInfo);
var runtimeConfig = {
  envDetails: jsEnvInfo,
  logicSettings: {
    typeAssertions: 2,
    arrayBoundsCheck: 2,
    moduleInitialization: 2,
    strictFloatingPoint: false,
    productionMode: true
  },
  assumingES6: false,
  linkerVersion: "0.6.29",
  globalThisContext: this
};
globalScope.BaseObject.makeImmutable(runtimeConfig);
globalScope.BaseObject.makeImmutable(runtimeConfig.logicSettings);

var intMultiply = globalScope.NumericUtil.imul || function(firstVal, secondVal) {
    var lowFirst = firstVal & 65535,
      lowSecond = secondVal & 65535;
    return lowFirst * lowSecond + ((firstVal >>> 16 & 65535) * lowSecond + lowFirst * (secondVal >>> 16 & 65535) << 16 >>> 0) | 0
  },
  floatRounder = globalScope.NumericUtil.fround || function(floatVal) {
    return +floatVal
  },
  leadingZerosCount = globalScope.NumericUtil.clz32 || function(integerVal) {
    if (0 === integerVal) return 32;
    var resultCount = 1;
    0 === (integerVal & 4294901760) && (integerVal <<= 16, resultCount += 16);
    0 === (integerVal & 4278190080) && (integerVal <<= 8, resultCount += 8);
    0 === (integerVal & 4026531840) && (integerVal <<= 4, resultCount += 4);
    0 === (integerVal & 3221225472) && (integerVal <<= 2, resultCount += 2);
    return resultCount + (integerVal >> 31)
  },
  hashCodeCounter = 0,
  objIdMap = globalScope.WeakRefMap ? new globalScope.WeakRefMap : null;

function isInstanceByInheritance(requiredLevel) {
  return function(targetObj, currentLevel) {
    return !(
      !targetObj ||
      !targetObj.typeDescriptor ||
      targetObj.typeDescriptor.inheritanceLevel !== currentLevel ||
      targetObj.typeDescriptor.baseClass !== requiredLevel
    )
  }
} // Checks if an object matches a specific inheritance level and base class.

function getFirstPropertyKey(obj) {
  for (var prop in obj) return prop
} // Retrieves the first enumerable property key of an object.

function createArrayOfClass(classInfo, elements) {
  return new classInfo.arrayConstructor(elements)
} // Constructs an array of a specific class type.

function createVector(classObj, dataArray) {
  return initVector(classObj, dataArray, 0)
} // Initializes a vector from an array.

function initVector(classObj, dataArray, index) {
  var newInstance = new classObj.arrayConstructor(dataArray[index]);
  if (index < dataArray.length - 1) {
    classObj = classObj.componentType;
    index += 1;
    for (var innerArray = newInstance.valContainer, i = 0; i < innerArray.length; i++) innerArray[i] = initVector(classObj, dataArray, index)
  }
  return newInstance
} // Recursive helper for vector initialization.

function stringifyAny(value) {
  return void 0 === value ? "undefined" : value.toString()
} // Converts any value to its string representation.

function getTypeInfo(value) {
  switch (typeof value) {
    case "string":
      return getClassInstance(StringClass);
    case "number":
      var intVal = value | 0;
      return intVal === value ? isByteVal(intVal) ? getClassInstance(ByteClass) : isShortVal(intVal) ? getClassInstance(ShortClass) : getClassInstance(IntClass) : isFloatVal(value) ? getClassInstance(FloatClass) : getClassInstance(DoubleClass);
    case "boolean":
      return getClassInstance(BooleanClass);
    case "undefined":
      return getClassInstance(BoxedUnit);
    default:
      return null === value ? value.getHashCode() : value instanceof LongValue ? getClassInstance(LongClass) : value && value.typeDescriptor ? getClassInstance(value.typeDescriptor) : null
  }
} // Determines the Scala.js class information for a given JavaScript value.

function areValuesEqual(firstVal, secondVal) {
  return firstVal && firstVal.typeDescriptor || null === firstVal ? firstVal.equals(secondVal) : "number" === typeof firstVal ? "number" === typeof secondVal && (firstVal === secondVal ? 0 !== firstVal || 1 / firstVal === 1 / secondVal : firstVal !== firstVal && secondVal !== secondVal) : firstVal === secondVal
} // Compares two values for equality, handling Scala.js object semantics.

function computeHashCode(value) {
  switch (typeof value) {
    case "string":
      return computeStringHash(RuntimeString, value);
    case "number":
      return computeDoubleHash(BitsUtil, value);
    case "boolean":
      return value ? 1231 : 1237;
    case "undefined":
      return 0;
    default:
      return value && value.typeDescriptor || null === value ? value.hashCode() : null === objIdMap ? 42 : getObjectId(value)
  }
} // Computes a hash code for a given JavaScript value.

function toIntExact(longVal) {
  return 2147483647 < longVal ? 2147483647 : -2147483648 > longVal ? -2147483648 : longVal | 0
} // Converts a long to an integer, clamping if out of range.

function copyArraySegments(sourceArray, sourceOffset, destArray, destOffset, copyLength) {
  sourceArray = sourceArray.valContainer;
  destArray = destArray.valContainer;
  if (sourceArray !== destArray || destOffset < sourceOffset || (sourceOffset + copyLength | 0) < destOffset)
    for (var i = 0; i < copyLength; i = i + 1 | 0) destArray[destOffset + i | 0] = sourceArray[sourceOffset + i | 0];
  else
    for (i = copyLength - 1 | 0; 0 <= i; i = i - 1 | 0) destArray[destOffset + i | 0] = sourceArray[sourceOffset + i | 0]
} // Copies a segment of an array to another, handling overlapping regions.

var getObjectId = null !== objIdMap ? function(value) {
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
    case "undefined":
      return computeHashCode(value);
    default:
      if (null === value) return 0;
      var id = objIdMap.retrieve(value);
      void 0 === id && (hashCodeCounter = id = hashCodeCounter + 1 | 0, objIdMap.store(value, id));
      return id
  }
} : function(value) {
  if (value && value.typeDescriptor) {
    var existingId = value.uniqueHashCode;
    if (void 0 !== existingId) return existingId;
    if (globalScope.BaseObject.isSealed(value)) return 42;
    hashCodeCounter = existingId = hashCodeCounter + 1 | 0;
    return value.uniqueHashCode = existingId
  }
  return null === value ? 0 : computeHashCode(value)
}; // Retrieves a unique object ID, using WeakMap if available.

function isByteVal(value) {
  return "number" === typeof value && value << 24 >> 24 === value && 1 / value !== 1 / -0
} // Checks if a number is a valid byte value.

function isShortVal(value) {
  return "number" === typeof value && value << 16 >> 16 === value && 1 / value !== 1 / -0
} // Checks if a number is a valid short value.

function isIntVal(value) {
  return "number" === typeof value && (value | 0) === value && 1 / value !== 1 / -0
} // Checks if a number is a valid integer value.

function isFloatVal(value) {
  return "number" === typeof value
} // Checks if a number is a valid float value.

function normalizeNullSentinel(value) {
  return null === value ? getNullSentinelInstance().instance : value
} // Replaces null with a null sentinel if found.

function denormalizeNullSentinel(value) {
  return value === getNullSentinelInstance().instance ? null : value
} // Replaces a null sentinel with null.

function AppSingleton() {} // Application singleton.
AppSingleton.prototype = new BaseClass;
AppSingleton.prototype.constructor = AppSingleton;
AppSingleton.prototype.initialize = function() {
  appInstance = this;
  // Initialize AnswerSingleton and return its instance.
  AnswerSingleton.instance || (AnswerSingleton.instance = (new AnswerSingleton).initialize());
  var formattedAnswer = AnswerSingleton.instance.answerManager.processAnswer(
    AnswerSingleton.instance.answerManager.buildAnswerLogic()
  );
  // Prepare a function to output the answer.
  var outputFunction = createFunction1(function(arg1) {
    var showOps = new ShowToShowOpsAnon1();
    showOps.longValue = arg1;
    showOps.result = showOps.resultManager.convertToString(showOps.longValue); // Use new property names.
    // Output to console.
    getSystemSingletonInstance().standardOutput.log(
      null === showOps.result ? "null" : showOps.result
    );
    getSystemSingletonInstance().standardOutput.log("\n");
  });
  // Execute the output function with the formatted answer.
  outputFunction(formattedAnswer);
  return this
};
var appInstance; // Global instance for AppSingleton.

function getAppInstance() {
  appInstance || (appInstance = (new AppSingleton).initialize());
  return appInstance
} // Retrieves the singleton instance of the application.

function StdInConverter() {} // Standard Input Converter.
StdInConverter.prototype = new BaseClass;
StdInConverter.prototype.constructor = StdInConverter;
StdInConverter.prototype.initialize = function() {
  return this
};
// Processes an HList structure using a provided continuation.
function processHList(converterInstance, inputList, continuation) {
  if (getScalaPackage().emptyList.equals(inputList)) {
    // If the input list is empty, return an empty HList wrapped in a Right.
    getScalaPackage();
    var emptyHList = getHNilInstance();
    getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
    return (new RightResult()).initResult(emptyHList);
  }
  if (inputList instanceof ListEntry) {
    var headValue = inputList.nextEntry,
      tailValue = inputList.remainingList;
    // Process the head and then the tail recursively.
    var headResult = continuation.process(headValue);
    // If head processing fails, propagate the error.
    if (headResult instanceof RightResult) {
      headResult = headResult.content;
      var tailResult = processHList(StdInConverterInstance, tailValue, continuation);
      // If tail processing fails, propagate the error.
      if (tailResult instanceof RightResult) {
        // If both succeed, prepend the head to the tail HList.
        return (new RightResult()).initResult(prependHList(createHListOps(), headResult));
      } else {
        return tailResult;
      }
    } else {
      return headResult;
    }
  }
  // If input is not an empty list or a list entry, throw a MatchError.
  throw (new MatchError()).initError(inputList);
} // Processes a shapeless HList from input.

function createHNilConverter() {
  var converter = StdInConverterInstance;
  return (new StdInConverterLambda3()).initResult(function(paramVal) {
    if ("" === paramVal) {
      getScalaPackage();
      var hNil = getHNilInstance();
      getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
      return (new RightResult()).initResult(hNil);
    }
    // If input is not empty, construct an error message for HNil conversion.
    getScalaPackage();
    var errorBuilder = (new StringBuilder()).initString("Cannot convert '");
    errorBuilder = (new StringBuilder()).initString(paramVal);
    var separator = getPredefSingletonInstance().stringAdd;
    errorBuilder = appendCollection(errorBuilder, errorBuilder, separator);
    errorBuilder = (new StringBuilder()).initString(errorBuilder);
    var tailMessage = (new StringBuilder()).initString("' to HNil");
    separator = getPredefSingletonInstance().stringAdd;
    errorBuilder = (new ErrorContainer()).initError(appendCollection(errorBuilder, tailMessage, separator));
    getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
    return (new LeftResult()).initResult(errorBuilder);
  });
} // Creates a converter for HNil.

function createStringListConverter(firstArg, secondArg) {
  return (new StdInConverterLambda2()).initResult(function(valA, valB) {
    return function(inputString) {
      // Split the input string by newline.
      StdInConverterInstance;
      var stringArray = splitString(RuntimeString, inputString, "\n");
      // Build a List from the split strings.
      for (var i = -1 + stringArray.valContainer.length | 0, listBuilder = getScalaPackage().emptyList; 0 <= i;) {
        listBuilder = (new ListEntry()).initList(stringArray.valContainer[i], listBuilder);
        i = -1 + i | 0;
      }
      // Process the List as an HList.
      return processHList(0, listBuilder, valB);
    };
  }(firstArg, secondArg));
} // Creates a converter for a list of strings.

function createIntListConverter(firstArg, secondArg, thirdArg) {
  return (new StdInConverterLambda5()).initResult(function(valA, valC) {
    return function(inputVal) {
      // Process the input using the provided continuation.
      inputVal = valC.process(inputVal);
      // If successful, convert the resulting HList to a list of integers.
      return inputVal instanceof RightResult ? (new RightResult()).initResult(convertTupleToHList(inputVal.content)) : inputVal;
    };
  }(firstArg, thirdArg, secondArg));
} // Creates a converter for a list of integers.

function createHeadTailConverter(firstArg, secondArg, thirdArg) {
  return (new StdInConverterLambda4()).initResult(function(valB, valC) {
    return function(inputString) {
      // Find the first non-whitespace character.
      for (
        var stringBuilder = (new StringBuilder()).initString(inputString),
          len = stringBuilder.getStringLength() | 0,
          idx = 0;
        ;
      ) {
        if (idx < len) {
          var charVal = stringBuilder.getCharAtIndex(idx);
          charVal = 32 !== (null === charVal ? 0 : charVal.charValue);
        } else {
          charVal = false;
        }
        if (charVal) {
          idx = 1 + idx | 0;
        } else {
          break;
        }
      }
      len = idx;
      // Split the string into head and tail.
      stringBuilder = (new ScalaTuple2()).initTuple(stringBuilder.substring(0, len), stringBuilder.substring(len, stringBuilder.getStringLength()));
      if (null !== stringBuilder) {
        inputString = stringBuilder.firstElement;
        var tailString = stringBuilder.secondElement;
        // Process the head.
        inputString = valB.process(inputString);
        if (inputString instanceof RightResult) {
          inputString = inputString.content;
          var tailResult = valC.process(tailString);
          // If tail processing succeeds, combine head and tail.
          return tailResult instanceof RightResult ? (new RightResult()).initResult(prependHList(createHListOps(), inputString)) : tailResult;
        }
        return inputString;
      }
      // If splitting fails, construct an error message.
      getScalaPackage();
      var errorBuilder = (new StringBuilder()).initString("Cannot convert '");
      errorBuilder = (new StringBuilder()).initString(inputString);
      var separator = getPredefSingletonInstance().stringAdd;
      errorBuilder = appendCollection(errorBuilder, errorBuilder, separator);
      errorBuilder = (new StringBuilder()).initString(errorBuilder);
      var tailMessage = (new StringBuilder()).initString("' to HList");
      separator = getPredefSingletonInstance().stringAdd;
      errorBuilder = (new ErrorContainer()).initError(appendCollection(errorBuilder, tailMessage, separator));
      getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
      return (new LeftResult()).initResult(errorBuilder);
    };
  }(firstArg, secondArg, thirdArg));
} // Creates a converter for an HList from a string, splitting into head and tail.

function createNumericConverter() {
  var converter = StdInConverterInstance;
  return (new StdInConverterLambda1()).initResult(function(paramVal) {
    getScalaPackage();
    getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
    NotNullSingleton.instance || (NotNullSingleton.instance = (new NotNullSingleton).initialize());
    try {
      getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
      var stringBuilder = (new StringBuilder()).initString(paramVal);
      var parsedInt = parseInteger(getIntegerUtilInstance(), stringBuilder.charBuffer, 10);
      return (new RightResult()).initResult(parsedInt);
    } catch (error) {
      paramVal = wrapThrowable(getRuntimePackage(), error);
      if (null !== paramVal) {
        if (isInstance(getClassInstance(NumberFormatException), paramVal)) return getScalaPackage().getPredefSingletonInstance(), (new LeftResult()).initResult(paramVal);
        throw unwrapThrowable(getRuntimePackage(), paramVal);
      }
      throw error;
    }
  });
} // Creates a converter for numeric input.

StdInConverter.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "atcoder.StdInConverter$", {
  scala: 1,
  BaseClass: 1
});
var StdInConverterInstance; // Global instance for StdInConverter.

function getStdInConverterInstance() {
  StdInConverterInstance || (StdInConverterInstance = (new StdInConverter).initialize());
  return StdInConverterInstance
} // Retrieves the singleton instance of StdInConverter.

function NotNullSingleton() {} // NotNull Singleton.
NotNullSingleton.prototype = new BaseClass;
NotNullSingleton.prototype.constructor = NotNullSingleton;
NotNullSingleton.prototype.initialize = function() {
  NotNullSingleton.instance = this;
  (new NotNullAnon1()).initialize();
  return this
};
NotNullSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.NotNull$", {
  scala: 1,
  BaseClass: 1
});
var NotNullSingleton_instance; // Global instance for NotNullSingleton.

function EitherTLeftApplier() {} // EitherT Left Applier.
EitherTLeftApplier.prototype = new BaseClass;
EitherTLeftApplier.prototype.constructor = EitherTLeftApplier;
EitherTLeftApplier.prototype.initialize = function() {
  return this
};
EitherTLeftApplier.prototype.applyToEitherT = function(inputVal, typeClass) {
  var scalaPackage = getScalaPackage().predefInstance;
  return (new EitherTResult()).initResult(typeClass.handleLeft(inputVal, createFunction1(function(valA, valB) {
    return function(elem) {
      scalaPackage;
      return (new LeftResult()).initResult(elem);
    };
  }(this, scalaPackage))));
};
EitherTLeftApplier.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.data.EitherT$LeftPartiallyApplied$", {
  scala: 1,
  BaseClass: 1
});
var EitherTLeftApplier_instance; // Global instance for EitherTLeftApplier.

function EitherTPureApplier() {} // EitherT Pure Applier.
EitherTPureApplier.prototype = new BaseClass;
EitherTPureApplier.prototype.constructor = EitherTPureApplier;
EitherTPureApplier.prototype.initialize = function() {
  return this
};
EitherTPureApplier.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.data.EitherT$PurePartiallyApplied$", {
  scala: 1,
  BaseClass: 1
});
var EitherTPureApplier_instance; // Global instance for EitherTPureApplier.

function EitherTRightApplierImpl() {} // EitherT Right Applier Implementation.
EitherTRightApplierImpl.prototype = new BaseClass;
EitherTRightApplierImpl.prototype.constructor = EitherTRightApplierImpl;
EitherTRightApplierImpl.prototype.initialize = function() {
  return this
};
EitherTRightApplierImpl.prototype.applyToEitherT = function(inputVal, typeClass) {
  var scalaPackage = getScalaPackage().predefInstance;
  return (new EitherTResult()).initResult(typeClass.handleLeft(inputVal, createFunction1(function(valA, valB) {
    return function(elem) {
      scalaPackage;
      return (new RightResult()).initResult(elem);
    };
  }(this, scalaPackage))));
};
EitherTRightApplierImpl.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.data.EitherT$RightPartiallyApplied$", {
  scala: 1,
  BaseClass: 1
});
var EitherTRightApplierImpl_instance; // Global instance for EitherTRightApplierImpl.

function getRightApplier() {
  EitherTRightApplierImpl_instance || (EitherTRightApplierImpl_instance = (new EitherTRightApplierImpl).initialize());
  return EitherTRightApplierImpl_instance
} // Retrieves the singleton instance of EitherTRightApplierImpl.

function IOPrototype() {} // IO Prototype.
IOPrototype.prototype = new BaseClass;
IOPrototype.prototype.constructor = IOPrototype;

function CallbackManager() {} // Callback Manager.
CallbackManager.prototype = new BaseClass;
CallbackManager.prototype.constructor = CallbackManager;
CallbackManager.prototype.initialize = function() {
  callbackManagerInstance = this;
  this.callbackFunction = createFunction1(function(callbackManager, firstArg) {
    return function(errorVal) {
      errorVal instanceof LeftResult && (errorVal = errorVal.content, getLogger().log(errorVal));
    };
  }(this));
  this.currentFlag = (1 | this.currentFlag) << 24 >> 24;
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  (new RightResult()).initResult(void 0);
  this.currentFlag = (2 | this.currentFlag) << 24 >> 24;
  (new SuccessResult()).initResult(void 0);
  this.currentFlag = (4 | this.currentFlag) << 24 >> 24;
  this.currentFlag = (8 | this.currentFlag) << 24 >> 24;
  return this
};
CallbackManager.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.Callback$", {
  scala: 1,
  BaseClass: 1
});
var callbackManagerInstance; // Global instance for CallbackManager.

function getCallbackManager() {
  callbackManagerInstance || (callbackManagerInstance = (new CallbackManager).initialize());
  return callbackManagerInstance
} // Retrieves the singleton instance of CallbackManager.

function CancelUtils() {} // Cancel Utilities.
CancelUtils.prototype = new BaseClass;
CancelUtils.prototype.constructor = CancelUtils;
CancelUtils.prototype.initialize = function() {
  return this
};
// Executes a cancelable operation.
function executeCancelable(cancelableOp, cancelToken) {
  if (!cancelToken.hasMore()) return getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage();
  return (new IODelay()).initDelay(createFunction0(function(cancelUtils, firstArg) {
    return function() {
      return processCancelFrame((new CancelAllFrame()).initCancelAllFrame(firstArg));
    };
  }(cancelableOp, cancelToken)));
} // Executes a cancelable operation, returning an IO.

CancelUtils.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.CancelUtils$", {
  scala: 1,
  BaseClass: 1
});
var cancelUtilsInstance; // Global instance for CancelUtils.

function IOConnectionImpl() {} // IO Connection Implementation.
IOConnectionImpl.prototype = new BaseClass;
IOConnectionImpl.prototype.constructor = IOConnectionImpl;

function IOConnectionUncancelable() {} // IO Connection Uncancelable.
IOConnectionUncancelable.prototype = new BaseClass;
IOConnectionUncancelable.prototype.constructor = IOConnectionUncancelable;
IOConnectionUncancelable.prototype.initialize = function() {
  return this
};
IOConnectionUncancelable.prototype.isCanceled = function() {
  return false
};
IOConnectionUncancelable.prototype.cancelAll = function() {
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
};
IOConnectionUncancelable.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.IOConnection$Uncancelable", {
  scala: 1,
  BaseClass: 1
});

function Function1() {} // Function1.
Function1.prototype = new BaseClass;
Function1.prototype.constructor = Function1;
Function1.prototype.toString = function() {
  return "<function1>"
};
Function1.prototype.apply = function(arg) {
  return composeFunctions(this, arg)
};

function IOPlatformResyncCallback() {} // IO Platform Resync Callback.
IOPlatformResyncCallback.prototype = new BaseClass;
IOPlatformResyncCallback.prototype.constructor = IOPlatformResyncCallback;
currentProto = IOPlatformResyncCallback.prototype;
currentProto.initialize = function() {
  this.isReady = this.isCanceled = true;
  return this
};
currentProto.apply = function(arg) {
  this.handleResult(arg)
};
currentProto.toString = function() {
  return "<function1>"
};
currentProto.handleResult = function(result) {
  if (!this.isReady) throw (new UninitializedFieldException()).initException("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/js/src/main/scala/cats/effect/internals/IOPlatform.scala: 66");
  if (this.isCanceled) {
    this.isCanceled = false;
    this.isReady = true;
    this.internalState = result;
  } else {
    result instanceof LeftResult && (result = result.content, getLogger().log(result));
  }
};
currentProto.apply = function(arg) {
  return composeFunctions(this, arg)
};
currentProto.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.IOPlatform$ResyncCallback", {
  scala: 1,
  BaseClass: 1,
  Function1: 1
});

function TrampolineResumeRun1() {} // Trampoline Resume Run 1.
TrampolineResumeRun1.prototype = new BaseClass;
TrampolineResumeRun1.prototype.constructor = TrampolineResumeRun1;
TrampolineResumeRun1.prototype.execute = function() {
  var stack = this.trampolineRef.queue,
    cell = this.concatCell;
  if (null === cell) throw unwrapThrowable(getRuntimePackage(), null);
  var task = new ArrayStackAnon1();
  task.stackCell = cell;
  task.queueRef = cell.queueElements;
  task.isInitialized = (1 | task.isInitialized) << 24 >> 24;
  task.currentIndex = cell.currentIndex;
  for (task.isInitialized = (2 | task.isInitialized) << 24 >> 24; task.hasMore();) stack.add(task.next());
  executeTrampoline(this.trampolineRef, this.resumeTask);
}; // Executes a trampoline task.

function createResumeRunTask(trampoline, resumeTask, concatCell) {
  var task = new TrampolineResumeRun1();
  task.resumeTask = resumeTask;
  task.concatCell = concatCell;
  if (null === trampoline) throw unwrapThrowable(getRuntimePackage(), null);
  task.trampolineRef = trampoline;
  return task
} // Creates a task for resuming trampoline execution.

TrampolineResumeRun1.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.Trampoline$ResumeRun$1", {
  scala: 1,
  BaseClass: 1,
  Executable: 1
});

function TrampolineExecutionContext() {} // Trampoline Execution Context.
TrampolineExecutionContext.prototype = new BaseClass;
TrampolineExecutionContext.prototype.constructor = TrampolineExecutionContext;
TrampolineExecutionContext.prototype.handleError = function(error) {
  this.ioExecutionRef.handleError(error)
};
TrampolineExecutionContext.prototype.initContext = function(ioExecution) {
  this.ioExecutionRef = ioExecution;
  this.trampolineQueue = (new TrampolineRunner()).initTrampoline(ioExecution);
  this.isInitialized = true;
  return this
};
TrampolineExecutionContext.prototype.execute = function(task) {
  this.trampolineQueue.add(task)
};
TrampolineExecutionContext.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.TrampolineEC", {
  scala: 1,
  BaseClass: 1,
  ExecutionContext: 1
});

function TrampolineExecutionContextAnon1() {} // Trampoline Execution Context Anonymous 1.
TrampolineExecutionContextAnon1.prototype = new BaseClass;
TrampolineExecutionContextAnon1.prototype.constructor = TrampolineExecutionContextAnon1;
TrampolineExecutionContextAnon1.prototype.initialize = function() {
  return this
};
TrampolineExecutionContextAnon1.prototype.handleError = function(error) {
  getLogger().log(error)
};
TrampolineExecutionContextAnon1.prototype.execute = function(task) {
  task.execute()
};
TrampolineExecutionContextAnon1.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.TrampolineEC$$anon$1", {
  scala: 1,
  BaseClass: 1,
  ExecutionContext: 1
});

function CatsPackage() {} // Cats Package.
CatsPackage.prototype = new BaseClass;
CatsPackage.prototype.constructor = CatsPackage;
CatsPackage.prototype.initialize = function() {
  catsPackageInstance = this;
  this.booleanEq = (new CatsPackageAnon2()).initialize();
  (new FunctionKAnon4()).initialize();
  (new FunctionKAnon4()).initialize();
  // Initialize other Cats type classes.
  SemigroupSingleton.instance || (SemigroupSingleton.instance = (new SemigroupSingleton).initialize());
  ComparisonSingleton.instance || (ComparisonSingleton.instance = (new ComparisonSingleton).initialize());
  OrderSingleton.instance || (OrderSingleton.instance = (new OrderSingleton).initialize());
  PartialOrderSingleton.instance || (PartialOrderSingleton.instance = (new PartialOrderSingleton).initialize());
  MonoidSingleton.instance || (MonoidSingleton.instance = (new MonoidSingleton).initialize());
  GroupSingleton.instance || (GroupSingleton.instance = (new GroupSingleton).initialize());
  return this
};
CatsPackage.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.package$", {
  scala: 1,
  BaseClass: 1
});
var catsPackageInstance; // Global instance for CatsPackage.

function getCatsPackage() {
  catsPackageInstance || (catsPackageInstance = (new CatsPackage).initialize());
  return catsPackageInstance
} // Retrieves the singleton instance of CatsPackage.

function EitherOps() {} // Either Operations.
EitherOps.prototype = new BaseClass;
EitherOps.prototype.constructor = EitherOps;
EitherOps.prototype.initialize = function() {
  return this
};
EitherOps.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.syntax.EitherOps$", {
  scala: 1,
  BaseClass: 1
});
var eitherOpsInstance; // Global instance for EitherOps.

function EqOps() {} // Eq Operations.
EqOps.prototype = new BaseClass;
EqOps.prototype.constructor = EqOps;
// Creates an instance of EqOps.
function createEqOps(firstArg, secondArg) {
  var ops = new EqOps();
  ops.operand1 = firstArg;
  ops.operand2 = secondArg;
  return ops
} // Creates an equality operations object.

// Checks if two operands are equal using the Eq type class.
function checkEquality(eqOps, checkVal) {
  getCatsPackage();
  return eqOps.operand2.isEqual(eqOps.operand1, checkVal);
} // Checks equality using the Eq type class.

EqOps.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.syntax.EqOps", {
  scala: 1,
  BaseClass: 1
});

function QuotientRemainder() {} // Quotient Remainder.
QuotientRemainder.prototype = new BaseClass;
QuotientRemainder.prototype.constructor = QuotientRemainder;
// Retrieves the quotient and remainder as an array.
function getQuotientRemainderArray(qr) {
  return createArrayOfClass(getArrayClass(IntClass), [qr.quotient, qr.remainder]);
} // Retrieves the quotient and remainder as an array.

// Sets the quotient and remainder values.
function setQuotientRemainder(qr, quotientVal, remainderVal) {
  qr.quotient = quotientVal;
  qr.remainder = remainderVal;
  return qr;
} // Sets the quotient and remainder.

QuotientRemainder.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.BigInteger$QuotAndRem", {
  scala: 1,
  BaseClass: 1
});

function BitLevel() {} // Bit Level.
BitLevel.prototype = new BaseClass;
BitLevel.prototype.constructor = BitLevel;
BitLevel.prototype.initialize = function() {
  return this
};
// Shifts an array of integers left by a specified number of bits.
function shiftArrayLeft(bitLevel, destArray, sourceArray, count) {
  var carry = 0;
  for (var i = 0; i < count;) {
    var idx = i,
      val = sourceArray.valContainer[idx];
    destArray.valContainer[idx] = val << 1 | carry;
    carry = val >>> 31 | 0;
    i = 1 + i | 0;
  }
  // No need for bitLevel argument.
} // Shifts an array of integers to the left.

// Shifts a long array left by a specified number of bits.
function shiftLongArrayLeft(bitLevel, longVal, shiftAmount) {
  longVal = shiftAmount >> 5;
  shiftAmount &= 31;
  var newLength = (longVal + longVal.length | 0) + (0 === shiftAmount ? 0 : 1) | 0,
    newArray = createArrayOfClass(IntClass, [newLength]);
  copyShiftedArrayWithZeros(getBitLevelInstance(), newArray, longVal.dataBuffer, longVal, shiftAmount);
  var newBigInt = createBigInteger(longVal.signum, newLength, newArray);
  normalizeBigInteger(newBigInt);
  return newBigInt;
} // Shifts a BigInteger's internal array to the left.

// Shifts a long array right by a specified number of bits.
function shiftLongArrayRight(bitLevel, longVal, shiftAmount) {
  longVal = shiftAmount >> 5;
  var remainingShift = 31 & shiftAmount;
  if (longVal >= longVal.dataBuffer.length) return longVal.signum < 0 ? getBigIntegerUtilInstance().negativeOne : getBigIntegerUtilInstance().zero;
  var newLength = longVal.dataBuffer.length - longVal | 0,
    newArray = createArrayOfClass(IntClass, [1 + newLength | 0]);
  copyShiftedArray(getBitLevelInstance(), newArray, newLength, longVal.dataBuffer, longVal, remainingShift);
  if (longVal.signum < 0) {
    for (var i = 0; i < longVal && 0 === longVal.dataBuffer[i];) i = 1 + i | 0;
    var hasNonZeroBit = 0 !== longVal.dataBuffer[i] << (32 - remainingShift | 0);
    if (i < longVal || 0 < remainingShift && hasNonZeroBit) {
      for (i = 0; i < newLength && -1 === newArray.valContainer[i];) newArray.valContainer[i] = 0, i = 1 + i | 0;
      i === newLength && (newLength = 1 + newLength | 0);
      longVal = i;
      newArray.valContainer[longVal] = 1 + newArray.valContainer[longVal] | 0;
    }
  }
  longVal = createBigInteger(longVal.signum, newLength, newArray);
  normalizeBigInteger(longVal);
  return longVal;
} // Shifts a BigInteger's internal array to the right.

// Calculates the bit length of a BigInteger.
function getBitLength(bitLevel, bigInt) {
  if (0 === bigInt.signum) return 0;
  bitLevel = bigInt.dataBuffer.length << 5;
  var topWord = bigInt.dataBuffer.valContainer[-1 + bigInt.dataBuffer.length | 0];
  bigInt.signum < 0 && getLowestSetBit(bigInt) === (-1 + bigInt.dataBuffer.length | 0) && (topWord = -1 + topWord | 0);
  return bitLevel = bitLevel - leadingZerosCount(topWord) | 0;
} // Determines the bit length of a BigInteger.

// Copies a segment of an array, shifting bits to the right.
function copyShiftedArray(bitLevel, destArray, destLength, sourceArray, sourceOffset, shiftAmount) {
  for (bitLevel = 0; bitLevel < sourceOffset;) bitLevel = 1 + bitLevel | 0;
  if (0 === shiftAmount) {
    copyArraySegments(sourceArray, sourceOffset, destArray, 0, destLength);
  } else {
    var inverseShift = 32 - shiftAmount | 0;
    for (bitLevel = 0; bitLevel < (-1 + destLength | 0);) {
      destArray.valContainer[bitLevel] = sourceArray.valContainer[bitLevel + sourceOffset | 0] >>> shiftAmount | 0 | sourceArray.valContainer[1 + (bitLevel + sourceOffset | 0) | 0] << inverseShift;
      bitLevel = 1 + bitLevel | 0;
    }
    destArray.valContainer[bitLevel] = sourceArray.valContainer[bitLevel + sourceOffset | 0] >>> shiftAmount | 0;
  }
} // Copies and right-shifts part of an array.

// Copies a segment of an array, shifting bits to the left and filling with zeros.
function copyShiftedArrayWithZeros(bitLevel, destArray, sourceArray, destOffset, shiftAmount) {
  if (0 === shiftAmount) {
    copyArraySegments(sourceArray, 0, destArray, destOffset, destArray.valContainer.length - destOffset | 0);
  } else {
    bitLevel = 32 - shiftAmount | 0;
    destArray.valContainer[-1 + destArray.valContainer.length | 0] = 0;
    for (var i = -1 + destArray.valContainer.length | 0; i > destOffset;) {
      var idx = i;
      destArray.valContainer[idx] = destArray.valContainer[idx] | sourceArray.valContainer[-1 + (idx - destOffset | 0) | 0] >>> bitLevel | 0;
      destArray.valContainer[-1 + idx | 0] = sourceArray.valContainer[-1 + (idx - destOffset | 0) | 0] << shiftAmount;
      i = -1 + i | 0;
    }
    for (sourceArray = 0; sourceArray < destOffset;) destArray.valContainer[sourceArray] = 0, sourceArray = 1 + sourceArray | 0;
  }
} // Copies and left-shifts part of an array, padding with zeros.

BitLevel.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.BitLevel$", {
  scala: 1,
  BaseClass: 1
});
var bitLevelInstance; // Global instance for BitLevel.

function getBitLevelInstance() {
  bitLevelInstance || (bitLevelInstance = (new BitLevel).initialize());
  return bitLevelInstance
} // Retrieves the singleton instance of BitLevel.

function ConversionUtil() {} // Conversion Utilities.
ConversionUtil.prototype = new BaseClass;
ConversionUtil.prototype.constructor = ConversionUtil;
ConversionUtil.prototype.initialize = function() {
  conversionUtilInstance = this;
  this.intLookup = createArrayOfClass(IntType, [-1, -1, 31, 19, 15, 13, 11, 11, 10, 9, 9, 8, 8, 8, 8, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5]);
  this.powerLookup = createArrayOfClass(IntType, [-2147483648, 1162261467, 1073741824, 1220703125, 362797056, 1977326743, 1073741824, 387420489, 1E9, 214358881, 429981696, 815730721, 1475789056, 170859375, 268435456, 410338673, 612220032, 893871739, 128E7, 1801088541, 113379904, 148035889, 191102976, 244140625, 308915776, 387420489, 481890304, 594823321, 729E6, 887503681, 1073741824, 1291467969, 1544804416, 1838265625, 60466176]);
  return this
};
// Formats a BigDecimal to a string representation.
function formatBigDecimal(conversionUtil, bigDecimal, precision) {
  if (0 === bigDecimal.decimalValue && 0 === bigDecimal.longValue) {
    switch (precision) {
      case 0:
        return "0";
      case 1:
        return "0.0";
      case 2:
        return "0.00";
      case 3:
        return "0.000";
      case 4:
        return "0.0000";
      case 5:
        return "0.00000";
      case 6:
        return "0.000000";
      default:
        return (0 > precision ? "0E+" : "0E") + (-2147483648 === precision ? "2147483648" : "" + (-precision | 0));
    }
  } else {
    var isNegative = 0 > bigDecimal.longValue;
    var resultString = "";
    var currentPrecision = 18;
    if (isNegative) {
      var valF = bigDecimal.decimalValue;
      bigDecimal = bigDecimal.longValue;
      bigDecimal = (new LongValue()).initLong(-valF | 0, 0 !== valF ? ~bigDecimal : -bigDecimal | 0);
    }
    valF = bigDecimal.decimalValue;
    for (var valI = bigDecimal.longValue;;) {
      bigDecimal = valF;
      var tempLong = valI;
      valI = getRuntimeLongUtilInstance();
      // Use longDivideSingle for division.
      valF = longDivideSingle(valI, valF, tempLong, 10, 0);
      valI = valI.remainder;
      currentPrecision = -1 + currentPrecision | 0;
      tempLong = valI;
      var prodLow = valF,
        prodHigh = prodLow >>> 16 | 0;
      prodLow = intMultiply(10, 65535 & prodLow);
      prodHigh = intMultiply(10, prodHigh);
      prodHigh = prodLow + (prodHigh << 16) | 0;
      intMultiply(10, tempLong);
      resultString = "" + (bigDecimal - prodHigh | 0) + resultString;
      bigDecimal = valI;
      if (0 === valF && 0 === bigDecimal) break;
    }
    bigDecimal = -1 + ((18 - currentPrecision | 0) - precision | 0) | 0;
    if (0 < precision && -6 <= bigDecimal) {
      if (precision = 1 + bigDecimal | 0, 0 < precision) resultString = resultString.substring(0, precision) + "." + resultString.substring(precision);
      else {
        precision = -precision | 0;
        for (valF = 0; valF < precision;) resultString = "0" + resultString, valF = 1 + valF | 0;
        resultString = "0." + resultString;
      }
    } else {
      0 !== precision && (precision = "" + bigDecimal, 0 < bigDecimal && (precision = "+" + precision), precision = "E" + precision, resultString = 1 < (18 - currentPrecision | 0) ? resultString.substring(0, 1) + "." + resultString.substring(1) + precision : "" + resultString + precision);
    }
    return isNegative ? "-" + resultString : resultString;
  }
} // Formats a BigDecimal to a string.

// Formats a BigInteger to a string representation.
function formatBigInteger(conversionUtil, bigInt) {
  var signum = bigInt.signum,
    dataLen = bigInt.dataBuffer.length,
    dataBuffer = bigInt.dataBuffer;
  if (0 === signum) return "0";
  if (1 === dataLen) return bigInt = (+dataBuffer.valContainer[0] >>> 0).toString(10), 0 > signum ? "-" + bigInt : bigInt;
  bigInt = "";
  var tempArray = createArrayOfClass(IntClass, [dataLen]);
  copyArraySegments(dataBuffer, 0, tempArray, 0, dataLen);
  do {
    var carry = 0;
    for (dataBuffer = -1 + dataLen | 0; 0 <= dataBuffer;) {
      var currentVal = carry;
      carry = tempArray.valContainer[dataBuffer];
      var divResult = longDivideSingle(getRuntimeLongUtilInstance(), carry, currentVal, 1E9, 0);
      tempArray.valContainer[dataBuffer] = divResult;
      currentVal = divResult >> 31;
      var m = 65535 & divResult;
      divResult = divResult >>> 16 | 0;
      var p = intMultiply(51712, m);
      m = intMultiply(15258, m);
      var q = intMultiply(51712, divResult);
      p = p + (m + q | 0 << 16) | 0;
      intMultiply(1E9, currentVal);
      intMultiply(15258, divResult);
      carry = carry - p | 0;
      dataBuffer = -1 + dataBuffer | 0;
    }
    dataBuffer = "" + carry;
    for (bigInt = "000000000".substring(dataBuffer.length | 0) + dataBuffer + bigInt; 0 !== dataLen && 0 === tempArray.valContainer[-1 + dataLen | 0];) dataLen = -1 + dataLen | 0;
  } while (0 !== dataLen);
  dataBuffer = 0;
  for (dataLen = bigInt.length | 0;;)
    if (dataBuffer < dataLen && 48 === (65535 & bigInt.charCodeAt(dataBuffer) | 0)) dataBuffer = 1 + dataBuffer | 0;
    else break;
  bigInt = bigInt.substring(dataBuffer);
  return 0 > signum ? "-" + bigInt : bigInt;
} // Converts a BigInteger to its decimal string representation.

ConversionUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.Conversion$", {
  scala: 1,
  BaseClass: 1
});
var conversionUtilInstance; // Global instance for ConversionUtil.

function getConversionUtilInstance() {
  conversionUtilInstance || (conversionUtilInstance = (new ConversionUtil).initialize());
  return conversionUtilInstance
} // Retrieves the singleton instance of ConversionUtil.

function DivisionUtil() {} // Division Utilities.
DivisionUtil.prototype = new BaseClass;
DivisionUtil.prototype.constructor = DivisionUtil;
DivisionUtil.prototype.initialize = function() {
  return this
};
// Divides long arrays.
function divideLongArrays(divisionUtil, quotientArray, quotientLen, dividendArray, dividendLen, divisorArray, divisorLen) {
  var tempArray1 = createArrayOfClass(IntClass, [1 + dividendLen | 0]),
    tempArray2 = createArrayOfClass(IntClass, [1 + divisorLen | 0]),
    shiftAmount = leadingZerosCount(divisorArray.valContainer[-1 + divisorLen | 0]);
  if (0 !== shiftAmount) {
    copyShiftedArrayWithZeros(getBitLevelInstance(), tempArray2, divisorArray, 0, shiftAmount);
    copyShiftedArrayWithZeros(getBitLevelInstance(), tempArray1, dividendArray, 0, shiftAmount);
  } else {
    copyArraySegments(dividendArray, 0, tempArray1, 0, dividendLen);
    copyArraySegments(divisorArray, 0, tempArray2, 0, divisorLen);
  }
  divisorArray = tempArray2.valContainer[-1 + divisorLen | 0];
  for (dividendLen = -1 + dividendLen | 0; 0 <= dividendLen;) {
    if (tempArray1.valContainer[quotientLen] === divisorArray) {
      divisionUtil = -1;
    } else {
      var p = tempArray1.valContainer[quotientLen],
        q = tempArray1.valContainer[-1 + quotientLen | 0];
      divisionUtil = getRuntimeLongUtilInstance();
      var t = longDivideSingle(divisionUtil, q, p, divisorArray, 0);
      p = divisionUtil.remainder;
      divisionUtil = t;
      var u = 65535 & t;
      t = t >>> 16 | 0;
      var v = 65535 & divisorArray,
        B = divisorArray >>> 16 | 0,
        P = intMultiply(u, v);
      v = intMultiply(t, v);
      u = intMultiply(u, B);
      u = P + (v + u | 0 << 16) | 0;
      intMultiply(p, divisorArray);
      intMultiply(t, B);
      q = q - u | 0;
      if (0 !== divisionUtil) {
        var firstArg = 1 + divisionUtil | 0;
        for (;;) {
          t = firstArg = -1 + firstArg | 0;
          B = tempArray2.valContainer[-2 + divisorLen | 0];
          P = 65535 & t;
          t = t >>> 16 | 0;
          var qa = 65535 & B;
          B = B >>> 16 | 0;
          u = intMultiply(P, qa);
          qa = intMultiply(t, qa);
          v = intMultiply(P, B);
          P = u + (qa + v | 0 << 16) | 0;
          u = (u >>> 16 | 0) + v | 0;
          u = (intMultiply(t, B) + (u >>> 16 | 0) | 0) + ((65535 & u) + qa | 0 >>> 16) | 0;
          B = q;
          t = tempArray1.valContainer[-2 + quotientLen | 0];
          P = q + divisorArray | 0;
          if (
            0 === ((-2147483648 ^ P) < (-2147483648 ^ q) ? 1 : 0) &&
            (q = P, u ^= -2147483648, B ^= -2147483648, u === B ? (-2147483648 ^ P) > (-2147483648 ^ t) : u > B)
          ) {
            // Loop continues
          } else {
            break;
          }
        }
      }
    }
    if (divisionUtil = 0 !== divisionUtil) {
      getDivisionUtilInstance();
      divisionUtil = tempArray1;
      p = quotientLen - divisorLen | 0;
      B = tempArray2;
      t = divisorLen;
      u = divisionUtil;
      var carryOut = 0;
      for (P = carryOut = 0; P < t;) {
        v = P;
        getMultiplicationUtilInstance();
        var val = B.valContainer[v],
          low = 65535 & val;
        val = val >>> 16 | 0;
        var low2 = 65535 & u,
          high2 = u >>> 16 | 0,
          prodLow = intMultiply(low, low2);
        low2 = intMultiply(val, low2);
        var prodMid = intMultiply(low, high2);
        low = prodLow + (low2 + prodMid | 0 << 16) | 0;
        prodLow = (prodLow >>> 16 | 0) + prodMid | 0;
        high2 = (intMultiply(val, high2) + (prodLow >>> 16 | 0) | 0) + ((65535 & prodLow) + low2 | 0 >>> 16) | 0;
        val = low + carryOut | 0;
        carryOut = (-2147483648 ^ val) < (-2147483648 ^ low) ? 1 + high2 | 0 : high2;
        high2 = divisionUtil.valContainer[p + v | 0];
        val = high2 - val | 0;
        high2 = (-2147483648 ^ val) > (-2147483648 ^ high2) ? -1 : 0;
        low = carryOut;
        carryOut = low >> 31;
        low = val + low | 0;
        carryOut = (-2147483648 ^ low) < (-2147483648 ^ val) ? 1 + (high2 + carryOut | 0) | 0 : high2 + carryOut | 0;
        divisionUtil.valContainer[p + v | 0] = low;
        P = 1 + P | 0;
      }
      u = divisionUtil.valContainer[p + t | 0];
      B = u - carryOut | 0;
      u = (-2147483648 ^ B) > (-2147483648 ^ u) ? -1 : 0;
      v = carryOut;
      P = v >> 31;
      v = B + v | 0;
      divisionUtil.valContainer[p + t | 0] = v;
      divisionUtil = 0 !== ((-2147483648 ^ v) < (-2147483648 ^ B) ? 1 + (u + P | 0) | 0 : u + P | 0);
    }
    if (divisionUtil)
      for (divisionUtil = -1 + divisionUtil | 0, p = P = u = 0; p < divisorLen;) {
        B = p;
        t = tempArray1.valContainer[(quotientLen - divisorLen | 0) + B | 0];
        P = t + tempArray2.valContainer[B] | 0;
        t = (-2147483648 ^ P) < (-2147483648 ^ t) ? 1 : 0;
        P = u + P | 0;
        t = (-2147483648 ^ P) < (-2147483648 ^ u) ? 1 + (0 + t | 0) | 0 : 0 + t | 0;
        u = P;
        P = t;
        tempArray1.valContainer[(quotientLen - divisorLen | 0) + B | 0] = u;
        u = P;
        P = 0;
        p = 1 + p | 0;
      }
    null !== quotientArray && (quotientArray.valContainer[dividendLen] = divisionUtil);
    quotientLen = -1 + quotientLen | 0;
    dividendLen = -1 + dividendLen | 0;
  }
  return 0 !== shiftAmount ? (copyShiftedArray(getBitLevelInstance(), tempArray2, divisorLen, tempArray1, 0, shiftAmount), tempArray2) : (copyArraySegments(tempArray1, 0, tempArray2, 0, divisorLen), tempArray2);
} // Performs division on long arrays.

// Divides a long array by an integer.
function divideLongArrayByInt(divisionUtil, destArray, sourceArray, sourceLength, divisor) {
  var carry = 0;
  for (divisionUtil = -1 + sourceLength | 0; 0 <= divisionUtil;) {
    var currentCarry = carry;
    carry = sourceArray.valContainer[divisionUtil];
    var divResult = longDivideSingle(getRuntimeLongUtilInstance(), carry, currentCarry, divisor, 0);
    currentCarry = divResult >>> 16 | 0;
    var m = 65535 & divResult,
      p = 65535 & divisor,
      q = divisor >>> 16 | 0,
      t = intMultiply(m, p);
    p = intMultiply(currentCarry, p);
    m = intMultiply(m, q);
    t = t + (p + m | 0 << 16) | 0;
    intMultiply(getRuntimeLongUtilInstance().remainder, divisor);
    intMultiply(currentCarry, q);
    carry = carry - t | 0;
    destArray.valContainer[divisionUtil] = divResult;
    divisionUtil = -1 + divisionUtil | 0;
  }
  return carry;
} // Divides a long array by an integer.

DivisionUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.Division$", {
  scala: 1,
  BaseClass: 1
});
var divisionUtilInstance; // Global instance for DivisionUtil.

function getDivisionUtilInstance() {
  divisionUtilInstance || (divisionUtilInstance = (new DivisionUtil).initialize());
  return divisionUtilInstance
} // Retrieves the singleton instance of DivisionUtil.

function ElementaryUtil() {} // Elementary Utilities.
ElementaryUtil.prototype = new BaseClass;
ElementaryUtil.prototype.constructor = ElementaryUtil;
ElementaryUtil.prototype.initialize = function() {
  return this
};
// Subtracts one long array from another.
function subtractLongArrays(elementaryUtil, destLength, sourceArray1, sourceArray2, commonLength) {
  var resultArray = createArrayOfClass(IntClass, [destLength]),
    carry = 0;
  for (var i = 0; i < commonLength;) {
    var currentCarry = i,
      val1 = sourceArray1.valContainer[currentCarry],
      val2 = sourceArray2.valContainer[currentCarry];
    var diff = val1 - val2 | 0;
    val1 = (-2147483648 ^ diff) > (-2147483648 ^ val1) ? -1 : 0;
    var prevCarry = carry;
    carry = prevCarry >> 31;
    prevCarry = diff + prevCarry | 0;
    diff = (-2147483648 ^ prevCarry) < (-2147483648 ^ diff) ? 1 + (val1 + carry | 0) | 0 : val1 + carry | 0;
    resultArray.valContainer[currentCarry] = prevCarry;
    carry = diff;
    i = 1 + i | 0;
  }
  for (; i < destLength;) {
    sourceArray2 = sourceArray1.valContainer[i];
    diff = carry;
    val1 = diff >> 31;
    diff = sourceArray2 + diff | 0;
    sourceArray2 = (-2147483648 ^ diff) < (-2147483648 ^ sourceArray2) ? 1 + val1 | 0 : val1;
    resultArray.valContainer[i] = diff;
    carry = sourceArray2;
    i = 1 + i | 0;
  }
  return resultArray;
} // Performs subtraction on long arrays.

// Compares two long arrays.
function compareLongArrays(elementaryUtil, sourceArray1, sourceArray2, commonLength) {
  for (elementaryUtil = -1 + commonLength | 0; 0 <= elementaryUtil && sourceArray1.valContainer[elementaryUtil] === sourceArray2.valContainer[elementaryUtil];) elementaryUtil = -1 + elementaryUtil | 0;
  return 0 > elementaryUtil ? 0 : (-2147483648 ^ sourceArray1.valContainer[elementaryUtil]) < (-2147483648 ^ sourceArray2.valContainer[elementaryUtil]) ? -1 : 1;
} // Compares two long arrays.

// Adds two long arrays.
function addLongArrays(elementaryUtil, destLength, sourceArray1, sourceArray2, commonLength) {
  var resultArray = createArrayOfClass(IntClass, [1 + destLength | 0]),
    carry = 1,
    val1 = sourceArray1.valContainer[0],
    sum = val1 + sourceArray2.valContainer[0] | 0;
  resultArray.valContainer[0] = sum;
  val1 = (-2147483648 ^ sum) < (-2147483648 ^ val1) ? 1 : 0;
  if (destLength >= commonLength) {
    for (; carry < commonLength;) {
      var s1 = sourceArray1.valContainer[carry],
        s2 = sourceArray2.valContainer[carry];
      sum = s1 + s2 | 0;
      s1 = (-2147483648 ^ sum) < (-2147483648 ^ s1) ? 1 : 0;
      val1 = sum + val1 | 0;
      s2 = (-2147483648 ^ val1) < (-2147483648 ^ sum) ? 1 + s1 | 0 : s1;
      resultArray.valContainer[carry] = val1;
      val1 = s2;
      carry = 1 + carry | 0;
    }
    for (; carry < destLength;) {
      sourceArray2 = sourceArray1.valContainer[carry];
      commonLength = sourceArray2 + val1 | 0;
      sourceArray2 = (-2147483648 ^ commonLength) < (-2147483648 ^ sourceArray2) ? 1 : 0;
      resultArray.valContainer[carry] = commonLength;
      val1 = sourceArray2;
      carry = 1 + carry | 0;
    }
  } else {
    for (; carry < destLength;) {
      s1 = sourceArray1.valContainer[carry];
      s2 = sourceArray2.valContainer[carry];
      sum = s1 + s2 | 0;
      s1 = (-2147483648 ^ sum) < (-2147483648 ^ s1) ? 1 : 0;
      val1 = sum + val1 | 0;
      s2 = (-2147483648 ^ val1) < (-2147483648 ^ sum) ? 1 + s1 | 0 : s1;
      resultArray.valContainer[carry] = val1;
      val1 = s2;
      carry = 1 + carry | 0;
    }
    for (; carry < commonLength;) {
      sourceArray1 = sourceArray2.valContainer[carry];
      destLength = sourceArray1 + val1 | 0;
      sourceArray1 = (-2147483648 ^ destLength) < (-2147483648 ^ sourceArray1) ? 1 : 0;
      resultArray.valContainer[carry] = destLength;
      val1 = sourceArray1;
      carry = 1 + carry | 0;
    }
  }
  0 !== val1 && (resultArray.valContainer[carry] = val1);
  return resultArray;
} // Performs addition on long arrays.

// Adds two BigIntegers.
function addBigIntegers(elementaryUtil, bigInt1, bigInt2) {
  var sign1 = bigInt1.signum,
    sign2 = bigInt2.signum,
    len1 = bigInt1.dataBuffer.length,
    len2 = bigInt2.dataBuffer.length;
  if (0 === sign1) return bigInt2;
  if (0 === sign2) return bigInt1;
  if (2 === (len1 + len2 | 0)) {
    bigInt1 = bigInt1.dataBuffer.valContainer[0];
    bigInt2 = bigInt2.dataBuffer.valContainer[0];
    if (sign1 === sign2) {
      sign2 = bigInt1 + bigInt2 | 0;
      bigInt2 = (-2147483648 ^ sign2) < (-2147483648 ^ bigInt1) ? 1 : 0;
      return 0 === bigInt2 ? (new BigInteger()).initBigInteger(sign1, sign2) : createBigInteger(sign1, 2, createArrayOfClass(IntClass, [sign2, bigInt2]));
    }
    sign2 = getBigIntegerUtilInstance();
    0 > sign1 ? (sign1 = bigInt1 = bigInt2 - bigInt1 | 0, bigInt2 = (-2147483648 ^ bigInt1) > (-2147483648 ^ bigInt2) ? -1 : 0) : (sign1 = bigInt2 = bigInt1 - bigInt2 | 0, bigInt2 = (-2147483648 ^ bigInt2) > (-2147483648 ^ bigInt1) ? -1 : 0);
    return createBigInteger(sign2, (new LongValue()).initLong(sign1, bigInt2));
  }
  if (sign1 === sign2) {
    sign2 = len1 >= len2 ? addLongArrays(elementaryUtil, len1, bigInt1.dataBuffer, bigInt2.dataBuffer, len2) : addLongArrays(elementaryUtil, len2, bigInt2.dataBuffer, bigInt1.dataBuffer, len1);
  } else {
    var compareResult = len1 !== len2 ? len1 > len2 ? 1 : -1 : compareLongArrays(0, bigInt1.dataBuffer, bigInt2.dataBuffer, len1);
    if (0 === compareResult) return getBigIntegerUtilInstance().zero;
    if (1 === compareResult) {
      sign2 = subtractLongArrays(elementaryUtil, len1, bigInt1.dataBuffer, bigInt2.dataBuffer, len2);
    } else {
      bigInt2 = subtractLongArrays(elementaryUtil, len2, bigInt2.dataBuffer, bigInt1.dataBuffer, len1);
      sign1 = sign2;
      sign2 = bigInt2;
    }
  }
  sign1 = createBigInteger(sign1 | 0, sign2.valContainer.length, sign2);
  normalizeBigInteger(sign1);
  return sign1;
} // Adds two BigIntegers.

// Subtracts two BigIntegers.
function subtractBigIntegers(elementaryUtil, bigInt1, bigInt2) {
  var sign1 = bigInt1.signum,
    sign2 = bigInt2.signum,
    len1 = bigInt1.dataBuffer.length,
    len2 = bigInt2.dataBuffer.length;
  if (0 === sign2) return bigInt1;
  if (0 === sign1) return negateBigInteger(bigInt2);
  if (2 === (len1 + len2 | 0)) {
    bigInt1 = bigInt1.dataBuffer.valContainer[0];
    len1 = 0;
    bigInt2 = bigInt2.dataBuffer.valContainer[0];
    len2 = 0;
    if (0 > sign2) {
      sign2 = bigInt1;
      bigInt1 = -sign2 | 0;
      len1 = 0 !== sign2 ? ~len1 : -len1 | 0;
    }
    if (0 > sign1) {
      sign1 = bigInt2;
      sign2 = len2;
      bigInt2 = -sign1 | 0;
      len2 = 0 !== sign1 ? ~sign2 : -sign2 | 0;
    }
    sign1 = getBigIntegerUtilInstance();
    len2 = bigInt1;
    bigInt1 = len1;
    len1 = len2 - bigInt2 | 0;
    return createBigInteger(sign1, (new LongValue()).initLong(len1, (-2147483648 ^ len1) > (-2147483648 ^ len2) ? -1 + (bigInt1 - len2 | 0) | 0 : bigInt1 - len2 | 0));
  }
  var compareResult = len1 !== len2 ? len1 > len2 ? 1 : -1 : compareLongArrays(getElementaryUtilInstance(), bigInt1.dataBuffer, bigInt2.dataBuffer, len1);
  if (sign1 === sign2 && 0 === compareResult) return getBigIntegerUtilInstance().zero;
  if (-1 === compareResult) {
    if (sign1 === sign2) {
      bigInt2 = subtractLongArrays(elementaryUtil, len2, bigInt2.dataBuffer, bigInt1.dataBuffer, len1);
    } else {
      bigInt2 = addLongArrays(elementaryUtil, len2, bigInt2.dataBuffer, bigInt1.dataBuffer, len1);
    }
    sign1 = -sign1 | 0;
  } else {
    if (sign1 === sign2) {
      bigInt2 = subtractLongArrays(elementaryUtil, len1, bigInt1.dataBuffer, bigInt2.dataBuffer, len2);
    } else {
      bigInt2 = addLongArrays(elementaryUtil, len1, bigInt1.dataBuffer, bigInt2.dataBuffer, len2);
    }
    sign1 = sign1;
  }
  sign1 = createBigInteger(sign1 | 0, bigInt2.valContainer.length, bigInt2);
  normalizeBigInteger(sign1);
  return sign1;
} // Subtracts one BigInteger from another.

ElementaryUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.Elementary$", {
  scala: 1,
  BaseClass: 1
});
var elementaryUtilInstance; // Global instance for ElementaryUtil.

function getElementaryUtilInstance() {
  elementaryUtilInstance || (elementaryUtilInstance = (new ElementaryUtil).initialize());
  return elementaryUtilInstance
} // Retrieves the singleton instance of ElementaryUtil.

function MathContext() {} // Math Context.
MathContext.prototype = new BaseClass;
MathContext.prototype.constructor = MathContext;
MathContext.prototype.equals = function(other) {
  return other instanceof MathContext ? this.precisionValue === other.precisionValue ? this.roundingMode === other.roundingMode : false : false
};
MathContext.prototype.toString = function() {
  return "precision=" + this.precisionValue + " roundingMode=" + this.roundingMode
};
MathContext.prototype.hashCode = function() {
  return this.precisionValue << 3 | this.roundingMode.enumValue
};
MathContext.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.MathContext", {
  scala: 1,
  BaseClass: 1
});

function MathContextSingleton() {} // Math Context Singleton.
MathContextSingleton.prototype = new BaseClass;
MathContextSingleton.prototype.constructor = MathContextSingleton;
MathContextSingleton.prototype.initialize = function() {
  mathContextSingletonInstance = this;
  getMathContextSingletonInstance();
  var rounding = getRoundingModeSingletonInstance().halfEven;
  var mc = new MathContext();
  mc.precisionValue = 34;
  mc.roundingMode = rounding;
  this.cache = mc;
  getMathContextSingletonInstance();
  getRoundingModeSingletonInstance();
  getMathContextSingletonInstance();
  getRoundingModeSingletonInstance();
  getMathContextSingletonInstance();
  getRoundingModeSingletonInstance();
  return this
};
MathContextSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.MathContext$", {
  scala: 1,
  BaseClass: 1
});
var mathContextSingletonInstance; // Global instance for MathContextSingleton.

function getMathContextSingletonInstance() {
  mathContextSingletonInstance || (mathContextSingletonInstance = (new MathContextSingleton).initialize());
  return mathContextSingletonInstance
} // Retrieves the singleton instance of MathContextSingleton.

function MultiplicationUtil() {} // Multiplication Utilities.
MultiplicationUtil.prototype = new BaseClass;
MultiplicationUtil.prototype.constructor = MultiplicationUtil;
MultiplicationUtil.prototype.initialize = function() {
  multiplicationUtilInstance = this;
  createIntArray(10, 10);
  createIntArray(14, 5);
  this.powerCache = createArrayOfClass(LongType, [32]);
  this.powerOfTwoCache = createArrayOfClass(LongType, [32]);
  var tempVal;
  var currentPower = 1;
  for (var i = tempVal = 0; 32 > i;) {
    var idx = i;
    if (18 >= idx) {
      getMultiplicationUtilInstance().powerOfTwoCache.valContainer[idx] = createBigInteger(getBigIntegerUtilInstance(), (new LongValue()).initLong(0 === (32 & idx) ? currentPower << idx : 0, 0 === (32 & idx) ? currentPower >>> 1 >>> (31 - idx | 0) | 0 | tempVal << idx : currentPower << idx));
      var cache = getMultiplicationUtilInstance().powerCache,
        util = getBigIntegerUtilInstance(),
        valH = currentPower,
        valL = tempVal;
      cache.valContainer[idx] = createBigInteger(util, (new LongValue()).initLong(valH, valL));
      idx = currentPower;
      currentPower = idx >>> 16 | 0;
      idx = intMultiply(5, 65535 & idx);
      currentPower = intMultiply(5, currentPower);
      currentPower = idx + (currentPower << 16) | 0;
      idx = (idx >>> 16 | 0) + currentPower | 0;
      tempVal = intMultiply(5, tempVal) + (idx >>> 16) | 0;
    } else {
      getMultiplicationUtilInstance().powerOfTwoCache.valContainer[idx] = addBigIntegers(getElementaryUtilInstance(), getMultiplicationUtilInstance().powerOfTwoCache.valContainer[-1 + idx | 0], getMultiplicationUtilInstance().powerOfTwoCache.valContainer[1]);
      getMultiplicationUtilInstance().powerCache.valContainer[idx] = addBigIntegers(getElementaryUtilInstance(), getMultiplicationUtilInstance().powerCache.valContainer[-1 + idx | 0], getBigIntegerUtilInstance().ten);
    }
    i = 1 + i | 0;
  }
  return this
};
// Multiplies two long arrays.
function multiplyLongArrays(multiplicationUtil, sourceArray, sourceLength, destArray) {
  var i, j;
  for (i = 0; i < sourceLength;) {
    var valG = i;
    multiplicationUtil = 0;
    for (j = 1 + valG | 0; j < sourceLength;) {
      var valK = j;
      getMultiplicationUtilInstance();
      var s1 = sourceArray.valContainer[valG],
        s2 = sourceArray.valContainer[valK],
        d = destArray.valContainer[valG + valK | 0],
        low1 = 65535 & s1;
      s1 = s1 >>> 16 | 0;
      var low2 = 65535 & s2;
      s2 = s2 >>> 16 | 0;
      var p1 = intMultiply(low1, low2);
      low2 = intMultiply(s1, low2);
      var p2 = intMultiply(low1, s2);
      low1 = p1 + (low2 + p2 | 0 << 16) | 0;
      p1 = (p1 >>> 16 | 0) + p2 | 0;
      s1 = (intMultiply(s1, s2) + (p1 >>> 16 | 0) | 0) + ((65535 & p1) + low2 | 0 >>> 16) | 0;
      d = low1 + d | 0;
      s1 = (-2147483648 ^ d) < (-2147483648 ^ low1) ? 1 + s1 | 0 : s1;
      multiplicationUtil = d + multiplicationUtil | 0;
      d = (-2147483648 ^ multiplicationUtil) < (-2147483648 ^ d) ? 1 + s1 | 0 : s1;
      destArray.valContainer[valG + valK | 0] = multiplicationUtil;
      multiplicationUtil = d;
      j = 1 + j | 0;
    }
    destArray.valContainer[valG + sourceLength | 0] = multiplicationUtil;
    i = 1 + i | 0;
  }
  shiftArrayLeft(getBitLevelInstance(), destArray, destArray, sourceLength << 1);
  for (valG = i = multiplicationUtil = 0; i < sourceLength;) {
    s1 = sourceArray.valContainer[i];
    s2 = sourceArray.valContainer[i];
    d = destArray.valContainer[valG];
    var carry = multiplicationUtil;
    low1 = 65535 & s1;
    multiplicationUtil = s1 >>> 16 | 0;
    low2 = 65535 & s2;
    s2 = s2 >>> 16 | 0;
    s1 = intMultiply(low1, low2);
    low2 = intMultiply(multiplicationUtil, low2);
    p2 = intMultiply(low1, s2);
    low1 = s1 + (low2 + p2 | 0 << 16) | 0;
    s1 = (s1 >>> 16 | 0) + p2 | 0;
    multiplicationUtil = (intMultiply(multiplicationUtil, s2) + (s1 >>> 16 | 0) | 0) + ((65535 & s1) + low2 | 0 >>> 16) | 0;
    d = low1 + d | 0;
    multiplicationUtil = (-2147483648 ^ d) < (-2147483648 ^ low1) ? 1 + multiplicationUtil | 0 : multiplicationUtil;
    carry = d + carry | 0;
    d = (-2147483648 ^ carry) < (-2147483648 ^ d) ? 1 + multiplicationUtil | 0 : multiplicationUtil;
    destArray.valContainer[valG] = carry;
    valG = 1 + valG | 0;
    carry = d + destArray.valContainer[valG] | 0;
    d = (-2147483648 ^ carry) < (-2147483648 ^ carry) ? 1 : 0;
    destArray.valContainer[valG] = carry;
    multiplicationUtil = d;
    i = 1 + i | 0;
    valG = 1 + valG | 0;
  }
  return destArray;
} // Multiplies two long arrays.

// Creates an integer array with powers of a base.
function createIntArray(count, base) {
  var resultArray = [];
  if (0 < count) {
    var current = 1,
      accum = 1,
      valG = current;
    for (resultArray.push(null === valG ? 0 : valG); accum < count;) {
      current = intMultiply(current | 0, base);
      accum = 1 + accum | 0;
      valG = current;
      resultArray.push(null === valG ? 0 : valG);
    }
  }
  return createArrayOfClass(IntType, resultArray);
} // Generates an array of powers of a base.

// Multiplies two BigIntegers using Karatsuba or elementary multiplication.
function multiplyBigIntegers(multiplicationUtil, bigInt1, bigInt2) {
  var len1 = bigInt1.dataBuffer.length,
    len2 = bigInt2.dataBuffer.length;
  if (bigInt2.dataBuffer.length > bigInt1.dataBuffer.length) {
    var temp = bigInt1;
    bigInt1 = bigInt2;
    bigInt2 = temp;
  }
  var operand1 = bigInt1,
    operand2 = bigInt2;
  if (63 > operand2.dataBuffer.length) {
    len1 = operand1.dataBuffer.length;
    len2 = operand2.dataBuffer.length;
    multiplicationUtil = len1 + len2 | 0;
    var sign = operand1.signum !== operand2.signum ? -1 : 1;
    if (2 === multiplicationUtil) {
      len1 = operand1.dataBuffer.valContainer[0];
      len2 = operand2.dataBuffer.valContainer[0];
      var low1 = 65535 & len1;
      len1 = len1 >>> 16 | 0;
      var low2 = 65535 & len2;
      len2 = len2 >>> 16 | 0;
      var p1 = intMultiply(low1, low2);
      low2 = intMultiply(len1, low2);
      var p2 = intMultiply(low1, len2);
      low1 = p1 + (low2 + p2 | 0 << 16) | 0;
      p1 = (p1 >>> 16 | 0) + p2 | 0;
      len1 = (intMultiply(len1, len2) + (p1 >>> 16 | 0) | 0) + ((65535 & p1) + low2 | 0 >>> 16) | 0;
      multiplicationUtil = 0 === len1 ? (new BigInteger()).initBigInteger(sign, low1) : createBigInteger(sign, 2, createArrayOfClass(IntClass, [low1, len1]));
    } else {
      operand1 = operand1.dataBuffer;
      operand2 = operand2.dataBuffer;
      len1 = createArrayOfClass(IntClass, [multiplicationUtil]);
      if (0 !== len1 && 0 !== len2) {
        if (1 === len1) {
          len1.valContainer[len2] = multiplyArrayByInt(0, len1, operand2, len2, operand1.valContainer[0]);
        } else if (1 === len2) {
          len1.valContainer[len1] = multiplyArrayByInt(0, len1, operand1, len1, operand2.valContainer[0]);
        } else if (operand1 === operand2 && len1 === len2) {
          multiplyLongArrays(multiplicationUtil, operand1, len1, len1);
        } else {
          for (var idx = 0; idx < len1;) {
            var m = idx;
            var carry = 0;
            for (var k = operand1.valContainer[m], l = 0; l < len2;) {
              var n = l;
              getMultiplicationUtilInstance();
              var v1 = operand2.valContainer[n],
                d = len1.valContainer[m + n | 0],
                low1 = 65535 & k;
              k = k >>> 16 | 0;
              var low2 = 65535 & v1;
              v1 = v1 >>> 16 | 0;
              var p1 = intMultiply(low1, low2);
              low2 = intMultiply(k, low2);
              var p2 = intMultiply(low1, v1);
              low1 = p1 + (low2 + p2 | 0 << 16) | 0;
              p1 = (p1 >>> 16 | 0) + p2 | 0;
              k = (intMultiply(k, v1) + (p1 >>> 16 | 0) | 0) + ((65535 & p1) + low2 | 0 >>> 16) | 0;
              d = low1 + d | 0;
              k = (-2147483648 ^ d) < (-2147483648 ^ low1) ? 1 + k | 0 : k;
              carry = d + carry | 0;
              d = (-2147483648 ^ carry) < (-2147483648 ^ d) ? 1 + k | 0 : k;
              len1.valContainer[m + n | 0] = carry;
              carry = d;
              l = 1 + l | 0;
            }
            len1.valContainer[m + len2 | 0] = carry;
            idx = 1 + idx | 0;
          }
        }
      }
    }
    multiplicationUtil = createBigInteger(sign, multiplicationUtil, len1);
    normalizeBigInteger(multiplicationUtil);
    return multiplicationUtil;
  }
  multiplicationUtil = (-2 & operand1.dataBuffer.length) << 4;
  len1 = shiftBigIntegerRight(operand1, multiplicationUtil);
  len2 = shiftBigIntegerRight(operand2, multiplicationUtil);
  bigInt2 = subtractBigIntegers(getElementaryUtilInstance(), operand1, len1);
  operand2 = subtractBigIntegers(getElementaryUtilInstance(), operand2, len2);
  operand1 = multiplyBigIntegers(multiplicationUtil, len1, len2);
  bigInt2 = multiplyBigIntegers(multiplicationUtil, bigInt2, operand2);
  multiplicationUtil = multiplyBigIntegers(multiplicationUtil, subtractBigIntegers(getElementaryUtilInstance(), len1, bigInt2), subtractBigIntegers(getElementaryUtilInstance(), operand2, len2));
  len1 = operand1;
  multiplicationUtil = addBigIntegers(getElementaryUtilInstance(), multiplicationUtil, len1);
  multiplicationUtil = addBigIntegers(getElementaryUtilInstance(), multiplicationUtil, bigInt2);
  multiplicationUtil = shiftBigIntegerLeft(multiplicationUtil, multiplicationUtil);
  bigInt2 = shiftBigIntegerLeft(operand1, multiplicationUtil << 1);
  operand1 = addBigIntegers(getElementaryUtilInstance(), bigInt2, multiplicationUtil);
  return addBigIntegers(getElementaryUtilInstance(), operand1, bigInt2);
} // Multiplies two BigIntegers.

// Multiplies an array of integers by a single integer.
function multiplyArrayByInt(multiplicationUtil, destArray, sourceArray, sourceLength, factor) {
  var carry = 0;
  for (multiplicationUtil = carry = 0; multiplicationUtil < sourceLength;) {
    var idx = multiplicationUtil;
    getMultiplicationUtilInstance();
    var val = sourceArray.valContainer[idx],
      low1 = 65535 & val;
    val = val >>> 16 | 0;
    var low2 = 65535 & factor,
      high2 = factor >>> 16 | 0,
      p1 = intMultiply(low1, low2);
    low2 = intMultiply(val, low2);
    var p2 = intMultiply(low1, high2);
    low1 = p1 + (low2 + p2 | 0 << 16) | 0;
    p1 = (p1 >>> 16 | 0) + p2 | 0;
    val = (intMultiply(val, high2) + (p1 >>> 16 | 0) | 0) + ((65535 & p1) + low2 | 0 >>> 16) | 0;
    carry = low1 + carry | 0;
    val = (-2147483648 ^ carry) < (-2147483648 ^ low1) ? 1 + val | 0 : val;
    destArray.valContainer[idx] = carry;
    carry = val;
    multiplicationUtil = 1 + multiplicationUtil | 0;
  }
  return carry;
} // Multiplies an integer array by a scalar.

// Computes power of a BigInteger.
function powerBigInteger(multiplicationUtil, bigInt) {
  var lookupLength = multiplicationUtil.powerCache.valContainer.length,
    longValHigh = bigInt.longValue;
  if (longValHigh === multiplicationUtil.powerCache.valContainer.length ? (-2147483648 ^ bigInt.decimalValue) < (-2147483648 ^ lookupLength) : longValHigh < lookupLength) return multiplicationUtil.powerCache.valContainer[bigInt.decimalValue];
  longValHigh = bigInt.longValue;
  if (0 === longValHigh ? -2147483598 >= (-2147483648 ^ bigInt.decimalValue) : 0 > longValHigh) return createBigInteger(getBigIntegerUtilInstance().negativeOne, bigInt.decimalValue);
  longValHigh = bigInt.longValue;
  if (0 === longValHigh ? -1 >= (-2147483648 ^ bigInt.decimalValue) : 0 > longValHigh) return shiftBigIntegerLeft(createBigInteger(multiplicationUtil.powerOfTwoCache.valContainer[1], bigInt.decimalValue), bigInt.decimalValue);
  var result = shiftBigIntegerLeft(multiplicationUtil.powerOfTwoCache.valContainer[1], 2147483647);
  var currentBigInt = result;
  longValHigh = bigInt.longValue;
  var decimalVal = -2147483647 + bigInt.decimalValue | 0,
    exponentHigh = decimalVal;
  longValHigh = 1 > (-2147483648 ^ exponentHigh) ? longValHigh : -1 + longValHigh | 0;
  for (bigInt = doubleToLong(getRuntimeLongUtilInstance(), bigInt.decimalValue, bigInt.longValue, 2147483647, 0);;) {
    var exponentLow = exponentHigh,
      exponentVal = longValHigh;
    if (0 === exponentVal ? -1 < (-2147483648 ^ exponentLow) : 0 < exponentVal) {
      result = addBigIntegers(getElementaryUtilInstance(), result, currentBigInt);
      exponentHigh = -2147483647 + exponentHigh | 0;
      longValHigh = 1 > (-2147483648 ^ exponentHigh) ? longValHigh : -1 + longValHigh | 0;
    } else {
      break;
    }
  }
  result = addBigIntegers(getElementaryUtilInstance(), result, shiftBigIntegerLeft(multiplicationUtil.powerOfTwoCache.valContainer[1], bigInt));
  result = shiftBigIntegerLeft(result, 2147483647);
  multiplicationUtil = bigInt.longValue;
  exponentHigh = bigInt = -2147483647 + bigInt.decimalValue | 0;
  longValHigh = 1 > (-2147483648 ^ bigInt) ? multiplicationUtil : -1 + multiplicationUtil | 0;
  for (;;) {
    if (bigInt = exponentHigh, multiplicationUtil = longValHigh, 0 === multiplicationUtil ? -1 < (-2147483648 ^ bigInt) : 0 < multiplicationUtil) {
      result = shiftBigIntegerLeft(result, 2147483647);
      bigInt = longValHigh;
      multiplicationUtil = -2147483647 + exponentHigh | 0;
      bigInt = 1 > (-2147483648 ^ multiplicationUtil) ? bigInt : -1 + bigInt | 0;
      exponentHigh = multiplicationUtil;
      longValHigh = bigInt;
    } else {
      break;
    }
  }
  return shiftBigIntegerLeft(result, bigInt);
} // Computes a BigInteger raised to a power.

MultiplicationUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.math.Multiplication$", {
  scala: 1,
  BaseClass: 1
});
var multiplicationUtilInstance; // Global instance for MultiplicationUtil.

function getMultiplicationUtilInstance() {
  multiplicationUtilInstance || (multiplicationUtilInstance = (new MultiplicationUtil).initialize());
  return multiplicationUtilInstance
} // Retrieves the singleton instance of MultiplicationUtil.

function StateConfig() {} // State Configuration.
StateConfig.prototype = new BaseClass;
StateConfig.prototype.constructor = StateConfig;
StateConfig.prototype.initialize = function() {
  stateConfigInstance = this;
  this.maxDepth = 64;
  this.quarterDepth = this.maxDepth >> 2;
  this.fullDepth = this.maxDepth;
  getPredefSingletonInstance().checkCondition(this.quarterDepth < this.fullDepth);
  return this
};
StateConfig.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scalax.collection.State$", {
  scala: 1,
  BaseClass: 1
});
var stateConfigInstance; // Global instance for StateConfig.

function GraphConfig() {} // Graph Configuration.
GraphConfig.prototype = new BaseClass;
GraphConfig.prototype.constructor = GraphConfig;
GraphConfig.prototype.initialize = function() {
  this.maxNodes = 4E3;
  return this
};
GraphConfig.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scalax.collection.config.GraphConfig$", {
  scala: 1,
  BaseClass: 1
});
var graphConfigInstance; // Global instance for GraphConfig.

function ArraySetHints() {} // Array Set Hints.
ArraySetHints.prototype = new BaseClass;
ArraySetHints.prototype.constructor = ArraySetHints;
ArraySetHints.prototype.initialize = function() {
  arraySetHintsInstance = this;
  return this
};
// Calculates hints for array set capacity.
function getArraySetHints(hints, initialCapacity) {
  getPredefSingletonInstance().checkCondition(0 <= initialCapacity && 48 >= initialCapacity && true);
  hints = initialCapacity + 32 | 0;
  return createCheckedHints(initialCapacity, 32, 48 < hints ? hints : 48, 80);
} // Calculates hints for array set capacity.

ArraySetHints.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scalax.collection.mutable.ArraySet$Hints$", {
  scala: 1,
  BaseClass: 1
});
var arraySetHintsInstance; // Global instance for ArraySetHints.

function getArraySetHintsInstance() {
  arraySetHintsInstance || (arraySetHintsInstance = (new ArraySetHints).initialize());
  return arraySetHintsInstance
} // Retrieves the singleton instance of ArraySetHints.

function EqHash() {} // Equality Hash.
EqHash.prototype = new BaseClass;
EqHash.prototype.constructor = EqHash;
EqHash.prototype.initialize = function() {
  eqHashInstance = this;
  this.nullSentinel = (new BaseClass()).initialize();
  return this
};
EqHash.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scalax.collection.mutable.EqHash$", {
  scala: 1,
  BaseClass: 1
});
var eqHashInstance; // Global instance for EqHash.

function getEqHashInstance() {
  eqHashInstance || (eqHashInstance = (new EqHash).initialize());
  return eqHashInstance
} // Retrieves the singleton instance of EqHash.

function ClassInfo() {} // Class Information.
ClassInfo.prototype = new BaseClass;
ClassInfo.prototype.constructor = ClassInfo;
// Gets the name of the class.
function getClassName(classInfo) {
  return classInfo.descriptor.name
} // Retrieves the name of the class.

ClassInfo.prototype.toString = function() {
  return (this.descriptor.isInterface ? "interface " : this.descriptor.isPrimitive ? "" : "class ") + getClassName(this);
};
// Checks if two classes are assignable.
function areClassesAssignable(classInfo1, classInfo2) {
  return classInfo1.descriptor.isPrimitive || classInfo2.descriptor.isPrimitive ? classInfo1 === classInfo2 || (classInfo1 === getClassInstance(ShortClass) ? classInfo2 === getClassInstance(ByteClass) : classInfo1 === getClassInstance(IntClass) ? classInfo2 === getClassInstance(ByteClass) || classInfo2 === getClassInstance(ShortClass) : classInfo1 === getClassInstance(FloatClass) ? classInfo2 === getClassInstance(ByteClass) || classInfo2 === getClassInstance(ShortClass) || classInfo2 === getClassInstance(IntClass) : classInfo1 === getClassInstance(DoubleClass) && (classInfo2 === getClassInstance(ByteClass) || classInfo2 === getClassInstance(ShortClass) || classInfo2 === getClassInstance(IntClass) || classInfo2 === getClassInstance(FloatClass))) : isInstance(classInfo1, classInfo2.descriptor.getFakeInstance());
} // Determines if one class is assignable to another.

// Checks if an object is an instance of this class.
function isInstance(classInfo, obj) {
  return !!classInfo.descriptor.isInstance(obj);
} // Checks if an object is an instance of this class.

// Creates a new array of this class type.
function newArrayOfClass(classInfo, dimensions) {
  for (var i = 0; i < dimensions.length; i++) classInfo = getArrayClass(classInfo);
  return createVector(classInfo, dimensions);
} // Creates a new array instance for this class.

ClassInfo.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.lang.Class", {
  scala: 1,
  BaseClass: 1
});

function LongStringRadixInfo() {} // Long String Radix Information.
LongStringRadixInfo.prototype = new BaseClass;
LongStringRadixInfo.prototype.constructor = LongStringRadixInfo;
LongStringRadixInfo.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.lang.Long$StringRadixInfo", {
  scala: 1,
  BaseClass: 1
});

function SystemSingleton() {} // System Singleton.
SystemSingleton.prototype = new BaseClass;
SystemSingleton.prototype.constructor = SystemSingleton;
SystemSingleton.prototype.initialize = function() {
  systemSingletonInstance = this;
  this.standardOutput = (new ScalaConsoleLogger()).initLogger(false);
  this.standardError = (new ScalaConsoleLogger()).initLogger(true);
  return this
};
SystemSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.lang.System$", {
  scala: 1,
  BaseClass: 1
});
var systemSingletonInstance; // Global instance for SystemSingleton.

function getSystemSingletonInstance() {
  systemSingletonInstance || (systemSingletonInstance = (new SystemSingleton).initialize());
  return systemSingletonInstance
} // Retrieves the singleton instance of SystemSingleton.

function ArraySingleton() {} // Array Singleton.
ArraySingleton.prototype = new BaseClass;
ArraySingleton.prototype.constructor = ArraySingleton;
ArraySingleton.prototype.initialize = function() {
  return this
};
ArraySingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.lang.reflect.Array$", {
  scala: 1,
  BaseClass: 1
});
var arraySingletonInstance; // Global instance for ArraySingleton.

function ArraysUtil() {} // Arrays Utilities.
ArraysUtil.prototype = new BaseClass;
ArraysUtil.prototype.constructor = ArraysUtil;
ArraysUtil.prototype.initialize = function() {
  return this
};
// Performs a binary search on a sorted array.
function binarySearch(arraysUtil, sortedArray, searchKey) {
  arraysUtil = 0;
  var high = sortedArray.valContainer.length;
  for (;;) {
    if (arraysUtil === high) return -1 - arraysUtil | 0;
    var mid = (arraysUtil + high | 0) >>> 1 | 0,
      midVal = sortedArray.valContainer[mid];
    if (searchKey < midVal) {
      high = mid;
    } else {
      if (jsValueEquals(getBoxesRunTimeInstance(), searchKey, midVal)) return mid;
      arraysUtil = 1 + mid | 0;
    }
  }
} // Performs a binary search.

// Sorts a subarray using insertion sort.
function insertionSort(arraysUtil, targetArray, offset, endIndex, comparator) {
  arraysUtil = endIndex - offset | 0;
  if (2 <= arraysUtil) {
    if (0 < comparator.compareValues(targetArray.valContainer[offset], targetArray.valContainer[1 + offset | 0])) {
      var temp = targetArray.valContainer[offset];
      targetArray.valContainer[offset] = targetArray.valContainer[1 + offset | 0];
      targetArray.valContainer[1 + offset | 0] = temp;
    }
    for (temp = 2; temp < arraysUtil;) {
      var current = targetArray.valContainer[offset + temp | 0];
      if (0 > comparator.compareValues(current, targetArray.valContainer[-1 + (offset + temp | 0) | 0])) {
        for (var low = offset, high = -1 + (offset + temp | 0) | 0; 1 < (high - low | 0);) {
          var mid = (low + high | 0) >>> 1 | 0;
          0 > comparator.compareValues(current, targetArray.valContainer[mid]) ? high = mid : low = mid;
        }
        low = low + (0 > comparator.compareValues(current, targetArray.valContainer[low]) ? 0 : 1) | 0;
        for (high = offset + temp | 0; high > low;) targetArray.valContainer[high] = targetArray.valContainer[-1 + high | 0], high = -1 + high | 0;
        targetArray.valContainer[low] = current;
      }
      temp = 1 + temp | 0;
    }
  }
} // Sorts a subarray using insertion sort.

// Sorts an array.
function sortArray(arraysUtil, targetArray, comparator) {
  var len = targetArray.valContainer.length;
  16 < len ? mergeSort(arraysUtil, targetArray, createArrayOfClass(BaseClass, [targetArray.valContainer.length]), 0, len, comparator) : insertionSort(targetArray, 0, len, comparator);
} // Sorts an array.

// Sorts a subarray using merge sort.
function mergeSort(arraysUtil, targetArray, tempArray, low, high, comparator) {
  var length = high - low | 0;
  if (16 < length) {
    var mid = low + (length / 2 | 0) | 0;
    mergeSort(arraysUtil, targetArray, tempArray, low, mid, comparator);
    mergeSort(arraysUtil, targetArray, tempArray, mid, high, comparator);
    for (var i = arraysUtil = low, j = mid; arraysUtil < high;) {
      if (i < mid && (j >= high || comparator.compareElements(targetArray.valContainer[i], targetArray.valContainer[j]))) {
        tempArray.valContainer[arraysUtil] = targetArray.valContainer[i];
        i = 1 + i | 0;
      } else {
        tempArray.valContainer[arraysUtil] = targetArray.valContainer[j];
        j = 1 + j | 0;
      }
      arraysUtil = 1 + arraysUtil | 0;
    }
    copyArraySegments(tempArray, low, targetArray, low, length);
  } else {
    insertionSort(targetArray, low, high, comparator);
  }
} // Sorts a subarray using merge sort.

ArraysUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.util.Arrays$", {
  scala: 1,
  BaseClass: 1
});
var arraysUtilInstance; // Global instance for ArraysUtil.

function getArraysUtilInstance() {
  arraysUtilInstance || (arraysUtilInstance = (new ArraysUtil).initialize());
  return arraysUtilInstance
} // Retrieves the singleton instance of ArraysUtil.

function FormatterPattern() {} // Formatter Pattern.
FormatterPattern.prototype = new BaseClass;
FormatterPattern.prototype.constructor = FormatterPattern;
FormatterPattern.prototype.initialize = function() {
  formatterPatternInstance = this;
  this.formatRegex = new globalScope.RegExp("(?:(\\d+)\\$)?([-#+ 0,\\(\x3c]*)(\\d+)?(?:\\.(\\d+))?[%A-Za-z]", "g");
  return this
};
FormatterPattern.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "java.util.Formatter$", {
  scala: 1,
  BaseClass: 1
});
var formatterPatternInstance; // Global instance for FormatterPattern.

function PredefPrototype() {} // Predef Prototype.
PredefPrototype.prototype = new BaseClass;
PredefPrototype.prototype.constructor = PredefPrototype;

function Any2StringAdd() {} // Any2StringAdd.
Any2StringAdd.prototype = new BaseClass;
Any2StringAdd.prototype.constructor = Any2StringAdd;
Any2StringAdd.prototype.initialize = function() {
  return this
};
Any2StringAdd.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.Predef$any2stringadd$", {
  scala: 1,
  BaseClass: 1
});
var any2StringAddInstance; // Global instance for Any2StringAdd.

function ExecutionContext() {} // Execution Context.
ExecutionContext.prototype = new BaseClass;
ExecutionContext.prototype.constructor = ExecutionContext;
ExecutionContext.prototype.initialize = function() {
  return this
};
// Retrieves the default execution context.
function getDefaultExecutionContext() {
  executionContextInstance || (executionContextInstance = (new ExecutionContext).initialize());
  return createFunction1(function() {
    return function(task) {
      logTask(task);
    };
  }(executionContextInstance));
} // Retrieves the default execution context.

ExecutionContext.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.concurrent.ExecutionContext$", {
  scala: 1,
  BaseClass: 1
});
var executionContextInstance; // Global instance for ExecutionContext.

function OrderedSingleton() {} // Ordered Singleton.
OrderedSingleton.prototype = new BaseClass;
OrderedSingleton.prototype.constructor = OrderedSingleton;
OrderedSingleton.prototype.initialize = function() {
  return this
};
OrderedSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.math.Ordered$", {
  scala: 1,
  BaseClass: 1
});
var orderedSingletonInstance; // Global instance for OrderedSingleton.

function ScalaPackage() {} // Scala Package.
ScalaPackage.prototype = new BaseClass;
ScalaPackage.prototype.constructor = ScalaPackage;
ScalaPackage.prototype.initialize = function() {
  scalaPackageInstance = this;
  (new AnyRefAnon()).initialize();
  initFunctionFlags();
  initFunctionFlags();
  initFunctionFlags();
  this.predefInstance = PredefAnon1.instance;
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  this.emptyList = getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  colonColonInstance || (colonColonInstance = (new ColonColon).initialize());
  plusColonInstance || (plusColonInstance = (new PlusColon).initialize());
  colonPlusInstance || (colonPlusInstance = (new ColonPlus).initialize());
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  streamHashColonColonInstance || (streamHashColonColonInstance = (new StreamHashColonColon).initialize());
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  stringBuilderSingletonInstance || (stringBuilderSingletonInstance = (new StringBuilderSingleton).initialize());
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  rangeSingletonInstance || (rangeSingletonInstance = (new RangeSingleton).initialize());
  orderedSingletonInstance || (orderedSingletonInstance = (new OrderedSingleton).initialize());
  this.eitherInstance = EitherSingleton.instance;
  this.predefInstance = this.eitherInstance;
  leftSingletonInstance || (leftSingletonInstance = (new LeftSingleton).initialize());
  rightSingletonInstance || (rightSingletonInstance = (new RightSingleton).initialize());
  return this
};
ScalaPackage.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.package$", {
  scala: 1,
  BaseClass: 1
});
var scalaPackageInstance; // Global instance for ScalaPackage.

function getScalaPackage() {
  scalaPackageInstance || (scalaPackageInstance = (new ScalaPackage).initialize());
  return scalaPackageInstance
} // Retrieves the singleton instance of ScalaPackage.

function ClassManifestFactory() {} // Class Manifest Factory.
ClassManifestFactory.prototype = new BaseClass;
ClassManifestFactory.prototype.constructor = ClassManifestFactory;
ClassManifestFactory.prototype.initialize = function() {
  classManifestFactoryInstance = this;
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
  return this
};
ClassManifestFactory.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.reflect.ClassManifestFactory$", {
  scala: 1,
  BaseClass: 1
});
var classManifestFactoryInstance; // Global instance for ClassManifestFactory.

function ManifestFactory() {} // Manifest Factory.
ManifestFactory.prototype = new BaseClass;
ManifestFactory.prototype.constructor = ManifestFactory;
ManifestFactory.prototype.initialize = function() {
  return this
};
ManifestFactory.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.reflect.ManifestFactory$", {
  scala: 1,
  BaseClass: 1
});
var manifestFactoryInstance; // Global instance for ManifestFactory.

function ReflectPackage() {} // Reflect Package.
ReflectPackage.prototype = new BaseClass;
ReflectPackage.prototype.constructor = ReflectPackage;
ReflectPackage.prototype.initialize = function() {
  reflectPackageInstance = this;
  classManifestFactoryInstance || (classManifestFactoryInstance = (new ClassManifestFactory).initialize());
  manifestFactoryInstance || (manifestFactoryInstance = (new ManifestFactory).initialize());
  return this
};
ReflectPackage.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.reflect.package$", {
  scala: 1,
  BaseClass: 1
});
var reflectPackageInstance; // Global instance for ReflectPackage.

function BreaksSingleton() {} // Breaks Singleton.
BreaksSingleton.prototype = new BaseClass;
BreaksSingleton.prototype.constructor = BreaksSingleton;
BreaksSingleton.prototype.initialize = function() {
  (new BreakControl()).initialize();
  return this
};
BreaksSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.util.control.Breaks", {
  scala: 1,
  BaseClass: 1
});

function NonFatalSingleton() {} // Non-Fatal Singleton.
NonFatalSingleton.prototype = new BaseClass;
NonFatalSingleton.prototype.constructor = NonFatalSingleton;
NonFatalSingleton.prototype.initialize = function() {
  return this
};
// Wraps a throwable if it is non-fatal, otherwise returns None.
function wrapIfNonFatal(nonFatal, throwable) {
  // If the throwable is a Scala.js Throwable (indicated by a type descriptor with a 'rl' property),
  // return an empty Option (R()). Otherwise, wrap it in a Some (new Q()).
  return throwable && throwable.typeDescriptor && throwable.typeDescriptor.interfaceMap.isNonFatal ? getOptionSingletonInstance().empty : (new SomeResult()).initSome(throwable);
} // Wraps a non-fatal throwable in an Option.

NonFatalSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.util.control.NonFatal$", {
  scala: 1,
  BaseClass: 1
});
var nonFatalSingletonInstance; // Global instance for NonFatalSingleton.

function getNonFatalSingletonInstance() {
  nonFatalSingletonInstance || (nonFatalSingletonInstance = (new NonFatalSingleton).initialize());
  return nonFatalSingletonInstance
} // Retrieves the singleton instance of NonFatalSingleton.

function MurmurHash3() {} // Murmur Hash 3.
MurmurHash3.prototype = new BaseClass;
MurmurHash3.prototype.constructor = MurmurHash3;
// Mixes in a value to the hash.
MurmurHash3.prototype.mixValue = function(currentHash, value) {
  value = intMultiply(-862048943, value);
  value = intMultiply(461845907, value << 15 | value >>> 17 | 0);
  return currentHash ^ value;
};
// Finalizes the hash.
MurmurHash3.prototype.finalizeHash = function(hash, length) {
  hash ^= length;
  hash = intMultiply(-2048144789, hash ^ (hash >>> 16 | 0));
  hash = intMultiply(-1028477387, hash ^ (hash >>> 13 | 0));
  return hash ^ (hash >>> 16 | 0);
};
// Mixes in a hash to the current hash.
MurmurHash3.prototype.mixHash = function(currentHash, hash) {
  currentHash = this.mixValue(currentHash, hash);
  return -430675100 + intMultiply(5, currentHash << 13 | currentHash >>> 19 | 0) | 0;
};
// Hashes an object.
function hashObject(murmurHash3, obj) {
  var typeInfo = getTypeInfo(obj);
  if (0 === typeInfo.descriptor.inheritanceLevel) return obj = obj.toString(), computeStringHash(RuntimeString, obj);
  var hashSeed = -889275714;
  for (var i = 0; i < typeInfo.descriptor.inheritanceLevel;) hashSeed = murmurHash3.mixHash(hashSeed, hashAny(getStaticsUtilInstance(), obj.getTupleElement(i))), i = 1 + i | 0;
  return murmurHash3.finalizeHash(hashSeed, typeInfo.descriptor.inheritanceLevel);
} // Computes a hash for a Scala.js object.

// Hashes elements of an iterator.
function hashIteratorElements(murmurHash3, iterator, seed) {
  var sumRef = (new IntRef()).initValue(0),
    xorRef = (new IntRef()).initValue(0),
    productRef = (new IntRef()).initValue(1),
    countRef = (new IntRef()).initValue(1);
  iterator.forEach(createFunction1(function(murmurHash3, sumRef, xorRef, productRef, countRef) {
    return function(element) {
      element = hashAny(getStaticsUtilInstance(), element);
      sumRef.value = sumRef.value + element | 0;
      xorRef.value ^= element;
      0 !== element && (productRef.value = intMultiply(productRef.value, element));
      countRef.value = 1 + countRef.value | 0;
    };
  }(murmurHash3, sumRef, xorRef, productRef, countRef)));
  seed = murmurHash3.mixHash(seed, sumRef.value);
  seed = murmurHash3.mixHash(seed, xorRef.value);
  seed = murmurHash3.mixValue(seed, productRef.value);
  return murmurHash3.finalizeHash(seed, countRef.value);
} // Hashes elements from an iterator.

// Hashes elements from an iterator with a custom seed.
function hashIterator(murmurHash3, iterator, seed) {
  var countRef = (new IntRef()).initValue(0);
  seed = (new IntRef()).initValue(seed);
  iterator.forEach(createFunction1(function(murmurHash3, seedRef, countRef) {
    return function(element) {
      seedRef.value = murmurHash3.mixHash(seedRef.value, hashAny(getStaticsUtilInstance(), element));
      countRef.value = 1 + countRef.value | 0;
    };
  }(murmurHash3, seed, countRef)));
  return murmurHash3.finalizeHash(seed.value, countRef.value);
} // Hashes elements from an iterator using a custom seed.

MurmurHash3.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.util.hashing.MurmurHash3$", {
  scala: 1,
  BaseClass: 1,
  MurmurHash3Base: 1
});
var murmurHash3Instance; // Global instance for MurmurHash3.

function getMurmurHash3Instance() {
  murmurHash3Instance || (murmurHash3Instance = (new MurmurHash3).initialize());
  return murmurHash3Instance
} // Retrieves the singleton instance of MurmurHash3.

function ColonPlus() {} // Colon Plus.
ColonPlus.prototype = new BaseClass;
ColonPlus.prototype.constructor = ColonPlus;
ColonPlus.prototype.initialize = function() {
  return this
};
ColonPlus.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.$colon$plus$", {
  scala: 1,
  BaseClass: 1
});
var colonPlusInstance; // Global instance for ColonPlus.

function PlusColon() {} // Plus Colon.
PlusColon.prototype = new BaseClass;
PlusColon.prototype.constructor = PlusColon;
PlusColon.prototype.initialize = function() {
  return this
};
PlusColon.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.$plus$colon$", {
  scala: 1,
  BaseClass: 1
});
var plusColonInstance; // Global instance for PlusColon.

function IteratorSingleton() {} // Iterator Singleton.
IteratorSingleton.prototype = new BaseClass;
IteratorSingleton.prototype.constructor = IteratorSingleton;
IteratorSingleton.prototype.initialize = function() {
  iteratorSingletonInstance = this;
  this.emptyIterator = (new EmptyIterator()).initialize();
  return this
};
IteratorSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.Iterator$", {
  scala: 1,
  BaseClass: 1
});
var iteratorSingletonInstance; // Global instance for IteratorSingleton.

function getIteratorSingletonInstance() {
  iteratorSingletonInstance || (iteratorSingletonInstance = (new IteratorSingleton).initialize());
  return iteratorSingletonInstance
} // Retrieves the singleton instance of IteratorSingleton.

function ConcatIteratorCell() {} // Concat Iterator Cell.
ConcatIteratorCell.prototype = new BaseClass;
ConcatIteratorCell.prototype.constructor = ConcatIteratorCell;
ConcatIteratorCell.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.Iterator$ConcatIteratorCell", {
  scala: 1,
  BaseClass: 1
});

// Copies elements from an iterator to an array.
function copyArrayElements(iterator, destArray, destOffset, length) {
  iterator.copyTo(destArray, destOffset, length);
} // Copies elements from an iterator to an array.

// Gets the length of an array.
function getArrayLength(scalaRunTime, array) {
  if (isVector(array, 1) || isIntArray(array, 1) || isDoubleArray(array, 1) || isLongArray(array, 1) || isFloatArray(array, 1) || isCharArray(array, 1) || isByteArray(array, 1) || isShortArray(array, 1) || isBooleanArray(array, 1)) {
    return array.valContainer.length;
  }
  if (null === array) throw (new NullPointerException()).initException();
  throw (new MatchError()).initError(array);
} // Retrieves the length of an array.

// Copies elements from an iterator to a builder.
function copyIteratorToBuilder(iterator, builder) {
  builder.add(iterator.next());
  builder.build(iterator.getRemaining());
  return builder.build();
} // Copies elements from an iterator to a builder.

// Formats a collection with prefix, separator, and suffix.
function formatCollection(iterator, prefix, separator, suffix) {
  return iterator.format(prefix, separator, suffix);
} // Formats a collection.

// Counts the number of elements in an iterator.
function countIteratorElements(iterator) {
  var countRef = (new IntRef()).initValue(0);
  iterator.forEach(createFunction1(function(iterator, countRef) {
    return function() {
      countRef.value = 1 + countRef.value | 0;
    };
  }(iterator, countRef)));
  return countRef.value;
} // Counts elements in an iterator.

// Collects elements from an iterator using a strategy.
function collectIteratorElements(iterator, builder, prefix, separator, suffix) {
  var initialFlag = (new BooleanRef()).initValue(true);
  iterator.forEach(createFunction1(function(iterator, initialFlag, builder, separator) {
    return function(element) {
      if (initialFlag.value) {
        builder.add(element);
        initialFlag.value = false;
      } else {
        builder.add(separator);
        builder.add(element);
      }
    };
  }(iterator, initialFlag, builder, separator)));
  builder.add(suffix);
  return builder;
} // Collects elements from an iterator into a builder.

// Builds a collection from an iterator.
function buildFromIterator(iterator, builder) {
  builder.createInstance(iterator.next());
  iterator.copyTo(builder.createInstance(iterator.next()), 0);
  return builder.build();
} // Builds a collection from an iterator.

function UtilSingleton() {} // Utilities Singleton.
UtilSingleton.prototype = new BaseClass;
UtilSingleton.prototype.constructor = UtilSingleton;
UtilSingleton.prototype.initialize = function() {
  return this
};
UtilSingleton.prototype.getLowestSetBit = function(value) {
  return 1 << (-leadingZerosCount(-1 + value | 0) | 0);
};
UtilSingleton.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.Util$", {
  scala: 1,
  BaseClass: 1
});
var utilSingletonInstance; // Global instance for UtilSingleton.

function BuilderInterface() {} // Builder Interface.
BuilderInterface.prototype = new BaseClass;
BuilderInterface.prototype.constructor = BuilderInterface;
BuilderInterface.prototype.build = function() {
  return this.buildAll().build()
};

// Copies elements from an iterator to a collection.
function copyIteratorToCollection(builder, iterator) {
  // Loop while the iterator has more elements.
  copyIteratorToCollectionLoop: for (;;) {
    if (!iterator.isEmpty()) {
      // Add the current element to the builder.
      builder.add(iterator.next());
      // Move to the next element.
      iterator = iterator.getRemaining();
      continue copyIteratorToCollectionLoop;
    }
    break copyIteratorToCollectionLoop;
  }
} // Copies elements from an iterator to a collection.

// Copies elements from an iterator to a generic builder.
function copyIteratorToGeneric(builder, iterator) {
  // If the iterator is a known type with a forEach method, use it.
  // Otherwise, iterate and add elements one by one.
  iterator && iterator.typeDescriptor && iterator.typeDescriptor.interfaceMap.isIterable ? copyIteratorToCollection(builder, iterator) : iterator.forEach(createFunction1(function(builder) {
    return function(element) {
      return builder.add(element);
    };
  }(builder)));
  return builder;
} // Copies elements from an iterator to a generic builder.

function StreamPrototype() {} // Stream Prototype.
StreamPrototype.prototype = new BaseClass;
StreamPrototype.prototype.constructor = StreamPrototype;

function StreamHashColonColon() {} // Stream Hash Colon Colon.
StreamHashColonColon.prototype = new BaseClass;
StreamHashColonColon.prototype.constructor = StreamHashColonColon;
StreamHashColonColon.prototype.initialize = function() {
  return this
};
StreamHashColonColon.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.immutable.Stream$$hash$colon$colon$", {
  scala: 1,
  BaseClass: 1
});
var streamHashColonColonInstance; // Global instance for StreamHashColonColon.

function StreamIteratorLazyCell() {} // Stream Iterator Lazy Cell.
StreamIteratorLazyCell.prototype = new BaseClass;
StreamIteratorLazyCell.prototype.constructor = StreamIteratorLazyCell;
// Sets the lazy cell's value.
function setLazyCell(lazyCell, nextValue, stream) {
  lazyCell.nextValue = nextValue;
  if (null === stream) throw unwrapThrowable(getRuntimePackage(), null);
  lazyCell.streamRef = stream;
  return lazyCell;
} // Sets the lazy cell's value.

// Forces evaluation of the lazy cell.
function getLazyCellForce(lazyCell) {
  lazyCell.isForced || (lazyCell.isForced || (lazyCell.forcedValue = executeFunction0(lazyCell.nextValue), lazyCell.isForced = true), lazyCell.nextValue = null);
  return lazyCell.forcedValue;
} // Forces evaluation of a lazy cell.

StreamIteratorLazyCell.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.immutable.StreamIterator$LazyCell", {
  scala: 1,
  BaseClass: 1
});

function StringOps() {} // String Operations.
StringOps.prototype = new BaseClass;
StringOps.prototype.constructor = StringOps;
StringOps.prototype.initialize = function() {
  return this
};
// Safely extracts a substring.
function safeSubstring(stringOps, targetString, startIndex, endIndex) {
  stringOps = 0 > startIndex ? 0 : startIndex;
  return endIndex <= stringOps || stringOps >= (targetString.length | 0) ? "" : targetString.substring(stringOps, endIndex > (targetString.length | 0) ? targetString.length | 0 : endIndex);
} // Extracts a substring safely.

StringOps.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.immutable.StringOps$", {
  scala: 1,
  BaseClass: 1
});
var stringOpsInstance; // Global instance for StringOps.

function getStringOpsInstance() {
  stringOpsInstance || (stringOpsInstance = (new StringOps).initialize());
  return stringOpsInstance
} // Retrieves the singleton instance of StringOps.

function WrappedString() {} // Wrapped String.
WrappedString.prototype = new BaseClass;
WrappedString.prototype.constructor = WrappedString;
WrappedString.prototype.initialize = function() {
  return this
};
WrappedString.prototype.buildAll = function() {
  var builder = (new ListBuilder()).initBuilder();
  return (new BuilderAnon1()).initBuilder(builder, createFunction1(function() {
    return function(element) {
      return (new WrappedStringWrapper()).initWrapper(element);
    };
  }(this)));
};
WrappedString.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.immutable.WrappedString$", {
  scala: 1,
  BaseClass: 1
});
var wrappedStringInstance; // Global instance for WrappedString.

// Calculates a bitmask for a hash table.
function calculateMask(hashTable, arrayLength) {
  return hashTable.valContainer[-1 + arrayLength | 0];
} // Calculates a bitmask for a hash table.

// Adds an entry to the hash table, resizing if necessary.
function addEntryToTable(hashTable, entry) {
  entry = normalizeNullSentinel(entry);
  var hash = computeHashCode(entry);
  hash = calculateHashIndex(hashTable, hash);
  for (var currentEntry = hashTable.dataBuffer.valContainer[hash]; null !== currentEntry;) {
    if (jsValueEquals(getBoxesRunTimeInstance(), currentEntry, entry)) return false;
    hash = (1 + hash | 0) % hashTable.dataBuffer.valContainer.length | 0;
    currentEntry = hashTable.dataBuffer.valContainer[hash];
  }
  hashTable.dataBuffer.valContainer[hash] = entry;
  hashTable.elementCount = 1 + hashTable.elementCount | 0;
  // If auxiliary data exists, update it.
  if (null !== hashTable.auxiliaryData) {
    entry = hash >> 5;
    hash = hashTable.auxiliaryData;
    hash.valContainer[entry] = 1 + hash.valContainer[entry] | 0;
  }
  // Resize if load factor exceeded.
  if (hashTable.elementCount >= hashTable.threshold) {
    hashTable.dataBuffer = createArrayOfClass(BaseClass, [hashTable.dataBuffer.valContainer.length << 1]);
    hashTable.elementCount = 0;
    if (null !== hashTable.auxiliaryData) {
      if (hash = 1 + (hashTable.dataBuffer.valContainer.length >> 5) | 0, hashTable.auxiliaryData.valContainer.length !== hash) {
        hashTable.auxiliaryData = createArrayOfClass(IntType, [hash]);
      } else {
        getArraysUtilInstance();
        hash = hashTable.auxiliaryData;
        entry = hash.valContainer.length;
        for (var i = 0; i !== entry;) hash.valContainer[i] = 0, i = 1 + i | 0;
      }
    }
    hashTable.mask = calculateMask(hashTable, hashTable.dataBuffer.valContainer.length);
    hashTable.threshold = calculateThreshold(getFlatHashTableInstance(), hashTable.loadFactor, hashTable.dataBuffer.valContainer.length);
    for (hash = 0; hash < hashTable.dataBuffer.valContainer.length;) {
      entry = hashTable.dataBuffer.valContainer[hash];
      null !== entry && addEntryToTable(hashTable, entry);
      hash = 1 + hash | 0;
    }
  }
  return true;
} // Adds an entry to the hash table.

// Calculates the hash index for a given hash code.
function calculateHashIndex(hashTable, hashCode) {
  var mask = hashTable.mask;
  getHashingPackage().getMurmurHash3Instance();
  hashCode = intMultiply(-1640532531, hashCode);
  getIntegerUtilInstance();
  hashCode = intMultiply(-1640532531, hashCode << 24 | 16711680 & hashCode << 8 | 65280 & (hashCode >>> 8 | 0) | hashCode >>> 24 | 0);
  hashTable = -1 + hashTable.dataBuffer.valContainer.length | 0;
  return (hashCode >>> mask | 0 | hashCode << (-mask | 0) >>> (32 - calculateMask(getIntegerUtilInstance(), hashTable) | 0) | 0) & hashTable;
} // Computes the hash table index for a given hash code.

// Retrieves an entry from the hash table.
function getEntryFromTable(hashTable, entry) {
  entry = normalizeNullSentinel(entry);
  var hash = computeHashCode(entry);
  hash = calculateHashIndex(hashTable, hash);
  for (var currentEntry = hashTable.dataBuffer.valContainer[hash]; null !== currentEntry && !jsValueEquals(getBoxesRunTimeInstance(), currentEntry, entry);) {
    hash = (1 + hash | 0) % hashTable.dataBuffer.valContainer.length | 0;
    currentEntry = hashTable.dataBuffer.valContainer[hash];
  }
  return currentEntry;
} // Retrieves an entry from the hash table.

function FlatHashTable() {} // Flat Hash Table.
FlatHashTable.prototype = new BaseClass;
FlatHashTable.prototype.constructor = FlatHashTable;
FlatHashTable.prototype.initialize = function() {
  return this
};
// Calculates the threshold for resizing the hash table.
function calculateThreshold(hashTable, loadFactor, capacity) {
  if (!(500 > loadFactor)) throw (new AssertionError()).initException("assertion failed: loadFactor too large; must be < 0.5");
  hashTable = capacity >> 31;
  var highLoad = loadFactor >> 31,
    lowCap = 65535 & capacity,
    highCap = capacity >>> 16 | 0,
    lowLoad = 65535 & loadFactor,
    highLoadVal = loadFactor >>> 16 | 0,
    m1 = intMultiply(lowCap, lowLoad);
  lowLoad = intMultiply(highCap, lowLoad);
  var p2 = intMultiply(lowCap, highLoadVal);
  lowCap = m1 + (lowLoad + p2 | 0 << 16) | 0;
  m1 = (m1 >>> 16 | 0) + p2 | 0;
  loadFactor = (((intMultiply(capacity, highLoad) + intMultiply(hashTable, loadFactor) | 0) + intMultiply(highCap, highLoadVal) | 0) + (m1 >>> 16 | 0) | 0) + ((65535 & m1) + lowLoad | 0 >>> 16) | 0;
  return longDivide(getRuntimeLongUtilInstance(), lowCap, loadFactor, 1E3, 0);
} // Calculates the threshold for resizing the hash table.

FlatHashTable.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.mutable.FlatHashTable$", {
  scala: 1,
  BaseClass: 1
});
var flatHashTableInstance; // Global instance for FlatHashTable.

function getFlatHashTableInstance() {
  flatHashTableInstance || (flatHashTableInstance = (new FlatHashTable).initialize());
  return flatHashTableInstance
} // Retrieves the singleton instance of FlatHashTable.

function NullSentinel() {} // Null Sentinel.
NullSentinel.prototype = new BaseClass;
NullSentinel.prototype.constructor = NullSentinel;
NullSentinel.prototype.initialize = function() {
  return this
};
NullSentinel.prototype.toString = function() {
  return "NullSentinel"
};
NullSentinel.prototype.hashCode = function() {
  return 0
};
NullSentinel.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.mutable.FlatHashTable$NullSentinel$", {
  scala: 1,
  BaseClass: 1
});
var nullSentinelInstance; // Global instance for NullSentinel.

function getNullSentinelInstance() {
  nullSentinelInstance || (nullSentinelInstance = (new NullSentinel).initialize());
  return nullSentinelInstance
} // Retrieves the singleton instance of NullSentinel.

function HashTable() {} // Hash Table.
HashTable.prototype = new BaseClass;
HashTable.prototype.constructor = HashTable;
HashTable.prototype.initialize = function() {
  return this
};
HashTable.prototype.getLowestSetBit = function(value) {
  return 1 << (-leadingZerosCount(-1 + value | 0) | 0);
};
HashTable.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.collection.mutable.HashTable$", {
  scala: 1,
  BaseClass: 1
});
var hashTableInstance; // Global instance for HashTable.

function getHashTableInstance() {
  hashTableInstance || (hashTableInstance = (new HashTable).initialize());
  return hashTableInstance
} // Retrieves the singleton instance of HashTable.

function WrappedDictionaryCache() {} // Wrapped Dictionary Cache.
WrappedDictionaryCache.prototype = new BaseClass;
WrappedDictionaryCache.prototype.constructor = WrappedDictionaryCache;
WrappedDictionaryCache.prototype.initialize = function() {
  wrappedDictionaryCacheInstance = this;
  this.hasOwnProperty = globalScope.BaseObject.prototype.hasOwnProperty;
  return this
};
WrappedDictionaryCache.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.scalajs.js.WrappedDictionary$Cache$", {
  scala: 1,
  BaseClass: 1
});
var wrappedDictionaryCacheInstance; // Global instance for WrappedDictionaryCache.

function getWrappedDictionaryCacheInstance() {
  wrappedDictionaryCacheInstance || (wrappedDictionaryCacheInstance = (new WrappedDictionaryCache).initialize());
  return wrappedDictionaryCacheInstance
} // Retrieves the singleton instance of WrappedDictionaryCache.

function BitsUtil() {} // Bits Utilities.
BitsUtil.prototype = new BaseClass;
BitsUtil.prototype.constructor = BitsUtil;
BitsUtil.prototype.initialize = function() {
  bitsUtilInstance = this;
  this.hasFloatArrays = false;
  this.arrayBuffer = this.hasFloatArrays ? new globalScope.ArrayBuffer(8) : null;
  this.int32Array = this.hasFloatArrays ? new globalScope.Int32Array(this.arrayBuffer, 0, 2) : null;
  this.hasFloatArrays && new globalScope.Float32Array(this.arrayBuffer, 0, 2);
  this.float64Array = this.hasFloatArrays ? new globalScope.Float64Array(this.arrayBuffer, 0, 1) : null;
  if (this.hasFloatArrays) {
    this.int32Array[0] = 16909060;
    // Check endianness.
    var isBigEndian = 1 === (new globalScope.Int8Array(this.arrayBuffer, 0, 8))[0] | 0;
  } else {
    isBigEndian = true;
  }
  this.lowWordIndex = isBigEndian ? 0 : 1;
  this.highWordIndex = isBigEndian ? 1 : 0;
  return this
};
// Converts a double to a hash code using its bit representation.
function computeDoubleHash(bitsUtil, doubleVal) {
  var intVal = doubleVal | 0;
  if (intVal === doubleVal && -Infinity !== 1 / doubleVal) return intVal;
  if (bitsUtil.hasFloatArrays) {
    bitsUtil.float64Array[0] = doubleVal;
    bitsUtil = (new LongValue()).initLong(bitsUtil.int32Array[bitsUtil.lowWordIndex] | 0, bitsUtil.int32Array[bitsUtil.highWordIndex] | 0);
  } else {
    if (doubleVal !== doubleVal) bitsUtil = false, doubleVal = 2047, intVal = +globalScope.NumericUtil.pow(2, 51);
    else if (Infinity === doubleVal || -Infinity === doubleVal) bitsUtil = 0 > doubleVal, doubleVal = 2047, intVal = 0;
    else if (0 === doubleVal) bitsUtil = -Infinity === 1 / doubleVal, intVal = doubleVal = 0;
    else {
      var absVal = (bitsUtil = 0 > doubleVal) ? -doubleVal : doubleVal;
      if (absVal >= +globalScope.NumericUtil.pow(2, -1022)) {
        doubleVal = +globalScope.NumericUtil.pow(2, 52);
        intVal = +globalScope.NumericUtil.log(absVal) / 0.6931471805599453;
        intVal = +globalScope.NumericUtil.floor(intVal) | 0;
        intVal = 1023 > intVal ? intVal : 1023;
        var f = +globalScope.NumericUtil.pow(2, intVal);
        f > absVal && (intVal = -1 + intVal | 0, f /= 2);
        f = absVal / f * doubleVal;
        absVal = +globalScope.NumericUtil.floor(f);
        f -= absVal;
        absVal = 0.5 > f ? absVal : 0.5 < f ? 1 + absVal : 0 !== absVal % 2 ? 1 + absVal : absVal;
        2 <= absVal / doubleVal && (intVal = 1 + intVal | 0, absVal = 1);
        1023 < intVal ? (intVal = 2047, absVal = 0) : (intVal = 1023 + intVal | 0, absVal -= doubleVal);
        doubleVal = intVal;
        intVal = absVal;
      } else {
        doubleVal = absVal / +globalScope.NumericUtil.pow(2, -1074);
        intVal = +globalScope.NumericUtil.floor(doubleVal);
        absVal = doubleVal - intVal;
        doubleVal = 0;
        intVal = 0.5 > absVal ? intVal : 0.5 < absVal ? 1 + intVal : 0 !== intVal % 2 ? 1 + intVal : intVal;
      }
      doubleVal = intVal;
      intVal = doubleVal;
    }
    bitsUtil = (new LongValue()).initLong(intVal | 0, (bitsUtil ? -2147483648 : 0) | (doubleVal | 0) << 20 | intVal / 4294967296 | 0);
  }
  return bitsUtil.decimalValue ^ bitsUtil.longValue;
} // Converts a double to a hash code.

BitsUtil.prototype.doubleToLongBits = function(longVal) {
  var high = longVal.longValue,
    isNegative = 0 > high,
    exponent = 2047 & high >> 20;
  longVal = 4294967296 * (1048575 & high) + +(longVal.decimalValue >>> 0);
  return 2047 === exponent ? 0 !== longVal ? NaN : isNegative ? -Infinity : Infinity : 0 < exponent ? (exponent = +globalScope.NumericUtil.pow(2, -1023 + exponent | 0) * (1 + longVal / +globalScope.NumericUtil.pow(2, 52)), isNegative ? -exponent : exponent) : 0 !== longVal ? (exponent = +globalScope.NumericUtil.pow(2, -1022) * (longVal / +globalScope.NumericUtil.pow(2, 52)), isNegative ? -exponent : exponent) : isNegative ? -0 : 0;
};
BitsUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.scalajs.runtime.Bits$", {
  scala: 1,
  BaseClass: 1
});
var bitsUtilInstance; // Global instance for BitsUtil.

function getBitsUtilInstance() {
  bitsUtilInstance || (bitsUtilInstance = (new BitsUtil).initialize());
  return bitsUtilInstance
} // Retrieves the singleton instance of BitsUtil.

function RuntimeString() {} // Runtime String.
RuntimeString.prototype = new BaseClass;
RuntimeString.prototype.constructor = RuntimeString;
RuntimeString.prototype.initialize = function() {
  return this
};
// Splits a string by a regular expression.
function splitString(runtimeString, targetString, regex) {
  if (null === targetString) throw (new NullPointerException()).initException();
  runtimeString = getPatternSingletonInstance().escapeStartEndRegex.exec(regex);
  if (null !== runtimeString) {
    runtimeString = runtimeString[1];
    if (void 0 === runtimeString) throw (new NoSuchElementException()).initException("undefined.get");
    runtimeString = (new SomeResult()).initSome((new ScalaTuple2()).initTuple(escapeRegex(runtimeString), 0));
  } else {
    runtimeString = getOptionSingletonInstance().empty;
  }
  if (runtimeString.isEmpty()) {
    var regexMatch = getPatternSingletonInstance().flagsRegex.exec(regex);
    if (null !== regexMatch) {
      runtimeString = regexMatch[0];
      if (void 0 === runtimeString) throw (new NoSuchElementException()).initException("undefined.get");
      runtimeString = targetString.substring(runtimeString.length | 0);
      var flags = 0;
      var flagGroup1 = regexMatch[1];
      if (void 0 !== flagGroup1)
        for (var i = flagGroup1.length | 0, j = 0; j < i;) {
          var charIdx = j;
          flags |= getRegexFlag(getPatternSingletonInstance(), 65535 & (flagGroup1.charCodeAt(charIdx) | 0));
          j = 1 + j | 0;
        }
      var flagGroup2 = regexMatch[2];
      if (void 0 !== flagGroup2)
        for (flagGroup1 = flagGroup2.length | 0, i = 0; i < flagGroup1;) charIdx = i, flags &= ~getRegexFlag(getPatternSingletonInstance(), 65535 & (flagGroup2.charCodeAt(charIdx) | 0)), i = 1 + i | 0;
      runtimeString = (new SomeResult()).initSome((new ScalaTuple2()).initTuple(runtimeString, flags));
    } else {
      runtimeString = getOptionSingletonInstance().empty;
    }
  }
  runtimeString = runtimeString.isEmpty() ? (new ScalaTuple2()).initTuple(regex, 0) : runtimeString.get().content;
  if (null === runtimeString) throw (new MatchError()).initError(runtimeString);
  flags = runtimeString.secondElement;
  flags = new globalScope.RegExp(runtimeString.firstElement, "g" + (0 !== (2 & flags) ? "i" : "") + (0 !== (8 & flags) ? "m" : ""));
  runtimeString = new PatternImpl();
  runtimeString.regex = flags;
  runtimeString.inputString = targetString;
  regex = stringifyAny(regex);
  if ("" === regex) {
    regex = createArrayOfClass(StringClass, [""]);
  } else {
    flags = regex.length | 0;
    var matcher = new MatcherImpl();
    matcher.pattern = runtimeString;
    matcher.inputString = regex;
    matcher.inputEnd = flags;
    matcher.inputStart = 0;
    runtimeString = matcher.pattern;
    flags = new globalScope.RegExp(runtimeString.regex);
    runtimeString = flags !== runtimeString.regex ? flags : new globalScope.RegExp(runtimeString.regex.source, (runtimeString.regex.global ? "g" : "") + (runtimeString.regex.ignoreCase ? "i" : "") + (runtimeString.regex.multiline ? "m" : ""));
    matcher.regexCopy = runtimeString;
    runtimeString = matcher.inputString;
    flags = matcher.inputStart;
    var matchEnd = matcher.inputEnd;
    runtimeString = "string" === typeof runtimeString ? runtimeString.substring(flags, matchEnd) : runtimeString.substring(flags, matchEnd);
    matcher.subSequence = stringifyAny(runtimeString);
    matcher.lastMatch = null;
    matcher.hasMoreMatches = true;
    getOptionSingletonInstance().empty;
    getOptionSingletonInstance().empty;
    runtimeString = [];
    for (flags = matchEnd = 0; 2147483646 > flags && findNextMatch(matcher);) {
      0 !== getMatchEndIndex(matcher) && (i = getCurrentMatch(matcher).index | 0, matchEnd = regex.substring(matchEnd, i), runtimeString.push(null === matchEnd ? null : matchEnd), flags = 1 + flags | 0);
      matchEnd = getMatchEndIndex(matcher);
    }
    regex = regex.substring(matchEnd);
    runtimeString.push(null === regex ? null : regex);
    regex = createArrayOfClass(StringClass, runtimeString);
    for (flags = regex.valContainer.length; 0 !== flags && "" === regex.valContainer[-1 + flags | 0];) flags = -1 + flags | 0;
    flags !== regex.valContainer.length && (runtimeString = createArrayOfClass(StringClass, [flags]), copyArraySegments(regex, 0, runtimeString, 0, flags), regex = runtimeString);
  }
  return regex;
} // Splits a string by a regular expression.

// Converts a string to a character array.
function stringToCharArray(runtimeString, str) {
  runtimeString = str.length | 0;
  for (var charArray = createArrayOfClass(CharType, [runtimeString]), i = 0; i < runtimeString;) charArray.valContainer[i] = 65535 & (str.charCodeAt(i) | 0), i = 1 + i | 0;
  return charArray;
} // Converts a string to a character array.

// Converts a character array to a string.
function charArrayToString(runtimeString, charArray, offset, length) {
  runtimeString = offset + length | 0;
  if (0 > offset || runtimeString < offset || runtimeString > charArray.valContainer.length) throw (new StringIndexOutOfBoundsException()).initException();
  for (length = ""; offset !== runtimeString;) length = "" + length + globalScope.String.fromCharCode(charArray.valContainer[offset]), offset = 1 + offset | 0;
  return length;
} // Converts a character array segment to a string.

// Computes the hash code for a string.
function computeStringHash(runtimeString, str) {
  runtimeString = 0;
  for (var hashMultiplier = 1, i = -1 + (str.length | 0) | 0; 0 <= i;) runtimeString = runtimeString + intMultiply(65535 & (str.charCodeAt(i) | 0), hashMultiplier) | 0, hashMultiplier = intMultiply(31, hashMultiplier), i = -1 + i | 0;
  return runtimeString;
} // Calculates the hash code for a string.

// Formats a string using printf-style formatting.
function formatString(runtimeString, formatString, args) {
  var formatter = (new FormatterImpl()).initialize();
  if (formatter.isClosed) throw (new FormatterClosedException()).initException();
  for (var argIndex = 0, argCount = 0, formatLen = formatString.length | 0, i = 0; i !== formatLen;) {
    var percentIndex = formatString.indexOf("%", i) | 0;
    if (0 > percentIndex) {
      appendToStringBuilder(formatter, formatString.substring(i));
      break;
    }
    appendToStringBuilder(formatter, formatString.substring(i, percentIndex));
    i = 1 + percentIndex | 0;
    formatterPatternInstance || (formatterPatternInstance = (new FormatterPattern).initialize());
    var regex = formatterPatternInstance.formatRegex;
    regex.lastIndex = i;
    percentIndex = regex.exec(formatString);
    if (null === percentIndex || (percentIndex.index | 0) !== i) throw formatConversionException(formatter, i === formatLen ? "%" : formatString.substring(i, 1 + i | 0));
    i = regex.lastIndex | 0;
    regex = 65535 & (formatString.charCodeAt(-1 + i | 0) | 0);
    for (var currentFlag, flags = percentIndex[2], flagValue = 90 >= regex ? 256 : 0, flagLen = flags.length | 0, j = 0; j !== flagLen;) {
      currentFlag = 65535 & (flags.charCodeAt(j) | 0);
      switch (currentFlag) {
        case 45:
          flagValue = 1;
          break;
        case 35:
          flagValue = 2;
          break;
        case 43:
          flagValue = 4;
          break;
        case 32:
          flagValue = 8;
          break;
        case 48:
          flagValue = 16;
          break;
        case 44:
          flagValue = 32;
          break;
        case 40:
          flagValue = 64;
          break;
        case 60:
          flagValue = 128;
          break;
        default:
          throw (new MatchError()).initError(createChar(currentFlag));
      }
      if (0 !== (flagValue & flagValue)) throw (new DuplicateFormatFlagsException()).initException(globalScope.String.fromCharCode(currentFlag));
      flagValue |= flagValue;
      j = 1 + j | 0;
    }
    currentFlag = flagValue;
    flagValue = parseIntOrDefault(percentIndex[3], -1);
    var precision = parseIntOrDefault(percentIndex[4], -1);
    if (37 === regex || 110 === regex) {
      percentIndex = null;
    } else {
      if (0 !== (1 & currentFlag) && 0 > flagValue) throw (new MissingFormatWidthException()).initException("%" + percentIndex[0]);
      0 !== (128 & currentFlag) ? flags = argCount : (flags = parseIntOrDefault(percentIndex[1], 0), flags = 0 === flags ? argIndex = 1 + argIndex | 0 : 0 > flags ? argCount : flags);
      if (0 >= flags || flags > args.valContainer.length) {
        var charCode = globalScope.String.fromCharCode(regex);
        if (0 > ("bBhHsHcCdoxXeEgGfn%".indexOf(charCode) | 0)) throw formatConversionException(formatter, charCode);
        throw (new MissingFormatArgumentException()).initException("%" + percentIndex[0]);
      }
      argCount = flags;
      percentIndex = args.valContainer[-1 + flags | 0];
    }
    flags = formatter;
    var argValue = percentIndex;
    var formatChar = regex;
    percentIndex = currentFlag;
    currentFlag = flagValue;
    flagValue = precision;
    switch (formatChar) {
      case 98:
      case 66:
        0 !== (126 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 126, formatChar);
        formatStringWithPrecision(flags, percentIndex, currentFlag, flagValue, false === argValue || null === argValue ? "false" : "true");
        break;
      case 104:
      case 72:
        0 !== (126 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 126, formatChar);
        var hashStr = null === argValue ? "null" : (+computeHashCode(argValue) >>> 0).toString(16);
        formatStringWithPrecision(flags, percentIndex, currentFlag, flagValue, hashStr);
        break;
      case 115:
      case 83:
        argValue && argValue.typeDescriptor && argValue.typeDescriptor.interfaceMap.isToStringFormatter ? (0 !== (124 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 124, formatChar), argValue.format(flags, (0 !== (1 & percentIndex) ? 1 : 0) | (0 !== (2 & percentIndex) ? 4 : 0) | (0 !== (256 & percentIndex) ? 2 : 0), currentFlag, flagValue)) : (0 !== (126 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 126, formatChar), formatStringWithPrecision(flags, percentIndex, currentFlag, flagValue, "" + argValue));
        break;
      case 99:
      case 67:
        0 !== (126 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 126, formatChar);
        if (0 <= flagValue) throw (new IllegalFormatPrecisionException()).initException(flagValue);
        if (argValue instanceof CharClass) {
          formatStringWithPrecision(flags, percentIndex, currentFlag, -1, globalScope.String.fromCharCode(null === argValue ? 0 : argValue.charValue));
        } else if (isIntVal(argValue)) {
          hashStr = argValue | 0;
          if (!(0 <= hashStr && 1114111 >= hashStr)) throw (new IllegalFormatCodePointException()).initException(hashStr);
          hashStr = 65536 > hashStr ? globalScope.String.fromCharCode(hashStr) : globalScope.String.fromCharCode(-64 + (hashStr >> 10) | 55296, 56320 | 1023 & hashStr);
          formatStringWithPrecision(flags, percentIndex, currentFlag, -1, hashStr);
        } else {
          formatIllegalConversion(flags, argValue, percentIndex, currentFlag, flagValue, formatChar);
        }
        break;
      case 100:
        0 !== (2 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 2, formatChar);
        17 !== (17 & percentIndex) && 12 !== (12 & percentIndex) || throwIllegalFormatFlagsException(percentIndex);
        if (0 <= flagValue) throw (new IllegalFormatPrecisionException()).initException(flagValue);
        isIntVal(argValue) ? formatStringWithPadding(flags, percentIndex, currentFlag, "" + (argValue | 0)) : argValue instanceof LongValue ? (hashStr = normalizeLong(argValue), flags = hashStr.decimalValue, hashStr = hashStr.longValue, formatStringWithPadding(flags, percentIndex, currentFlag, formatSignedLong(getRuntimeLongUtilInstance(), flags, hashStr))) : formatIllegalConversion(flags, argValue, percentIndex, currentFlag, flagValue, formatChar);
        break;
      case 111:
        0 !== (108 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 108, formatChar);
        17 === (17 & percentIndex) && throwIllegalFormatFlagsException(percentIndex);
        if (0 <= flagValue) throw (new IllegalFormatPrecisionException()).initException(flagValue);
        hashStr = 0 !== (2 & percentIndex) ? "0" : "";
        isIntVal(argValue) ? (flagValue = (+((argValue | 0) >>> 0)).toString(8), formatStringWithPrefixSuffix(flags, percentIndex, currentFlag, hashStr, flagValue)) : argValue instanceof LongValue ? (flagValue = normalizeLong(argValue), argValue = flagValue.decimalValue, p = flagValue.longValue, getLongUtilInstance(), flagValue = 1073741823 & argValue, formatChar = 1073741823 & ((argValue >>> 30 | 0) + (p << 2) | 0), argValue = p >>> 28 | 0, 0 !== argValue ? (argValue = (+argValue >>> 0).toString(8), p = (+formatChar >>> 0).toString(8), formatChar = "0000000000".substring(p.length | 0), flagValue = (+flagValue >>> 0).toString(8), flagValue = argValue + ("" + formatChar + p) + ("" + "0000000000".substring(flagValue.length | 0) + flagValue)) : 0 !== formatChar ? (argValue = (+formatChar >>> 0).toString(8), flagValue = (+flagValue >>> 0).toString(8), flagValue = argValue + ("" + "0000000000".substring(flagValue.length | 0) + flagValue)) : flagValue = (+flagValue >>> 0).toString(8), formatStringWithPrefixSuffix(flags, percentIndex, currentFlag, hashStr, flagValue)) : formatIllegalConversion(flags, argValue, percentIndex, currentFlag, flagValue, formatChar);
        break;
      case 120:
      case 88:
        0 !== (108 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 108, formatChar);
        17 === (17 & percentIndex) && throwIllegalFormatFlagsException(percentIndex);
        if (0 <= flagValue) throw (new IllegalFormatPrecisionException()).initException(flagValue);
        hashStr = 0 === (2 & percentIndex) ? "" : 0 !== (256 & percentIndex) ? "0X" : "0x";
        isIntVal(argValue) ? (flagValue = (+((argValue | 0) >>> 0)).toString(16), formatStringWithPrefixSuffix(flags, percentIndex, currentFlag, hashStr, applyCaseConversion(percentIndex, flagValue))) : argValue instanceof LongValue ? (flagValue = normalizeLong(argValue), argValue = flagValue.decimalValue, p = flagValue.longValue, getLongUtilInstance(), flagValue = percentIndex, 0 !== p ? (p = (+p >>> 0).toString(16), argValue = (+argValue >>> 0).toString(16), argValue = p + ("" + "00000000".substring(argValue.length | 0) + argValue)) : argValue = (+argValue >>> 0).toString(16), formatStringWithPrefixSuffix(flags, flagValue, currentFlag, hashStr, applyCaseConversion(percentIndex, argValue))) : formatIllegalConversion(flags, argValue, percentIndex, currentFlag, flagValue, formatChar);
        break;
      case 101:
      case 69:
        0 !== (32 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 32, formatChar);
        17 !== (17 & percentIndex) && 12 !== (12 & percentIndex) || throwIllegalFormatFlagsException(percentIndex);
        "number" === typeof argValue ? (hashStr = +argValue, hashStr !== hashStr || Infinity === hashStr || -Infinity === hashStr ? formatSpecialDouble(flags, percentIndex, currentFlag, hashStr) : formatStringWithPadding(flags, percentIndex, currentFlag, formatDoubleExponential(hashStr, 0 <= flagValue ? flagValue : 6, 0 !== (2 & percentIndex)))) : formatIllegalConversion(flags, argValue, percentIndex, currentFlag, flagValue, formatChar);
        break;
      case 103:
      case 71:
        0 !== (2 & percentIndex) && formatFlagsConversionMismatch(percentIndex, 2, formatChar);
        17 !== (17 & percentIndex) && 12 !== (12 & percentIndex) || throwIllegalFormatFlagsException(percentIndex);
        "number" === typeof argValue ? (argValue = +argValue, argValue !== argValue || Infinity === argValue || -Infinity === argValue ? formatSpecialDouble(flags, percentIndex, currentFlag, argValue) : (hashStr = percentIndex, p = 0 <= flagValue ? flagValue : 6, percentIndex = 0 !== (2 & hashStr), flagValue = +globalScope.NumericUtil.abs(argValue), p = 0 === p ? 1 : p, 1E-4 <= flagValue && flagValue < +globalScope.NumericUtil.pow(10, p) ? (formatChar = void 0 !== globalScope.NumericUtil.log10 ? +globalScope.NumericUtil.log10(flagValue) : +globalScope.NumericUtil.log(flagValue) / 2.302585092994046, formatChar = toIntExact(+globalScope.NumericUtil.ceil(formatChar)), flagValue = +globalScope.NumericUtil.pow(10, formatChar) <= flagValue ? 1 + formatChar | 0 : formatChar, flagValue = p - flagValue | 0, percentIndex = formatDoubleFixed(argValue, 0 < flagValue ? flagValue : 0, percentIndex)) : percentIndex = formatDoubleFixed(argValue, -1 + p | 0, percentIndex), formatStringWithPadding(flags, hashStr, currentFlag, percentIndex))) : formatIllegalConversion(flags, argValue, percentIndex, currentFlag, flagValue, formatChar);
        break;
      case 102:
        17 !== (17 & percentIndex) && 12 !== (12 & percentIndex) || throwIllegalFormatFlagsException(percentIndex);
        "number" === typeof argValue ? (hashStr = +argValue, hashStr !== hashStr || Infinity === hashStr || -Infinity === hashStr ? formatSpecialDouble(flags, percentIndex, currentFlag, hashStr) : formatStringWithPadding(flags, percentIndex, currentFlag, formatDoubleFixed(hashStr, 0 <= flagValue ? flagValue : 6, 0 !== (2 & percentIndex)))) : formatIllegalConversion(flags, argValue, percentIndex, currentFlag, flagValue, formatChar);
        break;
      case 37:
        if (0 !== (254 & percentIndex)) throw (new IllegalFormatFlagsException()).initException(formatFlagsToString(percentIndex));
        if (0 <= flagValue) throw (new IllegalFormatPrecisionException()).initException(flagValue);
        if (0 !== (1 & percentIndex) && 0 > currentFlag) throw (new MissingFormatWidthException()).initException("%-%");
        formatStringWithPadding(flags, percentIndex, currentFlag, "%");
        break;
      case 110:
        if (0 !== (255 & percentIndex)) throw (new IllegalFormatFlagsException()).initException(formatFlagsToString(percentIndex));
        if (0 <= flagValue) throw (new IllegalFormatPrecisionException()).initException(flagValue);
        if (0 <= currentFlag) throw (new IllegalFormatWidthException()).initException(currentFlag);
        appendToStringBuilder(flags, "\n");
        break;
      default:
        throw formatConversionException(formatter, globalScope.String.fromCharCode(formatChar));
    }
  }
  runtimeString = formatter.toString();
  formatter.close();
  return runtimeString;
} // Formats a string using printf-style formatting.

RuntimeString.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.scalajs.runtime.RuntimeString$", {
  scala: 1,
  BaseClass: 1
});
var runtimeStringInstance; // Global instance for RuntimeString.

function getRuntimeStringInstance() {
  runtimeStringInstance || (runtimeStringInstance = (new RuntimeString).initialize());
  return runtimeStringInstance
} // Retrieves the singleton instance of RuntimeString.

function StackTraceUtil() {} // Stack Trace Utilities.
StackTraceUtil.prototype = new BaseClass;
StackTraceUtil.prototype.constructor = StackTraceUtil;
StackTraceUtil.prototype.initialize = function() {
  return this
};
// Extracts stack trace from Mozilla-like errors.
function extractStackTraceMozilla(error) {
  return (error.stack + "\n").replace(createRegexLiteral("^[\\s\\S]+?\\s+at\\s+"), " at ").replace(createRegex("^\\s+(at eval )?at\\s+", "gm"), "").replace(createRegex("^([^\\(]+?)([\\n])", "gm"), "{anonymous}() ($1)$2").replace(createRegex("^Object.\x3canonymous\x3e\\s*\\(([^\\)]+)\\)", "gm"), "{anonymous}() ($1)").replace(createRegex("^([^\\(]+|\\{anonymous\\}\\(\\)) \\((.+)\\)$", "gm"), "$1@$2").split("\n").slice(0, -1);
} // Extracts stack trace from Mozilla-like errors.

// Retrieves Scala.js class names from cache or populates it.
function getScalaJSClassNames(stackTraceUtil) {
  if (0 === (8 & stackTraceUtil.currentFlag) << 24 >> 24 && 0 === (8 & stackTraceUtil.currentFlag) << 24 >> 24) {
    stackTraceUtil.classNames = globalScope.BaseObject.keys(getScalaJSPackageNames(stackTraceUtil));
    stackTraceUtil.currentFlag = (8 | stackTraceUtil.currentFlag) << 24 >> 24;
  }
  return stackTraceUtil.classNames;
} // Retrieves Scala.js class names.

// Retrieves Scala.js primitive type names from cache or populates it.
function getScalaJSPrimitiveTypeNames(stackTraceUtil) {
  if (0 === (2 & stackTraceUtil.currentFlag) << 24 >> 24 && 0 === (2 & stackTraceUtil.currentFlag) << 24 >> 24) {
    var typeMap = {
      O: "java_lang_Object",
      T: "java_lang_String",
      V: "scala_Unit",
      Z: "scala_Boolean",
      C: "scala_Char",
      B: "scala_Byte",
      S: "scala_Short",
      I: "scala_Int",
      J: "scala_Long",
      F: "scala_Float",
      D: "scala_Double"
    };
    for (var i = 0; 22 >= i;) {
      2 <= i && (typeMap["T" + i] = "scala_Tuple" + i);
      typeMap["F" + i] = "scala_Function" + i;
      i = 1 + i | 0;
    }
    stackTraceUtil.primitiveTypeNames = typeMap;
    stackTraceUtil.currentFlag = (2 | stackTraceUtil.currentFlag) << 24 >> 24;
  }
  return stackTraceUtil.primitiveTypeNames;
} // Retrieves Scala.js primitive type names.

// Parses a single stack trace element.
function parseStackTraceElement(stackTraceUtil, element) {
  var classMethodRegex = createRegexLiteral("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.c\\.|\\$c_)([^\\.]+)(?:\\.prototype)?\\.([^\\.]+)$"),
    functionRegex = createRegexLiteral("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.(?:s|f)\\.|\\$(?:s|f)_)((?:_[^_]|[^_])+)__([^\\.]+)$"),
    staticRegex = createRegexLiteral("^(?:Object\\.|\\[object Object\\]\\.)?(?:ScalaJS\\.m\\.|\\$m_)([^\\.]+)$"),
    isStatic = false;
  classMethodRegex = classMethodRegex.exec(element);
  if (null === classMethodRegex) {
    classMethodRegex = functionRegex.exec(element);
    if (null === classMethodRegex) {
      classMethodRegex = staticRegex.exec(element);
      isStatic = true;
    }
  }
  if (null !== classMethodRegex) {
    element = classMethodRegex[1];
    if (void 0 === element) throw (new NoSuchElementException()).initException("undefined.get");
    element = 36 === (65535 & (element.charCodeAt(0) | 0)) ? element.substring(1) : element;
    var primitiveNames = getScalaJSPrimitiveTypeNames(stackTraceUtil);
    if (getWrappedDictionaryCacheInstance().hasOwnProperty.call(primitiveNames, element)) {
      stackTraceUtil = getScalaJSPrimitiveTypeNames(stackTraceUtil);
      if (!getWrappedDictionaryCacheInstance().hasOwnProperty.call(stackTraceUtil, element)) throw (new NoSuchElementException()).initException("key not found: " + element);
      stackTraceUtil = stackTraceUtil[element];
    } else {
      var i = 0;
      classMethodRegexLoop: for (;;) {
        if (i < (getScalaJSClassNames(stackTraceUtil).length | 0)) {
          primitiveNames = getScalaJSClassNames(stackTraceUtil)[i];
          if (0 < (element.length | 0) && element.substring(0, primitiveNames.length | 0) === primitiveNames) {
            stackTraceUtil = getScalaJSPackageNames(stackTraceUtil);
            if (!getWrappedDictionaryCacheInstance().hasOwnProperty.call(stackTraceUtil, primitiveNames)) throw (new NoSuchElementException()).initException("key not found: " + primitiveNames);
            stackTraceUtil = "" + stackTraceUtil[primitiveNames] + element.substring(primitiveNames.length | 0);
            break classMethodRegexLoop;
          }
          i = 1 + i | 0;
        } else {
          stackTraceUtil = 0 < (element.length | 0) && "L" === element.substring(0, 1) ? element.substring(1) : element;
          break classMethodRegexLoop;
        }
      }
    }
    stackTraceUtil = stackTraceUtil.split("_").join(".").split("$und").join("_");
    if (isStatic) {
      isStatic = "<clinit>";
    } else {
      isStatic = classMethodRegex[2];
      if (void 0 === isStatic) throw (new NoSuchElementException()).initException("undefined.get");
      0 < (isStatic.length | 0) && "init___" === isStatic.substring(0, 7) ? isStatic = "<init>" : (classMethodRegex = isStatic.indexOf("__") | 0, isStatic = 0 > classMethodRegex ? isStatic : isStatic.substring(0, classMethodRegex));
    }
    return (new ScalaTuple2()).initTuple(stackTraceUtil, isStatic);
  }
  return (new ScalaTuple2()).initTuple("<jscode>", element);
} // Parses a stack trace element to extract class and method name.

// Retrieves Scala.js package names from cache or populates it.
function getScalaJSPackageNames(stackTraceUtil) {
  if (0 === (4 & stackTraceUtil.currentFlag) << 24 >> 24 && 0 === (4 & stackTraceUtil.currentFlag) << 24 >> 24) {
    stackTraceUtil.packageNames = {
      sjsr_: "scala_scalajs_runtime_",
      sjs_: "scala_scalajs_",
      sci_: "scala_collection_immutable_",
      scm_: "scala_collection_mutable_",
      scg_: "scala_collection_generic_",
      sc_: "scala_collection_",
      sr_: "scala_runtime_",
      s_: "scala_",
      jl_: "java_lang_",
      ju_: "java_util_"
    };
    stackTraceUtil.currentFlag = (4 | stackTraceUtil.currentFlag) << 24 >> 24;
  }
  return stackTraceUtil.packageNames;
} // Retrieves Scala.js package names.

// Extracts stack trace from Opera-like errors.
function extractStackTraceOpera(error) {
  var lineScriptRegex = createRegex("Line (\\d+).*script (?:in )?(\\S+)", "i");
  error = error.message.split("\n");
  for (var stackFrames = [], i = 2, len = error.length | 0; i < len;) {
    var match = lineScriptRegex.exec(error[i]);
    if (null !== match) {
      var script = match[2];
      if (void 0 === script) throw (new NoSuchElementException()).initException("undefined.get");
      match = match[1];
      if (void 0 === match) throw (new NoSuchElementException()).initException("undefined.get");
      stackFrames.push("{anonymous}()@" + script + ":" + match);
    }
    i = 2 + i | 0;
  }
  return stackFrames;
} // Extracts stack trace from Opera-like errors.

StackTraceUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.scalajs.runtime.StackTrace$", {
  scala: 1,
  BaseClass: 1
});
var stackTraceUtilInstance; // Global instance for StackTraceUtil.

function RuntimeStringRegex() {} // Runtime String Regex.
RuntimeStringRegex.prototype = new BaseClass;
RuntimeStringRegex.prototype.constructor = RuntimeStringRegex;
RuntimeStringRegex.prototype.initialize = function() {
  return this
};
// Creates a regular expression from a string pattern.
function createRegex(pattern, flags) {
  runtimeStringRegexInstance || (runtimeStringRegexInstance = (new RuntimeStringRegex).initialize());
  return new globalScope.RegExp(pattern, flags);
} // Creates a regular expression.

// Creates a regular expression from a literal string pattern.
function createRegexLiteral(pattern) {
  runtimeStringRegexInstance || (runtimeStringRegexInstance = (new RuntimeStringRegex).initialize());
  return new globalScope.RegExp(pattern);
} // Creates a regular expression from a literal.

RuntimeStringRegex.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.scalajs.runtime.StackTrace$StringRE$", {
  scala: 1,
  BaseClass: 1
});
var runtimeStringRegexInstance; // Global instance for RuntimeStringRegex.

function RuntimePackage() {} // Runtime Package.
RuntimePackage.prototype = new BaseClass;
RuntimePackage.prototype.constructor = RuntimePackage;
RuntimePackage.prototype.initialize = function() {
  return this
};
// Unwraps a throwable if it's a wrapped Scala.js exception.
function unwrapThrowable(runtimePackage, throwable) {
  return throwable instanceof WrappedThrowable ? throwable.underlying : throwable;
} // Unwraps a throwable.

// Wraps a throwable in a Scala.js exception if it's not already.
function wrapThrowable(runtimePackage, throwable) {
  return throwable instanceof Throwable ? throwable : (new WrappedThrowable()).initWrapped(throwable);
} // Wraps a throwable.

RuntimePackage.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.scalajs.runtime.package$", {
  scala: 1,
  BaseClass: 1
});
var runtimePackageInstance; // Global instance for RuntimePackage.

function getRuntimePackage() {
  runtimePackageInstance || (runtimePackageInstance = (new RuntimePackage).initialize());
  return runtimePackageInstance
} // Retrieves the singleton instance of RuntimePackage.

function BoxesRunTime() {} // Boxes Runtime.
BoxesRunTime.prototype = new BaseClass;
BoxesRunTime.prototype.constructor = BoxesRunTime;
BoxesRunTime.prototype.initialize = function() {
  return this
};
// Checks equality for character values.
function charEquals(boxesRunTime, charVal, other) {
  if (other instanceof CharClass) return charVal.charValue === other.charValue;
  if (isAnyVal(other)) {
    if ("number" === typeof other) return +other === charVal.charValue;
    if (other instanceof LongValue) {
      other = normalizeLong(other);
      var decimal = other.longValue;
      charVal = charVal.charValue;
      return other.decimalValue === charVal && decimal === (charVal >> 31);
    }
    return other instanceof AnyOrdering ? other.equals(charVal.charValue) : false;
  }
  return null === charVal ? null === other : areValuesEqual(charVal, other);
} // Compares character values for equality.

// Checks equality for JavaScript values, handling Scala.js boxing.
function jsValueEquals(boxesRunTime, val1, val2) {
  if (val1 === val2) return true;
  else if (isAnyVal(val1)) {
    return isAnyVal(val2) ? longEquals(0, val1, val2) : (
      val2 instanceof CharClass ? (
        "number" === typeof val1 ? val2 = +val1 === val2.charValue :
        val1 instanceof LongValue ? (
          boxesRunTime = normalizeLong(val1), val1 = boxesRunTime.longValue, val2 = val2.charValue, val2 = boxesRunTime.decimalValue === val2 && val1 === (val2 >> 31)
        ) : val2 = false,
        val2
      ) :
      null === val1 ? null === val2 : areValuesEqual(val1, val2)
    );
  } else {
    return val1 instanceof CharClass ? charEquals(val1, val2) : null === val1 ? null === val2 : areValuesEqual(val1, val2);
  }
} // Compares two JavaScript values for equality.

// Checks equality for long values.
function longEquals(boxesRunTime, longVal1, longVal2) {
  if ("number" === typeof longVal1) {
    boxesRunTime = +longVal1;
    return "number" === typeof longVal2 ? boxesRunTime === +longVal2 : longVal2 instanceof LongValue ? (longVal1 = normalizeLong(longVal2), longVal2 = longVal1.longValue, boxesRunTime === longToDouble(getRuntimeLongUtilInstance(), longVal1.decimalValue, longVal2)) : longVal2 instanceof AnyOrdering ? longVal2.equals(boxesRunTime) : false;
  }
  if (longVal1 instanceof LongValue) {
    longVal1 = normalizeLong(longVal1);
    boxesRunTime = longVal1.decimalValue;
    longVal1 = longVal1.longValue;
    if (longVal2 instanceof LongValue) {
      longVal2 = normalizeLong(longVal2);
      var decimal2 = longVal2.longValue;
      return boxesRunTime === longVal2.decimalValue && longVal1 === decimal2;
    }
    return "number" === typeof longVal2 ? (longVal2 = +longVal2, longToDouble(getRuntimeLongUtilInstance(), boxesRunTime, longVal1) === longVal2) : longVal2 instanceof AnyOrdering ? longVal2.equals((new LongValue()).initLong(boxesRunTime, longVal1)) : false;
  }
  return null === longVal1 ? null === longVal2 : areValuesEqual(longVal1, longVal2);
} // Compares two long values for equality.

BoxesRunTime.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.runtime.BoxesRunTime$", {
  scala: 1,
  BaseClass: 1
});
var boxesRunTimeInstance; // Global instance for BoxesRunTime.

function getBoxesRunTimeInstance() {
  boxesRunTimeInstance || (boxesRunTimeInstance = (new BoxesRunTime).initialize());
  return boxesRunTimeInstance
} // Retrieves the singleton instance of BoxesRunTime.

var NullSingletonType = createObjectType({
  scala: 0
}, false, "scala.runtime.Null$", {
  scala: 1,
  BaseClass: 1
});

function RichDouble() {} // Rich Double.
RichDouble.prototype = new BaseClass;
RichDouble.prototype.constructor = RichDouble;
RichDouble.prototype.initialize = function() {
  return this
};
RichDouble.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.runtime.RichDouble$", {
  scala: 1,
  BaseClass: 1
});
var richDoubleInstance; // Global instance for RichDouble.

function getRichDoubleInstance() {
  richDoubleInstance || (richDoubleInstance = (new RichDouble).initialize());
} // Initializes RichDouble.

function RichLong() {} // Rich Long.
RichLong.prototype = new BaseClass;
RichLong.prototype.constructor = RichLong;
RichLong.prototype.initialize = function() {
  return this
};
// Converts a long to a double.
function longToDouble(richLong, longVal) {
  return longToDouble(getRuntimeLongUtilInstance(), longVal.decimalValue, longVal.longValue);
} // Converts a Scala.js Long to a JavaScript double.

RichLong.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.runtime.RichLong$", {
  scala: 1,
  BaseClass: 1
});
var richLongInstance; // Global instance for RichLong.

function getRichLongInstance() {
  richLongInstance || (richLongInstance = (new RichLong).initialize());
  return richLongInstance
} // Retrieves the singleton instance of RichLong.

function ScalaRunTime() {} // Scala Run Time.
ScalaRunTime.prototype = new BaseClass;
ScalaRunTime.prototype.constructor = ScalaRunTime;
ScalaRunTime.prototype.initialize = function() {
  return this
};
// Gets the length of a Scala.js array.
function getArrayLength(scalaRunTime, array) {
  if (
    isVector(array, 1) ||
    isIntArray(array, 1) ||
    isDoubleArray(array, 1) ||
    isLongArray(array, 1) ||
    isFloatArray(array, 1) ||
    isCharArray(array, 1) ||
    isByteArray(array, 1) ||
    isShortArray(array, 1) ||
    isBooleanArray(array, 1)
  ) return array.valContainer.length;
  if (null === array) throw (new NullPointerException()).initException();
  throw (new MatchError()).initError(array);
} // Retrieves the length of a Scala.js array.

// Sets an element in a Scala.js array.
function setArrayElement(scalaRunTime, array, index, value) {
  if (isVector(array, 1)) {
    array.valContainer[index] = value;
  } else if (isIntArray(array, 1)) {
    array.valContainer[index] = value | 0;
  } else if (isDoubleArray(array, 1)) {
    array.valContainer[index] = +value;
  } else if (isLongArray(array, 1)) {
    array.valContainer[index] = normalizeLong(value);
  } else if (isFloatArray(array, 1)) {
    array.valContainer[index] = +value;
  } else if (isCharArray(array, 1)) {
    array.valContainer[index] = null === value ? 0 : value.charValue;
  } else if (isByteArray(array, 1)) {
    array.valContainer[index] = value | 0;
  } else if (isShortArray(array, 1)) {
    array.valContainer[index] = value | 0;
  } else if (isBooleanArray(array, 1)) {
    array.valContainer[index] = !!value;
  } else if (isBoxedUnit(array)) {
    array.valContainer[index] = void 0;
  } else {
    if (null === array) throw (new NullPointerException()).initException();
    throw (new MatchError()).initError(array);
  }
} // Sets an element in a Scala.js array.

// Formats a product (case class) to a string.
function formatProduct(scalaRunTime, product) {
  var iterator = (new ProductIterator()).initIterator(product);
  return formatCollection(iterator, product.productPrefix() + "(", ",", ")");
} // Formats a product to a string.

// Gets an element from a Scala.js array.
function getArrayElement(scalaRunTime, array, index) {
  if (
    isVector(array, 1) ||
    isIntArray(array, 1) ||
    isDoubleArray(array, 1) ||
    isLongArray(array, 1) ||
    isFloatArray(array, 1)
  ) return array.valContainer[index];
  if (isCharArray(array, 1)) return createChar(array.valContainer[index]);
  if (isByteArray(array, 1) || isShortArray(array, 1) || isBooleanArray(array, 1) || isBoxedUnit(array)) return array.valContainer[index];
  if (null === array) throw (new NullPointerException()).initException();
  throw (new MatchError()).initError(array);
} // Retrieves an element from a Scala.js array.

ScalaRunTime.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.runtime.ScalaRunTime$", {
  scala: 1,
  BaseClass: 1
});
var scalaRunTimeInstance; // Global instance for ScalaRunTime.

function getScalaRunTimeInstance() {
  scalaRunTimeInstance || (scalaRunTimeInstance = (new ScalaRunTime).initialize());
  return scalaRunTimeInstance
} // Retrieves the singleton instance of ScalaRunTime.

function StaticsUtil() {} // Statics Utilities.
StaticsUtil.prototype = new BaseClass;
StaticsUtil.prototype.constructor = StaticsUtil;
currentProto = StaticsUtil.prototype;
currentProto.initialize = function() {
  return this
};
currentProto.mixValue = function(currentHash, value) {
  value = intMultiply(-862048943, value);
  value = intMultiply(461845907, value << 15 | value >>> 17 | 0);
  return currentHash ^ value;
};
// Hashes a long value.
function hashLong(staticsUtil, longVal) {
  staticsUtil = toIntExact(longVal);
  if (staticsUtil === longVal) return staticsUtil;
  var tempLong = getRuntimeLongUtilInstance();
  staticsUtil = doubleToLong(tempLong, longVal);
  tempLong = tempLong.remainder;
  return longToDouble(getRuntimeLongUtilInstance(), staticsUtil, tempLong) === longVal ? staticsUtil ^ tempLong : computeDoubleHash(getBitsUtilInstance(), longVal);
} // Computes a hash for a long value.

// Hashes any value.
function hashAny(staticsUtil, value) {
  return null === value ? 0 : "number" === typeof value ? hashLong(0, +value) : value instanceof LongValue ? (staticsUtil = normalizeLong(value), hashLongBits(0, (new LongValue()).initLong(staticsUtil.decimalValue, staticsUtil.longValue))) : computeHashCode(value);
} // Computes a hash for any Scala.js value.

// Hashes the bits of a long value.
function hashLongBits(staticsUtil, longVal) {
  staticsUtil = longVal.decimalValue;
  longVal = longVal.longValue;
  return longVal === (staticsUtil >> 31) ? staticsUtil : staticsUtil ^ longVal;
} // Computes a hash from the bits of a long value.

currentProto.mixHash = function(currentHash, hash) {
  currentHash = this.mixValue(currentHash, hash);
  return -430675100 + intMultiply(5, currentHash << 13 | currentHash >>> 19 | 0) | 0;
};
currentProto.finalizeHash = function(hash, length) {
  hash ^= length;
  hash = intMultiply(-2048144789, hash ^ (hash >>> 16 | 0));
  hash = intMultiply(-1028477387, hash ^ (hash >>> 13 | 0));
  return hash ^ (hash >>> 16 | 0);
};
StaticsUtil.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "scala.runtime.Statics$", {
  scala: 1,
  BaseClass: 1
});
var staticsUtilInstance; // Global instance for StaticsUtil.

function getStaticsUtilInstance() {
  staticsUtilInstance || (staticsUtilInstance = (new StaticsUtil).initialize());
  return staticsUtilInstance
} // Retrieves the singleton instance of StaticsUtil.

function StdInConverterLambda1() {} // StdInConverter Lambda 1.
StdInConverterLambda1.prototype = new BaseClass;
StdInConverterLambda1.prototype.constructor = StdInConverterLambda1;
StdInConverterLambda1.prototype.process = function(input) {
  return (0, this.lambdaFunction)(input);
};
StdInConverterLambda1.prototype.initResult = function(lambda) {
  this.lambdaFunction = lambda;
  return this
};
StdInConverterLambda1.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "atcoder.StdInConverter$$$Lambda$1", {
  scala: 1,
  BaseClass: 1,
  Function1: 1
});

function StdInConverterLambda2() {} // StdInConverter Lambda 2.
StdInConverterLambda2.prototype = new BaseClass;
StdInConverterLambda2.prototype.constructor = StdInConverterLambda2;
StdInConverterLambda2.prototype.process = function(input) {
  return (0, this.lambdaFunction)(input);
};
StdInConverterLambda2.prototype.initResult = function(lambda) {
  this.lambdaFunction = lambda;
  return this
};
StdInConverterLambda2.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "atcoder.StdInConverter$$$Lambda$2", {
  scala: 1,
  BaseClass: 1,
  Function1: 1
});

function StdInConverterLambda3() {} // StdInConverter Lambda 3.
StdInConverterLambda3.prototype = new BaseClass;
StdInConverterLambda3.prototype.constructor = StdInConverterLambda3;
StdInConverterLambda3.prototype.process = function(input) {
  return (0, this.lambdaFunction)(input);
};
StdInConverterLambda3.prototype.initResult = function(lambda) {
  this.lambdaFunction = lambda;
  return this
};
StdInConverterLambda3.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "atcoder.StdInConverter$$$Lambda$3", {
  scala: 1,
  BaseClass: 1,
  Function1: 1
});

function StdInConverterLambda4() {} // StdInConverter Lambda 4.
StdInConverterLambda4.prototype = new BaseClass;
StdInConverterLambda4.prototype.constructor = StdInConverterLambda4;
StdInConverterLambda4.prototype.process = function(input) {
  return (0, this.lambdaFunction)(input);
};
StdInConverterLambda4.prototype.initResult = function(lambda) {
  this.lambdaFunction = lambda;
  return this
};
StdInConverterLambda4.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "atcoder.StdInConverter$$$Lambda$4", {
  scala: 1,
  BaseClass: 1,
  Function1: 1
});

function StdInConverterLambda5() {} // StdInConverter Lambda 5.
StdInConverterLambda5.prototype = new BaseClass;
StdInConverterLambda5.prototype.constructor = StdInConverterLambda5;
StdInConverterLambda5.prototype.process = function(input) {
  return (0, this.lambdaFunction)(input);
};
StdInConverterLambda5.prototype.initResult = function(lambda) {
  this.lambdaFunction = lambda;
  return this
};
StdInConverterLambda5.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "atcoder.StdInConverter$$$Lambda$5", {
  scala: 1,
  BaseClass: 1,
  Function1: 1
});

function NotNullAnon1() {} // NotNull Anonymous 1.
NotNullAnon1.prototype = new BaseClass;
NotNullAnon1.prototype.constructor = NotNullAnon1;
NotNullAnon1.prototype.initialize = function() {
  return this
};
NotNullAnon1.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.NotNull$$anon$1", {
  scala: 1,
  BaseClass: 1,
  Serializable: 1
});

function ShowToShowOpsAnon1() {} // Show ToShowOps Anonymous 1.
ShowToShowOpsAnon1.prototype = new BaseClass;
ShowToShowOpsAnon1.prototype.constructor = ShowToShowOpsAnon1;
ShowToShowOpsAnon1.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.Show$ToShowOps$$anon$1", {
  scala: 1,
  BaseClass: 1,
  Serializable: 1
});

function IOOperationBase() {} // IO Operation Base.
IOOperationBase.prototype = new BaseClass;
IOOperationBase.prototype.constructor = IOOperationBase;

// Runs an IO operation, handling errors and continuations.
function runIOResult(ioRunLoop, ioOp) {
  ioOp = runIOOperation(getIORunLoopInstance(), ioOp);
  if (ioOp instanceof IOPure) {
    // If pure, wrap in a Some.
    ioOp = (new SomeResult()).initSome(ioOp.value);
  } else {
    if (ioOp instanceof IORaiseError) throw ioOp = ioOp.error, unwrapThrowable(getRuntimePackage(), ioOp);
    if (ioOp instanceof IOAsync) {
      // If async, schedule an async run.
      getIOPlatform().getIOPlatformInstance();
      var callback = (new IOPlatformResyncCallback()).initialize();
      getIOConnectionInstance();
      var connection = (new IOConnectionImpl()).initialize();
      executeIORunLoop(getIORunLoopInstance(), ioOp, connection, callback, null, null, null);
      if (0 === (2 & connection.initializationFlags) << 24 >> 24) throw (new UninitializedFieldException()).initException("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/shared/src/main/scala/cats/effect/internals/IOConnection.scala: 109");
      ioOp = connection.callbackResult;
      connection = callback.internalState;
      if (connection instanceof RightResult) {
        ioOp = (new SomeResult()).initSome(connection.content);
      } else {
        if (connection instanceof LeftResult) throw ioOp = connection.content, unwrapThrowable(getRuntimePackage(), ioOp);
        if (null === connection) {
          callback.isCanceled = false;
          callback.isReady = true;
          callback = getCallbackManager();
          if (0 === (1 & callback.currentFlag) << 24 >> 24) throw (new UninitializedFieldException()).initException("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/shared/src/main/scala/cats/effect/internals/Callback.scala: 37");
          callback = callback.callbackFunction;
          connection = getIORunLoopInstance();
          var ioConnection = getIOConnectionInstance();
          if (!ioConnection.isInitialized) throw (new UninitializedFieldException()).initException("Uninitialized field: /Users/daniel/Development/Scala/cats-effect/core/shared/src/main/scala/cats/effect/internals/IOConnection.scala: 94");
          executeIORunLoop(connection, ioOp, ioConnection.connectionQueue, callback, null, null, null);
          throw (new UnsupportedOperationException()).initException("cannot synchronously await result on JavaScript; use runAsync or unsafeRunAsync");
        }
        throw (new MatchError()).initError(connection);
      }
    } else {
      throw (new AssertionError()).initException("unreachable");
    }
  }
  return ioOp.get();
} // Executes an IO operation and returns its result synchronously.

function IOConnectionImpl() {} // IO Connection Implementation.
IOConnectionImpl.prototype = new BaseClass;
IOConnectionImpl.prototype.constructor = IOConnectionImpl;
// Initializes the IO connection.
IOConnectionImpl.prototype.initialize = function() {
  this.cancelToken = (new AtomicReference()).initValue((getScalaPackage().emptyList));
  this.initializationFlags = (1 | this.initializationFlags) << 24 >> 24;
  getScalaPackage();
  this.callbackResult = (new IODelay()).initDelay(createFunction0(function(connectionImpl) {
    return function() {
      var ref = connectionImpl.cancelToken,
        value = ref.internalState;
      ref.internalState = null;
      // If the value is null or an empty list, return None.
      // Otherwise, if it's a ListEntry, extract the head and tail, log tail elements, and return the head wrapped in a Some.
      return null === value || getScalaPackage().emptyList.equals(value) ? getOptionSingletonInstance().empty : value instanceof ListEntry ? (
        getCancelUtils(),
        executeCancelable(cancelUtilsInstance, value)
      ) : (
        // If it's anything else, throw a MatchError.
        // This is a simplified representation of the original logic, assuming the result is an Option of a cancelable task.
        // The original code has more complex type checks and unwrapping.
        // For type II cloning, I'll preserve the structure, but simplify the internal logic if it's not directly related to control flow.
        // The original code had a MatchError here.
        // I'll keep the MatchError for structural equivalence.
        (new MatchError()).initError(value)
      );
    };
  }(this)));
  this.initializationFlags = (2 | this.initializationFlags) << 24 >> 24;
  return this
};
IOConnectionImpl.prototype.isCanceled = function() {
  return null === this.cancelToken.internalState;
};
IOConnectionImpl.prototype.cancelAll = function() {
  for (;;) {
    var token = this.cancelToken.internalState;
    if (null === token || getScalaPackage().emptyList.equals(token)) {
      getScalaPackage().getPredefSingletonInstance(); // Call to Predef.
      break;
    }
    if (token instanceof ListEntry) {
      // Compare and swap logic.
      var nextToken = this.cancelToken;
      if (token === nextToken.internalState) {
        nextToken.internalState = token.nextEntry;
        token = true;
      } else {
        token = false;
      }
      if (token) break;
    } else {
      throw (new MatchError()).initError(token);
    }
  }
};
IOConnectionImpl.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.IOConnection$Impl", {
  scala: 1,
  BaseClass: 1,
  IOConnectionBase: 1
});

function IOPlatform() {} // IO Platform.
IOPlatform.prototype = new BaseClass;
IOPlatform.prototype.constructor = IOPlatform;
IOPlatform.prototype.initialize = function() {
  return this
};
IOPlatform.prototype.typeDescriptor = createObjectType({
  scala: 0
}, false, "cats.effect.internals.IOPlatform$", {
  scala: 1,
  BaseClass: 1
});
var ioPlatformInstance; // Global instance for IOPlatform.

function getIOPlatform() {
  ioPlatformInstance || (ioPlatformInstance = (new IOPlatform).initialize());
  return ioPlatformInstance
} // Retrieves the singleton instance of IOPlatform.

function IORunLoop() {} // IO Run Loop.
IORunLoop.prototype = new BaseClass;
IORunLoop.prototype.constructor = IORunLoop;
// Extracts a cancel token from the connection.
function extractCancelToken(ioConnection, cancelTokenQueue) {
  if (null !== ioConnection) return ioConnection;
  if (null === cancelTokenQueue) return null;
  for (;;) {
    ioConnection = cancelTokenQueue.retrieveNext();
    if (null === ioConnection) return null;
    if (ioConnection instanceof Function1) return ioConnection;
  }
} // Extracts a cancel token from the connection.

IORunLoop.prototype.initialize = function() {
  this.maxIterations = 512;
  this.isInitialized = true;
  return this
};
// Extracts an IO connection from the connection queue.
function extractIOConnection(ioConnection, cancelTokenQueue) {
  if (ioConnection instanceof IOConnectionImpl) return ioConnection;
  if (null === cancelTokenQueue) return null;
  for (;;) {
    ioConnection = cancelTokenQueue.retrieveNext();
    if (null === ioConnection) return null;
    if (ioConnection instanceof IOConnectionImpl) return ioConnection;
  }
} // Extracts an IO connection from the connection queue.

// Runs an asynchronous IO operation.
function runAsyncLoop(runLoop, ioOp, ioConnection, asyncCallback) {
  return null !== ioConnection || null !== asyncCallback && !asyncCallback.isEmpty() ? runAsyncLoopInternal(new IOAsync(), createFunction2(function(runLoop, ioOp, ioConnection, asyncCallback) {
    return function(connection, callback) {
      executeIORunLoop(runLoop, ioOp, connection, callback, null, ioConnection, asyncCallback);
    };
  }(runLoop, ioOp, ioConnection, asyncCallback))) : ioOp;
} // Runs an asynchronous IO operation.

// Runs a synchronous IO effect.
function runSyncEffect(ioOp) {
  try {
    return executeFunction0(ioOp);
  } catch (error) {
    ioOp = wrapThrowable(getRuntimePackage(), error);
    if (null !== ioOp) {
      var nonFatalResult = wrapIfNonFatal(getNonFatalSingletonInstance(), ioOp);
      if (!nonFatalResult.isEmpty()) return ioOp = nonFatalResult.get(), createIORaiseError(ioOp);
      throw unwrapThrowable(getRuntimePackage(), ioOp);
    }
    throw error;
  }
} // Runs a synchronous IO effect.

// Executes the main IO run loop.
function executeIORunLoop(runLoop, ioOp, ioConnection, asyncCallback, callbackResult, restartConnection, cancelTokenQueue) {
  var currentOp = ioOp;
  var currentConnection = ioConnection;
  var currentCallback = asyncCallback;
  var isRestarting = false;
  var pureValue = null;
  for (var i = 0;; i++) {
    var op = currentOp;
    if (op instanceof IOBind) {
      currentOp = op.nextOperation;
      var bindFunction = op.bindFunction;
      // If there's a restart connection, add bind function to its queue.
      null !== currentConnection && (null === cancelTokenQueue && (cancelTokenQueue = (new ArrayStack()).initialize()), cancelTokenQueue.add(currentConnection));
      currentConnection = bindFunction;
    } else if (op instanceof IOPure) {
      pureValue = op.value;
      isRestarting = true;
    } else if (op instanceof IODelay) {
      op = op.delayFunction;
      try {
        pureValue = runSyncEffect(op);
        isRestarting = true;
        currentOp = null;
      } catch (error) {
        if (currentOp = wrapThrowable(getRuntimePackage(), error), null !== currentOp) {
          op = wrapIfNonFatal(getNonFatalSingletonInstance(), currentOp);
          if (op.isEmpty()) throw unwrapThrowable(getRuntimePackage(), currentOp);
          current