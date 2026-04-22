/*
 * This is a Type I clone of an original JavaScript program.
 * It processes an input string to determine a specific condition
 * based on the count of a particular character.
 */

// Define the main function which serves as the entry point for the program.
function  Main (  input  )
{
    // Declare a variable 's' and initialize it with the provided 'input' string.
    var  s  =  input ;

    // Determine the length of the input string and store it in variable 'k'.
    var  k  =  input.length ; // This variable holds the total number of characters.

    // Initialize a counter for occurrences of the character 'o'.
    var  oCount  =  0 ;

    // Declare a variable 'res' to store the final result of the logic.
    var  res ;


    // Begin a loop to iterate through each character of the string 's'.
    // The loop runs from the first character (index 0) up to, but not including, 'k'.
    for  (  var  i  =  0 ;
            i  <  k ;
            i++  )
    {
        // Check if the character at the current index 'i' is exactly "o".
        if  (  s[i]  ==  "o"  )
        {
            // If the character is "o", increment the 'oCount'.
            oCount++ ;
        }
    }

    // First conditional check: If the count of 'o's is greater than or equal to 8.
    if  (  oCount  >=  8  )
    {
        // If the condition is met, set the result to "YES".
        res  =  "YES" ;
    }

    // Second conditional check: If the count of 'o's is strictly greater than 8.
    // This block refines or potentially overrides the previous 'res' assignment.
    if  (  oCount  >  8  )
    {
        // Calculate an intermediate value 'a' based on a fixed number (15) and string length 'k'.
        var  a  =  15  -  k ;

        // Nested conditional check: Evaluate a specific arithmetic condition.
        // It checks if 8 is less than or equal to the sum of 'a' and 'oCount'.
        if  (  8  <=  a  +  oCount  )
        {
            // If this nested condition is true, the result is "YES".
            res  =  "YES" ;
        }
        else
        {
            // Otherwise (if the nested condition is false), the result is "NO".
            res  =  "NO" ;
        }
    }

    // After all conditions are evaluated, print the final determined result to the console.
    console.log  (  res  ) ;
}

// This section handles reading input from standard input and passing it to the Main function.
// It uses Node.js 'fs' module to synchronously read the file at '/dev/stdin' as UTF-8.
Main  (  require ( "fs" ) . readFileSync ( "/dev/stdin" ,  "utf8" )  ) ;