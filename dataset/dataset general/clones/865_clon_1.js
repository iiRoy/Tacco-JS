// This is a Type I clone of the original JavaScript code.
// The purpose is to demonstrate how whitespace and comments can be altered
// without changing the core logic or structure of the program.

// Original comment: TODO: test on large pngs. It’s dubious len calculating below.
// Let's ensure Number prototype methods are correctly defined.

Number.prototype.toUInt = function ( )
{
    // If the number is negative, add 2^32 to convert it to unsigned 32-bit.
    return this < 0 ? this + 4294967296 : this ;
};


Number.prototype.bytes32 = function ( )
{
    // Converts a number into a 4-byte array (big-endian).
    return [
        ( this >>> 24 ) & 0xff ,
        ( this >>> 16 ) & 0xff ,
        ( this >>> 8 ) & 0xff ,
        this & 0xff
    ] ;
};


Number.prototype.bytes16sw = function ( )
{
    // Converts a number into a 2-byte array (little-endian, "swapped").
    return [
        this & 0xff ,
        ( this >>> 8 ) & 0xff
    ] ;
};


Array.prototype.adler32 = function ( start , len )
{
    // Calculates the Adler-32 checksum for a portion of the array.
    // This is a common checksum algorithm used in zlib.

    switch ( arguments.length )
    {
        case 0 :
            // If no arguments, start from the beginning.
            start = 0 ;
            // Fall-through to case 1 to set 'len'.
        case 1 :
            // If 'len' is not provided, calculate it from 'start' to the end of the array.
            len = this.length - start ;
            break ; // Added break for clarity, though fall-through is intended in original.
    }

    var a = 1 ,
        b = 0 ;

    // Iterate through the specified portion of the array.
    for ( var i = 0 ; i < len ; i++ )
    {
        a = ( a + this[ start + i ] ) % 65521 ; // Update 'a' component.
        b = ( b + a ) % 65521 ;                 // Update 'b' component.
    }

    // Combine 'b' and 'a' into a single 32-bit unsigned integer.
    return ( ( b << 16 ) | a ) . toUInt ( ) ;
};


Array.prototype.crc32 = function ( start , len )
{
    // Computes the CRC-32 checksum for a segment of an array.
    // This function lazily initializes a CRC table if it doesn't exist.

    switch ( arguments.length )
    {
        case 0 :
            start = 0 ;
            // Fall-through is implicit here.
        case 1 :
            len = this.length - start ;
            break ;
    }

    var table = arguments.callee.crctable ; // Accessing a static property of the function.

    if ( ! table )
    {
        // If the CRC table hasn't been generated yet, create it.
        table = [ ] ;
        var c_val ; // Renamed 'c' to 'c_val' to avoid conflict with later 'c'.

        for ( var n = 0 ; n < 256 ; n++ )
        {
            c_val = n ;
            for ( var k = 0 ; k < 8 ; k++ )
            {
                // Perform polynomial division.
                c_val = c_val & 1
                    ? 0xedb88320 ^ ( c_val >>> 1 )
                    : c_val >>> 1 ;
            }
            table[ n ] = c_val . toUInt ( ) ; // Store the computed CRC value.
        }
        arguments.callee.crctable = table ; // Cache the generated table for future use.
    }

    var c = 0xffffffff ; // Initial CRC register value.

    // Iterate through the data to compute the CRC.
    for ( var i = 0 ; i < len ; i++ )
    {
        c = table[ ( c ^ this[ start + i ] ) & 0xff ] ^ ( c >>> 8 ) ;
    }

    // Final XOR with 0xffffffff and convert to unsigned.
    return ( c ^ 0xffffffff ) . toUInt ( ) ;
};


