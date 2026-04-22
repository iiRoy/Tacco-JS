/*
 * Virtual JSON File System Emulation Layer
 *
 * This utility provides a FUSE-based interface for navigating and manipulating
 * a JSON object as if it were a standard file system. Directories are
 * represented by JSON objects, and files by string values.
 *
 * This software is provided under an open-source license.
 * Refer to the accompanying LICENSE.md file for full details of distribution and use.
 */

const kernelApi = require('fuse4js');
const diskOps = require('fs');

let fileSystemRoot = null; // The primary JSON data structure acting as the file system's root
let configSettings = {};   // Runtime configuration parameters for the file system operation

// Standard POSIX error codes for consistent error reporting
const POSIX_ERROR_CODES = Object.freeze({
  OPERATION_NOT_PERMITTED: -1, // EPERM
  NO_SUCH_FILE_OR_DIRECTORY: -2, // ENOENT
  INVALID_ARGUMENT: -22, // EINVAL
  FILE_EXISTS: -17, // EEXIST
  DIRECTORY_NOT_EMPTY: -39 // ENOTEMPTY
});

// Utility function to generate a string with padding
const createPaddedString = (initialString, padLength, padChar = ' ') => {
  if (padLength <= 0) return initialString;
  return initialString + padChar.repeat(padLength);
};

//---------------------------------------------------------------------------

/**
 * Traverses the internal JSON structure to locate a specific node
 * corresponding to the provided file system path.
 * @param {object} baseNode The starting point for the path traversal (usually the fileSystemRoot).
 * @param {string} targetPath The absolute path to resolve (e.g., "/dir/file.txt").
 * @returns {object} An object containing the found node, its parent, and its leaf name.
 */
function resolvePathNode(baseNode, targetPath) {
  if (typeof targetPath !== 'string') {
    return { locatedNode: undefined, parentOfNode: null, finalName: '', traversalSuccessful: false };
  }

  if (targetPath === '/' || targetPath === '') {
    return { locatedNode: baseNode, parentOfNode: null, finalName: '', traversalSuccessful: true };
  }

  const pathSegments = targetPath.split('/').filter(segment => segment.length > 0);
  let currentNode = baseNode;
  let priorNode = null;
  let lastSegmentName = '';
  let traversalSuccessful = true;

  for (const segment of pathSegments) {
    if (typeof currentNode === 'object' && currentNode !== null) {
      priorNode = currentNode;
      lastSegmentName = segment;
      currentNode = currentNode[segment];
      if (typeof currentNode === 'undefined') {
        traversalSuccessful = false;
        break;
      }
    } else {
      traversalSuccessful = false; // Path segment refers to non-object parent
      break;
    }
  }

  return { locatedNode: currentNode, parentOfNode: priorNode, finalName: lastSegmentName, traversalSuccessful };
}

//---------------------------------------------------------------------------

/**
 * Handles the `getattr` system call, providing file/directory attributes.
 * @param {string} resourcePath The path to the file or directory.
 * @param {function(number, object): void} completionCallback The callback function.
 */
function getEntryAttributes(resourcePath, completionCallback) {
  let attributeData = {};
  let currentErrorCode = 0; // Assume success initially

  const foundInfo = resolvePathNode(fileSystemRoot, resourcePath);
  const targetNode = foundInfo.locatedNode;

  if (!foundInfo.traversalSuccessful || typeof targetNode === 'undefined') {
    currentErrorCode = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY;
  } else if (typeof targetNode === 'object' && targetNode !== null) { // It's a directory
    attributeData.size = 4096; // Standard size for a directory entry
    attributeData.mode = 0o40755; // Directory with rwxr-xr-x permissions
  } else if (typeof targetNode === 'string') { // It's a file
    attributeData.size = Buffer.byteLength(targetNode, 'utf8');
    attributeData.mode = 0o100644; // File with rw-r--r-- permissions
  } else {
    // Unknown type, or other non-standard node. Treat as non-existent or error.
    currentErrorCode = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  }

  if (currentErrorCode === 0) {
    // Add common attributes for both files and directories
    attributeData.nlink = 1; // Number of hard links
    const now = Date.now();
    attributeData.atimeMs = now; // Access time
    attributeData.mtimeMs = now; // Modification time
    attributeData.ctimeMs = now; // Creation time
    attributeData.uid = process.getuid ? process.getuid() : 0; // User ID
    attributeData.gid = process.getgid ? process.getgid() : 0; // Group ID
  }

  completionCallback(currentErrorCode, attributeData);
}

