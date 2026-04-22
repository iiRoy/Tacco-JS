const fuseCore = require('fuse4js');
const nodeIO = require('fs');

class JsonFilesystemGateway {
    // POSIX error code equivalents (renamed constants)
    static ERR_NOT_FOUND = -2; // ENOENT
    static ERR_PERMISSION_DENIED = -1; // EPERM
    static ERR_INVALID_ARGUMENT = -22; // EINVAL
    static ERR_ALREADY_EXISTS = -17; // EEXIST

    constructor(initialData, systemConfiguration) {
        this.dataRoot = initialData; // The JSON object acting as the filesystem root
        this.systemSettings = systemConfiguration; // Configuration derived from command line

        // Mapping internal method names to fuse4js's expected handler names
        this.handlerDispatch = {
            getattr: this.getEntryAttributes.bind(this),
            readdir: this.readDirectoryEntries.bind(this),
            open: this.initiateAccess.bind(this),
            read: this.fetchData.bind(this),
            write: this.storeData.bind(this),
            release: this.terminateAccess.bind(this),
            create: this.createEntry.bind(this),
            unlink: this.removeEntry.bind(this),
            rename: this.renameEntry.bind(this),
            mkdir: this.makeDirectory.bind(this),
            rmdir: this.removeDirectory.bind(this),
            init: this.initializeSystem.bind(this),
            destroy: this.shutdownSystem.bind(this),
            setxattr: this.setExtendedAttribute.bind(this),
            statfs: this.getFilesystemStatistics.bind(this)
        };
    }

    // Navigates the JSON data structure to find a path segment
    _resolvePathDetails(entryPath) {
        if (entryPath === '/') {
            return {
                targetNode: this.dataRoot,
                containingNode: null,
                targetName: ''
            };
        }

        const pathSegments = entryPath.split('/').filter(Boolean); // Split and remove empty strings
        let currentEntry = this.dataRoot;
        let parentEntry = null;
        let segmentName = '';

        for (let idx = 0; idx < pathSegments.length; ++idx) {
            parentEntry = currentEntry; // Store current node as potential parent
            segmentName = pathSegments[idx];

            if (currentEntry && typeof currentEntry === 'object' && currentEntry.hasOwnProperty(segmentName)) {
                currentEntry = currentEntry[segmentName];
            } else {
                currentEntry = undefined; // Path segment not found, stop traversal
                break;
            }
        }
        return {
            targetNode: currentEntry,
            containingNode: parentEntry,
            targetName: segmentName
        };
    }

    // FUSE handler for getting file/directory attributes
    getEntryAttributes(entryPath, completionCallback) {
        const entryStats = {};
        let resultStatusCode = 0;
        const pathInfo = this._resolvePathDetails(entryPath);
        const resolvedEntry = pathInfo.targetNode;

        if (typeof resolvedEntry === 'undefined') {
            resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND;
        } else if (typeof resolvedEntry === 'object') { // Interpreted as a directory
            entryStats.size = 4096; // Standard directory size
            entryStats.mode = 0o40777; // Directory with 777 permissions
        } else if (typeof resolvedEntry === 'string') { // Interpreted as a file
            entryStats.size = resolvedEntry.length;
            entryStats.mode = 0o100666; // File with 666 permissions
        }
        completionCallback(resultStatusCode, entryStats);
    }

    // FUSE handler for reading directory contents
    readDirectoryEntries(entryPath, completionCallback) {
        let entryNames = [];
        let resultStatusCode = 0;
        const pathInfo = this._resolvePathDetails(entryPath);

        if (typeof pathInfo.targetNode === 'undefined') {
            resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND;
        } else if (typeof pathInfo.targetNode === 'string') { // Cannot read a file as a directory
            resultStatusCode = JsonFilesystemGateway.ERR_INVALID_ARGUMENT;
        } else if (typeof pathInfo.targetNode === 'object') { // Directory
            entryNames = Object.keys(pathInfo.targetNode);
        }
        completionCallback(resultStatusCode, entryNames);
    }

