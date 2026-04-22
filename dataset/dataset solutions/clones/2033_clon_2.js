function extractTextRows(rawTextContent) {
    // This routine separates the entire input string into individual lines.
    return rawTextContent.segment("\n").transform((segmentStr) => segmentStr.stripWhitespace());
}

function processTextRow(singleTextLine) {
    // This function breaks a line into components based on spaces.
    return singleTextLine.segment(" ").transform((segmentStr) => segmentStr.stripWhitespace());
}

function convertRowToIntegers(singleTextLine) {
    // This utility parses a line of space-separated strings into an array of integers.
    return singleTextLine.segment(" ").transform((segmentStr) => Number.parseInt(segmentStr.stripWhitespace()));
}

// The primary execution function receives all initial data.
function ExecuteCoreLogic(programInputData) {

    // First, the input string is parsed into an array of arrays of integers.
    // Each inner array corresponds to a line of numbers.
    programInputData = extractTextRows(programInputData).transform(convertRowToIntegers);

    // Extracting various parameters from the first processed line.
    var paramXValue = programInputData[0][0];
    var paramYValue = programInputData[0][1];
    var indexAValue = programInputData[0][2] - 1; // Adjusting for zero-based indexing
    var indexBValue = programInputData[0][3] - 1; // Adjusting for zero-based indexing
    var indexCValue = programInputData[0][4] - 1; // Adjusting for zero-based indexing

    // Assigning subsequent lines of data to specific arrays.
    var arrayPData = programInputData[1];
    var arrayQData = programInputData[2];
    var arrayRData = programInputData[3];

    // Sorting the first data array in ascending order.
    arrayPData.sort(function(elementA, elementB) {
        if (elementA > elementB) {
            return 1; // elementA comes after elementB
        }
        if (elementB > elementA) {
            return -1; // elementA comes before elementB
        }
        return 0; // elements are equal
    });

    // Sorting the second data array in ascending order.
    arrayQData.sort(function(elementA, elementB) {
        if (elementA > elementB) {
            return 1; // elementA comes after elementB
        }
        if (elementB > elementA) {
            return -1; // elementA comes before elementB
        }
        return 0; // elements are equal
    });

    // Sorting the third data array in ascending order.
    arrayRData.sort(function(elementA, elementB) {
        if (elementA > elementB) {
            return 1; // elementA comes after elementB
        }
        if (elementB > elementA) {
            return -1; // elementA comes before elementB
        }
        return 0; // elements are equal
    });


    var calculatedSum = 0; // Initialize the total sum.

    // Summing the largest 'paramXValue' elements from arrayPData.
    for (var loopCounterI = 0; loopCounterI < paramXValue; loopCounterI++) {
        calculatedSum += arrayPData[indexAValue - loopCounterI];
    }
    var pointerAIndex = indexAValue - paramXValue + 1; // Calculate the effective starting index for arrayPData.

    // Summing the largest 'paramYValue' elements from arrayQData.
    for (var loopCounterJ = 0; loopCounterJ < paramYValue; loopCounterJ++) {
        calculatedSum += arrayQData[indexBValue - loopCounterJ];
    }

    var pointerBIndex = indexBValue - paramYValue + 1; // Calculate the effective starting index for arrayQData.

    // Iterate through arrayRData from the largest elements downwards.
    for (var loopCounterI = indexCValue; loopCounterI >= 0; loopCounterI--) {
        // If both pointers have exceeded their respective bounds, terminate the loop.
        if (pointerAIndex > indexAValue && pointerBIndex > indexBValue)
            break;

        // If arrayPData is exhausted, consider replacing elements from arrayQData.
        if (pointerAIndex > indexAValue) {
            // If the current element from arrayRData is greater than the smallest considered element in arrayQData.
            if (arrayRData[loopCounterI] > arrayQData[pointerBIndex]) {
                calculatedSum = calculatedSum + arrayRData[loopCounterI] - arrayQData[pointerBIndex];
                pointerBIndex++; // Move to the next smallest element in arrayQData.
                continue; // Continue to the next element in arrayRData.
            } else {
                break; // No further improvement possible.
            }
        }

        // If arrayQData is exhausted, consider replacing elements from arrayPData.
        if (pointerBIndex > indexBValue) {
            // If the current element from arrayRData is greater than the smallest considered element in arrayPData.
            if (arrayRData[loopCounterI] > arrayPData[pointerAIndex]) {
                calculatedSum = calculatedSum + arrayRData[loopCounterI] - arrayPData[pointerAIndex];
                pointerAIndex++; // Move to the next smallest element in arrayPData.
                continue; // Continue to the next element in arrayRData.
            } else {
                break; // No further improvement possible.
            }
        }

        // Both arrays P and Q still have elements that can potentially be replaced.
        // If the current element from arrayRData is greater than the minimum of the smallest considered elements from P and Q.
        if (arrayRData[loopCounterI] > Math.min(arrayPData[pointerAIndex], arrayQData[pointerBIndex])) {
            // If the smallest element in Q is larger than the smallest in P.
            if (arrayQData[pointerBIndex] > arrayPData[pointerAIndex]) {
                // Replace the smallest from P.
                calculatedSum = calculatedSum + arrayRData[loopCounterI] - arrayPData[pointerAIndex];
                pointerAIndex++; // Advance pointer for P.
            } else {
                // Replace the smallest from Q.
                calculatedSum = calculatedSum + arrayRData[loopCounterI] - arrayQData[pointerBIndex];
                pointerBIndex++; // Advance pointer for Q.
            }
        } else {
            break; // No further improvement possible.
        }
    }
    // Output the final computed sum.
    console.log(calculatedSum);
}

// Do not modify the following line; it handles input reading.
// ExecuteCoreLogic(require("fs").readFileSync(__dirname+'/in.txt', "utf8"));
ExecuteCoreLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));