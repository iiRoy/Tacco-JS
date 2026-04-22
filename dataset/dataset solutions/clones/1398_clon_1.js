// This is the primary function definition, named 'Main'.
// It accepts a single argument, 'input', which is expected to be a string.
function   Main   (   input   )   {

    // Declare a variable 'data'.
    // It stores an array of strings, obtained by splitting the 'input' string
    // at each newline character. This effectively breaks the input into lines.
    var   data   =   input  .  split  (  "\n"  )  ;

    // Initialize an integer variable 'index' to 0.
    // This variable will be used to track the current position within the 'data' array.
    var   index   =   0   ;

    // Begin a 'while' loop.
    // The loop continues as long as the string "?" is found anywhere within the 'data' array.
    // The `indexOf` method returns -1 if the element is not found.
    while   (  data  .  indexOf  (  "?"  )    !==    -1  )   {

        // Inside the loop, `console.log()` is used to print output.
        // `eval()` is called on the element at the current 'index' in the 'data' array.
        // This means the content of that specific line is executed as JavaScript code.
        console  .  log  (  eval  (  data  [  index  ]  )  )  ;

        // Increment the 'index' variable by 1 after each iteration.
        // This ensures the loop processes the next line in the 'data' array in subsequent iterations.
        index  ++  ;
    }
}


// This section of the code calls the 'Main' function.
// It reads content from standard input, typically '/dev/stdin' on Unix-like systems.
// The 'fs' (file system) module is required to perform file operations.
// `readFileSync` is a synchronous method to read the entire content of a file.
// The file is read with 'utf8' encoding.
// The content read from the file is then passed as the 'input' argument to the 'Main' function.
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,    "utf8"  )  )  ;

// End of script.