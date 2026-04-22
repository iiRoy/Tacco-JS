"use strict";

const performDataTransformation = (sourceText) => {
    const acquiredSegments = sourceText.match(/^([^\n]*)\n([^\n]*)/);

    if (!acquiredSegments || acquiredSegments.length < 3) {
        return; // Malformed input, though problem constraints usually guarantee valid format.
    }

    const primarySequence = acquiredSegments[1].trim();
    const numericalBoundary = Number(acquiredSegments[2].trim());

    // Extract a prefix of the primary sequence up to the numerical boundary.
    // This implicitly handles cases where numericalBoundary exceeds primarySequence.length.
    const relevantPrefixUnits = Array.from(primarySequence.substring(0, numericalBoundary));

    // Find the initial character within the prefix that is not '1'.
    // This functional approach replaces the imperative loop with an early exit.
    const initialNonUnitOne = relevantPrefixUnits.find(characterUnit => characterUnit !== '1');

    if (initialNonUnitOne !== undefined) {
        // If such a character is located, output it.
        console.log(initialNonUnitOne);
    } else {
        // Otherwise (meaning all characters in the prefix were '1', or the prefix was empty),
        // output the character at the position indicated by the numerical boundary.
        // This correctly handles scenarios where numericalBoundary is out of bounds,
        // resulting in an empty string being logged.
        console.log(primarySequence.charAt(numericalBoundary));
    }
};

performDataTransformation(require("fs").readFileSync("/dev/stdin", "utf8"));