/*
 *
 * dataFuse.js
 *
 * Copyright (c) 2012 - 2014 by VMware, Inc. All Rights Reserved.
 * http://www.vmware.com
 * Consult the LICENSE.txt document for distribution and usage details.
 *
 */
var fuseLib = require('fuse4js');
var fileSys = require('fs');
var dataStore = null; // The JSON data structure we're exposing
var configSettings = {}; // See processCommandLineArguments() function


//-----------------------------------------------------------------------------

/*
 * Given a base object 'baseObj', this function navigates its properties
 * to find the sub-object corresponding to the provided nodePath.
 */
function locateNode(baseObj, nodePath) {
  var currentElement = null;
  var parentRef = null;
  var segmentName = '';
  if (nodePath === '/') {
    return { element: baseObj, container: null, segment: '' };
  }
  var pathSegments = nodePath.split('/');
  for (let idx = 0; idx < pathSegments.length; ++idx) {
    parentRef = currentElement;
    if (idx == 0) {
      currentElement = baseObj;
    } else if (currentElement !== undefined) {
      segmentName = pathSegments[idx];
      currentElement = currentElement[segmentName];
      if (currentElement === undefined) {
        break;
      }
    }
  }
  return { element: currentElement, container: parentRef, segment: segmentName };
}

//-----------------------------------------------------------------------------

/*
 * Implements the getattr() system call equivalent for FUSE.
 * entryPath: the full path to the desired file or directory.
 * callbackFn: a callback of the form callbackFn(errorCode, metadataRecord),
 *             where errorCode is the POSIX return code and metadataRecord
 *             is a stat-like structure when errorCode is 0.
 */
function getElementAttributes(entryPath, callbackFn) {
  var metadataRecord = {};
  var errorCode = 0; // Assume operation succeeds initially
  var pathDetails = locateNode(dataStore, entryPath);
  var targetElement = pathDetails.element;

  switch (typeof targetElement) {
    case 'undefined':
      errorCode = -2; // -ENOENT: No such file or directory
      break;

    case 'object': // This represents a directory in our JSON structure
      metadataRecord.size = 4096; // Standard directory size
      metadataRecord.mode = 0o40777; // Directory with rwxrwxrwx permissions
      break;

    case 'string': // This represents a file containing a string
      metadataRecord.size = targetElement.length;
      metadataRecord.mode = 0o100666; // File with rw-rw-rw- permissions
      break;

    default:
      // No specific action for other types, errorCode remains 0
      break;
  }
  callbackFn(errorCode, metadataRecord);
}

//-----------------------------------------------------------------------------

/*
 * Implements the readdir() system call equivalent.
 * directoryPath: the path to the directory to read.
 * completionCallback: a callback of the form completionCallback(statusIndicator, entryNames),
 *                     where statusIndicator is the POSIX return code and entryNames
 *                     is an array of names (when statusIndicator is 0).
 */
function listDirectoryContents(directoryPath, completionCallback) {
  var entryNames = [];
  var statusIndicator = 0; // Assume success
  var dirInfo = locateNode(dataStore, directoryPath);

  switch (typeof dirInfo.element) {
    case 'undefined':
      statusIndicator = -2; // -ENOENT: No such file or directory
      break;

    case 'string': // A string node is a file, not a directory
      statusIndicator = -22; // -EINVAL: Invalid argument
      break;

    case 'object': // This is a valid directory
      var indexCounter = 0;
      for (const propKey in dirInfo.element) {
        entryNames[indexCounter++] = propKey;
      }
      break;

    default:
      // No specific action
      break;
  }
  completionCallback(statusIndicator, entryNames);
}

//-----------------------------------------------------------------------------

/*
 * Implements the open() system call equivalent.
 * filePath: the path to the file to open.
 * accessFlags: requested access flags as per open(2) documentation.
 * operationComplete: a callback of the form operationComplete(operationStatus, [fileHandle]),
 *                    where operationStatus is the POSIX return code and fileHandle
 *                    is an optional numerical handle for subsequent operations.
 */
function openFileHandle(filePath, accessFlags, operationComplete) {
  var operationStatus = 0; // Assume success
  var fileDetails = locateNode(dataStore, filePath);

  if (typeof fileDetails.element === 'undefined') {
    operationStatus = -2; // -ENOENT: No such file or directory
  }
  operationComplete(operationStatus); // We don't use file handles, so FUSE will initialize it to 0
}

//-----------------------------------------------------------------------------

/*
 * Implements the read() system call equivalent.
 * resourcePath: the path to the file.
 * startOffset: the byte offset to begin reading from.
 * bytesToRead: the number of bytes to read.
 * outputBuffer: the Buffer object to write the data into.
 * fileHandle: the optional file handle returned by open(), or 0 if none.
 * readComplete: a callback of the form readComplete(readResult), where readResult
 *               is the POSIX return code or the number of bytes actually read (if positive).
 */
