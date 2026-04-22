function verifyCriteria(dataSequence) {
    const sequenceLength = dataSequence.length;

    if (sequenceLength < 1) {
        return false;
    }

    // Check 1: First character must be 'A' (ASCII 65)
    if (dataSequence.charCodeAt(0) !== 65) {
        return false;
    }

    let characterC_count = 0;
    let characterC_position = -1;
    let current_index_for_char = 0;

    // Iterate through characters to find 'C' occurrences and their positions
    for (const charUnit of dataSequence) {
        if (charUnit.charCodeAt(0) === 67) { // 'C' is ASCII 67
            characterC_count++;
            characterC_position = current_index_for_char;
        }
        current_index_for_char++;
    }

    // Check 2: Exactly one 'C' must exist
    if (characterC_count !== 1) {
        return false;
    }

    // Check 3: The single 'C' must be within the specific index range [2, sequenceLength - 4]
    // This implies that sequenceLength must be at least 6 for the range to be valid.
    if (!(characterC_position >= 2 && characterC_position <= sequenceLength - 4)) {
        return false;
    }

    // If all specified conditions are met, return true
    return true;
}

// Main entry point for the program
function initiateProcessing(externalInput) {
    const evaluationResult = verifyCriteria(externalInput);
    if (evaluationResult) {
        console.log("AC");
    } else {
        console.log("WA");
    }
}

// Do not modify below this line (standard input/output handling)
initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));