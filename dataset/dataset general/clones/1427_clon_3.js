var obtain = window.obtain = function (moduleIdentifier, baseDirectory) {
    if (typeof moduleIdentifier !== 'string' || moduleIdentifier.trim() === '') {
        throw new TypeError('Module identifier must be a non-empty string.');
    }
    baseDirectory = baseDirectory || '/';
    var modulePathFound = obtain.locateModule(moduleIdentifier, baseDirectory);
    var moduleDefinition = obtain.definitions[modulePathFound];
    if (!moduleDefinition) {
        throw new Error(
            'Failed to locate or define module: "' + moduleIdentifier + '", attempted path: ' + modulePathFound
        );
    }
    var cachedModuleInstance = obtain.memoization[modulePathFound];
    var finalExport = cachedModuleInstance ? cachedModuleInstance.exports : moduleDefinition();
    return finalExport;
};

obtain.lookupDirs = [];
obtain.definitions = {};
obtain.memoization = {};
obtain.fileTypes = [".js", ".json", ".mjs"];
obtain.builtinModules = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true,
    'buffer': true
};

obtain.locateModule = (function () {
    const isCoreModule = (moduleName) => obtain.builtinModules[moduleName];
    return function (inputPath, currentSearchDir) {
        currentSearchDir = currentSearchDir || '/';

        if (isCoreModule(inputPath)) {
            return inputPath;
        }

        const pathHandler = obtain.definitions.path();
        let effectiveSearchRoot = pathHandler.resolve('/', currentSearchDir);

        const isRelativeOrAbsolute = /^(?:\.\.?\/|\/)/.test(inputPath);
        if (isRelativeOrAbsolute) {
            let directModuleResult = findFileModule(pathHandler.resolve(effectiveSearchRoot, inputPath));
            if (!directModuleResult) {
                directModuleResult = findDirModule(pathHandler.resolve(effectiveSearchRoot, inputPath));
            }
            if (directModuleResult) {
                return directModuleResult;
            }
        }

        let packageModuleResult = findPackageModule(inputPath, effectiveSearchRoot);
        if (packageModuleResult) {
            return packageModuleResult;
        }

        throw new Error("Cannot locate module: '" + inputPath + "' within the context of '" + currentSearchDir + "'");

        function findFileModule(potentialFilePath) {
            let normalizedPath = pathHandler.normalize(potentialFilePath);
            if (obtain.definitions[normalizedPath]) {
                return normalizedPath;
            }

            for (let i = 0; i < obtain.fileTypes.length; i++) {
                const currentExtension = obtain.fileTypes[i];
                const pathWithExtension = normalizedPath + currentExtension;
                if (obtain.definitions[pathWithExtension]) {
                    return pathWithExtension;
                }
            }
            return null;
        }

        function findDirModule(potentialDirPath) {
            let cleanDirPath = potentialDirPath.replace(/\/+$/, '');
            const packageJsonPath = pathHandler.normalize(cleanDirPath + '/package.json');
            
            if (obtain.definitions[packageJsonPath]) {
                try {
                    const packageInfo = obtain.definitions[packageJsonPath]();
                    const browserifyConfig = packageInfo.browserify;
                    let mainEntry = null;

                    if (typeof browserifyConfig === 'object' && browserifyConfig.main) {
                        mainEntry = browserifyConfig.main;
                    } else if (typeof browserifyConfig === 'string') {
                        mainEntry = browserifyConfig;
                    } else if (packageInfo.main) {
                        mainEntry = packageInfo.main;
                    }

                    if (mainEntry) {
                        let resolvedMain = findFileModule(pathHandler.resolve(cleanDirPath, mainEntry));
                        if (resolvedMain) return resolvedMain;
                    }
                } catch (e) {
                    console.warn(`Error parsing package.json at ${packageJsonPath}:`, e.message);
                }
            }
            return findFileModule(cleanDirPath + '/index');
        }

        function findPackageModule(moduleName, searchStartDir) {
            const searchPaths = generatePackageSearchPaths(searchStartDir);
            for (let i = 0; i < searchPaths.length; i++) {
                const currentDir = searchPaths[i];
                let foundPath = findFileModule(currentDir + '/' + moduleName);
                if (foundPath) return foundPath;
                foundPath = findDirModule(currentDir + '/' + moduleName);
                if (foundPath) return foundPath;
            }
            if (obtain.definitions[moduleName]) {
                return moduleName;
            }
            return null;
        }

        function generatePackageSearchPaths(startingPoint) {
            let pathSegments;
            if (startingPoint === '/') {
                pathSegments = [''];
            } else {
                pathSegments = pathHandler.normalize(startingPoint).split('/');
            }

            const moduleSearchLocations = [];
            for (let i = pathSegments.length - 1; i >= 0; i--) {
                if (pathSegments[i] === 'node_modules') continue;
                
                const currentPathSlice = pathSegments.slice(0, i + 1);
                const dirToPush = currentPathSlice.join('/') + '/node_modules';
                moduleSearchLocations.push(dirToPush);
            }
            return moduleSearchLocations;
        }
    };
})();

