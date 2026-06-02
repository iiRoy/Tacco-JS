process.stdin.resume();
process.stdin.setEncoding("utf8"); // Set the input encoding to UTF-8

// Initialize a readline interface for standard input and output
const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Array to store all input lines
const inputData = [];

// Event listener for each line of input
inputReader.on("line", (currentLine) => {
  inputData.push(currentLine); // Add the current line to our data array
});

// Create a sentinel node for a doubly linked list
// This node simplifies edge cases (empty list, adding/deleting at ends)
const sentinelNode = {};
sentinelNode.nextElement = sentinelNode; // Points to itself when list is empty
sentinelNode.prevElement = sentinelNode; // Points to itself when list is empty

// Event listener for when the input stream closes
inputReader.on("close", () => {
  // The first line contains the number of operations
  const operationCount = Number(inputData[0]);

  // Process each operation from the input data
  for (let idx = 1; idx <= operationCount; idx++) {
    // Split the command line into action type and target value
    let [actionType, targetValue] = inputData[idx].split(" ");

    // Perform actions based on the command
    switch (actionType) {
      case "insert":
        // Create a new node for insertion
        const newNode = {
          dataContent: targetValue,
          prevElement: sentinelNode,
          nextElement: sentinelNode.nextElement,
        };
        // Update pointers to insert the new node right after the sentinel
        sentinelNode.nextElement.prevElement = newNode;
        sentinelNode.nextElement = newNode;
        break;

      case "delete":
        // Traverse the list to find and delete the target value
        for (let currentNode = sentinelNode.nextElement; sentinelNode !== currentNode; currentNode = currentNode.nextElement) {
          if (currentNode.dataContent === targetValue) {
            // Bypass the current node by updating its neighbors' pointers
            currentNode.prevElement.nextElement = currentNode.nextElement;
            currentNode.nextElement.prevElement = currentNode.prevElement;
            break; // Exit loop after first match is deleted
          }
        }
        break;

      case "deleteFirst":
        // Remove the first actual element (the one after the sentinel)
        sentinelNode.nextElement = sentinelNode.nextElement.nextElement;
        sentinelNode.nextElement.prevElement = sentinelNode;
        break;

      case "deleteLast":
        // Remove the last actual element (the one before the sentinel)
        sentinelNode.prevElement = sentinelNode.prevElement.prevElement;
        sentinelNode.prevElement.nextElement = sentinelNode;
        break;
    }
  }

  // Prepare to print the contents of the linked list
  let isFirstOutput = true;
  for (let currentNode = sentinelNode.nextElement; sentinelNode !== currentNode; currentNode = currentNode.nextElement) {
    // Add a space separator between elements, but not before the first one
    if (!isFirstOutput) {
      process.stdout.write(" ");
    }
    process.stdout.write(currentNode.dataContent); // Print the data content of the node
    isFirstOutput = false; // Mark that at least one element has been printed
  }
  console.log(""); // Print a newline character at the end
});
