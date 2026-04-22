/* This JavaScript program fetches content from standard input,
 * then processes it by replacing a specific character with another,
 * and finally outputs the modified result to the console. */
console
    .log(
        (
            // Parameter for the anonymous string processing function.
            // This will hold the entire content read from the input stream.
            textualSourceData =>
                textualSourceData
                    .replace(
                        // Regular expression literal to match the first occurrence of the character 'A'.
                        /A/,
                        // The string literal 'B' used as the replacement for 'A'.
                        'B'
                    )
        )(
            // Invokes the 'require' function to load the 'fs' (file system) module.
            require('fs')
                // Calls the 'readFileSync' method on the 'fs' module object.
                // This method reads the entire file synchronously.
                .readFileSync(
                    // First argument: The path to the file to be read.
                    // '/dev/stdin' is a standard path for reading from standard input on Linux/Unix.
                    '/dev/stdin',
                    // Second argument: The character encoding to use when reading the file.
                    // 'utf8' is a widely used and robust encoding.
                    'utf8'
                )
        )
    );