//---------------------------------------------------------------------------

/**
 * Handles the `readdir` system call, listing directory contents.
 * @param {string} dirPath The path to the directory.
 * @param {function(number, string[]): void} responseCallback The callback function.
 */
function listDirectoryContents(dirPath, responseCallback) {
  let directoryEntries = [];
  let operationStatus = 0; // Assume success

  const foundInfo = resolvePathNode(fileSystemRoot, dirPath);
  const targetNode = foundInfo.locatedNode;

  if (!foundInfo.traversalSuccessful || typeof targetNode === 'undefined') {
    operationStatus = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY;
  } else if (typeof targetNode === 'string') { // Attempting to read a file as a directory
    operationStatus = POSIX_ERROR_CODES.INVALID_ARGUMENT;
  } else if (typeof targetNode === 'object' && targetNode !== null) { // Valid directory
    directoryEntries = Object.keys(targetNode);
    // Standard Unix directory entries
    directoryEntries.unshift('.', '..');
  } else {
    operationStatus = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  }

  responseCallback(operationStatus, directoryEntries);
}

//---------------------------------------------------------------------------

/**
 * Handles the `open` system call, opening a file for access.
 * @param {string} filePath The path to the file.
 * @param {number} accessFlags Requested access flags.
 * @param {function(number, number): void} completionCallback The callback function.
 */
function openFileHandle(filePath, accessFlags, completionCallback) {
  let operationError = 0; // Assume success

  const foundEntry = resolvePathNode(fileSystemRoot, filePath);

  if (!foundEntry.traversalSuccessful || typeof foundEntry.locatedNode === 'undefined') {
    operationError = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY;
  } else if (typeof foundEntry.locatedNode === 'object' && foundEntry.locatedNode !== null) {
    // Cannot open a directory like a file
    operationError = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  }

  // The original code doesn't return a file handle, so fuse4js assigns 0.
  // We maintain this behavior.
  completionCallback(operationError, 0);
}

//---------------------------------------------------------------------------

/**
 * Handles the `read` system call, reading data from a file.
 * @param {string} resourcePath The path to the file.
 * @param {number} startOffset The file offset to read from.
 * @param {number} readLength The number of bytes to read.
 * @param {Buffer} targetBuffer The Buffer to write the data to.
 * @param {number} fileHandleId The optional file handle.
 * @param {function(number): void} completionCallback The callback function.
 */
function readBlockData(resourcePath, startOffset, readLength, targetBuffer, fileHandleId, completionCallback) {
  let operationStatus = 0; // Assume success, or number of bytes read

  const foundInfo = resolvePathNode(fileSystemRoot, resourcePath);
  const targetEntry = foundInfo.locatedNode;

  if (!foundInfo.traversalSuccessful || typeof targetEntry === 'undefined') {
    operationStatus = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY;
  } else if (typeof targetEntry === 'object' && targetEntry !== null) { // Attempting to read a directory
    operationStatus = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  } else if (typeof targetEntry === 'string') { // Valid file (string content)
    if (startOffset < 0 || readLength < 0) {
      operationStatus = POSIX_ERROR_CODES.INVALID_ARGUMENT;
    } else if (startOffset >= Buffer.byteLength(targetEntry, 'utf8')) {
      operationStatus = 0; // Reading past end of file returns 0 bytes read
    } else {
      const remainingBytes = Buffer.byteLength(targetEntry, 'utf8') - startOffset;
      const actualBytesToRead = Math.min(readLength, remainingBytes);

      // Convert string to buffer to handle byte offsets correctly
      const fullBufferContent = Buffer.from(targetEntry, 'utf8');
      const dataSlice = fullBufferContent.slice(startOffset, startOffset + actualBytesToRead);

      dataSlice.copy(targetBuffer, 0, 0, actualBytesToRead);
      operationStatus = actualBytesToRead;
    }
  } else {
    // Unrecognized node type
    operationStatus = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  }

  completionCallback(operationStatus);
}

