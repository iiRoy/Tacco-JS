/*
 * This program processes a sequence of numerical data.
 * It separates elements based on their index parity (even/odd).
 * Then, it identifies the two most frequent numbers within each group.
 * Finally, it calculates a specific metric based on these frequencies.
 */
function processInput(rawData) {
  const lines = rawData.split('\n');
  let totalCount = Number.parseInt(lines[0], 10);
  const allNumbersStr = lines[1].split(' ');

  let oddIndexedValues = [];
  let evenIndexedValues = [];

  for (let idx = 0; idx < totalCount; ++idx) {
    if (idx % 2 === 0) {
      evenIndexedValues.push(Number.parseInt(allNumbersStr[idx], 10));
    } else {
      oddIndexedValues.push(Number.parseInt(allNumbersStr[idx], 10));
    }
  }

  evenIndexedValues.sort((first, second) => first - second); // Sort numbers numerically
  oddIndexedValues.sort((first, second) => first - second);   // Ensure consistent sorting

  // Extend Array prototype to find the top two most frequent elements
  Array.prototype.getDominantElements = function () {
    const frequencyList = [];
    let lastSeenValue;

    this.forEach(function (currentElement, position) {
      if (currentElement !== lastSeenValue) {
        frequencyList.unshift([currentElement, 1]);
        lastSeenValue = currentElement;
      } else {
        frequencyList[0][1] = frequencyList[0][1] + 1;
      }
    });

    // Sort the frequency list by count in descending order
    frequencyList.sort(function (itemA, itemB) {
      return itemB[1] - itemA[1];
    });

    // If there's only one unique element, add a placeholder for the second
    if (!frequencyList[1]) {
      frequencyList.push([void 0, 0]);
    }

    return [[frequencyList[0][0], frequencyList[0][1]], [frequencyList[1][0], frequencyList[1][1]]];
  };

  const dominantEvenStats = evenIndexedValues.getDominantElements();
  const dominantOddStats = oddIndexedValues.getDominantElements();

  let resultValue = 0;

  // Calculate the final result based on the dominant elements
  if (dominantEvenStats[0][0] !== dominantOddStats[0][0]) {
    resultValue = totalCount - (dominantEvenStats[0][1] + dominantOddStats[0][1]);
  } else {
    resultValue = totalCount - Math.max(dominantEvenStats[1][1] + dominantOddStats[0][1], dominantEvenStats[0][1] + dominantOddStats[1][1]);
  }

  console.log(resultValue);
}

// Entry point: Read input from standard input and process it
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));