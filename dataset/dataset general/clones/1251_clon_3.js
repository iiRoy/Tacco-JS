//
// This module provides an automated loading mechanism for application components.
// It's designed to streamline the inclusion of configurations, models, and controllers
// by scanning specified paths and injecting discovered resources into a target object.
//
// @author Developer X <dev.x@example.com>
// @version 1.1.0
// @license MIT
//

// Essential system utilities for file operations and path manipulation.
const fileSystemOps = require('node:fs');
const pathResolver = require('node:path');
// Asynchronous flow control library for managing sequential operations.
const flowControl = require('async');

// Core configuration for file extension handling.
// These are the default allowed file extensions for auto-loading,
// ensuring compatibility with common JavaScript and related file types.
const defaultAllowedExtensions = new Set(['.js', '.mjs', '.cjs', '.node', '.json', '.coffee', '.ts', '.jsx', '.tsx']);

// Dynamically integrate any custom extensions registered with Node.js.
// This ensures compatibility with transpiled or custom module types
// without requiring explicit configuration.
for (const registeredExt in require.extensions) {
  if (Object.prototype.hasOwnProperty.call(require.extensions, registeredExt)) {
    defaultAllowedExtensions.add(registeredExt);
  }
}

/**
 * Automator for loading modules and resources.
 * This class orchestrates the discovery and injection of application components
 * into a specified target object, typically an Express application instance.
 */
class ModuleAutomator {
  // A consistent label used for all logging output from this loader.
  static #SERVICE_LABEL = 'module-automator';

  // Private field to keep track of the number of items successfully processed.
  #processedCount = 0;

  /**
   * Initializes a new instance of the ModuleAutomator.
   * @param {string} initialPathSource - The primary path (file or directory) to begin scanning from.
   * @param {object} [configParams={}] - Configuration options for the automator.
   * @param {boolean} [configParams.validateExtensions=true] - Flag to enable/disable file extension validation.
   * @param {Array<string>|RegExp} [configParams.allowedFileExtensions] - List of allowed extensions or a regex.
   * @param {string} [configParams.messageFormat='%s: %s'] - Format string for log messages.
   * @param {object} [configParams.logHandler=console] - The logging utility to use (e.g., `console`).
   * @param {RegExp|boolean} [configParams.exclusionPattern=false] - A regex pattern for paths to ignore.
   * @param {string} [configParams.baseDirectory=''] - The base directory for resolving relative paths.
   * @param {boolean} [configParams.verboseOutput=false] - Enables detailed logging for all operations.
   */
  constructor(initialPathSource, configParams = {}) {
    // Merge provided configuration with default settings for robustness.
    const effectiveConfig = {
      validateExtensions: true,
      allowedFileExtensions: [...defaultAllowedExtensions], // Use a copy to prevent mutation of the global set
      messageFormat: '%s: %s',
      logHandler: console,
      exclusionPattern: false,
      baseDirectory: '',
      verboseOutput: false,
      ...configParams
    };

    this.configuration = effectiveConfig;
    this.queuedItems = []; // Stores the list of discovered modules/resources awaiting injection.

    // If allowedFileExtensions is an array, convert it to a RegExp for efficient matching.
    // This helps optimize repeated file extension checks.
    if (Array.isArray(this.configuration.allowedFileExtensions) && !(this.configuration.allowedFileExtensions instanceof RegExp)) {
      this._emitLogMessage('debug', 'Transforming extension array into a regular expression for path validation.');
      const escapedExtensions = this.configuration.allowedFileExtensions
        .map(ext => ext.replace(/\./g, '\\.')) // Escape dots for regex safety
        .join('|');
      this.configuration.allowedFileExtensions = new RegExp(`^.*\\.(?:${escapedExtensions})$`, 'i'); // Case-insensitive match for flexibility
    }

    if (this.configuration.verboseOutput) {
      this._emitLogMessage('debug', `Using pattern "${this.configuration.allowedFileExtensions}" for extension filtering.`);
    }

    // Immediately queue the initial path for processing, initiating the discovery phase.
    this.addPathToQueue(initialPathSource);
  }

