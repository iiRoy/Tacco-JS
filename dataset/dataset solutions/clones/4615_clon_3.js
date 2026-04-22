function processInputData(rawDataContent) {
  // Parse the input string into individual lines.
  // Using .trim() to handle potential leading/trailing whitespace in the input.
  const inputLines = rawDataContent.trim().split("\n");

  // Extract the first line which contains N (totalEvents) and T (fixedEffectDuration).
  const firstLineComponents = inputLines[0].split(" ");

  // Convert string components to integer numbers.
  // Using parseInt with radix 10 for explicit conversion.
  const totalEvents = parseInt(firstLineComponents[0], 10);
  const fixedEffectDuration = parseInt(firstLineComponents[1], 10);

  // If there's no second line for timestamps, initialize an empty array.
  // Otherwise, parse the second line into an array of numbers representing event start times.
  const eventStartTimestamps = inputLines[1]
    ? inputLines[1].split(" ").map(Number)
    : [];

  // Initialize a special accumulator variable.
  // This variable does not directly represent the final answer but is an intermediate calculation state.
  let runningCumulativeValue = 0;

  // Handle edge case where there are no events (N=0).
  // In this scenario, the original code would output 'T' (fixedEffectDuration).
  // The loop condition (1 < 0) would be false, so runningCumulativeValue remains 0.
  // The final output (0 + fixedEffectDuration) correctly yields fixedEffectDuration.
  // This explicit check ensures clarity, though the loop handles it implicitly for N=0 or N=1.
  if (totalEvents <= 1) {
    console.log(fixedEffectDuration);
    return;
  }

  // Iterate through the event timestamps starting from the second event (index 1).
  // Each iteration compares the current event with its immediate predecessor.
  for (let currentEventIndex = 1; currentEventIndex < totalEvents; ++currentEventIndex) {
    const currentEventTimestamp = eventStartTimestamps[currentEventIndex];
    const previousEventTimestamp = eventStartTimestamps[currentEventIndex - 1];

    // Calculate the time difference (gap) between the current and previous event.
    const timeInterval = currentEventTimestamp - previousEventTimestamp;

    // Apply the core logic:
    // If the time interval is less than the fixed effect duration, it means the
    // effect from the previous event was still active when the current event occurred.
    // In this case, the running cumulative value is "reset" or updated to the current event's timestamp.
    if (timeInterval < fixedEffectDuration) {
      runningCumulativeValue = currentEventTimestamp;
    }
    // If the time interval is equal to or greater than the fixed effect duration,
    // it implies the previous effect had fully expired before the current event.
    // A full fixed duration is then added to the running cumulative value.
    else {
      runningCumulativeValue += fixedEffectDuration;
    }
  }

  // The final answer is obtained by adding the fixed effect duration to the
  // accumulated value calculated within the loop. This final addition
  // effectively accounts for the initial duration of the very first event,
  // or the last full duration in a sequence.
  console.log(runningCumulativeValue + fixedEffectDuration);
}

// Standard input handling:
// Acquire the file system module.
const standardFileSystem = require("fs");
// Define the path for reading standard input in a Unix-like environment.
const standardInputFilePath = "/dev/stdin";

// Read the entire content of the standard input file as a UTF-8 string.
const rawInputContentFromFile = standardFileSystem.readFileSync(standardInputFilePath, "utf8");

// Execute the primary processing function with the obtained input.
processInputData(rawInputContentFromFile);