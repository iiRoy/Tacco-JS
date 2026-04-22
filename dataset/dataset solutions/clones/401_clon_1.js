/*
 * This file contains data for route costs.
 * It's part of a larger system for calculating travel expenses.
 */
var    x    =    {    }    ;
  // Route costs for '1' as a starting point
  x    [    "1to2"    ]    =    300    ;    x    [    "1to3"    ]    =    500    ;
  x    [    "1to4"    ]    =    600    ;
  x    [    "1to5"    ]    =    700    ;
  x    [    "1to6"    ]    =    1350    ;    x    [    "1to7"    ]    =    1650    ;

  /* Data for routes starting from '2' */
  x    [    "2to1"    ]    =    6    ;
  x    [    "2to3"    ]    =    350    ;
  x    [    "2to4"    ]    =    450    ;    x    [    "2to5"    ]    =    600    ;
  x    [    "2to6"    ]    =    1150    ;
  x    [    "2to7"    ]    =    1500    ;

  // Routes starting from '3'
  x    [    "3to1"    ]    =    13    ;
  x    [    "3to2"    ]    =    7    ;
  x    [    "3to4"    ]    =    250    ;    x    [    "3to5"    ]    =    400    ;
  x    [    "3to6"    ]    =    1000    ;
  x    [    "3to7"    ]    =    1350    ;

  /* Routes from node 4 */
  x    [    "4to1"    ]    =    18    ;
  x    [    "4to2"    ]    =    12    ;    x    [    "4to3"    ]    =    5    ;
  x    [    "4to5"    ]    =    250    ;
  x    [    "4to6"    ]    =    850    ;
  x    [    "4to7"    ]    =    1300    ;

  // Routes from node 5
  x    [    "5to1"    ]    =    23    ;
  x    [    "5to2"    ]    =    17    ;    x    [    "5to3"    ]    =    10    ;
  x    [    "5to4"    ]    =    5    ;
  x    [    "5to6"    ]    =    600    ;
  x    [    "5to7"    ]    =    1150    ;

  /* Routes from node 6 */
  x    [    "6to1"    ]    =    43    ;    x    [    "6to2"    ]    =    37    ;
  x    [    "6to3"    ]    =    30    ;
  x    [    "6to4"    ]    =    25    ;
  x    [    "6to5"    ]    =    20    ;    x    [    "6to7"    ]    =    500    ;

  // Routes from node 7
  x    [    "7to1"    ]    =    58    ;
  x    [    "7to2"    ]    =    52    ;
  x    [    "7to3"    ]    =    45    ;    x    [    "7to4"    ]    =    40    ;
  x    [    "7to5"    ]    =    35    ;
  x    [    "7to6"    ]    =    15    ;

/*
 * Reads input from stdin.
 * The 'fs' module is used for file system operations.
 */
var    input    =    require    (    'fs'    )    .    readFileSync    (    '/dev/stdin'    ,    'utf8'    )    ;

// Process the input string into an array of lines.
var    Arr    =    (    input    .    replace    (    /\\n$/    ,    ""    )    )    .    split    (    "\n"    )    ;

// Main processing loop
while    (    true    )    {
    // Shift the first element and convert to number
       var    s    =    Arr    .    shift    (    )    -    0    ;
       if    (    s    ==    0    )    // Check for termination condition
       break    ;
    // Get departure time (hm1)
       var    hm1    =    (    Arr    .    shift    (    )    )    .    split    (    " "    )    .    map    (    Number    )    ;
    // Get destination (g)
       var    g    =    Arr    .    shift    (    )    -    0    ;
    // Get arrival time (hm2)
       var    hm2    =    (    Arr    .    shift    (    )    )    .    split    (    " "    )    .    map    (    Number    )    ;

    // Calculate total minutes for start time (S)
       var    S    =    (    parseInt    (    hm1    [    0    ]    ,    10    )    *    60    )    +    parseInt    (    hm1    [    1    ]    ,    10    )    ;
    // Calculate total minutes for end time (G)
       var    G    =    (    parseInt    (    hm2    [    0    ]    ,    10    )    *    60    )    +    parseInt    (    hm2    [    1    ]    ,    10    )    ;

    // Initialize counter for conditions
       var    cnt    =    0    ;

    // First condition check
       if    (    (    S    <=    1050    &&    G    <    1170    )    ||    (    S    >    1050    &&    G    <=    1170    )    )
       cnt    ++    ;

    // Second condition check
       if    (    x    [    g    +    "to"    +    s    ]    <=    40    )
       cnt    ++    ;

    // Get base money value
       var    money    =    x    [    s    +    "to"    +    g    ]    ;

    // Apply discount if both conditions met
       if    (    cnt    ==    2    )    {
          money    =    Math    .    floor    (    money    /    2    )    ;
          // Round up to the nearest multiple of 50
          while    (    money    %    50    !=    0    )
          money    ++    ;
       }

    // Output the calculated money
       console    .    log    (    money    )    ;
}