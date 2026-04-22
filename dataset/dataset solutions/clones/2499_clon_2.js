"use strict"; // Enforce stricter parsing and error handling for the script.

// dropOneOccurrence(collection)(element) returns a new collection with one instance of 'element' removed.
const dropOneOccurrence = sourceCollection => itemToRemove =>
  sourceCollection.filter(
    (elementValue, position, fullArrayRef) => position !== fullArrayRef.indexOf(itemToRemove)
  );

// Checks if the value at a specific index within an array meets a certain condition.
function evaluateCriterion( valueSet, queryPosition, comparisonValue ) {
  if (valueSet[queryPosition] >= comparisonValue) { // If the element at the queried position is greater than or equal to the comparison value...
    return true; // ...the condition is satisfied.
  }
  else { // Otherwise, if it's less than the comparison value...
    return false; // ...the condition is not met.
  }
}

// A generalized template for performing a binary search on a sorted array.
function locateBoundary( orderedValues, targetThreshold ) {
  var lowPointer = -1; // 'lowPointer' represents an index that definitely does NOT satisfy the condition. Initialize to -1 because index 0 might satisfy it.
  var highPointer = orderedValues.length; // 'highPointer' represents an index that definitely DOES satisfy the condition (or an upper bound). Initialize to array length because the last element might not satisfy it.

  /* Continue searching as long as there's more than one element between 'highPointer' and 'lowPointer'. */
  while ( Math.abs(highPointer - lowPointer) > 1 ) {
    var middleIdx = Math.floor( (highPointer + lowPointer) / 2 ); // Calculate the midpoint index.

    if ( evaluateCriterion(orderedValues, middleIdx, targetThreshold) ) { // If the element at 'middleIdx' satisfies the condition...
      highPointer = middleIdx; // ...then 'middleIdx' becomes the new 'highPointer' (a potential candidate).
    }
    else { // Otherwise, if it does not satisfy the condition...
      lowPointer = middleIdx; // ...then 'middleIdx' becomes the new 'lowPointer' (definitely not a candidate).
    }
  }
  return highPointer; // The 'highPointer' will converge to the smallest index that satisfies the condition.
}


const processData = rawInputText => {
  const lineSegments = rawInputText.trim().split("\n"); // Trim whitespace and split the input string into an array of lines.
  var itemQuantity = parseInt(lineSegments[0], 10); // Parse the first line as the total number of items.
  var numberList = lineSegments[1].split(" "); // Split the second line into an array of strings representing numbers.

  for ( var outerIdx = 0; outerIdx < itemQuantity; outerIdx++ ) { // Iterate through the array to convert string numbers to integers.
    numberList[outerIdx] = parseInt(numberList[outerIdx], 10);
  }

  numberList.sort(function(firstNum, secondNum) { return firstNum - secondNum; }); // Sort the numeric list in ascending order.

  var cumulativeResult = 0; // Initialize the accumulator for the final result.
  var temporaryCount = 0; // Declare a temporary counter, though it remains unused in this specific logic path.

  for ( var outerIdx = 0; outerIdx < itemQuantity - 1; outerIdx++ ) { // Outer loop iterates from the first element up to the second-to-last.
    for ( var innerIdx = outerIdx + 1; innerIdx < itemQuantity; innerIdx++ ) { // Inner loop iterates from the element after 'outerIdx' to the end.

      // Create a modified sub-sequence by removing specific elements from the main list multiple times.
      // This effectively removes numberList[innerIdx], numberList[outerIdx], their sum, and their absolute difference, IF they exist.
      var modifiedSubsequence = dropOneOccurrence(
        dropOneOccurrence(
          dropOneOccurrence(
            dropOneOccurrence(numberList)(numberList[innerIdx]) // Remove numberList[innerIdx]
          )(numberList[outerIdx]) // Remove numberList[outerIdx]
        )(numberList[outerIdx] + numberList[innerIdx]) // Remove sum (numberList[outerIdx] + numberList[innerIdx])
      )(Math.abs(numberList[outerIdx] - numberList[innerIdx])); // Remove absolute difference (Math.abs(numberList[outerIdx] - numberList[innerIdx]))

      // Calculate a part of the cumulative result using binary searches on the modified subsequence.
      // This finds the count of elements greater than or equal to (numberList[outerIdx]+numberList[innerIdx]) minus
      // the count of elements greater than or equal to Math.abs(numberList[outerIdx]-numberList[innerIdx]).
      cumulativeResult = cumulativeResult +
        locateBoundary(modifiedSubsequence, numberList[outerIdx] + numberList[innerIdx]) -
        locateBoundary(modifiedSubsequence, Math.abs(numberList[outerIdx] - numberList[innerIdx]));

    }
  }

  console.log(Math.floor(cumulativeResult / 3)); // Output the final cumulative result divided by 3, rounded down to the nearest integer.
};

processData( require('fs').readFileSync('/dev/stdin', 'utf8') ); // Read input from standard input and pass it to the main processing function.