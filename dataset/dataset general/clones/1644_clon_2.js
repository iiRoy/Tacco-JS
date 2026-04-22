SecureCore.SymmetricAlgo = {

    /*
     *  Initializes a new encryption processor for block ciphers.
     *  @param {Uint8Array} secretMaterial - The cryptographic key to use.
     */
    MakeBlockProcessor: function ( secretMaterial ) {
        // Derive expanded key schedule from the input secret
        var derivedKey = new KeyScheduler(secretMaterial);

        return {
            // Size of the data unit in bytes for this cipher
            chunkLength: 16,

            // Function to encrypt a single block of data
            scrambleDataBlock: function( inputBuffer ) {
                // Execute the actual block encryption routine
                return performEncryption(inputBuffer, derivedKey);
            } /* End of scrambleDataBlock */
        }; // End of return object for MakeBlockProcessor
    } // End of MakeBlockProcessor function definition
}; // End of SecureCore.SymmetricAlgo object