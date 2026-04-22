'use strict' /* This directive enforces stricter parsing and error handling in the code. */


/*
 * Main function definition.
 * This function takes 'input' as its argument, which is expected to be a string.
 */
function   Main   (   input   )   {

  /*
   * Array 'week' stores the names of the days of the week in order,
   * starting from Sunday.
   */
  const   week   =   [   'SUN'  ,  'MON'  ,  'TUE'  ,  'WED'  ,  'THU'  ,  'FRI'  ,  'SAT'   ]   ;

  /*
   * Array 'days' stores corresponding numerical values.
   * These values represent the number of days remaining until the next Saturday,
   * including the current day.
   * For example, if today is SUN, there are 7 days until SAT (SUN, MON, TUE, WED, THU, FRI, SAT).
   * If today is SAT, there is 1 day (SAT itself).
   */
  const   days   =   [   7  ,  6  ,  5  ,  4  ,  3  ,  2  ,  1   ]   ;


  // The input string is split by newline characters, and the first line is taken.
  // This first line is assumed to be the current day (e.g., 'SUN', 'MON').
  let   today   =   input  .  split  (  "\n"  )  [  0  ]   ;

  // The following line was commented out in the original for debugging purposes.
  // console.log ( { today } ) ; // This would print the value of 'today' to the console.


  // Find the index of the 'today' string within the 'week' array.
  // For instance, if 'today' is 'WED', 'num' will be 3.
  let   num   =   week  .  indexOf  (  today  )   ;

  // Using the obtained index 'num', retrieve the corresponding value from the 'days' array.
  // Then, print this value to the standard output.
  console  .  log  (  days  [  num  ]  )   ;
}


/*
 * This part of the code handles the execution flow.
 * It reads the entire content of standard input, decodes it as UTF-8,
 * and then passes it as an argument to the 'Main' function.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )   ;