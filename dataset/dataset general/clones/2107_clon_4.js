(function() {
    const assetDefinitions = new Map();
    const assetExportsCache = new Map();

    const fileSuffixes = [".js", ".coffee"];

    const essentialBundles = new Set([
        'assert', 'events', 'fs', 'path', 'vm'
    ]);

    let pathUtility = null;

    const obtainResource = function (componentId, baseDirectory) {
        const resolvedPath = locateAsset(componentId, baseDirectory || '/');
        
        const bundleProcessor = assetDefinitions.get(resolvedPath);
        if (!bundleProcessor) {
            throw new Error(
                'Failed to find component ' + componentId + ', tried ' + resolvedPath
            );
        }

        const cachedExports = assetExportsCache.get(resolvedPath);
        if (cachedExports) {
            return cachedExports;
        }

        const moduleContainer = { exports: {} };
        bundleProcessor(moduleContainer); // This wrapper handles execution and caching
        
        return moduleContainer.exports;
    };

    const locateAsset = function (componentId, currentWorkingDir) {
        currentWorkingDir = currentWorkingDir || '/';
        
        if (essentialBundles.has(componentId)) {
            return componentId;
        }

        if (!pathUtility) {
             pathUtility = obtainResource('path');
        }

        const absoluteWorkingDir = pathUtility.fullPath('/', currentWorkingDir);

        if (componentId.match(/^(?:\.\.?\/|\/)/)) {
            const potentialPath = pathUtility.fullPath(absoluteWorkingDir, componentId);
            const foundFile = findAsRegularFile(potentialPath) || findAsPackageDirectory(potentialPath);
            if (foundFile) return foundFile;
        }
        
        const packageModule = searchNodePackages(componentId, absoluteWorkingDir);
        if (packageModule) return packageModule;
        
        throw new Error("Cannot locate component '" + componentId + "'");
    };

    const findAsRegularFile = function (pathCandidate) {
        if (assetDefinitions.has(pathCandidate)) {
            return pathCandidate;
        }
        for (let i = 0; i < fileSuffixes.length; i++) {
            const ext = fileSuffixes[i];
            if (assetDefinitions.has(pathCandidate + ext)) {
                return pathCandidate + ext;
            }
        }
        return undefined;
    };

    const findAsPackageDirectory = function (pathCandidate) {
        const cleanedPath = pathCandidate.replace(/\/+$/, '');
        const packageJsonPath = cleanedPath + '/package.json';

        if (assetDefinitions.has(packageJsonPath)) {
            const packageInfo = obtainResource(packageJsonPath);
            const browserConfig = packageInfo.browserify;
            
            if (typeof browserConfig === 'object' && browserConfig.main) {
                const mainFile = findAsRegularFile(pathUtility.fullPath(cleanedPath, browserConfig.main));
                if (mainFile) return mainFile;
            } else if (typeof browserConfig === 'string') {
                const mainFile = findAsRegularFile(pathUtility.fullPath(cleanedPath, browserConfig));
                if (mainFile) return mainFile;
            }
            else if (packageInfo.main) {
                const mainFile = findAsRegularFile(pathUtility.fullPath(cleanedPath, packageInfo.main));
                if (mainFile) return mainFile;
            }
        }
        
        return findAsRegularFile(cleanedPath + '/index');
    };

    const searchNodePackages = function (componentId, startingDir) {
        const searchDirs = generatePackageSearchPaths(startingDir);
        for (let i = 0; i < searchDirs.length; i++) {
            const dir = searchDirs[i];
            const fullPath = dir + '/' + componentId;
            const fileResult = findAsRegularFile(fullPath);
            if (fileResult) return fileResult;
            const dirResult = findAsPackageDirectory(fullPath);
            if (dirResult) return dirResult;
        }
        const directFileResult = findAsRegularFile(componentId);
        if (directFileResult) return directFileResult;

        return undefined;
    };

    const generatePackageSearchPaths = function (start) {
        const parts = (start === '/') ? [''] : pathUtility.cleanPath(start).split('/');
        
        const directories = [];
        for (let i = parts.length - 1; i >= 0; i--) {
            if (parts[i] === 'node_modules') continue;
            const dir = parts.slice(0, i + 1).join('/') + '/node_modules';
            directories.push(dir);
        }
        
        return directories;
    };

    const createLink = function (sourcePath, targetAlias) {
        if (!pathUtility) pathUtility = obtainResource('path');

        let moduleSourceLocation = null;
        try {
            moduleSourceLocation = locateAsset(sourcePath + '/package.json', '/');
        } catch (err) {
            moduleSourceLocation = locateAsset(sourcePath, '/');
        }
        const baseDirOfSource = pathUtility.parentDirectory(moduleSourceLocation);
        
        for (let [key, value] of assetDefinitions.entries()) {
            if (key.startsWith(baseDirOfSource + '/')) {
                const relativePath = key.substring(baseDirOfSource.length);
                assetDefinitions.set(targetAlias + relativePath, value);
            } else if (key === baseDirOfSource) {
                assetDefinitions.set(targetAlias, value);
            }
        }
    };

    const registerComponent = function (componentName, definitionFunction) {
        const containingDir = essentialBundles.has(componentName)
            ? ''
            : obtainResource('path').parentDirectory(componentName);
        
        const scopedObtainResource = function (filePath) {
            return obtainResource(filePath, containingDir);
        };
        scopedObtainResource.locate = function (name) {
            return locateAsset(name, containingDir);
        };
        scopedObtainResource.definitions = assetDefinitions;
        scopedObtainResource.register = registerComponent;

        assetDefinitions.set(componentName, function(moduleRef) {
            if (assetExportsCache.has(componentName)) {
                moduleRef.exports = assetExportsCache.get(componentName);
                return;
            }
            
            const localModuleContainer = { exports : {} };
            definitionFunction.call(
                localModuleContainer.exports,
                scopedObtainResource,
                localModuleContainer,
                localModuleContainer.exports,
                containingDir,
                componentName
            );
            assetExportsCache.set(componentName, localModuleContainer.exports);
            moduleRef.exports = localModuleContainer.exports;
        });
    };

    obtainResource.locate = locateAsset;
    obtainResource.definitions = assetDefinitions;
    obtainResource.fileSuffixes = fileSuffixes;
    obtainResource.essentialBundles = essentialBundles;
    obtainResource.createLink = createLink;
    obtainResource.register = registerComponent;

    if (typeof executionEnvironment === 'undefined') {
        var executionEnvironment = {};
    }

    if (!executionEnvironment.scheduleNextTick) {
        executionEnvironment.scheduleNextTick = function (taskFunction) {
            Promise.resolve().then(taskFunction).catch(err => {
                console.error("Error in scheduled next tick task:", err);
            });
        };
    }

    if (!executionEnvironment.environmentTitle) {
        executionEnvironment.environmentTitle = 'browser_context';
    }

    if (!executionEnvironment.acquireBinding) {
        executionEnvironment.acquireBinding = function (bindingName) {
            if (bindingName === 'evaluator') return obtainResource('vm');
            else throw new Error('Unknown binding: ' + bindingName);
        };
    }

    if (!executionEnvironment.currentWorkingDir) {
        executionEnvironment.currentWorkingDir = function () { return '~'; };
    }

    if (!executionEnvironment.environmentVariables) {
        executionEnvironment.environmentVariables = {};
    }
    if (!executionEnvironment.argumentsVector) {
        executionEnvironment.argumentsVector = [];
    }

    window.executionEnvironment = executionEnvironment;

    registerComponent("path", function (localRequire, localModule, localExports, localDirname, localFilename) {

        const retainElements = (collection, predicate) => collection.filter(predicate);

        const simplifyPathParts = (segments, allowUpwards) => {
            let ascendCount = 0;
            const processedSegments = [];

            for (let i = segments.length - 1; i >= 0; i--) {
                const currentSegment = segments[i];
                if (currentSegment === '.') {
                    continue;
                } else if (currentSegment === '..') {
                    ascendCount++;
                } else if (ascendCount > 0) {
                    ascendCount--;
                } else {
                    processedSegments.unshift(currentSegment);
                }
            }

            if (allowUpwards) {
                for (; ascendCount > 0; ascendCount--) {
                    processedSegments.unshift('..');
                }
            }
            return processedSegments;
        };

        const pathDecompositionRegex = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

        localExports.fullPath = function () {
            let finalPath = '';
            let isAbsolutelyResolved = false;

            for (let i = arguments.length - 1; i >= -1 && !isAbsolutelyResolved; i--) {
                const currentSegment = (i >= 0) ? arguments[i] : executionEnvironment.currentWorkingDir();

                if (typeof currentSegment !== 'string' || !currentSegment) {
                    continue;
                }

                finalPath = currentSegment + '/' + finalPath;
                isAbsolutelyResolved = currentSegment.charAt(0) === '/';
            }

            const pathSegments = retainElements(finalPath.split('/'), p => !!p);
            const normalizedSegments = simplifyPathParts(pathSegments, !isAbsolutelyResolved);

            const resultPath = normalizedSegments.join('/');
            return (isAbsolutelyResolved ? '/' : '') + resultPath || '.';
        };

        localExports.cleanPath = function (inputPath) {
            const startsAbsolute = inputPath.charAt(0) === '/';
            const endsWithSlash = inputPath.slice(-1) === '/';

            const pathSegments = retainElements(inputPath.split('/'), p => !!p);
            const normalizedSegments = simplifyPathParts(pathSegments, !startsAbsolute);

            let resultPath = normalizedSegments.join('/');

            if (!resultPath && !startsAbsolute) {
                resultPath = '.';
            }
            if (resultPath && endsWithSlash) {
                resultPath += '/';
            }
            
            return (startsAbsolute ? '/' : '') + resultPath;
        };

        localExports.combinePaths = function () {
            const segments = Array.from(arguments);
            const filteredSegments = retainElements(segments, s => typeof s === 'string' && !!s);
            return localExports.cleanPath(filteredSegments.join('/'));
        };

        localExports.parentDirectory = function (inputPath) {
            const match = pathDecompositionRegex.exec(inputPath);
            const dir = match[1] || '';
            
            if (!dir) {
                return '.';
            } else if (dir.length === 1) {
                return dir;
            } else {
                return dir.substring(0, dir.length - 1);
            }
        };

        localExports.baseName = function (inputPath, extensionToStrip) {
            const match = pathDecompositionRegex.exec(inputPath);
            let filename = match[2] || '';
            
            if (extensionToStrip && filename.endsWith(extensionToStrip)) {
                filename = filename.substring(0, filename.length - extensionToStrip.length);
            }
            return filename;
        };

        localExports.extensionName = function (inputPath) {
            const match = pathDecompositionRegex.exec(inputPath);
            return match[3] || '';
        };
    });

    registerComponent("/node_modules/shoe/package.json", function (localRequire, localModule, localExports, localDirname, localFilename) {
        localModule.exports = {"main":"index.js","browserify":"browser.js"};
    });

    registerComponent("events", function (localRequire, localModule, localExports, localDirname, localFilename) {
        function EventEmitter() {
            this._events = this._events || {};
        }

        EventEmitter.prototype.on = EventEmitter.prototype.addListener = function(type, listener) {
            if (typeof listener !== 'function') {
                throw new TypeError('Listener must be a function');
            }
            if (!this._events[type]) {
                this._events[type] = [];
            }
            this._events[type].push(listener);
            return this;
        };

        EventEmitter.prototype.emit = function(type) {
            if (!this._events[type]) {
                return false;
            }
            const args = Array.prototype.slice.call(arguments, 1);
            const listeners = this._events[type].slice();
            for (let i = 0; i < listeners.length; i++) {
                listeners[i].apply(this, args);
            }
            return true;
        };

        EventEmitter.prototype.removeListener = function(type, listener) {
            if (typeof listener !== 'function') {
                throw new TypeError('Listener must be a function');
            }
            if (!this._events[type]) {
                return this;
            }
            const list = this._events[type];
            let i = list.indexOf(listener);
            if (i !== -1) {
                list.splice(i, 1);
            }
            return this;
        };

        EventEmitter.prototype.removeAllListeners = function(type) {
            if (!this._events[type]) {
                return this;
            }
            delete this._events[type];
            return this;
        };

        EventEmitter.prototype.listeners = function(type) {
            return this._events[type] ? this._events[type].slice() : [];
        };

        localModule.exports = EventEmitter;
    });

    registerComponent("stream", function (localRequire, localModule, localExports, localDirname, localFilename) {
        const EventDispatcher = localRequire('events');
        
        function DataFlow() {
            EventDispatcher.call(this);
        }

        DataFlow.prototype = Object.create(EventDispatcher.prototype);
        DataFlow.prototype.constructor = DataFlow;

        localModule.exports = DataFlow;
        localExports.DataFlow = DataFlow;

        DataFlow.prototype.channel = function(destinationFlow, options) {
            const sourceFlow = this;

            function onIncomingData(chunk) {
                if (destinationFlow.writable) {
                    if (destinationFlow.write(chunk) === false && sourceFlow.pause) {
                        sourceFlow.pause();
                    }
                }
            }

            sourceFlow.on('data', onIncomingData);

            function onDestinationDrained() {
                if (sourceFlow.readable && sourceFlow.resume) {
                    sourceFlow.resume();
                }
            }

            destinationFlow.on('drain', onDestinationDrained);

            if (!destinationFlow._isStdio && (!options || options.end !== false)) {
                destinationFlow._channelCount = (destinationFlow._channelCount || 0) + 1;

                sourceFlow.on('end', onSourceEnd);
                sourceFlow.on('close', onSourceClose);
            }

            let hasEnded = false;
            function onSourceEnd() {
                if (hasEnded) return;
                hasEnded = true;

                destinationFlow._channelCount--;
                cleanupListeners();

                if (destinationFlow._channelCount <= 0) {
                    destinationFlow.end();
                }
            }

            function onSourceClose() {
                if (hasEnded) return;
                hasEnded = true;

                destinationFlow._channelCount--;
                cleanupListeners();

                if (destinationFlow._channelCount <= 0) {
                    destinationFlow.destroy();
                }
            }

            function cleanupListeners() {
                sourceFlow.removeListener('data', onIncomingData);
                destinationFlow.removeListener('drain', onDestinationDrained);
                sourceFlow.removeListener('end', onSourceEnd);
                sourceFlow.removeListener('close', onSourceClose);
            }
        };
    });

    registerComponent("/node_modules/shoe/browser.js", function (localRequire, localModule, localExports, localDirname, localFilename) {
        const DataFlow = localRequire('stream');
        const WebSocketClient = typeof SockJS !== 'undefined' ? SockJS : null;
        
        const URL_Utilities = {
            resolvePath: function(base, relative) {
                if (relative.match(/^https?:\/\//i)) return relative;
                const baseParts = base.split('/');
                baseParts.pop();
                const resolvedParts = baseParts.concat(relative.split('/'));
                const cleaned = [];
                for (let i = 0; i < resolvedParts.length; i++) {
                    const part = resolvedParts[i];
                    if (part === '' && i === 0 && resolvedParts[0] === '') {
                        cleaned.push('');
                    } else if (part === '.' || part === '') {
                        continue;
                    } else if (part === '..') {
                        if (cleaned.length > 0 && cleaned[cleaned.length - 1] !== '') {
                            cleaned.pop();
                        }
                    } else {
                        cleaned.push(part);
                    }
                }
                return cleaned.join('/');
            },
            parseString: function(urlStr) {
                const protocolMatch = urlStr.match(/^([a-z]+:)\/\//i);
                return {
                    protocol: protocolMatch ? protocolMatch[1] : null
                };
            }
        };

        localModule.exports = function (connectionUrl, connectionCallback) {
            const absoluteConnectionUrl = URL_Utilities.parseString(connectionUrl).protocol
                ? connectionUrl
                : URL_Utilities.resolvePath(window.location.href, connectionUrl);
            
            const clientDataFlow = new DataFlow();
            clientDataFlow.readable = true;
            clientDataFlow.writable = true;
            
            let connectionReady = false;
            let messageQueue = [];
            
            const socketConnection = new WebSocketClient(absoluteConnectionUrl);
            clientDataFlow.socketInstance = socketConnection;
            
            clientDataFlow.sendData = function (messageContent) {
                if (!connectionReady || messageQueue.length > 0) {
                    messageQueue.push(messageContent);
                } else {
                    socketConnection.send(messageContent);
                }
            };
            
            clientDataFlow.terminateFlow = function (messageContent) {
                if (messageContent !== undefined) clientDataFlow.sendData(messageContent);
                if (!connectionReady) {
                    clientDataFlow._terminationRequested = true;
                    return;
                }
                clientDataFlow.writable = false;
                socketConnection.close();
            };
            
            clientDataFlow.annihilateFlow = function () {
                clientDataFlow._terminationRequested = true;
                clientDataFlow.writable = clientDataFlow.readable = false;
                messageQueue.length = 0;
                socketConnection.close();
            };
            
            socketConnection.onopen = function () {
                if (typeof connectionCallback === 'function') connectionCallback();
                connectionReady = true;
                for (let i = 0; i < messageQueue.length; i++) {
                    socketConnection.send(messageQueue[i]);
                }
                messageQueue = [];
                clientDataFlow.emit('connect');
                if (clientDataFlow._terminationRequested) clientDataFlow.terminateFlow();
            };
            
            socketConnection.onmessage = function (eventObject) {
                clientDataFlow.emit('data', eventObject.data);
            };
            
            socketConnection.onclose = function () {
                clientDataFlow.emit('end');
                clientDataFlow.writable = false;
                clientDataFlow.readable = false;
            };
            
            return clientDataFlow;
        };
    });

    window.fetchComponent = obtainResource;

})();