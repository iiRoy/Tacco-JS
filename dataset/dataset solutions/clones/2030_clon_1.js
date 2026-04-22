/*
 * This is the primary function responsible for processing input data
 * and computing various distance metrics based on predefined regions.
 * It takes the raw input string as its sole argument.
 */
function Main(  input  )
{

    // The entire input string is parsed and split into an array of lines.
    // Each element of the array corresponds to a single line from the input.
    input  =  input.split( "\n" );


    // The first line of input typically contains space-separated parameters.
    // This line is split to extract these individual parameters.
    var tmp = input[0].split(" ");


    // N represents the total count of points in the system.
    // It's converted from a string to a numeric type.
    var N = Number(  tmp[0]  );

    // X denotes a critical boundary or a specific coordinate point.
    // Also converted to a number.
    var X = Number(  tmp[1]  );

    // Y signifies another important boundary or coordinate, similar to X.
    // Converted to a numeric value.
    var Y = Number(  tmp[2]  );



    // An array named 'ans' is initialized to store the frequency of each distance value.
    // The maximum possible distance is N-1, so the array size reflects this.
    var ans = [  ];
    for (  i = 0;  i < N - 1;  i++  )
    {
        // Each element of the 'ans' array is initially set to zero.
        // This ensures a clean count for every possible distance.
        ans[  i  ]  =  0;
    }


    // The outer loop iterates through the first point, 'i',
    // starting from 1 up to N-1.
    for (  i = 1;  i <= N - 1;  i++  )
    {
        // The inner loop iterates through the second point, 'j',
        // ensuring that 'j' is always greater than 'i', and up to N.
        for (  var j = i + 1;  j <= N;  j++  )
        {
            // A variable to temporarily hold the calculated distance
            // between the current pair of points (i, j).
            var dis;


            /*
             * Condition Set 1: Both points 'i' and 'j' reside within the first region.
             * This region spans from 1 up to X.
             * The distance is a straightforward difference.
             */
            if (  1 <= i  &&  i <= X  &&  1 <= j  &&  j <= X  )
            {
                dis  =  j - i;
            }
            /*
             * Condition Set 2: Point 'i' is in the first region (1 to X),
             * while point 'j' is in the second region (X+1 to Y-1).
             * The distance involves a path from 'i' to 'X', then a "shortcut" path.
             */
            if (  1 <= i  &&  i <= X  &&  X < j  &&  j < Y  )
            {
                dis  =  X - i; // Distance from 'i' to 'X'.

                // Calculate two potential paths for the shortcut segment.
                var rootA  =  j - X;       // Path from 'X' directly to 'j'.
                var rootB  =  Y - j + 1;   // Path from 'X' to 'Y', then to 'j'.

                // Add the shorter of the two shortcut paths to the total distance.
                if (  rootA < rootB  )
                {
                    dis  +=  rootA;
                }
                else
                {
                    dis  +=  rootB;
                }
            }
            /*
             * Condition Set 3: Point 'i' is in the first region (1 to X),
             * and point 'j' is in the third region (Y to N).
             * This path traverses through both 'X' and 'Y'.
             */
            if (  1 <= i  &&  i <= X  &&  Y <= j  )
            {
                dis  =  X - i  +  1  +  j - Y;
            }
            /*
             * Condition Set 4: Both points 'i' and 'j' are located within the second region
             * (from X+1 up to Y-1). This case also considers a shortcut.
             */
            if (  X < i  &&  i < Y  &&  X < j  &&  j < Y  )
            {
                dis  =  0; // Initialize distance for this case.

                // Calculate the direct path and the shortcut path.
                var rootA  =  j - i;               // Direct distance between 'i' and 'j'.
                var rootB  =  i - X  +  1  +  Y - j; // Path via 'X' and 'Y'.

                // Select the minimum of the two path options.
                if (  rootA < rootB  )
                {
                    dis  +=  rootA;
                }
                else
                {
                    dis  +=  rootB;
                }
            }
            /*
             * Condition Set 5: Point 'i' is in the second region (X+1 to Y-1),
             * and point 'j' is in the third region (Y to N).
             * The path involves reaching 'Y' and then a shortcut.
             */
            if (  X < i  &&  i < Y  &&  Y <= j  )
            {
                dis  =  j - Y; // Distance from 'j' to 'Y'.

                // Calculate two path segments from 'i' to 'Y'.
                var rootA  =  i - X + 1; // Path from 'i' to 'X', then to 'Y'.
                var rootB  =  Y - i;     // Direct path from 'i' to 'Y'.

                // Add the shorter path segment to the total.
                if (  rootA < rootB  )
                {
                    dis  +=  rootA;
                }
                else
                {
                    dis  +=  rootB;
                }
            }
            /*
             * Condition Set 6: Both points 'i' and 'j' are situated within the third region
             * (from Y up to N).
             * This is a simple, direct distance calculation.
             */
            if (  Y <= i  &&  Y <= j  )
            {
                dis  =  j - i;
            }

            // After calculating 'dis', increment the counter for this specific distance.
            // Note: Distances are 1-indexed (e.g., 1 to N-1), while array is 0-indexed.
            ans[  dis - 1  ]++;
        }
    }


    // Convert the 'ans' array into a single string where each element is
    // separated by a newline character, suitable for output.
    ans  =  ans.join( "\n" );

    // The final result string is printed to the console.
    console.log( '%s' , ans );
}


// This part of the code handles standard input/output operations.
// It reads all data from standard input and passes it to the Main function.
// IMPORTANT: Per instructions, this section should NOT be modified.
Main(  require( "fs" ).readFileSync( "/dev/stdin" , "utf8" )  );