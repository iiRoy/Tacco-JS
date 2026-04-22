/**
 * This JavaScript code processes a list of 2D points,
 * sorts them, calculates the most frequent displacement vector
 * between any two points, and then counts how many independent
 * groups of points can be formed based on that displacement.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source.
 */

function Main(input) {

    // Split the input string into an array of lines.
    // Each line is expected to contain coordinates.
    lines = input.split("\n")

    // Remove the last (likely empty) line.
    lines.pop()

    // The first line is expected to be the number of points (N).
    // Convert it to a number using the unary plus operator.
    N = lines.shift() * 1

    // Initialize an empty array to store the points.
    d = []

    // Loop N times to parse each point's coordinates.
    for (i = 0; i < N; i++) {

        // Split the current line by space to get x and y coordinates.
        l = lines[i].split(' ')

        // Create a point object and push it into the 'd' array.
        // x and y are stored as strings initially.
        d.push({
            x: l[0],
            y: l[1]
        })
    }

    // Sort the array of points.
    // The primary sort key is 'x', secondary is 'y'.
    d = d.sort(function(a, b) {

        // If x coordinates are equal, sort by y.
        if (a.x == b.x) {
            return a.y - b.y
        }

        // Otherwise, sort by x.
        return a.x - b.x
    })

    // Initialize an object to store the frequency of displacement vectors.
    a = {}

    // Iterate through all possible pairs of points (i, j).
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++) {

            // Skip if it's the same point.
            if (i == j)
                continue

            // Calculate the displacement components.
            // Note: d[i].x and d[i].y are still strings, but subtraction
            // will implicitly convert them to numbers.
            x = d[i].x - d[j].x
            y = d[i].y - d[j].y

            // Create a unique key for the displacement vector.
            k = x + ',' + y

            // Increment the count for this displacement vector,
            // or initialize it to 1 if it's new.
            if (a[k]) {
                a[k] = a[k] + 1
            } else {
                a[k] = 1
            }
        }
    }

    // Get an array of all unique displacement keys.
    arr = Object.keys(a)

    // Initialize variables to find the maximum frequency (m)
    // and its corresponding key (k).
    m = 0

    // Iterate through the array of displacement keys.
    for (i = 0; i < arr.length; i++) {

        // If the current displacement's frequency is greater than the current maximum.
        if (m < a[arr[i]]) {

            // Update the maximum frequency.
            m = a[arr[i]]

            // Store the key of this most frequent displacement.
            k = arr[i]
        }
    }

    // Extract the dx and dy components from the most frequent displacement key.
    // These will be used to define the "grouping" vector.
    dx = k.split(',')[0]
    dy = k.split(',')[1]

    // Initialize a counter for the number of groups.
    ans = 0

    // Process points until the 'd' array is empty.
    while (d.length) {

        // Take the first point from the array as the reference point for a new group.
        a = d.shift()

        // Iterate through the remaining points in the array.
        // The loop variable 'i' is reused here from previous loops.
        for (i = 0; i < d.length; i++) {

            // Get the current point 'b' to check against 'a'.
            b = d[i]

            // Check if point 'b' can be reached from point 'a'
            // by a multiple of the most frequent displacement (dx, dy).
            // This condition handles cases where dx or dy might be zero.
            if (
                ((dx == 0 && b.x - a.x == 0) || (b.x - a.x) % dx == 0) &&
                ((dy == 0 && b.y - a.y == 0) || (b.y - a.y) % dy == 0)
            ) {
                // If it can, remove 'b' from the array (it belongs to the same group as 'a').
                d.splice(i, 1)

                // Decrement 'i' to re-check the new point at the current index
                // after removal, as array elements have shifted.
                i--
            }
        }

        // Increment the group counter after processing all points related to 'a'.
        ans++
    }

    // Output the final count of groups.
    console.log(ans)
}

// Read input from stdin and call the Main function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));