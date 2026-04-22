function    Main ( input ) {
    // This is the primary function definition.
    // It processes the input string.

    // First, split the input by newline characters.
    input = input.split(
        "\n"
    ) ;

    // Then, take only the first line of the input.
    input = input[0] ;

    // Extract the very last character from the processed input string.
    const    last = input.slice( -1 )    ;

    // Determine the appropriate suffix based on the last character.
    // If the last character is 's', the suffix is 'es'; otherwise, it's 's'.
    const    sufix = last === "s"    ?    "es"    :    "s"   ;

    // Finally, print the concatenated string to the console.
    console.log (
        `${input}${sufix}`
    ) ;

} // End of Main function.


/*
 * This section handles standard input/output.
 * Please do not alter the code below this line, as it is responsible
 * for reading input and invoking the Main function.
 */
Main( require("fs").readFileSync("/dev/stdin", "utf8") ) ;