  /**
   * Adds a file or directory path to the internal processing queue.
   * This method recursively scans directories to find all eligible resources
   * based on configuration settings (extensions, exclusion patterns).
   *
   * @param {string} entryPath - The path (absolute or relative) to add to the queue.
   * @returns {ModuleAutomator} The current ModuleAutomator instance for chaining calls.
   */
  addPathToQueue(entryPath) {
    const { baseDirectory, exclusionPattern, validateExtensions, allowedFileExtensions } = this.configuration;

    // Resolve the path relative to the base directory if provided, then to an absolute path.
    const fullSourcePath = baseDirectory ? pathResolver.join(baseDirectory, entryPath) : entryPath;
    const resolvedAbsolutePath = this._resolvePathEntry(fullSourcePath);

    if (!resolvedAbsolutePath) {
      // Error was already logged by _resolvePathEntry, no need to re-log.
      return this;
    }

    let fileDetails;
    try {
      fileDetails = fileSystemOps.lstatSync(resolvedAbsolutePath); // Use lstat to handle symlinks correctly
    } catch (statError) {
      this._emitLogMessage('error', `Failed to get file stats for "${resolvedAbsolutePath}": ${statError.message}`, 'error');
      return this;
    }


    if (fileDetails.isDirectory()) {
      const directoryContents = fileSystemOps.readdirSync(resolvedAbsolutePath);

      if (directoryContents.length === 0) {
        this._emitLogMessage('debug', `Directory "${resolvedAbsolutePath}" is empty, skipping.`);
        return this;
      }

      for (const item of directoryContents) {
        const currentItemPath = pathResolver.normalize(pathResolver.join(resolvedAbsolutePath, item));
        const relativeItemPath = pathResolver.join(entryPath, item); // Preserve relative path for namespacing

        let ignoreCurrentItem = false;
        let ignoreReason = '';

        // Ignore hidden files/directories (conventionally starting with '.')
        if (item.startsWith('.')) {
          ignoreCurrentItem = true;
          ignoreReason = 'hidden item';
        }
        // Apply exclusion pattern if specified in configuration.
        else if (exclusionPattern && exclusionPattern instanceof RegExp && exclusionPattern.test(currentItemPath)) {
          ignoreCurrentItem = true;
          ignoreReason = 'matches exclusion pattern';
        }
        // Prevent adding duplicate entries to the queue.
        else if (this.queuedItems.some(queued => queued.resolvedPath === currentItemPath)) {
          ignoreCurrentItem = true;
          ignoreReason = 'already queued';
        }

        if (ignoreCurrentItem) {
          this._emitLogMessage('debug', `Skipping "${currentItemPath}" (${ignoreReason}).`);
          continue; // Move to the next item in the directory
        }

        let itemStats;
        try {
          itemStats = fileSystemOps.lstatSync(currentItemPath);
        } catch (subStatError) {
          this._emitLogMessage('warn', `Could not get stats for "${currentItemPath}", skipping: ${subStatError.message}`);
          continue;
        }

        if (itemStats.isDirectory()) {
          // Recursively add subdirectories to ensure deep scanning.
          this.addPathToQueue(relativeItemPath);
        } else if (itemStats.isFile()) {
          // Validate file extension if enabled in configuration.
          if (validateExtensions && !allowedFileExtensions.test(currentItemPath)) {
            this._emitLogMessage('warn', `File "${currentItemPath}" ignored: extension not permitted by "${allowedFileExtensions.source}".`);
            continue; // Skip this file if extension is not allowed
          }

          const resourceName = formatResourceName(currentItemPath);
          this.queuedItems.push({
            resolvedPath: currentItemPath,
            namespacePath: pathResolver.join(entryPath, resourceName), // Use entryPath for consistent relative namespace
            resourceName: resourceName,
            type: 'file' // Explicitly mark as file type
          });
          this._emitLogMessage('debug', `Queued file: "${currentItemPath}" as "${resourceName}".`);
        } else {
          this._emitLogMessage('debug', `Path "${currentItemPath}" is neither a file nor a directory, skipping.`);
        }
      }
    } else if (fileDetails.isFile()) {
      // Directly add a single file if the initial path points to one.
      if (validateExtensions && !allowedFileExtensions.test(resolvedAbsolutePath)) {
        this._emitLogMessage('warn', `File "${resolvedAbsolutePath}" ignored: extension not permitted.`);
        return this;
      }

      const resourceName = formatResourceName(resolvedAbsolutePath);
      this.queuedItems.push({
        resolvedPath: resolvedAbsolutePath,
        namespacePath: pathResolver.join(pathResolver.dirname(entryPath), resourceName),
        resourceName: resourceName,
        type: 'file'
      });
      this._emitLogMessage('debug', `Queued single file: "${resolvedAbsolutePath}" as "${resourceName}".`);
    } else {
      this._emitLogMessage('warn', `Path "${resolvedAbsolutePath}" is neither a file nor a directory, skipping.`);
    }

    return this;
  }

