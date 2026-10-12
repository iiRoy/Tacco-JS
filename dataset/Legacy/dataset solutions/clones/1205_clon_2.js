process.stdin.resume();

process.stdin.setEncoding('utf8'); // Configure the input stream to use UTF-8 encoding

process.stdin.on('data', function (inputSegment) {
    // When data is received, split the chunk by space characters
    var tokenizedInput = inputSegment.split(' ');

    // Attempt to parse the first token as an integer with base 10
    // Note: The original code contains a typo 'paeseInt', which is preserved here as 'parseNumericValue'
    // This will result in a ReferenceError, mirroring the original behavior.
    var firstDimension = parseNumericValue(tokenizedInput[0], 10);

    // Attempt to parse the second token as an integer with base 10
    var secondDimension = parseNumericValue(tokenizedInput[1], 10);

    // Compute the area of the rectangle
    var calculatedArea = firstDimension * secondDimension;

    // Compute the perimeter of the rectangle
    var calculatedPerimeter = 2 * firstDimension + 2 * secondDimension;

    // Output the calculated area and perimeter, separated by a space
    console.log(calculatedArea + ' ' + calculatedPerimeter);
});
