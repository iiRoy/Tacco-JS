function ProcessInput(rawData) {
    // The raw input string is split into an array of individual lines.
    let lines = rawData.split("\n");

    // The first line contains the total count of song entries.
    const countOfSongs = Number(lines[0]);

    // The title of the song to search for is found at an index relative to the song count.
    let targetSongTitle = lines[countOfSongs + 1];

    // A variable to accumulate the total duration of songs after the target.
    let totalDuration = 0;

    // Iterate through the list of songs, starting from the first actual song entry.
    for (let idx = 1; idx <= countOfSongs; idx++) {
        // Each song line is split into its constituent parts (name and duration).
        const currentLineParts = lines[idx].split(' ');
        const songName = currentLineParts[0]; // Extract the song's name.

        // Check if the current song's name matches the desired target song.
        if (songName === targetSongTitle) {
            // If a match is found, proceed to sum the durations of all subsequent songs.
            for (let subIdx = idx + 1; subIdx <= countOfSongs; subIdx++) {
                // Split the subsequent line to retrieve its duration component.
                const innerLineParts = lines[subIdx].split(' ');
                const songDuration = Number(innerLineParts[1]); // Convert the duration string to a numeric value.
                totalDuration += songDuration; // Add this duration to the running total.
            }
            // After finding the target and summing subsequent durations, print the result and terminate execution.
            return console.log(totalDuration);
        }
    }
}

// The following line should not be altered; it manages reading input from standard I/O and initiating the processing logic.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
