var BUNDLED_FOR_PRODUCTION = true, utilz = utilz || {};

utilz.environment = this;

utilz.IS_DEV_MODE = true;

utilz.LANGUAGE_CODE = "us-en";

utilz.SECURE_CONTEXT = true;

utilz.declareModule = function ( modulePath ) {
  // If not running in a compiled build, perform namespace checks and management.
  if ( !BUNDLED_FOR_PRODUCTION ) {
    // Check if the provided module path has already been registered.
    if ( utilz.hasModuleDeclared_( modulePath ) ) {
      throw Error('Namespace "' + modulePath + '" already exists.');
    }
    // Remove the module from the list of implicitly provided namespaces.
    delete utilz.pendingNamespaces_[ modulePath ];
    // Traverse up the namespace path, marking parent namespaces as implicitly provided
    // if they don't explicitly exist yet.
    for ( var currentPath = modulePath; (currentPath = currentPath.substring(0, currentPath.lastIndexOf("."))) && !utilz.findObjectByPath(currentPath); ) {
      utilz.pendingNamespaces_[ currentPath ] = true;
    }
  }
  // Ensure the full namespace path is created and exported.
  utilz.publishPath_( modulePath );
};

utilz.markAsTestOnly = function ( messageText ) {
  // This function is designed to prevent test-only code from being included
  // in production builds. It throws an error if compiled and not in debug mode.
  if ( BUNDLED_FOR_PRODUCTION && !utilz.IS_DEV_MODE ) {
    messageText = messageText || "";
    throw Error("Importing test-only code into non-debug environment" + (messageText ? ": " + messageText : "."));
  }
};

// Initialize internal namespace tracking mechanisms only if not compiled.
!BUNDLED_FOR_PRODUCTION || (
  utilz.hasModuleDeclared_ = function ( moduleName ) {
    // Determines if a module has been provided, either implicitly or explicitly.
    return !utilz.pendingNamespaces_[ moduleName ] && !!utilz.findObjectByPath( moduleName );
  },
  utilz.pendingNamespaces_ = {}
);

utilz.publishPath_ = function ( pathString, valueToAssign, rootObject ) {
  var pathComponents = pathString.split("."); // Split the path into individual parts.
  rootObject = rootObject || utilz.environment; // Default the root object to the global scope.
  // Ensure the top-level namespace component exists in the root object.
  // If not, and execScript is available (e.g., in IE), use it to declare the variable.
  pathComponents[0] in rootObject || !rootObject.execScript || rootObject.execScript("var " + pathComponents[0]);

  var currentSegment;
  // Iterate through the path components to navigate or create the object structure.
  while ( pathComponents.length && (currentSegment = pathComponents.shift()) ) {
    // If this is the last segment and a value is provided, assign it.
    if ( !pathComponents.length && utilz.isDefined( valueToAssign ) ) {
      rootObject[ currentSegment ] = valueToAssign;
    } else {
      // Otherwise, move deeper into the object or create a new nested object.
      rootObject = rootObject[ currentSegment ] ? rootObject[ currentSegment ] : (rootObject[ currentSegment ] = {});
    }
  }
};

utilz.findObjectByPath = function ( objectPath, contextObject ) {
  var pathSegments = objectPath.split("."); // Break the path string into an array of segments.
  var currentContext = contextObject || utilz.environment; // Start searching from the global object or a specified context.
  var segment;
  // Iterate through each segment of the path.
  while ( segment = pathSegments.shift() ) {
    // If the current segment exists and is not null/undefined in the current context.
    if ( utilz.isDefinedAndNotNull( currentContext[ segment ] ) ) {
      currentContext = currentContext[ segment ]; // Move to the next level of the object hierarchy.
    } else {
      return null; // A segment in the path was not found, so the full path cannot be resolved.
    }
  }
  return currentContext; // Return the resolved object.
};

utilz.injectGlobals = function ( sourceObject, targetScope ) {
  var destination = targetScope || utilz.environment; // Determine the target scope, defaulting to the global environment.
  var propName;
  // Iterate over all properties in the source object and copy them to the destination.
  for ( propName in sourceObject ) {
    destination[ propName ] = sourceObject[ propName ];
  }
};

