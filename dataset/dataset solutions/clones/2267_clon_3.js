// This function orchestrates the analysis of provided song data.
// It is designed to process a multi-line input string, identify a specific melody,
// and then compute the cumulative duration of all subsequent melodies listed.
function ProcessSongData(inputString) {
    // A quick check to ensure we have something substantial to process.
    // If the input stream is empty or contains only whitespace, we halt execution.
    if (!inputString || inputString.trim() === '') {
        console.error("Input data stream appears empty or malformed. Aborting operation.");
        return;
    }

    // Deconstruct the raw input string into individual textual entries,
    // using the newline character as the primary delimiter.
    const dataSegments = inputString.split('\n');

    // Validate the minimum number of data segments required for a meaningful analysis.
    // We expect at least: total count, one song entry, and the target song identifier.
    // The target song identifier is at index `totalCount + 1`, so if totalCount is 1,
    // we need lines 0 (count), 1 (song), 2 (target), thus at least 3 lines.
    if (dataSegments.length < 3) {
        console.error("Insufficient data lines for processing. Expected at least 3 entries.");
        return;
    }

    // The very first line of the input typically contains the total number of track entries
    // that follow. We parse this as a base-10 integer.
    const totalTrackEntries = parseInt(dataSegments[0], 10);

    // Implement a robust guard against invalid or non-positive track counts.
    // Such values would render further processing illogical.
    if (isNaN(totalTrackEntries) || totalTrackEntries <= 0) {
        console.error("Invalid or non-positive track count detected in the input. Cannot proceed.");
        return;
    }

    // The identifier for the specific melody we are searching for is typically
    // located immediately after all the primary track entries.
    // In our 0-based array 'dataSegments', this corresponds to the index
    // `totalTrackEntries + 1`.
    const targetMelodyIdentifier = dataSegments[totalTrackEntries + 1];

    // Ensure that the target melody identifier was successfully extracted.
    // If it's absent, we cannot complete the requested operation.
    if (!targetMelodyIdentifier) {
        console.error("The specified target melody identifier is missing from the input sequence.");
        return;
    }

    // An internal, structured data array to hold parsed song details.
    // This pre-processing step improves efficiency by avoiding repeated string operations
    // within nested loops.
    const parsedMelodyRecords = [];

    // Iterate through the primary track entries, starting from the first actual song line
    // (index 1 in `dataSegments`) up to the `totalTrackEntries` count.
    for (let currentTrackIndex = 1; currentTrackIndex <= totalTrackEntries; currentTrackIndex++) {
        const currentLineContent = dataSegments[currentTrackIndex];

        // Split each line into its constituent parts: melody name and its duration.
        const lineParts = currentLineContent.split(' ');

        // Basic validation for the structure of each track line.
        // A valid entry should at least have a name and a duration.
        if (lineParts.length < 2) {
            console.warn(`Skipping malformed track entry at logical line ${currentTrackIndex}: "${currentLineContent}"`);
            continue; // Move to the next entry if this one is not properly formatted.
        }

        const trackNameComponent = lineParts[0];
        const rawDurationComponent = lineParts[1];
        // Parse the duration value. Using parseFloat allows for non-integer time values.
        const numericDuration = parseFloat(rawDurationComponent);

        // Validate the parsed duration to ensure it's a valid number.
        if (isNaN(numericDuration)) {
            console.warn(`Skipping track "${trackNameComponent}" due to invalid duration: "${rawDurationComponent}"`);
            continue;
        }

        // Store the parsed melody details in our structured array.
        parsedMelodyRecords.push({
            tune: trackNameComponent,
            duration: numericDuration
        });
    }

    // Initialize an accumulator for the total time duration.
    // We use a floating-point number to maintain precision with parseFloat.
    let totalAccumulatedDuration = 0.0;

    // Loop through the `parsedMelodyRecords` array to locate the target melody.
    // We use a 0-based index for this array.
    for (let searchIndex = 0; searchIndex < parsedMelodyRecords.length; searchIndex++) {
        const activeMelodyEntry = parsedMelodyRecords[searchIndex];

        // Check if the name of the current melody matches our search target.
        if (activeMelodyEntry.tune === targetMelodyIdentifier) {
            // Once the target melody is found, we proceed to sum the durations
            // of all subsequent melodies in the list.
            for (let subsequentIndex = searchIndex + 1; subsequentIndex < parsedMelodyRecords.length; subsequentIndex++) {
                const subsequentMelodyEntry = parsedMelodyRecords[subsequentIndex];
                totalAccumulatedDuration += subsequentMelodyEntry.duration;
            }
            // Display the final computed duration. Math.round is used here
            // to convert the floating-point sum to an integer, as often expected
            // in competitive programming problems for time values.
            return console.log(Math.round(totalAccumulatedDuration));
        }
    }

    // If the main loop completes without the target melody being found,
    // the original problem implies it should always be found.
    // In cases where it might not be, an explicit `console.log(0)` or an error
    // message could be issued here. For now, adhering to the original's implicit
    // undefined return if not found (though the `return console.log` makes it
    // an early exit).
}

// The following section handles standard input/output operations.
// It reads the entire content from standard input and passes it to our
// `ProcessSongData` function. This part should typically remain unaltered
// in competitive programming environments.
ProcessSongData(require("fs").readFileSync("/dev/stdin", "utf8"));