//---------------------------------------------------------------------------

/**
 * Handles the `write` system call, writing data to a file.
 * @param {string} resourcePath The path to the file.
 * @param {number} startOffset The file offset to write to.
 * @param {number} dataLength The number of bytes to write.
 * @param {Buffer} sourceBuffer The Buffer to read data from.
 * @param {number} fileHandleId The optional file handle.
 * @param {function(number): void} completionCallback The callback function.
 */
function writeBlockData(resourcePath, startOffset, dataLength, sourceBuffer, fileHandleId, completionCallback) {
  let operationStatus = 0; // Assume success, or number of bytes written

  const foundInfo = resolvePathNode(fileSystemRoot, resourcePath);
  const targetEntry = foundInfo.locatedNode;
  const entryName = foundInfo.finalName;
  const parentContainer = foundInfo.parentOfNode;

  if (!foundInfo.traversalSuccessful || typeof targetEntry === 'undefined') {
    operationStatus = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY;
  } else if (typeof targetEntry === 'object' && targetEntry !== null) { // Cannot write to a directory
    operationStatus = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  } else if (typeof targetEntry === 'string' && parentContainer !== null) { // Valid file (string content)
    if (startOffset < 0 || dataLength < 0) {
      operationStatus = POSIX_ERROR_CODES.INVALID_ARGUMENT;
      completionCallback(operationStatus);
      return;
    }

    const incomingData = sourceBuffer.toString('utf8').slice(0, dataLength); // Ensure we only take 'dataLength' bytes
    const currentContentBuffer = Buffer.from(targetEntry, 'utf8');
    let newContentBuffer;

    if (startOffset <= currentContentBuffer.length) {
      const beforeBuffer = currentContentBuffer.slice(0, startOffset);
      const afterBuffer = currentContentBuffer.slice(startOffset + incomingData.length);
      newContentBuffer = Buffer.concat([beforeBuffer, Buffer.from(incomingData, 'utf8'), afterBuffer]);
    } else {
      // Writing past the end of the current file, fill with null bytes (or spaces, as per original)
      const paddingLength = startOffset - currentContentBuffer.length;
      const paddingBuffer = Buffer.alloc(paddingLength, ' '); // Using space character for padding
      newContentBuffer = Buffer.concat([currentContentBuffer, paddingBuffer, Buffer.from(incomingData, 'utf8')]);
    }

    parentContainer[entryName] = newContentBuffer.toString('utf8');
    operationStatus = incomingData.length;
  } else {
    // Unrecognized node type or no parent (e.g., trying to write to root)
    operationStatus = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  }

  completionCallback(operationStatus);
}

//---------------------------------------------------------------------------

/**
 * Handles the `release` system call, closing a file handle.
 * @param {string} resourcePath The path to the file.
 * @param {number} handleId The optional file handle.
 * @param {function(number): void} completionCallback The callback function.
 */
function releaseFileHandle(resourcePath, handleId, completionCallback) {
  // In this simplified file system, there are no actual file handles to release.
  // We can optionally log the event for debugging purposes if enabled.
  // if (configSettings.enableDebug) console.debug(`File handle ${handleId} for ${resourcePath} released.`);
  completionCallback(0);
}

//---------------------------------------------------------------------------

/**
 * Handles the `create` system call, creating a new file.
 * @param {string} newPath The path of the new file.
 * @param {number} permissions The desired permissions of the new file.
 * @param {function(number, number): void} completionCallback The callback function.
 */
function createFileEntry(newPath, permissions, completionCallback) {
  let operationResult = 0; // Assume success

  const foundLocation = resolvePathNode(fileSystemRoot, newPath);

  if (!foundLocation.traversalSuccessful) {
    operationResult = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY; // Parent path doesn't exist
  } else if (typeof foundLocation.locatedNode !== 'undefined') {
    operationResult = POSIX_ERROR_CODES.FILE_EXISTS; // File or directory already exists
  } else if (foundLocation.parentOfNode === null) {
    // Attempt to create a file at the root level without a parent container
    operationResult = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  } else {
    foundLocation.parentOfNode[foundLocation.finalName] = ''; // Create an empty string file
  }

  completionCallback(operationResult, 0); // Always return file handle 0
}

