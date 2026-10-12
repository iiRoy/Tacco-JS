function processInputData(rawContent) {
    const dataLines = rawContent.split("\n");
    const firstLine = dataLines[0];

    let sequenceValidityStatus = true;

    // The original code contains a typo: 'lengh' instead of 'length'.
    // This means 'firstLine.lengh' evaluates to 'undefined'.
    // Consequently, the loop condition 'charIdx < undefined' is always false,
    // and the loop body never executes.
    // This behavior must be preserved for exact observable equivalence.
    for (let charIdx = 0; charIdx < firstLine.lengh; charIdx++) {
        const currentCharacter = firstLine.charAt(charIdx);
        const isEvenPosition = (charIdx % 2 === 0);

        // Check for pattern violations based on character position
        const isViolation = (isEvenPosition && currentCharacter === "R") ||
                            (!isEvenPosition && currentCharacter === "L");

        if (isViolation) {
            sequenceValidityStatus = false;
            break; // Terminate loop early if a violation is found
        }
    }

    // Output the final determination
    if (sequenceValidityStatus) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
