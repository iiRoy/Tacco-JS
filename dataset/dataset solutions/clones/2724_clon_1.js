/*
 * This module defines a utility for parsing input data.
 * It provides methods to read various data types from a string buffer.
 */
var GET = (

    function () {

        // Main entry point for the parser factory.
        function f(s)
        {
            return new g(s); // Create a new parser instance.
        }

        // Internal constructor for the parser object.
        function g(s)
        {
            // Store the input string, trimmed and split by newlines.
            this._s = s.trim().split("\n");
            // Initialize the current line index.
            this._y = 0;
        }

        /**
         * Reads a single item from the current line.
         * If 'f' is true, returns as string; otherwise, as number.
         * @param {boolean} f - Flag to return as string (true) or number (false).
         * @returns {string|number} The parsed item.
         */
        g.prototype.a = function (f)
        {
            var s = this._s,
                y = this._y, // Current line index.
                r;

            // If the current line hasn't been split and reversed yet, do it.
            if (typeof s[y] === "string")
            {
                s[y] = s[y].split(" ").reverse();
            }

            r = s[y].pop(); // Pop the last item (which was originally the first due to reverse).

            // If the current line is now empty, advance to the next line.
            if (!s[y].length)
            {
                this._y++;
            }

            // Return as string or number based on 'f' flag.
            return f ? r : +r;
        };


        /**
         * Reads an entire line of space-separated values.
         * If 'f' is true, returns as array of strings; otherwise, as array of numbers.
         * @param {boolean} f - Flag to return as strings (true) or numbers (false).
         * @returns {Array<string>|Array<number>} The parsed line.
         */
        g.prototype.l = function (f)
        {
            // Get the current line, increment index, and split by spaces.
            var s = this._s[this._y++].split(" ");

            // Return as strings or mapped to numbers.
            return f ? s : s.map(a => +a);
        };

        /*
         * Reads 'n' lines, each split into space-separated values.
         * Returns a 2D array.
         * 'f' flag determines if inner values are strings or numbers.
         */
        g.prototype.m = function (n, f)
        {
            // Slice 'n' lines from the buffer and split each by spaces.
            var r = this._s.slice(this._y, this._y += n).map(a => a.split(" "));

            // If 'f' is true, return as strings; otherwise, map all inner values to numbers.
            return f ? r : r.map(a => a.map(a => +a));
        };

        // Reads 'n' raw lines.
        g.prototype.r = function (n, f)
        {
            // Slice 'n' raw lines.
            var r = this._s.slice(this._y, this._y += n);

            // If 'f' is true, return as strings; otherwise, map to numbers.
            return f ? r : r.map(a => +a);
        };

        return f; // The factory function is exposed.

    }
)();
var o = GET( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ); // Initialize parser with standard input.

// Helper function to create multi-dimensional arrays initialized with a value.
function xArray(v)
{
    var a = arguments,
        l = a.length,
        // Start building the array string from the innermost dimension.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})";

    // Loop backwards to build outer dimensions.
    while (--l)
    {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";
    }

    // Evaluate the constructed string to create the array.
    return eval(r);
}

// Implements a binary search (lower_bound) on a sorted array 'd'.
// Finds the first element not less than 'e' within the range [a, b).
function lower_bound(d, a, b, e)
{
    var c; // Midpoint index.

    // Binary search loop.
    for (; 1 < b - a; )
    {
        c = 0 | ((a + b) / 2); // Calculate midpoint, using bitwise OR for floor.

        if (d[c] < e)
        {
            a = c; // If mid element is less than 'e', search in the right half.
        }
        else
        {
            b = c; // Otherwise, search in the left half (including mid).
        }
    }

    // After the loop, 'a' and 'b' are adjacent.
    // Return 'b' if d[a] is less than 'e', otherwise 'a'.
    return d[a] < e ? b : a;
}

main(); // Call the main execution function.

/*
 * The main function orchestrates the program's logic.
 * It reads input, processes data, and prints the result.
 */
