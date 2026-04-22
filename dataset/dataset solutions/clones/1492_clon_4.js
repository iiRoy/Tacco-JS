const processData = (rawDataInput) => {
    // A utility function to convert string representations to integer values
    const valueConverter = (textualValue) => parseInt(textualValue, 10);

    // Define the modulus constant to be used in calculations
    const MODULO_LIMIT = 998244353;

    // Split the entire input string into individual lines, removing leading/trailing whitespace
    const contentLines = rawDataInput.trim().split('\n');

    // Extract initial configuration from the first line
    const [initialLengthString, queryCountString] = contentLines[0].split(' ');
    const sequenceDimension = valueConverter(initialLengthString);
    const totalCommands = valueConverter(queryCountString);

    // Initialize the primary sequence with '1's, based on the determined dimension
    let activeDigitSequence = Array.from({ length: sequenceDimension }, () => '1');

    // Process each subsequent command line using a functional reduction pattern
    // The accumulator will collect the results of each operation
    const collectedOutputs = contentLines.slice(1).reduce((resultsAccumulator, currentCommandText) => {
        const [startIdxString, endIdxString, replacementCharacter] = currentCommandText.split(' ');
        const startPosition = valueConverter(startIdxString) - 1; // Adjust to 0-based indexing
        const endPosition = valueConverter(endIdxString) - 1;     // Adjust to 0-based indexing

        // Create a new segment of characters to insert based on the replacement rule
        const segmentForInsertion = Array(endPosition - startPosition + 1).fill(replacementCharacter);

        // Reconstruct the active digit sequence by combining parts before, the new segment, and parts after
        activeDigitSequence = [
            ...activeDigitSequence.slice(0, startPosition),
            ...segmentForInsertion,
            ...activeDigitSequence.slice(endPosition + 1)
        ];

        // Compute the numerical value of the current sequence applying modular arithmetic at each step
        let calculatedModularValue = 0;
        for (let charIterator = 0; charIterator < activeDigitSequence.length; charIterator++) {
            calculatedModularValue = (calculatedModularValue * 10 + valueConverter(activeDigitSequence[charIterator])) % MODULO_LIMIT;
        }
        
        // Store the result of this operation
        resultsAccumulator.push(calculatedModularValue);
        return resultsAccumulator;
    }, []); // Initialize accumulator as an empty array

    // Output each collected result to the console
    collectedOutputs.forEach(resultValue => console.log(resultValue));
};

// Standard competitive programming input reading mechanism
processData(require("fs").readFileSync("/dev/stdin", "utf8"));