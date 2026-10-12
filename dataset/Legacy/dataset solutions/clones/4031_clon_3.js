var inputDataLines = [];
var ioModule = require('readline');

var inputOutputInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputOutputInterface.on('line', function (currentInputLine) {
    inputDataLines.push(currentInputLine);
});

inputOutputInterface.on('close', function () {
    const parseLineToNumbers = (lineString) => {
        return lineString.split(" ").map(str => Number(str));
    };
    var parsedMatrix = inputDataLines.map(parseLineToNumbers);
    
    const MIN_A_VALUE = 0;
    const MAX_A_VALUE = 100;

    // Helper function to verify consistency for a given column
    // Checks if matrix[rowIndex][targetColIndex] == aValue + bValuesArray[rowIndex] for all rows
    const verifyColumnSumConsistency = (aValue, bValuesArray, targetColumnIndex, matrixData) => {
        for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
            if (aValue + bValuesArray[rowIndex] !== matrixData[rowIndex][targetColumnIndex]) {
                return false;
            }
        }
        return true;
    };

    // Iterate through possible values for A_row_0 (original a1)
    for (var candidateA_row0 = MIN_A_VALUE; candidateA_row0 <= MAX_A_VALUE; candidateA_row0++) {
        // Derive B_col values based on A_row_0 and the first column of the matrix
        // B_col_j = C[j][0] - A_row_0
        var derivedB_values = [];
        derivedB_values.push(parsedMatrix[0][0] - candidateA_row0); // B_col_0
        derivedB_values.push(parsedMatrix[1][0] - candidateA_row0); // B_col_1
        derivedB_values.push(parsedMatrix[2][0] - candidateA_row0); // B_col_2

        // Iterate through possible values for A_row_1 (original a2)
        for (var candidateA_row1 = MIN_A_VALUE; candidateA_row1 <= MAX_A_VALUE; candidateA_row1++) {
            // Check if A_row_1 and derived B_col values are consistent with the second column of the matrix
            // C[j][1] == A_row_1 + B_col_j
            if (!verifyColumnSumConsistency(candidateA_row1, derivedB_values, 1, parsedMatrix)) {
                continue;
            }
            
            // Iterate through possible values for A_row_2 (original a3)
            for (var candidateA_row2 = MIN_A_VALUE; candidateA_row2 <= MAX_A_VALUE; candidateA_row2++) {
                // Check if A_row_2 and derived B_col values are consistent with the third column of the matrix
                // C[j][2] == A_row_2 + B_col_j
                if (!verifyColumnSumConsistency(candidateA_row2, derivedB_values, 2, parsedMatrix)) {
                    continue;
                }
                
                // If all checks pass for this combination, print "Yes" and exit
                console.log("Yes");
                return 0;
            }
        }
    }
    // If no valid combination is found after exhausting all possibilities, print "No"
    console.log("No");
});
