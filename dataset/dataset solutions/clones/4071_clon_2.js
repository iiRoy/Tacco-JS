// This module exports a single function designed to ascertain if a specific numerical value,
// derived from an input stream, qualifies as a perfect square.
// Extensive whitespace variations are employed throughout the code for stylistic differentiation.

function checkSquareRootIntegrity
(
    rawInputText
)
{
    // Begin by dissecting the provided textual data.
    // The initial step involves splitting the input by newline characters,
    // selecting only the first line of content.
    // Subsequently, this isolated line is further segmented using space characters
    // to yield an array of distinct tokens.
    let extractedTokens = rawInputText
        .split
        (
            "\n"
        )
        [
            0
        ]
        .split
        (
            " "
        )
    ;

    // Proceed to construct the core numeric entity for evaluation.
    // This is achieved by concatenating the first two elements from our
    // 'extractedTokens' array, which are inherently strings,
    // and then explicitly casting the resulting combined string into a numerical type.
    const potentialSquare = Number
    (
        extractedTokens
        [
            0
        ]
        +
        extractedTokens
        [
            1
        ]
    )
    ;

    // The final stage involves determining if the 'potentialSquare' is indeed a perfect square.
    // This is accomplished by calculating its square root (using power of 0.5)
    // and then checking if the remainder when divided by 1 is strictly zero.
    // A zero remainder indicates an integer result for the square root,
    // thereby confirming the number as a perfect square.
    console.log
    (
        Math.pow
        (
            potentialSquare,
            0.5
        )
        %
        1
        ===
        0
            ? "Affirmative"  // Output string for a perfect square
            : "Negative"     // Output string for a non-perfect square
    )
    ;
}

// Invoke the primary analysis function.
// The data source is the standard input stream, read synchronously from the file system.
// The content is expected to be UTF-8 encoded.
checkSquareRootIntegrity
(
    require("node:fs") // Utilizing the Node.js file system module
        .readFileSync
        (
            "/dev/stdin", // Standard input file path
            "utf8"        // Character encoding specification
        )
)
;