/*
 * This is the main entry point for processing the input data.
 * It reads dimensions, processes the map, and initiates the core logic.
 */
function Main(  input  ) { // The 'input' parameter holds all the raw input lines.

    // Parse the dimensions H, W, and K from the first line of input.
    // The '-0' is a common JavaScript trick to convert string to number.
    var H = input[  0  ].split(" ")[  0  ] - 0; // Height of the grid.
    var W = input[  0  ].split(" ")[  1  ] - 0; // Width of the grid.
    var K = input[  0  ].split(" ")[  2  ] - 0; // Maximum allowed '1's in a segment.


    // Initialize the map array to store the grid data.
    var map = [  ];
    // Populate the map with data from subsequent input lines.
    // Note: input[0] was already used for H, W, K, so map starts from input[1].
    for (  var i = 1  ;  i <= H  ;  i++  ) {
        map[  i - 1  ] = input[  i  ]; // Store each row of the map.
    }

    // Initialize the global minimum answer with a very large value (H*W is a safe upper bound).
    ans = H * W;

    // Generate all possible bit combinations for horizontal cuts.
    // The number of cuts is H-1.
    var btc = getBit(  H - 1  );

    // Iterate through each bit combination (each set of horizontal cuts).
    btc.forEach(  bt => {
        // For each combination, check if it's a valid and optimal solution.
        check(  map  ,  bt  ,  K  ,  H  );
    }  );

    // After checking all combinations, print the globally minimum answer.
    console.log(  ans  );
}


// Global variable to store the minimum number of vertical cuts found so far.
// It's initialized to 0 here, but will be set to H*W in Main for proper comparison.
var ans = 0;



/*
 * Function to check a specific configuration of horizontal cuts (defined by 'bt')
 * and calculate the minimum vertical cuts required for that configuration.
 *
 * @param {Array<string>} map - The 2D grid represented as an array of strings.
 * @param {object} bt - An object containing bit count and bit vector for horizontal cuts.
 * @param {number} K - The maximum allowed '1's in any segment.
 * @param {number} H - The height of the grid.
 */
function check(  map  ,  bt  ,  K  ,  H  ) {

    // 'aans' stores the number of cuts for the current 'bt' configuration.
    // It starts with the number of horizontal cuts.
    var aans = bt.cnt;

    // 'len' is the width of the map (number of columns).
    var len = map[  0  ].length;

    // 'pcnt' seems unused in the original code, but we must keep it.
    var pcnt = 0;

    // 'nsum' will store the sum of '1's in each segment for the current column.
    var nsum = [  ];

    // 'flg' indicates if the current column could be successfully processed without exceeding K.
    var flg = false;

    // 'add' indicates if a vertical cut was added in the previous iteration.
    var add = false;


    // Loop through each column of the map.
    start: for (  var i = 0  ;  i < len  ;  i++  ) {

        var nbox = 0; // 'nbox' represents the current segment index.

        // Loop through each row in the current column.
        for (  var j = 0  ;  j < H  ;  j++  ) {

            // If the current cell contains '1', increment the count for its segment.
            if (  map[  j  ][  i  ] == "1"  ) {
                nsum[  nbox  ] = (  nsum[  nbox  ]  ||  0  ) + 1;
            }

            // If any segment's '1' count exceeds K, we need to handle it.
            if (  nsum[  nbox  ] > K  ) {

                // If this is the first column of a new vertical segment (flg is false),
                // then this horizontal cut configuration is invalid for this map.
                // We must return early because we can't make a cut *before* this column.
                if (  !flg  ) return;

                // Reset 'flg' to indicate we are starting a new vertical segment.
                flg = false;

                // Mark that a vertical cut has been added.
                add = true;

                // Decrement 'i' to re-process the current column after making a vertical cut.
                i--;

                // Clear 'nsum' as we are starting counts for a new vertical segment.
                nsum = [  ];

                // Jump to the 'start' label to continue with the re-processed column.
                continue start;
            }

            // If a horizontal cut is defined at this row, move to the next segment.
            if (  bt.v[  j  ] == "1"  ) nbox++;
        }

        // If we reached here, the current column was successfully processed without
        // exceeding K in any segment (or a cut was made).
        flg = true;

        // If a vertical cut was added in the previous iteration, increment the total vertical cuts.
        if (  add  ) aans++;

        // If this is the last column, update the global minimum answer.
        if (  i == len - 1  ) {
            ans = Math.min(  ans  ,  aans  );
        }
    } // End of outer loop (columns)

    // The return value 'aans' is not used in the Main function,
    // as the global 'ans' is updated directly.
    return aans;

}


/**
 * Generates a list of bit combinations and their counts.
 * Each combination represents a set of horizontal cuts.
 *
 * @param {number} len - The number of possible cut positions (H-1).
 * @returns {Array<object>} An array of objects, each with 'cnt' (bit count)
 *                          and 'v' (binary string representation) properties.
 */
function getBit(  len  ) {

    var list = [  ]; // This array will hold all generated bit configurations.

    // Loop from 0 to 2^len - 1 to generate all possible bit patterns.
    for (  var i = 0  ;  i < Math.pow(  2  ,  len  )  ;  i++  ) {
        // Push an object containing the bit count and the zero-padded binary string.
        list.push(  {
            cnt: bitCount32(  i  ), // Count of set bits.
            v: (  "0000000000" + i.toString(  2  )  ).slice(  -len  ) // Binary string, padded to 'len'.
        }  );
    }

    // Sort the list by the number of set bits (cuts).
    // This might be an optimization to process simpler cases first,
    // though not strictly necessary for correctness.
    return list.sort(  (  a  ,  b  ) => a.cnt - b.cnt  );
}


/**
 * Counts the number of set bits (1s) in a 32-bit integer.
 * This is a highly optimized bit manipulation algorithm (bitwise parallel sum).
 *
 * @param {number} n - The integer whose bits are to be counted.
 * @returns {number} The number of set bits.
 */
function bitCount32(  n  ) {

    // Step 1: Count bits in pairs (e.g., 01 -> 1, 10 -> 1, 11 -> 2).
    // n = (n & 0x55555555) + ((n >> 1) & 0x55555555); -- This is the standard form.
    // The original code has 'n - ((n >> 1) & 0x55555555)' which is also valid for this step
    // and is part of the "SWAR" (SIMD within a register) algorithm.
    n = n - (  (  n >> 1  ) & 0x55555555  );

    // Step 2: Sum results in groups of 4 bits.
    n = (  n & 0x33333333  ) + (  (  n >> 2  ) & 0x33333333  );

    // Step 3: Sum results in groups of 8 bits, then 16, then 32.
    // The final multiplication and shift aggregates the sum into the most significant byte.
    return (  (  n + (  n >> 4  ) & 0xF0F0F0F  ) * 0x1010101  ) >> 24;
}


// This is the main execution line.
// It reads input from stdin, processes it, and passes it to the Main function.
Main(  require("fs").readFileSync(  "/dev/stdin"  ,  "utf8"  ).trim().split("\n")  );