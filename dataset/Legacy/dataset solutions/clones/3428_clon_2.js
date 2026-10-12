moduleLoaderSystem = function ( moduleDefinitions, resolvedModules, moduleIdsToLoad, entryPointName ) {
  // Store a reference to the previous module loader if available
  var firstErrorEncountered, previousLoader = ( "function" === typeof moduleLoaderSystem && moduleLoaderSystem ),
      nodeRequireReference = ( "function" === typeof require && require );

  // The core function to load a module by its ID
  function loadModuleById ( currentModuleId, suppressError ) {
    // Check if the module is already resolved (cached)
    if ( !resolvedModules[ currentModuleId ] ) {
      // If not in cache, check if it's in the definitions
      if ( !moduleDefinitions[ currentModuleId ] ) {
        // If not defined, try to load it from a parent loader
        var anotherLoader = ( "function" === typeof moduleLoaderSystem && moduleLoaderSystem );
        if ( !suppressError && anotherLoader ) return anotherLoader( currentModuleId, true );
        if ( previousLoader ) return previousLoader( currentModuleId, true );
        if ( nodeRequireReference && "string" === typeof currentModuleId ) return nodeRequireReference( currentModuleId );

        // If all else fails, throw an error
        var errorObject = new Error( "Unable to locate module: '" + currentModuleId + "'" );
        throw errorObject.errorCode = "MISSING_MODULE", errorObject;
      }

      // Prepare a resolver for relative paths within the module
      moduleResolver.resolve = function ( relativePath ) {
        return moduleDefinitions[ currentModuleId ][ 1 ][ relativePath ] || relativePath;
      };
      // Initialize module cache
      moduleResolver.cache = {};

      // Create a new module instance and add it to resolved modules
      var currentModuleInstance = resolvedModules[ currentModuleId ] = new loadModuleById.ModuleWrapper( currentModuleId );
      // Execute the module's code
      moduleDefinitions[ currentModuleId ][ 0 ].call( currentModuleInstance.exportedBindings, moduleResolver, currentModuleInstance, currentModuleInstance.exportedBindings, this );
    }

    // Return the exports of the resolved module
    return resolvedModules[ currentModuleId ].exportedBindings;

    // Helper function for requiring modules
    function moduleResolver ( requestPath ) {
      return loadModuleById( moduleResolver.resolve( requestPath ) );
    }
  }

  // Mark this loader as active
  loadModuleById.isModuleSystemActive = true;

  // Define the ModuleWrapper constructor
  loadModuleById.ModuleWrapper = function ( idValue ) {
    this.identification = idValue;
    this.associatedBundle = loadModuleById;
    this.exportedBindings = {};
  };

  // Store references to module definitions and cache
  loadModuleById.definedModuleSources = moduleDefinitions;
  loadModuleById.loadedModuleCache = resolvedModules;
  loadModuleById.parentModuleLoader = previousLoader;

  // Function to register new modules dynamically
  loadModuleById.registerNewModule = function ( newModuleId, newModuleContent ) {
    moduleDefinitions[ newModuleId ] = [ function ( requestModule, currentModuleObject ) { currentModuleObject.exportedBindings = newModuleContent; }, {} ];
  };

  // Iterate through the list of entry point module IDs and load them
  for ( var idx = 0; idx < moduleIdsToLoad.length; idx++ ) {
    try {
      loadModuleById( moduleIdsToLoad[ idx ] );
    } catch ( loopError ) {
      // Catch and store the first error encountered during loading
      firstErrorEncountered || ( firstErrorEncountered = loopError );
    }
  }

  // If there are entry points, get the last one's exports
  if ( moduleIdsToLoad.length ) {
    var lastLoadedModule = loadModuleById( moduleIdsToLoad[ moduleIdsToLoad.length - 1 ] );
    // Handle different module export environments (CommonJS, AMD, global)
    "object" === typeof exports && "undefined" !== typeof module ? module.exports = lastLoadedModule : "function" === typeof define && define.amd ? define( function () { return lastLoadedModule; } ) : entryPointName && ( this[ entryPointName ] = lastLoadedModule );
  }

  // Update the global module loader reference
  if ( moduleLoaderSystem = loadModuleById, firstErrorEncountered ) throw firstErrorEncountered;

  // Return the configured module loader
  return loadModuleById;
}( {
  "PrimaryApplicationCode": [ function ( requestModule, currentModuleObject, exportedBindings ) {
    // Initialize an object to hold application-specific modules
    var applicationNamespace = {};

    // Define Data.Functor module
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Data.Functor" ], applicationNamespace[ "Control.Semigroupoid" ], applicationNamespace[ "Data.Function" ], applicationNamespace[ "Data.Unit" ];
      // Constructor for Functor type class
      moduleExportObject.Functor = function ( implementationFunc ) { this.map = implementationFunc; };
      // Map function for Functor
      moduleExportObject.map = function ( instance ) { return instance.map; };
    } )( applicationNamespace[ "DataStructures.Functional.Functor" ] = applicationNamespace[ "DataStructures.Functional.Functor" ] || {} );

    // Define Control.Apply module
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Control.Apply" ], applicationNamespace[ "Control.Category" ], applicationNamespace[ "Data.Function" ], applicationNamespace[ "Data.Functor" ];
      // Constructor for Apply type class
      moduleExportObject.Apply = function ( functorInstance, applyFunc ) { this.Functor0 = functorInstance, this.apply = applyFunc; };
      // Apply function for Apply
      moduleExportObject.apply = function ( instance ) { return instance.apply; };
    } )( applicationNamespace[ "Control.Functional.Apply" ] = applicationNamespace[ "Control.Functional.Apply" ] || {} );

    // Define Control.Applicative module
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Control.Apply" ], applicationNamespace[ "Data.Functor" ], applicationNamespace[ "Data.Unit" ];
      // Constructor for Applicative type class
      moduleExportObject.Applicative = function ( applyInstance, pureFunc ) { this.Apply0 = applyInstance, this.pure = pureFunc; };
      // Pure function for Applicative
      moduleExportObject.pure = function ( instance ) { return instance.pure; };
    } )( applicationNamespace[ "Control.Functional.Applicative" ] = applicationNamespace[ "Control.Functional.Applicative" ] || {} );

    // Define Control.Bind module
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Control.Bind" ], applicationNamespace[ "Control.Applicative" ], applicationNamespace[ "Control.Apply" ], applicationNamespace[ "Control.Category" ], applicationNamespace[ "Data.Function" ], applicationNamespace[ "Data.Functor" ], applicationNamespace[ "Data.Unit" ];
      // Constructor for Bind type class
      moduleExportObject.Bind = function ( applyInstance, bindFunc ) { this.Apply0 = applyInstance, this.bind = bindFunc; };
      // Bind function for Bind
      moduleExportObject.bind = function ( instance ) { return instance.bind; };
    } )( applicationNamespace[ "Control.Functional.Bind" ] = applicationNamespace[ "Control.Functional.Bind" ] || {} );

    // Define Data.Bounded module (Int bounds)
    ( function ( moduleExportObject ) {
      "use strict";
      moduleExportObject.topInt = 2147483647; // Max signed 32-bit integer
      moduleExportObject.bottomInt = -2147483648; // Min signed 32-bit integer
    } )( applicationNamespace[ "DataStructures.Bounded" ] = applicationNamespace[ "DataStructures.Bounded" ] || {} );

    // Define Data.Eq module (refEq)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "DataStructures.Equality" ] = applicationNamespace[ "DataStructures.Equality" ] || {} ).refEq = function ( firstVal ) { return function ( secondVal ) { return firstVal === secondVal; }; };
    } )();

    // Define Data.Eq module (Eq type class)
    ( function ( moduleExportObject ) {
      "use strict";
      var equalityModule = applicationNamespace[ "DataStructures.Equality" ],
          // Dependencies
          _ = ( applicationNamespace[ "Data.HeytingAlgebra" ], applicationNamespace[ "Data.Symbol" ], applicationNamespace[ "Data.Unit" ], applicationNamespace[ "Data.Void" ], applicationNamespace[ "Record.Unsafe" ], applicationNamespace[ "Type.Data.RowList" ],
              // Eq constructor function
              function ( eqFunction ) { this.eq = eqFunction; } ),
          // Instance for Int equality
          intEqInstance = new _( equalityModule.refEq );
      moduleExportObject.Eq = _;
      moduleExportObject.eq = function ( instance ) { return instance.eq; };
      moduleExportObject.eqInt = intEqInstance;
    } )( applicationNamespace[ "DataStructures.Equality" ] = applicationNamespace[ "DataStructures.Equality" ] || {} );

    // Define Data.Ord.Unsafe module (unsafeCompareImpl)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "DataStructures.Ordering.Unsafe" ] = applicationNamespace[ "DataStructures.Ordering.Unsafe" ] || {} ).unsafeCompareImpl = function ( lessThanResult ) {
        return function ( equalResult ) {
          return function ( greaterThanResult ) {
            return function ( firstComparisonVal ) {
              return function ( secondComparisonVal ) {
                return firstComparisonVal < secondComparisonVal ? lessThanResult : firstComparisonVal === secondComparisonVal ? equalResult : greaterThanResult;
              };
            };
          };
        };
      };
    } )();

    // Define Data.Show module (showIntImpl)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "DataStructures.Display" ] = applicationNamespace[ "DataStructures.Display" ] || {} ).showIntImpl = function ( intValue ) { return intValue.toString(); };
    } )();

    // Define Data.Show module (Show type class)
    ( function ( moduleExportObject ) {
      "use strict";
      var displayModule = applicationNamespace[ "DataStructures.Display" ],
          // Dependencies
          _ = ( applicationNamespace[ "Data.Symbol" ], applicationNamespace[ "Record.Unsafe" ], applicationNamespace[ "Type.Data.RowList" ],
              // Show constructor function
              function ( showFunction ) { this.show = showFunction; } ),
          // Instance for Int display
          intShowInstance = new _( displayModule.showIntImpl );
      moduleExportObject.Show = _;
      moduleExportObject.show = function ( instance ) { return instance.show; };
      moduleExportObject.showInt = intShowInstance;
    } )( applicationNamespace[ "DataStructures.Display" ] = applicationNamespace[ "DataStructures.Display" ] || {} );

    // Define Data.Ordering module (LT, GT, EQ values)
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Data.Eq" ], applicationNamespace[ "Data.Semigroup" ], applicationNamespace[ "Data.Show" ];
      var lessThanIndicator = function () { function _() {} return _.value = new _, _; }(),
          greaterThanIndicator = function () { function _() {} return _.value = new _, _; }(),
          equalIndicator = function () { function _() {} return _.value = new _, _; }();
      moduleExportObject.LT = lessThanIndicator;
      moduleExportObject.GT = greaterThanIndicator;
      moduleExportObject.EQ = equalIndicator;
    } )( applicationNamespace[ "DataStructures.Ordering" ] = applicationNamespace[ "DataStructures.Ordering" ] || {} );

    // Define Data.Ord.Unsafe module (unsafeCompare)
    ( function ( moduleExportObject ) {
      "use strict";
      var unsafeOrdModule = applicationNamespace[ "DataStructures.Ordering.Unsafe" ],
          orderingModule = applicationNamespace[ "DataStructures.Ordering" ],
          // Curried unsafe compare implementation
          compareFunction = unsafeOrdModule.unsafeCompareImpl( orderingModule.LT.value )( orderingModule.EQ.value )( orderingModule.GT.value );
      moduleExportObject.unsafeCompare = compareFunction;
    } )( applicationNamespace[ "DataStructures.Ordering.Unsafe" ] = applicationNamespace[ "DataStructures.Ordering.Unsafe" ] || {} );

    // Define Data.Ring module (intSub)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "DataStructures.Ring" ] = applicationNamespace[ "DataStructures.Ring" ] || {} ).intSub = function ( firstOperand ) { return function ( secondOperand ) { return firstOperand - secondOperand | 0; }; };
    } )();

    // Define Data.Semiring module (intAdd, intMul)
    ( function ( moduleExportObject ) {
      "use strict";
      moduleExportObject.intAdd = function ( firstOperand ) { return function ( secondOperand ) { return firstOperand + secondOperand | 0; }; };
      moduleExportObject.intMul = function ( firstOperand ) { return function ( secondOperand ) { return firstOperand * secondOperand | 0; }; };
    } )( applicationNamespace[ "DataStructures.Semiring" ] = applicationNamespace[ "DataStructures.Semiring" ] || {} );

    // Define Data.Semiring module (Semiring type class)
    ( function ( moduleExportObject ) {
      "use strict";
      var semiringFunctions = applicationNamespace[ "DataStructures.Semiring" ],
          // Dependencies
          _ = ( applicationNamespace[ "Data.Symbol" ], applicationNamespace[ "Data.Unit" ], applicationNamespace[ "Record.Unsafe" ], applicationNamespace[ "Type.Data.Row" ], applicationNamespace[ "Type.Data.RowList" ],
              // Semiring constructor function
              function ( addFunc, mulFunc, oneVal, zeroVal ) { this.add = addFunc, this.mul = mulFunc, this.one = oneVal, this.zero = zeroVal; } ),
          // Instance for Int semiring
          intSemiringInstance = new _( semiringFunctions.intAdd, semiringFunctions.intMul, 1, 0 );
      moduleExportObject.Semiring = _;
      moduleExportObject.add = function ( instance ) { return instance.add; };
      moduleExportObject.zero = function ( instance ) { return instance.zero; };
      moduleExportObject.mul = function ( instance ) { return instance.mul; };
      moduleExportObject.one = function ( instance ) { return instance.one; };
      moduleExportObject.semiringInt = intSemiringInstance;
    } )( applicationNamespace[ "DataStructures.Semiring" ] = applicationNamespace[ "DataStructures.Semiring" ] || {} );

    // Define Data.Ring module (Ring type class)
    ( function ( moduleExportObject ) {
      "use strict";
      var ringFunctions = applicationNamespace[ "DataStructures.Ring" ],
          semiringModule = applicationNamespace[ "DataStructures.Semiring" ],
          // Dependencies
          _ = ( applicationNamespace[ "Data.Symbol" ], applicationNamespace[ "Data.Unit" ], applicationNamespace[ "Record.Unsafe" ], applicationNamespace[ "Type.Data.RowList" ],
              // Ring constructor function
              function ( semiringInstanceFunc, subFunc ) { this.Semiring0 = semiringInstanceFunc, this.sub = subFunc; } ),
          // Getter for sub function
          getSubFunc = function ( instance ) { return instance.sub; },
          // Instance for Int ring
          intRingInstance = new _( function () { return semiringModule.semiringInt; }, ringFunctions.intSub );
      moduleExportObject.Ring = _;
      moduleExportObject.sub = getSubFunc;
      moduleExportObject.negate = function ( ringInstance ) { return function ( valueToNegate ) { return getSubFunc( ringInstance )( semiringModule.zero( ringInstance.Semiring0() ) )( valueToNegate ); }; };
      moduleExportObject.ringInt = intRingInstance;
    } )( applicationNamespace[ "DataStructures.Ring" ] = applicationNamespace[ "DataStructures.Ring" ] || {} );

    // Define Data.Ord module (Ord type class)
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Data.Ord" ]; // Self-reference, often for internal consistency check
      var equalityModule = applicationNamespace[ "DataStructures.Equality" ],
          unsafeOrdModule = applicationNamespace[ "DataStructures.Ordering.Unsafe" ],
          orderingModule = applicationNamespace[ "DataStructures.Ordering" ],
          ringModule = applicationNamespace[ "DataStructures.Ring" ],
          semiringModule = applicationNamespace[ "DataStructures.Semiring" ],
          // Dependencies
          _ = ( applicationNamespace[ "Data.Symbol" ], applicationNamespace[ "Data.Unit" ], applicationNamespace[ "Data.Void" ], applicationNamespace[ "Record.Unsafe" ], applicationNamespace[ "Type.Data.RowList" ],
              // Ord constructor function
              function ( eqInstanceFunc, compareFunc ) { this.Eq0 = eqInstanceFunc, this.compare = compareFunc; } ),
          // Instance for Int ordering
          intOrdInstance = new _( function () { return equalityModule.eqInt; }, unsafeOrdModule.unsafeCompare ),
          // Getter for compare function
          getCompareFunc = function ( instance ) { return instance.compare; },
          // GreaterThanOrEqual function
          isGreaterThanOrEqual = function ( ordInstance ) {
            return function ( firstVal ) {
              return function ( secondVal ) {
                return !( getCompareFunc( ordInstance )( firstVal )( secondVal ) instanceof orderingModule.LT );
              };
            };
          };
      moduleExportObject.Ord = _;
      moduleExportObject.compare = getCompareFunc;
      moduleExportObject.greaterThanOrEq = isGreaterThanOrEqual;
      moduleExportObject.min = function ( ordInstance ) {
        return function ( val1 ) {
          return function ( val2 ) {
            var comparisonResult = getCompareFunc( ordInstance )( val1 )( val2 );
            if ( comparisonResult instanceof orderingModule.LT ) return val1;
            if ( comparisonResult instanceof orderingModule.EQ ) return val1;
            if ( comparisonResult instanceof orderingModule.GT ) return val2;
            // This error message is part of the original logic, so kept similar structure
            throw new Error( "Pattern match failure at Data.Ord (line 119, col 3 - line 122, col 12): " + [ comparisonResult.constructor.name ] );
          };
        };
      };
      moduleExportObject.abs = function ( ordInstance ) {
        return function ( ringInstance ) {
          return function ( value ) {
            return isGreaterThanOrEqual( ordInstance )( value )( semiringModule.zero( ringInstance.Semiring0() ) ) ? value : ringModule.negate( ringInstance )( value );
          };
        };
      };
      moduleExportObject.ordInt = intOrdInstance;
    } )( applicationNamespace[ "DataStructures.Ordering" ] = applicationNamespace[ "DataStructures.Ordering" ] || {} );

    // Define Data.Bounded module (Bounded type class)
    ( function ( moduleExportObject ) {
      "use strict";
      var boundedConstants = applicationNamespace[ "DataStructures.Bounded" ],
          orderingModule = applicationNamespace[ "DataStructures.Ordering" ],
          // Dependencies
          _ = ( applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "Data.Unit" ],
              // Bounded constructor function
              function ( ordInstanceFunc, bottomVal, topVal ) { this.Ord0 = ordInstanceFunc, this.bottom = bottomVal, this.top = topVal; } ),
          // Instance for Int bounded
          intBoundedInstance = new _( function () { return orderingModule.ordInt; }, boundedConstants.bottomInt, boundedConstants.topInt );
      moduleExportObject.Bounded = _;
      moduleExportObject.bottom = function ( instance ) { return instance.bottom; };
      moduleExportObject.top = function ( instance ) { return instance.top; };
      moduleExportObject.boundedInt = intBoundedInstance;
    } )( applicationNamespace[ "DataStructures.Bounded" ] = applicationNamespace[ "DataStructures.Bounded" ] || {} );

    // Define Data.Maybe module
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Control.Alt" ];
      var applicativeModule = applicationNamespace[ "Control.Functional.Applicative" ],
          applyModule = applicationNamespace[ "Control.Functional.Apply" ],
          bindModule = applicationNamespace[ "Control.Functional.Bind" ],
          // Dependencies
          _ = ( applicationNamespace[ "Control.Category" ], applicationNamespace[ "Control.Extend" ], applicationNamespace[ "Control.Monad" ], applicationNamespace[ "Control.MonadZero" ], applicationNamespace[ "Control.Plus" ], applicationNamespace[ "DataStructures.Bounded" ], applicationNamespace[ "DataStructures.Equality" ], applicationNamespace[ "Data.Function" ], applicationNamespace[ "DataStructures.Functional.Functor" ] ),
          // More dependencies
          __ = ( applicationNamespace[ "Data.Functor.Invariant" ], applicationNamespace[ "Data.Monoid" ], applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "Data.Semigroup" ], applicationNamespace[ "DataStructures.Display" ], applicationNamespace[ "Data.Unit" ], applicationNamespace.Prelude,
              // Nothing value
              function () { function _() {} return _.value = new _, _; } () ),
          // Just constructor
          justConstructor = function () { function _( value ) { this.value0 = value; } return _.create = function ( val ) { return new _( val ); }, _; } (),
          // Functor instance for Maybe
          maybeFunctorInstance = new _.Functor( function ( transformFunc ) {
            return function ( maybeValue ) {
              return maybeValue instanceof justConstructor ? new justConstructor( transformFunc( maybeValue.value0 ) ) : __.value;
            };
          } ),
          // Apply instance for Maybe
          maybeApplyInstance = new applyModule.Apply( function () { return maybeFunctorInstance; }, function ( maybeFunc ) {
            return function ( maybeValue ) {
              if ( maybeFunc instanceof justConstructor ) return _.map( maybeFunctorInstance )( maybeFunc.value0 )( maybeValue );
              if ( maybeFunc instanceof __ ) return __.value;
              // Error for pattern match failure
              throw new Error( "Pattern match failure at Data.Maybe (line 67, col 1 - line 67, col 35): " + [ maybeFunc.constructor.name, maybeValue.constructor.name ] );
            };
          } ),
          // Bind instance for Maybe
          maybeBindInstance = new bindModule.Bind( function () { return maybeApplyInstance; }, function ( maybeValue ) {
            return function ( continuationFunc ) {
              if ( maybeValue instanceof justConstructor ) return continuationFunc( maybeValue.value0 );
              if ( maybeValue instanceof __ ) return __.value;
              // Error for pattern match failure
              throw new Error( "Pattern match failure at Data.Maybe (line 125, col 1 - line 125, col 33): " + [ maybeValue.constructor.name, continuationFunc.constructor.name ] );
            };
          } );
      moduleExportObject.Nothing = __;
      moduleExportObject.Just = justConstructor;
      moduleExportObject.functorMaybe = maybeFunctorInstance;
      moduleExportObject.applyMaybe = maybeApplyInstance;
      moduleExportObject.bindMaybe = maybeBindInstance;
    } )( applicationNamespace[ "DataStructures.Maybe" ] = applicationNamespace[ "DataStructures.Maybe" ] || {} );

    // Define Data.Either module
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Control.Alt" ];
      var applicativeModule = applicationNamespace[ "Control.Functional.Applicative" ],
          applyModule = applicationNamespace[ "Control.Functional.Apply" ],
          // Dependencies
          _ = ( applicationNamespace[ "Control.Functional.Bind" ], applicationNamespace[ "Control.Extend" ], applicationNamespace[ "Control.Monad" ], applicationNamespace[ "Control.Semigroupoid" ], applicationNamespace[ "Data.Bifoldable" ], applicationNamespace[ "Data.Bifunctor" ], applicationNamespace[ "Data.Bitraversable" ], applicationNamespace[ "DataStructures.Bounded" ], applicationNamespace[ "DataStructures.Equality" ], applicationNamespace[ "Data.Foldable" ], applicationNamespace[ "Data.FoldableWithIndex" ], applicationNamespace[ "Data.Function" ], applicationNamespace[ "DataStructures.Functional.Functor" ] ),
          // More dependencies
          __ = ( applicationNamespace[ "Data.Functor.Invariant" ], applicationNamespace[ "Data.FunctorWithIndex" ], applicationNamespace[ "DataStructures.Maybe" ], applicationNamespace[ "Data.Monoid" ], applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "Data.Semigroup" ], applicationNamespace[ "DataStructures.Display" ], applicationNamespace[ "Data.Traversable" ], applicationNamespace[ "Data.TraversableWithIndex" ], applicationNamespace[ "Data.Unit" ], applicationNamespace.Prelude,
              // Left constructor
              function () { function _( value ) { this.value0 = value; } return _.create = function ( val ) { return new _( val ); }, _; } () ),
          // Right constructor
          rightConstructor = function () { function _( value ) { this.value0 = value; } return _.create = function ( val ) { return new _( val ); }, _; } (),
          // Functor instance for Either
          eitherFunctorInstance = new _.Functor( function ( transformFunc ) {
            return function ( eitherValue ) {
              if ( eitherValue instanceof __ ) return new __( eitherValue.value0 );
              if ( eitherValue instanceof rightConstructor ) return new rightConstructor( transformFunc( eitherValue.value0 ) );
              // Error for pattern match failure
              throw new Error( "Pattern match failure at Data.Either (line 38, col 8 - line 38, col 52): " + [ eitherValue.constructor.name ] );
            };
          } ),
          // Apply instance for Either
          eitherApplyInstance = new applyModule.Apply( function () { return eitherFunctorInstance; }, function ( eitherFunc ) {
            return function ( eitherValue ) {
              if ( eitherFunc instanceof __ ) return new __( eitherFunc.value0 );
              if ( eitherFunc instanceof rightConstructor ) return _.map( eitherFunctorInstance )( eitherFunc.value0 )( eitherValue );
              // Error for pattern match failure
              throw new Error( "Pattern match failure at Data.Either (line 82, col 1 - line 82, col 41): " + [ eitherFunc.constructor.name, eitherValue.constructor.name ] );
            };
          } ),
          // Applicative instance for Either
          eitherApplicativeInstance = new applicativeModule.Applicative( function () { return eitherApplyInstance; }, rightConstructor.create );
      moduleExportObject.Left = __;
      moduleExportObject.Right = rightConstructor;
      moduleExportObject.functorEither = eitherFunctorInstance;
      moduleExportObject.applyEither = eitherApplyInstance;
      moduleExportObject.applicativeEither = eitherApplicativeInstance;
    } )( applicationNamespace[ "DataStructures.Either" ] = applicationNamespace[ "DataStructures.Either" ] || {} );

    // Define Partial.Unsafe module (unsafePartial)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "Partial.Unsafe" ] = applicationNamespace[ "Partial.Unsafe" ] || {} ).unsafePartial = function ( func ) { return func(); };
    } )();

    // Define Partial module (crashWith)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "Partial" ] = applicationNamespace[ "Partial" ] || {} ).crashWith = function () { return function ( errorMessage ) { throw new Error( errorMessage ); }; };
    } )();

    // Define Partial module (re-export crashWith)
    ( function ( moduleExportObject ) {
      "use strict";
      var partialModule = applicationNamespace.Partial;
      moduleExportObject.crashWith = partialModule.crashWith;
    } )( applicationNamespace.Partial = applicationNamespace.Partial || {} );

    // Define Partial.Unsafe module (unsafeCrashWith)
    ( function ( moduleExportObject ) {
      "use strict";
      var unsafePartialModule = applicationNamespace[ "Partial.Unsafe" ],
          partialModule = applicationNamespace.Partial;
      moduleExportObject.unsafeCrashWith = function ( msg ) { return unsafePartialModule.unsafePartial( function ( ctx ) { return partialModule.crashWith( ctx )( msg ); } ); };
    } )( applicationNamespace[ "Partial.Unsafe" ] = applicationNamespace[ "Partial.Unsafe" ] || {} );

    // Define Control.Monad.Rec.Class module (Loop/Done, tailRec)
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Control.Functional.Applicative" ], applicationNamespace[ "Control.Functional.Bind" ], applicationNamespace[ "Control.Monad" ], applicationNamespace[ "Control.Semigroupoid" ], applicationNamespace[ "Data.Bifunctor" ], applicationNamespace[ "DataStructures.Either" ], applicationNamespace[ "DataStructures.Functional.Functor" ], applicationNamespace[ "Data.Identity" ], applicationNamespace[ "DataStructures.Maybe" ], applicationNamespace[ "Data.Unit" ], applicationNamespace.Effect, applicationNamespace[ "Effect.Ref" ], applicationNamespace[ "Partial.Unsafe" ], applicationNamespace.Prelude;
      var loopConstructor = function () { function _( value ) { this.value0 = value; } return _.create = function ( val ) { return new _( val ); }, _; } (),
          doneConstructor = function () { function _( value ) { this.value0 = value; } return _.create = function ( val ) { return new _( val ); }, _; } ();
      moduleExportObject.Loop = loopConstructor;
      moduleExportObject.Done = doneConstructor;
      moduleExportObject.tailRec = function ( stepFunction ) {
        return function ( initialValue ) {
          return function ( _ ) { // _ is a placeholder, likely `this` context or unused
            var resultValue, isDone = false;

            // Inner recursive function
            function processStep ( currentStep ) {
              if ( !( currentStep instanceof loopConstructor ) ) {
                if ( currentStep instanceof doneConstructor ) return isDone = true, currentStep.value0;
                // Error for pattern match failure
                throw new Error( "Pattern match failure at Control.Monad.Rec.Class (line 91, col 3 - line 91, col 25): " + [ currentStep.constructor.name ] );
              }
              initialValue = stepFunction( currentStep.value0 ); // Update initialValue for next iteration
            }
            // Loop until 'isDone' flag is set
            for ( ; !isDone; ) resultValue = processStep( initialValue );
            return resultValue;
          }( stepFunction( initialValue ) ); // Initial call to stepFunction
        };
      };
    } )( applicationNamespace[ "Control.Monad.Recursive.Class" ] = applicationNamespace[ "Control.Monad.Recursive.Class" ] || {} );

    // Define Data.Int module (fromStringAsImpl)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "DataStructures.Integer" ] = applicationNamespace[ "DataStructures.Integer" ] || {} ).fromStringAsImpl = function ( successFunc ) {
        return function ( failureFunc ) {
          return function ( radixValue ) {
            return function ( inputString ) {
              var regexCharSet;
              // Determine regex character set based on radix
              regexCharSet = radixValue < 11 ? "[0-" + ( radixValue - 1 ).toString() + "]" : 11 === radixValue ? "[0-9a]" : "[0-9a-" + String.fromCharCode( 86 + radixValue ) + "]";
              var validationRegex = new RegExp( "^[\\+\\-]?" + regexCharSet + "+$", "i" );
              return function ( strValue ) {
                if ( validationRegex.test( strValue ) ) {
                  var parsedNumber = parseInt( strValue, radixValue );
                  return ( 0 | parsedNumber ) === parsedNumber ? successFunc( parsedNumber ) : failureFunc; // Check if it's an integer
                }
                return failureFunc;
              };
            };
          };
        };
      };
    } )();

    // Define Data.Boolean module (otherwise)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "DataStructures.Boolean" ] = applicationNamespace[ "DataStructures.Boolean" ] || {} ).otherwise = true;
    } )();

    // Define Data.Int module (fromString, fromStringAs)
    ( function ( moduleExportObject ) {
      "use strict";
      var integerModule = applicationNamespace[ "DataStructures.Integer" ],
          // Dependencies
          _ = ( applicationNamespace[ "Control.Category" ], applicationNamespace[ "Control.Semigroupoid" ], applicationNamespace[ "DataStructures.Boolean" ], applicationNamespace[ "DataStructures.Bounded" ], applicationNamespace[ "Data.CommutativeRing" ], applicationNamespace[ "Data.DivisionRing" ], applicationNamespace[ "DataStructures.Equality" ], applicationNamespace[ "Data.EuclideanRing" ], applicationNamespace[ "Data.HeytingAlgebra" ], applicationNamespace[ "Data.Int.Bits" ], applicationNamespace[ "DataStructures.Maybe" ] ),
          // More dependencies
          __ = ( applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "DataStructures.Ring" ], applicationNamespace[ "DataStructures.Semiring" ], applicationNamespace[ "DataStructures.Display" ], applicationNamespace.Global, applicationNamespace.Math, applicationNamespace.Prelude,
              // Curried fromStringAsImpl for Maybe
              integerModule.fromStringAsImpl( _.Just.create )( _.Nothing.value ) ),
          // fromString function (base 10)
          fromStringBase10 = __( 10 );
      moduleExportObject.fromString = fromStringBase10;
      moduleExportObject.fromStringAs = __;
    } )( applicationNamespace[ "DataStructures.Integer" ] = applicationNamespace[ "DataStructures.Integer" ] || {} );

    // Define Data.String.CodeUnits module (length, _slice)
    ( function ( moduleExportObject ) {
      "use strict";
      moduleExportObject.getStringLength = function ( inputString ) { return inputString.length; };
      moduleExportObject.internalSlice = function ( startIndex ) { return function ( endIndex ) { return function ( targetString ) { return targetString.slice( startIndex, endIndex ); }; }; };
    } )( applicationNamespace[ "DataStructures.String.CodeUnits" ] = applicationNamespace[ "DataStructures.String.CodeUnits" ] || {} );

    // Define Data.String.CodeUnits module (slice)
    ( function ( moduleExportObject ) {
      "use strict";
      var stringCodeUnits = applicationNamespace[ "DataStructures.String.CodeUnits" ],
          // Dependencies
          _ = ( applicationNamespace[ "Control.Semigroupoid" ], applicationNamespace[ "DataStructures.Boolean" ] ),
          // More dependencies
          __ = ( applicationNamespace[ "DataStructures.Equality" ], applicationNamespace[ "Data.Function" ], applicationNamespace[ "Data.HeytingAlgebra" ], applicationNamespace[ "DataStructures.Maybe" ] );
      applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "DataStructures.Ring" ], applicationNamespace[ "DataStructures.Semiring" ], applicationNamespace[ "Data.String.Pattern" ], applicationNamespace[ "Data.String.Unsafe" ], applicationNamespace.Prelude;
      moduleExportObject.sliceString = function ( startIndex ) {
        return function ( endIndex ) {
          return function ( targetString ) {
            var totalLength = stringCodeUnits.getStringLength( targetString ),
                // Helper to normalize indices
                normalizeIndex = function ( indexVal ) {
                  if ( indexVal < 0 ) return totalLength + indexVal | 0;
                  if ( _.otherwise ) return indexVal;
                  // Error for pattern match failure
                  throw new Error( "Pattern match failure at Data.String.CodeUnits (line 314, col 5 - line 315, col 27): " + [ indexVal.constructor.name ] );
                },
                adjustedEnd = normalizeIndex( endIndex ),
                adjustedStart = normalizeIndex( startIndex );
            // Validate indices for slicing
            return adjustedStart < 0 || adjustedStart >= totalLength || adjustedEnd < 0 || adjustedEnd > totalLength || adjustedStart > adjustedEnd ? __.Nothing.value : new __.Just( stringCodeUnits.internalSlice( startIndex )( endIndex )( targetString ) );
          };
        };
      };
    } )( applicationNamespace[ "DataStructures.String.CodeUnits" ] = applicationNamespace[ "DataStructures.String.CodeUnits" ] || {} );

    // Define Data.String.Common module (trim)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "DataStructures.String.Common" ] = applicationNamespace[ "DataStructures.String.Common" ] || {} ).trimString = function ( inputString ) { return inputString.trim(); };
    } )();

    // Define Data.String.Common module (re-export trim)
    ( function ( moduleExportObject ) {
      "use strict";
      var commonStringModule = applicationNamespace[ "DataStructures.String.Common" ];
      applicationNamespace[ "DataStructures.Equality" ], applicationNamespace[ "DataStructures.Ordering" ], applicationNamespace[ "Data.String.Pattern" ], applicationNamespace.Prelude;
      moduleExportObject.removeLeadingTrailingWhitespace = commonStringModule.trimString;
    } )( applicationNamespace[ "DataStructures.String.Common" ] = applicationNamespace[ "DataStructures.String.Common" ] || {} );

    // Define AtCoder.ABC114.B module (solve)
    ( function ( moduleExportObject ) {
      "use strict";
      var applicativeModule = applicationNamespace[ "Control.Functional.Applicative" ],
          bindModule = applicationNamespace[ "Control.Functional.Bind" ],
          recursiveMonad = applicationNamespace[ "Control.Monad.Recursive.Class" ],
          boundedModule = applicationNamespace[ "DataStructures.Bounded" ],
          eitherModule = applicationNamespace[ "DataStructures.Either" ],
          integerModule = applicationNamespace[ "DataStructures.Integer" ],
          maybeModule = applicationNamespace[ "DataStructures.Maybe" ],
          orderingModule = applicationNamespace[ "DataStructures.Ordering" ],
          ringModule = applicationNamespace[ "DataStructures.Ring" ],
          // Dependencies
          _ = ( applicationNamespace[ "DataStructures.Semiring" ], applicationNamespace[ "DataStructures.Display" ] ),
          // More dependencies
          __ = ( applicationNamespace[ "Data.String" ], applicationNamespace[ "DataStructures.String.CodeUnits" ] ),
          commonStringModule = applicationNamespace[ "DataStructures.String.Common" ],
          // More dependencies
          ___ = ( applicationNamespace[ "Debug.Trace" ], applicationNamespace[ "Partial.Unsafe" ] ),
          ____ = ( applicationNamespace.Prelude,
              // Main problem-solving logic as a function
              function ( inputString ) {
                var cleanedString = commonStringModule.removeLeadingTrailingWhitespace( inputString );
                return applicativeModule.pure( eitherModule.applicativeEither )( _.show( _.showInt )(
                    // Inner function for calculating minimum difference
                    function ( targetString ) {
                      return recursiveMonad.tailRec( function ( currentIterationState ) {
                        var parsedSubstringValue = bindModule.bind( maybeModule.bindMaybe )( __.sliceString( currentIterationState.i )( currentIterationState.i + 3 | 0 )( targetString ) )( integerModule.fromString );
                        if ( parsedSubstringValue instanceof maybeModule.Nothing ) return new recursiveMonad.Done( currentIterationState.r );
                        if ( parsedSubstringValue instanceof maybeModule.Just ) return new recursiveMonad.Loop( { i: currentIterationState.i + 1 | 0, r: orderingModule.min( orderingModule.ordInt )( currentIterationState.r )( orderingModule.abs( orderingModule.ordInt )( ringModule.ringInt )( parsedSubstringValue.value0 - 753 | 0 ) ) } );
                        // Error for pattern match failure
                        throw new Error( "Pattern match failure at AtCoder.ABC114.B (line 33, col 7 - line 39, col 13): " + [ parsedSubstringValue.constructor.name ] );
                      } )( { i: 0, r: boundedModule.top( boundedModule.boundedInt ) } );
                    }( cleanedString )
                ) );
              } );
      moduleExportObject.solveProblem = function ( problemInput ) {
        var computationResult = ____( problemInput );
        if ( computationResult instanceof eitherModule.Left ) return ___.unsafeCrashWith( computationResult.value0 );
        if ( computationResult instanceof eitherModule.Right ) return computationResult.value0;
        // Error for pattern match failure
        throw new Error( "Pattern match failure at AtCoder.ABC114.B (line 20, col 3 - line 22, col 24): " + [ computationResult.constructor.name ] );
      };
    } )( applicationNamespace[ "Application.Code.ChallengeB" ] = applicationNamespace[ "Application.Code.ChallengeB" ] || {} );

    // Define Effect.Console module (log)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "System.Effect.Console" ] = applicationNamespace[ "System.Effect.Console" ] || {} ).outputToConsole = function ( message ) { return function () { return console.log( message ), {}; }; };
    } )();

    // Define Effect.Console module (re-export log)
    ( function ( moduleExportObject ) {
      "use strict";
      var consoleEffects = applicationNamespace[ "System.Effect.Console" ];
      applicationNamespace[ "DataStructures.Display" ], applicationNamespace[ "Data.Unit" ], applicationNamespace.Effect;
      moduleExportObject.logMessage = consoleEffects.outputToConsole;
    } )( applicationNamespace[ "System.Effect.Console" ] = applicationNamespace[ "System.Effect.Console" ] || {} );

    // Define Node.Encoding module
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Node.Encoding" ]; // Self-reference
      var displayModule = applicationNamespace[ "DataStructures.Display" ],
          // Dependencies
          _ = ( applicationNamespace.Prelude,
              // ASCII encoding value
              function () { function _() {} return _.value = new _, _; } () ),
          // UTF8 encoding value
          utf8Encoding = function () { function _() {} return _.value = new _, _; } (),
          // UTF16LE encoding value
          utf16leEncoding = function () { function _() {} return _.value = new _, _; } (),
          // UCS2 encoding value
          ucs2Encoding = function () { function _() {} return _.value = new _, _; } (),
          // Base64 encoding value
          base64Encoding = function () { function _() {} return _.value = new _, _; } (),
          // Latin1 encoding value
          latin1Encoding = function () { function _() {} return _.value = new _, _; } (),
          // Binary encoding value
          binaryEncoding = function () { function _() {} return _.value = new _, _; } (),
          // Hex encoding value
          hexEncoding = function () { function _() {} return _.value = new _, _; } (),
          // Show instance for Encoding
          encodingShowInstance = new displayModule.Show( function ( encodingVal ) {
            if ( encodingVal instanceof _ ) return "ASCII";
            if ( encodingVal instanceof utf8Encoding ) return "UTF8";
            if ( encodingVal instanceof utf16leEncoding ) return "UTF16LE";
            if ( encodingVal instanceof ucs2Encoding ) return "UCS2";
            if ( encodingVal instanceof base64Encoding ) return "Base64";
            if ( encodingVal instanceof latin1Encoding ) return "Latin1";
            if ( encodingVal instanceof binaryEncoding ) return "Binary";
            if ( encodingVal instanceof hexEncoding ) return "Hex";
            // Error for pattern match failure
            throw new Error( "Pattern match failure at Node.Encoding (line 19, col 1 - line 19, col 39): " + [ encodingVal.constructor.name ] );
          } );
      moduleExportObject.ASCII = _;
      moduleExportObject.UTF8 = utf8Encoding;
      moduleExportObject.UTF16LE = utf16leEncoding;
      moduleExportObject.UCS2 = ucs2Encoding;
      moduleExportObject.Base64 = base64Encoding;
      moduleExportObject.Latin1 = latin1Encoding;
      moduleExportObject.Binary = binaryEncoding;
      moduleExportObject.Hex = hexEncoding;
      moduleExportObject.showEncoding = encodingShowInstance;
    } )( applicationNamespace[ "Node.System.Encoding" ] = applicationNamespace[ "Node.System.Encoding" ] || {} );

    // Define Node.FS.Internal module (unsafeRequireFS)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "Node.FileSystem.Internal" ] = applicationNamespace[ "Node.FileSystem.Internal" ] || {} ).unsafeRequireFS = require( "fs" );
    } )();

    // Define Unsafe.Coerce module (unsafeCoerce)
    ( function ( moduleExportObject ) {
      "use strict";
      ( applicationNamespace[ "Utility.Unsafe.Coercion" ] = applicationNamespace[ "Utility.Unsafe.Coercion" ] || {} ).unsafeCoerce = function ( val ) { return val; };
    } )();

    // Define Unsafe.Coerce module (re-export unsafeCoerce)
    ( function ( moduleExportObject ) {
      "use strict";
      var unsafeCoercionModule = applicationNamespace[ "Utility.Unsafe.Coercion" ];
      moduleExportObject.unsafeCoerce = unsafeCoercionModule.unsafeCoerce;
    } )( applicationNamespace[ "Utility.Unsafe.Coercion" ] = applicationNamespace[ "Utility.Unsafe.Coercion" ] || {} );

    // Define Node.FS.Internal module (mkEffect, unsafeRequireFS)
    ( function ( moduleExportObject ) {
      "use strict";
      var fsInternalModule = applicationNamespace[ "Node.FileSystem.Internal" ],
          // Dependencies
          _ = ( applicationNamespace.Effect, applicationNamespace.Prelude, applicationNamespace[ "Utility.Unsafe.Coercion" ].unsafeCoerce );
      moduleExportObject.createEffect = _;
      moduleExportObject.getRawFS = fsInternalModule.unsafeRequireFS;
    } )( applicationNamespace[ "Node.FileSystem.Internal" ] = applicationNamespace[ "Node.FileSystem.Internal" ] || {} );

    // Define Node.FS.Sync module (readTextFile)
    ( function ( moduleExportObject ) {
      "use strict";
      applicationNamespace[ "Control.Functional.Bind" ], applicationNamespace[ "Control.Semigroupoid" ], applicationNamespace[ "Data.DateTime" ], applicationNamespace[ "Data.DateTime.Instant" ], applicationNamespace[ "Data.EuclideanRing" ], applicationNamespace[ "Data.Function" ], applicationNamespace[ "Data.Function.Uncurried" ], applicationNamespace[ "DataStructures.Functional.Functor" ], applicationNamespace[ "DataStructures.Integer" ], applicationNamespace[ "DataStructures.Maybe" ], applicationNamespace[ "Data.Nullable" ];
      var displayModule = applicationNamespace[ "DataStructures.Display" ],
          // Dependencies
          _ = ( applicationNamespace[ "Data.Time.Duration" ], applicationNamespace.Effect, applicationNamespace[ "Node.Buffer" ], applicationNamespace[ "Node.System.Encoding" ] ),
          // More dependencies
          __ = ( applicationNamespace[ "Node.FS" ], applicationNamespace[ "Node.FileSystem.Internal" ] ),
          // More dependencies
          ___ = ( applicationNamespace[ "Node.FS.Perms" ], applicationNamespace[ "Node.FS.Stats" ], applicationNamespace[ "Node.Path" ], applicationNamespace.Prelude, __.getRawFS );
      moduleExportObject.readTextFile = function ( encodingType ) {
        return function ( filePath ) {
          return __.createEffect( function ( _ ) { // _ is a placeholder, likely unused context
            return ___.readFileSync( filePath, { encoding: displayModule.show( _.showEncoding )( encodingType ) } );
          } );
        };
      };
    } )( applicationNamespace[ "Node.FileSystem.Synchronous" ] = applicationNamespace[ "Node.FileSystem.Synchronous" ] || {} );

    // Define Main module (main)
    ( function ( moduleExportObject ) {
      "use strict";
      var appChallengeModule = applicationNamespace[ "Application.Code.ChallengeB" ],
          // Dependencies
          _ = ( applicationNamespace[ "Control.Functional.Applicative" ], applicationNamespace[ "Control.Functional.Bind" ], applicationNamespace.Effect, applicationNamespace[ "System.Effect.Console" ] ),
          nodeEncodingModule = applicationNamespace[ "Node.System.Encoding" ],
          nodeFSSyncModule = applicationNamespace[ "Node.FileSystem.Synchronous" ];
      applicationNamespace.Prelude;
      moduleExportObject.main = function () {
        var fileContent = nodeFSSyncModule.readTextFile( nodeEncodingModule.UTF8.value )( "/dev/stdin" )(),
            solutionResult = appChallengeModule.solveProblem( fileContent );
        return _.logMessage( solutionResult )();
      };
    } )( applicationNamespace.Main = applicationNamespace.Main || {} );

    // Execute the main function of the application
    applicationNamespace.Main.main();

  } ],
}, {}, [ "PrimaryApplicationCode" ], null );