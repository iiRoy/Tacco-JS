var scriptLoader = window.scriptLoader = function (targetFile, currentWorkingDir) {
    var foundPath = scriptLoader.locate(targetFile, currentWorkingDir || '/');
    var moduleDefinition = scriptLoader.definitions[foundPath];
    if (!moduleDefinition) {
        throw new Error(
            'Cannot find component ' + targetFile + '; attempted path: ' + foundPath
        );
    }
    var cachedEntry = scriptLoader.registry[foundPath];
    var finalResult = cachedEntry ? cachedEntry.exports : moduleDefinition();
    return finalResult;
};

scriptLoader.directories = [];
scriptLoader.definitions = {};
scriptLoader.registry = {};
scriptLoader.fileTypes = [".js", ".coffee"];

scriptLoader._builtIns = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

scriptLoader.locate = (function () {
    return function (moduleIdentifier, baseDirectory) {
        if (!baseDirectory) {
            baseDirectory = '/';
        }

        if (scriptLoader._builtIns[moduleIdentifier]) {
            return moduleIdentifier;
        }
        var pathUtility = scriptLoader.definitions.path();
        baseDirectory = pathUtility.resolve('/', baseDirectory);
        var searchStartPoint = baseDirectory || '/';

        if (moduleIdentifier.match(/^(?:\.\.?\/|\/)/)) {
            var resolvedComponent = findFileResource(pathUtility.resolve(searchStartPoint, moduleIdentifier))
                || findDirectoryResource(pathUtility.resolve(searchStartPoint, moduleIdentifier));
            if (resolvedComponent) {
                return resolvedComponent;
            }
        }

        var nodePackage = findNodeModulesResource(moduleIdentifier, searchStartPoint);
        if (nodePackage) {
            return nodePackage;
        }

        throw new Error("Unable to locate component '" + moduleIdentifier + "'");

        function findFileResource(filePathAttempt) {
            filePathAttempt = pathUtility.normalize(filePathAttempt);
            if (scriptLoader.definitions[filePathAttempt]) {
                return filePathAttempt;
            }

            for (var extIndex = 0; extIndex < scriptLoader.fileTypes.length; extIndex++) {
                var fileExtension = scriptLoader.fileTypes[extIndex];
                if (scriptLoader.definitions[filePathAttempt + fileExtension]) return filePathAttempt + fileExtension;
            }
        }

        function findDirectoryResource(directoryPathAttempt) {
            directoryPathAttempt = directoryPathAttempt.replace(/\/+$/, '');
            var packageDescriptor = pathUtility.normalize(directoryPathAttempt + '/package.json');
            if (scriptLoader.definitions[packageDescriptor]) {
                var packageConfig = scriptLoader.definitions[packageDescriptor]();
                var browserBundleConfig = packageConfig.browserify;
                if (typeof browserBundleConfig === 'object' && browserBundleConfig.main) {
                    var foundMain = findFileResource(pathUtility.resolve(directoryPathAttempt, browserBundleConfig.main));
                    if (foundMain) return foundMain;
                }
                else if (typeof browserBundleConfig === 'string') {
                    var foundBrowserMain = findFileResource(pathUtility.resolve(directoryPathAttempt, browserBundleConfig));
                    if (foundBrowserMain) return foundBrowserMain;
                }
                else if (packageConfig.main) {
                    var foundPackageMain = findFileResource(pathUtility.resolve(directoryPathAttempt, packageConfig.main));
                    if (foundPackageMain) return foundPackageMain;
                }
            }

            return findFileResource(directoryPathAttempt + '/index');
        }

        function findNodeModulesResource(moduleNameID, searchStartingPoint) {
            var moduleSearchPaths = computeNodeModuleSearchPaths(searchStartingPoint);
            for (var pathIdx = 0; pathIdx < moduleSearchPaths.length; pathIdx++) {
                var currentSearchDir = moduleSearchPaths[pathIdx];
                var fileModuleMatch = findFileResource(currentSearchDir + '/' + moduleNameID);
                if (fileModuleMatch) return fileModuleMatch;
                var directoryModuleMatch = findDirectoryResource(currentSearchDir + '/' + moduleNameID);
                if (directoryModuleMatch) return directoryModuleMatch;
            }

            var directFileMatch = findFileResource(moduleNameID);
            if (directFileMatch) return directFileMatch;
        }

        function computeNodeModuleSearchPaths(startingLocation) {
            var pathSegments;
            if (startingLocation === '/') pathSegments = [''];
            else pathSegments = pathUtility.normalize(startingLocation).split('/');

            var moduleDirectories = [];
            for (var segmentIdx = pathSegments.length - 1; segmentIdx >= 0; segmentIdx--) {
                if (pathSegments[segmentIdx] === 'node_modules') continue;
                var currentModuleDir = pathSegments.slice(0, segmentIdx + 1).join('/') + '/node_modules';
                moduleDirectories.push(currentModuleDir);
            }

            return moduleDirectories;
        }
    };
})();

