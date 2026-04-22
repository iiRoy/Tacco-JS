// This script is designed to process a series of commands
// that manipulate a dynamic list of integer values.

// It reads commands from standard input, interpreting each line
// as a distinct operation on the list.

// Utilize Node.js 'fs' module to read the entire file synchronously.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

// First, clean up the input string:
// - Trim any leading/trailing whitespace.
// - Split the string into an array of lines based on the newline character.
var   Arr   =   (   input   .   trim   (   )   )   .   split   (   "\n"   )   ;

// The problem statement implies the first line of input is often
// a count of commands or some other metadata that isn't directly used
// in the list manipulation logic, so it is discarded.
Arr   .   shift   (   )   ;

// Initialize an empty JavaScript array which will serve as our
// dynamic list for all subsequent operations.
var   list   =   [   ]   ;


// Begin iterating through each remaining line in the 'Arr' array.
// Each line represents a command to be executed.
for   (   var   i   =   0   ;   i   <   Arr   .   length   ;   i   ++   )
{
    // For the current line, split it by spaces to separate the command
    // from its potential argument(s).
    var   arr   =   Arr   [   i   ]   .   split   (   " "   )   ;

    // The first element of the split array is always the command name.
    var   a   =   arr   [   0   ]   ;

    // The second element, if present, is typically the argument for the command.
    // We subtract 0 to ensure it's treated as a numeric value.
    var   b   =   arr   [   1   ]   -   0   ;

    // Now, evaluate the command string 'a' and perform the corresponding action.

    // Case 1: "insert" command.
    // Adds the value 'b' to the beginning of the list.
    if   (   a   ==   "insert"   )   {
        list   .   unshift   (   b   )   ;
    }
    // Case 2: "delete" command.
    // Finds the first occurrence of value 'b' in the list and removes it.
    else   if   (   a   ==   "delete"   )   {
        list   .   splice   (   list   .   indexOf   (   b   )   ,   1   )   ;
    }
    // Case 3: "deleteFirst" command.
    // Removes the element that is currently at the very beginning of the list.
    else   if   (   a   ==   "deleteFirst"   )   {
        list   .   shift   (   )   ;
    }
    // Case 4: "deleteLast" command.
    // Removes the element that is currently at the very end of the list.
    else   if   (   a   ==   "deleteLast"   )   {
        list   .   pop   (   )   ;
    }
}

// After all commands have been processed, the final state of the 'list'
// is joined into a single string with elements separated by spaces,
// and this string is then printed to the standard output.
console   .   log   (   list   .   join   (   " "   )   )   ;