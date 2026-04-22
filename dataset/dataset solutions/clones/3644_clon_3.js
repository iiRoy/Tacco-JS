applicationBootstrapper=function(moduleDefinitions, moduleCache, entryKeys, globalExportKey){
  // Initialize internal state for module loading process
  var firstErrorEncountered, parentModuleLoader = "function"==typeof applicationBootstrapper && applicationBootstrapper,
      nodeJsRequire = "function"==typeof require && require;

  // Core function to retrieve or create a module instance
  function getModuleInstance(moduleIdentifier, skipParentLookup){
    // If module is already cached, return its exports
    if(moduleCache[moduleIdentifier]){
      return moduleCache[moduleIdentifier].exports;
    }

    // If module definition doesn't exist, try external loaders
    if(!moduleDefinitions[moduleIdentifier]){
      var currentParcelLoader = "function"==typeof applicationBootstrapper && applicationBootstrapper;
      if(!skipParentLookup && currentParcelLoader) return currentParcelLoader(moduleIdentifier, true);
      if(parentModuleLoader) return parentModuleLoader(moduleIdentifier, true);
      if(nodeJsRequire && "string"==typeof moduleIdentifier) return nodeJsRequire(moduleIdentifier);

      // If all attempts fail, throw a module not found error
      var moduleLoadError = new Error("Unable to locate module: '"+moduleIdentifier+"'");
      throw moduleLoadError.code="MODULE_NOT_FOUND", moduleLoadError;
    }

    // Create a local 'require' function for the current module
    // This allows modules to reference other modules by their original paths
    localModuleRequester.resolve = function(relativePath){
      return moduleDefinitions[moduleIdentifier][1][relativePath] || relativePath;
    };
    localModuleRequester.cache = {}; // Cache for local module dependencies

    // Initialize a new module object and cache it
    var currentModule = moduleCache[moduleIdentifier] = new getModuleInstance.Module(moduleIdentifier);
    // Execute the module's definition function, populating its exports
    moduleDefinitions[moduleIdentifier][0].call(currentModule.exports, localModuleRequester, currentModule, currentModule.exports, this);

    return moduleCache[moduleIdentifier].exports;

    // Helper function for requiring modules from within the current module
    function localModuleRequester(dependencyPath){
      return getModuleInstance(localModuleRequester.resolve(dependencyPath));
    }
  }

  // Mark the module loader as a Parcel-style loader
  getModuleInstance.isParcelRequire = true;

  // Define the Module constructor
  getModuleInstance.Module = function(moduleId){
    this.id = moduleId;
    this.bundle = getModuleInstance;
    this.exports = {}; // The actual exports object for this module
  };

  // Expose module definitions and cache for debugging/inspection
  getModuleInstance.modules = moduleDefinitions;
  getModuleInstance.cache = moduleCache;
  getModuleInstance.parent = parentModuleLoader; // Reference to the parent loader if nested

  // Function to register new module definitions dynamically
  getModuleInstance.register = function(id, moduleExports){
    moduleDefinitions[id] = [function(localReq, moduleObj){ moduleObj.exports = moduleExports; }, {}];
  };

  // Iterate through entry points and load them
  for(var idx = 0; idx < entryKeys.length; idx++){
    try{
      getModuleInstance(entryKeys[idx]);
    }catch(err){
      // Store the first error encountered during entry point loading
      firstErrorEncountered || (firstErrorEncountered = err);
    }
  }

  // If there are entry points, determine the final export
  if(entryKeys.length){
    var mainExport = getModuleInstance(entryKeys[entryKeys.length - 1]);
    if("object"==typeof exports && "undefined"!=typeof module){
      module.exports = mainExport;
    } else if("function"==typeof define && define.amd){
      define(function(){ return mainExport; });
    } else if(globalExportKey){
      this[globalExportKey] = mainExport;
    }
  }

  // Update the global parcelRequire reference and re-throw any initial error
  if(applicationBootstrapper = getModuleInstance, firstErrorEncountered) throw firstErrorEncountered;

  return getModuleInstance; // Return the configured module loader
}({"AppEntry":[function(localRequire, moduleObj, moduleExports, globalScope) {
  var runtimeEnv = {}; // Global environment object for modules

  // Control Flow Operations Module
  (function(env){
    "use strict";
    // Function for array-based application of functions
    (env["FlowOps"]=env["FlowOps"]||{}).arrayApply = function(functionList){
      return function(argumentList){
        var funcCount = functionList.length, argCount = argumentList.length,
            resultArray = new Array(funcCount * argCount), resultIndex = 0;
        for(var fIdx = 0; fIdx < funcCount; fIdx++){
          var currentFunc = functionList[fIdx];
          for(var aIdx = 0; aIdx < argCount; aIdx++){
            resultArray[resultIndex++] = currentFunc(argumentList[aIdx]);
          }
        }
        return resultArray;
      };
    };
  })(runtimeEnv),

  // Control Semigroupoid Module
  (function(env){
    "use strict";
    // Semigroupoid Type Constructor
    var SemigroupoidType = function(compositionFunc){ this.compose = compositionFunc; },
        // Instance for functions (f . g)
        functionSemigroupoidInstance = new SemigroupoidType(function(f){ return function(g){ return function(x){ return f(g(x)); }; }; });

    env.getComposition = function(instance){ return instance.compose; };
    env.Semigroupoid = SemigroupoidType;
    env.functionSemigroupoid = functionSemigroupoidInstance;
  })(runtimeEnv["FlowOps"]=runtimeEnv["FlowOps"]||{}),

  // Control Category Module
  (function(env){
    "use strict";
    var SemigroupoidUtil = runtimeEnv["FlowOps"],
        // Category Type Constructor
        CategoryType = function(semigroupoidInstance, identityFunc){ this.Semigroupoid0 = semigroupoidInstance; this.identity = identityFunc; },
        // Instance for functions (identity function)
        functionCategoryInstance = new CategoryType(function(){ return SemigroupoidUtil.functionSemigroupoid; }, function(x){ return x; });

    env.Category = CategoryType;
    env.getIdentity = function(instance){ return instance.identity; };
    env.functionCategory = functionCategoryInstance;
  })(runtimeEnv["FlowOps"]=runtimeEnv["FlowOps"]||{}),

  // Data Equality Module
  (function(env){
    "use strict";
    // Reference equality check
    (env["ValueCompare"]=env["ValueCompare"]||{}).refEq = function(val1){ return function(val2){ return val1 === val2; }; };
  })(runtimeEnv),

  // Data Unit Module
  (function(env){
    "use strict";
    // The Unit value (like void in JS, but a distinct value)
    (env["Scalar"]=env["Scalar"]||{}).unit = {};
  })(runtimeEnv),

  // Data Show Module (Part 1)
  (function(env){
    "use strict";
    // Convert integer to string
    (env["ValueDisplay"]=env["ValueDisplay"]||{}).showIntImplementation = function(val){ return val.toString(); };
  })(runtimeEnv),

  // Data Show Module (Part 2)
  (function(env){
    "use strict";
    var ValueDisplayUtil = runtimeEnv["ValueDisplay"],
        // Show Type Constructor
        ShowType = function(displayFunc){ this.show = displayFunc; },
        // Instance for integers
        intShowInstance = new ShowType(ValueDisplayUtil.showIntImplementation);

    env.Show = ShowType;
    env.showValue = function(instance){ return instance.show; };
    env.showInt = intShowInstance;
  })(runtimeEnv["ValueDisplay"]=runtimeEnv["ValueDisplay"]||{}),

  // Data Unit Module (Part 2, re-export)
  (function(env){
    "use strict";
    var ScalarUtil = runtimeEnv["Scalar"];
    env.unitValue = ScalarUtil.unit;
  })(runtimeEnv["Scalar"]=runtimeEnv["Scalar"]||{}),

  // Data Equality Module (Part 2)
  (function(env){
    "use strict";
    var ValueCompareUtil = runtimeEnv["ValueCompare"],
        // Eq Type Constructor
        EqType = function(equalityFunc){ this.eq = equalityFunc; },
        // Instance for integers
        intEqInstance = new EqType(ValueCompareUtil.refEq);

    env.Eq = EqType;
    env.checkEquality = function(instance){ return instance.eq; };
    env.eqInt = intEqInstance;
  })(runtimeEnv["ValueCompare"]=runtimeEnv["ValueCompare"]||{}),

  // Data Ord Unsafe Module
  (function(env){
    "use strict";
    // Unsafe comparison implementation for Ord
    (env["Sorting"]=env["Sorting"]||{}).unsafeCompareImplementation = function(lessThanVal){
      return function(equalVal){
        return function(greaterThanVal){
          return function(valA){
            return function(valB){
              return valA < valB ? lessThanVal : valA === valB ? equalVal : greaterThanVal;
            };
          };
        };
      };
    };
  })(runtimeEnv),

  // Data Semigroup Module
  (function(env){
    "use strict";
    env.Semigroup = function(appendFunc){ this.append = appendFunc; };
    env.appendValues = function(instance){ return instance.append; };
  })(runtimeEnv["Data.Semigroup"]=runtimeEnv["Data.Semigroup"]||{}),

  // Data Ordering Module
  (function(env){
    "use strict";
    // Ordering values: Less Than, Greater Than, Equal
    var LtSingleton = (function(){ function Lt(){ /* empty */ } return Lt.value = new Lt(), Lt; })(),
        GtSingleton = (function(){ function Gt(){ /* empty */ } return Gt.value = new Gt(), Gt; })(),
        EqSingleton = (function(){ function Eq(){ /* empty */ } return Eq.value = new Eq(), Eq; })();

    env.LT = LtSingleton;
    env.GT = GtSingleton;
    env.EQ = EqSingleton;
  })(runtimeEnv["ComparisonResult"]=runtimeEnv["ComparisonResult"]||{}),

  // Data Ord Unsafe Module (Part 2)
  (function(env){
    "use strict";
    var SortingUtil = runtimeEnv["Sorting"],
        ComparisonResultUtil = runtimeEnv["ComparisonResult"],
        // Unsafe compare function using predefined ordering values
        unsafeCompareFunc = SortingUtil.unsafeCompareImplementation(ComparisonResultUtil.LT.value)(ComparisonResultUtil.EQ.value)(ComparisonResultUtil.GT.value);

    env.unsafeCompare = unsafeCompareFunc;
  })(runtimeEnv["Sorting"]=runtimeEnv["Sorting"]||{}),

  // Data Semiring Module (Part 1)
  (function(env){
    "use strict";
    env.intAddition = function(x){ return function(y){ return x + y | 0; }; };
    env.intMultiplication = function(x){ return function(y){ return x * y | 0; }; };
  })(runtimeEnv["NumericOperations"]=runtimeEnv["NumericOperations"]||{}),

  // Data Semiring Module (Part 2)
  (function(env){
    "use strict";
    var NumericOpsUtil = runtimeEnv["NumericOperations"],
        // Semiring Type Constructor
        SemiringType = function(addFunc, mulFunc, oneVal, zeroVal){ this.add = addFunc; this.mul = mulFunc; this.one = oneVal; this.zero = zeroVal; },
        // Instance for integers
        intSemiringInstance = new SemiringType(NumericOpsUtil.intAddition, NumericOpsUtil.intMultiplication, 1, 0);

    env.Semiring = SemiringType;
    env.add = function(instance){ return instance.add; };
    env.zero = function(instance){ return instance.zero; };
    env.multiply = function(instance){ return instance.mul; };
    env.one = function(instance){ return instance.one; };
    env.semiringInt = intSemiringInstance;
  })(runtimeEnv["NumericOperations"]=runtimeEnv["NumericOperations"]||{}),

  // Data Ord Module
  (function(env){
    "use strict";
    var ValueCompareUtil = runtimeEnv["ValueCompare"],
        SortingUtil = runtimeEnv["Sorting"],
        ComparisonResultUtil = runtimeEnv["ComparisonResult"],
        // Ord Type Constructor
        OrdType = function(eqInstance, compareFunc){ this.Eq0 = eqInstance; this.compare = compareFunc; },
        // Instance for integers
        intOrdInstance = new OrdType(function(){ return ValueCompareUtil.eqInt; }, SortingUtil.unsafeCompare),
        // Helper to get compare function
        getComparator = function(instance){ return instance.compare; };

    env.Ord = OrdType;
    env.compareValues = getComparator;
    env.findMinimum = function(ordInstance){
      return function(valA){
        return function(valB){
          var comparisonResult = getComparator(ordInstance)(valA)(valB);
          if(comparisonResult instanceof ComparisonResultUtil.LT) return valA;
          if(comparisonResult instanceof ComparisonResultUtil.EQ) return valA; // Or valB, doesn't matter
          if(comparisonResult instanceof ComparisonResultUtil.GT) return valB;
          // Fallback for unexpected comparison result, though PureScript typically ensures exhaustiveness
          throw new Error("Invalid comparison outcome in findMinimum: " + comparisonResult.constructor.name);
        };
      };
    };
    env.ordInt = intOrdInstance;
  })(runtimeEnv["Sorting"]=runtimeEnv["Sorting"]||{}),

  // Data Function Module
  (function(env){
    "use strict";
    env.flipArgs = function(func){ return function(arg2){ return function(arg1){ return func(arg1)(arg2); }; }; };
    env.constant = function(val){ return function(anyArg){ return val; }; };
  })(runtimeEnv["Functional"]=runtimeEnv["Functional"]||{}),

  // Data Functor Module (Part 1)
  (function(env){
    "use strict";
    // Array mapping function
    (env["CollectionOps"]=env["CollectionOps"]||{}).arrayMap = function(mappingFunc){
      return function(inputArray){
        var len = inputArray.length, newArray = new Array(len);
        for(var i = 0; i < len; i++){
          newArray[i] = mappingFunc(inputArray[i]);
        }
        return newArray;
      };
    };
  })(runtimeEnv),

  // Data Functor Module (Part 2)
  (function(env){
    "use strict";
    var CollectionOpsUtil = runtimeEnv["CollectionOps"],
        FunctionalUtil = runtimeEnv["Functional"],
        ScalarUtil = runtimeEnv["Scalar"],
        // Functor Type Constructor
        FunctorType = function(mapFunc){ this.map = mapFunc; },
        // Helper to get map function
        getMapper = function(instance){ return instance.map; },
        // Instance for arrays
        arrayFunctorInstance = new FunctorType(CollectionOpsUtil.arrayMap);

    env.Functor = FunctorType;
    env.map = getMapper;
    env.voidResult = function(functorInstance){ return getMapper(functorInstance)(FunctionalUtil.constant(ScalarUtil.unitValue)); };
    env.functorArray = arrayFunctorInstance;
  })(runtimeEnv["CollectionOps"]=runtimeEnv["CollectionOps"]||{}),

  // Control Apply Module
  (function(env){
    "use strict";
    var FlowOpsUtil = runtimeEnv["FlowOps"],
        FlowCategoryUtil = runtimeEnv["FlowOps"],
        FunctionalUtil = runtimeEnv["Functional"],
        CollectionOpsUtil = runtimeEnv["CollectionOps"],
        // Apply Type Constructor
        ApplyType = function(functorInstance, applyFunc){ this.Functor0 = functorInstance; this.apply = applyFunc; },
        // Instance for arrays
        arrayApplyInstance = new ApplyType(function(){ return CollectionOpsUtil.functorArray; }, FlowOpsUtil.arrayApply),
        // Helper to get apply function
        getApplier = function(instance){ return instance.apply; };

    env.Apply = ApplyType;
    env.apply = getApplier;
    env.applySecond = function(applyInstance){
      return function(funcContainer1){
        return function(funcContainer2){
          // Applies funcContainer1, then funcContainer2, discarding the result of funcContainer1
          var identityFunc = FlowCategoryUtil.getIdentity(FlowCategoryUtil.functionCategory);
          var mappedFunc = CollectionOpsUtil.map(applyInstance.Functor0())(FunctionalUtil.constant(identityFunc))(funcContainer1);
          return getApplier(applyInstance)(mappedFunc)(funcContainer2);
        };
      };
    };
    env.applyArray = arrayApplyInstance;
  })(runtimeEnv["FlowOps"]=runtimeEnv["FlowOps"]||{}),

  // Control Applicative Module
  (function(env){
    "use strict";
    var FlowOpsUtil = runtimeEnv["FlowOps"],
        ScalarUtil = runtimeEnv["Scalar"],
        // Helper to get pure function
        getPure = function(instance){ return instance.pure; };

    env.Applicative = function(applyInstance, pureFunc){ this.Apply0 = applyInstance; this.pure = pureFunc; };
    env.pure = getPure;
    env.liftA1 = function(applicativeInstance){
      return function(func){
        return function(valueContainer){
          var applyInstance = applicativeInstance.Apply0();
          return FlowOpsUtil.apply(applyInstance)(getPure(applicativeInstance)(func))(valueContainer);
        };
      };
    };
    env.when = function(applicativeInstance){
      return function(condition){
        return function(action){
          // Execute action if condition is true, otherwise return unit
          if(condition) return action;
          if(!condition) return getPure(applicativeInstance)(ScalarUtil.unitValue);
          // Fallback, though PureScript typically ensures condition is boolean
          throw new Error("Invalid condition type in 'when': " + [condition.constructor.name, action.constructor.name]);
        };
      };
    };
  })(runtimeEnv["FlowOps"]=runtimeEnv["FlowOps"]||{}),

  // Control Bind Module (Part 1)
  (function(env){
    "use strict";
    // Array binding (flatMap) function
    (env["FlowOps"]=env["FlowOps"]||{}).arrayBind = function(inputArray){
      return function(bindFunc){
        var resultArray = [];
        for(var i = 0, len = inputArray.length; i < len; i++){
          Array.prototype.push.apply(resultArray, bindFunc(inputArray[i]));
        }
        return resultArray;
      };
    };
  })(runtimeEnv),

  // Control Bind Module (Part 2)
  (function(env){
    "use strict";
    var FlowApplyUtil = runtimeEnv["FlowOps"],
        FunctionalUtil = runtimeEnv["Functional"],
        // Bind Type Constructor
        BindType = function(applyInstance, bindFunc){ this.Apply0 = applyInstance; this.bind = bindFunc; },
        // Instance for arrays
        arrayBindInstance = new BindType(function(){ return FlowApplyUtil.applyArray; }, runtimeEnv["FlowOps"].arrayBind),
        // Helper to get bind function
        getBinder = function(instance){ return instance.bind; };

    env.Bind = BindType;
    env.bind = getBinder;
    env.bindFlipped = function(bindInstance){ return FunctionalUtil.flipArgs(getBinder(bindInstance)); };
    env.composeKleisliFlipped = function(bindInstance){
      return function(func1){
        return function(func2){
          return function(arg){
            return env.bindFlipped(bindInstance)(func1)(func2(arg));
          };
        };
      };
    };
    env.bindArray = arrayBindInstance;
  })(runtimeEnv["FlowOps"]=runtimeEnv["FlowOps"]||{}),

  // Control Monad ST Internal Module (Part 1)
  (function(env){
    "use strict";
    env.mapState = function(mapFunc){ return function(stateAction){ return function(){ return mapFunc(stateAction()); }; }; };
    env.pureState = function(val){ return function(){ return val; }; };
    env.bindState = function(stateAction1){ return function(stateAction2){ return function(){ return stateAction2(stateAction1())(); }; }; };
    env.loopRange = function(start){
      return function(end){
        return function(action){
          return function(){
            for(var i = start; i < end; i++){
              action(i)();
            }
          };
        };
      };
    };
    env.modifyState = function(updateFunc){
      return function(refObject){
        return function(){
          var currentVal = refObject.value,
              newValue = updateFunc(currentVal);
          return refObject.value = newValue.state, newValue.value;
        };
      };
    };
  })(runtimeEnv["StateMonad"]=runtimeEnv["StateMonad"]||{}),

  // Control Monad Module
  (function(env){
    "use strict";
    var FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowBindUtil = runtimeEnv["FlowOps"];

    env.Monad = function(applicativeInstance, bindInstance){ this.Applicative0 = applicativeInstance; this.Bind1 = bindInstance; };
    env.ap = function(monadInstance){
      return function(funcContainer){
        return function(valContainer){
          var bindInstance = monadInstance.Bind1(),
              applicativeInstance = monadInstance.Applicative0();
          return FlowBindUtil.bind(bindInstance)(funcContainer)(function(func){
            return FlowBindUtil.bind(bindInstance)(valContainer)(function(val){
              return FlowApplicativeUtil.pure(applicativeInstance)(func(val));
            });
          });
        };
      };
    };
  })(runtimeEnv["FlowOps"]=runtimeEnv["FlowOps"]||{}),

  // Partial Unsafe Module
  (function(env){
    "use strict";
    (env["Unsafe"]=env["Unsafe"]||{}).unsafePartial = function(func){ return func(); };
  })(runtimeEnv),

  // Partial Module
  (function(env){
    "use strict";
    (env["Partial"]=env["Partial"]||{}).crashWithError = function(){ return function(msg){ throw new Error(msg); }; };
  })(runtimeEnv),

  // Partial Module (re-export)
  (function(env){
    "use strict";
    var PartialUtil = runtimeEnv.Partial;
    env.crashWith = PartialUtil.crashWithError;
  })(runtimeEnv.Partial=runtimeEnv.Partial||{}),

  // Partial Unsafe Module (Part 2)
  (function(env){
    "use strict";
    var UnsafeUtil = runtimeEnv["Unsafe"],
        PartialUtil = runtimeEnv.Partial;
    env.unsafeCrashWith = function(msg){ return UnsafeUtil.unsafePartial(function(partialFunc){ return PartialUtil.crashWith(partialFunc)(msg); }); };
  })(runtimeEnv["Unsafe"]=runtimeEnv["Unsafe"]||{}),

  // Control Monad ST Internal Module (Part 2)
  (function(env){
    "use strict";
    var StateMonadInternal = runtimeEnv["StateMonad"],
        FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowApplyUtil = runtimeEnv["FlowOps"],
        FlowBindUtil = runtimeEnv["FlowOps"],
        FlowMonadUtil = runtimeEnv["FlowOps"],
        CollectionOpsUtil = runtimeEnv["CollectionOps"],

        // Functor instance for ST
        stFunctorInstance = new CollectionOpsUtil.Functor(StateMonadInternal.mapState),
        // Monad instance for ST
        stMonadInstance = new FlowMonadUtil.Monad(function(){ return stApplicativeInstance; }, function(){ return stBindInstance; }),
        // Bind instance for ST
        stBindInstance = new FlowBindUtil.Bind(function(){ return stApplyInstance; }, StateMonadInternal.bindState),
        // Apply instance for ST
        stApplyInstance = new FlowApplyUtil.Apply(function(){ return stFunctorInstance; }, FlowMonadUtil.ap(stMonadInstance)),
        // Applicative instance for ST
        stApplicativeInstance = new FlowApplicativeUtil.Applicative(function(){ return stApplyInstance; }, StateMonadInternal.pureState);

    env.modifyRef = function(updateFunc){
      return StateMonadInternal.modifyState(function(current){
        var updated = updateFunc(current);
        return { state: updated, value: updated }; // PureScript 'modify' also returns the new state as value
      });
    };
    env.functorST = stFunctorInstance;
    env.applyST = stApplyInstance;
    env.applicativeST = stApplicativeInstance;
    env.bindST = stBindInstance;
    env.monadST = stMonadInstance;
    env.forRange = StateMonadInternal.loopRange;
  })(runtimeEnv["StateMonad"]=runtimeEnv["StateMonad"]||{}),

  // Data Array Module (Part 1)
  (function(env){
    "use strict";
    env.getArrayLength = function(arr){ return arr.length; };
    env.unconsArray = function(ifEmpty){
      return function(ifNonEmpty){
        return function(arr){
          return 0===arr.length ? ifEmpty({}) : ifNonEmpty(arr[0])(arr.slice(1));
        };
      };
    };
    env.sliceArray = function(startIdx){ return function(endIdx){ return function(arr){ return arr.slice(startIdx, endIdx); }; }; };
  })(runtimeEnv["ListOperations"]=runtimeEnv["ListOperations"]||{}),

  // Data Foldable Module (Part 1)
  (function(env){
    "use strict";
    env.foldrArray = function(foldFunc){
      return function(initialVal){
        return function(arr){
          var accumulator = initialVal;
          for(var i = arr.length - 1; i >= 0; i--){
            accumulator = foldFunc(arr[i])(accumulator);
          }
          return accumulator;
        };
      };
    };
    env.foldlArray = function(foldFunc){
      return function(initialVal){
        return function(arr){
          var accumulator = initialVal;
          for(var i = 0, len = arr.length; i < len; i++){
            accumulator = foldFunc(accumulator)(arr[i]);
          }
          return accumulator;
        };
      };
    };
  })(runtimeEnv["CollectionTraversal"]=runtimeEnv["CollectionTraversal"]||{}),

  // Data Bounded Module (Part 1)
  (function(env){
    "use strict";
    env.maxIntVal = 2147483647;
    env.minIntVal = -2147483648;
  })(runtimeEnv["NumericBounds"]=runtimeEnv["NumericBounds"]||{}),

  // Data Bounded Module (Part 2)
  (function(env){
    "use strict";
    var NumericBoundsUtil = runtimeEnv["NumericBounds"],
        SortingUtil = runtimeEnv["Sorting"],
        // Bounded Type Constructor
        BoundedType = function(ordInstance, bottomVal, topVal){ this.Ord0 = ordInstance; this.bottom = bottomVal; this.top = topVal; },
        // Instance for integers
        intBoundedInstance = new BoundedType(function(){ return SortingUtil.ordInt; }, NumericBoundsUtil.minIntVal, NumericBoundsUtil.maxIntVal);

    env.Bounded = BoundedType;
    env.getBottom = function(instance){ return instance.bottom; };
    env.getTop = function(instance){ return instance.top; };
    env.boundedInt = intBoundedInstance;
  })(runtimeEnv["NumericBounds"]=runtimeEnv["NumericBounds"]||{}),

  // Data Monoid Module
  (function(env){
    "use strict";
    env.Monoid = function(semigroupInstance, emptyVal){ this.Semigroup0 = semigroupInstance; this.mempty = emptyVal; };
    env.getMempty = function(instance){ return instance.mempty; };
  })(runtimeEnv["Data.Monoid"]=runtimeEnv["Data.Monoid"]||{}),

  // Data Maybe Module
  (function(env){
    "use strict";
    // Maybe values: Nothing, Just
    var NothingSingleton = (function(){ function Nothing(){ /* empty */ } return Nothing.value = new Nothing(), Nothing; })(),
        JustType = (function(){ function Just(val){ this.value0 = val; } return Just.create = function(val){ return new Just(val); }, Just; })();

    env.Nothing = NothingSingleton;
    env.Just = JustType;
    env.maybe = function(onNothing){
      return function(onJust){
        return function(maybeVal){
          if(maybeVal instanceof NothingSingleton) return onNothing;
          if(maybeVal instanceof JustType) return onJust(maybeVal.value0);
          // Fallback for unexpected Maybe type
          throw new Error("Invalid Maybe type in 'maybe' function: " + [onNothing.constructor.name, onJust.constructor.name, maybeVal.constructor.name]);
        };
      };
    };
  })(runtimeEnv["OptionalValues"]=runtimeEnv["OptionalValues"]||{}),

  // Data Foldable Module (Part 2)
  (function(env){
    "use strict";
    var CollectionTraversalUtil = runtimeEnv["CollectionTraversal"],
        FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowApplyUtil = runtimeEnv["FlowOps"],
        DataSemigroupUtil = runtimeEnv["Data.Semigroup"],
        DataMonoidUtil = runtimeEnv["Data.Monoid"],
        ScalarUtil = runtimeEnv["Scalar"],

        // Foldable Type Constructor
        FoldableType = function(foldMapFunc, foldlFunc, foldrFunc){ this.foldMap = foldMapFunc; this.foldl = foldlFunc; this.foldr = foldrFunc; },
        // Helper to get foldr function
        getFolderRight = function(instance){ return instance.foldr; },
        // Default foldMap implementation
        defaultFoldMapRight = function(semigroupInstance){
          return function(mappingFunc){
            return function(foldableInstance){
              // Fold right, mapping values to semigroup elements and then combining
              return getFolderRight(foldableInstance)(function(element){
                return function(accumulator){
                  return DataSemigroupUtil.appendValues(semigroupInstance)(mappingFunc(element))(accumulator);
                };
              })(DataMonoidUtil.getMempty(semigroupInstance));
            };
          };
        },
        // Instance for arrays
        arrayFoldableInstance = new FoldableType(function(semigroupInstance){ return defaultFoldMapRight(semigroupInstance)(arrayFoldableInstance); }, CollectionTraversalUtil.foldlArray, CollectionTraversalUtil.foldrArray);

    env.Foldable = FoldableType;
    env.foldr = getFolderRight;
    env.foldl = function(instance){ return instance.foldl; };
    env.foldMap = function(instance){ return instance.foldMap; };
    env.foldMapDefaultR = defaultFoldMapRight;
    env.traverse_ = function(applicativeInstance){
      return function(foldableInstance){
        return function(actionFunc){
          // Traverse, discarding results, accumulating effects
          var applyInstance = applicativeInstance.Apply0();
          return getFolderRight(foldableInstance)(function(element){
            return function(effectAccumulator){
              return FlowApplyUtil.applySecond(applyInstance)(actionFunc(element))(effectAccumulator);
            };
          })(FlowApplicativeUtil.pure(applicativeInstance)(ScalarUtil.unitValue));
        };
      };
    };
    env.foldableArray = arrayFoldableInstance;
  })(runtimeEnv["CollectionTraversal"]=runtimeEnv["CollectionTraversal"]||{}),

  // Data Tuple Module
  (function(env){
    "use strict";
    // Tuple Type Constructor
    var TupleType = (function(){
      function Tuple(val0, val1){ this.value0 = val0; this.value1 = val1; }
      return Tuple.create = function(val0){ return function(val1){ return new Tuple(val0, val1); }; }, Tuple;
    })();
    env.Tuple = TupleType;
  })(runtimeEnv["Data.Tuple"]=runtimeEnv["Data.Tuple"]||{}),

  // Unsafe Coerce Module
  (function(env){
    "use strict";
    (env["Unsafe"]=env["Unsafe"]||{}).unsafeCoerceValue = function(val){ return val; };
  })(runtimeEnv),

  // Unsafe Coerce Module (re-export)
  (function(env){
    "use strict";
    var UnsafeUtil = runtimeEnv["Unsafe"];
    env.unsafeCoerce = UnsafeUtil.unsafeCoerceValue;
  })(runtimeEnv["Unsafe"]=runtimeEnv["Unsafe"]||{}),

  // Data Array Module (Part 2)
  (function(env){
    "use strict";
    var ListOpsUtil = runtimeEnv["ListOperations"],
        FlowBindUtil = runtimeEnv["FlowOps"],
        OptionalValuesUtil = runtimeEnv["OptionalValues"],
        FunctionalUtil = runtimeEnv["Functional"],

        // Uncons array returning Maybe type
        unconsArrayMaybe = ListOpsUtil.unconsArray(FunctionalUtil.constant(OptionalValuesUtil.Nothing.value))(function(head){ return function(tail){ return new OptionalValuesUtil.Just({head: head, tail: tail}); }; }),
        // Create singleton array
        singletonArray = function(val){ return [val]; },
        // Concatenate map (flatMap) for arrays
        concatMapArrays = FunctionalUtil.flipArgs(FlowBindUtil.bind(FlowBindUtil.bindArray));

    env.singleton = singletonArray;
    env.uncons = unconsArrayMaybe;
    env.concatMap = concatMapArrays;
    env.mapMaybe = function(mappingFunc){
      return concatMapArrays(function(element){
        // Map, then if Just, wrap in singleton array, else empty array
        return OptionalValuesUtil.maybe([])(singletonArray)(mappingFunc(element));
      });
    };
  })(runtimeEnv["ListOperations"]=runtimeEnv["ListOperations"]||{}),

  // Data Either Module
  (function(env){
    "use strict";
    var FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowApplyUtil = runtimeEnv["FlowOps"],
        FlowBindUtil = runtimeEnv["FlowOps"],
        CollectionOpsUtil = runtimeEnv["CollectionOps"],
        OptionalValuesUtil = runtimeEnv["OptionalValues"],

        // Left Type Constructor
        LeftType = (function(){ function Left(val){ this.value0 = val; } return Left.create = function(val){ return new Left(val); }, Left; })(),
        // Right Type Constructor
        RightType = (function(){ function Right(val){ this.value0 = val; } return Right.create = function(val){ return new Right(val); }, Right; })(),

        // Functor instance for Either
        eitherFunctorInstance = new CollectionOpsUtil.Functor(function(mapFunc){
          return function(eitherVal){
            if(eitherVal instanceof LeftType) return new LeftType(eitherVal.value0);
            if(eitherVal instanceof RightType) return new RightType(mapFunc(eitherVal.value0));
            throw new Error("Invalid Either type in functor map: " + eitherVal.constructor.name);
          };
        }),

        // Helper to handle Either values
        handleEither = function(onLeft){
          return function(onRight){
            return function(eitherVal){
              if(eitherVal instanceof LeftType) return onLeft(eitherVal.value0);
              if(eitherVal instanceof RightType) return onRight(eitherVal.value0);
              throw new Error("Invalid Either type in handleEither: " + [onLeft.constructor.name, onRight.constructor.name, eitherVal.constructor.name]);
            };
          };
        },

        // Apply instance for Either
        eitherApplyInstance = new FlowApplyUtil.Apply(function(){ return eitherFunctorInstance; }, function(funcEither){
          return function(valEither){
            if(funcEither instanceof LeftType) return new LeftType(funcEither.value0);
            if(funcEither instanceof RightType) return CollectionOpsUtil.map(eitherFunctorInstance)(funcEither.value0)(valEither);
            throw new Error("Invalid Either type in applyEither: " + [funcEither.constructor.name, valEither.constructor.name]);
          };
        }),

        // Bind instance for Either
        eitherBindInstance = new FlowBindUtil.Bind(function(){ return eitherApplyInstance; }, handleEither(function(leftVal){ return function(func){ return new LeftType(leftVal); }; })(function(rightVal){ return function(func){ return func(rightVal); }; })),

        // Applicative instance for Either
        eitherApplicativeInstance = new FlowApplicativeUtil.Applicative(function(){ return eitherApplyInstance; }, RightType.create);

    env.Left = LeftType;
    env.Right = RightType;
    env.either = handleEither;
    env.note = function(leftVal){ return OptionalValuesUtil.maybe(new LeftType(leftVal))(RightType.create); };
    env.functorEither = eitherFunctorInstance;
    env.applyEither = eitherApplyInstance;
    env.applicativeEither = eitherApplicativeInstance;
    env.bindEither = eitherBindInstance;
  })(runtimeEnv["EitherType"]=runtimeEnv["EitherType"]||{}),

  // Data Int Module (Part 1)
  (function(env){
    "use strict";
    env.fromStringAsImplementation = function(onSuccess){
      return function(onFailure){
        return function(radix){
          // Determine regex pattern based on radix
          var patternChar;
          if (radix < 11) patternChar = "[0-" + (radix - 1).toString() + "]";
          else if (radix === 11) patternChar = "[0-9a]";
          else patternChar = "[0-9a-" + String.fromCharCode(86 + radix) + "]"; // 86 is char code for 'Z' + 1

          var regex = new RegExp("^[\\+\\-]?" + patternChar + "+$", "i");

          return function(inputString){
            if(regex.test(inputString)){
              var parsedInt = parseInt(inputString, radix);
              // Check if parsedInt is a valid integer (not NaN and within safe integer range if applicable)
              return (parsedInt | 0) === parsedInt ? onSuccess(parsedInt) : onFailure;
            }
            return onFailure;
          };
        };
      };
    };
    env.power = function(base){ return function(exponent){ return 0 | Math.pow(base, exponent); }; };
  })(runtimeEnv["IntegerParsing"]=runtimeEnv["IntegerParsing"]||{}),

  // Data Int Module (Part 2)
  (function(env){
    "use strict";
    var IntegerParsingUtil = runtimeEnv["IntegerParsing"],
        OptionalValuesUtil = runtimeEnv["OptionalValues"],
        // Function to parse string to integer with a given radix
        parseStringRadix = IntegerParsingUtil.fromStringAsImplementation(OptionalValuesUtil.Just.create)(OptionalValuesUtil.Nothing.value),
        // Pre-configured parser for base 10
        parseDecimalString = parseStringRadix(10);

    env.parseString = parseDecimalString;
    env.parseStringAs = parseStringRadix;
    env.pow = IntegerParsingUtil.power;
  })(runtimeEnv["IntegerParsing"]=runtimeEnv["IntegerParsing"]||{}),

  // Data String Common Module (Part 1)
  (function(env){
    "use strict";
    env.stringSplit = function(separator){ return function(inputString){ return inputString.split(separator); }; };
    env.stringTrim = function(inputString){ return inputString.trim(); };
  })(runtimeEnv["TextProcessing"]=runtimeEnv["TextProcessing"]||{}),

  // Data String Common Module (Part 2, re-export)
  (function(env){
    "use strict";
    var TextProcessingUtil = runtimeEnv["TextProcessing"];
    env.split = TextProcessingUtil.stringSplit;
    env.trim = TextProcessingUtil.stringTrim;
  })(runtimeEnv["TextProcessing"]=runtimeEnv["TextProcessing"]||{}),

  // Effect Module (Part 1)
  (function(env){
    "use strict";
    env.pureEffect = function(val){ return function(){ return val; }; };
    env.bindEffect = function(action1){ return function(action2){ return function(){ return action2(action1())(); }; }; };
  })(runtimeEnv.Effect=runtimeEnv.Effect||{}),

  // Effect Module (Part 2)
  (function(env){
    "use strict";
    var EffectInternal = runtimeEnv.Effect,
        FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowApplyUtil = runtimeEnv["FlowOps"],
        FlowBindUtil = runtimeEnv["FlowOps"],
        FlowMonadUtil = runtimeEnv["FlowOps"],
        CollectionOpsUtil = runtimeEnv["CollectionOps"],

        // Monad instance for Effect
        effectMonadInstance = new FlowMonadUtil.Monad(function(){ return effectApplicativeInstance; }, function(){ return effectBindInstance; }),
        // Bind instance for Effect
        effectBindInstance = new FlowBindUtil.Bind(function(){ return effectApplyInstance; }, EffectInternal.bindEffect),
        // Apply instance for Effect
        effectApplyInstance = new FlowApplyUtil.Apply(function(){ return effectFunctorInstance; }, FlowMonadUtil.ap(effectMonadInstance)),
        // Applicative instance for Effect
        effectApplicativeInstance = new FlowApplicativeUtil.Applicative(function(){ return effectApplyInstance; }, EffectInternal.pureEffect),
        // Functor instance for Effect
        effectFunctorInstance = new CollectionOpsUtil.Functor(FlowApplicativeUtil.liftA1(effectApplicativeInstance));

    env.functorEffect = effectFunctorInstance;
    env.applyEffect = effectApplyInstance;
    env.applicativeEffect = effectApplicativeInstance;
    env.bindEffect = effectBindInstance;
    env.monadEffect = effectMonadInstance;
  })(runtimeEnv.Effect=runtimeEnv.Effect||{}),

  // Effect Aff Module (Part 1)
  (function(env){
    "use strict";
    // Internal representation of an Aff computation (Free Monad-like structure)
    var AffTag = {
      Pure: "Pure", Throw: "Throw", Catch: "Catch", Sync: "Sync", Async: "Async",
      Bind: "Bind", Bracket: "Bracket", Fork: "Fork", Sequential: "Sequential",
      Map: "Map", Apply: "Apply", Alt: "Alt", Cons: "Cons", Resume: "Resume",
      Release: "Release", Finalizer: "Finalizer", Finalized: "Finalized", Forked: "Forked"
    };

    // Constructor for Aff computation nodes
    function ComputationNode(tag, val1, val2, val3){ this.tag=tag; this._1=val1; this._2=val2; this._3=val3; }
    // Helper to create tagged constructors
    function createTaggedConstructor(tag){ var ctor = function(v1,v2,v3){ return new ComputationNode(tag,v1,v2,v3); }; return ctor.tag=tag,ctor; }

    // Utility functions for error handling and scheduling
    function runSyncAction(action){ try{ action(); }catch(e){ setTimeout(function(){ throw e; },0); } }
    function runSyncOrCatch(errorHandler, successHandler, action){ try{ return successHandler(action()); }catch(e){ return errorHandler(e); } }
    function runAsyncAction(errorHandler, action, callback){ try{ return action(callback()); }catch(e){ return callback(errorHandler(e))(), createTaggedConstructor("Pure")(undefined); } }

    var scheduler = (function(){
      var queueSize = 1024, currentCount = 0, headIndex = 0,
          taskQueue = new Array(queueSize), isRunning = false;
      function drainQueue(){
        var task;
        for(isRunning=true; 0 !== currentCount;){
          currentCount--, task = taskQueue[headIndex], taskQueue[headIndex]=undefined, headIndex=(headIndex+1)%queueSize, task();
        }
        isRunning = false;
      }
      return {
        isDraining: function(){ return isRunning; },
        enqueue: function(task){
          if(currentCount === queueSize){ // If queue is full, drain it first
            var wasDraining = isRunning; drainQueue(); isRunning = wasDraining;
          }
          taskQueue[(headIndex+currentCount)%queueSize] = task;
          currentCount++;
          if(!isRunning) drainQueue();
        }
      };
    })();

    // Fiber state management
    var FIBER_STATE_INITIAL = 0, FIBER_STATE_RUNNING = 1, FIBER_STATE_SUSPENDED_ASYNC = 2,
        FIBER_STATE_RESUMING = 3, FIBER_STATE_KILLED = 4, FIBER_STATE_DONE = 5;

    // Fiber runner (interprets the Aff computation)
    function FiberInterpreter(eitherApi, supervisor, initialComputation){
      var currentStep = FIBER_STATE_INITIAL,
          currentResult = initialComputation, // Current computation or its result
          lastError = null, // Stores the last error if computation failed
          callStack = null, // Stack of continuations for Bind/Bracket
          continuationStack = null, // Stack of continuations for Map/Apply
          finalizerStack = null, // Stack of finalizers
          finalizerCount = 0, // Count of active finalizers
          cancellationRef = null, // Stores cancellation error if any
          activeListeners = null, // Listeners for fiber completion
          isRethrowing = true, // Flag for rethrowing unhandled errors
          runId = 0; // Unique ID for current run iteration to prevent stale continuations

      // Function to process the next step of the computation
      function processNextStep(runIterationId){
        var nextComputation = null, nextContinuation = null, nextFinalizer = null;
        for(;;){ // Loop to process synchronous steps
          switch(currentStep){
            case FIBER_STATE_RESUMING: // If resuming from a Catch block
              currentStep = FIBER_STATE_RUNNING;
              currentResult = continuationStack(currentResult); // Apply the continuation
              continuationStack = null; // Clear the continuation
              break;
            case FIBER_STATE_RESUMING: // If resuming from a Catch block
              currentStep = FIBER_STATE_RUNNING;
              currentResult = continuationStack(currentResult); // Apply the continuation
              continuationStack = null; // Clear the continuation
              break;
            case FIBER_STATE_SUSPENDED_ASYNC: // If previously suspended by Async
              // This state is set externally by the async continuation, should not be reached here
              // unless an async continuation immediately calls processNextStep
              break;
            case FIBER_STATE_RUNNING: // Normal execution state
              switch(currentResult.tag){
                case AffTag.Bind: // Handle Bind
                  if(callStack) continuationStack = new ComputationNode(AffTag.Cons, continuationStack, continuationStack);
                  callStack = currentResult._2; // Push the bind continuation
                  currentStep = FIBER_STATE_RUNNING;
                  currentResult = currentResult._1; // Continue with the first part of the bind
                  break;
                case AffTag.Pure: // Handle Pure
                  if(callStack === null){ // No more continuations, computation finished
                    currentStep = FIBER_STATE_KILLED;
                    currentResult = eitherApi.right(currentResult._1);
                  } else { // Apply continuation
                    currentStep = FIBER_STATE_RESUMING;
                    currentResult = currentResult._1; // Pass pure value to continuation
                  }
                  break;
                case AffTag.Sync: // Handle Sync (Effect)
                  currentStep = FIBER_STATE_RESUMING;
                  currentResult = runSyncOrCatch(eitherApi.left, eitherApi.right, currentResult._1);
                  break;
                case AffTag.Async: // Handle Async
                  currentStep = FIBER_STATE_SUSPENDED_ASYNC; // Suspend fiber
                  // Run the async action with a callback that will resume the fiber
                  return runAsyncAction(eitherApi.left, currentResult._1, function(cb){
                    return function(){
                      runIterationId === runId && (runId++, scheduler.enqueue(function(){ // Ensure we're resuming the correct run
                        runId === runIterationId+1 && (currentStep = FIBER_STATE_RESUMING, currentResult = cb, processNextStep(runId));
                      }));
                    };
                  });
                case AffTag.Throw: // Handle Throw
                  currentStep = FIBER_STATE_KILLED;
                  lastError = eitherApi.left(currentResult._1);
                  currentResult = null; // Clear computation
                  break;
                case AffTag.Catch: // Handle Catch
                  // Push the catch block to finalizer stack, then continue with inner computation
                  finalizerStack = new ComputationNode(AffTag.Cons, currentResult, (callStack===null ? finalizerStack : new ComputationNode(AffTag.Resume, callStack, continuationStack)), cancellationRef);
                  callStack = null; continuationStack = null; // Clear continuations for the inner computation
                  currentStep = FIBER_STATE_RUNNING; currentResult = currentResult._1;
                  break;
                case AffTag.Bracket: // Handle Bracket (resource acquisition)
                  finalizerCount++;
                  finalizerStack = new ComputationNode(AffTag.Cons, currentResult, (callStack===null ? finalizerStack : new ComputationNode(AffTag.Resume, callStack, continuationStack)), cancellationRef);
                  callStack = null; continuationStack = null;
                  currentStep = FIBER_STATE_RUNNING; currentResult = currentResult._1;
                  break;
                case AffTag.Fork: // Handle Fork (start new fiber)
                  currentStep = FIBER_STATE_RESUMING;
                  var newFiber = FiberInterpreter(eitherApi, supervisor, currentResult._2);
                  supervisor && supervisor.register(newFiber); // Register with supervisor if present
                  if(currentResult._1) newFiber.runFiber(); // Start immediately if eager
                  currentResult = eitherApi.right(newFiber);
                  break;
                case AffTag.Sequential: // Handle Sequential (run parallel computation sequentially)
                  currentStep = FIBER_STATE_RUNNING;
                  currentResult = runSequentialParAff(eitherApi, supervisor, currentResult._1);
                  break;
              }
              break;
            case FIBER_STATE_KILLED: // Fiber is finished or killed
              callStack = null; continuationStack = null; // Clear all stacks

              // Process finalizers
              if(finalizerStack === null){ // No more finalizers
                currentStep = FIBER_STATE_DONE;
                currentResult = cancellationRef || lastError || currentResult;
              } else { // Process next finalizer
                nextComputation = finalizerStack._3; // Stored cancellation ref
                nextFinalizer = finalizerStack._1;
                finalizerStack = finalizerStack._2; // Pop finalizer
                if(nextFinalizer.tag === AffTag.Catch){
                  if(cancellationRef && cancellationRef !== nextComputation){ /* skip */ }
                  else if(lastError){ // Execute catch block if there was an error
                    currentStep = FIBER_STATE_RUNNING;
                    currentResult = nextFinalizer._2(eitherApi.fromLeft(lastError));
                    lastError = null; // Error handled
                  }
                } else if(nextFinalizer.tag === AffTag.Resume){ // Resume previous continuations
                  if(cancellationRef && cancellationRef !== nextComputation){ /* skip */ }
                  else if(!lastError){ // Only resume if no error
                    callStack = nextFinalizer._1;
                    continuationStack = nextFinalizer._2;
                    currentStep = FIBER_STATE_RESUMING;
                    currentResult = eitherApi.fromRight(currentResult);
                  }
                } else if(nextFinalizer.tag === AffTag.Bracket){ // Process bracket finalizer
                  finalizerCount--;
                  if(lastError === null){ // If no error, run 'completed' finalizer
                    finalizerStack = new ComputationNode(AffTag.Cons, new ComputationNode(AffTag.Finalized, currentResult, lastError), finalizerStack, nextComputation);
                    currentStep = FIBER_STATE_RUNNING;
                    currentResult = nextFinalizer._3(eitherApi.fromRight(currentResult))(nextFinalizer._2);
                  } else { // If error, run 'failed' finalizer
                    finalizerStack = new ComputationNode(AffTag.Cons, new ComputationNode(AffTag.Finalized, currentResult, lastError), finalizerStack, nextComputation);
                    currentStep = FIBER_STATE_RUNNING;
                    currentResult = nextFinalizer._2(eitherApi.fromLeft(lastError))(nextFinalizer._2);
                    lastError = null; // Error handled
                  }
                } else if(nextFinalizer.tag === AffTag.Finalizer){ // Process generic finalizer
                  finalizerCount++;
                  finalizerStack = new ComputationNode(AffTag.Cons, new ComputationNode(AffTag.Finalized, currentResult, lastError), finalizerStack, nextComputation);
                  currentStep = FIBER_STATE_RUNNING;
                  currentResult = nextFinalizer._1;
                } else if(nextFinalizer.tag === AffTag.Finalized){ // Finalizer completed
                  finalizerCount--;
                  currentStep = FIBER_STATE_KILLED;
                  currentResult = nextFinalizer._1;
                  lastError = nextFinalizer._2;
                }
              }
              break;
            case FIBER_STATE_DONE: // Final state, notify listeners
              for(var listenerId in activeListeners){
                if(activeListeners.hasOwnProperty(listenerId)){
                  isRethrowing = isRethrowing && activeListeners[listenerId].rethrow;
                  runSyncAction(activeListeners[listenerId].handler(currentResult));
                }
              }
              activeListeners = null; // Clear listeners
              // If there's an unhandled error, rethrow it asynchronously
              if(cancellationRef && lastError){ setTimeout(function(){ throw eitherApi.fromLeft(lastError); },0); }
              else if(eitherApi.isLeft(currentResult) && isRethrowing){ setTimeout(function(){ throw eitherApi.fromLeft(currentResult); },0); }
              return; // Exit interpreter loop
            case FIBER_STATE_INITIAL: // Initial state, transition to running
              currentStep = FIBER_STATE_RUNNING;
              break;
            // No default, should cover all states
          }
        }
      }

      // Registers a completion listener for the fiber
      function registerCompletionListener(listener){
        var listenerId = Math.random().toString(36).substring(2, 9); // Simple unique ID
        return (activeListeners = activeListeners || {})[listenerId] = listener, function(){
          activeListeners && delete activeListeners[listenerId];
        };
      }

      return {
        // Kill the fiber with a specific error
        killFiber: function(killError, completionCallback){
          return function(){
            if(currentStep === FIBER_STATE_DONE) return completionCallback(eitherApi.right(undefined))(), function(){};
            var cleanupListener = registerCompletionListener({rethrow:false,handler:function(){ return completionCallback(eitherApi.right(undefined)); }})();
            switch(currentStep){
              case FIBER_STATE_INITIAL:
                cancellationRef = eitherApi.left(killError);
                currentStep = FIBER_STATE_DONE;
                currentResult = cancellationRef;
                processNextStep(runId);
                break;
              case FIBER_STATE_SUSPENDED_ASYNC:
                cancellationRef = cancellationRef || eitherApi.left(killError);
                if(finalizerCount === 0){
                  currentStep = FIBER_STATE_KILLED; currentResult = null; lastError = null;
                  processNextStep(++runId); // Force a new run iteration
                }
                break;
              default:
                cancellationRef = cancellationRef || eitherApi.left(killError);
                if(finalizerCount === 0){
                  currentStep = FIBER_STATE_KILLED; currentResult = null; lastError = null;
                }
            }
            return cleanupListener;
          };
        },
        // Wait for fiber completion
        awaitCompletion: function(callback){
          return function(){
            var cleanupListener = registerCompletionListener({rethrow:false,handler:callback})();
            currentStep === FIBER_STATE_INITIAL && processNextStep(runId); // Start if not already running
            return cleanupListener;
          };
        },
        // Get fiber suspension status
        isSuspended: function(){ return currentStep === FIBER_STATE_INITIAL; },
        // Start or resume fiber execution
        runFiber: function(){
          if(currentStep === FIBER_STATE_INITIAL){
            scheduler.isDraining() ? processNextStep(runId) : scheduler.enqueue(function(){ processNextStep(runId); });
          }
        }
      };
    }

    // Parallel Aff execution logic
    function runParallelAff(eitherApi, supervisor, initialParAff){
      var fiberCounter = 0, // Counter for active fibers
          fiberMap = {}, // Map of fiber IDs to FiberInterpreters
          earlyExitError = new Error("[ParAff] Early exit due to cancellation"),
          cancellationResult = null; // Stores cancellation error if any

      // Function to handle fiber completion
      function handleFiberCompletion(fiberId, completionResult){
        return function(){
          delete fiberMap[fiberId]; // Remove fiber from map
          fiberMap[fiberId]._3 = completionResult; // Store result on node

          // Recursive function to propagate results / cancellations
          (function propagateResult(currentResult, parAffNode, parentChain){
            var leftResult, rightResult;
            if(eitherApi.isLeft(currentResult)){ leftResult = currentResult; rightResult = null; }
            else { rightResult = currentResult; leftResult = null; }

            for(;;){ // Loop to process nodes in the parallel DAG
              // If we already have a cancellation, stop propagation
              if(cancellationResult !== null) return;
              // If no more nodes in chain, or node already processed, stop
              if(parAffNode === null || parAffNode._3 !== undefined) return;

              switch(parAffNode.tag){
                case AffTag.Map:
                  if(leftResult){ parAffNode._3 = leftResult; }
                  else { parAffNode._3 = eitherApi.right(parAffNode._1(eitherApi.fromRight(rightResult))); }
                  break;
                case AffTag.Apply:
                  var funcResult = parAffNode._1._3, argResult = parAffNode._2._3;
                  if(leftResult){ // If current result is an error
                    parAffNode._3 = leftResult;
                    // If either child resulted in error and we are propagating it, cancel other child
                    // (This is an optimization for early exit)
                    if(leftResult === funcResult){ cancelChildFibers(earlyExitError, parAffNode._2); }
                    else if(leftResult === argResult){ cancelChildFibers(earlyExitError, parAffNode._1); }
                  } else { // If current result is success
                    if(funcResult === undefined || argResult === undefined) return; // Wait for both children
                    parAffNode._3 = eitherApi.right(eitherApi.fromRight(funcResult)(eitherApi.fromRight(argResult)));
                  }
                  break;
                case AffTag.Alt:
                  var alt1Result = parAffNode._1._3, alt2Result = parAffNode._2._3;
                  if(alt1Result === undefined && eitherApi.isLeft(alt2Result) || alt2Result === undefined && eitherApi.isLeft(alt1Result)) return; // Wait for both if one is pending and other is error
                  if(alt1Result !== undefined && eitherApi.isLeft(alt1Result) && alt2Result !== undefined && eitherApi.isLeft(alt2Result)){
                    // If both are errors, pick one (e.g., the one that caused current propagation)
                    leftResult = (currentResult === alt1Result) ? alt2Result : alt1Result;
                    rightResult = null;
                    parAffNode._3 = leftResult;
                  } else if(parAffNode._3 = currentResult, true){ // If current result is success, set and cancel other
                    cancelChildFibers(earlyExitError, (currentResult === alt1Result) ? parAffNode._2 : parAffNode._1);
                  }
                  break;
              }
              // Move up the parent chain
              if(parentChain === null){ parAffNode = null; }
              else { parAffNode = parentChain._1; parentChain = parentChain._2; }
            }
          })(completionResult, fiberMap[fiberId]._2._1, fiberMap[fiberId]._2._2);
        };
      }

      // Function to cancel child fibers
      function cancelChildFibers(error, parAffNode){
        var childNode, nextChild, tempStack = null;
        for(;;){ // Iterate through children
          childNode = null;
          // If node already has a result, no need to cancel
          if(parAffNode && parAffNode._3 === undefined){
            switch(parAffNode.tag){
              case AffTag.Forked: // If it's a fiber
                var fiber = fiberMap[parAffNode._1];
                if(fiber && fiber._3 === undefined){ // If fiber is still running
                  fiberCounter++; // Increment counter for cancellation tasks
                  (function(fId){ // Schedule cancellation
                    fiberCancellationTasks[fId] = fiber.killFiber(error, function(res){ return function(){
                      delete fiberCancellationTasks[fId]; fiberCounter--;
                      if(eitherApi.isLeft(res) && eitherApi.fromLeft(res)){ setTimeout(function(){ throw eitherApi.fromLeft(res); },0); }
                      if(fiberCounter === 0) cancellationCallback(); // If all cancellations done, call final callback
                    }; })();
                  })(parAffNode._1);
                }
                if(tempStack === null) break; // No more children to process
                parAffNode = tempStack._2; tempStack = tempStack._1; // Pop next child
                break;
              case AffTag.Map:
                parAffNode = parAffNode._2; // Continue to child
                break;
              case AffTag.Apply: case AffTag.Alt:
                // Push second child to stack, process first
                if(tempStack) tempStack = new ComputationNode(AffTag.Cons, tempStack, parAffNode._2);
                else tempStack = new ComputationNode(AffTag.Cons, null, parAffNode._2); // Create stack if first element
                parAffNode = parAffNode._1;
                break;
              default:
                if(tempStack === null) break;
                parAffNode = tempStack._2; tempStack = tempStack._1;
                break;
            }
          } else { // Node already has a result or is null
            if(tempStack === null) break;
            parAffNode = tempStack._2; tempStack = tempStack._1;
          }
        }
        // Return a function that can cancel all scheduled cancellations
        return function(){
          for(var taskId in fiberCancellationTasks){
            if(fiberCancellationTasks.hasOwnProperty(taskId)) fiberCancellationTasks[taskId]();
          }
        };
      }

      // This is the actual execution of the ParAff
      return (function(){
        var currentParAffNode, currentParentStack = null;
        var traversalState = FIBER_STATE_RUNNING;

        for(;;){ // Loop to build the parallel DAG
          switch(traversalState){
            case FIBER_STATE_RUNNING:
              switch(initialParAff.tag){
                case AffTag.Map:
                  if(currentParentStack) currentParentStack = new ComputationNode(AffTag.Cons, currentParentStack, currentParentStack);
                  currentParentStack = new ComputationNode(AffTag.Map, initialParAff._1, undefined, undefined); // Map node
                  initialParAff = initialParAff._2; // Move to child
                  break;
                case AffTag.Apply:
                  if(currentParentStack) currentParentStack = new ComputationNode(AffTag.Cons, currentParentStack, currentParentStack);
                  currentParentStack = new ComputationNode(AffTag.Apply, undefined, initialParAff._2, undefined); // Apply node
                  initialParAff = initialParAff._1; // Move to first child
                  break;
                case AffTag.Alt:
                  if(currentParentStack) currentParentStack = new ComputationNode(AffTag.Cons, currentParentStack, currentParentStack);
                  currentParentStack = new ComputationNode(AffTag.Alt, undefined, initialParAff._2, undefined); // Alt node
                  initialParAff = initialParAff._1; // Move to first child
                  break;
                default: // Base case: an Aff computation
                  var newFiberId = fiberCounter++;
                  currentParAffNode = initialParAff;
                  initialParAff = new ComputationNode(AffTag.Forked, newFiberId, new ComputationNode(AffTag.Cons, currentParentStack, currentParentStack), undefined);
                  // Create and run the fiber, register completion handler
                  var fiberInstance = FiberInterpreter(eitherApi, supervisor, currentParAffNode);
                  fiberInstance.awaitCompletion(handleFiberCompletion(newFiberId))();
                  fiberMap[newFiberId] = fiberInstance; // Store fiber instance
                  supervisor && supervisor.register(fiberInstance); // Register with supervisor if present
                  fiberInstance.runFiber(); // Start the fiber
                  traversalState = FIBER_STATE_KILLED; // Done processing this branch
                  break;
              }
              break;
            case FIBER_STATE_KILLED: // Finished processing a branch, unwind parent stack
              if(currentParentStack === null) break; // All done
              // If first child was processed
              if(currentParentStack._1 === undefined){
                currentParentStack._1 = initialParAff; // Assign child result
                traversalState = FIBER_STATE_RUNNING; // Continue processing
                initialParAff = currentParentStack._2; // Get second child (if Apply/Alt)
                currentParentStack = currentParentStack._1; // Pop parent
              } else { // If second child was processed
                currentParentStack._2 = initialParAff; // Assign child result
                initialParAff = currentParentStack; // The parent node becomes the result
                currentParentStack = null; // Clear parent stack
              }
          }
        }

        // Return a canceller for the entire parallel computation
        return function(error, callback){
          return function(){
            cancellationResult = eitherApi.left(error); // Signal cancellation
            var cleanup = cancelChildFibers(error, initialParAff); // Cancel all active children
            // If no active fibers (already completed or no children), call callback immediately
            if(fiberCounter === 0) callback();
            else fiberCancellationTasks.cancellationCallback = callback; // Otherwise, callback when all children are cancelled
            return cleanup; // Return the cleanup function for scheduled cancellations
          };
        };
      })();
    }

    // Constructor for Aff computations (internal)
    var AffConstructors = {
      EMPTY: undefined,
      Pure: createTaggedConstructor(AffTag.Pure),
      Throw: createTaggedConstructor(AffTag.Throw),
      Catch: createTaggedConstructor(AffTag.Catch),
      Sync: createTaggedConstructor(AffTag.Sync),
      Async: createTaggedConstructor(AffTag.Async),
      Bind: createTaggedConstructor(AffTag.Bind),
      Bracket: createTaggedConstructor(AffTag.Bracket),
      Fork: createTaggedConstructor(AffTag.Fork),
      Seq: createTaggedConstructor(AffTag.Sequential),
      ParMap: createTaggedConstructor(AffTag.Map),
      ParApply: createTaggedConstructor(AffTag.Apply),
      ParAlt: createTaggedConstructor(AffTag.Alt),
      Fiber: FiberInterpreter,
      Supervisor: function(eitherApi){
        var runningFibers = {}, nextFiberId = 0, activeFiberCount = 0;
        return {
          register: function(fiber){
            var id = nextFiberId++;
            fiber.awaitCompletion({rethrow:true,handler:function(res){ return function(){ activeFiberCount--, delete runningFibers[id]; }; }})();
            runningFibers[id] = fiber;
            activeFiberCount++;
          },
          isEmpty: function(){ return activeFiberCount === 0; },
          killAll: function(killError, callback){
            return function(){
              var pendingCancellations = 0, cancellationListeners = {};
              function scheduleCancellation(fiberId){
                cancellationListeners[fiberId] = runningFibers[fiberId].killFiber(killError, function(res){ return function(){
                  delete cancellationListeners[fiberId]; pendingCancellations--;
                  if(eitherApi.isLeft(res) && eitherApi.fromLeft(res)){ setTimeout(function(){ throw eitherApi.fromLeft(res); },0); }
                  if(pendingCancellations === 0) callback();
                }; })();
              }
              for(var id in runningFibers) if(runningFibers.hasOwnProperty(id)){ pendingCancellations++; scheduleCancellation(id); }
              runningFibers = {}; nextFiberId = 0; activeFiberCount = 0;
              return function(){
                for(var id in cancellationListeners) if(cancellationListeners.hasOwnProperty(id)) cancellationListeners[id]();
              };
            };
          }
        };
      },
      Scheduler: scheduler,
      nonCanceler: createTaggedConstructor(AffTag.Pure)(undefined) // A no-op canceler
    };

    env._pure = AffConstructors.Pure;
    env._map = function(mapFunc){
      return function(affComputation){
        return affComputation.tag===AffConstructors.Pure.tag ? AffConstructors.Pure(mapFunc(affComputation._1)) : AffConstructors.Bind(affComputation, function(val){ return AffConstructors.Pure(mapFunc(val)); });
      };
    };
    env._bind = function(affComputation){ return function(bindFunc){ return AffConstructors.Bind(affComputation, bindFunc); }; };
    env._liftEffect = AffConstructors.Sync;
    env._parAffMap = function(mapFunc){ return function(parAffComputation){ return AffConstructors.ParMap(mapFunc, parAffComputation); }; };
    env._parAffApply = function(funcParAff){ return function(argParAff){ return AffConstructors.ParApply(funcParAff, argParAff); }; };
    env.makeAff = AffConstructors.Async;
    env._makeFiber = function(eitherApi, supervisor, affComputation){ return function(){ return AffConstructors.Fiber(eitherApi, supervisor, affComputation); }; };
    env._sequential = AffConstructors.Seq;
  })(runtimeEnv["Effect.Aff"]=runtimeEnv["Effect.Aff"]||{}),

  // Effect Class Module
  (function(env){
    "use strict";
    env.liftEffect = function(instance){ return instance.liftEffect; };
    env.MonadEffect = function(monadInstance, liftEffectFunc){ this.Monad0 = monadInstance; this.liftEffect = liftEffectFunc; };
  })(runtimeEnv["Effect.MonadClass"]=runtimeEnv["Effect.MonadClass"]||{}),

  // Effect Ref Module (Part 1)
  (function(env){
    "use strict";
    env.createNewRef = function(initialVal){ return function(){ return {value: initialVal}; }; };
    env.readRef = function(refObject){ return function(){ return refObject.value; }; };
    env.writeRef = function(newVal){ return function(refObject){ return function(){ return refObject.value = newVal, {}; }; }; };
  })(runtimeEnv["Effect.MutableRef"]=runtimeEnv["Effect.MutableRef"]||{}),

  // Effect Ref Module (Part 2, re-export)
  (function(env){
    "use strict";
    var MutableRefUtil = runtimeEnv["Effect.MutableRef"];
    env.new = MutableRefUtil.createNewRef;
    env.read = MutableRefUtil.readRef;
    env.write = MutableRefUtil.writeRef;
  })(runtimeEnv["Effect.MutableRef"]=runtimeEnv["Effect.MutableRef"]||{}),

  // Control Parallel Class Module
  (function(env){
    "use strict";
    env.runParallel = function(instance){ return instance.parallel; };
    env.runSequential = function(instance){ return instance.sequential; };
    env.Parallel = function(applicativeInstance, monadInstance, parallelFunc, sequentialFunc){ this.Applicative1 = applicativeInstance; this.Monad0 = monadInstance; this.parallel = parallelFunc; this.sequential = sequentialFunc; };
  })(runtimeEnv["Control.Parallel.Class"]=runtimeEnv["Control.Parallel.Class"]||{}),

  // Control Parallel Module
  (function(env){
    "use strict";
    var FlowCategoryUtil = runtimeEnv["FlowOps"],
        CollectionTraversalUtil = runtimeEnv["CollectionTraversal"],
        ParallelClassUtil = runtimeEnv["Control.Parallel.Class"],

        // Traverse a Foldable collection in parallel, discarding results
        parallelTraverseDiscard = function(parallelInstance){
          return function(foldableInstance){
            return function(actionFunc){
              return function(collection){
                // Convert each item to a parallel computation, then run all in parallel and sequence
                var applicativeInstance = parallelInstance.Applicative1();
                return ParallelClassUtil.runSequential(parallelInstance)(
                  CollectionTraversalUtil.traverse_(applicativeInstance)(foldableInstance)(function(item){
                    return ParallelClassUtil.runParallel(parallelInstance)(actionFunc(item));
                  })(collection)
                );
              };
            };
          };
        };

    env.parallelTraverseDiscard = parallelTraverseDiscard;
    env.parallelSequenceDiscard = function(parallelInstance){
      return function(collection){
        return parallelTraverseDiscard(parallelInstance)(CollectionTraversalUtil.foldableArray)(FlowCategoryUtil.getIdentity(FlowCategoryUtil.functionCategory))(collection);
      };
    };
  })(runtimeEnv["Control.Parallel"]=runtimeEnv["Control.Parallel"]||{}),

  // Effect Exception Module (Part 1)
  (function(env){
    "use strict";
    env.createErrorObject = function(message){ return new Error(message); };
    env.throwJsException = function(exception){ return function(){ throw exception; }; };
  })(runtimeEnv["Effect.ErrorHandling"]=runtimeEnv["Effect.ErrorHandling"]||{}),

  // Effect Exception Module (Part 2)
  (function(env){
    "use strict";
    var ErrorHandlingUtil = runtimeEnv["Effect.ErrorHandling"];
    env.throw = function(message){ return ErrorHandlingUtil.throwJsException(ErrorHandlingUtil.createErrorObject(message)); };
  })(runtimeEnv["Effect.ErrorHandling"]=runtimeEnv["Effect.ErrorHandling"]||{}),

  // Effect Aff Module (Part 2)
  (function(env){
    "use strict";
    var AffInternal = runtimeEnv["Effect.Aff"],
        FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowApplyUtil = runtimeEnv["FlowOps"],
        FlowBindUtil = runtimeEnv["FlowOps"],
        FlowMonadUtil = runtimeEnv["FlowOps"],
        CollectionOpsUtil = runtimeEnv["CollectionOps"],
        ParallelClassUtil = runtimeEnv["Control.Parallel.Class"],
        ParallelUtil = runtimeEnv["Control.Parallel"],
        EitherTypeUtil = runtimeEnv["EitherType"],
        CollectionTraversalUtil = runtimeEnv["CollectionTraversal"],
        FunctionalUtil = runtimeEnv["Functional"],
        ScalarUtil = runtimeEnv["Scalar"],
        EffectMonadClassUtil = runtimeEnv["Effect.MonadClass"],
        UnsafePartialUtil = runtimeEnv["Unsafe"],
        UnsafeCoerceUtil = runtimeEnv["Unsafe"],

        // Functor instance for Aff (parallel)
        parAffFunctorInstance = new CollectionOpsUtil.Functor(AffInternal._parAffMap),
        // Functor instance for Aff (sequential)
        affFunctorInstance = new CollectionOpsUtil.Functor(AffInternal._map),

        // API for Either type used by Aff runtime
        affEitherApi = {
          isLeft: function(val){
            if(val instanceof EitherTypeUtil.Left) return true;
            if(val instanceof EitherTypeUtil.Right) return false;
            throw new Error("Unexpected value type in Aff runtime isLeft: " + [val.constructor.name]);
          },
          fromLeft: function(val){
            if(val instanceof EitherTypeUtil.Left) return val.value0;
            if(val instanceof EitherTypeUtil.Right) return UnsafePartialUtil.unsafeCrashWith("unsafeFromLeft: Right");
            throw new Error("Unexpected value type in Aff runtime fromLeft: " + [val.constructor.name]);
          },
          fromRight: function(val){
            if(val instanceof EitherTypeUtil.Right) return val.value0;
            if(val instanceof EitherTypeUtil.Left) return UnsafePartialUtil.unsafeCrashWith("unsafeFromRight: Left");
            throw new Error("Unexpected value type in Aff runtime fromRight: " + [val.constructor.name]);
          },
          left: EitherTypeUtil.Left.create,
          right: EitherTypeUtil.Right.create
        },

        // Helper to launch an Aff computation and get a Fiber
        launchAffToFiber = function(affComputation){ return function(){
          var fiberCreator = AffInternal._makeFiber(affEitherApi, null, affComputation)();
          return fiberCreator.runFiber(), fiberCreator;
        }; },

        // Apply instance for Aff (parallel)
        parAffApplyInstance = new FlowApplyUtil.Apply(function(){ return parAffFunctorInstance; }, AffInternal._parAffApply),
        // Monad instance for Aff
        affMonadInstance = new FlowMonadUtil.Monad(function(){ return affApplicativeInstance; }, function(){ return affBindInstance; }),
        // Bind instance for Aff
        affBindInstance = new FlowBindUtil.Bind(function(){ return affApplyInstance; }, AffInternal._bind),
        // Apply instance for Aff (sequential)
        affApplyInstance = new FlowApplyUtil.Apply(function(){ return affFunctorInstance; }, FlowMonadUtil.ap(affMonadInstance)),
        // Applicative instance for Aff (sequential)
        affApplicativeInstance = new FlowApplicativeUtil.Applicative(function(){ return affApplyInstance; }, AffInternal._pure),
        // MonadEffect instance for Aff
        affMonadEffectInstance = new EffectMonadClassUtil.MonadEffect(function(){ return affMonadInstance; }, AffInternal._liftEffect),
        // Parallel class instance for Aff/ParAff
        affParallelInstance = new ParallelClassUtil.Parallel(function(){ return parAffApplicativeInstance; }, function(){ return affMonadInstance; }, UnsafeCoerceUtil.unsafeCoerce, AffInternal._sequential),
        // Applicative instance for Aff (parallel)
        parAffApplicativeInstance = new FlowApplicativeUtil.Applicative(function(){ return parAffApplyInstance; }, function(val){ return ParallelClassUtil.runParallel(affParallelInstance)(FlowApplicativeUtil.pure(affApplicativeInstance)(val)); }),

        // Semigroup instance for Cancelers
        cancelerSemigroupInstance = new runtimeEnv["Data.Semigroup"].Semigroup(function(canceler1){
          return function(canceler2){
            return function(killError){
              return ParallelUtil.parallelSequenceDiscard(affParallelInstance)(CollectionTraversalUtil.foldableArray)([canceler1(killError), canceler2(killError)]);
            };
          };
        }),
        // Non-canceler constant
        noOpCanceler = FunctionalUtil.constant(FlowApplicativeUtil.pure(affApplicativeInstance)(ScalarUtil.unitValue)),
        // Monoid instance for Cancelers
        cancelerMonoidInstance = new runtimeEnv["Data.Monoid"].Monoid(function(){ return cancelerSemigroupInstance; }, noOpCanceler);

    env.launchAff = launchAffToFiber;
    env.launchAff_ = function(affComputation){ return CollectionOpsUtil.voidResult(runtimeEnv.Effect.functorEffect)(launchAffToFiber(affComputation)); };
    env.nonCanceler = noOpCanceler;
    env.functorAff = affFunctorInstance;
    env.applyAff = affApplyInstance;
    env.applicativeAff = affApplicativeInstance;
    env.bindAff = affBindInstance;
    env.monadAff = affMonadInstance;
    env.monadEffectAff = affMonadEffectInstance;
    env.functorParAff = parAffFunctorInstance;
    env.applyParAff = parAffApplyInstance;
    env.applicativeParAff = parAffApplicativeInstance;
    env.parallelAff = affParallelInstance;
    env.semigroupCanceler = cancelerSemigroupInstance;
    env.monoidCanceler = cancelerMonoidInstance;
    env.createAff = AffInternal.makeAff;
  })(runtimeEnv["Effect.Aff"]=runtimeEnv["Effect.Aff"]||{}),

  // Node Encoding Module (Part 1)
  (function(env){
    "use strict";
    var ValueDisplayUtil = runtimeEnv["ValueDisplay"],

        // Encoding types
        AsciiEncoding = (function(){ function Ascii(){ /* empty */ } return Ascii.value = new Ascii(), Ascii; })(),
        Utf8Encoding = (function(){ function Utf8(){ /* empty */ } return Utf8.value = new Utf8(), Utf8; })(),
        Utf16leEncoding = (function(){ function Utf16le(){ /* empty */ } return Utf16le.value = new Utf16le(), Utf16le; })(),
        Ucs2Encoding = (function(){ function Ucs2(){ /* empty */ } return Ucs2.value = new Ucs2(), Ucs2; })(),
        Base64Encoding = (function(){ function Base64(){ /* empty */ } return Base64.value = new Base64(), Base64; })(),
        Latin1Encoding = (function(){ function Latin1(){ /* empty */ } return Latin1.value = new Latin1(), Latin1; })(),
        BinaryEncoding = (function(){ function Binary(){ /* empty */ } return Binary.value = new Binary(), Binary; })(),
        HexEncoding = (function(){ function Hex(){ /* empty */ } return Hex.value = new Hex(), Hex; })();

    // Show instance for Encoding types
    var encodingShowInstance = new ValueDisplayUtil.Show(function(encoding){
      if(encoding instanceof AsciiEncoding) return"ASCII";
      if(encoding instanceof Utf8Encoding) return"UTF8";
      if(encoding instanceof Utf16leEncoding) return"UTF16LE";
      if(encoding instanceof Ucs2Encoding) return"UCS2";
      if(encoding instanceof Base64Encoding) return"Base64";
      if(encoding instanceof Latin1Encoding) return"Latin1";
      if(encoding instanceof BinaryEncoding) return"Binary";
      if(encoding instanceof HexEncoding) return"Hex";
      throw new Error("Unknown encoding type in showEncoding: " + encoding.constructor.name);
    });

    env.ASCII = AsciiEncoding;
    env.UTF8 = Utf8Encoding;
    env.UTF16LE = Utf16leEncoding;
    env.UCS2 = Ucs2Encoding;
    env.Base64 = Base64Encoding;
    env.Latin1 = Latin1Encoding;
    env.Binary = BinaryEncoding;
    env.Hex = HexEncoding;
    env.encodingToNode = function(encoding){
      if(encoding instanceof AsciiEncoding) return"ascii";
      if(encoding instanceof Utf8Encoding) return"utf8";
      if(encoding instanceof Utf16leEncoding) return"utf16le";
      if(encoding instanceof Ucs2Encoding) return"ucs2";
      if(encoding instanceof Base64Encoding) return"base64";
      if(encoding instanceof Latin1Encoding) return"latin1";
      if(encoding instanceof BinaryEncoding) return"binary";
      if(encoding instanceof HexEncoding) return"hex";
      throw new Error("Unknown encoding type in encodingToNode: " + encoding.constructor.name);
    };
    env.showEncoding = encodingShowInstance;
  })(runtimeEnv["Node.Encoding"]=runtimeEnv["Node.Encoding"]||{}),

  // Node Process Module (Part 1)
  (function(env){
    "use strict";
    (env["Node.System"]=env["Node.System"]||{}).process = process; // Global Node.js process object
  })(runtimeEnv),

  // Node Stream Module (Part 1)
  (function(env){
    "use strict";
    env.readStreamChunkImpl = function(onString){
      return function(onBuffer){
        return function(chunk){
          if(chunk instanceof Buffer) return onBuffer(chunk);
          if("string"==typeof chunk) return onString(chunk);
          throw new Error("Node.Stream.readStreamChunkImpl: Unrecognised chunk type; expected String or Buffer, got: "+chunk);
        };
      };
    };
    env.onDataEitherImplementation = function(chunkHandler){
      return function(stream){
        return function(effectCallback){
          return function(){
            stream.on("data", function(dataChunk){ effectCallback(chunkHandler(dataChunk))(); });
          };
        };
      };
    };
    env.onStreamEnd = function(stream){ return function(endCallback){ return function(){ stream.on("end", endCallback); }; }; };
    env.writeStream = function(stream){ return function(data){ return function(callback){ return function(){ return stream.write(data, null, callback); }; }; }; };
    env.writeStringStreamImplementation = function(stream){
      return function(encoding){
        return function(text){
          return function(callback){
            return function(){
              return stream.write(text, encoding, callback);
            };
          };
        };
      };
    };
  })(runtimeEnv["Node.Stream"]=runtimeEnv["Node.Stream"]||{}),

  // Node Buffer Module (Part 1)
  (function(env){
    "use strict";
    (env["Node.Buffer"]=env["Node.Buffer"]||{}).bufferToStringImplementation = function(encoding){ return function(buffer){ return function(){ return buffer.toString(encoding); }; }; };
  })(runtimeEnv),

  // Node Buffer Module (Part 2)
  (function(env){
    "use strict";
    var BufferUtil = runtimeEnv["Node.Buffer"],
        EncodingUtil = runtimeEnv["Node.Encoding"];
    env.bufferToString = function(encoding){ return BufferUtil.bufferToStringImplementation(EncodingUtil.encodingToNode(encoding)); };
  })(runtimeEnv["Node.Buffer"]=runtimeEnv["Node.Buffer"]||{}),

  // Node Stream Module (Part 2)
  (function(env){
    "use strict";
    var StreamInternal = runtimeEnv["Node.Stream"],
        FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowBindUtil = runtimeEnv["FlowOps"],
        EitherTypeUtil = runtimeEnv["EitherType"],
        CollectionOpsUtil = runtimeEnv["CollectionOps"],
        ErrorHandlingUtil = runtimeEnv["Effect.ErrorHandling"],
        BufferUtil = runtimeEnv["Node.Buffer"],
        EncodingUtil = runtimeEnv["Node.Encoding"],
        EffectInternal = runtimeEnv.Effect,

        // Read chunk as Either String or Buffer
        eitherChunkReader = StreamInternal.readStreamChunkImpl(EitherTypeUtil.Left.create)(EitherTypeUtil.Right.create),
        // Attach data listener with a chunk handler
        onDataWithHandler = function(chunkHandler){ return function(stream){ return StreamInternal.onDataEitherImplementation(chunkHandler)(stream); }; },
        // Attach data listener, ensuring chunk is Buffer
        onDataBuffer = function(stream){
          return function(effectCallback){
            return onDataWithHandler(eitherChunkReader)(stream)(FlowBindUtil.composeKleisliFlipped(EffectInternal.bindEffect)(effectCallback)(function(eitherChunk){
              if(eitherChunk instanceof EitherTypeUtil.Left) return ErrorHandlingUtil.throw("Stream encoding should not be set (expected Buffer)");
              if(eitherChunk instanceof EitherTypeUtil.Right) return FlowApplicativeUtil.pure(EffectInternal.applicativeEffect)(eitherChunk.value0);
              throw new Error("Unexpected chunk type during onDataBuffer: " + eitherChunk.constructor.name);
            }));
          };
        };

    env.onData = onDataBuffer;
    env.onDataString = function(stream){
      return function(encoding){
        return function(effectCallback){
          return onDataBuffer(stream)(FlowBindUtil.composeKleisliFlipped(EffectInternal.bindEffect)(effectCallback)(BufferUtil.bufferToString(encoding)));
        };
      };
    };
    env.onDataEither = onDataWithHandler;
    env.writeString = function(stream){
      return function(encoding){
        return StreamInternal.writeStringStreamImplementation(stream)(runtimeEnv["ValueDisplay"].showValue(EncodingUtil.showEncoding)(encoding));
      };
    };
    env.onEnd = StreamInternal.onStreamEnd;
  })(runtimeEnv["Node.Stream"]=runtimeEnv["Node.Stream"]||{}),

  // Node Process Module (Part 2)
  (function(env){
    "use strict";
    var SystemUtil = runtimeEnv["Node.System"],
        // Access Node.js standard input and output streams
        stdOutRef = SystemUtil.process.stdout,
        stdInRef = SystemUtil.process.stdin;

    env.standardInput = stdInRef;
    env.standardOutput = stdOutRef;
  })(runtimeEnv["Node.System"]=runtimeEnv["Node.System"]||{}),

  // Main Application Module (ABC104C)
  (function(env){
    "use strict";
    var FlowApplicativeUtil = runtimeEnv["FlowOps"],
        FlowBindUtil = runtimeEnv["FlowOps"],
        FlowCategoryUtil = runtimeEnv["FlowOps"],
        StateMonadUtil = runtimeEnv["StateMonad"],
        ListOpsUtil = runtimeEnv["ListOperations"],
        NumericBoundsUtil = runtimeEnv["NumericBounds"],
        EitherTypeUtil = runtimeEnv["EitherType"],
        CollectionOpsUtil = runtimeEnv["CollectionOps"],
        IntegerParsingUtil = runtimeEnv["IntegerParsing"],
        TextProcessingUtil = runtimeEnv["TextProcessing"],
        DataTupleUtil = runtimeEnv["Data.Tuple"],
        ScalarUtil = runtimeEnv["Scalar"],
        EffectInternal = runtimeEnv.Effect,
        AffUtil = runtimeEnv["Effect.Aff"],
        EffectMonadClassUtil = runtimeEnv["Effect.MonadClass"],
        MutableRefUtil = runtimeEnv["Effect.MutableRef"],
        EncodingUtil = runtimeEnv["Node.Encoding"],
        SystemUtil = runtimeEnv["Node.System"],
        StreamUtil = runtimeEnv["Node.Stream"],
        UnsafePartialUtil = runtimeEnv["Unsafe"],
        ValueDisplayUtil = runtimeEnv["ValueDisplay"],
        SortingUtil = runtimeEnv["Sorting"];

    // Reads all input from stdin into a single string
    var readAllInput = AffUtil.createAff(function(callback){
      return function(){
        var inputBufferRef = MutableRefUtil.new("")(); // Mutable ref to accumulate input
        StreamUtil.onDataString(SystemUtil.standardInput)(EncodingUtil.UTF8.value)(function(chunk){
          return function(){
            var currentContent = MutableRefUtil.read(inputBufferRef)();
            MutableRefUtil.write(currentContent + chunk)(inputBufferRef)();
          };
        })(),
        StreamUtil.onEnd(SystemUtil.standardInput)(function(){
          var finalContent = MutableRefUtil.read(inputBufferRef)();
          callback(FlowApplicativeUtil.pure(EitherTypeUtil.applicativeEither)(finalContent))(); // Resolve with final content
        })(),
        runtimeEnv["Data.Monoid"].getMempty(AffUtil.monoidCanceler); // Return non-canceler
      };
    });

    // Parses a line of problem data (e.g., "100 5") into a Tuple of two integers
    var parseProblemData = function(lineText){
      var parts = TextProcessingUtil.split(" ")(lineText);
      var parsedNumbers = ListOpsUtil.mapMaybe(IntegerParsingUtil.parseString)(parts);
      // Expect exactly two numbers
      return ListOpsUtil.getArrayLength(parsedNumbers) === 2 ? new OptionalValuesUtil.Just(new DataTupleUtil.Tuple(parsedNumbers[0], parsedNumbers[1])) : OptionalValuesUtil.Nothing.value;
    };

    // Main solver logic
    var solveProblem = function(inputString){
      // First, process the input string: trim whitespace, split into lines, and get first line (D G)
      var processedLines = TextProcessingUtil.split("\n")(TextProcessingUtil.trim(inputString));

      // Extract D and G from the first line
      var firstLineParsed = FlowBindUtil.bind(EitherTypeUtil.bindEither)(
        EitherTypeUtil.note("Failed to parse header line (D G).")(ListOpsUtil.uncons(processedLines))
      )(function(headerInfo){
        return EitherTypeUtil.note("Failed to parse D and G values.")(parseProblemData(headerInfo.head));
      });

      // If header parsing fails, crash. Otherwise, proceed with problem solving.
      return EitherTypeUtil.either(function(errorMessage){
        return UnsafePartialUtil.unsafeCrashWith(errorMessage);
      })(FlowCategoryUtil.getIdentity(FlowCategoryUtil.functionCategory))(FlowBindUtil.bind(EitherTypeUtil.bindEither)(firstLineParsed)(function(problemConfig){
        var D = problemConfig.value0, G = problemConfig.value1; // D = num problems, G = target score

        // Parse remaining lines into an array of (points, bonus) tuples
        var problemsData = ListOpsUtil.mapMaybe(parseProblemData)(processedLines.slice(1));

        // Initialize minimum problems solved to max int value
        var minSolvedProblems = NumericBoundsUtil.getTop(NumericBoundsUtil.boundedInt);

        // ST Monad operations for mutable state within the loop
        var stMonad = runtimeEnv["StateMonad"].monadST;
        var stApplicative = runtimeEnv["StateMonad"].applicativeST;
        var stFunctor = runtimeEnv["StateMonad"].functorST;
        var stApply = runtimeEnv["StateMonad"].applyST;

        // The core algorithm: iterate through all combinations of problems using bitmask
        (function(targetScore, problemSet){
          var maxCombinations = IntegerParsingUtil.pow(2)(D); // 2^D combinations
          var minProblemsRef = { value: NumericBoundsUtil.getTop(NumericBoundsUtil.boundedInt) }; // Mutable ref for min problems

          StateMonadUtil.forRange(0)(maxCombinations)(function(combinationMask){
            return function(){
              var currentScoreRef = { value: 0 }; // Total score for this combination
              var currentProblemsRef = { value: 0 }; // Total problems for this combination

              // Calculate score and problems for the current combination
              StateMonadUtil.forRange(0)(D)(function(problemIndex){
                return FlowApplicativeUtil.when(stApplicative)(0 != (combinationMask & (1 << problemIndex)))(function(){
                  // If problem is selected (bit is set)
                  var problemPoints = problemSet[problemIndex].value0;
                  var problemBonus = problemSet[problemIndex].value1;
                  var basePoints = (100 * (problemIndex + 1 | 0) | 0) * problemPoints | 0;
                  var totalPoints = basePoints + problemBonus | 0;

                  CollectionOpsUtil.voidResult(stFunctor)(StateMonadUtil.modifyRef(runtimeEnv["NumericOperations"].add(runtimeEnv["NumericOperations"].semiringInt)(totalPoints))(currentScoreRef))();
                  CollectionOpsUtil.voidResult(stFunctor)(StateMonadUtil.modifyRef(runtimeEnv["NumericOperations"].add(runtimeEnv["NumericOperations"].semiringInt)(problemPoints))(currentProblemsRef))();
                });
              })();

              // If current combination meets or exceeds target score
              if(currentScoreRef.value >= targetScore){
                minProblemsRef.value = SortingUtil.findMinimum(SortingUtil.ordInt)(currentProblemsRef.value)(minProblemsRef.value);
              } else {
                // If not enough score, try to add remaining problems one by one to reach target
                var additionalScoreNeeded = { value: 0 };
                var additionalProblems = { value: 0 };
                StateMonadUtil.forRange(0)(D)(function(problemIndex){
                  var invertedIndex = (D - problemIndex | 0) - 1 | 0; // Iterate from highest point problems
                  return FlowApplicativeUtil.when(stApplicative)(0 == (combinationMask & (1 << invertedIndex)))(function(){
                    // If problem was NOT selected in the current combination
                    // Check if adding this problem would exceed the target without it, or if it's needed
                    var basePointsSingle = (100 * (invertedIndex + 1 | 0) | 0);
                    var problemPoints = problemSet[invertedIndex].value0;
                    var problemBonus = problemSet[invertedIndex].value1;

                    if((currentScoreRef.value + additionalScoreNeeded.value | 0) < targetScore){
                      if(((currentScoreRef.value + additionalScoreNeeded.value | 0) + (basePointsSingle * problemPoints | 0) | 0) >= targetScore){
                        // Add just enough of this problem to reach target
                        StateMonadUtil.forRange(0)(problemPoints)(function(count){
                          return function(){
                            FlowApplicativeUtil.when(stApplicative)((currentScoreRef.value + additionalScoreNeeded.value | 0) < targetScore)(function(){
                              CollectionOpsUtil.voidResult(stFunctor)(StateMonadUtil.modifyRef(runtimeEnv["NumericOperations"].add(runtimeEnv["NumericOperations"].semiringInt)(basePointsSingle))(additionalScoreNeeded))();
                              CollectionOpsUtil.voidResult(stFunctor)(StateMonadUtil.modifyRef(runtimeEnv["NumericOperations"].add(runtimeEnv["NumericOperations"].semiringInt)(1))(additionalProblems))();
                            });
                          };
                        })();
                      } else {
                        // Add all of this problem
                        CollectionOpsUtil.voidResult(stFunctor)(StateMonadUtil.modifyRef(runtimeEnv["NumericOperations"].add(runtimeEnv["NumericOperations"].semiringInt)((basePointsSingle * problemPoints | 0) + problemBonus | 0))(additionalScoreNeeded))();
                        CollectionOpsUtil.voidResult(stFunctor)(StateMonadUtil.modifyRef(runtimeEnv["NumericOperations"].add(runtimeEnv["NumericOperations"].semiringInt)(problemPoints))(additionalProblems))();
                      }
                    }
                  });
                })();
                minProblemsRef.value = SortingUtil.findMinimum(SortingUtil.ordInt)(currentProblemsRef.value + additionalProblems.value | 0)(minProblemsRef.value);
              }
            };
          })();
          return minProblemsRef.value;
        })(G, problemsData);

        return ValueDisplayUtil.showValue(ValueDisplayUtil.showInt)(minSolvedProblems) + "\n";
      }));
    };

    // Main entry point for the application
    var mainExecution = AffUtil.launchAff_(FlowBindUtil.bind(AffUtil.bindAff)(readAllInput)(function(rawInput){
      return FlowBindUtil.bind(AffUtil.bindAff)(FlowApplicativeUtil.pure(AffUtil.applicativeAff)(solveProblem(rawInput)))(function(solutionOutput){
        // Lift the effect of writing to stdout into the Aff monad
        return EffectMonadClassUtil.liftEffect(AffUtil.monadEffectAff)(
          CollectionOpsUtil.voidResult(EffectInternal.functorEffect)(
            StreamUtil.writeString(SystemUtil.standardOutput)(EncodingUtil.UTF8.value)(solutionOutput)(FlowApplicativeUtil.pure(EffectInternal.applicativeEffect)(ScalarUtil.unitValue))
          )
        );
      });
    }));

    env.main = mainExecution;
    env.solver = solveProblem;
  })(runtimeEnv.ABC104C=runtimeEnv.ABC104C||{}),
  runtimeEnv.ABC104C.main();
},{}],"AppEntry":[]},{},["AppEntry"], null);