//---------------------------------------------------------------------------

/**
 * Handles the `unlink` system call, deleting a file.
 * @param {string} filePathToRemove The path to the file to delete.
 * @param {function(number): void} completionCallback The callback function.
 */
function deleteFileEntry(filePathToRemove, completionCallback) {
  let operationResult = 0; // Assume success

  const foundEntry = resolvePathNode(fileSystemRoot, filePathToRemove);

  if (!foundEntry.traversalSuccessful || typeof foundEntry.locatedNode === 'undefined') {
    operationResult = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY;
  } else if (typeof foundEntry.locatedNode === 'object' && foundEntry.locatedNode !== null) {
    // Cannot unlink a directory, use rmdir
    operationResult = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  } else if (foundEntry.parentOfNode === null) {
    // Cannot delete the root object itself
    operationResult = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  } else {
    delete foundEntry.parentOfNode[foundEntry.finalName];
  }

  completionCallback(operationResult);
}

//---------------------------------------------------------------------------

/**
 * Handles the `rename` system call, moving or renaming a file/directory.
 * @param {string} sourcePath The path of the entry to rename.
 * @param {string} destinationPath The new path.
 * @param {function(number): void} completionCallback The callback function.
 */
function moveEntry(sourcePath, destinationPath, completionCallback) {
  let operationResult = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY; // Assume failure

  const sourceEntryInfo = resolvePathNode(fileSystemRoot, sourcePath);

  if (!sourceEntryInfo.traversalSuccessful || typeof sourceEntryInfo.locatedNode === 'undefined') {
    // Source does not exist
    completionCallback(operationResult);
    return;
  }

  if (sourceEntryInfo.parentOfNode === null) {
    // Cannot rename the root itself
    completionCallback(POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED);
    return;
  }

  const destinationEntryInfo = resolvePathNode(fileSystemRoot, destinationPath);

  if (destinationEntryInfo.traversalSuccessful && typeof destinationEntryInfo.locatedNode !== 'undefined') {
    // Destination already exists
    operationResult = POSIX_ERROR_CODES.FILE_EXISTS;
  } else if (!destinationEntryInfo.traversalSuccessful || destinationEntryInfo.parentOfNode === null) {
    // Destination parent path does not exist, or attempting to rename to root
    operationResult = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY;
  } else {
    // Perform the rename/move
    destinationEntryInfo.parentOfNode[destinationEntryInfo.finalName] = sourceEntryInfo.locatedNode;
    delete sourceEntryInfo.parentOfNode[sourceEntryInfo.finalName];
    operationResult = 0; // Success
  }

  completionCallback(operationResult);
}

//---------------------------------------------------------------------------

/**
 * Handles the `mkdir` system call, creating a new directory.
 * @param {string} newDirPath The path of the new directory.
 * @param {number} permissions The desired permissions of the new directory.
 * @param {function(number): void} completionCallback The callback function.
 */
function makeDirectoryEntry(newDirPath, permissions, completionCallback) {
  let operationResult = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY; // Assume failure

  const targetDirInfo = resolvePathNode(fileSystemRoot, newDirPath);

  if (!targetDirInfo.traversalSuccessful) {
    // Parent path doesn't exist
    completionCallback(operationResult);
    return;
  }

  if (typeof targetDirInfo.locatedNode !== 'undefined') {
    operationResult = POSIX_ERROR_CODES.FILE_EXISTS; // Entry already exists
  } else if (targetDirInfo.parentOfNode === null) {
    // Cannot create a directory at the root level without a parent container (e.g., create '/' as a new dir)
    operationResult = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED;
  } else {
    targetDirInfo.parentOfNode[targetDirInfo.finalName] = {}; // Create an empty object as a new directory
    operationResult = 0; // Success
  }

  completionCallback(operationResult);
}

//---------------------------------------------------------------------------

/**
 * Handles the `rmdir` system call, removing an empty directory.
 * @param {string} dirPathToRemove The path of the directory to remove.
 * @param {function(number): void} completionCallback The callback function.
 */