scriptLoader.mapName = function (sourceIdentifier, targetIdentifier) {
    var pathService = scriptLoader.definitions.path();
    var resolvedSourcePath = null;
    try {
        resolvedSourcePath = scriptLoader.locate(sourceIdentifier + '/package.json', '/');
    }
    catch (resolutionError) {
        resolvedSourcePath = scriptLoader.locate(sourceIdentifier, '/');
    }
    var baseSourceDirectory = pathService.dirname(resolvedSourcePath);

    var definedModuleKeys = (Object.keys || function (objectContext) {
        var collectedKeys = [];
        for (var propertyKey in objectContext) collectedKeys.push(propertyKey);
        return collectedKeys;
    })(scriptLoader.definitions);

    for (var keyIndex = 0; keyIndex < definedModuleKeys.length; keyIndex++) {
        var currentModuleKey = definedModuleKeys[keyIndex];
        if (currentModuleKey.slice(0, baseSourceDirectory.length + 1) === baseSourceDirectory + '/') {
            var relativePathSegment = currentModuleKey.slice(baseSourceDirectory.length);
            scriptLoader.definitions[targetIdentifier + relativePathSegment] = scriptLoader.definitions[baseSourceDirectory + relativePathSegment];
        }
        else if (currentModuleKey === baseSourceDirectory) {
            scriptLoader.definitions[targetIdentifier] = scriptLoader.definitions[baseSourceDirectory];
        }
    }
};

(function () {
    var runtimeEnvironmentProcess = {};

    scriptLoader.register = function (moduleFileName, moduleFactoryFunction) {
        if (scriptLoader.definitions.__browserify_process) {
            runtimeEnvironmentProcess = scriptLoader.definitions.__browserify_process();
        }

        var moduleBaseDirectory = scriptLoader._builtIns[moduleFileName]
            ? ''
            : scriptLoader.definitions.path().dirname(moduleFileName);

        var localModuleRequester = function (requestedFile) {
            return scriptLoader(requestedFile, moduleBaseDirectory);
        };
        localModuleRequester.locate = function (resourceName) {
            return scriptLoader.locate(resourceName, moduleBaseDirectory);
        };
        localModuleRequester.definitions = scriptLoader.definitions;
        localModuleRequester.register = scriptLoader.register;
        localModuleRequester.registry = scriptLoader.registry;
        var componentObject = { exports: {} };

        scriptLoader.definitions[moduleFileName] = function () {
            scriptLoader.registry[moduleFileName] = componentObject;
            moduleFactoryFunction.call(
                this,
                localModuleRequester,
                componentObject,
                componentObject.exports,
                moduleBaseDirectory,
                moduleFileName,
                runtimeEnvironmentProcess
            );
            return componentObject.exports;
        };
    };
})();