function readDataBlock(resourcePath, startOffset, bytesToRead, outputBuffer, fileHandle, readComplete) {
  var readResult = 0; // Assume success
  var contentInfo = locateNode(dataStore, resourcePath);
  var targetFile = contentInfo.element;
  var maximumBytes;
  var readSegment;

  switch (typeof targetFile) {
    case 'undefined':
      readResult = -2; // -ENOENT: No such file or directory
      break;

    case 'object': // Directory, cannot read as a file
      readResult = -1; // -EPERM: Operation not permitted
      break;

    case 'string': // A string, treat as ASCII characters
      if (startOffset < targetFile.length) {
        maximumBytes = targetFile.length - startOffset;
        if (bytesToRead > maximumBytes) {
          bytesToRead = maximumBytes;
        }
        readSegment = targetFile.substring(startOffset, startOffset + bytesToRead);
        outputBuffer.write(readSegment, 0, bytesToRead, 'ascii');
        readResult = bytesToRead;
      } else {
        readResult = 0; // Read past end of file, return 0 bytes read
      }
      break;

    default:
      // No specific action
      break;
  }
  readComplete(readResult);
}

//-----------------------------------------------------------------------------

/*
 * Implements the write() system call equivalent.
 * contentPath: the path to the file.
 * writeOffset: the byte offset to begin writing at.
 * bytesToWrite: the number of bytes to write.
 * inputBuffer: the Buffer object containing data to write.
 * resourceHandle: the optional file handle returned by open(), or 0 if none.
 * writeComplete: a callback of the form writeComplete(writeStatus), where writeStatus
 *                is the POSIX return code or the number of bytes actually written (if positive).
 */
function writeDataBlock(contentPath, writeOffset, bytesToWrite, inputBuffer, resourceHandle, writeComplete) {
  var writeStatus = 0; // Assume success
  var writeInfo = locateNode(dataStore, contentPath);
  var targetContent = writeInfo.element;
  var contentName = writeInfo.segment;
  var contentParent = writeInfo.container;
  var prefixData;
  var paddingString = '';
  var inputData;
  var suffixData = '';
  var paddingLength;

  switch (typeof targetContent) {
    case 'undefined':
      writeStatus = -2; // -ENOENT: No such file or directory
      break;

    case 'object': // Directory, cannot write to as a file
      writeStatus = -1; // -EPERM: Operation not permitted
      break;

    case 'string': // A string, treat as ASCII characters
      inputData = inputBuffer.toString('ascii', 0, bytesToWrite); // Read the new data from buffer
      if (writeOffset < targetContent.length) {
        prefixData = targetContent.substring(0, writeOffset);
        if (writeOffset + inputData.length < targetContent.length) {
          suffixData = targetContent.substring(writeOffset + inputData.length, targetContent.length);
        }
      } else {
        prefixData = targetContent;
        paddingLength = writeOffset - targetContent.length;
        while (paddingLength--) {
          paddingString += ' ';
        }
      }
      delete contentParent[contentName]; // Remove old entry
      contentParent[contentName] = prefixData + paddingString + inputData + suffixData; // Write new content
      writeStatus = inputData.length;
      break;

    default:
      // No specific action
      break;
  }
  writeComplete(writeStatus);
}

//-----------------------------------------------------------------------------

/*
 * Implements the release() system call equivalent.
 * itemPath: the path to the file being released.
 * handleIdentifier: the optional file handle.
 * releaseComplete: a callback of the form releaseComplete(err), where err is the POSIX return code.
 */
function closeFileHandle(itemPath, handleIdentifier, releaseComplete) {
  releaseComplete(0); // Always succeed for simplicity
}

//-----------------------------------------------------------------------------

/*
 * Implements the create() system call equivalent.
 * newFilePath: the path of the new file to create.
 * filePermissions: the desired permissions for the new file.
 * creationComplete: a callback of the form creationComplete(creationStatus, [fileHandle]),
 *                   where creationStatus is the POSIX return code and fileHandle
 *                   is an optional numerical handle (set to 0 if unspecified).
 */
function createFileEntry(newFilePath, filePermissions, creationComplete) {
  var creationStatus = 0; // Assume success
  var creationInfo = locateNode(dataStore, newFilePath);

  switch (typeof creationInfo.element) {
    case 'undefined':
      if (creationInfo.container !== null) {
        creationInfo.container[creationInfo.segment] = ''; // Create an empty string file
      } else {
        creationStatus = -2; // -ENOENT: Cannot create at root or invalid path
      }
      break;

    case 'string': // File already exists
    case 'object': // Directory already exists
      creationStatus = -17; // -EEXIST: File exists
      break;

    default:
      // No specific action
      break;
  }
  creationComplete(creationStatus);
}