function removeDirectoryEntry(dirPathToRemove, completionCallback) {
  let operationResult = POSIX_ERROR_CODES.NO_SUCH_FILE_OR_DIRECTORY; // Assume failure

  const targetDirInfo = resolvePathNode(fileSystemRoot, dirPathToRemove);

  if (!targetDirInfo.traversalSuccessful || typeof targetDirInfo.locatedNode === 'undefined') {
    // Directory does not exist
    completionCallback(operationResult);
    return;
  }

  if (typeof targetDirInfo.locatedNode === 'string') {
    operationResult = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED; // Cannot remove a file with rmdir
  } else if (targetDirInfo.parentOfNode === null) {
    operationResult = POSIX_ERROR_CODES.OPERATION_NOT_PERMITTED; // Cannot remove the root directory
  } else if (Object.keys(targetDirInfo.locatedNode).length > 0) {
    operationResult = POSIX_ERROR_CODES.DIRECTORY_NOT_EMPTY; // Directory is not empty
  } else {
    delete targetDirInfo.parentOfNode[targetDirInfo.finalName];
    operationResult = 0; // Success
  }

  completionCallback(operationResult);
}

//---------------------------------------------------------------------------

/**
 * Handler for the FUSE `init` hook. Performs file system initialization.
 * @param {function(): void} readyCallback A callback to signal completion of initialization.
 */
function initializeFileSystem(readyCallback) {
  // Placeholder for any complex setup routines, e.g., loading metadata.
  // For this simple JSON FS, the JSON object is already loaded.
  console.info(`JSON-backed file system mounted at: ${configSettings.mountPoint}`);
  console.info(`To unmount: fusermount -u ${configSettings.mountPoint}`);
  readyCallback();
}

//---------------------------------------------------------------------------

/**
 * Handler for the FUSE `setxattr` hook (set extended attribute).
 * This implementation is a no-op as JSON FS does not support extended attributes.
 * @param {string} resourcePath The path to the file.
 * @param {string} attributeName The name of the attribute.
 * @param {Buffer|string} attributeValue The value of the attribute.
 * @param {number} dataSize The size of the attribute data.
 * @param {number} platformSpecificFlags OS-specific flags.
 * @param {number} commandCode The command code.
 * @param {any} unusedParam An unused parameter.
 * @param {function(number): void} completionCallback The callback function.
 */
function setExtendedAttribute(resourcePath, attributeName, attributeValue, dataSize, platformSpecificFlags, commandCode, unusedParam, completionCallback) {
  // Extended attributes are not supported in this JSON-based file system.
  // Always return success as per original, but it's effectively a no-op.
  completionCallback(0);
}

//---------------------------------------------------------------------------

/**
 * Handler for the FUSE `statfs` hook, providing file system statistics.
 * @param {function(number, object): void} statsCallback A callback with error code and statvfs structure.
 */
function getFileSystemStats(statsCallback) {
  const defaultStatBlock = {
    bsize: 1024 * 1024, // Block size (1MB)
    frsize: 1024 * 1024, // Fragment size (1MB)
    blocks: 1000,      // Total data blocks (1000 MB total)
    bfree: 900,        // Free blocks (900 MB free)
    bavail: 900,       // Available blocks to non-root user
    files: 100000,     // Total file nodes
    ffree: 90000,      // Free file nodes
    favail: 90000,     // Available file nodes to non-root user
    fsid: 0x12345678,  // File system ID
    flag: 0,           // Mount flags
    namemax: 255       // Maximum filename length
  };
  statsCallback(0, defaultStatBlock);
}

//---------------------------------------------------------------------------

/**
 * Handler for the FUSE `destroy` hook. Performs file system cleanup and persistence.
 * @param {function(): void} finalizationCallback A callback to signal completion of destruction.
 */
function shutdownFileSystem(finalizationCallback) {
  if (configSettings.outputJsonFile) {
    try {
      diskOps.writeFileSync(configSettings.outputJsonFile, JSON.stringify(fileSystemRoot, null, 2), 'utf8');
      console.info(`Modified file system state saved to: ${configSettings.outputJsonFile}`);
    } catch (error) {
      console.error(`Error during file system persistence: ${error.message}`);
    }
  }
  console.info("JSON-backed file system unmounted successfully.");
  finalizationCallback();
}

