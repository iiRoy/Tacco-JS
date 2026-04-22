(function (undefinedValue) {
    let executeModuleDefinition, getModule, produceModuleHandle, serviceConstructors,
        resolvedModules = new Map(),
        pendingDefinitions = new Map(),
        loaderSettings = {},
        currentlyProcessing = new Set(),
        hasOwnProp = Object.prototype.hasOwnProperty,
        arraySlice = [].slice;

    function checkProp(targetObj, propertyKey) {
        return hasOwnProp.call(targetObj, propertyKey);
    }

    /**
     * Given a module identifier, normalizes it to a canonical form,
     * handling relative paths and map configuration.
     * @param {String} resourceId The module identifier to normalize.
     * @param {String} baseResourceId The identifier of the module from which resourceId is relative.
     * @returns {String} The normalized module identifier.
     */
    function standardizePathRevised(resourceId, baseResourceId) {
        let currentPathParts, pathSegment, mappedValue, foundMappedEntry,
            foundEntryIndex, foundWildcardEntry, wildcardEntryIndex, iteratorA, iteratorB,
            basePathParts = baseResourceId ? baseResourceId.split("/") : [];

        // Adjust relative paths.
        if (resourceId && resourceId.charAt(0) === ".") {
            if (baseResourceId) {
                basePathParts = basePathParts.slice(0, basePathParts.length - 1);
                currentPathParts = basePathParts.concat(resourceId.split("/"));
            } else if (resourceId.indexOf('./') === 0) {
                // No baseResourceId, so this ID is relative to baseUrl. Remove leading dot.
                currentPathParts = resourceId.substring(2).split("/");
            } else {
                currentPathParts = resourceId.split("/");
            }
        } else {
            currentPathParts = resourceId.split("/");
        }

        // --- Start of dot trimming logic ---
        // Processes segments like '.', '..' in the path.
        for (iteratorA = 0; iteratorA < currentPathParts.length; iteratorA += 1) {
            pathSegment = currentPathParts[iteratorA];
            if (pathSegment === ".") {
                // Remove '.' segment
                currentPathParts.splice(iteratorA, 1);
                iteratorA -= 1;
            } else if (pathSegment === "..") {
                // Handle '..' segment: go up one directory level.
                // Special break condition to prevent going above the effective base path.
                if (iteratorA === 1 && (currentPathParts[2] === '..' || currentPathParts[0] === '..')) {
                    break;
                } else if (iteratorA > 0) {
                    // Remove current '..' and the preceding segment.
                    currentPathParts.splice(iteratorA - 1, 2);
                    iteratorA -= 2;
                }
            }
        }
        // --- End of dot trimming logic ---

        resourceId = currentPathParts.join("/");

        // Apply map configuration if available.
        const moduleMapConfig = loaderSettings.map;
        if ((basePathParts.length > 0 || (moduleMapConfig && moduleMapConfig['*'])) && moduleMapConfig) {
            currentPathParts = resourceId.split('/');

            for (iteratorA = currentPathParts.length; iteratorA > 0; iteratorA -= 1) {
                pathSegment = currentPathParts.slice(0, iteratorA).join("/");
                let tempMapEntry = null;

                if (basePathParts.length > 0) {
                    // Search for a base-specific map entry.
                    for (iteratorB = basePathParts.length; iteratorB > 0; iteratorB -= 1) {
                        mappedValue = moduleMapConfig[basePathParts.slice(0, iteratorB).join('/')];

                        if (mappedValue) {
                            mappedValue = mappedValue[pathSegment];
                            if (mappedValue) {
                                tempMapEntry = mappedValue;
                                foundEntryIndex = iteratorA;
                                break;
                            }
                        }
                    }
                }

                if (tempMapEntry) {
                    foundMappedEntry = tempMapEntry;
                    break;
                }

                // If no base-specific match, check for a wildcard map entry.
                if (!foundWildcardEntry && moduleMapConfig['*'] && moduleMapConfig['*'][pathSegment]) {
                    foundWildcardEntry = moduleMapConfig['*'][pathSegment];
                    wildcardEntryIndex = iteratorA;
                }
            }

            // Prioritize base-specific map over wildcard map.
            if (!foundMappedEntry && foundWildcardEntry) {
                foundMappedEntry = foundWildcardEntry;
                foundEntryIndex = wildcardEntryIndex;
            }

            // If a map entry was found, apply it to the path.
            if (foundMappedEntry) {
                currentPathParts.splice(0, foundEntryIndex, foundMappedEntry);
                resourceId = currentPathParts.join('/');
            }
        }

        return resourceId;
    }

    /**
     * Splits a module identifier into a plugin part and a resource part,
     * e.g., "plugin!resource" -> ["plugin", "resource"].
     * @param {String} qualifiedName The module identifier.
     * @returns {Array<String>} An array [pluginName, resourceName].
     */
    function parseQualifier(qualifiedName) {
        let prefixPart, splitterIndex = qualifiedName ? qualifiedName.indexOf('!') : -1;
        if (splitterIndex > -1) {
            prefixPart = qualifiedName.substring(0, splitterIndex);
            qualifiedName = qualifiedName.substring(splitterIndex + 1, qualifiedName.length);
        }
        return [prefixPart, qualifiedName];
    }

    /**
     * Creates a module handle object, normalizing the name and resolving any plugin.
     * @param {String} idString The module identifier.
     * @param {String} relativeId The base module identifier for relative paths.
     * @returns {Object} An object containing full, short, qualifier, and plugin references.
     */
    produceModuleHandle = function (idString, relativeId) {
        let pluginModule,
            idParts = parseQualifier(idString),
            pluginName = idParts[0];

        idString = idParts[1];

        if (pluginName) {
            pluginName = standardizePathRevised(pluginName, relativeId);
            pluginModule = fetchExport(pluginName); // Resolve the plugin module
        }

        // Normalize the resource part of the identifier.
        if (pluginName) {
            if (pluginModule && pluginModule.normalize) {
                idString = pluginModule.normalize(idString, createNormalizer(relativeId));
            } else {
                idString = standardizePathRevised(idString, relativeId);
            }
        } else {
            idString = standardizePathRevised(idString, relativeId);
            // Check again if normalization introduced a plugin prefix.
            idParts = parseQualifier(idString);
            pluginName = idParts[0];
            idString = idParts[1];
            if (pluginName) {
                pluginModule = fetchExport(pluginName);
            }
        }

        return {
            full: pluginName ? pluginName + '!' + idString : idString, // Full normalized ID
            short: idString, // Resource part
            qualifier: pluginName, // Plugin part
            plugin: pluginModule // Plugin module reference
        };
    };

    /**
     * Creates a function to provide module-specific configuration.
     * @param {String} moduleIdentifier The ID of the module requesting config.
     * @returns {Function} A function that returns the module's config object.
     */
    function createConfigProvider(moduleIdentifier) {
        return function () {
            return (loaderSettings && loaderSettings.config && loaderSettings.config[moduleIdentifier]) || {};
        };
    }

    /**
     * Factory functions for special AMD/CommonJS dependencies.
     */
    serviceConstructors = {
        request: function (consumerId) {
            return createModuleReq(consumerId);
        },
        output: function (consumerId) {
            let exportedValue = resolvedModules.get(consumerId);
            if (typeof exportedValue === 'undefined') {
                // If exports object isn't set, initialize it.
                resolvedModules.set(consumerId, {});
                return resolvedModules.get(consumerId);
            } else {
                return exportedValue;
            }
        },
        container: function (consumerId) {
            return {
                moduleID: consumerId,
                location: '', // uri property, often empty in almond
                moduleExports: resolvedModules.get(consumerId),
                moduleConfig: createConfigProvider(consumerId)
            };
        }
    };

    /**
     * Fetches the exported value of a module. If the module is pending definition,
     * it triggers its processing.
     * @param {String} moduleKey The full normalized ID of the module.
     * @returns {*} The exported value of the module.
     * @throws {Error} If the module is not found or cannot be resolved.
     */
    function fetchExport(moduleKey) {
        if (pendingDefinitions.has(moduleKey)) {
            let moduleArgs = pendingDefinitions.get(moduleKey);
            pendingDefinitions.delete(moduleKey);
            currentlyProcessing.add(moduleKey);
            executeModuleDefinition(moduleArgs.name, moduleArgs.dependencies, moduleArgs.factory, moduleArgs.name);
        }

        if (!resolvedModules.has(moduleKey) && !currentlyProcessing.has(moduleKey)) {
            throw new Error('Module missing: ' + moduleKey);
        }
        return resolvedModules.get(moduleKey);
    }

    /**
     * The core logic for processing a module definition. Resolves dependencies,
     * executes the module factory, and stores the result.
     * @param {String} id The module's own identifier.
     * @param {Array<String>} dependenciesArray An array of dependency identifiers.
     * @param {Function|Object} moduleFactory The module's factory function or an object literal.
     * @param {String} relatedId The ID of the module from which this module is being processed (for relative paths).
     */
    executeModuleDefinition = function (id, dependenciesArray, moduleFactory, relatedId) {
        let commonJSModule, depId, moduleMapEntry, currentIdx,
            argumentValues = [],
            factoryType = typeof moduleFactory,
            usesExportsObject;

        relatedId = relatedId || id;

        // If the module is defined by a factory function or is an implicit definition.
        if (factoryType === 'undefined' || factoryType === 'function') {
            // Default to CommonJS dependencies if none specified but factory requests them.
            dependenciesArray = !Array.isArray(dependenciesArray) || !dependenciesArray.length && moduleFactory.length ? ['request', 'output', 'container'] : dependenciesArray;

            for (currentIdx = 0; currentIdx < dependenciesArray.length; currentIdx += 1) {
                moduleMapEntry = produceModuleHandle(dependenciesArray[currentIdx], relatedId);
                depId = moduleMapEntry.full;

                // Handle special CommonJS dependencies.
                if (depId === "request") {
                    argumentValues[currentIdx] = serviceConstructors.request(id);
                } else if (depId === "output") {
                    argumentValues[currentIdx] = serviceConstructors.output(id);
                    usesExportsObject = true;
                } else if (depId === "container") {
                    commonJSModule = argumentValues[currentIdx] = serviceConstructors.container(id);
                } else if (resolvedModules.has(depId) ||
                           pendingDefinitions.has(depId) ||
                           currentlyProcessing.has(depId)) {
                    // Dependency is already resolved, pending, or currently being processed.
                    argumentValues[currentIdx] = fetchExport(depId);
                } else if (moduleMapEntry.plugin) {
                    // Handle plugin-loaded resources.
                    moduleMapEntry.plugin.load(moduleMapEntry.short, createModuleReq(relatedId, true), createExportSetter(depId), {});
                    argumentValues[currentIdx] = resolvedModules.get(depId);
                } else {
                    // Dependency not found.
                    throw new Error(id + ' requires ' + depId + ' but it is not available.');
                }
            }

            // Execute the module factory.
            let factoryResult = moduleFactory ? moduleFactory.apply(resolvedModules.get(id), argumentValues) : undefinedValue;

            if (id) {
                // If using CommonJS 'module' export, prioritize it.
                if (commonJSModule && commonJSModule.moduleExports !== undefinedValue &&
                        commonJSModule.moduleExports !== resolvedModules.get(id)) {
                    resolvedModules.set(id, commonJSModule.moduleExports);
                } else if (factoryResult !== undefinedValue || !usesExportsObject) {
                    // Otherwise, use the factory's return value.
                    resolvedModules.set(id, factoryResult);
                }
            }
        } else if (id) {
            // Module is defined by an object literal.
            resolvedModules.set(id, moduleFactory);
        }
        currentlyProcessing.delete(id); // Module processing is complete.
    };

    /**
     * Creates a `require` function specific to a module, allowing relative path resolution.
     * @param {String} relativeModuleName The ID of the module creating this `require`.
     * @param {Boolean} forceSynch If true, forces synchronous loading.
     * @returns {Function} A specialized `require` function.
     */
    function createModuleReq(relativeModuleName, forceSynch) {
        return function () {
            // Passes through arguments to the global `getModule` (require),
            // appending the `relativeModuleName` and `forceSynch` flags.
            return getModule.apply(undefinedValue, arraySlice.call(arguments, 0).concat([relativeModuleName, forceSynch]));
        };
    }

    /**
     * Creates a normalization function specific to a module.
     * @param {String} relativeModuleName The ID of the module creating this normalizer.
     * @returns {Function} A specialized `normalize` function.
     */
    function createNormalizer(relativeModuleName) {
        return function (targetName) {
            return standardizePathRevised(targetName, relativeModuleName);
        };
    }

    /**
     * Creates a function to set the exported value for a plugin-loaded dependency.
     * @param {String} dependencyName The ID of the dependency.
     * @returns {Function} A function that takes a value and sets it as the dependency's export.
     */
    function createExportSetter(dependencyName) {
        return function (exportValue) {
            resolvedModules.set(dependencyName, exportValue);
        };
    }

    let modLoader, getModuleRef;

    /**
     * The public `requirejs` and `require` function.
     * @param {String|Array|Object} dependencyList Module ID, array of dependencies, or config object.
     * @param {Function|Object} factoryFunction Callback function or module definition object.
     * @param {String} relativeIdentifier Optional, for internal use to resolve relative paths.
     * @param {Boolean} synchronousFlag Optional, to force synchronous module loading.
     * @param {any} alternativeArg Optional, for internal use.
     * @returns {any} Module exports if `dependencyList` is a string, or `getModuleRef` for chaining.
     */
    modLoader = getModule = getModuleRef = function (dependencyList, factoryFunction, relativeIdentifier, synchronousFlag, alternativeArg) {
        if (typeof dependencyList === "string") {
            // Handle `require('module-id')` or `require('special-dependency')`
            if (serviceConstructors[dependencyList]) {
                return serviceConstructors[dependencyList](factoryFunction); // factoryFunction is `relName` here.
            }
            return fetchExport(produceModuleHandle(dependencyList, factoryFunction).full);
        } else if (!Array.isArray(dependencyList)) {
            // `dependencyList` is a config object.
            loaderSettings = dependencyList;
            if (Array.isArray(factoryFunction)) {
                // Config object also includes dependencies to load.
                dependencyList = factoryFunction;
                factoryFunction = relativeIdentifier;
                relativeIdentifier = null;
            } else {
                dependencyList = undefinedValue;
            }
        }

        // Ensure `factoryFunction` is always a function for later execution.
        factoryFunction = factoryFunction || function () {};

        // Adjust arguments if `relativeIdentifier` was an errback handler.
        if (typeof relativeIdentifier === 'function') {
            relativeIdentifier = synchronousFlag;
            synchronousFlag = alternativeArg;
        }

        // Trigger module definition processing.
        if (synchronousFlag) {
            executeModuleDefinition(undefinedValue, dependencyList, factoryFunction, relativeIdentifier);
        } else {
            // Asynchronous loading via setTimeout.
            setTimeout(function () {
                executeModuleDefinition(undefinedValue, dependencyList, factoryFunction, relativeIdentifier);
            }, 4); // Use a non-zero timeout for browser compatibility.
        }

        return getModuleRef; // Allow chaining for config calls.
    };

    /**
     * Sets global loader configuration.
     * @param {Object} configObject The configuration object.
     * @returns {Function} The `getModuleRef` function for chaining.
     */
    getModuleRef.config = function (configObject) {
        loaderSettings = configObject;
        if (loaderSettings.deps) {
            getModuleRef(loaderSettings.deps, loaderSettings.callback);
        }
        return getModuleRef;
    };

    /**
     * Expose the module registry for debugging and tooling.
     */
    modLoader._defined = resolvedModules;

    /**
     * The public `define` function for defining modules.
     * @param {String} moduleKey The identifier for the module.
     * @param {Array<String>|Function|Object} dependencyList An array of dependencies, or the factory/object if no explicit dependencies.
     * @param {Function|Object} factoryFunction The module's factory function or an object literal.
     */
    registerModule = function (moduleKey, dependencyList, factoryFunction) {
        // If `dependencyList` is not an array, it means it's the factory function/object.
        if (!Array.isArray(dependencyList)) {
            factoryFunction = dependencyList;
            dependencyList = [];
        }

        // Store the module definition if it hasn't been defined or is not already pending.
        if (!resolvedModules.has(moduleKey) && !pendingDefinitions.has(moduleKey)) {
            pendingDefinitions.set(moduleKey, { name: moduleKey, dependencies: dependencyList, factory: factoryFunction });
        }
    };

    /**
     * Indicate AMD compatibility.
     */
    registerModule.amd = {
        jQuery: true
    };

    // Assign to global variables.
    requirejs = modLoader;
    require = getModule;
    define = registerModule;

}(void 0));