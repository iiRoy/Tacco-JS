var originalGlobalLoader = require; // Retain original 'require' before custom one is introduced.

// Custom module loading system. This acts as a polyfill/shim for browser environments.
// It allows defining, resolving, and loading modules similar to CommonJS.
var moduleSystem = (function() {
    var loaderInstance = function getModule(moduleIdentifier, currentContextPath) {
        // Input validation: Ensure moduleIdentifier is a string.
        if (typeof moduleIdentifier !== 'string' || moduleIdentifier.trim() === '') {
            throw new TypeError('Module identifier must be a non-empty string.');
        }

        // Determine the effective working directory; default to root if not provided.
        var effectiveContext = currentContextPath || '/';

        // Resolve the full, canonical path for the requested module.
        var finalResolvedPath = loaderInstance.resolveModulePath(moduleIdentifier, effectiveContext);
        var targetModuleEntry = loaderInstance.loadedModules[finalResolvedPath];

        // If the module is not found after resolution, throw an error.
        if (!targetModuleEntry) {
            var errorMessage = 'Could not locate module: "' + moduleIdentifier + '". Attempted path: "' + finalResolvedPath + '".';
            throw new Error(errorMessage);
        }

        // Check if the module has already been instantiated and cached.
        var moduleExportedContent;
        if (targetModuleEntry._cachedInstance) {
            moduleExportedContent = targetModuleEntry._cachedInstance;
        } else {
            // If not cached, execute the module's factory function to get its exports.
            moduleExportedContent = targetModuleEntry();
        }
        return moduleExportedContent;
    };

    // Store custom search paths for modules (currently unused in this implementation).
    loaderInstance.searchPaths = [];

    // The central cache for all loaded and defined modules.
    // Keys are resolved module paths, values are module factory functions or cached exports.
    loaderInstance.loadedModules = {};

    // List of file extensions to try when resolving module paths.
    loaderInstance.moduleSuffixes = [".js", ".coffee", ".json"]; // Added .json as a common extension.

    // A list of "core" or built-in modules that don't need path resolution.
    loaderInstance.builtinModules = {
        'assert': true,
        'events': true,
        'fs': true,
        'path': true,
        'vm': true,
        'buffer': true // Added another common core module
    };

    // Function to resolve the absolute path of a module.
    // It tries various strategies: built-in, direct file, directory index, node_modules.
    loaderInstance.resolveModulePath = (function () {
        var pathUtilities = null; // Will be loaded dynamically

        // Helper function to load a module from the cache if it exists as a file.
        function findModuleAsFile(potentialPath) {
            // Direct hit in the module cache?
            if (loaderInstance.loadedModules[potentialPath]) {
                return potentialPath;
            }

            // Try adding registered extensions.
            for (var i = 0; i < loaderInstance.moduleSuffixes.length; i++) {
                var currentSuffix = loaderInstance.moduleSuffixes[i];
                var pathWithSuffix = potentialPath + currentSuffix;
                if (loaderInstance.loadedModules[pathWithSuffix]) {
                    return pathWithSuffix;
                }
            }
            return null; // Module not found as a direct file.
        }

        // Helper function to load a module if the path points to a directory.
        function findModuleAsDirectory(directoryCandidatePath) {
            // Ensure path ends without a slash for consistent processing.
            var cleanedDirPath = directoryCandidatePath.replace(/\/+$/, '');
            var packageDescriptorPath = cleanedDirPath + '/package.json';

            if (loaderInstance.loadedModules[packageDescriptorPath]) {
                var packageConfiguration = loaderInstance.loadedModules[packageDescriptorPath]();
                var mainEntry = packageConfiguration.main;
                var browserSpecificEntry = packageConfiguration.browserify || packageConfiguration.browser; // Check for 'browser' too.

                // Prioritize browser-specific entry points.
                if (typeof browserSpecificEntry === 'string' && browserSpecificEntry.length > 0) {
                    var resolvedBrowserEntry = pathUtilities.resolve('/', cleanedDirPath, browserSpecificEntry);
                    var browserModule = findModuleAsFile(resolvedBrowserEntry);
                    if (browserModule) return browserModule;
                } else if (typeof browserSpecificEntry === 'object' && browserSpecificEntry.main) {
                    var resolvedBrowserObjEntry = pathUtilities.resolve('/', cleanedDirPath, browserSpecificEntry.main);
                    var browserModuleObj = findModuleAsFile(resolvedBrowserObjEntry);
                    if (browserModuleObj) return browserModuleObj;
                }

                // Fallback to standard 'main' entry.
                if (typeof mainEntry === 'string' && mainEntry.length > 0) {
                    var resolvedMainEntry = pathUtilities.resolve('/', cleanedDirPath, mainEntry);
                    var mainModule = findModuleAsFile(resolvedMainEntry);
                    if (mainModule) return mainModule;
                }
            }

            // As a last resort, look for 'index' file within the directory.
            return findModuleAsFile(cleanedDirPath + '/index');
        }

        // Helper function to search for modules within 'node_modules' directories.
        function searchInNodeModules(moduleIdentifier, startingDirectory) {
            var searchFolders = getNodeModuleSearchPaths(startingDirectory);
            for (var i = 0; i < searchFolders.length; i++) {
                var currentSearchFolder = searchFolders[i];
                var fullModulePath = pathUtilities.resolve('/', currentSearchFolder, moduleIdentifier);

                var fileResult = findModuleAsFile(fullModulePath);
                if (fileResult) return fileResult;

                var dirResult = findModuleAsDirectory(fullModulePath);
                if (dirResult) return dirResult;
            }

            // Also try to load directly if it's a global-like module name (e.g. 'foo' in root node_modules)
            var rootNodeModulePath = pathUtilities.resolve('/', '/node_modules', moduleIdentifier);
            var rootFileResult = findModuleAsFile(rootNodeModulePath);
            if (rootFileResult) return rootFileResult;
            var rootDirResult = findModuleAsDirectory(rootNodeModulePath);
            if (rootDirResult) return rootDirResult;

            return null;
        }

        // Generates a list of potential `node_modules` directories to search, starting from `startPath`
        // and moving up to the root.
        function getNodeModuleSearchPaths(startPath) {
            var pathSegments;
            if (startPath === '/') {
                pathSegments = [''];
            } else {
                pathSegments = pathUtilities.normalize(startPath).split('/');
                // Remove empty segments that might appear from double slashes or leading/trailing slashes.
                pathSegments = pathSegments.filter(function(s) { return s.length > 0; });
            }

            var candidateDirectories = [];
            // Iterate from the current directory up to the root.
            for (var i = pathSegments.length - 1; i >= 0; i--) {
                // If a segment is 'node_modules', we don't want to add 'node_modules/node_modules'.
                if (pathSegments[i] === 'node_modules') continue;

                var currentDirSegment = pathSegments.slice(0, i + 1).join('/');
                var nodeModulesPath = (currentDirSegment.length > 0 ? currentDirSegment : '/') + '/node_modules';
                candidateDirectories.push(nodeModulesPath);
            }
            // Add root node_modules as a fallback if not already included.
            if (candidateDirectories.indexOf('/node_modules') === -1) {
                candidateDirectories.push('/node_modules');
            }

            return candidateDirectories;
        }

        // The main resolve function exposed to the outside.
        return function (moduleName, currentDir) {
            // Ensure path utilities are loaded before use.
            if (!pathUtilities) {
                pathUtilities = loaderInstance.loadedModules.path();
            }

            // Default the current directory to root if not provided.
            var effectiveCurrentDir = currentDir || '/';

            // 1. Check for built-in (core) modules.
            if (loaderInstance.builtinModules[moduleName]) {
                return moduleName;
            }

            // Ensure current directory is absolute and normalized for consistent resolution.
            var absoluteContextDir = pathUtilities.resolve('/', effectiveCurrentDir);

            // 2. Handle relative or absolute paths (e.g., './foo', '../bar', '/baz').
            if (moduleName.match(/^(?:\.\.?\/|\/)/)) {
                var resolvedExplicitPath = pathUtilities.resolve(absoluteContextDir, moduleName);

                var fileMatch = findModuleAsFile(resolvedExplicitPath);
                if (fileMatch) return fileMatch;

                var directoryMatch = findModuleAsDirectory(resolvedExplicitPath);
                if (directoryMatch) return directoryMatch;
            }

            // 3. Search in `node_modules` directories.
            var nodeModuleMatch = searchInNodeModules(moduleName, absoluteContextDir);
            if (nodeModuleMatch) return nodeModuleMatch;

            // If all strategies fail, throw an error.
            throw new Error("Unable to resolve module path for '" + moduleName + "' from context '" + effectiveCurrentDir + "'.");
        };
    })();

    // Allows creating an alias for a module path.
    loaderInstance.createAlias = function (sourceModuleId, targetAliasId) {
        // Validate inputs
        if (typeof sourceModuleId !== 'string' || typeof targetAliasId !== 'string' || sourceModuleId === '' || targetAliasId === '') {
            console.warn('Invalid arguments for createAlias. Both source and target must be non-empty strings.');
            return;
        }

        var pathHelper = loaderInstance.loadedModules.path();
        var resolvedSourcePath = null;
        try {
            // First, try resolving as a package (looking for package.json)
            resolvedSourcePath = loaderInstance.resolveModulePath(sourceModuleId + '/package.json', '/');
            // If it resolves, the base directory is its dirname.
            resolvedSourcePath = pathHelper.dirname(resolvedSourcePath);
        } catch (err) {
            // If package.json fails, try resolving as a regular module.
            try {
                resolvedSourcePath = loaderInstance.resolveModulePath(sourceModuleId, '/');
            } catch (innerErr) {
                console.error('Failed to resolve source module for alias: ' + sourceModuleId, innerErr.message);
                return; // Cannot create alias if source cannot be resolved.
            }
        }

        var baseSourceDirectory = resolvedSourcePath;

        // Get all currently loaded module keys.
        var allModuleKeys = Object.keys(loaderInstance.loadedModules);

        // Iterate through existing modules and create aliases.
        for (var i = 0; i < allModuleKeys.length; i++) {
            var currentModuleKey = allModuleKeys[i];

            // If the module key starts with the base source directory (plus a slash for sub-modules).
            if (currentModuleKey.startsWith(baseSourceDirectory + '/')) {
                var relativeFragment = currentModuleKey.substring(baseSourceDirectory.length);
                loaderInstance.loadedModules[targetAliasId + relativeFragment] = loaderInstance.loadedModules[currentModuleKey];
                // console.log(`Aliased sub-module: ${currentModuleKey} -> ${targetAliasId + relativeFragment}`);
            }
            // If the module key IS the base source directory (for the main module itself).
            else if (currentModuleKey === baseSourceDirectory) {
                loaderInstance.loadedModules[targetAliasId] = loaderInstance.loadedModules[baseSourceDirectory];
                // console.log(`Aliased main module: ${baseSourceDirectory} -> ${targetAliasId}`);
            }
        }
    };

    // Function to register a new module with the system.
    loaderInstance.registerModule = function (moduleAbsolutePath, moduleFactoryFunction) {
        // Input validation.
        if (typeof moduleAbsolutePath !== 'string' || typeof moduleFactoryFunction !== 'function') {
            throw new TypeError('Module path must be string and factory must be a function.');
        }

        var moduleDirectoryName = loaderInstance.builtinModules[moduleAbsolutePath]
            ? '' // Core modules often don't have a dirname in this context.
            : loaderInstance.loadedModules.path().dirname(moduleAbsolutePath);

        // Create a local `require` function for the module's scope.
        var localRequireContext = function (relativePath) {
            return loaderInstance(relativePath, moduleDirectoryName);
        };
        localRequireContext.resolveModulePath = function (nameToResolve) {
            return loaderInstance.resolveModulePath(nameToResolve, moduleDirectoryName);
        };
        localRequireContext.loadedModules = loaderInstance.loadedModules; // Access to global module cache.
        localRequireContext.registerModule = loaderInstance.registerModule; // Access to define new modules.

        var moduleExportObject = { exports: {} }; // The actual module object passed to the factory.

        // Wrap the factory function so we can manage caching.
        loaderInstance.loadedModules[moduleAbsolutePath] = function () {
            // If the module has already been executed and cached, return the cached exports.
            if (loaderInstance.loadedModules[moduleAbsolutePath]._cachedInstance) {
                return loaderInstance.loadedModules[moduleAbsolutePath]._cachedInstance;
            }

            // Cache the module.exports reference *before* execution, to handle circular dependencies.
            loaderInstance.loadedModules[moduleAbsolutePath]._cachedInstance = moduleExportObject.exports;

            // Execute the module factory function with CommonJS-like parameters.
            moduleFactoryFunction.call(
                moduleExportObject.exports, // 'this' context for the module.
                localRequireContext,        // local `require` function.
                moduleExportObject,         // `module` object.
                moduleExportObject.exports, // `exports` object.
                moduleDirectoryName,        // `__dirname`.
                moduleAbsolutePath          // `__filename`.
            );

            // Re-cache the final exports, in case the module re-assigned `module.exports`.
            loaderInstance.loadedModules[moduleAbsolutePath]._cachedInstance = moduleExportObject.exports;
            return moduleExportObject.exports;
        };
    };

    return loaderInstance;
})();