    // FUSE handler for opening a file
    initiateAccess(entryPath, accessFlags, completionCallback) {
        let resultStatusCode = 0;
        const pathInfo = this._resolvePathDetails(entryPath);

        if (typeof pathInfo.targetNode === 'undefined') {
            resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND;
        }
        completionCallback(resultStatusCode);
    }

    // FUSE handler for reading data from a file
    fetchData(entryPath, readOffset, readLength, targetBuffer, fileHandle, completionCallback) {
        let resultStatusCode = 0; // Assume success initially
        const pathInfo = this._resolvePathDetails(entryPath);
        const entryContent = pathInfo.targetNode;

        if (typeof entryContent === 'undefined') {
            resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND;
        } else if (typeof entryContent === 'object') { // Cannot read from a directory
            resultStatusCode = JsonFilesystemGateway.ERR_PERMISSION_DENIED;
        } else if (typeof entryContent === 'string') { // Treat string as file content
            if (readOffset < entryContent.length) {
                let bytesAvailable = entryContent.length - readOffset;
                if (readLength > bytesAvailable) {
                    readLength = bytesAvailable;
                }
                const extractedSegment = entryContent.substring(readOffset, readOffset + readLength);
                targetBuffer.write(extractedSegment, 0, readLength, 'ascii');
                resultStatusCode = readLength; // Return number of bytes actually read
            }
        }
        completionCallback(resultStatusCode);
    }

    // FUSE handler for writing data to a file
    storeData(entryPath, writeOffset, writeLength, sourceBuffer, fileHandle, completionCallback) {
        let resultStatusCode = 0; // Assume success
        const pathInfo = this._resolvePathDetails(entryPath);
        const destinationContent = pathInfo.targetNode;
        const entryKey = pathInfo.targetName;
        const containerObject = pathInfo.containingNode;
        let prefixPart, paddingChars = '', suffixPart = '';
        const incomingData = sourceBuffer.toString('ascii'); // Original converts entire buffer

        if (typeof destinationContent === 'undefined') {
            resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND;
        } else if (typeof destinationContent === 'object') { // Cannot write to a directory
            resultStatusCode = JsonFilesystemGateway.ERR_PERMISSION_DENIED;
        } else if (typeof destinationContent === 'string') { // Treat string as file content
            if (writeOffset < destinationContent.length) {
                prefixPart = destinationContent.substring(0, writeOffset);
                if (writeOffset + incomingData.length < destinationContent.length) {
                    suffixPart = destinationContent.substring(writeOffset + incomingData.length);
                }
            } else {
                prefixPart = destinationContent;
                let paddingCount = writeOffset - destinationContent.length;
                while (paddingCount--) paddingChars += ' ';
            }
            if (containerObject) {
                delete containerObject[entryKey];
                containerObject[entryKey] = prefixPart + paddingChars + incomingData + suffixPart;
                resultStatusCode = incomingData.length; // Return number of bytes actually written
            } else {
                resultStatusCode = JsonFilesystemGateway.ERR_PERMISSION_DENIED; // Should not happen for files
            }
        }
        completionCallback(resultStatusCode);
    }

    // FUSE handler for releasing a file handle
    terminateAccess(entryPath, fileHandle, completionCallback) {
        completionCallback(0); // Always successful
    }

    // FUSE handler for creating a new file
    createEntry(entryPath, permissionsMode, completionCallback) {
        let resultStatusCode = 0;
        const pathInfo = this._resolvePathDetails(entryPath);

        if (typeof pathInfo.targetNode === 'undefined') {
            if (pathInfo.containingNode !== null) {
                pathInfo.containingNode[pathInfo.targetName] = ''; // Create as an empty string file
            } else {
                resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND; // Parent not found or attempting to create at root
            }
        } else if (typeof pathInfo.targetNode === 'string' || typeof pathInfo.targetNode === 'object') {
            resultStatusCode = JsonFilesystemGateway.ERR_ALREADY_EXISTS; // File/directory already exists
        }
        completionCallback(resultStatusCode);
    }

