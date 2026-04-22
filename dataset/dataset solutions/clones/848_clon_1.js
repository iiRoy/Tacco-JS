/*
 * This is a Type I clone of some JavaScript code.
 * It demonstrates extensive changes in whitespace and comments
 * while preserving the exact same logic and identifiers.
 */
var    input    =    require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  ;
// First, read the input from standard input.
var      str      =      (      input      .      trim      (      )      )      .      replace      (      /egg/g      ,      "E"      )      .      replace      (      /chicken/g      ,      "C"      )      ;
// Trim whitespace and replace 'egg' with 'E' and 'chicken' with 'C'.

var    ary    =    str    .    replace    (    /EE/g    ,    "EAE"    )    .    replace    (    /CC/g    ,    "CAC"    )    .    split    (    "A"    )    ;
// Process the string further, inserting 'A' between repeated characters, then splitting by 'A'.
var      ans      =      ""      ;      // Initialize the answer string.

ary.forEach(  function  (  v  )  {
        // Iterate through each element in the 'ary' array.
        if  (  ans  .  length  <  v  .  length  )  {
                ans  =  v  ;      // Update 'ans' if the current element 'v' is longer.
        }
}  )  ;


// Finally, print the result based on the last character of 'ans'.
console  .  log  (  (  ans  .  slice  (  -1  )  ==  "E"  )  ?  "egg"  :  "chicken"  )  ;