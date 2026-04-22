process.stdin.resume();
process.stdin.setEncoding('utf8');

var receivedRows = [];

var inputHandler = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

inputHandler.on(
  'line',
  (currentText) => {
    // Store each incoming data row for later processing.
    receivedRows.push(currentText);
  }
);

inputHandler.on(
  'close',
  () => {
    // All input has been gathered; now execute the main computation logic.

    var totalItems = Number(receivedRows[0].split(" ")[0]);
    var numIterations = Number(receivedRows[0].split(" ")[1]);

    var currentValues = receivedRows[1].split(" ").map(val => parseInt(val, 10));
    var nextValues = new Array(totalItems);

    var cycleCounter = 0;
    var targetIndex = 0;
    var sourceIndex = 0;
    var updateIndex = 0;

    // Loop through the specified number of cycles.
    for (
      cycleCounter = 0;
      cycleCounter < numIterations;
      cycleCounter++
    ) {
      // Calculate the next set of values based on the current state.
      for (
        targetIndex = 0;
        targetIndex < totalItems;
        targetIndex++
      ) {
        nextValues[targetIndex] = 0; // Initialize the temporary value for the current position.

        // Iterate through all source elements to determine the new value for the target.
        for (
          sourceIndex = 0;
          sourceIndex < totalItems;
          sourceIndex++
        ) {
          // Apply the condition for incrementing the temporary value.
          if (
            currentValues[sourceIndex] >= Math.abs(targetIndex - sourceIndex)
          ) {
            nextValues[targetIndex]++;
          }
        }
      }

      // Update the primary array with the newly calculated values.
      for (
        updateIndex = 0;
        updateIndex < totalItems;
        updateIndex++
      ) {
        currentValues[updateIndex] = nextValues[updateIndex];
      }
    }

    // Display the final results for the initial segment of the array.
    console.log(
      currentValues[0] + ' ' + currentValues[1] + ' ' + currentValues[2] + ' ' + currentValues[3] + ' ' + currentValues[4]
    );

  }
);