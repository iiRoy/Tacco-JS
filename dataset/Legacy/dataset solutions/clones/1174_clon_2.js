function ProcessGeometry() {
    // This function is designed to compute various geometric properties of a triangle
    // based on two side lengths and the included angle provided as input.

    // Acquire the Node.js file system module to handle file operations.
    var fileSystemModule = require('fs');

    // Specify the standard input file path, typically used in competitive programming environments.
    var inputFilePath = '/dev/stdin';

    // Read the entire content from the specified input file,
    // then convert the buffer to a string for processing.
    var rawData = fileSystemModule.readFileSync(inputFilePath).toString();

    // Split the raw string data by spaces and transform each resulting substring into a number.
    var numericValues = rawData.split(" ").map(Number);

    // Extract the individual numeric components from the processed array.
    var sideA = numericValues[0]; // Represents the length of the first side.
    var sideB = numericValues[1]; // Represents the length of the second side.
    // Convert the angle from degrees (as provided in input) to radians,
    // which is required by JavaScript's Math.sin and Math.cos functions.
    var angleC_rad = numericValues[2] * (Math.PI / 180);

    // Calculate the height of the triangle relative to side 'a' using trigonometry.
    var heightVal = Math.sin(angleC_rad) * sideB;

    // Determine the length of the segment adjacent to angle C on side 'a'.
    var adjacentSegment = Math.cos(angleC_rad) * sideB;

    // Compute the length of the third side 'c' using the Pythagorean theorem.
    // This involves forming a right-angled triangle with the height and the difference
    // between side 'a' and the adjacent segment.
    var sideC = Math.sqrt(Math.pow((sideA - adjacentSegment), 2) + Math.pow(heightVal, 2));

    // Calculate the area of the triangle using the formula (base * height) / 2.
    var triangleArea = (sideA * heightVal) / 2;

    // Calculate the perimeter of the triangle by summing the lengths of all three sides.
    var perimeterLength = sideA + sideB + sideC;

    // Output the calculated area, perimeter, and height to the console.
    // Each value is printed on a new line as specified by the problem's output format.
    console.log(triangleArea + '\n' + perimeterLength + '\n' + heightVal);
}

// Invoke the main function to start the geometric calculations.
ProcessGeometry();
