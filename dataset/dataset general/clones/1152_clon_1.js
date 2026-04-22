var fs = require('fs') ;

const // This section defines various bitmasks used for parsing message codes.
    // ISC_MASK   = 0x14000000, // Defines the code as a valid ISC code - commented out in original
    FAC_MASK   = 0x00FF0000, // Specifies the facility where the code is located, e.g., Firebird/GDS
    CODE_MASK  = 0x0000FFFF, // Specifies the unique code within the message file for a given facility
    CLASS_MASK = 0xF0000000; // Defines the class of the code: warning, error, info, or other status.

var msgNumber = exports.msgNumber = function( facility,  code ) {
    // Calculates a combined message number from a facility and code.
    // This is typically used to create a unique identifier for a message.
    return ( facility * 10000 + code ) ;
};

var getCode = exports.getCode = function( code ) {
    // Extracts the specific message code part from a combined status code.
    // It uses a bitwise AND operation with CODE_MASK to isolate the lower 16 bits.
    return ( code & CODE_MASK ) ;
};

var getFacility = exports.getFacility =  function( code ) {
    // Extracts the facility part from a combined status code.
    // It uses a bitwise AND with FAC_MASK and then shifts the result 16 bits to the right.
    return ( code & FAC_MASK ) >> 16 ;
};

exports.getClass = function( code ) {
    // Extracts the class (severity/type) of the message from a combined status code.
    // It uses a bitwise AND with CLASS_MASK and then shifts the result 30 bits to the right.
    return ( code & CLASS_MASK ) >> 30 ;
};


