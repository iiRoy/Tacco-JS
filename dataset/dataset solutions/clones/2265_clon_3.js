"use strict"; // Enforce strict parsing and error handling for cleaner code.

// This file processes a playlist to calculate total duration after a specific track.
// The initial 'big-integer' comment was a placeholder for potential future enhancements,
// but it's not relevant to the current logic.

/**
 * Parses a single line of track data into an object.
 * @param {string} line - The raw string line containing track title and duration.
 * @param {string} delimiter - The character used to separate title and duration.
 * @param {number} radix - The base for parsing the duration string into an integer.
 * @returns {{title: string, duration: number} | null} An object with track title and duration, or null if parsing fails.
 */
const extractTrackDetails = (line, delimiter, radix) => {
  if (typeof line !== 'string' || line.trim().length === 0) {
    return null;
  }

  const parts = line.split(delimiter);
  if (parts.length < 2) {
    // console.warn(`Invalid track line format: ${line}`); // Optional: Add logging for malformed lines
    return null;
  }

  const trackTitle = parts[0].trim();
  const rawDuration = parts[1].trim();
  const trackDuration = parseInt(rawDuration, radix);

  // Validate the parsed duration to ensure it's a non-negative number.
  if (isNaN(trackDuration) || trackDuration < 0) {
    // console.warn(`Invalid duration for track '${trackTitle}': ${rawDuration}`); // Optional: Add logging
    return null;
  }

  return { title: trackTitle, duration: trackDuration };
};

const ProcessMediaPlaylist = (rawPlaylistData) => {
  // Define constants for clarity and potential easy modification.
  const LINE_DELIMITER = "\n";
  const FIELD_DELIMITER = " ";
  const PARSE_RADIX = 10;
  const MIN_PLAYLIST_LINES = 2; // Requires at least a track count line and a target track line.

  // Initial input sanitization and splitting into individual lines.
  const playlistLines = rawPlaylistData.trim().split(LINE_DELIMITER);

  // Validate the minimum number of lines for a meaningful playlist.
  if (playlistLines.length < MIN_PLAYLIST_LINES) {
    console.error("Insufficient playlist data provided. Expected at least track count and target track.");
    return; // Early exit for invalid input.
  }

  // The first line typically contains the total count of tracks.
  // Although present in the input, this specific value is not utilized in the
  // current logic for calculating total playback duration.
  const playlistMetadataLine = playlistLines[0];

  // The very last line of the input specifies the title of the target track.
  const targetTrackIdentifier = playlistLines[playlistLines.length - 1];

  // The actual track entries are located between the first metadata line and the last target track line.
  // We extract these using slice to avoid modifying the original array and to iterate only over relevant data.
  const trackListing = playlistLines.slice(1, playlistLines.length - 1);

  let isAccumulationActive = false; // This flag controls when track durations begin to accumulate.
  let totalPlaybackDuration = 0; // This variable accumulates the total duration in seconds.

  // Iterate through each track entry in the processed list.
  for (let currentTrackIndex = 0; currentTrackIndex < trackListing.length; currentTrackIndex++) {
    const rawTrackLine = trackListing[currentTrackIndex];

    // Utilize the helper function to robustly parse track details from the current line.
    const trackDetails = extractTrackDetails(rawTrackLine, FIELD_DELIMITER, PARSE_RADIX);

    // If parsing fails for any reason (e.g., malformed line, invalid duration), skip this entry.
    if (trackDetails === null) {
      // console.warn(`Skipping malformed or invalid track entry at index ${currentTrackIndex}: "${rawTrackLine}"`);
      continue;
    }

    // Destructure the parsed track details for easier access.
    const { title: currentTrackTitle, duration: trackDurationInSeconds } = trackDetails;

    // Check if the duration accumulation process has been activated yet.
    if (!isAccumulationActive) {
      // If not active, we check if the current track matches our target.
      if (currentTrackTitle === targetTrackIdentifier) {
        isAccumulationActive = true; // Activate accumulation for all subsequent tracks.
      }
      // Continue to the next iteration, as tracks before (and including) the target
      // track should not have their durations added to the total.
      continue;
    }

    // If accumulation is active (i.e., we are past the target track),
    // add the current track's duration to the running total.
    totalPlaybackDuration += trackDurationInSeconds;
  }

  // Output the final calculated playback duration to the console.
  console.log(totalPlaybackDuration);
};

// Entry point: Read input from standard input and pass it to the main processing function.
// This assumes the script is run in an environment like Node.js where 'fs' module is available.
ProcessMediaPlaylist(require("fs").readFileSync("/dev/stdin", "utf8"));