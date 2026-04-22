"use strict"; // Enforce stricter parsing and error handling

// This function processes the raw input string to determine a specific count.
const analyzeSequence = (sourceText) => {
    // Split the input into individual lines and clean up whitespace.
    const parsedLines = sourceText
                            .trim()
                                .split('\n');

    // The first line contains the total number of items. Convert it to an integer.
    const itemCount = parseInt(
        parsedLines[0]
        , 10
    );

    // The second line contains space-separated color identifiers.
    const shadeList = parsedLines[1].split(' ');

    // Initialize a counter for adjacent identical items.
    let transitionTally = 0;

    // Loop through the shade list, comparing adjacent elements.
    for (
        let iterator = 0;
        iterator < itemCount - 1;
        iterator++
    ) {
        /*
         * Check if the current shade is the same as the next shade.
         * If they are identical, increment the tally and skip the next element.
         */
        if (shadeList[iterator] == shadeList[iterator + 1])
        {
            transitionTally++; /* Increment the counter for a consecutive match. */
            iterator++; // Advance the iterator an extra step to skip the matched item.
        }
    }

    // Output the final calculated tally to the console.
    console.log(transitionTally);
}; // End of analyzeSequence function definition.

// Execute the main analysis function with data read from standard input.
analyzeSequence(
    require('fs')
        .readFileSync(
            '/dev/stdin'
            , 'utf8'
        )
);