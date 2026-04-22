var    main = function (   input  )    {

// This is the primary function that processes the input data.
    input = input.split('\n'); // Split the entire input string into an array of lines.

    // The first line of input contains two space-separated integers: N and M.
    var array1 = input[0] . split (   ' '  ) . map (   x => parseInt(x)   )   ;

    // N represents the number of data points that follow.
    var N = array1[0];
    // M represents how many of the top calculated values we need to sum.
    var M = array1[1];

    var sum; // Declare a variable 'sum' to be used later for calculations.

    // 'point' will store the calculated absolute sums for each data point.
    var point = [   ]   ;

    // Loop from the second line (index 1) up to N data points.
    for (    var i = 1;    i <= N;    i++    )   {
        // Each data line contains three space-separated integers.
        // Parse these into an array of numbers for the current point.
        input[i] = input[i] . split (   ' '  ) . map (   x => parseInt(x)   )   ;

        // Calculate the sum of the three components for the current point.
        sum = input[i][0] + input[i][1] + input[i][2];

        // If the sum is negative, we need to convert it to its positive equivalent (absolute value).
        if (   sum < 0   )   {
            sum = -sum; // Make the sum positive.
        }

        // Add the processed sum (which is now guaranteed to be non-negative) to our 'point' array.
        point.push(sum);
    }

    // Sort the 'point' array in descending order.
    // This means the largest sums will be at the beginning of the array.
    point.sort (   function (   a,   b   )   {
        return b - a; // Standard descending sort comparison.
    }   )   ;


    var Ans = 0; // Initialize the answer variable to zero. This will accumulate the final result.

    // Iterate through the first M elements of the sorted 'point' array.
    // These are the M largest absolute sums.
    for (   i = 0;   i < M;   i++   )   {
        Ans = Ans + point[i]; // Add each of the top M sums to our total answer.
    }

    // Finally, print the accumulated answer to the console.
    console.log(Ans);


    return 0; // Indicate successful execution of the main function.
}

// This line handles reading input from standard input and then calls the main function.
// It reads the entire file, decodes it as UTF-8, and removes leading/trailing whitespace.
main (   require (   "fs"   ) . readFileSync (   "/dev/stdin"   ,   "utf8"   ) . trim (   )   )   ;