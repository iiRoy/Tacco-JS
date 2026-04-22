(function(rawTextStreamPath) {
    // Utility function to safely acquire content from a specified source path.
    // This abstracts the file system interaction and includes basic error handling.
    const acquireContentFromSource = (sourcePath) => {
        try {
            // Using a different internal reference for the file system module.
            const fileSystemAccess = require('fs');
            // Read the entire file synchronously, ensuring UTF-8 encoding.
            return fileSystemAccess.readFileSync(sourcePath, 'utf8');
        } catch (dataAcquisitionError) {
            // Log any issues encountered during file reading and return an empty string.
            console.error("Problem encountered while fetching input data:", dataAcquisitionError.message);
            return ""; // Default to an empty string to prevent further processing errors.
        }
    };

    // Obtain the string content that needs to be analyzed.
    const sourceStringForAnalysis = acquireContentFromSource(rawTextStreamPath);

    // Initial validation: ensure the acquired content is a non-empty string.
    if (typeof sourceStringForAnalysis !== 'string' || sourceStringForAnalysis.length === 0) {
        console.warn("Analysis skipped: No valid string content was provided or acquired.");
        return; // Terminate execution if input is invalid.
    }

    // Prepare a data structure to store the frequency counts of each lowercase letter.
    // This utilizes a different approach for initialization compared to the original loop.
    const characterOccurrenceRegister = new Map();
    // Populate the map with all lowercase English letters, initialized to zero.
    for (let charCodeIterator = 'a'.charCodeAt(0); charCodeIterator <= 'z'.charCodeAt(0); charCodeIterator++) {
        characterOccurrenceRegister.set(String.fromCharCode(charCodeIterator), 0);
    }

    // Process each character in the input string to update its count.
    // Using a modern 'for...of' loop for iterating over characters.
    for (const individualCharacter of sourceStringForAnalysis) {
        // Convert the current character to its lowercase equivalent.
        const normalizedCharacter = individualCharacter.toLowerCase();

        // Check if the normalized character is one of the tracked alphabet letters.
        if (characterOccurrenceRegister.has(normalizedCharacter)) {
            // If it is, increment its corresponding count in the register.
            characterOccurrenceRegister.set(normalizedCharacter, characterOccurrenceRegister.get(normalizedCharacter) + 1);
        }
        // Non-alphabetic characters are implicitly ignored, maintaining original logic.
    }

    // Construct the final output string, formatting each character and its count.
    const formattedOutputLines = [];
    // Iterate through the entries of the frequency map.
    for (const [letterKey, currentCount] of characterOccurrenceRegister.entries()) {
        formattedOutputLines.push(`${letterKey}: ${currentCount}`);
    }

    // Display the aggregated results to the standard output, each on a new line.
    console.log(formattedOutputLines.join('\n'));

})('/dev/stdin'); // Specifies the standard input stream as the data source path.