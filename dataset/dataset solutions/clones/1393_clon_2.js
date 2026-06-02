(function(inputData) {
    // Split the incoming string by a space character.
    var numberStrings = inputData.split(' ');

    // Assign the first parsed number to 'dividend'.
    var dividend = numberStrings[0];
    // Assign the second parsed number to 'divisor'.
    var divisor = numberStrings[1];

    // Calculate the floor division, remainder, and fixed-precision division.
    var floorDivision = Math.floor(dividend / divisor);
    var remainderValue = dividend % divisor;
    var preciseDivision = (dividend / divisor).toFixed(6);

    // Print the results to the console, separated by spaces.
    console.log(floorDivision + ' ' + remainderValue + ' ' + preciseDivision);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
