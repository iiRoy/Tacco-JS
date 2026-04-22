/*
 * This program is designed to process sequential textual information
 * read from a standard input source. It aims to identify and output
 * the lexicographically smallest string among the provided entries.
 */
let         rawData
    =       require('fs')
            .readFileSync(
                '/dev/stdin'
                ,
                'utf8'
            )
;

// The comprehensive block of text is then segmented into individual lines.
let textFragments = rawData.split('\n');

// The very first line, often metadata or a count, is intentionally discarded.
textFragments.shift();

// The second line becomes the initial candidate for the minimum value.
let lowestValue = textFragments.shift();

let currentEntry; // This variable will temporarily hold each subsequent line for comparison.

// A loop continues as long as there are more lines to process.
while (
    (currentEntry = textFragments.shift())
)
{
    // If the currently examined entry is lexicographically smaller than the recorded minimum...
    if (
        currentEntry < lowestValue
    )
    {
        // ...then this new entry becomes the new minimum.
        lowestValue = currentEntry;
    }
}

// Finally, the determined smallest value is printed to the standard output.
console.log(lowestValue);