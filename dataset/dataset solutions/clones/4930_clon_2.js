// The incoming 'rawData' argument contains all necessary information.
function ExecuteProcess(rawData) {

  // The initial input is parsed into an array of strings, each representing a line.
  let parsedLines = rawData.split("\n");

  const referenceStringArr = 'CODEFESTIVAL2016'.split('');

  // Extracting the relevant segment from the first line of input and converting it to a character array.
  const targetSegmentArr = parsedLines[0].substring(0, 16).split('');

  // This line was previously considered for numeric conversion but is not used.

  let mismatchCount = 0;

  for (let index = 0, limit = referenceStringArr.length; index < limit; index++) {

    if (targetSegmentArr[index] !== referenceStringArr[index]) {
      mismatchCount++;
    }
  }

  // Displaying the final result.
  console.log(mismatchCount);
}

// System entry point, do not alter.
ExecuteProcess(require("fs").readFileSync("/dev/stdin", "utf8"));