"use strict"
// This directive ensures that the JavaScript code runs in strict mode,
// catching common coding errors and preventing "unsafe" actions.

function main(arg) {
    // This is the primary function, serving as the entry point of the program.
    // It processes the input, orchestrates the main logic, and outputs the result.

    // First, parse the input string 'arg'.
    // It's expected to be a multi-line string where the first line is 'a'
    // and the second line is 'b'.
    var a = Number(arg.trim().split("\n")[0]) // Extract the first number.
    var b = Number(arg.trim().split("\n")[1]) // Extract the second number.

    // Call the core calculation function 'z1' with the parsed numbers.
    var ans = z1(a, b)

    // Display the final computed answer to the standard output.
    console.log(ans)
}

// Immediately invoke the 'main' function.
// The input is read synchronously from '/dev/stdin' using Node.js 'fs' module,
// and decoded as 'utf8' text.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));


/*
 * Function: z1
 * --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * Purpose: This function computes a specific count based on the input integers 'a' and 'b'.
 *          It iterates through binary masks, filtering them by length and number of '1's,
 *          and then performs further calculations involving digit replacements for matching masks.
 * Parameters:
 *   a - An integer representing the upper bound for generated numbers and determining mask length.
 *   b - An integer representing the required count of '1's in the binary mask.
 * Returns:
 *   An integer, representing the final calculated total.
 * --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */
function z1(a, b) {

    var l = String(a).length // Get the number of digits in 'a' to compare mask lengths.
    var ans = 0              // Initialize the variable to accumulate the final answer.

    for (var i = 0; i < 100; i++) {
        // This loop iterates through integers from 0 up to 99.
        // Each integer 'i' is converted into its binary representation to serve as a 'mask'.

        var mask = i.toString(2) // Convert the current integer 'i' to a binary string.

        if (mask.length > l) {
            // If the current binary mask is longer than the number of digits in 'a',
            // then any subsequent masks (which will also be longer or equal) are irrelevant.
            // Therefore, we can terminate the loop early.
            break
        }

        // Count the occurrences of '1's in the binary mask.
        // `split('1')` creates an array where elements are separated by '1's.
        // The length of this array minus 1 gives the count of '1's.
        if (mask.split('1').length - 1 !== b) {
            // If the count of '1's in the mask does not match the target 'b',
            // this mask is not relevant for the current calculation, so skip to the next iteration.
            continue
        }

        // console.log(mask) // Original debugging line, kept commented as per Type I clone rules.


        if (mask.length < l) {
            // Scenario 1: The current mask's length is strictly less than the length of 'a'.
            // This implies we are considering numbers that have fewer digits than 'a'.
            // In this case, we add 9 raised to the power of (number of '1's in the mask) to our answer.
            ans += Math.pow(9, mask.split('1').length - 1)
        } else {
            // Scenario 2: The current mask's length is exactly equal to the length of 'a'.
            // This is a more complex case involving an inner loop and digit replacement.

            // console.log(l) // Original debugging line.

            for (var j = 111; j <= 999; j++) {
                // Inner loop: Iterate through integers from 111 to 999.
                // These 'j' values provide the digits that will replace the '1's in the mask.

                // This condition checks if 'j' contains any '0's.
                // `String(j).split("0")` creates an array of substrings.
                // If `j` contains no '0's (e.g., "111"), `split("0")` yields `["111"]`.
                // In JavaScript, `["111"] > 1` evaluates to `true` (due to type coercion: "111" -> 111).
                // So, `!(true)` is `false`, and the code proceeds.
                // If `j` contains '0's (e.g., "101"), `split("0")` yields `["1", "1"]`.
                // In JavaScript, `["1", "1"] > 1` evaluates to `false` (due to type coercion: "1,1" -> NaN).
                // So, `!(false)` is `true`, and the `continue` statement is executed.
                // Therefore, this `if` block effectively *skips* any `j` values that contain '0's.
                if (!(String(j).split("0") > 1)) continue


                // console.log(j) // Original debugging line.
                // if (mask.split('1').length - 1) // Incomplete commented-out line from original.

                var t = replace9(mask, j) // Use the helper function to construct a number 't'.

                if (t > a) {
                    // If the number 't' generated by `replace9` is greater than 'a',
                    // then any subsequent 'j' values (which are increasing) will also likely
                    // result in numbers greater than 'a'. Thus, we can break this inner loop.
                    break
                }

                ans += 1 // Increment the answer if 't' is valid (i.e., not greater than 'a').
                // console.log([mask, j, t]) // Original debugging line.
            }
        }

    } // End of the main 'for' loop.

    return ans // Return the final accumulated count.
}


/*
 * Function: replace9
 * --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 * Purpose: This utility function constructs a new number by taking a binary 'mask' string
 *          and an integer 'r'. It replaces the '1's in the mask (from right to left)
 *          with the digits of 'r' (also from right to left), and '0's remain '0'.
 * Parameters:
 *   mask - A string representing a binary pattern (e.g., "101").
 *   r    - An integer whose digits will be used to fill the '1' positions in the mask (e.g., 123).
 * Returns:
 *   A number constructed by applying the digit replacement logic.
 * --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 */
function replace9(mask, r) {

    var fix_mask = String(mask).split("").reverse() // Convert mask to a reversed array of characters.
    var fix_r = String(r).split("").reverse()       // Convert 'r' to a reversed array of its digits.

    var ans = []  // Initialize an empty array to store the resulting digits.
    var count = 0 // A counter to track which digit from `fix_r` should be used next.

    for (var i = 0; i < fix_mask.length; i++) {
        // Iterate through the reversed mask, from its rightmost digit to its leftmost.
        if (fix_mask[i] === '1') {
            // If the current mask character is '1',
            // take a digit from `fix_r` and add it to our result array.
            ans.push(fix_r[count])
            count++ // Move to the next digit in `fix_r` for the next '1'.
        } else {
            // If the current mask character is '0',
            // simply add '0' to our result array.
            ans.push(fix_mask[i])
        }
    }

    // The 'ans' array currently holds digits in reverse order.
    // Reverse it back, join the characters to form a string,
    // and then convert that string to a number before returning.
    return Number(ans.reverse().join(""))
}