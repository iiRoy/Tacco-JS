/*
 * This is the main entry point for the program.
 * It reads input, processes it, and prints the result.
 */
function Main(input) {

    // Parse dimensions and a key value from the first line of input.
    // The input is expected to be an array of strings, where the first element
    // contains space-separated numbers.
    var H = input[0].split(" ")[0] - 0; // Height of the map, converted to number.
    var W = input[0].split(" ")[1] - 0; // Width of the map, converted to number.
    var K = input[0].split(" ")[2] - 0; // Key value, converted to number.

    // Initialize the map array.
    var map = [];

    // Populate the map with data from subsequent input lines.
    // The loop starts from index 1 of the input array.
    for (var i = 1; i <= H; i++) {
        map[i - 1] = input[i]; // Store each line as a row in the map.
    }

    // Initialize the global minimum answer with a large value (H*W).
    ans = H * W;

    // Generate all possible bit combinations for H-1 rows.
    // This represents potential horizontal divisions.
    var btc = getBit(H - 1);

    // Iterate through each bit combination and check its validity.
    btc.forEach(bt => {
        check(map, bt, K, H); // Call the check function for each combination.
    });

    // Output the final minimum answer.
    console.log(ans);
}

// Global variable to store the minimum number of cuts found.
// Initialized outside the Main function.
var ans = 0;

/**
 * This function checks a given configuration (bit combination) for validity
 * and updates the global minimum answer.
 * @param {Array<string>} map - The 2D grid representing the chocolate.
 * @param {object} bt - An object containing the bit combination (`v`) and its count (`cnt`).
 * @param {number} K - The maximum allowed sum of '1's in a section.
 * @param {number} H - The height of the map.
 */
function check(map, bt, K, H) {

    // Initialize 'aans' with the number of horizontal cuts (from bt.cnt).
    var aans = bt.cnt;
    var len = map[0].length; // Get the width of the map.

    // 'nsum' will store the current sum of '1's for each section.
    var nsum = [];
    var pcnt = 0; // This variable seems unused or incorrectly managed in the original logic.

    // Outer loop iterates through each column of the map.
    start: for (var i = 0; i < len; i++) {

        var nbox = 0; // Current section index.

        // Inner loop iterates through each row.
        for (var j = 0; j < H; j++) {

            // Initialize nsum[nbox] if it doesn't exist.
            if (!nsum[nbox]) {
                nsum[nbox] = 0;
            }

            // If the current cell contains '1', add it to the current section's sum.
            if (map[j][i] == "1") {
                nsum[nbox] += 1;
            }

            // If the bit 'v[j]' is '1', it signifies a horizontal cut,
            // so move to the next section.
            if (bt.v[j] == "1") {
                nbox++;
            }

            // If any section's sum exceeds K, a vertical cut is needed here.
            if (nsum[nbox] > K) {
                aans++; // Increment the total number of cuts.
                nsum = []; // Reset section sums.
                i--; // Re-process the current column after making a vertical cut.

                // This 'pcnt' logic seems problematic and might be a bug in the original.
                // It always leads to 'return' if a cut is made and pcnt is not 0.
                if (pcnt > 0) {
                    pcnt = 0;
                    continue start; // Continue to the next column.
                } else {
                    return; // If pcnt is 0, this branch returns immediately,
                            // indicating an invalid configuration for this 'bt'.
                }
            }
        }

        // If we've reached the last column and no section sum exceeded K,
        // update the global minimum answer.
        if (i == len - 1) {
            ans = Math.min(ans, aans);
        }
    }
    return aans; // Return the number of cuts for this specific 'bt'.
}

/**
 * Generates a list of bit combinations and their counts.
 * Each combination represents a way to divide H-1 rows horizontally.
 * @param {number} len - The number of bits to generate combinations for (H-1).
 * @returns {Array<object>} A sorted list of objects, each with 'cnt' (bit count) and 'v' (bit string).
 */
function getBit(len) {

    var list = []; // Initialize an empty list to store bit combinations.

    // Loop from 0 up to 2^len - 1 to generate all possible bit patterns.
    for (var i = 0; i < Math.pow(2, len); i++) {

        // Add an object to the list:
        // 'cnt': The number of set bits (1s) in 'i'.
        // 'v': A zero-padded binary string representation of 'i' with length 'len'.
        list.push({
            cnt: bitCount32(i),
            v: ("0000000000" + i.toString(2)).slice(-len)
        });
    }

    // Sort the list primarily by the count of set bits in ascending order.
    return list.sort((a, b) => a.cnt - b.cnt);
}

/**
 * Counts the number of set bits (1s) in a 32-bit integer.
 * This is a highly optimized bit counting algorithm.
 * @param {number} n - The integer to count bits for.
 * @returns {number} The number of set bits.
 */
function bitCount32(n) {
    // Subtracting (n >> 1) & 0x55555555 counts bits in pairs.
    n = n - ((n >> 1) & 0x55555555);

    // Summing adjacent 2-bit counts to get 4-bit counts.
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);

    // Summing adjacent 4-bit counts to get 8-bit counts, then extracting the final count.
    return ((n + (n >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

// This line executes the Main function with input read from standard input.
// It reads the entire file, converts it to a string, removes leading/trailing whitespace,
// and splits it into an array of lines.
Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));