utilz.registerDependency = function ( scriptPath, providedModules, requiredModules ) {
  // This function is only active when the code is not bundled (i.e., in debug mode).
  if ( !BUNDLED_FOR_PRODUCTION ) {
    var moduleName;
    scriptPath = scriptPath.replace(/\\/g, "/"); // Standardize path separators to forward slashes.
    var dependencyGraph = utilz.depGraph_; // Access the global dependency graph.
    var i = 0;
    // Map each provided module name to its corresponding script path.
    while ( moduleName = providedModules[ i ] ) {
      dependencyGraph.nameToPath[ moduleName ] = scriptPath;
      if ( !(scriptPath in dependencyGraph.pathToNames) ) {
        dependencyGraph.pathToNames[ scriptPath ] = {};
      }
      dependencyGraph.pathToNames[ scriptPath ][ moduleName ] = true;
      i++;
    }
    // Record the requirements for the given script path.
    i = 0;
    while ( providedModules = requiredModules[ i ] ) { // Reusing `providedModules` variable for iteration.
      if ( !(scriptPath in dependencyGraph.requires) ) {
        dependencyGraph.requires[ scriptPath ] = {};
      }
      dependencyGraph.requires[ scriptPath ][ providedModules ] = true;
      i++;
    }
  }
};

utilz.ENABLE_DYNAMIC_LOADING = true;

utilz.loadModule = function ( moduleIdentifier ) {
  // If not bundled and the module hasn't been declared yet, attempt to load it.
  if ( !BUNDLED_FOR_PRODUCTION && !utilz.hasModuleDeclared_( moduleIdentifier ) ) {
    // If dynamic loading is enabled, try to resolve and load the script.
    if ( utilz.ENABLE_DYNAMIC_LOADING ) {
      var resolvedPath = utilz.resolvePathFromDeps_( moduleIdentifier ); // Find the script path from dependencies.
      if ( resolvedPath ) {
        utilz.loadedFiles_[ resolvedPath ] = true; // Mark this file as included.
        utilz.injectScripts_(); // Trigger the script injection process.
        return;
      }
    }
    // If the module could not be found or dynamic loading is disabled/failed, throw an error.
    moduleIdentifier = "utilz.loadModule could not find: " + moduleIdentifier;
    // Log the error to the console if a console object is available.
    utilz.environment.console && utilz.environment.console.error( moduleIdentifier );
    throw Error( moduleIdentifier );
  }
};

utilz.rootPath = "";

utilz.noOpFunction = function () {
  // This is a placeholder function that performs no operation.
};

utilz.passThroughFunction = function ( inputValue, secondArg ) {
  return inputValue; // Returns the first argument exactly as it was received.
};

utilz.abstractMethodStub = function () {
  throw Error("unimplemented abstract method"); // Signifies an abstract method that must be overridden.
};

utilz.createSingletonAccessor = function ( ConstructorClass ) {
  // Adds a static `getInstance` method to the constructor function.
  ConstructorClass.getInstance = function () {
    if ( ConstructorClass.instance_ ) {
      return ConstructorClass.instance_; // Return the existing singleton instance if it exists.
    }
    // In development mode, track new singleton instances for debugging.
    utilz.IS_DEV_MODE && (utilz.activeSingletons_[ utilz.activeSingletons_.length ] = ConstructorClass);
    return ConstructorClass.instance_ = new ConstructorClass(); // Create, store, and return a new instance.
  };
};

utilz.activeSingletons_ = [];

