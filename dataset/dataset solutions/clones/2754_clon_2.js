// The entire raw input string is provided to this routine.
function ProcessInputData(rawDataString) {
  var numericValues = rawDataString.split("\n")[1].split(" ");

  for (var currentIdx = 0; currentIdx < numericValues.length; currentIdx++) {
    numericValues[currentIdx] = parseInt(numericValues[currentIdx], 10);
  }

  while (numericValues.length > 2) {
    // Determine the smallest value, ensuring the array's extremities are not considered.
    var temporarySearchArray = JSON.parse(JSON.stringify(numericValues));
    temporarySearchArray[0] = 1e9 + 7; // Assign a sufficiently large constant to exclude the first element
    temporarySearchArray[temporarySearchArray.length - 1] = 1e9 + 7; // Exclude the final element as well

    var foundMinimum = Math.min.apply(null, temporarySearchArray);

    var minimumValueIndex = temporarySearchArray.indexOf(foundMinimum);

    var previousVal = numericValues[minimumValueIndex - 1];
    var centralVal = numericValues[minimumValueIndex];
    var nextVal = numericValues[minimumValueIndex + 1];

    numericValues[minimumValueIndex - 1] = previousVal + centralVal;
    numericValues[minimumValueIndex + 1] = nextVal + centralVal;
    numericValues.splice(minimumValueIndex, 1);
  }

  var resultTotal = parseInt(numericValues[0], 10) + parseInt(numericValues[1], 10);
  console.log(resultTotal);
}

// Do not modify the following line; it handles standard input/output and invokes the primary function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));