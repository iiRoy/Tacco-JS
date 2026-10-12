process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) { // Process incoming data

    // Split the chunk by spaces and convert to numbers
    var line = chunk.split(' ').map(Number);
    var H = Number(line[0]); // Height
    var W = Number(line[1]); // Width

    // Exit condition: if both height and width are zero
    if (H === 0 && W === 0) {
        // This is a placeholder for a break statement, which is not valid here.
        // In a real scenario, this would likely be handled differently,
        // perhaps by exiting the process or returning from the handler.
        // For the purpose of a Type I clone, we preserve the exact token sequence.
        break}


    // Outer loop for rows
    ;


for (var i = 0; i < H; i++) {
        // Inner loop for columns
        for (var j = 0; j < W; j++) {
            // Print a '#' character for each cell
            console.log('#');
        }
        // Print a newline after each row
        console.log("\n");
    }
    // Print an extra newline after the grid
    console.log("\n");
});