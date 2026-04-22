/*
 * This file defines the AES cipher module within the OpenPGP library.
 * It provides a factory function for creating AES cipher instances.
 */

OpenPGP.AES =
{
    // The 'Cipher' factory function takes a key and returns an AES cipher object.
    Cipher : function  (  key  )
    {
        /*
         * Initialize the key expansion.
         * This prepares the key for encryption operations.
         */
        var   kex   =    new   keyExpansion  (  key  )  ;

        // The returned object represents an AES cipher instance.
        return   {
            // Standard AES block size is 16 bytes (128 bits).
            blocksize :   16 ,

            /*
             * The 'encrypt_block' method performs encryption on a single block of data.
             * It uses the pre-expanded key ('kex').
             */
            encrypt_block : function ( block )
            {
                // Perform the actual AES encryption using the global AESencrypt function.
                return   AESencrypt  (  block  ,  kex  )  ;
            }  , // End of encrypt_block function definition
        }  ; // End of cipher instance object
    }  , // End of Cipher factory function
}  ; // End of OpenPGP.AES module