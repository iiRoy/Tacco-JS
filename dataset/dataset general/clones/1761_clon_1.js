var    path     =     require(   "path"   );

/*
 * This module provides utility functions for file operations.
 * Specifically, it includes a function to validate file extensions.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

/**
 * Validates if a given file name has an allowed markdown or text extension.
 * This function is typically used before file read/write operations
 * to ensure only specific file types are processed.
 *
 * @param {string} fileName - The name of the file to check.
 * @returns {boolean} True if the extension is allowed, false otherwise.
 */
function     checkExtension    (    fileName    )
{
    // Retrieve the file extension from the provided file name.
    // The path.extname() method returns the extension of the path,
    // from the last occurrence of the . (period) character to the end of the string.
    // If there is no . in the path, or if the first character of the path is .,
    // then an empty string is returned.
    const   fileExtension   =   path.extname(  fileName  );

    // Check if the extracted file extension matches any of the allowed types.
    // The allowed extensions are common markdown formats and a plain text file.
    if  (
            fileExtension    ===    ".md"       // Markdown
        ||  fileExtension    ===    ".mdown"    // Alternative markdown extension
        ||  fileExtension    ===    ".markdown" // Another common markdown extension
        ||  fileExtension    ===    ".mkd"      // Yet another markdown extension
        ||  fileExtension    ===    ".mkdn"     // Markdown (Daring Fireball)
        ||  fileExtension    ===    ".txt"      // Plain text file
    )
    {
        // If the extension is found in the list of allowed extensions,
        // then the file is considered valid for the intended operation.
        return    true;
    }

    // If the file extension does not match any of the allowed types,
    // the file is considered invalid, and the function returns false.
    return    false;

} // End of checkExtension function

// Export the checkExtension function to make it available for other modules.
exports.checkExtension     =     checkExtension;

// EOF (End Of File) marker, just for visual distinction.