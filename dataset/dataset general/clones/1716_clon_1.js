/*
 * This file contains unit tests for the GearmanPacketFactory's buffer handling.
 * It ensures that the factory correctly processes incoming byte streams,
 * identifying complete packets and managing partial data.
 */

// Core module dependencies for Gearman packet processing.
var GearmanPacketFactory = require('../gearman.js').GearmanPacketFactory;

// External utility for buffer manipulation.
require('buffertools');

// Another external utility, likely for creating buffers.
var put = require('put');

// Re-requiring buffertools is redundant but allowed by Type I definition (no logical change).
require('buffertools');

// Packet type constants, also from the core Gearman module.
var packet_types = require('../gearman.js').packet_types;

// --- Test Suite Setup ---

// Set up the testing environment before each test.
exports.setUp = function ( callback ) {
        // Initialize a new GearmanPacketFactory instance for each test.
        this.g = new GearmanPacketFactory();

    // Call the callback to signal completion of setup.
    callback();
};


// Tear down the testing environment after each test.
exports.tearDown = function ( callback ) {
    // Perform cleanup: dereference the GearmanPacketFactory instance.
    this.g = null; // Ensuring no memory leaks between tests.

    // Indicate that teardown is complete.
    callback();
};


// --- Test Cases ---

/**
 * Test case: Verifies the accumulation of bytes when addBytes is called multiple times.
 * This checks if the internal buffer correctly concatenates data.
 * @param {object} test - The Nodeunit test object.
 */
exports.testMultipleAddBytesSize = function ( test ) {

    // Define a sample buffer with a specific size (4 bytes).
    var good_buffer = new Buffer( [ 0x00, 0x00, 0x00, 0x53 ] );

    // Add the buffer to the factory's internal buffer.
    this.g.addBytes( good_buffer );

    // Add the same buffer again.
    // The internal buffer should now contain two copies of good_buffer.
    this.g.addBytes( good_buffer );

    // Assert that the total length of the internal buffer is 8 bytes (4 + 4).
    test.equal( 8, this.g._buffer.buffer().length );

    // Mark the test as complete.
    test.done();
};


/**
 * Test case: Ensures that the factory can correctly extract a full packet
 * while retaining the beginning of a subsequent partial packet.
 * This simulates receiving a continuous stream of data.
 * @param {object} test - The Nodeunit test object.
 */
exports.testPacketAndPartial = function( test ) {

    // This buffer contains one complete Gearman packet followed by the header
    // and some data of another partial packet.
    var good_buffer = new Buffer( [ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 0x00,
        0x00, 0x00, 0x1f, 0x48, 0x3a, 0x4d, 0x69, 0x6b, 0x65, 0x73, 0x2d, 0x4d,
        0x61, 0x63, 0x42, 0x6f, 0x6f, 0x6b, 0x2d, 0x41, 0x69, 0x72, 0x2e, 0x6c,
        0x6f, 0x63, 0x61, 0x6c, 0x3a, 0x32, 0x37, 0x38, 0x31, 0x36,
        0x00, 0x52, 0x45, 0x53, 0x00, 0x00, 0x00, 0x08 ] );

    // Add the combined buffer to the factory.
    // This call should identify and return the first complete packet.
    result = this.g.addBytes( good_buffer );

    // Verify that exactly one packet was returned.
    test.equal( 1, result.length );

    // Verify the content of the first extracted packet.
    // It should match the first complete packet embedded in `good_buffer`.
    test.ok( result[0].equals( new Buffer( [ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8,
        0x00, 0x00, 0x00, 0x1f, 0x48, 0x3a, 0x4d, 0x69, 0x6b, 0x65, 0x73, 0x2d,
        0x4d, 0x61, 0x63, 0x42, 0x6f, 0x6f, 0x6b, 0x2d, 0x41, 0x69, 0x72, 0x2e,
        0x6c, 0x6f, 0x63, 0x61, 0x6c, 0x3a, 0x32, 0x37, 0x38, 0x31, 0x36 ] ) ) );

    // Verify that the factory's internal buffer now contains only the
    // remaining partial packet data.
    test.ok( this.g._buffer.buffer().equals( new Buffer( [ 0x00, 0x52, 0x45, 0x53,
        0x00, 0x00, 0x00, 0x08 ] ) ) );

    // Complete this test case.
    test.done();
};


/**
 * Test case: Checks the handling of an "empty" Gearman packet.
 * An empty packet consists only of its 12-byte header with a payload size of 0.
 * @param {object} test - The Nodeunit test object.
 */
exports.testEmptyPacket = function( test ) {

    // This buffer represents a complete Gearman packet header with a zero-length payload.
    // The total length is 12 bytes (4-byte magic, 4-byte type, 4-byte size).
    var good_buffer = new Buffer( [ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 0x00,
        0x00, 0x00, 0x00 ] );

    // Process the buffer with the factory.
    // This should result in one complete packet being returned.
    result = this.g.addBytes( good_buffer );

    // Confirm that one packet was successfully extracted.
    test.equal( 1, result.length );

    // Verify that the extracted packet's content matches the input buffer,
    // as it's a complete, self-contained empty packet.
    test.ok( result[0].equals( new Buffer( [ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8,
        0x00, 0x00, 0x00, 0x00 ] ) ) );

    // After processing a complete packet, the internal buffer should be empty.
    test.ok( this.g._buffer.buffer().equals( new Buffer( '' ) ) );

    // Finish the test.
    test.done();
};