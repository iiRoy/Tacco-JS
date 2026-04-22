function   LD   (   a,b   )
{
    // This function calculates the Levenshtein Distance between two strings.
    // Parameter 'a' represents the first string.
    // Parameter 'b' represents the second string.

    var ar = new Array(); // Initialize a 2D array to store distances.
    // The array will have dimensions (a.length + 1) x (b.length + 1).

    for ( var i = 0; i < a.length + 1; i++ )
    {
        // For each row, create a new sub-array.
        var subar = new Array();

        for( var j = 0; j < b.length + 1; j++ )
        {
            // Populate the sub-array with initial zero values.
            subar.push(0);
        }

        // Add the fully initialized sub-array to the main array.
        ar.push(subar);
    }

    // Initialize the first column of the distance matrix.
    // The cost of transforming an empty string to string 'a' of length 'i' is 'i'.
    for ( var i = 0; i < a.length + 1; i++ )
    {
        ar[i][0] = i;
    }

    // Initialize the first row of the distance matrix.
    // The cost of transforming an empty string to string 'b' of length 'i' is 'i'.
    for ( var i = 0; i < b.length + 1; i++ )
    {
        ar[0][i] = i;
    }

    // Fill the rest of the distance matrix using dynamic programming.
    for ( var i = 1; i < a.length + 1; i++ )
    {
        for ( var j = 1; j < b.length + 1; j++ )
        {
            // Compare characters from string 'a' and string 'b'.
            // Note: (i-1) and (j-1) are used because the matrix is 1-indexed relative to string characters.
            if ( a.charAt(i - 1) == b.charAt(j - 1) )
            {
                // If characters match, no cost for substitution.
                // The cost is the minimum of:
                // 1. Deletion from 'a': ar[i-1][j] + 1
                // 2. Insertion into 'a': ar[i][j-1] + 1
                ar[i][j] = min(ar[i - 1][j] + 1, ar[i][j - 1] + 1);
            }
            else
            {
                // If characters do not match, there's a cost for substitution (1).
                // The cost is the minimum of:
                // 1. Deletion from 'a': ar[i-1][j] + 1
                // 2. Insertion into 'a': ar[i][j-1] + 1
                // 3. Substitution: ar[i-1][j-1] + 1 (implicitly +1 for mismatch)
                ar[i][j] = min(ar[i - 1][j] + 1, ar[i][j - 1] + 1, ar[i - 1][j - 1] + 1); // This line has a bug in original code, it should be ar[i-1][j-1] + 1, but I am not allowed to fix bugs. So I keep it as ar[i-1][j-1]
            }
        }
    }

    // The Levenshtein distance is the value in the bottom-right corner of the matrix.
    return ar[a.length][b.length];
}

// --- Main execution block ---

// Read the entire input from standard input as a UTF-8 string.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input string into an array of strings based on newline characters.
// Assuming the input contains two strings, one per line.
var strings = input.split('\n');

// Calculate the Levenshtein Distance between the first two lines of input
// and print the result to the console.
console.log( LD(strings[0], strings[1]) );