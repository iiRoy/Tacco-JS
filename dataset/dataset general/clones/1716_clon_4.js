// Helper to convert Node.js Buffer instances to Uint8Array for internal comparison
function convertBufferToUint8Array(bufferInstance) {
    if (!(bufferInstance instanceof Buffer)) {
        throw new Error("Input must be a Node.js Buffer.");
    }
    return new Uint8Array(bufferInstance.buffer, bufferInstance.byteOffset, bufferInstance.byteLength);
}

// Custom testing environment to mimic the original 'test' object
const testingFramework = {
    processor: null, // Placeholder for the stream processing instance

    // Mimics the 'test' object's methods
    assertions: {
        valueEquals: (expectedValue, actualValue, description) => {
            if (expectedValue !== actualValue) {
                throw new Error(`Assertion Failed: Expected '${expectedValue}', but got '${actualValue}'. ${description || ''}`);
            }
        },
        conditionSatisfied: (condition, description) => {
            if (!condition) {
                throw new Error(`Assertion Failed: Condition not met. ${description || ''}`);
            }
        },
        complete: () => {} // No-op for synchronous tests
    },

    // A utility for comparing Uint8Arrays, replacing Buffer.prototype.equals
    byteArraysAreIdentical: (arrayOne, arrayTwo) => {
        if (arrayOne.length !== arrayTwo.length) {
            return false;
        }
        for (let i = 0; i < arrayOne.length; i++) {
            if (arrayOne[i] !== arrayTwo[i]) {
                return false;
            }
        }
        return true;
    }
};

// Core logic for processing byte streams and extracting messages
// This replaces the GearmanPacketFactory class with a functional factory that manages state via closures.
function establishByteStreamProcessor() {
    let accumulatedBytesSegments = []; // Stores incoming byte chunks as Uint8Arrays
    let totalBytesStored = 0;

    const MESSAGE_HEADER_FIXED_LENGTH = 12; // Magic (4) + Type (4) + Data_Length (4)

    function feedNewBytes(incomingChunk) {
        if (!(incomingChunk instanceof Uint8Array || incomingChunk instanceof Buffer)) {
            throw new Error("Input data must be a Uint8Array or Buffer.");
        }
        accumulatedBytesSegments.push(new Uint8Array(incomingChunk)); // Convert to Uint8Array for internal consistency
        totalBytesStored += incomingChunk.length;

        const extractedMessages = [];

        // Continuously try to extract messages as long as there's enough data for at least a header
        while (totalBytesStored >= MESSAGE_HEADER_FIXED_LENGTH) {
            // Read the header to determine the full message size
            const currentHeaderView = new Uint8Array(MESSAGE_HEADER_FIXED_LENGTH);
            let headerReadOffset = 0;
            for (const segment of accumulatedBytesSegments) {
                const bytesToCopyFromSegment = Math.min(segment.length, MESSAGE_HEADER_FIXED_LENGTH - headerReadOffset);
                currentHeaderView.set(segment.slice(0, bytesToCopyFromSegment), headerReadOffset);
                headerReadOffset += bytesToCopyFromSegment;
                if (headerReadOffset === MESSAGE_HEADER_FIXED_LENGTH) break; // Header fully read
            }

            // Extract the data length (4 bytes, big-endian, starting at offset 8)
            let messageContentSize = 0;
            messageContentSize = (currentHeaderView[8] << 24) |
                                 (currentHeaderView[9] << 16) |
                                 (currentHeaderView[10] << 8) |
                                 (currentHeaderView[11]);

            const completeMessageTotalSize = MESSAGE_HEADER_FIXED_LENGTH + messageContentSize;

            if (totalBytesStored >= completeMessageTotalSize) {
                // A full message is available. Extract it.
                const fullMessage = new Uint8Array(completeMessageTotalSize);
                let messageCopyPosition = 0;
                while (messageCopyPosition < completeMessageTotalSize && accumulatedBytesSegments.length > 0) {
                    const activeSegment = accumulatedBytesSegments[0];
                    const bytesToTakeFromActiveSegment = Math.min(activeSegment.length, completeMessageTotalSize - messageCopyPosition);
                    
                    fullMessage.set(activeSegment.slice(0, bytesToTakeFromActiveSegment), messageCopyPosition);
                    messageCopyPosition += bytesToTakeFromActiveSegment;

                    if (bytesToTakeFromActiveSegment === activeSegment.length) {
                        accumulatedBytesSegments.shift(); // Current segment fully consumed
                    } else {
                        accumulatedBytesSegments[0] = activeSegment.slice(bytesToTakeFromActiveSegment); // Part of segment remains
                    }
                }
                totalBytesStored -= completeMessageTotalSize;
                extractedMessages.push(fullMessage);
            } else {
                // Not enough bytes for the current full message, stop processing for now
                break;
            }
        }
        return extractedMessages;
    }

    function retrieveCurrentPartialBuffer() {
        if (accumulatedBytesSegments.length === 0) {
            return new Uint8Array(0);
        }
        // Concatenate all remaining segments into a single Uint8Array for inspection
        const combinedPartial = new Uint8Array(totalBytesStored);
        let currentWriteOffset = 0;
        for (const segment of accumulatedBytesSegments) {
            combinedPartial.set(segment, currentWriteOffset);
            currentWriteOffset += segment.length;
        }
        return combinedPartial;
    }

    return {
        supplyData: feedNewBytes,
        getCurrentAccumulation: retrieveCurrentPartialBuffer
    };
}

