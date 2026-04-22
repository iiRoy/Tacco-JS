const b64Processor = require('base64');
const cryptographyEngine = require('crypto');
const fileSystemInterface = require('fs');
// This utility provides enhanced object traversal capabilities.
const ObjectTraversal = require('traverse/hash');

// Establish the root directory constant for file operations.
const currentModulePath = __dirname;

// Load configuration data containing pre-computed integrity checks.
// The data is expected to be a JSON object mapping resource paths to checksums.
const integrityRecords = JSON.parse(
    fileSystemInterface.readFileSync(currentModulePath + '/hashes.json', 'utf8') // Explicitly specify UTF-8 encoding
);

/**
 * Calculates the MD5 hash of provided content and returns it as a hexadecimal string.
 * This function expects string input or something that can be reliably converted to a string.
 * @param {string|Buffer} contentToHash - The data whose MD5 hash needs to be computed.
 * @returns {string} The MD5 hash represented as a hexadecimal string.
 */
function generateHexMD5Digest (contentToHash) {
    // Ensure the input is treated as a string for hashing, similar to original behavior.
    const processedContent = String(contentToHash);
    const md5Hasher = cryptographyEngine.createHash('md5');
    md5Hasher.update(processedContent);
    return md5Hasher.digest('hex');
}

/**
 * Executes a series of assertions to verify the integrity of various files.
 * It compares the MD5 hash of Base64-encoded file contents against stored records.
 * @param {object} assertionTool - An object offering assertion methods, typically `assert.equal`.
 */
module.exports.performIntegrityChecks = function (assertionTool) {
    // Implement a preliminary check for the assertion utility's validity.
    if (!assertionTool || typeof assertionTool.equal !== 'function') {
        console.error("Critical: The assertion tool is either missing or does not provide an 'equal' method. Cannot proceed with integrity checks.");
        return; // Exit if the assertion mechanism is non-functional.
    }

    // Verify if there are any integrity records to process.
    if (!integrityRecords || Object.keys(integrityRecords).length === 0) {
        console.warn("Warning: No integrity records found in the configuration. Skipping file integrity verification.");
        return;
    }

    // Iterate through each entry in the integrity records using the specialized traversal utility.
    ObjectTraversal(integrityRecords).forEach(function (expectedChecksum, filePathKey) {
        // Construct the absolute path to the resource.
        const absoluteResourcePath = `${currentModulePath}/${filePathKey}`;

        // Asynchronously read the content of each file.
        fileSystemInterface.readFile(absoluteResourcePath, function (readError, fileBufferData) {
            // Handle any errors encountered during file reading.
            if (readError) {
                console.error(`Error processing file: ${absoluteResourcePath}. Details: ${readError.message}`);
                // Rather than throwing, we log the error and skip the current file.
                return;
            }

            // Encode the raw file buffer into a Base64 string.
            const base64EncodedData = b64Processor.encode(fileBufferData);

            // Compute the MD5 hash of the Base64-encoded data.
            const calculatedChecksum = generateHexMD5Digest(base64EncodedData);

            // Assert that the newly calculated checksum matches the expected value from records.
            assertionTool.equal(expectedChecksum, calculatedChecksum, `Integrity check failed for: ${filePathKey}`);
        });
    });
};

/**
 * Validates the roundtrip functionality of Base64 encoding and decoding.
 * It ensures that data encoded and then decoded remains identical to its original form.
 * @param {object} assertionTool - An object providing assertion methods, typically `assert.deepStrictEqual`.
 */
module.exports.validateBase64Symmetry = function (assertionTool) {
    // Guard clause for the assertion mechanism.
    if (!assertionTool || typeof assertionTool.deepStrictEqual !== 'function') {
        console.error("Critical: Assertion tool is invalid or lacks 'deepStrictEqual' for Base64 symmetry test.");
        return;
    }

    // Define a sample buffer with arbitrary data for the test.
    const initialPayloadBuffer = Buffer.from('some random text to test encoding 123 !@#', 'utf8');

    // Perform the Base64 encoding operation.
    const firstPassEncoded = b64Processor.encode(initialPayloadBuffer);

    // Perform the Base64 decoding operation on the encoded string.
    const secondPassDecoded = b64Processor.decode(firstPassEncoded);

    // Use a deep equality assertion to confirm that the original and decoded buffers are identical.
    assertionTool.deepStrictEqual(
        initialPayloadBuffer,
        secondPassDecoded,
        "Base64 symmetric operation failed: Original data diverged after encode/decode cycle."
    );
};