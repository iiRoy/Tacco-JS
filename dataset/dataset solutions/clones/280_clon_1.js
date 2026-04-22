/*
 * This JavaScript program is designed to read text input from standard input,
 * process it by splitting into words, filtering those words based on length,
 * and then outputting the resulting sequence of words to the console,
 * separated by single spaces. It's a demonstration of basic file I/O,
 * string manipulation, and array operations in Node.js.
 */

// First, we declare a variable to store the raw content read from the input stream.
// We use the 'fs' (file system) module to read the file synchronously.
// The input is expected from '/dev/stdin', which is standard input on Unix-like systems.
// The encoding 'utf8' is specified to correctly interpret the text.
  var   input   =   require (   'fs'   )   .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   ;


// Next, we create a new variable to hold the string after trimming any leading
// or trailing whitespace characters. This ensures that our word splitting
// is not affected by accidental newlines or spaces at the beginning or end of the input.
  var   str     =   input   .   trim ( )   ;


// Here, we declare an array variable. We populate this array by splitting the
// trimmed string. The split operation uses a regular expression to define
// the delimiters: any whitespace character (\s), a literal dot (\.), or a comma (,).
// This effectively breaks the string into individual words or tokens.
  var   arr     =   str   .   split (   / \s | \. | \, /   )   ;


// Now, we reassign the 'arr' variable with a filtered version of itself.
// The filter method iterates over each element 'v' in the array.
// It keeps only those elements (words) whose length is greater than or equal to 3
// AND less than or equal to 6. This is a common way to select words within a specific size range.
  arr =   arr . filter (
    function (   v   )
    {
      // The return statement specifies the condition for an element to be included
      // in the new filtered array.
      return  (   v . length   >=   3   &&   v . length   <=   6   )   ;
    }
  )   ;


// Finally, the program prints the processed array to the console.
// The elements of the 'arr' array are joined together into a single string,
// with each element separated by a single space character.
  console . log (   arr . join (   " "   )   )   ;