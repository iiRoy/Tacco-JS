var toInt = x => parseInt(x, 10);

var toIntArr = arr => arr.map(x => toInt(x)); // Converts an array of strings to an array of integers

var abs = x => x > 0 ? x : -x;


function min() {
    // This function finds the smallest value among its arguments.
    // It uses the 'arguments' object, which is an array-like structure.
    var rest = arguments,
        val = rest[0]; // Initialize 'val' with the first argument.

    for (var i = 1; i < rest.length; i++) {
        if (rest[i] < val) {
            val = rest[i]; // Update 'val' if a smaller argument is found.
        }
    }
    return val; // Return the minimum value.
}


function max() {
    /*
     * This function determines the largest value passed as an argument.
     * It iterates through all arguments and maintains the maximum seen so far.
     */
    var rest = arguments,
        val = rest[0]; // Start with the first argument as the potential maximum.

    for (var i = 1; i < rest.length; i++) {
        if (rest[i] > val) {
            val = rest[i]; // If a larger value is encountered, update 'val'.
        }
    }
    return val; // Return the final maximum value.
}


// The main program execution starts here.
// It reads input from standard input and passes it to the Main function.
Main( require("fs").readFileSync("/dev/stdin", "utf8") );


function Main(input) {
    // Split the entire input string by newline characters to get an array of lines.
    var input = input.split('\n');

    // Process the first line: it contains two space-separated integers N and K.
    // Convert them to integers and store in the 'nk' array.
    var nk = toIntArr( input[0].split(' ') );

    // Extract N (number of elements) from the 'nk' array.
    var n = nk[0];

    // Extract K (target count) from the 'nk' array.
    var k = nk[1];

    // Process the second line: it contains space-separated integers for array 'a'.
    // Convert them to integers and store in the 'as' array.
    var as = toIntArr( input[1].split(' ') );

    // Initialize 'sums' array for prefix sums. The first element is just the first element of 'as'.
    var sums = [as[0]];

    // Calculate prefix sums for the 'as' array.
    // sums[i] will store the sum of as[0] through as[i].
    for (var i = 1; i < n; i++) {
        sums[i] = sums[i - 1] + as[i];
    }

    // A special convention for prefix sums: the sum before index 0 is considered 0.
    sums[-1] = 0;

    // Initialize an empty array to store all possible subarray sums.
    var subsums = [];

    // Iterate through all possible starting indices 'i'.
    for (var i = 0; i < n; i++) {
        // Iterate through all possible ending indices 'j', starting from 'i'.
        for (var j = i; j < n; j++) {
            // Calculate the sum of the subarray from index 'i' to 'j' using prefix sums.
            // The sum is sums[j] - sums[i-1].
            subsums.push( sums[j] - sums[i - 1] );
        }
    }

    // Reassign 'as' to now hold all the calculated subarray sums.
    as = subsums;

    // 'bs' will be an array of arrays. bs[bit_pos] will store indices of numbers in 'as'
    // that have the 'bit_pos'-th bit set.
    var bs = [];

    // 'bits' will store powers of 2 (1, 2, 4, 8, ...), useful for bitwise operations.
    var bits = [];

    // Get the length of the 'as' array (total number of subarray sums).
    var l = as.length;

    // Iterate up to 30 bits (assuming numbers fit within a 30-bit integer range).
    for (var i = 0; i < 30; i++) {
        bs[i] = []; // Initialize an empty array for the current bit position.
        bits[i] = 1 << i; // Calculate 2 to the power of 'i'.

        // Iterate through all subarray sums in 'as'.
        for (var j = 0; j < l; j++) {
            // Check if the 'i'-th bit is set in the current subarray sum 'as[j]'.
            if (bits[i] & as[j]) {
                bs[i].push(j); // If the bit is set, store the index 'j' in bs[i].
            }
        }
    }

    /*
     * These console.log statements were likely used for debugging purposes
     * during development to inspect intermediate values.
     * console.log(sums);
     * console.log(as);
     * console.log(bs);
     */

    // Initialize the answer variable to 0. This will accumulate the bits of the final answer.
    var ans = 0;

    // Iterate from the most significant bit (29) down to the least significant bit (0).
    // This approach tries to build the largest possible answer by checking higher bits first.
    for (var i = 29; i > -1; i--) {
        // If there are at least K subarray sums that have the current bit 'i' set...
        if (bs[i].length >= k) {
            // console.log(i); // Another potential debugging line.

            // Add the value of this bit (2^i) to our answer.
            ans += bits[i];

            // Now, for all subsequent (less significant) bits, we must filter their
            // corresponding 'bs' arrays. We only want to consider numbers that also
            // had the current bit 'i' set. This ensures consistency for the final K numbers.
            for (var j = i - 1; j > -1; j--) {
                // Filter bs[j] to keep only those indices that are also present in bs[i].
                bs[j] = bs[j].filter( (el, ind, arr) => bs[i].indexOf(el) > -1 );
            }
        }
    }

    // Print the final calculated answer.
    console.log(ans);
}