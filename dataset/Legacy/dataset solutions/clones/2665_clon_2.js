function processInput(rawData) {
    // Remove leading/trailing whitespace and split the input string into an array of lines.
    var lines = rawData.trim().split("\n");

    // Parse the first line to extract two integer values: numItems and maxDays.
    var headerData = lines[0].split(" ").map((itemVal) => parseInt(itemVal, 10));
    var numItems = headerData[0]; // Represents the total count of items (N in original).
    var maxDays = headerData[1];   // Represents the maximum number of days available (M in original).

    // Process the remaining lines to create an array of tasks.
    // Each task is an array containing its availability day and its earning value.
    var tasks = lines.filter((lineStr, idx) => idx !== 0).map((lineStr) => {
        return lineStr.split(" ").map(subItemVal => parseInt(subItemVal, 10));
    });

    // Sort the tasks based on their availability day in ascending order.
    // This ensures that tasks are considered in chronological order.
    tasks.sort((taskA, taskB) => {
        return taskA[0] > taskB[0] ? 1 : -1;
    });

    // Initialize a MinHeap (acting as a max-priority queue for earnings by storing negative values).
    var taskQueue = new MinHeap();
    var totalEarnings = 0; // Variable to accumulate the total earnings.
    var taskIndex = 0;     // Pointer to keep track of the current task being considered from the sorted list.

    // Iterate through each day, from the first day up to maxDays.
    for (var currentDay = 1; maxDays >= currentDay; currentDay++) {
        // For the current day, add all available tasks (whose availability day matches currentDay)
        // to the priority queue. Store their earnings as negative values.
        while (!!tasks[taskIndex] && tasks[taskIndex][0] === currentDay) {
            taskQueue.addValue(-tasks[taskIndex][1]); // Add negative earning to simulate max-heap behavior.
            taskIndex++; // Move to the next task in the sorted list.
        }

        // If there are no tasks available in the queue for the current day, skip to the next day.
        if (!taskQueue.getSize()) {
            continue;
        }

        // Extract the task with the highest earning (which corresponds to the smallest negative value)
        // from the priority queue and add its positive earning to the total.
        totalEarnings += -taskQueue.extractMin();
    }

    // Output the final calculated total earnings to the console.
    console.log(totalEarnings);
}

// MinHeap implementation, used as a priority queue.
// Elements are stored such that the smallest element is always at the root.
function MinHeap() {
    this.elements = []; // The internal array that stores the heap elements.
}

MinHeap.prototype = {
    // Adds a new value to the heap while maintaining the heap property (min-heap).
    addValue: function(valueToInsert) {
        var elemArr = this.elements;
        var currentIndex = elemArr.length++; // Get current length and increment for the new element's position.
        var parentIndex;

        // Perform heapify-up: move the new value up the heap until its parent is smaller or it becomes the root.
        while (currentIndex) {
            parentIndex = (currentIndex - 1) >> 1; // Calculate the parent's index using bitwise shift.
            if (elemArr[parentIndex] <= valueToInsert) {
                break; // If the parent is smaller or equal, the correct position is found.
            }
            elemArr[currentIndex] = elemArr[parentIndex]; // Move the parent down.
            currentIndex = parentIndex; // Move up to the parent's previous position.
        }
        elemArr[currentIndex] = valueToInsert; // Place the new value in its final sorted position.
    },

    // Removes and returns the smallest element (the root) from the heap.
    extractMin: function() {
        var elemArr = this.elements;
        var rootValue = elemArr[0]; // Store the smallest element to be returned.
        var lastValue = elemArr.pop(); // Remove the last element and use it to replace the root.

        var currentIndex = 0;
        var halfLength = elemArr.length >> 1; // Optimization: only need to check up to half the array length.
        var childIndex;

        // Perform heapify-down: move the last value down the heap until its children are larger or it's a leaf.
        while (currentIndex < halfLength) {
            childIndex = (currentIndex << 1) + 1; // Calculate the left child's index.
            // Determine which child is smaller (if a right child exists).
            if (elemArr[childIndex + 1] < elemArr[childIndex]) {
                ++childIndex;
            }
            if (lastValue <= elemArr[childIndex]) {
                break; // If lastValue is smaller or equal to the smallest child, its correct position is found.
            }
            elemArr[currentIndex] = elemArr[childIndex]; // Move the child up.
            currentIndex = childIndex; // Move down to the child's previous position.
        }
        // If the heap is not empty, place the last value in its final sorted position.
        if (elemArr.length) {
            elemArr[currentIndex] = lastValue;
        }
        return rootValue; // Return the original smallest element.
    },

    // Returns the current number of elements in the heap.
    getSize: function() {
        return this.elements.length;
    },

    // Returns the smallest element in the heap without removing it.
    peekMin: function() {
        return this.elements[0];
    },
};

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
