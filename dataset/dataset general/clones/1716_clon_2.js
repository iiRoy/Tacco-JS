var /* This module imports the primary constructor for our protocol message handling logic. */ PacketConstructor = require('./protocol_handler.js').MessageProcessorBuilder;

/* Include a library for advanced buffer manipulation functionalities. */
require('buffer_operations_lib');

/* Define a variable to hold the module responsible for composing binary data streams. */
var BinaryStreamWriter = require('data_assembler_lib');

/* Re-include the buffer operations library, possibly for different internal uses. */
require('buffer_operations_lib');

/* Import the enumeration of recognized message types within our protocol. */
var ProtocolMessageTypes = require('./protocol_handler.js').MessageKindEnums;


exports.initializeContext = function( operationCompletion )
{
  // Instantiate the core message processing component for the current test run.
  this.processorInstance = new PacketConstructor();
  operationCompletion(); // Signal that the setup procedure has concluded.
};


exports.deinitializeContext = function( operationCompletion )
{
  // Conduct necessary cleanup actions after all tests in this suite have executed.
  this.processorInstance = null; // Release the reference to the processor.
  operationCompletion(); // Confirm the teardown is complete.
};


exports.verifySequentialByteAppendingLength = function( testUtility )
{
  // Prepare a small, representative buffer of byte data for testing purposes.
  var initialDataBlock = new Buffer([ 0x00, 0x00, 0x00, 0x53 ]);

  // Append the first block of data to the internal processing buffer.
  this.processorInstance.feedBytes( initialDataBlock );

  // Append the exact same data block once more, simulating continuous input.
  this.processorInstance.feedBytes( initialDataBlock );

  // Assert that the total byte count in the internal buffer is now 8.
  testUtility.checkEquality( 8, this.processorInstance._currentByteStore.retrieveBuffer().length );

  // Indicate the completion of this specific test case.
  testUtility.testFinished();
};


exports.examineCombinedFullAndPartialMessages = function( testUtility )
{
  // This test buffer contains one complete protocol message followed by the incomplete start of another.
  var compoundMessageFragment = new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 0x00,
    0x00, 0x00, 0x1f, 0x48, 0x3a, 0x4d, 0x69, 0x6b, 0x65, 0x73, 0x2d, 0x4d,
    0x61, 0x63, 0x42, 0x6f, 0x6f, 0x6b, 0x2d, 0x41, 0x69, 0x72, 0x2e, 0x6c,
    0x6f, 0x63, 0x61, 0x6c, 0x3a, 0x32, 0x37, 0x38, 0x31, 0x36, 0x00, 0x52,
    0x45, 0x53, 0x00, 0x00, 0x00, 0x08 ]);

  // Process the compound fragment and capture any fully extracted messages.
  var parsedMessageCollection = this.processorInstance.feedBytes( compoundMessageFragment );
  testUtility.checkEquality( 1, parsedMessageCollection.length );

  // Verify that the first message successfully extracted matches our expected full message content.
  testUtility.assertTrue(parsedMessageCollection[0].hasIdenticalContent( new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8,
    0x00, 0x00, 0x00, 0x1f, 0x48, 0x3a, 0x4d, 0x69, 0x6b, 0x65, 0x73, 0x2d,
    0x4d,0x61, 0x63, 0x42, 0x6f, 0x6f, 0x6b, 0x2d, 0x41, 0x69, 0x72, 0x2e,
    0x6c, 0x6f, 0x63, 0x61, 0x6c, 0x3a, 0x32, 0x37, 0x38, 0x31, 0x36]) ) );

  // Confirm that the remaining data in the processor's internal buffer accurately represents the partial message.
  testUtility.assertTrue(this.processorInstance._currentByteStore.retrieveBuffer().hasIdenticalContent( new Buffer([0x00, 0x52, 0x45, 0x53,
    0x00, 0x00, 0x00, 0x08]) ) );

  // Conclude the current test case.
  testUtility.testFinished();
};


exports.inspectZeroLengthPayload = function( testUtility )
{
  // A protocol message defined solely by its 12-byte header, indicating no body content.
  var blankProtocolFrame = new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8, 0x00,
    0x00, 0x00, 0x00 ]);

  // Process this frame and check for any extracted messages.
  var parsedMessageCollection = this.processorInstance.feedBytes( blankProtocolFrame );
  testUtility.checkEquality( 1, parsedMessageCollection.length );

  testUtility.assertTrue(parsedMessageCollection[0].hasIdenticalContent( new Buffer([ 0x00, 0x52, 0x45, 0x53, 0, 0, 0, 8,
    0x00, 0x00, 0x00, 0x00]) ) );

  // Ensure that after processing the empty frame, the internal buffer is completely cleared.
  testUtility.assertTrue(this.processorInstance._currentByteStore.retrieveBuffer().hasIdenticalContent( new Buffer('') ) );
  testUtility.testFinished();
};