    // FUSE handler for deleting a file
    removeEntry(entryPath, completionCallback) {
        let resultStatusCode = 0;
        const pathInfo = this._resolvePathDetails(entryPath);

        if (typeof pathInfo.targetNode === 'undefined') {
            resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND;
        } else if (typeof pathInfo.targetNode === 'object') { // Cannot delete a directory with unlink
            resultStatusCode = JsonFilesystemGateway.ERR_PERMISSION_DENIED;
        } else if (typeof pathInfo.targetNode === 'string') { // Existing file
            if (pathInfo.containingNode) {
                delete pathInfo.containingNode[pathInfo.targetName];
            } else {
                resultStatusCode = JsonFilesystemGateway.ERR_PERMISSION_DENIED; // Cannot delete root
            }
        }
        completionCallback(resultStatusCode);
    }

    // FUSE handler for renaming a file or directory
    renameEntry(sourcePath, destinationPath, completionCallback) {
        let resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND; // Assume failure
        const sourceDetails = this._resolvePathDetails(sourcePath);

        if (typeof sourceDetails.targetNode !== 'undefined') { // Source must exist
            const destinationDetails = this._resolvePathDetails(destinationPath);
            if (typeof destinationDetails.targetNode === 'undefined' && destinationDetails.containingNode !== null) {
                // Destination path must not exist, and parent must exist
                destinationDetails.containingNode[destinationDetails.targetName] = sourceDetails.targetNode;
                delete sourceDetails.containingNode[sourceDetails.targetName];
                resultStatusCode = 0;
            } else {
                resultStatusCode = JsonFilesystemGateway.ERR_ALREADY_EXISTS; // Destination already exists
            }
        }
        completionCallback(resultStatusCode);
    }

    // FUSE handler for creating a new directory
    makeDirectory(entryPath, permissionsMode, completionCallback) {
        let resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND; // Assume failure
        const newDirResolution = this._resolvePathDetails(entryPath);
        if (typeof newDirResolution.targetNode === 'undefined' && newDirResolution.containingNode != null) {
            newDirResolution.containingNode[newDirResolution.targetName] = {}; // Create as an empty object directory
            resultStatusCode = 0;
        }
        completionCallback(resultStatusCode);
    }

    // FUSE handler for removing a directory
    removeDirectory(entryPath, completionCallback) {
        let resultStatusCode = JsonFilesystemGateway.ERR_NOT_FOUND; // Assume failure
        const targetDirResolution = this._resolvePathDetails(entryPath);
        if (typeof targetDirResolution.targetNode === 'object' && targetDirResolution.containingNode != null) {
            // Original code does not check if directory is empty, so we replicate that.
            delete targetDirResolution.containingNode[targetDirResolution.targetName];
            resultStatusCode = 0;
        }
        completionCallback(resultStatusCode);
    }

    // FUSE init hook
    initializeSystem(completionCallback) {
        console.log("Filesystem operational at " + this.systemSettings.mountTarget);
        console.log("To halt, execute in another terminal: fusermount -u " + this.systemSettings.mountTarget);
        completionCallback();
    }

    // FUSE setxattr hook
    setExtendedAttribute(entryPath, attributeName, attributeValue, attributeSize, paramA, paramB, paramC) {
        console.log("Extended attribute set:", entryPath, attributeName, attributeValue, attributeSize, paramA, paramB, paramC);
        // fuse4js setxattr handler does not use a callback, success is implicit if no error is thrown
    }

    // FUSE statfs hook
    getFilesystemStatistics(completionCallback) {
        completionCallback(0, {
            blockSize: 1000000,
            fragmentSize: 1000000,
            totalBlocks: 1000000,
            freeBlocks: 1000000,
            availableBlocks: 1000000,
            totalFiles: 1000000,
            freeFiles: 1000000,
            availableFiles: 1000000,
            filesystemId: 1000000,
            flags: 1000000,
            maxNameLength: 1000000
        });
    }