String.prototype.toByteStream = function ( )
{
    // Converts a hexadecimal string into an array of byte values.
    // Example: "FF0A" -> [255, 10]

    var s_array = [ ] ; // Initialize an empty array to store byte values.

    // If the string length is odd, pad it with a '0' at the end.
    // Note: This modifies the string in place, which might be unexpected
    // for string primitives, but in JavaScript, `this` inside a prototype
    // method for a primitive might be a wrapper object if not strict mode.
    // For string literals, `this` would be a String object.
    if ( this.length % 2 === 1 )
    {
        this[ this.length ] = "0" ; // Appends '0' to the string's internal representation.
    }

    // Process the string two characters at a time.
    for ( var i = 0 ; i < this.length ; i += 2 )
    {
        // Parse each pair of hex characters into an integer and mask it to 8 bits.
        s_array . push ( parseInt ( this[ i ] + this[ i + 1 ] , 16 ) & 0xff ) ;
    }

    return s_array ; // Return the array of byte values.
};


// ---------- PNG Class Definition ----------

var PNG = function ( opts )
{
    // Constructor for the PNG object.
    // Initializes options and default properties.

    this.options = { } ; // Initialize an empty options object.

    // Merge default options into the instance's options.
    import$ ( this.options , PNG.defaults ) ;

    // Merge any provided options into the instance's options, overriding defaults.
    import$ ( this.options , opts ) ;

    // Initialize core properties of the PNG instance.
    import$ ( this , {
        data    : null , // Holds the raw bitmap data stream.
        chunks  : null , // Stores information about PNG chunks.
        width   : 5    , // Default width of the PNG image.
        height  : 5      // Default height of the PNG image.
    } ) ;
};


// Static properties and default configuration for the PNG class.
import$ ( PNG , {
    defaults : {
        bitDepth       : 0x08 , // Common bit depth, e.g., 8 bits per sample.
        colorType      : 0x03 , // 3 = Indexed color, 6 = Truecolor with alpha.
                                 // This comment explains the colorType field.
        compressMethod : 0x00 , // 0 = deflate/inflate compression.
        filterMethod   : 0x00 , // 0 = Adaptive filtering with five basic filter types.
        interlaceMethod: 0x00   // 0 = No interlacing, 1 = Adam7 interlacing.
    }
} ) ;


