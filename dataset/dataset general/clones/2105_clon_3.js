let loaderCore, fetchModule, declareModule;
(function (void0) {
    // This script implements a lightweight AMD loader, inspired by almond.js.
    // It's designed for environments where a full-featured RequireJS might be overkill.
    // We're using a 'sloppy' mode to avoid strict-mode overhead, but best practices are encouraged.
    // Using global setTimeout for asynchronous operations.

    const objectPrototypeHasOwnProperty = Object.prototype.hasOwnProperty;
    const arrayPrototypeSlice = [].slice;

    let executeModuleDefinition,
        moduleRequester,
        createModuleIdentifier,
        systemHooks,
        resolvedModules = {},
        pendingDefinitions = {},
        loaderSettings = {},
        modulesInProgress = {}; // Modules currently undergoing definition

    /**
     * Checks if an object possesses a specific property directly.
     * @param {Object} targetObject The object to inspect.
     * @param {String} propertyKey The name of the property.
     * @returns {Boolean} True if the property exists directly on the object.
     */
    function checkObjectProperty(targetObject, propertyKey) {
        if (!targetObject || typeof targetObject !== 'object') {
            return false;
        }
        return objectPrototypeHasOwnProperty.call(targetObject, propertyKey);
    }

    /**
     * Transforms a relative module identifier into a standardized, absolute path-like name.
     * This function handles '.' and '..' segments and applies loader configuration maps.
     * @param {String} moduleRef The module identifier to normalize.
     * @param {String} baseRef An optional base module identifier for relative resolution.
     * @returns {String} The standardized module name.
     */
    function standardizeModuleName(moduleRef, baseRef) {
        let currentNameParts, segment, mappedEntry,
            mapFound = false,
            starMapFound = false,
            segmentIndexForMap = -1,
            starSegmentIndex = -1,
            i, j, currentPart;

        const baseSegments = baseRef ? baseRef.split("/") : [];
        const moduleMap = loaderSettings.map;
        const globalStarMap = (moduleMap && moduleMap['*']) || {};

        // Process relative paths if present.
        if (moduleRef && moduleRef.charAt(0) === ".") {
            if (baseRef) {
                // Remove the last part of the baseName to get its directory.
                const contextualBase = baseSegments.slice(0, baseSegments.length - 1);
                currentNameParts = contextualBase.concat(moduleRef.split("/"));

                // Trim '.' and '..' segments.
                for (i = 0; i < currentNameParts.length; i += 1) {
                    currentPart = currentNameParts[i];
                    if (currentPart === ".") {
                        currentNameParts.splice(i, 1);
                        i -= 1;
                    } else if (currentPart === "..") {
                        // Prevent going above the root path for initial segments.
                        if (i === 1 && (currentNameParts[2] === '..' || currentNameParts[0] === '..')) {
                            break; // Stop if we're at the beginning and trying to go further up.
                        } else if (i > 0) {
                            currentNameParts.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                moduleRef = currentNameParts.join("/");
            } else if (moduleRef.startsWith('./')) {
                // If no base name, assume top-level and remove leading './'.
                moduleRef = moduleRef.substring(2);
            }
        }

        // Apply module mapping configuration if available.
        if ((baseSegments.length > 0 || Object.keys(globalStarMap).length > 0) && moduleMap) {
            currentNameParts = moduleRef.split('/');

            for (i = currentNameParts.length; i > 0; i -= 1) {
                segment = currentNameParts.slice(0, i).join("/");

                if (baseSegments.length > 0) {
                    // Search for the longest matching baseName segment in the map.
                    for (j = baseSegments.length; j > 0; j -= 1) {
                        const baseMapConfig = moduleMap[baseSegments.slice(0, j).join('/')];
                        if (baseMapConfig) {
                            const specificMapping = baseMapConfig[segment];
                            if (specificMapping) {
                                mappedEntry = specificMapping;
                                segmentIndexForMap = i;
                                mapFound = true;
                                break;
                            }
                        }
                    }
                }

                if (mapFound) {
                    break;
                }

                // Check for a star map match, but prioritize specific base maps.
                if (!starMapFound && globalStarMap && globalStarMap[segment]) {
                    mappedEntry = globalStarMap[segment];
                    starSegmentIndex = i;
                    starMapFound = true;
                }
            }

            if (!mapFound && starMapFound) {
                segmentIndexForMap = starSegmentIndex;
            }

            if (mappedEntry) {
                currentNameParts.splice(0, segmentIndexForMap, mappedEntry);
                moduleRef = currentNameParts.join('/');
            }
        }

        return moduleRef;
    }

    /**
     * Generates a contextual 'require' function for a specific module.
     * @param {String} contextModuleName The name of the module from which 'require' is called.
     * @param {Boolean} forceSynchronous A flag to force synchronous resolution.
     * @returns {Function} A 'require' function bound to the given context.
     */
    function generateContextualRequester(contextModuleName, forceSynchronous) {
        return function (...args) {
            // Apply arguments from current call and append contextual info.
            return moduleRequester.apply(void0, arrayPrototypeSlice.call(args, 0).concat([contextModuleName, forceSynchronous]));
        };
    }

    /**
     * Creates a function that normalizes a module name relative to a specific base name.
     * @param {String} baseModuleName The base module name for normalization.
     * @returns {Function} A normalization function.
     */
    function generatePathNormalizer(baseModuleName) {
        return function (nameToNormalize) {
            return standardizeModuleName(nameToNormalize, baseModuleName);
        };
    }

    /**
     * Generates a callback function used by plugins to load module values.
     * @param {String} loadedModuleName The name of the module being loaded by the plugin.
     * @returns {Function} A function to set the loaded module's value.
     */
    function createLoadCallback(loadedModuleName) {
        return function (moduleValue) {
            resolvedModules[loadedModuleName] = moduleValue;
        };
    }

    /**
     * Retrieves an already defined or currently defining module instance.
     * Throws an error if the module is not found or not in progress.
     * @param {String} moduleIdentifier The full identifier of the module to retrieve.
     * @returns {*} The module's exported value.
     */
    function retrieveModuleInstance(moduleIdentifier) {
        if (!moduleIdentifier || typeof moduleIdentifier !== 'string') {
            throw new Error('Attempted to retrieve module with invalid identifier: ' + moduleIdentifier);
        }

        if (checkObjectProperty(pendingDefinitions, moduleIdentifier)) {
            const definitionArgs = pendingDefinitions[moduleIdentifier];
            delete pendingDefinitions[moduleIdentifier];
            modulesInProgress[moduleIdentifier] = true; // Mark as defining
            executeModuleDefinition.apply(void0, definitionArgs);
        }

        if (!checkObjectProperty(resolvedModules, moduleIdentifier) && !checkObjectProperty(modulesInProgress, moduleIdentifier)) {
            throw new Error('Module "' + moduleIdentifier + '" is not defined or currently being processed.');
        }
        return resolvedModules[moduleIdentifier];
    }

    /**
     * Parses a module specifier string to separate plugin prefix from resource name.
     * E.g., "plugin!resource" -> { prefix: "plugin", resource: "resource" }
     * @param {String} moduleSpecifier The full module specifier.
     * @returns {{prefix: (String|null), resource: String}} An object containing the prefix and resource.
     */
    function parseModuleSpecifier(moduleSpecifier) {
        const exclamationIndex = moduleSpecifier ? moduleSpecifier.indexOf('!') : -1;
        if (exclamationIndex > -1) {
            return {
                pluginPrefix: moduleSpecifier.substring(0, exclamationIndex),
                resourceName: moduleSpecifier.substring(exclamationIndex + 1)
            };
        }
        return {
            pluginPrefix: null,
            resourceName: moduleSpecifier
        };
    }

    /**
     * Creates a detailed map of a module identifier, including its normalized form,
     * plugin prefix, and plugin instance if applicable.
     * @param {String} identifier The module identifier string.
     * @param {String} relativeToName The name of the module from which this identifier is relative.
     * @returns {{fullIdentifier: String, resourceName: String, pluginPrefix: (String|null), pluginInstance: (Object|null)}}
     */
    createModuleIdentifier = function (identifier, relativeToName) {
        let pluginModule,
            parsedSpecifier = parseModuleSpecifier(identifier),
            prefix = parsedSpecifier.pluginPrefix;
        let resource = parsedSpecifier.resourceName;

        // If a plugin prefix exists, normalize it first.
        if (prefix) {
            prefix = standardizeModuleName(prefix, relativeToName);
            pluginModule = retrieveModuleInstance(prefix);
        }

        // Normalize the resource name based on plugin or standard rules.
        if (prefix) {
            if (pluginModule && pluginModule.normalize) {
                resource = pluginModule.normalize(resource, generatePathNormalizer(relativeToName));
            } else {
                resource = standardizeModuleName(resource, relativeToName);
            }
        } else {
            resource = standardizeModuleName(resource, relativeToName);
            // Re-parse in case normalization resulted in a plugin prefix.
            parsedSpecifier = parseModuleSpecifier(resource);
            prefix = parsedSpecifier.pluginPrefix;
            resource = parsedSpecifier.resourceName;
            if (prefix) {
                pluginModule = retrieveModuleInstance(prefix);
            }
        }

        // Return a structured object for the module's identity.
        return {
            fullIdentifier: prefix ? prefix + '!' + resource : resource,
            resourceName: resource,
            pluginPrefix: prefix,
            pluginInstance: pluginModule
        };
    };

    /**
     * Provides a function to retrieve configuration for a specific module.
     * @param {String} moduleName The name of the module requesting configuration.
     * @returns {Function} A function that returns the module's configuration object.
     */
    function obtainModuleConfiguration(moduleName) {
        return function () {
            return (loaderSettings && loaderSettings.config && loaderSettings.config[moduleName]) || {};
        };
    }

    // Special module handlers for 'require', 'exports', 'module'.
    systemHooks = {
        require: function (requiringModuleId) {
            return generateContextualRequester(requiringModuleId);
        },
        exports: function (exportingModuleId) {
            let existingExports = resolvedModules[exportingModuleId];
            if (existingExports !== void0) {
                return existingExports;
            } else {
                return (resolvedModules[exportingModuleId] = {}); // Initialize exports object.
            }
        },
        module: function (moduleId) {
            // CommonJS module spec 1.1
            return {
                id: moduleId,
                uri: '', // URI is not managed by this loader, so it's empty.
                exports: resolvedModules[moduleId],
                config: obtainModuleConfiguration(moduleId)
            };
        }
    };

    /**
     * The core function responsible for defining and resolving modules.
     * It processes dependencies and executes the module's factory function.
     * @param {String} moduleName The unique name of the module being defined.
     * @param {Array<String>} dependencies An array of module identifiers this module depends on.
     * @param {Function|Object} factoryFunction The function that creates the module's value, or the module's value directly.
     * @param {String} relativeContext The module name from which this definition is relative.
     */
    executeModuleDefinition = function (moduleName, dependencies, factoryFunction, relativeContext) {
        let cjsModuleObject, // Represents the 'module' object for CommonJS.
            dependencyId,
            moduleResult,
            mappedDependency,
            depArgs = [],
            factoryType = typeof factoryFunction,
            exportsUsedExplicitly = false;

        // Use moduleName as relativeContext if not provided.
        relativeContext = relativeContext || moduleName;

        // Execute the factory function to define the module, if it's a function.
        if (factoryType === 'undefined' || factoryType === 'function') {
            // If no explicit dependencies are given, but the factory takes args, assume CommonJS defaults.
            const actualDependencies = (!dependencies.length && factoryFunction && factoryFunction.length)
                ? ['require', 'exports', 'module']
                : dependencies;

            for (let i = 0; i < actualDependencies.length; i += 1) {
                mappedDependency = createModuleIdentifier(actualDependencies[i], relativeContext);
                dependencyId = mappedDependency.fullIdentifier;

                // Handle special CommonJS dependencies directly.
                if (dependencyId === "require") {
                    depArgs[i] = systemHooks.require(moduleName);
                } else if (dependencyId === "exports") {
                    depArgs[i] = systemHooks.exports(moduleName);
                    exportsUsedExplicitly = true;
                } else if (dependencyId === "module") {
                    cjsModuleObject = depArgs[i] = systemHooks.module(moduleName);
                } else if (
                    checkObjectProperty(resolvedModules, dependencyId) ||
                    checkObjectProperty(pendingDefinitions, dependencyId) ||
                    checkObjectProperty(modulesInProgress, dependencyId)
                ) {
                    depArgs[i] = retrieveModuleInstance(dependencyId);
                } else if (mappedDependency.pluginInstance) {
                    // Handle plugin-loaded resources.
                    mappedDependency.pluginInstance.load(
                        mappedDependency.resourceName,
                        generateContextualRequester(relativeContext, true),
                        createLoadCallback(dependencyId),
                        {} // config argument for plugins, not used by almond.
                    );
                    depArgs[i] = resolvedModules[dependencyId]; // Plugin should have loaded it synchronously.
                } else {
                    throw new Error(`Module '${moduleName}' is missing dependency '${dependencyId}'`);
                }
            }

            moduleResult = factoryFunction ? factoryFunction.apply(resolvedModules[moduleName], depArgs) : void0;

            if (moduleName) {
                // Determine the final value for the module.
                // 1. If 'module.exports' was used and modified, that takes precedence.
                if (cjsModuleObject && cjsModuleObject.exports !== void0 &&
                    cjsModuleObject.exports !== resolvedModules[moduleName]) {
                    resolvedModules[moduleName] = cjsModuleObject.exports;
                }
                // 2. Otherwise, if the factory returned a value (and it's not 'undefined'), use that.
                // 3. Or if 'exports' was NOT explicitly used (meaning the factory returned a value or was side-effect based).
                else if (moduleResult !== void0 || !exportsUsedExplicitly) {
                    resolvedModules[moduleName] = moduleResult;
                }
            }
        } else if (moduleName) {
            // If factoryFunction is not a function, it's a direct object value.
            resolvedModules[moduleName] = factoryFunction;
        }
        delete modulesInProgress[moduleName]; // Mark as resolved.
    };

    // Main entry point for requesting modules.
    // Can be used as require(['dep1', 'dep2'], callback) or require('moduleName').
    loaderCore = fetchModule = moduleRequester = function (depsArg, factoryOrConfig, relativeToModule, isSyncMode, auxiliary) {
        if (typeof depsArg === "string") {
            // Case: require('moduleName') or require('specialHandler')
            if (systemHooks[depsArg]) {
                // Special handlers like 'require', 'exports', 'module'.
                return systemHooks[depsArg](factoryOrConfig); // factoryOrConfig is actually relName here.
            }
            // Just return the module instance.
            return retrieveModuleInstance(createModuleIdentifier(depsArg, factoryOrConfig).fullIdentifier);
        } else if (!Array.isArray(depsArg)) {
            // Case: require({ configObject })
            loaderSettings = depsArg;
            if (Array.isArray(factoryOrConfig)) {
                // Case: require({ configObject }, ['deps'], callback)
                depsArg = factoryOrConfig;
                factoryOrConfig = relativeToModule;
                relativeToModule = null;
            } else {
                depsArg = void0; // No dependencies provided in this config call.
            }
        }

        // Ensure a callback exists to prevent errors.
        const moduleCallback = factoryOrConfig || function () {};

        // Adjust arguments if an errback handler is passed instead of relativeToModule.
        if (typeof relativeToModule === 'function') {
            relativeToModule = isSyncMode;
            isSyncMode = auxiliary;
        }

        // Execute module definition, either synchronously or asynchronously.
        if (isSyncMode) {
            executeModuleDefinition(void0, depsArg, moduleCallback, relativeToModule);
        } else {
            // Schedule asynchronous execution. Using a small timeout to ensure
            // the current execution stack clears, mimicking typical async behavior.
            setTimeout(function () {
                executeModuleDefinition(void0, depsArg, moduleCallback, relativeToModule);
            }, 4); // A small, non-zero delay is common practice for browser timers.
        }

        return moduleRequester; // Allow chaining config calls.
    };

    /**
     * Allows configuration of the module loader.
     * @param {Object} configuration An object containing loader settings.
     * @returns {Function} The moduleRequester function itself for chaining.
     */
    moduleRequester.configure = function (configuration) {
        loaderSettings = configuration;
        if (loaderSettings.deps) {
            moduleRequester(loaderSettings.deps, loaderSettings.callback);
        }
        return moduleRequester;
    };

    /**
     * Exposes the internal module registry for debugging or tooling purposes.
     */
    loaderCore._moduleRegistry = resolvedModules;

    /**
     * Defines a module, registering its factory and dependencies for later resolution.
     * @param {String} moduleName The unique identifier for the module.
     * @param {Array<String>} moduleDependencies An array of module identifiers this module depends on.
     * @param {Function|Object} moduleFactory The factory function or direct value for the module.
     */
    declareModule = function (moduleName, moduleDependencies, moduleFactory) {
        // Handle cases where dependencies are omitted, and factory is directly the second arg.
        if (!Array.isArray(moduleDependencies)) {
            moduleFactory = moduleDependencies;
            moduleDependencies = [];
        }

        // Only add to pending if not already defined or waiting.
        if (!checkObjectProperty(resolvedModules, moduleName) && !checkObjectProperty(pendingDefinitions, moduleName)) {
            pendingDefinitions[moduleName] = [moduleName, moduleDependencies, moduleFactory];
        }
    };

    // Indicate AMD compliance, optionally with jQuery support flag.
    declareModule.amd = {
        jQuery: true
    };
}(void 0));