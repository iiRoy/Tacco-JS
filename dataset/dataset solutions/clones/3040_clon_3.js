var moduleLoaderFn = function(
  moduleDefinitions,
  moduleInstanceCache,
  entryPoints,
  globalExportKey
) {
  var lastEncounteredError,
    parentLoaderReference =
      typeof parcelRequire === "function" && parcelRequire,
    nodeBuiltinRequireFn = typeof require === "function" && require;

  function resolveAndLoadModule(moduleId, suppressErrors) {
    if (moduleInstanceCache[moduleId]) {
      return moduleInstanceCache[moduleId].exports;
    }

    if (!moduleDefinitions[moduleId]) {
      var externalLoader =
        typeof parcelRequire === "function" && parcelRequire;
      if (!suppressErrors && externalLoader) {
        return externalLoader(moduleId, true);
      }
      if (parentLoaderReference) {
        return parentLoaderReference(moduleId, true);
      }
      if (nodeBuiltinRequireFn && typeof moduleId === "string") {
        return nodeBuiltinRequireFn(moduleId);
      }
      var moduleNotFoundError = new Error(
        "Cannot locate module '" + moduleId + "'"
      );
      moduleNotFoundError.code = "MODULE_NOT_FOUND";
      throw moduleNotFoundError;
    }

    moduleContextualRequire.resolve = function(dependencyPath) {
      return (
        moduleDefinitions[moduleId][1][dependencyPath] || dependencyPath
      );
    };
    moduleContextualRequire.cache = {};

    var currentModuleInstance = (moduleInstanceCache[moduleId] = new resolveAndLoadModule.Module(
      moduleId
    ));

    moduleDefinitions[moduleId][0].call(
      currentModuleInstance.exports,
      moduleContextualRequire,
      currentModuleInstance,
      currentModuleInstance.exports,
      this
    );

    return moduleInstanceCache[moduleId].exports;

    function moduleContextualRequire(dependencyId) {
      return resolveAndLoadModule(moduleContextualRequire.resolve(dependencyId));
    }
  }

  resolveAndLoadModule.isParcelRequire = true;

  resolveAndLoadModule.Module = function(id) {
    this.id = id;
    this.bundle = resolveAndLoadModule;
    this.exports = {};
  };

  resolveAndLoadModule.modules = moduleDefinitions;
  resolveAndLoadModule.cache = moduleInstanceCache;
  resolveAndLoadModule.parent = parentLoaderReference;

  resolveAndLoadModule.register = function(id, exportsContent) {
    moduleDefinitions[id] = [
      function(moduleExports, currentModule) {
        currentModule.exports = exportsContent;
      },
      {},
    ];
  };

  for (var entryIndex = 0; entryIndex < entryPoints.length; entryIndex++) {
    try {
      resolveAndLoadModule(entryPoints[entryIndex]);
    } catch (err) {
      if (!lastEncounteredError) {
        lastEncounteredError = err;
      }
    }
  }

  if (entryPoints.length > 0) {
    var finalExportedModule = resolveAndLoadModule(
      entryPoints[entryPoints.length - 1]
    );
    if (
      typeof exports === "object" &&
      typeof module !== "undefined" &&
      module.exports
    ) {
      module.exports = finalExportedModule;
    } else if (typeof define === "function" && define.amd) {
      define(function() {
        return finalExportedModule;
      });
    } else if (globalExportKey) {
      this[globalExportKey] = finalExportedModule;
    }
  }

  if (lastEncounteredError) {
    throw lastEncounteredError;
  }

  parcelRequire = resolveAndLoadModule;

  return resolveAndLoadModule;
}(
  {
    "AppEntry": [
      function(require, module, exports) {
        var globalExportsContainer = {};

        !function(moduleExportsHandle) {
          "use strict";
          var SemigroupoidConstructor = function(compositionFn) {
            this.compose = compositionFn;
          };
          var semigroupoidInstance = new SemigroupoidConstructor(function(f) {
            return function(g) {
              return function(x) {
                return f(g(x));
              };
            };
          });
          moduleExportsHandle.compose = function(s) {
            return s.compose;
          };
          moduleExportsHandle.Semigroupoid = SemigroupoidConstructor;
          moduleExportsHandle.semigroupoidFn = semigroupoidInstance;
        }(globalExportsContainer["Utils.Category.Semigroupoid"] =
          globalExportsContainer["Utils.Category.Semigroupoid"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var baseSemigroupoid = globalExportsContainer["Utils.Category.Semigroupoid"];
          var CategoryConstructor = function(sg, id) {
            this.Semigroupoid0 = sg;
            this.identity = id;
          };
          var categoryInstance = new CategoryConstructor(
            function() {
              return baseSemigroupoid.semigroupoidFn;
            },
            function(x) {
              return x;
            }
          );
          moduleExportsHandle.Category = CategoryConstructor;
          moduleExportsHandle.identity = function(c) {
            return c.identity;
          };
          moduleExportsHandle.categoryFn = categoryInstance;
        }(globalExportsContainer["Utils.Category.Main"] =
          globalExportsContainer["Utils.Category.Main"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["Data.Logic.Bool"] =
            globalExportsContainer["Data.Logic.Bool"] || {}).otherwise = true;
        }();

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["Utils.Category.Main"];
          globalExportsContainer["Data.Logic.Bool"];

          moduleExportsHandle.const = function(valueToReturn) {
            return function(ignoredArgument) {
              return valueToReturn;
            };
          };
        }(globalExportsContainer["Utils.Func.Core"] =
          globalExportsContainer["Utils.Func.Core"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["Utils.Category.Semigroupoid"];
          globalExportsContainer["Utils.Func.Core"];

          var FunctorTypeClass = function(mapFn) {
            this.map = mapFn;
          };

          moduleExportsHandle.Functor = FunctorTypeClass;
          moduleExportsHandle.map = function(functorInstance) {
            return functorInstance.map;
          };
        }(globalExportsContainer["TypeClasses.Functor"] =
          globalExportsContainer["TypeClasses.Functor"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["TypeClasses.Functor"];
          globalExportsContainer["Utils.Category.Main"];
          globalExportsContainer["Utils.Func.Core"];

          var ApplyTypeClass = function(functorBase, applicationFn) {
            this.Functor0 = functorBase;
            this.apply = applicationFn;
          };

          moduleExportsHandle.Apply = ApplyTypeClass;
          moduleExportsHandle.apply = function(applyInstance) {
            return applyInstance.apply;
          };
        }(globalExportsContainer["TypeClasses.Apply"] =
          globalExportsContainer["TypeClasses.Apply"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["TypeClasses.Apply"];
          globalExportsContainer["TypeClasses.Functor"];

          var ApplicativeTypeClass = function(applyBase, pureFn) {
            this.Apply0 = applyBase;
            this.pure = pureFn;
          };

          moduleExportsHandle.Applicative = ApplicativeTypeClass;
          moduleExportsHandle.pure = function(applicativeInstance) {
            return applicativeInstance.pure;
          };
        }(globalExportsContainer["TypeClasses.Applicative"] =
          globalExportsContainer["TypeClasses.Applicative"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["TypeClasses.Applicative"];
          globalExportsContainer["TypeClasses.Apply"];
          globalExportsContainer["Utils.Category.Main"];
          globalExportsContainer["Utils.Func.Core"];
          globalExportsContainer["TypeClasses.Functor"];

          var BindTypeClass = function(applyBase, bindFn) {
            this.Apply0 = applyBase;
            this.bind = bindFn;
          };

          moduleExportsHandle.Bind = BindTypeClass;
          moduleExportsHandle.bind = function(bindInstance) {
            return bindInstance.bind;
          };
        }(globalExportsContainer["TypeClasses.Bind"] =
          globalExportsContainer["TypeClasses.Bind"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["TypeClasses.Equality"] =
            globalExportsContainer["TypeClasses.Equality"] || {}).refEq = function(
            val1
          ) {
            return function(val2) {
              return val1 === val2;
            };
          };
        }();

        !function(moduleExportsHandle) {
          "use strict";
          var equalityHelpers = globalExportsContainer["TypeClasses.Equality"];

          var EqTypeClass = function(eqComparisonFn) {
            this.eq = eqComparisonFn;
          };
          var charEqInstance = new EqTypeClass(equalityHelpers.refEq);

          moduleExportsHandle.Eq = EqTypeClass;
          moduleExportsHandle.eq = function(eqInstance) {
            return eqInstance.eq;
          };
          moduleExportsHandle.eqChar = charEqInstance;
        }(globalExportsContainer["TypeClasses.Equality"] =
          globalExportsContainer["TypeClasses.Equality"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["TypeClasses.Display"] =
            globalExportsContainer["TypeClasses.Display"] || {}).showIntImpl = function(
            intVal
          ) {
            return intVal.toString();
          };
        }();

        !function(moduleExportsHandle) {
          "use strict";
          var displayHelpers = globalExportsContainer["TypeClasses.Display"];

          var ShowTypeClass = function(showFn) {
            this.show = showFn;
          };
          var intShowInstance = new ShowTypeClass(displayHelpers.showIntImpl);

          moduleExportsHandle.Show = ShowTypeClass;
          moduleExportsHandle.show = function(showInstance) {
            return showInstance.show;
          };
          moduleExportsHandle.showInt = intShowInstance;
        }(globalExportsContainer["TypeClasses.Display"] =
          globalExportsContainer["TypeClasses.Display"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["TypeClasses.Apply"];
          globalExportsContainer["TypeClasses.Bind"];
          globalExportsContainer["Utils.Func.Core"];
          globalExportsContainer["TypeClasses.Functor"];

          var NothingValue = (function() {
            function Nothing() {}
            Nothing.value = new Nothing();
            return Nothing;
          })();

          var JustConstructor = (function() {
            function Just(val) {
              this.payload = val;
            }
            Just.create = function(val) {
              return new Just(val);
            };
            return Just;
          })();

          var maybeCombinator = function(defaultValue) {
            return function(justFn) {
              return function(maybeVal) {
                if (maybeVal instanceof NothingValue) {
                  return defaultValue;
                }
                if (maybeVal instanceof JustConstructor) {
                  return justFn(maybeVal.payload);
                }
                throw new Error(
                  "Pattern match failure in Data.Optional.maybe: " +
                    [
                      defaultValue && defaultValue.constructor.name,
                      justFn && justFn.constructor.name,
                      maybeVal && maybeVal.constructor.name,
                    ].join(", ")
                );
              };
            };
          };

          var isNothingChecker = maybeCombinator(true)(
            globalExportsContainer["Utils.Func.Core"].const(false)
          );

          var maybeFunctor = new globalExportsContainer["TypeClasses.Functor"].Functor(
            function(transformFn) {
              return function(maybeVal) {
                return maybeVal instanceof JustConstructor
                  ? new JustConstructor(transformFn(maybeVal.payload))
                  : NothingValue.value;
              };
            }
          );

          var maybeApply = new globalExportsContainer["TypeClasses.Apply"].Apply(
            function() {
              return maybeFunctor;
            },
            function(maybeFn) {
              return function(maybeVal) {
                if (maybeFn instanceof JustConstructor) {
                  return globalExportsContainer["TypeClasses.Functor"].map(
                    maybeFunctor
                  )(maybeFn.payload)(maybeVal);
                }
                if (maybeFn instanceof NothingValue) {
                  return NothingValue.value;
                }
                throw new Error(
                  "Pattern match failure in Data.Optional.applyMaybe: " +
                    [
                      maybeFn && maybeFn.constructor.name,
                      maybeVal && maybeVal.constructor.name,
                    ].join(", ")
                );
              };
            }
          );

          var maybeBind = new globalExportsContainer["TypeClasses.Bind"].Bind(
            function() {
              return maybeApply;
            },
            function(maybeVal) {
              return function(bindFn) {
                if (maybeVal instanceof JustConstructor) {
                  return bindFn(maybeVal.payload);
                }
                if (maybeVal instanceof NothingValue) {
                  return NothingValue.value;
                }
                throw new Error(
                  "Pattern match failure in Data.Optional.bindMaybe: " +
                    [
                      maybeVal && maybeVal.constructor.name,
                      bindFn && bindFn.constructor.name,
                    ].join(", ")
                );
              };
            }
          );

          moduleExportsHandle.Nothing = NothingValue;
          moduleExportsHandle.Just = JustConstructor;
          moduleExportsHandle.maybe = maybeCombinator;
          moduleExportsHandle.isNothing = isNothingChecker;
          moduleExportsHandle.fromJust = function(maybeVal) {
            if (maybeVal instanceof JustConstructor) {
              return maybeVal.payload;
            }
            throw new Error(
              "Failed to extract value from Nothing in Data.Optional.fromJust."
            );
          };
          moduleExportsHandle.functorMaybe = maybeFunctor;
          moduleExportsHandle.applyMaybe = maybeApply;
          moduleExportsHandle.bindMaybe = maybeBind;
        }(globalExportsContainer["Data.Optional"] =
          globalExportsContainer["Data.Optional"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["TypeClasses.Applicative"];
          globalExportsContainer["TypeClasses.Apply"];
          globalExportsContainer["TypeClasses.Bind"];
          globalExportsContainer["TypeClasses.Functor"];
          globalExportsContainer["Data.Optional"];

          var LeftConstructor = (function() {
            function Left(val) {
              this.payload = val;
            }
            Left.create = function(val) {
              return new Left(val);
            };
            return Left;
          })();

          var RightConstructor = (function() {
            function Right(val) {
              this.payload = val;
            }
            Right.create = function(val) {
              return new Right(val);
            };
            return Right;
          })();

          var eitherFunctor = new globalExportsContainer["TypeClasses.Functor"].Functor(
            function(transformFn) {
              return function(eitherVal) {
                if (eitherVal instanceof LeftConstructor) {
                  return new LeftConstructor(eitherVal.payload);
                }
                if (eitherVal instanceof RightConstructor) {
                  return new RightConstructor(transformFn(eitherVal.payload));
                }
                throw new Error("Pattern match failure in Data.Result.functorEither.");
              };
            }
          );

          var eitherCombinator = function(leftFn) {
            return function(rightFn) {
              return function(eitherVal) {
                if (eitherVal instanceof LeftConstructor) {
                  return leftFn(eitherVal.payload);
                }
                if (eitherVal instanceof RightConstructor) {
                  return rightFn(eitherVal.payload);
                }
                throw new Error("Pattern match failure in Data.Result.either.");
              };
            };
          };

          var eitherApply = new globalExportsContainer["TypeClasses.Apply"].Apply(
            function() {
              return eitherFunctor;
            },
            function(eitherFn) {
              return function(eitherVal) {
                if (eitherFn instanceof LeftConstructor) {
                  return new LeftConstructor(eitherFn.payload);
                }
                if (eitherFn instanceof RightConstructor) {
                  return globalExportsContainer["TypeClasses.Functor"].map(
                    eitherFunctor
                  )(eitherFn.payload)(eitherVal);
                }
                throw new Error("Pattern match failure in Data.Result.applyEither.");
              };
            }
          );

          var eitherBind = new globalExportsContainer["TypeClasses.Bind"].Bind(
            function() {
              return eitherApply;
            },
            eitherCombinator(function(leftVal) {
              return function(ignoredFn) {
                return new LeftConstructor(leftVal);
              };
            })(function(rightVal) {
              return function(bindFn) {
                return bindFn(rightVal);
              };
            })
          );

          var eitherApplicative = new globalExportsContainer["TypeClasses.Applicative"].Applicative(
            function() {
              return eitherApply;
            },
            RightConstructor.create
          );

          moduleExportsHandle.Left = LeftConstructor;
          moduleExportsHandle.Right = RightConstructor;
          moduleExportsHandle.either = eitherCombinator;
          moduleExportsHandle.note = function(leftValue) {
            return globalExportsContainer["Data.Optional"].maybe(
              new LeftConstructor(leftValue)
            )(RightConstructor.create);
          };
          moduleExportsHandle.functorEither = eitherFunctor;
          moduleExportsHandle.applyEither = eitherApply;
          moduleExportsHandle.applicativeEither = eitherApplicative;
          moduleExportsHandle.bindEither = eitherBind;
        }(globalExportsContainer["Data.Result"] =
          globalExportsContainer["Data.Result"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["System.Unsafe.Partial"] =
            globalExportsContainer["System.Unsafe.Partial"] || {}).unsafePartial = function(
            thunk
          ) {
            return thunk();
          };
        }();

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["System.Partial"] =
            globalExportsContainer["System.Partial"] || {}).crashWith = function() {
            return function(errorMessage) {
              throw new Error(errorMessage);
            };
          };
        }();

        !function(moduleExportsHandle) {
          "use strict";
          var partialModule = globalExportsContainer["System.Partial"];
          moduleExportsHandle.crashWith = partialModule.crashWith;
        }(globalExportsContainer["System.Partial"] =
          globalExportsContainer["System.Partial"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var unsafePartialModule = globalExportsContainer["System.Unsafe.Partial"];
          var partialCrashModule = globalExportsContainer["System.Partial"];
          moduleExportsHandle.unsafeCrashWith = function(errorMessage) {
            return unsafePartialModule.unsafePartial(function(untypedVal) {
              return partialCrashModule.crashWith(untypedVal)(errorMessage);
            });
          };
        }(globalExportsContainer["System.Unsafe.Partial"] =
          globalExportsContainer["System.Unsafe.Partial"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["TypeClasses.Applicative"];
          globalExportsContainer["TypeClasses.Bind"];
          globalExportsContainer["Utils.Category.Semigroupoid"];
          globalExportsContainer["Data.Result"];
          globalExportsContainer["TypeClasses.Functor"];
          globalExportsContainer["Data.Optional"];
          globalExportsContainer["System.Unsafe.Partial"];

          var LoopConstructor = (function() {
            function Loop(val) {
              this.payload = val;
            }
            Loop.create = function(val) {
              return new Loop(val);
            };
            return Loop;
          })();

          var DoneConstructor = (function() {
            function Done(val) {
              this.payload = val;
            }
            Done.create = function(val) {
              return new Done(val);
            };
            return Done;
          })();

          moduleExportsHandle.tailRec = function(recursiveStepFn) {
            return function(initialValue) {
              var currentResult;
              var isDone = false;

              function processStep(stepInput) {
                if (!(stepInput instanceof LoopConstructor)) {
                  if (stepInput instanceof DoneConstructor) {
                    isDone = true;
                    return stepInput.payload;
                  }
                  throw new Error(
                    "Unexpected type in tailRec loop: " +
                      (stepInput && stepInput.constructor.name)
                  );
                }
                initialValue = recursiveStepFn(stepInput.payload);
                return initialValue;
              }

              currentResult = processStep(recursiveStepFn(initialValue));

              while (!isDone) {
                currentResult = processStep(currentResult);
              }
              return currentResult;
            };
          };

          moduleExportsHandle.Loop = LoopConstructor;
          moduleExportsHandle.Done = DoneConstructor;
        }(globalExportsContainer["Control.Monadic.Recursion"] =
          globalExportsContainer["Control.Monadic.Recursion"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          moduleExportsHandle.length = function(arr) {
            return arr.length;
          };

          moduleExportsHandle.indexImpl = function(justCreator) {
            return function(nothingValue) {
              return function(arr) {
                return function(idx) {
                  if (idx < 0 || idx >= arr.length) {
                    return nothingValue;
                  }
                  return justCreator(arr[idx]);
                };
              };
            };
          };

          moduleExportsHandle.filter = function(predicate) {
            return function(arr) {
              return arr.filter(predicate);
            };
          };

          moduleExportsHandle.slice = function(startIndex) {
            return function(endIndex) {
              return function(arr) {
                return arr.slice(startIndex, endIndex);
              };
            };
          };

          moduleExportsHandle.drop = function(count) {
            return function(arr) {
              return count < 1 ? arr : arr.slice(count);
            };
          };
        }(globalExportsContainer["Data.Collections.List"] =
          globalExportsContainer["Data.Collections.List"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var TupleConstructor = (function() {
            function Tuple(first, second) {
              this.firstValue = first;
              this.secondValue = second;
            }
            Tuple.create = function(first) {
              return function(second) {
                return new Tuple(first, second);
              };
            };
            return Tuple;
          })();

          moduleExportsHandle.Tuple = TupleConstructor;
        }(globalExportsContainer["Data.Pair"] =
          globalExportsContainer["Data.Pair"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["System.Unsafe.Cast"] =
            globalExportsContainer["System.Unsafe.Cast"] || {}).unsafeCoerce = function(
            val
          ) {
            return val;
          };
        }();

        !function(moduleExportsHandle) {
          "use strict";
          var unsafeCoerceModule = globalExportsContainer["System.Unsafe.Cast"];
          moduleExportsHandle.unsafeCoerce = unsafeCoerceModule.unsafeCoerce;
        }(globalExportsContainer["System.Unsafe.Cast"] =
          globalExportsContainer["System.Unsafe.Cast"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var arrayHelpers = globalExportsContainer["Data.Collections.List"];
          var optionalModule = globalExportsContainer["Data.Optional"];

          var safeIndex = arrayHelpers.indexImpl(optionalModule.Just.create)(
            optionalModule.Nothing.value
          );

          moduleExportsHandle.head = function(arr) {
            return safeIndex(arr)(0);
          };
          moduleExportsHandle.index = safeIndex;
          moduleExportsHandle.length = arrayHelpers.length;
          moduleExportsHandle.filter = arrayHelpers.filter;
          moduleExportsHandle.drop = arrayHelpers.drop;
        }(globalExportsContainer["Data.Collections.List"] =
          globalExportsContainer["Data.Collections.List"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["Data.Numeric.Integer"] =
            globalExportsContainer["Data.Numeric.Integer"] || {}).fromStringAsImpl = function(
            justCreator
          ) {
            return function(nothingValue) {
              return function(radix) {
                return function(inputString) {
                  if (radix < 2 || radix > 36) {
                    return nothingValue;
                  }

                  var validCharRegex;
                  if (radix < 11) {
                    validCharRegex = "[0-" + (radix - 1).toString() + "]";
                  } else if (radix === 11) {
                    validCharRegex = "[0-9a]";
                  } else {
                    validCharRegex =
                      "[0-9a-" + String.fromCharCode(86 + radix) + "]";
                  }

                  var fullStringRegex = new RegExp(
                    "^[\\+\\-]?" + validCharRegex + "+$",
                    "i"
                  );

                  if (fullStringRegex.test(inputString)) {
                    var parsedValue = parseInt(inputString, radix);
                    if ((0 | parsedValue) === parsedValue) {
                      return justCreator(parsedValue);
                    }
                  }
                  return nothingValue;
                };
              };
            };
          };
        }();

        !function(moduleExportsHandle) {
          "use strict";
          var intParsingHelpers = globalExportsContainer["Data.Numeric.Integer"];
          var optionalModule = globalExportsContainer["Data.Optional"];

          var genericIntParser = intParsingHelpers.fromStringAsImpl(
            optionalModule.Just.create
          )(optionalModule.Nothing.value);

          var decimalStringToInt = genericIntParser(10);

          moduleExportsHandle.fromString = decimalStringToInt;
          moduleExportsHandle.fromStringAs = genericIntParser;
        }(globalExportsContainer["Data.Numeric.Integer"] =
          globalExportsContainer["Data.Numeric.Integer"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          moduleExportsHandle.toCharArray = function(str) {
            return str.split("");
          };

          moduleExportsHandle.length = function(str) {
            return str.length;
          };

          moduleExportsHandle["_indexOf'"] = function(justCreator) {
            return function(nothingValue) {
              return function(searchChar) {
                return function(fromIndex) {
                  return function(targetString) {
                    if (fromIndex < 0 || fromIndex > targetString.length) {
                      return nothingValue;
                    }
                    var foundIndex = targetString.indexOf(searchChar, fromIndex);
                    return foundIndex === -1
                      ? nothingValue
                      : justCreator(foundIndex);
                  };
                };
              };
            };
          };

          moduleExportsHandle._slice = function(startIndex) {
            return function(endIndex) {
              return function(targetString) {
                return targetString.slice(startIndex, endIndex);
              };
            };
          };
        }(globalExportsContainer["Data.Text.CodeUnit"] =
          globalExportsContainer["Data.Text.CodeUnit"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var codeUnitHelpers = globalExportsContainer["Data.Text.CodeUnit"];
          var optionalModule = globalExportsContainer["Data.Optional"];
          var boolLogic = globalExportsContainer["Data.Logic.Bool"];

          var safeIndexOf = codeUnitHelpers["_indexOf'"](
            optionalModule.Just.create
          )(optionalModule.Nothing.value);
          moduleExportsHandle["indexOf'"] = safeIndexOf;

          moduleExportsHandle.slice = function(startIndex) {
            return function(endIndex) {
              return function(targetString) {
                var stringLength = codeUnitHelpers.length(targetString);

                var normalizeIndex = function(idx) {
                  return idx < 0 ? stringLength + idx : idx;
                };

                var normalizedEnd = normalizeIndex(endIndex);
                var normalizedStart = normalizeIndex(startIndex);

                if (
                  normalizedStart < 0 ||
                  normalizedStart >= stringLength ||
                  normalizedEnd < 0 ||
                  normalizedEnd > stringLength ||
                  normalizedStart > normalizedEnd
                ) {
                  return optionalModule.Nothing.value;
                }

                return new optionalModule.Just(
                  codeUnitHelpers._slice(startIndex)(endIndex)(targetString)
                );
              };
            };
          };

          moduleExportsHandle.toCharArray = codeUnitHelpers.toCharArray;
          moduleExportsHandle.length = codeUnitHelpers.length;
        }(globalExportsContainer["Data.Text.CodeUnit"] =
          globalExportsContainer["Data.Text.CodeUnit"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          moduleExportsHandle.split = function(separator) {
            return function(str) {
              return str.split(separator);
            };
          };

          moduleExportsHandle.trim = function(str) {
            return str.trim();
          };
        }(globalExportsContainer["Data.Text.Common"] =
          globalExportsContainer["Data.Text.Common"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var commonStringHelpers = globalExportsContainer["Data.Text.Common"];

          moduleExportsHandle.split = commonStringHelpers.split;
          moduleExportsHandle.trim = commonStringHelpers.trim;
        }(globalExportsContainer["Data.Text.Common"] =
          globalExportsContainer["Data.Text.Common"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var applicativeTypeClass = globalExportsContainer["TypeClasses.Applicative"];
          var bindTypeClass = globalExportsContainer["TypeClasses.Bind"];
          var categoryTypeClass = globalExportsContainer["Utils.Category.Main"];
          var monadicRec = globalExportsContainer["Control.Monadic.Recursion"];
          var arrayList = globalExportsContainer["Data.Collections.List"];
          var eitherResult = globalExportsContainer["Data.Result"];
          var equalityTypeClass = globalExportsContainer["TypeClasses.Equality"];
          var integerNumeric = globalExportsContainer["Data.Numeric.Integer"];
          var optionalData = globalExportsContainer["Data.Optional"];
          var showTypeClass = globalExportsContainer["TypeClasses.Display"];
          var codeUnitText = globalExportsContainer["Data.Text.CodeUnit"];
          var commonText = globalExportsContainer["Data.Text.Common"];
          var pairData = globalExportsContainer["Data.Pair"];
          var unsafePartial = globalExportsContainer["System.Unsafe.Partial"];

          moduleExportsHandle.solve = function(rawInput) {
            var crashOnLeft = unsafePartial.unsafeCrashWith;
            var identityFromCategory = categoryTypeClass.identity(
              categoryTypeClass.categoryFn
            );

            var processedResult = eitherResult.either(
              crashOnLeft
            )(
              identityFromCategory
            )(
              (function() {
                var lines = commonText.split("\n")(commonText.trim(rawInput));

                var bindN = bindTypeClass.bind(eitherResult.bindEither)(
                  eitherResult.note("Error: Could not parse N from input.")(
                    bindTypeClass.bind(optionalData.bindMaybe)(
                      arrayList.head(lines)
                    )(integerNumeric.fromString)
                  )
                );

                var bindS = function(nValue) {
                  return bindTypeClass.bind(eitherResult.bindEither)(
                    eitherResult.note("Error: Could not find string S in input.")(
                      arrayList.head(arrayList.drop(1)(lines))
                    )
                  );
                };

                return bindN(function(nValue) {
                  return bindS(nValue)(function(sValue) {
                    var finalCount = calculatePatternCount(sValue);
                    return applicativeTypeClass.pure(
                      eitherResult.applicativeEither
                    )(
                      showTypeClass.show(showTypeClass.showInt)(finalCount)
                    );
                  });
                });
              })()
            );
            return processedResult;
          };

          var calculatePatternCount = function(inputString) {
            var initialLoopState = new pairData.Tuple(0, 0);

            var recursiveStepLogic = function(currentLoopTuple) {
              var currentSearchPosition = currentLoopTuple.firstValue;
              var accumulatedCount = currentLoopTuple.secondValue;

              var patternIndexMaybe = codeUnitText["indexOf'"]("#.")(
                currentSearchPosition
              )(inputString);

              if (patternIndexMaybe instanceof optionalData.Nothing) {
                return new monadicRec.Done(accumulatedCount);
              }

              var patternFoundAtIndex = patternIndexMaybe.payload;
              var nextPatternSearchStart = patternFoundAtIndex + 2;
              var hasFurtherPattern = !optionalData.isNothing(
                codeUnitText["indexOf'"]("#.")(nextPatternSearchStart)(inputString)
              );

              if (!hasFurtherPattern) {
                return new monadicRec.Loop(
                  new pairData.Tuple(patternFoundAtIndex + 1, accumulatedCount + 1)
                );
              } else {
                var remainingStringMaybe = codeUnitText.slice(
                  patternFoundAtIndex + 1
                )(codeUnitText.length(inputString))(inputString);

                var dotsInRemainingString = 0;
                if (remainingStringMaybe instanceof optionalData.Just) {
                  var charArray = codeUnitText.toCharArray(
                    remainingStringMaybe.payload
                  );
                  var filteredDots = arrayList.filter(
                    equalityTypeClass.eq(equalityTypeClass.eqChar)(".")
                  )(charArray);
                  dotsInRemainingString = arrayList.length(filteredDots);
                } else {
                  console.warn("Unexpected: string slice operation returned Nothing for a valid range.");
                }

                return new monadicRec.Done(accumulatedCount + dotsInRemainingString);
              }
            };

            return monadicRec.tailRec(recursiveStepLogic)(initialLoopState);
          };
        }(globalExportsContainer["Solution.ProblemSolver"] =
          globalExportsContainer["Solution.ProblemSolver"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["System.IO.Console"] =
            globalExportsContainer["System.IO.Console"] || {}).log = function(
            message
          ) {
            return function() {
              console.log(message);
              return {};
            };
          };
        }();

        !function(moduleExportsHandle) {
          "use strict";
          var consoleIO = globalExportsContainer["System.IO.Console"];
          moduleExportsHandle.log = consoleIO.log;
        }(globalExportsContainer["System.IO.Console"] =
          globalExportsContainer["System.IO.Console"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          globalExportsContainer["TypeClasses.Display"];

          var ASCIIEncoding = (function() {
            function ASCII() {}
            ASCII.value = new ASCII();
            return ASCII;
          })();
          var UTF8Encoding = (function() {
            function UTF8() {}
            UTF8.value = new UTF8();
            return UTF8;
          })();
          var UTF16LEEncoding = (function() {
            function UTF16LE() {}
            UTF16LE.value = new UTF16LE();
            return UTF16LE;
          })();
          var UCS2Encoding = (function() {
            function UCS2() {}
            UCS2.value = new UCS2();
            return UCS2;
          })();
          var Base64Encoding = (function() {
            function Base64() {}
            Base64.value = new Base64();
            return Base64;
          })();
          var Latin1Encoding = (function() {
            function Latin1() {}
            Latin1.value = new Latin1();
            return Latin1;
          })();
          var BinaryEncoding = (function() {
            function Binary() {}
            Binary.value = new Binary();
            return Binary;
          })();
          var HexEncoding = (function() {
            function Hex() {}
            Hex.value = new Hex();
            return Hex;
          })();

          var encodingShowInstance = new globalExportsContainer["TypeClasses.Display"].Show(
            function(encodingType) {
              if (encodingType instanceof ASCIIEncoding) return "ascii";
              if (encodingType instanceof UTF8Encoding) return "utf8";
              if (encodingType instanceof UTF16LEEncoding) return "utf16le";
              if (encodingType instanceof UCS2Encoding) return "ucs2";
              if (encodingType instanceof Base64Encoding) return "base64";
              if (encodingType instanceof Latin1Encoding) return "latin1";
              if (encodingType instanceof BinaryEncoding) return "binary";
              if (encodingType instanceof HexEncoding) return "hex";
              throw new Error(
                "Unsupported encoding type for display: " + encodingType.constructor.name
              );
            }
          );

          moduleExportsHandle.ASCII = ASCIIEncoding;
          moduleExportsHandle.UTF8 = UTF8Encoding;
          moduleExportsHandle.UTF16LE = UTF16LEEncoding;
          moduleExportsHandle.UCS2 = UCS2Encoding;
          moduleExportsHandle.Base64 = Base64Encoding;
          moduleExportsHandle.Latin1 = Latin1Encoding;
          moduleExportsHandle.Binary = BinaryEncoding;
          moduleExportsHandle.Hex = HexEncoding;
          moduleExportsHandle.showEncoding = encodingShowInstance;
        }(globalExportsContainer["Node.IO.Encoding"] =
          globalExportsContainer["Node.IO.Encoding"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          (globalExportsContainer["Node.IO.FileSystem.Internal"] =
            globalExportsContainer["Node.IO.FileSystem.Internal"] || {}).unsafeRequireFS = require(
            "fs"
          );
        }();

        !function(moduleExportsHandle) {
          "use strict";
          var fsInternal = globalExportsContainer["Node.IO.FileSystem.Internal"];
          var unsafeCast = globalExportsContainer["System.Unsafe.Cast"];

          moduleExportsHandle.mkEffect = unsafeCast.unsafeCoerce;
          moduleExportsHandle.unsafeRequireFS = fsInternal.unsafeRequireFS;
        }(globalExportsContainer["Node.IO.FileSystem.Internal"] =
          globalExportsContainer["Node.IO.FileSystem.Internal"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var displayTypeClass = globalExportsContainer["TypeClasses.Display"];
          var encodingModule = globalExportsContainer["Node.IO.Encoding"];
          var fsInternalModule = globalExportsContainer["Node.IO.FileSystem.Internal"];

          var nodeFs = fsInternalModule.unsafeRequireFS;

          moduleExportsHandle.readTextFile = function(encoding) {
            return function(filePath) {
              return fsInternalModule.mkEffect(function() {
                var options = {
                  encoding: displayTypeClass.show(encodingModule.showEncoding)(
                    encoding
                  ),
                };
                return nodeFs.readFileSync(filePath, options);
              });
            };
          };
        }(globalExportsContainer["Node.IO.FileSystem.Sync"] =
          globalExportsContainer["Node.IO.FileSystem.Sync"] || {});

        !function(moduleExportsHandle) {
          "use strict";
          var problemSolver = globalExportsContainer["Solution.ProblemSolver"];
          var consoleLogger = globalExportsContainer["System.IO.Console"];
          var encodingTypes = globalExportsContainer["Node.IO.Encoding"];
          var fileSystemSync = globalExportsContainer["Node.IO.FileSystem.Sync"];

          moduleExportsHandle.main = function() {
            var fileContentEffect = fileSystemSync.readTextFile(
              encodingTypes.UTF8.value
            )("/dev/stdin");
            var rawInputString = fileContentEffect();

            var solutionOutput = problemSolver.solve(rawInputString);

            return consoleLogger.log(solutionOutput)();
          };
        }(globalExportsContainer["Application.Main"] =
          globalExportsContainer["Application.Main"] || {});

        globalExportsContainer["Application.Main"].main();
      },
      {},
    ],
  },
  {},
  ["AppEntry"],
  null
);