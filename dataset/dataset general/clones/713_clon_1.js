window.PNGDrive = function ( image , bitsPerColorComponent )
{
    // Initialize version information for the PNGDrive format.
    this.VERSION_MAJOR = 1 ;
    this.VERSION_MINOR = 0 ;


    // Array to hold metadata and content for files managed by this instance.
    this.files = [ ] ;

    // Raw Uint8Array buffer to store the extracted or embedded binary data.
    this.raw = new Uint8Array ( 0 ) ;

    // If an image is provided during construction, attempt to decode it immediately.
    // The 'typeof image !== "undefined"' check ensures an image object is present.
    if ( typeof image !== "undefined" )
    {
        // Call the decode method to process the provided image.
        this.decode ( image , bitsPerColorComponent ) ;
    }
} ; // End of PNGDrive constructor function.


// Define methods for the PNGDrive prototype object.
window.PNGDrive.prototype = {

    /**
     * Adds a file reference to the internal list of files.
     * This file will be processed later, typically during the encoding phase.
     * @param {File} file - The File object to add.
     */
    addFile : function ( file )
    {
        this.files.push ( { name : file.name , type : file.type , fileRef : file } ) ;
    } , // End of addFile method.

    /**
     * Adds a text file, converting its content to a UTF-8 Uint8Array.
     * @param {string} text - The text content of the file.
     * @param {string} name - The name of the file.
     * @param {string} type - The MIME type of the file.
     */
    addTextFile : function ( text , name , type )
    {
        // Encode the text content to UTF-8 before storing.
        this.files.push ( { name : name , type : type , content : this.utf8Encode ( text ) } ) ;
    } , // End of addTextFile method.

    /**
     * Adds a binary file provided as a Uint8Array.
     * @param {Uint8Array} uint8Array - The binary content of the file.
     * @param {string} name - The name of the file.
     * @param {string} type - The MIME type of the file.
     */
    addBinaryFile : function ( uint8Array , name , type )
    {
        // Store the Uint8Array content directly.
        this.files.push ( { name : name , type : type , content : uint8Array } ) ;
    } , // End of addBinaryFile method.

    /**
     * Clears all files currently managed by this PNGDrive instance.
     */
    removeAll : function ( )
    {
        // Reset the files array to an empty state.
        this.files = [ ] ;
    } , // End of removeAll method.

    /**
     * Removes a file at a specific index from the internal list.
     * @param {number} index - The zero-based index of the file to remove.
     */
    removeFileAt : function ( index )
    {
        // Check if the provided index is within the valid range of files.
        if ( index >= 0 && index < this.files.length )
        {
            // Use splice to remove one element at the given index.
            this.files.splice ( index , 1 ) ;
        }
    } , // End of removeFileAt method.

    /**
     * Removes the first file found with a matching name.
     * @param {string} name - The name of the file to remove.
     */
    removeFileByName : function ( name )
    {
        // Iterate through all stored files to find a match by name.
        for ( var i = 0 ; i < this.files.length ; i ++ )
        {
            // If the file name matches, remove it and exit the loop.
            if ( this.files [ i ] .name == name )
            {
                this.files.splice ( i , 1 ) ; // Remove the file.
                break ; // Stop after removing the first match.
            }
        }
    } , // End of removeFileByName method.

    /**
     * Returns the total number of files currently stored.
     * @returns {number} The count of files.
     */
    getFileCount : function ( )
    {
        return this.files.length ;
    } , // End of getFileCount method.

    /**
     * Retrieves a file object by its index.
     * @param {number} index - The zero-based index of the file.
     * @returns {object|null} The file object if found, otherwise null.
     */
    getFileAt : function ( index )
    {
        // Use a ternary operator to return the file if the index is valid, or null otherwise.
        return ( index >= 0 && index < this.files.length ) ? this.files [ index ] : null ;
    } , // End of getFileAt method.

    /**
     * Retrieves the first file object that matches the given name.
     * @param {string} name - The name of the file to retrieve.
     * @returns {object|null} The file object if found, otherwise null.
     */
    getFileByName : function ( name )
    {
        // Iterate through the files array.
        for ( var i = 0 ; i < this.files.length ; i ++ )
        {
            // If a file's name matches, return that file object.
            if ( this.files [ i ] .name == name )
            {
                return this.files [ i ] ;
            }
        }

        // If no file with the given name is found, return null.
        return null ;
    } , // End of getFileByName method.

    /**
     * Decodes an image, extracting embedded data and file metadata.
     * This method reads pixel data from an image and reconstructs the hidden files.
     * @param {HTMLImageElement|HTMLCanvasElement} image - The source image to decode.
     * @param {number} [bitsPerColorComponent=8] - Number of bits used per color channel (R, G, B) for data storage.
     * @returns {PNGDrive} The current PNGDrive instance for chaining.
     */
    decode : function ( image , bitsPerColorComponent )
    {
        // Default to 8 bits per color component if not specified.
        if ( typeof bitsPerColorComponent == "undefined" )
        {
            bitsPerColorComponent = 8 ;
        }

        // Create an off-screen canvas to draw the image and extract pixel data.
        var canvas = document.createElement ( 'canvas' ) ;
        var ctx = canvas.getContext ( '2d' ) ;

        // Set canvas dimensions to match the image.
        canvas.width = image.width ;
        canvas.height = image.height ;

        // Draw the source image onto the canvas.
        ctx.drawImage ( image , 0 , 0 ) ;

        // Get the raw pixel data from the canvas.
        // img.data is a Uint8ClampedArray representing RGBA values.
        var img = ctx.getImageData ( 0 , 0 , image.width , image.height ) ;
        var imgData = img.data ;
        var length = imgData.length ; // Total number of bytes in imgData (width * height * 4).

        // Initialize the raw buffer where extracted data will be stored.
        // It's sized for R, G, B components only (alpha is ignored or used for data presence).
        var buf = this.raw = new Uint8Array ( image.width * image.height * 3 ) ;

        var i = 0 ; // Index for iterating through imgData (source pixel data).

        // --- Data Extraction Logic ---
        // The extraction process depends on the 'bitsPerColorComponent' setting.

        if ( bitsPerColorComponent == 8 )
        {
            // Case 1: 8 bits per color component (direct byte transfer).
            var j = 0 ; // Index for writing into 'buf' (destination raw data).

            while ( i < length )
            {
                // Check if the alpha channel indicates data presence (0xff = fully opaque).
                // Only opaque pixels are assumed to contain data.
                if ( imgData [ i + 3 ] == 0xff )
                {
                    // Copy R, G, B components directly to the buffer.
                    buf [ j ++ ] = imgData [ i ++ ] ; // Red
                    buf [ j ++ ] = imgData [ i ++ ] ; // Green
                    buf [ j ++ ] = imgData [ i ++ ] ; // Blue
                    i ++ ; // Skip the alpha component.
                }
                else
                {
                    // If pixel is transparent, it does not contain data. Skip all 4 components.
                    i += 4 ;
                }
            }
        }
        else
        {
            // Case 2: Less than 8 bits per color component (bit-level extraction using PNGDriveBitStream).
            var bitStream = new PNGDriveBitStream ( buf ) ; // Create a bit stream writer for the buffer.

            while ( i < length )
            {
                // Similar to the 8-bit case, check for opaque pixels.
                if ( imgData [ i + 3 ] == 0xff )
                {
                    // Extract 'bitsPerColorComponent' bits from each R, G, B channel.
                    bitStream.writeBits ( bitsPerColorComponent , imgData [ i ++ ] ) ; // Red
                    bitStream.writeBits ( bitsPerColorComponent , imgData [ i ++ ] ) ; // Green
                    bitStream.writeBits ( bitsPerColorComponent , imgData [ i ++ ] ) ; // Blue
                    i ++ ; // Skip alpha.
                }
                else
                {
                    // Skip transparent pixels.
                    i += 4 ;
                }
            }
        }

        // --- Metadata and File Reconstruction Logic ---
        // Check for the magic bytes (0xDADA) at the beginning of the raw buffer.
        // These bytes indicate the presence of embedded file directory information.
        if ( buf [ 0 ] == 0xda && buf [ 1 ] == 0xda )
        {
            // Extract directory size (32-bit little-endian integer) from bytes 4-7.
            var dirSize = buf [ 4 ] | buf [ 5 ] << 8 | buf [ 6 ] << 16 | buf [ 7 ] << 24 ;

            // Extract the directory buffer itself.
            var dirBuf = buf.subarray ( 8 , 8 + dirSize ) ;

            // Decode the UTF-8 directory buffer and parse it as JSON.
            // This 'dir' object contains metadata for all embedded files.
            var dir = JSON.parse ( this.utf8Decode ( dirBuf ) ) ;

            // Calculate the starting position of file content within the raw buffer.
            var pos = 8 + dirSize ;

            // Re-initialize the files array for the decoded content.
            this.files = [ ] ;

            // Iterate through each file entry in the decoded directory.
            for ( i = 0 ; i < dir.files.length ; i ++ )
            {
                var file = dir.files [ i ] ; // Get current file metadata.

                // Create a new Uint8Array for the current file's content.
                var fileBuf = new Uint8Array ( file.size ) ;

                // Copy the file's binary content from the main raw buffer.
                fileBuf.set ( buf.subarray ( pos , pos + file.size ) ) ;

                // Advance the position pointer for the next file.
                pos += file.size ;

                // Add the reconstructed file to the internal files list.
                this.files.push ( { name : file.name , type : file.type , content : fileBuf } ) ;
            }
        }

        // Return the instance for method chaining.
        return this ;
    } , // End of decode method.

    /**
     * Encodes the stored files into a single raw Uint8Array buffer.
     * This buffer can then be embedded into an image.
     * The process handles asynchronous loading of File objects if present.
     * @param {function} [callback] - An optional callback function to execute once encoding is complete.
     */
    encode : function ( callback )
    {
        var that = this ; // Store a reference to 'this' for use within nested functions.

        // Immediately Invoked Function Expression (IIFE) to manage asynchronous file loading
        // and then trigger the serialization process.
        ( function ( serialize )
        {
            var numFilesToLoad = 0 ; // Counter for files that need to be loaded from fileRef.
            var fileCount = that.getFileCount ( ) ; // Total number of files in the instance.

            // First pass: Check for and load any files that are still File objects (fileRef).
            for ( var i = 0 ; i < fileCount ; i ++ )
            {
                var file = that.files [ i ] ;

                // If a file has a 'fileRef' property, it means its content needs to be loaded.
                if ( file.fileRef )
                {
                    numFilesToLoad ++ ; // Increment the counter for pending loads.

                    var reader = new FileReader ( ) ; // Create a new FileReader instance.

                    // Define the onload event handler for the FileReader.
                    // This uses a closure to capture the 'file' object for the specific reader.
                    reader.onload = ( function ( f )
                    {
                        return function ( event )
                        {
                            // Once loaded, convert the result to a Uint8Array and store it as 'content'.
                            f.content = new Uint8Array ( event.target.result ) ;
                            delete f.fileRef ; // Remove the fileRef as content is now available.

                            // Decrement the counter and check if all files are loaded.
                            // The condition `i == fileCount` is a bit of a race condition check,
                            // but in this context, it might be intended to ensure the loop finished.
                            // A simpler approach would be `numFilesToLoad === 0` after all readers are started.
                            if ( -- numFilesToLoad == 0 && i == fileCount )
                            {
                                numFilesToLoad = -1 ; // Prevent re-execution if somehow triggered again.
                                serialize.call ( that ) ; // Call the main serialization function.
                            }
                        } ;
                    } ) ( file ) ; // Pass the current 'file' into the closure.

                    // Start reading the file's content as an ArrayBuffer.
                    reader.readAsArrayBuffer ( file.fileRef ) ;
                }
            }

            // If there were no files to load asynchronously, proceed directly to serialization.
            if ( numFilesToLoad == 0 )
            {
                serialize.call ( that ) ; // Execute the serialization function immediately.
            }

        } ) ( function ( )
        {
            // This is the 'serialize' function, executed after all files are ready.
            var fileCount = this.getFileCount ( ) ;

            if ( fileCount > 0 )
            {
                var j , pos , file ;
                var dir = { files : [ ] } ; // Object to store directory metadata.
                var payLoadSize = 0 ; // Total size of all file contents in bytes.

                // Calculate total payload size and populate directory metadata.
                for ( j = 0 ; j < fileCount ; j ++ )
                {
                    file = this.files [ j ] ;
                    payLoadSize += file.content.byteLength ;
                    dir.files.push ( { name : file.name , size : file.content.byteLength , type : file.type } ) ;
                }

                // Encode the directory object into a UTF-8 Uint8Array.
                var dirBuf = this.utf8Encode ( JSON.stringify ( dir ) ) ;
                var dirSize = dirBuf.byteLength ; // Size of the serialized directory.

                // Calculate the total size required for the raw buffer:
                // 8 bytes for header (magic, version, dir size) + directory size + payload size.
                var totalSize = 8 + dirSize + payLoadSize ;

                // Initialize the main raw buffer for all data.
                var buf = this.raw = new Uint8Array ( totalSize ) ;

                // --- Write Header Information ---

                // Magic bytes (0xDADA) to identify PNGDrive format.
                buf [ 0 ] = buf [ 1 ] = 0xda ;

                // Version information (major and minor).
                buf [ 2 ] = this.VERSION_MAJOR ;
                buf [ 3 ] = this.VERSION_MINOR ;

                // Directory size (32-bit little-endian).
                buf [ 4 ] = dirSize & 0xff ;
                buf [ 5 ] = ( dirSize >> 8 ) & 0xff ;
                buf [ 6 ] = ( dirSize >> 16 ) & 0xff ;
                buf [ 7 ] = ( dirSize >> 24 ) & 0xff ;

                // --- Write Directory and File Contents ---

                // Write the serialized directory buffer starting at offset 8.
                buf.set ( dirBuf , 8 ) ;

                // Write the content of each file sequentially after the directory.
                // 'pos' tracks the current write position in the buffer.
                for ( j = 0 , pos = 8 + dirBuf.byteLength ; j < fileCount ; j ++ )
                {
                    file = this.files [ j ] ;
                    buf.set ( file.content , pos ) ; // Copy file content.
                    pos += file.content.byteLength ; // Advance position.
                }
            }
            else
            {
                // If there are no files, the raw buffer is empty.
                this.raw = new Uint8Array ( 0 ) ;
            }

            // Execute the optional callback if provided, in the context of 'this'.
            if ( callback )
            {
                callback.call ( this ) ;
            }
        } ) ; // End of the IIFE and its 'serialize' function argument.
    } , // End of encode method.

    /**
     * Creates a new HTMLCanvasElement with the raw data embedded into its pixels.
     * This method can either create a new image of a calculated size or embed data
     * into an existing image.
     * @param {HTMLImageElement|HTMLCanvasElement} [targetImage] - An optional image to use as a base.
     * @param {number} [bitsPerColorComponent=8] - Number of bits to use per color channel for embedding.
     * @returns {HTMLCanvasElement} The canvas element with the embedded data.
     */
    createImage : function ( targetImage , bitsPerColorComponent )
    {
        var canvas = document.createElement ( 'canvas' ) ;
        var ctx = canvas.getContext ( '2d' ) ;

        // Determine canvas dimensions and initial content.
        if ( typeof targetImage == "undefined" )
        {
            // If no target image is provided, create a square canvas just large enough
            // to hold all the raw data (assuming 3 bytes per pixel: R, G, B).
            bitsPerColorComponent = 8 ; // Default to 8 bits if creating from scratch.
            var px = Math.ceil ( Math.sqrt ( this.raw.byteLength / 3 ) ) ; // Calculate side length.
            canvas.width = px ;
            canvas.height = px ;
            ctx.fillRect ( 0 , 0 , px , px ) ; // Fill with black (or default transparent black).
        }
        else
        {
            // If a target image is provided, use its dimensions and draw it onto the canvas.
            if ( typeof bitsPerColorComponent == "undefined" )
            {
                bitsPerColorComponent = 8 ; // Default to 8 bits if not specified for target image.
            }
            canvas.width = targetImage.width ;
            canvas.height = targetImage.height ;
            ctx.drawImage ( targetImage , 0 , 0 ) ; // Draw the base image.
        }

        // Get the pixel data from the canvas for modification.
        var img = ctx.getImageData ( 0 , 0 , canvas.width , canvas.height ) ;
        var imgData = img.data ; // This is a Uint8ClampedArray (RGBA).
        var imgLength = imgData.length ; // Total bytes (width * height * 4).

        var i = 0 ; // Index for iterating through imgData (destination pixel data).

        // --- Data Embedding Logic ---
        // The embedding process depends on the 'bitsPerColorComponent' setting.

        if ( bitsPerColorComponent == 8 )
        {
            // Case 1: 8 bits per color component (direct byte transfer).
            var j = 0 ; // Index for reading from 'this.raw' (source raw data).

            while ( i < imgLength )
            {
                // Only embed data into opaque pixels (alpha == 0xff).
                if ( imgData [ i + 3 ] == 0xff )
                {
                    // Embed R, G, B components directly from the raw data.
                    imgData [ i ++ ] = this.raw [ j ++ ] ; // Red
                    imgData [ i ++ ] = this.raw [ j ++ ] ; // Green
                    imgData [ i ++ ] = this.raw [ j ++ ] ; // Blue
                    i ++ ; // Skip the alpha component.
                }
                else
                {
                    // If pixel is transparent, skip all 4 components; no data is embedded.
                    i += 4 ;
                }
            }
        }
        else
        {
            // Case 2: Less than 8 bits per color component (bit-level embedding using PNGDriveBitStream).
            var bitStream = new PNGDriveBitStream ( this.raw ) ; // Create a bit stream reader for the raw data.

            // Calculate a bitmask to preserve the higher-order bits of the original pixel value.
            // This mask will be used to clear the lower bits where new data will be embedded.
            var bitMask = 0xff ^ ( 0xff >>> ( 8 - bitsPerColorComponent ) ) ;

            while ( i < imgLength )
            {
                // Embed data only into opaque pixels.
                if ( imgData [ i + 3 ] == 0xff )
                {
                    // Combine original pixel's higher bits with new data from bitStream.
                    imgData [ i ] = ( imgData [ i ++ ] & bitMask ) | bitStream.readBits ( bitsPerColorComponent ) ; // Red
                    imgData [ i ] = ( imgData [ i ++ ] & bitMask ) | bitStream.readBits ( bitsPerColorComponent ) ; // Green
                    imgData [ i ] = ( imgData [ i ++ ] & bitMask ) | bitStream.readBits ( bitsPerColorComponent ) ; // Blue
                    i ++ ; // Skip alpha.
                }
                else
                {
                    // Skip transparent pixels.
                    i += 4 ;
                }
            }
        }

        // Put the modified pixel data back onto the canvas.
        ctx.putImageData ( img , 0 , 0 ) ;

        // Return the canvas element containing the embedded data.
        return canvas ;
    } , // End of createImage method.

    /**
     * Calculates the maximum number of bits that can be embedded into a given image.
     * This capacity is based on the image's dimensions, opaque pixels, and the specified bits per color component.
     * @param {HTMLImageElement|HTMLCanvasElement} targetImage - The image to analyze for capacity.
     * @param {number} [bitsPerColorComponent=8] - The number of bits assumed to be embeddable per color channel.
     * @returns {number} The total number of bits that can be stored in the image.
     */
    computeImageCapacity : function ( targetImage , bitsPerColorComponent )
    {
        // Default to 8 bits per color component if not provided.
        if ( typeof bitsPerColorComponent == "undefined" )
        {
            bitsPerColorComponent = 8 ;
        }

        // Create a temporary canvas to get pixel data.
        var canvas = document.createElement ( 'canvas' ) ;
        var ctx = canvas.getContext ( '2d' ) ;

        // Set canvas dimensions and draw the target image.
        canvas.width = targetImage.width ;
        canvas.height = targetImage.height ;
        ctx.drawImage ( targetImage , 0 , 0 ) ;

        // Get the pixel data.
        var img = ctx.getImageData ( 0 , 0 , canvas.width , canvas.height ) ;
        var imgData = img.data ; // RGBA pixel array.
        var imgLength = imgData.length ; // Total bytes (width * height * 4).

        var i = 0 ; // Loop counter for pixel data.
        var numBits = 0 ; // Accumulator for total embeddable bits.

        // Calculate bits per pixel (R, G, B channels combined).
        var numBitsPerPixel = bitsPerColorComponent * 3 ;

        // Iterate through pixel data to count opaque pixels.
        while ( i < imgLength )
        {
            // Only opaque pixels (alpha channel 0xff) are considered usable for embedding.
            if ( imgData [ i + 3 ] == 0xff )
            {
                numBits += numBitsPerPixel ; // Add capacity for this pixel.
            }
            i += 4 ; // Move to the next pixel (skip R, G, B, A).
        }

        // Return the total calculated bit capacity.
        return numBits ;
    } , // End of computeImageCapacity method.

    /**
     * Encodes a JavaScript string into a UTF-8 compliant Uint8Array.
     * This implementation is adapted from common web toolkit and StackOverflow examples,
     * specifically modified to output a typed array.
     * @see http://www.webtoolkit.info/javascript-base64.html
     * @see http://stackoverflow.com/questions/246801/how-can-you-encode-to-base64-using-javascript/6836708
     * @param {string} string - The input string to encode.
     * @returns {Uint8Array} A Uint8Array representing the UTF-8 encoded string.
     */
    utf8Encode : function ( string )
    {
        var tmparr = [ ] ; // Temporary array to hold byte values.
        var len = string.length ; // Length of the input string.

        // Iterate through each character of the string.
        for ( var n = 0 ; n < len ; n ++ )
        {
            var c = string.charCodeAt ( n ) ; // Get the Unicode code point of the character.

            if ( c < 128 )
            {
                // 1-byte sequence (ASCII characters).
                tmparr.push ( c ) ;
            }
            else if ( ( c > 127 ) && ( c < 2048 ) )
            {
                // 2-byte sequence.
                tmparr.push ( ( c >> 6 ) | 192 ) ;
                tmparr.push ( ( c & 63 ) | 128 ) ;
            }
            else
            {
                // 3-byte sequence.
                tmparr.push ( ( c >> 12 ) | 224 ) ;
                tmparr.push ( ( ( c >> 6 ) & 63 ) | 128 ) ;
                tmparr.push ( ( c & 63 ) | 128 ) ;
            }
        }

        // Convert the temporary array of bytes into a Uint8Array.
        return new Uint8Array ( tmparr ) ;
    } , // End of utf8Encode method.

    /**
     * Decodes a UTF-8 compliant Uint8Array back into a JavaScript string.
     * This implementation is adapted from common web toolkit and StackOverflow examples,
     * specifically modified to accept a typed array.
     * @see http://www.webtoolkit.info/javascript-base64.html
     * @see http://stackoverflow.com/questions/246801/how-can-you-encode-to-base64-using-javascript/6836708
     * @param {Uint8Array} uint8array - The input Uint8Array to decode.
     * @returns {string} The decoded JavaScript string.
     */
    utf8Decode : function ( uint8array )
    {
        var len = uint8array.byteLength ; // Length of the input byte array.
        var string = "" ; // Accumulator for the decoded string.
        var i = 0 ; // Index for iterating through the byte array.

        // Loop through the byte array until all bytes are processed.
        while ( i < len )
        {
            var c = uint8array [ i ] ; // Get the current byte.

            if ( c < 128 )
            {
                // 1-byte sequence (ASCII).
                string += String.fromCharCode ( c ) ;
                i ++ ;
            }
            else if ( ( c > 191 ) && ( c < 224 ) && ( i + 1 < len ) )
            {
                // 2-byte sequence.
                string += String.fromCharCode ( ( ( c & 31 ) << 6 ) | ( uint8array [ i + 1 ] & 63 ) ) ;
                i += 2 ;
            }
            else if ( i + 2 < len )
            {
                // 3-byte sequence.
                string += String.fromCharCode ( ( ( c & 15 ) << 12 ) | ( ( uint8array [ i + 1 ] & 63 ) << 6 ) | ( uint8array [ i + 2 ] & 63 ) ) ;
                i += 3 ;
            }
            // Note: 4-byte sequences (for supplementary planes) are not handled by this specific implementation.
            // For full UTF-8 compliance, more logic would be needed for surrogates.
        }

        return string ;
    } // No comma here, as it's the last method in the prototype object.

} ; // End of window.PNGDrive.prototype object definition.


