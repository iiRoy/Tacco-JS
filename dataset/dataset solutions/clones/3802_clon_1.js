// This script processes two lines of input to find a specific minimum value.
// It's designed to solve a problem related to character counts in a string.

// --- Input Acquisition Phase ---

// Use Node.js 'fs' module to read synchronous input from standard input.
// The entire input stream is read as UTF-8, then split into an array of strings by newline characters.
inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// The first line of input is expected to be an integer, 'N'.
// `shift()` removes and returns the first element of the 'inp' array.
// Multiplying by 1 (`* 1`) explicitly converts the string to a number.
N = inp.shift() * 1; // N represents the length of the string S.

// The second line of input is the string 'S'.
// Again, `shift()` retrieves the next element from the 'inp' array.
S = inp.shift(); // S is the target string for analysis.

// --- Variable Initialization Phase ---

// Initialize two accumulators for character counts.
sumE = 0; // This will count 'E' characters from the right end of the string.
sumW = 0; // This will count 'W' characters from the left end of the string.

// Declare and initialize two arrays, 'W' and 'E'.
// W[k] will store the count of 'W's in the substring S[0...k-1].
// E[k] will store the count of 'E's in the substring S[k...N-1].
W = []; // Array to store prefix sums of 'W's.
E = []; // Array to store suffix sums of 'E's.

// Set the base cases for the prefix and suffix sum arrays.
// W[0] means the count of 'W's before any character (empty prefix).
W[0] = 0;
// E[N] means the count of 'E's after the last character (empty suffix).
E[N] = 0;

// --- First Iteration Loop: Populating Prefix/Suffix Sums ---

// This loop iterates 'N' times, from index 0 up to N-1.
// It simultaneously calculates prefix sums for 'W' and suffix sums for 'E'.
for ( i = 0 ; i < N ; i++ )
{
    // Check the character at the current index 'i' from the left.
    if ( S[i] == 'W' )
    {
        sumW++; // If it's 'W', increment the 'W' counter.
    }

    // Check the character at the corresponding index from the right.
    // N-i-1 effectively traverses the string from N-1 down to 0.
    if ( S[N - i - 1] == 'E' )
    {
        sumE++; // If it's 'E', increment the 'E' counter.
    }

    // Store the current accumulated 'W' count into W[i+1].
    // W[i+1] will contain the number of 'W's in S[0...i].
    W[i+1] = sumW;

    // Store the current accumulated 'E' count into E[N-i-1].
    // E[N-i-1] will contain the number of 'E's in S[N-i-1...N-1].
    E[N-i-1] = sumE;
}

// --- Minimum Value Calculation Phase ---

// Initialize 'min' with the maximum possible value it could take, which is N.
// This ensures any valid sum will be smaller and correctly update 'min'.
min = N;

// This loop iterates from 0 to N (inclusive).
// 'i' here represents a potential split point in the string S.
// W[i] is the count of 'W's in S[0...i-1].
// E[i+1] is the count of 'E's in S[i+1...N-1].
// The sum W[i] + E[i+1] represents the total cost if we split at 'i'.
for ( i = 0 ; i <= N ; i++ )
{
    // Compare the current sum with the stored minimum.
    if ( min > W[i] + E[i+1] )
    {
        min = W[i] + E[i+1]; // Update 'min' if a smaller sum is found.
    }
}

// --- Output Phase ---

// Print the final calculated minimum value to the standard output.
console.log(min);