// Replace the global 'require' with our custom module system.
var require = moduleSystem;


// --- Process Polyfills for Browser Environments ---
// These provide Node.js 'process' global functionality in browsers.

// Ensure 'globalThis.process' exists.
if (typeof globalThis.process === 'undefined') {
    globalThis.process = {};
}
var runtimeContext = globalThis.process; // Use a clearer name for 'process'.

// Polyfill for process.nextTick, using window.postMessage for efficiency if available.
if (!runtimeContext.nextTick) {
    runtimeContext.nextTick = (function () {
        var pendingCallbacks = [];
        var supportsPostMessageAPI = typeof window !== 'undefined'
            && window.postMessage && window.addEventListener;

        if (supportsPostMessageAPI) {
            window.addEventListener('message', function (eventMessage) {
                // Only process messages from the same window and with our specific identifier.
                if (eventMessage.source === window && eventMessage.data === 'custom-module-tick') {
                    eventMessage.stopPropagation(); // Prevent other listeners from processing.
                    if (pendingCallbacks.length > 0) {
                        var nextCallback = pendingCallbacks.shift();
                        nextCallback();
                    }
                }
            }, true); // Use capture phase for immediate handling.
        }

        return function (callbackFunction) {
            if (typeof callbackFunction !== 'function') {
                throw new TypeError('Callback for nextTick must be a function.');
            }
            if (supportsPostMessageAPI) {
                pendingCallbacks.push(callbackFunction);
                window.postMessage('custom-module-tick', '*'); // Broadcast message to trigger callback.
            } else {
                // Fallback to setTimeout with a minimal delay.
                setTimeout(callbackFunction, 4); // Small delay to allow browser to breathe.
            }
        };
    })();
}

