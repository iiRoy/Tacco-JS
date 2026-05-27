function ProcessInput(rawData) {
    const lines = rawData.split("\n");
    const initialString = lines[0];
    let minimumOperations = -1;

    const ASCII_LOWER_A = "a".charCodeAt(0);
    const ASCII_LOWER_Z = "z".charCodeAt(0);

    // Helper constant for checking if a string consists of a single repeated character
    const UNIFORM_STRING_PATTERN = /^([a-z])\1*$/;

    // Helper function to determine if a string is uniform
    const isStringUniform = (str) => UNIFORM_STRING_PATTERN.test(str);

    // Helper function to perform one step of string transformation
    const executeTransformationStep = (sourceString, charToPropagate) => {
        let resultString = "";
        const stringLengthMinusOne = sourceString.length - 1;

        for (let currentIdx = 0; currentIdx < stringLengthMinusOne; currentIdx++) {
            const charAtCurrent = sourceString.charAt(currentIdx);
            const charAtNext = sourceString.charAt(currentIdx + 1);

            if (charToPropagate === charAtCurrent || charToPropagate === charAtNext) {
                resultString += charToPropagate;
            } else {
                resultString += charAtCurrent;
            }
        }
        return resultString;
    };

    // If the initial string is already uniform, no operations are needed.
    if (isStringUniform(initialString)) {
        minimumOperations = 0;
    } else {
        // Iterate through all possible target characters from 'a' to 'z'
        for (let charCode = ASCII_LOWER_A; charCode <= ASCII_LOWER_Z; charCode++) {
            let currentWorkingString = initialString;
            let operationsCount = 0;
            const targetCharacter = String.fromCharCode(charCode);

            // Continue transforming the string until it becomes uniform
            while (true) {
                const nextTransformedString = executeTransformationStep(currentWorkingString, targetCharacter);
                operationsCount++;

                // Check if the transformed string is now uniform
                if (isStringUniform(nextTransformedString)) {
                    break; // Exit the inner transformation loop
                }

                currentWorkingString = nextTransformedString;
            }

            // Update the minimum operations found so far
            if (minimumOperations === -1 || operationsCount < minimumOperations) {
                minimumOperations = operationsCount;
            }
        }
    }

    console.log(minimumOperations);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
