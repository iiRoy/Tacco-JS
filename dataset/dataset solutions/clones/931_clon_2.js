var rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
// Split the raw input into individual lines for processing
var dataRows = rawData.split('\n');

// The first line contains the number of matrices, convert it to a number
var matrixCount = Number(dataRows.shift());

// Initialize an array to store the dimensions of the matrices.
// r[i] and r[i+1] represent the dimensions of the i-th matrix (r[i] x r[i+1]).
var dimensions = [];

// Populate the dimensions array from the input lines.
// Each subsequent line contains two numbers: r[i] and r[i+1].
for (var idxA = 1; idxA <= matrixCount; idxA++) {
    // Split the line by space to get the two dimension values
    var currentPair = dataRows.shift().split(' ');
    // Store the first dimension
    dimensions[idxA] = Number(currentPair[0]);
    // Store the second dimension, which is also the first dimension of the next matrix
    dimensions[idxA + 1] = Number(currentPair[1]);
}

// Initialize a 2D array to store the minimum multiplication costs.
// minMultiplications[i][j] will store the minimum cost to multiply matrices from i to j.
var minMultiplications = [[-1]]; // Placeholder for 0-th row/column, not used in 1-based indexing

// Initialize the minMultiplications table.
// All cells are set to positive infinity initially, except for diagonal elements.
for (var idxA = 1; idxA <= matrixCount; idxA++) {
    var rowPlaceholder = [-1]; // Placeholder for 0-th column in each row
    minMultiplications.push(rowPlaceholder);
    for (var idxB = 1; idxB <= matrixCount; idxB++) {
        minMultiplications[idxA][idxB] = Number.POSITIVE_INFINITY;
    }
}

// The cost of multiplying a single matrix (from i to i) is 0.
for (var idxA = 1; idxA <= matrixCount; idxA++) {
    minMultiplications[idxA][idxA] = 0;
}

// This is the main dynamic programming algorithm for matrix chain multiplication.
// 'chainLength' represents the length of the matrix chain being considered (j in original).
for (var chainLength = 1; chainLength < matrixCount; chainLength++) {
    // 'startMatrix' represents the starting index of the matrix chain (i in original).
    for (var startMatrix = 1; startMatrix <= matrixCount - chainLength; startMatrix++) {
        // 'splitPoint' represents the point where the chain is split (k in original).
        // We iterate through all possible split points for the current chain.
        for (var splitPoint = startMatrix + 1; splitPoint <= startMatrix + chainLength; splitPoint++) {
            // Calculate the cost for the current split:
            // cost(i, k-1) + cost(k, i+j) + dimensions[i] * dimensions[k] * dimensions[i+j+1]
            var currentCalc = minMultiplications[startMatrix][splitPoint - 1] +
                              minMultiplications[splitPoint][startMatrix + chainLength] +
                              dimensions[startMatrix] * dimensions[splitPoint] * dimensions[startMatrix + chainLength + 1];

            // If this calculated cost is less than the currently stored minimum cost for this chain, update it.
            if (currentCalc < minMultiplications[startMatrix][startMatrix + chainLength]) {
                minMultiplications[startMatrix][startMatrix + chainLength] = currentCalc;
            }
        }
    }
}

// The final result is the minimum cost to multiply all matrices from 1 to n.
console.log(minMultiplications[1][matrixCount]);
