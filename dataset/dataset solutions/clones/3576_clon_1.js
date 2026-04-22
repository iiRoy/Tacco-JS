/*
 * This JavaScript function processes input data to solve a specific problem.
 * It calculates the number of triplets (i, j, k) that satisfy certain conditions.
 */
function         Main(  str  )
{
    // Split the input string by space to get numerical values.
    const    num    =    str  .  split(' ')    ;

    // Parse the first number as N (the upper limit for iterations).
    const    N    =    parseInt(  num[0]  )    ;

    // Parse the second number as K (the modulus for the conditions).
    const    K    =    parseInt(  num[1]  )    ;


    // Initialize an empty array to store results that meet the criteria.
    var    arr    =    [  ]    ;


    // Outer loop: iterates from 1 to N for the first element of the triplet.
    for  (  var    i    =    1  ;    i    <=    N  ;    i++  )
    {
        // Initialize a temporary array for the current triplet combination.
        var    arr2    =    [  ]    ;

        // Assign the current value of 'i' to the first position.
        arr2[0]    =    i    ;

        // Middle loop: iterates from 1 to N for the second element of the triplet.
        for  (  var    j    =    1  ;    j    <=    N  ;    j++  )
        {
            // Assign the current value of 'j' to the second position.
            arr2[1]    =    j    ;

            // Inner loop: iterates from 1 to N for the third element of the triplet.
            for  (  var    k    =    1  ;    k    <=    N  ;    k++  )
            {
                // Assign the current value of 'k' to the third position.
                arr2[2]    =    k    ;

                // Evaluate the conditions for the current triplet (arr2[0], arr2[1], arr2[2]).
                // All three conditions must be true for the triplet to be valid.
                if  (
                       (  arr2[0]    +    arr2[1]  )    %    K    ===    0
                    && (  arr2[1]    +    arr2[2]  )    %    K    ===    0
                    && (  arr2[2]    +    arr2[0]  )    %    K    ===    0
                )
                {
                    // If all conditions are met, add a copy of the current triplet to the results array.
                    arr  .  push(  arr2  )  ;
                }
            }
        }
    }

    // Output the total count of valid triplets found.
    console  .  log(  arr  .  length  )  ;
}

/*
 * Do not modify the following section. It handles standard input/output
 * and invokes the Main function with the input data.
 */
Main(  require("fs")  .  readFileSync(  "/dev/stdin"  ,  "utf8"  )  )  ;