scriptLoader.register("path", function (localRequire, moduleObject, moduleExports, currentDirName, currentFileName, runtimeProcess) {
    function selectElements(inputArray, evaluationFunction) {
        var filteredResults = [];
        for (var elementIndex = 0; elementIndex < inputArray.length; elementIndex++) {
            if (evaluationFunction(inputArray[elementIndex], elementIndex, inputArray)) filteredResults.push(inputArray[elementIndex]);
        }
        return filteredResults;
    }

    function normalizePathSegments(segmentsList, allowParentTraversal) {
        var parentDirectoryCounter = 0;
        for (var segmentIdx = segmentsList.length - 1; segmentIdx >= 0; segmentIdx--) {
            var lastSegment = segmentsList[segmentIdx];
            if (lastSegment == '.') {
                segmentsList.splice(segmentIdx, 1);
            } else if (lastSegment === '..') {
                segmentsList.splice(segmentIdx, 1);
                parentDirectoryCounter++;
            } else if (parentDirectoryCounter) {
                segmentsList.splice(segmentIdx, 1);
                parentDirectoryCounter--;
            }
        }

        if (allowParentTraversal) {
            while (parentDirectoryCounter--) {
                segmentsList.unshift('..');
            }
        }

        return segmentsList;
    }

    var posixPathSplitter = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

    moduleExports.resolve = function () {
        var finalResolvedPath = '',
            isPathAbsoluteFinal = false;

        for (var argIndex = arguments.length; argIndex >= -1 && !isPathAbsoluteFinal; argIndex--) {
            var currentPathSegment = (argIndex >= 0)
                ? arguments[argIndex]
                : runtimeProcess.cwd();

            if (typeof currentPathSegment !== 'string' || !currentPathSegment) {
                continue;
            }

            finalResolvedPath = currentPathSegment + '/' + finalResolvedPath;
            isPathAbsoluteFinal = currentPathSegment.charAt(0) === '/';
        }

        finalResolvedPath = normalizePathSegments(selectElements(finalResolvedPath.split('/'), function (segmentPiece) {
            return !!segmentPiece;
        }), !isPathAbsoluteFinal).join('/');

        return ((isPathAbsoluteFinal ? '/' : '') + finalResolvedPath) || '.';
    };

    moduleExports.normalize = function (inputPath) {
        var isPathAbsolute = inputPath.charAt(0) === '/',
            hasTrailingSlash = inputPath.slice(-1) === '/';

        inputPath = normalizePathSegments(selectElements(inputPath.split('/'), function (pathPart) {
            return !!pathPart;
        }), !isPathAbsolute).join('/');

        if (!inputPath && !isPathAbsolute) {
            inputPath = '.';
        }
        if (inputPath && hasTrailingSlash) {
            inputPath += '/';
        }

        return (isPathAbsolute ? '/' : '') + inputPath;
    };


    moduleExports.join = function () {
        var pathSegmentsToJoin = Array.prototype.slice.call(arguments, 0);
        return moduleExports.normalize(selectElements(pathSegmentsToJoin, function (segmentValue, segmentIndex) {
            return segmentValue && typeof segmentValue === 'string';
        }).join('/'));
    };


    moduleExports.dirname = function (fullPath) {
        var directoryPart = posixPathSplitter.exec(fullPath)[1] || '';
        var isWindowsPlatform = false;
        if (!directoryPart) {
            return '.';
        } else if (directoryPart.length === 1 ||
            (isWindowsPlatform && directoryPart.length <= 3 && directoryPart.charAt(1) === ':')) {
            return directoryPart;
        } else {
            return directoryPart.substring(0, directoryPart.length - 1);
        }
    };


    moduleExports.basename = function (filePath, fileExtension) {
        var baseFileName = posixPathSplitter.exec(filePath)[2] || '';
        if (fileExtension && baseFileName.substr(-1 * fileExtension.length) === fileExtension) {
            baseFileName = baseFileName.substr(0, baseFileName.length - fileExtension.length);
        }
        return baseFileName;
    };


    moduleExports.extname = function (filePath) {
        return posixPathSplitter.exec(filePath)[3] || '';
    };
});