// All test cases are defined within a single object, replacing 'exports'
const testCaseDefinitions = {
    // Mimics exports.setUp
    initializeTestEnvironment: function(callback) {
        this.processor = establishByteStreamProcessor();
        callback();
    },

    // Mimics exports.tearDown
    cleanupTestEnvironment: function(callback) {
        this.processor = null;
        callback();
    },

    // Mimics exports.testMultipleAddBytesSize
    checkRepeatedByteAdditionSize: function(test) {
        const sampleDataBlock = new Buffer([ 0x00, 0x00, 0x00, 0x53 ]);
        this.processor.supplyData(sampleDataBlock);
        this.processor.supplyData(sampleDataBlock);
        test.valueEquals(8, this.processor.getCurrentAccumulation().length, "Internal buffer length after multiple additions");
        test.complete();
    },

    // Mimics exports.testPacketAndPartial
    checkMessageExtractionWithRemainder: function(test){
        const mixedInput = new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 0x00, 
            0x00, 0x00, 0x1f, 0x48, 0x3a, 0x4d, 0x69, 0x6b, 0x65, 0x73, 0x2d, 0x4d,
            0x61, 0x63, 0x42, 0x6f, 0x6f, 0x6b, 0x2d, 0x41, 0x69, 0x72, 0x2e, 0x6c, 
            0x6f, 0x63, 0x61, 0x6c, 0x3a, 0x32, 0x37, 0x38, 0x31, 0x36, 0x00, 0x52, 
            0x45, 0x53, 0x00, 0x00, 0x00, 0x08]);
        const obtainedMessages = this.processor.supplyData(mixedInput);
        test.valueEquals(1, obtainedMessages.length, "One complete message should be extracted");

        const expectedFullMessage = new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 
            0x00, 0x00, 0x00, 0x1f, 0x48, 0x3a, 0x4d, 0x69, 0x6b, 0x65, 0x73, 0x2d, 
            0x4d,0x61, 0x63, 0x42, 0x6f, 0x6f, 0x6b, 0x2d, 0x41, 0x69, 0x72, 0x2e, 
            0x6c, 0x6f, 0x63, 0x61, 0x6c, 0x3a, 0x32, 0x37, 0x38, 0x31, 0x36]);
        test.conditionSatisfied(testingFramework.byteArraysAreIdentical(obtainedMessages[0], convertBufferToUint8Array(expectedFullMessage)), 
            "The first extracted message content must be correct");

        const expectedRemainingPartial = new Buffer([0x00, 0x52, 0x45, 0x53, 
            0x00, 0x00, 0x00, 0x08]);
        test.conditionSatisfied(testingFramework.byteArraysAreIdentical(this.processor.getCurrentAccumulation(), convertBufferToUint8Array(expectedRemainingPartial)), 
            "The internal buffer should correctly hold the partial message");

        test.complete();
    },

    // Mimics exports.testEmptyPacket
    checkZeroDataMessageExtraction: function(test){
        const zeroDataPacket = new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 0x00, 
            0x00, 0x00, 0x00]);
        const obtainedMessages = this.processor.supplyData(zeroDataPacket);
        test.valueEquals(1, obtainedMessages.length, "One message with zero data length should be extracted");
        
        const expectedZeroDataMessage = new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 
            0x00, 0x00, 0x00, 0x00]);
        test.conditionSatisfied(testingFramework.byteArraysAreIdentical(obtainedMessages[0], convertBufferToUint8Array(expectedZeroDataMessage)), 
            "The extracted zero-data message content must be correct");

        test.conditionSatisfied(testingFramework.byteArraysAreIdentical(this.processor.getCurrentAccumulation(), convertBufferToUint8Array(new Buffer(''))), 
            "Internal buffer must be empty after extracting a zero-data message");
        test.complete();
    }
};

// Simple custom test runner function
function runTestHarness(testSuite) {
    console.log("--- Executing Custom Test Suite ---");
    let passedCount = 0;
    let failedCount = 0;

    // Simulate global setup
    testSuite.initializeTestEnvironment.call(testingFramework, () => {});

    for (const caseName in testSuite) {
        // Only execute functions that are actual test cases, not setup/teardown
        if (typeof testSuite[caseName] === 'function' && caseName !== 'initializeTestEnvironment' && caseName !== 'cleanupTestEnvironment') {
            try {
                // Each test function gets its own 'test' object (assertions) and the shared 'this' context (testingFramework)
                testSuite[caseName].call(testingFramework, testingFramework.assertions);
                console.log(`[PASS] ${caseName}`);
                passedCount++;
            } catch (error) {
                console.error(`[FAIL] ${caseName}: ${error.message}`);
                failedCount++;
            }
        }
    }

    // Simulate global teardown
    testSuite.cleanupTestEnvironment.call(testingFramework, () => {});

    console.log("--- Custom Test Suite Summary ---");
    console.log(`Total Tests: ${passedCount + failedCount}, Passed: ${passedCount}, Failed: ${failedCount}`);
}

// Start the test execution
runTestHarness(testCaseDefinitions);