// Initialize debug loader components if not in a production bundle and dynamic loading is enabled.
!BUNDLED_FOR_PRODUCTION && utilz.ENABLE_DYNAMIC_LOADING && (
  utilz.loadedFiles_ = {}, // Tracks files that have been included.
  utilz.depGraph_ = { pathToNames: {}, nameToPath: {}, requires: {}, visited: {}, written: {} }, // Stores the dependency graph.
  utilz.isBrowserEnv_ = function () {
    var docRef = utilz.environment.document;
    // Checks if a browser document object is available and supports `write`.
    return "undefined" !== typeof docRef && "write" in docRef;
  },
  utilz.determineRootPath_ = function () {
    // Check for a globally defined base path first.
    if ( utilz.environment.CLOSURE_BASE_PATH ) {
      utilz.rootPath = utilz.environment.CLOSURE_BASE_PATH;
    } else {
      // If in a browser environment, attempt to find the base path from script tags.
      if ( utilz.isBrowserEnv_() ) {
        var scriptElements = utilz.environment.document.getElementsByTagName("script");
        var scriptIdx = scriptElements.length - 1; // Start from the last script tag.
        while ( scriptIdx >= 0 ) {
          var scriptSource = scriptElements[ scriptIdx ].src;
          var queryParamIndex = scriptSource.lastIndexOf("?");
          var pathEndIndex = queryParamIndex === -1 ? scriptSource.length : queryParamIndex;
          // Look for a specific script name ('loader_core.js') to determine the base path.
          if ( "loader_core.js" === scriptSource.substr( pathEndIndex - 12, 12 ) ) {
            utilz.rootPath = scriptSource.substr( 0, pathEndIndex - 12 );
            break; // Base path found, exit loop.
          }
          scriptIdx--;
        }
      }
    }
  },
  utilz.fetchScript_ = function ( scriptUrl ) {
    var scriptLoader = utilz.environment.CLOSURE_IMPORT_SCRIPT || utilz.embedScriptTag_;
    // Only fetch and execute the script if it hasn't been written yet.
    if ( !utilz.depGraph_.written[ scriptUrl ] && scriptLoader( scriptUrl ) ) {
      utilz.depGraph_.written[ scriptUrl ] = true;
    }
  },
  utilz.embedScriptTag_ = function ( scriptSrc ) {
    if ( utilz.isBrowserEnv_() ) {
      var currentDocument = utilz.environment.document;
      // If the document is already fully loaded, direct script tag writing is problematic.
      if ( "complete" === currentDocument.readyState ) {
        if ( /\bdeps.js$/.test( scriptSrc ) ) { // Special handling for the dependency list file.
          return false;
        }
        throw Error('Cannot write "' + scriptSrc + '" after document load');
      }
      // Create a new script element and append it to the document body.
      var newScriptTag = currentDocument.createElement("script");
      newScriptTag.type = "application/javascript";
      newScriptTag.defer = false;
      newScriptTag.appendChild(currentDocument.createTextNode("")); // Required for some older browsers (e.g., IE)
      currentDocument.body.appendChild(newScriptTag);
      newScriptTag.src = scriptSrc; // Set the source after appending for better compatibility.
      return true;
    }
    return false; // Script tags cannot be embedded if not in a browser environment.
  },
  utilz.injectScripts_ = function () {
    // Recursive helper function to add scripts and their dependencies to the load queue.
    function addScriptToLoadQueue( scriptPath ) {
      if ( !(scriptPath in dependencyRegistry.written) ) { // If this script hasn't been written yet.
        if ( !(scriptPath in dependencyRegistry.visited) ) { // If this script hasn't been visited in the current traversal.
          dependencyRegistry.visited[ scriptPath ] = true; // Mark as visited.
          if ( scriptPath in dependencyRegistry.requires ) { // If this script has dependencies.
            for ( var requiredModule in dependencyRegistry.requires[ scriptPath ] ) {
              if ( !utilz.hasModuleDeclared_( requiredModule ) ) { // If a required module is not yet provided.
                if ( requiredModule in dependencyRegistry.nameToPath ) {
                  addScriptToLoadQueue( dependencyRegistry.nameToPath[ requiredModule ] ); // Recursively add the dependency script.
                } else {
                  throw Error("Undefined nameToPath for " + requiredModule); // Dependency script path not found.
                }
              }
            }
          }
        }
        if ( !(scriptPath in scriptsToInjectMap) ) { // If the script is not already scheduled for injection.
          scriptsToInjectMap[ scriptPath ] = true;
          scriptsToInjectList.push( scriptPath ); // Add the script to the list to be injected.
        }
      }
    }

    var scriptsToInjectList = [];
    var scriptsToInjectMap = {};
    var dependencyRegistry = utilz.depGraph_;
    var includedFile;
    // Iterate through all files marked as included and add them to the queue.
    for ( includedFile in utilz.loadedFiles_ ) {
      if ( !dependencyRegistry.written[ includedFile ] ) {
        addScriptToLoadQueue( includedFile );
      }
    }
    // Inject all collected scripts in the determined order.
    var scriptIndex = 0;
    while ( scriptIndex < scriptsToInjectList.length ) {
      var currentScript = scriptsToInjectList[ scriptIndex ];
      if ( currentScript ) {
        utilz.fetchScript_( utilz.rootPath + currentScript );
      } else {
        throw Error("Undefined script input"); // Should not happen if logic is correct.
      }
      scriptIndex++;
    }
  },
  utilz.resolvePathFromDeps_ = function ( moduleName ) {
    // Returns the script path for a given module name from the dependency graph.
    return moduleName in utilz.depGraph_.nameToPath ? utilz.depGraph_.nameToPath[ moduleName ] : null;
  },
  utilz.determineRootPath_(), // Automatically determine the base path.
  // If a global override is not set, load the main dependencies list script.
  utilz.environment.CLOSURE_NO_DEPS || utilz.fetchScript_( utilz.rootPath + "dependencies_list.js" )
);

