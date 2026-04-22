/* This module provides functionality for recursively copying files and directories. */
var fileSystem = require('fs'),
    filePathUtils = require('path');

// Export the main deepCopy function for external use.
module.exports = deepCopy;
// Also attach it as a property to itself for backward compatibility or specific patterns.
deepCopy.deepCopy = deepCopy;

/**
 * Initiates a deep copy operation from an origin path to a destination path.
 *
 * @param {string} originPath The source file or directory path.
 * @param {string} destinationPath The target file or directory path.
 * @param {object} configSettings Optional configuration object for the copy operation.
 * @param {Function} completionHandler Callback function to execute upon completion or error.
 */
function deepCopy (originPath, destinationPath, configSettings, completionHandler) {
  let finalHandler = completionHandler;

  // Handle cases where options are omitted, shifting arguments.
  if (!completionHandler) {
    finalHandler = configSettings;
    configSettings = {};
  }

  // Establish the base execution directory.
  const workingDirectory = process.cwd();
  // Resolve absolute paths for source and destination.
  const resolvedOrigin = filePathUtils.resolve(workingDirectory, originPath);
  const resolvedDestination = filePathUtils.resolve(workingDirectory, destinationPath);

  // Extract various configuration parameters, providing defaults where necessary.
  const pathFilter = configSettings.filter;
  const nameTransformer = configSettings.rename;
  const dataTransformer = configSettings.transform;
  const overwriteExisting = configSettings.clobber !== false; // Default to true if not explicitly false
  const preserveModificationTime = configSettings.modified;
  const followSymlinks = configSettings.dereference;

  // Initialize counters and error tracking mechanism.
  let errorCollector = null; // Can be an array or a write stream
  let tasksInitiated = 0;
  let tasksCompleted = 0;
  let activeTasks = 0;

  // Determine the maximum concurrent operations.
  let concurrencyLimit = configSettings.limit || deepCopy.concurrencyLimit || 16;

  // Enforce a sensible range for the concurrency limit.
  concurrencyLimit = (concurrencyLimit < 1) ? 1 : (concurrencyLimit > 512) ? 512 : concurrencyLimit;

  // Begin the recursive copying process from the resolved origin.
  initiateReplication(resolvedOrigin);


  /**
   * Starts the copy process for a given source path, applying filters if configured.
   * @param {string} currentSource The path of the item to be copied.
   */
  function initiateReplication(currentSource) {
    tasksInitiated++; // Increment the count of operations started.

    // Apply path filtering if a filter is defined.
    if (pathFilter) {
      if (pathFilter instanceof RegExp) {
        // If filter is a regular expression, test the source path.
        if (!pathFilter.test(currentSource)) {
          return taskFinishedCallback(true); // Skip if filter doesn't match.
        }
      }
      else if (typeof pathFilter === 'function') {
        // If filter is a function, invoke it with the source path.
        if (!pathFilter(currentSource)) {
          return taskFinishedCallback(true); // Skip if filter function returns false.
        }
      }
    }
    // Proceed to retrieve file system metadata for the source.
    return retrieveMetadata(currentSource);
  }


  /**
   * Retrieves file system statistics (metadata) for a given path.
   * Handles concurrency limits and defers calls if too many tasks are active.
   *
   * @param {string} currentSource The path for which to retrieve metadata.
   */
  function retrieveMetadata(currentSource) {
    // Choose between fs.stat (dereferencing symlinks) or fs.lstat (not dereferencing).
    const statFunction = followSymlinks ? fileSystem.stat : fileSystem.lstat;

    // If the number of active tasks exceeds the concurrency limit,
    // defer this operation using setImmediate to allow other tasks to progress.
    if (activeTasks >= concurrencyLimit) {
      return setImmediate(function () {
        retrieveMetadata(currentSource); // Retry metadata retrieval later.
      });
    }

    activeTasks++; // Increment active task count.

    // Execute the chosen stat function.
    statFunction(currentSource, function (operationError, fileMetadata) {
      const fileEntry = {}; // Object to store relevant file system information.

      // Handle any errors during stat retrieval.
      if (operationError) {
        return logAndHandleError(operationError);
      }

      // Store essential metadata for the file system entry.
      fileEntry.entryName = currentSource;
      fileEntry.accessMode = fileMetadata.mode;
      fileEntry.modificationTime = fileMetadata.mtime; // Last modification timestamp.
      fileEntry.accessTime = fileMetadata.atime;     // Last access timestamp.

      // Determine the type of file system entry and delegate to appropriate handler.
      if (fileMetadata.isDirectory()) {
        return handleDirectory(fileEntry);
      }
      else if (fileMetadata.isFile()) {
        return handleFile(fileEntry);
      }
      else if (fileMetadata.isSymbolicLink()) {
        // Symbolic links don't primarily use mode in the same way as files/directories for copying.
        return handleSymbolicLink(currentSource);
      }
    });
  }


  /**
   * Handles the copying of a regular file.
   * @param {object} sourceFile Object containing file metadata.
   */
  function handleFile(sourceFile) {
    let destinationTarget = sourceFile.entryName.replace(resolvedOrigin, resolvedDestination);
    // Apply a custom rename transformation if specified.
    if (nameTransformer) {
      destinationTarget =  nameTransformer(destinationTarget);
    }

    // Check if the destination path is currently writable (i.e., does not exist or is accessible).
    checkWritePermission(destinationTarget, function (isDestWritable) {
      if (isDestWritable) {
        return replicateFile(sourceFile, destinationTarget); // Directly copy if writable.
      }
      // If not writable, check overwrite policy.
      if (overwriteExisting) {
        // Remove existing file before copying.
        removeFile(destinationTarget, function () {
          replicateFile(sourceFile, destinationTarget);
        });
      }
      // If modification time preservation is enabled, check timestamps.
      else if (preserveModificationTime) {
        const statFunction = followSymlinks ? fileSystem.stat : fileSystem.lstat;
        statFunction(destinationTarget, function(operationError, existingFileMetadata) {
            // Copy only if source file's modification time is newer than target's.
            if (sourceFile.modificationTime.getTime() > existingFileMetadata.mtime.getTime()) {
                replicateFile(sourceFile, destinationTarget);
            }
            else {
              return taskFinishedCallback(); // Target is newer or same, no copy needed.
            }
        });
      }
      else {
        // No overwrite, no modification check, simply complete the task.
        return taskFinishedCallback();
      }
    });
  }


  /**
   * Performs the actual file data replication.
   * @param {object} sourceFile Metadata of the file to copy.
   * @param {string} destinationTarget The full path of the destination file.
   */
  function replicateFile(sourceFile, destinationTarget) {
    const inputFlow = fileSystem.createReadStream(sourceFile.entryName);
    const outputFlow = fileSystem.createWriteStream(destinationTarget, { mode: sourceFile.accessMode });

    // Attach error handlers to both streams.
    inputFlow.on('error', logAndHandleError);
    outputFlow.on('error', logAndHandleError);

    // Apply a custom data transformation if specified.
    if (dataTransformer) {
      dataTransformer(inputFlow, outputFlow, sourceFile);
    } else {
      // If no transformer, pipe the read stream directly to the write stream.
      outputFlow.on('open', function() {
        inputFlow.pipe(outputFlow);
      });
    }

    // Once the write stream finishes, finalize the operation.
    outputFlow.once('finish', function() {
        if (preserveModificationTime) {
            // Synchronize access and modification times of the destination file.
            fileSystem.utimesSync(destinationTarget, sourceFile.accessTime, sourceFile.modificationTime);
            taskFinishedCallback();
        }
        else {
          taskFinishedCallback();
        }
    });
  }


  /**
   * Removes a file from the file system.
   * @param {string} filePath The path of the file to remove.
   * @param {Function} completionAction Callback to execute after removal.
   */
  function removeFile(filePath, completionAction) {
    fileSystem.unlink(filePath, function (operationError) {
      if (operationError) {
        return logAndHandleError(operationError);
      }
      return completionAction(); // Signal completion of removal.
    });
  }


  /**
   * Handles the processing of a directory entry.
   * @param {object} sourceDirectory Metadata of the directory.
   */
  function handleDirectory(sourceDirectory) {
    const destinationTarget = sourceDirectory.entryName.replace(resolvedOrigin, resolvedDestination);
    checkWritePermission(destinationTarget, function (isDestWritable) {
      if (isDestWritable) {
        return createDirectory(sourceDirectory, destinationTarget); // Create directory if writable.
      }
      // If directory already exists, proceed to copy its contents.
      replicateDirectoryContents(sourceDirectory.entryName);
    });
  }


  /**
   * Creates a new directory with specified mode.
   * @param {object} dirEntry Metadata of the directory to create.
   * @param {string} destinationTarget The path where the directory should be created.
   */
  function createDirectory(dirEntry, destinationTarget) {
    fileSystem.mkdir(destinationTarget, dirEntry.accessMode, function (operationError) {
      if (operationError) {
        return logAndHandleError(operationError);
      }
      // After creating the directory, proceed to copy its contents.
      replicateDirectoryContents(dirEntry.entryName);
    });
  }


  /**
   * Reads the contents of a directory and initiates copying for each item.
   * @param {string} directoryPath The path of the directory whose contents are to be replicated.
   */
  function replicateDirectoryContents(directoryPath) {
    fileSystem.readdir(directoryPath, function (operationError, directoryEntries) {
      if (operationError) {
        return logAndHandleError(operationError);
      }
      // For each entry found in the directory, initiate a new replication task.
      directoryEntries.forEach(function (entryName) {
        initiateReplication(filePathUtils.join(directoryPath, entryName));
      });
      return taskFinishedCallback(); // Mark this directory processing as complete.
    });
  }


  /**
   * Handles the processing of a symbolic link.
   * @param {string} sourceLink The path of the symbolic link.
   */
  function handleSymbolicLink(sourceLink) {
    const destinationTarget = sourceLink.replace(resolvedOrigin, resolvedDestination);
    fileSystem.readlink(sourceLink, function (operationError, actualTargetPath) {
      if (operationError) {
        return logAndHandleError(operationError);
      }
      verifySymbolicLink(actualTargetPath, destinationTarget); // Check and create the link.
    });
  }


  /**
   * Verifies the target of a symbolic link and creates it if necessary.
   * Handles dereferencing and existing links.
   *
   * @param {string} actualTargetPath The path the symbolic link points to.
   * @param {string} destinationTarget The path where the new symbolic link should be created.
   */
  function verifySymbolicLink(actualTargetPath, destinationTarget) {
    // If dereferencing is enabled, resolve the actual target path relative to the base path.
    if (followSymlinks) {
      actualTargetPath = filePathUtils.resolve(workingDirectory, actualTargetPath);
    }

    checkWritePermission(destinationTarget, function (isDestWritable) {
      if (isDestWritable) {
        return establishSymbolicLink(actualTargetPath, destinationTarget); // Create link if destination is writable.
      }

      // If destination exists, read its target to compare.
      fileSystem.readlink(destinationTarget, function (operationError, existingLinkTarget) {
        if (operationError) {
          return logAndHandleError(operationError);
        }

        // If dereferencing, resolve the existing link target.
        if (followSymlinks) {
          existingLinkTarget = filePathUtils.resolve(workingDirectory, existingLinkTarget);
        }

        // If the existing link points to the same target, no action needed.
        if (existingLinkTarget === actualTargetPath) {
          return taskFinishedCallback();
        }

        // If it points to a different target, remove the old link and create the new one.
        return removeFile(destinationTarget, function () {
          establishSymbolicLink(actualTargetPath, destinationTarget);
        });
      });
    });
  }


  /**
   * Creates a symbolic link.
   * @param {string} symlinkPath The path the new link should point to.
   * @param {string} targetLinkName The path where the new symbolic link will be created.
   */
  function establishSymbolicLink(symlinkPath, targetLinkName) {
    fileSystem.symlink(symlinkPath, targetLinkName, function (operationError) {
      if (operationError) {
        return logAndHandleError(operationError);
      }
      return taskFinishedCallback(); // Link created successfully.
    });
  }


  /**
   * Checks if a given path is writable (i.e., does not exist or can be created).
   * @param {string} checkPath The path to check.
   * @param {Function} done Callback function receiving a boolean indicating writability.
   */
  function checkWritePermission(checkPath, done) {
    fileSystem.lstat(checkPath, function (operationError) {
      if (operationError) {
        // If error code is 'ENOENT' (Entry Not Found), it means the path doesn't exist, so it's writable.
        if (operationError.code === 'ENOENT') return done(true);
        // Other errors mean it's not writable or accessible for creation.
        return done(false);
      }
      // If no error, the path exists, so it's not writable for creation (unless overwritten).
      return done(false);
    });
  }


  /**
   * Centralized error logging and handling function.
   * @param {Error} operationError The error object to handle.
   */
  function logAndHandleError(operationError) {
    // If 'stopOnError' is true, immediately terminate the entire copy operation.
    if (configSettings.stopOnError) {
      return finalHandler(operationError);
    }
    // If 'errs' option is a path, create a write stream for errors if not already created.
    else if (!errorCollector && configSettings.errs) {
      errorCollector = fileSystem.createWriteStream(configSettings.errs);
    }
    // If no specific error stream path, collect errors in an array.
    else if (!errorCollector) {
      errorCollector = [];
    }

    // Write error to stream or push to array.
    if (typeof errorCollector.write === 'function') { // Check if it's a stream.
      errorCollector.write(operationError.stack + '\n\n');
    }
    else { // It's an array.
      errorCollector.push(operationError);
    }
    return taskFinishedCallback(); // Continue processing other tasks.
  }


  /**
   * Callback executed when an individual task finishes.
   * Manages task counts and triggers the final completion handler.
   *
   * @param {boolean} [wasSkipped=false] True if the task was skipped and didn't consume an active slot.
   */
  function taskFinishedCallback(wasSkipped) {
    if (!wasSkipped) activeTasks--; // Decrement active task count if it wasn't skipped.
    tasksCompleted++; // Increment total completed tasks.

    // If all tasks initiated have been completed and no tasks are currently active,
    // invoke the final completion handler.
    if ((tasksInitiated === tasksCompleted) && (activeTasks === 0)) {
      if (finalHandler !== undefined ) {
        // Pass collected errors (if any) or null to the final handler.
        return errorCollector ? finalHandler(errorCollector) : finalHandler(null);
      }
    }
  }
}