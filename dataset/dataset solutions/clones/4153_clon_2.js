"use strict" ;

// This script processes two input strings and compares them based on specific sorting rules.
const   PrimaryLogic   =  (   sourceData   )   =>
{
    // The input 'sourceData' is expected to be a string containing multiple lines.
    // First, remove any leading or trailing whitespace, then divide the string into an array of lines.
    let     textLines   =   sourceData  .  trim  (  )  .  split  (  '\n'  )  ;

    // Take the first line from the 'textLines' array and break it down into an array of individual characters.
    let     firstLineCharacters   =   textLines  [  0  ]  .  split  (  ''  )  ;

    // Take the second line from the 'textLines' array and similarly convert it into an array of characters.
    let     secondLineCharacters   =   textLines  [  1  ]  .  split  (  ''  )  ;


    // Sort the characters of the first line alphabetically (ascending order).
    // After sorting, concatenate these characters back into a single string.
    firstLineCharacters   =   firstLineCharacters  .  sort  (  )  .  join  (  )  ;

    // For the second line's characters:
    // 1. Sort them alphabetically (ascending order).
    // 2. Reverse the order of the sorted characters (making it descending).
    // 3. Join the characters back into a single string.
    secondLineCharacters   =   secondLineCharacters  .  sort  (  )  .  reverse  (  )  .  join  (  )  ;

    // Perform a lexicographical comparison between the two resulting strings.
    // The comparison checks if the processed first string is "less than" the processed second string.
    if  (   firstLineCharacters   <   secondLineCharacters   )
    {
        // If the condition is true, output a specific positive indicator.
        console  .  log  (  'PositiveOutcome'  )  ;
    }
    else
    {
        // Otherwise, if the condition is false or equal, output a negative indicator.
        console  .  log  (  'NegativeOutcome'  )  ;
    }

} ;

// This is the entry point for execution.
// It reads content from standard input ('/dev/stdin') using 'utf8' encoding.
// The obtained content is then passed as 'sourceData' to the 'PrimaryLogic' function.
PrimaryLogic  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )  )  ;