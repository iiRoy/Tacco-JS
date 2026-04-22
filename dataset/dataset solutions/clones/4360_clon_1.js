/*
 * This script is designed to solve a specific optimization problem
 * related to mixing water and sugar solutions, aiming to maximize
 * the sugar concentration (density) within given constraints.
 * It processes input parameters to determine the optimal combination
 * of water and sugar amounts.
 */
function Main(input)
{
    // A simple comparison function used for sorting numeric arrays in ascending order.
    // It takes two arguments, 'a' and 'b', and returns their difference.
    function compareFunc(a, b)
    {
        return a - b;
    }


    // The input string is first prepared for processing.
    // 1. `trim()` removes any leading or trailing whitespace from the input.
    // 2. `split("\n")` divides the input string into an array of lines.
    // 3. `map(function(x) { return x.split(" ")})` then splits each line
    //    into an array of strings based on space delimiters.
    input = input.trim().split("\n").map(function(x)
    {
        return x.split(" ");
    });


    // Parse the first line of the processed input, which contains six integer values.
    // These values represent the problem's core parameters.
    var L1 = input[0].map(e => parseInt(e, 10));


    // Variable declarations and assignments for the problem's constants.
    // These values are derived from the input array L1.
    // Note: A and B are multiplied by 100 to handle potential floating-point
    // issues or to work with smaller units (e.g., milliliters vs. centiliters).
    var A = L1[0] * 100; // Amount of water for solution A (e.g., in 100ml units).
    var B = L1[1] * 100; // Amount of water for solution B (e.g., in 100ml units).
    var C = L1[2];       // Amount of sugar for solution C (e.g., in grams).
    var D = L1[3];       // Amount of sugar for solution D (e.g., in grams).
    var E = L1[4];       // Maximum sugar concentration percentage (e.g., 10 for 10%).
    var F = L1[5];       // Maximum total weight of the mixture allowed (e.g., in ml or grams).


    // Initialize an array to store all possible combined water amounts.
    var ABList = [];

    // Temporary variable used within the nested loops for intermediate calculations.
    var tmp;


    // Nested loops to generate all possible valid water amounts.
    // 'i' iterates through multiples of A, 'j' iterates through multiples of B.
    // The conditions ensure that the total water amount does not exceed the
    // maximum allowed total weight 'F'.
    for (var i = 0; i < (F / A); i++)
    {
        tmp = A * i; // Calculate the current water amount from solution A.

        for (var j = 0; j < ((F - tmp) / B); j++)
        {
            // Add the combined water amount (from A and B) to the list.
            ABList.push(tmp + B * j);
        }
    }


    // Sort the list of water amounts numerically.
    ABList.sort(compareFunc);


    // Filter out duplicate entries from ABList to ensure uniqueness.
    // This uses the `indexOf` method to check if the first occurrence of an element
    // is at the current index, effectively removing subsequent duplicates.
    ABList = ABList.filter(function (x, i, self)
    {
        return self.indexOf(x) === i;
    });


    // Calculate the maximum possible sugar amount 'x' that can be dissolved
    // given the total weight constraint 'F' and solubility percentage 'E'.
    // The formula represents: max_sugar = F * (E / (100 + E)).
    var x = Math.floor(F * E / (100 + E));


    // Initialize an array to store all possible combined sugar amounts.
    var CDList = [];


    // Nested loops to generate all possible valid sugar amounts.
    // 'i' iterates through multiples of C, 'j' iterates through multiples of D.
    // The conditions ensure that the total sugar amount does not exceed 'x'.
    for (var i = 0; i < (x / C); i++)
    {
        tmp = C * i; // Calculate the current sugar amount from solution C.

        for (var j = 0; j < ((x - tmp) / D); j++)
        {
            // Add the combined sugar amount (from C and D) to the list.
            CDList.push(tmp + D * j);
        }
    }


    // Sort the list of sugar amounts numerically.
    CDList.sort(compareFunc);


    // Filter out duplicate entries from CDList, similar to ABList.
    CDList = CDList.filter(function (x, i, self)
    {
        return self.indexOf(x) === i;
    });


    // Create a bitmap (or hash map) to quickly check the presence of sugar amounts.
    // This optimizes lookup time from O(N) to O(1) for sugar amounts.
    var CDbitmap = [];

    // Initialize the bitmap with zeros up to the maximum possible sugar amount 'x'.
    for (var i = 0; i <= x; i++)
    {
        CDbitmap.push(0);
    }

    // Mark the indices corresponding to valid sugar amounts in CDList with '1'.
    for (var i of CDList)
    {
        CDbitmap[i] = 1;
    }

    // The following line was commented out in the original code,
    // so it remains commented out in the clone.
    // console.log(ABList,CDList,CDbitmap);


    // Variables to track the best density found and its corresponding values.
    // `tmpDens`: Stores the maximum sugar density found so far (sugar / water).
    // `tmpCDLL`: Lower limit for sugar amount in the inner loop.
    // `tmpCDHL`: Upper limit for sugar amount in the inner loop.
    var tmpDens, tmpCDLL, tmpCDHL;

    // Initialize the maximum density to 0.
    tmpDens = 0;

    // `ans` will store the final optimal total weight and sugar weight.
    // Note: 'ans' is implicitly declared as a global variable here,
    // reflecting the exact behavior of the original code.
    ans = [0, 0];


    // This line initializes tmpCDHL, though it is immediately overwritten
    // within the main loop. It is kept as-is to preserve exact structure.
    tmpCDHL = x;


    // Main loop: Iterate through all possible water amounts from ABList.
    for (var i of ABList)
    {
        // Calculate the lower bound for sugar amount (tmpCDLL) for the current 'i' (water).
        // This is based on the best density found so far (`tmpDens`).
        // Any sugar amount 'j' less than this would result in a lower density.
        tmpCDLL = Math.round(i * tmpDens);

        // Calculate the upper bound for sugar amount (tmpCDHL) for the current 'i'.
        // This is limited by two factors:
        // 1. The maximum solubility 'E' (sugar must be <= i * E / 100).
        // 2. The total weight constraint 'F' (water + sugar must be <= F, so sugar <= F - i).
        tmpCDHL = Math.min(Math.floor(i * E / 100), F - i);


        // Inner loop: Iterate through possible sugar amounts 'j' within the calculated bounds.
        for (var j = tmpCDLL; j <= tmpCDHL; j++)
        {
            // Check if 'j' is a valid sugar amount by looking it up in the CDbitmap.
            if (CDbitmap[j] === 1)
            {
                // If 'j' is valid, compare the current density (j / i) with the best density found.
                if ((j / i) >= tmpDens)
                {
                    // If a better or equal density is found, update the answer.
                    ans[0] = i + j; // Total weight (water + sugar).
                    ans[1] = j;     // Sugar weight.
                    tmpDens = j / i; // Update the maximum density.
                }

                // Once a sugar amount 'j' has been considered for a given 'i',
                // mark it as processed in the bitmap by setting its value to 0.
                // This prevents redundant checks for this specific 'j' with subsequent 'i's,
                // especially if 'tmpDens' has increased, making previous combinations irrelevant.
                CDbitmap[j] = 0;
            }
        }
    }


    // Edge case handling: If no sugar was added to reach the optimal density,
    // the total weight should simply be the amount of water 'A'.
    // This typically means the highest density was 0, and A is the smallest water amount.
    if (ans[1] === 0)
    {
        ans[0] = A;
    }


    // Output the final answer, which includes the total weight (water + sugar)
    // and the sugar weight, both rounded to the nearest integer.
    console.log("%d %d", Math.round(ans[0]), Math.round(ans[1]));

} // End of the Main function.


// This line reads the input from standard input (/dev/stdin)
// using Node.js's file system module, encodes it as UTF-8,
// and then passes it as a string to the Main function for processing.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));