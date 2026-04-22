applicationModuleLoader = function (
  moduleDefinitionsMap, // Stores module definitions by their ID.
  moduleInstanceCache,  // Caches loaded module instances for performance.
  entryModuleIdentifiers, // An array of module IDs that should be loaded as entry points.
  globalExportIdentifier // The name to export the main module under in the global scope.
) {
  var lastEncounteredError, // Stores the first error that occurs during module loading.
    existingGlobalLoader =
      "function" == typeof applicationModuleLoader && applicationModuleLoader, // Reference to a previously defined global loader.
    nodeJsRequire = "function" == typeof require && require; // Reference to Node.js's native `require` function.

  // The central function for resolving and loading modules.
  function retrieveModule(moduleId, bypassCacheCheck) {
    // If the module is already in the cache, return its exports.
    if (!moduleInstanceCache[moduleId]) {
      // If not in cache, check if the module definition exists.
      if (!moduleDefinitionsMap[moduleId]) {
        // If the module is not defined, try to load it globally or via Node.js.
        var globalLoaderRef =
          "function" == typeof applicationModuleLoader && applicationModuleLoader;
        if (!bypassCacheCheck && globalLoaderRef) return globalLoaderRef(moduleId, !0);
        if (existingGlobalLoader) return existingGlobalLoader(moduleId, !0);
        if (nodeJsRequire && "string" == typeof moduleId)
          return nodeJsRequire(moduleId);

        // If the module cannot be found, throw an error.
        var moduleNotFoundException = new Error(
          "Cannot find module '" + moduleId + "'"
        );
        throw ((moduleNotFoundException.code = "MODULE_NOT_FOUND"), moduleNotFoundException);
      }

      // Configure a local resolver for the current module's dependencies.
      moduleResolverFunc.resolve = function (relativePath) {
        return moduleDefinitionsMap[moduleId][1][relativePath] || relativePath;
      };
      moduleResolverFunc.cache = {}; // Placeholder for Parcel's internal cache, not actively used here.

      // Create a new module instance and store it in the cache.
      var currentModuleInstance = (moduleInstanceCache[moduleId] = new retrieveModule.Module(
        moduleId
      ));
      // Execute the module's factory function, passing `moduleResolverFunc`, `currentModuleInstance`, and `currentModuleInstance.exports`.
      moduleDefinitionsMap[moduleId][0].call(
        currentModuleInstance.exports,
        moduleResolverFunc,
        currentModuleInstance,
        currentModuleInstance.exports,
        this
      );
    }
    // Return the exports of the loaded module.
    return moduleInstanceCache[moduleId].exports;

    // Internal helper function used by module factory functions to `require` dependencies.
    function moduleResolverFunc(dependencyPath) {
      return retrieveModule(moduleResolverFunc.resolve(dependencyPath));
    }
  }

  // Mark this loader for identification.
  retrieveModule.isParcelRequire = !0;
  // Define the constructor for module objects.
  retrieveModule.Module = function (idValue) {
    this.id = idValue;
    this.bundle = retrieveModule; // Reference to the loader itself.
    this.exports = {}; // The object that holds the module's exported values.
  };
  // Store references to the module definitions and cache for external access.
  retrieveModule.modules = moduleDefinitionsMap;
  retrieveModule.cache = moduleInstanceCache;
  retrieveModule.parent = existingGlobalLoader; // Reference to a parent loader, if any.
  // A utility function to register new module definitions dynamically.
  retrieveModule.register = function (registrationId, registrationDefinition) {
    moduleDefinitionsMap[registrationId] = [
      function (dependencyResolver, moduleInstance) {
        moduleInstance.exports = registrationDefinition;
      },
      {},
    ];
  };

  // Iterate over the entry points and load each module.
  for (var entryIndex = 0; entryIndex < entryModuleIdentifiers.length; entryIndex++) {
    try {
      retrieveModule(entryModuleIdentifiers[entryIndex]);
    } catch (currentLoadError) {
      // Capture the first error encountered, but continue loading other entries.
      lastEncounteredError || (lastEncounteredError = currentLoadError);
    }
  }

  // If entry points were specified, handle the export of the last entry module.
  if (entryModuleIdentifiers.length) {
    var finalExport = retrieveModule(
      entryModuleIdentifiers[entryModuleIdentifiers.length - 1]
    );
    // Expose the final export based on the environment (CommonJS, AMD, or global).
    "object" == typeof exports && "undefined" != typeof module
      ? (module.exports = finalExport)
      : "function" == typeof define && define.amd
      ? define(function () {
          return finalExport;
        })
      : globalExportIdentifier && (this[globalExportIdentifier] = finalExport);
  }

  // Update the global reference to this module loader.
  applicationModuleLoader = retrieveModule;
  // If an error was recorded during entry point loading, re-throw it.
  if (lastEncounteredError) throw lastEncounteredError;
  // Return the fully configured module loader function.
  return retrieveModule;
}(
  {
    // --- Module Definitions ---
    "Focm": [
      function (getDependency, currentModuleRef, moduleExports) {
        // This object will hold all the exported components of the PureScript library.
        var packageExports = {};

        // Module: Control.Apply
        (function (exportContainer) {
          "use strict";
          (exportContainer["Control.Apply"] =
            exportContainer["Control.Apply"] || {}).arrayApply = function (
            funcArray
          ) {
            return function (valueArray) {
              for (
                var funcCount = funcArray.length,
                  valCount = valueArray.length,
                  resultArray = new Array(funcCount * valCount),
                  resultIndex = 0,
                  funcIter = 0;
                funcIter < funcCount;
                funcIter++
              )
                for (
                  var currentFunc = funcArray[funcIter], valIter = 0;
                  valIter < valCount;
                  valIter++
                )
                  resultArray[resultIndex++] = currentFunc(valueArray[valIter]);
              return resultArray;
            };
          };
        })(packageExports),
          // Module: Control.Semigroupoid
          (function (exportContainer) {
            "use strict";
            exportContainer["Control.Semigroupoid"] =
              exportContainer["Control.Semigroupoid"] || {};
            var semigroupoidControl =
                exportContainer["Control.Semigroupoid"], // Alias for Control.Semigroupoid
              SemigroupoidConstructor = function (composerFunction) {
                this.compose = composerFunction;
              },
              functionSemigroupoidInstance = new SemigroupoidConstructor(
                function (firstFunc) {
                  return function (secondFunc) {
                    return function (inputVal) {
                      return firstFunc(secondFunc(inputVal));
                    };
                  };
                }
              );
            semigroupoidControl.compose = function (instance) {
              return instance.compose;
            };
            semigroupoidControl.Semigroupoid = SemigroupoidConstructor;
            semigroupoidControl.semigroupoidFn = functionSemigroupoidInstance;
          })(packageExports),
          // Module: Control.Category
          (function (exportContainer) {
            "use strict";
            exportContainer["Control.Category"] =
              exportContainer["Control.Category"] || {};
            var categoryControl = exportContainer["Control.Category"], // Alias for Control.Category
              semigroupoidControl = exportContainer["Control.Semigroupoid"], // Alias for Control.Semigroupoid
              CategoryConstructor = function (semigroupoidInst, identityFunc) {
                this.Semigroupoid0 = semigroupoidInst;
                this.identity = identityFunc;
              },
              functionCategoryInstance = new CategoryConstructor(
                function () {
                  return semigroupoidControl.semigroupoidFn;
                },
                function (inputVal) {
                  return inputVal;
                }
              );
            categoryControl.Category = CategoryConstructor;
            categoryControl.identity = function (instance) {
              return instance.identity;
            };
            categoryControl.categoryFn = functionCategoryInstance;
          })(packageExports),
          // Module: Data.Function
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Function"] =
              exportContainer["Data.Function"] || {};
            var functionData = exportContainer["Data.Function"]; // Alias for Data.Function
            functionData.flip = function (funcToFlip) {
              return function (argOne) {
                return function (argTwo) {
                  return funcToFlip(argTwo)(argOne);
                };
              };
            };
            functionData.const = function (constantVal) {
              return function (ignoredVal) {
                return constantVal;
              };
            };
          })(packageExports),
          // Module: Data.Functor (arrayMap specific part)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Data.Functor"] =
              exportContainer["Data.Functor"] || {}).arrayMap = function (
              transformFunc
            ) {
              return function (inputArray) {
                for (
                  var arrayLength = inputArray.length,
                    mappedArray = new Array(arrayLength),
                    idx = 0;
                  idx < arrayLength;
                  idx++
                )
                  mappedArray[idx] = transformFunc(inputArray[idx]);
                return mappedArray;
              };
            };
          })(packageExports),
          // Module: Data.Unit (unit definition)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Data.Unit"] =
              exportContainer["Data.Unit"] || {}).unit = {};
          })(packageExports),
          // Module: Data.Unit (re-export)
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Unit"] = exportContainer["Data.Unit"] || {};
            var unitData = exportContainer["Data.Unit"], // Alias for Data.Unit
              unitReExport = exportContainer["Data.Unit"]; // Another alias for Data.Unit
            unitData.unit = unitReExport.unit;
          })(packageExports),
          // Module: Data.Functor
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Functor"] =
              exportContainer["Data.Functor"] || {};
            var functorData = exportContainer["Data.Functor"], // Alias for Data.Functor
              functorReExport = exportContainer["Data.Functor"], // Another alias for Data.Functor
              functionData = exportContainer["Data.Function"], // Alias for Data.Function
              unitData = exportContainer["Data.Unit"], // Alias for Data.Unit
              FunctorConstructor = function (mapFunc) {
                this.map = mapFunc;
              },
              getMapFunction = function (instance) {
                return instance.map;
              },
              arrayFunctorInstance = new FunctorConstructor(
                functorReExport.arrayMap
              );
            functorData.Functor = FunctorConstructor;
            functorData.map = getMapFunction;
            functorData.void = function (instance) {
              return getMapFunction(instance)(functionData.const(unitData.unit));
            };
            functorData.functorArray = arrayFunctorInstance;
          })(packageExports),
          // Module: Control.Apply
          (function (exportContainer) {
            "use strict";
            exportContainer["Control.Apply"] =
              exportContainer["Control.Apply"] || {};
            var applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              applyReExport = exportContainer["Control.Apply"], // Another alias for Control.Apply
              categoryControl = exportContainer["Control.Category"], // Alias for Control.Category
              functionData = exportContainer["Data.Function"], // Alias for Data.Function
              functorData = exportContainer["Data.Functor"], // Alias for Data.Functor
              ApplyConstructor = function (functorInst, applyFunc) {
                this.Functor0 = functorInst;
                this.apply = applyFunc;
              },
              getApplyFunction = function (instance) {
                return instance.apply;
              },
              arrayApplyInstance = new ApplyConstructor(
                function () {
                  return functorData.functorArray;
                },
                applyReExport.arrayApply
              );
            applyControl.Apply = ApplyConstructor;
            applyControl.apply = getApplyFunction;
            applyControl.applySecond = function (instance) {
              return function (firstAction) {
                return function (secondAction) {
                  return getApplyFunction(instance)(
                    functorData.map(instance.Functor0())(
                      functionData.const(categoryControl.identity(categoryControl.categoryFn))
                    )(firstAction)
                  )(secondAction);
                };
              };
            };
            applyControl.applyArray = arrayApplyInstance;
          })(packageExports),
          // Module: Control.Applicative
          (function (exportContainer) {
            "use strict";
            exportContainer["Control.Applicative"] =
              exportContainer["Control.Applicative"] || {};
            var applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              getPureFunction = function (instance) {
                return instance.pure;
              };
            applicativeControl.Applicative = function (applyInst, pureFunc) {
              this.Apply0 = applyInst;
              this.pure = pureFunc;
            };
            applicativeControl.pure = getPureFunction;
            applicativeControl.liftA1 = function (instance) {
              return function (transformFunc) {
                return function (inputVal) {
                  return applyControl.apply(instance.Apply0())(
                    getPureFunction(instance)(transformFunc)
                  )(inputVal);
                };
              };
            };
          })(packageExports),
          // Module: Control.Bind (arrayBind specific part)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Control.Bind"] =
              exportContainer["Control.Bind"] || {}).arrayBind = function (
              sourceArray
            ) {
              return function (bindingFunc) {
                for (
                  var resultCollection = [],
                    idx = 0,
                    len = sourceArray.length;
                  idx < len;
                  idx++
                )
                  Array.prototype.push.apply(
                    resultCollection,
                    bindingFunc(sourceArray[idx])
                  );
                return resultCollection;
              };
            };
          })(packageExports),
          // Module: Control.Bind
          (function (exportContainer) {
            "use strict";
            exportContainer["Control.Bind"] =
              exportContainer["Control.Bind"] || {};
            var bindControl = exportContainer["Control.Bind"], // Alias for Control.Bind
              bindReExport = exportContainer["Control.Bind"], // Another alias for Control.Bind
              applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              functionData = exportContainer["Data.Function"], // Alias for Data.Function
              BindConstructor = function (applyInst, bindFunc) {
                this.Apply0 = applyInst;
                this.bind = bindFunc;
              },
              getBindFunction = function (instance) {
                return instance.bind;
              },
              arrayBindInstance = new BindConstructor(
                function () {
                  return applyControl.applyArray;
                },
                bindReExport.arrayBind
              ),
              getFlippedBind = function (instance) {
                return functionData.flip(getBindFunction(instance));
              };
            bindControl.Bind = BindConstructor;
            bindControl.bind = getBindFunction;
            bindControl.bindFlipped = getFlippedBind;
            bindControl.composeKleisliFlipped = function (instance) {
              return function (firstKleisli) {
                return function (secondKleisli) {
                  return function (inputVal) {
                    return getFlippedBind(instance)(firstKleisli)(
                      secondKleisli(inputVal)
                    );
                  };
                };
              };
            };
            bindControl.bindArray = arrayBindInstance;
          })(packageExports),
          // Module: Data.Maybe
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Maybe"] =
              exportContainer["Data.Maybe"] || {};
            var maybeData = exportContainer["Data.Maybe"], // Alias for Data.Maybe
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              bindControl = exportContainer["Control.Bind"], // Alias for Control.Bind
              functorData = exportContainer["Data.Functor"], // Alias for Data.Functor
              NothingConstructor = (function () {
                function Nothing() {}
                return (Nothing.value = new Nothing()), Nothing;
              })(),
              JustConstructor = (function () {
                function Just(value) {
                  this.value0 = value;
                }
                return (Just.create = function (val) {
                  return new Just(val);
                }), Just;
              })(),
              maybeFunctorInstance = new functorData.Functor(function (
                transformFunc
              ) {
                return function (maybeVal) {
                  return maybeVal instanceof JustConstructor
                    ? new JustConstructor(transformFunc(maybeVal.value0))
                    : NothingConstructor.value;
                };
              }),
              maybeApplyInstance = new applyControl.Apply(
                function () {
                  return maybeFunctorInstance;
                },
                function (maybeFunc) {
                  return function (maybeVal) {
                    if (maybeFunc instanceof JustConstructor)
                      return functorData.map(maybeFunctorInstance)(
                        maybeFunc.value0
                      )(maybeVal);
                    if (maybeFunc instanceof NothingConstructor)
                      return NothingConstructor.value;
                    throw new Error(
                      "Failed pattern match at Data.Maybe (line 67, column 1 - line 67, column 35): " +
                        [maybeFunc.constructor.name, maybeVal.constructor.name]
                    );
                  };
                }
              ),
              maybeBindInstance = new bindControl.Bind(
                function () {
                  return maybeApplyInstance;
                },
                function (maybeVal) {
                  return function (bindFunc) {
                    if (maybeVal instanceof JustConstructor)
                      return bindFunc(maybeVal.value0);
                    if (maybeVal instanceof NothingConstructor)
                      return NothingConstructor.value;
                    throw new Error(
                      "Failed pattern match at Data.Maybe (line 125, column 1 - line 125, column 33): " +
                        [maybeVal.constructor.name, bindFunc.constructor.name]
                    );
                  };
                }
              ),
              maybeApplicativeInstance = new applicativeControl.Applicative(
                function () {
                  return maybeApplyInstance;
                },
                JustConstructor.create
              );
            maybeData.Nothing = NothingConstructor;
            maybeData.Just = JustConstructor;
            maybeData.maybe = function (nothingCase) {
              return function (justCase) {
                return function (maybeVal) {
                  if (maybeVal instanceof NothingConstructor) return nothingCase;
                  if (maybeVal instanceof JustConstructor)
                    return justCase(maybeVal.value0);
                  throw new Error(
                    "Failed pattern match at Data.Maybe (line 217, column 1 - line 217, column 51): " +
                      [
                        nothingCase.constructor.name,
                        justCase.constructor.name,
                        maybeVal.constructor.name,
                      ]
                  );
                };
              };
            };
            maybeData.functorMaybe = maybeFunctorInstance;
            maybeData.applyMaybe = maybeApplyInstance;
            maybeData.applicativeMaybe = maybeApplicativeInstance;
            maybeData.bindMaybe = maybeBindInstance;
          })(packageExports),
          // Module: Data.Array
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Array"] =
              exportContainer["Data.Array"] || {};
            var arrayData = exportContainer["Data.Array"], // Alias for Data.Array
              bindControl = exportContainer["Control.Bind"], // Alias for Control.Bind
              functionData = exportContainer["Data.Function"], // Alias for Data.Function
              maybeData = exportContainer["Data.Maybe"], // Alias for Data.Maybe
              arraySingleton = function (value) {
                return [value];
              },
              arrayConcatMap = functionData.flip(
                bindControl.bind(bindControl.bindArray)
              );
            arrayData.singleton = arraySingleton;
            arrayData.concatMap = arrayConcatMap;
            arrayData.mapMaybe = function (transformFunc) {
              return arrayConcatMap(function (item) {
                return maybeData.maybe([])(arraySingleton)(transformFunc(item));
              });
            };
          })(packageExports),
          // Module: Data.Boolean
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Boolean"] =
              exportContainer["Data.Boolean"] || {};
            exportContainer["Data.Boolean"].otherwise = !0; // The 'otherwise' constant in PureScript.
          })(packageExports),
          // Module: Data.Either
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Either"] =
              exportContainer["Data.Either"] || {};
            var eitherData = exportContainer["Data.Either"], // Alias for Data.Either
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              bindControl = exportContainer["Control.Bind"], // Alias for Control.Bind
              functorData = exportContainer["Data.Functor"], // Alias for Data.Functor
              maybeData = exportContainer["Data.Maybe"], // Alias for Data.Maybe
              LeftConstructor = (function () {
                function Left(value) {
                  this.value0 = value;
                }
                return (Left.create = function (val) {
                  return new Left(val);
                }), Left;
              })(),
              RightConstructor = (function () {
                function Right(value) {
                  this.value0 = value;
                }
                return (Right.create = function (val) {
                  return new Right(val);
                }), Right;
              })(),
              eitherFunctorInstance = new functorData.Functor(function (
                transformFunc
              ) {
                return function (eitherVal) {
                  if (eitherVal instanceof LeftConstructor)
                    return new LeftConstructor(eitherVal.value0);
                  if (eitherVal instanceof RightConstructor)
                    return new RightConstructor(transformFunc(eitherVal.value0));
                  throw new Error(
                    "Failed pattern match at Data.Either (line 38, column 8 - line 38, column 52): " +
                      [eitherVal.constructor.name]
                  );
                };
              }),
              eitherFoldFunction = function (leftHandler) {
                return function (rightHandler) {
                  return function (eitherVal) {
                    if (eitherVal instanceof LeftConstructor)
                      return leftHandler(eitherVal.value0);
                    if (eitherVal instanceof RightConstructor)
                      return rightHandler(eitherVal.value0);
                    throw new Error(
                      "Failed pattern match at Data.Either (line 238, column 1 - line 238, column 64): " +
                        [
                          leftHandler.constructor.name,
                          rightHandler.constructor.name,
                          eitherVal.constructor.name,
                        ]
                    );
                  };
                };
              },
              eitherApplyInstance = new applyControl.Apply(
                function () {
                  return eitherFunctorInstance;
                },
                function (eitherFunc) {
                  return function (eitherVal) {
                    if (eitherFunc instanceof LeftConstructor)
                      return new LeftConstructor(eitherFunc.value0);
                    if (eitherFunc instanceof RightConstructor)
                      return functorData.map(eitherFunctorInstance)(
                        eitherFunc.value0
                      )(eitherVal);
                    throw new Error(
                      "Failed pattern match at Data.Either (line 82, column 1 - line 82, column 41): " +
                        [eitherFunc.constructor.name, eitherVal.constructor.name]
                    );
                  };
                }
              ),
              eitherBindInstance = new bindControl.Bind(
                function () {
                  return eitherApplyInstance;
                },
                eitherFoldFunction(function (leftVal) {
                  return function (bindFunc) {
                    return new LeftConstructor(leftVal);
                  };
                })(function (rightVal) {
                  return function (bindFunc) {
                    return bindFunc(rightVal);
                  };
                })
              ),
              eitherApplicativeInstance = new applicativeControl.Applicative(
                function () {
                  return eitherApplyInstance;
                },
                RightConstructor.create
              );
            eitherData.Left = LeftConstructor;
            eitherData.Right = RightConstructor;
            eitherData.either = eitherFoldFunction;
            eitherData.note = function (errorMessage) {
              return maybeData.maybe(new LeftConstructor(errorMessage))(
                RightConstructor.create
              );
            };
            eitherData.functorEither = eitherFunctorInstance;
            eitherData.applyEither = eitherApplyInstance;
            eitherData.applicativeEither = eitherApplicativeInstance;
            eitherData.bindEither = eitherBindInstance;
          })(packageExports),
          // Module: Data.EuclideanRing (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.EuclideanRing"] =
              exportContainer["Data.EuclideanRing"] || {};
            exportContainer["Data.EuclideanRing"].intDegree = function (
              numericVal
            ) {
              return Math.min(Math.abs(numericVal), 2147483647); // Max signed 32-bit integer.
            };
            exportContainer["Data.EuclideanRing"].intDiv = function (
              numerator
            ) {
              return function (denominator) {
                return 0 === denominator
                  ? 0
                  : denominator > 0
                  ? Math.floor(numerator / denominator)
                  : -Math.floor(numerator / -denominator);
              };
            };
            exportContainer["Data.EuclideanRing"].intMod = function (
              dividend
            ) {
              return function (divisor) {
                if (0 === divisor) return 0;
                var absoluteDivisor = Math.abs(divisor);
                return (dividend % absoluteDivisor + absoluteDivisor) % absoluteDivisor;
              };
            };
          })(packageExports["Data.EuclideanRing"] || (packageExports["Data.EuclideanRing"] = {})),
          // Module: Data.Ring (intSub specific part)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Data.Ring"] =
              exportContainer["Data.Ring"] || {}).intSub = function (
              minuend
            ) {
              return function (subtrahend) {
                return minuend - subtrahend | 0; // Bitwise OR 0 for integer truncation.
              };
            };
          })(packageExports),
          // Module: Data.Semiring (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Semiring"] =
              exportContainer["Data.Semiring"] || {};
            exportContainer["Data.Semiring"].intAdd = function (firstNum) {
              return function (secondNum) {
                return firstNum + secondNum | 0;
              };
            };
            exportContainer["Data.Semiring"].intMul = function (firstNum) {
              return function (secondNum) {
                return firstNum * secondNum | 0;
              };
            };
          })(packageExports["Data.Semiring"] || (packageExports["Data.Semiring"] = {})),
          // Module: Data.Semiring
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Semiring"] =
              exportContainer["Data.Semiring"] || {};
            var semiringData = exportContainer["Data.Semiring"], // Alias for Data.Semiring
              semiringReExport = exportContainer["Data.Semiring"], // Another alias for Data.Semiring
              SemiringConstructor = function (addFunc, mulFunc, oneVal, zeroVal) {
                this.add = addFunc;
                this.mul = mulFunc;
                this.one = oneVal;
                this.zero = zeroVal;
              },
              integerSemiringInstance = new SemiringConstructor(
                semiringReExport.intAdd,
                semiringReExport.intMul,
                1,
                0
              );
            semiringData.Semiring = SemiringConstructor;
            semiringData.add = function (instance) {
              return instance.add;
            };
            semiringData.zero = function (instance) {
              return instance.zero;
            };
            semiringData.mul = function (instance) {
              return instance.mul;
            };
            semiringData.one = function (instance) {
              return instance.one;
            };
            semiringData.semiringInt = integerSemiringInstance;
          })(packageExports),
          // Module: Data.Ring
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Ring"] =
              exportContainer["Data.Ring"] || {};
            var ringData = exportContainer["Data.Ring"], // Alias for Data.Ring
              ringReExport = exportContainer["Data.Ring"], // Another alias for Data.Ring
              semiringData = exportContainer["Data.Semiring"], // Alias for Data.Semiring
              RingConstructor = function (semiringInst, subFunc) {
                this.Semiring0 = semiringInst;
                this.sub = subFunc;
              },
              integerRingInstance = new RingConstructor(
                function () {
                  return semiringData.semiringInt;
                },
                ringReExport.intSub
              );
            ringData.Ring = RingConstructor;
            ringData.sub = function (instance) {
              return instance.sub;
            };
            ringData.ringInt = integerRingInstance;
          })(packageExports),
          // Module: Data.CommutativeRing
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.CommutativeRing"] =
              exportContainer["Data.CommutativeRing"] || {};
            var commutativeRingData =
                exportContainer["Data.CommutativeRing"], // Alias for Data.CommutativeRing
              ringData = exportContainer["Data.Ring"], // Alias for Data.Ring
              CommutativeRingConstructor = function (ringInst) {
                this.Ring0 = ringInst;
              },
              integerCommutativeRingInstance = new CommutativeRingConstructor(
                function () {
                  return ringData.ringInt;
                }
              );
            commutativeRingData.CommutativeRing = CommutativeRingConstructor;
            commutativeRingData.commutativeRingInt = integerCommutativeRingInstance;
          })(packageExports),
          // Module: Data.EuclideanRing
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.EuclideanRing"] =
              exportContainer["Data.EuclideanRing"] || {};
            var euclideanRingData =
                exportContainer["Data.EuclideanRing"], // Alias for Data.EuclideanRing
              euclideanRingReExport =
                exportContainer["Data.EuclideanRing"], // Another alias for Data.EuclideanRing
              commutativeRingData =
                exportContainer["Data.CommutativeRing"], // Alias for Data.CommutativeRing
              EuclideanRingConstructor = function (
                commutativeRingInst,
                degreeFunc,
                divFunc,
                modFunc
              ) {
                this.CommutativeRing0 = commutativeRingInst;
                this.degree = degreeFunc;
                this.div = divFunc;
                this.mod = modFunc;
              },
              integerEuclideanRingInstance = new EuclideanRingConstructor(
                function () {
                  return commutativeRingData.commutativeRingInt;
                },
                euclideanRingReExport.intDegree,
                euclideanRingReExport.intDiv,
                euclideanRingReExport.intMod
              );
            euclideanRingData.EuclideanRing = EuclideanRingConstructor;
            euclideanRingData.degree = function (instance) {
              return instance.degree;
            };
            euclideanRingData.div = function (instance) {
              return instance.div;
            };
            euclideanRingData.mod = function (instance) {
              return instance.mod;
            };
            euclideanRingData.euclideanRingInt = integerEuclideanRingInstance;
          })(packageExports),
          // Module: Data.Foldable (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Foldable"] =
              exportContainer["Data.Foldable"] || {};
            exportContainer["Data.Foldable"].foldrArray = function (
              foldFunc
            ) {
              return function (initialValue) {
                return function (inputArray) {
                  for (
                    var accumulator = initialValue,
                      idx = inputArray.length - 1;
                    idx >= 0;
                    idx--
                  )
                    accumulator = foldFunc(inputArray[idx])(accumulator);
                  return accumulator;
                };
              };
            };
            exportContainer["Data.Foldable"].foldlArray = function (
              foldFunc
            ) {
              return function (initialValue) {
                return function (inputArray) {
                  for (
                    var accumulator = initialValue,
                      arrayLength = inputArray.length,
                      idx = 0;
                    idx < arrayLength;
                    idx++
                  )
                    accumulator = foldFunc(accumulator)(inputArray[idx]);
                  return accumulator;
                };
              };
            };
          })(packageExports["Data.Foldable"] || (packageExports["Data.Foldable"] = {})),
          // Module: Data.Monoid
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Monoid"] =
              exportContainer["Data.Monoid"] || {};
            var monoidData = exportContainer["Data.Monoid"]; // Alias for Data.Monoid
            monoidData.Monoid = function (semigroupInst, emptyVal) {
              this.Semigroup0 = semigroupInst;
              this.mempty = emptyVal;
            };
            monoidData.mempty = function (instance) {
              return instance.mempty;
            };
          })(packageExports),
          // Module: Data.Semigroup
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Semigroup"] =
              exportContainer["Data.Semigroup"] || {};
            var semigroupData = exportContainer["Data.Semigroup"]; // Alias for Data.Semigroup
            semigroupData.Semigroup = function (appendFunc) {
              this.append = appendFunc;
            };
            semigroupData.append = function (instance) {
              return instance.append;
            };
          })(packageExports),
          // Module: Data.Foldable
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Foldable"] =
              exportContainer["Data.Foldable"] || {};
            var foldableData = exportContainer["Data.Foldable"], // Alias for Data.Foldable
              foldableReExport = exportContainer["Data.Foldable"], // Another alias for Data.Foldable
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              monoidData = exportContainer["Data.Monoid"], // Alias for Data.Monoid
              semigroupData = exportContainer["Data.Semigroup"], // Alias for Data.Semigroup
              unitData = exportContainer["Data.Unit"], // Alias for Data.Unit
              FoldableConstructor = function (foldMapFunc, foldlFunc, foldrFunc) {
                this.foldMap = foldMapFunc;
                this.foldl = foldlFunc;
                this.foldr = foldrFunc;
              },
              getFoldrFunction = function (instance) {
                return instance.foldr;
              },
              defaultFoldMapRight = function (monoidInst) {
                return function (transformFunc) {
                  return function (foldableInst) {
                    return getFoldrFunction(foldableInst)(function (
                      itemVal
                    ) {
                      return function (accumulator) {
                        return semigroupData.append(monoidInst.Semigroup0())(
                          transformFunc(itemVal)
                        )(accumulator);
                      };
                    })(monoidData.mempty(monoidInst));
                  };
                };
              },
              arrayFoldableInstance = new FoldableConstructor(
                function (monoidInst) {
                  return defaultFoldMapRight(monoidInst)(arrayFoldableInstance);
                },
                foldableReExport.foldlArray,
                foldableReExport.foldrArray
              );
            foldableData.Foldable = FoldableConstructor;
            foldableData.foldr = getFoldrFunction;
            foldableData.foldl = function (instance) {
              return instance.foldl;
            };
            foldableData.foldMap = function (instance) {
              return instance.foldMap;
            };
            foldableData.foldMapDefaultR = defaultFoldMapRight;
            foldableData.traverse_ = function (applicativeInst) {
              return function (foldableInst) {
                return function (actionFunc) {
                  return getFoldrFunction(foldableInst)(function (
                    itemVal
                  ) {
                    return applyControl.applySecond(applicativeInst.Apply0())(
                      actionFunc(itemVal)
                    );
                  })(applicativeControl.pure(applicativeInst)(unitData.unit));
                };
              };
            };
            foldableData.foldableArray = arrayFoldableInstance;
          })(packageExports),
          // Module: Data.Int (fromStringAsImpl specific part)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Data.Int"] =
              exportContainer["Data.Int"] || {}).fromStringAsImpl = function (
              justCreator
            ) {
              return function (nothingVal) {
                return function (radixVal) {
                  var regexPattern;
                  regexPattern =
                    radixVal < 11
                      ? "[0-" + (radixVal - 1).toString() + "]"
                      : 11 === radixVal
                      ? "[0-9a]"
                      : "[0-9a-" + String.fromCharCode(86 + radixVal) + "]";
                  var validationRegex = new RegExp(
                    "^[\\+\\-]?" + regexPattern + "+$",
                    "i"
                  );
                  return function (inputString) {
                    if (validationRegex.test(inputString)) {
                      var parsedInteger = parseInt(inputString, radixVal);
                      return (0 | parsedInteger) === parsedInteger
                        ? justCreator(parsedInteger)
                        : nothingVal;
                    }
                    return nothingVal;
                  };
                };
              };
            };
          })(packageExports),
          // Module: Data.Int
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Int"] =
              exportContainer["Data.Int"] || {};
            var integerData = exportContainer["Data.Int"], // Alias for Data.Int
              integerReExport = exportContainer["Data.Int"], // Another alias for Data.Int
              maybeData = exportContainer["Data.Maybe"], // Alias for Data.Maybe
              fromStringAsFunction = integerReExport.fromStringAsImpl(
                maybeData.Just.create
              )(maybeData.Nothing.value),
              fromStringBase10 = fromStringAsFunction(10);
            integerData.fromString = fromStringBase10;
            integerData.fromStringAs = fromStringAsFunction;
            integerData.odd = function (numValue) {
              return 0 != (1 & numValue);
            };
          })(packageExports),
          // Module: Data.Show (showIntImpl specific part)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Data.Show"] =
              exportContainer["Data.Show"] || {}).showIntImpl = function (
              intVal
            ) {
              return intVal.toString();
            };
          })(packageExports),
          // Module: Data.Show
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Show"] =
              exportContainer["Data.Show"] || {};
            var showData = exportContainer["Data.Show"], // Alias for Data.Show
              ShowConstructor = function (showFunc) {
                this.show = showFunc;
              },
              integerShowInstance = new ShowConstructor(
                exportContainer["Data.Show"].showIntImpl
              );
            showData.Show = ShowConstructor;
            showData.show = function (instance) {
              return instance.show;
            };
            showData.showInt = integerShowInstance;
          })(packageExports),
          // Module: Data.String.Common (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.String.Common"] =
              exportContainer["Data.String.Common"] || {};
            exportContainer["Data.String.Common"].split = function (
              separator
            ) {
              return function (targetString) {
                return targetString.split(separator);
              };
            };
            exportContainer["Data.String.Common"].trim = function (
              targetString
            ) {
              return targetString.trim();
            };
          })(packageExports["Data.String.Common"] || (packageExports["Data.String.Common"] = {})),
          // Module: Data.String.Common
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.String.Common"] =
              exportContainer["Data.String.Common"] || {};
            var stringUtilData = exportContainer["Data.String.Common"], // Alias for Data.String.Common
              stringUtilReExport = exportContainer["Data.String.Common"]; // Another alias for Data.String.Common
            stringUtilData.split = stringUtilReExport.split;
            stringUtilData.trim = stringUtilReExport.trim;
          })(packageExports),
          // Module: Data.Tuple
          (function (exportContainer) {
            "use strict";
            exportContainer["Data.Tuple"] =
              exportContainer["Data.Tuple"] || {};
            var tupleData = exportContainer["Data.Tuple"], // Alias for Data.Tuple
              TupleConstructor = (function () {
                function Tuple(firstVal, secondVal) {
                  this.value0 = firstVal;
                  this.value1 = secondVal;
                }
                return (Tuple.create = function (valA) {
                  return function (valB) {
                    return new Tuple(valA, valB);
                  };
                }), Tuple;
              })();
            tupleData.Tuple = TupleConstructor;
          })(packageExports),
          // Module: Effect (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer.Effect = exportContainer.Effect || {};
            exportContainer.Effect.pureE = function (value) {
              return function () {
                return value;
              };
            };
            exportContainer.Effect.bindE = function (action) {
              return function (continuation) {
                return function () {
                  return continuation(action())();
                };
              };
            };
          })(packageExports["Effect"] || (packageExports["Effect"] = {})),
          // Module: Control.Monad
          (function (exportContainer) {
            "use strict";
            exportContainer["Control.Monad"] =
              exportContainer["Control.Monad"] || {};
            var monadControl = exportContainer["Control.Monad"], // Alias for Control.Monad
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              bindControl = exportContainer["Control.Bind"]; // Alias for Control.Bind
            monadControl.Monad = function (applicativeInst, bindInst) {
              this.Applicative0 = applicativeInst;
              this.Bind1 = bindInst;
            };
            monadControl.ap = function (monadInst) {
              return function (funcAction) {
                return function (valueAction) {
                  return bindControl.bind(monadInst.Bind1())(funcAction)(
                    function (funcResult) {
                      return bindControl.bind(monadInst.Bind1())(valueAction)(
                        function (valueResult) {
                          return applicativeControl.pure(
                            monadInst.Applicative0()
                          )(funcResult(valueResult));
                        }
                      );
                    }
                  );
                };
              };
            };
          })(packageExports),
          // Module: Effect
          (function (exportContainer) {
            "use strict";
            exportContainer["Effect"] = exportContainer["Effect"] || {};
            var effectCore = exportContainer["Effect"], // Alias for Effect
              effectReExport = exportContainer["Effect"], // Another alias for Effect
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              bindControl = exportContainer["Control.Bind"], // Alias for Control.Bind
              monadControl = exportContainer["Control.Monad"], // Alias for Control.Monad
              functorData = exportContainer["Data.Functor"], // Alias for Data.Functor
              effectMonadInstance = new monadControl.Monad(
                function () {
                  return effectApplicativeInstance;
                },
                function () {
                  return effectBindInstance;
                }
              ),
              effectBindInstance = new bindControl.Bind(
                function () {
                  return effectApplyInstance;
                },
                effectReExport.bindE
              ),
              effectApplyInstance = new applyControl.Apply(
                function () {
                  return effectFunctorInstance;
                },
                monadControl.ap(effectMonadInstance)
              ),
              effectApplicativeInstance = new applicativeControl.Applicative(
                function () {
                  return effectApplyInstance;
                },
                effectReExport.pureE
              ),
              effectFunctorInstance = new functorData.Functor(
                applicativeControl.liftA1(effectApplicativeInstance)
              );
            effectCore.functorEffect = effectFunctorInstance;
            effectCore.applyEffect = effectApplyInstance;
            effectCore.applicativeEffect = effectApplicativeInstance;
            effectCore.bindEffect = effectBindInstance;
            effectCore.monadEffect = effectMonadInstance;
          })(packageExports),
          // Module: Effect.Aff (complex internal implementation)
          (function (exportContainer) {
            "use strict";
            var affInternal = (function () {
              var internalState = {}, // Represents an empty or default state.
                pureTag = "Pure", // Tag for pure computations.
                throwTag = "Throw", // Tag for computations that throw an error.
                catchTag = "Catch", // Tag for computations that catch errors.
                syncTag = "Sync", // Tag for synchronous effect computations.
                asyncTag = "Async", // Tag for asynchronous effect computations.
                bindTag = "Bind", // Tag for monadic bind operations.
                bracketTag = "Bracket", // Tag for resource management (acquire/release).
                forkTag = "Fork", // Tag for forking a new fiber.
                sequentialTag = "Sequential", // Tag for sequential execution of parallel operations.
                parMapTag = "Map", // Tag for parallel map.
                parApplyTag = "Apply", // Tag for parallel apply.
                parAltTag = "Alt", // Tag for parallel alternative.
                consTag = "Cons", // Tag for a list-like cons operation (internal stack building).
                resumeTag = "Resume", // Tag for resuming a computation.
                releaseTag = "Release", // Tag for releasing a resource.
                finalizerTag = "Finalizer", // Tag for a finalization step.
                finalizedTag = "Finalized", // Tag indicating a finalizer has run.
                forkedTag = "Forked"; // Tag indicating a forked fiber.

              // Constructor for internal Aff operation records.
              function OperationRecord(tag, val1, val2, val3) {
                this.tag = tag;
                this._1 = val1;
                this._2 = val2;
                this._3 = val3;
              }

              // Factory function to create OperationRecords with a specific tag.
              function createOpRecord(tag) {
                var recordFactory = function (val1, val2, val3) {
                  return new OperationRecord(tag, val1, val2, val3);
                };
                return (recordFactory.tag = tag), recordFactory;
              }

              // Creates a "Pure" operation record.
              function createPureOp(value) {
                return new OperationRecord(pureTag, void 0);
              }

              // Executes a function safely, catching and logging any errors.
              function executeSafely(action) {
                try {
                  action();
                } catch (err) {
                  setTimeout(function () {
                    throw err;
                  }, 0);
                }
              }

              // Attempts to run a function, capturing its result or any thrown error.
              function tryCatchResult(errorHandler, successHandler, funcToRun) {
                try {
                  return successHandler(funcToRun());
                } catch (err) {
                  return errorHandler(err);
                }
              }

              // Handles asynchronous operations with error handling and result capture.
              function asyncTryCatch(
                errorHandler,
                successHandler,
                asyncAction
              ) {
                try {
                  return successHandler(asyncAction());
                } catch (err) {
                  return asyncAction(errorHandler(err))(), createPureOp;
                }
              }

              // A simple task scheduler for deferring execution.
              var taskScheduler = (function () {
                var queueCapacity = 1024,
                  queueSize = 0,
                  queueHead = 0,
                  taskQueue = new Array(queueCapacity),
                  isCurrentlyDraining = !1;

                function drainQueue() {
                  var currentTask;
                  for (isCurrentlyDraining = !0; 0 !== queueSize; )
                    queueSize--,
                      (currentTask = taskQueue[queueHead]),
                      (taskQueue[queueHead] = void 0),
                      (queueHead = (queueHead + 1) % queueCapacity),
                      currentTask();
                  isCurrentlyDraining = !1;
                }
                return {
                  isDraining: function () {
                    return isCurrentlyDraining;
                  },
                  enqueue: function (task) {
                    var tempDrainState;
                    queueSize === queueCapacity &&
                      ((tempDrainState = isCurrentlyDraining),
                      drainQueue(),
                      (isCurrentlyDraining = tempDrainState)),
                      (taskQueue[(queueHead + queueSize) % queueCapacity] = task),
                      queueSize++,
                      isCurrentlyDraining || drainQueue();
                  },
                };
              })();

              // Internal states representing a Fiber's execution progress.
              var FiberStateInitial = 0, // Fiber has not started execution.
                FiberStateRunning = 1, // Fiber is actively processing an operation.
                FiberStateEvaluating = 2, // Fiber is evaluating a continuation.
                FiberStateSuspended = 3, // Fiber is suspended, waiting for a result.
                FiberStateAsyncWait = 4, // Fiber is waiting for an asynchronous operation to complete.
                FiberStateErrored = 5, // Fiber has encountered an error.
                FiberStateCompleted = 6; // Fiber has finished execution.

              // The Fiber constructor, representing a lightweight concurrent computation.
              function Fiber(
                eitherInterface, // An interface for Either type operations.
                supervisorRef, // Optional supervisor for this fiber.
                initialAction // The initial Aff action for this fiber.
              ) {
                var executionStep = 0, // Counter for execution steps, used for async coordination.
                  currentState = FiberStateInitial, // Current state of the fiber.
                  currentResult = initialAction, // The current result or next action to process.
                  currentError = null, // Stores any error that occurred.
                  currentStack = null, // The continuation stack for bind operations.
                  errorStack = null, // The error handling stack.
                  bracketStack = null, // Stack for bracket operations (resource management).
                  bracketCount = 0, // Counter for active bracket resources.
                  asyncOpCount = 0, // Counter for asynchronous operations.
                  onCompleteHandlers = null, // Map of handlers to call on fiber completion.
                  rethrowOnComplete = !0; // Flag to re-throw unhandled errors on completion.

                // The main execution loop of the fiber.
                function advanceFiber(stepIdentifier) {
                  for (
                    var nextOpRecord, nextStackItem, currentBracketItem;
                    ;
                  )
                    switch (
                      ((nextOpRecord = null),
                      (nextStackItem = null),
                      (currentBracketItem = null),
                      currentState)
                    ) {
                      case FiberStateEvaluating:
                        // Transition from evaluating a continuation to running the next action.
                        currentState = FiberStateRunning;
                        currentResult = currentStack(currentResult);
                        null === errorStack
                          ? (currentStack = null)
                          : ((currentStack = errorStack._1),
                            (errorStack = errorStack._2));
                        break;
                      case FiberStateSuspended:
                        // Check if the current result is an error or a successful value.
                        eitherInterface.isLeft(currentResult)
                          ? ((currentState = FiberStateErrored),
                            (currentError = currentResult),
                            (currentResult = null))
                          : null === currentStack
                          ? (currentState = FiberStateErrored) // No more continuations, but an error occurred upstream.
                          : ((currentState = FiberStateEvaluating),
                            (currentResult = eitherInterface.fromRight(currentResult)));
                        break;
                      case FiberStateRunning:
                        // Process the current Aff operation based on its tag.
                        switch (currentResult.tag) {
                          case bindTag:
                            // Add the bind continuation to the stack.
                            currentStack &&
                              (errorStack = new OperationRecord(
                                consTag,
                                currentStack,
                                errorStack
                              )),
                              (currentStack = currentResult._2),
                              (currentState = FiberStateRunning),
                              (currentResult = currentResult._1);
                            break;
                          case pureTag:
                            // If pure, apply the continuation or mark as errored if no continuation.
                            null === currentStack
                              ? ((currentState = FiberStateErrored),
                                (currentResult = eitherInterface.right(currentResult._1)))
                              : ((currentState = FiberStateEvaluating),
                                (currentResult = currentResult._1));
                            break;
                          case syncTag:
                            // Execute a synchronous effect, handling potential exceptions.
                            currentState = FiberStateSuspended;
                            currentResult = tryCatchResult(
                              eitherInterface.left,
                              eitherInterface.right,
                              currentResult._1
                            );
                            break;
                          case asyncTag:
                            // Handle an asynchronous effect. This suspends the fiber.
                            return (
                              (currentState = FiberStateAsyncWait),
                              void (currentResult = asyncTryCatch(
                                eitherInterface.left,
                                currentResult._1,
                                function (resultHandler) {
                                  return function () {
                                    executionStep === stepIdentifier &&
                                      (executionStep++,
                                      taskScheduler.enqueue(function () {
                                        executionStep === stepIdentifier + 1 &&
                                          ((currentState = FiberStateSuspended),
                                          (currentResult = resultHandler),
                                          advanceFiber(executionStep));
                                      }));
                                  };
                                }
                              ))
                            );
                          case throwTag:
                            // Directly transition to an errored state.
                            currentState = FiberStateErrored;
                            currentError = eitherInterface.left(currentResult._1);
                            currentResult = null;
                            break;
                          case catchTag:
                            // Push a catch block onto the bracket stack.
                            bracketStack = new OperationRecord(
                              consTag,
                              currentResult,
                              null === currentStack
                                ? bracketStack
                                : new OperationRecord(
                                    resumeTag,
                                    currentStack,
                                    errorStack
                                  ),
                              errorStack
                            );
                            currentStack = null;
                            errorStack = null;
                            currentState = FiberStateRunning;
                            currentResult = currentResult._1;
                            break;
                          case bracketTag:
                            // Push a bracket resource onto the bracket stack.
                            bracketCount++;
                            bracketStack = new OperationRecord(
                              consTag,
                              currentResult,
                              null === currentStack
                                ? bracketStack
                                : new OperationRecord(
                                    resumeTag,
                                    currentStack,
                                    errorStack
                                  ),
                              errorStack
                            );
                            currentStack = null;
                            errorStack = null;
                            currentState = FiberStateRunning;
                            currentResult = currentResult._1;
                            break;
                          case forkTag:
                            // Create and run a new fiber.
                            currentState = FiberStateSuspended;
                            nextOpRecord = Fiber(
                              eitherInterface,
                              supervisorRef,
                              currentResult._2
                            );
                            supervisorRef && supervisorRef.register(nextOpRecord);
                            currentResult._1 && nextOpRecord.run();
                            currentResult = eitherInterface.right(nextOpRecord);
                            break;
                          case sequentialTag:
                            // Execute sequential actions.
                            currentState = FiberStateRunning;
                            currentResult = executeSequential(
                              eitherInterface,
                              supervisorRef,
                              currentResult._1
                            );
                        }
                        break;
                      case FiberStateErrored:
                        // Handle errors by unwinding the bracket stack.
                        if (
                          ((currentStack = null),
                          (errorStack = null),
                          null === bracketStack)
                        )
                          currentState = FiberStateCompleted; // No more error handlers, fiber completes with error.
                        else
                          switch (
                            ((nextOpRecord = bracketStack._3),
                            (currentBracketItem = bracketStack._1),
                            (bracketStack = bracketStack._2),
                            currentBracketItem.tag)
                          ) {
                            case catchTag:
                              // If a catch block matches the current error context, execute it.
                              onCompleteHandlers &&
                                onCompleteHandlers !== nextOpRecord
                                ? (currentState = FiberStateErrored)
                                : currentError &&
                                  ((currentState = FiberStateRunning),
                                  (currentResult = currentBracketItem._2(
                                    eitherInterface.fromLeft(currentError)
                                  )),
                                  (currentError = null));
                              break;
                            case resumeTag:
                              // Resume execution if there's no error or the context matches.
                              onCompleteHandlers && onCompleteHandlers !== nextOpRecord ||
                                currentError
                                ? (currentState = FiberStateErrored)
                                : ((currentStack = currentBracketItem._1),
                                  (errorStack = currentBracketItem._2),
                                  (currentState = FiberStateEvaluating),
                                  (currentResult = eitherInterface.fromRight(currentResult)));
                              break;
                            case bracketTag:
                              // Release a bracketed resource.
                              bracketCount--;
                              null === currentError &&
                                ((nextStackItem = eitherInterface.fromRight(
                                  currentResult
                                )),
                                (bracketStack = new OperationRecord(
                                  consTag,
                                  new OperationRecord(
                                    releaseTag,
                                    currentBracketItem._2,
                                    nextStackItem
                                  ),
                                  bracketStack,
                                  nextOpRecord
                                )),
                                (onCompleteHandlers === nextOpRecord || bracketCount > 0) &&
                                  ((currentState = FiberStateRunning),
                                  (currentResult = currentBracketItem._3(nextStackItem))));
                              break;
                            case releaseTag:
                              // Execute the release action of a bracket.
                              bracketCount++;
                              bracketStack = new OperationRecord(
                                consTag,
                                new OperationRecord(
                                  finalizedTag,
                                  currentResult,
                                  currentError
                                ),
                                bracketStack,
                                onCompleteHandlers
                              );
                              currentState = FiberStateRunning;
                              currentResult =
                                onCompleteHandlers && onCompleteHandlers !== nextOpRecord
                                  ? currentBracketItem._1.killed(
                                      eitherInterface.fromLeft(onCompleteHandlers)
                                    )(currentBracketItem._2)
                                  : currentError
                                  ? currentBracketItem._1.failed(
                                      eitherInterface.fromLeft(currentError)
                                    )(currentBracketItem._2)
                                  : currentBracketItem._1.completed(
                                      eitherInterface.fromRight(currentResult)
                                    )(currentBracketItem._2);
                              currentError = null;
                              break;
                            case finalizerTag:
                              // Execute a finalizer.
                              bracketCount++;
                              bracketStack = new OperationRecord(
                                consTag,
                                new OperationRecord(
                                  finalizedTag,
                                  currentResult,
                                  currentError
                                ),
                                bracketStack,
                                onCompleteHandlers
                              );
                              currentState = FiberStateRunning;
                              currentResult = currentBracketItem._1;
                              break;
                            case finalizedTag:
                              // Mark a finalizer as completed.
                              bracketCount--;
                              currentState = FiberStateErrored;
                              currentResult = currentBracketItem._1;
                              currentError = currentBracketItem._2;
                          }
                        break;
                      case FiberStateCompleted:
                        // Run all registered completion handlers.
                        for (var handlerKey in onCompleteHandlers)
                          onCompleteHandlers.hasOwnProperty(handlerKey) &&
                            (rethrowOnComplete =
                              rethrowOnComplete && onCompleteHandlers[handlerKey].rethrow),
                            executeSafely(
                              onCompleteHandlers[handlerKey].handler(currentResult)
                            );
                        return (
                          (onCompleteHandlers = null),
                          void (
                            onCompleteHandlers && currentError
                              ? setTimeout(function () {
                                  throw eitherInterface.fromLeft(currentError);
                                }, 0)
                              : eitherInterface.isLeft(currentResult) &&
                                rethrowOnComplete &&
                                setTimeout(function () {
                                  if (rethrowOnComplete)
                                    throw eitherInterface.fromLeft(currentResult);
                                }, 0)
                          )
                        );
                      case FiberStateInitial:
                        // Start execution.
                        currentState = FiberStateRunning;
                        break;
                      case FiberStateAsyncWait:
                        // Fiber is paused, waiting for an async result.
                        return;
                    }
                }

                // Registers a callback to be invoked when the fiber completes.
                function registerCompletionHandler(handlerConfig) {
                  return function () {
                    if (currentState === FiberStateCompleted)
                      return (
                        (rethrowOnComplete = rethrowOnComplete && handlerConfig.rethrow),
                        handlerConfig.handler(currentResult)(),
                        function () {}
                      );
                    var handlerId = asyncOpCount++;
                    return (
                      (onCompleteHandlers = onCompleteHandlers || {}),
                      (onCompleteHandlers[handlerId] = handlerConfig),
                      function () {
                        null !== onCompleteHandlers &&
                          delete onCompleteHandlers[handlerId];
                      }
                    );
                  };
                }

                return {
                  // Attempts to cancel/kill the fiber with a given error.
                  kill: function (errorVal, callback) {
                    return function () {
                      if (currentState === FiberStateCompleted)
                        return callback(eitherInterface.right(void 0))(), function () {};
                      var cleanupFunc = registerCompletionHandler({
                        rethrow: !1,
                        handler: function () {
                          return callback(eitherInterface.right(void 0));
                        },
                      })();
                      switch (currentState) {
                        case FiberStateInitial:
                          currentError = eitherInterface.left(errorVal);
                          currentState = FiberStateCompleted;
                          currentResult = currentError;
                          advanceFiber(executionStep);
                          break;
                        case FiberStateAsyncWait:
                          null === onCompleteHandlers &&
                            (onCompleteHandlers = eitherInterface.left(errorVal));
                          0 === bracketCount &&
                            (currentState === FiberStateAsyncWait &&
                              (bracketStack = new OperationRecord(
                                consTag,
                                new OperationRecord(
                                  finalizerTag,
                                  currentResult(errorVal)
                                ),
                                bracketStack,
                                onCompleteHandlers
                              )),
                            (currentState = FiberStateErrored),
                            (currentResult = null),
                            (currentError = null),
                            advanceFiber(++executionStep));
                          break;
                        default:
                          null === onCompleteHandlers &&
                            (onCompleteHandlers = eitherInterface.left(errorVal));
                          0 === bracketCount &&
                            ((currentState = FiberStateErrored),
                            (currentResult = null),
                            (currentError = null));
                      }
                      return cleanupFunc;
                    };
                  },
                  // Waits for the fiber to complete, invoking a callback.
                  join: function (completionCallback) {
                    return function () {
                      var cleanupFunc = registerCompletionHandler({
                        rethrow: !1,
                        handler: completionCallback,
                      })();
                      return currentState === FiberStateInitial && advanceFiber(executionStep), cleanupFunc;
                    };
                  },
                  // Exposes the completion handler registration.
                  onComplete: registerCompletionHandler,
                  // Checks if the fiber is in its initial (suspended) state.
                  isSuspended: function () {
                    return currentState === FiberStateInitial;
                  },
                  // Starts the fiber's execution.
                  run: function () {
                    currentState === FiberStateInitial &&
                      (taskScheduler.isDraining()
                        ? advanceFiber(executionStep)
                        : taskScheduler.enqueue(function () {
                            advanceFiber(executionStep);
                          }));
                  },
                };
              }

              // Executes parallel Aff actions in a sequential manner, managing their lifecycles.
              function executeSequential(eitherInterface, supervisorRef, parAffAction) {
                var fiberCount = 0,
                  activeFibers = {},
                  completedFibers = 0,
                  earlyExitError = new Error("[ParAff] Early exit"), // Error used for early termination.
                  currentErrorMessage = null, // Stores an error that causes early exit.
                  eitherInstance = eitherInterface; // Alias for the Either interface.

                // Handles the completion of a forked fiber, propagating its result.
                function fiberCompletionHandler(fiberId) {
                  return function (completionResult) {
                    return function () {
                      delete activeFibers[fiberId._1]; // Remove fiber from active list.
                      fiberId._3 = completionResult; // Store the fiber's result.
                      // Recursively process the completed fiber's parent if it exists.
                      (function processParentFiber(
                        currentResult,
                        parentOpRecord,
                        grandParentOpRecord
                      ) {
                        var leftResult, rightResult, childOp, siblingOp, nextOp;
                        for (
                          eitherInstance.isLeft(currentResult)
                            ? ((leftResult = currentResult), (rightResult = null))
                            : ((rightResult = currentResult), (leftResult = null));
                          ;
                        ) {
                          if (((childOp = null), (siblingOp = null), (nextOp = null), null !== currentErrorMessage)) return;
                          if (null === parentOpRecord)
                            return void eitherInstance(leftResult || rightResult)();
                          if (parentOpRecord._3 !== eitherInstance) return;

                          switch (parentOpRecord.tag) {
                            case parMapTag:
                              null === leftResult
                                ? (parentOpRecord._3 = eitherInstance.right(
                                    parentOpRecord._1(eitherInstance.fromRight(rightResult))
                                  ))
                                : (parentOpRecord._3 = leftResult);
                              break;
                            case parApplyTag:
                              childOp = parentOpRecord._1._3;
                              siblingOp = parentOpRecord._2._3;
                              if (leftResult) {
                                if (
                                  ((parentOpRecord._3 = leftResult),
                                  (nextOp = completedFibers++),
                                  (completedFibers[nextOp] = cleanupForks(
                                    earlyExitError,
                                    leftResult === childOp ? parentOpRecord._2 : parentOpRecord._1,
                                    function () {
                                      return function () {
                                        delete completedFibers[nextOp];
                                        nextOp
                                          ? (nextOp = !1)
                                          : null === grandParentOpRecord
                                          ? processParentFiber(leftResult, null, null)
                                          : processParentFiber(
                                              leftResult,
                                              grandParentOpRecord._1,
                                              grandParentOpRecord._2
                                            );
                                      };
                                    }
                                  )),
                                  nextOp)
                                )
                                  return void (nextOp = !1);
                              } else {
                                if (childOp === eitherInstance || siblingOp === eitherInstance) return;
                                rightResult = eitherInstance.right(
                                  eitherInstance.fromRight(childOp)(
                                    eitherInstance.fromRight(siblingOp)
                                  )
                                );
                                parentOpRecord._3 = rightResult;
                              }
                              break;
                            case parAltTag:
                              childOp = parentOpRecord._1._3;
                              siblingOp = parentOpRecord._2._3;
                              if (
                                childOp === eitherInstance &&
                                eitherInstance.isLeft(siblingOp) ||
                                siblingOp === eitherInstance &&
                                eitherInstance.isLeft(childOp)
                              )
                                return;
                              if (
                                childOp !== eitherInstance &&
                                eitherInstance.isLeft(childOp) &&
                                siblingOp !== eitherInstance &&
                                eitherInstance.isLeft(siblingOp)
                              )
                                (leftResult = leftResult === childOp ? siblingOp : childOp),
                                  (rightResult = null),
                                  (parentOpRecord._3 = leftResult);
                              else if (
                                ((parentOpRecord._3 = rightResult),
                                (nextOp = completedFibers++),
                                (completedFibers[nextOp] = cleanupForks(
                                  earlyExitError,
                                  rightResult === childOp ? parentOpRecord._2 : parentOpRecord._1,
                                  function () {
                                    return function () {
                                      delete completedFibers[nextOp];
                                      nextOp
                                        ? (nextOp = !1)
                                        : null === grandParentOpRecord
                                        ? processParentFiber(rightResult, null, null)
                                        : processParentFiber(
                                            rightResult,
                                            grandParentOpRecord._1,
                                            grandParentOpRecord._2
                                          );
                                    };
                                  }
                                )),
                                nextOp)
                              )
                                return void (nextOp = !1);
                          }
                          null === grandParentOpRecord
                            ? (parentOpRecord = null)
                            : ((parentOpRecord = grandParentOpRecord._1),
                              (grandParentOpRecord = grandParentOpRecord._2));
                        }
                      })(completionResult, fiberId._2._1, fiberId._2._2);
                    };
                  };
                }

                // Cleans up forked fibers when an early exit occurs.
                function cleanupForks(errorVal, opRecord, completionHandler) {
                  var currentCount,
                    cleanupMap = {},
                    currentIdx = 0;
                  (function recursiveCleanup(
                    errorContext,
                    currentOp,
                    finalCallback
                  ) {
                    var childFiber, nextChild, grandChild;
                    // Loop through the operation record.
                    cleanup_loop: for (;;)
                      switch (((childFiber = null), currentOp.tag)) {
                        case forkedTag:
                          if (
                            currentOp._3 === eitherInstance &&
                            ((childFiber = activeFibers[currentOp._1]),
                            (cleanupMap[currentIdx++] = childFiber.kill(
                              errorContext,
                              function (killResult) {
                                return function () {
                                  0 === --currentIdx && finalCallback(killResult)();
                                };
                              }
                            )),
                            null === nextChild)
                          )
                            break cleanup_loop;
                          currentOp = nextChild;
                          null === grandChild
                            ? (nextChild = null)
                            : ((nextChild = grandChild._1),
                              (grandChild = grandChild._2));
                          break;
                        case parMapTag:
                          currentOp = currentOp._2;
                          break;
                        case parApplyTag:
                        case parAltTag:
                          nextChild && (grandChild = new OperationRecord(consTag, nextChild, grandChild)),
                            (nextChild = currentOp),
                            (currentOp = currentOp._1);
                      }
                    if (0 === currentIdx) finalCallback(eitherInstance.right(void 0))();
                    else
                      for (childFiber = 0, nextChild = currentIdx; childFiber < nextChild; childFiber++)
                        cleanupMap[childFiber] = cleanupMap[childFiber]();
                    return cleanupMap;
                  })(errorVal, opRecord, completionHandler);
                }

                // Initializes the sequential execution logic.
                return (function () {
                  var currentOpIndex,
                    currentOpType = FiberStateRunning,
                    currentParAff = parAffAction,
                    opStack = null,
                    parentStack = null;

                  execution_loop: for (;;)
                    switch (
                      ((currentOpIndex = null), (currentOpType))
                    ) {
                      case FiberStateRunning:
                        switch (currentParAff.tag) {
                          case parMapTag:
                            opStack &&
                              (parentStack = new OperationRecord(consTag, opStack, parentStack)),
                              (opStack = new OperationRecord(
                                parMapTag,
                                currentParAff._1,
                                eitherInstance,
                                eitherInstance
                              )),
                              (currentParAff = currentParAff._2);
                            break;
                          case parApplyTag:
                            opStack &&
                              (parentStack = new OperationRecord(consTag, opStack, parentStack)),
                              (opStack = new OperationRecord(
                                parApplyTag,
                                eitherInstance,
                                currentParAff._2,
                                eitherInstance
                              )),
                              (currentParAff = currentParAff._1);
                            break;
                          case parAltTag:
                            opStack &&
                              (parentStack = new OperationRecord(consTag, opStack, parentStack)),
                              (opStack = new OperationRecord(
                                parAltTag,
                                eitherInstance,
                                currentParAff._2,
                                eitherInstance
                              )),
                              (currentParAff = currentParAff._1);
                            break;
                          default:
                            currentOpIndex = fiberCount++;
                            currentOpType = FiberStateErrored;
                            var currentFiberAction = currentParAff;
                            currentParAff = new OperationRecord(
                              forkedTag,
                              currentOpIndex,
                              new OperationRecord(consTag, opStack, parentStack),
                              eitherInstance
                            );
                            var newFiber = Fiber(
                              eitherInstance,
                              supervisorRef,
                              currentFiberAction
                            );
                            newFiber.onComplete({
                              rethrow: !1,
                              handler: fiberCompletionHandler(currentParAff),
                            })();
                            activeFibers[currentOpIndex] = newFiber;
                            supervisorRef && supervisorRef.register(newFiber);
                        }
                        break;
                      case FiberStateErrored:
                        if (null === opStack) break execution_loop;
                        opStack._1 === eitherInstance
                          ? ((opStack._1 = currentParAff),
                            (currentOpType = FiberStateRunning),
                            (currentParAff = opStack._2),
                            (opStack._2 = eitherInstance))
                          : ((opStack._2 = currentParAff),
                            (currentParAff = opStack),
                            (opStack = null === parentStack ? null : parentStack._1),
                            (parentStack = null === parentStack ? null : parentStack._2));
                    }
                  // Run all initially active fibers.
                  for (var i = 0; i < fiberCount; i++) activeFibers[i].run();
                })();

                // Returns a canceller for the entire sequential execution.
                return new OperationRecord(
                  asyncTag,
                  function (cancelHandler) {
                    return function () {
                      return function (errorVal, successVal) {
                        var currentFiber;
                        for (currentErrorMessage = eitherInstance.left(errorVal), completedFibers; ; ) {
                          if (currentErrorMessage) return;
                          if (null === opStack) return void successVal();
                          if (opStack._3 !== eitherInstance) return;
                          switch (opStack.tag) {
                            case parMapTag:
                              null === currentErrorMessage
                                ? (opStack._3 = eitherInstance.right(
                                    opStack._1(eitherInstance.fromRight(successVal))
                                  ))
                                : (opStack._3 = currentErrorMessage);
                              break;
                            case parApplyTag:
                              childFiber = opStack._1._3;
                              siblingOp = opStack._2._3;
                              if (currentErrorMessage) {
                                if (
                                  ((opStack._3 = currentErrorMessage),
                                  (nextOp = completedFibers++),
                                  (completedFibers[nextOp] = cleanupForks(
                                    earlyExitError,
                                    currentErrorMessage === childFiber ? opStack._2 : opStack._1,
                                    function () {
                                      return function () {
                                        delete completedFibers[nextOp];
                                        nextOp
                                          ? (nextOp = !1)
                                          : null === grandParentOpRecord
                                          ? processParentFiber(currentErrorMessage, null, null)
                                          : processParentFiber(
                                              currentErrorMessage,
                                              grandParentOpRecord._1,
                                              grandParentOpRecord._2
                                            );
                                      };
                                    }
                                  )),
                                  nextOp)
                                )
                                  return void (nextOp = !1);
                              } else {
                                if (childFiber === eitherInstance || siblingOp === eitherInstance) return;
                                successVal = eitherInstance.right(
                                  eitherInstance.fromRight(childFiber)(
                                    eitherInstance.fromRight(siblingOp)
                                  )
                                );
                                opStack._3 = successVal;
                              }
                              break;
                            case parAltTag:
                              childFiber = opStack._1._3;
                              siblingOp = opStack._2._3;
                              if (
                                childFiber === eitherInstance &&
                                eitherInstance.isLeft(siblingOp) ||
                                siblingOp === eitherInstance &&
                                eitherInstance.isLeft(childFiber)
                              )
                                return;
                              if (
                                childFiber !== eitherInstance &&
                                eitherInstance.isLeft(childFiber) &&
                                siblingOp !== eitherInstance &&
                                eitherInstance.isLeft(siblingOp)
                              )
                                (currentErrorMessage = currentErrorMessage === childFiber ? siblingOp : childFiber),
                                  (successVal = null),
                                  (opStack._3 = currentErrorMessage);
                              else if (
                                ((opStack._3 = successVal),
                                (nextOp = completedFibers++),
                                (completedFibers[nextOp] = cleanupForks(
                                  earlyExitError,
                                  successVal === childFiber ? opStack._2 : opStack._1,
                                  function () {
                                    return function () {
                                      delete completedFibers[nextOp];
                                      nextOp
                                        ? (nextOp = !1)
                                        : null === grandParentOpRecord
                                        ? processParentFiber(successVal, null, null)
                                        : processParentFiber(
                                            successVal,
                                            grandParentOpRecord._1,
                                            grandParentOpRecord._2
                                          );
                                    };
                                  }
                                )),
                                nextOp)
                              )
                                return void (nextOp = !1);
                          }
                          null === grandParentOpRecord
                            ? (opStack = null)
                            : ((opStack = grandParentOpRecord._1),
                              (grandParentOpRecord = grandParentOpRecord._2));
                        }
                        return cleanupForks(errorVal, currentParAff, cancelHandler);
                      };
                    };
                  }
                );
              }

              // Public API for internal Aff operations.
              return (
                (OperationRecord.EMPTY = internalState),
                (OperationRecord.Pure = createOpRecord(pureTag)),
                (OperationRecord.Throw = createOpRecord(throwTag)),
                (OperationRecord.Catch = createOpRecord(catchTag)),
                (OperationRecord.Sync = createOpRecord(syncTag)),
                (OperationRecord.Async = createOpRecord(asyncTag)),
                (OperationRecord.Bind = createOpRecord(bindTag)),
                (OperationRecord.Bracket = createOpRecord(bracketTag)),
                (OperationRecord.Fork = createOpRecord(forkTag)),
                (OperationRecord.Seq = createOpRecord(sequentialTag)),
                (OperationRecord.ParMap = createOpRecord(parMapTag)),
                (OperationRecord.ParApply = createOpRecord(parApplyTag)),
                (OperationRecord.ParAlt = createOpRecord(parAltTag)),
                (OperationRecord.Fiber = Fiber),
                (OperationRecord.Supervisor = function (eitherInterface) {
                  var registeredFibers = {},
                    nextFiberId = 0,
                    activeFiberCount = 0;
                  return {
                    register: function (fiberInstance) {
                      var currentId = nextFiberId++;
                      fiberInstance.onComplete({
                        rethrow: !0,
                        handler: function (result) {
                          return function () {
                            activeFiberCount--;
                            delete registeredFibers[currentId];
                          };
                        },
                      })();
                      registeredFibers[currentId] = fiberInstance;
                      activeFiberCount++;
                    },
                    isEmpty: function () {
                      return 0 === activeFiberCount;
                    },
                    killAll: function (killError, completionCallback) {
                      return function () {
                        var pendingKills = 0,
                          killCallbacks = {};
                        function initiateKill(fiberId) {
                          killCallbacks[fiberId] = registeredFibers[fiberId].kill(
                            killError,
                            function (killResult) {
                              return function () {
                                delete killCallbacks[fiberId];
                                pendingKills--;
                                eitherInterface.isLeft(killResult) &&
                                  eitherInterface.fromLeft(killResult) &&
                                  setTimeout(function () {
                                    throw eitherInterface.fromLeft(killResult);
                                  }, 0);
                                0 === pendingKills && completionCallback();
                              };
                            }
                          )();
                        }
                        for (var fId in registeredFibers)
                          registeredFibers.hasOwnProperty(fId) &&
                            (pendingKills++, initiateKill(fId));
                        return (
                          (registeredFibers = {}),
                          (nextFiberId = 0),
                          (activeFiberCount = 0),
                          function (cancelFunc) {
                            return new OperationRecord(
                              syncTag,
                              function () {
                                for (var fId in killCallbacks)
                                  killCallbacks.hasOwnProperty(fId) &&
                                    killCallbacks[fId]();
                              }
                            );
                          }
                        );
                      };
                    },
                  };
                }),
                (OperationRecord.Scheduler = taskScheduler),
                (OperationRecord.nonCanceler = createPureOp),
                OperationRecord
              );
            })();

            exportContainer["Effect.Aff"] =
              exportContainer["Effect.Aff"] || {};
            var asyncEffect = exportContainer["Effect.Aff"], // Alias for Effect.Aff
              asyncEffectReExport = exportContainer["Effect.Aff"], // Another alias for Effect.Aff
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              applyControl = exportContainer["Control.Apply"], // Alias for Control.Apply
              bindControl = exportContainer["Control.Bind"], // Alias for Control.Bind
              monadControl = exportContainer["Control.Monad"], // Alias for Control.Monad
              parallelControl = exportContainer["Control.Parallel"], // Alias for Control.Parallel
              parallelClassControl = exportContainer["Control.Parallel.Class"], // Alias for Control.Parallel.Class
              eitherData = exportContainer["Data.Either"], // Alias for Data.Either
              foldableData = exportContainer["Data.Foldable"], // Alias for Data.Foldable
              functionData = exportContainer["Data.Function"], // Alias for Data.Function
              functorData = exportContainer["Data.Functor"], // Alias for Data.Functor
              monoidData = exportContainer["Data.Monoid"], // Alias for Data.Monoid
              semigroupData = exportContainer["Data.Semigroup"], // Alias for Data.Semigroup
              unitData = exportContainer["Data.Unit"], // Alias for Data.Unit
              effectCore = exportContainer.Effect, // Alias for Effect
              effectClass = exportContainer["Effect.Class"], // Alias for Effect.Class
              unsafePartialOps = exportContainer["Partial.Unsafe"], // Alias for Partial.Unsafe
              unsafeCoerceOps = exportContainer["Unsafe.Coerce"], // Alias for Unsafe.Coerce
              parAffFunctorInstance = new functorData.Functor(
                asyncEffectReExport._parAffMap
              ),
              affFunctorInstance = new functorData.Functor(
                asyncEffectReExport._map
              ),
              eitherInterfaceImpl = {
                isLeft: function (eitherVal) {
                  if (eitherVal instanceof eitherData.Left) return !0;
                  if (eitherVal instanceof eitherData.Right) return !1;
                  throw new Error(
                    "Failed pattern match at Effect.Aff (line 390, column 12 - line 392, column 20): " +
                      [eitherVal.constructor.name]
                  );
                },
                fromLeft: function (eitherVal) {
                  if (eitherVal instanceof eitherData.Left) return eitherVal.value0;
                  if (eitherVal instanceof eitherData.Right)
                    return unsafePartialOps.unsafeCrashWith("unsafeFromLeft: Right");
                  throw new Error(
                    "Failed pattern match at Effect.Aff (line 395, column 20 - line 399, column 3): " +
                      [eitherVal.constructor.name]
                  );
                },
                fromRight: function (eitherVal) {
                  if (eitherVal instanceof eitherData.Right) return eitherVal.value0;
                  if (eitherVal instanceof eitherData.Left)
                    return unsafePartialOps.unsafeCrashWith("unsafeFromRight: Left");
                  throw new Error(
                    "Failed pattern match at Effect.Aff (line 400, column 21 - line 402, column 31): " +
                      [eitherVal.constructor.name]
                  );
                },
                left: eitherData.Left.create,
                right: eitherData.Right.create,
              },
              createAndRunFiber = function (affAction) {
                return function () {
                  var fiberCreator = function (action) {
                    return affInternal.Fiber(eitherInterfaceImpl, null, action);
                  }(affAction);
                  return fiberCreator.run(), fiberCreator;
                };
              },
              parAffApplyInstance = new applyControl.Apply(
                function () {
                  return parAffFunctorInstance;
                },
                asyncEffectReExport._parAffApply
              ),
              affMonadInstance = new monadControl.Monad(
                function () {
                  return affApplicativeInstance;
                },
                function () {
                  return affBindInstance;
                }
              ),
              affBindInstance = new bindControl.Bind(
                function () {
                  return affApplyInstance;
                },
                asyncEffectReExport._bind
              ),
              affApplyInstance = new applyControl.Apply(
                function () {
                  return affFunctorInstance;
                },
                monadControl.ap(affMonadInstance)
              ),
              affApplicativeInstance = new applicativeControl.Applicative(
                function () {
                  return affApplyInstance;
                },
                asyncEffectReExport._pure
              ),
              monadEffectAffInstance = new effectClass.MonadEffect(
                function () {
                  return affMonadInstance;
                },
                asyncEffectReExport._liftEffect
              ),
              parallelAffInstance = new parallelClassControl.Parallel(
                function () {
                  return parAffApplicativeInstance;
                },
                function () {
                  return affMonadInstance;
                },
                unsafeCoerceOps.unsafeCoerce,
                asyncEffectReExport._sequential
              ),
              parAffApplicativeInstance = new applicativeControl.Applicative(
                function () {
                  return parAffApplyInstance;
                },
                function (value) {
                  return parallelClassControl.parallel(parallelAffInstance)(
                    applicativeControl.pure(affMonadInstance)(value)
                  );
                }
              ),
              semigroupCancelerInstance = new semigroupData.Semigroup(
                function (firstCanceler) {
                  return function (secondCanceler) {
                    return function (fiber) {
                      return parallelControl.parSequence_(parallelAffInstance)(
                        foldableData.foldableArray
                      )([firstCanceler(fiber), secondCanceler(fiber)]);
                    };
                  };
                }
              ),
              nonCancelerConstant = functionData.const(
                applicativeControl.pure(affMonadInstance)(unitData.unit)
              ),
              monoidCancelerInstance = new monoidData.Monoid(
                function () {
                  return semigroupCancelerInstance;
                },
                nonCancelerConstant
              );
            asyncEffect.launchAff = createAndRunFiber;
            asyncEffect.launchAff_ = function (affAction) {
              return functorData.void(effectCore.functorEffect)(
                createAndRunFiber(affAction)
              );
            };
            asyncEffect.nonCanceler = nonCancelerConstant;
            asyncEffect.functorAff = affFunctorInstance;
            asyncEffect.applyAff = affApplyInstance;
            asyncEffect.applicativeAff = affApplicativeInstance;
            asyncEffect.bindAff = affBindInstance;
            asyncEffect.monadAff = affMonadInstance;
            asyncEffect.monadEffectAff = monadEffectAffInstance;
            asyncEffect.functorParAff = parAffFunctorInstance;
            asyncEffect.applyParAff = parAffApplyInstance;
            asyncEffect.applicativeParAff = parAffApplicativeInstance;
            asyncEffect.parallelAff = parallelAffInstance;
            asyncEffect.semigroupCanceler = semigroupCancelerInstance;
            asyncEffect.monoidCanceler = monoidCancelerInstance;
            asyncEffect.makeAff = affInternal.Async;
            asyncEffect._pure = affInternal.Pure;
            asyncEffect._map = function (transformFunc) {
              return function (affAction) {
                return affAction.tag === affInternal.Pure.tag
                  ? affInternal.Pure(transformFunc(affAction._1))
                  : affInternal.Bind(affAction, function (result) {
                      return affInternal.Pure(transformFunc(result));
                    });
              };
            };
            asyncEffect._bind = function (bindFunc) {
              return function (affAction) {
                return affInternal.Bind(affAction, bindFunc);
              };
            };
            asyncEffect._liftEffect = affInternal.Sync;
            asyncEffect._parAffMap = function (transformFunc) {
              return function (parAffAction) {
                return affInternal.ParMap(transformFunc, parAffAction);
              };
            };
            asyncEffect._parAffApply = function (parAffFunc) {
              return function (parAffVal) {
                return affInternal.ParApply(parAffFunc, parAffVal);
              };
            };
            asyncEffect._makeFiber = function (eitherInterface, affAction) {
              return function () {
                return affInternal.Fiber(eitherInterface, null, affAction);
              };
            };
            asyncEffect._sequential = affInternal.Seq;
          })(packageExports),
          // Module: Effect.Ref (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer["Effect.Ref"] =
              exportContainer["Effect.Ref"] || {};
            exportContainer["Effect.Ref"].new = function (initialValue) {
              return function () {
                return { value: initialValue };
              };
            };
            exportContainer["Effect.Ref"].read = function (refObject) {
              return function () {
                return refObject.value;
              };
            };
            exportContainer["Effect.Ref"].write = function (newValue) {
              return function (refObject) {
                return function () {
                  return (refObject.value = newValue), {};
                };
              };
            };
          })(packageExports),
          // Module: Effect.Ref
          (function (exportContainer) {
            "use strict";
            exportContainer["Effect.Ref"] =
              exportContainer["Effect.Ref"] || {};
            var mutableRef = exportContainer["Effect.Ref"], // Alias for Effect.Ref
              mutableRefReExport = exportContainer["Effect.Ref"]; // Another alias for Effect.Ref
            mutableRef.new = mutableRefReExport.new;
            mutableRef.read = mutableRefReExport.read;
            mutableRef.write = mutableRefReExport.write;
          })(packageExports),
          // Module: Node.Encoding
          (function (exportContainer) {
            "use strict";
            exportContainer["Node.Encoding"] =
              exportContainer["Node.Encoding"] || {};
            var nodeEncoding = exportContainer["Node.Encoding"], // Alias for Node.Encoding
              showData = exportContainer["Data.Show"], // Alias for Data.Show
              ASCIIEncoding = (function () {
                function ASCII() {}
                return (ASCII.value = new ASCII()), ASCII;
              })(),
              UTF8Encoding = (function () {
                function UTF8() {}
                return (UTF8.value = new UTF8()), UTF8;
              })(),
              UTF16LEEncoding = (function () {
                function UTF16LE() {}
                return (UTF16LE.value = new UTF16LE()), UTF16LE;
              })(),
              UCS2Encoding = (function () {
                function UCS2() {}
                return (UCS2.value = new UCS2()), UCS2;
              })(),
              Base64Encoding = (function () {
                function Base64() {}
                return (Base64.value = new Base64()), Base64;
              })(),
              Latin1Encoding = (function () {
                function Latin1() {}
                return (Latin1.value = new Latin1()), Latin1;
              })(),
              BinaryEncoding = (function () {
                function Binary() {}
                return (Binary.value = new Binary()), Binary;
              })(),
              HexEncoding = (function () {
                function Hex() {}
                return (Hex.value = new Hex()), Hex;
              })(),
              encodingShowInstance = new showData.Show(function (encodingType) {
                if (encodingType instanceof ASCIIEncoding) return "ASCII";
                if (encodingType instanceof UTF8Encoding) return "UTF8";
                if (encodingType instanceof UTF16LEEncoding) return "UTF16LE";
                if (encodingType instanceof UCS2Encoding) return "UCS2";
                if (encodingType instanceof Base64Encoding) return "Base64";
                if (encodingType instanceof Latin1Encoding) return "Latin1";
                if (encodingType instanceof BinaryEncoding) return "Binary";
                if (encodingType instanceof HexEncoding) return "Hex";
                throw new Error(
                  "Failed pattern match at Node.Encoding (line 19, column 1 - line 19, column 39): " +
                    [encodingType.constructor.name]
                );
              });
            nodeEncoding.ASCII = ASCIIEncoding;
            nodeEncoding.UTF8 = UTF8Encoding;
            nodeEncoding.UTF16LE = UTF16LEEncoding;
            nodeEncoding.UCS2 = UCS2Encoding;
            nodeEncoding.Base64 = Base64Encoding;
            nodeEncoding.Latin1 = Latin1Encoding;
            nodeEncoding.Binary = BinaryEncoding;
            nodeEncoding.Hex = HexEncoding;
            nodeEncoding.encodingToNode = function (encodingType) {
              if (encodingType instanceof ASCIIEncoding) return "ascii";
              if (encodingType instanceof UTF8Encoding) return "utf8";
              if (encodingType instanceof UTF16LEEncoding) return "utf16le";
              if (encodingType instanceof UCS2Encoding) return "ucs2";
              if (encodingType instanceof Base64Encoding) return "base64";
              if (encodingType instanceof Latin1Encoding) return "latin1";
              if (encodingType instanceof BinaryEncoding) return "binary";
              if (encodingType instanceof HexEncoding) return "hex";
              throw new Error(
                "Failed pattern match at Node.Encoding (line 31, column 1 - line 31, column 37): " +
                  [encodingType.constructor.name]
              );
            };
            nodeEncoding.showEncoding = encodingShowInstance;
          })(packageExports),
          // Module: Node.Process (process global)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Node.Process"] =
              exportContainer["Node.Process"] || {}).process = process;
          })(packageExports),
          // Module: Node.Process
          (function (exportContainer) {
            "use strict";
            exportContainer["Node.Process"] =
              exportContainer["Node.Process"] || {};
            var nodeProcess = exportContainer["Node.Process"], // Alias for Node.Process
              nodeProcessReExport = exportContainer["Node.Process"], // Another alias for Node.Process
              stdoutStream = nodeProcessReExport.process.stdout,
              stdinStream = nodeProcessReExport.process.stdin;
            nodeProcess.stdin = stdinStream;
            nodeProcess.stdout = stdoutStream;
          })(packageExports),
          // Module: Node.Stream (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer["Node.Stream"] =
              exportContainer["Node.Stream"] || {};
            exportContainer["Node.Stream"].readChunkImpl = function (
              bufferHandler
            ) {
              return function (stringHandler) {
                return function (chunkData) {
                  if (chunkData instanceof Buffer) return bufferHandler(chunkData);
                  if ("string" == typeof chunkData) return stringHandler(chunkData);
                  throw new Error(
                    "Node.Stream.readChunkImpl: Unrecognised chunk type; expected String or Buffer, got: " +
                      chunkData
                  );
                };
              };
            };
            exportContainer["Node.Stream"].onDataEitherImpl = function (
              chunkParser
            ) {
              return function (streamObject) {
                return function (callbackAction) {
                  return function () {
                    streamObject.on("data", function (dataChunk) {
                      callbackAction(chunkParser(dataChunk))();
                    });
                  };
                };
              };
            };
            exportContainer["Node.Stream"].onEnd = function (streamObject) {
              return function (callbackAction) {
                return function () {
                  streamObject.on("end", callbackAction);
                };
              };
            };
            exportContainer["Node.Stream"].write = function (streamObject) {
              return function (dataChunk) {
                return function (encodingType) {
                  return function () {
                    return streamObject.write(dataChunk, null, encodingType);
                  };
                };
              };
            };
            exportContainer["Node.Stream"].writeStringImpl = function (
              streamObject
            ) {
              return function (encodingType) {
                return function (dataString) {
                  return function (callbackAction) {
                    return function () {
                      return streamObject.write(
                        dataString,
                        encodingType,
                        callbackAction
                      );
                    };
                  };
                };
              };
            };
          })(packageExports["Node.Stream"] || (packageExports["Node.Stream"] = {})),
          // Module: Effect.Exception (native implementations)
          (function (exportContainer) {
            "use strict";
            exportContainer["Effect.Exception"] =
              exportContainer["Effect.Exception"] || {};
            exportContainer["Effect.Exception"].error = function (message) {
              return new Error(message);
            };
            exportContainer["Effect.Exception"].throwException = function (
              exceptionObject
            ) {
              return function () {
                throw exceptionObject;
              };
            };
          })(packageExports["Effect.Exception"] || (packageExports["Effect.Exception"] = {})),
          // Module: Effect.Exception
          (function (exportContainer) {
            "use strict";
            exportContainer["Effect.Exception"] =
              exportContainer["Effect.Exception"] || {};
            var exceptionEffect = exportContainer["Effect.Exception"], // Alias for Effect.Exception
              exceptionReExport = exportContainer["Effect.Exception"]; // Another alias for Effect.Exception
            exceptionEffect.throw = function (message) {
              return exceptionReExport.throwException(
                exceptionReExport.error(message)
              );
            };
          })(packageExports),
          // Module: Node.Buffer (toStringImpl specific part)
          (function (exportContainer) {
            "use strict";
            (exportContainer["Node.Buffer"] =
              exportContainer["Node.Buffer"] || {}).toStringImpl = function (
              encodingString
            ) {
              return function (bufferObject) {
                return function () {
                  return bufferObject.toString(encodingString);
                };
              };
            };
          })(packageExports),
          // Module: Node.Buffer
          (function (exportContainer) {
            "use strict";
            exportContainer["Node.Buffer"] =
              exportContainer["Node.Buffer"] || {};
            var nodeBuffer = exportContainer["Node.Buffer"], // Alias for Node.Buffer
              nodeBufferReExport = exportContainer["Node.Buffer"], // Another alias for Node.Buffer
              nodeEncoding = exportContainer["Node.Encoding"]; // Alias for Node.Encoding
            nodeBuffer.toString = function (encodingType) {
              return nodeBufferReExport.toStringImpl(
                nodeEncoding.encodingToNode(encodingType)
              );
            };
          })(packageExports),
          // Module: Node.Stream
          (function (exportContainer) {
            "use strict";
            exportContainer["Node.Stream"] =
              exportContainer["Node.Stream"] || {};
            var nodeStream = exportContainer["Node.Stream"], // Alias for Node.Stream
              nodeStreamReExport = exportContainer["Node.Stream"], // Another alias for Node.Stream
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative
              bindControl = exportContainer["Control.Bind"], // Alias for Control.Bind
              eitherData = exportContainer["Data.Either"], // Alias for Data.Either
              showData = exportContainer["Data.Show"], // Alias for Data.Show
              effectCore = exportContainer.Effect, // Alias for Effect
              exceptionEffect = exportContainer["Effect.Exception"], // Alias for Effect.Exception
              nodeBuffer = exportContainer["Node.Buffer"], // Alias for Node.Buffer
              nodeEncoding = exportContainer["Node.Encoding"], // Alias for Node.Encoding
              chunkProcessor = nodeStreamReExport.readChunkImpl(
                eitherData.Left.create
              )(eitherData.Right.create),
              onDataEitherHandler = function (streamObject) {
                return function (callback) {
                  return nodeStreamReExport.onDataEitherImpl(chunkProcessor)(
                    streamObject
                  )(callback);
                };
              },
              onDataStringHandler = function (streamObject) {
                return function (callback) {
                  return onDataEitherHandler(streamObject)(
                    bindControl.composeKleisliFlipped(effectCore.bindEffect)(callback)(
                      function (eitherChunk) {
                        if (eitherChunk instanceof eitherData.Left)
                          return exceptionEffect.throw("Stream encoding should not be set");
                        if (eitherChunk instanceof eitherData.Right)
                          return applicativeControl.pure(effectCore.applicativeEffect)(
                            eitherChunk.value0
                          );
                        throw new Error(
                          "Failed pattern match at Node.Stream (line 94, column 5 - line 98, column 17): " +
                            [eitherChunk.constructor.name]
                        );
                      }
                    )
                  );
                };
              };
            nodeStream.onData = onDataStringHandler;
            nodeStream.onDataString = function (streamObject) {
              return function (encodingType) {
                return function (callback) {
                  return onDataStringHandler(streamObject)(
                    bindControl.composeKleisliFlipped(effectCore.bindEffect)(callback)(
                      nodeBuffer.toString(encodingType)
                    )
                  );
                };
              };
            };
            nodeStream.onDataEither = onDataEitherHandler;
            nodeStream.writeString = function (streamObject) {
              return function (encodingType) {
                return nodeStreamReExport.writeStringImpl(streamObject)(
                  showData.show(nodeEncoding.showEncoding)(encodingType)
                );
              };
            };
            nodeStream.onEnd = nodeStreamReExport.onEnd;
          })(packageExports),
          // Module: ABC100C (the main application logic)
          (function (exportContainer) {
            "use strict";
            exportContainer.ABC100C = exportContainer.ABC100C || {};
            var currentAppModule = exportContainer.ABC100C, // Alias for ABC100C module exports.
              applicativeControl = exportContainer["Control.Applicative"], // Alias for Control.Applicative module.
              binderControl = exportContainer["Control.Bind"], // Alias for Control.Bind module.
              categoryControl = exportContainer["Control.Category"], // Alias for Control.Category module.
              arrayData = exportContainer["Data.Array"], // Alias for Data.Array module.
              booleanData = exportContainer["Data.Boolean"], // Alias for Data.Boolean module.
              eitherData = exportContainer["Data.Either"], // Alias for Data.Either module.
              euclideanRingData = exportContainer["Data.EuclideanRing"], // Alias for Data.EuclideanRing module.
              foldableData = exportContainer["Data.Foldable"], // Alias for Data.Foldable module.
              functorData = exportContainer["Data.Functor"], // Alias for Data.Functor module.
              integerData = exportContainer["Data.Int"], // Alias for Data.Int module.
              maybeData = exportContainer["Data.Maybe"], // Alias for Data.Maybe module.
              monoidData = exportContainer["Data.Monoid"], // Alias for Data.Monoid module.
              showData = exportContainer["Data.Show"], // Alias for Data.Show module.
              stringUtilData = exportContainer["Data.String.Common"], // Alias for Data.String.Common module.
              tupleData = exportContainer["Data.Tuple"], // Alias for Data.Tuple module.
              unitData = exportContainer["Data.Unit"], // Alias for Data.Unit module.
              effectCore = exportContainer.Effect, // Alias for Effect module.
              asyncEffect = exportContainer["Effect.Aff"], // Alias for Effect.Aff module.
              effectClass = exportContainer["Effect.Class"], // Alias for Effect.Class module.
              mutableRef = exportContainer["Effect.Ref"], // Alias for Effect.Ref module.
              nodeEncoding = exportContainer["Node.Encoding"], // Alias for Node.Encoding module.
              nodeProcess = exportContainer["Node.Process"], // Alias for Node.Process module.
              nodeStream = exportContainer["Node.Stream"], // Alias for Node.Stream module.
              unsafePartialOps = exportContainer["Partial.Unsafe"], // Alias for Partial.Unsafe module.
              // Function to compute the total number of halving steps across an array of numbers.
              // Each number is repeatedly divided by 2 until it becomes odd, and the steps are counted.
              computeHalvingSum = function (inputArray) {
                return function (ignoredParameter) {
                  // The 'ignoredParameter' is a remnant of minification where a variable 'n' was reused.
                  return foldableData.foldl(foldableData.foldableArray)(function (
                    currentSum
                  ) {
                    return function (elementValue) {
                      var halvingCounter = 0; // Initialize counter for current element.

                      // Recursively counts the number of times a number can be halved until it's odd.
                      function performHalvingStep(
                        currentCount,
                        currentNumber
                      ) {
                        var tempCounter,
                          isFinished = !1; // Flag to control the loop.

                        if (integerData.odd(currentNumber))
                          return (isFinished = !0), currentCount; // If odd, stop and return count.
                        if (booleanData.otherwise)
                          return (
                            (tempCounter = currentCount + 1 | 0), // Increment count.
                            void (currentNumber = euclideanRingData.div(
                              euclideanRingData.euclideanRingInt
                            )(currentNumber)(2)) // Halve the number.
                          );
                        throw new Error(
                          "Failed pattern match at ABC100C (line 71, column 5 - line 73, column 37): " +
                            [
                              currentCount.constructor.name,
                              currentNumber.constructor.name,
                            ]
                        );
                      }

                      // Loop until the current number becomes odd.
                      for (; !isFinished; )
                        halvingCounter = performHalvingStep(
                          halvingCounter,
                          elementValue
                        );
                      return currentSum + halvingCounter | 0; // Add to total sum.
                    };
                  })(0)(inputArray);
                };
              },
              // Function to parse the raw input string, extract numbers, and apply the halving sum logic.
              parseAndProcessInput = function (rawInputString) {
                return eitherData.either(function (errorMessage) {
                  return unsafePartialOps.unsafeCrashWith(errorMessage); // Crash if parsing fails.
                })(categoryControl.identity(categoryControl.categoryFn))(
                  binderControl.bind(eitherData.bindEither)(
                    eitherData.note("Input parsing failed")(
                      (function () {
                        var trimmedInput = stringUtilData.trim(rawInputString),
                          splitLines = stringUtilData.split("\n")(trimmedInput);
                        // Expecting exactly two lines: the count N, and the array of A values.
                        if (2 === splitLines.length) {
                          var parsedNAndArray = binderControl.bind(maybeData.bindMaybe)(
                            integerData.fromString(splitLines[0])
                          )(function (nVal) {
                            var parsedArray = arrayData.mapMaybe(
                              integerData.fromString
                            )(stringUtilData.split(" ")(splitLines[1]));
                            return applicativeControl.pure(
                              maybeData.applicativeMaybe
                            )(new tupleData.Tuple(nVal, parsedArray));
                          });
                          return parsedNAndArray;
                        }
                        return maybeData.Nothing.value; // Return Nothing if input format is incorrect.
                      })()
                    )
                  )(function (parsedTuple) {
                    // Once parsed, compute the halving sum and format as a string.
                    return applicativeControl.pure(eitherData.applicativeEither)(
                      showData.show(showData.showInt)(
                        computeHalvingSum(parsedTuple.value1)(parsedTuple.value0)
                      ) + "\n"
                    );
                  })
                );
              },
              // Asynchronous Aff action to read all input from stdin.
              asyncInputProcessor = asyncEffect.makeAff(function (
                resolveAffAction
              ) {
                return function () {
                  // Create a mutable reference to accumulate input data.
                  var inputBufferRef = mutableRef.new("")();
                  // Attach a data listener to stdin.
                  nodeStream.onDataString(nodeProcess.stdin)(
                    nodeEncoding.UTF8.value
                  )(function (dataChunk) {
                    return function () {
                      var currentBuffer = mutableRef.read(inputBufferRef)();
                      return mutableRef.write(currentBuffer + dataChunk)(
                        inputBufferRef
                      )();
                    };
                  })();
                  // Attach an end listener to stdin to finalize processing.
                  nodeStream.onEnd(nodeProcess.stdin)(function () {
                    var finalInput = mutableRef.read(inputBufferRef)();
                    return resolveAffAction(
                      applicativeControl.pure(eitherData.applicativeEither)(finalInput)
                    )();
                  })();
                  // Return a no-op canceller, as input reading cannot be cancelled in this model.
                  return monoidData.mempty(asyncEffect.monoidCanceler);
                };
              }),
              // The main entry point of the application, orchestrating input, processing, and output.
              mainApplicationRunner = asyncEffect.launchAff_(
                binderControl.bind(asyncEffect.bindAff)(asyncInputProcessor)(
                  function (processedInputString) {
                    return binderControl.bind(asyncEffect.bindAff)(
                      applicativeControl.pure(asyncEffect.applicativeAff)(
                        parseAndProcessInput(processedInputString)
                      )
                    )(function (outputResultString) {
                      // Lift the Effect action to write the result to stdout.
                      return effectClass.liftEffect(asyncEffect.monadEffectAff)(
                        functorData.void(effectCore.functorEffect)(
                          nodeStream.writeString(nodeProcess.stdout)(
                            nodeEncoding.UTF8.value
                          )(outputResultString)(
                            applicativeControl.pure(effectCore.applicativeEffect)(
                              unitData.unit
                            )
                          )
                        )
                      );
                    });
                  }
                )
              );
            currentAppModule.main = mainApplicationRunner; // Export the main function.
            currentAppModule.solve = parseAndProcessInput; // Export the solve function.
          })(packageExports),
          packageExports.ABC100C.main(); // Immediately invoke the main function.
  },
  {},
  ["Focm"],
  null
);