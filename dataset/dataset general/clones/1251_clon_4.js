var fileSystemAccess = require('fs').promises;
var pathUtilities = require('path');
var promiseSequencer = require('async'); // Keeping async for series functionality, renaming it
var processModules = require('module'); // To access require.extensions

// --- Internal Constants & Initial Configuration ---

var toolName = 'module-orchestrator';

var defaultSettings = {
    validateExtensions: true,
    allowedExtensions: ['.js', '.node', '.json', '.coffee', '.sjs'],
    messageTemplate: '%s: %s',
    messenger: console,
    exclusionPattern: false, // Regex for paths to ignore
    baseDirectory: ''
};

// Augment default allowed extensions with custom ones from require.extensions
for (var extensionKey in processModules.createRequire(process.cwd()).extensions) {
    if (Object.prototype.hasOwnProperty.call(processModules.createRequire(process.cwd()).extensions, extensionKey) && defaultSettings.allowedExtensions.indexOf(extensionKey) === -1) {
        defaultSettings.allowedExtensions.push(extensionKey);
    }
}

// --- Helper Functions ---

// Prepares the final configuration based on defaults and user overrides
async function prepareSettings(userSettings) {
    var finalSettings = Object.assign({}, defaultSettings, userSettings || {});

    // Ensure extension list is a RegExp if validation is enabled and it's an array
    if (finalSettings.validateExtensions && Array.isArray(finalSettings.allowedExtensions)) {
        emitLogMessage(finalSettings, 'Converting extension list to regular expression', 'info');
        // Escape periods and join to create the regex pattern
        var pattern = finalSettings.allowedExtensions
            .map(function(ext) { return ext.replace(/\./g, '\\.'); })
            .join('|');
        finalSettings.allowedExtensions = new RegExp('(' + pattern + ')$');
    }
    emitLogMessage(finalSettings, 'Using regular expression ' + finalSettings.allowedExtensions + ' for extension matching', 'info');
    return finalSettings;
}

// Formats a path into a camelCase module identifier
function formatModuleName(sourcePath) {
    var baseName = pathUtilities.basename(sourcePath, pathUtilities.extname(sourcePath));
    var parts = baseName.replace(/[^a-zA-Z0-9]/g, '.').split('.');
    var firstPart = parts.shift();

    if (!firstPart) return ''; // Handle empty string case

    var canonicalIdentifier = firstPart;
    for (var i = 0; i < parts.length; i++) {
        if (parts[i]) {
            canonicalIdentifier += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
        }
    }
    return canonicalIdentifier;
}

// Resolves and validates a given path, returning its canonical form
async function resolvePathIdentifier(segment, config) {
    if (typeof segment !== 'string') {
        emitLogMessage(config, 'Path segment must be a string: ' + segment, 'error');
        throw new Error('Invalid path segment type');
    }

    var absolutePath = pathUtilities.resolve(pathUtilities.normalize(segment));

    try {
        await fileSystemAccess.access(absolutePath);
        return absolutePath;
    } catch (error) {
        // Try adding .js extension
        var jsPath = absolutePath + '.js';
        try {
            await fileSystemAccess.access(jsPath);
            return jsPath;
        } catch (jsError) {
            emitLogMessage(config, 'No such file or directory found at: ' + absolutePath, 'error');
            throw new Error('Path not found: ' + absolutePath);
        }
    }
}

