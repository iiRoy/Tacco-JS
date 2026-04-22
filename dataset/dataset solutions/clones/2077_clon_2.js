( function ( bundleUnits ) {
  // Custom Module Bundler Initialization Routine
  // This function sets up a basic module loading environment.
  var loadedComponents = {}; // The central component cache for already loaded modules.

  // Main custom import function for resolving and providing modules.
  // It takes a component's unique identifier as an argument.
  function __bundler_import__( componentId ) {

    // First, check if the requested component is already present in the cache.
    if ( loadedComponents[ componentId ] ) {
      return loadedComponents[ componentId ].output; // If found, return its exported values immediately.
    }

    // If not cached, create a new component entry and store it.
    var component = loadedComponents[ componentId ] = {
      id: componentId, // Unique identifier for this specific component.
      loaded: false,   // A flag indicating the loading status of the component.
      output: {}       // The object that will hold the exported values of this component.
    };

    // Execute the component's code within its defined context.
    // The 'call' method ensures proper 'this' binding and passes necessary arguments.
    bundleUnits[ componentId ].call( component.output, component, component.output, __bundler_import__ );

    // Once execution is complete, mark the component as fully loaded.
    component.loaded = true;

    // Finally, return the exported values from the component.
    return component.output;
  } // End of __bundler_import__ function definition.


  // Expose the collection of source units (the initial 'modules' object)
  // to the internal import mechanism.
  __bundler_import__.sourceUnits = bundleUnits;

  // Expose the internal component cache for potential debugging or inspection purposes.
  __bundler_import__.componentCache = loadedComponents;

  // Define a helper function to set up getter properties for structured exports,
  // typically used for harmony (ESM) exports.
  __bundler_import__.defineExport = function ( exportedObjects, propKey, valueResolver ) {
    // Only define the property if it doesn't already exist on the target object.
    if ( !__bundler_import__.hasProperty( exportedObjects, propKey ) ) {
      Object.defineProperty( exportedObjects, propKey, { enumerable: true, get: valueResolver } );
    }
  };

  // Define a property to explicitly mark an object as an ECMAScript Module (ESM).
  __bundler_import__.registerESM = function ( exportedObjects ) {
    // If Symbol and Symbol.toStringTag are available, set the module tag.
    if ( typeof Symbol !== 'undefined' && Symbol.toStringTag ) {
      Object.defineProperty( exportedObjects, Symbol.toStringTag, { value: 'CodeUnit' } );
    }
    // Set a custom flag to indicate it's an ES Module.
    Object.defineProperty( exportedObjects, '_is_ES_Module', { value: true } );
  };

  // Function to create a simulated namespace object, handling various import modes.
  // importMode & 1: If set, resourceValue is a component ID; resolve it via __bundler_import__.
  // importMode & 2: If set, merge all properties from resourceValue into the new namespace object.
  // importMode & 4: If set, return resourceValue directly if it's already an ESM namespace object.
  // importMode & 8|1: If set, behave like a direct, non-namespace import (return resourceValue).
  __bundler_import__.createNamespace = function ( resourceValue, importMode ) {
    if ( importMode & 1 ) {
      resourceValue = __bundler_import__( resourceValue );
    }
    if ( importMode & 8 ) {
      return resourceValue;
    }
    if ( ( importMode & 4 ) && typeof resourceValue === 'object' && resourceValue && resourceValue._is_ES_Module ) {
      return resourceValue;
    }
    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create( null );
    __bundler_import__.registerESM( namespaceObject ); // Mark it as an ESM.
    // Define the 'primaryExport' property, which is the default export.
    Object.defineProperty( namespaceObject, 'primaryExport', { enumerable: true, value: resourceValue } );
    // If merging is required and resourceValue is not a simple string, iterate and define exports.
    if ( importMode & 2 && typeof resourceValue !== 'string' ) {
      for ( var itemKey in resourceValue ) {
        __bundler_import__.defineExport( namespaceObject, itemKey, ( function ( itemKey ) {
          return resourceValue[ itemKey ];
        } ).bind( null, itemKey ) );
      }
    }
    return namespaceObject;
  };

  // Function to retrieve an accessor for the default export,
  // ensuring compatibility between ES Modules and CommonJS-like modules.
  __bundler_import__.getExportAccessor = function ( component ) {
    var valueResolver = component && component._is_ES_Module
      ? function getPrimary() { // For ES Modules, retrieve the 'primaryExport'.
        return component[ 'primaryExport' ];
      }
      : function retrieveComponentOutput() { // For other modules, return the component itself.
        return component;
      };
    // Define a symbolic export 'alpha' pointing to the resolver function.
    __bundler_import__.defineExport( valueResolver, 'alpha', valueResolver );
    return valueResolver;
  };

  // A utility function that wraps Object.prototype.hasOwnProperty.call.
  __bundler_import__.hasProperty = function ( targetObject, propertyName ) {
    return Object.prototype.hasOwnProperty.call( targetObject, propertyName );
  };

  // The base path for public assets, typically an empty string or a URL.
  __bundler_import__.publicAssetPath = "";


  // Load the initial entry component and return its exported values,
  // effectively starting the application or bundling process.
  return __bundler_import__( __bundler_import__.startupUnit = "./app/core/entry.js" );
} )
/************************************************************************/
( {

  /***/ "./app/core/entry.js":
  /*!***************************************!*!
    !*** ./app/core/entry.js ***!
    !***************************************!*!
    /*! No explicit exports located */
  /***/ ( function ( component, output, __bundler_import__ ) {

    eval( "var fileSystemOps = __bundler_import__(/* sysio */ \"sysio\");\n\nvar characterSet = 'abcdefghijklmnopqrstuvwxyz'.split('');\nvar targetLength = 0;\n\nvar recursiveBuilder = function stringCombinator(currentString, maxCharIndex) {\n  if (currentString.length === targetLength) {\n    console.log(currentString);\n    return;\n  }\n\n  var currentMaxChar = characterSet[maxCharIndex];\n\n  for (var charIterator = 0; charIterator <= characterSet.indexOf(currentMaxChar) + 1; charIterator++) {\n    var tempString = currentString;\n    tempString += characterSet[charIterator];\n    recursiveBuilder(tempString, Math.max(characterSet.indexOf(currentMaxChar), charIterator));\n  }\n};\n\nvar entryPoint = function processInput(rawData) {\n  targetLength = rawData.split('\\n')[0] - 0;\n  recursiveBuilder('', -1);\n};\n\nentryPoint(fileSystemOps.readFileSync('/system/input', 'utf8'));\n\n//# sourceURL=/source/asset/project/moduleA.js?" );

  /***/ } ),

  /***/ "sysio":
  /*!**********************!*!
    !*** external "sysio" ***!
    !**********************!*!
    /*! No explicit exports located */
  /***/ ( function ( component, output ) {

    eval( "component.output = require(\"sysio\");\n\n//# sourceURL=/source/asset/external/sysio?" );

  /***/ } )

} );