module.exports = function ( componentDefinitions ) {
  // This object serves as a cache for already initialized and loaded components.
  const loadedComponentsCache = {};

  /**
   * The core function responsible for loading and executing individual components.
   * It checks the cache first; if a component is found, its exports are returned.
   * Otherwise, the component's definition is executed, its exports are stored,
   * and then it's added to the cache.
   * @param {number} componentIdentifier - The unique numerical identifier for the component.
   * @returns {object} The public interface (exports) of the loaded component.
   */
  function retrieveComponent( componentIdentifier ) {
    // If the component is already present in our cache, we return its exports immediately.
    if ( loadedComponentsCache[ componentIdentifier ] ) {
      return loadedComponentsCache[ componentIdentifier ].exports;
    }

    // Otherwise, we create a new module record, mark it as not yet loaded,
    // and store it in the cache for future reference.
    const currentModuleRecord = loadedComponentsCache[ componentIdentifier ] = {
      id: componentIdentifier, // Unique ID of this component.
      isLoaded: false, // Flag indicating if the component's code has been executed.
      exports: {} // The object that will hold the component's public interface.
    };

    // Execute the component's definition function.
    // The definition function receives the module record, its exports, and the loader function itself
    // (mimicking Node.js CommonJS `module`, `exports`, `require`).
    componentDefinitions[ componentIdentifier ].call(
      currentModuleRecord.exports, // 'this' context for the definition function.
      currentModuleRecord, // The module object.
      currentModuleRecord.exports, // The exports object.
      retrieveComponent // The local 'require' function.
    );

    // After successful execution, mark the component as loaded.
    currentModuleRecord.isLoaded = true;

    // Return the exports of the newly loaded component.
    return currentModuleRecord.exports;
  }

  // Attach a reference to the original component definitions array to the loader function.
  retrieveComponent.definitionSources = componentDefinitions;

  // Attach a reference to the component cache to the loader for debugging or internal use.
  retrieveComponent.cachedRecords = loadedComponentsCache;

  /**
   * Defines a getter property on a target object, primarily used for ES module interop.
   * This ensures properties are only defined once.
   * @param {object} targetExportObject - The object on which to define the property.
   * @param {string} propertyKey - The name of the property to be defined.
   * @param {function} valueAccessor - A function that provides the value for the property.
   */
  retrieveComponent.addExportGetter = function ( targetExportObject, propertyKey, valueAccessor ) {
    // Only define the property if it does not already exist on the target object.
    if ( !retrieveComponent.checkOwnProperty( targetExportObject, propertyKey ) ) {
      Object.defineProperty( targetExportObject, propertyKey, {
        enumerable: true, // Make the property visible during enumeration.
        get: valueAccessor // Assign the provided function as the getter for the property.
      } );
    }
  };

  /**
   * Marks an exports object as an ECMAScript module.
   * This involves setting the `Symbol.toStringTag` and `__esModule` properties.
   * @param {object} exportBundle - The module's exports object to be marked.
   */
  retrieveComponent.markAsESModule = function ( exportBundle ) {
    // Set `Symbol.toStringTag` for improved module identification in environments supporting Symbol.
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty( exportBundle, Symbol.toStringTag, {
        value: "Module"
      } );
    }
    // Explicitly mark this object as an ES module.
    Object.defineProperty( exportBundle, "__esModule", {
      value: true
    } );
  };

  /**
   * Resolves a module's exports based on various flags, providing compatibility
   * for CommonJS and ES module patterns.
   * @param {any} moduleSource - Can be a component ID or an already loaded module object.
   * @param {number} resolutionFlags - A bitmask indicating how to resolve the exports.
   * @returns {object} The fully resolved module exports object.
   */
  retrieveComponent.resolveModuleExport = function ( moduleSource, resolutionFlags ) {
    // Flag 1: If set, the moduleSource is an ID, so load the component.
    if ( resolutionFlags & 1 ) {
      moduleSource = retrieveComponent( moduleSource );
    }
    // Flag 8: If set, return the moduleSource directly, no further processing.
    if ( resolutionFlags & 8 ) {
      return moduleSource;
    }
    // Flag 4: If moduleSource is an object and already an ES module, return it as is.
    if ( ( resolutionFlags & 4 ) && typeof moduleSource === "object" && moduleSource && moduleSource.__esModule ) {
      return moduleSource;
    }

    // Create a new plain object to serve as a proxy for the exports.
    const exportProxy = Object.create( null );

    // Mark this new proxy object as an ES module.
    retrieveComponent.markAsESModule( exportProxy );

    // Define a 'default' export property pointing to the original moduleSource.
    Object.defineProperty( exportProxy, "default", {
      enumerable: true, // Make 'default' enumerable.
      value: moduleSource // The actual value of the default export.
    } );

    // Flag 2: If moduleSource is not a string, iterate over its properties and
    // expose them as getters on the proxy object.
    if ( ( resolutionFlags & 2 ) && typeof moduleSource !== "string" ) {
      for ( const propName in moduleSource ) {
        retrieveComponent.addExportGetter( exportProxy, propName, ( function ( key ) {
          return moduleSource[ key ];
        } ).bind( null, propName ) );
      }
    }
    return exportProxy;
  };

  /**
   * Provides a utility function to get the default export of a module,
   * handling cases where `__esModule` is set or not.
   * @param {object} inputModule - The module's exports object.
   * @returns {function} A function that, when called, returns the default export.
   */
  retrieveComponent.getDefaultExport = function ( inputModule ) {
    const exportFunction = inputModule && inputModule.__esModule ?
      // If it's an ES module, return its 'default' property.
      function () {
        return inputModule.default;
      } :
      // Otherwise, return the module object itself as the default.
      function () {
        return inputModule;
      };
    // Attach a synthetic 'a' property (often used in bundles for default export access).
    retrieveComponent.addExportGetter( exportFunction, "a", exportFunction );
    return exportFunction;
  };

  /**
   * Checks if an object has a specified property as its own property (not inherited).
   * @param {object} targetObject - The object to inspect.
   * @param {string} propertyName - The name of the property to check for.
   * @returns {boolean} `true` if the object has the property directly, `false` otherwise.
   */
  retrieveComponent.checkOwnProperty = function ( targetObject, propertyName ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyName );
  };

  // Sets the base path for assets; typically an empty string for relative paths.
  retrieveComponent.baseAssetPath = "";

  // Set the identifier for the application's entry point module and immediately load it.
  retrieveComponent.entryModuleId = 0;
  return retrieveComponent( retrieveComponent.entryModuleId );
} ( [
  /* Component 0: The primary application entry point */
  function ( currentModuleObj, moduleExportsObj, moduleLoaderFunc ) {
    // Load component 1, then execute it with the result of reading from standard input
    // using a function from component 2.
    moduleLoaderFunc( 1 )( moduleLoaderFunc( 2 ).readFileSync( "/dev/stdin", "UTF-8" ) );
  },

  /* Component 1: Contains the core string processing logic */
  function ( currentModuleObj, moduleExportsObj ) {
    currentModuleObj.exports = function ( inputLineData ) {
      // Process the input: take the first line, then convert it to an array of characters.
      const charSequence = inputLineData.split( "\n" )[ 0 ].split( "" );
      let matchedLength = 0; // This variable will store the length of the longest found prefix.

      // Iterate backwards from the second-to-last character towards the beginning of the string.
      // 'boundaryIndex' marks the end of the second segment being compared.
      for ( let boundaryIndex = charSequence.length - 2; boundaryIndex >= 0; boundaryIndex-- ) {
        let patternFound = false; // Flag to indicate if a repeating prefix is found for the current boundary.

        // Iterate from the start of the string up to the current boundary.
        // 'segmentStart' marks the beginning of the second segment.
        for ( let segmentStart = 0; segmentStart <= boundaryIndex; segmentStart++ ) {
          // Compare the prefix segment (from start to 'segmentStart') with the segment
          // starting from 'segmentStart' up to 'boundaryIndex'.
          if (
            charSequence.slice( 0, segmentStart ).join( "" ) ===
            charSequence.slice( segmentStart, boundaryIndex + 1 ).join( "" )
          ) {
            patternFound = true; // A repeating pattern has been identified.
            break; // Exit the inner loop as we've found a match for this 'boundaryIndex'.
          }
        }

        // If a repeating pattern was found for the current 'boundaryIndex',
        // update 'matchedLength' and output the result.
        if ( patternFound ) {
          matchedLength = boundaryIndex + 1;
          console.log( matchedLength ); // Display the calculated length.
          return; // Terminate function execution as the longest match has been found.
        }
      }
    };
  },

  /* Component 2: Provides file system functionalities */
  function ( currentModuleObj, moduleExportsObj ) {
    // Export the Node.js 'filesystem' module for file operations.
    currentModuleObj.exports = require( "filesystem" );
  }
] );