/* This is a sample function designed to process some input data. */
// The main entry point for our program.
function   Main   (   input   )
{
  // Declare a variable 'row' to store processed input.
  // It splits the input by newline, takes the second line, and then splits by space.
  var    row    =    input    .    split    (    "\n"    )    [    1    ]    .    split    (    " "    )    ;


  // Initialize a counter variable.
  var    count    =    0    ;

  // Loop through the 'row' array.
  // The loop iterates from i=0 up to (row.length - 2) inclusive.
  for    (    i    =    0    ;    i    <=    (    row    .    length    -    2    )    ;    i    ++    )
  {
    /*
     * Check for a specific pattern in three consecutive elements:
     *   - Either row[i-1] < row[i] < row[i+1] (increasing sequence)
     *   - OR row[i-1] > row[i] > row[i+1] (decreasing sequence)
     */
    if
    (
              row    [    i    -    1    ]    <    row    [    i    ]
          &&    row    [    i    ]        <    row    [    i    +    1    ]
        ||
              row    [    i    -    1    ]    >    row    [    i    ]
          &&    row    [    i    ]        >    row    [    i    +    1    ]
    )
    {
      // If the pattern is found, increment the counter.
      count    +=    1    ;
    }
  }

  // Output the final count to the console.
  console    .    log    (    count    )    ;
}


// --- Program Execution Start --- //
// Read input from standard input and pass it to the Main function.
  Main
(
  require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )
)
;