// This module contains a routine for processing character sequences based on specific rules.
// Its purpose is to analyze a given string and determine a logical outcome ("Yes" or "No").
function ProcessInputData(incomingStringData) {
    // Ensure the input is treated as a string and handle potential leading/trailing whitespace.
    // This is an additional robustness measure, ensuring consistent processing regardless of input formatting.
    const sanitizedInput = String(incomingStringData).trim();

    // A preliminary check for the input's validity.
    // If the input string is empty after trimming, it's impossible to proceed with the character analysis.
    // The original code would likely throw a runtime error for an empty string.
    // For this clone, we'll return a specific outcome for clarity in such an edge case,
    // which is a valid Type III update for improved robustness.
    if (sanitizedInput.length === 0) {
        return "No";
    }

    // Identify the primary character that will dictate the subsequent processing logic.
    // This character is always the very first one encountered in the initial input sequence.
    const primaryTargetCharacter = sanitizedInput[0];

    // Begin a series of string transformations to remove specific occurrences of the primary character.

    // First, remove the *initial* occurrence of the primary target character from the input string.
    // This operation yields an intermediate string where the first instance of the target is no longer present.
    let interimStringResult = sanitizedInput.replace(primaryTargetCharacter, '');

    // Next, from the 'interimStringResult', remove the *next* occurrence of the primary target character.
    // This effectively removes the second instance of the target character from the original input's perspective.
    let finalProcessedSegment = interimStringResult.replace(primaryTargetCharacter, '');

    // To facilitate character-by-character access for the final comparison,
    // convert the resulting string segment into an array of its constituent characters.
    const remainingCharactersArray = finalProcessedSegment.split('');

    // Retrieve the first and second characters from this final array for comparison.
    // If the array has fewer than two elements, accessing these indices will naturally
    // result in 'undefined' values, which is crucial for replicating a specific edge-case behavior
    // of the original code (where undefined === undefined evaluates to true).
    const firstComparativeElement = remainingCharactersArray[0];
    const secondComparativeElement = remainingCharactersArray[1];

    // Perform the final evaluation: check if these two characters are strictly identical.
    // This comparison includes scenarios where both might be 'undefined' (e.g., from an initially short input
    // where all characters were removed), which evaluates to true, mirroring the original logic's behavior.
    if (firstComparativeElement === secondComparativeElement) {
        return "Yes"; // The two designated characters (or undefined placeholders) match.
    } else {
        return "No";  // The two designated characters do not match.
    }
}

// =====================================================================================================================
// Standard boilerplate for handling input/output operations in a typical JavaScript competitive programming environment.
// This section is specifically designed to read input from standard input and pass it to the main processing logic.
// In a standard contest setting, it's generally advised to refrain from altering the code below this line.
// =====================================================================================================================

// Acquire a reference to the Node.js file system module, which is commonly used for I/O tasks.
const fileSystemInterface = require("fs");

// Define the conventional path for reading standard input in POSIX-like operating systems.
const standardInputPath = "/dev/stdin";

// Specify the character encoding standard to be used when interpreting the incoming data stream.
const encodingStandard = "utf8";

// Synchronously read the complete contents of the specified standard input stream.
// The raw data is initially read into a buffer, then converted into a string using the designated encoding.
const rawDataFromEnvironment = fileSystemInterface.readFileSync(standardInputPath, encodingStandard);

// Execute the primary logic function with the obtained raw input data.
// The result, which will be a string ("Yes" or "No"), is then outputted to the standard console.
console.log(ProcessInputData(rawDataFromEnvironment));