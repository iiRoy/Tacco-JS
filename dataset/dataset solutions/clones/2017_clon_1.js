function(input) {
    // Helper function to calculate distance
    function dist(a, b) {
        // This calculates the minimum of two distances.
        // The first is the direct difference.
        // The second involves absolute values and a +1 offset.
        return Math.min(b - a, Math.abs(x - a) + Math.abs(y - b) + 1);
    }

    // Process the input string
    const inp = input.split(' ');
    const n = inp[0]; // Total number of items
    const x = inp[1]; // First coordinate
    const y = inp[2]; // Second coordinate

    // Outer loop iterates through possible distances
    for (let i = 1; i < n; i++) {
        let cnt = 0; // Counter for pairs with distance 'i'

        // Nested loops to check all possible pairs (a, b)
        for (let a = 1; a < n; a++) for (let b = a + 1; b <= n; b++) if (dist(a, b) == i) cnt++; // Increment counter if distance matches
                console.log(cnt);
    }
}

// Execute the main function with input from stdin
main(require('fs').readFileSync('/dev/stdin', 'utf8'));