//---------------------------------------------------------------------------

// Collection of FUSE operation handlers
const fuseOperations = {
  getattr: getEntryAttributes,
  readdir: listDirectoryContents,
  open: openFileHandle,
  read: readBlockData,
  write: writeBlockData,
  release: releaseFileHandle,
  create: createFileEntry,
  unlink: deleteFileEntry,
  rename: moveEntry,
  mkdir: makeDirectoryEntry,
  rmdir: removeDirectoryEntry,
  init: initializeFileSystem,
  destroy: shutdownFileSystem,
  setxattr: setExtendedAttribute,
  statfs: getFileSystemStats
};

//---------------------------------------------------------------------------

/**
 * Displays command-line usage information for the JSON FS utility.
 */
function displayHelpInfo() {
  const usageText = `
  Usage: node json_fs_main.js [runtime_options] source_json_path mount_point_path

  Ensure the specified mount point is an empty directory and you have
  appropriate permissions (read, write, execute) for it.

  Runtime Options:
    -o <output_file_path> : Save any modifications to a new JSON file.
                            The original input JSON file is never altered.
    -d                    : Enable FUSE debug output for verbose logging.
    -a                    : Enable 'allow_other' option for mounting, allowing
                            access by other users (may require 'user_allow_other'
                            in system's FUSE configuration).

  Example Usage:
  node json_fs_main.js -d -o /tmp/updated_data.json ./data/initial_state.json /mnt/jsonfs
  `;
  console.log(usageText);
}

//---------------------------------------------------------------------------

/**
 * Parses command-line arguments and populates the global configSettings object.
 * @returns {boolean} True if arguments were successfully parsed, false otherwise.
 */
function processCommandLineArguments() {
  const cliArgs = process.argv.slice(2); // Exclude 'node' and script name
  const argumentCount = cliArgs.length;

  if (argumentCount < 2) { // Minimum 2 arguments: inputJsonFile, mountPoint
    return false;
  }

  // Last two arguments are always input JSON and mount point
  configSettings.mountPoint = cliArgs[argumentCount - 1];
  configSettings.inputJsonFile = cliArgs[argumentCount - 2];

  let currentArgIndex = 0;
  // Iterate through arguments, excluding the last two which are positional
  while (currentArgIndex < argumentCount - 2) {
    const currentArg = cliArgs[currentArgIndex];

    if (currentArg === '-d') {
      configSettings.enableDebug = true;
      currentArgIndex++;
    } else if (currentArg === '-o') {
      if (currentArgIndex + 1 < argumentCount - 2) { // Ensure there's a value for -o
        configSettings.outputJsonFile = cliArgs[currentArgIndex + 1];
        currentArgIndex += 2;
      } else {
        console.error("Error: Missing file path for -o option.");
        return false;
      }
    } else if (currentArg === '-a') {
      configSettings.allowOtherUsers = true;
      currentArgIndex++;
    } else {
      console.error(`Error: Unrecognized option: ${currentArg}`);
      return false;
    }
  }
  return true;
}

//---------------------------------------------------------------------------
// Main execution block
//---------------------------------------------------------------------------

if (!processCommandLineArguments()) {
  displayHelpInfo();
  process.exit(1);
}

try {
  // Load the initial JSON data from the specified input file
  fileSystemRoot = JSON.parse(diskOps.readFileSync(configSettings.inputJsonFile, 'utf8'));
} catch (error) {
  console.error(`Failed to load or parse input JSON file: ${configSettings.inputJsonFile}`);
  console.error(`Error details: ${error.message}`);
  process.exit(1);
}

// Prepare FUSE mount options
const mountOptions = {
  debug: configSettings.enableDebug || false,
  allow_other: configSettings.allowOtherUsers || false
};

// Start the FUSE file system
kernelApi.start(configSettings.mountPoint, fuseOperations, mountOptions, (mountError) => {
  if (mountError) {
    console.error(`Failed to mount file system: ${mountError.message}`);
    process.exit(1);
  }
  // The 'init' handler will log success after successful mount.
});