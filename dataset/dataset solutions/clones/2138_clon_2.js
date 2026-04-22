function OrderedCollection()
{
  this.storageArray = []; // Initialize the underlying array for storing elements
}

OrderedCollection.prototype = {
  insertElement: function(newValue)
  {
    var internalArray = this.storageArray;
    var currentIndex = internalArray.length; // Start at the end
    internalArray.length++; // Increment length for new element

    var parentIndex; // Placeholder for parent index
    while (currentIndex > 0)
    {
      parentIndex = (currentIndex - 1) >>> 1; // Calculate parent index using bitwise right shift
      if (internalArray[parentIndex] <= newValue)
      {
        break; // New value is larger than or equal to parent, found correct spot
      }
      internalArray[currentIndex] = internalArray[parentIndex]; // Move parent down
      currentIndex = parentIndex; // Move up the collection
    }
    internalArray[currentIndex] = newValue; // Place the new element
  },

  extractMin: function()
  {
    var internalArray = this.storageArray;
    var minVal = internalArray[0]; // Store the minimum value to be returned
    var lastElement = internalArray.pop(); // Remove the last element and store it

    var currentIndex = 0; // Start at the root
    var halfLength = internalArray.length >>> 1; // Pre-calculate half length for loop condition
    var childIndex; // Placeholder for child index

    while (currentIndex < halfLength)
    {
      childIndex = (currentIndex << 1) + 1; // Left child index
      // If right child exists and is smaller than left child, choose right child
      if ((childIndex + 1) < internalArray.length && internalArray[childIndex + 1] < internalArray[childIndex])
      {
        childIndex++;
      }

      if (lastElement <= internalArray[childIndex])
      {
        break; // Last element is smaller than or equal to child, found correct spot
      }

      internalArray[currentIndex] = internalArray[childIndex]; // Move child up
      currentIndex = childIndex; // Move down the collection
    }

    if (internalArray.length > 0)
    {
      internalArray[currentIndex] = lastElement; // Place the last element in its final position
    }
    return minVal; // Return the original minimum value
  },

  getElementCount: function()
  {
    return this.storageArray.length; // Return the number of elements currently in the collection
  },

  peekMin: function()
  {
    return this.storageArray[0]; // Return the smallest element without removing it
  }
};

function numericOrder(firstNum, secondNum)
{
  // A utility function for sorting numbers in ascending order
  return firstNum - secondNum;
}

function ExecuteLogic(inputString)
{
  var lines = inputString.split("\n");
  var totalElements = parseInt(lines[0], 10); // Parse the first line as an integer
  var dataSequence = lines[1].split(" ").map(val => parseInt(val, 10)); // Parse the second line into an array of numbers
  dataSequence.sort(numericOrder); // Sort the numerical sequence

  var resultCollection = new OrderedCollection(); // Instantiate our custom ordered collection

  // Iterate from the smallest value in the data sequence up to (but not including) the largest
  for (var currentIterValue = dataSequence[0]; currentIterValue < dataSequence[totalElements - 1]; currentIterValue++)
  {
    var tempSumOfSquares = 0; // Initialize a temporary sum for squares of differences
    // Calculate sum of squares of differences for the current iteration value
    for (var sequenceIndex = 0; sequenceIndex < totalElements; sequenceIndex++)
    {
      var difference = dataSequence[sequenceIndex] - currentIterValue;
      tempSumOfSquares += (difference * difference);
    }
    resultCollection.insertElement(tempSumOfSquares); // Add the calculated sum to our ordered collection
  }

  // Output the minimum calculated sum
  console.log(resultCollection.peekMin());
  return; // End of main execution path
}

// Execute the primary logic by reading input from standard input
ExecuteLogic(require("fs").readFileSync("/dev/stdin", "utf8"));