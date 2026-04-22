// This program checks if a given target fragment exists within a doubled sequence.

var    rawTextData   =
    require (    'fs'    )  .  readFileSync  (
        '/dev/stdin'  ,
        'utf8'
    ) ;

 /*
  * The raw text data is initially a single string.
  * We need to split it into an array of lines based on newline characters.
  */
 rawTextData
    =
 rawTextData
    .
        split
            (
                '\n'
            )
 ;

// Create a doubled sequence by concatenating the first line with itself.
var doubledSequence = rawTextData[0] + rawTextData[0];

/* Define the target fragment which is the second line of the input. */
var targetFragment = rawTextData[1];


   // Check if the target fragment is present in the doubled sequence.
   if (
       doubledSequence
           .
           indexOf
               (
                   targetFragment
               )
                   !==
                       -1
   )
   {
       // If found, print a positive confirmation.
       console.log('Yes');
   }
   else
   {
       // Otherwise, print a negative confirmation.
       console.log('No');
   }