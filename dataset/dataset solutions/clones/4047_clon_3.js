const moduleSystemBootstrapper = function (
  moduleDefinitionsMap,
  loadedModuleCache,
  initialEntryPoints,
  globalExportIdentifier
) {
  let loadingIssueEncountered;

  const parentModuleLoaderRef = typeof moduleSystemBootstrapper === "function" ? moduleSystemBootstrapper : null;
  const nativeNodeRequireRef = typeof require === "function" ? require : null;

  function processModuleLoad(moduleId, isRecursiveCall = false) {
    if (loadedModuleCache[moduleId]) {
      return loadedModuleCache[moduleId].exports;
    }

    if (!moduleDefinitionsMap[moduleId]) {
      if (!isRecursiveCall && typeof moduleSystemBootstrapper === "function") {
        return moduleSystemBootstrapper(moduleId, true);
      }
      if (parentModuleLoaderRef) {
        return parentModuleLoaderRef(moduleId, true);
      }
      if (nativeNodeRequireRef && typeof moduleId === "string") {
        return nativeNodeRequireRef(moduleId);
      }

      const moduleNotFound = new Error(`Cannot locate module with ID: '${moduleId}'.`);
      moduleNotFound.code = "MODULE_NOT_FOUND";
      throw moduleNotFound;
    }

    const currentModuleContext = {};
    currentModuleContext.resolve = function (dependencyPath) {
      const resolvedPath = moduleDefinitionsMap[moduleId][1][dependencyPath];
      return resolvedPath !== undefined ? resolvedPath : dependencyPath;
    };
    currentModuleContext.cache = {};

    const newModuleInstance = new processModuleLoad.Module(moduleId);
    loadedModuleCache[moduleId] = newModuleInstance;

    moduleDefinitionsMap[moduleId][0].call(
      newModuleInstance.exports,
      currentModuleContext,
      newModuleInstance,
      newModuleInstance.exports,
      this
    );

    return newModuleInstance.exports;
  }

  processModuleLoad.isParcelRequire = true;

  processModuleLoad.Module = function (identifier) {
    this.id = identifier;
    this.bundle = processModuleLoad;
    this.exports = {};
  };

  processModuleLoad.modules = moduleDefinitionsMap;
  processModuleLoad.cache = loadedModuleCache;
  processModuleLoad.parent = parentModuleLoaderRef;

  processModuleLoad.register = function (registerId, registerContent) {
    moduleDefinitionsMap[registerId] = [
      function (modExportCtx, modInst) {
        modInst.exports = registerContent;
      },
      {}
    ];
  };

  let currentEntryIdx = 0;
  while (currentEntryIdx < initialEntryPoints.length) {
    const entryIdToLoad = initialEntryPoints[currentEntryIdx];
    try {
      processModuleLoad(entryIdToLoad);
    } catch (err) {
      if (!loadingIssueEncountered) {
        loadingIssueEncountered = err;
      }
    }
    currentEntryIdx++;
  }

  if (initialEntryPoints.length > 0) {
    const lastModuleExports = processModuleLoad(initialEntryPoints[initialEntryPoints.length - 1]);
    const isCommonJS = typeof exports === "object" && typeof module !== "undefined";
    const isAMD = typeof define === "function" && define.amd;

    if (isCommonJS) {
      module.exports = lastModuleExports;
    } else if (isAMD) {
      define(() => lastModuleExports);
    } else if (globalExportIdentifier) {
      this[globalExportIdentifier] = lastModuleExports;
    }
  }

  if (loadingIssueEncountered) {
    throw loadingIssueEncountered;
  }

  moduleSystemBootstrapper = processModuleLoad;

  return processModuleLoad;
};

