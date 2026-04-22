"use strict";

/*
 * This program processes a list of song titles and durations.
 * It calculates the cumulative duration of songs played *after* a specific
 * "last heard" song is encountered in the sequence.
 */

const calculateCumulativePause = ( entryData ) => {

  // First, clean up the input string: remove leading/trailing whitespace
  // and then split it into an array of individual lines.
  entryData = entryData.trim().split('\n');

  // The very first line often contains metadata like total count,
  // but it's not used in this specific calculation.
  const initialItemCount = entryData.shift();

  // The last line specifies the particular item that acts as a trigger.
  const triggeringElement = entryData.pop();

  // This boolean flag controls when duration accumulation should commence.
  let accumulateFlag = false;

  // This variable will store the sum of durations after the trigger.
  let cumulativeDurationSeconds = 0;

  // Iterate over the remaining lines, which represent individual items.
  for ( let currentPosition = 0; currentPosition < entryData.length; ++currentPosition ) {

    // Each line is expected to contain two parts: an item's label and its time value.
    const itemDetails = entryData[currentPosition].split(' ');

    // Extract the label (e.g., song title) from the first part.
    const itemLabel = itemDetails[0];

    // Parse the second part as an integer to get the item's duration.
    const itemTimeValue = Number.parseInt(itemDetails[1], 10);

    // Check if the accumulation process has not yet been initiated.
    if ( !accumulateFlag )
    {
      // If the current item's label matches the designated trigger element...
      if ( itemLabel === triggeringElement ) {
        // ...then set the flag to start accumulation from the next item onwards.
        accumulateFlag = true;
      }
      // In either case (match or no match), if not accumulating, move to the next item.
      continue; // Skip the rest of the loop body for this iteration
    }

    // If the accumulation flag is true, add the current item's time value
    // to the running total.
    cumulativeDurationSeconds += itemTimeValue;
  }

  // Display the final calculated cumulative duration.
  console.log(cumulativeDurationSeconds);
};

// Invoke the primary processing function, feeding it content read from standard input.
calculateCumulativePause( require('node:fs').readFileSync('/dev/stdin', 'utf8') );