// Polyfill for process.title
if (!runtimeContext.title) {
    runtimeContext.title = 'browser-env';
}

// Polyfill for process.binding (minimal implementation for 'evals'/'vm')
if (!runtimeContext.binding) {
    runtimeContext.binding = function (moduleName) {
        if (moduleName === 'evals') {
            return require('vm'); // Delegate to 'vm' module.
        } else if (moduleName === 'fs') { // Added another common binding.
            console.warn("Accessing 'fs' binding directly is not fully supported in browser context.");
            return {}; // Return an empty object or throw error depending on strictness.
        }
        throw new Error('No such native binding: ' + moduleName);
    };
}

// Polyfill for process.cwd (current working directory)
if (!runtimeContext.cwd) {
    runtimeContext.cwd = function () { return '/'; }; // In browser, root is usually the effective cwd.
}

// Polyfill for process.env (environment variables)
if (!runtimeContext.env) {
    runtimeContext.env = { NODE_ENV: 'development' }; // Default value for browser.
}
// Ensure process.env is an object, not just undefined.
if (typeof runtimeContext.env !== 'object') {
    runtimeContext.env = {};
}

// Polyfill for process.argv (command line arguments)
if (!runtimeContext.argv) {
    runtimeContext.argv = ['node', 'browser-app.js']; // Default arguments for browser.
}


