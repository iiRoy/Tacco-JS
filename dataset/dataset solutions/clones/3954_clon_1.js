/*
 * This JavaScript function processes input data
 * to calculate some costs and then output derived values.
 *
 * It's designed to be invoked by a standard input/output mechanism.
 */
function     Main  (  input  )
{
    // The first element of the input array is parsed as the integer 'n'.
    var    n    =    +  (  input [  0  ]  )    ;

    // The second element is split by one or more whitespace characters
    // to form an array of 'possibilities' or positions.
    var    poss    =    input [  1  ]  .  split  (  /  [  \s  ]  +  /  )    ;

    // Initialize an empty array to store cost differences.
    var    cost    =    [  ]    ;

    // Initialize an accumulator for total absolute cost.
    var    accum    =    0    ;

    // Initialize 'x' which represents the current position, starting at 0.
    var    x    =    0    ;

    // Loop through 'n' elements to calculate costs and accumulate.
    for       (    var    i    =    0    ;    i    <    n    ;    ++  i    )
    {
        // Parse the current 'possibility' as a number 'y'.
        var    y    =    +  (  poss [  i  ]  )    ;

        // Calculate the difference between current 'x' and 'y', then push to 'cost' array.
        cost  .  push  (  x    -    y  )    ;

        // Add the absolute difference to the accumulator.
        accum    +=    Math  .  abs  (  x    -    y  )    ;

        // Update 'x' to the new position 'y'.
        x    =    y    ;
    }

    // After the loop, calculate the cost from the last 'x' to 0.
    cost  .  push  (  x    -    0  )    ;

    // Add the absolute value of this final cost to the accumulator.
    accum    +=    Math  .  abs  (  x    -    0  )    ;


    // Now, iterate again to print the final calculated values.
    for    (    var    i    =    0    ;    i    <    n    ;    ++  i    )
    {
        // This complex expression calculates a specific value based on 'accum' and adjacent costs.
        // It essentially removes two absolute costs and adds back the absolute sum of those costs.
        // This is a common pattern for calculating total cost when an intermediate stop is removed.
        console  .  log  (  `  ${  accum    -    Math  .  abs  (  cost [  i  ]  )    -    Math  .  abs  (  cost [  i    +    1  ]  )    +    Math  .  abs  (  cost [  i  ]    +    cost [  i    +    1  ]  )  }  `  )    ;
    }
}

// Do not modify the following line. It handles standard input/output.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )    ;