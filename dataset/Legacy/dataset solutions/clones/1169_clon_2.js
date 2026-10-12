const inputProcessor = require('readline').createInterface({
    input: process.stdin, // Standard input stream
    output: process.stdout // Standard output stream
});

// Event listener for when a line of input is received
inputProcessor.on('line', function (receivedLine) {
    // Split the input string by spaces to get individual number strings
    const lineSegments = receivedLine.split(' ');

    // Parse the four coordinate values from the segments
    let firstX = parseInt(lineSegments[0], 10); // X-coordinate of the first point
    let firstY = parseInt(lineSegments[1], 10); // Y-coordinate of the first point
    let secondX = parseInt(lineSegments[2], 10); // X-coordinate of the second point
    let secondY = parseInt(lineSegments[3], 10); // Y-coordinate of the second point

    // Calculate the Euclidean distance between the two points
    // Formula: sqrt((x1 - x2)^2 + (y1 - y2)^2)
    let calculatedDistance = Math.sqrt(
        (firstX - secondX) * (firstX - secondX) +
        (firstY - secondY) * (firstY - secondY)
    );

    // Output the calculated distance, formatted to 8 decimal places
    console.log(calculatedDistance.toFixed(8));

    // Terminate the Node.js process
    process.exit();
});

// An empty event listener for the 'end' event on standard input.
// This listener does not perform any actions.
process.stdin.on('end', function () {
    // No operation here.
});
