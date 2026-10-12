// This is a custom module loading system, similar to a bundler's runtime.
// It manages module definitions, caching, and resolution for a JavaScript application.
function moduleLoader( moduleDefinitions, moduleCache, startupModules, exportToGlobal ) {
  var firstError; // Variable to store the first encountered error during module loading.
  var globalLoaderReference = ( typeof moduleLoader === "function" ) ? moduleLoader : null; // Reference to the global loader, if available.
  var nodeRequireReference  = ( typeof require      === "function" ) ? require      : null; // Reference to Node.js 'require', if available.

  /**
   * Resolves and loads a module by its identifier.
   * @param {string} moduleId - The unique identifier of the module to load.
   * @param {boolean} ignoreCache - If true, bypasses the module cache.
   * @returns {object} The exports of the loaded module.
   */
  function resolveAndLoad( moduleId, ignoreCache ) {
    // Check if the module is already in the cache.
    if ( !moduleCache[moduleId] ) {
      // If the module is not defined locally, attempt to load it from external sources.
      if ( !moduleDefinitions[moduleId] ) {
        var activeLoader = ( typeof moduleLoader === "function" ) ? moduleLoader : null;
        if ( !ignoreCache && activeLoader ) {
          return activeLoader( moduleId, true ); // Try loading from an active loader instance.
        }
        if ( globalLoaderReference ) {
          return globalLoaderReference( moduleId, true ); // Try the globally available loader.
        }
        if ( nodeRequireReference && ( typeof moduleId === "string" ) ) {
          return nodeRequireReference( moduleId ); // Fallback to Node.js require for external modules.
        }
        // If all attempts fail, create and throw a module not found error.
        var loadError = new Error("Unable to locate module: '" + moduleId + "'");
        loadError.code = "MODULE_NOT_FOUND";
        throw loadError;
      }

      // Define a local 'require' function for the current module being loaded.
      var currentModuleRequire = function( dependencyId ) {
        return resolveAndLoad( currentModuleRequire.resolver( dependencyId ) );
      };
      currentModuleRequire.resolver = function( depIdentifier ) {
        // Resolve internal module paths or use the identifier directly if no mapping exists.
        return moduleDefinitions[moduleId][1][depIdentifier] || depIdentifier;
      };
      currentModuleRequire.cacheStore = {}; // Initialize a local cache store for this module's resolutions.

      // Create a new module instance and store it in the cache.
      var currentModuleInstance = moduleCache[moduleId] = new resolveAndLoad.ModuleConstructor( moduleId );

      // Execute the module's code. The module's exports object is passed as 'this' context.
      moduleDefinitions[moduleId][0].call( currentModuleInstance.exportedContent, currentModuleRequire, currentModuleInstance, currentModuleInstance.exportedContent, this );
    }

    return moduleCache[moduleId].exportedContent; // Return the module's exports object from the cache.
  }

  resolveAndLoad.isModuleSystem = true; // A flag indicating that this function is a module loading system.

  /**
   * Constructor for a module object, used internally by the loader.
   * @param {string} idParameter - The unique identifier for this module instance.
   */
  resolveAndLoad.ModuleConstructor = function( idParameter ) {
    this.moduleIdentifier = idParameter;      // The unique ID of the module.
    this.linkedLoader     = resolveAndLoad; // A reference back to the loader that instantiated this module.
    this.exportedContent  = {};             // The object that will hold the module's exports.
  };

  resolveAndLoad.allDefinitions = moduleDefinitions; // Stores a reference to all module definitions.
  resolveAndLoad.loadedCache    = moduleCache;       // Stores a reference to the module cache.
  resolveAndLoad.parentSystem   = globalLoaderReference; // Stores a reference to the parent module system, if any.

  /**
   * Registers a new module definition with the loader.
   * @param {string} regModuleId - The identifier for the module to register.
   * @param {object} regModuleContent - The content or exports of the module.
   */
  resolveAndLoad.registerModule = function( regModuleId, regModuleContent ) {
    moduleDefinitions[regModuleId] = [
      function( exportFunc, modObj ) {
        modObj.exportedContent = regModuleContent; // Assign the provided content to the module's exports.
      }, {}
    ];
  };

  // Loop through the list of modules specified to be loaded on startup.
  for ( var idxCounter = 0; idxCounter < startupModules.length; ++idxCounter ) {
    try {
      resolveAndLoad( startupModules[idxCounter] ); // Attempt to load each startup module.
    } catch ( caughtIssue ) {
      // If an error occurs during loading, store it if it's the first one encountered.
      firstError = firstError || caughtIssue;
    }
  }

  // If there are startup modules, handle the exports of the last one.
  if ( startupModules.length ) {
    var finalExport = resolveAndLoad( startupModules[startupModules.length - 1] );

    // Handle various module export environments (CommonJS, AMD, global assignment).
    if ( typeof exports === "object" && typeof module !== "undefined" ) {
      module.exports = finalExport; // CommonJS export.
    } else if ( typeof define === "function" && define.amd ) {
      define( function() { return finalExport; } ); // AMD export.
    } else if ( exportToGlobal ) {
      this[exportToGlobal] = finalExport; // Assign to a global variable if specified.
    }
  }

  moduleLoader = resolveAndLoad; // Update the global loader reference to the fully initialized loader.

  // If any error was caught during the startup module loading, re-throw it now.
  if ( firstError ) {
    throw firstError;
  }

  return resolveAndLoad; // Return the main module loading function.
} (
  // The first parameter: an object containing all module definitions.
  {
    "Focm": [
      // This is the main application entry point module.
      function( getDep, currentMod, modExports ) {
        // A global store object for application modules, mimicking a namespace.
        var appStore = {};

        // Module: Control.Semigroupoid - Defines a type class for types that support an associative binary operation.
        !function( moduleReference ) {
          "use strict";
          var semigroupRecord = function( inputValue ) {
            this.composition = inputValue; // Stores the composition function.
          };
          var functionInstance = new semigroupRecord( function( firstFn ) {
            return function( secondFn ) {
              return function( thirdFn ) {
                return firstFn( secondFn( thirdFn ) ); // Function composition: f(g(h(x)))
              };
            };
          } );
          moduleReference.composition = function( inputVal ) {
            return inputVal.composition;
          };
          moduleReference.SemigroupContainer = semigroupRecord;
          moduleReference.semigroupoidFunction = functionInstance;
        }( appStore["Control.Semigroupoid"] = appStore["Control.Semigroupoid"] || {} );

        // Module: Control.Category - Extends Semigroupoid with an identity element.
        !function( categoryModule ) {
          "use strict";
          var semigrpRef = appStore["Control.Semigroupoid"]; // Reference to Semigroupoid module.
          var categoryConstructor = function( inputSemigroup, inputIdentity ) {
            this.Semigroupoid0 = inputSemigroup; // Inherits from Semigroupoid.
            this.identity      = inputIdentity;  // The identity function.
          };
          var categoryInstance = new categoryConstructor( function() {
            return semigrpRef.semigroupoidFunction; // Provides the semigroupoid instance.
          }, function( inputVal ) {
            return inputVal; // The identity function for categories.
          } );
          categoryModule.CategoryType = categoryConstructor;
          categoryModule.identityFunction = function( inputVal ) {
            return inputVal.identity;
          };
          categoryModule.functionCategory = categoryInstance;
        }( appStore["Control.Category"] = appStore["Control.Category"] || {} );

        // Module: Data.Boolean - Provides a basic boolean value.
        !function( booleanModule ) {
          "use strict";
          ( appStore["Data.Boolean"] = appStore["Data.Boolean"] || {} ).otherwise = true; // A constant for 'true'.
        }( appStore["Data.Boolean"] );

        // Module: Data.Function - Utility functions for working with functions.
        !function( functionModule ) {
          "use strict";
          // Dependencies are listed but not directly used in this specific export.
          appStore["Control.Category"];
          appStore["Data.Boolean"];
          appStore["Data.Ord"];
          appStore["Data.Ring"];
          functionModule.constValue = function( fixedValue ) {
            return function( ignoredValue ) {
              return fixedValue; // Returns a function that always returns 'fixedValue'.
            };
          };
        }( appStore["Data.Function"] = appStore["Data.Function"] || {} );

        // Module: Data.Functor - Type class for types that can be mapped over.
        !function( functorModule ) {
          "use strict";
          appStore["Data.Functor"];
          appStore["Control.Semigroupoid"];
          appStore["Data.Function"];
          appStore["Data.Unit"];
          functorModule.FunctorType = function( mapFunction ) {
            this.mapping = mapFunction; // Stores the map function.
          };
          functorModule.applyMap = function( instance ) {
            return instance.mapping;
          };
        }( appStore["Data.Functor"] = appStore["Data.Functor"] || {} );

        // Module: Control.Apply - Type class for types that can apply functions contained within them.
        !function( applyModule ) {
          "use strict";
          appStore["Control.Apply"];
          appStore["Control.Category"];
          appStore["Data.Function"];
          appStore["Data.Functor"];
          applyModule.ApplyType = function( functorInstance, applyFunction ) {
            this.Functor0 = functorInstance; // Inherits from Functor.
            this.execute  = applyFunction;   // The apply function.
          };
          applyModule.applyOperation = function( instance ) {
            return instance.execute;
          };
        }( appStore["Control.Apply"] = appStore["Control.Apply"] || {} );

        // Module: Control.Applicative - Extends Apply with a 'pure' function to lift values into the type.
        !function( applicativeModule ) {
          "use strict";
          appStore["Control.Apply"];
          appStore["Data.Functor"];
          appStore["Data.Unit"];
          applicativeModule.ApplicativeType = function( applyInstance, pureFunction ) {
            this.Apply0 = applyInstance; // Inherits from Apply.
            this.wrap   = pureFunction;  // The pure function.
          };
          applicativeModule.succeed = function( instance ) {
            return instance.wrap;
          };
        }( appStore["Control.Applicative"] = appStore["Control.Applicative"] || {} );

        // Module: Control.Bind - Type class for types that support sequencing computations.
        !function( bindModule ) {
          "use strict";
          // Various dependencies are listed here.
          appStore["Control.Bind"];
          appStore["Control.Applicative"];
          appStore["Control.Apply"];
          appStore["Control.Category"];
          appStore["Data.Function"];
          appStore["Data.Functor"];
          appStore["Data.Unit"];
          bindModule.BindType = function( applyInstance, bindFunction ) {
            this.Apply0 = applyInstance; // Inherits from Apply.
            this.chain  = bindFunction;  // The bind function (often called flatMap).
          };
          bindModule.chain = function( instance ) {
            return instance.chain;
          };
        }( appStore["Control.Bind"] = appStore["Control.Bind"] || {} );

        // Module: Data.Eq (Equality) - Defines a type class for types that can be compared for equality.
        !function( eqModule ) {
          "use strict";
          ( appStore["Data.Eq"] = appStore["Data.Eq"] || {} ).referentialEquality = function( firstVal ) {
            return function( secondVal ) {
              return firstVal === secondVal; // Strict equality check.
            };
          };
        }( appStore["Data.Eq"] );

        // Module: Data.Eq (Equality) - continuation, provides an instance for characters.
        !function( eqModule ) {
          "use strict";
          var eqRef = appStore["Data.Eq"];
          var eqConstructor = function( equalityFunction ) {
            this.eq = equalityFunction;
          };
          var charEqualityInstance = new eqConstructor( eqRef.referentialEquality ); // Instance using referential equality.
          eqModule.EqType = eqConstructor;
          eqModule.areEqual = function( instance ) {
            return instance.eq;
          };
          eqModule.charEquality = charEqualityInstance;
        }( appStore["Data.Eq"] = appStore["Data.Eq"] || {} );

        // Module: Data.Show - Defines a type class for types that can be converted to a string representation.
        !function( showModule ) {
          "use strict";
          ( appStore["Data.Show"] = appStore["Data.Show"] || {} ).showIntegerImplementation = function( numVal ) {
            return numVal.toString(); // Converts a number to its string representation.
          };
        }( appStore["Data.Show"] );

        // Module: Data.Show - continuation, provides an instance for integers.
        !function( showModule ) {
          "use strict";
          var showRef = appStore["Data.Show"];
          var showConstructor = function( displayFunction ) {
            this.show = displayFunction;
          };
          var integerDisplayInstance = new showConstructor( showRef.showIntegerImplementation ); // Instance for integers.
          showModule.ShowType = showConstructor;
          showModule.display = function( instance ) {
            return instance.show;
          };
          showModule.integerDisplay = integerDisplayInstance;
        }( appStore["Data.Show"] = appStore["Data.Show"] || {} );

        // Module: Data.Maybe (Option type) - Represents a value that may or may not be present.
        !function( maybeModule ) {
          "use strict";
          // Import necessary dependencies.
          var applyMod      = appStore["Control.Apply"],
              bindMod       = appStore["Control.Bind"],
              functionMod   = appStore["Data.Function"],
              functorMod    = appStore["Data.Functor"];

          // Define Nothing (absence of value) as a singleton object.
          var absentValueConstructor = function() {
            function TypeNothing() {}
            TypeNothing.value = new TypeNothing();
            return TypeNothing;
          }();

          // Define Just (presence of value) with a constructor.
          var presentValueConstructor = function() {
            function TypeJust( inputVal ) {
              this.firstVal = inputVal;
            }
            TypeJust.create = function( inputVal ) {
              return new TypeJust( inputVal );
            };
            return TypeJust;
          }();

          // Helper function for pattern matching on Maybe values.
          var maybeCaseHandler = function( onNothing ) {
            return function( onJust ) {
              return function( maybeVal ) {
                if ( maybeVal instanceof absentValueConstructor ) {
                  return onNothing; // Execute 'onNothing' callback if value is Absent.
                }
                if ( maybeVal instanceof presentValueConstructor ) {
                  return onJust( maybeVal.firstVal ); // Execute 'onJust' with the value if Present.
                }
                throw new Error("Pattern match failed at Data.Maybe (internal line reference): " + [onNothing.constructor.name, onJust.constructor.name, maybeVal.constructor.name]);
              };
            };
          };

          // Function to check if a Maybe value is Nothing.
          var isAbsentChecker = maybeCaseHandler( true )( functionMod.constValue( false ) );

          // Functor instance for Maybe, allowing mapping over its contained value.
          var maybeFunctorInstance = new functorMod.FunctorType( function( transformFn ) {
            return function( maybeVal ) {
              if ( maybeVal instanceof presentValueConstructor ) {
                return new presentValueConstructor( transformFn( maybeVal.firstVal ) ); // Apply function if Just.
              }
              return absentValueConstructor.value; // Return Nothing if Nothing.
            };
          } );

          // Apply instance for Maybe, allowing application of a function within a Maybe to a Maybe value.
          var maybeApplyInstance = new applyMod.ApplyType( function() {
            return maybeFunctorInstance; // Reference to the Functor instance.
          }, function( maybeFn ) {
            return function( maybeVal ) {
              if ( maybeFn instanceof presentValueConstructor ) {
                return functorMod.applyMap( maybeFunctorInstance )( maybeFn.firstVal )( maybeVal ); // Apply the function if it's Just.
              }
              if ( maybeFn instanceof absentValueConstructor ) {
                return absentValueConstructor.value; // If the function is Nothing, result is Nothing.
              }
              throw new Error("Pattern match failed at Data.Maybe (internal line reference): " + [maybeFn.constructor.name, maybeVal.constructor.name]);
            };
          } );

          // Bind instance for Maybe, allowing sequencing of Maybe-returning computations.
          var maybeBindInstance = new bindMod.BindType( function() {
            return maybeApplyInstance; // Reference to the Apply instance.
          }, function( maybeVal ) {
            return function( nextFn ) {
              if ( maybeVal instanceof presentValueConstructor ) {
                return nextFn( maybeVal.firstVal ); // Apply the next function to the value if Just.
              }
              if ( maybeVal instanceof absentValueConstructor ) {
                return absentValueConstructor.value; // If Nothing, result is Nothing.
              }
              throw new Error("Pattern match failed at Data.Maybe (internal line reference): " + [maybeVal.constructor.name, nextFn.constructor.name]);
            };
          } );

          maybeModule.Absent          = absentValueConstructor;
          maybeModule.Present         = presentValueConstructor;
          maybeModule.maybeCase       = maybeCaseHandler;
          maybeModule.checkIfAbsent   = isAbsentChecker;
          maybeModule.extractPresent  = function( maybeVal ) {
            return function( val ) {
              if ( val instanceof presentValueConstructor ) {
                return val.firstVal; // Extracts the value from a Just, throws error if Nothing.
              }
              throw new Error("Pattern match failed at Data.Maybe (internal line reference): " + [val.constructor.name]);
            };
          }(); // IIFE to immediately call and return the inner function.

          maybeModule.functorMaybeInstance = maybeFunctorInstance;
          maybeModule.applyMaybeInstance   = maybeApplyInstance;
          maybeModule.bindMaybeInstance    = maybeBindInstance;
        }( appStore["Data.Maybe"] = appStore["Data.Maybe"] || {} );

        // Module: Data.Either (Result type) - Represents a value that can be either an error (Left) or a success (Right).
        !function( eitherModule ) {
          "use strict";
          // Import necessary dependencies.
          var applicativeMod = appStore["Control.Applicative"],
              applyMod       = appStore["Control.Apply"],
              bindMod        = appStore["Control.Bind"],
              functorMod     = appStore["Data.Functor"],
              maybeMod       = appStore["Data.Maybe"];

          // Define Left (error value) with a constructor.
          var errorValueConstructor = function() {
            function TypeErrorVal( inputVal ) {
              this.firstVal = inputVal;
            }
            TypeErrorVal.create = function( inputVal ) {
              return new TypeErrorVal( inputVal );
            };
            return TypeErrorVal;
          }();

          // Define Right (success value) with a constructor.
          var successValueConstructor = function() {
            function TypeSuccessVal( inputVal ) {
              this.firstVal = inputVal;
            }
            TypeSuccessVal.create = function( inputVal ) {
              return new TypeSuccessVal( inputVal );
            };
            return TypeSuccessVal;
          }();

          // Functor instance for Either, allowing mapping over the Right value.
          var eitherFunctorInstance = new functorMod.FunctorType( function( transformFn ) {
            return function( eitherVal ) {
              if ( eitherVal instanceof errorValueConstructor ) {
                return new errorValueConstructor( eitherVal.firstVal ); // Left remains Left.
              }
              if ( eitherVal instanceof successValueConstructor ) {
                return new successValueConstructor( transformFn( eitherVal.firstVal ) ); // Apply function to Right value.
              }
              throw new Error("Pattern match failed at Data.Either (internal line reference): " + [eitherVal.constructor.name]);
            };
          } );

          // Helper function for pattern matching on Either values.
          var eitherCaseHandler = function( onLeft ) {
            return function( onRight ) {
              return function( eitherVal ) {
                if ( eitherVal instanceof errorValueConstructor ) {
                  return onLeft( eitherVal.firstVal ); // Execute 'onLeft' callback for error.
                }
                if ( eitherVal instanceof successValueConstructor ) {
                  return onRight( eitherVal.firstVal ); // Execute 'onRight' callback for success.
                }
                throw new Error("Pattern match failed at Data.Either (internal line reference): " + [onLeft.constructor.name, onRight.constructor.name, eitherVal.constructor.name]);
              };
            };
          };

          // Apply instance for Either.
          var eitherApplyInstance = new applyMod.ApplyType( function() {
            return eitherFunctorInstance; // Reference to the Functor instance.
          }, function( eitherFn ) {
            return function( eitherVal ) {
              if ( eitherFn instanceof errorValueConstructor ) {
                return new errorValueConstructor( eitherFn.firstVal ); // If function is Left, result is Left.
              }
              if ( eitherFn instanceof successValueConstructor ) {
                return functorMod.applyMap( eitherFunctorInstance )( eitherFn.firstVal )( eitherVal ); // Apply function if Right.
              }
              throw new Error("Pattern match failed at Data.Either (internal line reference): " + [eitherFn.constructor.name, eitherVal.constructor.name]);
            };
          } );

          // Bind instance for Either, allowing sequencing of Either-returning computations.
          var eitherBindInstance = new bindMod.BindType( function() {
            return eitherApplyInstance; // Reference to the Apply instance.
          }, eitherCaseHandler( function( leftVal ) {
            return function( ignoredFn ) {
              return new errorValueConstructor( leftVal ); // If Left, propagate Left.
            };
          } )( function( rightVal ) {
            return function( nextFn ) {
              return nextFn( rightVal ); // If Right, apply next function.
            };
          } ) );

          // Applicative instance for Either.
          var eitherApplicativeInstance = new applicativeMod.ApplicativeType( function() {
            return eitherApplyInstance; // Reference to the Apply instance.
          }, successValueConstructor.create ); // 'pure' function is SuccessValue.create.

          eitherModule.ErrorValue           = errorValueConstructor;
          eitherModule.SuccessValue         = successValueConstructor;
          eitherModule.eitherCase           = eitherCaseHandler;
          eitherModule.annotateError        = function( errorMsg ) {
            return maybeMod.maybeCase( new errorValueConstructor( errorMsg ) )( successValueConstructor.create ); // Converts Maybe to Either, with a default error message.
          };
          eitherModule.functorEitherInstance  = eitherFunctorInstance;
          eitherModule.applyEitherInstance    = eitherApplyInstance;
          eitherModule.applicativeEitherInstance = eitherApplicativeInstance;
          eitherModule.bindEitherInstance     = eitherBindInstance;
        }( appStore["Data.Either"] = appStore["Data.Either"] || {} );

        // Module: Partial.Unsafe - Provides unsafe operations for partial functions.
        !function( unsafePartialModule ) {
          "use strict";
          ( appStore["Partial.Unsafe"] = appStore["Partial.Unsafe"] || {} ).unsafeExecute = function( funcToRun ) {
            return funcToRun(); // Directly executes a function, bypassing safety checks.
          };
        }( appStore["Partial.Unsafe"] );

        // Module: Partial - Provides functions for handling partiality (e.g., crashing).
        !function( partialModule ) {
          "use strict";
          ( appStore["Partial"] = appStore["Partial"] || {} ).crashApplication = function() {
            return function( crashMessage ) {
              throw new Error( crashMessage ); // Throws an error, effectively crashing the application.
            };
          };
        }( appStore["Partial"] );

        // Module: Partial (continuation) - Re-exports crashApplication.
        !function( partialModule ) {
          "use strict";
          var partialRef = appStore["Partial"];
          partialModule.forceCrash = partialRef.crashApplication;
        }( appStore.Partial = appStore.Partial || {} );

        // Module: Partial.Unsafe (continuation) - Provides an unsafe crash function.
        !function( unsafePartialModule ) {
          "use strict";
          var unsafeRef = appStore["Partial.Unsafe"],
              partialRef  = appStore["Partial"];
          unsafePartialModule.unsafeCrashWith = function( crashMessage ) {
            return unsafeRef.unsafeExecute( function( ignored ) {
              return partialRef.crashApplication( ignored )( crashMessage ); // Unsafely crashes with a message.
            } );
          };
        }( appStore["Partial.Unsafe"] = appStore["Partial.Unsafe"] || {} );

        // Module: Control.Monad.Rec.Class - Defines a type class for monadic recursion.
        !function( recursionModule ) {
          "use strict";
          // A constructor for a 'Loop' state in tail recursion, indicating more iterations.
          var loopStateConstructor = function() {
            function LoopState( inputVal ) {
              this.firstVal = inputVal;
            }
            LoopState.create = function( inputVal ) {
              return new LoopState( inputVal );
            };
            return LoopState;
          }();

          // A constructor for a 'Done' state in tail recursion, indicating completion.
          var completionStateConstructor = function() {
            function CompletionState( inputVal ) {
              this.firstVal = inputVal;
            }
            CompletionState.create = function( inputVal ) {
              return new CompletionState( inputVal );
            };
            return CompletionState;
          }();

          recursionModule.Continuation = loopStateConstructor;
          recursionModule.Completion   = completionStateConstructor;

          recursionModule.tailRecurse = function( recursiveFunc ) {
            return function( initialVal ) {
              // The inner function sets up and manages the tail recursion loop.
              return function( initialValInner ) {
                var resultValue,
                    finishedLoop = false;

                // Helper function to process each step of the recursion.
                function processStep( currentStepVal ) {
                  // If the current step value is not a LoopState, it must be a CompletionState.
                  if ( !( currentStepVal instanceof loopStateConstructor ) ) {
                    if ( currentStepVal instanceof completionStateConstructor ) {
                      finishedLoop = true; // Mark the loop as complete.
                      return currentStepVal.firstVal; // Return the final result.
                    }
                    throw new Error("Pattern match failed at Control.Monad.Rec.Class (internal line reference): " + [currentStepVal.constructor.name]);
                  }
                  // If it's a LoopState, apply the recursive function to get the next state.
                  initialValInner = recursiveFunc( currentStepVal.firstVal );
                }

                // Main loop execution: continues as long as 'finishedLoop' is false.
                for ( ; !finishedLoop; ) {
                  resultValue = processStep( initialValInner ); // Process the current state to determine the next action.
                }
                return resultValue; // Return the final computed value.
              }( recursiveFunc( initialVal ) ); // Initial call to the recursive function to start the process.
            };
          };
        }( appStore["Control.Monad.Rec.Class"] = appStore["Control.Monad.Rec.Class"] || {} );

        // Module: Data.Array - Provides utility functions for working with arrays.
        !function( arrayOps ) {
          "use strict";
          arrayOps.getSize = function( arr ) {
            return arr.length; // Returns the number of elements in an array.
          };
          arrayOps.retrieveElement = function( onNothing ) {
            return function( onJust ) {
              return function( arr ) {
                return function( index ) {
                  // Returns 'onNothing' if index is out of bounds, otherwise 'onJust' with the element.
                  return ( index < 0 || index >= arr.length ) ? onNothing : onJust( arr[index] );
                };
              };
            };
          };
          arrayOps.filterElements = function( predicateFn ) {
            return function( arr ) {
              return arr.filter( predicateFn ); // Filters array elements based on a predicate.
            };
          };
          arrayOps.extractSlice = function( startIndex ) {
            return function( endIndex ) {
              return function( arr ) {
                return arr.slice( startIndex, endIndex ); // Extracts a slice of the array.
              };
            };
          };
          arrayOps.removeFirstN = function( count ) {
            return function( arr ) {
              return count < 1 ? arr : arr.slice( count ); // Drops the first 'count' elements.
            };
          };
        }( appStore["Data.Array"] = appStore["Data.Array"] || {} );

        // Module: Data.Tuple - Provides a simple pair (tuple) data structure.
        !function( tupleMod ) {
          "use strict";
          // Constructor for a Pair (Tuple).
          var tupleConstructor = function() {
            function Pair( firstValue, secondValue ) {
              this.firstVal = firstValue;
              this.secondVal = secondValue;
            }
            Pair.create = function( firstValue ) {
              return function( secondValue ) {
                return new Pair( firstValue, secondValue ); // Factory function to create a Pair.
              };
            };
            return Pair;
          }();
          tupleMod.Pair = tupleConstructor;
        }( appStore["Data.Tuple"] = appStore["Data.Tuple"] || {} );

        // Module: Unsafe.Coerce - Provides an unsafe identity function for type coercion.
        !function( unsafeCoerceMod ) {
          "use strict";
          ( appStore["Unsafe.Coerce"] = appStore["Unsafe.Coerce"] || {} ).forceCast = function( val ) {
            return val; // Returns the input value unchanged, but semantically "casts" its type.
          };
        }( appStore["Unsafe.Coerce"] );

        // Module: Unsafe.Coerce (continuation) - Re-exports forceCast.
        !function( unsafeCoerceMod ) {
          "use strict";
          var unsafeRef = appStore["Unsafe.Coerce"];
          unsafeCoerceMod.forceCast = unsafeRef.forceCast;
        }( appStore["Unsafe.Coerce"] = appStore["Unsafe.Coerce"] || {} );

        // Module: Data.Array (continuation) - Provides more array-related functions.
        !function( arrayMod ) {
          "use strict";
          var arrayOpsRef = appStore["Data.Array"],
              maybeModRef = appStore["Data.Maybe"];

          // A specialized element fetcher using Maybe for presence/absence.
          var elementFetcher = arrayOpsRef.retrieveElement( maybeModRef.Present.create )( maybeModRef.Absent.value );

          arrayMod.firstElement = function( arr ) {
            return elementFetcher( arr )( 0 ); // Gets the first element of an array as a Maybe.
          };
          arrayMod.indexedAccess = elementFetcher; // Provides indexed access to array elements.
          arrayMod.getSize = arrayOpsRef.getSize;
          arrayMod.filterElements = arrayOpsRef.filterElements;
          arrayMod.removeFirstN = arrayOpsRef.removeFirstN;
        }( appStore["Data.Array"] = appStore["Data.Array"] || {} );

        // Module: Data.Int - Provides functions for working with integers, including string parsing.
        !function( integerModule ) {
          "use strict";
          ( appStore["Data.Int"] = appStore["Data.Int"] || {} ).parseStringBaseImplementation = function( onJust ) {
            return function( onNothing ) {
              return function( base ) {
                return function( inputString ) {
                  var regexPattern;
                  // Dynamically construct a regex pattern based on the provided base.
                  if ( base < 11 ) {
                    regexPattern = "[0-" + ( base - 1 ).toString() + "]";
                  } else if ( base === 11 ) {
                    regexPattern = "[0-9a]";
                  } else {
                    regexPattern = "[0-9a-" + String.fromCharCode( 86 + base ) + "]";
                  }
                  var charRegex = new RegExp( "^[\\+\\-]?" + regexPattern + "+$", "i" );

                  return function( strValue ) {
                    if ( charRegex.test( strValue ) ) {
                      var parsedNumber = parseInt( strValue, base );
                      // Check if the parsed number is a valid integer.
                      return ( Math.trunc( parsedNumber ) === parsedNumber ) ? onJust( parsedNumber ) : onNothing;
                    }
                    return onNothing; // Return 'onNothing' if the string doesn't match the regex.
                  };
                };
              };
            };
          };
        }( appStore["Data.Int"] );

        // Module: Data.Int (continuation) - Provides specific integer parsing functions.
        !function( integerModule ) {
          "use strict";
          var intRef    = appStore["Data.Int"],
              maybeMod  = appStore["Data.Maybe"];

          // A parser function that returns a Maybe (Just if successful, Nothing otherwise).
          var parserFunction = intRef.parseStringBaseImplementation( maybeMod.Present.create )( maybeMod.Absent.value );
          var decimalParser  = parserFunction( 10 ); // Specialized parser for base 10 (decimal).

          integerModule.parseString = decimalParser;
          integerModule.parseStringWithBase = parserFunction;
        }( appStore["Data.Int"] = appStore["Data.Int"] || {} );

        // Module: Data.String.CodeUnits - Provides functions for working with string code units (characters).
        !function( stringCodeUnitsMod ) {
          "use strict";
          stringCodeUnitsMod.toCharList = function( str ) {
            return str.split(""); // Converts a string into an array of characters.
          };
          stringCodeUnitsMod.getSize = function( str ) {
            return str.length; // Returns the length of the string.
          };
          stringCodeUnitsMod.findSubstrInternal = function( onJust ) {
            return function( onNothing ) {
              return function( searchStr ) {
                return function( fromIndex ) {
                  return function( targetStr ) {
                    // Handle out-of-bounds start index gracefully.
                    if ( fromIndex < 0 || fromIndex > targetStr.length ) {
                      return onNothing;
                    }
                    var foundIndex = targetStr.indexOf( searchStr, fromIndex );
                    // If substring is not found, return 'onNothing', otherwise 'onJust' with the index.
                    return ( foundIndex === -1 ) ? onNothing : onJust( foundIndex );
                  };
                };
              };
            };
          };
          stringCodeUnitsMod.extractInternalSlice = function( startIndex ) {
            return function( endIndex ) {
              return function( str ) {
                return str.slice( startIndex, endIndex ); // Extracts a substring.
              };
            };
          };
        }( appStore["Data.String.CodeUnits"] = appStore["Data.String.CodeUnits"] || {} );

        // Module: Data.String.CodeUnits (continuation) - Provides more string utility functions.
        !function( stringCodeUnitsMod ) {
          "use strict";
          var codeUnitsRef = appStore["Data.String.CodeUnits"],
              maybeMod     = appStore["Data.Maybe"],
              booleanMod   = appStore["Data.Boolean"];

          // A specialized index finder that returns a Maybe.
          var indexFinder = codeUnitsRef.findSubstrInternal( maybeMod.Present.create )( maybeMod.Absent.value );

          stringCodeUnitsMod.findSubstr = indexFinder;

          stringCodeUnitsMod.extractSlice = function( startIndex ) {
            return function( endIndex ) {
              return function( targetString ) {
                var stringLength = codeUnitsRef.getSize( targetString );
                // Resolve negative indices relative to the string end.
                var resolvedEndIndex = function( idx ) {
                  if ( idx < 0 ) {
                    return Math.trunc( stringLength + idx );
                  }
                  if ( booleanMod.otherwise ) {
                    return idx;
                  }
                  throw new Error("Pattern match failed at Data.String.CodeUnits (internal line reference): " + [idx.constructor.name]);
                }( endIndex );
                var resolvedStartIndex = function( idx ) {
                  if ( idx < 0 ) {
                    return Math.trunc( stringLength + idx );
                  }
                  if ( booleanMod.otherwise ) {
                    return idx;
                  }
                  throw new Error("Pattern match failed at Data.String.CodeUnits (internal line reference): " + [idx.constructor.name]);
                }( startIndex );

                // Validate indices before performing the slice.
                if ( resolvedStartIndex < 0 || resolvedStartIndex >= stringLength || resolvedEndIndex < 0 || resolvedEndIndex > stringLength || resolvedStartIndex > resolvedEndIndex ) {
                  return maybeMod.Absent.value; // Return Nothing if indices are invalid.
                }
                return new maybeMod.Present( codeUnitsRef.extractInternalSlice( startIndex )( endIndex )( targetString ) );
              };
            };
          };
          stringCodeUnitsMod.toCharList = codeUnitsRef.toCharList;
          stringCodeUnitsMod.getSize = codeUnitsRef.getSize;
        }( appStore["Data.String.CodeUnits"] = appStore["Data.String.CodeUnits"] || {} );

        // Module: Data.String.Common - Provides common string manipulation functions.
        !function( commonStringMod ) {
          "use strict";
          commonStringMod.splitString = function( delimiter ) {
            return function( str ) {
              return str.split( delimiter ); // Splits a string by a delimiter.
            };
          };
          commonStringMod.trimWhitespace = function( str ) {
            return str.trim(); // Removes leading/trailing whitespace.
          };
        }( appStore["Data.String.Common"] = appStore["Data.String.Common"] || {} );

        // Module: Data.String.Common (continuation) - Re-exports common string functions.
        !function( commonStringMod ) {
          "use strict";
          var commonRef = appStore["Data.String.Common"];
          commonStringMod.splitString = commonRef.splitString;
          commonStringMod.trimWhitespace = commonRef.trimWhitespace;
        }( appStore["Data.String.Common"] = appStore["Data.String.Common"] || {} );

        // Module: AtCoder.Tenka12019Beginner.C (Core Logic) - Contains the main problem-solving algorithm.
        !function( solverModule ) {
          "use strict";
          // Import all necessary modules for the core logic.
          var applicativeMod        = appStore["Control.Applicative"],
              bindMod               = appStore["Control.Bind"],
              categoryMod           = appStore["Control.Category"],
              recursionMod          = appStore["Control.Monad.Rec.Class"],
              arrayMod              = appStore["Data.Array"],
              eitherMod             = appStore["Data.Either"],
              eqMod                 = appStore["Data.Eq"],
              intMod                = appStore["Data.Int"],
              maybeMod              = appStore["Data.Maybe"],
              showMod               = appStore["Data.Show"],
              stringCodeUnitsMod    = appStore["Data.String.CodeUnits"],
              commonStringMod       = appStore["Data.String.Common"],
              tupleMod              = appStore["Data.Tuple"],
              partialMod            = appStore["Partial.Unsafe"];

          // The main solve function, which takes raw input text and returns a solution.
          solverModule.processInput = function( rawInputText ) {
            // Handle the result: if it's a Left (error), crash the application; otherwise, return the Right value.
            return eitherMod.eitherCase( function( errorMsg ) {
              return partialMod.unsafeCrashWith( errorMsg );
            } )( categoryMod.identityFunction( categoryMod.functionCategory ) )(
              // Begin processing the input string.
              ( function() {
                var inputLines = commonStringMod.splitString( "\n" )( commonStringMod.trimWhitespace( rawInputText ) );

                // Attempt to parse the first line as the integer 'n'.
                return bindMod.chain( eitherMod.bindEitherInstance )(
                  eitherMod.annotateError( "lineCount" )(
                    bindMod.chain( maybeMod.bindMaybeInstance )(
                      arrayMod.firstElement( inputLines )
                    )( intMod.parseString )
                  )
                )( function( parsedLineCount ) {
                  // If 'n' is parsed successfully, attempt to get the second line as 's'.
                  return bindMod.chain( eitherMod.bindEitherInstance )(
                    eitherMod.annotateError( "inputSequence" )(
                      arrayMod.firstElement( arrayMod.removeFirstN( 1 )( inputLines ) ) // Get the second line from the input.
                    )
                  )( function( sequenceString ) {
                    // If both 'n' and 's' are successfully processed, proceed with the main algorithm.
                    return applicativeMod.succeed( eitherMod.applicativeEitherInstance )(
                      showMod.display( showMod.integerDisplay )(
                        // Use a tail-recursive function to count the required operations.
                        recursionMod.tailRecurse( function( recursionState ) {
                          var currentSequence = sequenceString; // Alias for the sequence string.
                          // Find the first occurrence of "#." starting from the current index.
                          var hashDotIndex = stringCodeUnitsMod.findSubstr( "#." )( recursionState.firstVal )( currentSequence );

                          // Pattern matching on the result of finding "#.".
                          if ( hashDotIndex instanceof maybeMod.Absent ) {
                            return new recursionMod.Completion( recursionState.secondVal ); // "#." not found, recursion ends.
                          }
                          if ( hashDotIndex instanceof maybeMod.Present ) {
                            // Check if there's another "#." after the current one (at index + 2).
                            if ( maybeMod.checkIfAbsent( stringCodeUnitsMod.findSubstr( "#." )( Math.trunc( hashDotIndex.firstVal + 2 ) )( currentSequence ) ) ) {
                              // If no further "#." is found, count '.' characters in the remaining part of the string.
                              var remainingSlice = stringCodeUnitsMod.extractSlice( Math.trunc( hashDotIndex.firstVal + 1 ) )( stringCodeUnitsMod.getSize( currentSequence ) )( currentSequence );
                              var dotCount = arrayMod.getSize(
                                arrayMod.filterElements(
                                  eqMod.areEqual( eqMod.charEquality )( "." )
                                )( stringCodeUnitsMod.toCharList( maybeMod.extractPresent()( remainingSlice ) ) )
                              );
                              return new recursionMod.Completion( Math.trunc( recursionState.secondVal + dotCount ) ); // Add dot count and complete.
                            }
                            // If another "#." exists, continue the recursion, moving past the current "#.".
                            return new recursionMod.Continuation(
                              new tupleMod.Pair( Math.trunc( hashDotIndex.firstVal + 1 ), Math.trunc( recursionState.secondVal + 1 ) )
                            );
                          }
                          // This case should ideally not be reached if Maybe is handled exhaustively.
                          throw new Error("Pattern match failed at AtCoder.Tenka12019Beginner.C (internal line reference): " + [hashDotIndex.constructor.name]);
                        } )( new tupleMod.Pair( 0, 0 ) ) // Initial state for recursion: (start index, operation count).
                      )
                    );
                  } );
                } );
              } )()
            );
          };
        }( appStore["AtCoder.Tenka12019Beginner.C"] = appStore["AtCoder.Tenka12019Beginner.C"] || {} );

        // Module: Effect.Console - Provides console logging functionality as an effect.
        !function( consoleEffect ) {
          "use strict";
          ( appStore["Effect.Console"] = appStore["Effect.Console"] || {} ).logMessage = function( msg ) {
            return function() {
              console.log( msg ); // Logs the message to the console.
              return {}; // Returns an empty object (Unit type).
            };
          };
        }( appStore["Effect.Console"] );

        // Module: Effect.Console (continuation) - Re-exports logMessage.
        !function( consoleEffect ) {
          "use strict";
          var consoleEffectRef = appStore["Effect.Console"];
          consoleEffect.logMessage = consoleEffectRef.logMessage;
        }( appStore["Effect.Console"] = appStore["Effect.Console"] || {} );

        // Module: Node.Encoding - Defines various text encodings for Node.js operations.
        !function( encodingModule ) {
          "use strict";
          var showModRef = appStore["Data.Show"];

          // Define various encoding types as singleton objects for distinct instances.
          var asciiEncoding = function() {
            function AsciiType() {}
            AsciiType.value = new AsciiType();
            return AsciiType;
          }();
          var utf8Encoding = function() {
            function Utf8Type() {}
            Utf8Type.value = new Utf8Type();
            return Utf8Type;
          }();
          var utf16leEncoding = function() {
            function Utf16leType() {}
            Utf16leType.value = new Utf16leType();
            return Utf16leType;
          }();
          var ucs2Encoding = function() {
            function Ucs2Type() {}
            Ucs2Type.value = new Ucs2Type();
            return Ucs2Type;
          }();
          var base64Encoding = function() {
            function Base64Type() {}
            Base64Type.value = new Base64Type();
            return Base64Type;
          }();
          var latin1Encoding = function() {
            function Latin1Type() {}
            Latin1Type.value = new Latin1Type();
            return Latin1Type;
          }();
          var binaryEncoding = function() {
            function BinaryType() {}
            BinaryType.value = new BinaryType();
            return BinaryType;
          }();
          var hexEncoding = function() {
            function HexType() {}
            HexType.value = new HexType();
            return HexType;
          }();

          // Show instance for Encoding types, providing their string representation.
          var encodingDisplay = new showModRef.ShowType( function( encodingVal ) {
            if ( encodingVal instanceof asciiEncoding )    return "ASCII";
            if ( encodingVal instanceof utf8Encoding )     return "UTF8";
            if ( encodingVal instanceof utf16leEncoding )  return "UTF16LE";
            if ( encodingVal instanceof ucs2Encoding )     return "UCS2";
            if ( encodingVal instanceof base64Encoding )   return "Base64";
            if ( encodingVal instanceof latin1Encoding )   return "Latin1";
            if ( encodingVal instanceof binaryEncoding )   return "Binary";
            if ( encodingVal instanceof hexEncoding )      return "Hex";
            throw new Error("Pattern match failed at Node.Encoding (internal line reference): " + [encodingVal.constructor.name]);
          } );

          encodingModule.ASCII   = asciiEncoding;
          encodingModule.UTF8    = utf8Encoding;
          encodingModule.UTF16LE = utf16leEncoding;
          encodingModule.UCS2    = ucs2Encoding;
          encodingModule.Base64  = base64Encoding;
          encodingModule.Latin1  = latin1Encoding;
          encodingModule.Binary  = binaryEncoding;
          encodingModule.Hex     = hexEncoding;
          encodingModule.showEncoding = encodingDisplay;
        }( appStore["Node.Encoding"] = appStore["Node.Encoding"] || {} );

        // Module: Node.FS.Internal - Internal utilities for Node.js file system access.
        !function( fsInternalModule ) {
          "use strict";
          ( appStore["Node.FS.Internal"] = appStore["Node.FS.Internal"] || {} ).unsafeGetFileSystem = require("fs"); // Directly requires the Node.js 'fs' module.
        }( appStore["Node.FS.Internal"] );

        // Module: Node.FS.Internal (continuation) - Provides a way to create effects.
        !function( fsInternalModule ) {
          "use strict";
          var internalFsRef = appStore["Node.FS.Internal"],
              unsafeCoerceRef = appStore["Unsafe.Coerce"];

          fsInternalModule.createEffect = unsafeCoerceRef.forceCast; // Uses unsafe coercion to wrap a computation in an Effect.
          fsInternalModule.unsafeGetFileSystem = internalFsRef.unsafeGetFileSystem;
        }( appStore["Node.FS.Internal"] = appStore["Node.FS.Internal"] || {} );

        // Module: Node.FS.Sync - Provides synchronous file system operations for Node.js.
        !function( fsSyncModule ) {
          "use strict";
          var showModRef        = appStore["Data.Show"],
              encodingModRef    = appStore["Node.Encoding"],
              fsInternalModRef  = appStore["Node.FS.Internal"];

          var fileSystemAPI = fsInternalModRef.unsafeGetFileSystem; // Access to the raw Node.js 'fs' module.

          fsSyncModule.readTextFileSynchronous = function( textEncoding ) {
            return function( filePath ) {
              return fsInternalModRef.createEffect( function() {
                return fileSystemAPI.readFileSync( filePath, {
                  encoding: showModRef.display( encodingModRef.showEncoding )( textEncoding ) // Read file synchronously with specified encoding.
                } );
              } );
            };
          };
        }( appStore["Node.FS.Sync"] = appStore["Node.FS.Sync"] || {} );

        // Module: Main (Application Entry Point) - The primary entry point for the application.
        !function( mainModule ) {
          "use strict";
          // Import necessary modules for the main application function.
          var solutionProvider = appStore["AtCoder.Tenka12019Beginner.C"],
              consoleEffect    = appStore["Effect.Console"],
              encodingMod      = appStore["Node.Encoding"],
              fsSyncMod        = appStore["Node.FS.Sync"];

          // Define the main function to execute the application logic.
          mainModule.mainApplication = function() {
            // Read input from the standard input stream using UTF8 encoding.
            var fileContent = fsSyncMod.readTextFileSynchronous( encodingMod.UTF8.value )( "/dev/stdin" )();
            // Process the input content using the problem solver.
            var solutionResult = solutionProvider.processInput( fileContent );
            // Log the resulting solution to the console.
            return consoleEffect.logMessage( solutionResult )();
          };
        }( appStore.Main = appStore.Main || {} );

        // Execute the main application function to start the program.
        appStore.Main.mainApplication();
      }, {}
    ]
  },
  {}, // The second parameter: an initially empty object to serve as the module cache.
  ["Focm"], // The third parameter: an array containing the ID of the main entry point module.
  null // The fourth parameter: null, indicating no global export name for this bundle.
);