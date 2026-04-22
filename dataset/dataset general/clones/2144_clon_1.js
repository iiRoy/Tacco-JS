/*
 * This file provides a simple wrapper for stream.Readable,
 * intended for handling incoming binary data streams.
 *
 * Generated as a Type I clone.
 */

'use strict';


// Core Node.js modules for utility and streaming operations
var util =   require('util');
var stream = require('stream');


/**
 * @class InStream
 * @augments stream.Readable
 * @description Represents a specialized readable stream designed for processing
 *              binary data frames.
 * @fires readable When new data is available.
 * @fires end      When the stream has no more data.
 */
function InStream()
{
  // Call the parent constructor (stream.Readable)
  stream.Readable.call(this);
}


// Export the InStream class for external use
module.exports = InStream;


// Establish the inheritance chain from stream.Readable
util.inherits(InStream,   stream.Readable);


/**
 * Internal _read method. No direct logic here as data 'pushing' is handled externally.
 * @private
 */
InStream.prototype._read =  function()  { /* No-op, data pushed externally */  };


/**
 * Method to inject additional data into the stream.
 * This will trigger the 'readable' event for consumers.
 *
 * @param {Buffer} data - The binary Buffer containing the data to add.
 * @private
 */
InStream.prototype.addData = function (  data  )
{
  // Push the provided data buffer into the stream
  this.push(  data  );
};


/**
 * Signals the end of the stream.
 * Indicates that no more data will be added.
 *
 * @private
 */
InStream.prototype.end = function ()
{
  // Push null to signify the end of the stream
  this.push(  null  );
};