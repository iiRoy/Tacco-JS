function ProcessInput(rawData) {
  // The first line is at rawData[0], second at rawData[1], etc.
  rawData = rawData.split('\n');

  let dimensionsArray = rawData[0].split(' ');
  let heightVal = parseInt(dimensionsArray[0], 10);
  let widthVal = parseInt(dimensionsArray[1], 10);

  for (let rowIndex = 0; rowIndex < heightVal + 2; rowIndex++) {
    let currentLineChars = ['#'];

    for (let colIndex = 0; colIndex < widthVal; colIndex++) {
      if (rowIndex === 0 || rowIndex === heightVal + 1) {
        currentLineChars.push('#');
      } else {
        currentLineChars.push(rawData[rowIndex][colIndex]);
      }
    }

    currentLineChars.push('#');
    console.log(currentLineChars.join(''));
  }
}

/* Do not modify anything below this line; it handles reading from standard input and invoking the primary processing function. */
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));