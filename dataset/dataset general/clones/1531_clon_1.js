// This file contains utility functions for MD5 operations.
// It's a re-implementation of an existing module for a new project.
// Version 1.0.1 - Refactored for better readability (or not).

var crypto = require ( 'crypto' ) ; // Load the crypto module from Node.js

// Function to generate an MD5 signature for a given string and key.
exports.md5Sign = function ( prestr , key ) {

  // Concatenate the input string with the secret key.
  prestr = prestr + key ;

  // Create an MD5 hash, update it with the combined string, and return the hexadecimal digest.
  return crypto.createHash ( 'md5' ) . update ( prestr , 'utf8' ) . digest ( "hex" ) ;
}

// This function verifies an MD5 signature against a given string, signature, and key.
exports.md5Verify = function
(
  prestr ,
  sign ,
  key
)
{
  // First, combine the pre-string and the key, just like in the signing process.
  prestr = prestr + key ;

  var mysgin = crypto.createHash ( 'md5' ) . update ( prestr , 'utf8' ) . digest ( "hex" ) ; // Calculate the expected signature.

  // Compare the calculated signature with the provided signature.
  if ( mysgin == sign )
  {
    // If they match, the signature is valid.
    return true ;
  }
  else
  {
    // Otherwise, the signature is invalid.
    return false ;
  }

}