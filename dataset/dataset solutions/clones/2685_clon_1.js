/*
 * This JavaScript file processes an input string,
 * likely representing a sequence of 'R' and 'L' characters,
 * and calculates some values based on the distribution
 * of these characters after specific divisions.
 * It's designed to run in a Node.js environment.
 */
function         Main(  input  )
{
    // Enforce strict parsing and error handling in the script
    "use strict";


    // Assign the input parameter to a constant variable 's'
    const    s     =     input;

    // Split the input string by occurrences of "LR"
    // and then wrap each resulting segment with "R" at the start and "L" at the end.
    // The map function ensures each segment is properly formatted for subsequent processing.
    const    division    =    s . split ( "LR" ) . map (    e    =>
    {
        return    "R"    +    e    +    "L";
    }    )
    ;


    // Get the number of segments after the division and mapping
    const    len    =    division . length;

    // Adjust the first segment: remove the leading 'R'
    division[ 0 ]    =    division[ 0 ] . slice ( 1 );

    // Adjust the last segment: remove the trailing 'L'
    division[ len - 1 ]    =    division[ len - 1 ] . slice ( 0    ,    -1 );



    // Initialize an empty array to store the final computed answers
    const    ans    =    [];

    // Iterate over each processed segment in the 'division' array
    division . forEach (    e    =>
    {
        // Get the length of the current segment
        const    len    =    e . length;

        // Loop through each character position within the current segment
        for(    let    i    =    0;    i    <    len;    i++    )
        {
            // Check for a specific pattern: 'R' followed by 'L'
            // This condition identifies the boundary between groups of 'R's and 'L's
            if(    i    !==    0    &&    e[    i    -    1    ]    ===    "R"    &&    e[    i    ]    ===    "L"    )
            {
                // If the pattern is found, remove the last element added to 'ans'
                // This implies a previous 0 was pushed, which needs correction.
                ans . pop ( );

                // Calculate the number of 'R' characters (rNum) and 'L' characters (lNum)
                // based on the current split point 'i'.
                const    rNum    =    i;
                const    lNum    =    len    -    i;

                // Determine 'a': 0 if rNum is greater than lNum, 1 otherwise
                const    a    =    (    rNum    >    lNum    )    ?    0    :    1;

                // Determine 'b': 0 if the minimum of rNum and lNum is even, 1 otherwise
                const    b    =    (    Math . min (    rNum    ,    lNum    )    %    2    ==    0    )    ?    0    :    1;

                // Calculate 'c' using a bitwise XOR operation on 'a' and 'b'
                const    c    =    a    ^    b;

                // Conditional logic to push results to 'ans' based on segment length and 'c'
                if(    len    %    2    ===    0    )
                {
                    // If segment length is even, push half the length twice
                    ans . push (    len    /    2    );
                    ans . push (    len    /    2    );
                }
                else    if(    c    ===    0    )
                {
                    // If segment length is odd and 'c' is 0, push (len+1)/2 then (len-1)/2
                    ans . push (    (    len    +    1    )    /    2    );
                    ans . push (    (    len    -    1    )    /    2    );
                }
                else
                {
                    // If segment length is odd and 'c' is 1, push (len-1)/2 then (len+1)/2
                    ans . push (    (    len    -    1    )    /    2    );
                    ans . push (    (    len    +    1    )    /    2    );
                }
            }
            else
            {
                // If the 'R' followed by 'L' pattern is not found at this position, push 0
                ans . push (    0    );
            }
        }
    }    )
    ;

    // Output the final 'ans' array elements joined by spaces, followed by a newline character.
    console . log (    ans . join (    " "    )    +    "\n"    )
    ;
}


/*
 * The following lines are boilerplate code for standard input/output handling.
 * They should not be modified for the contest environment.
 * It reads all input from /dev/stdin and passes it to the Main function.
 */
Main    (    require    (    "fs"    )    .    readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )
;