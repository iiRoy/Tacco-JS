/* This JavaScript function, Main, is designed to process
 *  a given input string representing some data.
 *  It calculates reachability based on a series of movements.
 */
function Main(  input  )
{
    // Split the entire input string by newline characters to get individual lines.
    var    line    =    input.split(  "\r\n"  )   ;

    // The first line 's' contains the movement sequence.
    var    s    =    line[  0  ]   ;

    // The second line 'tmp' contains the target coordinates, split by spaces.
    var    tmp    =    line[  1  ].split(  " "  )   ;

    // Split the movement sequence 's' by 'T' (turns) to get forward steps.
    var    forward    =    s.split(  "T"  )   ;

    // The length of the first segment before any 'T' is the initial forward step.
    var    firstStep    =    forward[  0  ].length   ;

    // Calculate the absolute difference between target X and initial step,
    // and the absolute target Y. These are the required displacements.
    var    dest    =    [  Math.abs(  Number(  tmp[  0  ]  )  -  firstStep  )  ,  Math.abs(  Number(  tmp[  1  ]  )  )  ]   ;


    // Initialize arrays to store lengths of horizontal (dx) and vertical (dy) movements.
    var    dx    =    [  ]   ;
    var    dy    =    [  ]   ;

    // Initialize sums of horizontal and vertical movement lengths.
    var    sumx    =    0   ;
    var    sumy    =    0   ;


    // Iterate through the 'forward' segments starting from the second one (index 1).
    for (  var    i    =    1   ;    i    <    forward.length   ;    i++  )
    {
        // If the index is even, it's an X-direction movement.
        if (  i  %  2    ===    0  )
        {
            dx.push(  forward[  i  ].length  )   ;
            sumx    +=    forward[  i  ].length   ;
        }
        // If the index is odd, it's a Y-direction movement.
        else
        {
            dy.push(  forward[  i  ].length  )   ;
            sumy    +=    forward[  i  ].length   ;
        }
    }


    // Sort the horizontal movement lengths in ascending order.
    dx.sort(  function(  a  ,  b  )
    {
        return    a  -  b   ;
    }  )   ;

    // Sort the vertical movement lengths in ascending order.
    dy.sort(  function(  a  ,  b  )
    {
        return    a  -  b   ;
    }  )   ;


    // Define a helper function to check if a target distance can be reached
    // given a set of movement lengths and their total sum.
    var    canReach    =    function(  d  ,  dest  ,  sum  )
    {
        // If the target distance is less than the total sum of movements.
        if (  dest    <    sum  )
        {
            // If the difference between total sum and target is odd, it's impossible.
            if (  (  sum  -  dest  )  %  2    ===    1  )
            {
                console.log(  "No"  )   ;
                return    false   ;
            }
            // If the difference is even, we need to find if a subset sums to half the difference.
            else
            {
                var    backStep    =    (  sum  -  dest  )  /  2   ;
                var    dd    =    [  ]   ; // This array will store possible sums.

                // Iterate through the sorted movement lengths.
                for (  var    j    =    0   ;    j    <    d.length   ;    j++  )
                {
                    // If a movement length itself is greater than backStep,
                    // no combination involving it or subsequent ones can sum to backStep.
                    if (  d[  j  ]    >    backStep  )
                    {
                        break   ;
                    }

                    var    l    =    dd.length   ;
                    dd.push(  d[  j  ]  )   ;

                    // If the current movement length equals backStep, we found a solution.
                    if (  d[  j  ]    ===    backStep  )
                    {
                        return    true   ;
                    }

                    // Check combinations with previously found sums.
                    for (  var    k    =    0   ;    k    <    l   ;    k++  )
                    {
                        var    currentSum    =    d[  j  ]    +    dd[  k  ]   ;
                        dd.push(  currentSum  )   ;

                        // If a combination equals backStep, we found a solution.
                        if (  currentSum    ===    backStep  )
                        {
                            return    true   ;
                        }
                    }
                }
                return    false   ; // No subset found that sums to backStep.
            }
        }
        // If the target distance exactly equals the total sum.
        else if (  dest    ===    sum  )
        {
            return    true   ; // It's reachable.
        }
        // If the target distance is greater than the total sum.
        else
        {
            return    false   ; // It's impossible to reach.
        }
    }   ;


    // Final check for reachability in both X and Y dimensions.
    // If either target X or target Y is greater than their respective total sums, it's impossible.
    if (  dest[  0  ]    >    sumx    ||    dest[  1  ]    >    sumy  )
    {
        console.log(  "No"  )   ;
        return    false   ;
    }
    // If both target X and target Y exactly match their total sums, it's reachable.
    else if (  dest[  0  ]    ===    sumx    &&    dest[  1  ]    ===    sumy  )
    {
        console.log(  "Yes"  )   ;
        return    false   ;
    }
    // Otherwise, use the canReach function for each dimension.
    else
    {
        // If both dimensions are reachable independently, then the overall target is reachable.
        if (  canReach(  dx  ,  dest[  0  ]  ,  sumx  )    &&    canReach(  dy  ,  dest[  1  ]  ,  sumy  )  )
        {
            console.log(  "Yes"  )   ;
            return    false   ;
        }
        // If at least one dimension is not reachable, the overall target is not.
        else
        {
            console.log(  "No"  )   ;
            return    false   ;
        }
    }

} // End of Main function.


// * This line and below should not be modified (standard input/output handling).
// * It reads the entire input from stdin and calls the Main function.
Main(  require(  "fs"  ).readFileSync(  "/dev/stdin"  ,  "utf8"  )  )   ;