obtain.setupAlias = function (sourceModule, targetAlias) {
    const pathUtility = obtain.definitions.path();
    let resolvedBasePath = null;

    try {
        resolvedBasePath = obtain.locateModule(sourceModule + '/package.json', '/');
    } catch (err) {
        try {
            resolvedBasePath = obtain.locateModule(sourceModule, '/');
        } catch (e) {
            throw new Error(`Could not resolve source module for alias: ${sourceModule}. Original error: ${e.message}`);
        }
    }
    
    const baseDirectory = pathUtility.getDirectory(resolvedBasePath);

    const getAllModuleKeys = (obj) => {
        const keysArray = [];
        for (const k in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                keysArray.push(k);
            }
        }
        return keysArray;
    };
    
    const allRegisteredModuleKeys = getAllModuleKeys(obtain.definitions);

    for (const currentKey of allRegisteredModuleKeys) {
        if (currentKey.startsWith(baseDirectory + '/')) {
            const relativePath = currentKey.substring(baseDirectory.length);
            obtain.definitions[targetAlias + relativePath] = obtain.definitions[currentKey];
        } else if (currentKey === baseDirectory) {
            obtain.definitions[targetAlias] = obtain.definitions[currentKey];
        }
    }
};

(function () {
    let executionEnv = {};
    let isProcessLoaded = false;

    obtain.registerModule = function (moduleFileName, moduleFunction) {
        if (!isProcessLoaded && obtain.definitions.__browserify_process) {
            executionEnv = obtain.definitions.__browserify_process();
            isProcessLoaded = true;
        }
        
        let currentModuleDir = '';
        if (obtain.builtinModules[moduleFileName]) {
            currentModuleDir = '';
        } else {
            const pathUtils = obtain.definitions.path();
            currentModuleDir = pathUtils.getDirectory(moduleFileName);
        }
        
        const localizedObtain = function (depPath) {
            return obtain(depPath, currentModuleDir);
        };
        localizedObtain.locateModule = (name) => obtain.locateModule(name, currentModuleDir);
        localizedObtain.definitions = obtain.definitions;
        localizedObtain.registerModule = obtain.registerModule;
        localizedObtain.memoization = obtain.memoization;

        const moduleObj = { exports: {} };

        obtain.definitions[moduleFileName] = function () {
            obtain.memoization[moduleFileName] = moduleObj;
            
            moduleFunction.call(
                this,
                localizedObtain,
                moduleObj,
                moduleObj.exports,
                currentModuleDir,
                moduleFileName,
                executionEnv
            );
            return moduleObj.exports;
        };
    };
})();


