moduleLoader = ( moduleDefinitions, moduleCache, entryPoints, rootModuleName ) => {
  // Internal variables for module management
  let firstErrorEncountered;
  const globalModuleLoader = typeof moduleLoader === "function" && moduleLoader;
  const nodeModuleResolver = typeof require === "function" && require;

  // The core function to load and execute a module
  const loadModule = ( moduleId, isEntryPoint ) => {
    // If module is already in cache, return its exports
    if ( moduleCache[ moduleId ] ) {
      return moduleCache[ moduleId ].exports;
    }

    // If module definition doesn't exist
    if ( !moduleDefinitions[ moduleId ] ) {
      // Try to load via globalModuleLoader if it's not an entry point
      const globalLoaderResult = typeof globalModuleLoader === "function" && globalModuleLoader;
      if ( !isEntryPoint && globalLoaderResult ) {
        return globalLoaderResult( moduleId, true );
      }
      // Try to load via nodeModuleResolver if available and module ID is a string
      if ( nodeModuleResolver && typeof moduleId === "string" ) {
        return nodeModuleResolver( moduleId );
      }
      // If all else fails, throw an error
      const missingModuleError = new Error( "Unable to locate module '" + moduleId + "'" );
      throw ( missingModuleError.code = "MODULE_NOT_FOUND", missingModuleError );
    }

    // Prepare a local module context
    const localModuleContext = {};
    localModuleContext.resolve = ( dependencyPath ) => {
      // Resolve paths relative to the current module
      return moduleDefinitions[ moduleId ][ 1 ][ dependencyPath ] || dependencyPath;
    };
    localModuleContext.cache = {}; // Placeholder for module-specific cache, if any

    // Create a new module instance and add to cache
    const currentModuleInstance = moduleCache[ moduleId ] = new loadModule.Module( moduleId );
    // Execute the module's definition function
    moduleDefinitions[ moduleId ][ 0 ].call(
      currentModuleInstance.exports,
      localModuleContext,
      currentModuleInstance,
      currentModuleInstance.exports,
      this
    );

    // Return the module's exports
    return moduleCache[ moduleId ].exports;
  };

  // Mark the loader as a parcel loader (for compatibility or introspection)
  loadModule.isParcelRequire = true;

  // Module constructor function
  loadModule.Module = function ( modId ) {
    this.id = modId;
    this.bundle = loadModule;
    this.exports = {};
  };

  // Store references to the module definitions and cache
  loadModule.modules = moduleDefinitions;
  loadModule.cache = moduleCache;
  loadModule.parent = globalModuleLoader;

  // Function to register new modules dynamically
  loadModule.register = ( newModuleId, newModuleExports ) => {
    moduleDefinitions[ newModuleId ] = [
      ( modContext, modInstance ) => {
        modInstance.exports = newModuleExports;
      },
      {},
    ];
  };

  // Process entry points
  for ( let entryIndex = 0; entryIndex < entryPoints.length; entryIndex++ ) {
    try {
      loadModule( entryPoints[ entryIndex ] );
    } catch ( currentError ) {
      // Store the first error encountered during entry point loading
      firstErrorEncountered = firstErrorEncountered || currentError;
    }
  }

  // Handle the exports for the primary entry point (if any)
  if ( entryPoints.length ) {
    const finalExport = loadModule( entryPoints[ entryPoints.length - 1 ] );
    // Export based on environment (CommonJS, AMD, global)
    if ( typeof exports === "object" && typeof module !== "undefined" ) {
      module.exports = finalExport;
    } else if ( typeof define === "function" && define.amd ) {
      define( () => finalExport );
    } else if ( rootModuleName ) {
      this[ rootModuleName ] = finalExport;
    }
  }

  // Update the global module loader reference
  moduleLoader = loadModule;

  // If an error occurred during entry point loading, re-throw it
  if ( firstErrorEncountered ) {
    throw firstErrorEncountered;
  }

  // Return the main module loading function
  return loadModule;
}( {
  "Focm": [
    ( moduleContext, moduleInstance, moduleExports, globalScope ) => {
      // Object to hold module exports
      const moduleOutput = {};

      // Control.Apply module functionality
      ( ( targetModule ) => {
        "use strict";
        ( targetModule[ "Control.Apply" ] = targetModule[ "Control.Apply" ] || {} ).arrayApply = ( sourceArray ) => ( targetArray ) => {
          const sourceLen = sourceArray.length;
          const targetLen = targetArray.length;
          const resultArray = new Array( sourceLen * targetLen );
          let resultIdx = 0;

          // Iterate through source and target arrays to apply functions
          for ( let sIdx = 0; sIdx < sourceLen; sIdx++ ) {
            const currentFunc = sourceArray[ sIdx ];
            for ( let tIdx = 0; tIdx < targetLen; tIdx++ ) {
              resultArray[ resultIdx++ ] = currentFunc( targetArray[ tIdx ] );
            }
          }
          return resultArray;
        };
      } )( moduleOutput );

      // Control.Semigroupoid module functionality
      ( ( targetModule ) => {
        "use strict";
        targetModule[ "Control.Semigroupoid" ] = targetModule[ "Control.Semigroupoid" ] || {};
        const semigroupoidUtilities = targetModule[ "Control.Semigroupoid" ];
        // Semigroupoid constructor
        const SemigroupoidConstructor = function ( compositionFunction ) {
          this.compose = compositionFunction;
        };
        // Function composition instance
        const functionCompositionInstance = new SemigroupoidConstructor(
          ( funcA ) => ( funcB ) => ( value ) => funcA( funcB( value ) )
        );
        semigroupoidUtilities.compose = ( semigroupoidInstance ) => semigroupoidInstance.compose;
        semigroupoidUtilities.Semigroupoid = SemigroupoidConstructor;
        semigroupoidUtilities.semigroupoidFn = functionCompositionInstance;
      } )( moduleOutput );

      // Control.Category module functionality
      ( ( targetModule ) => {
        "use strict";
        targetModule[ "Control.Category" ] = targetModule[ "Control.Category" ] || {};
        const categoryUtilities = targetModule[ "Control.Category" ];
        const semigroupoidDependency = targetModule[ "Control.Semigroupoid" ];
        // Category constructor
        const CategoryConstructor = function ( semigroupoidRef, idFunction ) {
          this.Semigroupoid0 = semigroupoidRef;
          this.identity = idFunction;
        };
        // Function category instance
        const functionCategoryInstance = new CategoryConstructor(
          () => semigroupoidDependency.semigroupoidFn,
          ( val ) => val
        );
        categoryUtilities.Category = CategoryConstructor;
        categoryUtilities.identity = ( categoryInstance ) => categoryInstance.identity;
        categoryUtilities.categoryFn = functionCategoryInstance;
      } )( moduleOutput );

      // Data.Function module functionality
      ( ( targetModule ) => {
        "use strict";
        targetModule[ "Data.Function" ] = targetModule[ "Data.Function" ] || {};
        const functionUtilities = targetModule[ "Data.Function" ];
        // Flip function arguments
        functionUtilities.flip = ( originalFunc ) => ( arg2 ) => ( arg1 ) => originalFunc( arg1 )( arg2 );
        // Constant function
        functionUtilities.const = ( constantValue ) => ( ignoredArg ) => constantValue;
      } )( moduleOutput );

      // Data.Functor module functionality (array specific map)
      ( ( targetModule ) => {
        "use strict";
        ( targetModule[ "Data.Functor" ] = targetModule[ "Data.Functor" ] || {} ).arrayMap = ( transformFunc ) => ( dataArray ) => {
          const arrayLength = dataArray.length;
          const mappedArray = new Array( arrayLength );
          for ( let idx = 0; idx < arrayLength; idx++ ) {
            mappedArray[ idx ] = transformFunc( dataArray[ idx ] );
          }
          return mappedArray;
        };
      } )( moduleOutput );

      // Data.Unit module functionality (unit value)
      ( ( targetModule ) => {
        "use strict";
        ( targetModule[ "Data.Unit" ] = targetModule[ "Data.Unit" ] || {} ).unit = {};
      } )( moduleOutput );

      // Data.Unit module (re-export or define unit)
      ( ( targetModule ) => {
        "use strict";
        targetModule[ "Data.Unit" ] = targetModule[ "Data.Unit" ] || {};
        const unitExports = targetModule[ "Data.Unit" ];
        const unitSource = targetModule[ "Data.Unit" ];
        unitExports.unit = unitSource.unit;
      } )( moduleOutput );

      // Data.Functor module functionality
      ( ( targetModule ) => {
        "use strict";
        targetModule[ "Data.Functor" ] = targetModule[ "Data.Functor" ] || {};
        const functorExports = targetModule[ "Data.Functor" ];
        const functorSources = targetModule[ "Data.Functor" ];
        const functionSources = targetModule[ "Data.Function" ];
        const unitSources = targetModule[ "Data.Unit" ];
        // Functor constructor
        const FunctorConstructor = function ( mappingFunction ) {
          this.map = mappingFunction;
        };
        // Map function getter
        const getMapFunction = ( functorInstance ) => functorInstance.map;
        // Array functor instance
        const arrayFunctorInstance = new FunctorConstructor( functorSources.arrayMap );
        functorExports.Functor = FunctorConstructor;
        functorExports.map = getMapFunction;
        // Void function: map to unit
        functorExports.void = ( functorInstance ) => getMapFunction( functorInstance )( functionSources.const( unitSources.unit ) );
        functorExports.functorArray = arrayFunctorInstance;
      } )( moduleOutput );

      // Control.Apply module functionality
      ( ( targetModule ) => {
        "use strict";
        targetModule[ "Control.Apply" ] = targetModule[ "Control.Apply" ] || {};
        const applyExports = targetModule[ "Control.Apply" ];
        const applySources = targetModule[ "Control.Apply" ];
        const categorySources = targetModule[ "Control.Category" ];
        const functionSources = targetModule[ "Data.Function" ];
        const functorSources = targetModule[ "Data.Functor" ];
        // Apply constructor
        const ApplyConstructor = function ( functorRef, applicationFunction ) {
          this.Functor0 = functorRef;
          this.apply = applicationFunction;
        };
        // Array apply instance
        const arrayApplyInstance = new ApplyConstructor(
          () => functorSources.functorArray,
          applySources.arrayApply
        );
        // Apply function getter
        const getApplyFunction = ( apply