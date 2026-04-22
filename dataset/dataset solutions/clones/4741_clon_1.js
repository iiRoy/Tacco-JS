// --- Start of JavaScript Program ---

// This line reads the input from standard input.
input =require ('fs'). readFileSync ('/dev/stdin','utf8' ) ; // Read file synchronously

// Split the input into an array of lines.
lines =input.split ('\n' ) ;

// Get the first number from the input and convert it to a number.
// The `* 1` is a common idiom to convert a string to a number.
N = lines.shift () *1 ;

// Calculate the base answer.
// Math.floor(N / 11) gives the number of full 11-unit blocks.
// Each block contributes 2 to the answer.
ans = Math.floor(N / 11) *2 ;

// Calculate the remainder when N is divided by 11.
m = N % 11 ;

// Conditional logic based on the remainder 'm'.
if (m == 0)
{
    // If the remainder is 0, no additional value is added to 'ans'.
    // This block is intentionally empty.
}
else if (m <= 6)
{
    // If the remainder is between 1 and 6 (inclusive), add 1 to 'ans'.
    ans +=1 ;
}
else
{
    // If the remainder is between 7 and 10 (inclusive), add 2 to 'ans'.
    ans +=2 ;
}

// Output the final calculated answer to the console.
console . log (ans ) ;

// --- End of Program ---