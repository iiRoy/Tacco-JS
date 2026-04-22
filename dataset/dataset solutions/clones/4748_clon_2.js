const ProcessInputData = (rawData) => {
  // Extract the first line; its purpose isn't used in subsequent logic.
  let initialSize = rawData.split('\n')[0];

  // Parse the second line, splitting it into individual string values.
  const parsedItems = rawData.split('\n')[1].split(' ');

  // Sort the array of items numerically in ascending order.
  parsedItems.sort( (itemA, itemB) => {
    return Number(itemA) - Number(itemB);
  } );

  /*
   * Filter the sorted array to retain only unique elements.
   * This uses the indexOf method to find the first occurrence of each element.
   */
  let uniqueElements = parsedItems.filter( (currentElement, currentIndex, fullArray) => {
    return fullArray.indexOf(currentElement) === currentIndex;
  } );

  // Determine the output based on the parity of the count of unique elements.
  if (uniqueElements.length % 2 === 1) {
    // If the count is odd, print the total count of unique elements.
    console.log(uniqueElements.length);
  } else {
    // If the count is even, print one less than the total count.
    console.log(uniqueElements.length - 1);
  }
};

// Execute the main processing function by reading input from standard input.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));