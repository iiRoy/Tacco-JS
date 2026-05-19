function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  var lineData = rawData.split("\n");

  // Parse the first line to get the initial number of remaining tasks (K)
  // and the total number of task types (T), though T is not used in the logic.
  var remainingTasks = parseInt(lineData[0].split(" ")[0]);
  var totalTypes = parseInt(lineData[0].split(" ")[1]);

  // Parse the second line to create an array of task items.
  // Each item is an array: [original_index, current_task_count].
  var taskItems = lineData[1].split(" ").map((elementValue, currentIndex) => {
    return [currentIndex, parseInt(elementValue)];
  });

  // Initialize a variable to keep track of the index of the previously selected task type.
  // -1 indicates no task type has been selected yet.
  var previousSelectionIndex = -1;

  // Initialize a counter for "penalty" situations, where the same task type
  // must be selected consecutively.
  var penaltyCounter = 0;

  // Main loop: continues until all tasks are completed (remainingTasks becomes 0).
  while (true) {
    // Check if all tasks have been processed.
    if (remainingTasks === 0) {
      // If so, print the total penalty count and exit the function.
      return console.log(penaltyCounter);
    }

    // Sort the task items in descending order based on their current task count.
    // Items with more tasks remaining will appear first.
    taskItems.sort(function(itemA, itemB) {
      return itemA[1] < itemB[1];
    });

    // Flag to indicate if a suitable task item was found in the first pass.
    var itemFoundInPass = 0;

    // First pass: Try to find a task item that has tasks remaining AND
    // is not the same type as the one selected immediately before.
    for (var loopIndex = 0; loopIndex < taskItems.length; loopIndex++) {
      // Check if the current item has tasks (count > 0) and its original index
      // is different from the previously selected item's index.
      if (taskItems[loopIndex][1] > 0 && taskItems[loopIndex][0] !== previousSelectionIndex) {
        // Select this task item: update previous selection, decrement its count,
        // and decrement the total remaining tasks.
        previousSelectionIndex = taskItems[loopIndex][0];
        taskItems[loopIndex][1]--;
        remainingTasks--;
        itemFoundInPass = 1; // Mark that an item was found.
        break; // Exit this inner loop as we've made a selection.
      }
    }

    // If no suitable task item was found in the first pass (meaning we couldn't
    // pick a different type than the last one).
    if (!itemFoundInPass) {
      // Second pass: Find any task item that still has tasks remaining,
      // regardless of whether it's the same type as the previous one.
      for (var loopIndex = 0; loopIndex < taskItems.length; loopIndex++) {
        // Check if the current item has tasks (count > 0).
        if (taskItems[loopIndex][1] > 0) {
          // Select this task item: update previous selection, decrement its count,
          // and decrement the total remaining tasks.
          previousSelectionIndex = taskItems[loopIndex][0];
          taskItems[loopIndex][1]--;
          remainingTasks--;
          penaltyCounter++; // Increment the penalty counter because we had to pick the same type consecutively.
          break; // Exit this inner loop as we've made a selection.
        }
      }
    }
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