// --- Define Core Modules ---

// Define the 'path' module, essential for module resolution.
moduleSystem.registerModule("path", function (localRequire, moduleObject, exports, currentDirname, currentFilename) {
    // Helper function to filter array elements.
    function filterArrayElements(inputArray, predicateFunction) {
        var filteredResults = [];
        for (var i = 0; i < inputArray.length; i++) {
            if (predicateFunction(inputArray[i], i, inputArray)) {
                filteredResults.push(inputArray[i]);
            }
        }
        return filteredResults;
    }

    // Cleans up path segments (e.g., handles '.', '..').
    function cleanPathSegments(segmentsArray, allowTraversalAboveRoot) {
        var upwardMoves = 0; // Counts '..' segments that go above current level.
        for (var i = segmentsArray.length - 1; i >= 0; i--) {
            var currentSegment = segmentsArray[i];
            if (currentSegment === '.') {
                segmentsArray.splice(i, 1); // Remove '.'
            } else if (currentSegment === '..') {
                segmentsArray.splice(i, 1); // Remove '..'
                upwardMoves++;
            } else if (upwardMoves > 0) {
                segmentsArray.splice(i, 1); // Remove segment if it's "eaten" by '..'
                upwardMoves--;
            }
        }

        // If allowed, re-add any '..' that went above the root.
        if (allowTraversalAboveRoot) {
            for (; upwardMoves--; upwardMoves > -1) { // Loop `upwardMoves` times
                segmentsArray.unshift('..');
            }
        }

        return segmentsArray;
    }

    // Regex to split a file path into its components (dir, base, ext).
    var posixPathSplitterRegex = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

    // Resolves a sequence of paths into a single absolute path.
    exports.resolve = function () {
        var finalResolvedPath = '';
        var isAbsolutelyResolved = false; // Flag to track if an absolute path has been encountered.

        // Iterate arguments in reverse, starting from the last path component.
        for (var i = arguments.length - 1; i >= -1 && !isAbsolutelyResolved; i--) {
            var currentPathSegment = (i >= 0) ? arguments[i] : runtimeContext.cwd(); // Fallback to cwd.

            // Skip invalid or empty path parts.
            if (typeof currentPathSegment !== 'string' || currentPathSegment.length === 0) {
                continue;
            }

            finalResolvedPath = currentPathSegment + '/' + finalResolvedPath;
            isAbsolutelyResolved = currentPathSegment.charAt(0) === '/';
        }

        // Normalize the path components.
        var processedPathSegments = filterArrayElements(finalResolvedPath.split('/'), function (p) {
            return p.length > 0; // Remove empty segments.
        });
        var normalizedSegments = cleanPathSegments(processedPathSegments, !isAbsolutelyResolved);
        var joinedPath = normalizedSegments.join('/');

        // Reconstruct the path, adding leading slash if absolute, or '.' if empty.
        var resultPath = (isAbsolutelyResolved ? '/' : '') + joinedPath;
        return resultPath || '.';
    };

    // Normalizes a path, resolving '..' and '.' segments.
    exports.normalize = function (inputPath) {
        var startsAbsolute = inputPath.charAt(0) === '/';
        var endsInSlash = inputPath.slice(-1) === '/';

        // Split, filter, and clean path segments.
        var pathSegments = filterArrayElements(inputPath.split('/'), function (p) {
            return p.length > 0;
        });
        var cleanedSegments = cleanPathSegments(pathSegments, !startsAbsolute);
        var joinedPath = cleanedSegments.join('/');

        if (!joinedPath && !startsAbsolute) {
            joinedPath = '.'; // If path is empty and not absolute, it's '.'
        }
        if (joinedPath && endsInSlash) {
            joinedPath += '/'; // Preserve trailing slash if present in original.
        }

        return (startsAbsolute ? '/' : '') + joinedPath;
    };

    // Joins all given path segments together, then normalizes the resulting path.
    exports.join = function () {
        var pathComponents = Array.prototype.slice.call(arguments, 0); // Convert arguments to array.
        var validComponents = filterArrayElements(pathComponents, function (p) {
            return typeof p === 'string' && p.length > 0;
        });
        return exports.normalize(validComponents.join('/'));
    };

    // Returns the directory name of a path.
    exports.dirname = function (fullPath) {
        var directoryPart = posixPathSplitterRegex.exec(fullPath)[1] || '';
        // In this POSIX-like environment, 'isWindows' is always false.
        if (!directoryPart) {
            return '.'; // No directory part found, implies current directory.
        } else if (directoryPart.length === 1) { // Just a single slash.
            return directoryPart;
        } else {
            return directoryPart.substring(0, directoryPart.length - 1); // Remove trailing slash.
        }
    };

    // Returns the last portion of a path, similar to the Unix `basename` command.
    exports.basename = function (fullPath, fileExtension) {
        var fileNamePart = posixPathSplitterRegex.exec(fullPath)[2] || '';
        // If an extension is provided and matches, remove it.
        if (fileExtension && fileNamePart.endsWith(fileExtension)) {
            fileNamePart = fileNamePart.substring(0, fileNamePart.length - fileExtension.length);
        }
        return fileNamePart;
    };

    // Returns the extension of the path, from the last '.' to the end of string.
    exports.extname = function (fullPath) {
        return posixPathSplitterRegex.exec(fullPath)[3] || '';
    };
});

