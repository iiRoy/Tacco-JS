'use strict';

class DataAcquirer {
  static #allLines = null;
  static #lineIndex = 0;

  static #ensureDataLoaded() {
    if (DataAcquirer.#allLines === null) {
      DataAcquirer.#allLines = require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
    }
  }

  static #fetchNextLine() {
    DataAcquirer.#ensureDataLoaded();
    return DataAcquirer.#allLines[DataAcquirer.#lineIndex++];
  }

  static obtainNumericParameters() {
    return DataAcquirer.#fetchNextLine().split(' ').map(Number);
  }

  static obtainPointDescription() {
    const components = DataAcquirer.#fetchNextLine().split(' ');
    return [Number(components[0]), Number(components[1]), components[2]];
  }
}

class ResultPresenter {
  static presentFinalResult(valueToDisplay) {
    console.log(valueToDisplay);
  }
}

class ProblemSolution {
  determineMaximalCoverage() {
    const analysisConfig = DataAcquirer.obtainNumericParameters();
    const numberOfPoints = analysisConfig[0];
    const windowDimension = analysisConfig[1]; // k
    const toroidalGridSize = 2 * windowDimension; // 2k

    // A 2D array to tally points after transformation
    // pointTally[x][y] stores how many transformed points fall at (x,y)
    const pointTally = Array(toroidalGridSize).fill(0).map(() => Array(toroidalGridSize).fill(0));

    // Process each input point
    for (let i = 0; i < numberOfPoints; ++i) {
      const pointDescriptor = DataAcquirer.obtainPointDescription();
      let originalCoordX = pointDescriptor[0];
      let originalCoordY = pointDescriptor[1];
      const pointDesignation = pointDescriptor[2];

      // Apply coordinate transformation and color-based shift
      let transformedCoordX = originalCoordX % toroidalGridSize;
      let transformedCoordY = originalCoordY % toroidalGridSize;

      if (pointDesignation === 'B') { // 'B' points are effectively shifted by 'windowDimension' in X
        transformedCoordX = (transformedCoordX + windowDimension) % toroidalGridSize;
      }
      pointTally[transformedCoordX][transformedCoordY]++;
    }

    // Compute a 2D prefix sum array (also known as an integral image)
    // The value at integralSums[r+1][c+1] represents the sum of pointTally[i][j]
    // for all 0 <= i <= r and 0 <= j <= c.
    const integralSums = Array(toroidalGridSize + 1).fill(0).map(() => Array(toroidalGridSize + 1).fill(0));
    for (let r = 0; r < toroidalGridSize; ++r) {
      for (let c = 0; c < toroidalGridSize; ++c) {
        integralSums[r + 1][c + 1] = pointTally[r][c] +
                                     integralSums[r][c + 1] +
                                     integralSums[r + 1][c] -
                                     integralSums[r][c];
      }
    }

    // Helper function to query the sum of points within a non-wrapping rectangle
    // The rectangle spans from [xStart, xEnd-1] rows and [yStart, yEnd-1] columns.
    const queryRectangularSum = (xStart, yStart, xEnd, yEnd) => {
      // Ensure coordinates are valid for the integralSums array
      xStart = Math.max(0, xStart);
      yStart = Math.max(0, yStart);
      xEnd = Math.min(toroidalGridSize, xEnd);
      yEnd = Math.min(toroidalGridSize, yEnd);

      if (xStart >= xEnd || yStart >= yEnd) return 0; // Empty or invalid rectangle

      return integralSums[xEnd][yEnd] -
             integralSums[xStart][yEnd] -
             integralSums[xEnd][yStart] +
             integralSums[xStart][yStart];
    };

    let overallMaximum = 0;

    // Iterate through all possible top-left corners (row_idx, col_idx)
    // for a windowDimension x windowDimension square on the toroidal grid.
    for (let row_idx = 0; row_idx < toroidalGridSize; ++row_idx) {
      for (let col_idx = 0; col_idx < toroidalGridSize; ++col_idx) {
        let currentWindowTotal = 0;

        const rowEnd = row_idx + windowDimension;
        const colEnd = col_idx + windowDimension;

        // Determine how the window wraps around the toroidal grid
        const wrapsHorizontally = (rowEnd > toroidalGridSize);
        const wrapsVertically = (colEnd > toroidalGridSize);

        if (!wrapsHorizontally && !wrapsVertically) {
          // Case 1: Window does not wrap in either dimension
          currentWindowTotal = queryRectangularSum(row_idx, col_idx, rowEnd, colEnd);
        } else if (wrapsHorizontally && !wrapsVertically) {
          // Case 2: Window wraps horizontally (rows)
          currentWindowTotal += queryRectangularSum(row_idx, col_idx, toroidalGridSize, colEnd);
          currentWindowTotal += queryRectangularSum(0, col_idx, rowEnd % toroidalGridSize, colEnd);
        } else if (!wrapsHorizontally && wrapsVertically) {
          // Case 3: Window wraps vertically (columns)
          currentWindowTotal += queryRectangularSum(row_idx, col_idx, rowEnd, toroidalGridSize);
          currentWindowTotal += queryRectangularSum(row_idx, 0, rowEnd, colEnd % toroidalGridSize);
        } else { // wrapsHorizontally && wrapsVertically
          // Case 4: Window wraps both horizontally and vertically
          currentWindowTotal += queryRectangularSum(row_idx, col_idx, toroidalGridSize, toroidalGridSize);
          currentWindowTotal += queryRectangularSum(0, col_idx, rowEnd % toroidalGridSize, toroidalGridSize);
          currentWindowTotal += queryRectangularSum(row_idx, 0, toroidalGridSize, colEnd % toroidalGridSize);
          currentWindowTotal += queryRectangularSum(0, 0, rowEnd % toroidalGridSize, colEnd % toroidalGridSize);
        }
        overallMaximum = Math.max(overallMaximum, currentWindowTotal);
      }
    }
    return overallMaximum;
  }
}

ResultPresenter.presentFinalResult(new ProblemSolution().determineMaximalCoverage());