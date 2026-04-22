/* This is a self-executing anonymous function
   that processes input from standard input. */
(  function (   input   ) {

  // Declare variables at the beginning of the function scope
  var inputs = input.  replace(   /\r/g,   ''   ) .   split(   "\n"   ),
      n,    spare,    count;


  // The main processing loop, continues indefinitely until a break condition is met.
  while (  true  ) {
    // Initialize count for the current iteration
    count   =   0;

    // Parse the next input line as an integer
    n   =   parseInt(   inputs.  shift()   );

    // Check for the termination condition
    if   (  n   ===   0  ) {
      /* If 'n' is 0, it signifies the end of input
         or a specific termination signal. */
      break;
    }

    // Calculate the 'spare' value based on 'n'
    spare   =   1000   -   n;

    // Inner loop to process the 'spare' value
    while   (  spare   !=   0  ) {
      // Check for divisibility by 500
      if   (  spare   %   500   ==   0  ) {
        spare   -=   500;
      }
      // Check for divisibility by 100
      else   if   (  spare   %   100   ==   0  ) {
        spare   -=   100;
      }
      // Check for divisibility by 50
      else   if   (  spare   %   50   ==   0  ) {
        spare   -=   50;
      }
      // Check for divisibility by 10
      else   if   (  spare   %   10   ==   0  ) {
        spare   -=   10;
      }
      // Check for divisibility by 5
      else   if   (  spare   %   5   ==   0  ) {
        spare   -=   5;
      }
      // Check for divisibility by 1 (this will always be true if spare > 0)
      else   if   (  spare   %   1   ==   0  ) {
        spare   -=   1;
      }
      // Increment the counter in each step
      count++;
    }
    // Log the final count for the current 'n'
    console.  log(   count   );
  }

} )  (  require(   "fs"   ) .   readFileSync(   "/dev/stdin",   "utf8"   )  )  ;