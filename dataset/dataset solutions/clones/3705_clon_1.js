/*
 * This JavaScript function processes an array of numbers
 * to find a specific minimum difference.
 * It takes input as a string, parses it, and performs calculations.
 * The overall goal is to divide the array into four segments
 * such that the difference between the maximum and minimum sum
 * of these segments is minimized.
 */
function     Main(input) {
    // Split the input string by newline characters to get individual lines.
    const NA =   input.split('\n');

    // Parse the first line to get the total number of elements, N.
    const   N = parseInt(NA[0]);

    // Parse the second line, split by spaces, and convert each part to an integer.
    const A = NA[1].split(' ').map(n => parseInt(n));

    // Initialize a variable to accumulate the sum for prefix sum calculation.
    let wa = 0;

    /*
     * Calculate the prefix sums (cumulative sums) of array A.
     * Aruisekiwa (累積和) means cumulative sum in Japanese.
     */
    const Aruisekiwa = A.map((n) => {
        wa += n;    // Add the current element to the running total.
        return wa;  // Return the current cumulative sum.
    });

    // Declare arrays to store the sums of the four segments (P, Q, R, S).
    var P = []; // Stores sums of the first segment (left-most)
    var Q = []; // Stores sums of the second segment (left-middle)
    var R = []; // Stores sums of the third segment (right-middle)
    var S = []; // Stores sums of the fourth segment (right-most)



    // --- Calculation for the left side partitions (P and Q) ---
    // Iterate from the second element up to N-3 (exclusive) to define the split point for P and Q.
    for (let i = 1, l = 0; i < N - 2; ++i) {
        // Extract the subarray for the left part up to the current split point `i`.
        var leftArr = Aruisekiwa.slice(0, i + 1);
        // The total sum of this `leftArr` is its last element.
        var lwa = leftArr[leftArr.length - 1];


        // Calculate sums for two possible splits within `leftArr`:
        // 1. Split at `l`: `ll` is sum of first part, `lr` is sum of second part.
        var ll = leftArr[l];
        var lr = lwa - ll;

        // 2. Split at `l+1`: `llp` is sum of first part, `lrp` is sum of second part.
        var llp = leftArr[l + 1];
        var lrp = lwa - llp;

        // Adjust the split point `l` if moving it one step to the right
        // results in a smaller absolute difference between the two parts.
        if (leftArr.length > 2 && Math.abs(lrp - llp) <= Math.abs(lr - ll)) {
            ++l;
        }

        // Store the final sums for the current `i` and `l`.
        P.push(leftArr[l]);
        Q.push(leftArr[leftArr.length - 1] - leftArr[l]);
    }


    // --- Calculation for the right side partitions (R and S) ---
    // Iterate backwards from N-2 down to 2 (exclusive) for the main split point.
    // `r` is an index used for slicing `rightArr`.
    for (let i = N - 2, r = 1; i > 1; --i, ++r) {
        // Extract the subarray for the right part starting from `i`.
        var rightArr = Aruisekiwa.slice(i);
        // The element just before `rightArr` in the original cumulative sum array.
        var leftEnd = Aruisekiwa.slice(i - 1, i)[0];
        // The total sum of this `rightArr` is its last element (which is the total sum of `Aruisekiwa` minus `leftEnd`).
        var rwa = rightArr[rightArr.length - 1];


        // Calculate sums for two possible splits within `rightArr` (relative to `leftEnd`):
        // 1. Split at `r-1`: `rr` is sum of right-most part, `rl` is sum of left-middle part.
        var rr = rwa - rightArr[r - 1];
        var rl = rightArr[r] - leftEnd;

        // 2. Split at `r-2`: `rrp` is sum of right-most part, `rlp` is sum of left-middle part.
        var rrp = rwa - rightArr[r - 2];
        var rlp = rightArr[r - 1] - leftEnd;

        // Adjust the split point `r` if moving it one step to the left
        // results in a smaller absolute difference between the two parts.
        if (rightArr.length > 2 && Math.abs(rrp - rlp) <= Math.abs(rr - rl)) {
            --r;
        }

        // Store the final sums for the current `i` and `r`.
        // `unshift` is used because the loop iterates backwards,
        // so we want to build the arrays `R` and `S` in the correct order.
        R.unshift(rightArr[r - 1] - leftEnd);
        S.unshift(rwa - rightArr[r - 1]);
    }

    // Initialize the result with an invalid value.
    let res = -1;

    // --- Find the minimum difference among all possible 4-way splits ---
    // Iterate through the calculated P, Q, R, S arrays.
    // The length of P, Q, R, S should be consistent for valid splits.
    for (let i = 0; i < P.length; ++i) {
        // Calculate the difference between the maximum and minimum sum
        // for the current set of four segments (P[i], Q[i], R[i], S[i]).
        let curRes = Math.max(P[i], Q[i], R[i], S[i]) - Math.min(P[i], Q[i], R[i], S[i]);

        // If this is the first valid result, or if the current result is smaller, update `res`.
        if (res < 0 || curRes < res) {
            res = curRes;
        }
    }

    // Output the final minimum difference.
    console.log(res);

}

// Read input from standard input, decode it as UTF-8, and pass it to the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8")); // This line handles input in competitive programming environments.