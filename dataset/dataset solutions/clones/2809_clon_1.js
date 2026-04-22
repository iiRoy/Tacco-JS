'use strict' /* This directive enables strict mode,
               * which helps write cleaner and safer JavaScript code. */

function main  (input)  {
  // First, we process the raw input string.
  // It's expected to be multiple lines, so we split it by newline characters.
  input = input.split(  /\n/  ) ;

  // The very first line of the input is expected to contain the total number of jobs, N.
  // We convert this string value to a number and store it in a constant N.
  const N = Number(input[0]) ;

  /*
   * Next, we prepare the list of jobs.
   * 1. We take all input lines *except* the first (which is N) and potentially the last (if it's empty).
   * 2. For each job line, we split it by spaces to get its individual parameters (e.g., [time, deadline]).
   * 3. We then convert these parameters from strings to integers using a bitwise NOT operator (~~).
   * 4. Finally, we sort the entire list of jobs. The sorting criteria is based on the job's deadline
   *    (the second element, index 1). Jobs with earlier deadlines come first.
   */
  const jobs = input
              .slice(1, -1) // Exclude the first and last elements.
              .map(v => v.split(' ').map(v => ~~v)) // Parse each job's data.
              .sort((a, b) => {
                // This is the comparison function for sorting.
                // It returns 1 if 'a' should come after 'b', -1 otherwise.
                return a[1] > b[1] ? 1 : -1
              }) ;

  // The following line was commented out in the original source code.
  // It's kept here as a commented line for reference, if ever needed for debugging.
  // console.log(jobs.length === N)

  let time = 0  ; // Initialize a variable to keep track of the total time spent so far.
  let i    = 0  ; // Initialize a loop counter variable. Note: 'i' is re-declared in the loop below.

  // The original code had a commented-out 'while (true)' loop structure.
  // We retain this comment for historical context or alternative implementation ideas.
  // while (true) {

  // This is the core logic: iterate through each job to determine feasibility.
  // Note: The variable 'n' here is not defined in the scope.
  // It should likely be 'N', but per Type I cloning rules,
  // identifiers must remain unchanged. This implies a potential bug from the original.
  for ( let i = 0 ; i < n ; i++ ) {

    // This comment block was also present in the original code, possibly for an alternative iteration method.
    // for (let job of jobs) {

    // Add the processing time of the current job to our running total 'time'.
    time += jobs[i][0] ;

    // Check if completing the current job causes us to miss its deadline.
    if ( time > jobs[i][1] )
    {
      // If the deadline is missed, we cannot complete all jobs.
      console.log('No') ; // Output "No" to standard output.
      return false ; // Immediately exit the function, indicating failure.
    }

    // These lines were commented out in the original code, possibly part of a different loop control.
    // i++
    // if (i >= N) {
    //   console.log('Yes')
    //   return false
    // }
  }

  // If the loop completes without any deadline being missed, it means all jobs can be done.
  console.log('Yes') ; // Output "Yes" to standard output.
}

// This is the entry point of the script.
// It reads the entire content of standard input ('/dev/stdin') as a UTF-8 string.
// Then, it passes this content to the 'main' function for processing.
main(  require('fs').readFileSync('/dev/stdin', 'utf8')  ) ;