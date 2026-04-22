/* This is the main function definition. */
function   main  (   arg   )
{
  // Declare and initialize the variable X by parsing the first argument.
  var   X    =    parseInt  (  arg  [  0  ]  )  ;


  /*
   * Initialize the principal amount.
   * Starting amount is 100.
   */
  var   amt    =    100  ;

  // Initialize the year counter.
  var   year    =    0  ;

  /*
   * The main loop calculates the number of years
   * until the amount 'amt' exceeds 'X'.
   */
  while  (  amt    <    X  )
  {
    // Apply a 1% interest rate.
    amt   *=   1.01   ;

    // Floor the amount to the nearest integer, as per problem specification.
    amt    =    Math  .  floor  (  amt  )  ;

    // Increment the year counter for each iteration.
    year   ++   ;
  }

  // Output the final calculated number of years to the console.
  console  .  log  (  year  )  ;
}


/*
 * This section handles the input reading and
 * calls the main function with the processed data.
 */
main  (
  require  (  "fs"  )
    .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )
    .  trim  (  )
    .  split  (  "\n"  )
)  ; // End of main function call.