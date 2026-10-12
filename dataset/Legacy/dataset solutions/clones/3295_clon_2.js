javascriptModuleLoader=function(moduleDefinitionMap, moduleCacheMap, initialEntryPoints, globalExportIdentifier){
  // Stores the first error encountered during module loading.
  var loadingError,
      // Reference to a global module loader if it exists, for chaining.
      priorModuleLoader = "function"==typeof javascriptModuleLoader && javascriptModuleLoader,
      // Reference to Node.js 'require' if available, for external modules.
      nodeJsRequire = "function"==typeof require && require;

  /**
   * Loads a module by its identifier.
   * @param {string} moduleIdentifier - The unique ID of the module to load.
   * @param {boolean} [isRecursiveCall] - Flag to prevent infinite recursion in nested loaders.
   */
  function acquireModule(moduleIdentifier, isRecursiveCall){
    // If the module is already in the cache, return its exports.
    if(!moduleCacheMap[moduleIdentifier]){
      // If the module definition doesn't exist, try external loaders.
      if(!moduleDefinitionMap[moduleIdentifier]){
        // Attempt to use a parent Parcel loader if available and not a recursive call.
        if(!isRecursiveCall && priorModuleLoader) return priorModuleLoader(moduleIdentifier, !0);
        // Attempt to use the global Parcel loader if available.
        if(priorModuleLoader) return priorModuleLoader(moduleIdentifier, !0);
        // Attempt to use Node.js 'require' if available and the identifier is a string.
        if(nodeJsRequire && "string"==typeof moduleIdentifier) return nodeJsRequire(moduleIdentifier);

        // If all attempts fail, throw an error.
        var moduleNotFoundErr = new Error("Cannot locate module with ID: '"+moduleIdentifier+"'");
        throw moduleNotFoundErr.code="MODULE_NOT_FOUND", moduleNotFoundErr;
      }

      // Create a local require function for this module.
      localModuleResolver.resolve=function(relativePath){
        return moduleDefinitionMap[moduleIdentifier][1][relativePath]||relativePath;
      };
      // Initialize module-specific cache.
      localModuleResolver.cache={};

      // Create a new module object and store it in the cache.
      var currentModuleInstance = moduleCacheMap[moduleIdentifier] = new acquireModule.Module(moduleIdentifier);
      // Execute the module's code, providing the necessary `require`, `module`, `exports`, and `this` context.
      moduleDefinitionMap[moduleIdentifier][0].call(currentModuleInstance.exports, localModuleResolver, currentModuleInstance, currentModuleInstance.exports, this);
    }
    // Return the module's exports from the cache.
    return moduleCacheMap[moduleIdentifier].exports;

    /**
     * A local 'require' function for a specific module.
     * @param {string} dependencyPath - The path to the dependency to load.
     */
    function localModuleResolver(dependencyPath){
      return acquireModule(localModuleResolver.resolve(dependencyPath));
    }
  }

  // Mark this loader as active.
  acquireModule.isLoaderActive=!0;
  /**
   * Constructor for a module object.
   * @param {string} moduleId - The ID of the module.
   */
  acquireModule.Module=function(moduleId){
    this.id=moduleId;
    this.bundle=acquireModule;
    this.exports={};
  };

  // Store references to the module definitions and cache.
  acquireModule.allModules=moduleDefinitionMap;
  acquireModule.moduleCache=moduleCacheMap;
  acquireModule.parentLoader=priorModuleLoader;

  /**
   * Registers a new module definition.
   * @param {string} moduleId - The ID of the module.
   * @param {*} moduleValue - The value to export for this module.
   */
  acquireModule.registerModule=function(moduleId, moduleValue){
    moduleDefinitionMap[moduleId]=[function(moduleReq, moduleObj){
      moduleObj.exports=moduleValue;
    },{}];
  };

  // Iterate through the initial entry points and load them.
  for(var entryIndex=0; entryIndex<initialEntryPoints.length; entryIndex++){
    try {
      acquireModule(initialEntryPoints[entryIndex]);
    } catch(err){
      // Capture the first error if multiple entry points fail.
      loadingError||(loadingError=err);
    }
  }

  // If there are entry points, get the exports of the last one.
  if(initialEntryPoints.length){
    var finalExportResult = acquireModule(initialEntryPoints[initialEntryPoints.length-1]);
    // Handle different export environments (CommonJS, AMD, global).
    "object"==typeof exports&&"undefined"!=typeof module?module.exports=finalExportResult:"function"==typeof define&&define.amd?define(function(){return finalExportResult}):globalExportIdentifier&&(this[globalExportIdentifier]=finalExportResult);
  }

  // Assign this loader to the global `javascriptModuleLoader` variable.
  if (javascriptModuleLoader = acquireModule, loadingError) {
      throw loadingError; // Re-throw the captured error if any.
  }
  return acquireModule; // Return the module loader function.
}({
  // Module definitions object.
  "Focm":[function(moduleReq, moduleObj, moduleExports, thisContext) {
    // Main application namespace.
    var publicApi={};

    // Self-executing function to encapsulate module definitions.
    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Control.Apply"]=exportContainer["Control.Apply"]||{}; // Initialize namespace.
      var applyControl=exportContainer["Control.Apply"]; // Alias for apply control.

      /**
       * Constructor for an Apply instance.
       * @param {object} functionalityZero - The Functor0 instance.
       * @param {function} invokeFunction - The apply function.
       */
      applyControl.Apply=function(functionalityZero, invokeFunction){
        this.FunctionalityZero=functionalityZero;
        this.invoke=invokeFunction;
      };

      /**
       * Invokes the apply function of an Apply instance.
       * @param {object} instance - The Apply instance.
       */
      applyControl.invoke=function(instance){
        return instance.invoke;
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Control.Applicative"]=exportContainer["Control.Applicative"]||{}; // Initialize namespace.
      var applicativeControl=exportContainer["Control.Applicative"], // Alias for applicative control.
          applyControlRef=exportContainer["Control.Apply"], // Reference to Control.Apply.
          pureValue=function(instance){return instance.inject}; // Helper to get the pure function.

      /**
       * Constructor for an Applicative instance.
       * @param {object} invokerZero - The Apply0 instance.
       * @param {function} injectFunction - The pure function.
       */
      applicativeControl.Applicative=function(invokerZero, injectFunction){
        this.InvokerZero=invokerZero;
        this.inject=injectFunction;
      };

      // Expose the pure function.
      applicativeControl.inject=pureValue;

      /**
       * Lifts a function to work with Applicative values.
       * @param {object} instance - The Applicative instance.
       */
      applicativeControl.elevateActionOne=function(instance){
        return function(valueToLift){
          return function(applicativeValue){
            return applyControlRef.invoke(instance.InvokerZero())(pureValue(instance)(valueToLift))(applicativeValue);
          };
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Control.Bind"]=exportContainer["Control.Bind"]||{}; // Initialize namespace.
      var bindControl=exportContainer["Control.Bind"]; // Alias for bind control.

      /**
       * Constructor for a Bind instance.
       * @param {object} invokerRef - The Apply0 instance.
       * @param {function} chainFunction - The bind function.
       */
      bindControl.Bind=function(invokerRef, chainFunction){
        this.InvokerRef=invokerRef;
        this.chain=chainFunction;
      };

      /**
       * Invokes the chain function of a Bind instance.
       * @param {object} instance - The Bind instance.
       */
      bindControl.chain=function(instance){
        return instance.chain;
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Control.Monad"]=exportContainer["Control.Monad"]||{}; // Initialize namespace.
      var monadControl=exportContainer["Control.Monad"], // Alias for monad control.
          applicativeRef=exportContainer["Control.Applicative"], // Reference to Control.Applicative.
          bindRef=exportContainer["Control.Bind"]; // Reference to Control.Bind.

      /**
       * Constructor for a Monad instance.
       * @param {object} applicativeInstance - The Applicative0 instance.
       * @param {object} binderInstance - The Bind1 instance.
       */
      monadControl.Monad=function(applicativeInstance, binderInstance){
        this.ApplicativeInstance=applicativeInstance;
        this.BinderInstance=binderInstance;
      };

      /**
       * Applies a monadic function to a monadic value.
       * @param {object} instance - The Monad instance.
       */
      monadControl.applyPair=function(instance){
        return function(monadicFunction){
          return function(monadicValue){
            return bindRef.chain(instance.BinderInstance())(monadicFunction)(function(funcResult){
              return bindRef.chain(instance.BinderInstance())(monadicValue)(function(valResult){
                return applicativeRef.inject(instance.ApplicativeInstance())(funcResult(valResult));
              });
            });
          };
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Control.Monad.ST.Internal"]=exportContainer["Control.Monad.ST.Internal"]||{}; // Initialize namespace.

      // Function to map over an ST action.
      exportContainer.transformMap=function(mapperFunc){
        return function(stAction){
          return function(){
            return mapperFunc(stAction());
          };
        };
      };

      // Function to create a pure ST action.
      exportContainer.injectPure=function(value){
        return function(){
          return value;
        };
      };

      // Function to chain ST actions.
      exportContainer.chainBind=function(firstAction){
        return function(nextActionCreator){
          return function(){
            return nextActionCreator(firstAction())();
          };
        };
      };

      // Function for a monadic for loop in ST.
      exportContainer.iterateRange=function(startIndex){
        return function(endIndex){
          return function(loopBody){
            return function(){
              for(var loopCounter=startIndex; loopCounter<endIndex; loopCounter++) loopBody(loopCounter)();
            };
          };
        };
      };
    }(publicApi["Control.Monad.ST.Internal"]=publicApi["Control.Monad.ST.Internal"]||{});

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Data.Functor"]=exportContainer["Data.Functor"]||{}).collectionMapper=function(mapperFunc){
        return function(inputArray){
          for(var arrayLength=inputArray.length, resultArray=new Array(arrayLength), currentIndex=0; currentIndex<arrayLength; currentIndex++) resultArray[currentIndex]=mapperFunc(inputArray[currentIndex]);
          return resultArray;
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Functor"]=exportContainer["Data.Functor"]||{}; // Initialize namespace.
      var dataFunctor=exportContainer["Data.Functor"], // Alias for data functor.
          functorConstructor=function(mapperFunc){this.map=mapperFunc}, // Constructor for Functor.
          arrayFunctorInstance=new functorConstructor(exportContainer["Data.Functor"].collectionMapper); // Instance for arrays.

      dataFunctor.MapperType=functorConstructor; // Expose Functor type.
      dataFunctor.process=function(instance){return instance.map}; // Expose map function.
      dataFunctor.collectionMapperInstance=arrayFunctorInstance; // Expose array functor instance.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Control.Monad.ST.Internal"]=exportContainer["Control.Monad.ST.Internal"]||{}; // Initialize namespace.
      var stInternal=exportContainer["Control.Monad.ST.Internal"], // Alias for ST internal.
          stUtils=exportContainer["Control.Monad.ST.Internal"], // Second alias.
          applicativeRef=exportContainer["Control.Applicative"], // Reference to Applicative.
          applyRef=exportContainer["Control.Apply"], // Reference to Apply.
          bindRef=exportContainer["Control.Bind"], // Reference to Bind.
          monadRef=exportContainer["Control.Monad"], // Reference to Monad.

          // Create instances for ST monad stack.
          stFunctorInstance=new exportContainer["Data.Functor"].MapperType(stUtils.transformMap),
          stMonadInstance=new monadRef.Monad(function(){return stApplicativeInstance},function(){return stBindInstance}),
          stBindInstance=new bindRef.Bind(function(){return stApplyInstance},stUtils.chainBind),
          stApplyInstance=new applyRef.Apply(function(){return stFunctorInstance},monadRef.applyPair(stMonadInstance)),
          stApplicativeInstance=new applicativeRef.Applicative(function(){return stApplyInstance},stUtils.injectPure);

      // Expose the ST monad stack instances.
      stInternal.stFunctionMapper=stFunctorInstance;
      stInternal.stActionApplier=stApplyInstance;
      stInternal.stPureConstructor=stApplicativeInstance;
      stInternal.stChainingOperator=stBindInstance;
      stInternal.stMonadicWrapper=stMonadInstance;
      stInternal.iterateRange=stUtils.iterateRange;
    }(publicApi);

    !function(exportContainer){
      // Initialize DPB namespace.
      exportContainer.ProblemSolver=exportContainer.ProblemSolver||{};

      // Function to modify a value at an index in an array-like object.
      exportContainer.ProblemSolver.alterValue=function(index, updaterFunction, targetObject){
        return function(){
          return targetObject[index]=updaterFunction(targetObject[index]),{}; // Update and return an empty object (unit).
        };
      };

      // Function to read a value from an index in an array-like object.
      exportContainer.ProblemSolver.readValue=function(index, targetObject){
        return function(){
          return targetObject[index]; // Return the value.
        };
      };

      // Function to write a value to an index in an array-like object.
      exportContainer.ProblemSolver.writeValue=function(index, newValue, targetObject){
        return function(){
          return targetObject[index]=newValue,{}; // Write and return an empty object (unit).
        };
      };
    }(publicApi.ProblemSolver=publicApi.ProblemSolver||{});

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      exportContainer["Data.Array"]=exportContainer["Data.Array"]||{};

      // Function to create an array with `count` copies of `element`.
      exportContainer["Data.Array"].duplicateElements="function"==typeof Array.prototype.fill?function(count){
        return function(element){
          return count<1?[]:new Array(count).fill(element);
        };
      }:function(count){
        return function(element){
          for(var resultList=[], idxCounter=0, loopCounter=0; loopCounter<count; loopCounter++) resultList[idxCounter++]=element;
          return resultList;
        };
      };

      // Function to get the length of an array.
      exportContainer["Data.Array"].getItemCount=function(arr){
        return arr.length;
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Array"]=exportContainer["Data.Array"]||{}; // Initialize namespace.
      var dataArray=exportContainer["Data.Array"], // Alias for Data.Array.
          arrayUtils=exportContainer["Data.Array"]; // Second alias.

      dataArray.duplicate=arrayUtils.duplicateElements; // Expose duplicate.
      dataArray.countItems=arrayUtils.getItemCount; // Expose length.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Array.Partial"]=exportContainer["Data.Array.Partial"]||{}; // Initialize namespace.
      var partialArray=exportContainer["Data.Array.Partial"], // Alias for partial array.
          arrayRef=exportContainer["Data.Array"]; // Reference to Data.Array.

      // Function to get the first element of an array.
      partialArray.firstElement=function(arr){
        return function(arr){
          return arr[0];
        };
      };

      // Function to get the last element of an array.
      partialArray.finalElement=function(arr){
        return function(arr){
          return arr[arrayRef.countItems(arr)-1|0];
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Array.ST"]=exportContainer["Data.Array.ST"]||{}; // Initialize namespace.
      var stArray=exportContainer["Data.Array.ST"], // Alias for ST array.
          applicativeRef=exportContainer["Control.Applicative"], // Reference to Applicative.
          stInternalRef=exportContainer["Control.Monad.ST.Internal"]; // Reference to ST internal.

      // Unsafely "thaw" an array into an ST array (purely).
      stArray.unfreezeUnsafely=function(arr){
        return applicativeRef.inject(stInternalRef.stPureConstructor)(arr);
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      exportContainer["Data.Bounded"]=exportContainer["Data.Bounded"]||{};

      // Define maximum and minimum integer values.
      exportContainer["Data.Bounded"].maxInteger=2147483647;
      exportContainer["Data.Bounded"].minInteger=-2147483648;
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Data.Eq"]=exportContainer["Data.Eq"]||{}).referenceEquality=function(firstVal){
        return function(secondVal){
          return firstVal===secondVal;
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Eq"]=exportContainer["Data.Eq"]||{}; // Initialize namespace.
      var dataEq=exportContainer["Data.Eq"], // Alias for Data.Eq.
          equalityConstructor=function(eqFunc){this.eq=eqFunc}, // Constructor for Eq.
          intEqualityInstance=new equalityConstructor(exportContainer["Data.Eq"].referenceEquality); // Instance for integers.

      dataEq.EqualityType=equalityConstructor; // Expose Eq type.
      dataEq.areEqual=function(instance){return instance.eq}; // Expose eq function.
      dataEq.integerEquality=intEqualityInstance; // Expose integer Eq instance.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Data.Ord.Unsafe"]=exportContainer["Data.Ord.Unsafe"]||{}).compareUnsafelyImplementation=function(lessResult){
        return function(equalResult){
          return function(greaterResult){
            return function(firstOperand){
              return function(secondOperand){
                return firstOperand<secondOperand?lessResult:firstOperand===secondOperand?equalResult:greaterResult;
              };
            };
          };
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Ordering"]=exportContainer["Data.Ordering"]||{}; // Initialize namespace.
      var dataOrdering=exportContainer["Data.Ordering"], // Alias for Data.Ordering.

          // Define singleton instances for ordering types.
          lessThan=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          greaterThan=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          equality=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}();

      dataOrdering.LessThan=lessThan; // Expose LT.
      dataOrdering.GreaterThan=greaterThan; // Expose GT.
      dataOrdering.Equal=equality; // Expose EQ.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Ord.Unsafe"]=exportContainer["Data.Ord.Unsafe"]||{}; // Initialize namespace.
      var unsafeOrdering=exportContainer["Data.Ord.Unsafe"], // Alias for unsafe ordering.
          unsafeOrdImpl=exportContainer["Data.Ord.Unsafe"], // Second alias.
          orderingTypes=exportContainer["Data.Ordering"], // Reference to Data.Ordering.

          // Create the unsafe comparison function using the implementation.
          unsafeComparisonFunction=unsafeOrdImpl.compareUnsafelyImplementation(orderingTypes.LessThan.value)(orderingTypes.Equal.value)(orderingTypes.GreaterThan.value);

      unsafeOrdering.performUnsafeComparison=unsafeComparisonFunction; // Expose unsafe compare.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Data.Ring"]=exportContainer["Data.Ring"]||{}).integerSubtraction=function(firstNum){
        return function(secondNum){
          return firstNum-secondNum|0; // Perform integer subtraction.
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      exportContainer["Data.Semiring"]=exportContainer["Data.Semiring"]||{};

      // Integer addition.
      exportContainer["Data.Semiring"].integerAddition=function(firstNum){
        return function(secondNum){
          return firstNum+secondNum|0;
        };
      };

      // Integer multiplication.
      exportContainer["Data.Semiring"].integerMultiplication=function(firstNum){
        return function(secondNum){
          return firstNum*secondNum|0;
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Semiring"]=exportContainer["Data.Semiring"]||{}; // Initialize namespace.
      var semiringData=exportContainer["Data.Semiring"], // Alias for semiring data.
          semiringOps=exportContainer["Data.Semiring"], // Second alias.

          // Constructor for Semiring.
          semiringConstructor=function(addFunc, mulFunc, oneVal, zeroVal){
            this.add=addFunc;
            this.mul=mulFunc;
            this.one=oneVal;
            this.zero=zeroVal;
          },
          // Instance for integers.
          integerSemiringInstance=new semiringConstructor(semiringOps.integerAddition, semiringOps.integerMultiplication, 1, 0);

      semiringData.SemiringStructure=semiringConstructor; // Expose Semiring type.
      semiringData.performAddition=function(instance){return instance.add}; // Expose add.
      semiringData.identityZero=function(instance){return instance.zero}; // Expose zero.
      semiringData.performMultiplication=function(instance){return instance.mul}; // Expose mul.
      semiringData.identityOne=function(instance){return instance.one}; // Expose one.
      semiringData.integerSemiring=integerSemiringInstance; // Expose integer Semiring instance.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Ring"]=exportContainer["Data.Ring"]||{}; // Initialize namespace.
      var ringData=exportContainer["Data.Ring"], // Alias for ring data.
          ringOps=exportContainer["Data.Ring"], // Second alias.
          semiringRef=exportContainer["Data.Semiring"], // Reference to Data.Semiring.

          // Constructor for Ring.
          ringConstructor=function(semiringInstance, subFunc){
            this.Semiring0=semiringInstance;
            this.sub=subFunc;
          },
          // Helper to get the subtraction function.
          subtractionFunction=function(instance){return instance.sub},
          // Instance for integers.
          integerRingInstance=new ringConstructor(function(){return semiringRef.integerSemiring},ringOps.integerSubtraction);

      ringData.RingStructure=ringConstructor; // Expose Ring type.
      ringData.performSubtraction=subtractionFunction; // Expose sub.

      // Function to negate a value in a Ring.
      ringData.negateValue=function(instance){
        return function(value){
          return subtractionFunction(instance)(semiringRef.identityZero(instance.Semiring0()))(value);
        };
      };

      ringData.integerRing=integerRingInstance; // Expose integer Ring instance.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Ord"]=exportContainer["Data.Ord"]||{}; // Initialize namespace.
      var ordData=exportContainer["Data.Ord"], // Alias for ord data.
          eqRef=exportContainer["Data.Eq"], // Reference to Data.Eq.
          unsafeOrdRef=exportContainer["Data.Ord.Unsafe"], // Reference to Data.Ord.Unsafe.
          orderingRef=exportContainer["Data.Ordering"], // Reference to Data.Ordering.
          ringRef=exportContainer["Data.Ring"], // Reference to Data.Ring.
          semiringRef=exportContainer["Data.Semiring"], // Reference to Data.Semiring.

          // Constructor for Ord.
          ordConstructor=function(eqInstance, compFunc){
            this.Eq0=eqInstance;
            this.compare=compFunc;
          },
          // Instance for integers.
          integerOrdInstance=new ordConstructor(function(){return eqRef.integerEquality},unsafeOrdRef.performUnsafeComparison),
          // Helper to get the comparison function.
          comparisonFunction=function(instance){return instance.compare},
          // Helper for greater than or equal.
          greaterThanOrEqualTo=function(instance){
            return function(valA){
              return function(valB){
                return!(comparisonFunction(instance)(valA)(valB)instanceof orderingRef.LessThan);
              };
            };
          };

      ordData.OrderingType=ordConstructor; // Expose Ord type.
      ordData.executeComparison=comparisonFunction; // Expose compare.
      ordData.checkGreaterThanOrEqual=greaterThanOrEqualTo; // Expose greaterThanOrEq.

      // Function to find the minimum of two values.
      ordData.findMinimum=function(instance){
        return function(valA){
          return function(valB){
            var comparisonResult=comparisonFunction(instance)(valA)(valB);
            if(comparisonResult instanceof orderingRef.LessThan) return valA;
            if(comparisonResult instanceof orderingRef.Equal) return valA;
            if(comparisonResult instanceof orderingRef.GreaterThan) return valB;
            throw new Error("Pattern match failed at Data.Ord (line 119, column 3 - line 122, column 12): "+[comparisonResult.constructor.name]);
          };
        };
      };

      // Function to find the maximum of two values.
      ordData.findMaximum=function(instance){
        return function(valA){
          return function(valB){
            var comparisonResult=comparisonFunction(instance)(valA)(valB);
            if(comparisonResult instanceof orderingRef.LessThan) return valB;
            if(comparisonResult instanceof orderingRef.Equal) return valA;
            if(comparisonResult instanceof orderingRef.GreaterThan) return valA;
            throw new Error("Pattern match failed at Data.Ord (line 128, column 3 - line 131, column 12): "+[comparisonResult.constructor.name]);
          };
        };
      };

      // Function to calculate the absolute value.
      ordData.absoluteValue=function(ordInstance){
        return function(ringInstance){
          return function(value){
            return greaterThanOrEqualTo(ordInstance)(value)(semiringRef.identityZero(ringInstance.Semiring0()))?value:ringRef.negateValue(ringInstance)(value);
          };
        };
      };

      ordData.integerOrdering=integerOrdInstance; // Expose integer Ord instance.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Bounded"]=exportContainer["Data.Bounded"]||{}; // Initialize namespace.
      var boundedData=exportContainer["Data.Bounded"], // Alias for bounded data.
          boundedConstants=exportContainer["Data.Bounded"], // Second alias.
          ordRef=exportContainer["Data.Ord"], // Reference to Data.Ord.

          // Constructor for Bounded.
          boundedConstructor=function(ordInstance, bottomVal, topVal){
            this.Ord0=ordInstance;
            this.bottom=bottomVal;
            this.top=topVal;
          },
          // Instance for integers.
          integerBoundedInstance=new boundedConstructor(function(){return ordRef.integerOrdering},boundedConstants.minInteger,boundedConstants.maxInteger);

      boundedData.BoundedType=boundedConstructor; // Expose Bounded type.
      boundedData.getLowerBound=function(instance){return instance.bottom}; // Expose bottom.
      boundedData.getUpperBound=function(instance){return instance.top}; // Expose top.
      boundedData.integerBounded=integerBoundedInstance; // Expose integer Bounded instance.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Data.Int"]=exportContainer["Data.Int"]||{}).parseIntegerAsStringImpl=function(successCreator){
        return function(failureValue){
          return function(radixValue){
            var charRegex;
            // Determine the character set for the given radix.
            charRegex=radixValue<11?"[0-"+(radixValue-1).toString()+"]":11===radixValue?"[0-9a]":"[0-9a-"+String.fromCharCode(86+radixValue)+"]";
            // Create a regex to validate the input string.
            var validationRegex=new RegExp("^[\\+\\-]?"+charRegex+"+$","i");
            return function(inputString){
              // If the input string matches the regex, attempt to parse.
              if(validationRegex.test(inputString)){
                var parsedInt=parseInt(inputString,radixValue);
                // Check if the parsed value is a valid 32-bit integer.
                return(0|parsedInt)===parsedInt?successCreator(parsedInt):failureValue;
              }
              return failureValue; // Return failure if regex doesn't match.
            };
          };
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Maybe"]=exportContainer["Data.Maybe"]||{}; // Initialize namespace.
      var maybeData=exportContainer["Data.Maybe"], // Alias for maybe data.

          // Define singleton instance for Nothing.
          nothingValue=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          // Constructor for Just.
          justConstructor=function(){function Constructor(val){this.containedValue=val} return Constructor.construct=function(val){return new Constructor(val)},Constructor}();

      maybeData.NoValue=nothingValue; // Expose Nothing.
      maybeData.SomeValue=justConstructor; // Expose Just.

      // Function to extract value from Just, throws if Nothing.
      maybeData.extractValue=function(errMessage){
        return function(maybeVal){
          if(maybeVal instanceof justConstructor) return maybeVal.containedValue;
          throw new Error("Pattern match failed at Data.Maybe (line 268, column 1 - line 268, column 46): "+[maybeVal.constructor.name]);
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Int"]=exportContainer["Data.Int"]||{}; // Initialize namespace.
      var intData=exportContainer["Data.Int"], // Alias for int data.
          intUtils=exportContainer["Data.Int"], // Second alias.
          maybeRef=exportContainer["Data.Maybe"], // Reference to Data.Maybe.

          // Create the parsing function using the implementation and Maybe types.
          parseFunction=intUtils.parseIntegerAsStringImpl(maybeRef.SomeValue.construct)(maybeRef.NoValue.value),
          // Specific parsing function for base 10.
          decimalParseFunction=parseFunction(10);

      intData.parseDecimalString=decimalParseFunction; // Expose fromString.
      intData.parseStringAsRadix=parseFunction; // Expose fromStringAs.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Data.Show"]=exportContainer["Data.Show"]||{}).integerToStringImplementation=function(num){
        return num.toString(); // Convert number to string.
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Show"]=exportContainer["Data.Show"]||{}; // Initialize namespace.
      var showData=exportContainer["Data.Show"], // Alias for show data.
          showConstructor=function(showFunc){this.show=showFunc}, // Constructor for Show.
          integerShowInstance=new showConstructor(exportContainer["Data.Show"].integerToStringImplementation); // Instance for integers.

      showData.DisplayType=showConstructor; // Expose Show type.
      showData.convertToString=function(instance){return instance.show}; // Expose show function.
      showData.integerDisplay=integerShowInstance; // Expose integer Show instance.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      exportContainer["Data.String.Common"]=exportContainer["Data.String.Common"]||{};

      // Function to split a string by a delimiter.
      exportContainer["Data.String.Common"].segmentString=function(delimiterValue){
        return function(targetString){
          return targetString.split(delimiterValue);
        };
      };

      // Function to trim whitespace from a string.
      exportContainer["Data.String.Common"].stripWhitespace=function(targetString){
        return targetString.trim();
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.String.Common"]=exportContainer["Data.String.Common"]||{}; // Initialize namespace.
      var commonString=exportContainer["Data.String.Common"], // Alias for common string.
          stringUtils=exportContainer["Data.String.Common"]; // Second alias.

      commonString.divideString=stringUtils.segmentString; // Expose split.
      commonString.removePadding=stringUtils.stripWhitespace; // Expose trim.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Data.Unit"]=exportContainer["Data.Unit"]||{}).emptyValue={}; // Define the unit value.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Data.Unit"]=exportContainer["Data.Unit"]||{}; // Initialize namespace.
      var unitData=exportContainer["Data.Unit"], // Alias for unit data.
          unitConstants=exportContainer["Data.Unit"]; // Second alias.

      unitData.theUnitValue=unitConstants.emptyValue; // Expose unit.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      exportContainer.Effect=exportContainer.Effect||{};

      // Pure effect constructor.
      exportContainer.Effect.pureEffect=function(value){
        return function(){
          return value;
        };
      };

      // Effect chaining function.
      exportContainer.Effect.chainEffect=function(firstEffect){
        return function(nextEffectCreator){
          return function(){
            return nextEffectCreator(firstEffect())();
          };
        };
      };
    }(publicApi.Effect=publicApi.Effect||{});

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer.Effect=exportContainer.Effect||{}; // Initialize namespace.
      var effectData=exportContainer.Effect, // Alias for effect data.
          effectUtils=exportContainer.Effect, // Second alias.
          applicativeRef=exportContainer["Control.Applicative"], // Reference to Applicative.
          applyRef=exportContainer["Control.Apply"], // Reference to Apply.
          bindRef=exportContainer["Control.Bind"], // Reference to Bind.
          monadRef=exportContainer["Control.Monad"], // Reference to Monad.
          functorRef=exportContainer["Data.Functor"], // Reference to Functor.

          // Create instances for Effect monad stack.
          effectMonad=new monadRef.Monad(function(){return effectApplicative},function(){return effectBind}),
          effectBind=new bindRef.Bind(function(){return effectApply},effectUtils.chainEffect),
          effectApply=new applyRef.Apply(function(){return effectFunctor},monadRef.applyPair(effectMonad)),
          effectApplicative=new applicativeRef.Applicative(function(){return effectApply},effectUtils.pureEffect),
          effectFunctor=new functorRef.MapperType(applicativeRef.elevateActionOne(effectApplicative));

      // Expose the Effect monad stack instances.
      effectData.effectFunctionMapper=effectFunctor;
      effectData.effectActionApplier=effectApply;
      effectData.effectPureConstructor=effectApplicative;
      effectData.effectChainingOperator=effectBind;
      effectData.effectMonadicWrapper=effectMonad;
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Node.Encoding"]=exportContainer["Node.Encoding"]||{}; // Initialize namespace.
      var nodeEncoding=exportContainer["Node.Encoding"], // Alias for node encoding.
          showRef=exportContainer["Data.Show"], // Reference to Data.Show.

          // Define singleton instances for encoding types.
          asciiType=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          utf8Type=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          utf16leType=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          ucs2Type=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          base64Type=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          latin1Type=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          binaryType=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),
          hexType=function(){function Constructor(){}; Constructor.value=new Constructor; return Constructor}(),

          // Create a Show instance for Encoding types.
          encodingShowInstance=new showRef.DisplayType(function(encodingVal){
            if(encodingVal instanceof asciiType) return"ASCII";
            if(encodingVal instanceof utf8Type) return"UTF8";
            if(encodingVal instanceof utf16leType) return"UTF16LE";
            if(encodingVal instanceof ucs2Type) return"UCS2";
            if(encodingVal instanceof base64Type) return"Base64";
            if(encodingVal instanceof latin1Type) return"Latin1";
            if(encodingVal instanceof binaryType) return"Binary";
            if(encodingVal instanceof hexType) return"Hex";
            throw new Error("Pattern match failed at Node.Encoding (line 19, column 1 - line 19, column 39): "+[encodingVal.constructor.name]);
          });

      // Expose encoding types and their Show instance.
      nodeEncoding.AsciiEncoding=asciiType;
      nodeEncoding.Utf8Encoding=utf8Type;
      nodeEncoding.Utf16leEncoding=utf16leType;
      nodeEncoding.Ucs2Encoding=ucs2Type;
      nodeEncoding.Base64Encoding=base64Type;
      nodeEncoding.Latin1Encoding=latin1Type;
      nodeEncoding.BinaryEncoding=binaryType;
      nodeEncoding.HexEncoding=hexType;
      nodeEncoding.displayEncoding=encodingShowInstance;
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace and directly require 'fs'.
      (exportContainer["Node.FS.Internal"]=exportContainer["Node.FS.Internal"]||{}).unsafeFilesystemImport=require("fs");
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      (exportContainer["Unsafe.Coerce"]=exportContainer["Unsafe.Coerce"]||{}).performUnsafeCoercion=function(val){
        return val; // Simply return the value, performing an unsafe type coercion.
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Unsafe.Coerce"]=exportContainer["Unsafe.Coerce"]||{}; // Initialize namespace.
      var unsafeCoercion=exportContainer["Unsafe.Coerce"], // Alias for unsafe coercion.
          coercionUtils=exportContainer["Unsafe.Coerce"]; // Second alias.

      unsafeCoercion.performTypeCoercion=coercionUtils.performUnsafeCoercion; // Expose unsafeCoerce.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Node.FS.Internal"]=exportContainer["Node.FS.Internal"]||{}; // Initialize namespace.
      var fsInternal=exportContainer["Node.FS.Internal"], // Alias for FS internal.
          internalFsUtils=exportContainer["Node.FS.Internal"], // Second alias.
          unsafeCoercionRef=exportContainer["Unsafe.Coerce"].performTypeCoercion; // Reference to unsafeCoerce.

      fsInternal.createEffect=unsafeCoercionRef; // Expose mkEffect.
      fsInternal.getFsModuleUnsafely=internalFsUtils.unsafeFilesystemImport; // Expose unsafeRequireFS.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Node.FS.Sync"]=exportContainer["Node.FS.Sync"]||{}; // Initialize namespace.
      var fsSync=exportContainer["Node.FS.Sync"], // Alias for FS sync.
          showRef=exportContainer["Data.Show"], // Reference to Data.Show.
          encodingRef=exportContainer["Node.Encoding"], // Reference to Node.Encoding.
          fsInternalRef=exportContainer["Node.FS.Internal"], // Reference to FS internal.
          fsModule=fsInternalRef.getFsModuleUnsafely; // Alias for the 'fs' module.

      /**
       * Reads a text file synchronously with a specified encoding.
       * @param {object} encodingInstance - The encoding to use.
       */
      fsSync.readTextFileSync=function(encodingInstance){
        return function(filePath){
          return fsInternalRef.createEffect(function(effectCallback){
            // Use fs.readFileSync with the provided encoding.
            return fsModule.readFileSync(filePath,{encoding:showRef.convertToString(encodingRef.displayEncoding)(encodingInstance)});
          });
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace and directly reference Node.js process.
      (exportContainer["Node.Process"]=exportContainer["Node.Process"]||{}).nodeProcess=process;
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Node.Process"]=exportContainer["Node.Process"]||{}; // Initialize namespace.
      var nodeProcess=exportContainer["Node.Process"], // Alias for node process.
          outputStream=exportContainer["Node.Process"].nodeProcess.stdout; // Reference to stdout.

      nodeProcess.standardOutput=outputStream; // Expose stdout.
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      // Initialize namespace.
      exportContainer["Node.Stream"]=exportContainer["Node.Stream"]||{};

      /**
       * Writes data to a stream.
       * @param {object} streamInstance - The stream to write to.
       */
      exportContainer["Node.Stream"].streamWrite=function(streamInstance){
        return function(dataBuffer){
          return function(callbackFunction){
            return function(){
              return streamInstance.write(dataBuffer,null,callbackFunction);
            };
          };
        };
      };

      /**
       * Writes a string to a stream with specified encoding.
       * @param {object} streamInstance - The stream to write to.
       */
      exportContainer["Node.Stream"].streamWriteStringImplementation=function(streamInstance){
        return function(encodingOption){
          return function(textString){
            return function(callbackFunction){
              return function(){
                return streamInstance.write(textString,encodingOption,callbackFunction);
              };
            };
          };
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer["Node.Stream"]=exportContainer["Node.Stream"]||{}; // Initialize namespace.
      var nodeStream=exportContainer["Node.Stream"], // Alias for node stream.
          streamUtils=exportContainer["Node.Stream"], // Second alias.
          showRef=exportContainer["Data.Show"], // Reference to Data.Show.
          encodingRef=exportContainer["Node.Encoding"]; // Reference to Node.Encoding.

      /**
       * Writes a string to a stream with a given encoding.
       * @param {object} streamInstance - The stream to write to.
       */
      nodeStream.writeTextToStream=function(streamInstance){
        return function(encodingInstance){
          return streamUtils.streamWriteStringImplementation(streamInstance)(showRef.convertToString(encodingRef.displayEncoding)(encodingInstance));
        };
      };
    }(publicApi);

    !function(exportContainer){
      "use strict"; // Enforce strict mode.
      exportContainer.ProblemSolver=exportContainer.ProblemSolver||{}; // Ensure namespace exists.

      // Aliases to imported modules for convenience.
      var problemSolver=exportContainer.ProblemSolver,
          solverUtilities=exportContainer.ProblemSolver,
          applicativeRef=exportContainer["Control.Applicative"],
          stInternalRef=exportContainer["Control.Monad.ST.Internal"],
          arrayDataRef=exportContainer["Data.Array"],
          partialArrayRef=exportContainer["Data.Array.Partial"],
          stArrayRef=exportContainer["Data.Array.ST"],
          boundedDataRef=exportContainer["Data.Bounded"],
          functorRef=exportContainer["Data.Functor"],
          intDataRef=exportContainer["Data.Int"],
          maybeDataRef=exportContainer["Data.Maybe"],
          ordDataRef=exportContainer["Data.Ord"],
          ringDataRef=exportContainer["Data.Ring"],
          showDataRef=exportContainer["Data.Show"],
          commonStringRef=exportContainer["Data.String.Common"],
          unitDataRef=exportContainer["Data.Unit"],
          effectRef=exportContainer.Effect,
          nodeEncodingRef=exportContainer["Node.Encoding"],
          fsSyncRef=exportContainer["Node.FS.Sync"],
          nodeProcessRef=exportContainer["Node.Process"],
          nodeStreamRef=exportContainer["Node.Stream"];

      // Common string operations.
      var spaceSplitter=commonStringRef.divideString(" "),
          minComparator=ordDataRef.findMinimum(ordDataRef.integerOrdering),
          maxComparator=ordDataRef.findMaximum(ordDataRef.integerOrdering);

      /**
       * Parses the input string into problem-specific data.
       * @param {string} inputString - The raw input string.
       * @returns {object} An object containing 'n', 'k', and 'hs' (heights).
       */
      var parseInputData=function(inputString){
        // Trim whitespace and split by newline.
        var lineSegments=(function(val){
          var trimmedVal = val;
          return commonStringRef.divideString("\n")(commonStringRef.removePadding(trimmedVal));
        })(inputString);

        // Split the first line by space to get N and K.
        var firstLineParts=spaceSplitter(partialArrayRef.firstElement()(lineSegments));

        return {
          countN:maybeDataRef.extractValue()(intDataRef.parseDecimalString(firstLineParts[0])),
          offsetK:maybeDataRef.extractValue()(intDataRef.parseDecimalString(firstLineParts[1])),
          heights:function(heightsString){
            // Map string heights to integers.
            return functorRef.process(functorRef.collectionMapperInstance)(function(heightStr){
              return maybeDataRef.extractValue()(intDataRef.parseDecimalString(heightStr));
            })(spaceSplitter(heightsString));
          }(partialArrayRef.finalElement()(lineSegments))
        };
      };

      // Function to calculate absolute difference using Ord and Ring instances.
      var calculateAbsoluteDifference=ordDataRef.absoluteValue(ordDataRef.integerOrdering)(ringDataRef.integerRing);

      /**
       * Solves the problem given the input string.
       * @param {string} problemInput - The raw problem input.
       * @returns {string} The result as a string.
       */
      var solveProblem=function(problemInput){
        // Parse the input data.
        var parsedProblem=(function(val){ // Anonymous function to capture parsing result
          var tempResult = val;
          var trimmedInput = commonStringRef.removePadding(tempResult);
          var lineSegments = commonStringRef.divideString("\n")(trimmedInput);
          var firstLineParts = spaceSplitter(partialArrayRef.firstElement()(lineSegments));
          return {
            countN: maybeDataRef.extractValue()(intDataRef.parseDecimalString(firstLineParts[0])),
            offsetK: maybeDataRef.extractValue()(intDataRef.parseDecimalString(firstLineParts[1])),
            heights: (function(heightsString){
              return functorRef.process(functorRef.collectionMapperInstance)(function(heightStr){
                return maybeDataRef.extractValue()(intDataRef.parseDecimalString(heightStr));
              })(spaceSplitter(heightsString));
            })(partialArrayRef.finalElement()(lineSegments))
          };
        })(problemInput);

        // Initialize a mutable array for dynamic programming, filled with max integer.
        var mutableArray=stArrayRef.unfreezeUnsafely(arrayDataRef.duplicate(parsedProblem.countN)(boundedDataRef.getUpperBound(boundedDataRef.integerBounded)))();
        solverUtilities.writeValue(0,0,mutableArray)(); // Set base case: cost at index 0 is 0.

        // Outer loop: iterate from 1 to N-1 (exclusive of N).
        stInternalRef.iterateRange(1)(parsedProblem.countN)(function(outerIndex){
          // Inner loop: iterate from max(0, outerIndex - K) to outerIndex - 1.
          return stInternalRef.iterateRange(maxComparator(0)(outerIndex-parsedProblem.offsetK|0))(outerIndex)(function(innerIndex){
            return function(){
              // Get current cost at innerIndex.
              var currentValue=solverUtilities.readValue(innerIndex,mutableArray)();
              // Update cost at outerIndex.
              return solverUtilities.alterValue(outerIndex,minComparator(currentValue+calculateAbsoluteDifference(parsedProblem.heights[innerIndex]-parsedProblem.heights[outerIndex]|0)|0),mutableArray)();
            };
          });
        })();

        // Return the final cost at N-1.
        return showDataRef.convertToString(showDataRef.integerDisplay)(solverUtilities.readValue(parsedProblem.countN-1|0,mutableArray)())+"\n";
      };

      // Expose the main program function.
      problemSolver.mainProgram=function(){
        // Read input from stdin using UTF8 encoding.
        var fileContent=fsSyncRef.readTextFileSync(nodeEncodingRef.Utf8Encoding.value)("/dev/stdin")();
        // Solve the problem and write the result to stdout.
        nodeStreamRef.writeTextToStream(nodeProcessRef.standardOutput)(nodeEncodingRef.Utf8Encoding.value)(solveProblem(fileContent))(applicativeRef.inject(effectRef.effectPureConstructor)(unitDataRef.theUnitValue))();
        return unitDataRef.theUnitValue; // Return unit.
      };

      // Expose the solve function.
      problemSolver.solveProblem=solveProblem;
    }(publicApi);

    // Execute the main program from the DPB (ProblemSolver) module.
    publicApi.ProblemSolver.mainProgram();
  },{}], // End of Focm module definition.
},{},["Focm"], null) // Call the module loader with definitions, empty cache, entry points, and no global export.