utilz.getType = function ( valueToCheck ) {
  var valueType = typeof valueToCheck;
  if ( "object" === valueType ) {
    if ( valueToCheck ) {
      // Specific checks for Array and Object instances.
      if ( valueToCheck instanceof Array ) {
        return "array";
      }
      if ( valueToCheck instanceof Object ) {
        return valueType;
      }
      // Fallback to Object.prototype.toString for more accurate type detection.
      var objectString = Object.prototype.toString.call( valueToCheck );
      if ( "[object Window]" === objectString ) {
        return "object"; // Special case for window object.
      }
      // Check for array-like objects (e.g., NodeList) that might not be true arrays.
      if ( "[object Array]" === objectString || "number" === typeof valueToCheck.length && "undefined" !== typeof valueToCheck.splice && "undefined" !== typeof valueToCheck.propertyIsEnumerable && !valueToCheck.propertyIsEnumerable("splice") ) {
        return "array";
      }
      // Check for function-like objects that might not be true functions.
      if ( "[object Function]" === objectString || "undefined" !== typeof valueToCheck.call && "undefined" !== typeof valueToCheck.propertyIsEnumerable && !valueToCheck.propertyIsEnumerable("call") ) {
        return "function";
      }
    } else {
      return "null"; // Handle null specifically.
    }
  } else {
    // Special case for some host objects that report as 'function' but lack 'call'.
    if ( "function" === valueType && "undefined" === typeof valueToCheck.call ) {
      return "object";
    }
  }
  return valueType; // Return the basic typeof result.
};

utilz.isDefined = function ( inputVar ) {
  return void 0 !== inputVar; // Checks if a variable is not `undefined`.
};

utilz.isNothing = function ( inputVar ) {
  return null === inputVar; // Checks if a variable is strictly `null`.
};

utilz.isDefinedAndNotNull = function ( inputVar ) {
  return null != inputVar; // Checks if a variable is neither `null` nor `undefined`.
};

utilz.isList = function ( potentialList ) {
  return "array" === utilz.getType( potentialList ); // Determines if the given value is an actual array.
};

utilz.isListLike = function ( collection ) {
  var collectionType = utilz.getType( collection );
  // Checks if the value is an array or an object with a numeric `length` property.
  return "array" === collectionType || "object" === collectionType && "number" === typeof collection.length;
};

utilz.isTemporal = function ( potentialDate ) {
  // Checks if the value is an object and has a `getFullYear` method (common for Date objects).
  return utilz.isCompound( potentialDate ) && "function" === typeof potentialDate.getFullYear;
};

utilz.isText = function ( potentialString ) {
  return "string" === typeof potentialString; // Checks if the value's type is `string`.
};

utilz.isLogical = function ( potentialBoolean ) {
  return "boolean" === typeof potentialBoolean; // Checks if the value's type is `boolean`.
};

utilz.isNumerical = function ( potentialNumber ) {
  return "number" === typeof potentialNumber; // Checks if the value's type is `number`.
};

utilz.isCallable = function ( potentialFunction ) {
  return "function" === utilz.getType( potentialFunction ); // Determines if the given value is a function.
};

utilz.isCompound = function ( potentialObject ) {
  var objectKind = typeof potentialObject;
  // Checks if the value is a non-null object or a function.
  return "object" === objectKind && null !== potentialObject || "function" === objectKind;
};

utilz.getUniqueId = function ( targetElement ) {
  // Assigns and returns a unique identifier to an object.
  // If the object already has one, it's returned; otherwise, a new one is generated.
  return targetElement[ utilz.ID_KEY_ ] || (targetElement[ utilz.ID_KEY_ ] = ++utilz.idCounter_);
};

utilz.removeUniqueId = function ( targetElement ) {
  // If the element has a `removeAttribute` method (e.g., DOM elements), use it.
  if ( "removeAttribute" in targetElement ) {
    targetElement.removeAttribute( utilz.ID_KEY_ );
  }
  // Attempt to delete the property directly.
  try {
    delete targetElement[ utilz.ID_KEY_ ];
  } catch ( propertyDeletionError ) {
    // Ignore errors for non-configurable properties.
  }
};

utilz.ID_KEY_ = "unique_id_" + Math.floor(Math.random() * 1000000000); // Generates a unique key string for ID properties.

utilz.idCounter_ = 0; // Counter for generating unique numeric IDs.

utilz.getHash = utilz.getUniqueId; // Alias for `getUniqueId`.

utilz.removeHash = utilz.removeUniqueId; // Alias for `removeUniqueId`.

utilz.deepCopy = function ( sourceObject ) {
  var objectCategory = utilz.getType( sourceObject );
  // If the source is an object or an array, perform a deep copy.
  if ( "object" === objectCategory || "array" === objectCategory ) {
    // If the object has a custom `clone` method, use it.
    if ( sourceObject.clone ) {
      return sourceObject.clone();
    }
    // Create a new array or object based on the source's type.
    var clonedContainer = "array" === objectCategory ? [] : {};
    var propKey;
    // Recursively copy each property.
    for ( propKey in sourceObject ) {
      clonedContainer[ propKey ] = utilz.deepCopy( sourceObject[ propKey ] );
    }
    return clonedContainer;
  }
  return sourceObject; // For primitive types, return the value directly.
};