// Recursively explores a directory to find valid module files
async function exploreDirectory(currentDirectory, config) {
    var foundPaths = [];
    var entries = await fileSystemAccess.readdir(currentDirectory);

    for (var entry of entries) {
        var candidatePath = pathUtilities.join(currentDirectory, entry);
        var stats;
        try {
            stats = await fileSystemAccess.stat(candidatePath);
        } catch (err) {
            emitLogMessage(config, 'Failed to stat path: ' + candidatePath + ' - ' + err.message, 'warn');
            continue;
        }

        var isPermitted = true;

        // Ignore hidden entries
        if (entry.charAt(0) === '.') {
            emitLogMessage(config, 'Ignoring hidden entry: ' + entry, 'warn');
            isPermitted = false;
        }

        // Check against exclusion pattern
        if (isPermitted && config.exclusionPattern && candidatePath.match(config.exclusionPattern)) {
            emitLogMessage(config, 'Ignoring path: exclusion pattern match ' + candidatePath, 'warn');
            isPermitted = false;
        }

        if (isPermitted && stats.isDirectory()) {
            // Recursively explore subdirectories
            var subDirPaths = await exploreDirectory(candidatePath, config);
            foundPaths = foundPaths.concat(subDirPaths);
            isPermitted = false; // Prevent it from being added as a file
        }

        // Check extension if it's a file and extension validation is enabled
        if (isPermitted && stats.isFile() && config.validateExtensions && !config.allowedExtensions.test(candidatePath)) {
            emitLogMessage(config, 'Ignoring file: extension not allowed ' + candidatePath, 'warn');
            isPermitted = false;
        }

        if (isPermitted && stats.isFile()) {
            foundPaths.push(candidatePath);
        }
    }
    return foundPaths;
}

// Establishes a nested object structure on a parent object
function establishHierarchy(currentLevel, hierarchySegments) {
    var segment = formatModuleName(hierarchySegments.shift());

    if (!currentLevel[segment]) {
        currentLevel[segment] = {};
    }

    if (hierarchySegments.length) {
        currentLevel = establishHierarchy(currentLevel[segment], hierarchySegments);
    }

    return currentLevel;
}

// Logs messages based on verbose setting and logger
function emitLogMessage(config, message, level) {
    if (config.verbose) {
        level = level || 'info';
        if (config.messenger && typeof config.messenger[level] === 'function') {
             config.messenger[level](config.messageTemplate, toolName, message);
        } else {
            console.log(config.messageTemplate, toolName, message); // Fallback to console.log
        }
    }
}

// --- Main Orchestration Logic ---

// Scans the specified entry point for modules and prepares their details
async function scanForModules(entryPoint, config) {
    var resolvedEntry;
    try {
        resolvedEntry = await resolvePathIdentifier(config.baseDirectory ? pathUtilities.join(config.baseDirectory, entryPoint) : entryPoint, config);
    } catch (err) {
        emitLogMessage(config, err.message, 'error');
        return []; // Return empty array if initial path is invalid
    }

    var stats = await fileSystemAccess.stat(resolvedEntry);
    var rawDiscoveredPaths = [];

    if (stats.isDirectory()) {
        rawDiscoveredPaths = await exploreDirectory(resolvedEntry, config);
    } else {
        // If it's a single file, ensure it passes extension check if enabled
        if (config.validateExtensions && !config.allowedExtensions.test(resolvedEntry)) {
            emitLogMessage(config, 'Ignoring single file: extension not allowed ' + resolvedEntry, 'warn');
        } else {
            rawDiscoveredPaths.push(resolvedEntry);
        }
    }

    // Process raw paths into structured module details, ensuring uniqueness
    var uniquePaths = Array.from(new Set(rawDiscoveredPaths));
    var processedModuleDetails = uniquePaths.map(function(absolutePath) {
        var relativePath = pathUtilities.relative(config.baseDirectory || process.cwd(), absolutePath);
        var locationSegments = relativePath.split(pathUtilities.sep);
        var moduleName = formatModuleName(absolutePath);

        return {
            absolutePath: absolutePath,
            relativePath: relativePath,
            locationSegments: locationSegments, // For namespace creation
            moduleName: moduleName
        };
    });

    return processedModuleDetails;
}

