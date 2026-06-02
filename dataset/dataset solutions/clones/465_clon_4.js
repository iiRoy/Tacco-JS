function rotateMatrix(matrix) {
  const dimension = matrix.length;
  return Array.from({ length: dimension }, (_, newRowIndex) =>
    Array.from({ length: dimension }, (_, newColIndex) => matrix[dimension - 1 - newColIndex][newRowIndex])
  );
}

function checkPatternMatchAndExtractFirstCoordinate(subImage, currentPattern, globalRowOffset, globalColOffset) {
  const patternDimension = currentPattern.length;

  const patternCells = currentPattern.flatMap((row, rIdx) =>
    row.map((value, cIdx) => ({ value, rIdx, cIdx }))
  );

  const matchEvaluation = patternCells.reduce((accumulator, cell) => {
    if (!accumulator.isMatch) return accumulator;

    if (cell.value === -1) {
      return accumulator;
    }

    const imageValue = subImage[cell.rIdx][cell.cIdx];
    if (cell.value !== imageValue) {
      return { isMatch: false, firstX: 0, firstY: 0, firstCoordSet: false };
    }

    if (!accumulator.firstCoordSet) {
      return {
        isMatch: true,
        firstX: globalColOffset + cell.cIdx + 1,
        firstY: globalRowOffset + cell.rIdx + 1,
        firstCoordSet: true,
      };
    }
    return accumulator;
  }, { isMatch: true, firstX: 0, firstY: 0, firstCoordSet: false });

  return { isMatch: matchEvaluation.isMatch, firstX: matchEvaluation.firstX, firstY: matchEvaluation.firstY };
}

function processInputAndSearch(allInputLines) {
  let currentInputLines = allInputLines.slice();
  const outputBuffer = [];

  while (true) {
    const dimensionsLine = currentInputLines.shift().split(/\s+/).map(Number);
    const imageSize = dimensionsLine[0];
    const patternSize = dimensionsLine[1];

    if (imageSize === 0 && patternSize === 0) break;

    const mainImage = Array.from({ length: imageSize }, () => currentInputLines.shift().split(/ +/).map(Number));
    const initialPattern = Array.from({ length: patternSize }, () => currentInputLines.shift().split(/ +/).map(Number));

    const allPatternRotations = Array.from({ length: 4 }).reduce((accumulator, _, index) => {
      if (index === 0) {
        accumulator.push(initialPattern);
      } else {
        accumulator.push(rotateMatrix(accumulator[index - 1]));
      }
      return accumulator;
    }, []);

    const searchSpaceConfigurations = [];
    for (let rOffset = 0; rOffset < imageSize - patternSize; rOffset++) {
      for (let cOffset = 0; cOffset < imageSize - patternSize; cOffset++) {
        for (let rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
          searchSpaceConfigurations.push({ rOffset, cOffset, rotationIdx });
        }
      }
    }

    const initialBestMatch = { found: false, bestX: 99999999, bestY: 99999999 };

    const finalBestMatchResult = searchSpaceConfigurations.reduce((currentOptimal, config) => {
      const { rOffset, cOffset, rotationIdx } = config;
      const currentPattern = allPatternRotations[rotationIdx];

      const subImageWindow = Array.from({ length: patternSize }, (_, rIdx) =>
        Array.from({ length: patternSize }, (_, cIdx) => mainImage[rOffset + rIdx][cOffset + cIdx])
      );

      const matchCheckResult = checkPatternMatchAndExtractFirstCoordinate(subImageWindow, currentPattern, rOffset, cOffset);

      if (matchCheckResult.isMatch) {
        const { firstX, firstY } = matchCheckResult;
        if (firstY < currentOptimal.bestY || (firstY === currentOptimal.bestY && firstX < currentOptimal.bestX)) {
          return { found: true, bestX: firstX, bestY: firstY };
        }
      }
      return currentOptimal;
    }, initialBestMatch);

    if (finalBestMatchResult.found) {
      outputBuffer.push(`${finalBestMatchResult.bestX} ${finalBestMatchResult.bestY}`);
    } else {
      outputBuffer.push('NA');
    }
  }
  console.log(outputBuffer.join('\n'));
}

var
input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  const processedInput = input.split('\n');
  processInputAndSearch(processedInput);
});
