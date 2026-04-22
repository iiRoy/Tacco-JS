function over ( x ) {
    // This function adjusts a number if it's 10 or greater.
    // It subtracts 10 and then adds 1, effectively mapping 10 to 1, 11 to 2, etc.
    if ( x >= 10 ) {
        x = x - 10 + 1;
    }

    // Return the adjusted value.
    return x;
}


// Read the entire input from standard input as a UTF-8 string.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim any leading/trailing whitespace and split the input string by newlines.
var arr = input.trim().split("\n");

// Extract the first number from the array, converting it to a number.
// The '-0' is a common trick to convert a string to a number.
var n = arr.shift() - 0;

// Extract the next line and split it into an array of individual characters.
var id = arr.shift().split("");

// The original code had a commented-out line for reversing 'id'.
// This line remains commented out, as per Type I cloning rules.
// id.reverse(); // This line was commented out in the original source.

// Extract another number from the array.
var a = arr.shift() - 0;

// Extract the next line, split it by spaces, and convert each part to a number.
var ary = arr.shift().split(" ").map(Number);


// Initialize an empty array 'k' which will store either 1 or 2.
var k = [];

// Initialize a sum variable.
var sum = 0;

// Loop through each character in the 'id' array.
for ( var i = 0; i < id.length; i++ ) {
    // Get the current character.
    var v = id[i];

    // Check if the character is an asterisk.
    if ( v == "*" ) {
        // If the index is even, push 1 into 'k'.
        if ( i % 2 == 0 ) {
            k.push(1);
        }
        // Otherwise (if the index is odd), push 2 into 'k'.
        else {
            k.push(2);
        }
    }
    // If the character is not an asterisk, it's a digit.
    else {
        // If the index is even, add the digit (converted to number) to 'sum'.
        if ( i % 2 == 0 ) {
            sum += v - 0;
        }
        // Otherwise (if the index is odd), multiply the digit by 2,
        // pass it through the 'over' function, and add the result to 'sum'.
        else {
            sum += over(( v - 0 ) * 2);
        }
    }
}


// Initialize a 2D array 'dp' for dynamic programming.
var dp = [];

// Populate the 'dp' array with initial dimensions.
// It will have k.length + 1 rows.
for ( var i = 0; i <= k.length; i++ ) {
    dp[i] = []; // Initialize each row as an empty array.

    // Initialize all elements in the current row to 0.
    // The columns go up to 99, so 100 elements per row.
    for ( var s = 0; s < 100; s++ ) {
        dp[i][s] = 0;
    }
}


// Set the base case for the dynamic programming: dp[0][0] is 1.
// This signifies one way to achieve a sum of 0 with no elements from 'k' processed yet.
dp[0][0] = 1;


// Perform the main dynamic programming calculation.
// Iterate through each element in the 'k' array.
for ( var i = 0; i < k.length; i++ ) {
    // Iterate through each element in the 'ary' array.
    for ( var j = 0; j < ary.length; j++ ) {
        // Iterate through possible sums from 0 to 99.
        for ( var s = 0; s < 100; s++ ) {
            // If dp[i][s] has a valid count (is not zero).
            if ( dp[i][s] > 0 ) {
                // Calculate the value to be added to the sum using 'ary[j]' and 'k[i]',
                // then passing it through the 'over' function.
                var valueToAdd = over(ary[j] * k[i]);

                // Update the next state in the DP table.
                // The new sum is 's + valueToAdd'.
                // We add the count from the previous state 'dp[i][s]' to the new state.
                dp[i + 1][s + valueToAdd] += dp[i][s];
            }
        }
    }
}


// Initialize the final answer variable.
var ans = 0;

// Iterate through all possible sums 's' from 0 to 99.
for ( var s = 0; s < 100; s++ ) {
    // Check if the total sum (initial 'sum' + current 's') is divisible by 10.
    if ( ( sum + s ) % 10 == 0 ) {
        // If it is, add the corresponding count from the DP table to the answer.
        // This represents the number of ways to achieve a valid total sum.
        ans += dp[k.length][s];
    }
}

// Print the final calculated answer to the console.
console.log(ans);