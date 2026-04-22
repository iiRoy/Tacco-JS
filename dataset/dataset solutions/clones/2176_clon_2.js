/*
 * This JavaScript module is designed to inspect a collection of numerical inputs.
 * It determines if there are any duplicate values present within the dataset.
 */
function ProcessInputData(rawDataString)
{
  // A utility function to present the final result to the user.
  const displayOutcome = function(messageContent)
  {
    console.log( messageContent );
  };

  // First, segment the incoming raw string data by newline characters.
  let  arrayOfLines = rawDataString.split("\n") ;

  // The very first line of the input is expected to contain the total count
  // of numerical elements that follow in the subsequent line.
  let  totalValuesQuantity = Number.parseInt(arrayOfLines[0], 10) ; // Explicit integer conversion

  // The second line holds the actual numerical elements,
  // which are separated by spaces.
  var  numericalStringElements = arrayOfLines[1].split(" ") ;


  // Proceed to sort these numerical string elements.
  // The custom comparison function ensures a correct ascending numerical order
  // by converting each string to an integer before comparison.
  numericalStringElements.sort( function (firstComparableItem, secondComparableItem)
  {
    return Number.parseInt(firstComparableItem, 10) - Number.parseInt(secondComparableItem, 10);
  } );

  // Now, iterate through the *sorted* list to efficiently identify any adjacent duplicates.
  // We only need to check up to the second-to-last element.
  for (  let  currentScanIndex = 0;  currentScanIndex < totalValuesQuantity - 1;  currentScanIndex++  )
  {
    // If an element is identical to its immediate successor, a duplicate has been found.
    if (numericalStringElements[currentScanIndex] === numericalStringElements[currentScanIndex + 1])
    {
      displayOutcome("NO"); // Signal that duplicates exist.
      return; // Exit the function immediately.
    }
  }

  // If the entire loop completes without triggering the duplicate condition,
  // it implies that all numerical elements are distinct.
  displayOutcome("YES"); // Confirm that all elements are unique.
}