// This is the main function that processes the input string.
function Main ( input ) {
    // Split the input string by newline characters to get an array of lines.
    input = input . split ( "\n" ) ;

    // Use a switch statement to determine the output based on the first line of input.
    switch ( input [ 0 ] ) {
        case "Sunny" :
            // If the input is "Sunny", log "Cloudy" to the console.
            console . log ( "Cloudy" ) ;
            break ;

        case "Cloudy" :
            // If the input is "Cloudy", log "Rainy" to the console.
            console . log ( "Rainy" ) ;
            break ;

        case "Rainy" :
            // If the input is "Rainy", log "Sunny" to the console.
            console . log ( "Sunny" ) ;
            break ;
    }
}

/*
 * The following section handles reading input from standard input
 * and calling the Main function.
 * Please do not modify the code below this line, as it is for
 * standard input/output handling.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;