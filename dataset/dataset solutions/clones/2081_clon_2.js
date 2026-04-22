/*
 * This self-executing function determines if a specific
 * pattern exists within the provided textual data.
 */
(
  function  processInput
  ( /* The textual content to be analyzed */
    inputString
  )
  {
    // Check if the regular expression /hi/ is found within the string.
    // If a match is found, the result is truthy; otherwise, it's falsy.
    return  inputString  .  match  (  /hi/  )
      ?  'Yes'  // Return 'Yes' if the pattern is present.
      :  'No'   // Return 'No' if the pattern is absent.
  }
)
( /* Retrieve content from standard input for processing */
  require("fs")
    .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )
);