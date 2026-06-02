var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var dataTokens = rawData.split(/ |\n/);

var numElements = parseInt(dataTokens[0], 10);
var integerProductPairs = 0;

// Helper function to check if the product of a number with a decimal part
// and an integer number results in an integer, based on the original logic.
// This function specifically checks if the 'fractional part' of the product
// (derived from the decimal string's fractional digits multiplied by the integer)
// has trailing zeros matching the original decimal's precision.
function checkFractionalProductForIntegerResult(decimalStringRepresentation, integerNumericValue) {
    const decimalPointPosition = decimalStringRepresentation.indexOf('.');
    
    // Extract the fractional part string (e.g., "25" from "1.25")
    const fractionalPartString = decimalStringRepresentation.substring(decimalPointPosition + 1);
    const numberOfDecimalPlaces = fractionalPartString.length;
    
    // Convert the fractional part to a number
    const fractionalPartAsNumber = parseInt(fractionalPartString, 10);
    
    // Multiply the fractional part by the integer value
    // Example: 25 * 4 = 100
    const intermediateProduct = fractionalPartAsNumber * integerNumericValue;
    
    // Convert this intermediate product to a string to inspect its trailing digits
    const intermediateProductString = intermediateProduct.toString();
    
    // Get the last 'numberOfDecimalPlaces' characters from the intermediate product string.
    // If these characters parse to 0, it means the original product (e.g., 1.25 * 4)
    // would have resulted in an integer (5.00).
    const trailingDigits = intermediateProductString.substr(-numberOfDecimalPlaces);
    
    return parseInt(trailingDigits, 10) === 0;
}

for (let outerIndex = 1; outerIndex < numElements + 1; outerIndex++) {
    for (let innerIndex = 1; innerIndex < outerIndex; innerIndex++) {
        const currentAString = dataTokens[innerIndex];
        const currentBString = dataTokens[outerIndex];

        const aHasDecimalPoint = currentAString.indexOf('.') > -1;
        const bHasDecimalPoint = currentBString.indexOf('.') > -1;

        // Case 1: Both numbers are integers (no decimal points)
        if (!aHasDecimalPoint && !bHasDecimalPoint) {
            integerProductPairs++;
        } 
        // Case 2: currentAString has a decimal point, currentBString is an integer
        else if (aHasDecimalPoint && !bHasDecimalPoint) {
            // Convert currentBString to a number for multiplication, as per original logic.
            if (checkFractionalProductForIntegerResult(currentAString, Number(currentBString))) {
                integerProductPairs++;
            }
        } 
        // Case 3: currentBString has a decimal point, currentAString is an integer
        else if (bHasDecimalPoint && !aHasDecimalPoint) {
            // Convert currentAString to a number for multiplication, as per original logic.
            if (checkFractionalProductForIntegerResult(currentBString, Number(currentAString))) {
                integerProductPairs++;
            }
        }
        // If both numbers have decimal points, or if none of the above conditions are met,
        // integerProductPairs is not incremented, preserving the original behavior.
    }
}

console.log(integerProductPairs);
