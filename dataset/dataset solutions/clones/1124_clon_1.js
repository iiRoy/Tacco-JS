/*
 * This is a Type I clone of the original JavaScript code.
 * The purpose is to demonstrate extensive changes in whitespace and comments
 * while preserving the exact logical and structural identity of the code.
 *
 * Original source: Area of Polygon problem from u-aizu.ac.jp (ID: 0079)
 *
 * Status: Cloned successfully, preserving all variable names, operators,
 *         expressions, and the overall program logic.
 *
 * Commentary:
 *   All original comments have been modified or replaced.
 *   Whitespace, including indentation, line breaks, and spacing, has been
 *   significantly altered throughout the entire file.
 */
var log = console.log; // Assign console.log to a variable named 'log'

// Check if running in a Node.js-like environment
if (typeof  process  !=  "undefined")
{
    var   input   =   ""; // Initialize an empty string to accumulate input data

    process.stdin.resume(); // Ensure standard input stream is active
    process.stdin.setEncoding('utf8'); // Set encoding for input stream

    // Event listener for incoming data chunks
    process.stdin.on('data', function(chunk)
    {
        input += chunk; // Append each chunk of data to the 'input' string
    });

    // Event listener for the end of the input stream
    process.stdin.on('end', function()
    {
        var   lines   =   input.split("\n"); // Split the accumulated input into an array of lines
        main(lines); // Call the main processing function with the array of lines
    });
}


function main(lines)
{
    // Process each line: split by space, filter empty strings, convert to numbers
    lines = lines.map(function(line)
    {
        return  line.split(" ").filter(function(e)
        {
            return e != ""; // Filter out any empty string elements
        }).map(function(e)
        {
            var n = Number(e); // Attempt to convert the element to a number

            if (n.toString() == "NaN")
            {
                // If conversion results in NaN, treat it as a string and remove newlines/carriage returns
                return e.replace(/(\r)|(\n)/g, "");
            }
            return n; // Otherwise, return the number
        });
    });


    // Handle the last line of input, which might be a termination signal or data
    var   last   =   lines.pop();

    if (last.length == 2)
    {
        lines.push(last); // If the last line contains two elements, push it back
    }

    // Remove the first line, often representing the count of points (n)
    lines.shift(); // The first line is typically metadata, e.g., number of points

    // The remaining lines are actual polygon points
    var   points   =   lines;
    // points.reverse(); // This line is commented out in the original, keeping it so.


    var   p0   =   points[0]; // First point of the polygon (reference point for triangulation)
    var   ps, pe; // Variables to hold successive points
    var   S   =   0; // Accumulator for the signed area sum
    var   length   =   points.length; // Number of points in the polygon

    // Loop through the points to calculate the sum of signed areas of triangles
    // using the first point (p0) as a common vertex for all triangles.
    for (var   i   =   1;   i   <   length   - 1;   i++)
    {
        // i will range from 1 up to length - 2
        ps = points[i]; // Current point
        pe = points[i + 1]; // Next point

        S += sign_s(p0, ps, pe); // Add the signed area of the triangle (p0, ps, pe)
    }

    // The total area is half of the accumulated sum S.
    // The result needs to be formatted to one decimal place.
    var   r_S   =   ""   +   (S   /   2); // Convert the calculated area to a string

    var   idx   =   r_S.indexOf("."); // Find the position of the decimal point

    if (idx == -1)
    {
        // If no decimal point found (it's an integer), append ".0"
        r_S += ".0";
    }
    else
    {
        // If a decimal point exists, truncate or pad to one decimal place.
        // This specific slice operation ensures only one digit after the decimal.
        r_S = r_S.slice(0, idx + 2);
    }

    log(r_S); // Output the formatted area to the console
}


// Calculates the signed area of a triangle formed by three points (p1, p2, p3)
// using the cross product method.
function sign_s(p1, p2, p3)
{
    // Vector from p1 to p2
    var   pa   =   [p2[0]   -   p1[0],   p2[1]   -   p1[1]];
    // Vector from p1 to p3
    var   pb   =   [p3[0]   -   p1[0],   p3[1]   -   p1[1]];
    // Delegate to the main cross product calculation
    return   sign_s_main(pa,   pb);
}


// Calculates the 2D cross product (z-component) of two vectors.
// This result is twice the signed area of the triangle formed by the origin and the two vectors.
function sign_s_main(pa, pb)
{
    // The Z-component of the 2D cross product: (pa.x * pb.y) - (pa.y * pb.x)
    return   (pa[0]   *   pb[1]   -   pa[1]   *   pb[0]);
}