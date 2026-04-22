// This is the main function that processes the input.
function MainA(   input    )
{
  // Split the input string by newline characters to get individual lines.
  input   =    input.split( "\n" )   ;


  // Extract the first line as 'n' (presumably a count or limit).
  var    n    =    input[ 0 ]   ;

  // Extract the second line as 's' (presumably a string of characters).
  var    s    =    input[ 1 ]   ;


  // Initialize counters for 'R' (red) and 'B' (blue) occurrences.
  var    r    =    0    ;
  var    b    =    0    ;


  // Loop through the characters of string 's' up to 'n' times.
  for(    var    i    =    0   ;    i    <    n   ;    i++    )
  {
    // Check if the current character is 'R'.
    if(    s[ i ]    ==    "R"    )
    {
      // Increment the 'r' counter if it's 'R'.
      r++    ;
    }
    else
    {
      // Otherwise, increment the 'b' counter.
      b++    ;
    }
  }


  // Determine the result based on the comparison of 'a' and 'b'.
  // NOTE: This comparison uses variable 'a' which is not defined within this scope.
  // This is a direct replication of the original code's logic, including potential errors.
  var    result    =    (    a    >    b    )    ?    "Yes"    :    "No"    ;


  // Print the final result to the console, formatted as a string.
  console.log(    '%s'   ,   result    )   ;
}

/*
 * !!! IMPORTANT SECTION !!!
 * The following lines are crucial for handling standard input/output.
 * Please DO NOT EDIT anything from this line onwards, as it ensures
 * the program correctly reads input and calls the MainA function.
 * It reads the entire content from /dev/stdin in UTF-8 encoding.
 */
MainA( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;