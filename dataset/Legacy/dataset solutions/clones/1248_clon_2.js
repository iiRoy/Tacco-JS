process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the input encoding to UTF-8

process.stdin.on('data', function(inputData) { // Listen for incoming data chunks

    // Convert the input chunk to a string, split by space, and map to numbers
    let parsedNumbers = inputData.toString().split(' ').map(Number);

    // Extract the first number as the radius value
    const radiusValue = Number(parsedNumbers[0]);

    // Calculate the area of the circle using the radius
    let circleArea = radiusValue * radiusValue * Math.PI;

    // Calculate the circumference of the circle
    const circumferenceLength = 2 * radiusValue * Math.PI;

    // Print the calculated circumference and area to the console
    console.log(circumferenceLength + ' ' + circleArea);
});
