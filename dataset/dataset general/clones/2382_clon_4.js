var componentLoader, fetchComponent, declareComponent;
(function (voidValue) {
    let resolvedComponents = new Map();
    let pendingDeclarations = new Map();
    let loaderSettings = new Map();
    let inProgressComponents = new Map();
    const ownPropertyCheck = Object.prototype.hasOwnProperty;
    const arraySlicer = [].slice;

    function deepConvertObjectToMap(input) {
        if (typeof input !== 'object' || input === null || Array.isArray(input)) {
            return input;
        }
        const newMap = new Map();
        for (const key in input) {
            if (ownPropertyCheck.call(input, key)) {
                newMap.set(key, deepConvertObjectToMap(input[key]));
            }
        }
        return newMap;
    }

    function standardizePath(pathIdentifier, baseContextIdentifier) {
        let pathSegments = [];
        let baseSegments = baseContextIdentifier ? baseContextIdentifier.split('/') : [];
        const currentConfigMap = loaderSettings.get('map') || new Map();
        const globalStarPatternMap = currentConfigMap.get('*') || new Map();

        // Phase 1: Resolve relative path segments ('.', '..')
        if (pathIdentifier && pathIdentifier.startsWith('.')) {
            if (baseContextIdentifier) {
                let currentPathAccumulator = baseSegments.slice(0, baseSegments.length - 1);
                let incomingPathSegments = pathIdentifier.split('/');

                incomingPathSegments.forEach(segment => {
                    if (segment === '.') {
                        // Skip current directory segment
                    } else if (segment === '..') {
                        if (currentPathAccumulator.length > 0) {
                            currentPathAccumulator.pop(); // Go up one level
                        }
                    } else {
                        currentPathAccumulator.push(segment); // Add segment
                    }
                });
                pathSegments = currentPathAccumulator;
            } else if (pathIdentifier.startsWith('./')) {
                pathSegments = pathIdentifier.substring(2).split('/');
            } else {
                pathSegments = pathIdentifier.split('/');
            }
        } else {
            pathSegments = pathIdentifier ? pathIdentifier.split('/') : [];
        }

        // Phase 2: Apply map configuration
        let finalReplacementValue = null;
        let finalReplacementLength = -1;

        let tempBestBaseMatchValue = null;
        let tempBestBaseMatchLength = -1;
        let tempBestStarMatchValue = null;
        let tempBestStarMatchLength = -1;

        // Iterate from longest path segment to shortest for the incoming identifier
        for (let segmentCount = pathSegments.length; segmentCount > 0; segmentCount--) {
            let currentPathPrefix = pathSegments.slice(0, segmentCount).join('/');

            // Check base-specific maps first
            if (baseSegments.length > 0) {
                for (let baseCount = baseSegments.length; baseCount > 0; baseCount--) {
                    let currentBasePrefix = baseSegments.slice(0, baseCount).join('/');
                    let baseMapEntry = currentConfigMap.get(currentBasePrefix);
                    if (baseMapEntry && baseMapEntry.has(currentPathPrefix)) {
                        tempBestBaseMatchValue = baseMapEntry.get(currentPathPrefix);
                        tempBestBaseMatchLength = segmentCount;
                        break; // Found specific base match for this nameSegment
                    }
                }
            }
            if (tempBestBaseMatchValue) break; // If a specific base match was found for the longest possible nameSegment, stop.

            // Check global star map (only if no specific base match found for this segmentCount yet)
            if (globalStarPatternMap.has(currentPathPrefix)) {
                if (!tempBestStarMatchValue) { // Only store the *first* (longest) star match
                    tempBestStarMatchValue = globalStarPatternMap.get(currentPathPrefix);
                    tempBestStarMatchLength = segmentCount;
                }
            }
        }

        if (tempBestBaseMatchValue) {
            finalReplacementValue = tempBestBaseMatchValue;
            finalReplacementLength = tempBestBaseMatchLength;
        } else if (tempBestStarMatchValue) {
            finalReplacementValue = tempBestStarMatchValue;
            finalReplacementLength = tempBestStarMatchLength;
        }

        if (finalReplacementValue) {
            pathSegments.splice(0, finalReplacementLength, finalReplacementValue);
            return pathSegments.join('/');
        }

        return pathSegments.join('/');
    }

    const constructReference = (fullIdentifier, baseIdentifier) => {
        let pluginKey, primaryIdentifier;
        let separatorIndex = fullIdentifier ? fullIdentifier.indexOf('!') : -1;

        if (separatorIndex > -1) {
            pluginKey = fullIdentifier.substring(0, separatorIndex);
            primaryIdentifier = fullIdentifier.substring(separatorIndex + 1);
        } else {
            primaryIdentifier = fullIdentifier;
        }

        let resolvedPluginInstance = null;
        if (pluginKey) {
            pluginKey = standardizePath(pluginKey, baseIdentifier);
            resolvedPluginInstance = retrieveComponent(pluginKey);
        }

        if (pluginKey) {
            if (resolvedPluginInstance && resolvedPluginInstance.normalize) {
                primaryIdentifier = resolvedPluginInstance.normalize(primaryIdentifier, (subIdentifier) => standardizePath(subIdentifier, baseIdentifier));
            } else {
                primaryIdentifier = standardizePath(primaryIdentifier, baseIdentifier);
            }
        } else {
            primaryIdentifier = standardizePath(primaryIdentifier, baseIdentifier);
            separatorIndex = primaryIdentifier.indexOf('!'); // Re-check after normalization
            if (separatorIndex > -1) {
                pluginKey = primaryIdentifier.substring(0, separatorIndex);
                primaryIdentifier = primaryIdentifier.substring(separatorIndex + 1);
                resolvedPluginInstance = retrieveComponent(pluginKey);
            }
        }

        const finalFullIdentifier = pluginKey ? `${pluginKey}!${primaryIdentifier}` : primaryIdentifier;

        return {
            complete: finalFullIdentifier,
            mainPart: primaryIdentifier,
            pluginPrefix: pluginKey,
            pluginModule: resolvedPluginInstance
        };
    };

    function retrieveComponent(componentName) {
        if (pendingDeclarations.has(componentName)) {
            let declarationArguments = pendingDeclarations.get(componentName);
            pendingDeclarations.delete(componentName);
            inProgressComponents.set(componentName, true);
            processModuleDefinition.apply(voidValue, declarationArguments);
        }

        if (!resolvedComponents.has(componentName) && !inProgressComponents.has(componentName)) {
            throw new Error(`Component '${componentName}' not found.`);
        }
        return resolvedComponents.get(componentName);
    }

    const specialHandlers = new Map([
        ['require', (currentModuleName) => {
            return function () {
                return fetchComponent.apply(voidValue, arraySlicer.call(arguments, 0).concat([currentModuleName, true]));
            };
        }],
        ['exports', (currentModuleName) => {
            if (resolvedComponents.has(currentModuleName)) {
                return resolvedComponents.get(currentModuleName);
            } else {
                let newExportsObject = {};
                resolvedComponents.set(currentModuleName, newExportsObject);
                return newExportsObject;
            }
        }],
        ['module', (currentModuleName) => {
            let exportsRef = resolvedComponents.has(currentModuleName) ? resolvedComponents.get(currentModuleName) : {};
            if (!resolvedComponents.has(currentModuleName)) {
                resolvedComponents.set(currentModuleName, exportsRef);
            }
            return {
                moduleID: currentModuleName,
                modulePath: '',
                moduleExports: exportsRef,
                moduleConfig: () => (loaderSettings.get('config') && loaderSettings.get('config').get(currentModuleName)) || {}
            };
        }]
    ]);

    let processModuleDefinition = (moduleName, dependencyIdentifiers, definitionLogic, relativeContextName) => {
        let cjsModuleObject, dependencyMapInfo, resolvedDependencyID;
        let argumentValues = [];
        let usesExportsArgument = false;

        relativeContextName = relativeContextName || moduleName;

        if (typeof definitionLogic === 'function') {
            dependencyIdentifiers = (!Array.isArray(dependencyIdentifiers) || dependencyIdentifiers.length === 0) && definitionLogic.length > 0
                ? ['require', 'exports', 'module'] : dependencyIdentifiers;

            for (let i = 0; i < dependencyIdentifiers.length; i++) {
                dependencyMapInfo = constructReference(dependencyIdentifiers[i], relativeContextName);
                resolvedDependencyID = dependencyMapInfo.complete;

                if (specialHandlers.has(resolvedDependencyID)) {
                    if (resolvedDependencyID === 'exports') usesExportsArgument = true;
                    argumentValues[i] = specialHandlers.get(resolvedDependencyID)(moduleName);
                    if (resolvedDependencyID === 'module') cjsModuleObject = argumentValues[i];
                } else if (resolvedComponents.has(resolvedDependencyID) ||
                           pendingDeclarations.has(resolvedDependencyID) ||
                           inProgressComponents.has(resolvedDependencyID)) {
                    argumentValues[i] = retrieveComponent(resolvedDependencyID);
                } else if (dependencyMapInfo.pluginPrefix) {
                    let pluginLoaderInstance = dependencyMapInfo.pluginModule;
                    if (!pluginLoaderInstance || !pluginLoaderInstance.load) {
                        throw new Error(`Plugin '${dependencyMapInfo.pluginPrefix}' for '${resolvedDependencyID}' not found or missing 'load' method.`);
                    }
                    pluginLoaderInstance.load(dependencyMapInfo.mainPart,
                                              specialHandlers.get('require')(relativeContextName),
                                              (value) => resolvedComponents.set(resolvedDependencyID, value),
                                              {});
                    argumentValues[i] = resolvedComponents.get(resolvedDependencyID);
                } else {
                    throw new Error(`Module '${moduleName || 'anonymous'}' missing dependency '${resolvedDependencyID}'`);
                }
            }

            let executionResult = definitionLogic.apply(resolvedComponents.get(moduleName), argumentValues);

            if (moduleName) {
                if (cjsModuleObject && cjsModuleObject.moduleExports !== voidValue &&
                        cjsModuleObject.moduleExports !== resolvedComponents.get(moduleName)) {
                    resolvedComponents.set(moduleName, cjsModuleObject.moduleExports);
                } else if (executionResult !== voidValue || !usesExportsArgument) {
                    resolvedComponents.set(moduleName, executionResult);
                }
            }
        } else if (moduleName) {
            resolvedComponents.set(moduleName, definitionLogic);
        }
        inProgressComponents.delete(moduleName);
    };

    componentLoader = fetchComponent = (dependencyList, completionHandler, contextualID, synchronousExecution, fallbackValue) => {
        if (typeof dependencyList === 'string') {
            if (specialHandlers.has(dependencyList)) {
                return specialHandlers.get(dependencyList)(completionHandler);
            }
            return retrieveComponent(constructReference(dependencyList, completionHandler).complete);
        } else if (!Array.isArray(dependencyList)) {
            loaderSettings = deepConvertObjectToMap(dependencyList);
            if (Array.isArray(completionHandler)) {
                dependencyList = completionHandler;
                completionHandler = contextualID;
                contextualID = null;
            } else {
                dependencyList = voidValue;
            }
        }

        completionHandler = completionHandler || (() => {});

        if (typeof contextualID === 'function') {
            contextualID = synchronousExecution;
            synchronousExecution = fallbackValue;
        }

        if (synchronousExecution) {
            processModuleDefinition(voidValue, dependencyList, completionHandler, contextualID);
        } else {
            Promise.resolve().then(() => {
                processModuleDefinition(voidValue, dependencyList, completionHandler, contextualID);
            });
        }

        return fetchComponent;
    };

    fetchComponent.configure = (configObj) => {
        loaderSettings = deepConvertObjectToMap(configObj);
        if (loaderSettings.has('deps')) {
            fetchComponent(loaderSettings.get('deps'), loaderSettings.get('callback'));
        }
        return fetchComponent;
    };

    declareComponent = (moduleLabel, dependencyArray, componentBuilder) => {
        if (!Array.isArray(dependencyArray)) {
            componentBuilder = dependencyArray;
            dependencyArray = [];
        }

        if (!resolvedComponents.has(moduleLabel) && !pendingDeclarations.has(moduleLabel)) {
            pendingDeclarations.set(moduleLabel, [moduleLabel, dependencyArray, componentBuilder]);
        }
    };

    declareComponent.amd = {
        jQuery: true
    };
}(undefined));