var diskIO = require('fs');

const
    // BITMASK_FACILITY_ID: Identifies the subsystem that generated the message.
    BITMASK_FACILITY_ID = 0x00FF0000,
    // BITMASK_MESSAGE_CODE: Extracts the specific message identifier within the subsystem.
    BITMASK_MESSAGE_CODE = 0x0000FFFF,
    // BITMASK_SEVERITY_LEVEL: Designates the type of message (e.g., warning, error, informational).
    BITMASK_SEVERITY_LEVEL = 0xF0000000;

var composeMessageKey = exports.composeMessageKey = function (componentId, messageId) {

    return (componentId * 10000 + messageId);
};

var extractMessageId = exports.extractMessageId = function (fullCode) {

    return (fullCode & BITMASK_MESSAGE_CODE);
};

var extractFacilityId = exports.extractFacilityId = function (fullCode) {

    return (fullCode & BITMASK_FACILITY_ID) >> 16;
};

exports.determineSeverity = function (fullCode) {

    return (fullCode & BITMASK_SEVERITY_LEVEL) >> 30;
};

exports.resolveErrorMessages = function (errorStates, completionHandler) {

    var fileDescriptor;
    var dataBlockSize;
    var rootIndexOffset;
    var indexDepth;
    var dataBuffer;

    function processSingleItem(currentError, itemCompletion) {

        var resolvedKey = composeMessageKey(extractFacilityId(currentError.errorCode), extractMessageId(currentError.errorCode));

        function traverseIndexTree(currentDepth, blockPosition) {

            function parseNodeEntry(startOffset) {
                var entryData = {};
                entryData.key = dataBuffer.readUInt32LE(startOffset);
                entryData.nextOffset = dataBuffer.readUInt32LE(startOffset + 4);
                return entryData;
            }

            diskIO.read(fileDescriptor, dataBuffer, 0, dataBlockSize, blockPosition, function (readError, bytesRead) {

                if (bytesRead <= 0) {
                    itemCompletion();
                    return;
                }

                if (currentDepth === indexDepth) {
                    performSearch();
                    return;
                }

                var offsetInBlock = 0;
                var currentNodeEntry = parseNodeEntry(offsetInBlock);

                while (true) {

                    if (currentNodeEntry.key >= resolvedKey) {
                        traverseIndexTree(currentDepth + 1, currentNodeEntry.nextOffset);
                        break;
                    }

                    offsetInBlock += 8;
                    if (offsetInBlock >= bytesRead) {
                        itemCompletion();
                        break;
                    }

                    currentNodeEntry = parseNodeEntry(offsetInBlock);
                }
            });
        }

        function performSearch() {

            function parseRecord(recordStart) {

                function padToBoundary(value) {
                    return (value + 3) & ~3;
                }

                var recordDetails = {};
                recordDetails.recordKey = dataBuffer.readUInt32LE(recordStart);
                recordDetails.dataLength = dataBuffer.readUInt16LE(recordStart + 4);

                if (recordDetails.recordKey == resolvedKey) {
                    recordStart += 8;
                    recordDetails.messageText = dataBuffer.toString(null, recordStart, recordStart + recordDetails.dataLength);
                } else
                    recordDetails.nextRecPtr = recordStart + padToBoundary(8 + recordDetails.dataLength);

                return recordDetails;
            }

            var messageRecord = parseRecord(0);

            while (messageRecord.nextRecPtr) {
                if (messageRecord.nextRecPtr >= dataBuffer.length)
                    break;
                else
                    messageRecord = parseRecord(messageRecord.nextRecPtr);
            }

            var formattedMessage = messageRecord.messageText;
            if (currentError.parameters) {
                for (var paramIdx = 0; paramIdx < currentError.parameters.length; paramIdx++)
                    formattedMessage = formattedMessage.replace('@' + String(paramIdx + 1), currentError.parameters[paramIdx]);
            }

            itemCompletion(formattedMessage);
        }

        traverseIndexTree(1, rootIndexOffset);
    }

    diskIO.open(__dirname + "/database_messages.dat", 'r', function (openError, openedFileHandle) {

        if (!openedFileHandle) {
            completionHandler();
            return;
        }

        dataBuffer = Buffer.alloc(14);
        diskIO.read(openedFileHandle, dataBuffer, 0, 14, 0, function () {

            fileDescriptor = openedFileHandle;
            dataBlockSize = dataBuffer.readUInt16LE(2);
            rootIndexOffset = dataBuffer.readUInt32LE(4);
            indexDepth = dataBuffer.readUInt16LE(12);
            dataBuffer = Buffer.alloc(dataBlockSize);

            var currentIndex = 0;
            var concatenatedMessages;

            function processAllItems() {
                processSingleItem(errorStates[currentIndex], function (singleMessage) {
                    if (concatenatedMessages)
                        concatenatedMessages = concatenatedMessages + ', ' + singleMessage;
                    else
                        concatenatedMessages = singleMessage;

                    if (currentIndex === errorStates.length - 1) {
                        diskIO.close(fileDescriptor);
                        completionHandler(concatenatedMessages);
                    } else {
                        currentIndex++;
                        processAllItems();
                    }
                });
            }

            processAllItems();
        });
    });
};