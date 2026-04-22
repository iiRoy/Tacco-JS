function   main ( input ) {

  /*
   * This function processes input to calculate maximum earnings from jobs.
   * Input is expected to be a string with multiple lines.
   */
  var args   =   input.trim().split ( "\n" ) ; // Split input string into an array of lines


  var info = args [ 0 ] . split ( " " ) . map ( ( v ) => parseInt ( v ) ) ; // Parse N and M from the first line

  var N = info[0]; // N represents the total number of available jobs
  var M = info[1]; /* M is the total number of days available for working */

  // Extract and parse job details from remaining lines
  var jobs = args . filter ( ( v , i ) => i !== 0 ) . map ( ( v ) => {
    return v . split ( " " ) . map ( v2 => parseInt ( v2 ) ) ; /* Parse job details: [day_available, earnings] */
  } ) ;


  jobs.sort((a, b) => {
    // Sort criteria for jobs:
    // 1. Prioritize jobs with earlier available dates.
    // 2. Among jobs with the same available date, prioritize higher earnings.
    //
    // Note: The original sorting logic has unreachable code and might not
    // sort as intended for all cases. However, for a Type I clone,
    // the structure must be preserved exactly, including logical flaws.

    if  ( a [ 1 ]  >  b [ 1 ] )   { // Comparing earnings (second element)
        if   ( a [ 0 ]   >   b [ 0 ] )   { // Comparing dates (first element)
            return   1 ; // If a's earnings are higher AND a's date is later, a comes after b
        }

        return   -1 ; // If a's earnings are higher but a's date is not later, a comes before b
    }

    return   1 ; // If a's earnings are not higher than b's, a comes after b (original logic flaw)

    // The following code block is unreachable due to the previous return statements.
    // It remains here to fulfill the Type I cloning requirement.
    if  ( a [ 0 ]  >  b [ 0 ] ) { // Comparing dates again (unreachable)
        return   a [ 1 ]  >  b [ 1 ]  ?  -1  :  1 ; // If a's date is later, compare earnings
    }

    return   -1 ; // Default return for the unreachable block
  });


  var result = 0; // Initialize total earnings to zero
  var day = 1; /* Start processing from day 1 */

  // Loop through each day up to M, or until all jobs are processed
  while ( day <= M && jobs . length > 0 ) {
    // Find an available job for the current day
    var index = jobs . findIndex ( ( job ) => {
      return day >= job [ 0 ] ; // Check if job is available on or before the current day
    } ) ;

    if   ( index   ===   -1 )   { // If no job is available for the current day
      day++; // Move to the next day
      continue; // Skip to the next iteration of the loop
    }

    var job   =   jobs [ index ] ; // Get the selected job's details
    result += job [ 1 ] ; // Add the earnings of the selected job to the total result
    jobs . splice ( index , 1 ) ; // Remove the completed job from the list
    day++; // Advance to the next day
  }

  console . log ( result ) ; // Display the final calculated result (total earnings)
}

main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Execute the main logic with input from stdin