// This program is a C# console application demonstrating basic input/output,
// list manipulation, and conditional logic.
// It processes lines of numerical input and generates "YES" or "NO" responses.

// Import necessary namespaces for core functionalities.
using   System  ; // Provides fundamental classes and base types, such as Console.
using   System.Collections.Generic  ; // Required for using generic collections like List<T>.
using   System.Linq  ; // Offers powerful query capabilities (LINQ), though not heavily utilized here.
using   System.Text  ; // Provides classes for character encodings, not directly used in this specific snippet.


// Define the namespace for organizing related code.
namespace   test
{

  // The primary class that contains the application's entry point.
  class   Program
  {

    // This is the main method, the starting point of the application execution.
    static   void   Main   (   string [ ]   args   )
    {
      // Initialize a new list to store the string results ("YES" or "NO").
      // This list will accumulate outcomes from processing each input line.
      List< string >   resultList   =   new   List< string > ( ) ;

      // Declare a variable to hold the string read from the console.
      string   input  ;

      // Loop continuously, reading lines from the console until an empty input (null) is encountered.
      // This typically happens when the end of the input stream is reached.
      while   (   (   input   =   Console . ReadLine ( )   )   !=   null   )
      {
        // Split the current input line string into an array of substrings
        // using a space character as the delimiter.
        string [ ]   array   =   input . Split ( ' ' ) ;

        // Parse the first three elements of the string array into integer variables.
        // These are assumed to be valid integer representations.
        int   c1   =   int . Parse ( array [ 0 ] ) ; // First integer value.
        int   c2   =   int . Parse ( array [ 1 ] ) ; // Second integer value.
        int   c3   =   int . Parse ( array [ 2 ] ) ; // Third integer value.

        // Calculate a sum of c1 and c2. This variable 'sum' is declared but not used later.
        int   sum   =   c1   +   c2 ;

        // Create a new list of integers, named 'mountain'.
        // This list will be populated based on a specific condition.
        List< int >   mountain   =   new   List< int > ( ) ;

        // Iterate through numbers from 1 to 10 (inclusive).
        for   (   int   i   =   1   ;   i   <=   10   ;   i ++   )
        {
          // Conditional check: if 'i' is not equal to c1 OR not equal to c2 OR not equal to c3,
          // then 'i' is added to the 'mountain' list.
          // This means 'i' is excluded from 'mountain' only if i == c1 AND i == c2 AND i == c3.
          if   (   i   !=   c1   ||   i   !=   c2   ||   i   !=   c3   )
          {
            mountain . Add ( i ) ; // Add the current integer 'i' to the mountain list.
          }
        } // End of the for loop that populates the 'mountain' list.


        // Evaluate a final condition using c1, c2, and the fourth element (index 3) of the 'mountain' list.
        // This assumes 'mountain' will always contain at least four elements for index 3 to be valid.
        if   (   (   c1   +   c2   +   mountain [ 3 ]   )   <=   20   )
        {
          resultList . Add ( "YES" ) ; // If the condition is true, add "YES" to the result list.
        }
        else
        {
          resultList . Add ( "NO" ) ; // Otherwise (if the condition is false), add "NO" to the result list.
        }

      } // End of the while loop, all input lines have been processed.


      // Iterate over each string 'a' in the 'resultList'.
      // This loop is responsible for displaying the collected results.
      foreach   (   string   a   in   resultList   )
      {
        Console . WriteLine ( a ) ; // Print each result string to the console, followed by a new line.
      }

    } // End of the Main method.

    /*
     * This is a multi-line comment block.
     * No additional methods or properties are defined within the Program class for this example.
     * The class structure is kept minimal to focus on the main logic.
     */

  } // End of the Program class definition.

} // End of the 'test' namespace.