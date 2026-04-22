/*
 * This JavaScript code processes input data
 * to determine a specific result based on a series of operations.
 * It reads from standard input, parses data, and performs calculations.
 *
 * The overall goal is to simulate some kind of resource allocation or scoring system
 * and then identify the top-ranked entity.
 */

//  Import the 'fs' (file system) module to read input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// Process the raw input string: trim leading/trailing whitespace and split into an array of lines.
var arr = input.trim().split("\n");

// Extract initial parameters from the first line of the input array.
// The first line is shifted off, split by space, and then each part is converted to a Number.
var nrl = arr.shift().split(" ").map(Number);

// 'n' represents the number of entities or items.
var n = nrl[0];
// 'L' represents a limit or a total value, extracted from the third element of nrl.
var L = nrl[2];

// 't' is an array that will store information about each entity.
// It's initialized as an empty array.
var t = [];

// 'max' keeps track of the current maximum value and the index of the entity holding it.
// Initialized to [index, value].
var max = [0, 0];

// 'time' is a cumulative time counter for events.
var time = 0;


/*
 * Initialize the 't' array for each of the 'n' entities.
 * Each entity 'i' gets an array [score, duration, original_index].
 * score (t[i][0]) starts at 0.
 * duration (t[i][1]) starts at 0.
 * original_index (t[i][2]) is 'i'.
 */
for (var i = 0; i < n; i++) t[i] = [0, 0, i];


// Append a special entry to the 'arr' array.
// This entry seems to mark an end condition or a final event.
arr.push([1, L, 0].join(" "));


// Iterate over each remaining entry in the 'arr' array.
// Each entry represents an event or an update.
arr.forEach(function (v) {
    // Parse the current event string: split by space and convert parts to Numbers.
    v = v.split(" ").map(Number);

    // 'd' is the index of the entity affected by this event (0-indexed).
    var d = v[0] - 1;
    // 'T' is the timestamp or target time for this event.
    var T = v[1];
    // 'x' is the value change (positive for increase, negative for decrease).
    var x = v[2];

    // Update the duration for the currently 'max' entity.
    // The duration is increased by the time elapsed since the last event.
    t[max[0]][1] += T - time;
    // Update the global time to the current event's timestamp.
    time = T;

    // Apply the score change 'x' to the affected entity 'd'.
    t[d][0] += x;

    /*
     * Logic for handling positive score changes (x > 0).
     * This section updates the 'max' entity if a new maximum is found.
     */
    if (x > 0) {
        // If the current entity's new score is strictly greater than the current maximum.
        if (t[d][0] > max[1]) max = [d, t[d][0]];
        // If the current entity's new score is equal to the current maximum,
        // and its index 'd' is less than or equal to the current max entity's index.
        // This handles ties by preferring the entity with the smaller original index.
        else if (t[d][0] == max[1] && d <= max[0]) max = [d, t[d][0]];
    }


    /*
     * Logic for handling negative score changes (x < 0).
     * When a negative change occurs, the 'max' entity needs to be re-evaluated
     * across all entities, as the previous 'max' might no longer hold the top spot.
     */
    if (x < 0) {
        var MAX = 0; // Temporary variable to store the highest score found so far during re-evaluation.
        var m = 0;   // Temporary variable to store the index of the entity with the highest score.

        // Iterate through all entities to find the new maximum score and its corresponding index.
        t.forEach(function (V, index) {
            // If the current entity's score 'V[0]' is greater than the current highest 'MAX'.
            if (MAX < V[0]) {
                MAX = V[0]; // Update MAX.
                m = index;  // Update index 'm'.
            }
        });

        // After re-evaluating all entities, set the global 'max' to the newly found maximum.
        max = [m, t[m][0]];
    }
});


// Sort the 't' array based on specific criteria.
// The sorting function compares two entities 'a' and 'b'.
t.sort(function (a, b) {
    // Primary sort key: if durations (t[i][1]) are equal,
    // then sort by original index (t[i][2]) in ascending order.
    if (a[1] == b[1]) return a[2] - b[2];
    // Secondary sort key: sort by duration (t[i][1]) in descending order.
    else return b[1] - a[1];
});


// Output the original index of the top-ranked entity (after sorting), plus one
// to convert from 0-based index to 1-based output.
console.log(t[0][2] + 1);