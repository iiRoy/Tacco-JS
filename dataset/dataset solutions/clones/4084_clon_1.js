function   main  (  input  )

{
  // First, we process the raw input string.
  // We split it by newline characters to get individual lines.
  // The 'splice(1)' method is used to remove the first element,
  // as it often contains metadata like the number of test cases.
  const   lines   =   input  .  split  (  '\n'  )  .  splice  (  1  )


  /*
   * Next, we transform each remaining line into an array of numbers.
   * Each line is first split by spaces, yielding strings.
   * Then, 'map(n => Number(n))' converts these string representations
   * into actual numerical values.
   * This results in an array of arrays, where each inner array represents a trip.
   */
  const   trips   =   lines  .  map  (  l   =>   l  .  split  (  ' '  )  .  map  (  n   =>   Number  (  n  )  )  )



  // Initialize our state variables for the journey.
  // 'i' serves as the loop counter, tracking the current trip.
  var   i   =   0

  // 't' represents the current time.
  var   t   =   0

  // 'x' and 'y' represent the current coordinates.
  var   x   =   0
  var   y   =   0


  // We iterate through each planned trip.
  while   (  i   <   trips  .  length  )
  {
    // Retrieve the details for the current trip.
    // 'trip' is an array [target_time, target_x, target_y].
    const   trip   =   trips  [  i  ]


    // Calculate the time difference required to reach the next point.
    const   dt   =   trip  [  0  ]   -   t

    // Calculate the absolute difference in x-coordinates.
    const   dx   =   Math  .  abs  (  trip  [  1  ]   -   x  )

    // Calculate the absolute difference in y-coordinates.
    const   dy   =   Math  .  abs  (  trip  [  2  ]   -   y  )


    // Check if it's even possible to reach the destination within the given time.
    // The Manhattan distance (dx + dy) must not exceed the available time (dt).
    if   (  dt   <   dx   +   dy  )
    {
      // If not, it's impossible. Output 'No' and terminate.
      return   console  .  log  (  'No'  )
    }

    // Check the parity condition:
    // The parity of the time difference (dt) must match the parity of the
    // total distance (dx + dy). This ensures that the traveler can
    // always reach the target by moving one unit per second.
    if   (  dt   %   2   ==   (  dx   +   dy  )   %   2  )
    {
      // If the parities don't match, it's impossible. Output 'No' and terminate.
      return   console  .  log  (  'No'  )
    }


    // Update the current time and coordinates to the destination of the current trip.
    t   =   trip  [  0  ]
    x   =   trip  [  1  ]
    y   =   trip  [  2  ]

    // Move to the next trip.
    i  ++
  }

  // If all trips are successfully validated, output 'Yes'.
  return   console  .  log  (  'Yes'  )
}


/*
 * Main execution block:
 * This part reads the input from standard input, typically a file
 * specified as '/dev/stdin' in competitive programming environments.
 * The input is read as UTF-8 encoded text, and then passed to the 'main' function.
 */
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )