/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are identical.
 * Only whitespace and comments have been altered significantly.
 */
function Main(  input  )
{
    // Process the input string: trim, split by newline, then split each line by space.
    input  =  input.trim().split("\n").map(function(x) { return x.split(" ") });    

    // Initialize line counter for processing input blocks.
    var l = 1;

    /**
     * Finds the insertion point for 'n' in a sorted array 'arr'
     * such that all elements before the insertion point are less than 'n'.
     * This is a standard lower bound implementation.
     * @param {Array<number>} arr - The sorted array.
     * @param {number} n - The value to search for.
     * @returns {number} The index where 'n' would be inserted.
     */
    const lowerBound = (arr, n) => {
        let first = 0, last = arr.length - 1, middle; // Initialize search boundaries.
        while (first <= last) {
            middle = 0 | (first + last) / 2; // Calculate middle index using bitwise OR for floor.
            if (arr[middle] < n) {
                first = middle + 1; // 'n' is in the upper half.
            } else {
                last = middle - 1; // 'n' is in the lower half or is arr[middle].
            }
        }
        return first; // 'first' will be the lower bound index.
    }

    // Main loop to process multiple test cases from the input.
    while (true){
        // Check if there are no more lines to process.
        if (input[l] == null) {
            break; // Exit the loop if end of input is reached.
        }

        // Parse the number of items for the current test case.
        var N = parseInt(input[l][0], 10);
        
        // Arrays to store KLR lines based on conditions.
        var arr_KLR1 = [];  
        var arr_KLR2 = [];  
        
        var line; // Variable to hold the current parsed line.
        var lowLimit = 0; // Accumulator for the minimum possible sum.
        var Nafter = N; // Counter for items that can potentially be optimized.

        // Loop through N items for the current test case.
        for (var i = 0; i < N; i++){
            // Parse the current line into an array of integers.
            line = input[l + i + 1].map(e => parseInt(e, 10));
            
            // This console.log appears to be a leftover or debugging line.
            console.log
            
            // Conditional logic to categorize and process each line.
            if (line[0] === N){
                lowLimit += line[1]; // Add K to lowLimit if K is N.
                Nafter --; // Decrement Nafter as this item is fixed.
            } else if (line[1] > line[2]) {
                arr_KLR1.push(line); // Add to arr_KLR1 if L > R.
                lowLimit += line[2]; // Add R to lowLimit.
            } else if (line [1] < line[2]){
                // Transform line for arr_KLR2: [N-K, R, L]
                line = [N - line[0], line[2], line[1]];
                arr_KLR2.push(line); // Add to arr_KLR2 if L < R.
                lowLimit += line[2]; // Add R (original R, now line[1]) to lowLimit.
            } else {
                // If L === R, add L (or R) to lowLimit.
                lowLimit += line[1];
                Nafter --; // Decrement Nafter as this item is fixed.
            }
        }

        // Sort arr_KLR1 by the first element (K).
        arr_KLR1.sort((a, b) => a[0] - b[0]);
        // Sort arr_KLR2 by the first element (N-K).
        arr_KLR2.sort((a, b) => a[0] - b[0]);


        var ans = lowLimit; // Initialize answer with the calculated lowLimit.
        // Create a temporary map (boolean array) to track occupied slots.
        var tmpMap = Array.from({length: Nafter}, () => false);
        var bestPlace; // Variable to store the best available slot.
        var increase; // Variable to store the potential increase in sum.

        // Process items in arr_KLR1 to maximize the sum.
        for (var i = 0; i < arr_KLR1.length; i++){
            bestPlace = arr_KLR1[i][0] - 1; // Calculate initial best place (K-1).
            increase = arr_KLR1[i][1] - arr_KLR1[i][2]; // Calculate potential increase (L-R).
            
            // Find the first available slot by moving backwards from bestPlace.
            while (tmpMap[bestPlace] !== false){
                bestPlace --;
            }
            
            // If a valid slot is found, mark it and add the increase to the answer.
            if (bestPlace >= 0) {
                tmpMap[bestPlace] = true;
                ans += increase;
            }
        }
        // console.log(tmpMap); // Debugging line for tmpMap state.

        // Reset tmpMap for processing arr_KLR2.
        tmpMap = Array.from({length: Nafter}, () => false);
        
        // Process items in arr_KLR2 to maximize the sum.
        for (var i = 0; i < arr_KLR2.length; i++){
            bestPlace = arr_KLR2[i][0] - 1; // Calculate initial best place ((N-K)-1).
            increase = arr_KLR2[i][1] - arr_KLR2[i][2]; // Calculate potential increase (R-L).
            
            // Find the first available slot by moving backwards from bestPlace.
            while (tmpMap[bestPlace] !== false){
                bestPlace --;
            }
            
            // If a valid slot is found, mark it and add the increase to the answer.
            if (bestPlace >= 0) {
                tmpMap[bestPlace] = true;
                ans += increase;
            }
        }
        // console.log(tmpMap); // Another debugging line.
        


        // Output the final calculated answer for the current test case.
        console.log(ans);


        // Advance the line pointer to the next test case.
        l += N + 1;
    }
}


// Call the Main function with input read from standard input.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));