moduleSystemBootstrapper({
  "AppEntry": [
    function (moduleLocalRequire, moduleInstance, moduleExports, globalThisContext) {
      const runtimeApplicationContext = {};

      "use strict";

      runtimeApplicationContext["Control.Apply"] = runtimeApplicationContext["Control.Apply"] || {};
      const applyUtilities = runtimeApplicationContext["Control.Apply"];

      applyUtilities.Apply = function (functorZero, applierFunc) {
        this.Functor0 = functorZero;
        this.apply = applierFunc;
      };

      applyUtilities.performApply = function (applyInstance) {
        return applyInstance.apply;
      };

      runtimeApplicationContext["Control.Applicative"] = runtimeApplicationContext["Control.Applicative"] || {};
      const applicativeUtils = runtimeApplicationContext["Control.Applicative"];
      const applyControl = runtimeApplicationContext["Control.Apply"];

      const getPureFunction = function (applicativeInstance) {
        return applicativeInstance.pure;
      };

      applicativeUtils.Applicative = function (applyZero, pureFunc) {
        this.Apply0 = applyZero;
        this.pure = pureFunc;
      };

      applicativeUtils.pure = getPureFunction;

      applicativeUtils.liftA1 = function (applicativeInstance) {
        return function (funcToLift) {
          return function (wrappedValue) {
            const applyMethod = applyControl.performApply(applicativeInstance.Apply0());
            const pureMethod = getPureFunction(applicativeInstance);
            return applyMethod(pureMethod(funcToLift))(wrappedValue);
          };
        };
      };

      runtimeApplicationContext["Data.EuclideanRing"] = runtimeApplicationContext["Data.EuclideanRing"] || {};
      const euclideanIntOps = runtimeApplicationContext["Data.EuclideanRing"];

      euclideanIntOps.integerDegree = function (inputNumber) {
        return Math.min(Math.abs(inputNumber), 2147483647);
      };

      euclideanIntOps.integerDivide = function (dividend) {
        return function (divisor) {
          if (divisor === 0) {
            return 0;
          }
          if (divisor > 0) {
            return Math.floor(dividend / divisor);
          } else {
            return -Math.floor(dividend / -divisor);
          }
        };
      };

      euclideanIntOps.integerModulo = function (dividend) {
        return function (divisor) {
          if (divisor === 0) {
            return 0;
          }
          const absDivisor = Math.abs(divisor);
          const tempResult = dividend % absDivisor;
          return (tempResult + absDivisor) % absDivisor;
        };
      };

      runtimeApplicationContext["Data.Ring"] = runtimeApplicationContext["Data.Ring"] || {};
      const ringHelpers = runtimeApplicationContext["Data.Ring"];

      ringHelpers.integerSubtract = function (minuend) {
        return function (subtrahend) {
          return (minuend - subtrahend) | 0;
        };
      };

      runtimeApplicationContext["Data.Semiring"] = runtimeApplicationContext["Data.Semiring"] || {};
      const semiringHelpers = runtimeApplicationContext["Data.Semiring"];

      semiringHelpers.integerAdd = function (addend1) {
        return function (addend2) {
          return (addend1 + addend2) | 0;
        };
      };

      semiringHelpers.integerMultiply = function (factor1) {
        return function (factor2) {
          return (factor1 * factor2) | 0;
        };
      };

      runtimeApplicationContext["Data.Semiring"] = runtimeApplicationContext["Data.Semiring"] || {};
      const semiringTypeClass = runtimeApplicationContext["Data.Semiring"];
      const semiringIntHelpers = runtimeApplicationContext["Data.Semiring"];

      const SemiringConstructor = function (addFn, mulFn, oneVal, zeroVal) {
        this.add = addFn;
        this.mul = mulFn;
        this.one = oneVal;
        this.zero = zeroVal;
      };

      const integerSemiringInstance = new SemiringConstructor(
        semiringIntHelpers.integerAdd,
        semiringIntHelpers.integerMultiply,
        1,
        0
      );

      semiringTypeClass.Semiring = SemiringConstructor;

      semiringTypeClass.getAdd = function (instance) { return instance.add; };
      semiringTypeClass.getZero = function (instance) { return instance.zero; };
      semiringTypeClass.getMul = function (instance) { return instance.mul; };
      semiringTypeClass.getOne = function (instance) { return instance.one; };

      semiringTypeClass.semiringInt = integerSemiringInstance;

      runtimeApplicationContext["Data.Ring"] = runtimeApplicationContext["Data.Ring"] || {};
      const ringTypeClass = runtimeApplicationContext["Data.Ring"];
      const ringIntHelpers = runtimeApplicationContext["Data.Ring"];
      const semiringModule = runtimeApplicationContext["Data.Semiring"];

      const RingConstructor = function (semiringZero, subFn) {
        this.Semiring0 = semiringZero;
        this.sub = subFn;
      };

      const integerRingInstance = new RingConstructor(
        function () { return semiringModule.semiringInt; },
        ringIntHelpers.integerSubtract
      );

      ringTypeClass.Ring = RingConstructor;
      ringTypeClass.getSub = function (instance) { return instance.sub; };
      ringTypeClass.ringInt = integerRingInstance;

      runtimeApplicationContext["Data.CommutativeRing"] = runtimeApplicationContext["Data.CommutativeRing"] || {};
      const commRingTypeClass = runtimeApplicationContext["Data.CommutativeRing"];
      const ringModule = runtimeApplicationContext["Data.Ring"];

      const CommutativeRingConstructor = function (ringZero) {
        this.Ring0 = ringZero;
      };

      const integerCommutativeRingInstance = new CommutativeRingConstructor(
        function () { return ringModule.ringInt; }
      );

      commRingTypeClass.CommutativeRing = CommutativeRingConstructor;
      commRingTypeClass.commutativeRingInt = integerCommutativeRingInstance;

      runtimeApplicationContext["Data.EuclideanRing"] = runtimeApplicationContext["Data.EuclideanRing"] || {};
      const euclideanRingTypeClass = runtimeApplicationContext["Data.EuclideanRing"];
      const euclideanIntFunctions = runtimeApplicationContext["Data.EuclideanRing"];
      const commRingModule = runtimeApplicationContext["Data.CommutativeRing"];

      const EuclideanRingConstructor = function (commRingZero, degreeFunc, divFunc, modFunc) {
        this.CommutativeRing0 = commRingZero;
        this.degree = degreeFunc;
        this.div = divFunc;
        this.mod = modFunc;
      };

      const integerEuclideanRingInstance = new EuclideanRingConstructor(
        function () { return commRingModule.commutativeRingInt; },
        euclideanIntFunctions.integerDegree,
        euclideanIntFunctions.integerDivide,
        euclideanIntFunctions.integerModulo
      );

      euclideanRingTypeClass.EuclideanRing = EuclideanRingConstructor;

      euclideanRingTypeClass.getDegree = function (instance) { return instance.degree; };
      euclideanRingTypeClass.getDiv = function (instance) { return instance.div; };
      euclideanRingTypeClass.getMod = function (instance) { return instance.mod; };

      euclideanRingTypeClass.euclideanRingInt = integerEuclideanRingInstance;

      runtimeApplicationContext["Data.Int"] = runtimeApplicationContext["Data.Int"] || {};
      const integerParsing = runtimeApplicationContext["Data.Int"];

      integerParsing.fromStringAsImpl = function (justCreator, nothingValue) {
        return function (radixValue) {
          return function (inputString) {
            if (radixValue < 2 || radixValue > 36) {
              console.warn(`Invalid radix ${radixValue}. Must be between 2 and 36.`);
              return nothingValue;
            }

            let regexPatternCharSet;
            if (radixValue <= 10) {
              regexPatternCharSet = `[0-${radixValue - 1}]`;
            } else if (radixValue === 11) {
              regexPatternCharSet = "[0-9a]";
            } else {
              const charCodeForA = 97;
              const maxCharForRadix = String.fromCharCode(charCodeForA + radixValue - 11);
              regexPatternCharSet = `[0-9a-${maxCharForRadix}]`;
            }

            const fullValidationRegex = new RegExp(`^[\\+\\-]?${regexPatternCharSet}+?$`, "i");

            return function (candidateString) {
              if (!candidateString || !fullValidationRegex.test(candidateString)) {
                return nothingValue;
              }

              const parsedNumericValue = parseInt(candidateString, radixValue);
              if (isNaN(parsedNumericValue) || (parsedNumericValue | 0) !== parsedNumericValue) {
                return nothingValue;
              }
              return justCreator(parsedNumericValue);
            };
          };
        };
      };

      runtimeApplicationContext["Data.Maybe"] = runtimeApplicationContext["Data.Maybe"] || {};
      const maybeType = runtimeApplicationContext["Data.Maybe"];

      const NothingConstructor = function () {
        if (NothingConstructor.value) return NothingConstructor.value;
        return NothingConstructor.value = Object.freeze({});
      };
      maybeType.Nothing = new NothingConstructor();

      const JustConstructor = function (value) {
        this.wrappedValue = value;
      };
      JustConstructor.create = function (val) {
        return new JustConstructor(val);
      };
      maybeType.Just = JustConstructor;

      maybeType.fromJust = function (maybeValue) {
        return function (someValue) {
          if (someValue instanceof JustConstructor) {
            return someValue.wrappedValue;
          }
          const errorMsg = `Failed to extract value from Nothing. Expected Just, received ${someValue ? someValue.constructor.name : 'null/undefined'}.`;
          throw new Error(errorMsg);
        };
      };

      runtimeApplicationContext["Data.Int"] = runtimeApplicationContext["Data.Int"] || {};
      const integerModule = runtimeApplicationContext["Data.Int"];
      const internalIntHelpers = runtimeApplicationContext["Data.Int"];
      const maybeModule = runtimeApplicationContext["Data.Maybe"];

      const base10Parser = internalIntHelpers.fromStringAsImpl(
        maybeModule.Just.create,
        maybeModule.Nothing
      );

      const parseDecimalString = base10Parser(10);

      integerModule.parseString = parseDecimalString;
      integerModule.parseStringAsRadix = base10Parser;

      runtimeApplicationContext["Data.Show"] = runtimeApplicationContext["Data.Show"] || {};
      const showHelpers = runtimeApplicationContext["Data.Show"];

      showHelpers.showIntegerToString = function (num) {
        return num.toString();
      };

      runtimeApplicationContext["Data.Show"] = runtimeApplicationContext["Data.Show"] || {};
      const showTypeClass = runtimeApplicationContext["Data.Show"];

      const ShowConstructor = function (showFunction) {
        this.show = showFunction;
      };

      const integerShowInstance = new ShowConstructor(runtimeApplicationContext["Data.Show"].showIntegerToString);

      showTypeClass.Show = ShowConstructor;
      showTypeClass.display = function (instance) { return instance.show; };
      showTypeClass.showInt = integerShowInstance;

      runtimeApplicationContext["Data.String.Common"] = runtimeApplicationContext["Data.String.Common"] || {};
      const stringHelpers = runtimeApplicationContext["Data.String.Common"];

      stringHelpers.splitByDelimiter = function (delimiter) {
        return function (targetString) {
          return targetString.split(delimiter);
        };
      };

      stringHelpers.trimWhitespace = function (inputString) {
        return inputString.trim();
      };

      runtimeApplicationContext["Data.String.Common"] = runtimeApplicationContext["Data.String.Common"] || {};
      const stringApi = runtimeApplicationContext["Data.String.Common"];
      const stringImpl = runtimeApplicationContext["Data.String.Common"];

      stringApi.split = stringImpl.splitByDelimiter;
      stringApi.trim = stringImpl.trimWhitespace;

      runtimeApplicationContext["Data.Unit"] = runtimeApplicationContext["Data.Unit"] || {};
      const unitModule = runtimeApplicationContext["Data.Unit"];

      unitModule.unitValue = Object.freeze({});

      runtimeApplicationContext["Data.Unit"] = runtimeApplicationContext["Data.Unit"] || {};
      const unitApi = runtimeApplicationContext["Data.Unit"];
      const unitImpl = runtimeApplicationContext["Data.Unit"];

      unitApi.unit = unitImpl.unitValue;

      runtimeApplicationContext.Effect = runtimeApplicationContext.Effect || {};
      const effectPrimitives = runtimeApplicationContext.Effect;

      effectPrimitives.pureEffect = function (value) {
        return function () {
          return value;
        };
      };

      effectPrimitives.bindEffect = function (firstEffect) {
        return function (continuationFunction) {
          return function () {
            return continuationFunction(firstEffect())();
          };
        };
      };

      runtimeApplicationContext["Control.Bind"] = runtimeApplicationContext["Control.Bind"] || {};
      const bindTypeClass = runtimeApplicationContext["Control.Bind"];

      bindTypeClass.Bind = function (applyZero, bindFunc) {
        this.Apply0 = applyZero;
        this.bind = bindFunc;
      };

      bindTypeClass.getBind = function (instance) { return instance.bind; };

      runtimeApplicationContext["Control.Monad"] = runtimeApplicationContext["Control.Monad"] || {};
      const monadTypeClass = runtimeApplicationContext["Control.Monad"];
      const applicativeModule = runtimeApplicationContext["Control.Applicative"];
      const bindModule = runtimeApplicationContext["Control.Bind"];

      monadTypeClass.Monad = function (applicativeZero, bindOne) {
        this.Applicative0 = applicativeZero;
        this.Bind1 = bindOne;
      };

      monadTypeClass.monadicAp = function (monadInstance) {
        return function (wrappedFunction) {
          return function (wrappedValue) {
            const bindFunction = bindModule.getBind(monadInstance.Bind1());
            const pureFunction = applicativeModule.pure(monadInstance.Applicative0());

            return bindFunction(wrappedFunction)(function (func) {
              return bindFunction(wrappedValue)(function (val) {
                return pureFunction(func(val));
              });
            });
          };
        };
      };

      runtimeApplicationContext["Data.Functor"] = runtimeApplicationContext["Data.Functor"] || {};
      const functorTypeClass = runtimeApplicationContext["Data.Functor"];

      functorTypeClass.Functor = function (mapFunction) {
        this.map = mapFunction;
      };

      functorTypeClass.getMap = function (instance) { return instance.map; };

      runtimeApplicationContext.Effect = runtimeApplicationContext.Effect || {};
      const effectModule = runtimeApplicationContext.Effect;
      const effectImpl = runtimeApplicationContext.Effect;

      const applicativeControl = runtimeApplicationContext["Control.Applicative"];
      const applyControl = runtimeApplicationContext["Control.Apply"];
      const bindControl = runtimeApplicationContext["Control.Bind"];
      const monadControl = runtimeApplicationContext["Control.Monad"];
      const functorData = runtimeApplicationContext["Data.Functor"];

      const effectMonadInstance = new monadControl.Monad(
        function () { return effectApplicativeInstance; },
        function () { return effectBindInstance; }
      );

      const effectBindInstance = new bindControl.Bind(
        function () { return effectApplyInstance; },
        effectImpl.bindEffect
      );

      const effectApplyInstance = new applyControl.Apply(
        function () { return effectFunctorInstance; },
        monadControl.monadicAp(effectMonadInstance)
      );

      const effectApplicativeInstance = new applicativeControl.Applicative(
        function () { return effectApplyInstance; },
        effectImpl.pureEffect
      );

      const effectFunctorInstance = new functorData.Functor(
        applicativeControl.liftA1(effectApplicativeInstance)
      );

      effectModule.functorEffect = effectFunctorInstance;
      effectModule.applyEffect = effectApplyInstance;
      effectModule.applicativeEffect = effectApplicativeInstance;
      effectModule.bindEffect = effectBindInstance;
      effectModule.monadEffect = effectMonadInstance;

      runtimeApplicationContext["Node.Encoding"] = runtimeApplicationContext["Node.Encoding"] || {};
      const nodeEncodingModule = runtimeApplicationContext["Node.Encoding"];
      const showData = runtimeApplicationContext["Data.Show"];

      const AsciiEncoding = function () {
        if (AsciiEncoding.value) return AsciiEncoding.value;
        return AsciiEncoding.value = Object.freeze({ type: "ASCII" });
      };
      const Utf8Encoding = function () {
        if (Utf8Encoding.value) return Utf8Encoding.value;
        return Utf8Encoding.value = Object.freeze({ type: "UTF8" });
      };
      const Utf16leEncoding = function () {
        if (Utf16leEncoding.value) return Utf16leEncoding.value;
        return Utf16leEncoding.value = Object.freeze({ type: "UTF16LE" });
      };
      const Ucs2Encoding = function () {
        if (Ucs2Encoding.value) return Ucs2Encoding.value;
        return Ucs2Encoding.value = Object.freeze({ type: "UCS2" });
      };
      const Base64Encoding = function () {
        if (Base64Encoding.value) return Base64Encoding.value;
        return Base64Encoding.value = Object.freeze({ type: "Base64" });
      };
      const Latin1Encoding = function () {
        if (Latin1Encoding.value) return Latin1Encoding.value;
        return Latin1Encoding.value = Object.freeze({ type: "Latin1" });
      };
      const BinaryEncoding = function () {
        if (BinaryEncoding.value) return BinaryEncoding.value;
        return BinaryEncoding.value = Object.freeze({ type: "Binary" });
      };
      const HexEncoding = function () {
        if (HexEncoding.value) return HexEncoding.value;
        return HexEncoding.value = Object.freeze({ type: "Hex" });
      };

      const encodingShowInstance = new showData.Show(function (encodingVal) {
        const encodingNames = {
          "ASCII": "ASCII",
          "UTF8": "UTF8",
          "UTF16LE": "UTF16LE",
          "UCS2": "UCS2",
          "Base64": "Base64",
          "Latin1": "Latin1",
          "Binary": "Binary",
          "Hex": "Hex"
        };
        const name = encodingVal && encodingVal.type;
        if (name && encodingNames[name]) {
          return encodingNames[name];
        }
        console.warn(`Unrecognized encoding type for display: ${encodingVal ? encodingVal.type : 'null/undefined'}. Defaulting to 'UTF8'.`);
        return "UTF8";
      });

      nodeEncodingModule.ASCII = new AsciiEncoding();
      nodeEncodingModule.UTF8 = new Utf8Encoding();
      nodeEncodingModule.UTF16LE = new Utf16leEncoding();
      nodeEncodingModule.UCS2 = new Ucs2Encoding();
      nodeEncodingModule.Base64 = new Base64Encoding();
      nodeEncodingModule.Latin1 = new Latin1Encoding();
      nodeEncodingModule.Binary = new BinaryEncoding();
      nodeEncodingModule.Hex = new HexEncoding();
      nodeEncodingModule.showEncoding = encodingShowInstance;

      runtimeApplicationContext["Node.FS.Internal"] = runtimeApplicationContext["Node.FS.Internal"] || {};
      const fsInternal = runtimeApplicationContext["Node.FS.Internal"];

      try {
        fsInternal.unsafeNodeFsModule = moduleLocalRequire("fs");
      } catch (e) {
        console.warn("Node.js 'fs' module not available. File system operations will be disabled.", e.message);
        fsInternal.unsafeNodeFsModule = null;
      }

      runtimeApplicationContext["Unsafe.Coerce"] = runtimeApplicationContext["Unsafe.Coerce"] || {};
      const unsafeCoerceModule = runtimeApplicationContext["Unsafe.Coerce"];

      unsafeCoerceModule.identityCoercer = function (value) {
        return value;
      };

      runtimeApplicationContext["Unsafe.Coerce"] = runtimeApplicationContext["Unsafe.Coerce"] || {};
      const coerceApi = runtimeApplicationContext["Unsafe.Coerce"];
      const coerceImpl = runtimeApplicationContext["Unsafe.Coerce"];

      coerceApi.unsafeCoerce = coerceImpl.identityCoercer;

      runtimeApplicationContext["Node.FS.Internal"] = runtimeApplicationContext["Node.FS.Internal"] || {};
      const fsInternalApi = runtimeApplicationContext["Node.FS.Internal"];
      const fsInternalImpl = runtimeApplicationContext["Node.FS.Internal"];
      const unsafeCoerceUtil = runtimeApplicationContext["Unsafe.Coerce"].unsafeCoerce;

      fsInternalApi.createEffectWrapper = unsafeCoerceUtil;
      fsInternalApi.unsafeRequireFS = fsInternalImpl.unsafeNodeFsModule;

      runtimeApplicationContext["Node.FS.Sync"] = runtimeApplicationContext["Node.FS.Sync"] || {};
      const fsSyncModule = runtimeApplicationContext["Node.FS.Sync"];

      const showUtils = runtimeApplicationContext["Data.Show"];
      const nodeEncodings = runtimeApplicationContext["Node.Encoding"];
      const fsCore = runtimeApplicationContext["Node.FS.Internal"];
      const nodeFsRef = fsCore.unsafeRequireFS;

      fsSyncModule.readTextFile = function (encodingType) {
        return function (filePath) {
          if (!nodeFsRef) {
            return fsCore.createEffectWrapper(function () {
              throw new Error("File system module is not initialized. Cannot read file at " + filePath);
            });
          }
          return fsCore.createEffectWrapper(function () {
            const readOptions = {
              encoding: showUtils.display(nodeEncodings.showEncoding)(encodingType)
            };
            return nodeFsRef.readFileSync(filePath, readOptions);
          });
        };
      };

      runtimeApplicationContext["Node.Process"] = runtimeApplicationContext["Node.Process"] || {};
      const processModule = runtimeApplicationContext["Node.Process"];

      try {
        processModule.nodeGlobalProcess = globalThisContext.process;
      } catch (e) {
        console.warn("Node.js 'process' global not available. Process-related operations will be disabled.", e.message);
        processModule.nodeGlobalProcess = null;
      }

      runtimeApplicationContext["Node.Process"] = runtimeApplicationContext["Node.Process"] || {};
      const processApi = runtimeApplicationContext["Node.Process"];
      const processImpl = runtimeApplicationContext["Node.Process"];

      processApi.standardOutput = processImpl.nodeGlobalProcess ? processImpl.nodeGlobalProcess.stdout : null;

      runtimeApplicationContext["Node.Stream"] = runtimeApplicationContext["Node.Stream"] || {};
      const streamInternals = runtimeApplicationContext["Node.Stream"];

      streamInternals.writeToStream = function (targetStream) {
        return function (chunkData) {
          return function (encodingType) {
            return function (callbackFunction) {
              return function () {
                return targetStream.write(chunkData, encodingType, callbackFunction);
              };
            };
          };
        };
      };

      streamInternals.writeStringWithEncoding = function (targetStream) {
        return function (encodingIdentifier) {
          return function (stringToWrite) {
            return function (callbackAfterWrite) {
              return function () {
                return targetStream.write(stringToWrite, encodingIdentifier, callbackAfterWrite || (() => {}));
              };
            };
          };
        };
      };

      runtimeApplicationContext["Node.Stream"] = runtimeApplicationContext["Node.Stream"] || {};
      const streamApi = runtimeApplicationContext["Node.Stream"];
      const streamImpl = runtimeApplicationContext["Node.Stream"];

      const showModule = runtimeApplicationContext["Data.Show"];
      const encodingModule = runtimeApplicationContext["Node.Encoding"];

      streamApi.writeString = function (targetStream) {
        return function (encodingType) {
          const encodingString = showModule.display(encodingModule.showEncoding)(encodingType);
          return streamImpl.writeStringWithEncoding(targetStream)(encodingString);
        };
      };

      runtimeApplicationContext.ChallengeSolver = runtimeApplicationContext.ChallengeSolver || {};
      const problemSolver = runtimeApplicationContext.ChallengeSolver;

      const applicative = runtimeApplicationContext["Control.Applicative"];
      const euclideanOps = runtimeApplicationContext["Data.EuclideanRing"];
      const integerOps = runtimeApplicationContext["Data.Int"];
      const maybeOps = runtimeApplicationContext["Data.Maybe"];
      const showOps = runtimeApplicationContext["Data.Show"];
      const stringUtils = runtimeApplicationContext["Data.String.Common"];
      const unitValue = runtimeApplicationContext["Data.Unit"];
      const effectMonad = runtimeApplicationContext.Effect;
      const nodeEncoding = runtimeApplicationContext["Node.Encoding"];
      const fsSync = runtimeApplicationContext["Node.FS.Sync"];
      const processNode = runtimeApplicationContext["Node.Process"];
      const streamNode = runtimeApplicationContext["Node.Stream"];

      const calculateProblemResult = function (rawInputText) {
        if (typeof rawInputText !== 'string' || rawInputText.trim() === '') {
          console.error("Input for problem solver is empty or not a string.");
          return "Error: Invalid Input\n";
        }

        const inputLines = stringUtils.splitByDelimiter("\n")(stringUtils.trimWhitespace(rawInputText));

        if (inputLines.length < 3) {
          console.error(`Insufficient input lines for problem solver. Expected 3, got ${inputLines.length}.`);
          return "Error: Insufficient Input\n";
        }

        const valueA = maybeOps.fromJust()(integerOps.parseString(inputLines[0]));
        const valueC = maybeOps.fromJust()(integerOps.parseString(inputLines[2]));
        const valueB = maybeOps.fromJust()(integerOps.parseString(inputLines[1]));

        if (process.env.DEBUG_MODE === 'true') {
          console.log(`Debug: Parsed values - A: ${valueA}, B: ${valueB}, C: ${valueC}`);
        }

        const intermediateDifference = (valueA - valueB) | 0;
        const finalModuloResult = euclideanOps.getMod(euclideanOps.euclideanRingInt)(intermediateDifference)(valueC);

        return `${showOps.display(showOps.showInt)(finalModuloResult)}\n`;
      };

      problemSolver.executeMain = function () {
        if (typeof process === 'undefined' || !process.stdin || !process.stdout) {
          console.error("This application requires a Node.js environment to run.");
          return unitValue.unit;
        }

        const stdinFilePath = "/dev/stdin";
        const inputContentEffect = fsSync.readTextFile(nodeEncoding.UTF8)(stdinFilePath);
        const rawInputString = inputContentEffect();

        const solutionOutputString = calculateProblemResult(rawInputString);

        const stdoutStream = processNode.standardOutput;
        const utf8EncodingValue = nodeEncoding.UTF8;
        const pureUnitEffect = applicative.pure(effectMonad.applicativeEffect)(unitValue.unit);

        if (!stdoutStream) {
          console.error("Standard output stream is not available.");
          return unitValue.unit;
        }

        const writeOperationEffect = streamNode.writeString(stdoutStream)(utf8EncodingValue)(solutionOutputString);
        const combinedExecutionEffect = effectMonad.bindEffect(writeOperationEffect)(function () {
          return pureUnitEffect;
        });

        combinedExecutionEffect();

        return unitValue.unit;
      };

      problemSolver.solveProblem = calculateProblemResult;

      runtimeApplicationContext.ChallengeSolver.executeMain();
    },
    {}
  ]
},
  {},
  ["AppEntry"],
  null
);