// Extend the PNG prototype with instance methods.
import$ ( PNG.prototype , {

    raw : function ( )
    {
        // This method acts as a getter/setter for raw data.
        // If arguments are provided, it calls setRaw; otherwise, it calls getRaw.
        // Note: setRaw is not defined in the provided code, implying it might be external
        // or a placeholder for future implementation.
        arguments.length
            ? this.setRaw.apply ( this , arguments ) // Placeholder for setting raw data.
            : this.getRaw.apply ( this , arguments ) ; // Retrieve raw data.
    } ,


    getRaw : function ( )
    {
        // Retrieves the raw byte stream as a hexadecimal string.
        return this.getStream ( )
            .map ( function ( c )
            {
                // Ensure 'c' is not null/undefined and format as two-digit hex.
                c = c || 0 ;
                return ( c < 15 ? "0" + c.toString ( 16 ) : c.toString ( 16 ) ) ;
            } )
            .join ( '' ) ; // Join all hex strings into a single string.
    } ,


    getStream : function ( )
    {
        // This method generates the complete PNG byte stream as an array of bytes.
        // It constructs various PNG chunks (IHDR, PLTE, tRNS, IDAT, IEND).

        var self = this , // Reference to the current PNG instance.
            o    = self.options ; // Shorthand for options.

        // --- IHDR Chunk (Image Header) ---
        // Contains critical information about the image.
        var s = [
            0x89 , 0x50 , 0x4e , 0x47 , 0x0d , 0x0a , 0x1a , 0x0a , // PNG signature (8 bytes)
            0x00 , 0x00 , 0x00 , 0x0d ,                               // IHDR chunk length (13 bytes)
            0x49 , 0x48 , 0x44 , 0x52                                 // IHDR chunk type
        ] ;

        // Append width and height as 4-byte unsigned integers.
        s = s.concat ( ( +self.width ) . bytes32 ( ) , ( +self.height ) . bytes32 ( ) ) ;

        // Append other IHDR fields: bit depth, color type, compression, filter, interlace methods.
        s = s.concat ( o.bitDepth ,
                       o.colorType ,
                       o.compressMethod ,
                       o.filterMethod ,
                       o.interlaceMethod ) ;

        // Append the CRC-32 checksum for the IHDR chunk.
        // CRC is calculated over chunk type + chunk data. IHDR data starts at index 12.
        s = s.concat ( s.crc32 ( 12 , 17 ) . bytes32 ( ) ) ;


        // --- PLTE Chunk (Palette) ---
        // Required for indexed color images.
        if ( o.colorType === 0x03 )
        {
            var plteStream = self.chunks.PLTE . toByteStream ( ) ;
            s = s.concat ( plteStream.length . bytes32 ( ) ) ; // PLTE chunk length.
            var crcStart = s.length ;                          // Mark the start for CRC calculation.
            s = s.concat ( 0x50 , 0x4c , 0x54 , 0x45 ) ;       // PLTE chunk type.
            s = s.concat ( plteStream ) ;                      // Palette data.
            // Append CRC-32 for PLTE chunk (type + data).
            s = s.concat ( s.crc32 ( crcStart , plteStream.length + 4 ) . bytes32 ( ) ) ;
        }


        // --- tRNS Chunk (Transparency) ---
        // Defines alpha values for palette entries or a single transparent color.
        if ( o.colorType === 0x03 )
        {
            var trnsStream = self.chunks.tRNS . toByteStream ( ) ;
            s = s.concat ( trnsStream.length . bytes32 ( ) ) ; // tRNS chunk length.
            var crcStart = s.length ;                          // Mark the start for CRC calculation.
            s = s.concat ( 0x74 , 0x52 , 0x4e , 0x53 ) ;       // tRNS chunk type.
            s = s.concat ( trnsStream ) ;                      // Transparency data.
            // Append CRC-32 for tRNS chunk (type + data).
            s = s.concat ( s.crc32 ( crcStart , trnsStream.length + 4 ) . bytes32 ( ) ) ;
        }
        else
        {
            // For other color types, tRNS chunk structure is different or not used.
            // Original comment: //IDAT stream
            // This 'else' block implies that the IDAT stream might be handled differently
            // or other chunks might be inserted here based on colorType.
        }


        // --- IDAT Chunk (Image Data) ---
        // Contains the actual pixel data, compressed with zlib.

        var dataStream = self.data . toByteStream ( ) ; // Convert raw data to byte stream.
        var w = self.width ,
            h = self.height ,
            l = ( o.colorType === 0x03 ? 1 : 4 ) ; // Bytes per pixel. TODO: Re-evaluate for other bit depths.

        // Calculate the total length of the compressed data.
        // +1 accounts for the filter type byte at the beginning of each scanline.
        var totalDataLen = h * ( w * l + 1 ) ;

        // Insert filter type byte (0x00 for "None") at the beginning of each scanline.
        for ( var y = 0 ; y < h ; y++ )
        {
            dataStream.splice ( y * ( w * l + 1 ) , 0 , 0x00 ) ;
        }

        // Determine the number of zlib blocks needed.
        // 32768 bytes is a common block size for zlib.
        var numberOfBlocks = Math.ceil ( totalDataLen / 32768 ) ;

        // Append the IDAT chunk length.
        // This length includes dataLen + zlib block headers + zlib header + adler32 checksum.
        s = s.concat ( ( totalDataLen + 5 * numberOfBlocks + 6 ) . bytes32 ( ) ) ;

        var crcStart = s.length ; // Mark the start for IDAT CRC calculation.
        s = s.concat ( 0x49 , 0x44 , 0x41 , 0x54 ) ; // IDAT chunk type.

        // Calculate the length for IDAT CRC, including chunk type and compressed data.
        var crcLen = ( totalDataLen + 5 * numberOfBlocks + 6 + 4 ) ;


        // --- Zlib Compression Header ---
        // Refer to RFC 1950 for zlib format details.
        // http://www.w3.org/TR/2003/REC-PNG-20031110/#10CompressionCM0
        // http://tools.ietf.org/html/rfc1950#page-4

        s = s.concat ( 0x78 , 0x01 ) ; // Zlib header: CM=8 (deflate), CINFO=7 (32KB window), FLEVEL=0 (fastest).
                                       // 0x7801 indicates CM=8 (deflate), CINFO=7 (32k window), FCHECK=1 (no dict, fastest compression).

        // Original commented line for fixed block type:
        // s = s.concat(0x01, (0x02).bytes16sw(), (~0x02).bytes16sw(), dataStream) //01 - end-block header, len, nlen, rawdata

        // Iterate through blocks for uncompressed (raw) deflate data.
        for ( var i = 0 ; i < numberOfBlocks ; i++ )
        {
            var blockLen = Math.min ( 32768 , totalDataLen - ( i * 32768 ) ) ; // Determine current block length.

            // Set block header: 0x01 for last block, 0x00 for non-last block (uncompressed).
            s.push ( i === ( numberOfBlocks - 1 ) ? 0x01 : 0x00 ) ;

            s = s.concat ( blockLen . bytes16sw ( ) ) ;      // Append block length (little-endian).
            s = s.concat ( ( ~blockLen ) . bytes16sw ( ) ) ; // Append one's complement of block length.

            // Extract the slice of image data for the current block.
            var blockData = dataStream.slice ( i * 32768 , i * 32768 + blockLen ) ;
            s = s.concat ( blockData ) ; // Append the raw block data.
        }

        // Append the Adler-32 checksum of the uncompressed data.
        s = s.concat ( dataStream . adler32 ( ) . bytes32 ( ) ) ;

        // Append the CRC-32 checksum for the IDAT chunk.
        s = s.concat ( s.crc32 ( crcStart , crcLen ) . bytes32 ( ) ) ;


        // --- IEND Chunk (Image End) ---
        // Marks the end of the PNG stream.

        s = s.concat ( 0x00 , 0x00 , 0x00 , 0x00 , // IEND chunk length (0 bytes)
                       0x49 , 0x45 , 0x4e , 0x44 ) ; // IEND chunk type.

        // Append CRC-32 for IEND chunk (type + data, data is 0 length here).
        // The CRC is calculated over the last 4 bytes (IEND chunk type).
        s = s.concat ( s.crc32 ( s.length - 4 , 4 ) . bytes32 ( ) ) ;

        return s ; // Return the complete PNG byte stream.
    } ,


    set : function ( settings )
    {
        // Merges provided settings into the current PNG instance properties.
        import$ ( this , settings ) ;
    } ,


    toDataURL : function ( )
    {
        // Generates a data URI for the PNG image.
        var self = this ,
            o    = self.options ; // Options are not directly used here but kept for consistency.

        var dataURI = "data:image/png;base64," +
                      btoa ( self.getStream ( )
                                .map ( function ( c )
                                {
                                    // Convert each byte to its character representation.
                                    return String.fromCharCode ( c ) ;
                                } )
                                .join ( '' ) // Join characters to form a binary string.
                      ) ;

        return dataURI ; // Return the generated data URI.
    }
} ) ;


// --- Utility Functions (JS Cribbles) ---

function import$ ( a , b )
{
    // A simple utility function to copy properties from object 'b' to object 'a'.
    // Similar to extend or assign in other libraries.

    for ( var key in b )
    {
        // Ensure the property belongs to 'b' itself, not its prototype chain.
        // (Though for simple objects like defaults, this check might be omitted in practice).
        a[ key ] = b[ key ] ;
    }
    return a ; // Return the modified object 'a'.
}


// Determine the global object, which can be 'window' in browsers or 'global' in Node.js.
var global = ( 1 , eval ) ( 'this' ) ;

// Expose the PNG constructor globally.
global.PNG = PNG ;

// Save a reference to the original btoa function if it exists.
var btoaDef = global.btoa ;

// Override or polyfill the global btoa function to handle Node.js environments.
global.btoa = function ( string )
{
    if ( btoaDef )
    {
        // If a native btoa exists, use it.
        return btoaDef ( string ) ;
    }
    else
    {
        // If no native btoa (e.g., in Node.js), use Buffer to perform base64 encoding.
        // This requires the 'Buffer' global to be available, typically in Node.js.
        return new Buffer ( string , 'binary' ) . toString ( 'base64' ) ;
    }
} ;