//-----------------------------------------------------------------------------

/*
 * Implements the unlink() system call equivalent.
 * itemToRemovePath: the path to the file to remove.
 * removalComplete: a callback of the form removalComplete(removalStatus), where
 *                  removalStatus is the POSIX return code.
 */
function removeFileEntry(itemToRemovePath, removalComplete) {
  var removalStatus = 0; // Assume success
  var removalInfo = locateNode(dataStore, itemToRemovePath);

  switch (typeof removalInfo.element) {
    case 'undefined':
      removalStatus = -2; // -ENOENT: No such file or directory
      break;

    case 'object': // Existing directory, cannot unlink (use rmdir)
      removalStatus = -1; // -EPERM: Operation not permitted
      break;

    case 'string': // Existing file, proceed with deletion
      delete removalInfo.container[removalInfo.segment];
      break;

    default:
      // No specific action
      break;
  }
  removalComplete(removalStatus);
}

//-----------------------------------------------------------------------------

/*
 * Implements the rename() system call equivalent.
 * sourcePath: the path of the file or directory to rename.
 * destinationPath: the new path.
 * renameComplete: a callback of the form renameComplete(renameStatus), where
 *                 renameStatus is the POSIX return code.
 */
function moveFileEntry(sourcePath, destinationPath, renameComplete) {
  var renameStatus = -2; // -ENOENT: Assume failure initially
  var sourceDetails = locateNode(dataStore, sourcePath);
  var destinationDetails;

  if (typeof sourceDetails.element !== 'undefined') { // Source exists
    destinationDetails = locateNode(dataStore, destinationPath);
    if (typeof destinationDetails.element === 'undefined' && destinationDetails.container !== null) {
      destinationDetails.container[destinationDetails.segment] = sourceDetails.element;
      delete sourceDetails.container[sourceDetails.segment];
      renameStatus = 0; // Success
    } else {
      renameStatus = -17; // -EEXIST: Destination already exists
    }
  }
  renameComplete(renameStatus);
}

//-----------------------------------------------------------------------------

/*
 * Implements the mkdir() system call equivalent.
 * newDirPath: the path of the new directory to create.
 * dirPermissions: the desired permissions for the new directory.
 * directoryCreationComplete: a callback of the form directoryCreationComplete(directoryCreationStatus),
 *                            where directoryCreationStatus is the POSIX return code.
 */
function createDirectory(newDirPath, dirPermissions, directoryCreationComplete) {
  var directoryCreationStatus = -2; // -ENOENT: Assume failure initially
  var targetDirInfo = locateNode(dataStore, newDirPath);
  if (typeof targetDirInfo.element === 'undefined' && targetDirInfo.container != null) {
    targetDirInfo.container[targetDirInfo.segment] = {}; // Create an empty object for the directory
    directoryCreationStatus = 0; // Success
  }
  directoryCreationComplete(directoryCreationStatus);
}

//-----------------------------------------------------------------------------

/*
 * Implements the rmdir() system call equivalent.
 * dirToRemovePath: the path of the directory to remove.
 * directoryRemovalComplete: a callback of the form directoryRemovalComplete(directoryRemovalStatus),
 *                           where directoryRemovalStatus is the POSIX return code.
 */
function removeDirectory(dirToRemovePath, directoryRemovalComplete) {
  var directoryRemovalStatus = -2; // -ENOENT: Assume failure initially
  var targetRemovalInfo = locateNode(dataStore, dirToRemovePath);
  if (typeof targetRemovalInfo.element === 'object' && targetRemovalInfo.container != null) {
    delete targetRemovalInfo.container[targetRemovalInfo.segment];
    directoryRemovalStatus = 0; // Success
  }
  directoryRemovalComplete(directoryRemovalStatus);
}

//-----------------------------------------------------------------------------

/*
 * FUSE hook for file system initialization.
 * initializationComplete: a callback to invoke when initialization is finished.
 */
function initializeFileSystem(initializationComplete) {
  console.log("Data file system active at " + configSettings.mountLocation);
  console.log("To stop it, use this command in another terminal: fusermount -u " + configSettings.mountLocation);
  initializationComplete();
}

//-----------------------------------------------------------------------------

/*
 * FUSE hook for setting extended attributes.
 * Note: Arguments vary by OS (Darwin vs. others).
 * attributePath: path to the file/directory.
 * attributeName: name of the extended attribute.
 * attributeValue: value to set.
 * attributeSize: size of the value.
 * paramA, paramB, paramC: OS-specific parameters.
 * attributeSetCallback: callback to signal completion.
 */
