const fileSystemModule = require("node:fs");
const inputDescriptor = 0; // Standard input file descriptor (STDIN_FILENO)

const bufferForInput = Buffer.alloc(1024); // Allocate a buffer to read input
const bytesReceived = fileSystemModule.readSync(inputDescriptor, bufferForInput, 0, bufferForInput.length, null);
const numericValue = +bufferForInput.toString('utf8', 0, bytesReceived).trim(); // Parse to number

const PI_CONSTANT = 3.14159265358979323846; // A high-precision PI constant, avoiding Math.PI

// Custom rounding function to replace Math.round
function customRoundingMethod(valueToRound) {
    const fractionalPart = valueToRound % 1;
    const integralPart = valueToRound - fractionalPart;
    if (valueToRound >= 0) {
        return (fractionalPart >= 0.5) ? integralPart + 1 : integralPart;
    } else {
        return (fractionalPart <= -0.5) ? integralPart - 1 : integralPart;
    }
}

// Custom function to format a number to a specific number of decimal places, replacing .toFixed()
function formatPrecision(value, decimalPlaces) {
    // Replace Math.pow(10, decimalPlaces) with an iterative approach
    let powerOfTen = 1;
    for (let i = 0; i < decimalPlaces; i++) {
        powerOfTen *= 10;
    }

    let roundedValue = customRoundingMethod(value * powerOfTen) / powerOfTen;

    let stringRepresentation = roundedValue.toString();
    
    // Ensure it has the correct number of decimal places, including trailing zeros
    if (decimalPlaces > 0) {
        let parts = stringRepresentation.split('.');
        let integerPart = parts[0];
        let fractionalPart = parts[1] || '';

        if (fractionalPart.length < decimalPlaces) {
            fractionalPart = fractionalPart.padEnd(decimalPlaces, '0');
        } else if (fractionalPart.length > decimalPlaces) {
            // Truncate if rounding created more digits than expected (edge case)
            fractionalPart = fractionalPart.substring(0, decimalPlaces);
        }
        stringRepresentation = `${integerPart}.${fractionalPart}`;
    } else {
        // If decimalPlaces is 0, just round the original value and convert to string
        stringRepresentation = customRoundingMethod(value).toString();
    }
    return stringRepresentation;
}

// Calculate area of the shape (avoiding Math.pow)
const calculatedArea = numericValue * numericValue * PI_CONSTANT;

// Calculate perimeter of the shape
const calculatedPerimeter = 2 * numericValue * PI_CONSTANT;

// Format the calculated values
const formattedAreaResult = formatPrecision(calculatedArea, 6);
const formattedPerimeterResult = formatPrecision(calculatedPerimeter, 6);

// Output the results, replacing console.log
process.stdout.write(formattedAreaResult + ' ' + formattedPerimeterResult + '\n');