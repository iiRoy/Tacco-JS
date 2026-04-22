/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates variations in whitespace and comments only.
 * All functional aspects, variable names, and logic remain identical.
 */
"use strict"; /* Enforces strict mode for cleaner code and error handling. */

/*
 * The Main function processes the input data to calculate total sleep time.
 * It reads a list of music tracks and their durations, then calculates
 * the total duration of music played after a specific "last listened" track.
 *
 * @param {string} input - The raw input string containing music data,
 *                         where each line represents a music track.
 */
const    Main    =    input    =>    {
    // First, preprocess the raw input string: remove leading/trailing whitespace
    // and split it into an array of lines, each representing a music entry.
    input    =    input.trim().split("\n");

    // The first line often contains the total count of music tracks.
    // We remove it from the array, but its value is not used in this specific calculation.
    const    musicCount    =    input.shift();

    // The last line of the input represents the title of the last music track
    // listened to before the person fell asleep. This is our reference point.
    const    lastListenedMusic    =    input.pop();

    // Initialize a flag to track when we should start accumulating sleep time.
    // It becomes true once 'lastListenedMusic' is encountered.
    let    startSleep    =    false;

    // Initialize an accumulator for the total sleep time in seconds.
    let    totalSleepTime    =    0;

    // Iterate through the remaining music entries in the array.
    // These are the tracks played after the 'musicCount' and before 'lastListenedMusic'.
    for    (let    i    =    0;    i    <    input.length;    i++)    {
        // Each music entry is a string like "Title Duration".
        // Split it by space to get the title and duration separately.
        const    musicData    =    input[i].split(" ");

        // Extract the title of the current music track.
        const    title    =    musicData[0];

        // Parse the duration of the current music track into an integer.
        // The radix (10) is specified for safe parsing.
        const    sec    =    parseInt(musicData[1],    10);

        // Check if the 'startSleep' flag is currently false.
        // This means we are still looking for the 'lastListenedMusic' track.
        if    (    !startSleep    )    {
            // If the current music title matches the 'lastListenedMusic' title,
            // it means we have found our reference point, and sleep tracking should begin.
            if    (    title    ===    lastListenedMusic    )    {
                startSleep    =    true; // Set the flag to true.
            }
            // Regardless of whether 'startSleep' was just set or not,
            // we continue to the next iteration because we only count music
            // *after* the 'lastListenedMusic' track.
            continue;
        }

        // If 'startSleep' is true (meaning we've passed the 'lastListenedMusic' track),
        // then accumulate the duration of the current music track into 'totalSleepTime'.
        totalSleepTime    +=    sec;
    }

    // After processing all relevant music tracks, print the final calculated
    // total sleep time to the console.
    console.log(    totalSleepTime    );
}; // End of the Main function definition.

// This part of the code handles reading the input from standard input
// and then passing it to the Main function for processing.
// It uses Node.js's 'fs' module to read the file '/dev/stdin'.
Main(    require("fs").readFileSync("/dev/stdin",    "utf8")    );

/*
 * End of program execution.
 * This code adheres strictly to the Type I clone definition,
 * ensuring logical and structural identity while varying
 * whitespace and comments extensively.
 */