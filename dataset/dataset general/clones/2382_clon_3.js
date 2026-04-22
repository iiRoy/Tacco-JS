var modLoader, getModule, setModule;
(function (void0) {
    let processModuleDefinition, fetchModule, createModuleMap, coreDependencies;
    let resolvedModules = {};
    let pendingDefinitions = {};
    let loaderConfiguration = {};
    let modulesInProgress = {};
    const objProtoHasOwn = Object.prototype.hasOwnProperty;
    const arraySlice = Array.prototype.slice;

    /**
     * Checks if an object possesses a specific property directly (not via prototype chain).
     * @param {Object} targetObject - The object to inspect.
     * @param {string} propertyKey - The name of the property to check for.
     * @returns {boolean} True if the property exists directly on the object, false otherwise.
     */
    function checkOwnProp(targetObject, propertyKey) {
        return objProtoHasOwn.call(targetObject, propertyKey);
    }

    /**
     * Transforms a relative module path into an absolute, canonical path.
     * Handles '.' and '..' segments, and applies loader configuration mappings.
     * @param {string} modulePath - The path to normalize.
     * @param {string} [basePath] - The base path to resolve relative paths against.
     * @returns {string} The fully normalized module path.
     */
    function standardizeModuleName(modulePath, basePath) {
        let pathSegments, currentSegment, mappedValue,
            foundMapping, mappingIdx, foundStarMapping, starMappingIdx,
            idxA, idxB, segmentPart;

        const baseSegments = basePath ? basePath.split('/') : [];
        const configMap = loaderConfiguration.map || {};
        const globalStarMap = configMap['*'] || {};

        // Process relative path indicators ('.', '..')
        if (modulePath && modulePath.startsWith('.')) {
            if (basePath) {
                // Remove the last segment from baseSegments to treat it as a directory.
                // E.g., 'one/two/three' -> ['one', 'two'] for resolution.
                baseSegments.pop();
                modulePath = baseSegments.concat(modulePath.split('/')).join('/');
            } else if (modulePath.startsWith('./')) {
                // If no basePath, but starts with './', just remove the leading './'.
                modulePath = modulePath.substring(2);
            }

            // Clean up '.' and '..' segments within the path.
            const finalSegments = [];
            const pathParts = modulePath.split('/');
            for (idxA = 0; idxA < pathParts.length; idxA += 1) {
                segmentPart = pathParts[idxA];
                if (segmentPart === '.') {
                    // Skip '.' segments
                    continue;
                } else if (segmentPart === '..') {
                    // Navigate up one level, unless at the root, or if previous segment was '..'.
                    if (finalSegments.length > 0 && finalSegments[finalSegments.length - 1] !== '..') {
                        finalSegments.pop();
                    } else {
                        // If we're at the beginning or previous was '..', keep '..'
                        finalSegments.push('..');
                    }
                } else {
                    finalSegments.push(segmentPart);
                }
            }
            modulePath = finalSegments.join('/');
        }

        // Apply loaderConfiguration mappings if available.
        if ((baseSegments.length > 0 || Object.keys(globalStarMap).length > 0) && Object.keys(configMap).length > 0) {
            pathSegments = modulePath.split('/');

            for (idxA = pathSegments.length; idxA > 0; idxA -= 1) {
                currentSegment = pathSegments.slice(0, idxA).join('/');

                if (baseSegments.length > 0) {
                    // Search for the longest matching base path in the configuration.
                    for (idxB = baseSegments.length; idxB > 0; idxB -= 1) {
                        const baseMapKey = baseSegments.slice(0, idxB).join('/');
                        const baseMapEntry = configMap[baseMapKey];

                        if (baseMapEntry) {
                            mappedValue = baseMapEntry[currentSegment];
                            if (mappedValue) {
                                foundMapping = mappedValue;
                                mappingIdx = idxA;
                                break;
                            }
                        }
                    }
                }

                if (foundMapping) {
                    break;
                }

                // If no direct base mapping, check for a global star map match.
                // Prioritize direct matches over star matches.
                if (!foundStarMapping && globalStarMap[currentSegment]) {
                    foundStarMapping = globalStarMap[currentSegment];
                    starMappingIdx = idxA;
                }
            }

            // Apply the best found mapping.
            if (!foundMapping && foundStarMapping) {
                foundMapping = foundStarMapping;
                mappingIdx = starMappingIdx;
            }

            if (foundMapping) {
                pathSegments.splice(0, mappingIdx, foundMapping);
                modulePath = pathSegments.join('/');
            }
        }

        return modulePath;
    }

    /**
     * Generates a module fetcher function, bound to a specific module context.
     * @param {string} contextModuleName - The name of the module from which this fetcher is invoked.
     * @param {boolean} [isSyncRequest] - Flag indicating if a synchronous fetch is preferred.
     * @returns {Function} A function that behaves like 'getModule' but with context.
     */
    function createBoundFetcher(contextModuleName, isSyncRequest) {
        return function () {
            // This function wraps the main module fetcher, passing along the contextual name.
            return fetchModule.apply(void0, arraySlice.call(arguments).concat([contextModuleName, isSyncRequest]));
        };
    }

    /**
     * Creates a module name normalizer function, bound to a specific module context.
     * @param {string} contextModuleName - The module name to resolve relative paths against.
     * @returns {Function} A function that normalizes module names relative to `contextModuleName`.
     */
    function createBoundNormalizer(contextModuleName) {
        return function (targetName) {
            return standardizeModuleName(targetName, contextModuleName);
        };
    }

    /**
     * Creates a function to store a resolved module's value.
     * @param {string} moduleName - The name of the module to store.
     * @returns {Function} A function that accepts a value and assigns it to `resolvedModules[moduleName]`.
     */
    function createModuleSetter(moduleName) {
        return function (moduleValue) {
            resolvedModules[moduleName] = moduleValue;
        };
    }

    /**
     * Retrieves a module's value, handling pending definitions and error states.
     * @param {string} moduleIdentifier - The full identifier of the module to retrieve.
     * @returns {*} The resolved module value.
     * @throws {Error} If the module is not found or not yet defined.
     */
    function retrieveDependency(moduleIdentifier) {
        if (checkOwnProp(pendingDefinitions, moduleIdentifier)) {
            const definitionArgs = pendingDefinitions[moduleIdentifier];
            delete pendingDefinitions[moduleIdentifier];
            modulesInProgress[moduleIdentifier] = true;
            processModuleDefinition.apply(void0, definitionArgs);
        }

        if (!checkOwnProp(resolvedModules, moduleIdentifier) && !checkOwnProp(modulesInProgress, moduleIdentifier)) {
            throw new Error(`Module not available: ${moduleIdentifier}`);
        }
        return resolvedModules[moduleIdentifier];
    }

    // Splits a module name like 'plugin!resource' into its components.
    // Returns an array [pluginName, resourceName].
    function parsePluginResource(compoundName) {
        let pluginIdentifier,
            separatorIndex = compoundName ? compoundName.indexOf('!') : -1;
        if (separatorIndex > -1) {
            pluginIdentifier = compoundName.substring(0, separatorIndex);
            compoundName = compoundName.substring(separatorIndex + 1);
        }
        return [pluginIdentifier, compoundName];
    }

    /**
     * Generates a module map object, normalizing the name and resolving any plugin.
     * @param {string} moduleName - The module name to map.
     * @param {string} [relativeTo] - The module name to resolve relative paths against.
     * @returns {Object} An object containing the full name, name, plugin prefix, and plugin reference.
     */
    createModuleMap = function (moduleName, relativeTo) {
        let pluginRef;
        let [prefix, nameComponent] = parsePluginResource(moduleName);

        if (prefix) {
            prefix = standardizeModuleName(prefix, relativeTo);
            pluginRef = retrieveDependency(prefix); // Get the plugin module itself
        }

        // Normalize the module name, potentially using the plugin's custom normalizer.
        if (prefix) {
            if (pluginRef && pluginRef.normalize) {
                nameComponent = pluginRef.normalize(nameComponent, createBoundNormalizer(relativeTo));
            } else {
                nameComponent = standardizeModuleName(nameComponent, relativeTo);
            }
        } else {
            // If no plugin prefix initially, just normalize the name.
            nameComponent = standardizeModuleName(nameComponent, relativeTo);
            // Re-check for a plugin prefix after normalization, as it might have been added by a map config.
            [prefix, nameComponent] = parsePluginResource(nameComponent);
            if (prefix) {
                pluginRef = retrieveDependency(prefix);
            }
        }

        // Return a compact object representing the module's mapped details.
        return {
            full: prefix ? `${prefix}!${nameComponent}` : nameComponent, // The complete, resolved module ID.
            base: nameComponent, // The resource part of the module ID.
            pluginId: prefix, // The plugin part of the module ID.
            pluginInst: pluginRef // The actual plugin module instance.
        };
    };

    /**
     * Creates a function to access configuration specific to a given module.
     * @param {string} moduleKey - The name of the module.
     * @returns {Function} A function that returns the module's configuration object.
     */
    function createModuleConfigReader(moduleKey) {
        return function () {
            // Safely access nested configuration.
            return (loaderConfiguration && loaderConfiguration.config && loaderConfiguration.config[moduleKey]) || {};
        };
    }

    // Standard core dependencies provided by the loader.
    coreDependencies = {
        require: function (requiringModuleName) {
            return createBoundFetcher(requiringModuleName);
        },
        exports: function (exportingModuleName) {
            // Return existing exports or initialize an empty object for them.
            if (resolvedModules[exportingModuleName] !== void0) {
                return resolvedModules[exportingModuleName];
            } else {
                return (resolvedModules[exportingModuleName] = {});
            }
        },
        module: function (moduleKey) {
            return {
                id: moduleKey,
                uri: '', // URI is not directly used/generated in this simplified loader.
                exports: resolvedModules[moduleKey], // Reference to the module's exports object.
                config: createModuleConfigReader(moduleKey)
            };
        }
    };

    /**
     * The central function for processing and defining modules.
     * This is invoked when a module's dependencies are ready or it's being defined directly.
     * @param {string} moduleIdentifier - The unique name of the module being processed.
     * @param {Array<string>} dependencyList - An array of module names that this module depends on.
     * @param {Function|Object} definitionCallback - The module definition function or object.
     * @param {string} [contextualName] - The name of the module from which this definition was initiated.
     */
    processModuleDefinition = function (moduleIdentifier, dependencyList, definitionCallback, contextualName) {
        let commonJSModuleRef, dependencyName, resolvedMap, argIndex,
            callbackArguments = [],
            isUsingExports = false;

        // Use the moduleIdentifier as contextualName if not explicitly provided.
        contextualName = contextualName || moduleIdentifier;

        // Execute the definitionCallback if it's a function.
        if (typeof definitionCallback === 'function') {
            // If no explicit dependencyList, infer from callback function's arity.
            const depsToResolve = (!dependencyList || dependencyList.length === 0) && definitionCallback.length ?
                                  ['require', 'exports', 'module'] : dependencyList;

            if (!depsToResolve) { // Guard against null/undefined depsToResolve
                throw new Error(`Invalid dependency list for module: ${moduleIdentifier}`);
            }

            for (argIndex = 0; argIndex < depsToResolve.length; argIndex += 1) {
                resolvedMap = createModuleMap(depsToResolve[argIndex], contextualName);
                dependencyName = resolvedMap.full;

                // Handle special CommonJS-like dependencies.
                if (dependencyName === "require") {
                    callbackArguments[argIndex] = coreDependencies.require(moduleIdentifier);
                } else if (dependencyName === "exports") {
                    callbackArguments[argIndex] = coreDependencies.exports(moduleIdentifier);
                    isUsingExports = true;
                } else if (dependencyName === "module") {
                    commonJSModuleRef = callbackArguments[argIndex] = coreDependencies.module(moduleIdentifier);
                } else if (checkOwnProp(resolvedModules, dependencyName) ||
                           checkOwnProp(pendingDefinitions, dependencyName) ||
                           checkOwnProp(modulesInProgress, dependencyName)) {
                    // Dependency is already known, in progress, or defined.
                    callbackArguments[argIndex] = retrieveDependency(dependencyName);
                } else if (resolvedMap.pluginInst) {
                    // Handle plugin dependencies.
                    resolvedMap.pluginInst.load(resolvedMap.base, createBoundFetcher(contextualName, true), createModuleSetter(dependencyName), {});
                    callbackArguments[argIndex] = resolvedModules[dependencyName];
                } else {
                    throw new Error(`Dependency '${dependencyName}' missing for module '${moduleIdentifier}'`);
                }
            }

            // Execute the callback to get the module's value.
            const moduleReturnValue = definitionCallback.apply(resolvedModules[moduleIdentifier], callbackArguments);

            // Store the resolved module value.
            if (moduleIdentifier) {
                // If a CommonJS module object was provided and its exports property was modified,
                // that takes precedence.
                if (commonJSModuleRef && commonJSModuleRef.exports !== void0 &&
                    commonJSModuleRef.exports !== resolvedModules[moduleIdentifier]) {
                    resolvedModules[moduleIdentifier] = commonJSModuleRef.exports;
                } else if (moduleReturnValue !== void0 || !isUsingExports) {
                    // Otherwise, use the return value from the callback,
                    // unless exports was explicitly used and nothing was returned.
                    resolvedModules[moduleIdentifier] = moduleReturnValue;
                }
            }
        } else if (moduleIdentifier) {
            // If the definitionCallback is not a function, it's likely an object literal.
            resolvedModules[moduleIdentifier] = definitionCallback;
        }
    };

    modLoader = getModule = fetchModule = function (dependencySpec, callbackFn, relativeContext, forceImmediate, extraArg) {
        // Handle single string dependency requests (e.g., `getModule('myModule')`).
        if (typeof dependencySpec === "string") {
            if (coreDependencies[dependencySpec]) {
                // Special internal dependencies like 'require', 'exports', 'module'.
                return coreDependencies[dependencySpec](callbackFn); // callbackFn here acts as the module name.
            }
            // Just return the module value. `callbackFn` acts as `relativeContext` here.
            return retrieveDependency(createModuleMap(dependencySpec, callbackFn).full);
        } else if (!Array.isArray(dependencySpec)) {
            // `dependencySpec` is a configuration object, not an array of dependencies.
            loaderConfiguration = dependencySpec;
            if (Array.isArray(callbackFn)) {
                // If `callbackFn` is an array, it's the actual dependency list.
                dependencySpec = callbackFn;
                callbackFn = relativeContext;
                relativeContext = null;
            } else {
                dependencySpec = void0; // No explicit dependencies passed.
            }
        }

        // Ensure a callback function is present, even if empty.
        callbackFn = callbackFn || function () {};

        // Adjust arguments if `relativeContext` was actually an error handler function.
        if (typeof relativeContext === 'function') {
            relativeContext = forceImmediate;
            forceImmediate = extraArg;
        }

        // Execute the module definition, potentially asynchronously.
        if (forceImmediate) {
            // Synchronous execution path.
            processModuleDefinition(void0, dependencySpec, callbackFn, relativeContext);
        } else {
            // Asynchronous execution via setTimeout for browser compatibility.
            // A small delay ensures non-blocking behavior.
            setTimeout(() => {
                processModuleDefinition(void0, dependencySpec, callbackFn, relativeContext);
            }, 4); // Using 4ms as a common browser-optimized minimum.
        }

        return fetchModule; // Allow chaining for `getModule.config()`.
    };

    /**
     * Configures the module loader.
     * @param {Object} setupOptions - Configuration object.
     * @returns {Function} The `fetchModule` function for chaining.
     */
    fetchModule.config = function (setupOptions) {
        loaderConfiguration = setupOptions;
        if (loaderConfiguration.deps) {
            fetchModule(loaderConfiguration.deps, loaderConfiguration.callback);
        }
        return fetchModule;
    };

    /**
     * Defines a module for the loader.
     * @param {string} moduleName - The unique name of the module.
     * @param {Array<string>} [dependencies] - An array of module names this module depends on.
     * @param {Function|Object} moduleFactory - The function or object that defines the module's value.
     */
    setModule = function (moduleName, dependencies, moduleFactory) {
        // Handle cases where dependencies array is omitted.
        if (!Array.isArray(dependencies)) {
            moduleFactory = dependencies;
            dependencies = [];
        }

        // Only store if not already defined or pending.
        if (!checkOwnProp(resolvedModules, moduleName) && !checkOwnProp(pendingDefinitions, moduleName)) {
            pendingDefinitions[moduleName] = [moduleName, dependencies, moduleFactory];
        }
    };

    // Mark as AMD-compliant, often used by external tools to detect loaders.
    setModule.amd = {
        jQuery: true // A common historical marker, indicates AMD support.
    };
}(void 0)); // Using `void 0` instead of `undefined` for robustness in older environments.