scriptLoader.register("__browserify_process", function (localRequire, moduleObject, moduleExports, currentDirName, currentFileName, runtimeProcess) {
    var browserifyProcessShim = moduleObject.exports = {};

    browserifyProcessShim.nextTick = (function () {
        var messageQueue = [];
        var supportsPostMessage = typeof window !== 'undefined'
            && window.postMessage && window.addEventListener;

        if (supportsPostMessage) {
            window.addEventListener('message', function (eventMessage) {
                if (eventMessage.source === window && eventMessage.data === 'browserify-tick') {
                    eventMessage.stopPropagation();
                    if (messageQueue.length > 0) {
                        var nextCallback = messageQueue.shift();
                        nextCallback();
                    }
                }
            }, true);
        }

        return function (callbackFunction) {
            if (supportsPostMessage) {
                messageQueue.push(callbackFunction);
                window.postMessage('browserify-tick', '*');
            }
            else setTimeout(callbackFunction, 0);
        };
    })();

    browserifyProcessShim.title = 'browser';
    browserifyProcessShim.browser = true;
    browserifyProcessShim.env = {};
    browserifyProcessShim.argv = [];

    browserifyProcessShim.binding = function (bindingName) {
        if (bindingName === 'evals') return (localRequire)('vm');
        else throw new Error('Module binding not found. (Perhaps not initialized)');
    };

    (function () {
        var currentWorkingLocation = '/';
        var pathServiceUtil;
        browserifyProcessShim.cwd = function () { return currentWorkingLocation; };
        browserifyProcessShim.chdir = function (targetDirectory) {
            if (!pathServiceUtil) pathServiceUtil = localRequire('path');
            currentWorkingLocation = pathServiceUtil.resolve(targetDirectory, currentWorkingLocation);
        };
    })();
});

scriptLoader.register("/node_modules/underscore/package.json", function (localRequire, moduleObject, moduleExports, currentDirName, currentFileName, runtimeProcess) {
    moduleObject.exports = { "main": "underscore.js" };
});

