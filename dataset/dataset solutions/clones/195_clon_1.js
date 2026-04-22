/*
 * This JavaScript code snippet reads input,
 * processes it to determine boxing weight categories.
 *
 * It utilizes Node.js 'fs' module to read from standard input.
 *
 * This is a Type I clone, preserving all original functionality
 * while extensively modifying whitespace and comments.
 */

// Variable to store the raw input from standard input.
var   input    =   require('fs').readFileSync (   '/dev/stdin'   ,   'utf8'   )   ;
// Array to hold individual lines after trimming and splitting the input.
var   lines    =   input   .   trim()   .   split   (   '\n'   )   ;


// Declare 'line' variable outside the loop scope.
var   line   ;

// Loop through each line of input, processing one by one.
// The assignment `line = lines.shift()` evaluates to the shifted element,
// which is truthy until `lines` is empty and `shift()` returns `undefined`.
while   (   line   =   lines   .   shift()   )
{
  // Convert the current line (string) to a number (weight 'w').
  // The unary plus operator (+) is a concise way to do this.
  var   w   =   +line   ;

  // Variable 'c' will store the determined category name.
  var   c   ;

  // --- Conditional logic to assign weight categories ---
  if   (   w   <=   48   )
    c   =   'light fly'   ; // Light flyweight category.
  else   if   (   w   <=   51   )
    c   =   'fly'   ; // Flyweight category.
  else   if   (   w   <=   54   )
    c   =   'bantam'   ; // Bantamweight category.
  else   if   (   w   <=   57   )
    c   =   'feather'   ; // Featherweight category.
  else   if   (   w   <=   60   )
    c   =   'light'   ; // Lightweight category.
  else   if   (   w   <=   64   )
    c   =   'light welter'   ; // Light welterweight category.
  else   if   (   w   <=   69   )
    c   =   'welter'   ; // Welterweight category.
  else   if   (   w   <=   75   )
    c   =   'light middle'   ; // Light middleweight category.
  else   if   (   w   <=   81   )
    c   =   'middle'   ; // Middleweight category.
  else   if   (   w   <=   91   )
    c   =   'light heavy'   ; // Light heavyweight category.
  else
    c   =   'heavy'   ; // Default to heavyweight for weights > 91.

  // Print the determined category to the console.
  console   .   log   (   c   )   ;
}

// End of script execution.
// No further actions once all lines are processed.