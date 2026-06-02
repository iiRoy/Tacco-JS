process.stdin.on("data", function(inputChunk) {
    // Parse the input chunk as a numeric radius and define the PI constant
    var circleRadius = +inputChunk;
    var mathPiValue = Math.PI;

    // Calculate and display the circumference and area of the circle
    console.log(2 * circleRadius * mathPiValue, circleRadius * circleRadius * mathPiValue);
}).resume(); // Ensure the standard input stream is flowing