utilz.bindNativeImpl_ = function ( funcToBind, contextObj, var_args ) {
  // Uses the native `Function.prototype.bind` method for efficient binding.
  return funcToBind.call.apply( funcToBind.bind, arguments );
};

utilz.bindPolyfillImpl_ = function ( funcToBind, contextObj, var_args ) {
  if ( !funcToBind ) {
    throw Error(); // A function must be provided to bind.
  }
  // If there are more than two arguments, it implies partial application of arguments.
  if ( arguments.length > 2 ) {
    var prependedArgs = Array.prototype.slice.call( arguments, 2 ); // Extract the arguments to be prepended.
    return function () {
      var currentArgs = Array.prototype.slice.call( arguments ); // Get arguments passed at call time.
      Array.prototype.unshift.apply( currentArgs, prependedArgs ); // Prepend the fixed arguments.
      return funcToBind.apply( contextObj, currentArgs ); // Apply the function with the new context and combined arguments.
    };
  }
  return function () {
    return funcToBind.apply( contextObj, arguments ); // Apply the function with the new context and original arguments.
  };
};

utilz.bindFunction = function ( funcRef, thisArg, extraArgs ) {
  // Detect if the native `Function.prototype.bind` is available and not a polyfill.
  if ( Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") !== -1 ) {
    utilz.bindFunction = utilz.bindNativeImpl_; // Use the native implementation.
  } else {
    utilz.bindFunction = utilz.bindPolyfillImpl_; // Fallback to the JavaScript polyfill.
  }
  return utilz.bindFunction.apply( null, arguments ); // Call the now-assigned binding function.
};

utilz.partialApply = function ( targetFunction, firstArg ) {
  var fixedArgs = Array.prototype.slice.call( arguments, 1 ); // Collect arguments after the target function.
  return function () {
    var dynamicArgs = Array.prototype.slice.call( arguments ); // Collect arguments passed at invocation.
    dynamicArgs.unshift.apply( dynamicArgs, fixedArgs ); // Prepend the fixed arguments to the dynamic ones.
    return targetFunction.apply( this, dynamicArgs ); // Invoke the target function with the combined arguments.
  };
};

utilz.assignProperties = function ( destinationObject, sourceObject ) {
  var propertyName;
  // Copies all enumerable properties from the source object to the destination object.
  for ( propertyName in sourceObject ) {
    destinationObject[ propertyName ] = sourceObject[ propertyName ];
  }
};

utilz.currentTimeMillis = utilz.SECURE_CONTEXT && Date.now || function () {
  return +new Date(); // Returns the current time in milliseconds, falling back to `new Date().getTime()`.
};

utilz.executeGlobalCode = function ( scriptCode ) {
  if ( utilz.environment.execScript ) {
    utilz.environment.execScript( scriptCode, "text/javascript" ); // For Internet Explorer.
  } else {
    if ( utilz.environment.eval ) {
      // Test if `eval` creates global variables if not already determined.
      if ( utilz.globalEvalTestPassed_ === null ) {
        utilz.environment.eval("var _temp_eval_test_ = 1;");
        utilz.globalEvalTestPassed_ = typeof utilz.environment._temp_eval_test_ !== "undefined";
        if ( utilz.globalEvalTestPassed_ ) {
          delete utilz.environment._temp_eval_test_;
        }
      }
      // If `eval` works for global scope, use it directly.
      if ( utilz.globalEvalTestPassed_ ) {
        utilz.environment.eval( scriptCode );
      } else {
        // Fallback for environments where `eval` does not affect the global scope.
        var docRef = utilz.environment.document;
        var scriptElem = docRef.createElement("script");
        scriptElem.type = "application/javascript";
        scriptElem.defer = false;
        scriptElem.appendChild(docRef.createTextNode( scriptCode ));
        docRef.body.appendChild(scriptElem);
        docRef.body.removeChild(scriptElem); // Clean up the injected script element.
      }
    } else {
      throw Error("utilz.executeGlobalCode not available"); // No suitable method found for global code execution.
    }
  }
};

utilz.globalEvalTestPassed_ = null; // Stores the result of the global eval test.

utilz.getCssClassName = function ( baseClassName, suffix ) {
  // Helper function to map a single CSS class part.
  var mapSinglePart = function ( part ) {
    return utilz.classNameMap_[ part ] || part;
  };
  // Determine the mapping function based on the configured mapping style.
  var mapFunction = utilz.classNameMap_ ? ( "BY_WHOLE" === utilz.classNameMapStyle_ ? mapSinglePart : function ( name ) {
    var parts = name.split("-");
    var mappedParts = [];
    var partIdx = 0;
    while ( partIdx < parts.length ) {
      mappedParts.push( mapSinglePart( parts[ partIdx ] ) );
      partIdx++;
    }
    return mappedParts.join("-");
  } ) : function ( name ) {
    return name; // If no mapping is set, return the name as is.
  };
  // Apply the mapping and combine with a suffix if provided.
  return suffix ? baseClassName + "-" + mapFunction( suffix ) : mapFunction( baseClassName );
};

