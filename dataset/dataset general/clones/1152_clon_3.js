var fileSystemModule = require('fs');

// Constants for bitwise manipulation of message identifiers.
// These define the structure for parsing and composing system messages.
const
    FACILITY_BITMASK   = 0x00FF0000, // Mask to extract the facility code (bits 16-23).
    MESSAGE_ID_BITMASK  = 0x0000FFFF, // Mask to extract the specific message ID (bits 0-15).
    SEVERITY_BITMASK = 0xF0000000; // Mask to extract the severity level (bits 28-31).

/**
 * Constructs a comprehensive message identifier from its constituent facility and message codes.
 * This function ensures the components are correctly positioned within a 32-bit integer.
 * @param {number} facilityCodeValue - The numerical identifier for the originating facility.
 * @param {number} messageCodeValue - The unique identifier for the specific message within the facility.
 * @returns {number} A single 32-bit integer representing the unified message identifier.
 */
var composeMessageIdentifier = exports.composeMessageIdentifier = function(facilityCodeValue, messageCodeValue) {
    // Sanitize inputs to ensure they fit within their allocated bit ranges.
    const sanitizedFacility = facilityCodeValue & 0xFF; // Facility is 8 bits.
    const sanitizedMessage = messageCodeValue & 0xFFFF; // Message ID is 16 bits.

    // Combine by shifting the facility code into its high-byte position and ORing with the message ID.
    return (sanitizedFacility << 16) | sanitizedMessage;
};

/**
 * Extracts the primary message identification number from a complete message identifier.
 * @param {number} fullMessageIdentifier - The 32-bit combined message identifier.
 * @returns {number} The specific message ID.
 */
var extractMessageID = exports.extractMessageID = function(fullMessageIdentifier) {
    // Apply the message ID bitmask to isolate the lower 16 bits.
    return (fullMessageIdentifier & MESSAGE_ID_BITMASK);
};

/**
 * Retrieves the facility code component from a full message identifier.
 * @param {number} fullMessageIdentifier - The 32-bit combined message identifier.
 * @returns {number} The extracted facility code.
 */
var extractFacilityCode = exports.extractFacilityCode = function(fullMessageIdentifier) {
    // Apply the facility bitmask and then right-shift to obtain the actual facility value.
    return (fullMessageIdentifier & FACILITY_BITMASK) >>> 16; // Use unsigned right shift.
};

/**
 * Determines the severity or classification level encoded within a message identifier.
 * @param {number} fullMessageIdentifier - The 32-bit combined message identifier.
 * @returns {number} The derived severity level.
 */
exports.deriveSeverityLevel = function(fullMessageIdentifier) {
    // Apply the severity bitmask and shift right to isolate the severity value (4 bits).
    return (fullMessageIdentifier & SEVERITY_BITMASK) >>> 28;
};

/**
 * Main function to retrieve descriptive text for a list of status codes from a message file.
 * This involves opening the message file, parsing its header, navigating an index tree,
 * and finally locating and formatting the message strings.
 * @param {Array<Object>} statusRecords - An array of objects, each containing 'gdscode' and optional 'params'.
 * @param {Function} completionCallback - A callback function invoked upon completion or error,
 *                                        receiving an error object or the aggregated message string.
 */