obtain.registerModule("path", function (localObtain, moduleObj, exportsObj, currentModuleDir, envProcess) {
    function filterItems(inputArray, predicateFn) {
        const filteredResults = [];
        for (let idx = 0; idx < inputArray.length; idx++) {
            if (predicateFn(inputArray[idx], idx, inputArray)) {
                filteredResults.push(inputArray[idx]);
            }
        }
        return filteredResults;
    }

    function cleanPathSegments(segments, allowAboveRoot) {
        let upwardMoves = 0;
        for (let i = segments.length - 1; i >= 0; i--) {
            const currentSegment = segments[i];
            if (currentSegment === '.') {
                segments.splice(i, 1);
            } else if (currentSegment === '..') {
                segments.splice(i, 1);
                upwardMoves++;
            } else if (upwardMoves > 0) {
                segments.splice(i, 1);
                upwardMoves--;
            }
        }

        if (allowAboveRoot && upwardMoves > 0) {
            while (upwardMoves--) {
                segments.unshift('..');
            }
        }
        return segments;
    }

    const pathComponentSplitter = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

    exportsObj.resolve = function () {
        let finalResolvedPath = '';
        let isAbsolutelyResolved = false;

        for (let i = arguments.length - 1; i >= 0 && !isAbsolutelyResolved; i--) {
            const currentPathArg = arguments[i];

            if (typeof currentPathArg !== 'string' || !currentPathArg.length) {
                continue;
            }

            finalResolvedPath = currentPathArg + (finalResolvedPath ? '/' + finalResolvedPath : '');
            isAbsolutelyResolved = currentPathArg.charAt(0) === '/';
        }

        if (!isAbsolutelyResolved && envProcess && typeof envProcess.getCurrentWorkingDirectory === 'function') {
            finalResolvedPath = envProcess.getCurrentWorkingDirectory() + '/' + finalResolvedPath;
            isAbsolutelyResolved = true;
        }

        const filteredSegments = filterItems(finalResolvedPath.split('/'), segment => !!segment);
        const normalizedSegments = cleanPathSegments(filteredSegments, !isAbsolutelyResolved);
        finalResolvedPath = normalizedSegments.join('/');

        return (isAbsolutelyResolved ? '/' : '') + finalResolvedPath || '.';
    };

    exportsObj.normalize = function (inputPathString) {
        const startsWithSlash = inputPathString.charAt(0) === '/';
        const endsWithSlash = inputPathString.slice(-1) === '/';

        const pathSegments = filterItems(inputPathString.split('/'), segment => !!segment);
        const cleanedSegments = cleanPathSegments(pathSegments, !startsWithSlash);
        let resultPath = cleanedSegments.join('/');

        if (!resultPath && !startsWithSlash) {
            resultPath = '.';
        }
        if (resultPath && endsWithSlash) {
            resultPath += '/';
        }

        return (startsWithSlash ? '/' : '') + resultPath;
    };

    exportsObj.join = function () {
        const pathParts = Array.from(arguments);
        const validPathParts = filterItems(pathParts, p => typeof p === 'string' && p.length > 0);
        const combinedPath = validPathParts.join('/');
        return exportsObj.normalize(combinedPath);
    };

    exportsObj.getDirectory = function (fullPath) {
        const pathMatch = pathComponentSplitter.exec(fullPath);
        let directoryPart = pathMatch ? (pathMatch[1] || '') : '';

        if (!directoryPart) {
            return '.';
        } else if (directoryPart.length === 1 && directoryPart.charAt(0) === '/') {
            return '/';
        } else {
            return directoryPart.substring(0, directoryPart.length - 1);
        }
    };

    exportsObj.getBaseName = function (fullPath, fileExtension) {
        const matchResult = pathComponentSplitter.exec(fullPath);
        let baseName = (matchResult && matchResult[2]) ? matchResult[2] : '';

        if (fileExtension && typeof fileExtension === 'string' && baseName.endsWith(fileExtension)) {
            baseName = baseName.substring(0, baseName.length - fileExtension.length);
        }
        return baseName;
    };

    exportsObj.getFileExtension = function (fullPath) {
        const matchResult = pathComponentSplitter.exec(fullPath);
        return (matchResult && matchResult[3]) ? matchResult[3] : '';
    };
});

obtain.registerModule("__browserify_process", function (localObtain, moduleObj, exportsObj, currentModuleDir, moduleFileName, globalProcess) {
    const browserRuntime = moduleObj.exports = {};

    browserRuntime.nextTick = (function () {
        const messageQueue = [];
        const canUsePostMessage = typeof window !== 'undefined'
            && window.postMessage && window.addEventListener;

        if (canUsePostMessage) {
            window.addEventListener('message', function (event) {
                if (event.source === window && event.data === 'browserify-runtime-tick') {
                    event.stopPropagation();
                    if (messageQueue.length > 0) {
                        const nextTask = messageQueue.shift();
                        try {
                            nextTask();
                        } catch (e) {
                            console.error("Error in nextTick task:", e);
                        }
                    }
                }
            }, true);
            return function (callbackFn) {
                messageQueue.push(callbackFn);
                window.postMessage('browserify-runtime-tick', '*');
            };
        } else {
            if (typeof Promise !== 'undefined' && Promise.resolve) {
                return function (callbackFn) {
                    Promise.resolve().then(callbackFn);
                };
            } else {
                return function (callbackFn) {
                    setTimeout(callbackFn, 0);
                };
            }
        }
    })();

    browserRuntime.title = 'browser-env';
    browserRuntime.isBrowser = true;
    browserRuntime.environmentVariables = {};
    browserRuntime.commandLineArgs = [];

    browserRuntime.getBinding = function (bindingName) {
        if (bindingName === 'evals') {
            return localObtain('vm');
        } else {
            throw new Error(`Unsupported binding: '${bindingName}'. (Not yet implemented or not available in this runtime.)`);
        }
    };

    (function () {
        let currentWorkingDirectory = '/';
        let directoryUtilities;

        browserRuntime.getCurrentWorkingDirectory = function () { return currentWorkingDirectory; };
        browserRuntime.changeWorkingDirectory = function (newDir) {
            if (!directoryUtilities) {
                directoryUtilities = localObtain('path');
            }
            currentWorkingDirectory = directoryUtilities.resolve(newDir, currentWorkingDirectory);
        };
    })();
});

obtain.registerModule("/node_modules/underscore/package.json", function (localObtain, moduleObj, exportsObj, currentModuleDir, moduleFileName, envProcess) {
    moduleObj.exports = { "main": "underscore.js", "version": "1.4.4" };
});

