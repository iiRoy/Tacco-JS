// This JavaScript program is designed to read numerical input from standard input,
// then calculate and display the minimum, maximum, and sum of those numbers.
// It specifically expects the numbers to be on the second line of input, space-separated.


var    input    =    ""    ;    // Declaration and initialization of a variable to store all incoming data.


/*
 *  The `process.stdin` object is a Readable Stream.
 *  By default, standard input streams are paused.
 *  Calling `resume()` makes the stream emit 'data' events.
 */
process    .    stdin    .    resume    (    )    ;


// Sets the character encoding for the standard input stream.
// 'utf-8' is a widely used and robust encoding for text.
process    .    stdin    .    setEncoding    (    'utf-8'    )    ;


/*
 *  Attaches an event listener to the 'data' event of the `process.stdin` stream.
 *  This function will be executed every time data is available from stdin.
 */
process    .    stdin    .    on    (
    'data'    ,
    function    (    chunk    )    {
        // Appends the received `chunk` of data to the `input` string.
        // Chunks might be partial lines or full lines depending on the input source.
        input    +=    chunk    ;
    }
)    ;


// Attaches another event listener, this time for the 'end' event.
// This event signals that there is no more data to be read from stdin (e.g., EOF).
process    .    stdin    .    on    (
    'end'    ,
    function    (    )    {

        // Splits the accumulated `input` string into an array of strings,
        // using the newline character ('\n') as the delimiter.
        // Each element of the resulting array will be a line from the input.
        input    =    input    .    split    (    "\n"    )    ;


        // Accesses the second line of the input (at index 1, as arrays are 0-indexed).
        // Then, splits this line by space characters (" ") to get an array of number strings.
        arr    =    input    [    1    ]    .    split    (    " "    )    ;


        // Calculates the minimum value among the elements in the `arr` array.
        // `Math.min.apply(null, arr)` is used because `Math.min` expects individual arguments,
        // not an array. `apply` allows passing array elements as arguments.
        min    =    Math    .    min    .    apply    (    null    ,    arr    )    ;


        // Calculates the maximum value among the elements in the `arr` array.
        // Similar to `Math.min`, `Math.max.apply` is used for array argument handling.
        max    =    Math    .    max    .    apply    (    null    ,    arr    )    ;


        // Initializes a variable `sum` to zero. This variable will accumulate the total sum.
        sum    =    0    ;


        // Initiates a standard `for` loop to iterate through each element of the `arr` array.
        for    (    var    i    =    0    ;    i    <    arr    .    length    ;    ++i    )    {
            // Converts the current array element (which is a string) into a number
            // using the `Number()` constructor and adds it to the `sum`.
            sum    +=    Number    (    arr    [    i    ]    )    ;
        }


        // Prints the calculated minimum, maximum, and sum values to the console.
        // The values are concatenated into a single string, separated by spaces.
        console    .    log    (    min    +    " "    +    max    +    " "    +    sum    )    ;
    }
)    ;