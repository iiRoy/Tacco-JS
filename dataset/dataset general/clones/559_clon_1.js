/*
 * This file contains utility functions for Base64 encoding/decoding
 * and MD5 hashing, primarily used for testing purposes.
 *
 * It demonstrates symmetric encoding/decoding and hash verification.
 */

// Import the base64 library for encoding and decoding operations.
var base64    =    require('base64');

// Import the crypto module for cryptographic hashing functions.
var crypto     =    require('crypto');

// Import the file system module for reading files.
var fs = require('fs');

// Import the Hash utility from 'traverse/hash' for object iteration.
var Hash    =    require('traverse/hash');


// Load pre-calculated hashes from a JSON file.
// These hashes are used to verify file integrity or expected outputs.
var hashes    =    JSON.parse (
    fs.readFileSync( __dirname + '/hashes.json' ) .toString()
) ;


/**
 * Calculates the MD5 hash of the given data and returns it in hexadecimal format.
 *
 * @param {Buffer|string} data - The input data to be hashed.
 * @returns {string} The MD5 hash in hexadecimal format.
 */
function md5hex( data )
{
    // Create a new MD5 hash object, update it with the string representation of data,
    // and then digest it to get the hexadecimal output.
    return ( new crypto.Hash ( 'md5' ) ) .update( data.toString() ) .digest( 'hex' ) ;
}


// Export an 'encode' function for testing purposes.
// This function verifies Base64 encoding by comparing MD5 hashes.
exports.encode = function ( assert )
{
    // Iterate over each hash-file pair loaded from 'hashes.json'.
    Hash ( hashes ) .forEach ( function ( hash, file )
    {
        // Read the content of the specified file asynchronously.
        fs.readFile ( __dirname + '/' + file, function ( err, buf )
        {
            // If an error occurs during file reading, throw it immediately.
            if ( err )
            {
                throw err;
            }

            // Assert that the pre-calculated hash matches the MD5 hash
            // of the Base64 encoded file content.
            assert.equal( hash, md5hex ( base64.encode ( buf ) ) ) ;
        } ) ;
    } ) ;
} ;


// Export a 'symmetric' function to test the symmetric property of Base64 encoding/decoding.
exports.symmetric = function ( assert )
{
    // Create a new Buffer with some arbitrary string data.
    var buf    =    new Buffer ( 'pow biff zing' );

    // Assert that encoding the buffer and then decoding it
    // results in the original buffer content.
    assert.equal(
        buf,
        base64.decode( base64.encode( buf ) )
    ) ;
} ;