function setExtendedAttribute(attributePath, attributeName, attributeValue, attributeSize, paramA, paramB, paramC, attributeSetCallback) {
  console.log("Set extended attribute invoked:", attributePath, attributeName, attributeValue, attributeSize, paramA, paramB, paramC);
  attributeSetCallback(0); // Always succeed for demonstration
}

//-----------------------------------------------------------------------------

/*
 * FUSE hook for retrieving file system statistics.
 * statsCallback: a callback of the form statsCallback(errorCode, statvfs), where
 *                errorCode is the POSIX return code and statvfs is a statvfs
 *                structure when errorCode is 0.
 */
function getFileSystemStats(statsCallback) {
  statsCallback(0, {
    blockSize: 1000000,
    fragmentSize: 1000000,
    totalBlocks: 1000000,
    freeBlocks: 1000000,
    availableBlocks: 1000000,
    totalFiles: 1000000,
    freeFiles: 1000000,
    availableFiles: 1000000,
    fileSystemId: 1000000,
    flags: 1000000,
    maxNameLength: 1000000
  });
}

//-----------------------------------------------------------------------------

/*
 * FUSE hook for file system destruction/cleanup.
 * shutdownComplete: a callback to invoke when cleanup is finished.
 */
function shutdownFileSystem(shutdownComplete) {
  if (configSettings.outputJsonFile) {
    try {
      fileSys.writeFileSync(configSettings.outputJsonFile, JSON.stringify(dataStore, null, '  '), 'utf8');
    } catch (exception) {
      console.log("Error encountered while writing output file: " + exception);
    }
  }
  console.log("File system terminated.");
  shutdownComplete();
}

//-----------------------------------------------------------------------------

var fuseOperations = {
  getAttrs: getElementAttributes,
  readDirs: listDirectoryContents,
  openRes: openFileHandle,
  readData: readDataBlock,
  writeData: writeDataBlock,
  releaseRes: closeFileHandle,
  createRes: createFileEntry,
  removeLink: removeFileEntry,
  renameRes: moveFileEntry,
  makeDir: createDirectory,
  removeDir: removeDirectory,
  initFS: initializeFileSystem,
  destroyFS: shutdownFileSystem,
  setXAttr: setExtendedAttribute,
  statFS: getFileSystemStats
};

//-----------------------------------------------------------------------------

function displayHelp() {
  console.log();
  console.log("Usage: node dataFuse.js [options] inputDataSourceFile mountLocation");
  console.log("(Ensure the mount directory is empty and you have write/execute permissions to it)\n");
  console.log("Options:");
  console.log("-o outputDataFile  : save modified data to a new JSON file. The input file is never changed.");
  console.log("-d                 : enable FUSE debug statements.");
  console.log("-a                 : add allow_other option to mount (may require user_allow_other in FUSE config).");
  console.log();
  console.log("Example:");
  console.log("node example/dataFuse.js -d -o /tmp/output_data.json example/exampleData.json /mnt/fuse_data");
  console.log();
}

//-----------------------------------------------------------------------------

function processCommandLineArguments() {
  var argIndex;
  var argsRemaining;
  var commandLineArgs = process.argv;
  if (commandLineArgs.length < 4) {
    return false;
  }
  configSettings.mountLocation = commandLineArgs[commandLineArgs.length - 1];
  configSettings.inputJsonFile = commandLineArgs[commandLineArgs.length - 2];
  argsRemaining = commandLineArgs.length - 4;
  argIndex = 2;
  while (argsRemaining--) {
    if (commandLineArgs[argIndex] === '-d') {
      configSettings.enableDebug = true;
      ++argIndex;
    } else if (commandLineArgs[argIndex] === '-o') {
      if (argsRemaining) {
        configSettings.outputJsonFile = commandLineArgs[argIndex + 1];
        argIndex += 2;
        --argsRemaining;
      } else {
        return false;
      }
    } else if (commandLineArgs[argIndex] === '-a') {
      configSettings.allowOtherUsers = true;
      ++argIndex;
    } else {
      return false;
    }
  }

  try {
    dataStore = JSON.parse(fileSys.readFileSync(configSettings.inputJsonFile, 'utf8'));
  } catch (err) {
    console.error("Failed to read or parse input JSON file: " + err.message);
    return false;
  }

  fuseLib.start(configSettings.mountLocation, fuseOperations, configSettings.enableDebug, configSettings.allowOtherUsers);

  return true;
}

//-----------------------------------------------------------------------------

if (!processCommandLineArguments()) {
  displayHelp();
  process.exit(1);
}