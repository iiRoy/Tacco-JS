// This function processes the entire input data provided to it.
function Main(  input  ) {
    /*
     * The input string is split into an array of lines.
     * Each line corresponds to an element in the 'inputs' array,
     * e.g., input[0] for the first line, input[1] for the second, and so on.
     */
    inputs   =   input.split(  "\n"  );

    // Parse the first line to get the number of queries 'q'.
    var   q   =   parseInt(   inputs[0],   10   );


    // Initialize variables for sums and an array to store 'a' values.
    var   sum_a   =   0;
    var   sum_b   =   0;
    var   array_a   =   new   Array(); // Array to hold 'a' values from type 1 queries.

    // Loop through each query from 1 to q.
    for  (  var   i = 1;   i <= q;   i++  ) {
        // Split the current query line into temporary parts.
        tmp   =   inputs[i].split(  " "  );

        // Check the type of query.
        if   (   tmp[0]   ==   1   )   {
            // Type 1 query: Add new values 'a' and 'b'.

            var   a   =   parseInt(   tmp[1],   10   ); // Parse 'a' value.
            var   b   =   parseInt(   tmp[2],   10   ); // Parse 'b' value.

            sum_a   +=   a;                               // Accumulate sum_a.
            sum_b   +=   b;                               // Accumulate sum_b.
            array_a.push(   a   );                       // Add 'a' to the array.

        }   else   {
            // Type 2 query: Calculate and print statistics.

            // Calculate the average of elements in array_a.
            var   ave_a   =   sum_a   /   array_a.length;

            // Initialize mindist with the first element's squared distance from average.
            var   mindist   =   (   array_a[0]   -   ave_a   )   *   (   array_a[0]   -   ave_a   );
            // Initialize min_a with the first element.
            var   min_a   =   array_a[0];


            // Loop through array_a to find the element closest to ave_a (or smallest if distances are equal).
            for   (   var   j = 0;   j < array_a.length;   j++   )   {
                // Calculate temporary distance for the current element.
                var   tmpdist   =   (   array_a[j]   -   ave_a   )   *   (   array_a[j]   -   ave_a   );

                // Update min_a if a closer element is found, or if distance is equal and the element is smaller.
                // Note: mindist itself is not updated in the original logic, it acts as a threshold based on array_a[0].
                if   (   tmpdist   <   mindist   )   {
                    min_a   =   array_a[j];
                }   else   if   (   tmpdist   ==   mindist   )   {
                    min_a   =   array_a[j]   <   min_a   ?   array_a[j]   :   min_a;
                }
            }


            var   value   =   0; // Initialize 'value' for the second calculation.
            // Calculate 'value' based on min_a. This represents a sum of differences.
            for   (   var   j = 0;   j < array_a.length;   j++   )   {
                if   (   array_a[j]   <=   min_a   )   {
                    value   +=   array_a[j]   -   min_a;
                }   else   {
                    value   +=   (   -array_a[j]   +   min_a   );
                }
            }

            // Print the calculated min_a and value.
            console.log(   '%d %d',   min_a,   value   );


        }
    }

}

// DO NOT EDIT BELOW THIS LINE! This section handles standard input/output and calls the Main function.
/*
 * This part reads the entire standard input synchronously,
 * converts it to UTF-8, and then passes it to the Main function.
 * This ensures that the Main function receives all necessary input data.
 */
Main(   require(  "fs"  ).readFileSync(  "/dev/stdin",   "utf8"  )   );