utilz.setClassNameMapping = function ( mappingObject, mappingStyle ) {
  utilz.classNameMap_ = mappingObject; // Sets the CSS class name mapping object.
  utilz.classNameMapStyle_ = mappingStyle; // Sets the style of the CSS class name mapping (e.g., 'BY_WHOLE').
};

// If not compiled and a global CSS name mapping is available, use it.
!BUNDLED_FOR_PRODUCTION && utilz.environment.CLOSURE_CSS_NAME_MAPPING && (utilz.classNameMap_ = utilz.environment.CLOSURE_CSS_NAME_MAPPING);

utilz.getMessage = function ( messageTemplate, replacements ) {
  var substitutions = replacements || {};
  var token;
  // Iterate through the replacement map.
  for ( token in substitutions ) {
    var escapedValue = ("" + substitutions[ token ]).replace(/\$/g, "$$$$"); // Escape '$' in replacement values.
    // Replace all occurrences of '{$TOKEN}' in the template with the escaped value.
    messageTemplate = messageTemplate.replace(RegExp("\\{\\$" + token + "\\}", "gi"), escapedValue);
  }
  return messageTemplate; // Return the template with all tokens substituted.
};

utilz.getMessageWithFallback = function ( primaryMessage, secondaryMessage ) {
  return primaryMessage; // In this implementation, the fallback message is not used.
};

utilz.exportSymbol = function ( symbolPath, symbolValue, contextObject ) {
  utilz.publishPath_( symbolPath, symbolValue, contextObject ); // Delegates to the `publishPath_` function to create and export the symbol.
};

utilz.exportProperty = function ( targetObject, propertyName, propertyValue ) {
  targetObject[ propertyName ] = propertyValue; // Assigns a specific property with a given value to an object.
};

utilz.inheritFrom = function ( DerivedClass, BaseClass ) {
  // A temporary constructor function used for establishing the prototype chain.
  function TempConstructor() {
  }
  TempConstructor.prototype = BaseClass.prototype; // Point the temporary prototype to the base class's prototype.
  DerivedClass.superClass_ = BaseClass.prototype; // Store a direct reference to the super class's prototype.
  DerivedClass.prototype = new TempConstructor(); // Set the derived class's prototype to an instance of the temporary constructor.
  DerivedClass.prototype.constructor = DerivedClass; // Correct the constructor reference for the derived class's prototype.
};

utilz.callSuper = function ( instanceObj, methodName, var_args ) {
  var currentCaller = arguments.callee.caller; // Get a reference to the function that called `utilz.callSuper`.
  // If the caller has a `superClass_` property, it means it's an inherited method.
  if ( currentCaller.superClass_ ) {
    // Call the super class's constructor, passing `instanceObj` as `this`.
    return currentCaller.superClass_.constructor.apply( instanceObj, Array.prototype.slice.call( arguments, 1 ) );
  }
  var additionalArgs = Array.prototype.slice.call( arguments, 2 ); // Extract arguments intended for the super method.
  var foundCaller = false;
  var currentClass = instanceObj.constructor;
  // Traverse the prototype chain to find the correct super method to call.
  while ( currentClass ) {
    if ( currentClass.prototype[ methodName ] === currentCaller ) {
      foundCaller = true; // Found the method that called `utilz.callSuper`.
    } else {
      if ( foundCaller ) {
        // Once the caller's method is found, the next method in the chain (if it exists) is the super method.
        return currentClass.prototype[ methodName ].apply( instanceObj, additionalArgs );
      }
    }
    currentClass = currentClass.superClass_ && currentClass.superClass_.constructor;
  }
  // If the method is not found via the `superClass_` chain but exists directly on the instance's constructor prototype.
  if ( instanceObj[ methodName ] === currentCaller ) {
    return instanceObj.constructor.prototype[ methodName ].apply( instanceObj, additionalArgs );
  }
  throw Error("utilz.callSuper called from a method of one name to a method of a different name"); // Error if the super method cannot be resolved.
};

utilz.namespaceScope = function ( scopeFunction ) {
  scopeFunction.call( utilz.environment ); // Executes the provided function with the global environment as its `this` context.
};

utilz.text = {}; // Namespace for string utility functions.

utilz.text.UnicodeChars = { NON_BREAKING_SPACE: "\xA0" }; // Common Unicode characters.

utilz.text.beginsWith = function ( mainString, prefixString ) {
  return mainString.lastIndexOf( prefixString, 0 ) === 0; // Checks if a string starts with a given prefix.
};