exports.retrieveErrorDescriptions = function(statusRecords, completionCallback){

    let fileHandle;          // Descriptor for the opened message file.
    let dataChunkSize;       // Size of data blocks/buckets as defined in the file header.
    let indexRootOffset;     // File offset pointing to the root of the index tree.
    let indexTreeDepth;      // Number of levels in the index tree.
    let workingBuffer;       // Buffer used for reading file data chunks.

    // Guard clause: Ensure the input statusRecords array is valid and non-empty.
    if (!Array.isArray(statusRecords) || statusRecords.length === 0) {
        return completionCallback(new Error("Input status records list is empty or invalid."));
    }

    /**
     * Processes a single status record to fetch its corresponding message description.
     * This involves index tree traversal and message record retrieval.
     * @param {Object} currentStatusItem - The status object containing 'gdscode' and 'params'.
     * @param {Function} itemResultCallback - Callback invoked with the message string or an error for this item.
     */
    function processSingleStatus(currentStatusItem, itemResultCallback) {

        // Validate the 'gdscode' property of the current status item.
        if (typeof currentStatusItem.gdscode !== 'number' || currentStatusItem.gdscode < 0) {
            console.warn("Encountered an invalid or missing gdscode:", currentStatusItem.gdscode);
            return itemResultCallback("[Invalid Message Code Provided]");
        }

        // Decompose and then recompose the message identifier to ensure it's in the expected bit-packed format
        // for consistent lookup, as defined by the bitmasks.
        const facilityPart = extractFacilityCode(currentStatusItem.gdscode);
        const messageIdPart = extractMessageID(currentStatusItem.gdscode);
        const targetCombinedCode = composeMessageIdentifier(facilityPart, messageIdPart);

        /**
         * Parses an 8-byte index node entry from the working buffer.
         * @param {number} startOffset - The byte offset within the buffer where the node begins.
         * @returns {Object} An object containing the node's code and its seek pointer for the next level.
         */
        function parseIndexNode(startOffset) {
            const nodeInfo = {};
            nodeInfo.nodeCodeValue = workingBuffer.readUInt32LE(startOffset);     // 4 bytes for the code.
            nodeInfo.nextLevelSeek = workingBuffer.readUInt32LE(startOffset + 4); // 4 bytes for the seek offset.
            return nodeInfo;
        }

        /**
         * Recursively traverses the index tree to locate the block containing the target message.
         * @param {number} currentTreeLevel - The current depth in the index tree (1-based).
         * @param {number} blockFileOffset - The file offset to the current index block to be read.
         */
        function traverseIndexTree(currentTreeLevel, blockFileOffset) {
            fileSystemModule.read(fileHandle, workingBuffer, 0, dataChunkSize, blockFileOffset, function(readError, bytesReadCount) {
                if (readError) {
                    console.error("Error during index block read:", readError);
                    return itemResultCallback(new Error("Failed to read index block."));
                }

                if (bytesReadCount <= 0) {
                    return itemResultCallback(new Error("Empty or invalid index block data."));
                }

                // If we are at the deepest level, proceed to scan for the message record within this block.
                if (currentTreeLevel === indexTreeDepth) {
                    scanForMessageRecord();
                    return;
                }

                let currentBufferPosition = 0;
                let pathFound = false;

                // Iterate through each node in the current index block.
                while (currentBufferPosition < bytesReadCount) {
                    const currentNode = parseIndexNode(currentBufferPosition);

                    // If the node's code is greater than or equal to our target,
                    // we follow this branch down the tree.
                    if (currentNode.nodeCodeValue >= targetCombinedCode) {
                        traverseIndexTree(currentTreeLevel + 1, currentNode.nextLevelSeek);
                        pathFound = true;
                        break;
                    }

                    currentBufferPosition += 8; // Each node occupies 8 bytes.
                }

                // If no appropriate branch was found in the current block, the message is not indexed.
                if (!pathFound) {
                    itemResultCallback(new Error("Message identifier not found in index path."));
                }
            });
        }

        /**
         * Scans the current data block (loaded into workingBuffer) for the specific message record.
         */
        function scanForMessageRecord() {

            /**
             * Aligns a given byte offset to the next 4-byte boundary.
             * This is often used to ensure data structures start on word boundaries.
             * @param {number} byteOffset - The offset to align.
             * @returns {number} The aligned offset.
             */
            function alignToFourBytes(byteOffset) {
                // Bitwise operation for fast alignment to the next multiple of 4.
                return (byteOffset + 3) & ~3;
            }

            /**
             * Parses a message record entry from the working buffer.
             * @param {number} recordBeginOffset - The starting offset of the record within the buffer.
             * @returns {Object} An object containing the record's code, length, text, and the seek to the next record.
             */
            function parseMessageRecord(recordBeginOffset) {
                const recordDetails = {};
                recordDetails.messageRecordCode = workingBuffer.readUInt32LE(recordBeginOffset); // 4 bytes for code.
                recordDetails.textLength = workingBuffer.readUInt16LE(recordBeginOffset + 4);   // 2 bytes for text length.

                // If this is the target message, extract its text.
                if (recordDetails.messageRecordCode === targetCombinedCode) {
                    const textContentOffset = recordBeginOffset + 8; // Code (4) + Length (2) + Padding (2) = 8 bytes.
                    recordDetails.messageTextContent = workingBuffer.toString('utf8', textContentOffset, textContentOffset + recordDetails.textLength);
                    recordDetails.nextRecordOffset = null; // Indicate end of search for this record.
                } else {
                    // If not the target, calculate the offset to the next record in the block.
                    recordDetails.nextRecordOffset = recordBeginOffset + alignToFourBytes(8 + recordDetails.textLength);
                }
                return recordDetails;
            }

            let currentRecordDetails = parseMessageRecord(0);

            // Iterate through records in the block until the target is found or end of block.
            while (currentRecordDetails.nextRecordOffset !== null && currentRecordDetails.nextRecordOffset < workingBuffer.length) {
                currentRecordDetails = parseMessageRecord(currentRecordDetails.nextRecordOffset);
            }

            let finalMessage = currentRecordDetails.messageTextContent;

            // Perform parameter substitution if 'params' are provided in the status item.
            if (currentStatusItem.params && Array.isArray(currentStatusItem.params)) {
                for (let pIndex = 0; pIndex < currentStatusItem.params.length; pIndex++) {
                    const placeholder = `@${pIndex + 1}`;
                    const replacementValue = String(currentStatusItem.params[pIndex]);
                    // Use a global regex to replace all occurrences of the placeholder.
                    finalMessage = finalMessage.replace(new RegExp(placeholder, 'g'), replacementValue);
                }
            }

            itemResultCallback(finalMessage);
        }

        // Begin the index tree traversal from the root.
        traverseIndexTree(1, indexRootOffset);
    }

    // Construct the full path to the message file.
    const fullMessageFilePath = __dirname + "/firebird.msg"; // Using string concatenation for consistency with original.

    // Open the message file for reading.
    fileSystemModule.open(fullMessageFilePath, 'r', function(openErr, openedFileDescriptor) {
        if (openErr) {
            console.error("Failed to open message file:", openErr);
            return completionCallback(new Error("Could not open message file."));
        }

        // Validate that a file descriptor was successfully obtained.
        if (!openedFileDescriptor) {
            return completionCallback(new Error("Invalid file descriptor received after opening."));
        }

        fileHandle = openedFileDescriptor; // Assign to the outer scope variable.

        // Allocate a small buffer specifically for reading the file header.
        const headerReadBuffer = Buffer.alloc(14);

        // Read the initial 14 bytes of the file, which constitute the header.
        fileSystemModule.read(fileHandle, headerReadBuffer, 0, headerReadBuffer.length, 0, function(headerReadErr, bytesReadFromHeader) {
            if (headerReadErr) {
                console.error("Error reading file header:", headerReadErr);
                fileSystemModule.close(fileHandle, () => completionCallback(new Error("Failed to read message file header.")));
                return;
            }
            if (bytesReadFromHeader < headerReadBuffer.length) {
                 console.error("Incomplete file header read. Expected 14 bytes, got", bytesReadFromHeader);
                 fileSystemModule.close(fileHandle, () => completionCallback(new Error("Incomplete message file header data.")));
                 return;
            }

            // Parse essential metadata from the header.
            dataChunkSize = headerReadBuffer.readUInt16LE(2);  // Offset 2: bucket_size.
            indexRootOffset = headerReadBuffer.readUInt32LE(4); // Offset 4: top_tree pointer.
            indexTreeDepth = headerReadBuffer.readUInt16LE(12); // Offset 12: levels count.

            // Allocate the primary working buffer based on the determined data chunk size.
            workingBuffer = Buffer.alloc(dataChunkSize);

            let currentProcessingIndex = 0;
            const collectedMessageStrings = [];

            /**
             * Processes each status record sequentially from the input list.
             * This function uses recursion to handle asynchronous file operations for each item.
             * @param {number} indexToProcess - The current index in the statusRecords array.
             */
            function processAllRecordsSequentially(indexToProcess) {
                if (indexToProcess >= statusRecords.length) {
                    // All records processed; close the file and return the aggregated result.
                    fileSystemModule.close(fileHandle, function(closeErr) {
                        if (closeErr) {
                            console.warn("Warning: Error encountered while closing message file:", closeErr);
                        }
                        // Join all collected messages with a comma and space.
                        completionCallback(null, collectedMessageStrings.join(', '));
                    });
                    return;
                }

                // Process the current status item using the helper function.
                processSingleStatus(statusRecords[indexToProcess], function(messageOrError) {
                    if (messageOrError instanceof Error) {
                        // If an error occurs for a specific item, record an error message.
                        collectedMessageStrings.push(`[Error for code ${statusRecords[indexToProcess].gdscode}: ${messageOrError.message}]`);
                    } else {
                        // Otherwise, add the successfully retrieved message.
                        collectedMessageStrings.push(messageOrError);
                    }

                    // Proceed to process the next status record.
                    processAllRecordsSequentially(indexToProcess + 1);
                });
            }

            // Initiate the sequential processing of all status records.
            processAllRecordsSequentially(currentProcessingIndex);
        });
    });
};