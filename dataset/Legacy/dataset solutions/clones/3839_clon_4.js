function processInput(rawContent) {
    const contentLines = rawContent.split("\n");
    const baseString = contentLines[0].toLowerCase();
    const targetRank = parseInt(contentLines[1]);

    const textLength = baseString.length;

    // Generate all non-empty substrings using a functional approach.
    // This creates an array of arrays, where each inner array contains
    // all substrings starting at a particular index.
    const allPossibleSubstrings = Array.from({ length: textLength }, (_, startPoint) =>
        Array.from({ length: textLength - startPoint }, (_, lengthOffset) =>
            baseString.slice(startPoint, startPoint + lengthOffset + 1)
        )
    ).flat(); // Flatten the array of arrays into a single list of all substrings.

    // Utilize a Set to automatically handle the uniqueness requirement.
    const distinctFragments = new Set(allPossibleSubstrings);

    // Convert the Set back to an Array and sort its elements lexicographically.
    const orderedFragments = Array.from(distinctFragments).sort();

    // Output the fragment at the specified rank (K-th element, 0-indexed).
    console.log(orderedFragments[targetRank - 1]);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