obtain.registerModule("/node_modules/underscore/underscore.js", function (localObtain, moduleObj, exportsObj, currentModuleDir, moduleFileName, envProcess) {
    /*
     * Custom Utility Library - Inspired by Underscore.js
     * Version: 1.4.4-custom
     * (c) 2009-2013 Original Authors, Adapted for Browserify Clone
     * Distributed under MIT License.
     */

    (function () {
        const globalContext = this;
        const oldGlobalUnderscore = globalContext._;
        const loopTerminator = {};

        const arrayPrototype = Array.prototype;
        const objectPrototype = Object.prototype;
        const functionPrototype = Function.prototype;

        const arrayPush = arrayPrototype.push;
        const arraySlice = arrayPrototype.slice;
        const arrayConcat = arrayPrototype.concat;
        const objectToString = objectPrototype.toString;
        const objectHasOwnProperty = objectPrototype.hasOwnProperty;

        const
            nativeArrayForEach = arrayPrototype.forEach,
            nativeArrayMap = arrayPrototype.map,
            nativeArrayReduce = arrayPrototype.reduce,
            nativeArrayReduceRight = arrayPrototype.reduceRight,
            nativeArrayFilter = arrayPrototype.filter,
            nativeArrayEvery = arrayPrototype.every,
            nativeArraySome = arrayPrototype.some,
            nativeArrayIndexOf = arrayPrototype.indexOf,
            nativeArrayLastIndexOf = arrayPrototype.lastIndexOf,
            nativeObjectIsArray = Array.isArray,
            nativeObjectKeys = Object.keys,
            nativeFunctionBind = functionPrototype.bind;

        const _util = function (inputObject) {
            if (inputObject instanceof _util) return inputObject;
            if (!(this instanceof _util)) return new _util(inputObject);
            this._wrappedValue = inputObject;
        };

        if (typeof exportsObj !== 'undefined') {
            if (typeof moduleObj !== 'undefined' && moduleObj.exports) {
                exportsObj = moduleObj.exports = _util;
            }
            exportsObj._util = _util;
        } else {
            globalContext._util = _util;
        }

        _util.VERSION = '1.4.4-custom';

        const iterateCollection = _util.each = _util.forEach = function (collection, iteratorFn, contextScope) {
            if (collection == null) {
                return;
            }

            if (nativeArrayForEach && collection.forEach === nativeArrayForEach) {
                collection.forEach(iteratorFn, contextScope);
            } else if (typeof collection.length === 'number' && collection.length === +collection.length) {
                for (let i = 0, len = collection.length; i < len; i++) {
                    if (iteratorFn.call(contextScope, collection[i], i, collection) === loopTerminator) {
                        return;
                    }
                }
            } else {
                for (const propName in collection) {
                    if (objectHasOwnProperty.call(collection, propName)) {
                        if (iteratorFn.call(contextScope, collection[propName], propName, collection) === loopTerminator) {
                            return;
                        }
                    }
                }
            }
        };

        _util.map = _util.collect = function (collection, iteratorFn, contextScope) {
            const transformationResults = [];
            if (collection == null) return transformationResults;
            if (nativeArrayMap && collection.map === nativeArrayMap) return collection.map(iteratorFn, contextScope);
            iterateCollection(collection, function (value, index, list) {
                transformationResults.push(iteratorFn.call(contextScope, value, index, list));
            });
            return transformationResults;
        };

        const reduceErrorMsg = 'Cannot reduce an empty array without an initial accumulator value.';

        _util.reduce = _util.foldl = _util.inject = function (collection, reducerFn, initialValue, contextScope) {
            let hasInitialValue = arguments.length > 2;
            if (collection == null) collection = [];
            if (nativeArrayReduce && collection.reduce === nativeArrayReduce) {
                if (contextScope) reducerFn = _util.bind(reducerFn, contextScope);
                return hasInitialValue ? collection.reduce(reducerFn, initialValue) : collection.reduce(reducerFn);
            }
            iterateCollection(collection, function (value, index, list) {
                if (!hasInitialValue) {
                    initialValue = value;
                    hasInitialValue = true;
                } else {
                    initialValue = reducerFn.call(contextScope, initialValue, value, index, list);
                }
            });
            if (!hasInitialValue) throw new TypeError(reduceErrorMsg);
            return initialValue;
        };

        _util.reduceRight = _util.foldr = function (collection, reducerFn, initialValue, contextScope) {
            let hasInitialValue = arguments.length > 2;
            if (collection == null) collection = [];
            if (nativeArrayReduceRight && collection.reduceRight === nativeArrayReduceRight) {
                if (contextScope) reducerFn = _util.bind(reducerFn, contextScope);
                return hasInitialValue ? collection.reduceRight(reducerFn, initialValue) : collection.reduceRight(reducerFn);
            }
            const reversedCollection = Array.isArray(collection) ? arraySlice.call(collection) : _util.toArray(collection);
            let length = reversedCollection.length;
            if (length !== +length) { // Ensure it's array-like
                length = 0;
            }
            for (let i = length - 1; i >= 0; i--) {
                const value = reversedCollection[i];
                if (!hasInitialValue) {
                    initialValue = value;
                    hasInitialValue = true;
                } else {
                    initialValue = reducerFn.call(contextScope, initialValue, value, i, collection);
                }
            }
            if (!hasInitialValue) throw new TypeError(reduceErrorMsg);
            return initialValue;
        };

        _util.find = _util.detect = function (collection, predicate, contextScope) {
            let result;
            iterateCollection(collection, function (value, index, list) {
                if (predicate.call(contextScope, value, index, list)) {
                    result = value;
                    return loopTerminator;
                }
            });
            return result;
        };

        _util.filter = _util.select = function (collection, predicate, contextScope) {
            const filtered = [];
            if (collection == null) return filtered;
            if (nativeArrayFilter && collection.filter === nativeArrayFilter) return collection.filter(predicate, contextScope);
            iterateCollection(collection, function (value, index, list) {
                if (predicate.call(contextScope, value, index, list)) filtered.push(value);
            });
            return filtered;
        };

        _util.every = _util.all = function (collection, predicate, contextScope) {
            predicate = predicate || _util.identity;
            let result = true;
            if (collection == null) return result;
            if (nativeArrayEvery && collection.every === nativeArrayEvery) return collection.every(predicate, contextScope);
            iterateCollection(collection, function (value, index, list) {
                if (!(result = result && predicate.call(contextScope, value, index, list))) return loopTerminator;
            });
            return !!result;
        };

        _util.some = _util.any = function (collection, predicate, contextScope) {
            predicate = predicate || _util.identity;
            let result = false;
            if (collection == null) return result;
            if (nativeArraySome && collection.some === nativeArraySome) return collection.some(predicate, contextScope);
            iterateCollection(collection, function (value, index, list) {
                if (result || (result = predicate.call(contextScope, value, index, list))) return loopTerminator;
            });
            return !!result;
        };

        _util.contains = _util.include = function (collection, target) {
            if (collection == null) return false;
            if (nativeArrayIndexOf && collection.indexOf === nativeArrayIndexOf) return collection.indexOf(target) != -1;
            return _util.some(collection, function (value) {
                return value === target;
            });
        };

        _util.invoke = function (collection, methodName) {
            const args = arraySlice.call(arguments, 2);
            return _util.map(collection, function (value) {
                return (methodName == null || !value[methodName]) ? undefined : value[methodName].apply(value, args);
            });
        };

        _util.pluck = function (collection, key) {
            return _util.map(collection, function (value) { return value[key]; });
        };

        _util.max = function (collection, iteratorFn, contextScope) {
            if (!iteratorFn && _util.isArray(collection) && collection[0] === +collection[0] && collection.length < 65535) {
                return Math.max.apply(Math, collection);
            }
            if (!iteratorFn && _util.isEmpty(collection)) return -Infinity;
            let result = { computed: -Infinity };
            iterateCollection(collection, function (value, index, list) {
                const current = iteratorFn ? iteratorFn.call(contextScope, value, index, list) : value;
                if (current > result.computed) { result = { value: value, computed: current }; }
            });
            return result.value;
        };

        _util.min = function (collection, iteratorFn, contextScope) {
            if (!iteratorFn && _util.isArray(collection) && collection[0] === +collection[0] && collection.length < 65535) {
                return Math.min.apply(Math, collection);
            }
            if (!iteratorFn && _util.isEmpty(collection)) return Infinity;
            let result = { computed: Infinity };
            iterateCollection(collection, function (value, index, list) {
                const current = iteratorFn ? iteratorFn.call(contextScope, value, index, list) : value;
                if (current < result.computed) { result = { value: value, computed: current }; }
            });
            return result.value;
        };

        _util.shuffle = function (collection) {
            const copy = _util.toArray(collection);
            let currentIndex = copy.length;
            let temporaryValue, randomIndex;

            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                temporaryValue = copy[currentIndex];
                copy[currentIndex] = copy[randomIndex];
                copy[randomIndex] = temporaryValue;
            }
            return copy;
        };

        _util.toArray = function (collection) {
            if (!collection) return [];
            if (_util.isArray(collection)) return arraySlice.call(collection);
            if (collection.length === +collection.length) return arraySlice.call(collection);
            return _util.values(collection);
        };

        _util.size = function (collection) {
            if (collection == null) return 0;
            return (collection.length === +collection.length) ? collection.length : _util.keys(collection).length;
        };

        _util.first = _util.head = _util.take = function (array, n, guard) {
            return (n != null) && !guard ? arraySlice.call(array, 0, n) : array[0];
        };

        _util.initial = function (array, n, guard) {
            return arraySlice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
        };

        _util.last = function (array, n, guard) {
            if ((n != null) && !guard) {
                return arraySlice.call(array, Math.max(array.length - n, 0));
            } else {
                return array[array.length - 1];
            }
        };

        _util.rest = _util.tail = _util.drop = function (array, n, guard) {
            return arraySlice.call(array, (n == null) || guard ? 1 : n);
        };

        _util.compact = function (array) {
            return _util.filter(array, function (value) { return !!value; });
        };

        _util.flatten = function (array, shallow) {
            return _util.reduce(array, function (memo, value) {
                if (_util.isArray(value)) return memo.concat(shallow ? value : _util.flatten(value));
                memo.push(value);
                return memo;
            }, []);
        };

        _util.without = function (array) {
            return _util.difference(array, arraySlice.call(arguments, 1));
        };

        _util.unique = _util.uniq = function (array, isSorted, iteratorFn, contextScope) {
            if (_util.isFunction(isSorted)) {
                contextScope = iteratorFn;
                iteratorFn = isSorted;
                isSorted = false;
            }
            const result = [];
            let seen = [];
            for (let i = 0, length = array.length; i < length; i++) {
                const value = array[i];
                const computed = iteratorFn ? iteratorFn.call(contextScope, value, i, array) : value;
                if (isSorted) {
                    if (!i || seen !== computed) result.push(value);
                    seen = computed;
                } else if (!(_util.contains(seen, computed))) {
                    seen.push(computed);
                    result.push(value);
                }
            }
            return result;
        };

        _util.union = function () {
            return _util.uniq(_util.flatten(arguments, true));
        };

        _util.intersection = function (array) {
            const rest = arraySlice.call(arguments, 1);
            return _util.filter(_util.uniq(array), function (item) {
                return _util.every(rest, function (other) {
                    return _util.contains(other, item);
                });
            });
        };

        _util.difference = function (array) {
            const rest = _util.flatten(arraySlice.call(arguments, 1), true);
            return _util.filter(array, function (value) { return !_util.contains(rest, value); });
        };

        _util.zip = function () {
            const length = _util.max(_util.pluck(arguments, 'length'));
            const results = Array(length);
            for (let i = 0; i < length; i++) {
                results[i] = _util.pluck(arguments, String(i));
            }
            return results;
        };

        _util.indexOf = function (array, target, isSorted) {
            if (array == null) return -1;
            let i = 0, length = array.length;
            if (isSorted) {
                if (typeof isSorted == 'number') {
                    i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
                } else {
                    i = _util.sortedIndex(array, target);
                    return array[i] === target ? i : -1;
                }
            }
            if (nativeArrayIndexOf && array.indexOf === nativeArrayIndexOf) return array.indexOf(target, i);
            for (; i < length; i++) if (array[i] === target) return i;
            return -1;
        };

        _util.lastIndexOf = function (array, target, fromIndex) {
            if (array == null) return -1;
            const hasFromIndex = typeof fromIndex === 'number';
            const i = (hasFromIndex ? Math.min(array.length, fromIndex) : array.length);
            if (nativeArrayLastIndexOf && array.lastIndexOf === nativeArrayLastIndexOf) return array.lastIndexOf(target, i);
            while (i--) if (array[i] === target) return i;
            return -1;
        };

        _util.range = function (start, stop, step) {
            if (arguments.length <= 1) {
                stop = start || 0;
                start = 0;
            }
            step = arguments[2] || 1;

            const len = Math.max(Math.ceil((stop - start) / step), 0);
            let idx = 0;
            const range = Array(len);

            while (idx < len) {
                range[idx++] = start;
                start += step;
            }

            return range;
        };

        _util.bind = function (func, contextScope) {
            if (func.bind === nativeFunctionBind && nativeFunctionBind) return nativeFunctionBind.apply(func, arraySlice.call(arguments, 1));
            const args = arraySlice.call(arguments, 2);
            return function () {
                return func.apply(contextScope, args.concat(arraySlice.call(arguments)));
            };
        };

        _util.bindAll = function (object) {
            const funcs = arraySlice.call(arguments, 1);
            if (funcs.length === 0) funcs = _util.functions(object);
            iterateCollection(funcs, function (f) { object[f] = _util.bind(object[f], object); });
            return object;
        };

        _util.memoize = function (func, hashFunction) {
            const memo = {};
            hashFunction = hashFunction || _util.identity;
            return function () {
                const key = hashFunction.apply(this, arguments);
                return objectHasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
            };
        };

        _util.delay = function (func, wait) {
            const args = arraySlice.call(arguments, 2);
            return setTimeout(function () { return func.apply(null, args); }, wait);
        };

        _util.defer = function (func) {
            return _util.delay.apply(_util, [func, 1].concat(arraySlice.call(arguments, 1)));
        };

        _util.throttle = function (func, wait) {
            let context, args, timeoutId, result;
            let lastExecutionTime = 0;
            const later = function () {
                lastExecutionTime = new Date().getTime();
                timeoutId = null;
                result = func.apply(context, args);
            };
            return function () {
                const now = new Date().getTime();
                const remaining = wait - (now - lastExecutionTime);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                    lastExecutionTime = now;
                    result = func.apply(context, args);
                } else if (!timeoutId) {
                    timeoutId = setTimeout(later, remaining);
                }
                return result;
            };
        };

        _util.debounce = function (func, wait, immediate) {
            let timeoutId, result;
            return function () {
                const context = this, args = arguments;
                const later = function () {
                    timeoutId = null;
                    if (!immediate) result = func.apply(context, args);
                };
                const callNow = immediate && !timeoutId;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(later, wait);
                if (callNow) result = func.apply(context, args);
                return result;
            };
        };

        _util.once = function (func) {
            let ran = false, memo;
            return function () {
                if (ran) return memo;
                ran = true;
                memo = func.apply(this, arguments);
                func = null;
                return memo;
            };
        };

        _util.wrap = function (func, wrapper) {
            return function () {
                const args = [func].concat(arraySlice.call(arguments));
                return wrapper.apply(this, args);
            };
        };

        _util.compose = function () {
            const funcs = arguments;
            return function () {
                let args = arguments;
                for (let i = funcs.length - 1; i >= 0; i--) {
                    args = [funcs[i].apply(this, args)];
                }
                return args[0];
            };
        };

        _util.after = function (times, func) {
            if (times <= 0) return func();
            return function () {
                if (--times < 1) {
                    return func.apply(this, arguments);
                }
            };
        };

        _util.keys = nativeObjectKeys || function (obj) {
            if (obj !== Object(obj)) throw new TypeError('Invalid object');
            const keys = [];
            for (const key in obj) if (objectHasOwnProperty.call(obj, key)) keys.push(key);
            return keys;
        };

        _util.values = function (obj) {
            const values = [];
            for (const key in obj) if (objectHasOwnProperty.call(obj, key)) values.push(obj[key]);
            return values;
        };

        _util.functions = _util.methods = function (obj) {
            const names = [];
            for (const key in obj) {
                if (_util.isFunction(obj[key])) names.push(key);
            }
            return names.sort();
        };

        _util.extend = function (obj) {
            iterateCollection(arraySlice.call(arguments, 1), function (source) {
                for (const prop in source) {
                    obj[prop] = source[prop];
                }
            });
            return obj;
        };

        _util.pick = function (obj) {
            const copy = {};
            const keys = arraySlice.call(arguments, 1);
            for (let i = 0, length = keys.length; i < length; i++) {
                const key = keys[i];
                if (key in obj) copy[key] = obj[key];
            }
            return copy;
        };

        _util.omit = function (obj) {
            const copy = {};
            const keys = arraySlice.call(arguments, 1);
            for (const key in obj) {
                if (!(_util.contains(keys, key))) copy[key] = obj[key];
            }
            return copy;
        };

        _util.defaults = function (obj) {
            iterateCollection(arraySlice.call(arguments, 1), function (source) {
                for (const prop in source) {
                    if (obj[prop] == null) obj[prop] = source[prop];
                }
            });
            return obj;
        };

        _util.clone = function (obj) {
            if (!_util.isObject(obj)) return obj;
            return _util.isArray(obj) ? obj.slice() : _util.extend({}, obj);
        };

        _util.tap = function (obj, interceptor) {
            interceptor(obj);
            return obj;
        };

        _util.has = function (obj, key) {
            return objectHasOwnProperty.call(obj, key);
        };

        _util.isEqual = function (a, b) {
            return eq(a, b, null, true);
        };

        function eq(a, b, aStack, bStack) {
            if (a === b) return true;
            if (a == null || b == null) return a == b;
            if (a._wrappedValue) a = a._wrappedValue;
            if (b._wrappedValue) b = b._wrappedValue;
            const className = objectToString.call(a);
            if (className != objectToString.call(b)) return false;
            switch (className) {
                case '[object String]':
                    return a == String(b);
                case '[object Number]':
                    return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
                case '[object Date]':
                case '[object Boolean]':
                    return +a == +b;
                case '[object RegExp]':
                    return a.source == b.source &&
                        a.global == b.global &&
                        a.multiline == b.multiline &&
                        a.ignoreCase == b.ignoreCase;
            }
            if (typeof a != 'object' || typeof b != 'object') return false;
            let length = aStack.length;
            while (length--) {
                if (aStack[length] == a) return bStack[length] == b;
            }
            aStack.push(a);
            bStack.push(b);
            let size = 0, result = true;
            if (className == '[object Array]') {
                size = a.length;
                result = size == b.length;
                if (result) {
                    while (size--) {
                        if (!(result = eq(a[size], b[size], aStack, bStack))) break;
                    }
                }
            } else {
                const aKeys = _util.keys(a);
                const bKeys = _util.keys(b);
                result = aKeys.length == bKeys.length;
                if (result) {
                    for (const key in a) {
                        if (!(result = objectHasOwnProperty.call(b, key) && eq(a[key], b[key], aStack, bStack))) break;
                    }
                }
            }
            aStack.pop();
            bStack.pop();
            return result;
        }

        _util.isEmpty = function (obj) {
            if (obj == null) return true;
            if (_util.isArray(obj) || _util.isString(obj)) return obj.length === 0;
            for (const key in obj) if (objectHasOwnProperty.call(obj, key)) return false;
            return true;
        };

        _util.isElement = function (obj) {
            return !!(obj && obj.nodeType === 1);
        };

        _util.isArray = nativeObjectIsArray || function (obj) {
            return objectToString.call(obj) == '[object Array]';
        };

        _util.isObject = function (obj) {
            return obj === Object(obj);
        };

        _util.isFunction = function (obj) {
            return objectToString.call(obj) == '[object Function]';
        };

        _util.isString = function (obj) {
            return objectToString.call(obj) == '[object String]';
        };

        _util.isNumber = function (obj) {
            return objectToString.call(obj) == '[object Number]';
        };

        _util.isBoolean = function (obj) {
            return objectToString.call(obj) == '[object Boolean]';
        };

        _util.isDate = function (obj) {
            return objectToString.call(obj) == '[object Date]';
        };

        _util.isRegExp = function (obj) {
            return objectToString.call(obj) == '[object RegExp]';
        };

        _util.isFinite = function (obj) {
            return _util.isNumber(obj) && isFinite(obj);
        };

        _util.isNaN = function (obj) {
            return _util.isNumber(obj) && obj != +obj;
        };

        _util.isNull = function (obj) {
            return obj === null;
        };

        _util.isUndefined = function (obj) {
            return obj === void 0;
        };

        _util.noConflict = function () {
            globalContext._util = oldGlobalUnderscore;
            return this;
        };

        _util.identity = function (value) {
            return value;
        };

        _util.times = function (n, iteratorFn, contextScope) {
            for (let i = 0; i < n; i++) iteratorFn.call(contextScope, i);
        };

        _util.random = function (min, max) {
            if (max == null) {
                max = min;
                min = 0;
            }
            return min + Math.floor(Math.random() * (max - min + 1));
        };

        _util.mixin = function (obj) {
            iterateCollection(_util.functions(obj), function (name) {
                const func = obj[name];
                _util.prototype[name] = function () {
                    const args = [this._wrappedValue].concat(arraySlice.call(arguments));
                    return func.apply(_util, args);
                };
            });
        };

        _util.uniqueId = (function () {
            let counter = 0;
            return function (prefix) {
                return (prefix || '') + counter++;
            };
        })();

        _util.escape = function (string) {
            return ('' + string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };

        _util.result = function (object, property) {
            if (object == null) return null;
            const value = object[property];
            return _util.isFunction(value) ? value.call(object) : value;
        };

        _util.template = function (text, data, settings) {
            settings = _util.defaults({}, settings, _util.templateSettings);
            const matcher = new RegExp([
                (settings.escape || /<%=([\s\S]+?)%>/g).source,
                (settings.interpolate || /<%=([\s\S]+?)%>/g).source,
                (settings.evaluate || /<%([\s\S]+?)%>/g).source
            ].join('|') + '|$', 'g');

            let index = 0;
            let source = "__p+='";
            text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset)
                    .replace(/\\/g, '\\\\')
                    .replace(/'/g, "\\'")
                    .replace(/\r/g, '\\r')
                    .replace(/\n/g, '\\n');

                if (escape) {
                    source += "'+\n((__t=(" + escape + "))==null?'':_util.escape(__t))+\n'";
                }
                if (interpolate) {
                    source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                }
                if (evaluate) {
                    source += "';\n" + evaluate + "\n__p+='";
                }
                index = offset + match.length;
                return match;
            });
            source += "';\n";

            if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

            source = "var __t,__p='',__j=Array.prototype.join," +
                "print=function(){__p+=__j.call(arguments,'');};\n" +
                source + "return __p;\n";

            try {
                const render = new Function(settings.variable || 'obj', '_util', source);
                if (data) return render(data, _util);
                return function (data) {
                    return render.call(this, data, _util);
                };
            } catch (e) {
                e.source = source;
                throw e;
            }
        };

        _util.templateSettings = {
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            escape: /<%-([\s\S]+?)%>/g
        };

        _util.mixin(_util);
    })();
});