var GET = (

    function (
    )
    {
        // This is a factory function for creating a new data parser instance.
        function f (
            s
        )
        {
            return new g (
                s
            )
            ;
        }

        /*
         *   The constructor function 'g' initializes the parser with input string 's'.
         *   It trims the string, splits it by newline, and sets an internal pointer 'y' to 0.
         */
        function g (
            s
        )
        {
            this._s = s . trim ( ) . split (
                "\n"
            )
            ; // Store lines of input.
            this._y = 0 ; // Initialize line pointer.
        }

        // Method 'a' (presumably 'atom' or 'argument') extracts a single value from the current line.
        g . prototype . a = function (
            f
        )
        {
            var s = this._s , // Reference to the array of input lines.
                y = this._y , // Current line index.
                r ; // Variable to hold the result.

            // If the current line hasn't been processed into an array, do so.
            if (
                typeof s[y] === "string"
            )
            {
                s[y] = s[y] . split (
                    " "
                ) . reverse ( )
                ; // Split by space and reverse for easy popping.
            }

            r = s[y] . pop (
            )
            ; // Get the last element.

            // If the current line is now empty, advance to the next line.
            if (
                ! s[y] . length
            )
            {
                this._y ++
                ;
            }

            // Return the result, converting to number if 'f' (flag) is not true.
            return f ? r : + r
            ;
        }
        ;

        // Method 'l' (presumably 'line') extracts an entire line of values.
        g . prototype . l = function (
            f
        )
        {
            var s = this._s[this._y ++] . split (
                " "
            )
            ; // Get current line, split by space, then advance line pointer.

            // Return the array of values, converting to numbers if 'f' is not true.
            return f ? s : s . map (
                a => + a
            )
            ;
        }
        ;

        // Method 'm' (presumably 'matrix') extracts 'n' lines as a matrix.
        g . prototype . m = function (
            n ,
            f
        )
        {
            var r = this._s . slice (
                this._y ,
                this._y += n
            ) . map (
                a => a . split (
                    " "
                )
            )
            ; // Slice 'n' lines, split each by space.

            // Return the matrix, converting inner elements to numbers if 'f' is not true.
            return f ? r : r . map (
                a => a . map (
                    a => + a
                )
            )
            ;
        }
        ;

        // Method 'r' (presumably 'raw' or 'rows') extracts 'n' raw lines.
        g . prototype . r = function (
            n ,
            f
        )
        {
            var r = this._s . slice (
                this._y ,
                this._y += n
            )
            ; // Slice 'n' lines directly.

            // Return the array of lines, converting each to a number if 'f' is not true.
            return f ? r : r . map (
                a => + a
            )
            ;
        }
        ;

        // The IIFE returns the factory function 'f'.
        return f
        ;
    }

) ( )
;

// Initialize 'o' by reading input from /dev/stdin using the GET parser.
var o = GET (
    require (
        "fs"
    ) . readFileSync (
        "/dev/stdin" ,
        "utf8"
    )
)
;

// Helper function to create multi-dimensional arrays, initialized with 'v'.
function xArray (
    v
)
{
    var a = arguments , // All arguments passed to xArray.
        l = a . length , // Number of arguments.
        r = "Array(a[" + -- l + "]) . fill ( 0 ) . map ( x => { return " + v + " ; } )"
        ; // Innermost array creation string.

    // Loop backwards through arguments to build up the multi-dimensional array string.
    while (
        -- l
    )
    {
        r = "Array(a[" + l + "]) . fill ( 0 ) . map ( x => " + r + " )"
        ;
    }

    // Evaluate the constructed string to create the array.
    return eval (
        r
    )
    ;
}

// Execute the main logic and print the result to the console.
console . log (
    main ( )
)
;

// The main function containing the core logic of the program.
function main (
)
{
    // Read the first integer from the input.
    var a = o . a ( )
    ;

    // Read the second integer from the input.
    var b = o . a ( )
    ;

    // Calculate the result: max(0, a - 2*b).
    return Math . max (
        0 ,
        a - 2 * b
    )
    ;
}