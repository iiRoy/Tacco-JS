const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputContent.split('\n');
let targetSequence = inputLinesArray.shift();

// Ensure the target sequence is clean, removing leading/trailing whitespace.
// This is a Type III addition for robustness.
if (typeof targetSequence === 'string') {
    targetSequence = targetSequence.trim();
} else {
    // Fallback for unexpected non-string input, though unlikely in competitive programming.
    targetSequence = ''; 
}

let characterExistenceMap = {};
let finalOutputString = '';

// Define alphabet size as a constant for improved readability.
const FULL_ALPHABET_LENGTH = 26;

// Initialize the map with all lowercase alphabet characters, marking them as not present.
// Type III change: Using a more explicit loop for character codes and boolean values (false instead of 0).
for (let charCodeIterator = 'a'.charCodeAt(0); charCodeIterator <= 'z'.charCodeAt(0); charCodeIterator++) {
    const currentAlphabetChar = String.fromCharCode(charCodeIterator);
    characterExistenceMap[currentAlphabetChar] = false;
}

// Type III change: Introduced a helper function for clarity and modularity.
const isFullLengthAlphabetString = (text) => text.length === FULL_ALPHABET_LENGTH;

if (isFullLengthAlphabetString(targetSequence)) {
    // This branch handles the specific scenario where the input string is a full alphabet permutation (length 26).
    // The original logic here aims to find a lexicographically greater prefix, not a full next permutation.

    const sequenceLength = targetSequence.length;
    let suffixCharacterCollection = []; // Stores characters from the current suffix, always sorted.
    let potentialCandidateFound = false; // Flag to indicate if a suitable string has been identified.

    // Iterate backwards from the end of the string.
    // This loop progressively considers shorter prefixes and larger suffix character sets.
    for (let primaryIndex = sequenceLength - 1; primaryIndex >= 0; primaryIndex--) {
        // Add the character at the current index to our collection of suffix characters.
        // Type III change: Using charAt() for single character extraction.
        suffixCharacterCollection.push(targetSequence.charAt(primaryIndex));
        
        // Sort the collected suffix characters lexicographically.
        // This sorting within the loop is crucial to replicate the original code's specific behavior,
        // even if it introduces some inefficiency.
        suffixCharacterCollection.sort(); 

        // Extract the prefix part of the original string (from index 0 up to primaryIndex - 1).
        // Type III change: Using substring() for prefix extraction.
        const currentWorkingPrefix = targetSequence.substring(0, primaryIndex);
        
        // Iterate through the sorted suffix characters to find one that, when appended to the prefix,
        // forms a string lexicographically greater than the original target sequence.
        for (let suffixCharIndex = 0; suffixCharIndex < suffixCharacterCollection.length; suffixCharIndex++) {
            const charFromSuffix = suffixCharacterCollection[suffixCharIndex];
            
            // Construct a new potential string by appending one character from the sorted suffix to the prefix.
            const constructedTestString = currentWorkingPrefix + charFromSuffix;
            
            // Perform the crucial lexicographical comparison against the ENTIRE original target sequence.
            // This is the specific logic from the original code.
            if (constructedTestString > targetSequence) {
                potentialCandidateFound = true;
                finalOutputString = constructedTestString; // Store this partial string as the result.
                break; // Exit inner loop as soon as the first valid candidate is found.
            }
        }
        
        if (potentialCandidateFound) {
            break; // Exit outer loop if a candidate was successfully identified.
        }
    }    

    // If, after all iterations, no such candidate string was found.
    if (!potentialCandidateFound) {
        finalOutputString = -1; // Indicate that no solution was found under this specific logic.
    }

} else {
    // This branch handles cases where the input string has fewer than 26 characters.
    // The goal is to find the smallest missing alphabet character and append it to the string.

    // Populate the characterExistenceMap based on characters present in the targetSequence.
    // Type III change: Using a for...of loop for iterating string characters, which is more modern.
    for (const charInSequence of targetSequence) {
        // Type III change: Added a check for property existence for robustness, though not strictly needed for alphabet chars.
        if (characterExistenceMap.hasOwnProperty(charInSequence)) { 
            characterExistenceMap[charInSequence] = true; // Mark character as present.
        }
    }
    
    let firstMissingAlphabetChar = ''; // Variable to store the smallest missing character.
    let missingCharSearchCompleted = false; // Type III addition: A flag to control flow and make intent clear.

    // Iterate through the alphabet to find the first character not marked as present in the map.
    for (let charCodeIterator = 'a'.charCodeAt(0); charCodeIterator <= 'z'.charCodeAt(0); charCodeIterator++) {
        const currentAlphabetChar = String.fromCharCode(charCodeIterator);
        if (!characterExistenceMap[currentAlphabetChar]) {
            firstMissingAlphabetChar = currentAlphabetChar;
            missingCharSearchCompleted = true;
            break; // Exit the loop as the first missing character is found.
        }
    }
    
    // Type III change: Conditional assignment based on the search flag for clarity.
    if (missingCharSearchCompleted) {
        finalOutputString = targetSequence + firstMissingAlphabetChar; // Append the smallest missing character.
    } else {
        // This 'else' block theoretically should not be reached if targetSequence.length < 26
        // and the map covers all 26 letters. It serves as a defensive programming measure.
        finalOutputString = "ERROR: Logic anomaly - all characters found but string is not full length.";
    }
}

console.log(finalOutputString);