  /**
   * Injects all queued resources into a target application object,
   * creating a structured namespace for each resource based on its path.
   *
   * @param {object} targetApplicationObject - The object (e.g., Express app) to which resources will be attached.
   * @param {Function} [completionCallback] - An optional callback function to execute upon completion, `(err, targetObject)`.
   * @returns {ModuleAutomator} The current ModuleAutomator instance for chaining.
   */
  injectIntoTarget(targetApplicationObject, completionCallback) {
    // Validate the target object to prevent runtime errors.
    if (!targetApplicationObject || typeof targetApplicationObject !== 'object') {
      const error = new TypeError('Target application object provided for injection must be a valid object.');
      this._emitLogMessage('critical', error.message, 'error');
      if (typeof completionCallback === 'function') {
        completionCallback(error, null);
      }
      return this;
    }

    // Handle cases where no resources were queued.
    if (this.queuedItems.length === 0) {
      this._emitLogMessage('info', 'No resources queued for injection; operation complete.');
      if (typeof completionCallback === 'function') {
        completionCallback(null, targetApplicationObject);
      }
      return this;
    }

    this.#processedCount = 0; // Reset counter for a fresh injection cycle.

    // Use async.eachSeries to process items sequentially, maintaining order.
    flowControl.eachSeries(this.queuedItems, (resourceItem, nextItem) => {
      // Clear module cache to ensure fresh loading on subsequent calls (e.g., during development restarts).
      delete require.cache[resourceItem.resolvedPath];

      // Determine the segments for creating the namespace path.
      const namespaceSegments = resourceItem.namespacePath.split(pathResolver.sep).filter(Boolean); // Filter empty strings from splits
      // Establish the parent namespace where the current module will reside.
      const targetNamespace = establishNamespaceHierarchy(targetApplicationObject, namespaceSegments.slice(0, -1));

      let loadedModule;
      try {
        loadedModule = require(resourceItem.resolvedPath);
      } catch (loadError) {
        this._emitLogMessage('error', `Failed to load module "${resourceItem.resolvedPath}": ${loadError.message}`, 'error');
        return nextItem(loadError); // Propagate error and halt processing for this item.
      }

      // Check if the module is an asynchronous function (i.e., expects `(instance, callback)`).
      const expectsAsyncInitialization = typeof loadedModule === 'function' && loadedModule.length >= 2;
      let moduleInjectionResult;

      const fullNamespaceKey = namespaceSegments.map(formatResourceName).join('.');

      if (expectsAsyncInitialization) {
        // Module requires asynchronous initialization, passing a callback.
        loadedModule.call(resourceItem, targetApplicationObject, (asyncErr, result) => {
          if (asyncErr) {
            this._emitLogMessage('error', `Asynchronous initialization failed for "${fullNamespaceKey}": ${asyncErr.message}`, 'error');
            return nextItem(asyncErr);
          }
          // If the async module returns a result, use it; otherwise, the module itself is the result.
          targetNamespace[resourceItem.resourceName] = result !== undefined ? result : loadedModule;
          this._emitLogMessage('info', `Async module "${fullNamespaceKey}" initialized and injected.`);
          this.#processedCount++;
          nextItem();
        });
      } else {
        // Synchronous module or a function that doesn't expect a callback.
        if (typeof loadedModule === 'function') {
          // Execute the function to get the actual module content.
          moduleInjectionResult = loadedModule.call(resourceItem, targetApplicationObject);
        } else {
          // Direct assignment for non-function modules (e.g., JSON, objects).
          moduleInjectionResult = loadedModule;
        }
        targetNamespace[resourceItem.resourceName] = moduleInjectionResult;
        this._emitLogMessage('info', `Synchronous module "${fullNamespaceKey}" injected.`);
        this.#processedCount++;
        nextItem();
      }
    }, (err) => {
      // Final callback after all items are processed, or on the first error.
      if (err) {
        this._emitLogMessage('critical', `Module injection sequence terminated with errors: ${err.message}`, 'error');
        if (typeof completionCallback === 'function') {
          completionCallback(err, null);
        }
      } else {
        this._emitLogMessage('success', `All ${this.#processedCount} resources successfully injected into the target object.`);
        if (typeof completionCallback === 'function') {
          completionCallback(null, targetApplicationObject);
        }
      }
    });

    return this;
  }

  /**
   * Resolves and normalizes an input path, verifying its existence.
   * Attempts to append common JavaScript extensions if the path doesn't exist directly.
   *
   * @param {string} inputPath - The path string to resolve.
   * @returns {string|null} The absolute, normalized path if found, otherwise `null`.
   * @private
   */
  _resolvePathEntry(inputPath) {
    if (typeof inputPath !== 'string' || inputPath.trim() === '') {
      this._emitLogMessage('error', `Invalid path provided: "${inputPath}". Must be a non-empty string.`, 'error');
      return null;
    }

    const normalizedPath = pathResolver.normalize(inputPath);
    let absolutePath = pathResolver.resolve(normalizedPath);

    // Check if the path exists as is.
    if (fileSystemOps.existsSync(absolutePath)) {
      return absolutePath;
    }

    // If not, try appending common JavaScript extensions to find the file.
    const commonJsExtensions = ['.js', '.mjs', '.cjs'];
    for (const ext of commonJsExtensions) {
      const potentialPath = absolutePath + ext;
      if (fileSystemOps.existsSync(potentialPath)) {
        this._emitLogMessage('debug', `Resolved "${inputPath}" to "${potentialPath}" by appending "${ext}".`);
        return potentialPath;
      }
    }

    this._emitLogMessage('error', `Resource not found at: "${absolutePath}" or with common JS extensions.`, 'error');
    return null;
  }

