const nodeFS = require('fs');
const nodeFSPromises = require('fs').promises;
const nodePath = require('path');
const { Writable } = require('stream');

module.exports = replicateAssets;
replicateAssets.replicateAssets = replicateAssets;

class OperationScheduler {
    constructor(concurrencyLimit) {
        this.concurrencyLimit = concurrencyLimit;
        this.activeOperations = new Set();
        this.pendingOperations = [];
        this.completionSignal = null;
        this.resolveCompletion = null;
        this.rejectCompletion = null;
        this.allScheduled = false;
        this.isStopped = false;
    }

    _checkDrain() {
        if (this.allScheduled && this.activeOperations.size === 0 && this.pendingOperations.length === 0) {
            if (this.resolveCompletion) {
                this.resolveCompletion();
            }
        }
    }

    _launchNext() {
        if (this.isStopped) {
            return;
        }
        while (this.activeOperations.size < this.concurrencyLimit && this.pendingOperations.length > 0) {
            const operationFunction = this.pendingOperations.shift();
            const operationPromise = operationFunction().finally(() => {
                this.activeOperations.delete(operationPromise);
                this._launchNext();
                this._checkDrain();
            });
            this.activeOperations.add(operationPromise);
        }
    }

    add(asyncFunction) {
        if (this.isStopped) {
            return;
        }
        this.pendingOperations.push(asyncFunction);
        this._launchNext();
    }

    signalAllScheduled() {
        this.allScheduled = true;
        this._checkDrain();
    }

    async awaitCompletion() {
        if (!this.completionSignal) {
            this.completionSignal = new Promise((resolve, reject) => {
                this.resolveCompletion = resolve;
                this.rejectCompletion = reject;
            });
        }
        this._checkDrain();
        return this.completionSignal;
    }

    stopAndReject(error) {
        this.isStopped = true;
        this.pendingOperations = [];
        this.activeOperations.forEach(op => {
            // No direct way to cancel promises, they will eventually resolve/reject
            // but new tasks won't be picked up.
        });
        this.activeOperations.clear(); // Clear for immediate drain check
        if (this.rejectCompletion) {
            this.rejectCompletion(error);
        }
    }
}

