/*
 * Module: Cryptographic Utilities
 * Author: CodeCrafter
 * Date: 2023-11-20
 * Purpose: Provides functions for hashing and signature verification.
 */

/*
 * Hash & Security Module
 *
 * Description: This module offers basic cryptographic hashing (MD5)
 * for data integrity and authentication purposes.
 * Version: 1.0.0
 * Release Date: 2023-11-20
 *
 * Disclaimer: The methods provided herein are for illustrative purposes.
 * For robust security in production environments, consider industry-standard
 * cryptographic libraries and algorithms.
 */

var   cryptographyEngine = require('crypto') ;

/*
 * Computes a hash signature for a given message.
 * @param   messageContent   The string data to be signed.
 * @param   secretKey        The private key used for hashing.
 * @returns The resulting hexadecimal signature.
 */

exports.   computeDigest = function(   messageContent  ,   secretKey   )
{
    // Concatenate the input string with the secret key
    messageContent = messageContent + secretKey;

    // Create an MD5 hash, update with the combined string, and return its hexadecimal representation
    return cryptographyEngine   .createHash('md5') .  update(messageContent, 'utf8' ) .digest("hex") ;
};

/*
 * Verifies if a provided signature matches the computed hash of the message.
 * @param   originalContent   The original data string.
 * @param   receivedSignature The signature provided for verification.
 * @param   validationKey     The key used to re-compute the hash.
 * @returns True if the signatures match, false otherwise.
 */

exports. validateSignature  =  function(   originalContent  ,  receivedSignature  ,  validationKey   )
{
    // Append the validation key to the original content
    originalContent = originalContent + validationKey;

    var   calculatedSignature = cryptographyEngine.  createHash('md5') .update( originalContent, 'utf8' ) .digest("hex")  ;

    // Compare the newly calculated signature with the one provided
    if(calculatedSignature === receivedSignature)
    {
        return true ;
    }
    else
    {
        return false ;
    }
}