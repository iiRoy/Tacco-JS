// Function to orchestrate the entire processing flow for scheduling tasks
function processData(rawData) {
  // Split the raw input string into individual lines, removing any leading or trailing whitespace
  let lines = rawData.trim().split("\n");

  // Parse the very first line which contains global configuration parameters
  // These are expected to be two space-separated integers
  const params = lines[0].split(" ").map((itemValue) => parseInt(itemValue, 10));

  // Extract the count of available items and the maximum number of days for operations
  const countItems = params[0]; // Represents the total number of tasks (N in original context)
  const maxDays = params[1];   // Represents the total duration in days (M in original context)

  // Process all subsequent lines to gather detailed information for each task
  // Each task line consists of two integer values (e.g., deadline and profit)
  const tasks = lines
    .filter((_currentLine, lineIndex) => lineIndex !== 0) // Skip the initial parameter line
    .map((currentLine) => {
      // For each task line, split by space and convert both parts to integers
      return currentLine.split(" ").map((subItemVal) => parseInt(subItemVal, 10));
    });

  // Sort the collection of tasks primarily based on their first attribute (e.g., deadline or availability day)
  // The sorting is done in ascending order to process tasks chronologically
  tasks.sort((firstTask, secondTask) => {
    return firstTask[0] > secondTask[0] ? 1 : -1;
  });


  // Initialize a custom min-heap data structure, which will function as a max-priority queue for profit
  let priorityStore = new MinHeap();
  // This variable will accumulate the total profit or earnings from selected tasks
  let totalEarnings = 0;
  // An index to keep track of the next task to consider from the sorted list
  let taskIndex = 0;

  // Iterate through each day, starting from day 1 up to the maximum allowed days
  for (let dayCount = 1; dayCount <= maxDays; dayCount++) {

    // For the current day, add all tasks whose first attribute (e.g., deadline) matches or is before this day
    // We store the negative of the profit to simulate a max-heap using a min-heap
    while (!!tasks[taskIndex] && tasks[taskIndex][0] === dayCount) {
      priorityStore.insertElement(-tasks[taskIndex][1]); // Insert negative profit
      taskIndex++; // Advance to the next task in the sorted list
    }

    // If there are no eligible tasks available in the priority queue for the current day
    if (!priorityStore.elementCount()) {
      continue; // Skip to the next day, as no task can be completed
    }

    // Select the task with the highest profit (smallest negative value) from the available tasks
    // Add its positive profit to the running total earnings
    totalEarnings += -priorityStore.extractMin();
  }

  // Display the final calculated total earnings or profit to the console
  console.log(totalEarnings);
}

// Definition for a basic Min-Heap data structure
// This heap will organize elements such that the smallest element is always at the root
function MinHeap() {
  // The internal array that holds all elements of the heap
  this.elements = [];
}

// Extend the prototype of MinHeap to include essential heap operations
MinHeap.prototype = {
  // Method to insert a new value into the heap
  // It maintains the heap property by bubbling up the new element
  insertElement: function (valueToStore) {
    const internalArray = this.elements;
    let idx = internalArray.length++; // Get current length and increment for new element's potential position
    let parentIdx;

    // Bubble up phase: move the new element up the tree until its correct position is found
    while (idx) {
      parentIdx = (idx - 1) >> 1; // Calculate the index of the parent node
      if (internalArray[parentIdx] <= valueToStore) break; // If parent is smaller or equal, the heap property holds
      internalArray[idx] = internalArray[parentIdx]; // Move parent down to child's position
      idx = parentIdx; // Current index becomes parent's index to continue bubbling up
    }
    internalArray[idx] = valueToStore; // Place the new value at its final position
  },

  // Method to extract and remove the smallest element (root) from the heap
  // It ensures the heap property is restored after removal by bubbling down
  extractMin: function () {
    const internalArray = this.elements;
    const rootVal = internalArray[0]; // Store the smallest value, which is at the root
    const extractedValue = internalArray.pop(); // Remove the last element and use it to fill the root's spot temporarily

    let currentPos = 0;
    const halfLength = internalArray.length >> 1; // Optimization: only need to check nodes up to half the length
    let childIdx;

    // Bubble down phase: move the `extractedValue` down the tree
    while (currentPos < halfLength) {
      childIdx = (currentPos << 1) + 1; // Calculate the index of the left child
      // Determine the smaller of the two children (if right child exists)
      if (internalArray[childIdx + 1] < internalArray[childIdx]) ++childIdx;
      // If the `extractedValue` is smaller than or equal to the smallest child, its correct position is found
      if (extractedValue <= internalArray[childIdx]) break;
      internalArray[currentPos] = internalArray[childIdx]; // Move the smaller child up
      currentPos = childIdx; // Current index becomes child's index to continue bubbling down
    }
    // If the heap is not empty, place the `extractedValue` in its final sorted position
    if (internalArray.length) internalArray[currentPos] = extractedValue;
    return rootVal; // Return the original smallest element
  },

  // Returns the current number of elements stored within the heap
  elementCount: function () {
    return this.elements.length;
  },

  // Returns the smallest element in the heap without removing it
  peekMin: function () {
    return this.elements[0];
  },
};

// Initiate the data processing by reading input from standard input
processData(require("fs").readFileSync("/dev/stdin", "utf8"));