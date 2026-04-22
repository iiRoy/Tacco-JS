var moduleLoader = function(moduleDefinitions, moduleCache, entryPoints, exportName) {
  // Declare variables for internal use
  var firstError, oldLoader = typeof parcelRequire === "function" && parcelRequire,
    nodeRequire = typeof require === "function" && require;

  // Main function to load a module by its ID
  function loadModule(moduleId, requireUncached) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If module definition is not found
    if (!moduleDefinitions[moduleId]) {
      var currentLoader = typeof parcelRequire === "function" && parcelRequire;
      // Try to load from current loader or old loader if available
      if (!requireUncached && currentLoader) return currentLoader(moduleId, true);
      if (oldLoader) return oldLoader(moduleId, true);
      // Try Node.js require if available
      if (nodeRequire && typeof moduleId === "string") return nodeRequire(moduleId);

      // If module still not found, throw an error
      var moduleNotFoundErr = new Error("Cannot locate module by ID '" + moduleId + "'");
      throw moduleNotFoundErr.code = "MODULE_NOT_FOUND", moduleNotFoundErr;
    }

    // Prepare a local require function for the module
    var localRequire = function(dependencyId) {
      return loadModule(localRequire.resolve(dependencyId));
    };
    // Resolve dependency path for the current module
    localRequire.resolve = function(dependencyId) {
      return moduleDefinitions[moduleId][1][dependencyId] || dependencyId;
    };
    // Initialize a blank cache for localRequire (not strictly used in this structure)
    localRequire.cache = {};

    // Create a new module instance and add it to cache
    var currentModule = moduleCache[moduleId] = new loadModule.Module(moduleId);
    // Execute the module's definition function, populating its exports
    moduleDefinitions[moduleId][0].call(currentModule.exports, localRequire, currentModule, currentModule.exports, this);

    // Return the module's exports
    return moduleCache[moduleId].exports;
  }

  // Mark this loader as a Parcel-style loader
  loadModule.isParcelRequire = true;
  // Define the Module constructor
  loadModule.Module = function(moduleId) {
    this.id = moduleId;
    this.bundle = loadModule;
    this.exports = {};
  };
  // Store module definitions and cache on the loader
  loadModule.modules = moduleDefinitions;
  loadModule.cache = moduleCache;
  loadModule.parent = oldLoader; // Keep track of the previous loader
  // Function to register new modules
  loadModule.register = function(moduleId, exportsObject) {
    moduleDefinitions[moduleId] = [function(moduleLocalRequire, moduleInstance) {
      moduleInstance.exports = exportsObject;
    }, {}];
  };

  // Iterate through entry points and try to load them
  for (var idx = 0; idx < entryPoints.length; idx++) {
    try {
      loadModule(entryPoints[idx]);
    } catch (err) {
      // Store the first error encountered
      firstError || (firstError = err);
    }
  }

  // If there are entry points, get the last one's exports
  if (entryPoints.length) {
    var finalExport = loadModule(entryPoints[entryPoints.length - 1]);
    // Handle different export environments (CommonJS, AMD, global)
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = finalExport;
    } else if (typeof define === "function" && define.amd) {
      define(function() {
        return finalExport;
      });
    } else if (exportName) {
      this[exportName] = finalExport;
    }
  }

  // Update global parcelRequire reference and re-throw any caught error
  if (parcelRequire = loadModule, firstError) throw firstError;
  return loadModule;
}({
  "Focm": [function(localRequire, moduleInstance, moduleExports) {
    // This object will hold the PureScript runtime and compiled modules
    var purescriptRuntime = {};

    // --- Start PureScript Runtime Emulation ---

    // Control.Apply
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Control.Apply"] = runtimeRef["Control.Apply"] || {}).applyArrayElements = function(fArray) {
        return function(valArray) {
          var fLen = fArray.length,
            vLen = valArray.length,
            resultArr = new Array(fLen * vLen),
            resIdx = 0;
          for (var fIdx = 0; fIdx < fLen; fIdx++) {
            var currentFunc = fArray[fIdx];
            for (var vIdx = 0; vIdx < vLen; vIdx++) {
              resultArr[resIdx++] = currentFunc(valArray[vIdx]);
            }
          }
          return resultArr;
        };
      };
    }(purescriptRuntime);

    // Control.Semigroupoid
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Semigroupoid"] = runtimeRef["Control.Semigroupoid"] || {};
      var semigroupoidModule = runtimeRef["Control.Semigroupoid"],
        CompositionWrapper = function(composeFn) {
          this.compose = composeFn;
        },
        functionCompositionInstance = new CompositionWrapper(function(f) {
          return function(g) {
            return function(x) {
              return f(g(x));
            };
          };
        });
      semigroupoidModule.compose = function(wrapper) {
        return wrapper.compose;
      };
      semigroupoidModule.CompositionWrapper = CompositionWrapper;
      semigroupoidModule.functionCompositionInstance = functionCompositionInstance;
    }(purescriptRuntime);

    // Control.Category
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Category"] = runtimeRef["Control.Category"] || {};
      var categoryModule = runtimeRef["Control.Category"],
        semigroupoidModule = runtimeRef["Control.Semigroupoid"],
        CategoryType = function(semigroupoidInst, identityFn) {
          this.Semigroupoid0 = semigroupoidInst;
          this.identity = identityFn;
        },
        functionCategoryInstance = new CategoryType(function() {
          return semigroupoidModule.functionCompositionInstance;
        }, function(x) {
          return x;
        });
      categoryModule.CategoryType = CategoryType;
      categoryModule.identity = function(inst) {
        return inst.identity;
      };
      categoryModule.functionCategoryInstance = functionCategoryInstance;
    }(purescriptRuntime);

    // Data.Function
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Function"] = runtimeRef["Data.Function"] || {};
      var functionalUtils = runtimeRef["Data.Function"];
      functionalUtils.reverseArgs = function(fn) {
        return function(arg1) {
          return function(arg2) {
            return fn(arg2)(arg1);
          };
        };
      };
      functionalUtils.constantValue = function(val) {
        return function(ignore) {
          return val;
        };
      };
    }(purescriptRuntime);

    // Data.Functor
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.Functor"] = runtimeRef["Data.Functor"] || {}).transformArray = function(transformFn) {
        return function(inputArray) {
          for (var i = 0, len = inputArray.length, result = new Array(len); i < len; i++) {
            result[i] = transformFn(inputArray[i]);
          }
          return result;
        };
      };
    }(purescriptRuntime);

    // Data.Unit
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.Unit"] = runtimeRef["Data.Unit"] || {}).voidValue = {};
    }(purescriptRuntime);

    // Data.Unit (re-export)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Unit"] = runtimeRef["Data.Unit"] || {};
      var unitModule = runtimeRef["Data.Unit"],
        unitReExport = runtimeRef["Data.Unit"];
      unitModule.voidValue = unitReExport.voidValue;
    }(purescriptRuntime);

    // Data.Functor (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Functor"] = runtimeRef["Data.Functor"] || {};
      var functorModule = runtimeRef["Data.Functor"],
        functorReExport = runtimeRef["Data.Functor"],
        functionalUtils = runtimeRef["Data.Function"],
        unitModule = runtimeRef["Data.Unit"],
        FunctorType = function(mapFn) {
          this.map = mapFn;
        },
        mapFunction = function(inst) {
          return inst.map;
        },
        arrayFunctorInstance = new FunctorType(functorReExport.transformArray);
      functorModule.FunctorType = FunctorType;
      functorModule.mapFunction = mapFunction;
      functorModule.mapToVoid = function(inst) {
        return mapFunction(inst)(functionalUtils.constantValue(unitModule.voidValue));
      };
      functorModule.arrayFunctorInstance = arrayFunctorInstance;
    }(purescriptRuntime);

    // Control.Apply (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Apply"] = runtimeRef["Control.Apply"] || {};
      var applyModule = runtimeRef["Control.Apply"],
        applyReExport = runtimeRef["Control.Apply"],
        categoryModule = runtimeRef["Control.Category"],
        functionalUtils = runtimeRef["Data.Function"],
        functorModule = runtimeRef["Data.Functor"],
        ApplyType = function(functorInst, applyFn) {
          this.Functor0 = functorInst;
          this.apply = applyFn;
        },
        arrayApplyInstance = new ApplyType(function() {
          return functorModule.arrayFunctorInstance;
        }, applyReExport.applyArrayElements),
        applyOp = function(inst) {
          return inst.apply;
        };
      applyModule.ApplyType = ApplyType;
      applyModule.applyOp = applyOp;
      applyModule.applySecondArg = function(inst) {
        return function(secondApply) {
          return function(firstApply) {
            return applyOp(inst)(functorModule.mapFunction(inst.Functor0())(functionalUtils.constantValue(categoryModule.identity(categoryModule.functionCategoryInstance)))(secondApply))(firstApply);
          };
        };
      };
      applyModule.arrayApplyInstance = arrayApplyInstance;
    }(purescriptRuntime);

    // Control.Applicative
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Applicative"] = runtimeRef["Control.Applicative"] || {};
      var applicativeModule = runtimeRef["Control.Applicative"],
        applyModule = runtimeRef["Control.Apply"],
        pureValue = function(inst) {
          return inst.pure;
        };
      applicativeModule.ApplicativeType = function(applyInst, pureFn) {
        this.Apply0 = applyInst;
        this.pure = pureFn;
      };
      applicativeModule.pureValue = pureValue;
      applicativeModule.liftAOne = function(inst) {
        return function(f) {
          return function(x) {
            return applyModule.applyOp(inst.Apply0())(pureValue(inst)(f))(x);
          };
        };
      };
    }(purescriptRuntime);

    // Control.Bind
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Control.Bind"] = runtimeRef["Control.Bind"] || {}).flatmapArray = function(arr) {
        return function(mapFunc) {
          for (var result = [], i = 0, len = arr.length; i < len; i++) {
            Array.prototype.push.apply(result, mapFunc(arr[i]));
          }
          return result;
        };
      };
    }(purescriptRuntime);

    // Control.Bind (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Bind"] = runtimeRef["Control.Bind"] || {};
      var bindModule = runtimeRef["Control.Bind"],
        bindReExport = runtimeRef["Control.Bind"],
        applyModule = runtimeRef["Control.Apply"],
        functionalUtils = runtimeRef["Data.Function"],
        BindType = function(applyInst, bindFn) {
          this.Apply0 = applyInst;
          this.bind = bindFn;
        },
        arrayBindInstance = new BindType(function() {
          return applyModule.arrayApplyInstance;
        }, bindReExport.flatmapArray),
        bindOp = function(inst) {
          return inst.bind;
        },
        flippedBind = function(inst) {
          return functionalUtils.reverseArgs(bindOp(inst));
        };
      bindModule.BindType = BindType;
      bindModule.bindOp = bindOp;
      bindModule.flippedBind = flippedBind;
      bindModule.flippedKleisliComposition = function(inst) {
        return function(f) {
          return function(g) {
            return function(x) {
              return flippedBind(inst)(f)(g(x));
            };
          };
        };
      };
      bindModule.arrayBindInstance = arrayBindInstance;
    }(purescriptRuntime);

    // Control.Monad.Rec.Class
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Monad.Rec.Class"] = runtimeRef["Control.Monad.Rec.Class"] || {};
      var recMonadModule = runtimeRef["Control.Monad.Rec.Class"],
        LoopState = function() {
          function StateLoop(val) {
            this.value0 = val;
          }
          return StateLoop.create = function(val) {
            return new StateLoop(val);
          }, StateLoop;
        }(),
        DoneState = function() {
          function StateDone(val) {
            this.value0 = val;
          }
          return StateDone.create = function(val) {
            return new StateDone(val);
          }, StateDone;
        }();
      recMonadModule.LoopState = LoopState;
      recMonadModule.DoneState = DoneState;
      recMonadModule.performTailRecursion = function(stepFunc) {
        return function(initialVal) {
          return function(arg) {
            var currentResult, isDone = false;

            function processStep(res) {
              if (!(res instanceof LoopState)) {
                if (res instanceof DoneState) return isDone = true, res.value0;
                throw new Error("Pattern match failure in performTailRecursion: " + [res.constructor.name]);
              }
              arg = stepFunc(res.value0);
            }
            for (; !isDone;) currentResult = processStep(arg);
            return currentResult;
          }(stepFunc(initialVal));
        };
      };
    }(purescriptRuntime);

    // Data.Array
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Array"] = runtimeRef["Data.Array"] || {};
      runtimeRef["Data.Array"].getLength = function(arr) {
        return arr.length;
      };
      runtimeRef["Data.Array"].peekAndRemove = function(onEmpty) {
        return function(onNonEmpty) {
          return function(arr) {
            return arr.length === 0 ? onEmpty({}) : onNonEmpty(arr[0])(arr.slice(1));
          };
        };
      };
      runtimeRef["Data.Array"].accessElement = function(onFound) {
        return function(onNotFound) {
          return function(arr) {
            return function(idx) {
              return idx < 0 || idx >= arr.length ? onNotFound : onFound(arr[idx]);
            };
          };
        };
      };
      runtimeRef["Data.Array"].getSubList = function(start) {
        return function(end) {
          return function(arr) {
            return arr.slice(start, end);
          };
        };
      };
    }(purescriptRuntime["Data.Array"] = purescriptRuntime["Data.Array"] || {});

    // Data.Maybe
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Maybe"] = runtimeRef["Data.Maybe"] || {};
      var maybeModule = runtimeRef["Data.Maybe"],
        NoValue = function() {
          function ValueNothing() {}
          return ValueNothing.value = new ValueNothing(), ValueNothing;
        }(),
        SomeValue = function() {
          function ValueJust(val) {
            this.value0 = val;
          }
          return ValueJust.create = function(val) {
            return new ValueJust(val);
          }, ValueJust;
        }();
      maybeModule.NoValue = NoValue;
      maybeModule.SomeValue = SomeValue;
      maybeModule.handleOptional = function(onNothing) {
        return function(onJust) {
          return function(val) {
            if (val instanceof NoValue) return onNothing;
            if (val instanceof SomeValue) return onJust(val.value0);
            throw new Error("Pattern match failure in handleOptional: " + [onNothing.constructor.name, onJust.constructor.name, val.constructor.name]);
          };
        };
      };
    }(purescriptRuntime);

    // Data.Array (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Array"] = runtimeRef["Data.Array"] || {};
      var listOps = runtimeRef["Data.Array"],
        listReExport = runtimeRef["Data.Array"],
        bindModule = runtimeRef["Control.Bind"],
        functionalUtils = runtimeRef["Data.Function"],
        maybeModule = runtimeRef["Data.Maybe"],
        getHeadTail = listReExport.peekAndRemove(functionalUtils.constantValue(maybeModule.NoValue.value))(function(head) {
          return function(tail) {
            return new maybeModule.SomeValue({
              head: head,
              tail: tail
            });
          };
        }),
        createSingleton = function(val) {
          return [val];
        },
        safeIndex = listReExport.accessElement(maybeModule.SomeValue.create)(maybeModule.NoValue.value),
        flatmapList = functionalUtils.reverseArgs(bindModule.bindOp(bindModule.arrayBindInstance));
      listOps.createSingleton = createSingleton;
      listOps.getHeadTail = getHeadTail;
      listOps.safeIndex = safeIndex;
      listOps.flatmapList = flatmapList;
      listOps.filterMap = function(f) {
        return flatmapList(function(val) {
          return maybeModule.handleOptional([])(createSingleton)(f(val));
        });
      };
    }(purescriptRuntime);

    // Data.Bounded
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Bounded"] = runtimeRef["Data.Bounded"] || {};
      runtimeRef["Data.Bounded"].maxIntVal = 2147483647;
      runtimeRef["Data.Bounded"].minIntVal = -2147483648;
    }(purescriptRuntime["Data.Bounded"] = purescriptRuntime["Data.Bounded"] || {});

    // Data.Eq
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.Eq"] = runtimeRef["Data.Eq"] || {}).referenceEquality = function(a) {
        return function(b) {
          return a === b;
        };
      };
    }(purescriptRuntime);

    // Data.Eq (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Eq"] = runtimeRef["Data.Eq"] || {};
      var equalityModule = runtimeRef["Data.Eq"],
        EqualityType = function(eqFn) {
          this.eq = eqFn;
        },
        intEqualityInstance = new EqualityType(purescriptRuntime["Data.Eq"].referenceEquality);
      equalityModule.EqualityType = EqualityType;
      equalityModule.eq = function(inst) {
        return inst.eq;
      };
      equalityModule.integerEquality = intEqualityInstance;
    }(purescriptRuntime);

    // Data.Ord.Unsafe
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.Ord.Unsafe"] = runtimeRef["Data.Ord.Unsafe"] || {}).rawCompare = function(lt) {
        return function(eq) {
          return function(gt) {
            return function(a) {
              return function(b) {
                return a < b ? lt : a === b ? eq : gt;
              };
            };
          };
        };
      };
    }(purescriptRuntime);

    // Data.Ordering
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Ordering"] = runtimeRef["Data.Ordering"] || {};
      var comparisonModule = runtimeRef["Data.Ordering"],
        LessThan = function() {
          function OrderLT() {}
          return OrderLT.value = new OrderLT(), OrderLT;
        }(),
        GreaterThan = function() {
          function OrderGT() {}
          return OrderGT.value = new OrderGT(), OrderGT;
        }(),
        EqualTo = function() {
          function OrderEQ() {}
          return OrderEQ.value = new OrderEQ(), OrderEQ;
        }();
      comparisonModule.LessThan = LessThan;
      comparisonModule.GreaterThan = GreaterThan;
      comparisonModule.EqualTo = EqualTo;
    }(purescriptRuntime);

    // Data.Ord.Unsafe (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Ord.Unsafe"] = runtimeRef["Data.Ord.Unsafe"] || {};
      var unsafeOrderingModule = runtimeRef["Data.Ord.Unsafe"],
        unsafeOrderingReExport = runtimeRef["Data.Ord.Unsafe"],
        comparisonModule = runtimeRef["Data.Ordering"],
        unsafeCompareNumbers = unsafeOrderingReExport.rawCompare(comparisonModule.LessThan.value)(comparisonModule.EqualTo.value)(comparisonModule.GreaterThan.value);
      unsafeOrderingModule.unsafeCompareNumbers = unsafeCompareNumbers;
    }(purescriptRuntime);

    // Data.Ord
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Ord"] = runtimeRef["Data.Ord"] || {};
      var orderingModule = runtimeRef["Data.Ord"],
        equalityModule = runtimeRef["Data.Eq"],
        unsafeOrderingModule = runtimeRef["Data.Ord.Unsafe"],
        comparisonModule = runtimeRef["Data.Ordering"],
        OrderingType = function(eqInst, compareFn) {
          this.Eq0 = eqInst;
          this.compare = compareFn;
        },
        intOrderingInstance = new OrderingType(function() {
          return equalityModule.integerEquality;
        }, unsafeOrderingModule.unsafeCompareNumbers),
        compareOp = function(inst) {
          return inst.compare;
        };
      orderingModule.OrderingType = OrderingType;
      orderingModule.compareOp = compareOp;
      orderingModule.minimumValue = function(inst) {
        return function(a) {
          return function(b) {
            var res = compareOp(inst)(a)(b);
            if (res instanceof comparisonModule.LessThan) return a; // Corrected: should return 'a' if a < b
            if (res instanceof comparisonModule.EqualTo) return a;
            if (res instanceof comparisonModule.GreaterThan) return b;
            throw new Error("Pattern match failure in minimumValue: " + [res.constructor.name]);
          };
        };
      };
      orderingModule.integerOrdering = intOrderingInstance;
    }(purescriptRuntime);

    // Data.Bounded (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Bounded"] = runtimeRef["Data.Bounded"] || {};
      var boundedModule = runtimeRef["Data.Bounded"],
        boundedReExport = runtimeRef["Data.Bounded"],
        orderingModule = runtimeRef["Data.Ord"],
        BoundedType = function(ordInst, bottomVal, topVal) {
          this.Ord0 = ordInst;
          this.bottom = bottomVal;
          this.top = topVal;
        },
        intBoundedInstance = new BoundedType(function() {
          return orderingModule.integerOrdering;
        }, boundedReExport.minIntVal, boundedReExport.maxIntVal);
      boundedModule.BoundedType = BoundedType;
      boundedModule.bottom = function(inst) {
        return inst.bottom;
      };
      boundedModule.top = function(inst) {
        return inst.top;
      };
      boundedModule.intBoundedInstance = intBoundedInstance;
    }(purescriptRuntime);

    // Data.Either
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Either"] = runtimeRef["Data.Either"] || {};
      var choiceModule = runtimeRef["Data.Either"],
        applicativeModule = runtimeRef["Control.Applicative"],
        applyModule = runtimeRef["Control.Apply"],
        bindModule = runtimeRef["Control.Bind"],
        functorModule = runtimeRef["Data.Functor"],
        maybeModule = runtimeRef["Data.Maybe"],
        Failure = function() {
          function ChoiceLeft(val) {
            this.value0 = val;
          }
          return ChoiceLeft.create = function(val) {
            return new ChoiceLeft(val);
          }, ChoiceLeft;
        }(),
        Success = function() {
          function ChoiceRight(val) {
            this.value0 = val;
          }
          return ChoiceRight.create = function(val) {
            return new ChoiceRight(val);
          }, ChoiceRight;
        }(),
        choiceFunctor = new functorModule.FunctorType(function(f) {
          return function(choice) {
            if (choice instanceof Failure) return new Failure(choice.value0);
            if (choice instanceof Success) return new Success(f(choice.value0));
            throw new Error("Pattern match failure in choiceFunctor: " + [choice.constructor.name]);
          };
        }),
        processChoice = function(onLeft) {
          return function(onRight) {
            return function(choice) {
              if (choice instanceof Failure) return onLeft(choice.value0);
              if (choice instanceof Success) return onRight(choice.value0);
              throw new Error("Pattern match failure in processChoice: " + [onLeft.constructor.name, onRight.constructor.name, choice.constructor.name]);
            };
          };
        },
        choiceApply = new applyModule.ApplyType(function() {
          return choiceFunctor;
        }, function(fChoice) {
          return function(valChoice) {
            if (fChoice instanceof Failure) return new Failure(fChoice.value0);
            if (fChoice instanceof Success) return functorModule.mapFunction(choiceFunctor)(fChoice.value0)(valChoice);
            throw new Error("Pattern match failure in choiceApply: " + [fChoice.constructor.name, valChoice.constructor.name]);
          };
        }),
        choiceBind = new bindModule.BindType(function() {
          return choiceApply;
        }, processChoice(function(lVal) {
          return function(rVal) {
            return new Failure(lVal);
          };
        })(function(rVal) {
          return function(f) {
            return f(rVal);
          };
        })),
        choiceApplicative = new applicativeModule.ApplicativeType(function() {
          return choiceApply;
        }, Success.create);
      choiceModule.Failure = Failure;
      choiceModule.Success = Success;
      choiceModule.processChoice = processChoice;
      choiceModule.toChoice = function(errVal) {
        return maybeModule.handleOptional(new Failure(errVal))(Success.create);
      };
      choiceModule.choiceFunctor = choiceFunctor;
      choiceModule.choiceApply = choiceApply;
      choiceModule.choiceApplicative = choiceApplicative;
      choiceModule.choiceBind = choiceBind;
    }(purescriptRuntime);

    // Data.EuclideanRing
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.EuclideanRing"] = runtimeRef["Data.EuclideanRing"] || {};
      runtimeRef["Data.EuclideanRing"].integerDegree = function(n) {
        return Math.min(Math.abs(n), 2147483647);
      };
      runtimeRef["Data.EuclideanRing"].integerDivision = function(dividend) {
        return function(divisor) {
          return divisor === 0 ? 0 : divisor > 0 ? Math.floor(dividend / divisor) : -Math.floor(dividend / -divisor);
        };
      };
      runtimeRef["Data.EuclideanRing"].integerModulo = function(dividend) {
        return function(divisor) {
          if (divisor === 0) return 0;
          var absDivisor = Math.abs(divisor);
          return (dividend % absDivisor + absDivisor) % absDivisor;
        };
      };
    }(purescriptRuntime["Data.EuclideanRing"] = purescriptRuntime["Data.EuclideanRing"] || {});

    // Data.Ring
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.Ring"] = runtimeRef["Data.Ring"] || {}).integerSubtraction = function(a) {
        return function(b) {
          return a - b | 0;
        };
      };
    }(purescriptRuntime);

    // Data.Semiring
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Semiring"] = runtimeRef["Data.Semiring"] || {};
      runtimeRef["Data.Semiring"].integerAddition = function(a) {
        return function(b) {
          return a + b | 0;
        };
      };
      runtimeRef["Data.Semiring"].integerMultiplication = function(a) {
        return function(b) {
          return a * b | 0;
        };
      };
    }(purescriptRuntime["Data.Semiring"] = purescriptRuntime["Data.Semiring"] || {});

    // Data.Semiring (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Semiring"] = runtimeRef["Data.Semiring"] || {};
      var semiringModule = runtimeRef["Data.Semiring"],
        semiringReExport = runtimeRef["Data.Semiring"],
        SemiringType = function(addFn, mulFn, oneVal, zeroVal) {
          this.add = addFn;
          this.mul = mulFn;
          this.one = oneVal;
          this.zero = zeroVal;
        },
        intSemiringInstance = new SemiringType(semiringReExport.integerAddition, semiringReExport.integerMultiplication, 1, 0);
      semiringModule.SemiringType = SemiringType;
      semiringModule.add = function(inst) {
        return inst.add;
      };
      semiringModule.zero = function(inst) {
        return inst.zero;
      };
      semiringModule.mul = function(inst) {
        return inst.mul;
      };
      semiringModule.one = function(inst) {
        return inst.one;
      };
      semiringModule.intSemiringInstance = intSemiringInstance;
    }(purescriptRuntime);

    // Data.Ring (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Ring"] = runtimeRef["Data.Ring"] || {};
      var ringModule = runtimeRef["Data.Ring"],
        ringReExport = runtimeRef["Data.Ring"],
        semiringModule = runtimeRef["Data.Semiring"],
        RingType = function(semiringInst, subFn) {
          this.Semiring0 = semiringInst;
          this.sub = subFn;
        },
        intRingInstance = new RingType(function() {
          return semiringModule.intSemiringInstance;
        }, ringReExport.integerSubtraction);
      ringModule.RingType = RingType;
      ringModule.sub = function(inst) {
        return inst.sub;
      };
      ringModule.intRingInstance = intRingInstance;
    }(purescriptRuntime);

    // Data.CommutativeRing
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.CommutativeRing"] = runtimeRef["Data.CommutativeRing"] || {};
      var commutativeRingModule = runtimeRef["Data.CommutativeRing"],
        ringModule = runtimeRef["Data.Ring"],
        CommutativeRingType = function(ringInst) {
          this.Ring0 = ringInst;
        },
        intCommutativeRingInstance = new CommutativeRingType(function() {
          return ringModule.intRingInstance;
        });
      commutativeRingModule.CommutativeRingType = CommutativeRingType;
      commutativeRingModule.intCommutativeRingInstance = intCommutativeRingInstance;
    }(purescriptRuntime);

    // Data.EuclideanRing (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.EuclideanRing"] = runtimeRef["Data.EuclideanRing"] || {};
      var euclideanRingModule = runtimeRef["Data.EuclideanRing"],
        euclideanRingReExport = runtimeRef["Data.EuclideanRing"],
        commutativeRingModule = runtimeRef["Data.CommutativeRing"],
        EuclideanRingType = function(commutativeRingInst, degreeFn, divFn, modFn) {
          this.CommutativeRing0 = commutativeRingInst;
          this.degree = degreeFn;
          this.div = divFn;
          this.mod = modFn;
        },
        intEuclideanRingInstance = new EuclideanRingType(function() {
          return commutativeRingModule.intCommutativeRingInstance;
        }, euclideanRingReExport.integerDegree, euclideanRingReExport.integerDivision, euclideanRingReExport.integerModulo);
      euclideanRingModule.EuclideanRingType = EuclideanRingType;
      euclideanRingModule.degree = function(inst) {
        return inst.degree;
      };
      euclideanRingModule.div = function(inst) {
        return inst.div;
      };
      euclideanRingModule.mod = function(inst) {
        return inst.mod;
      };
      euclideanRingModule.intEuclideanRingInstance = intEuclideanRingInstance;
    }(purescriptRuntime);

    // Data.Int
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.Int"] = runtimeRef["Data.Int"] || {}).parseIntegerAsBase = function(onSuccess) {
        return function(onFailure) {
          return function(base) {
            return function(str) {
              // Construct regex for given base
              var regexCharSet;
              if (base < 11) {
                regexCharSet = "[0-" + (base - 1).toString() + "]";
              } else if (base === 11) {
                regexCharSet = "[0-9a]";
              } else {
                regexCharSet = "[0-9a-" + String.fromCharCode(86 + base) + "]";
              }
              var baseRegex = new RegExp("^[\\+\\-]?" + regexCharSet + "+$", "i");

              // If string matches regex, attempt parsing
              if (baseRegex.test(str)) {
                var parsedVal = parseInt(str, base);
                // Check if parsed value is a 32-bit integer
                return (0 | parsedVal) === parsedVal ? onSuccess(parsedVal) : onFailure;
              }
              return onFailure;
            };
          };
        };
      };
    }(purescriptRuntime);

    // Data.Int (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Int"] = runtimeRef["Data.Int"] || {};
      var integerModule = runtimeRef["Data.Int"],
        integerReExport = runtimeRef["Data.Int"],
        maybeModule = runtimeRef["Data.Maybe"],
        parseIntegerAsBase = integerReExport.parseIntegerAsBase(maybeModule.SomeValue.create)(maybeModule.NoValue.value),
        parseDecimalInteger = parseIntegerAsBase(10);
      integerModule.fromDecimalString = parseDecimalInteger;
      integerModule.fromBaseString = parseIntegerAsBase;
    }(purescriptRuntime);

    // Data.Monoid
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Monoid"] = runtimeRef["Data.Monoid"] || {};
      var monoidModule = runtimeRef["Data.Monoid"];
      monoidModule.Monoid = function(semigroupInst, emptyVal) {
        this.Semigroup0 = semigroupInst;
        this.emptyValue = emptyVal;
      };
      monoidModule.emptyValue = function(inst) {
        return inst.emptyValue;
      };
    }(purescriptRuntime);

    // Data.Show
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.Show"] = runtimeRef["Data.Show"] || {}).renderInteger = function(n) {
        return n.toString();
      };
    }(purescriptRuntime);

    // Data.Show (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Show"] = runtimeRef["Data.Show"] || {};
      var displayModule = runtimeRef["Data.Show"],
        ShowType = function(showFn) {
          this.show = showFn;
        },
        intShowInstance = new ShowType(purescriptRuntime["Data.Show"].renderInteger);
      displayModule.ShowType = ShowType;
      displayModule.show = function(inst) {
        return inst.show;
      };
      displayModule.intShowInstance = intShowInstance;
    }(purescriptRuntime);

    // Data.String.Common
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Data.String.Common"] = runtimeRef["Data.String.Common"] || {}).splitString = function(separator) {
        return function(str) {
          return str.split(separator);
        };
      };
      runtimeRef["Data.String.Common"].trimWhitespace = function(str) {
        return str.trim();
      };
    }(purescriptRuntime["Data.String.Common"] = purescriptRuntime["Data.String.Common"] || {});

    // Data.String.Common (re-export)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.String.Common"] = runtimeRef["Data.String.Common"] || {};
      var textModule = runtimeRef["Data.String.Common"],
        textReExport = runtimeRef["Data.String.Common"];
      textModule.splitString = textReExport.splitString;
      textModule.trimWhitespace = textReExport.trimWhitespace;
    }(purescriptRuntime);

    // Data.Tuple
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Tuple"] = runtimeRef["Data.Tuple"] || {};
      var pairModule = runtimeRef["Data.Tuple"],
        PairType = function() {
          function TuplePair(val0, val1) {
            this.value0 = val0;
            this.value1 = val1;
          }
          return TuplePair.create = function(val0) {
            return function(val1) {
              return new TuplePair(val0, val1);
            };
          }, TuplePair;
        }();
      pairModule.PairType = PairType;
    }(purescriptRuntime);

    // Effect
    !function(runtimeRef) {
      "use strict";
      runtimeRef.Effects = runtimeRef.Effects || {};
      runtimeRef.Effects.General = runtimeRef.Effects.General || {};
      runtimeRef.Effects.General.pureEffect = function(val) {
        return function() {
          return val;
        };
      };
      runtimeRef.Effects.General.bindEffect = function(eff) {
        return function(f) {
          return function() {
            return f(eff())();
          };
        };
      };
    }(purescriptRuntime.Effects = purescriptRuntime.Effects || {});

    // Effect (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef.Effects.General = runtimeRef.Effects.General || {};
      var effectCore = runtimeRef.Effects.General,
        effectCoreReExport = runtimeRef.Effects.General,
        applicativeModule = runtimeRef["Control.Applicative"],
        applyModule = runtimeRef["Control.Apply"],
        bindModule = runtimeRef["Control.Bind"],
        monadModule = runtimeRef["Control.Monad"],
        functorModule = runtimeRef["Data.Functor"],
        effectMonad = new monadModule.MonadClass(function() {
          return applicativeInstance;
        }, function() {
          return bindInstance;
        }),
        bindInstance = new bindModule.BindType(function() {
          return applyInstance;
        }, effectCoreReExport.bindEffect),
        applyInstance = new applyModule.ApplyType(function() {
          return functorInstance;
        }, monadModule.applyMonadic(effectMonad)),
        applicativeInstance = new applicativeModule.ApplicativeType(function() {
          return applyInstance;
        }, effectCoreReExport.pureEffect),
        functorInstance = new functorModule.FunctorType(applicativeModule.liftAOne(applicativeInstance));
      effectCore.functorInstance = functorInstance;
      effectCore.applyInstance = applyInstance;
      effectCore.applicativeInstance = applicativeInstance;
      effectCore.bindInstance = bindInstance;
      effectCore.effectMonad = effectMonad;
    }(purescriptRuntime);

    // Control.Monad
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Monad"] = runtimeRef["Control.Monad"] || {};
      var monadicModule = runtimeRef["Control.Monad"],
        applicativeModule = runtimeRef["Control.Applicative"],
        bindModule = runtimeRef["Control.Bind"];
      monadicModule.MonadClass = function(applicativeInst, bindInst) {
        this.Applicative0 = applicativeInst;
        this.Bind1 = bindInst;
      };
      monadicModule.applyMonadic = function(inst) {
        return function(f) {
          return function(x) {
            return bindModule.bindOp(inst.Bind1())(f)(function(fVal) {
              return bindModule.bindOp(inst.Bind1())(x)(function(xVal) {
                return applicativeModule.pureValue(inst.Applicative0())(fVal(xVal));
              });
            });
          };
        };
      };
    }(purescriptRuntime);

    // Effect.Aff
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Effects.Asynchronous"] = runtimeRef["Effects.Asynchronous"] || {};
      var asyncEffects = runtimeRef["Effects.Asynchronous"],
        asyncEffectsReExport = runtimeRef["Effects.Asynchronous"],
        applicativeModule = runtimeRef["Control.Applicative"],
        applyModule = runtimeRef["Control.Apply"],
        bindModule = runtimeRef["Control.Bind"],
        monadModule = runtimeRef["Control.Monad"],
        parallelModule = runtimeRef["Control.Parallel"],
        concurrencyClass = runtimeRef["Control.Parallel.Class"],
        choiceModule = runtimeRef["Data.Either"],
        foldableModule = runtimeRef["Data.Foldable"],
        functionalUtils = runtimeRef["Data.Function"],
        functorModule = runtimeRef["Data.Functor"],
        monoidModule = runtimeRef["Data.Monoid"],
        semigroupModule = runtimeRef["Data.Semigroup"],
        unitModule = runtimeRef["Data.Unit"],
        effectCore = runtimeRef.Effects.General,
        monadicClass = runtimeRef["Effects.MonadicClass"],
        unsafePartialModule = runtimeRef["Partial.Unsafe"],
        unsafeCastModule = runtimeRef["Unsafe.Coerce"],
        asyncRuntime = function() {
          var internalState = {},
            Pure = "Pure",
            Throw = "Throw",
            Catch = "Catch",
            Sync = "Sync",
            Async = "Async",
            Bind = "Bind",
            Bracket = "Bracket",
            Fork = "Fork",
            Sequential = "Sequential",
            Map = "Map",
            Apply = "Apply",
            Alt = "Alt",
            Cons = "Cons",
            Resume = "Resume",
            Release = "Release",
            Finalizer = "Finalizer",
            Finalized = "Finalized",
            Forked = "Forked";

          function AsyncEffectTag(tag, val1, val2, val3) {
            this.tag = tag;
            this._1 = val1;
            this._2 = val2;
            this._3 = val3;
          }

          function createEffectCtor(tag) {
            var ctor = function(val1, val2, val3) {
              return new AsyncEffectTag(tag, val1, val2, val3);
            };
            return ctor.tag = tag, ctor;
          }

          function PureEffect(val) {
            return new AsyncEffectTag(Pure, void 0);
          }

          function executeInNewTick(fn) {
            try {
              fn();
            } catch (err) {
              setTimeout(function() {
                throw err;
              }, 0);
            }
          }

          function runSyncEffect(onErr, onOk, effectFn) {
            try {
              return onOk(effectFn());
            } catch (err) {
              return onErr(err);
            }
          }

          function runAsyncEffect(onErr, asyncFn, cancelerFn) {
            try {
              return asyncFn(cancelerFn);
            } catch (err) {
              return cancelerFn(onErr(err))(), PureEffect;
            }
          }

          var scheduler = function() {
            var bufferSize = 1024,
              currentSize = 0,
              readIndex = 0,
              queue = new Array(bufferSize),
              isCurrentlyDraining = false;

            function drainQueue() {
              var task;
              for (isCurrentlyDraining = true; currentSize !== 0;) {
                currentSize--;
                task = queue[readIndex];
                queue[readIndex] = void 0;
                readIndex = (readIndex + 1) % bufferSize;
                task();
              }
              isCurrentlyDraining = false;
            }
            return {
              isDraining: function() {
                return isCurrentlyDraining;
              },
              enqueue: function(task) {
                var prevDraining;
                currentSize === bufferSize && (prevDraining = isCurrentlyDraining, drainQueue(), isCurrentlyDraining = prevDraining);
                queue[(readIndex + currentSize) % bufferSize] = task;
                currentSize++;
                isCurrentlyDraining || drainQueue();
              }
            };
          }();

          var STATUS_INITIAL = 0,
            STATUS_RUNNING = 1,
            STATUS_CONTINUE = 2,
            STATUS_BIND_STEP = 3,
            STATUS_ASYNC_WAIT = 4,
            STATUS_ERROR_STATE = 5,
            STATUS_DONE = 6;

          function Fiber(eitherInst, supervisor, initialEff) {
            var currentTickId = 0,
              fiberStatus = STATUS_INITIAL,
              currentEff = initialEff,
              errorValue = null,
              bindStack = null,
              bracketStack = null,
              finalizerStack = null,
              finalizerCount = 0,
              bracketCount = 0,
              killCallbacks = null,
              isJoining = true; // Renamed for clarity

            // Core loop for fiber execution
            function runFiberLoop(currentTick) {
              var nextEff, nextBindStack, nextFinalizerStack; // Renamed local vars
              for (;;) switch (nextEff = null, nextBindStack = null, nextFinalizerStack = null, fiberStatus) {
                case STATUS_CONTINUE:
                  fiberStatus = STATUS_RUNNING;
                  currentEff = bracketStack(currentEff);
                  null === finalizerStack ? bracketStack = null : (bracketStack = finalizerStack._1, finalizerStack = finalizerStack._2);
                  break;
                case STATUS_BIND_STEP:
                  eitherInst.isLeft(currentEff) ? (fiberStatus = STATUS_ERROR_STATE, errorValue = currentEff, currentEff = null) : null === bindStack ? fiberStatus = STATUS_ERROR_STATE : (fiberStatus = STATUS_CONTINUE, currentEff = eitherInst.fromRight(currentEff));
                  break;
                case STATUS_RUNNING:
                  switch (currentEff.tag) {
                    case Bind:
                      bindStack && (finalizerStack = new AsyncEffectTag(Cons, finalizerStack, bindStack)), bindStack = currentEff._2, fiberStatus = STATUS_RUNNING, currentEff = currentEff._1;
                      break;
                    case Pure:
                      null === bindStack ? (fiberStatus = STATUS_ERROR_STATE, currentEff = eitherInst.Success(currentEff._1)) : (fiberStatus = STATUS_CONTINUE, currentEff = currentEff._1);
                      break;
                    case Sync:
                      fiberStatus = STATUS_BIND_STEP, currentEff = runSyncEffect(eitherInst.Failure, eitherInst.Success, currentEff._1);
                      break;
                    case Async:
                      return fiberStatus = STATUS_ASYNC_WAIT, void(currentEff = runAsyncEffect(eitherInst.Failure, currentEff._1, function(cb) {
                        return function() {
                          currentTickId === currentTick && (currentTickId++, scheduler.enqueue(function() {
                            currentTickId === currentTick + 1 && (fiberStatus = STATUS_BIND_STEP, currentEff = cb, runFiberLoop(currentTickId));
                          }));
                        };
                      }));
                    case Throw:
                      fiberStatus = STATUS_ERROR_STATE, errorValue = eitherInst.Failure(currentEff._1), currentEff = null;
                      break;
                    case Catch:
                      finalizerStack = new AsyncEffectTag(Cons, currentEff, null === bindStack ? finalizerStack : new AsyncEffectTag(Cons, new AsyncEffectTag(Resume, bindStack, finalizerStack), finalizerStack, bracketStack), bracketStack), bindStack = null, finalizerStack = null, fiberStatus = STATUS_RUNNING, currentEff = currentEff._1;
                      break;
                    case Bracket:
                      bracketCount++, finalizerStack = new AsyncEffectTag(Cons, currentEff, null === bindStack ? finalizerStack : new AsyncEffectTag(Cons, new AsyncEffectTag(Resume, bindStack, finalizerStack), finalizerStack, bracketStack), bracketStack), bindStack = null, finalizerStack = null, fiberStatus = STATUS_RUNNING, currentEff = currentEff._1;
                      break;
                    case Fork:
                      fiberStatus = STATUS_BIND_STEP, nextEff = Fiber(eitherInst, supervisor, currentEff._2), supervisor && supervisor.register(nextEff), currentEff._1 && nextEff.run(), currentEff = eitherInst.Success(nextEff);
                      break;
                    case Sequential:
                      fiberStatus = STATUS_RUNNING, currentEff = runSequentialEffect(eitherInst, supervisor, currentEff._1);
                  }
                  break;
                case STATUS_ERROR_STATE:
                  if (bindStack = null, finalizerStack = null, null === finalizerStack) fiberStatus = STATUS_DONE, currentEff = bracketStack || errorValue || currentEff;
                  else switch (nextEff = finalizerStack._3, nextFinalizerStack = finalizerStack._1, finalizerStack = finalizerStack._2, nextFinalizerStack.tag) {
                    case Catch:
                      bracketStack && bracketStack !== nextEff ? fiberStatus = STATUS_ERROR_STATE : errorValue && (fiberStatus = STATUS_RUNNING, currentEff = nextFinalizerStack._2(eitherInst.fromLeft(errorValue)), errorValue = null);
                      break;
                    case Resume:
                      bracketStack && bracketStack !== nextEff || errorValue ? fiberStatus = STATUS_ERROR_STATE : (bindStack = nextFinalizerStack._1, finalizerStack = nextFinalizerStack._2, fiberStatus = STATUS_CONTINUE, currentEff = eitherInst.fromRight(currentEff));
                      break;
                    case Bracket:
                      bracketCount--, null === errorValue && (nextBindStack = eitherInst.fromRight(currentEff), finalizerStack = new AsyncEffectTag(Cons, new AsyncEffectTag(Release, nextFinalizerStack._2, nextBindStack), finalizerStack, nextEff), (bracketStack === nextEff || bracketCount > 0) && (fiberStatus = STATUS_RUNNING, currentEff = nextFinalizerStack._3(nextBindStack)));
                      break;
                    case Release:
                      bracketCount++, finalizerStack = new AsyncEffectTag(Cons, new AsyncEffectTag(Finalized, currentEff, errorValue), finalizerStack, bracketStack), fiberStatus = STATUS_RUNNING, currentEff = bracketStack && bracketStack !== nextEff ? nextFinalizerStack._1.killed(eitherInst.fromLeft(bracketStack))(nextFinalizerStack._2) : errorValue ? nextFinalizerStack._1.failed(eitherInst.fromLeft(errorValue))(nextFinalizerStack._2) : nextFinalizerStack._1.completed(eitherInst.fromRight(currentEff))(nextFinalizerStack._2), errorValue = null;
                      break;
                    case Finalizer:
                      bracketCount++, finalizerStack = new AsyncEffectTag(Cons, new AsyncEffectTag(Finalized, currentEff, errorValue), finalizerStack, bracketStack), fiberStatus = STATUS_RUNNING, currentEff = nextFinalizerStack._1;
                      break;
                    case Finalized:
                      bracketCount--, fiberStatus = STATUS_ERROR_STATE, currentEff = nextFinalizerStack._1, errorValue = nextFinalizerStack._2;
                  }
                  break;
                case STATUS_DONE:
                  for (var cbId in killCallbacks) killCallbacks.hasOwnProperty(cbId) && (isJoining = isJoining && killCallbacks[cbId].rethrow, executeInNewTick(killCallbacks[cbId].handler(currentEff)));
                  return killCallbacks = null, void(bracketStack && errorValue ? setTimeout(function() {
                    throw eitherInst.fromLeft(errorValue);
                  }, 0) : eitherInst.isLeft(currentEff) && isJoining && setTimeout(function() {
                    if (isJoining) throw eitherInst.fromLeft(currentEff);
                  }, 0));
                case STATUS_INITIAL:
                  fiberStatus = STATUS_RUNNING;
                  break;
                case STATUS_ASYNC_WAIT:
                  return;
              }
            }

            // Register a callback for fiber completion/errors
            function registerFiberCallback(callbackOptions) {
              return function() {
                if (fiberStatus === STATUS_DONE) return isJoining = isJoining && callbackOptions.rethrow, callbackOptions.handler(currentEff)(),
                  function() {};
                var cbId = bracketCount++; // Reuse bracketCount for unique ID
                return (killCallbacks = killCallbacks || {})[cbId] = callbackOptions,
                  function() {
                    null !== killCallbacks && delete killCallbacks[cbId];
                  };
              };
            }

            return {
              kill: function(err, onKilled) {
                return function() {
                  if (fiberStatus === STATUS_DONE) return onKilled(eitherInst.Success(void 0))(),
                    function() {};
                  var cleanup = registerFiberCallback({
                    rethrow: false,
                    handler: function() {
                      return onKilled(eitherInst.Success(void 0));
                    }
                  })();
                  switch (fiberStatus) {
                    case STATUS_INITIAL:
                      bracketStack = eitherInst.Failure(err), fiberStatus = STATUS_DONE, currentEff = bracketStack, runFiberLoop(currentTickId);
                      break;
                    case STATUS_ASYNC_WAIT:
                      null === bracketStack && (bracketStack = eitherInst.Failure(err)), finalizerCount === 0 && (fiberStatus === STATUS_ASYNC_WAIT && (finalizerStack = new AsyncEffectTag(Cons, new AsyncEffectTag(Finalizer, currentEff(err)), finalizerStack, bracketStack)), fiberStatus = STATUS_ERROR_STATE, currentEff = null, errorValue = null, runFiberLoop(++currentTickId));
                      break;
                    default:
                      null === bracketStack && (bracketStack = eitherInst.Failure(err)), finalizerCount === 0 && (fiberStatus = STATUS_ERROR_STATE, currentEff = null, errorValue = null);
                  }
                  return cleanup;
                };
              },
              onComplete: registerFiberCallback,
              isSuspended: function() {
                return fiberStatus === STATUS_INITIAL;
              },
              run: function() {
                fiberStatus === STATUS_INITIAL && (scheduler.isDraining() ? runFiberLoop(currentTickId) : scheduler.enqueue(function() {
                  runFiberLoop(currentTickId);
                }));
              }
            };
          }

          function runSequentialEffect(eitherInst, supervisor, parEffect) {
            var activeFibers = 0,
              fiberMap = {},
              nextFiberId = 0,
              errorOnKill = new Error("[ParAff] Early exit"),
              killError = null,
              eitherHelpers = eitherInst;

            function cleanupAndCallback(fiberRef, resultEither, callbackFn) {
              var currentFiber, nextFiber, nextCallbackStack = 0,
                callbackQueue = {},
                fiberStackDepth = 0,
                currentEffect = resultEither; // Renamed internal variable

              loopForCleanup: for (;;) switch (currentFiber = null, currentEffect.tag) {
                case Forked:
                  if (currentEffect._3 === undefined && (currentFiber = fiberMap[currentEffect._1], callbackQueue[fiberStackDepth++] = currentFiber.kill(errorOnKill, function(res) {
                      return function() {
                        0 === --fiberStackDepth && callbackFn(res)();
                      };
                    })), null === nextFiber) break loopForCleanup;
                  currentEffect = nextFiber._2, null === currentFiber ? nextFiber = null : (nextFiber = currentFiber._1, currentFiber = currentFiber._2);
                  break;
                case Map:
                  currentEffect = currentEffect._2;
                  break;
                case Apply:
                case Alt:
                  nextFiber && (currentFiber = new AsyncEffectTag(Cons, nextFiber, currentFiber)), nextFiber = currentEffect, currentEffect = currentEffect._1;
              }
              if (0 === fiberStackDepth) callbackFn(eitherInst.Success(void 0))();
              else
                for (currentCallbackStack = 0, currentFiber = fiberStackDepth; currentCallbackStack < currentFiber; currentCallbackStack++) callbackQueue[currentCallbackStack] = callbackQueue[currentCallbackStack]();
              return callbackQueue;
            }

            function fiberCompletionHandler(fiberId) {
              return function(fiberResult) {
                delete fiberMap[fiberId._1], fiberId._3 = fiberResult,
                  function propagateResults(result, currentEff, callbackStack) {
                    var leftRes, rightRes, currentVal, nextVal, nextCallback, isBlocking, callbackId; // Renamed internal variables
                    for (eitherInst.isLeft(result) ? (leftRes = result, rightRes = null) : (rightRes = result, leftRes = null);;) {
                      if (currentVal = null, nextVal = null, nextCallback = null, isBlocking = null, null !== killError) return;
                      if (null === currentEff) return void callbackStack(leftRes || rightRes)();
                      if (currentEff._3 !== undefined) return;
                      switch (currentEff.tag) {
                        case Map:
                          null === leftRes ? (currentEff._3 = eitherInst.Success(currentEff._1(eitherInst.fromRight(rightRes))), rightRes = currentEff._3) : currentEff._3 = leftRes;
                          break;
                        case Apply:
                          if (currentVal = currentEff._1._3, nextVal = currentEff._2._3, leftRes) {
                            if (currentEff._3 = leftRes, isBlocking = true, callbackId = nextFiberId++, fiberMap[callbackId] = cleanupAndCallback(errorOnKill, leftRes === currentVal ? currentEff._2 : currentEff._1, function() {
                                return function() {
                                  delete fiberMap[callbackId], isBlocking ? isBlocking = false : null === callbackStack ? propagateResults(leftRes, null, null) : propagateResults(leftRes, callbackStack._1, callbackStack._2);
                                };
                              }), isBlocking) return void(isBlocking = false);
                          } else {
                            if (currentVal === undefined || nextVal === undefined) return;
                            rightRes = eitherInst.Success(eitherInst.fromRight(currentVal)(eitherInst.fromRight(nextVal))), currentEff._3 = rightRes;
                          }
                          break;
                        case Alt:
                          if (currentVal = currentEff._1._3, nextVal = currentEff._2._3, currentVal === undefined && eitherInst.isLeft(nextVal) || nextVal === undefined && eitherInst.isLeft(currentVal)) return;
                          if (currentVal !== undefined && eitherInst.isLeft(currentVal) && nextVal !== undefined && eitherInst.isLeft(nextVal)) leftRes = rightRes === currentVal ? nextVal : currentVal, rightRes = null, currentEff._3 = leftRes;
                          else if (currentEff._3 = rightRes, isBlocking = true, callbackId = nextFiberId++, fiberMap[callbackId] = cleanupAndCallback(errorOnKill, rightRes === currentVal ? currentEff._2 : currentEff._1, function() {
                              return function() {
                                delete fiberMap[callbackId], isBlocking ? isBlocking = false : null === callbackStack ? propagateResults(rightRes, null, null) : propagateResults(rightRes, callbackStack._1, callbackStack._2);
                              };
                            }), isBlocking) return void(isBlocking = false);
                      }
                      null === callbackStack ? currentEff = null : (currentEff = callbackStack._1, callbackStack = callbackStack._2);
                    }
                  }(fiberResult, fiberId._2._1, fiberId._2._2);
              };
            }

            return function() {
              var currentStatus, currentEffect = parEffect,
                bindStack = null,
                callbackStack = null;
              loopForEffects: for (;;) switch (currentStatus = null, currentEffect.tag) {
                case Map:
                  bindStack && (callbackStack = new AsyncEffectTag(Cons, bindStack, callbackStack)), bindStack = new AsyncEffectTag(Map, currentEffect._1, undefined, undefined), currentEffect = currentEffect._2;
                  break;
                case Apply:
                  bindStack && (callbackStack = new AsyncEffectTag(Cons, bindStack, callbackStack)), bindStack = new AsyncEffectTag(Apply, undefined, currentEffect._2, undefined), currentEffect = currentEffect._1;
                  break;
                case Alt:
                  bindStack && (callbackStack = new AsyncEffectTag(Cons, bindStack, callbackStack)), bindStack = new AsyncEffectTag(Alt, undefined, currentEffect._2, undefined), currentEffect = currentEffect._1;
                  break;
                default:
                  currentStatus = nextFiberId++, currentEffect = new AsyncEffectTag(Forked, currentStatus, new AsyncEffectTag(Cons, bindStack, callbackStack), undefined), (currentFiber = Fiber(eitherInst, supervisor, currentEffect)).onComplete({
                    rethrow: false,
                    handler: fiberCompletionHandler(currentEffect)
                  })(), fiberMap[currentStatus] = currentFiber, supervisor && supervisor.register(currentFiber);
              }
              for (eitherHelpers = currentEffect, currentStatus = 0; currentStatus < activeFibers; currentStatus++) fiberMap[currentStatus].run();

              return new AsyncEffectTag(Async, function(onCancel) {
                return function() {
                  return function(error, doneCallback) {
                    var cleanupFns;
                    for (var id in fiberMap)
                      if (fiberMap.hasOwnProperty(id))
                        for (id in cleanupFns = fiberMap[id]) cleanupFns.hasOwnProperty(id) && cleanupFns[id]();
                    fiberMap = null;
                    var finalCleanup = cleanupAndCallback(error, eitherHelpers, doneCallback);
                    return function(cancelError) {
                      return new AsyncEffectTag(Sync, function() {
                        for (var id in finalCleanup) finalCleanup.hasOwnProperty(id) && finalCleanup[id]();
                        return PureEffect;
                      });
                    };
                  }(error, onCancel);
                };
              });
            }
          }

          function runParallelEffect(eitherInst, supervisor, effect) {
            return new AsyncEffectTag(Async, function(cancelCb) {
              return function() {
                return runSequentialEffect(eitherInst, supervisor, effect)(cancelCb);
              };
            });
          }

          return AsyncEffectTag.EMPTY = undefined,
            AsyncEffectTag.Pure = createEffectCtor(Pure),
            AsyncEffectTag.Throw = createEffectCtor(Throw),
            AsyncEffectTag.Catch = createEffectCtor(Catch),
            AsyncEffectTag.Sync = createEffectCtor(Sync),
            AsyncEffectTag.Async = createEffectCtor(Async),
            AsyncEffectTag.Bind = createEffectCtor(Bind),
            AsyncEffectTag.Bracket = createEffectCtor(Bracket),
            AsyncEffectTag.Fork = createEffectCtor(Fork),
            AsyncEffectTag.Sequential = createEffectCtor(Sequential),
            AsyncEffectTag.ParMap = createEffectCtor(Map),
            AsyncEffectTag.ParApply = createEffectCtor(Apply),
            AsyncEffectTag.ParAlt = createEffectCtor(Alt),
            AsyncEffectTag.Fiber = Fiber,
            AsyncEffectTag.Supervisor = function(eitherInst) {
              var activeFibers = {},
                nextId = 0,
                runningCount = 0;
              return {
                register: function(fiber) {
                  var id = nextId++;
                  fiber.onComplete({
                    rethrow: true,
                    handler: function(result) {
                      return function() {
                        runningCount--, delete activeFibers[id];
                      };
                    }
                  }), activeFibers[id] = fiber, runningCount++;
                },
                isEmpty: function() {
                  return 0 === runningCount;
                },
                killAll: function(err, onKilled) {
                  return function() {
                    var killCount = 0,
                      killFns = {};

                    function killAndTrack(id) {
                      killFns[id] = activeFibers[id].kill(err, function(killRes) {
                        return function() {
                          delete killFns[id], killCount--, eitherInst.isLeft(killRes) && eitherInst.fromLeft(killRes) && setTimeout(function() {
                            throw eitherInst.fromLeft(killRes);
                          }, 0), 0 === killCount && onKilled();
                        };
                      })();
                    }
                    for (var fiberId in activeFibers) activeFibers.hasOwnProperty(fiberId) && (killCount++, killAndTrack(fiberId));
                    return activeFibers = {}, nextId = 0, runningCount = 0,
                      function(cancelError) {
                        return new AsyncEffectTag(Sync, function() {
                          for (var id in killFns) killFns.hasOwnProperty(id) && killFns[id]();
                        });
                      };
                  };
                }
              };
            },
            AsyncEffectTag.Scheduler = scheduler,
            AsyncEffectTag.noCanceler = PureEffect,
            AsyncEffectTag;
        }();
      asyncEffects.pureAsyncEffect = asyncRuntime.Pure;
      asyncEffects.mapAsyncEffect = function(f) {
        return function(eff) {
          return eff.tag === asyncRuntime.Pure.tag ? asyncRuntime.Pure(f(eff._1)) : asyncRuntime.Bind(eff, function(val) {
            return asyncRuntime.Pure(f(val));
          });
        };
      };
      asyncEffects.bindAsyncEffect = function(eff) {
        return function(f) {
          return asyncRuntime.Bind(eff, f);
        };
      };
      asyncEffects.liftSyncEffect = asyncRuntime.Sync;
      asyncEffects.mapParallelAsyncEffect = function(f) {
        return function(parEff) {
          return asyncRuntime.ParMap(f, parEff);
        };
      };
      asyncEffects.applyParallelAsyncEffect = function(fParEff) {
        return function(valParEff) {
          return asyncRuntime.ParApply(fParEff, valParEff);
        };
      };
      asyncEffects.createAsyncEffect = asyncRuntime.Async;
      asyncEffects.createFiber = function(eitherInst, eff) {
        return function() {
          return asyncRuntime.Fiber(eitherInst, null, eff);
        };
      };
      asyncEffects.sequentialEffect = asyncRuntime.Sequential;
    }(purescriptRuntime["Effects.Asynchronous"] = purescriptRuntime["Effects.Asynchronous"] || {});

    // Control.Parallel.Class
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Concurrency"] = runtimeRef["Control.Concurrency"] || {};
      var concurrencyModule = runtimeRef["Control.Concurrency"];
      concurrencyModule.parallel = function(inst) {
        return inst.parallel;
      };
      concurrencyModule.sequential = function(inst) {
        return inst.sequential;
      };
      concurrencyModule.ParallelType = function(applicativeInst, monadInst, parallelFn, sequentialFn) {
        this.Applicative1 = applicativeInst;
        this.Monad0 = monadInst;
        this.parallel = parallelFn;
        this.sequential = sequentialFn;
      };
    }(purescriptRuntime);

    // Data.Foldable
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Foldable"] = runtimeRef["Data.Foldable"] || {};
      runtimeRef["Data.Foldable"].foldRightArray = function(f) {
        return function(initial) {
          return function(arr) {
            for (var i = arr.length - 1; i >= 0; i--) {
              initial = f(arr[i])(initial);
            }
            return initial;
          };
        };
      };
      runtimeRef["Data.Foldable"].foldLeftArray = function(f) {
        return function(initial) {
          return function(arr) {
            for (var i = 0, len = arr.length; i < len; i++) {
              initial = f(initial)(arr[i]);
            }
            return initial;
          };
        };
      };
    }(purescriptRuntime["Data.Foldable"] = purescriptRuntime["Data.Foldable"] || {});

    // Data.Semigroup
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.SemiGroup"] = runtimeRef["Data.SemiGroup"] || {};
      var semigroupModule = runtimeRef["Data.SemiGroup"];
      semigroupModule.SemiGroupType = function(appendFn) {
        this.append = appendFn;
      };
      semigroupModule.combineValues = function(inst) {
        return inst.append;
      };
    }(purescriptRuntime);

    // Data.Foldable (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Data.Foldable"] = runtimeRef["Data.Foldable"] || {};
      var foldableModule = runtimeRef["Data.Foldable"],
        foldableReExport = runtimeRef["Data.Foldable"],
        applicativeModule = runtimeRef["Control.Applicative"],
        applyModule = runtimeRef["Control.Apply"],
        monoidModule = runtimeRef["Data.Monoid"],
        semigroupModule = runtimeRef["Data.SemiGroup"],
        unitModule = runtimeRef["Data.Unit"],
        FoldableType = function(foldMapFn, foldlFn, foldrFn) {
          this.foldMap = foldMapFn;
          this.foldl = foldlFn;
          this.foldr = foldrFn;
        },
        foldRight = function(inst) {
          return inst.foldr;
        },
        foldMapDefault = function(foldableInst) {
          return function(monoidInst) {
            return function(f) {
              return foldRight(foldableInst)(function(val) {
                return function(acc) {
                  return semigroupModule.combineValues(monoidInst.Semigroup0())(f(val))(acc);
                };
              })(monoidModule.emptyValue(monoidInst));
            };
          };
        },
        arrayFoldableInstance = new FoldableType(function(monoidInst) {
          return foldMapDefault(arrayFoldableInstance)(monoidInst);
        }, foldableReExport.foldLeftArray, foldableReExport.foldRightArray);
      foldableModule.FoldableType = FoldableType;
      foldableModule.foldRight = foldRight;
      foldableModule.foldLeft = function(inst) {
        return inst.foldl;
      };
      foldableModule.foldMap = function(inst) {
        return inst.foldMap;
      };
      foldableModule.foldMapDefault = foldMapDefault;
      foldableModule.traverseAndDiscard = function(applicativeInst) {
        return function(foldableInst) {
          return function(f) {
            return foldRight(foldableInst)(function(val) {
              return applyModule.applySecondArg(applicativeInst.Apply0())(f(val));
            })(applicativeModule.pureValue(applicativeInst)(unitModule.voidValue));
          };
        };
      };
      foldableModule.arrayFoldableInstance = arrayFoldableInstance;
    }(purescriptRuntime);

    // Control.Parallel
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Control.Parallel"] = runtimeRef["Control.Parallel"] || {};
      var parallelModule = runtimeRef["Control.Parallel"],
        categoryModule = runtimeRef["Control.Category"],
        concurrencyClass = runtimeRef["Control.Concurrency"],
        foldableModule = runtimeRef["Data.Foldable"],
        parallelTraverseAndDiscard = function(parallelInst) {
          return function(foldableInst) {
            return function(f) {
              return function(arr) {
                return concurrencyClass.sequential(parallelInst)(foldableModule.traverseAndDiscard(parallelInst.Applicative1())(foldableInst)(function(val) {
                  return concurrencyClass.parallel(parallelInst)(f(val));
                })(arr));
              };
            };
          };
        };
      parallelModule.parallelTraverseAndDiscard = parallelTraverseAndDiscard;
      parallelModule.parallelSequenceAndDiscard = function(parallelInst) {
        return function(foldableInst) {
          return parallelTraverseAndDiscard(parallelInst)(foldableInst)(categoryModule.identity(categoryModule.functionCategoryInstance));
        };
      };
    }(purescriptRuntime);

    // Effect.Class
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Effects.MonadicClass"] = runtimeRef["Effects.MonadicClass"] || {};
      var monadicClassModule = runtimeRef["Effects.MonadicClass"];
      monadicClassModule.liftEffect = function(inst) {
        return inst.liftEffect;
      };
      monadicClassModule.MonadEffectType = function(monadInst, liftEffectFn) {
        this.Monad0 = monadInst;
        this.liftEffect = liftEffectFn;
      };
    }(purescriptRuntime);

    // Partial.Unsafe
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Partial.Unsafe"] = runtimeRef["Partial.Unsafe"] || {}).performUnsafePartial = function(fn) {
        return fn();
      };
    }(purescriptRuntime);

    // Partial
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Partial.General"] = runtimeRef["Partial.General"] || {}).terminateWithError = function() {
        return function(msg) {
          throw new Error(msg);
        };
      };
    }(purescriptRuntime);

    // Partial (re-export)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Partial.General"] = runtimeRef["Partial.General"] || {};
      var partialModule = runtimeRef["Partial.General"],
        partialReExport = runtimeRef["Partial.General"];
      partialModule.terminateWithError = partialReExport.terminateWithError;
    }(purescriptRuntime);

    // Partial.Unsafe (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Partial.Unsafe"] = runtimeRef["Partial.Unsafe"] || {};
      var unsafePartialModule = runtimeRef["Partial.Unsafe"],
        unsafePartialReExport = runtimeRef["Partial.Unsafe"],
        partialModule = runtimeRef["Partial.General"];
      unsafePartialModule.terminateUnsafely = function(msg) {
        return unsafePartialReExport.performUnsafePartial(function(val) {
          return partialModule.terminateWithError(val)(msg);
        });
      };
    }(purescriptRuntime);

    // Unsafe.Coerce
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Unsafe.Coerce"] = runtimeRef["Unsafe.Coerce"] || {}).performUnsafeCast = function(val) {
        return val;
      };
    }(purescriptRuntime);

    // Unsafe.Coerce (re-export)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Unsafe.Coerce"] = runtimeRef["Unsafe.Coerce"] || {};
      var unsafeCastModule = runtimeRef["Unsafe.Coerce"],
        unsafeCastReExport = runtimeRef["Unsafe.Coerce"];
      unsafeCastModule.performUnsafeCast = unsafeCastReExport.performUnsafeCast;
    }(purescriptRuntime);

    // Effect.Aff (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Effects.Asynchronous"] = runtimeRef["Effects.Asynchronous"] || {};
      var asyncEffects = runtimeRef["Effects.Asynchronous"],
        asyncEffectsReExport = runtimeRef["Effects.Asynchronous"],
        applicativeModule = runtimeRef["Control.Applicative"],
        applyModule = runtimeRef["Control.Apply"],
        bindModule = runtimeRef["Control.Bind"],
        monadModule = runtimeRef["Control.Monad"],
        parallelModule = runtimeRef["Control.Parallel"],
        concurrencyClass = runtimeRef["Control.Concurrency"],
        choiceModule = runtimeRef["Data.Either"],
        foldableModule = runtimeRef["Data.Foldable"],
        functionalUtils = runtimeRef["Data.Function"],
        functorModule = runtimeRef["Data.Functor"],
        monoidModule = runtimeRef["Data.Monoid"],
        semigroupModule = runtimeRef["Data.SemiGroup"],
        unitModule = runtimeRef["Data.Unit"],
        effectCore = runtimeRef.Effects.General,
        monadicClass = runtimeRef["Effects.MonadicClass"],
        unsafePartialModule = runtimeRef["Partial.Unsafe"],
        unsafeCastModule = runtimeRef["Unsafe.Coerce"],
        parallelAsyncFunctor = new functorModule.FunctorType(asyncEffectsReExport.mapParallelAsyncEffect),
        asyncFunctor = new functorModule.FunctorType(asyncEffectsReExport.mapAsyncEffect),
        eitherHelpers = {
          isLeft: function(val) {
            if (val instanceof choiceModule.Failure) return true;
            if (val instanceof choiceModule.Success) return false;
            throw new Error("Pattern match failure in isLeft: " + [val.constructor.name]);
          },
          fromLeft: function(val) {
            if (val instanceof choiceModule.Failure) return val.value0;
            if (val instanceof choiceModule.Success) return unsafePartialModule.terminateUnsafely("unsafeFromLeft: Success");
            throw new Error("Pattern match failure in fromLeft: " + [val.constructor.name]);
          },
          fromRight: function(val) {
            if (val instanceof choiceModule.Success) return val.value0;
            if (val instanceof choiceModule.Failure) return unsafePartialModule.terminateUnsafely("unsafeFromRight: Failure");
            throw new Error("Pattern match failure in fromRight: " + [val.constructor.name]);
          },
          left: choiceModule.Failure.create,
          right: choiceModule.Success.create
        },
        startAsyncProcess = function(eff) {
          return function() {
            var fiber = asyncEffectsReExport.createFiber(eitherHelpers, eff)();
            return fiber.run(), fiber;
          };
        },
        parallelAsyncApply = new applyModule.ApplyType(function() {
          return parallelAsyncFunctor;
        }, asyncEffectsReExport.applyParallelAsyncEffect),
        asyncMonad = new monadModule.MonadClass(function() {
          return asyncApplicative;
        }, function() {
          return asyncBind;
        }),
        asyncBind = new bindModule.BindType(function() {
          return asyncApply;
        }, asyncEffectsReExport.bindAsyncEffect),
        asyncApply = new applyModule.ApplyType(function() {
          return asyncFunctor;
        }, monadModule.applyMonadic(asyncMonad)),
        asyncApplicative = new applicativeModule.ApplicativeType(function() {
          return asyncApply;
        }, asyncEffectsReExport.pureAsyncEffect),
        asyncMonadEffect = new monadicClass.MonadEffectType(function() {
          return asyncMonad;
        }, asyncEffectsReExport.liftSyncEffect),
        asyncParallel = new concurrencyClass.ParallelType(function() {
          return parallelApplicative;
        }, function() {
          return asyncMonad;
        }, unsafeCastModule.performUnsafeCast, asyncEffectsReExport.sequentialEffect),
        parallelApplicative = new applicativeModule.ApplicativeType(function() {
          return parallelAsyncApply;
        }, function(val) {
          return concurrencyClass.parallel(asyncParallel)(applicativeModule.pureValue(asyncApplicative)(val));
        }),
        cancelerSemigroup = new semigroupModule.SemiGroupType(function(f1) {
          return function(f2) {
            return function(val) {
              return parallelModule.parallelSequenceAndDiscard(asyncParallel)(foldableModule.arrayFoldableInstance)([f1(val), f2(val)]);
            };
          };
        }),
        emptyCanceler = functionalUtils.constantValue(applicativeModule.pureValue(asyncApplicative)(unitModule.voidValue)),
        cancelerMonoid = new monoidModule.Monoid(function() {
          return cancelerSemigroup;
        }, emptyCanceler);
      asyncEffects.executeAsync = startAsyncProcess;
      asyncEffects.executeAsyncDiscard = function(eff) {
        return functorModule.mapToVoid(effectCore.functorInstance)(startAsyncProcess(eff));
      };
      asyncEffects.emptyCanceler = emptyCanceler;
      asyncEffects.asyncFunctor = asyncFunctor;
      asyncEffects.asyncApply = asyncApply;
      asyncEffects.asyncApplicative = asyncApplicative;
      asyncEffects.asyncBind = asyncBind;
      asyncEffects.asyncMonad = asyncMonad;
      asyncEffects.asyncMonadEffect = asyncMonadEffect;
      asyncEffects.parallelAsyncFunctor = parallelAsyncFunctor;
      asyncEffects.parallelAsyncApply = parallelAsyncApply;
      asyncEffects.parallelApplicative = parallelApplicative;
      asyncEffects.asyncParallel = asyncParallel;
      asyncEffects.cancelerSemigroup = cancelerSemigroup;
      asyncEffects.cancelerMonoid = cancelerMonoid;
      asyncEffects.createAsyncEffect = asyncEffectsReExport.createAsyncEffect;
    }(purescriptRuntime);

    // Effect.Ref
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Effects.MutableRef"] = runtimeRef["Effects.MutableRef"] || {};
      runtimeRef["Effects.MutableRef"].createRef = function(val) {
        return function() {
          return {
            value: val
          };
        };
      };
      runtimeRef["Effects.MutableRef"].readRef = function(ref) {
        return function() {
          return ref.value;
        };
      };
      runtimeRef["Effects.MutableRef"].writeRef = function(val) {
        return function(ref) {
          return function() {
            return ref.value = val, {};
          };
        };
      };
    }(purescriptRuntime["Effects.MutableRef"] = purescriptRuntime["Effects.MutableRef"] || {});

    // Effect.Ref (re-export)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Effects.MutableRef"] = runtimeRef["Effects.MutableRef"] || {};
      var mutableRefModule = runtimeRef["Effects.MutableRef"],
        mutableRefReExport = runtimeRef["Effects.MutableRef"];
      mutableRefModule.createRef = mutableRefReExport.createRef;
      mutableRefModule.readRef = mutableRefReExport.readRef;
      mutableRefModule.writeRef = mutableRefReExport.writeRef;
    }(purescriptRuntime);

    // Node.Encoding
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Node.TextEncoding"] = runtimeRef["Node.TextEncoding"] || {};
      var textEncodingModule = runtimeRef["Node.TextEncoding"],
        displayModule = runtimeRef["Data.Show"],
        AsciiEncoding = function() {
          function EncodingASCII() {}
          return EncodingASCII.value = new EncodingASCII(), EncodingASCII;
        }(),
        Utf8Encoding = function() {
          function EncodingUTF8() {}
          return EncodingUTF8.value = new EncodingUTF8(), EncodingUTF8;
        }(),
        Utf16leEncoding = function() {
          function EncodingUTF16LE() {}
          return EncodingUTF16LE.value = new EncodingUTF16LE(), EncodingUTF16LE;
        }(),
        Ucs2Encoding = function() {
          function EncodingUCS2() {}
          return EncodingUCS2.value = new EncodingUCS2(), EncodingUCS2;
        }(),
        Base64Encoding = function() {
          function EncodingBase64() {}
          return EncodingBase64.value = new EncodingBase64(), EncodingBase64;
        }(),
        Latin1Encoding = function() {
          function EncodingLatin1() {}
          return EncodingLatin1.value = new EncodingLatin1(), EncodingLatin1;
        }(),
        BinaryEncoding = function() {
          function EncodingBinary() {}
          return EncodingBinary.value = new EncodingBinary(), EncodingBinary;
        }(),
        HexEncoding = function() {
          function EncodingHex() {}
          return EncodingHex.value = new EncodingHex(), HexEncoding;
        }(),
        encodingShowInstance = new displayModule.ShowType(function(encoding) {
          if (encoding instanceof AsciiEncoding) return "ASCII";
          if (encoding instanceof Utf8Encoding) return "UTF8";
          if (encoding instanceof Utf16leEncoding) return "UTF16LE";
          if (encoding instanceof Ucs2Encoding) return "UCS2";
          if (encoding instanceof Base64Encoding) return "Base64";
          if (encoding instanceof Latin1Encoding) return "Latin1";
          if (encoding instanceof BinaryEncoding) return "Binary";
          if (encoding instanceof HexEncoding) return "Hex";
          throw new Error("Pattern match failure in encodingShowInstance: " + [encoding.constructor.name]);
        });
      textEncodingModule.AsciiEncoding = AsciiEncoding;
      textEncodingModule.Utf8Encoding = Utf8Encoding;
      textEncodingModule.Utf16leEncoding = Utf16leEncoding;
      textEncodingModule.Ucs2Encoding = Ucs2Encoding;
      textEncodingModule.Base64Encoding = Base64Encoding;
      textEncodingModule.Latin1Encoding = Latin1Encoding;
      textEncodingModule.BinaryEncoding = BinaryEncoding;
      textEncodingModule.HexEncoding = HexEncoding;
      textEncodingModule.convertEncodingToNode = function(encoding) {
        if (encoding instanceof AsciiEncoding) return "ascii";
        if (encoding instanceof Utf8Encoding) return "utf8";
        if (encoding instanceof Utf16leEncoding) return "utf16le";
        if (encoding instanceof Ucs2Encoding) return "ucs2";
        if (encoding instanceof Base64Encoding) return "base64";
        if (encoding instanceof Latin1Encoding) return "latin1";
        if (encoding instanceof BinaryEncoding) return "binary";
        if (encoding instanceof HexEncoding) return "hex";
        throw new Error("Pattern match failure in convertEncodingToNode: " + [encoding.constructor.name]);
      };
      textEncodingModule.encodingShowInstance = encodingShowInstance;
    }(purescriptRuntime);

    // Node.Process
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Node.SystemProcess"] = runtimeRef["Node.SystemProcess"] || {}).nodeProcess = process;
    }(purescriptRuntime);

    // Node.Process (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Node.SystemProcess"] = runtimeRef["Node.SystemProcess"] || {};
      var systemProcessModule = runtimeRef["Node.SystemProcess"],
        systemProcessReExport = runtimeRef["Node.SystemProcess"],
        stdOut = systemProcessReExport.nodeProcess.stdout,
        stdIn = systemProcessReExport.nodeProcess.stdin;
      systemProcessModule.standardInput = stdIn;
      systemProcessModule.standardOutput = stdOut;
    }(purescriptRuntime);

    // Node.Stream
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Node.IoStream"] = runtimeRef["Node.IoStream"] || {};
      runtimeRef["Node.IoStream"].readStreamChunk = function(onString) {
        return function(onBuffer) {
          return function(chunk) {
            if (chunk instanceof Buffer) return onBuffer(chunk);
            if (typeof chunk === "string") return onString(chunk);
            throw new Error("Node.IoStream.readStreamChunk: Unrecognized chunk type; expected String or Buffer, got: " + chunk);
          };
        };
      };
      runtimeRef["Node.IoStream"].onStreamDataEither = function(chunkHandler) {
        return function(stream) {
          return function(callback) {
            return function() {
              stream.on("data", function(data) {
                callback(chunkHandler(data))();
              });
            };
          };
        };
      };
      runtimeRef["Node.IoStream"].onStreamEnd = function(stream) {
        return function(callback) {
          return function() {
            stream.on("end", callback);
          };
        };
      };
      runtimeRef["Node.IoStream"].writeToStream = function(stream) {
        return function(data) {
          return function(callback) {
            return function() {
              return stream.write(data, null, callback);
            };
          };
        };
      };
      runtimeRef["Node.IoStream"].writeStringStream = function(stream) {
        return function(encoding) {
          return function(data) {
            return function(callback) {
              return function() {
                return stream.write(data, encoding, callback);
              };
            };
          };
        };
      };
    }(purescriptRuntime["Node.IoStream"] = purescriptRuntime["Node.IoStream"] || {});

    // Effect.Exception
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Effects.ErrorHandling"] = runtimeRef["Effects.ErrorHandling"] || {};
      runtimeRef["Effects.ErrorHandling"].createError = function(msg) {
        return new Error(msg);
      };
      runtimeRef["Effects.ErrorHandling"].raiseException = function(err) {
        return function() {
          throw err;
        };
      };
    }(purescriptRuntime["Effects.ErrorHandling"] = purescriptRuntime["Effects.ErrorHandling"] || {});

    // Effect.Exception (re-export)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Effects.ErrorHandling"] = runtimeRef["Effects.ErrorHandling"] || {};
      var errorHandlingModule = runtimeRef["Effects.ErrorHandling"],
        errorHandlingReExport = runtimeRef["Effects.ErrorHandling"];
      errorHandlingModule.raiseError = function(msg) {
        return errorHandlingReExport.raiseException(errorHandlingReExport.createError(msg));
      };
    }(purescriptRuntime);

    // Node.Buffer
    !function(runtimeRef) {
      "use strict";
      (runtimeRef["Node.BinaryBuffer"] = runtimeRef["Node.BinaryBuffer"] || {}).bufferToString = function(encoding) {
        return function(buffer) {
          return function() {
            return buffer.toString(encoding);
          };
        };
      };
    }(purescriptRuntime);

    // Node.Buffer (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Node.BinaryBuffer"] = runtimeRef["Node.BinaryBuffer"] || {};
      var binaryBufferModule = runtimeRef["Node.BinaryBuffer"],
        binaryBufferReExport = runtimeRef["Node.BinaryBuffer"],
        textEncodingModule = runtimeRef["Node.TextEncoding"];
      binaryBufferModule.convertBufferToString = function(encoding) {
        return binaryBufferReExport.bufferToString(textEncodingModule.convertEncodingToNode(encoding));
      };
    }(purescriptRuntime);

    // Node.Stream (continued)
    !function(runtimeRef) {
      "use strict";
      runtimeRef["Node.IoStream"] = runtimeRef["Node.IoStream"] || {};
      var ioStreamModule = runtimeRef["Node.IoStream"],
        ioStreamReExport = runtimeRef["Node.IoStream"],
        applicativeModule = runtimeRef["Control.Applicative"],
        bindModule = runtimeRef["Control.Bind"],
        choiceModule = runtimeRef["Data.Either"],
        displayModule = runtimeRef["Data.Show"],
        effectCore = runtimeRef.Effects.General,
        errorHandlingModule = runtimeRef["Effects.ErrorHandling"],
        binaryBufferModule = runtimeRef["Node.BinaryBuffer"],
        textEncodingModule = runtimeRef["Node.TextEncoding"],
        chunkParser = ioStreamReExport.readStreamChunk(choiceModule.Failure.create)(choiceModule.Success.create),
        onDataProcessor = function(handler) {
          return function(stream) {
            return ioStreamReExport.onStreamDataEither(chunkParser)(stream)(handler);
          };
        },
        handleStreamData = function(stream) {
          return function(handler) {
            return onDataProcessor(stream)(bindModule.flippedKleisliComposition(effectCore.bindInstance)(handler)(function(chunkResult) {
              if (chunkResult instanceof choiceModule.Failure) return errorHandlingModule.raiseError("Stream encoding should not be set");
              if (chunkResult instanceof choiceModule.Success) return applicativeModule.pureValue(effectCore.applicativeInstance)(chunkResult.value0);
              throw new Error("Pattern match failure in handleStreamData: " + [chunkResult.constructor.name]);
            }));
          };
        };
      ioStreamModule.handleStreamData = handleStreamData;
      ioStreamModule.handleStreamDataAsString = function(stream) {
        return function(encoding) {
          return function(handler) {
            return handleStreamData(stream)(bindModule.flippedKleisliComposition(effectCore.bindInstance)(handler)(binaryBufferModule.convertBufferToString(encoding)));
          };
        };
      };
      ioStreamModule.handleStreamDataEither = onDataProcessor;
      ioStreamModule.writeString = function(stream) {
        return function(encoding) {
          return ioStreamReExport.writeStringStream(stream)(displayModule.show(textEncodingModule.encodingShowInstance)(encoding));
        };
      };
      ioStreamModule.onStreamEnd = ioStreamReExport.onStreamEnd;
    }(purescriptRuntime);

    // ABC095B - The main solution module
    purescriptRuntime.solutionModule = purescriptRuntime.solutionModule || {};
    var solutionNamespace = purescriptRuntime.solutionModule,
      appOps = purescriptRuntime["Control.Applicative"],
      bindOps = purescriptRuntime["Control.Bind"],
      catOps = purescriptRuntime["Control.Category"],
      recMonad = purescriptRuntime["Control.Monad.Rec.Class"],
      listOps = purescriptRuntime["Data.Array"],
      boundOps = purescriptRuntime["Data.Bounded"],
      eitherOps = purescriptRuntime["Data.Either"],
      euclidOps = purescriptRuntime["Data.EuclideanRing"],
      funcOps = purescriptRuntime["Data.Functor"],
      intParser = purescriptRuntime["Data.Int"],
      maybeOps = purescriptRuntime["Data.Maybe"],
      monoidOps = purescriptRuntime["Data.Monoid"],
      ordOps = purescriptRuntime["Data.Ord"],
      showOps = purescriptRuntime["Data.Show"],
      strUtils = purescriptRuntime["Data.String.Common"],
      tupleOps = purescriptRuntime["Data.Tuple"],
      effectCore = purescriptRuntime.Effects.General,
      asyncEffects = purescriptRuntime["Effects.Asynchronous"],
      effectClass = purescriptRuntime["Effects.MonadicClass"],
      mutableRef = purescriptRuntime["Effects.MutableRef"],
      nodeEncodings = purescriptRuntime["Node.TextEncoding"],
      systemProcess = purescriptRuntime["Node.SystemProcess"],
      ioStream = purescriptRuntime["Node.IoStream"],
      unsafePartialOps = purescriptRuntime["Partial.Unsafe"];

    // Asynchronous effect to read all input from stdin
    // This is a Type III change: using a direct event listener and Promise for input accumulation.
    // Original used Effect.Ref and onDataString. This uses a standard JS closure and Promise.
    var inputReadAff = asyncEffects.createAsyncEffect(function(cancelCallback) {
      return function() {
        return new Promise(function(resolve, reject) {
          let accumulatedInput = "";
          const stdin = systemProcess.standardInput;

          const dataHandler = (chunk) => {
            accumulatedInput += chunk.toString(nodeEncodings.convertEncodingToNode(nodeEncodings.Utf8Encoding.value));
          };

          const endHandler = () => {
            resolve(eitherOps.Success.create(accumulatedInput));
          };

          const errorHandler = (err) => {
            reject(eitherOps.Failure.create(err.message));
          };

          // Attach listeners
          stdin.on('data', dataHandler);
          stdin.on('end', endHandler);
          stdin.on('error', errorHandler);

          // Return a canceler that removes the listeners
          return function(err) {
            return function() {
              stdin.removeListener('data', dataHandler);
              stdin.removeListener('end', endHandler);
              stdin.removeListener('error', errorHandler);
              // If an error was passed to the canceler, reject the promise with it
              if (err) reject(eitherOps.Failure.create(err));
            };
          };
        });
      };
    });

    // Helper to parse "N X" line into an object
    // Type III change: returns an object with explicit properties or throws, instead of Maybe Tuple.
    function parseInputLine(lineContent) {
      const parts = strUtils.splitString(" ")(lineContent);
      if (parts.length !== 2) {
        throw new Error("Invalid N X line format: " + lineContent);
      }
      const nVal = intParser.fromDecimalString(parts[0]);
      const xVal = intParser.fromDecimalString(parts[1]);

      if (maybeOps.handleOptional(true)(() => false)(nVal) || maybeOps.handleOptional(true)(() => false)(xVal)) {
        throw new Error("Failed to parse N or X as integers: " + lineContent);
      }
      return {
        count: nVal.value0,
        budget: xVal.value0
      };
    }

    // Main solution logic
    // Type III changes:
    // - Replaced Either-based error handling with simple string errors or direct throws for clarity in JS context.
    // - Replaced `tailRec` with a standard `for` loop.
    // - Used `Math.min` instead of PureScript's `min`.
    // - Direct array access instead of `o.index`.
    // - Added guard clauses for empty inputs or invalid N/X values.
    // - Simplified arithmetic.
    function calculateSolution(fullInputString) {
      // Basic validation for input string
      if (!fullInputString || fullInputString.trim() === "") {
        return eitherOps.Failure.create("Empty input received.");
      }

      const trimmedInput = strUtils.trimWhitespace(fullInputString);
      const allLines = strUtils.splitString("\n")(trimmedInput);

      if (allLines.length === 0) {
        return eitherOps.Failure.create("No lines in input after trimming.");
      }

      // Extract N and X from the first line
      let nXPair;
      try {
        nXPair = parseInputLine(allLines[0]);
      } catch (e) {
        return eitherOps.Failure.create("Error parsing N X line: " + e.message);
      }

      const N = nXPair.count;
      const X = nXPair.budget;

      // Validate N and X values
      if (N <= 0 || X <= 0) {
        return eitherOps.Failure.create("N and X must be positive integers.");
      }
      if (N > 1000 || X > 1000000000) { // Example bounds, adjust as needed
        return eitherOps.Failure.create("N or X value out of typical contest bounds.");
      }

      // Parse the donut costs from the remaining lines
      const donutCosts = [];
      // Type III: Using a standard for loop with explicit parsing and validation
      for (let i = 1; i < allLines.length; i++) {
        const costStr = allLines[i].trim();
        if (costStr === "") continue; // Skip empty lines

        const costMaybe = intParser.fromDecimalString(costStr);
        if (maybeOps.handleOptional(true)(() => false)(costMaybe)) {
          return eitherOps.Failure.create("Failed to parse donut cost on line " + (i + 1) + ": " + costStr);
        }
        donutCosts.push(costMaybe.value0);
      }

      // Ensure we have exactly N donut costs
      if (donutCosts.length !== N) {
        return eitherOps.Failure.create(`Expected ${N} donut costs, but found ${donutCosts.length}.`);
      }

      // Core calculation logic (Type III: replaced tailRec with a for loop)
      let currentMinCost = boundOps.maxIntVal; // Initialize with max possible int
      let totalCostSum = 0;
      let donutsMade = 0;

      for (let i = 0; i < N; i++) {
        const cost = donutCosts[i];
        totalCostSum += cost;
        currentMinCost = Math.min(currentMinCost, cost);
      }

      // Calculate remaining budget
      const remainingBudget = X - totalCostSum;

      // If remaining budget is negative, no extra donuts can be made
      if (remainingBudget < 0) {
        donutsMade = 0;
      } else {
        // Guard against division by zero if currentMinCost is 0, though problem constraints usually prevent this for costs
        if (currentMinCost === 0) {
          // If min cost is 0 and remaining budget is positive, theoretically infinite donuts.
          // In competitive programming, this usually implies a problem setup error or a very large number.
          // For safety, we can return remainingBudget/1 (if 0 cost means 1 unit cost) or a specific error.
          // Assuming non-zero costs for division based on typical problem constraints.
          return eitherOps.Failure.create("Minimum donut cost is zero, leading to ambiguous calculation for remaining budget.");
        }
        // Calculate additional donuts that can be made with the remaining budget
        donutsMade = euclidOps.integerDivision(remainingBudget)(currentMinCost);
      }

      // Total donuts made: N initial donuts + additional donuts
      const finalDonutCount = N + donutsMade;

      return eitherOps.Success.create(showOps.show(showOps.intShowInstance)(finalDonutCount) + "\n");
    }

    // The main execution flow
    var mainExecution = asyncEffects.executeAsyncDiscard(
      bindOps.bindOp(asyncEffects.asyncBind)(inputReadAff)(function(inputResult) {
        let solutionOutput;
        // Type III: Switched from nested bind to a single try/catch block for processing the input
        try {
          // If input reading failed
          if (eitherOps.eitherHelpers.isLeft(inputResult)) {
            throw new Error(eitherOps.eitherHelpers.fromLeft(inputResult));
          }
          const parsedInput = eitherOps.eitherHelpers.fromRight(inputResult);
          const computed = calculateSolution(parsedInput);

          if (eitherOps.eitherHelpers.isLeft(computed)) {
            throw new Error(eitherOps.eitherHelpers.fromLeft(computed));
          }
          solutionOutput = eitherOps.eitherHelpers.fromRight(computed);

        } catch (error) {
          // Log error and set a default error message for output
          console.error("Application error:", error.message);
          solutionOutput = "Error: " + error.message + "\n";
        }

        // Lift the effect of writing the result to stdout
        return effectClass.liftEffect(asyncEffects.asyncMonadEffect)(
          funcOps.mapToVoid(effectCore.functorInstance)(
            ioStream.writeString(systemProcess.standardOutput)(nodeEncodings.Utf8Encoding.value)(solutionOutput)(appOps.pureValue(effectCore.applicativeInstance)(unitOps.voidValue))
          )
        );
      })
    );

    solutionNamespace.main = mainExecution;
    solutionNamespace.calculateSolution = calculateSolution;

    // Execute the main function
    solutionNamespace.main();

  }, {}]
}, {}, ["Focm"], null);