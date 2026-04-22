// The entire input dataset is provided as 'receivedText'.
function ProcessProblemData(receivedText) {
  // Each line of the input text is stored sequentially in the 'parsedLines' array.
  var parsedLines = receivedText.split("\n");
  var valueTokens = parsedLines[1].split(" ");

  // To convert string representations to base-10 integers, 'parseInt' is utilized.
  var elementCount = parseInt(parsedLines[0], 10);
  var initialElements = new Array((2 * elementCount) - 1);

  for (var loopIndex = 0; loopIndex < initialElements.length; loopIndex++) {
    initialElements[loopIndex] = parseInt(valueTokens[loopIndex], 10);
  }

  function DeriveNextSequence(currentList) {
    var derivedList = new Array(currentList.length - 2);
    for (var subLoopIndex = 0; subLoopIndex < derivedList.length; subLoopIndex++) {
      var segmentOfThree = currentList.slice(subLoopIndex, subLoopIndex + 3);
      derivedList[subLoopIndex] = segmentOfThree.sort(
        function(firstNum, secondNum) {
          return (firstNum < secondNum ? -1 : 1);
        }
      )[1]; // Select the middle element after sorting
    }
    return derivedList;
  }

  var workingList = initialElements;

  // Continue processing until only one element remains in the list.
  while (workingList.length > 1) {
    workingList = DeriveNextSequence(workingList);
  }

  // Displaying the final result.
  console.log('%d', workingList[0]);
}

// Do not modify the following section (it handles standard input/output and invokes the main processing function).
ProcessProblemData(require("fs").readFileSync("/dev/stdin", "utf8"));