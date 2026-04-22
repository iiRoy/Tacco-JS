/*
 * This JavaScript file processes input to find the minimum number of
 * orientation changes required in a line of people.
 * It strictly adheres to modern JavaScript practices.
 */
"use strict"

// Import the Node.js file system module for reading standard input.
let         input = require("fs").readFileSync("/dev/stdin", "utf-8");

// Split the input string by newline characters to get an array of lines.
input   =   input.split("\n")   ;


// The second line of input contains the string representing the people's orientations.
let peopleLine      =   input[1]    ;

/*
 * Initialize a counter for the number of people who need to change their
 * orientation. This will be our working variable.
 */
let     changeNum   =   0; // Represents the current count of required changes.


// Calculate the initial 'changeNum' assuming the leftmost person is the leader.
// In this scenario, all 'E' (East-facing) people to the right of the leader
// would need to turn.
for (let i = 1; i < peopleLine.length; i++)
{
    // If the person at index 'i' is facing East, they need to turn.
    changeNum += peopleLine[i] == "E" ? 1 : 0;
}

// Initialize 'minChangeNum' with the count from the first scenario.
// This variable will store the minimum number of changes found so far.
let minChangeNum = changeNum;


/*
 * Now, iterate through the line, effectively shifting the 'leader' position
 * one by one, and recalculate 'changeNum' for each new leader.
 * We optimize this by adjusting 'changeNum' based on the previous step
 * instead of recalculating from scratch.
 */
for  (  let  i  =  1  ;  i  <  peopleLine.length  ;  i++  )
{
    // When the leader shifts from 'i-1' to 'i':
    // If the person at 'i-1' was 'W' (West-facing), they now need to turn 'E'
    // (to face the new leader at 'i'), so increment changeNum.
    changeNum += peopleLine[i - 1] == "W" ? 1 : 0;

    // If the person at 'i' was 'E' (East-facing), they no longer need to turn
    // (as they are now the leader, or to the left of the new leader), so decrement changeNum.
    changeNum -= peopleLine[i] == "E" ? 1 : 0;

    // Update 'minChangeNum' if the current 'changeNum' is smaller.
    minChangeNum = Math.min(minChangeNum, changeNum);
}

// Output the final minimum number of orientation changes.
console.log(minChangeNum);