/**
 * Defines a utility class for reading and writing data at the bit level within a Uint8Array.
 * This is crucial for embedding/extracting data when less than 8 bits per color component are used.
 * @param {Uint8Array} uint8array - The underlying Uint8Array buffer to operate on.
 */
window.PNGDriveBitStream = function ( uint8array )
{
    // The Uint8Array buffer that this bit stream operates on.
    this.a = uint8array ;

    // Current byte position within the array.
    this.position = 0 ;

    // Number of bits remaining in the current byte at 'position' that have not been written/read.
    // When writing, this indicates how many bits are free. When reading, how many are left.
    this.bitsPending = 0 ;
} ; // End of PNGDriveBitStream constructor.


// Define methods for the PNGDriveBitStream prototype object.
window.PNGDriveBitStream.prototype = {

    /**
     * Writes a specified number of bits from a value into the underlying Uint8Array.
     * This method handles partial bytes and spans across byte boundaries.
     * @param {number} bits - The number of bits to write (1-32).
     * @param {number} value - The integer value from which to extract bits.
     */
    writeBits : function ( bits , value )
    {
        // If no bits are to be written, simply return.
        if ( bits == 0 )
        {
            return ;
        }

        // Mask the value to ensure only the relevant 'bits' are considered.
        // This effectively clears any higher-order bits beyond what's specified.
        value &= ( 0xffffffff >>> ( 32 - bits ) ) ;

        var bitsConsumed ; // Tracks how many bits are written in the current step.

        // Check if there are pending bits in the current byte (i.e., it's a partial byte).
        if ( this.bitsPending > 0 )
        {
            // Case A: The current byte has enough space for all 'bits'.
            if ( this.bitsPending > bits )
            {
                // Shift the value to align with the available space and OR it into the current byte.
                this.a [ this.position - 1 ] |= value << ( this.bitsPending - bits ) ;
                bitsConsumed = bits ;
                this.bitsPending -= bits ;
            }
            // Case B: The current byte has exactly enough space for all 'bits'.
            else if ( this.bitsPending == bits )
            {
                // OR the value directly into the current byte.
                this.a [ this.position - 1 ] |= value ;
                bitsConsumed = bits ;
                this.bitsPending = 0 ; // Current byte is now full.
            }
            // Case C: The current byte has some space, but not enough for all 'bits'.
            else
            {
                // Fill the remaining space in the current byte with the highest bits of 'value'.
                this.a [ this.position - 1 ] |= value >> ( bits - this.bitsPending ) ;
                bitsConsumed = this.bitsPending ; // All pending bits in this byte are now consumed.
                this.bitsPending = 0 ; // Current byte is now full.
            }
        }
        else
        {
            // No pending bits, start a new byte.
            // Determine how many bits to write into this new byte (max 8).
            bitsConsumed = Math.min ( 8 , bits ) ;
            this.bitsPending = 8 - bitsConsumed ; // Calculate remaining space in the new byte.

            // Write the highest 'bitsConsumed' bits of 'value' into the new byte.
            // Then shift them to the left to align with the 'bitsPending' space.
            this.a [ this.position ++ ] = ( value >> ( bits - bitsConsumed ) ) << this.bitsPending ;
        }

        // Update the total number of bits remaining to be written.
        bits -= bitsConsumed ;

        // If there are still bits left, recursively call writeBits to write them.
        if ( bits > 0 )
        {
            this.writeBits ( bits , value ) ;
        }
    } , // End of writeBits method.

    /**
     * Reads a specified number of bits from the underlying Uint8Array.
     * This method handles reading across byte boundaries and from partial bytes.
     * @param {number} bits - The number of bits to read.
     * @param {number} [bitBuffer=0] - An internal buffer used for recursive calls; typically not set by caller.
     * @returns {number} The integer value constructed from the read bits.
     */
    readBits : function ( bits , bitBuffer )
    {
        // Initialize bitBuffer to 0 if it's the first call (not provided).
        if ( typeof bitBuffer == "undefined" )
        {
            bitBuffer = 0 ;
        }

        // If no bits are requested, return the current buffer.
        if ( bits == 0 )
        {
            return bitBuffer ;
        }

        var partial ; // Stores the bits read in the current step.
        var bitsConsumed ; // Tracks how many bits are read in the current step.

        // Check if there are pending bits in the current byte (i.e., it's a partial byte).
        if ( this.bitsPending > 0 )
        {
            // Extract the relevant pending bits from the byte at 'position - 1'.
            // The mask (0xff >> (8 - this.bitsPending)) isolates the pending bits.
            var b = this.a [ this.position - 1 ] & ( 0xff >> ( 8 - this.bitsPending ) ) ;

            // Determine how many bits to consume from the pending bits.
            bitsConsumed = Math.min ( this.bitsPending , bits ) ;
            this.bitsPending -= bitsConsumed ; // Update remaining pending bits.

            // Extract the 'bitsConsumed' highest bits from 'b'.
            partial = b >> this.bitsPending ;
        }
        else
        {
            // No pending bits, read from a new byte.
            bitsConsumed = Math.min ( 8 , bits ) ; // Read up to 8 bits.
            this.bitsPending = 8 - bitsConsumed ; // Update pending bits for the new byte.

            // Read the highest 'bitsConsumed' bits from the current byte and advance position.
            partial = this.a [ this.position ++ ] >> this.bitsPending ;
        }

        // Update the total number of bits remaining to be read.
        bits -= bitsConsumed ;

        // Append the 'partial' bits to the 'bitBuffer'.
        // Shift existing buffer left and OR in the new bits.
        bitBuffer = ( bitBuffer << bitsConsumed ) | partial ;

        // If there are still bits to read, recursively call readBits. Otherwise, return the buffer.
        return ( bits > 0 ) ? this.readBits ( bits , bitBuffer ) : bitBuffer ;
    } , // End of readBits method.

    /**
     * Sets the bit stream's read/write position to a specific bit offset.
     * This allows jumping to any point within the underlying Uint8Array.
     * @param {number} bitPos - The target bit position from the start of the array.
     */
    seekTo : function ( bitPos )
    {
        // Calculate the byte position by dividing bitPos by 8 and taking the integer part.
        this.position = ( bitPos / 8 ) | 0 ; // Using bitwise OR 0 for floor division.

        // Calculate the number of bits into the current byte.
        this.bitsPending = bitPos % 8 ;

        // If there are partial bits within the byte, adjust 'bitsPending' to represent
        // the remaining *unprocessed* bits in that byte, and advance 'position' to the next byte
        // to prepare for the *next* read/write operation from a full byte.
        if ( this.bitsPending > 0 )
        {
            this.bitsPending = 8 - this.bitsPending ; // Transform 'bits into byte' to 'bits remaining in byte'.
            this.position ++ ; // Advance position to point *after* the byte being partially consumed.
        }
    } // No comma here, as it's the last method in the prototype object.

} ; // End of window.PNGDriveBitStream.prototype object definition.