const executeProcessor = (sourceText) => {
    // This part of the code splits the incoming string into an array of individual components.
    // The delimiter used for splitting is a single space character.
    const dataParts = sourceText.split(" ");

    /*
     * We're looking for a specific string value "0" within our array of data parts.
     * The `findIndex` method returns the zero-based index of the first element
     * that satisfies the provided testing function.
     * Since the requirement is to output a one-based index, we add 1 to the result.
     */
    console.log(
        dataParts.findIndex((currentSegment) => currentSegment === "0") +
        1
    );
};

// The program initiates by reading data from standard input.
// The `fs` module is used for file system operations, and `readFileSync` reads the content synchronously.
// The content is expected to be in UTF-8 encoding.
executeProcessor(
    require("fs")
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);