exports.lookupMessages = function( status, callback ) {

    // Declare internal variables used across the message lookup process.
    var handle        ; // File handle for the message file.
    var bucket_size   ; // Size of each data bucket in the message file.
    var top_tree      ; // Starting offset for the top level of the message tree index.
    var levels        ; // Number of levels in the message tree index.
    var buffer        ; // A buffer used for reading data from the file.


    /**
     * Initiates the lookup process for a single message item.
     * @param {object} item - An object containing gdscode and optional params.
     * @param {function} callback - The callback function to call with the looked-up message string.
     */
    function lookup( item, callback ) {

        // Calculate the target message code by combining facility and code from the item's gdscode.
        var code = msgNumber( getFacility( item.gdscode ), getCode( item.gdscode ) ) ;


        /**
         * Recursively reads the index tree to find the correct message bucket.
         * @param {number} stackSize - The current depth in the index tree.
         * @param {number} position - The file offset to read the current index bucket from.
         */
        function readIndex( stackSize, position ) {

            /**
             * Reads a single node from the index buffer.
             * An index node contains a message code and a seek offset.
             * @param {number} from - The starting offset within the buffer to read the node.
             * @returns {object} An object containing the node's code and seek offset.
             */
            function readNode( from ) {
                var ret = {} ;
                ret.code = buffer.readUInt32LE( from ) ;      // Read the 32-bit little-endian code.
                ret.seek = buffer.readUInt32LE( from + 4 ) ;  // Read the 32-bit little-endian seek offset (4 bytes after code).
                return ret ;
            }


            // Read a block of data (bucket_size) from the message file at the specified position.
            fs.read( handle, buffer, 0, bucket_size, position, function( err, bufferSize ) {

                // If no data was read (bufferSize is 0 or less), it means we've reached the end or an invalid section.
                if ( bufferSize <= 0 ) {
                    callback( ) ; // Call back with no message.
                    return ;
                }

                // If we are at the deepest level of the index tree, proceed to search for the message.
                if ( stackSize === levels ) {
                    search( ) ;
                    return ;
                }

                // Initialize variables for traversing the current index bucket.
                var from = 0 ;
                var node = readNode( from ) ; // Read the first node in the bucket.

                // Loop through the nodes in the current index bucket.
                while ( true ) {

                    // If the current node's code is greater than or equal to our target code,
                    // we've found the next branch to follow.
                    if ( node.code >= code ) {
                        readIndex( stackSize + 1, node.seek ) ; // Recurse to the next level of the index.
                        break ; // Exit the while loop.
                    }

                    from += 8 ; // Move to the next node (each node is 8 bytes: 4 for code, 4 for seek).

                    // If we've processed all nodes in this bucket and haven't found a branch,
                    // it means the message is not found in this path.
                    if ( from >= bufferSize ) {
                        callback( ) ; // Call back with no message.
                        break ; // Exit the while loop.
                    }

                    node = readNode( from ) ; // Read the next node.
                }
            } ) ;
        }


        /**
         * Searches for the actual message text within a data bucket.
         * This function is called after `readIndex` has located the correct bucket.
         */
        function search( ) {

            /**
             * Reads a message record from the buffer.
             * A message record contains a code, length, and the message text.
             * @param {number} from - The starting offset within the buffer to read the record.
             * @returns {object} An object containing the record's code, length, text, or next seek offset.
             */
            function readRec( from ) {

                /**
                 * Aligns a given value to the next multiple of 4.
                 * This is often used for memory alignment in file formats.
                 * @param {number} v - The value to align.
                 * @returns {number} The aligned value.
                 */
                function align( v ) {
                    return ( v + 3 ) & ~3 ;
                }

                var ret = {} ;
                ret.code   = buffer.readUInt32LE( from ) ;    // Read the 32-bit little-endian message code.
                ret.length = buffer.readUInt16LE( from + 4 ) ; // Read the 16-bit little-endian message length (2 bytes after code).

                // If the record's code matches our target code, we've found the message.
                if ( ret.code == code ) {
                    from += 8 ; // Move past the code (4 bytes) and length (2 bytes) fields, plus 2 bytes padding.
                    ret.text = buffer.toString( null, from, from + ret.length ) ; // Read the message text.
                } else {
                    // If codes don't match, this record is not our target.
                    // Calculate the seek offset to the next record in the bucket.
                    ret.seek = from + align( 8 + ret.length ) ;
                }

                return ret ;
            }

            var rec = readRec( 0 ) ; // Start reading from the beginning of the bucket.

            // Loop until the correct message record is found (i.e., rec.seek is undefined)
            // or we exceed the buffer's bounds.
            while ( rec.seek ) {
                if ( rec.seek >= buffer.length ) {
                    break ; // Prevent reading out of buffer bounds.
                } else {
                    rec = readRec( rec.seek ) ; // Move to the next record.
                }
            }

            var str = rec.text ; // The found message text.

            // If the item has parameters, substitute them into the message string.
            if ( item.params ) {
                for ( var i = 0 ; i < item.params.length ; i++ ) {
                    str = str.replace( '@' + String( i + 1 ), item.params[ i ] ) ;
                }
            }

            callback( str ) ; // Return the final message string.
        }

        // Start the index lookup process from the first level and the top tree offset.
        readIndex( 1, top_tree ) ;
    }

    // Open the Firebird message file asynchronously.
    fs.open( __dirname + "/firebird.msg", 'r', function( err, h ) {

        // If file handle 'h' is not valid, it means the file could not be opened.
        if ( !h ) {
            callback( ) ; // Call the main callback with no result.
            return ;
        }

        // Initialize a temporary buffer to read the header of the message file.
        buffer = new Buffer( 14 ) ;
        fs.read( h, buffer, 0, 14, 0, function( ) { // Read the first 14 bytes (header).

            handle      = h ;                               // Store the file handle.
            bucket_size = buffer.readUInt16LE( 2 ) ;        // Read bucket size from header (offset 2).
            top_tree    = buffer.readUInt32LE( 4 ) ;        // Read top tree offset from header (offset 4).
            levels      = buffer.readUInt16LE( 12 ) ;       // Read number of levels from header (offset 12).
            buffer      = new Buffer( bucket_size ) ;       // Re-initialize buffer to the actual bucket size.

            var i       = 0 ;    // Counter for iterating through the 'status' array.
            var text    ;        // Accumulator for combined message text.

            /**
             * Recursive helper function to loop through multiple status items.
             * This ensures asynchronous lookups are processed in sequence.
             */
            function loop( ) {
                // Lookup the current status item.
                lookup( status[ i ], function( line ) {
                    // Concatenate messages if there are multiple.
                    if ( text ) {
                        text = text + ', ' + line ;
                    } else {
                        text = line ;
                    }

                    // Check if all status items have been processed.
                    if ( i === status.length - 1 ) {
                        fs.close( handle ) ; // Close the message file handle.
                        callback( text ) ;   // Call the main callback with the combined text.
                    } else {
                        i++ ;      // Move to the next status item.
                        loop( ) ;  // Recursively call loop for the next item.
                    }
                } ) ;
            }

            loop( ) ; // Start the message lookup loop.
        } ) ;
    } ) ;
} ;