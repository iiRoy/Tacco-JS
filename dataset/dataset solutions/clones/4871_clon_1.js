/*
 *   This is a Type I clone of a JavaScript program.
 *   The original Python code was implicitly translated to JavaScript
 *   to meet the requirement of outputting JavaScript, while still
 *   adhering to the spirit of generating a clone of the logic.
 */


// --- Input simulation section ---
// In a real browser environment, 'prompt()' could be used.
// For Node.js, 'readline' module would be appropriate.
// Here, we use a simple string literal for demonstration purposes.
let    inputString    =    "10    20    30";    // Example input string.

// --- Data processing ---
// Split the string by spaces and convert each part to a number.
// The 'Number' function handles string-to-number conversion directly.
let a = inputString.split(' ').map(Number); /* Apply mapping */


// Sort the array 'a' numerically.
// JavaScript's default sort is lexicographical, so a custom
// comparison function (x, y) => x - y is essential for numbers.
a.sort(
    (x, y) => x - y
); // Sort in ascending order


// --- Conditional logic to check for a specific numerical relationship ---
// We're checking if the sum of two smallest elements equals the third,
// or if the smallest element equals the sum of the other two.
// This implies checking for a triangle-like property or a specific sum.
if (
       a[0] + a[1] === a[2]
    ||
       a[0] === a[1] + a[2]
)

{
    // If the condition is met, output 'Yes'.
    console.log('Yes'); // Affirmative output
}

else

{
    // Otherwise, output 'No'.
    console.log('No'); // Negative output
}

/* End of program execution */