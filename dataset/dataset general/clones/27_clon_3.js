/**
 * Transforms a source string by replacing specified characters or substrings.
 * This function is designed to emulate the behavior of PHP's `strtr` function,
 * handling both character-to-character mapping and substring-to-substring replacement.
 *
 * @param {string} sourceString The input string that will be processed for transformations.
 * @param {string|Object<string, string>|string[]} searchMapping The definition of what to search for.
 *   - If a string or an array of characters, it specifies individual characters to replace.
 *   - If an object, its keys represent substrings to find, and their corresponding values are the replacements.
 * @param {string|string[]} [replaceMapping] The definition of what to replace with.
 *   - This parameter is only used when `searchMapping` is a string or an array of characters.
 *   - If a string or an array of characters, it provides the replacement characters in corresponding order.
 * @returns {string} The resulting string after all replacements have been applied.
 */
const transformString = (sourceString, searchMapping, replaceMapping) => {
    // Initial validation: If the primary input is not a string, return it as is.
    if (typeof sourceString !== 'string') {
        return sourceString;
    }

    let resultBuffer = '';
    let currentIdx = 0;
    const inputLength = sourceString.length;

    let searchFragments = []; // Stores the 'from' parts for comparison
    let replacementFragments = []; // Stores the 'to' parts for substitution

    // Determine the type of mapping provided and prepare the fragments.
    const isObjectMapping = typeof searchMapping === 'object' && searchMapping !== null && !Array.isArray(searchMapping);
    const isCharMapping = typeof searchMapping === 'string' || Array.isArray(searchMapping);

    if (isObjectMapping) {
        // Case: Object mapping (e.g., {'oldSub': 'newSub'})
        // Extract keys from the object and sort them in reverse alphabetical order.
        // This ensures that, for keys of equal length, the one that would come later
        // in a standard alphabetical sort is processed first (consistent with krsort for string keys).
        const objectKeys = Object.keys(searchMapping);
        objectKeys.sort((keyA, keyB) => {
            // Reverse alphabetical sort
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
        });

        // Populate search and replacement fragments based on sorted keys
        for (const key of objectKeys) {
            searchFragments.push(key);
            replacementFragments.push(searchMapping[key]);
        }
    } else if (isCharMapping) {
        // Case: Character-by-character mapping (e.g., 'abc', 'xyz')
        // Convert input strings/arrays into arrays of individual characters.
        searchFragments = Array.from(searchMapping);
        replacementFragments = Array.from(replaceMapping || ''); // Default to empty array if replaceMapping is missing
    } else {
        // If an invalid mapping type is provided, no transformation can occur.
        return sourceString;
    }

    const numberOfSearchItems = searchFragments.length;

    // Iterate through the source string to apply transformations
    while (currentIdx < inputLength) {
        let matchFound = false;
        let charactersAdvanced = 1; // Default advancement if no specific match

        if (isCharMapping) {
            // Logic for character-by-character replacement
            const charToEvaluate = sourceString[currentIdx];
            for (let i = 0; i < numberOfSearchItems; i++) {
                if (charToEvaluate === searchFragments[i]) {
                    resultBuffer += (replacementFragments[i] !== undefined) ? replacementFragments[i] : '';
                    matchFound = true;
                    break;
                }
            }
        } else {
            // Logic for substring replacement (from object keys)
            for (let i = 0; i < numberOfSearchItems; i++) {
                const currentSearchTerm = searchFragments[i];
                const termLength = currentSearchTerm.length;

                // Check if the current segment of sourceString matches a search term
                if (sourceString.slice(currentIdx, currentIdx + termLength) === currentSearchTerm) {
                    resultBuffer += replacementFragments[i];
                    charactersAdvanced = termLength; // Advance by the length of the matched substring
                    matchFound = true;
                    break; // Found a match, move to the next segment of the source string
                }
            }
        }

        // If no specific match was found, append the original character/segment
        if (!matchFound) {
            resultBuffer += sourceString[currentIdx];
        }
        currentIdx += charactersAdvanced; // Move to the next position in the source string
    }

    return resultBuffer;
};