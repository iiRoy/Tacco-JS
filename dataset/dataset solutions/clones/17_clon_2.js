var initialDataContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Retrieve raw text from the standard input source

var textualRecords = initialDataContent.split('\n'); // Divide the complete input string into an array of separate lines

var currentRecord; // Declare a variable to hold the currently processed line
while (currentRecord = textualRecords.shift()) { // Iterate through each line, extracting one at a time until none remain

    var numericalComponents = currentRecord.split(' ').map(function(stringNumber) { // Split the current line by spaces and convert each segment to a numeric value
        return +stringNumber; // Convert string to number
    });

    // Assign the extracted numeric components to distinct variables representing coefficients
    var paramA = numericalComponents[0];
    var paramB = numericalComponents[1];
    var paramC = numericalComponents[2];
    var paramD = numericalComponents[3];
    var paramE = numericalComponents[4];
    var paramF = numericalComponents[5];

    // Perform intermediate calculations for solving a system of linear equations
    var scalingFactor1 = -(paramB / paramE); // Calculate a primary scaling multiplier
    paramD = paramD * scalingFactor1; // Apply multiplier to coefficient D
    paramE = paramE * scalingFactor1; // Apply multiplier to coefficient E
    paramF = paramF * scalingFactor1; // Apply multiplier to coefficient F

    var aggregateCoefficient = paramA + paramD; // Compute a combined coefficient
    var unknownX = (paramC + paramF) / aggregateCoefficient; // Determine the value of the first unknown (X)
    var unknownY = (-paramA * unknownX + paramC) / paramB; // Determine the value of the second unknown (Y)

    // Format the calculated X result to a string with three decimal places
    var formattedUnknownX = Math.round(unknownX * 1000) + '';
    formattedUnknownX = formattedUnknownX.replace(/(\d{3})$/, '.$1');

    // Format the calculated Y result to a string with three decimal places
    var formattedUnknownY = Math.round(unknownY * 1000) + '';
    formattedUnknownY = formattedUnknownY.replace(/(\d{3})$/, '.$1');

    console.log(formattedUnknownX + ' ' + formattedUnknownY); // Display the formatted X and Y solutions
}