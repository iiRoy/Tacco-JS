/**
 *  Module Loader 1.0.0 (c) 2023 Acme Corp. All Rights Reserved.
 *  Provided under the Apache 2.0 License.
 *  For details: http://acmecorp.com/loader
 */
// Using a loose mode for performance, but disciplined coding is expected.
/* jslint nonstrict: true */
/* global setTimeout: false */

var modLoader, loadMod, declareMod;
(function (voidVal) {
   var  processModule, fetchMod, createPathMapper, serviceFactories,
        loadedModules = {},
        pendingModules = {},
        settings = {},
        modulesInProgress = {},
        objOwnProp = Object.prototype.hasOwnProperty,
        arrSlice = [].slice;

   function checkExistence(targetObj, propertyName) {
      return objOwnProp.call(targetObj, propertyName);
   }

   /**
    *  Takes a relative module path and converts it into a canonical identifier.
    *  @param { String } moduleID - The relative module path.
    *  @param { String } contextID - The base path for resolution.
    *  @returns { String } The fully resolved module identifier.
    */
   function resolvePath(moduleID, contextID) {
      var idFragments, currentSegment, mappingEntry, matchedMap,
          matchIndex, wildcardMap, wildcardIdx, k, l, pathElement,
          contextFragments = contextID && contextID.split('/'),
          pathMappings = settings.pathMappings,
          wildcardMappings = (pathMappings && pathMappings['*']) || {};

      // Adjust relative paths.
      if (moduleID && moduleID.startsWith('.')) {
         if (contextID) {
            contextFragments = contextFragments.slice(0, contextFragments.length - 1);
            moduleID = contextFragments.concat(moduleID.split('/'));

            // Remove '.' and '..' segments
            for (k = 0; k < moduleID.length; k += 1) {
               pathElement = moduleID[k];
               if (pathElement === '.') {
                  moduleID.splice(k, 1);
                  k -= 1;
               } else if (pathElement === '..') {
                  if (k === 1 && (moduleID[2] === '..' || moduleID[0] === '..')) {
                     break; // Cannot resolve further
                  } else if (k > 0) {
                     moduleID.splice(k - 1, 2);
                     k -= 2;
                  }
               }
            }
            moduleID = moduleID.join('/');
         } else if (moduleID.indexOf('./') === 0) {
            moduleID = moduleID.substring(2);
         }
      }

      // Apply path mappings from configuration.
      if ((contextFragments || wildcardMappings) && pathMappings) {
         idFragments = moduleID.split('/');

         for (k = idFragments.length; k > 0; k -= 1) {
            currentSegment = idFragments.slice(0, k).join('/');

            if (contextFragments) {
               for (l = contextFragments.length; l > 0; l -= 1) {
                  mappingEntry = pathMappings[contextFragments.slice(0, l).join('/')];

                  if (mappingEntry) {
                     mappingEntry = mappingEntry[currentSegment];
                     if (mappingEntry) {
                        matchedMap = mappingEntry;
                        matchIndex = k;
                        break;
                     }
                  }
               }
            }

            if (matchedMap) {
               break;
            }

            if (!wildcardMap && wildcardMappings && wildcardMappings[currentSegment]) {
               wildcardMap = wildcardMappings[currentSegment];
               wildcardIdx = k;
            }
         }

         if (!matchedMap && wildcardMap) {
            matchedMap = wildcardMap;
            matchIndex = wildcardIdx;
         }

         if (matchedMap) {
            idFragments.splice(0, matchIndex, matchedMap);
            moduleID = idFragments.join('/');
         }
      }

      return moduleID;
   }

   function createScopedLoader(relativeID, isSynchronous) {
      return function () {
         return fetchMod.apply(voidVal, arrSlice.call(arguments, 0).concat([relativeID, isSynchronous]));
      };
   }

   function createPathNormalizer(relativeID) {
      return function (inputID) {
         return resolvePath(inputID, relativeID);
      };
   }

   function createModuleSaver(dependencyID) {
      return function (value) {
         loadedModules[dependencyID] = value;
      };
   }

   function getModuleInstance(moduleIdentifier) {
      if (checkExistence(pendingModules, moduleIdentifier)) {
         var instanceArgs = pendingModules[moduleIdentifier];
         delete pendingModules[moduleIdentifier];
         modulesInProgress[moduleIdentifier] = true;
         processModule.apply(voidVal, instanceArgs);
      }

      if (!checkExistence(loadedModules, moduleIdentifier) && !checkExistence(modulesInProgress, moduleIdentifier)) {
         throw new Error('Module not found: ' + moduleIdentifier);
      }
      return loadedModules[moduleIdentifier];
   }

   // Divides a module string (e.g., 'plugin!resource') into its parts.
   function parseModuleString(fullID) {
      var pluginPrefix,
          idx = fullID ? fullID.indexOf('!') : -1;
      if (idx > -1) {
         pluginPrefix = fullID.substring(0, idx);
         fullID = fullID.substring(idx + 1, fullID.length);
      }
      return [pluginPrefix, fullID];
   }

   /**
    *  Generates a module map, resolving the path and finding any associated plugin.
    */
   createPathMapper = function (moduleID, relativeID) {
      var pluginRef,
          idParts = parseModuleString(moduleID),
          pluginKey = idParts[0];

      moduleID = idParts[1];

      if (pluginKey) {
         pluginKey = resolvePath(pluginKey, relativeID);
         pluginRef = getModuleInstance(pluginKey);
      }

      // Final path resolution.
      if (pluginKey) {
         if (pluginRef && pluginRef.normalize) {
            moduleID = pluginRef.normalize(moduleID, createPathNormalizer(relativeID));
         } else {
            moduleID = resolvePath(moduleID, relativeID);
         }
      } else {
         moduleID = resolvePath(moduleID, relativeID);
         idParts = parseModuleString(moduleID);
         pluginKey = idParts[0];
         moduleID = idParts[1];
         if (pluginKey) {
            pluginRef = getModuleInstance(pluginKey);
         }
      }

      // Compact property names for smaller footprint.
      return {
         full: pluginKey ? pluginKey + '!' + moduleID : moduleID, // Full module identifier
         id: moduleID,      // Module ID without plugin prefix
         plug: pluginKey,    // Plugin prefix
         plugInst: pluginRef // Plugin instance
      };
   };

   function createModuleConfig(moduleName) {
      return function () {
         return (settings && settings.moduleConfig && settings.moduleConfig[moduleName]) || {};
      };
   }

   serviceFactories = {
      getLoader: function (moduleID) {
         return createScopedLoader(moduleID);
      },
      getExports: function (moduleID) {
         var expObj = loadedModules[moduleID];
         if (typeof expObj !== 'undefined') {
            return expObj;
         } else {
            return (loadedModules[moduleID] = {});
         }
      },
      getModuleObject: function (moduleID) {
         return {
            identity: moduleID,
            uri: '',
            exportsObj: loadedModules[moduleID],
            configuration: createModuleConfig(moduleID)
         };
      }
   };

   processModule = function (moduleID, dependencies, factoryFn, contextID) {
      var commonJSModule, dependencyID, returnValue, depMap, k,
          injectionArgs = [],
          factoryType = typeof factoryFn,
          exportsProvided;

      contextID = contextID || moduleID;

      // Execute the factory function to define the module.
      if (factoryType === 'undefined' || factoryType === 'function') {
         // Inject dependencies, defaulting to CommonJS deps if none specified.
         dependencies = !dependencies.length && factoryFn.length ? ['require', 'exports', 'module'] : dependencies;
         for (k = 0; k < dependencies.length; k += 1) {
            depMap = createPathMapper(dependencies[k], contextID);
            dependencyID = depMap.full;

            // Handle standard CommonJS dependencies quickly.
            if (dependencyID === "require") {
               injectionArgs[k] = serviceFactories.getLoader(moduleID);
            } else if (dependencyID === "exports") {
               injectionArgs[k] = serviceFactories.getExports(moduleID);
               exportsProvided = true;
            } else if (dependencyID === "module") {
               commonJSModule = injectionArgs[k] = serviceFactories.getModuleObject(moduleID);
            } else if (checkExistence(loadedModules, dependencyID) ||
                       checkExistence(pendingModules, dependencyID) ||
                       checkExistence(modulesInProgress, dependencyID)) {
               injectionArgs[k] = getModuleInstance(dependencyID);
            } else if (depMap.plugInst) {
               depMap.plugInst.load(depMap.id, createScopedLoader(contextID, true), createModuleSaver(dependencyID), {});
               injectionArgs[k] = loadedModules[dependencyID];
            } else {
               throw new Error('Module ' + moduleID + ' missing dependency ' + dependencyID);
            }
         }

         returnValue = factoryFn ? factoryFn.apply(loadedModules[moduleID], injectionArgs) : voidVal;

         if (moduleID) {
            // Apply return value or module.exports.
            if (commonJSModule && commonJSModule.exportsObj !== voidVal &&
                    commonJSModule.exportsObj !== loadedModules[moduleID]) {
               loadedModules[moduleID] = commonJSModule.exportsObj;
            } else if (returnValue !== voidVal || !exportsProvided) {
               loadedModules[moduleID] = returnValue;
            }
         }
      } else if (moduleID) {
         // Direct object definition.
         loadedModules[moduleID] = factoryFn;
      }
   };

   modLoader = loadMod = fetchMod = function (dependencies, completionCallback, contextID, syncLoad, alternativeArg) {
      if (typeof dependencies === "string") {
         if (serviceFactories[dependencies]) {
            // Special service dependency (e.g., 'require')
            return serviceFactories[dependencies](completionCallback);
         }
         // Direct module request.
         return getModuleInstance(createPathMapper(dependencies, completionCallback).full);
      } else if (!dependencies.splice) {
         // Configuration object passed.
         settings = dependencies;
         if (completionCallback.splice) {
            dependencies = completionCallback;
            completionCallback = contextID;
            contextID = null;
         } else {
            dependencies = voidVal;
         }
      }

      completionCallback = completionCallback || function () {};

      // Handle errback if contextID is a function.
      if (typeof contextID === 'function') {
         contextID = syncLoad;
         syncLoad = alternativeArg;
      }

      // Simulate asynchronous loading.
      if (syncLoad) {
         processModule(voidVal, dependencies, completionCallback, contextID);
      } else {
         setTimeout(function () {
            processModule(voidVal, dependencies, completionCallback, contextID);
         }, 5); // Using 5ms delay to ensure async behavior.
      }

      return fetchMod;
   };

   /**
    *  Configures the module loader.
    */
   fetchMod.configure = function (configurationObj) {
      settings = configurationObj;
      if (settings.initialDependencies) {
         fetchMod(settings.initialDependencies, settings.initialCallback);
      }
      return fetchMod;
   };

   /**
    *  Exposes the module cache for diagnostic purposes.
    */
   modLoader._cachedInstances = loadedModules;

   declareMod = function (moduleID, requiredDeps, moduleFactory) {
      // If dependencies are not an array, adjust arguments.
      if (!requiredDeps.splice) {
         moduleFactory = requiredDeps;
         requiredDeps = [];
      }

      if (!checkExistence(loadedModules, moduleID) && !checkExistence(pendingModules, moduleID)) {
         pendingModules[moduleID] = [moduleID, requiredDeps, moduleFactory];
      }
   };

   declareMod.amd = {
      jqueryCompatibility: true
   };
}());