  /**
   * Internal logging utility. Outputs messages based on verbosity and message type.
   * This method ensures consistent logging format and behavior across the automator.
   *
   * @param {string} level - The severity level of the message ('debug', 'info', 'warn', 'error', 'critical', 'success').
   * @param {string} content - The message content to display.
   * @private
   */
  _emitLogMessage(level, content) {
    // Only log if verbose output is enabled, or if it's a significant message level.
    if (!this.configuration.verboseOutput && !['error', 'critical', 'warn', 'success'].includes(level)) {
      return;
    }

    const { logHandler, messageFormat } = this.configuration;

    // Determine the most appropriate logging method on the handler.
    let logMethod = logHandler[level];
    if (typeof logMethod !== 'function') {
      // Fallback to general log or info if specific method not found.
      logMethod = logHandler.log || logHandler.info || console.log;
      level = 'info'; // Adjust reported level if fallback is used.
    }

    // Ensure the log method is callable.
    if (typeof logMethod === 'function') {
      logMethod(messageFormat, ModuleAutomator.#SERVICE_LABEL, `[${level.toUpperCase()}] ${content}`);
    }
  }
}

/**
 * Establishes a nested object structure (namespace) within a target object.
 * This function ensures that each segment of a path exists as a property,
 * creating them if they don't already exist.
 *
 * @param {object} targetObject - The object where the namespace will be created.
 * @param {Array<string>} namespaceSegments - An array of strings representing the path segments.
 * @returns {object} The innermost object of the created namespace.
 * @throws {TypeError} If the targetObject is not a valid object.
 */
function establishNamespaceHierarchy(targetObject, namespaceSegments) {
  if (!targetObject || typeof targetObject !== 'object') {
    throw new TypeError('Target object for namespace creation must be a valid object.');
  }

  let currentLevel = targetObject;
  // Iterate through segments to build the hierarchy.
  for (const segment of namespaceSegments) {
    const formattedSegment = formatResourceName(segment); // Apply naming convention to each segment
    if (!currentLevel[formattedSegment] || typeof currentLevel[formattedSegment] !== 'object') {
      currentLevel[formattedSegment] = {}; // Create an empty object if segment doesn't exist or is not an object.
    }
    currentLevel = currentLevel[formattedSegment];
  }
  return currentLevel;
}

/**
 * Formats a given file path into a camelCase-like resource name.
 * This ensures consistency when mapping file names to object properties,
 * making them suitable for JavaScript identifier usage.
 *
 * @param {string} filePathString - The full path to the script or resource.
 * @returns {string} A formatted, method-friendly resource name.
 */
function formatResourceName(filePathString) {
  if (typeof filePathString !== 'string' || filePathString.trim() === '') {
    return ''; // Return an empty string or consider throwing an error for invalid input.
  }

  const baseNameWithoutExtension = pathResolver.basename(filePathString, pathResolver.extname(filePathString));

  // Replace any sequence of non-alphanumeric characters with a single dot, then split.
  // Example: "my-file.name_v1" -> "my.file.name.v1" -> ["my", "file", "name", "v1"]
  const nameSegments = baseNameWithoutExtension
    .replace(/[^a-zA-Z0-9]+/g, '.') // Convert non-alphanumeric sequences to a single dot
    .split('.')
    .filter(segment => segment.length > 0); // Remove any empty segments resulting from multiple dots

  if (nameSegments.length === 0) {
    return 'unnamedResource'; // Fallback for highly unusual or empty filenames.
  }

  // Take the first segment as is, then camelCase the rest of the segments.
  let formattedName = nameSegments[0];
  for (let i = 1; i < nameSegments.length; i++) {
    formattedName += nameSegments[i].charAt(0).toUpperCase() + nameSegments[i].slice(1);
  }

  return formattedName;
}

/**
 * Factory function to create a new ModuleAutomator instance.
 * This is the primary export for initializing the resource loading process.
 *
 * @param {string} initialPath - The starting path for resource discovery (file or directory).
 * @param {object} [loaderConfig={}] - Configuration parameters for the loader.
 * @returns {ModuleAutomator} A configured instance of ModuleAutomator.
 */
module.exports = function createModuleAutomator(initialPath, loaderConfig = {}) {
  return new ModuleAutomator(initialPath, loaderConfig);
};