    // FUSE destroy hook
    shutdownSystem(completionCallback) {
        if (this.systemSettings.outputJsonPath) {
            try {
                nodeIO.writeFileSync(this.systemSettings.outputJsonPath, JSON.stringify(this.dataRoot, null, '  '), 'utf8');
            } catch (e) {
                console.error("Error during data persistence: " + e.message);
            }
        }
        console.log("Filesystem terminated");
        completionCallback();
    }

    // Displays command line usage information
    static _displayHelp() {
        console.log();
        console.log("Usage: node jsonProcessor.js [options] sourceJsonFile mountPoint");
        console.log("(Ensure mount point is empty and writable)");
        console.log("Options:");
        console.log("-o targetJsonFile  : persist altered data to a new JSON file. Original source is unaffected.");
        console.log("-v                 : activate FUSE verbose logging.");
        console.log("-w                 : enable foreign user access to mount.");
        console.log();
        console.log("Example:");
        console.log("node utility/jsonProcessor.js -v -o /tmp/output.json utility/sample.data /tmp/mountpoint");
        console.log();
    }

    // Parses command line arguments into a structured object
    static _parseCommandLine(argumentsArray) {
        const parsedSettings = {
            mountTarget: null,
            inputJsonPath: null,
            outputJsonPath: null,
            enableDebug: false,
            allowForeignAccess: false
        };

        // Slice to get only the actual arguments, skipping 'node' and the script name
        const relevantArgs = argumentsArray.slice(2);

        if (relevantArgs.length < 2) {
            return null; // Insufficient arguments for required paths
        }

        // The last two arguments are always the input JSON file and the mount point
        parsedSettings.mountTarget = relevantArgs[relevantArgs.length - 1];
        parsedSettings.inputJsonPath = relevantArgs[relevantArgs.length - 2];

        // Process optional flags and their values
        for (let i = 0; i < relevantArgs.length - 2; ++i) {
            const currentArg = relevantArgs[i];
            switch (currentArg) {
                case '-v': // Maps to original '-d' for debug
                    parsedSettings.enableDebug = true;
                    break;
                case '-o': // Maps to original '-o' for output file
                    if (i + 1 < relevantArgs.length - 2) { // Ensure next argument exists and is not one of the last two
                        parsedSettings.outputJsonPath = relevantArgs[++i]; // Consume the next argument as the file path
                    } else {
                        return null; // Output file path is missing
                    }
                    break;
                case '-w': // Maps to original '-a' for allow_other
                    parsedSettings.allowForeignAccess = true;
                    break;
                default:
                    return null; // Unrecognized argument
            }
        }
        return parsedSettings;
    }

    // Initiates the FUSE filesystem
    startFilesystem() {
        const fuseOptions = {
            debug: this.systemSettings.enableDebug,
            allow_other: this.systemSettings.allowForeignAccess
        };

        fuseCore.start(this.systemSettings.mountTarget, this.handlerDispatch, fuseOptions);
    }
}

// Entry point for the application
const runtimeArguments = JsonFilesystemGateway._parseCommandLine(process.argv);

if (!runtimeArguments || !runtimeArguments.inputJsonPath || !runtimeArguments.mountTarget) {
    JsonFilesystemGateway._displayHelp();
    process.exit(1);
}

let initialJsonContent = null;
try {
    const rawData = nodeIO.readFileSync(runtimeArguments.inputJsonPath, 'utf8');
    initialJsonContent = JSON.parse(rawData);
} catch (error) {
    console.error("Failed to load or parse input JSON file: " + error.message);
    process.exit(1);
}

const fileServiceInstance = new JsonFilesystemGateway(initialJsonContent, runtimeArguments);
fileServiceInstance.startFilesystem();