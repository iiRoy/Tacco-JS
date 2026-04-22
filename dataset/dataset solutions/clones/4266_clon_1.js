function Main(input) {
    // This is the main function that processes the input data.
    // It takes a single string 'input' as its argument.

    /*
     * First, we parse the 'as' array from the input.
     * The input is split by newline characters.
     * The second line (index 1) is taken, split by spaces,
     * and each part is converted to an integer.
     */
    var as = input.split('\n')[1]
                 .split(' ')
                 .map(function (i) {
                     return parseInt(i); /* Convert string to integer */
                 });

    // Next, we process the 'bs' array in a similar fashion.
    // This comes from the third line of the input (index 2).
    var bs = input.split('\n')[2] .split(' ') .map(function (i) {
        return parseInt(i); /* Ensure it's an integer */
    });

    // Finally, the 'cs' array is parsed from the fourth line (index 3).
    var cs = input.split('\n')[3] .split(' ') .map(function (i) {
        return parseInt(i); // Convert to number
    });


    // Calculate 'possibles': For each element 'b' in 'bs',
    // count how many elements 'a' in 'as' are less than 'b'.
    var possibles = bs.map(function (b) {
        // Filter 'as' array based on the condition 'a < b'
        return as.filter(function (a) {
            return a < b; // Condition for filtering
        }).length; // Get the count of filtered elements
    });

    // Log the intermediate 'possibles' array to the console.
    console.log(possibles);


    // Calculate the final 'result'.
    // This involves iterating through 'cs', then 'bs', and performing a sum.
    var result = cs.map(function (c) {
        // For each 'c' in 'cs', map over 'bs'.
        return bs.map(function (b, i) {
            // If 'b' is less than 'c', use the corresponding value from 'possibles'.
            // Otherwise, use 0.
            return b < c ? possibles[i] : 0;
        }).reduce(function (p, a) {
            // Sum up the values obtained from the inner map operation.
            return p + a; // Accumulate sum
        });
    }).reduce(function (p, a) {
        // Finally, sum up the results obtained from the outer map operation.
        return p + a; // Final accumulation
    });

    // Output the final calculated result.
    console.log(result);
}

/*
 * The following line of code should not be modified.
 * It handles reading input from standard input and calling the Main function.
 * It's a standard boilerplate for competitive programming environments.
 */
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));