/*
 * This JavaScript function, named 'Weather', takes a single argument 's'.
 * Its primary purpose is to simulate a simple weather transition system.
 * Based on the input string 's' (representing the current weather),
 * it outputs the next predicted weather state to the console.
 */
function Weather ( s )
{
    // The 'switch' statement evaluates the current weather state provided by 's'.
    switch
    (
        s
    )
    {
        // Case: If the current weather is 'Sunny'.
        case 'Sunny' ;
            // The console will display 'Cloudy' as the next state.
            console . log ( 'Cloudy' ) ;
            // Exit the switch block after executing this case.
            break ;


        // Case: If the current weather is 'Cloudy'.
        case 'Cloudy' ;
            // The console will display 'Rainy' as the next state.
            console . log ( 'Rainy' ) ;
            // Exit the switch block.
            break ;


        // Case: If the current weather is 'Rainy'.
        case 'Rainy' ;
            // The console will display 'Sunny' as the next state, completing a cycle.
            console . log ( 'Sunny' ) ;
            // Exit the switch block.
            break ;


        // Default Case: If the input 's' does not match any of the defined weather states.
        default ;
            // The console will display 'Other' to indicate an unrecognized state.
            console . log ( 'Other' ) ;
            // Exit the switch block.
            break ;
    } // End of the weather state switch statement.


    // Following the weather state determination, the 'Main' function is invoked.
    // It reads content from standard input (/dev/stdin) using Node.js 'fs' module.
    // The content is read as a UTF-8 encoded string and passed as an argument to 'Main'.
    Main
    (
        require ( "fs" ) . readFileSync ( "/dev/stdin", "utf8" )
    ) ;
} // End of the 'Weather' function definition.