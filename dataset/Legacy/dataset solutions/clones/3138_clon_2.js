const processInputData = (rawData) => {
  // Split the raw input string into an array of lines.
  let processedLines = rawData.split('\n');

  // Extract the first line and split it by space.
  const firstLineParts = processedLines[0].split(' ');

  // Extract the second line and split it by space.
  const weightsArray = processedLines[1].split(' ');

  // Discard the first two lines, keeping only the data rows.
  let dataRows = processedLines.slice(2);

  // Filter the data rows based on a condition and then log the count of matching rows.
  console.log(
    dataRows.filter(
      (currentRowString) => {
        // For each data row, split it into individual values.
        // Then, reduce these values by multiplying them with corresponding weights
        // from the 'weightsArray' and summing them up.
        // The condition is that this sum must be greater than zero.
        return currentRowString.split(' ').reduce(
          (accumulator, currentValue, indexPosition) => {
            return accumulator + currentValue * weightsArray[indexPosition];
          },
          0
        ) > 0;
      }
    ).length
  );
};

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