async function replicateAssets(originPath, destinationPath, operationSettings, completionNotifier) {
    let finalNotifier = completionNotifier;
    let settings = operationSettings;

    if (!finalNotifier) {
        finalNotifier = settings;
        settings = {};
    }

    const currentBase = process.cwd();
    const sourceBaseLocation = nodePath.resolve(currentBase, originPath);
    const targetBaseLocation = nodePath.resolve(currentBase, destinationPath);

    const inclusionPredicate = settings.filter;
    const pathModifier = settings.rename;
    const dataTransformer = settings.transform;
    const overwriteExisting = settings.clobber !== false;
    const updateNewer = settings.modified;
    const resolveLinks = settings.dereference;
    const stopOnFailure = settings.stopOnError;

    let concurrentOperationsLimit = settings.limit || replicateAssets.limit || 16;
    concurrentOperationsLimit = Math.max(1, Math.min(512, concurrentOperationsLimit));

    const taskScheduler = new OperationScheduler(concurrentOperationsLimit);
    let accumulatedFaults = null;

    const handleOperationError = (issue) => {
        if (taskScheduler.isStopped) {
            return;
        }

        if (stopOnFailure) {
            taskScheduler.stopAndReject(issue);
            return;
        }

        if (!accumulatedFaults && settings.errs) {
            accumulatedFaults = nodeFS.createWriteStream(settings.errs);
        } else if (!accumulatedFaults) {
            accumulatedFaults = [];
        }

        if (accumulatedFaults instanceof Writable) {
            accumulatedFaults.write((issue instanceof Error ? issue.stack : String(issue)) + '\n\n');
        } else {
            accumulatedFaults.push(issue);
        }
    };

    const canBeWritten = async (entryPath) => {
        try {
            await nodeFSPromises.lstat(entryPath);
            return false;
        } catch (error) {
            if (error.code === 'ENOENT') {
                return true;
            }
            handleOperationError(error);
            return false;
        }
    };

    const removeFileSystemEntry = async (entryPath) => {
        try {
            await nodeFSPromises.unlink(entryPath);
        } catch (error) {
            handleOperationError(error);
        }
    };

    const establishSymbolicLink = async (linkSource, linkDestination) => {
        try {
            await nodeFSPromises.symlink(linkSource, linkDestination);
        } catch (error) {
            handleOperationError(error);
        }
    };

    const verifyLinkTarget = async (resolvedSourcePath, targetLinkPath) => {
        const destinationLinkTarget = targetLinkPath.replace(sourceBaseLocation, targetBaseLocation);

        const isWritable = await canBeWritten(destinationLinkTarget);
        if (isWritable) {
            await establishSymbolicLink(resolvedSourcePath, destinationLinkTarget);
            return;
        }

        try {
            const existingTarget = await nodeFSPromises.readlink(destinationLinkTarget);
            let currentResolvedTarget = resolveLinks ? nodePath.resolve(currentBase, existingTarget) : existingTarget;

            if (currentResolvedTarget === resolvedSourcePath) {
                return;
            }

            await removeFileSystemEntry(destinationLinkTarget);
            await establishSymbolicLink(resolvedSourcePath, destinationLinkTarget);
        } catch (error) {
            handleOperationError(error);
        }
    };

    const duplicateFileContent = async (fileData, targetLocation) => {
        const sourceStream = nodeFS.createReadStream(fileData.sourcePath);
        const targetStream = nodeFS.createWriteStream(targetLocation, { mode: fileData.entryMode });

        const streamOperation = new Promise((resolve, reject) => {
            sourceStream.on('error', reject);
            targetStream.on('error', reject);
            targetStream.on('finish', resolve);

            if (dataTransformer) {
                dataTransformer(sourceStream, targetStream, fileData);
            } else {
                targetStream.on('open', () => {
                    sourceStream.pipe(targetStream);
                });
            }
        });

        try {
            await streamOperation;
            if (updateNewer) {
                await nodeFSPromises.utimes(targetLocation, fileData.accessTime, fileData.modificationTime);
            }
        } catch (error) {
            handleOperationError(error);
        }
    };

    const processFileEntity = async (fileData) => {
        let destinationFile = fileData.sourcePath.replace(sourceBaseLocation, targetBaseLocation);
        if (pathModifier) {
            destinationFile = pathModifier(destinationFile);
        }

        const isDestinationWritable = await canBeWritten(destinationFile);

        if (isDestinationWritable) {
            await duplicateFileContent(fileData, destinationFile);
            return;
        }

        if (overwriteExisting) {
            await removeFileSystemEntry(destinationFile);
            await duplicateFileContent(fileData, destinationFile);
            return;
        }

        if (updateNewer) {
            try {
                const existingFileStats = await (resolveLinks ? nodeFSPromises.stat : nodeFSPromises.lstat)(destinationFile);
                if (fileData.modificationTime.getTime() > existingFileStats.mtime.getTime()) {
                    await duplicateFileContent(fileData, destinationFile);
                }
            } catch (error) {
                handleOperationError(error);
            }
            return;
        }
    };

    const createTargetDirectory = async (directoryData, targetDirectoryPath) => {
        try {
            await nodeFSPromises.mkdir(targetDirectoryPath, { mode: directoryData.entryMode });
        } catch (error) {
            handleOperationError(error);
        }
    };

    const replicateDirectoryContents = async (sourceDirectoryPath) => {
        try {
            const directoryItems = await nodeFSPromises.readdir(sourceDirectoryPath);
            directoryItems.forEach(itemName => {
                const fullItemPath = nodePath.join(sourceDirectoryPath, itemName);
                taskScheduler.add(() => beginReplication(fullItemPath));
            });
        } catch (error) {
            handleOperationError(error);
        }
    };

    const processDirectoryEntity = async (directoryData) => {
        const destinationDirectory = directoryData.sourcePath.replace(sourceBaseLocation, targetBaseLocation);
        const isDestinationWritable = await canBeWritten(destinationDirectory);

        if (isDestinationWritable) {
            await createTargetDirectory(directoryData, destinationDirectory);
        }
        await replicateDirectoryContents(directoryData.sourcePath);
    };

    const processSymbolicLink = async (linkSourcePath) => {
        try {
            const resolvedPath = await nodeFSPromises.readlink(linkSourcePath);
            const absoluteResolvedPath = resolveLinks ? nodePath.resolve(currentBase, resolvedPath) : resolvedPath;
            await verifyLinkTarget(absoluteResolvedPath, linkSourcePath);
        } catch (error) {
            handleOperationError(error);
        }
    };

    const obtainMetadata = async (entryPath) => {
        if (taskScheduler.isStopped) {
            return;
        }
        try {
            const statFunction = resolveLinks ? nodeFSPromises.stat : nodeFSPromises.lstat;
            const stats = await statFunction(entryPath);

            const itemData = {
                sourcePath: entryPath,
                entryMode: stats.mode,
                modificationTime: stats.mtime,
                accessTime: stats.atime,
            };

            if (stats.isDirectory()) {
                await processDirectoryEntity(itemData);
            } else if (stats.isFile()) {
                await processFileEntity(itemData);
            } else if (stats.isSymbolicLink()) {
                await processSymbolicLink(entryPath);
            }
        } catch (error) {
            handleOperationError(error);
        }
    };

    const beginReplication = async (currentEntryPath) => {
        if (taskScheduler.isStopped) {
            return;
        }
        if (inclusionPredicate) {
            let shouldInclude = true;
            if (inclusionPredicate instanceof RegExp) {
                shouldInclude = inclusionPredicate.test(currentEntryPath);
            } else if (typeof inclusionPredicate === 'function') {
                shouldInclude = inclusionPredicate(currentEntryPath);
            }
            if (!shouldInclude) {
                return;
            }
        }
        await obtainMetadata(currentEntryPath);
    };

    taskScheduler.add(() => beginReplication(sourceBaseLocation));
    taskScheduler.signalAllScheduled();

    try {
        await taskScheduler.awaitCompletion();
        finalNotifier(accumulatedFaults && accumulatedFaults.length > 0 ? accumulatedFaults : null);
    } catch (criticalError) {
        finalNotifier(criticalError);
    }
}