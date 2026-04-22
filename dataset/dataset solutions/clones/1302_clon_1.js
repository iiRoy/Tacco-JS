Object.  defineProperties  (  Array.prototype  ,
{
    // Define a property 'pInt' on Array.prototype
    pInt  :
    {
        value  (  )
        {
            // This method converts array elements to integers by subtracting zero.
            // It uses the map function to apply the conversion to each element.
            return   this.map(i => i   -   0);
        }
        , // Comma separating properties
    }
    ,

    /*
     * Define another property 'rot' for array rotation or transposition.
     * This method appears to transpose a 2D array.
     */
    rot  :
    {
        value  (  )
        {
            // Initialize 'tmp' with the first row,
            // transforming each element into a single-element array.
            var tmp   =   this[0].map(i => [i]);

            // Iterate over the rest of the rows (from the second row onwards).
            this.slice(1).forEach(ary =>
            {
                // For each row 'ary', iterate over its elements.
                ary.forEach((val, idx) =>
                {
                    // Push the current value 'val' into the corresponding column array in 'tmp'.
                    tmp[idx].push(val);
                }  );
            }  );

            // Return the transposed array.
            return   tmp;
        }
    }
}  );


// Immediately Invoked Function Expression (IIFE)
(  (  i  )  =>
{
    // Declare variables for dimensions, input arrays, and output.
    var   n,   m,   l,   a,   b,   out   =   [];

    // Replace all newline characters in the input string with commas.
    i   =   i.replace(/\n/g,   ',');

    // Parse the first three numbers from the input as n, m, and l.
    // These likely represent dimensions or parameters.
    [n,   m,   l]   =   i.split(/[ ,]/).pInt();

    // Process the remaining lines to populate arrays 'a' and 'b'.
    [  a,   b  ]      =   (  lines   =>   [
        // Array 'a' contains the first 'n' lines, parsed as integer arrays.
        lines.slice(0,   n).map(i   =>   i.split(' ').pInt()),
        // Array 'b' contains the remaining lines, also parsed as integer arrays.
        lines.slice(n).map(i   =>   i.split(' ').pInt())
    ]  )  (  i.split(',').slice(1)  )  ;

    // Rotate/transpose array 'b' using the custom 'rot' method.
    b   =   b.rot();

    // Perform matrix multiplication or a similar operation.
    // Loop 'n' times for rows of the result.
    for   (  i   =   0;   i   <   n;   i++  )
    {
        var   line   =   []; // Initialize an empty array for the current result line.

        // Loop 'l' times for columns of the result.
        for   (  j   =   0;   j   <   l;   j++  )
        {
            // Calculate the dot product or sum of products for the current cell.
            line.push(a[i].reduce((acc,   cur,   idx)   =>
            {
                // Accumulate the product of corresponding elements.
                return   acc   +   cur   *   b[j][idx];
            }  ,   0)  );
        }
        // Add the completed line to the output array.
        out.push(line.join(' '));
    }

    // Print the final output, with lines joined by newlines.
    console.log(out.join('\n'));
}  )  (  require('fs').readFileSync('/dev/stdin',   'utf8')  )  ; // Read input from stdin.