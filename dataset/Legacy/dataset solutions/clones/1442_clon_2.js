(function (rawData) {
    // Process the raw input string to get individual lines
    var processedLines = rawData.replace(/\r/g, '').split('\n');

    // Extract the first line and parse the numerical values
    var currentSegment = processedLines.shift().split(' ');
    var sideA = parseInt(currentSegment[0], 10); // First side length
    var sideB = parseInt(currentSegment[1], 10); // Second side length
    var angleDegrees = parseInt(currentSegment[2], 10); // Angle in degrees

    // Convert the angle from degrees to radians for trigonometric functions
    var angleRadians = angleDegrees * Math.PI / 180;

    // Calculate the area of the triangle
    var triangleArea = 0.5 * sideA * sideB * Math.sin(angleRadians);

    // Calculate the perimeter of the triangle using the law of cosines to find the third side
    var thirdSideSquared = sideA * sideA + sideB * sideB - (2 * sideA * sideB * Math.cos(angleRadians));
    var trianglePerimeter = sideA + sideB + Math.sqrt(thirdSideSquared);

    // Calculate the height of the triangle relative to sideA (or sideB, depending on perspective)
    var triangleHeight = sideB * Math.sin(angleRadians);

    // Output the calculated values, formatted to 8 decimal places, each on a new line
    console.log(triangleArea.toFixed(8) + '\n' + trianglePerimeter.toFixed(8) + '\n' + triangleHeight.toFixed(8));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
