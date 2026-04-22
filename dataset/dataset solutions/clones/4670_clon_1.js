/*
 * This JavaScript code processes input lines to calculate
 * an average and a combination count based on given parameters.
 *
 * It uses the 'readline' module to handle standard input/output.
 */
var lines = [
]; // An array to store all input lines read from stdin.

// Import the 'readline' module to create an interface for reading input.
var readline = require('readline');

/*
 * Create a readline interface instance.
 * It's configured to read from process.stdin (standard input)
 * and write to process.stdout (standard output).
 */
var rl = readline.createInterface(
    {
        input:  process.stdin, /* The readable stream to listen to */
        output: process.stdout /* The writable stream to write to */
    }
);

// Event listener for each 'line' event emitted by the readline interface.
// When a line is received, it's pushed into the 'lines' array.
rl.on(
    'line',
    function (x)
    {
        // Add the current line 'x' to our collection of lines.
        lines.push(x);
    }
);

/*
 * Event listener for the 'close' event.
 * This event is emitted when the input stream receives an 'end' signal,
 * indicating that there are no more lines to read.
 * All core logic is executed within this callback.
 */
rl.on(
    'close',
    function ()
    {
        /*
         * First, retrieve the initial line which contains N, A, and B.
         * The 'shift()' method removes the first element from the 'lines' array.
         */
        var tmp = lines.shift();

        // Parse N, A, and B from the first line.
        // N: Total number of items.
        // A: Minimum number of items to select for average.
        // B: Maximum number of items to select for combination.
        var N = tmp.split(" ")[0]; // Extract N (first part)
        var A = tmp.split(" ")[1]; // Extract A (second part)
        var B = tmp.split(" ")[2]; // Extract B (third part)

        // Initialize an array 'v' of size N to store the actual values.
        var v = Array(N);

        /*
         * Get the second line of input, which contains the N values,
         * and split them by space.
         */
        tmp = lines.shift().split(" ");
        // Loop through the split values and convert them to numbers,
        // then store them in array 'v'.
        for (
            var i = 0;
            i < N;
            i++
        ) {
            v[i] = Number(tmp[i]) // Convert string to number
        }

        /*
         * Sort the array 'v' in descending order.
         * This is crucial for calculating the maximum possible average.
         */
        v.sort(
            function (a, b)
            {
                return (b - a); // Descending sort
            }
        );

        // Initialize 'average_max' to accumulate the sum for the average calculation.
        var average_max = 0

        // Initialize an empty object 'C' to act as a frequency map (counter)
        // for the numbers in array 'v'.
        var C = {};

        /*
         * Iterate through the sorted array 'v'.
         * - Calculate the sum of the top 'A' elements for 'average_max'.
         * - Populate the frequency map 'C'.
         */
        for (
            var i = 0;
            i < N;
            i++
        ) {
            // If the current index 'i' is less than 'A',
            // add the value to 'average_max' sum.
            if (i < A)
            {
                average_max += v[i];
            }

            // If the current value v[i] is not yet in the frequency map 'C',
            // initialize its count to 0.
            if (C[v[i]] === undefined)
            {
                C[v[i]] = 0;
            }

            // Increment the count for the current value v[i] in the map.
            C[v[i]]++;
        }

        // Calculate the maximum average by dividing the sum by A.
        average_max /= A;
        // Output the calculated maximum average to the console.
        console.log(average_max);


        // Initialize 'counter' and 'tmp' variables for combination calculation.
        var counter = 0;
        var tmp = 1;

        /*
         * Conditional logic for calculating combinations.
         * Two main cases:
         * 1. The smallest number among the top 'A' elements is different
         *    from the largest number among the elements from index B-1 onwards.
         *    This implies that the 'A' elements selected for the average are not all the same.
         * 2. All elements from v[0] to v[B-1] are the same.
         *    This means the chosen 'A' elements are all identical.
         */
        if (v[0] !== v[B - 1]) {
            // Case 1: Elements are not all the same within the relevant range.
            var comb = 1; // Initialize combination count to 1.

            // Iterate through the sorted array 'v'.
            for (var i = 0; i < N; i++) {
                // If the frequency of the current value v[i] is 2 or more,
                // it means there are duplicates that need to be considered for combinations.
                if (C[v[i]] >= 2) {
                    /*
                     * Determine 'j': the number of elements of current value v[i] to choose.
                     * If (A - counter) is less than the total count of v[i],
                     * it means we need to pick (A - counter) more elements to reach A.
                     * Otherwise, we pick all available C[v[i]] elements.
                     */
                    C[v[i]] > (A - counter) ? j = A - counter : j = C[v[i]];
                    // Multiply the current combination count by the combinations of choosing
                    // 'j' items from C[v[i]] available items.
                    comb *= combination(C[v[i]], j);
                    // Update 'counter' by adding the total count of the current value.
                    counter += C[v[i]];
                    // Adjust 'i' to skip over all instances of the current value,
                    // as they have already been processed by their count C[v[i]].
                    i += C[v[i]] - 1;
                }
                else {
                    // If C[v[i]] is less than 2 (i.e., 1), simply add it to the counter.
                    // No complex combinations needed for unique elements here.
                    counter += C[v[i]];
                }
            }
        }
        else {
            // Case 2: All elements from v[0] to v[B-1] are the same.
            // This simplifies the combination calculation.
            var comb = 0; // Initialize combination count to 0.

            // Iterate from 'A' to 'B' (inclusive).
            // For each 'j' in this range, calculate combinations.
            for (var j = A; j <= B; j++) {
                // Add the combination of choosing 'j' items from C[v[0]] (total count of the repeated value)
                // to the total combination count.
                comb += combination(C[v[0]], j);
            }
        }
        // Output the calculated combination count to the console.
        console.log(comb);

    } /* End of 'close' event handler function */
); /* End of rl.on('close', ...) */


/*
 * Helper function to calculate permutations (nPr).
 * n: total number of items
 * r: number of items to choose and arrange
 */
function permutation(n, r)
{
    var res = 1; // Initialize result to 1.
    // Loop 'r' times to multiply n * (n-1) * ... * (n-r+1).
    for (
        var i = 0;
        i < r;
        i++
    ) {
        res *= n - i; // Multiply 'res' by (n - current_iteration_index)
    }
    return res; // Return the calculated permutation.
}

/*
 * Helper function to calculate combinations (nCr).
 * n: total number of items
 * r: number of items to choose
 *
 * Uses the formula: nCr = nPr / rPr
 */
function combination(n, r)
{
    // Handle edge case: choosing 0 items from n is 1 way.
    if (r === 0 || n === r) { return 1; }
    // Handle edge case: choosing more items than available is 0 ways.
    if (r > n) { return 0; }

    // Calculate nPr and rPr using the permutation function, then divide.
    return permutation(n, r) / permutation(r, r);
}
// End of the JavaScript code.