function solveProblem(inputString) {
  const inputLines = inputString.split("\n");

  // Helper function to parse the configuration line
  const extractConfiguration = (lineContent) => {
    const parts = lineContent.split(" ");
    return {
      numRows: parseInt(parts[0], 10),
      numCols: parseInt(parts[1], 10),
      offsetValue: parseInt(parts[2], 10)
    };
  };

  const configuration = extractConfiguration(inputLines[0]);
  const numRows = configuration.numRows;
  const numCols = configuration.numCols;
  const offsetValue = configuration.offsetValue;

  // Parse the weights vector using Number() for type conversion
  const weightsVector = inputLines[1].split(" ").map(val => Number(val));

  // Parse the data matrix using Array.from for a structural change
  const dataMatrix = Array.from({ length: numRows }, (_, rowIndex) => {
    return inputLines[rowIndex + 2].split(" ").map(val => Number(val));
  });

  // Refactored object definition using a constructor function
  function ScoreCalculator(rows, cols, offset, weights, matrix) {
    this.totalRows = rows;
    this.totalCols = cols;
    this.initialOffset = offset;
    this.weightCoefficients = weights;
    this.inputMatrix = matrix;
  }

  // Method defined on the prototype
  ScoreCalculator.prototype.calculateMatches = function() {
    let positiveScoreCount = 0;
    for (let rIdx = 0; rIdx < this.totalRows; rIdx++) {
      // Initialize current sum directly with the offset value
      let currentSum = this.initialOffset;

      for (let cIdx = 0; cIdx < this.totalCols; cIdx++) {
        // Introduce a temporary variable for the product term
        const productTerm = this.inputMatrix[rIdx][cIdx] * this.weightCoefficients[cIdx];
        currentSum += productTerm;
      }

      // Increment count if the sum is positive
      if (currentSum > 0) {
        positiveScoreCount = positiveScoreCount + 1;
      }
    }
    return positiveScoreCount;
  };

  const calculatorInstance = new ScoreCalculator(numRows, numCols, offsetValue, weightsVector, dataMatrix);
  console.log(calculatorInstance.calculateMatches());
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
solveProblem(fileContent);
