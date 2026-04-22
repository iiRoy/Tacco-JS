/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 * Only whitespace (indentation, spacing, blank lines) and comments have been
 * extensively modified to create a visually distinct but functionally identical clone.
 */

// Declare an array to store lines read from standard input.
var lines  =  [];

// Import the 'readline' module for reading input line by line.
var readline  =  require('readline');


// Create a readline interface configuration.
var rl = readline.createInterface(
    {
        input:   process.stdin,    // Standard input stream.
        output:  process.stdout    // Standard output stream (not used for writing back, but required).
    }
);


// Event listener for each line received from standard input.
rl.on(
    'line',
    function (x)
    {
        // Push the received line onto the 'lines' array.
        lines.push(x);
    }
);


// Event listener for when the input stream closes.
rl.on('close',
    function ()
    {
        // Extract the first line, which contains N, A, and B.
        var tmp = lines.shift();


        // Parse N, A, and B from the first line.
        var N  =  tmp.split(" ")[0]; // Number of items.
        var A  =  tmp.split(" ")[1]; // Minimum number of items to select.
        var B  =  tmp.split(" ")[2]; // Maximum number of items to select.

        // Initialize an array 'v' of size N.
        var v  =  Array(N);


        // Extract the second line, which contains the values.
        tmp = lines.shift().split(" ");

        // Convert string values to numbers and populate array 'v'.
        for (
            var i = 0;
            i < N;
            i++
        )
        {
            v[i]  =  Number(tmp[i]);
        }


        // Sort the array 'v' in descending order.
        v.sort(
            function (a, b)
            {
                return (b - a);
            }
        );

        // Initialize variables for calculating the maximum average and counting occurrences.
        var average_max  =  0;
        var C  =  {}; // Object to store counts of each number.


        // Iterate through the sorted array to calculate initial average and populate counts.
        for (
            var i  =  0;
            i < N;
            i++
        )
        {
            // Sum the first 'A' elements for the maximum possible average.
            if (
                i < A
            )
            {
                average_max  +=  v[i];
            }

            // Initialize count for a number if it's encountered for the first time.
            if (
                C[v[i]]  ===  undefined
            )
            {
                C[v[i]]  =  0;
            }

            // Increment the count for the current number.
            C[v[i]]++;
        }

        // Calculate the maximum average.
        average_max  /=  A;

        // Output the calculated maximum average.
        console.log(average_max);


        // Initialize variables for counting combinations.
        var counter  =  0;
        var tmp      =  1; // This 'tmp' variable seems unused after its declaration here.

        // Determine combinations based on whether the A-th element is different from the first.
        if (
            v[0]  !==  v[A]
        )
        {
            // Case 1: The A-th element is different from the first.
            // This implies the elements forming the average_max are not all the same value.
            var comb = 1; // Initialize combination count to 1.

            // Iterate through unique values in C (effectively, unique sorted values up to a point).
            for (
                var i = 0;
                i < Object.keys(C).length;
                i++
            )
            {

                // If the current number appears at least twice.
                if (
                    C[v[i]]  >=  2
                )
                {
                    // Determine 'j': the number of elements to choose from C[v[i]] for combination.
                    C[v[i]]  >  (A - counter)  ?  j = A - counter  :  j = C[v[i]];

                    // Multiply combinations.
                    comb  *=  combination(C[v[i]], j);

                    // Update counter for elements already considered.
                    counter  +=  C[v[i]];
                }
                else
                {
                    // If the number appears once, just add to counter.
                    counter  +=  C[v[i]];
                }
            }
        }
        else
        {
            // Case 2: The A-th element is the same as the first.
            // This means all elements from v[0] to v[A-1] are identical.
            var comb  =  0; // Initialize combination count to 0.

            // Calculate combinations for choosing between A and B elements, all of the same value.
            for (
                var j  =  A;
                j <= B;
                j++
            )
            {
                // Here, '50' seems to be a hardcoded value, likely 'C[v[0]]' or similar,
                // representing the total count of the repeated value.
                comb  +=  combination(C[v[0]], j);
            }
        }

        // Output the calculated number of combinations.
        console.log(comb);
    }
);


/*
 * Function to calculate permutations (nPr).
 * n: total number of items.
 * r: number of items to choose.
 */
function permutation(n, r)
{
    var res  =  1; // Initialize result.

    // Calculate n * (n-1) * ... * (n-r+1).
    for (
        var i  =  0;
        i < r;
        i++
    )
    {
        res  *=  (n - i);
    }
    return res;
}


/*
 * Function to calculate combinations (nCr).
 * n: total number of items.
 * r: number of items to choose.
 * Uses the formula nCr = nPr / rPr.
 */
function combination(n, r)
{
    // Ensure r is not greater than n for valid combination.
    // (Implicitly handled by permutation returning 0 for invalid inputs, or by problem constraints.)
    return permutation(n, r) / permutation(r, r);
}