// Define a package.json for a hypothetical 'shoe' module.
moduleSystem.registerModule("/node_modules/shoe/package.json", function (localRequire, moduleObject, exports, currentDirname, currentFilename) {
    moduleObject.exports = { "main": "index.js", "browserify": "browser.js", "description": "A browser-side SockJS streaming library." }; // Added description.
});

// Define the 'shoe' module itself (browser-side implementation).
moduleSystem.registerModule("/node_modules/shoe/browser.js", function (localRequire, moduleObject, exports, currentDirname, currentFilename) {
    var EventEmitterStream = localRequire('stream'); // Renamed from Stream to EventEmitterStream.
    var SocketJSClient = localRequire('sockjs-client'); // Renamed from sockjs.
    var URLResolver = localRequire('url').resolve; // Renamed from resolve.
    var URLParser = localRequire('url').parse; // Renamed from parse.

    // Main function to create a Shoe stream.
    moduleObject.exports = function createShoeStream(targetEndpointUri, connectionCallback) {
        // Validate targetEndpointUri.
        if (typeof targetEndpointUri !== 'string' || targetEndpointUri.length === 0) {
            console.error('Shoe stream requires a valid endpoint URI.');
            throw new Error('Invalid endpoint URI.');
        }

        // Resolve URI relative to current window location if it's not absolute.
        var absoluteEndpointUri = URLParser(targetEndpointUri).protocol
            ? targetEndpointUri
            : URLResolver(window.location.href, targetEndpointUri);

        var dataFlowStream = new EventEmitterStream();
        dataFlowStream.isReadable = true;
        dataFlowStream.isWritable = true;

        var connectionEstablished = false;
        var outgoingMessageBuffer = []; // Buffer for messages sent before connection is ready.

        var activeSocketConnection = SocketJSClient(absoluteEndpointUri);
        dataFlowStream.underlyingSocket = activeSocketConnection; // Expose the raw socket.

        // Custom 'write' method for the stream.
        dataFlowStream.sendData = function (messageContent) {
            // If connection not ready or buffer exists, queue the message.
            if (!connectionEstablished || outgoingMessageBuffer.length > 0) {
                outgoingMessageBuffer.push(messageContent);
            } else {
                activeSocketConnection.send(messageContent);
            }
        };

        // Custom 'end' method for the stream.
        dataFlowStream.finish = function (finalMessage) {
            if (finalMessage !== undefined) {
                dataFlowStream.sendData(finalMessage);
            }
            if (!connectionEstablished) {
                dataFlowStream._pendingEnd = true; // Mark for ending once connected.
                return;
            }
            dataFlowStream.isWritable = false;
            activeSocketConnection.close();
        };

        // Custom 'destroy' method for the stream.
        dataFlowStream.terminate = function () {
            dataFlowStream._pendingEnd = true;
            dataFlowStream.isWritable = dataFlowStream.isReadable = false;
            outgoingMessageBuffer.length = 0; // Clear any unsent messages.
            activeSocketConnection.close();
            dataFlowStream.emit('close', 'Stream terminated by user.'); // Emit a close event.
        };

        // SocketJS event handlers.
        activeSocketConnection.onopen = function () {
            if (typeof connectionCallback === 'function') {
                connectionCallback(); // Invoke user-provided callback.
            }
            connectionEstablished = true;

            // Send any buffered messages.
            while (outgoingMessageBuffer.length > 0) {
                activeSocketConnection.send(outgoingMessageBuffer.shift());
            }
            dataFlowStream.emit('connection-ready'); // Custom event for connection.
            if (dataFlowStream._pendingEnd) {
                dataFlowStream.finish(); // If marked for ending, end now.
            }
        };

        activeSocketConnection.onmessage = function (messageEvent) {
            dataFlowStream.emit('data', messageEvent.data); // Forward data events.
        };

        activeSocketConnection.onclose = function () {
            dataFlowStream.emit('end');
            dataFlowStream.isWritable = false;
            dataFlowStream.isReadable = false;
            // Optionally clear the underlying socket reference.
            dataFlowStream.underlyingSocket = null;
        };

        return dataFlowStream;
    };
});