scriptLoader.register("/node_modules/underscore/underscore.js", function (localRequire, moduleObject, moduleExports, currentDirName, currentFileName, runtimeProcess) {
    // This is Underscore.js, version 1.4.4
    // Project homepage: http://underscorejs.org
    // Copyright (c) 2009-2013 Jeremy Ashkenas, DocumentCloud Inc.
    // Licensed under the MIT license.

    (function () {

        // Initial environment setup.
        // --------------------
        var globalObject = this;

        // Preserve any existing global `_` variable.
        var priorUtilityObject = globalObject._;

        // A unique object used to signal early loop termination.
        var loopBreaker = {};

        // References to prototypes for performance.
        var arrProto = Array.prototype, objProto = Object.prototype, funcProto = Function.prototype;

        // Convenience variables for common prototype methods.
        var arrayPush = arrProto.push,
            arraySlice = arrProto.slice,
            arrayConcat = arrProto.concat,
            objectToString = objProto.toString,
            objectHasOwnProperty = objProto.hasOwnProperty;

        // References to native ECMAScript 5 array and object methods.
        var
            nativeArrayForEach = arrProto.forEach,
            nativeArrayMap = arrProto.map,
            nativeArrayReduce = arrProto.reduce,
            nativeArrayReduceRight = arrProto.reduceRight,
            nativeArrayFilter = arrProto.filter,
            nativeArrayEvery = arrProto.every,
            nativeArraySome = arrProto.some,
            nativeArrayIndexOf = arrProto.indexOf,
            nativeArrayLastIndexOf = arrProto.lastIndexOf,
            nativeArrayIsArray = Array.isArray,
            nativeObjectKeys = Object.keys,
            nativeFunctionBind = funcProto.bind;

        // The main utility object, acting as a constructor or factory function.
        var utilityObject = function (inputTarget) {
            if (inputTarget instanceof utilityObject) return inputTarget;
            if (!(this instanceof utilityObject)) return new utilityObject(inputTarget);
            this._wrappedValue = inputTarget;
        };

        // Export the utility object for Node.js or assign to the global scope.
        if (typeof moduleExports !== 'undefined') {
            if (typeof moduleObject !== 'undefined' && moduleObject.exports) {
                moduleExports = moduleObject.exports = utilityObject;
            }
            moduleExports._ = utilityObject;
        } else {
            globalObject._ = utilityObject;
        }

        // The current version string of the library.
        utilityObject.VERSION_NUMBER = '1.4.4';

        // Functions for operating on collections (arrays, objects).
        // ----------------------------

        // An iteration function, aliased as `each` and `forEach`.
        // Works for arrays, array-like objects, and plain objects.
        var iterateCollection = utilityObject.each = utilityObject.forEach = function (collectionTarget, callbackFunction, executionContext) {
            if (collectionTarget == null) return;
            if (nativeArrayForEach && collectionTarget.forEach === nativeArrayForEach) {
                collectionTarget.forEach(callbackFunction, executionContext);
            } else if (collectionTarget.length === +collectionTarget.length) {
                for (var indexPos = 0, arrayLength = collectionTarget.length; indexPos < arrayLength; indexPos++) {
                    if (callbackFunction.call(executionContext, collectionTarget[indexPos], indexPos, collectionTarget) === loopBreaker) return;
                }
            } else {
                for (var objectKey in collectionTarget) {
                    // Assuming utilityObject.has is defined elsewhere in the full Underscore.
                    if (utilityObject.has(collectionTarget, objectKey)) {
                        if (callbackFunction.call(executionContext, collectionTarget[objectKey], objectKey, collectionTarget) === loopBreaker) return;
                    }
                }
            }
        };

        // Transforms a collection by applying a function to each element, returning new results.
        // Uses native `map` if available.
        utilityObject.map = utilityObject.collect = function (inputCollection, mapIterator, mapContext) {
            var transformedResults = [];
            if (inputCollection == null) return transformedResults;
            if (nativeArrayMap && inputCollection.map === nativeArrayMap) return inputCollection.map(mapIterator, mapContext);
            iterateCollection(inputCollection, function (elementValue, elementIndex, sourceList) {
                transformedResults[transformedResults.length] = mapIterator.call(mapContext, elementValue, elementIndex, sourceList);
            });
            return transformedResults;
        };

        // Error message for reduce operations on empty arrays without an initial value.
        var reductionErrorMsg = 'Reduce operation on empty array requires an initial value';

        // Aggregates a list of values into a single result (fold-left).
        // Aliases: `foldl`, `inject`. Uses native `reduce` if available.
        utilityObject.reduce = utilityObject.foldl = utilityObject.inject = function (sourceCollection, reducerFunction, accumulatorValue, reductionContext) {
            var hasInitialAccumulator = arguments.length > 2;
            if (sourceCollection == null) sourceCollection = [];
            if (nativeArrayReduce && sourceCollection.reduce === nativeArrayReduce) {
                // Assuming utilityObject.bind is defined elsewhere in the full Underscore.
                if (reductionContext) reducerFunction = utilityObject.bind(reducerFunction, reductionContext);
                return hasInitialAccumulator ? sourceCollection.reduce(reducerFunction, accumulatorValue) : sourceCollection.reduce(reducerFunction);
            }
            iterateCollection(sourceCollection, function (elementVal, elementIdx, collectionRef) {
                if (!hasInitialAccumulator) {
                    accumulatorValue = elementVal;
                    hasInitialAccumulator = true;
                } else {
                    accumulatorValue = reducerFunction.call(reductionContext, accumulatorValue, elementVal, elementIdx, collectionRef);
                }
            });
            if (!hasInitialAccumulator) throw new TypeError(reductionErrorMsg);
            return accumulatorValue;
        };

        // Aggregates a list of values from right to left (fold-right).
        // Aliases: `foldr`. Uses native `reduceRight` if available.
        utilityObject.reduceRight = utilityObject.foldr = function (sourceList, reverseReducer, initialAccumulator, contextScope) {
            var providedInitial = arguments.length > 2;
            if (sourceList == null) sourceList = [];
            if (nativeArrayReduceRight && sourceList.reduceRight === nativeArrayReduceRight) {