utilz.text.endsWith = function ( mainString, suffixString ) {
  var startIndex = mainString.length - suffixString.length;
  return startIndex >= 0 && mainString.indexOf( suffixString, startIndex ) === startIndex; // Checks if a string ends with a given suffix.
};

utilz.text.caseInsensitiveBeginsWith = function ( mainString, prefixString ) {
  return utilz.text.compareCaseInsensitive( prefixString, mainString.substr( 0, prefixString.length ) ) === 0; // Case-insensitive check for starts-with.
};

utilz.text.caseInsensitiveEndsWith = function ( mainString, suffixString ) {
  return utilz.text.compareCaseInsensitive( suffixString, mainString.substr( mainString.length - suffixString.length, suffixString.length ) ) === 0; // Case-insensitive check for ends-with.
};

utilz.text.substituteTokens = function ( templateString, firstReplacement ) {
  var argIndex = 1;
  // Iterates through additional arguments, replacing placeholders in the template.
  while ( argIndex < arguments.length ) {
    var replacementValue = String( arguments[ argIndex ] ).replace(/\$/g, "$$$$"); // Escape '$' in replacement values.
    templateString = templateString.replace(/\%s/, replacementValue); // Replace the first '%s' placeholder.
    argIndex++;
  }
  return templateString; // Returns the string with all substitutions made.
};

utilz.text.compressWhitespace = function ( inputString ) {
  return inputString.replace(/[\s\xA0]+/g, " ").replace(/^\s+|\s+$/g, ""); // Replaces multiple whitespace/non-breaking spaces with a single space and trims.
};

utilz.text.isBlank = function ( inputString ) {
  return /^[\s\xA0]*$/.test( inputString ); // Checks if a string contains only whitespace or is empty.
};

utilz.text.isBlankSafe = function ( inputString ) {
  // Assumes a `makeSafe` utility exists (not provided in original, but implied).
  return utilz.text.isBlank( utilz.text.makeSafe( inputString ) ); // Checks if a "safe" version of the string is blank.
};

utilz.text.isBreakingSpace = function ( inputChar ) {
  return !/[^\t\n\r ]/.test( inputChar ); // Checks if a character is a tab, newline, carriage return, or space.
};

utilz.text.isAlphabetic = function ( inputString ) {
  return !/[^a-zA-Z]/.test( inputString ); // Checks if a string contains only alphabetic characters.
};

utilz.text.isDigitOnly = function ( inputString ) {
  return !/[^0-9]/.test( inputString ); // Checks if a string contains only numeric digits.
};

utilz.text.isAlphanumeric = function ( inputString ) {
  return !/[^a-zA-Z0-9]/.test( inputString ); // Checks if a string contains only alphanumeric characters.
};

utilz.text.isSingleSpace = function ( inputChar ) {
  return " " === inputChar; // Checks if a character is a single space.
};

utilz.text.isPrintableUnicode = function ( inputChar ) {
  return 1 === inputChar.length && " " <= inputChar && "~" >= inputChar || "\x80" <= inputChar && "\uFFFD" >= inputChar; // Checks if a character is a printable ASCII or extended Unicode character.
};

utilz.text.removeNewlines = function ( inputString ) {
  return inputString.replace(/(\r\n|\r|\n)+/g, " "); // Replaces all types of newline sequences with a single space.
};

utilz.text.standardizeNewlines = function ( inputString ) {
  return inputString.replace(/(\r\n|\r|\n)/g, "\n"); // Converts all newline types to LF (`\n`).
};

utilz.text.normalizeAllWhitespace = function ( inputString ) {
  return inputString.replace(/\xA0|\s/g, " "); // Replaces all whitespace characters (including non-breaking space) with a standard space.
};

utilz.text.standardizeSpaces = function ( inputString ) {
  return inputString.replace(/\xA0|[ \t]+/g, " "); // Replaces non-breaking spaces and multiple spaces/tabs with a single space.
};

utilz.text.compressBreakingSpaces = function ( inputString ) {
  return inputString.replace(/[\t\r\n ]+/g, " ").replace(/^[\t\r\n ]+|[\t\r\n ]+$/g, ""); // Collapses internal breaking spaces and trims leading/trailing ones.
};

utilz.text.trimString = function ( inputString ) {
  return inputString.replace(/^[\s\xA0]+|[\s\xA0]+$/g, ""); // Removes leading and trailing whitespace and non-breaking spaces.
};

utilz.text.trimLeft = function ( inputString ) {
  return inputString.replace(/^[\s\xA0]+/, ""); // Removes leading whitespace and non-breaking spaces.
};

utilz.text.trimRight = function ( inputString ) {
  return inputString.replace(/[\s\xA0]+$/, ""); // Removes trailing whitespace and non-breaking spaces.
};

