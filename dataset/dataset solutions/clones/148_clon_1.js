// This JavaScript code is a Type I clone of another piece of code.
// It has been extensively modified with whitespace and comments,
// but all identifiers, operators, and expressions remain precisely as they were.

require
    (
        // The 'fs' module is required here.
        "fs"
    )
    .
    readFileSync
        (
            // Path to the standard input device.
            "/dev/stdin",

            // Encoding specified as UTF-8.
            "utf8"
        )
    /*
     * After reading the file content, it's split.
     * The split delimiter is two newline characters.
     */
    .
    split
        (
            '\n\n'
        )
    .
    map
        (
            // This function processes each part obtained from the split operation.
            function
                (
                    i // 'i' represents a segment of the input.
                )
            {
                // The console.log function is used to output results.
                console
                    .
                    log
                        (
                            // This is the string from which a character will be selected.
                            'AE..C.BD.FG'
                            [
                                /*
                                 * A regular expression is used here to find patterns.
                                 * It looks for '1' followed by any digits or newlines,
                                 * and then another '1'. The 'm' flag indicates multiline matching.
                                 */
                                /1(\d|\n)*1/m
                                    .
                                    exec
                                        (
                                            i // Execute the regex on the current input segment.
                                        )
                                    [
                                        0 // Get the full matched string.
                                    ]
                                    .
                                    length // Determine the length of the matched string.
                                %
                                11 // Use the modulo operator to get an index within the string length.
                            ]
                        )
                ; // End of the console.log statement.
            }
        )
; // End of the entire chained method call.