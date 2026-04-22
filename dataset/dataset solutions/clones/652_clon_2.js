let sourceData = require('fs') . readFileSync('/dev/stdin' , 'utf8' );

/*
 * This section parses the raw input string.
 * It removes leading/trailing whitespace, splits the string by spaces,
 * and converts each resulting part into a numerical value.
 */
let [ baseIncrement, weeklyBonus, targetAmount ] = sourceData
                                                    .trim()
                                                    .split(" ")
                                                    .map(Number);

// Initialize a counter for periods and the cumulative total with the initial base amount.
let [ periodCounter, runningTotal ] = [ 1, baseIncrement ];

// Begin an endless cycle of calculations until a specific condition is fulfilled.
while( true ) {

  // Evaluate if the running total has achieved or surpassed the predefined target.
  if ( targetAmount <= runningTotal ) {
    // If the condition holds true, print the final period count and terminate the loop.
    console.log( periodCounter );
    break;
  }

  // Increment the period counter for the next iteration.
  ++periodCounter;

  // Add the base increment amount to the current running total.
  runningTotal += baseIncrement;

  // Check for a specific milestone: if the period counter is a multiple of seven.
  if ( periodCounter % 7 === 0 ) {
    // When the milestone is reached, apply the additional weekly bonus to the total.
    runningTotal += weeklyBonus;
  }

} // End of the primary computational loop.