const fileSystemModule = require('fs'); // Core module for file system operations
const pathUtility = require('path');       // Core module for path manipulation

// Export the primary utility function
module.exports = deepCopyUtility;
deepCopyUtility.deepCopyUtility = deepCopyUtility; // Self-reference for convenience or legacy reasons

/**
 * Initiates a recursive deep copy operation from a source path to a destination path.
 *
 * @param {string} sourcePath - The original path to copy from.
 * @param {string} destinationPath - The target path to copy to.
 * @param {object} [operationOptions] - Configuration settings for the copy process.
 * @param {function} [operationCallback] - Callback function to invoke upon completion or error.
 */
function deepCopyUtility (sourcePath, destinationPath, operationOptions, operationCallback) {
  let finalCallback = operationCallback; // Store the user-provided callback

  // Handle flexible argument signature: options are optional
  if (typeof finalCallback === 'undefined' && typeof operationOptions === 'function') {
    finalCallback = operationOptions;
    operationOptions = {}; // No options provided, initialize to empty object
  } else if (typeof operationOptions === 'undefined') {
    operationOptions = {}; // No options provided at all
  }

  // Basic input validation
  if (!sourcePath || !destinationPath) {
    if (finalCallback) {
      return finalCallback(new Error('Source and destination paths must be provided.'));
    } else {
      throw new Error('Source and destination paths must be provided.');
    }
  }

  // Determine the base and absolute paths for source and destination
  const executionBaseDirectory = process.cwd();
  const absoluteSourcePath = pathUtility.resolve(executionBaseDirectory, sourcePath);
  const absoluteDestinationPath = pathUtility.resolve(executionBaseDirectory, destinationPath);

  // Extract and normalize configuration parameters
  const pathFilterFunction = operationOptions.filter;
  const pathRenamerFunction = operationOptions.rename;
  const dataTransformerFunction = operationOptions.transform;
  const overwriteExisting = operationOptions.clobber !== false; // Default to true
  const copyIfModified = operationOptions.modified;
  const followSymlinks = operationOptions.dereference;
  const stopOnErrorEncountered = operationOptions.stopOnError || false; // Default to false

  // Error handling mechanism setup
  let accumulatedErrors = null; // Can be an array or a write stream
  const errorLogFilePath = operationOptions.errorLogFile; // Path to an error log file

  // Concurrency control variables
  let pendingOperationsCount = 0; // Total operations initiated
  let completedOperationsCount = 0; // Total operations finished
  let activeOperationsCount = 0; // Currently running operations
  const concurrentLimit = Math.max(1, Math.min(512, operationOptions.limit || deepCopyUtility.limit || 16)); // Enforce reasonable limits

  // Begin the copy process by checking the source
  processSourceNode(absoluteSourcePath);

  /**
   * Processes a file system node, applying filters and retrieving its statistics.
   * @param {string} nodePath - The path of the file system node.
   */
  function processSourceNode (nodePath) {
    pendingOperationsCount++; // Increment total operations counter

    // Apply filtering logic if a filter is provided
    if (pathFilterFunction) {
      let filterResult = false;
      if (pathFilterFunction instanceof RegExp) {
        filterResult = pathFilterFunction.test(nodePath);
      } else if (typeof pathFilterFunction === 'function') {
        filterResult = pathFilterFunction(nodePath);
      }

      if (!filterResult) {
        return signalOperationCompletion(true); // Node skipped by filter
      }
    }

    // Proceed to gather statistics for the node
    retrieveNodeStatistics(nodePath);
  }

  /**
   * Retrieves file system statistics for a given path, respecting concurrency limits.
   * @param {string} entryPath - The path to get statistics for.
   */
  function retrieveNodeStatistics (entryPath) {
    // Determine whether to follow symbolic links
    const statMethod = followSymlinks ? fileSystemModule.stat : fileSystemModule.lstat;

    // Apply concurrency limit
    if (activeOperationsCount >= concurrentLimit) {
      // Defer execution if limit is reached
      return process.nextTick(() => retrieveNodeStatistics(entryPath));
    }

    activeOperationsCount++; // Increment active operations

    statMethod(entryPath, (statError, nodeStats) => {
      if (statError) {
        return handleOperationError(statError); // Handle errors during stat retrieval
      }

      // Create an object to hold node metadata
      const nodeMetadata = {
        absolutePath: entryPath,
        permissionMode: nodeStats.mode,
        lastModifiedTime: nodeStats.mtime, // Modified time
        lastAccessTime: nodeStats.atime    // Access time
      };

      // Dispatch based on node type
      if (nodeStats.isDirectory()) {
        return handleSourceDirectory(nodeMetadata);
      } else if (nodeStats.isFile()) {
        return handleSourceFile(nodeMetadata);
      } else if (nodeStats.isSymbolicLink()) {
        return handleSymbolicLink(entryPath); // Symlinks need their original path for readlink
      } else {
        // Unhandled file type, complete the operation
        return signalOperationCompletion();
      }
    });
  }

  /**
   * Handles the copying of a regular file.
   * @param {object} fileInfo - Metadata about the source file.
   */
  function handleSourceFile (fileInfo) {
    let finalTargetPath = fileInfo.absolutePath.replace(absoluteSourcePath, absoluteDestinationPath);

    // Apply renaming function if provided
    if (pathRenamerFunction) {
      finalTargetPath = pathRenamerFunction(finalTargetPath);
    }

    checkPathAvailability(finalTargetPath, (isAvailable) => {
      if (isAvailable) {
        // Destination path is available (doesn't exist), proceed with copy
        return transferFileContents(fileInfo, finalTargetPath);
      }

      // Destination path exists
      if (overwriteExisting) {
        // Clobber is enabled, remove existing file then copy
        removeTargetEntry(finalTargetPath, (removalError) => {
          if (removalError) {
            return handleOperationError(removalError);
          }
          transferFileContents(fileInfo, finalTargetPath);
        });
      } else if (copyIfModified) {
        // Clobber is off, but check if source is newer
        const statMethod = followSymlinks ? fileSystemModule.stat : fileSystemModule.lstat;
        statMethod(finalTargetPath, (statError, existingTargetStats) => {
          if (statError) {
            // If target doesn't exist, or other error, treat as modified (or handle error)
            if (statError.code === 'ENOENT') {
              return transferFileContents(fileInfo, finalTargetPath); // Target doesn't exist, so copy
            }
            return handleOperationError(statError);
          }

          // Compare modification times
          if (fileInfo.lastModifiedTime.getTime() > existingTargetStats.mtime.getTime()) {
            return transferFileContents(fileInfo, finalTargetPath);
          } else {
            return signalOperationCompletion(); // Target is not older, skip copy
          }
        });
      } else {
        // Clobber and modified checks are off, skip copying
        return signalOperationCompletion();
      }
    });
  }

  /**
   * Performs the actual file data transfer.
   * @param {object} sourceFileDetails - Metadata of the source file.
   * @param {string} destinationFilePath - The path to write the file to.
   */
  function transferFileContents (sourceFileDetails, destinationFilePath) {
    const readStream = fileSystemModule.createReadStream(sourceFileDetails.absolutePath);
    const writeStream = fileSystemModule.createWriteStream(destinationFilePath, { mode: sourceFileDetails.permissionMode });

    readStream.on('error', handleOperationError);
    writeStream.on('error', handleOperationError);

    // Apply transform function if provided
    if (dataTransformerFunction) {
      dataTransformerFunction(readStream, writeStream, sourceFileDetails);
    } else {
      // Pipe data directly
      writeStream.on('open', () => {
        readStream.pipe(writeStream);
      });
    }

    // Once writing is complete
    writeStream.once('finish', () => {
      if (copyIfModified) {
        // Synchronize access and modification times of the target file
        try {
          fileSystemModule.utimesSync(destinationFilePath, sourceFileDetails.lastAccessTime, sourceFileDetails.lastModifiedTime);
        } catch (utimesError) {
          handleOperationError(utimesError); // Log utimes errors but don't stop copy
        }
      }
      signalOperationCompletion();
    });
  }

  /**
   * Removes a file or symbolic link.
   * @param {string} targetPath - The path to remove.
   * @param {function} doneCallback - Callback to invoke after removal.
   */
  function removeTargetEntry (targetPath, doneCallback) {
    fileSystemModule.unlink(targetPath, (unlinkError) => {
      if (unlinkError) {
        // If file doesn't exist, it's fine, otherwise report error
        if (unlinkError.code === 'ENOENT') {
          return doneCallback(null); // Already gone
        }
        return doneCallback(unlinkError);
      }
      doneCallback(null);
    });
  }

  /**
   * Handles the processing of a source directory.
   * @param {object} directoryInfo - Metadata about the source directory.
   */
  function handleSourceDirectory (directoryInfo) {
    const finalTargetDirectoryPath = directoryInfo.absolutePath.replace(absoluteSourcePath, absoluteDestinationPath);

    checkPathAvailability(finalTargetDirectoryPath, (isAvailable) => {
      if (isAvailable) {
        // Destination directory doesn't exist, create it
        return createDestinationDirectory(directoryInfo, finalTargetDirectoryPath);
      }
      // Destination directory already exists, just enumerate its contents
      enumerateDirectoryContents(directoryInfo.absolutePath);
    });
  }

  /**
   * Creates a new directory at the destination path.
   * @param {object} sourceDirectoryDetails - Metadata of the source directory.
   * @param {string} targetDirectoryPath - The path to create the directory.
   */
  function createDestinationDirectory (sourceDirectoryDetails, targetDirectoryPath) {
    fileSystemModule.mkdir(targetDirectoryPath, sourceDirectoryDetails.permissionMode, (mkdirError) => {
      if (mkdirError) {
        if (mkdirError.code === 'EEXIST') {
          // Directory already exists, which is fine, proceed
          return enumerateDirectoryContents(sourceDirectoryDetails.absolutePath);
        }
        return handleOperationError(mkdirError);
      }
      // Directory created successfully, now enumerate its contents
      enumerateDirectoryContents(sourceDirectoryDetails.absolutePath);
    });
  }

  /**
   * Reads and processes the contents of a directory.
   * @param {string} currentDirectoryPath - The path of the directory to enumerate.
   */
  function enumerateDirectoryContents (currentDirectoryPath) {
    fileSystemModule.readdir(currentDirectoryPath, (readdirError, directoryItems) => {
      if (readdirError) {
        return handleOperationError(readdirError);
      }

      // If the directory is empty, we can mark this operation as complete immediately.
      // Otherwise, each item will trigger its own `processSourceNode` which increments `pendingOperationsCount`.
      // The `signalOperationCompletion` for this directory itself will be called AFTER all its children are initiated.
      if (directoryItems.length === 0) {
        return signalOperationCompletion();
      }

      // Process each item within the directory
      directoryItems.forEach((itemEntry) => {
        processSourceNode(pathUtility.join(currentDirectoryPath, itemEntry));
      });
      signalOperationCompletion(); // This directory operation itself is done (its children are initiated)
    });
  }

  /**
   * Handles the processing of a symbolic link.
   * @param {string} symlinkPath - The path of the symbolic link.
   */
  function handleSymbolicLink (symlinkPath) {
    const targetLinkPath = symlinkPath.replace(absoluteSourcePath, absoluteDestinationPath);

    fileSystemModule.readlink(symlinkPath, (readlinkError, resolvedOriginalPath) => {
      if (readlinkError) {
        return handleOperationError(readlinkError);
      }
      validateAndRecreateLink(resolvedOriginalPath, targetLinkPath);
    });
  }

  /**
   * Validates and potentially recreates a symbolic link at the destination.
   * @param {string} resolvedSourcePath - The path the source symlink points to.
   * @param {string} resolvedTargetPath - The intended destination for the new symlink.
   */
  function validateAndRecreateLink (resolvedSourcePath, resolvedTargetPath) {
    let normalizedSourceLinkTarget = resolvedSourcePath;
    if (followSymlinks) {
      // If dereferencing, resolve the path relative to the base directory
      normalizedSourceLinkTarget = pathUtility.resolve(executionBaseDirectory, resolvedSourcePath);
    }

    checkPathAvailability(resolvedTargetPath, (isAvailable) => {
      if (isAvailable) {
        // Destination path is available, create the new symlink
        return establishSymlink(normalizedSourceLinkTarget, resolvedTargetPath);
      }

      // Destination path exists, check if it's an identical symlink
      fileSystemModule.readlink(resolvedTargetPath, (readlinkError, existingTargetLinkPath) => {
        if (readlinkError) {
          return handleOperationError(readlinkError);
        }

        let normalizedExistingTarget = existingTargetLinkPath;
        if (followSymlinks) {
          normalizedExistingTarget = pathUtility.resolve(executionBaseDirectory, existingTargetLinkPath);
        }

        if (normalizedExistingTarget === normalizedSourceLinkTarget) {
          return signalOperationCompletion(); // Link already exists and points to the same target
        }

        // Existing link is different or points elsewhere, remove and recreate
        removeTargetEntry(resolvedTargetPath, (removalError) => {
          if (removalError) {
            return handleOperationError(removalError);
          }
          establishSymlink(normalizedSourceLinkTarget, resolvedTargetPath);
        });
      });
    });
  }

  /**
   * Creates a symbolic link.
   * @param {string} linkTarget - The path the symlink should point to.
   * @param {string} linkDestination - The path where the symlink itself will be created.
   */
  function establishSymlink (linkTarget, linkDestination) {
    fileSystemModule.symlink(linkTarget, linkDestination, (symlinkError) => {
      if (symlinkError) {
        return handleOperationError(symlinkError);
      }
      signalOperationCompletion();
    });
  }

  /**
   * Checks if a given path is available for writing (i.e., does not exist).
   * @param {string} targetPath - The path to check.
   * @param {function(boolean)} callback - Callback with true if available, false otherwise.
   */
  function checkPathAvailability (targetPath, callback) {
    fileSystemModule.lstat(targetPath, (statError) => {
      if (statError) {
        // If error is ENOENT (No such file or directory), then path is available
        return callback(statError.code === 'ENOENT');
      }
      // Path exists, so it's not available for direct writing (unless clobber)
      callback(false);
    });
  }

  /**
   * Centralized error handling function.
   * @param {Error} errorObject - The error that occurred.
   */
  function handleOperationError (errorObject) {
    if (stopOnErrorEncountered) {
      // If configured to stop on first error, invoke the main callback immediately
      if (finalCallback) {
        return finalCallback(errorObject);
      }
      throw errorObject; // Or rethrow if no callback
    } else {
      // Accumulate errors
      if (!accumulatedErrors) {
        if (errorLogFilePath) {
          // If a log file is specified, create a write stream
          accumulatedErrors = fileSystemModule.createWriteStream(errorLogFilePath, { flags: 'a' });
          accumulatedErrors.on('error', (streamErr) => {
            console.error(`Failed to write to error log file ${errorLogFilePath}:`, streamErr);
            // Fallback to in-memory array if stream fails
            accumulatedErrors = [errorObject];
          });
        } else {
          // Otherwise, use an in-memory array
          accumulatedErrors = [];
        }
      }

      if (Array.isArray(accumulatedErrors)) {
        accumulatedErrors.push(errorObject);
      } else if (accumulatedErrors && typeof accumulatedErrors.write === 'function') {
        accumulatedErrors.write(`[${new Date().toISOString()}] Error: ${errorObject.stack || errorObject.message}\n`);
      }
    }
    signalOperationCompletion(); // Mark the current operation as complete despite error
  }

  /**
   * Signals the completion of an individual file system operation.
   * @param {boolean} [wasSkipped=false] - True if the operation was skipped (e.g., by filter).
   */
  function signalOperationCompletion (wasSkipped = false) {
    if (!wasSkipped) {
      activeOperationsCount--; // Decrement active count only for operations that truly ran
    }
    completedOperationsCount++; // Increment total completed count

    // Check if all operations have finished
    if (pendingOperationsCount === completedOperationsCount && activeOperationsCount === 0) {
      if (finalCallback) {
        // If there were accumulated errors, pass them to the callback
        if (accumulatedErrors) {
          if (Array.isArray(accumulatedErrors)) {
            finalCallback(accumulatedErrors.length > 0 ? accumulatedErrors : null);
          } else if (typeof accumulatedErrors.end === 'function') {
            accumulatedErrors.end(() => finalCallback(accumulatedErrors)); // Ensure stream is closed before callback
          } else {
            finalCallback(accumulatedErrors);
          }
        } else {
          finalCallback(null); // No errors
        }
      }
    }
  }
}