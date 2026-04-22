/*
 * This JavaScript program processes input from standard input,
 * interpreting numerical values as boxing weight in kilograms.
 * It then outputs the corresponding weight class.
 */

// We begin by requiring the built-in 'fs' (file system) module.
require  (  "fs"  )
  // Next, we synchronously read the content of standard input.
  // The path "/dev/stdin" is a common way to access standard input on Unix-like systems.
  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )
  // The read content, which is a single string, is then split.
  // We use a regular expression `/\s/` to split by any whitespace character.
  // This effectively separates individual numbers or tokens.
  .  split  (  /\s/  )
  // We then use the `map` method to iterate over each element (string)
  // resulting from the split operation.
  .  map  (  function  (  i  )  {

    // Declare a variable 'j' and assign it the numerical value of 'i'.
    // The unary plus operator `+` attempts to convert the string 'i' to a number.
    // If 'i' cannot be converted to a valid number, 'j' will be NaN (Not a Number).
    // The entire assignment expression `(j = +i)` evaluates to the value assigned to 'j'.
    (  j  =  +  i  )
      ?  // This is the condition for a ternary operator.
         // If 'j' is a truthy value (i.e., a non-zero number), the left part executes.
         // If 'j' is falsy (0, NaN, null, undefined, false, or empty string), the right part executes.
         console  .  log  (
           // Nested ternary operators determine the boxing weight class.
           j  <=  48  ?  'light fly'  :
           j  <=  51  ?  'fly'  :
           j  <=  54  ?  'bantam'  :
           j  <=  57  ?  'feather'  :
           j  <=  60  ?  'light'  :
           j  <=  64  ?  'light welter'  :
           j  <=  69  ?  'welter'  :
           j  <=  75  ?  'light middle'  :
           j  <=  81  ?  'middle'  :
           j  <=  91  ?  'light heavy'  :
           'heavy'
         )
      :  // If 'j' is falsy (e.g., 0 or NaN), this part of the ternary operator is executed.
         // In this case, it simply evaluates to the number 0, effectively performing no action.
         0
  }  )