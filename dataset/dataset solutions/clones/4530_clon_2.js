/*
 * This module contains a core routine for processing textual data.
 * It identifies and categorizes numerical values based on specific criteria.
 */

function processData(
    incomingContent
)
{
    // First, divide the entire input string into individual lines.
    let contentRows = incomingContent.split(
        "\n"
    );

    // Extract the numerical tokens from the second line (index 1),
    // splitting them by spaces.
    let valueTokens = contentRows[1] .split(" ");

    // Determine the total number of items to process from the first line (index 0).
    const dataSize = parseInt(
        contentRows[0]
    );

    // Initialize an array to store unique categories found.
    const distinctGroups = [];

    // Initialize a counter for values exceeding a certain threshold.
    let excessCount = 0;

    // Loop through each item up to the determined data size.
    for (
        let currentIdx = 0;
        currentIdx < dataSize;
        currentIdx++
    )
    {
        // Calculate a derived group identifier for the current value.
        // The value is divided by 400 and then floored to an integer.
        let derivedGroup = Math.floor(
            parseFloat(valueTokens[currentIdx]) / 400
        );

        // Check if the derived group exceeds a specific maximum threshold (7).
        if (
            derivedGroup > 7
        )
        {
            // If it exceeds, increment the excess counter.
            excessCount = excessCount + 1;
        }
        else
        {
            // Otherwise, if the derived group is not already in our list of distinct groups,
            // add it to ensure uniqueness.
            if (
                distinctGroups.indexOf(derivedGroup)
                === -1
            )
            {
                distinctGroups.push(
                    derivedGroup
                );
            }
        }
    }

    // Output the count of unique categories and the total count
    // including both unique categories and excess items.
    console.info(
        distinctGroups.length,
        distinctGroups.length + excessCount
    );
}

// Invoke the data processing function.
// It reads content from standard input synchronously using Node.js file system module.
processData(
    require(
        "node:fs"
    ).readFileSync("/dev/stdin", "utf8")
);