utilz.text.compareCaseInsensitive = function ( stringOne, stringTwo ) {
  var lowerOne = String( stringOne ).toLowerCase();
  var lowerTwo = String( stringTwo ).toLowerCase();
  if ( lowerOne < lowerTwo ) {
    return -1;
  }
  if ( lowerOne === lowerTwo ) {
    return 0;
  }
  return 1; // Compares two strings case-insensitively.
};

utilz.text.numericComparisonPattern_ = /(\.\d+)|(\d+)|(\D+)/g; // Regular expression for natural sorting comparison.

utilz.text.compareNaturally = function ( stringOne, stringTwo ) {
  if ( stringOne === stringTwo ) {
    return 0;
  }
  if ( !stringOne ) {
    return -1;
  }
  if ( !stringTwo ) {
    return 1;
  }
  var partsA = String( stringOne ).toLowerCase().match( utilz.text.numericComparisonPattern_ );
  var partsB = String( stringTwo ).toLowerCase().match( utilz.text.numericComparisonPattern_ );
  var minLength = Math.min( partsA.length, partsB.length );
  var idx = 0;
  // Compare parts numerically if possible, otherwise as strings.
  while ( idx < minLength ) {
    var partA = partsA[ idx ];
    var partB = partsB[ idx ];
    if ( partA !== partB ) {
      var numA = parseInt( partA, 10 );
      var numB = parseInt( partB, 10 );
      if ( !isNaN( numA ) && !isNaN( numB ) && (numA - numB) ) {
        return numA - numB;
      }
      if ( partA < partB ) {
        return -1;
      }
      return 1;
    }
    idx++;
  }
  // If one string is a prefix of the other, the longer one is "greater".
  if ( partsA.length !== partsB.length ) {
    return partsA.length - partsB.length;
  }
  // Fallback to standard string comparison if all parts are equal.
  if ( stringOne < stringTwo ) {
    return -1;
  }
  return 1;
};

utilz.text.encodeUrlComponent = function ( rawString ) {
  return encodeURIComponent( String( rawString ) ); // Encodes a string for use as a URL component.
};

utilz.text.decodeUrlComponent = function ( encodedString ) {
  return decodeURIComponent( encodedString.replace(/\+/g, " ") ); // Decodes a URL component string, handling '+' as spaces.
};

utilz.text.newlinesToBr = function ( inputString, useXhtml ) {
  return inputString.replace(/(\r\n|\r|\n)/g, useXhtml ? "<br />" : "<br>"); // Converts newline characters to HTML `<br>` tags.
};

utilz.text.escapeHtmlEntities = function ( rawHtmlString, preserveQuotes ) {
  if ( preserveQuotes ) {
    // Escapes all common HTML entities including quotes.
    return rawHtmlString.replace( utilz.text.ampersandRegex_, "&amp;" )
                        .replace( utilz.text.lessThanRegex_, "&lt;" )
                        .replace( utilz.text.greaterThanRegex_, "&gt;" )
                        .replace( utilz.text.quoteRegex_, "&quot;" );
  }
  // If no HTML entities are present, return the original string for performance.
  if ( !utilz.text.allHtmlEntitiesRegex_.test( rawHtmlString ) ) {
    return rawHtmlString;
  }
  // Perform replacements only for characters that are actually present.
  if ( rawHtmlString.indexOf("&") !== -1 ) {
    rawHtmlString = rawHtmlString.replace( utilz.text.ampersandRegex_, "&amp;" );
  }
  if ( rawHtmlString.indexOf("<") !== -1 ) {
    rawHtmlString = rawHtmlString.replace( utilz.text.lessThanRegex_, "&lt;" );
  }
  if ( rawHtmlString.indexOf(">") !== -1 ) {
    rawHtmlString = rawHtmlString.replace( utilz.text.greaterThanRegex_, "&gt;" );
  }
  // This part of the original logic is specific; quotes are escaped even without `preserveQuotes`
  // if `allHtmlEntitiesRegex_` matches and `"` is found.
  if ( rawHtmlString.indexOf('"') !== -1 ) {
    rawHtmlString = rawHtmlString.replace( utilz.text.quoteRegex_, "&quot;" );
  }
  return rawHtmlString; // Returns the HTML-escaped string.
};

utilz.text.ampersandRegex_ = /&/g; // Regex for ampersand character.
utilz.text.lessThanRegex_ = /</g; // Regex for less-than character.
utilz.text.greaterThanRegex_ = />/g; // Regex for greater-than character.
utilz.text.quoteRegex_ = /"/g; // Regex for double quote character.
utilz.text.allHtmlEntitiesRegex_ = /[&<>"']/g; // Regex to quickly check for any common HTML entity characters.