// Injects discovered modules into a target application object
async function injectIntoTarget(targetApplication, moduleCollection, config) {
    var orchestrationContext = this; // Maintain context if 'this' is used (though it's functional here)

    await promiseSequencer.eachSeries(moduleCollection, async function(moduleDetails) {
        delete require.cache[moduleDetails.absolutePath]; // Clear cache for fresh load

        var hierarchySegments = moduleDetails.locationSegments.slice(0); // Clone array
        var targetNamespace = establishHierarchy(targetApplication, hierarchySegments);
        var loadedResource = require(moduleDetails.absolutePath);

        var isSynchronousLoad = typeof loadedResource !== 'function' || loadedResource.length < 2;
        var finalResource = loadedResource;

        if (!isSynchronousLoad) {
            // Asynchronous module loading
            finalResource = await new Promise(function(resolve, reject) {
                loadedResource.call(moduleDetails, targetApplication, function(err, result) {
                    if (err) return reject(err);
                    resolve(result || loadedResource); // Pass back the result or original function
                });
            });
        } else if (typeof loadedResource === 'function') {
            // Synchronous function module loading
            finalResource = loadedResource.call(moduleDetails, targetApplication);
        }
        // Else: loadedResource is not a function, use it directly

        targetNamespace[moduleDetails.moduleName] = finalResource;

        var fullNamespacePath = moduleDetails.locationSegments.map(formatModuleName).join('.');
        emitLogMessage(config, 'Loaded *.' + fullNamespacePath);
    });

    emitLogMessage(config, 'All things loaded');
    return targetApplication;
}

/**
 * Main module orchestration entry point.
 * Scans paths, loads modules, and injects them into a target object.
 *
 * @param {string} initialPath The initial file or directory path to scan.
 * @param {object} [userConfig] Optional configuration settings.
 * @returns {object} An object with a `to` method for chaining.
 */
function initializeModuleLoader(initialPath, userConfig) {
    var configuredSettings;
    var collectedModuleInfo;

    var orchestrationChain = {
        // Asynchronous method to process paths and prepare module information
        prepare: async function() {
            configuredSettings = await prepareSettings(userConfig);
            collectedModuleInfo = await scanForModules(initialPath, configuredSettings);
            return this;
        },
        // Injects the prepared modules into the target application object
        to: async function(targetApplication, completionCallback) {
            if (!configuredSettings || !collectedModuleInfo) {
                // Ensure prepare() has been called
                await this.prepare();
            }

            try {
                var finalTarget = await injectIntoTarget(targetApplication, collectedModuleInfo, configuredSettings);
                if (typeof completionCallback === 'function') {
                    completionCallback(null, finalTarget);
                }
                return finalTarget;
            } catch (error) {
                emitLogMessage(configuredSettings, 'Error during module injection: ' + error.message, 'error');
                if (typeof completionCallback === 'function') {
                    completionCallback(error);
                }
                throw error; // Re-throw for promise chain
            }
        }
    };

    // For immediate use case (similar to original `new ExpressLoad(entity).into(app)`),
    // we can return a promise that resolves to the chained object.
    // This allows `await initializeModuleLoader(...).prepare().to(...)` or `initializeModuleLoader(...).to(...)`
    // If `to` is called directly, it will implicitly call `prepare`.
    // The original API allows `load(entity).then(another).into(app)`.
    // Let's make `prepare` return a new object with a `andThen` method for chaining paths,
    // before finally calling `to`.

    function ChainedLoader(currentPath, currentConfig, currentModuleInfo) {
        this.config = currentConfig;
        this.moduleInfo = currentModuleInfo || [];

        this.andThen = async function(additionalPath) {
            var newModuleInfo = await scanForModules(additionalPath, this.config);
            // Filter out duplicates based on absolutePath
            var existingPaths = new Set(this.moduleInfo.map(m => m.absolutePath));
            var uniqueNewModules = newModuleInfo.filter(m => !existingPaths.has(m.absolutePath));
            this.moduleInfo = this.moduleInfo.concat(uniqueNewModules);
            return this; // Return itself for further chaining
        };

        this.to = async function(targetApplication, completionCallback) {
            try {
                var finalTarget = await injectIntoTarget(targetApplication, this.moduleInfo, this.config);
                if (typeof completionCallback === 'function') {
                    completionCallback(null, finalTarget);
                }
                return finalTarget;
            } catch (error) {
                emitLogMessage(this.config, 'Error during module injection: ' + error.message, 'error');
                if (typeof completionCallback === 'function') {
                    completionCallback(error);
                }
                throw error;
            }
        };
    }

    // Initial setup:
    return (async function() {
        var initialConfig = await prepareSettings(userConfig);
        var initialModuleInfo = await scanForModules(initialPath, initialConfig);
        return new ChainedLoader(initialPath, initialConfig, initialModuleInfo);
    })();
}

module.exports = initializeModuleLoader;