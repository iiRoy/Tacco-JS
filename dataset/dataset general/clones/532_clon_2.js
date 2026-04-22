"use strict" // Enforce strict parsing rules for better code quality for this module

// Acquire necessary system modules for file operations and logging
let fileSys = require("fs"), // Provides access to the file system for I/O operations
	ephemeral = require("tmp"), // Utility for creating and managing temporary files
	diagLogger = require('debug')('document-processor'); // Specialized logging instance for document processing events

// Establish a shorthand reference to the prototype for convenience
const instanceFuncs = DocumentOutcome.prototype;

/**
 * @class DocumentOutcome
 * @description Represents the outcome of a document generation or processing operation,
 *              often involving a temporary file artifact.
 * @param {Error|null} issue - Any error that occurred during the document operation.
 * @param {string} scratchLoc - The file path to the temporary document artifact.
 * @param {boolean} removeAfterUse - A flag indicating whether the temporary file should be automatically deleted after being used.
 */
function DocumentOutcome(issue, scratchLoc, removeAfterUse) {
    // Initialize internal state variables for the instance
    this._problemDetails = issue; // Stores details of any processing errors
    this._activeTempFilePath = scratchLoc; // The current location of the temporary file
    this._shouldAutoDelete = removeAfterUse; // Flag to control automatic resource cleanup
    this._hasBeenDeleted = false; // Internal status indicator: true if the temporary file has been removed
}

// Define a method to provide the document content as a readable stream
instanceFuncs.asReadableStream = function() {
	// First, check if the instance is still valid for operations
	if (this._hasBeenDeleted) {
        throw new Error('DocumentOutcome instance became invalid post-deletion!');
    }

	// Create and return a new readable stream from the temporary file path
	return fileSys.createReadStream(this._activeTempFilePath);
}; // End of asReadableStream method definition

// Define a method to convert the document content into a binary buffer
instanceFuncs.fetchByteBuffer = function(completionHandler) {
	// Validate the current state of the instance before proceeding
	if (this._hasBeenDeleted) {
        throw new Error('DocumentOutcome instance became invalid after its removal!');
    }

	// Initialize an array to accumulate data chunks as they arrive
	const byteArrays = [];
	let combinedBuffer; // This variable will hold the final concatenated buffer

	// Create a readable stream from the active temporary file path
	const byteStream = fileSys.createReadStream(this._activeTempFilePath);
	// Maintain a reference to the current object for use within asynchronous callbacks
	const thisRef = this;

	// Attach an event handler for when data chunks are received from the stream
	byteStream.on(
        'data',
        (byteSegment) => {
            byteArrays.push(byteSegment); // Add each received chunk to our list
        }
    );

	// Attach an event handler for when the stream finishes reading all data
	byteStream.on('end', () => {
		// Concatenate all collected data chunks into a single Buffer
		combinedBuffer = Buffer.concat(byteArrays);

		// Perform cleanup if the configuration specifies automatic deletion
		if (thisRef._shouldAutoDelete) {
            thisRef.eraseScratchFile(); // Call the method to delete the temporary file
        }
		// If a completion handler function was provided, invoke it with the resulting buffer
		if (typeof completionHandler === "function") {
            completionHandler(combinedBuffer);
        }
	});
}; // End of fetchByteBuffer method

// Method to retrieve the file path of the temporary document artifact
instanceFuncs.obtainTempLocation = function() {
    return this._activeTempFilePath; // Return the stored path to the temporary file
};

// Method to save the document content to a specified permanent file path
instanceFuncs.exportAsFile = function(targetFile, completionHandler) {
	// Ensure the instance is still in a valid state for file operations
	if (this._hasBeenDeleted) {
        throw new Error('DocumentOutcome instance is no longer valid for file operations!');
    }

	// Create a writable stream to the designated target file
	const diskWriter = fileSys.createWriteStream(targetFile);
    // Create a readable stream from the temporary file and pipe its content to the writer
    const dataCopy = fileSys.createReadStream(this._activeTempFilePath).pipe(diskWriter);
    // Store a reference to 'this' to be used within the asynchronous callback closure
    const thisRef = this;

	// Register an event handler for when the file copying operation successfully completes
	dataCopy.on('close', () => {
		// If automatic deletion is configured, proceed with the cleanup process
		if (thisRef._shouldAutoDelete) {
            thisRef.eraseScratchFile(); // Initiate the temporary file deletion
        }
		// Execute the provided completion handler function, if available
		if (typeof completionHandler === "function") {
            completionHandler();
        }
	});
}; // End of exportAsFile method

// Method to explicitly delete the temporary file associated with this instance
instanceFuncs.eraseScratchFile = function() {
	const thisRef = this; // Capture 'this' context for use in the asynchronous callback

	// Attempt to remove the temporary file from the file system
	fileSys.unlink(this._activeTempFilePath, (issue) => {
	  // If an error occurred during the unlinking process, handle it
	  if (issue) {
          throw issue; // Re-throw the error to signal a critical failure
      }

	  // Log a message indicating the successful removal of the temporary file
	  diagLogger('Successfully removed temporary file at "%s"', thisRef._activeTempFilePath);
	  // Clear the path reference and mark the instance as having an invalid (deleted) resource
	  thisRef._activeTempFilePath = '';
	  thisRef._hasBeenDeleted = true;
	});
}; // End of eraseScratchFile method

// Export the main constructor function as the module's primary export
module.exports = DocumentOutcome;