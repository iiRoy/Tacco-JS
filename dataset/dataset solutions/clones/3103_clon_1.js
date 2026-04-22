/* This is a main function designed to process input data. */
function   main    (   arg   )    {

    // Split the input string by newline characters to get an array of lines.
    arg   =   arg  .  split  (  "\n"  )    ;

    /*
     * Remove the first element from the array.
     * This is often done to discard header information in competitive programming.
     */
    arg  .  shift  (  )    ;

    // The next element is expected to be the string 's' that will be processed.
    var   s    =   arg  .  shift  (  )    ;

    // Process the remaining lines: split each line by space and convert parts to numbers.
    arg   =   arg  .  map  (  e   =>   e  .  split  (  " "  )  .  map  (  Number  )  )    ;


    // Iterate through the processed arguments, treating each as a test case.
    for   (   var   t   =   0   ;   t   <   arg  .  length   ;   t  ++   )    {

        // Extract a substring from 's' based on the current test case's start and end indices.
        // Note: Indices are 1-based in input, so we subtract 1 for the start index.
        var   test   =   s  .  substring  (  arg  [  t  ]  [  0  ]   -   1  ,   arg  [  t  ]  [  1  ]  )    ;

        // Split the extracted substring by "AC" to count occurrences.
        var   n   =   test  .  split  (  "AC"  )    ;

        // The number of "AC" occurrences is one less than the length of the resulting array.
        console  .  log  (  n  .  length   -   1  )    ;
    }
}

// Invoke the main function, reading input from standard input as a UTF-8 string.
main  (  require  (  'fs'  )  .  readFileSync  (  '/dev/stdin'  ,   'utf8'  )  )   ;