/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition: only whitespace and comments are altered.
 * All identifiers, operators, and expressions remain exactly the same.
 */
console.log(
    // The main function expression takes 'args' as input.
    (
        args => {
            // First, process the input arguments.
            // Trim whitespace, split by newlines, then parse each line.
            // Each line is split by spaces, and values are converted to integers using bitwise OR 0.
            const   [
                        [N]
                    ,   ...tmp
                    ]
                =   args
                        .trim()
                        .split('\n')
                        .map(
                            r => r
                                .split(' ')
                                .map(v => v | 0)
                        )
            ;

            // Initialize two arrays to store red and blue points.
            const   rp  =   []
            ,       bp  =   []
            ;

            // Populate rp and bp arrays based on N.
            // The first N lines go to rp, the next N lines go to bp.
            for (
                let i = 0;
                i < N;
                i++
            )
            {
                rp.push(tmp[i]);
                bp.push(tmp[N + i]);
            }

            // Sort red points (rp) and blue points (bp) in descending order based on their first coordinate (x-value).
            // The comparison function `b-a` achieves descending order for the first element of the inner array.
            rp.sort(
                (
                    [a],
                    [b]
                ) => b - a
            );

            bp.sort(
                (
                    [a],
                    [b]
                ) => b - a
            );

            // Initialize a counter for successful matches.
            let count = 0;

            // Iterate through each blue point.
            for (
                let i = 0;
                i < N;
                i++
            )
            {
                // Destructure the current blue point into its x and y coordinates.
                const   [
                            bx
                        ,   by
                        ]
                    =   bp[i]
                ;

                // Initialize 'max' to keep track of the best matching red point found so far for the current blue point.
                // max[0] stores the index in rp, max[1] stores the y-coordinate of the matched red point.
                let max = [-1, -1];

                // Iterate through available red points.
                for (
                    let j = 0;
                    j < rp.length;
                    j++
                )
                {
                    // Destructure the current red point.
                    let [rx, ry] = rp[j];

                    // Condition 1: The blue point's x-coordinate must be greater than the red point's x-coordinate.
                    if (bx < rx) {
                        continue; // If not, skip this red point.
                    }

                    // Condition 2: The blue point's y-coordinate must be greater than the red point's y-coordinate.
                    // Also, we want to find the red point with the largest y-coordinate among valid matches.
                    if (
                            by > ry
                        &&  by > max[1]
                    ) {
                        max = [j, ry]; // Update max if a better match is found.
                    }
                }

                // If a valid red point was found for the current blue point (max[1] would be >= 0).
                if (max[1] >= 0) {
                    // Remove the matched red point from the array to avoid re-matching.
                    rp.splice(max[0], 1);
                    count++; // Increment the successful match count.
                }
            }

            // Return the final count as a string.
            return `${count}`;
        }
    )(
        // Read input from stdin using Node.js 'fs' module.
        require('fs')
            .readFileSync('/dev/stdin', 'utf8')
    )
);

// End of Type I clone.