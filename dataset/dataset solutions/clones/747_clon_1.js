// This function adjusts a number if it is 10 or greater.
// It effectively performs a modulo-like operation but specific to this problem's logic.
function over(x)
{
    // If the input value 'x' is greater than or equal to 10,
    // subtract 10 and add 1. This transforms values like 10 -> 1, 11 -> 2, etc.
    if (x >= 10)
        x = x - 10 + 1;

    // Return the (potentially modified) value of x.
    return x;
}


// Read the entire input from standard input as a UTF-8 string.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace from the input and split it into an array
// of strings, using the newline character as a delimiter.
var arr = input.trim().split("\n");


// Extract the first line, convert it to a number, and store it in 'n'.
// The '-0' is a common JavaScript idiom for type conversion to number.
var n = arr.shift() - 0;

// Extract the second line, split it into an array of individual characters,
// and store it in 'id'. This likely represents a sequence of operations or digits.
var id = arr.shift().split("");

// Extract the third line, convert it to a number, and store it in 'a'.
var a = arr.shift() - 0;

// Extract the fourth line, split it by spaces, and then convert each part
// to a number using the 'map(Number)' function. This array is stored in 'ary'.
var ary = arr.shift().split(" ").map(Number);


// Initialize an empty array 'k'. This array will store multipliers (1 or 2).
var k = [];

// Initialize a variable 'sum' to 0. This will accumulate a sum based on 'id' characters.
var sum = 0;


// Iterate over each character 'v' and its index 'i' in the 'id' array.
id.forEach(function(v, i)
{
    // Check if the current character is an asterisk.
    if (v == "*")
    {
        // If the index 'i' is even, push 1 into the 'k' array.
        if (i % 2 == 0)
            k.push(1);
        // Otherwise (if 'i' is odd), push 2 into the 'k' array.
        else
            k.push(2);
    }
    else
    {
        // If the character is not an asterisk, it's treated as a digit.
        // If the index 'i' is even, convert the character to a number and add it directly to 'sum'.
        if (i % 2 == 0)
            sum += v - 0;
        // Otherwise (if 'i' is odd), convert the character to a number, multiply by 2,
        // pass it through the 'over' function, and then add the result to 'sum'.
        else
            sum += over((v - 0) * 2);
    }
});


// Initialize a 2D array 'dp' (dynamic programming table).
var dp = [];

// Loop to initialize the 'dp' table dimensions.
// The outer loop iterates from 0 up to and including 'k.length'.
for (var i = 0; i <= k.length; i++)
{
    // For each row 'i', initialize it as an empty array.
    dp[i] = [];

    // The inner loop initializes each element in the current row to 0.
    // The size of the inner dimension is fixed at 100.
    for (var s = 0; s < 100; s++)
        dp[i][s] = 0;
}


// Set the initial state of the dynamic programming table:
// dp[0][0] is set to 1, representing a base case or starting point.
dp[0][0] = 1;


// Main dynamic programming loops.
// The outer loop iterates through the elements of 'k'.
for (var i = 0; i < k.length; i++)
{
    // The second loop iterates through the elements of 'ary'.
    for (var j = 0; j < ary.length; j++)
    {
        // The innermost loop iterates for 's' from 0 to 99.
        for (var s = 0; s < 100; s++)
        {
            // If dp[i][s] has a valid count, propagate it to the next state.
            // Calculate the next state's 's' value by adding the result of
            // 'over(ary[j] * k[i])' to the current 's'.
            // Add the value of dp[i][s] to the corresponding cell in dp[i+1].
            dp[i + 1][s + over(ary[j] * k[i])] += dp[i][s];
        }
    }
}


// Initialize 'ans' (answer) to 0.
var ans = 0;

// Iterate through the possible 's' values in the final row of the dp table.
for (var s = 0; s < 100; s++)
{
    // Check if the sum of 'sum' (from 'id' processing) and the current 's' value
    // is divisible by 10.
    if ((sum + s) % 10 == 0)
        // If it is, add the count from dp[k.length][s] to 'ans'.
        ans += dp[k.length][s];
}


// Print the final calculated answer to the console.
console.log(ans);