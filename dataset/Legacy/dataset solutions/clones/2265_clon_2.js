"use strict";
// This module processes input data to calculate a specific duration.

const ProcessInputData = (rawInputString) => {
  // Normalize input by trimming whitespace and splitting into individual lines.
  let processedLines = rawInputString.trim().split("\n");

  // Extract the first line, which might represent a count (though not used in calculation).
  const initialLineCount = processedLines.shift();

  // Extract the last line, which is the title of the target song.
  const targetSongTitle = processedLines.pop();

  // Initialize a flag to indicate when to start accumulating time.
  let isAccumulatingTime = false;

  // Initialize a variable to store the total accumulated duration.
  let totalAccumulatedSeconds = 0;

  // Iterate through the remaining lines, each representing a music track.
  for (let lineIndex = 0; lineIndex < processedLines.length; lineIndex++) {
    // Split each line by space to get track details (title and duration).
    const currentTrackDetails = processedLines[lineIndex].split(" ");

    // Extract the track name from the details.
    const trackName = currentTrackDetails[0];

    // Parse the track duration from the details, ensuring it's an integer.
    const trackDuration = parseInt(currentTrackDetails[1], 10);

    // If time accumulation has not yet started:
    if (!isAccumulatingTime) {
      // Check if the current track's name matches the target song title.
      if (trackName === targetSongTitle) {
        // If it matches, set the flag to true to begin accumulation from the next track.
        isAccumulatingTime = true;
      }
      // Continue to the next iteration without accumulating time in this step.
      continue;
    }

    // If time accumulation has started, add the current track's duration to the total.
    totalAccumulatedSeconds += trackDuration;
  }

  // Output the final calculated total accumulated duration.
  console.log(totalAccumulatedSeconds);
};

// Read input from standard input and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
