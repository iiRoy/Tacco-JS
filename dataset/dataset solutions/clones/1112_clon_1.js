/*
 * This script reads input from /dev/stdin, processes it as a binary heap/tree
 * structure (assuming 1-based indexing for nodes), and then prints
 * information about each node, including its key, parent key, left child key,
 * and right child key.
 *
 * It's a single-line, highly-chained operation.
 */
console.log(
    // First, we import the 'fs' (file system) module to read input.
    require('fs')
        // Then, we synchronously read the entire content of '/dev/stdin'.
        // The 'utf8' encoding ensures proper character handling.
        .readFileSync(
            '/dev/stdin', // Path to the input file
            'utf8'        // Encoding for the file content
        )
        // Next, we remove any leading or trailing whitespace from the input string.
        .trim()
        // We then split the string into an array of elements.
        // The regex `/[ |\n]/` splits by either a space or a newline character.
        .split(
            /[ |\n]/ // Delimiter for splitting: space or newline
        )
        // We remove the first element of the array.
        // This is often done to discard a header or an empty string resulting from splitting.
        .slice(
            1 // Start slicing from index 1 (inclusive)
        )
        // Now, we iterate over each element of the array using the map function.
        // k: current element (key)
        // i: current index (0-based)
        // a: the original array
        .map(
            (k, i, a) =>
                // Start building the output string for the current node.
                // We use a 1-based index for node numbering, hence `++i`.
                `node ${++i}: key = ${k}, ` +
                // Check if it's not the root node (i.e., i-1 is not 0).
                // If it's not the root, calculate and append the parent key.
                // (i >> 1) performs integer division by 2 to get the 1-based parent index.
                // Subtracting 1 converts it to a 0-based array index.
                ((i - 1)
                    ? `parent key = ${a[(i >> 1) - 1]}, `
                    : ''
                ) +
                // Check if a left child exists within the bounds of the array.
                // For a 1-based node index `i`, the left child is at `2*i`.
                // In a 0-based array, this corresponds to `2*i - 1`.
                ((2 * i <= a.length)
                    ? `left key = ${a[2 * i - 1]}, `
                    : ''
                ) +
                // Check if a right child exists within the bounds of the array.
                // For a 1-based node index `i`, the right child is at `2*i + 1`.
                // In a 0-based array, this corresponds to `2*i`.
                // Note: The original code uses `2*i` for the right child's 0-based index,
                // which is correct if `i` is the 1-based parent index.
                ((2 * i < a.length)
                    ? `right key = ${a[2 * i]}, `
                    : ''
                )
        )
        // Finally, join all the processed node strings together,
        // with each node's information separated by a newline character.
        .join(
            '\n' // Separator for joining the array elements
        )
); // End of console.log statement