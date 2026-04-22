// This function processes an incoming string of data
function processInputData(rawDataString)
{

  // Split the raw string into individual lines based on newline characters
  const lineData = rawDataString.split('\n');

  /*
   * The very first line of the input contains three essential numerical parameters:
   * numElementsA: Represents the total number of items found in the first collection.
   * numElementsB: Represents the total number of items present in the second collection.
   * maxAllowedValue: Specifies the maximum permissible cumulative value that can be accumulated.
   */
  const [numElementsA, numElementsB, maxAllowedValue] = lineData[0].split(' ').map(valStr => parseInt(valStr, 10));

  // Parse the second line of the input into a reversed array of numbers for stackA
  // The .reverse() call is crucial for treating it as a stack where .pop() gets the smallest element
  const stackA = lineData[1].split(' ').map(valStr => parseInt(valStr, 10)).reverse();

  // Similarly, parse the third line of the input into a reversed array of numbers for stackB
  // This also effectively transforms the array into a stack-like structure
  const stackB = lineData[2].split(' ').map(valStr => parseInt(valStr, 10)).reverse();


  // Initialize a counter to keep track of the number of successful item selections
  let iterationCounter = 0;
  // Initialize an accumulator variable to store the current total sum of selected item values
  let currentSum = 0;


  // Begin a loop that continues as long as the accumulated sum does not exceed the maximum allowed value
  while (currentSum <= maxAllowedValue)
  {

    // Increment the counter for each potential item selection attempt within the loop
    iterationCounter++;
    // If both collections (stacks) are completely empty, it means no more items can be selected, so exit the loop
    if ((stackA.length === 0) && (stackB.length === 0)) {
      break;
    }


    // Declare a variable to temporarily hold the value of the element chosen in the current iteration
    let chosenElement;


    // Decision-making logic to determine which element to pick next from the available collections:

    // Case 1: If the first collection (stackA) is empty, we must pick from the second collection (stackB)
    if (stackA.length === 0) {
      chosenElement = stackB.pop();
    }
    // Case 2: Else if the second collection (stackB) is empty, we must pick from the first collection (stackA)
    else if (stackB.length === 0) {
      chosenElement = stackA.pop();
    }
    // Case 3: Else if both collections have elements, compare their top elements (smallest values after reverse)
    // If the top element of stackA is less than or equal to stackB's top element, pick from stackA
    else if (stackA[stackA.length - 1] <= stackB[stackB.length - 1]) {
      chosenElement = stackA.pop();
    }
    // Case 4: Otherwise (if stackB's top element is smaller), pick from stackB
    else {
      chosenElement = stackB.pop();
    }


    // Add the value of the chosen element to the current total sum
    currentSum += chosenElement;
  }


  // Output the final count of items successfully selected.
  // We subtract one from the iterationCounter because the loop increments before the final condition check
  // that might have caused the loop to terminate.
  console.log(iterationCounter - 1);
}


// Execute the primary processing function by reading input data from standard input.
// This typically involves reading from a file or console stream in a Node.js environment.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));