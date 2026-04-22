var  input  =  '';   // Initialize an empty string for accumulating input data.

// Resume the standard input stream to begin receiving data.
process.stdin.resume();

// Set the encoding for the standard input stream to 'utf8'
// to correctly interpret incoming text.
process.stdin.setEncoding('utf8');


// Attach an event listener for the 'data' event.
// This function will be called whenever new data chunks are available.
process.stdin.on (  'data'  ,   function ( chunk )   {
    // Append the current data chunk to the 'input' variable.
    input  +=  chunk ;
}  ) ;


// Attach an event listener for the 'end' event.
// This function will be called once the input stream has finished.
process.stdin.on (  'end'  ,   function ( )   {
    // After all input has been received, call the main processing function.
    main( input )
}  ) ;


// This is the core function that processes the accumulated input.
function  main ( input )   {

    // Split the entire input string into an array of lines,
    // using the newline character as a delimiter.
    var  args  =  input.split ( '\n' ) ;

    // Transform the 'args' array. Each string line (e.g., "1 2")
    // will be converted into an array of two integers (e.g., [1, 2]).
    args  =  args.map (  function ( pair )   {
        // For each line, first split it by space to get string numbers,
        // then map those string numbers to actual integers using parseInt.
        pair  =  pair.split ( ' ' )
                   .map (  function ( n )   {
                       // Convert the string 'n' into an integer.
                       return  parseInt( n ) ;
                    }  ) ;
        // Return the array of parsed integers for the current line.
        return  pair ;
    }  )

    // Iterate over each array of integer pairs.
    args.forEach (  function ( pair )   {
        // For each pair, calculate the sum of its two elements
        // and print the result to the console.
        console.log (  pair[ 0 ]  +  pair[ 1 ]  ) ;
    }  )
}
// End of the main program logic.