// Define the 'stream' module.
moduleSystem.registerModule("stream", function (localRequire, moduleObject, exports, currentDirname, currentFilename) {
    var EventEmitterLibrary = localRequire('events'); // Renamed from events.
    var UtilityHelpers = localRequire('util'); // Renamed from util.

    // Base Stream constructor.
    function BaseDataStream() {
        EventEmitterLibrary.EventEmitter.call(this); // Inherit from EventEmitter.
        this.isPaused = false; // Added a state variable for pausing.
    }
    UtilityHelpers.inherits(BaseDataStream, EventEmitterLibrary.EventEmitter);
    moduleObject.exports = BaseDataStream;

    // For backward compatibility (Node.js 0.4.x style).
    BaseDataStream.StandardStream = BaseDataStream;

    // The 'pipe' method implementation.
    BaseDataStream.prototype.connectTo = function (destinationStream, connectionOptions) {
        var sourceStream = this; // Renamed from source.
        var connectionSettings = connectionOptions || {}; // Ensure options object exists.

        // Handler for data events from the source stream.
        function onSourceData(dataChunk) {
            if (destinationStream.isWritable) {
                // If destination cannot handle more data, pause the source.
                var writeSuccessful = destinationStream.write(dataChunk);
                if (writeSuccessful === false && typeof sourceStream.pause === 'function') {
                    sourceStream.pause();
                    sourceStream.isPaused = true; // Update internal state.
                }
            }
        }
        sourceStream.on('data', onSourceData);

        // Handler for 'drain' events from the destination stream.
        function onDestinationDrain() {
            if (sourceStream.isReadable && typeof sourceStream.resume === 'function' && sourceStream.isPaused) {
                sourceStream.resume();
                sourceStream.isPaused = false; // Update internal state.
            }
        }
        destinationStream.on('drain', onDestinationDrain);

        // Logic for ending the destination stream when the source ends.
        var shouldEndDestination = !destinationStream._isStandardIO && (connectionSettings.end !== false);
        if (shouldEndDestination) {
            destinationStream._activePipeCount = (destinationStream._activePipeCount || 0) + 1;

            sourceStream.on('end', onSourceEnd);
            sourceStream.on('close', onSourceClose);
        }

        var sourceHasSignaledEnd = false; // Flag to ensure 'end' or 'close' is handled only once.

        // Handler for source stream 'end' event.
        function onSourceEnd() {
            if (sourceHasSignaledEnd) return;
            sourceHasSignaledEnd = true;

            destinationStream._activePipeCount--; // Decrement active pipe count.

            // Clean up event listeners.
            removePipeListeners();

            // If this is the last source stream to end, call destination.end().
            if (destinationStream._activePipeCount <= 0) {
                destinationStream.end();
            }
        }

        // Handler for source stream 'close' event.
        function onSourceClose() {
            if (sourceHasSignaledEnd) return;
            sourceHasSignaledEnd = true;

            destinationStream._activePipeCount--;

            removePipeListeners();

            // If this is the last source stream to close, call destination.destroy().
            if (destinationStream._activePipeCount <= 0) {
                destinationStream.destroy();
            }
        }

        // Helper to remove all pipe-related listeners.
        function removePipeListeners() {
            sourceStream.removeListener('data', onSourceData);
            destinationStream.removeListener('drain', onDestinationDrain);
            sourceStream.removeListener('end', onSourceEnd);
            sourceStream.removeListener('close', onSourceClose);
            // console.log('Pipe listeners removed for stream: ', sourceStream.constructor.name); // Debugging.
        }

        return destinationStream; // Allow chaining.
    };
});