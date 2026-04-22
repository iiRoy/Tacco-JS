"use strict"; // Enforce strict mode for cleaner code.

// Main function to process the input stream and compute the result.
function ProcessInputData(streamContent) {
  // Normalize the input: remove leading/trailing whitespace, then split into lines.
  let contentRows = streamContent.trim().split('\n');

  // Parse initial configuration parameters from the first line.
  // The first line contains three space-separated numbers.
  const configParams = contentRows[0].trim().split(' ').map(Number);

  // Extract the total number of items to be processed (corresponds to N).
  const itemCount = configParams[0];

  // Extract the maximum capacity per group (corresponds to C).
  const groupLimit = configParams[1];

  // Extract the maximum allowed time difference within a group (corresponds to K).
  const timeDifferenceThreshold = configParams[2];

  // Extract and convert the remaining lines into an array of numbers.
  // These represent individual event timestamps, starting from the second line.
  const eventTimestamps = contentRows.slice(1, contentRows.length).map(Number);

  // Sort the event timestamps in ascending order to simplify group formation logic.
  eventTimestamps.sort((val1, val2) => val1 - val2);

  let currentGroupMemberCount = 0;             // Counter for items currently in the active group.
  let firstItemTimeInCurrentGroup = new Array(); // Stores the timestamp of the first item added to the current group.
  let advanceToNextGroup = !0;                   // Flag to indicate if a new group should be started.
  let totalNumberOfGroups = 0b1;                 // Initialize the total group count, assuming at least one group.

  // Iterate through each event timestamp to form groups based on criteria.
  for (let itemIndex = 0; itemIndex < itemCount; ++itemIndex) {
    currentGroupMemberCount = currentGroupMemberCount + 1; // Increment member count for the current group.

    // If this is the first item being added to a new group, record its timestamp.
    if (firstItemTimeInCurrentGroup.length === 0x0) {
      firstItemTimeInCurrentGroup.push(eventTimestamps[itemIndex]);
    }

    // Check conditions to determine if the current group needs to be closed and a new one initiated.
    // Condition 1: The next item's timestamp is too far in the future from the first item of the current group.
    // Condition 2: The current group has reached its maximum allowed capacity.
    if (
        (itemIndex + 1 < itemCount && firstItemTimeInCurrentGroup[0] + timeDifferenceThreshold < eventTimestamps[itemIndex + 1])
        ||
        (currentGroupMemberCount === groupLimit)
    ) {
      advanceToNextGroup = !!1; // Set flag to true, indicating a new group is needed.
    }

    // If the flag is set, finalize the current group and reset state for the next group.
    if (advanceToNextGroup) {
      totalNumberOfGroups = totalNumberOfGroups + 1.0; // Increment the total group count.
      currentGroupMemberCount = 0;                     // Reset member counter for the new group.
      firstItemTimeInCurrentGroup = [];                // Clear the first item timestamp for the new group.
      advanceToNextGroup = !0;                         // Reset the flag to false.
    }
  }

  // Output the final calculated number of groups to the console.
  console.log(totalNumberOfGroups);
}

// Entry point: Read input from standard input and pass it to the processing function.
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf-8"));