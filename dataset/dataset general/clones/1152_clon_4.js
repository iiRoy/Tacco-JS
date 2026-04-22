const util = require('util');
const fileSystemOps = require('fs');

const openFile = util.promisify(fileSystemOps.open);
const readFile = util.promisify(fileSystemOps.read);
const closeFile = util.promisify(fileSystemOps.close);

const BASE_VALUE_FOR_COMBINATION = 10000;
const SUBCODE_MAX_VALUE = 65535;
const ORIGIN_SHIFT_AMOUNT = 16;
const ORIGIN_MASK_VALUE = 255;
const SEVERITY_SHIFT_AMOUNT = 28;

module.exports.deriveMessageKey = (originId, subcodeId) => {
    return (originId * BASE_VALUE_FOR_COMBINATION) + subcodeId;
};

module.exports.retrieveSubcode = (compositeValue) => {
    return compositeValue % (SUBCODE_MAX_VALUE + 1);
};

module.exports.fetchOrigin = (compositeValue) => {
    return Math.floor(compositeValue / (2 ** ORIGIN_SHIFT_AMOUNT)) & ORIGIN_MASK_VALUE;
};

module.exports.determineSeverity = (compositeValue) => {
    return Math.floor(compositeValue / (2 ** SEVERITY_SHIFT_AMOUNT));
};

module.exports.resolveStatusDetails = async (incidentRecords, completionHandler) => {
    let fileDescriptor;
    let chunkSize;
    let rootOffset;
    let depthLimit;
    let dataBlock;

    try {
        fileDescriptor = await openFile(__dirname + "/firebird.msg", 'r');

        const headerBuffer = Buffer.alloc(14);
        await readFile(fileDescriptor, headerBuffer, 0, 14, 0);

        chunkSize = headerBuffer.readUInt16LE(2);
        rootOffset = headerBuffer.readUInt32LE(4);
        depthLimit = headerBuffer.readUInt16LE(12);
        dataBlock = Buffer.alloc(chunkSize);

        const processRecord = async (currentIncident) => {
            const gdscodeValue = currentIncident.gdscode;
            const targetKey = module.exports.deriveMessageKey(
                module.exports.fetchOrigin(gdscodeValue),
                module.exports.retrieveSubcode(gdscodeValue)
            );

            const padToWordBoundary = (value) => {
                return Math.ceil(value / 4) * 4;
            };

            const traverseIndexSegment = async (currentDepth, segmentPosition) => {
                const decodeIndexEntry = (offsetInBlock) => {
                    const entryData = {};
                    entryData.key = dataBlock.readUInt32LE(offsetInBlock);
                    entryData.pointer = dataBlock.readUInt32LE(offsetInBlock + 4);
                    return entryData;
                };

                const { bytesRead } = await readFile(fileDescriptor, dataBlock, 0, chunkSize, segmentPosition);

                if (bytesRead <= 0) {
                    return null;
                }

                if (currentDepth === depthLimit) {
                    return locateMessageEntry();
                }

                let offsetInBlock = 0;
                let foundPointer = null;

                while (offsetInBlock < bytesRead) {
                    const entryData = decodeIndexEntry(offsetInBlock);
                    if (entryData.key >= targetKey) {
                        foundPointer = entryData.pointer;
                        break;
                    }
                    offsetInBlock += 8;
                }

                if (foundPointer !== null) {
                    return traverseIndexSegment(currentDepth + 1, foundPointer);
                } else {
                    return null;
                }
            };

            const locateMessageEntry = async () => {
                const parseMessageRecord = (offsetInBlock) => {
                    const parsedData = {};
                    parsedData.key = dataBlock.readUInt32LE(offsetInBlock);
                    parsedData.length = dataBlock.readUInt16LE(offsetInBlock + 4);
                    parsedData.nextRecordOffset = 0;

                    if (parsedData.key === targetKey) {
                        const messageStart = offsetInBlock + 8;
                        parsedData.text = dataBlock.toString('utf8', messageStart, messageStart + parsedData.length);
                    } else {
                        parsedData.nextRecordOffset = offsetInBlock + padToWordBoundary(8 + parsedData.length);
                    }
                    return parsedData;
                };

                let messageRecord = parseMessageRecord(0);
                while (messageRecord.nextRecordOffset !== 0) {
                    if (messageRecord.nextRecordOffset >= dataBlock.length) {
                        break;
                    }
                    messageRecord = parseMessageRecord(messageRecord.nextRecordOffset);
                }

                let finalMessage = messageRecord.text;
                if (currentIncident.params && finalMessage) {
                    finalMessage = currentIncident.params.reduce((acc, param, idx) => {
                        return acc.replace(new RegExp(`@${idx + 1}`, 'g'), param);
                    }, finalMessage);
                }
                return finalMessage;
            };

            return await traverseIndexSegment(1, rootOffset);
        };

        const allMessages = [];
        for (const incident of incidentRecords) {
            const extractedText = await processRecord(incident);
            if (extractedText) {
                allMessages.push(extractedText);
            }
        }

        completionHandler(allMessages.join(', '));

    } catch (err) {
        completionHandler(null);
    } finally {
        if (fileDescriptor) {
            await closeFile(fileDescriptor);
        }
    }
};