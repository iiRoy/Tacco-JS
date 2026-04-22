"use strict";

const fileSystem = require("fs");
const asyncFileOps = require("fs").promises;
const streamPipeline = require("stream/promises").pipeline;

const activityLog = function(message, ...args) {
    console.log(`[DOC_HANDLER] ${message}`, ...args);
};

function DocumentHandleFactory(initialError, sourceFilePath, autoCleanUp) {
    let currentSourcePath = sourceFilePath;
    let isDeactivated = false;
    let initialIssue = initialError;

    const checkValidity = () => {
        if (isDeactivated) {
            throw new Error('Document handle became invalid after deactivation!');
        }
    };

    const performCleanup = async () => {
        if (currentSourcePath && !isDeactivated) {
            try {
                await asyncFileOps.unlink(currentSourcePath);
                activityLog('Successfully purged temporary document: "%s"', currentSourcePath);
                currentSourcePath = '';
                isDeactivated = true;
            } catch (err) {
                throw err;
            }
        }
    };

    const handleObject = {
        accessDocumentStream: function() {
            checkValidity();
            return fileSystem.createReadStream(currentSourcePath);
        },

        fetchDocumentBuffer: async function() {
            checkValidity();
            const inputStream = fileSystem.createReadStream(currentSourcePath);
            const dataChunks = [];

            await new Promise((resolve, reject) => {
                inputStream.on('data', chunk => dataChunks.push(chunk));
                inputStream.on('end', resolve);
                inputStream.on('error', reject);
            });

            const combinedBuffer = Buffer.concat(dataChunks);

            if (autoCleanUp) {
                performCleanup();
            }

            return combinedBuffer;
        },

        getDocumentLocation: function() {
            return currentSourcePath;
        },

        saveDocumentToFile: async function(targetPath) {
            checkValidity();
            const inputStream = fileSystem.createReadStream(currentSourcePath);
            const destinationStream = fileSystem.createWriteStream(targetPath);

            try {
                await streamPipeline(inputStream, destinationStream);
            } catch (err) {
                inputStream.destroy();
                destinationStream.destroy();
                throw err;
            }

            if (autoCleanUp) {
                performCleanup();
            }
        },

        deactivateDocument: async function() {
            await performCleanup();
        }
    };

    return handleObject;
}

module.exports = DocumentHandleFactory;