run  (  function  *  (  write,  gets  )  { // Main generator function starts here
    // Declare and initialize variables for white and black counts
    var   white   =   +  (yield)  -   1;  /* Initial white count, from input */
    var   black   =   +  (yield)  -   1;  /* Initial black count, from input */
    var   lines   =   [];               // Array to store generated lines

    /*
     *  Loop to generate lines for 'white' cells.
     *  Each iteration processes two lines for a 100-character width.
     */
    do  {
        var   line0   =   ""  ;           // First line of the pair
        var   line1   =   ""  ;           // Second line of the pair

        // Inner loop to build 100-character lines
        for  (  var   i   =   0  ;   i   <   100  ;   i   +=   2  )  {
            // Check if there are white cells remaining
            if    (  0   <   white  )  {
                line0   +=   ".#"  ;     // Pattern for line0 when white cells exist
                line1   +=   "##"  ;     // Pattern for line1 when white cells exist
                --  white  ;            // Decrement white cell count
            }   else   {
                line0   +=   "##"  ;     // Default pattern for line0 if no white cells left
                line1   +=   "##"  ;     // Default pattern for line1 if no white cells left
            }
        }
        lines  .  push  (  line0,   line1  )  ; // Add the generated pair of lines to the array
    }   while   (  0   <   white  )  ;   // Continue as long as white cells need to be processed


    // Loop to generate lines for 'black' cells.
    // Similar structure to the 'white' loop.
    do  {
        var   line0   =   ""  ;           // First line of the pair for black cells
        var   line1   =   ""  ;           // Second line of the pair for black cells

        for  (  var   i   =   0  ;   i   <   100  ;   i   +=   2  )  {
            if    (  0   <   black  )  {
                line0   +=   ".."  ;     // Pattern for line0 when black cells exist
                line1   +=   "#."  ;     // Pattern for line1 when black cells exist
                --  black  ;            // Decrement black cell count
            }   else   {
                line0   +=   ".."  ;     // Default pattern for line0 if no black cells left
                line1   +=   ".."  ;     // Default pattern for line1 if no black cells left
            }
        }
        lines  .  push  (  line0,   line1  )  ; // Add the generated pair of lines
    }   while   (  0   <   black  )  ;   // Continue as long as black cells need to be processed

    // Write the dimensions of the generated grid
    write  (  `  ${  lines.length  }   100  `  )  ;

    // Iterate through the generated lines and write each one
    for  (  var   i   =   0  ;   i   <   lines.length  ;   ++  i  )  {
        write  (  lines  [  i  ]  )  ;
    }
}  )  ;


/**
 *  @param   {  (  write:   (  line:   string,   end?:   string  )   =>   void,   gets:   ()   =>   IterableIterator<string|null>  )   =>   IterableIterator<any>  }   main
 *  The main generator function that produces output.
 */
