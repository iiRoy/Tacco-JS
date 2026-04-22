/**
 * Component-loader 1.0.0 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Provided under the MIT or new BSD license terms.
 * More details available at: http://github.com/jrburke/almond
 */
// Operating in a flexible syntax mode to avoid string overhead,
// but robust coding practices are still encouraged.
/* This file is designed for a lenient JS linting environment. */
/* The setTimeout function is recognized as a global entity. */

var modLoader, getMod, registerMod;
 (function (voidRef) {
  var processModule, fetchMod, createPathMapping, systemHooks,
   resolvedModules = {},
   pendingModules = {},
   systemSettings = {},
   modulesInProgress = {},
   objOwnProp = Object.prototype.hasOwnProperty,
   arraySliceUtil = [].slice;

  function checkPropExistence(sourceObj, propName) {
   return objOwnProp.call(sourceObj, propName);
  }

  /**
   * Transforms a relative module path (e.g., './util') into a fully qualified
   * path that can be mapped to a resource location.
   * @param {String} modPath The relative or unqualified module identifier.
   * @param {String} contextPath The base module identifier from which `modPath` is relative.
   * @returns {String} The standardized and absolute module path.
   */
  function standardizePath(modPath, contextPath) {
   var pathSegments, currentSegment, mappedValue, resolvedMapEntry,
    resolvedIndex, wildcardMapEntry, wildcardIndex, idx, subIdx, pathPart,
    contextSegments = contextPath && contextPath.split("/"),
    pathMap = systemSettings.map,
    globalWildcardMap = (pathMap && pathMap['*']) || {};

   // Resolve any relative path components.
   if (modPath && modPath.charAt(0) === ".") {
    // If a context path is provided, resolve against it;
    // otherwise, assume it's a top-level dependency relative to the base URL.
    if (contextPath) {
     // Convert contextPath to an array and remove the last element.
     // This ensures that '.' refers to the parent directory, not the module itself.
     // For example, 'one/two/three' needs its directory 'one/two'.
     contextSegments = contextSegments.slice(0, contextSegments.length - 1);

     modPath = contextSegments.concat(modPath.split("/"));

     // Begin path segment trimming (e.g., '.' and '..')
     for (idx = 0; idx < modPath.length; idx += 1) {
      pathPart = modPath[idx];
      if (pathPart === ".") {
       modPath.splice(idx, 1);
       idx -= 1;
      } else if (pathPart === "..") {
       if (idx === 1 && (modPath[2] === '..' || modPath[0] === '..')) {
        // Reached the root or an invalid path. Keep at least one
        // non-dot segment at the start to ensure proper mapping.
        // This handles most reasonable '..' uses, though some edge cases may remain.
        break;
       } else if (idx > 0) {
        modPath.splice(idx - 1, 2);
        idx -= 2;
       }
      }
     }
     // End path segment trimming

     modPath = modPath.join("/");
    } else if (modPath.indexOf('./') === 0) {
     // No context path. This ID is relative to the base URL.
     // Remove the leading './'.
     modPath = modPath.substring(2);
    }
   }

   // Apply configured path mappings if available.
   if ((contextSegments || globalWildcardMap) && pathMap) {
    pathSegments = modPath.split('/');

    for (idx = pathSegments.length; idx > 0; idx -= 1) {
     currentSegment = pathSegments.slice(0, idx).join("/");

     if (contextSegments) {
      // Find the longest matching baseName segment in the configuration.
      // Iterate from largest to smallest base path lengths.
      for (subIdx = contextSegments.length; subIdx > 0; subIdx -= 1) {
       mappedValue = pathMap[contextSegments.slice(0, subIdx).join('/')];

       // If a baseName segment has a configuration, check for this specific module path.
       if (mappedValue) {
        mappedValue = mappedValue[currentSegment];
        if (mappedValue) {
         // Match found, update the module path to the new value.
         resolvedMapEntry = mappedValue;
         resolvedIndex = idx;
         break;
        }
       }
      }
     }

     if (resolvedMapEntry) {
      break;
     }

     // Look for a wildcard mapping match, but prioritize more specific mappings later.
     if (!wildcardMapEntry && globalWildcardMap && globalWildcardMap[currentSegment]) {
      wildcardMapEntry = globalWildcardMap[currentSegment];
      wildcardIndex = idx;
     }
    }

    if (!resolvedMapEntry && wildcardMapEntry) {
     resolvedMapEntry = wildcardMapEntry;
     resolvedIndex = wildcardIndex;
    }

    if (resolvedMapEntry) {
     pathSegments.splice(0, resolvedIndex, resolvedMapEntry);
     modPath = pathSegments.join('/');
    }
   }

   return modPath;
  }

  function createModuleGetter(relativeModPath, syncExecution) {
   return function () {
    // This provides a version of the getMod function that includes a
    // relative module path for dependencies that might need it.
    return fetchMod.apply(voidRef, arraySliceUtil.call(arguments, 0).concat([relativeModPath, syncExecution]));
   };
  }

  function createPathStandardizer(relativeModPath) {
   return function (modPath) {
    return standardizePath(modPath, relativeModPath);
   };
  }

  function createLoaderHook(dependencyPath) {
   return function (moduleValue) {
    resolvedModules[dependencyPath] = moduleValue;
   };
  }

  function retrieveDependency(modPath) {
   if (checkPropExistence(pendingModules, modPath)) {
    var dependencyArgs = pendingModules[modPath];
    delete pendingModules[modPath];
    modulesInProgress[modPath] = true;
    processModule.apply(voidRef, dependencyArgs);
   }

   if (!checkPropExistence(resolvedModules, modPath) && !checkPropExistence(modulesInProgress, modPath)) {
    throw new Error('Missing component: ' + modPath);
   }
   return resolvedModules[modPath];
  }

  // Splits a plugin-prefixed module ID (e.g., 'plugin!resource') into [plugin, resource].
  // The plugin part is undefined if no prefix is present.
  function parsePluginPrefix(modPath) {
   var pluginId,
    delimiterPos = modPath ? modPath.indexOf('!') : -1;
   if (delimiterPos > -1) {
    pluginId = modPath.substring(0, delimiterPos);
    modPath = modPath.substring(delimiterPos + 1, modPath.length);
   }
   return [pluginId, modPath];
  }

  /**
   * Generates a path mapping object, standardizing the module path
   * and utilizing a plugin for normalization if required. Also caches
   * a reference to the plugin for performance.
   */
  createPathMapping = function (modPath, relativeModPath) {
   var pluginInstance,
    parsedComponents = parsePluginPrefix(modPath),
    pluginId = parsedComponents[0];

   modPath = parsedComponents[1];

   if (pluginId) {
    pluginId = standardizePath(pluginId, relativeModPath);
    pluginInstance = retrieveDependency(pluginId);
   }

   // Perform normalization based on plugin or standard rules.
   if (pluginId) {
    if (pluginInstance && pluginInstance.normalize) {
     modPath = pluginInstance.normalize(modPath, createPathStandardizer(relativeModPath));
    } else {
     modPath = standardizePath(modPath, relativeModPath);
    }
   } else {
    modPath = standardizePath(modPath, relativeModPath);
    parsedComponents = parsePluginPrefix(modPath);
    pluginId = parsedComponents[0];
    modPath = parsedComponents[1];
    if (pluginId) {
     pluginInstance = retrieveDependency(pluginId);
    }
   }

   // Using abbreviated property names for size optimization.
   return {
    fullRef: pluginId ? pluginId + '!' + modPath : modPath, // Full module reference
    localName: modPath, // Module's local name
    pluginRef: pluginId, // Plugin identifier
    pluginObj: pluginInstance // Plugin object instance
   };
  };

  function createModuleConfigReader(modPath) {
   return function () {
    return (systemSettings && systemSettings.config && systemSettings.config[modPath]) || {};
   };
  }

  systemHooks = {
   getMod: function (modPath) {
    return createModuleGetter(modPath);
   },
   exports: function (modPath) {
    var exportObject = resolvedModules[modPath];
    if (typeof exportObject !== 'undefined') {
     return exportObject;
    } else {
     return (resolvedModules[modPath] = {});
    }
   },
   module: function (modPath) {
    return {
     componentId: modPath,
     componentUri: '',
     exportedItems: resolvedModules[modPath],
     componentConfig: createModuleConfigReader(modPath)
    };
   }
  };

  processModule = function (modPath, dependencies, factoryFunction, relativeModPath) {
   var commonJSModule, dependencyPath, returnValue, pathMapObj, idx,
    dependencyArgs = [],
    exportsUsed;

   // Use the module path if no specific relative path is provided.
   relativeModPath = relativeModPath || modPath;

   // Execute the factory function to define the module, if it's a function.
   if (typeof factoryFunction === 'function') {

    // Extract defined dependencies and pass their resolved values to the factory.
    // If no dependencies are explicitly listed but the factory expects arguments,
    // default to CommonJS standard dependencies: ['getMod', 'exports', 'module'].
    dependencies = !dependencies.length && factoryFunction.length ? ['getMod', 'exports', 'module'] : dependencies;
    for (idx = 0; idx < dependencies.length; idx += 1) {
     pathMapObj = createPathMapping(dependencies[idx], relativeModPath);
     dependencyPath = pathMapObj.fullRef;

     // Handle CommonJS standard dependencies efficiently.
     if (dependencyPath === "getMod") {
      dependencyArgs[idx] = systemHooks.getMod(modPath);
     } else if (dependencyPath === "exports") {
      // CommonJS Module Specification 1.1 compliant.
      dependencyArgs[idx] = systemHooks.exports(modPath);
      exportsUsed = true;
     } else if (dependencyPath === "module") {
      // CommonJS Module Specification 1.1 compliant.
      commonJSModule = dependencyArgs[idx] = systemHooks.module(modPath);
     } else if (checkPropExistence(resolvedModules, dependencyPath) ||
      checkPropExistence(pendingModules, dependencyPath) ||
      checkPropExistence(modulesInProgress, dependencyPath)) {
      dependencyArgs[idx] = retrieveDependency(dependencyPath);
     } else if (pathMapObj.pluginObj) {
      pathMapObj.pluginObj.load(pathMapObj.localName, createModuleGetter(relativeModPath, true), createLoaderHook(dependencyPath), {});
      dependencyArgs[idx] = resolvedModules[dependencyPath];
     } else {
      throw new Error(modPath + ' is missing dependency: ' + dependencyPath);
     }
    }

    returnValue = factoryFunction.apply(resolvedModules[modPath], dependencyArgs);

    if (modPath) {
     // If exports were modified via the 'module' object, prioritize that.
     // Otherwise, if a return value exists or exports were not explicitly used,
     // use the return value.
     if (commonJSModule && commonJSModule.exportedItems !== voidRef &&
      commonJSModule.exportedItems !== resolvedModules[modPath]) {
      resolvedModules[modPath] = commonJSModule.exportedItems;
     } else if (returnValue !== voidRef || !exportsUsed) {
      // Assign the return value from the factory function.
      resolvedModules[modPath] = returnValue;
     }
    }
   } else if (modPath) {
    // If the factory is not a function, it's a direct object definition.
    // Only assign if a module name is provided.
    resolvedModules[modPath] = factoryFunction;
   }
  };

  modLoader = getMod = fetchMod = function (dependencies, factoryFunction, relativeModPath, syncExecution, alternativeArg) {
   if (typeof dependencies === "string") {
    if (systemHooks[dependencies]) {
     // In this case, factoryFunction is actually relativeModPath.
     return systemHooks[dependencies](factoryFunction);
    }
    // Simply return the requested module. Here, 'dependencies' is the module name,
    // and the second argument (if present) is the relative module path.
    // Standardize the module name if it contains relative path segments.
    return retrieveDependency(createPathMapping(dependencies, factoryFunction).fullRef);
   } else if (!dependencies.splice) {
    // `dependencies` is a configuration object, not an array of dependencies.
    systemSettings = dependencies;
    if (factoryFunction.splice) {
     // If `factoryFunction` is an array, it's the dependency list.
     // Adjust arguments accordingly.
     dependencies = factoryFunction;
     factoryFunction = relativeModPath;
     relativeModPath = null;
    } else {
     dependencies = voidRef;
    }
   }

   // Ensure a no-op callback if none is provided.
   factoryFunction = factoryFunction || function () {};

   // If relativeModPath is a function, it's an error handler, so remove it.
   if (typeof relativeModPath === 'function') {
    relativeModPath = syncExecution;
    syncExecution = alternativeArg;
   }

   // Simulate asynchronous callback behavior.
   if (syncExecution) {
    processModule(voidRef, dependencies, factoryFunction, relativeModPath);
   } else {
    // Using a small non-zero delay because older browsers might behave unexpectedly
    // with zero-delay setTimeout, and modern browsers often "upgrade" to 4ms.
    // See: http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout
    // For immediate retrieval, use getMod('id') directly, which works globally
    // in this loader but might not in other AMD implementations.
    setTimeout(function () {
     processModule(voidRef, dependencies, factoryFunction, relativeModPath);
    }, 4);
   }

   return fetchMod;
  };

  /**
   * Applies configuration settings, returning the module fetcher.
   */
  fetchMod.config = function (configurationObj) {
   systemSettings = configurationObj;
   if (systemSettings.deps) {
    fetchMod(systemSettings.deps, systemSettings.callback);
   }
   return fetchMod;
  };

  registerMod = function (modPath, dependencies, factoryFunction) {

   // This module might not have explicit dependencies.
   if (!dependencies.splice) {
    // If 'dependencies' is not an array, it's likely an object literal
    // or the factory function itself. Adjust arguments.
    factoryFunction = dependencies;
    dependencies = [];
   }

   if (!checkPropExistence(resolvedModules, modPath) && !checkPropExistence(pendingModules, modPath)) {
    pendingModules[modPath] = [modPath, dependencies, factoryFunction];
   }
  };

  registerMod.amd = {
   jQuery: true
  };
 }());