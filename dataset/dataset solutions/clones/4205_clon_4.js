const determineOutcome = (inputData) => {
    const primaryLine = inputData.trim().split(/\r?\n/)[0];
    const characterCount = primaryLine.length;

    // Helper function to check if all characters in a non-empty string are identical
    // Returns false for empty strings, as per original logic's Set.size == 1 requirement
    const checkHomogeneity = (textualSequence) => {
        return textualSequence.length > 0 && (/^(.)\1*$/).test(textualSequence);
    };

    let finalVerdict = "YES"; // Default assumption

    // Use a switch statement for branching based on string length parity
    switch (characterCount % 2) {
        case 0: // Even length
            {
                const halfLength = characterCount / 2;
                // This segment corresponds to the original's combined check for a and b
                // which effectively determined if the first half of the string was uniform.
                const initialSegment = primaryLine.substring(0, halfLength);
                if (checkHomogeneity(initialSegment)) {
                    finalVerdict = "NO";
                }
            }
            break;
        case 1: // Odd length
            {
                const centralPoint = (characterCount - 1) / 2;
                // The original code checks segments before and after the middle character
                const firstPart = primaryLine.substring(0, centralPoint);
                const secondPart = primaryLine.substring(centralPoint + 1);

                if (checkHomogeneity(firstPart) && checkHomogeneity(secondPart)) {
                    finalVerdict = "NO";
                }
            }
            break;
    }

    console.log(finalVerdict);
};

determineOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));