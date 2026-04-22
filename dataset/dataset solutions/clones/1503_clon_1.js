// This is a Type I clone of the provided JavaScript code.
// The core logic and identifiers remain absolutely identical.
// Only modifications to whitespace and the addition of comments have been made.


function   main   (   input   )
{

    // Declare and initialize the variable 'S'.
    // It processes the incoming 'input' string.
    // First, it splits the input by newline characters, taking only the first line.
    // Then, it trims any leading or trailing whitespace from that line.
    // Finally, it splits the trimmed line into an array of individual characters.
    var      S      =      input      .      split      (      / \ n /      )      [      0      ]      .      trim      ( )      .      split      (      ''      )      ;


    // Evaluate a condition based on the last character of the processed string.
    // The 'slice(-1)[0]' method is used to get the last element of the array 'S'.

    if      (      S      .      slice      (      -1      )      [      0      ]      ==      's'      )
    {
        // If the last character was 's', then append 'es' to the array.
        S      .      push      (      'es'      )      ;
    }
    else
    {
        // Otherwise (if the last character was not 's'), append just 's' to the array.
        S      .      push      (      's'      )      ;
    }


    // Output the final result to the console.
    // The array 'S' is joined back into a single string without any separators.
    console      .      log      (      S      .      join      (      ""      )      )      ;


}


// This section handles the execution entry point of the script.
// It uses Node.js's 'fs' module to synchronously read the content
// of standard input ('/dev/stdin').
// The content is read as a 'utf8' encoded string.
// This string is then passed as the 'input' argument to the 'main' function.
main      (      require      (      'fs'      )      .      readFileSync      (      '/dev/stdin'      ,      'utf8'      )      )      ;