function   run   (  main  )   {
    var   istream   =   process.stdin  ;  // Standard input stream
    var   ostream   =   process.stdout  ; // Standard output stream

    /**
     *  @type   {  [string|null]  }
     *  Buffer for words parsed from input lines.
     */
    var   words   =   []  ;

    /**
     *  @type   {  [string]  }
     *  Buffer for raw input lines.
     */
    var   lines   =   []  ;
    var   rest   =   ""  ;                 // Remaining part of a line after parsing
    var   ended   =   false  ;              // Flag to indicate if input stream has ended

    var   INPUT_MODE_LINE   =   0  ;        // Input mode: read a whole line
    var   INPUT_MODE_WORD   =   1  ;        // Input mode: read a single word

    var   input_mode   =   INPUT_MODE_WORD  ; // Current input mode, defaults to word-by-word


    /**
     *  Writes a line to the output stream.
     *  @param   {string}   line   The string to write.
     *  @param   {string}   [end]   Optional string to append instead of a newline.
     */
    function   write   (  line,   end  )   {
        ostream  .  write  (  line   +   (  undefined   ===   end   ?   os.EOL   :   end  )  )  ;
    }


    /**
     *  Generator function to get input.
     *  Yields either a buffered line or pauses execution to wait for new input.
     */
    function   *  gets   ()   {
        if    (  0   <   lines.length  )   {
            return   lines  .  shift  ()  ; // Return a buffered line if available
        }   else   {
            input_mode   =   INPUT_MODE_LINE  ; // Switch to line input mode
            /**
             *  @type   {string}
             *  The line received from the yield.
             */
            var   line   =   yield  ;           // Pause and wait for a line from the main loop
            input_mode   =   INPUT_MODE_WORD  ; // Switch back to word input mode
            return   line  ;
        }
    }


    // Initialize the main generator with the write and gets functions
    var   main_itr   =   main  (  write,   gets  )  ;


    /**
     *  Handles incoming data chunks from the input stream.
     *  Parses lines and buffers them.
     *  @param   {string|null}   chunk   The received data chunk or null for end of stream.
     */
    function   get_chunk   (  chunk  )   {
        istream  .  pause  ()  ; // Pause the input stream to process the current chunk

        if    (  null   ===   chunk  )   {
            lines  .  push  (  null  )  ; // Mark end of input with a null line
        }   else   {
            rest   +=   chunk  ; // Append the new chunk to any remaining data
            var   line_exp   =   /.*(\r?\n|\r)/g  ; // Regex to match complete lines
            var   line_match,   lastIndex   =   0  ;

            // Extract all complete lines from 'rest'
            while   (  null   !==   (  line_match   =   line_exp  .  exec  (  rest  )  )  )   {
                lastIndex   =   line_exp  .  lastIndex  ;
                lines  .  push  (  line_match  [  0  ]  )  ;
            }
            rest   =   rest  .  substring  (  lastIndex  )  ; // Keep the incomplete part
        }
        loop  ()  ; // Process the buffered input
    }


    /**
     *  Main processing loop for the generator.
     *  Feeds input to the main generator and handles its outputs.
     */
    function   loop   ()   {
        while   (  0   <   lines.length  )   { // While there are lines in the buffer
            switch   (  input_mode  )   {
                case   INPUT_MODE_LINE  :
                {
                    words  .  push  (  lines  .  shift  ()  )  ; // Push the whole line as a 'word'
                }
                break  ;
                case   INPUT_MODE_WORD  :
                {
                    if    (  null   ===   lines  [  0  ]  )   {
                        words  .  push  (  lines  .  shift  ()  )  ; // If end of input, push null
                    }   else   {
                        var   word_exp   =   /[^\s]+/g  ; // Regex to match a word (non-whitespace sequence)
                        var   line_match  ;
                        if    (  null   !==   (  line_match   =   word_exp  .  exec  (  lines  [  0  ]  )  )  )   {
                            words  .  push  (  line_match  [  0  ]  )  ; // Push the extracted word
                            lines  [  0  ]   =   lines  [  0  ]  .  substring  (  word_exp  .  lastIndex  )  ; // Remove word from line
                        }   else   {
                            lines  .  shift  ()  ; // No more words on this line, discard it
                        }
                    }
                }
                break  ;
            }

            // Process any buffered 'words' (which can be actual words or full lines)
            while   (  0   <   words.length  )   {
                var   result   =   main_itr  .  next  (  words  .  shift  ()  )  ; // Advance the main generator

                if    (  undefined   !==   result.value  )   { // If the generator yielded a value
                    if    (  'string'   ===   typeof   result.value  )   {
                        write  (  result.value,   ""  )  ; // Write string value without newline
                    }   else   {
                        write  (  `  ${  result.value  }  `,   ""  )  ; // Convert to string and write without newline
                    }
                }
                if    (  result.done  )   return  ; // If the generator is done, exit
            }
        }

        // If no more input to process, either schedule processing of null (end of stream) or resume input
        ended   ?   setTimeout  (  get_chunk,   0,   null  )   :   istream  .  resume  ()  ;
    }

    // Event listener for incoming data
    istream  .  on  (  'data',   get_chunk  )  ;
    // Event listener for end of input stream
    istream  .  on  (  'end',   function   ()   {
        ended   =   true  ; // Set flag
        get_chunk  (  null  )  ; // Process remaining data and signal end
    }  )  ;

    // Set input encoding
    istream  .  setEncoding  (  'utf8'  )  ;
    // Initialize by signaling end of input to trigger initial processing if no data arrives
    get_chunk  (  null  )  ;
}  ;


var   os   =   require  (  'os'  )  ; // Require the 'os' module for platform-specific EOL