function main()
{
    var n = o.a(); // Read the first integer: n.
    var k = o.a(); // Read the second integer: k.
    var a = o.l(); // Read a line of integers into array 'a'.

    var map = {}; // Create an empty object to store indices of numbers.

    // Populate the map: key is number, value is an array of its indices.
    for (var i = 0; i < n; i++)
    {
        if (map[a[i]])
        {
            map[a[i]].push(i); // If number exists, add current index.
        }
        else
        {
            map[a[i]] = [i]; // If new number, create new array with current index.
        }
    }

    var ans = []; // Initialize an array to store the result.

    // First pass to find the initial sequence.
    for (var j = 0; j < n; j++)
    {
        var t = a[j]; // Current number.
        // Find the lower bound for an index greater than 'j' in the map for 't'.
        var l = lower_bound(map[t], 0, map[t].length, j + 1);

        if (l !== map[t].length)
        {
            // If a subsequent occurrence of 't' is found, skip ahead to that index.
            j = map[t][l];
        }
        else
        {
            // If no subsequent occurrence, add 't' to the answer.
            ans.push(t);
        }
    }

    // Handle edge cases for k and initial ans.
    if (k === 1 || ans.length === 0)
    {
        if (ans.length)
        {
            console.log(ans.join(" ")); // Print result if not empty.
        }
        return; // Exit main function.
    }

    var set = new Set(); // Use a Set to track elements encountered in the first cycle.
    set.add(ans[0]); // Add the first element of 'ans' to the set.

    // 'first' will store elements of the first full cycle (or up to k elements if k is small).
    // The first element is intentionally left empty (index 0) or used as a placeholder.
    var first = [, ans[0]];


    // Loop to find the sequence for k-1 additional cycles (or less if a cycle repeats).
    for (var i = 1; i < k; i++)
    {
        // 't' is the starting element for the current cycle.
        var t = first[i];
        // Find the first occurrence of 't' in the original array 'a'.
        var l = lower_bound(map[t], 0, map[t].length, 0);

        ans = []; // Reset 'ans' for the current cycle.
        var f = 0; // Flag to indicate if we're in a "potential" new cycle element.

        // Iterate from the element *after* the first occurrence of 't'.
        for (var j = map[t][l] + 1; j < n; j++)
        {
            var t = a[j]; // Current number.
            // Find the lower bound for an index greater than 'j' for 't'.
            var l = lower_bound(map[t], 0, map[t].length, j + 1);

            if (l !== map[t].length)
            {
                // If a subsequent occurrence of 't' is found, skip ahead.
                j = map[t][l];
                f = 0; // Reset flag as we skipped.
            }
            else
            {
                // If no subsequent occurrence, add 't' to 'ans'.
                ans.push(t);

                if (f)
                {
                    // If we were in a potential new cycle, check if 't' is new.
                    if (!set.has(t))
                    {
                        i++; // Increment cycle counter.
                        first.push(t); // Add 't' to the 'first' cycle elements.
                    }
                    else
                    {
                        f = 0; // 't' is not new, reset flag.
                    }
                }

                if (ans.length === 1)
                {
                    // If this is the very first element of the current 'ans' segment.
                    set.add(t); // Add to set.
                    first.push(t); // Add to first cycle elements.
                    f = 1; // Set flag for potential new cycle element.
                }
            }
        }

        // If 'ans' is empty after this pass, it means no elements were found for this cycle.
        if (ans.length === 0)
        {
            break; // Exit the loop, no more cycles can be formed.
        }
    }

    // Adjust 'i' if the last 'ans' was empty, meaning the loop broke prematurely.
    if (ans.length === 0)
    {
        i++;
    }

    // Calculate the remainder cycle 'q'.
    var q = k % i;

    // If 'q' is 0, it means we landed exactly at the end of a full cycle.
    if (q === 0)
    {
        if (ans.length)
        {
            console.log(ans.join(" ")); // Print the last computed 'ans'.
        }
        return; // Exit.
    }

    // Determine the starting index 'l' for the final sequence.
    if (q === 1)
    {
        var l = 0; // Start from the beginning of the original array.
    }
    else
    {
        var t = first[q - 1]; // Get the element that starts the (q-1)-th cycle segment.
        var l = lower_bound(map[t], 0, map[t].length, 0); // Find its first occurrence.
        l = map[t][l] + 1; // Start from the element *after* its first occurrence.
    }

    ans = []; // Reset 'ans' for the final calculation.

    // Final pass to build the result based on 'q' and 'l'.
    for (var j = l; j < n; j++)
    {
        var t = a[j]; // Current number.
        // Find the lower bound for an index greater than 'j' for 't'.
        var l = lower_bound(map[t], 0, map[t].length, j + 1);

        if (l !== map[t].length)
        {
            // If a subsequent occurrence of 't' is found, skip ahead.
            j = map[t][l];
        }
        else
        {
            // If no subsequent occurrence, add 't' to 'ans'.
            ans.push(t);
        }
    }

    // Print the final result if not empty.
    if (ans.length)
    {
        console.log(ans.join(" "));
    }
}