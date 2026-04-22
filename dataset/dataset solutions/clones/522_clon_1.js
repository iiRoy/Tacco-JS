// This script reads input from stdin, processes it, and outputs a result.
// It appears to simulate some kind of event tracking or resource management.
var input = require('fs') .readFileSync('/dev/stdin', 'utf8') ;

// Trim whitespace and split the input into an array of lines.
var arr = input .trim() .split("\n") ;

// Parse the first line to get n, R, and L values.
// R is not used in the original code, hence not explicitly extracted.
var nrl = arr .shift() .split(" ") .map(Number) ;

// Extract 'n' - likely the number of entities or initial items.
var n = nrl[0] ;

// Extract 'L' - likely a length or limit.
var L = nrl[2] ;

// Initialize an array 't' to store information about 'n' entities.
// Each entity 'i' will have t[i] = [current_value, total_time_at_max, original_index].
var t = [] ;

// 'max' stores the index of the entity with the current maximum value, and that maximum value itself.
// [entity_index, current_max_value]
var max = [0, 0] ;

// 'time' tracks the current simulation time.
var time = 0 ;

// Initialize 't' for each of the 'n' entities.
// t[i][0] will store a value, t[i][1] will store accumulated time, t[i][2] is original index.
for ( var i = 0 ; i < n ; i++ ) {
  t[i] = [0, 0, i] ;
}

// Add a final event to the array. This acts as a sentinel or a concluding event.
// The values (1, L, 0) and their meaning are context-dependent.
arr .push( [1, L, 0] .join(" ") ) ;

// --- Main event processing loop ---
// Iterate through each event in the 'arr' array.
for ( var i = 0 ; i < arr .length ; i++ ) {

  // Parse the current event line into an array of numbers.
  var v = arr[i] .split(" ") .map(Number) ;

  // 'd' is the index of the entity affected by this event (0-indexed).
  var d = v[0] - 1 ;

  // 'T' is the timestamp of the current event.
  var T = v[1] ;

  // 'x' is the change value for the entity 'd'.
  var x = v[2] ;

  // Accumulate time for the entity that was previously at 'max'.
  // This calculates how long the previous 'max' entity held its maximum status.
  t[max[0]][1] += T - time ;

  // Update the simulation time to the current event's timestamp.
  time = T ;

  // Apply the change 'x' to the value of entity 'd'.
  t[d][0] += x ;

  // --- Logic to update 'max' entity based on event 'x' ---
  if ( x > 0 ) { // If 'x' is positive, value increased.

    // If the new value of entity 'd' is greater than the current maximum.
    if ( t[d][0] > max[1] ) {
      max = [d, t[d][0]] ; // Update 'max' to this entity.
    }
    // If the new value of entity 'd' is equal to the current maximum,
    // and its index 'd' is smaller (tie-breaking rule).
    else if ( t[d][0] == max[1] && d <= max[0] ) {
      max = [d, t[d][0]] ; // Update 'max' to this entity.
    }
  }
  else if ( x < 0 && max[0] == d ) { // If 'x' is negative AND the affected entity 'd' was the current 'max'.
    // The current max entity's value decreased, so we need to find the new maximum among all entities.

    var MAX = 0 ; // Temporary variable to find the new maximum value.
    var m = 0 ;   // Temporary variable to find the index of the new maximum entity.

    // Iterate through all entities to find the one with the highest current value.
    for ( var j = 0 ; j < t .length ; j++ ) {

      if ( MAX < t[j][0] ) {
        m = j ;             // Update index 'm' if a larger value is found.
        MAX = t[j][0] ;     // Update 'MAX' value.
      }
    }
    max = [m, t[m][0]] ; // Set the global 'max' to the newly found maximum entity.
  }
}

// --- Final calculation to find the entity with the most accumulated time at 'max' ---
var MAX = 0 ; // Variable to store the maximum accumulated time.
var m = 0 ;   // Variable to store the index of the entity with maximum accumulated time.

// Iterate through all entities to find which one spent the most time as the 'max' entity.
for ( var i = 0 ; i < t .length ; i++ ) {

  // If the current entity's accumulated time is greater than the recorded MAX.
  if ( MAX < t[i][1] ) {
    m = i ;             // Update 'm' to this entity's index.
    MAX = t[i][1] ;     // Update 'MAX' to this entity's accumulated time.
  }
}

// Output the 1-indexed result (entity index + 1).
console .log(m + 1) ;