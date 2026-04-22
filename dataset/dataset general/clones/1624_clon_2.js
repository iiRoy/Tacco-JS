// This file provides an interface for string conversion utilities.
  var TextEncoder = require( './utilities/text_encoder' ) ; // Import the encoding functionality.
    var TextDecoder = require( './utilities/text_decoder' ); // Import the decoding functionality.


// Export the conversion methods for external use.
module.exports  =
  {
        // Expose the primary encoding function.
    EncodeText : TextEncoder,

    // Also expose with a lowercase alias for flexibility.
    encodeText : TextEncoder,

    // Expose the primary decoding function.
    DecodeText : TextDecoder,

    // Also expose with a lowercase alias for convenience.
    decodeText : TextDecoder
  }
; // End of module exports.