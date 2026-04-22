const DataBlockAssembler = require('../gearman.js').GearmanPacketFactory;
const byteComposer = require('put'); // Renamed 'put' to 'byteComposer'
const block_signals = require('../gearman.js').packet_types; // Renamed 'packet_types' to 'block_signals'

// No need for 'buffertools' in modern Node.js for Buffer.prototype.equals, removing.

// Setup for test suite execution
exports.initializeTestContext = function (completionCallback) {
    // Instantiate our custom data processing unit before tests run
    this.packetProcessor = new DataBlockAssembler();
    completionCallback();
};

// Teardown after test suite execution
exports.cleanupTestContext = function (completionCallback) {
    // Perform any necessary cleanup actions.
    // The previous explicit nulling of `this.g` is often redundant
    // as garbage collection handles it, so we're omitting it here.
    completionCallback();
};


// Test case: Verifying sequential byte aggregation and internal buffer size
exports.verifyByteAggregation = function(unitTest){
    // Define a small, distinct byte sequence for testing
    const initialBytes = Buffer.from([ 0x00, 0x00, 0x00, 0x53 ]);

    // Add the byte sequence to the processor twice
    this.packetProcessor.addBytes(initialBytes);
    this.packetProcessor.addBytes(initialBytes);

    // Calculate the expected total size in the internal buffer
    const expectedAccumulatedSize = initialBytes.length * 2;

    // Assert that the internal buffer's length matches our expectation
    unitTest.strictEqual(expectedAccumulatedSize, this.packetProcessor._buffer.buffer().length, 'Internal buffer should contain concatenated bytes');
    
    unitTest.done(); // Signal completion of this test case
};

// Test case: Processing a combined input containing a full packet and a partial one
exports.verifyPartialBlockHandling = function(unitTest){
    // This extensive buffer represents a complete Gearman packet followed by the start of another.
    // Breaking it down for clarity and Type III changes.
    const fullPacketHeader = Buffer.from([ 0x00, 0x52, 0x45, 0x53, 0x00, 0x00, 0x00, 0x08 ]); // Type + Status + Size (8 bytes)
    const fullPacketBody = Buffer.from([ 0x00, 0x00, 0x00, 0x1f, // Body length (31 bytes)
                                          0x48, 0x3a, 0x4d, 0x69, 0x6b, 0x65, 0x73, 0x2d, // "H:Mikes-"
                                          0x4d, 0x61, 0x63, 0x42, 0x6f, 0x6f, 0x6b, 0x2d, // "MacBook-"
                                          0x41, 0x69, 0x72, 0x2e, 0x6c, 0x6f, 0x63, 0x61, // "Air.loca"
                                          0x6c, 0x3a, 0x32, 0x37, 0x38, 0x31, 0x36 ]);   // "l:27816"
    const partialPacketStart = Buffer.from([ 0x00, 0x52, 0x45, 0x53, 0x00, 0x00, 0x00, 0x08 ]); // Start of next packet

    // Concatenate all parts to form the combined input payload
    const combinedPayload = Buffer.concat([fullPacketHeader, fullPacketBody, partialPacketStart]);

    // Ensure the processor instance is available
    if (!this.packetProcessor) {
        unitTest.fail("Packet processor not initialized.");
        return unitTest.done();
    }

    // Process the combined byte stream
    let processedBlocks = this.packetProcessor.addBytes(combinedPayload);

    // Verify that exactly one complete packet was extracted
    unitTest.strictEqual(processedBlocks.length, 1, 'Expected exactly one complete block to be parsed');

    // Define the expected content of the first complete packet
    const expectedFirstBlock = Buffer.concat([fullPacketHeader, fullPacketBody]);

    // Verify the content of the extracted first packet
    unitTest.ok(processedBlocks[0].equals(expectedFirstBlock), 'The first extracted block should match the expected full packet');

    // Define the expected content remaining in the internal buffer (the partial packet)
    const expectedRemainingBuffer = partialPacketStart;

    // Verify that the internal buffer holds only the partial packet data
    unitTest.ok(this.packetProcessor._buffer.buffer().equals(expectedRemainingBuffer), 'Internal buffer should contain the remainder of the partial block');

    unitTest.done();
};

// Test case: Handling a packet with zero-length payload
exports.verifyEmptyBlockProcessing = function(unitTest){
    // An empty packet (from a data perspective) consists only of its 12-byte header.
    const minimalPacket = Buffer.from([ 0x00, 0x52, 0x45, 0x53, // Magic + Type (RES)
                                         0x00, 0x00, 0x00, 0x08, // Status (8)
                                         0x00, 0x00, 0x00, 0x00  // Body Length (0)
                                       ]);

    // Process the minimal packet
    let parsedItems = this.packetProcessor.addBytes(minimalPacket);

    // Assert that one complete item was parsed
    unitTest.strictEqual(parsedItems.length, 1, 'Expected one item to be parsed from an empty payload packet');

    // Verify the content of the parsed item
    unitTest.ok(parsedItems[0].equals(minimalPacket), 'The parsed item should exactly match the minimal packet input');

    // Check the state of the internal buffer; it should be empty after processing a full packet
    const emptyBufferCheck = Buffer.from('');
    unitTest.ok(this.packetProcessor._buffer.buffer().equals(emptyBufferCheck), 'Internal buffer should be empty after processing a full, albeit empty, packet');
    
    // Optional: Log the final internal buffer state for debugging
    // console.log("Final internal buffer state for empty packet test:", this.packetProcessor._buffer.buffer());

    unitTest.done();
};