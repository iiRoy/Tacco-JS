/*
 * This module is responsible for generating a unique page
 * filled with various clichés, intended perhaps for a game
 * or a specific display. It uses an Immediately Invoked
 * Function Expression (IIFE) to encapsulate its scope.
 */
( function () {

    "use strict" ; // Ensures strict mode parsing and execution for cleaner code.


    // --- Module Dependencies and Configuration Variables ---

    // Load the array of cliché phrases from a separate file.
    var  cliches  =  require ( './cliches' ) ;

    // Load the Fisher-Yates shuffle algorithm utility.
    var  shuffle  =  require ( './fisher-yates' ) ;

    // Define the special text for the "free" square.
    var  free     =  "I know the Gospel is true (FREE)" ;

    // Set the maximum number of squares to be generated for the page.
    var  max      =  25  ;


    /**
     * Populates a page with a collection of clichés and a designated
     * "free" square at a specific position.
     *
     * @param {function(string, number?)} addSquare - A callback function
     *                                                  that takes the square's content
     *                                                  (string) and its optional index (number)
     *                                                  as arguments. This function is
     *                                                  responsible for rendering each square.
     */
    function  addPage ( addSquare )
    {
        // Declare and initialize the loop counter variable.
        var  i  =  0 ;


        // First, randomize the order of the clichés to ensure variety
        // each time a page is generated.
        cliches  =  shuffle ( cliches ) ;


        // Loop through the desired number of squares to fill the page.
        for  (  i  ;  i  <  max  ;  i  +=  1  )
        {
            // Check if the current square index matches the position
            // reserved for the special "free" square.
            if  (  12  ===  i  )
            {
                // If it's the free square, add the predefined free text.
                addSquare ( free ) ;

                // Skip the remaining logic for this iteration and proceed
                // directly to the next square.
                continue ;
            }

            // For all other squares, add a cliché from the (now shuffled)
            // list. The index 'i' is also passed, which might be used
            // for styling or identification purposes.
            addSquare ( cliches [ i ]  ,  i ) ;
        }
    }


    /*
     * Export the 'addPage' function, making it publicly accessible
     * to other modules that require this functionality.
     */
    module . exports . addPage  =  addPage ;

} ) ( ) ; // The Immediately Invoked Function Expression concludes here.