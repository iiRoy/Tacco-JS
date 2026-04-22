// Re-aliasing standard I/O streams for clarity and potential future redirection.
const inputPipe = process.stdin;
const outputStream = process.stdout;

// Initialize the standard input stream to begin receiving data.
inputPipe.resume();
// Configure the input stream to interpret incoming bytes as UTF-8 characters.
inputPipe.setEncoding("utf8");

// Acquire the necessary module for line-by-line input processing.
const lineProcessor = require("readline");

// Establish an interactive interface to manage input and output operations.
const inputHandler = lineProcessor.createInterface({
  input: inputPipe,
  output: outputStream,
});

// A dynamic array to accumulate all received lines from the input source.
const inputRecords = [];

// Register an event listener to store each complete line as it becomes available.
inputHandler.on("line", (currentRecord) => {
  inputRecords.push(currentRecord);
});

// --- Doubly Linked List Implementation ---

/**
 * Represents a single element or node within the custom doubly linked list.
 */
class ListElement {
  /**
   * Constructs a new ListElement.
   * @param {*} elementValue - The data payload stored in this node.
   * @param {ListElement} previousRef - Reference to the preceding node in the list.
   * @param {ListElement} nextRef - Reference to the succeeding node in the list.
   */
  constructor(elementValue = null, previousRef = null, nextRef = null) {
    this.elementValue = elementValue; // The core data of this node.
    this.previousRef = previousRef;   // Pointer to the node before this one.
    this.nextRef = nextRef;       // Pointer to the node after this one.
  }
}

/**
 * Implements a custom doubly linked list using a sentinel node to simplify
 * boundary conditions for insertions and deletions.
 */
class CustomDoublyList {
  constructor() {
    // The sentinel node acts as a dummy head/tail, always present.
    // It simplifies operations by ensuring 'nextRef' and 'previousRef' are never null for actual nodes.
    this.sentinel = new ListElement("SENTINEL_NODE_BOUNDARY");
    this.sentinel.nextRef = this.sentinel;     // Initially, points to itself, forming a circular list.
    this.sentinel.previousRef = this.sentinel; // Also points to itself.
    this.currentSize = 0;                      // Tracks the count of actual data elements in the list.
  }

  /**
   * Adds a new element to the front (head) of the list.
   * This operation effectively inserts the new node right after the sentinel.
   * @param {*} dataPayload - The value to be added to the list.
   */
  addFront(dataPayload) {
    const freshNode = new ListElement(dataPayload); // Create the new node.

    // Link the new node into the list:
    // 1. New node's 'nextRef' points to the current first element (which was 'sentinel.nextRef').
    freshNode.nextRef = this.sentinel.nextRef;
    // 2. New node's 'previousRef' points back to the sentinel.
    freshNode.previousRef = this.sentinel;

    // Update the links of the surrounding nodes:
    // 3. The node that was previously first now has its 'previousRef' point to the new node.
    this.sentinel.nextRef.previousRef = freshNode;
    // 4. The sentinel's 'nextRef' now points to the new node, making it the new first element.
    this.sentinel.nextRef = freshNode;

    this.currentSize++; // Increment the list size.
  }

  /**
   * Removes the first actual element (head) from the list.
   * Does nothing if the list is empty.
   */
  removeHead() {
    // Guard clause: if the list is empty, there's nothing to remove.
    if (this.currentSize === 0) {
      return;
    }

    const elementToRemove = this.sentinel.nextRef; // Identify the first element.

    // Update links to bypass the element being removed:
    // The sentinel's 'nextRef' now points to the element after the one being removed.
    this.sentinel.nextRef = elementToRemove.nextRef;
    // The element that follows the removed one now has its 'previousRef' point back to the sentinel.
    elementToRemove.nextRef.previousRef = this.sentinel;

    this.currentSize--; // Decrement the list size.

    // Optional: Clear references on the removed node to assist garbage collection.
    elementToRemove.nextRef = null;
    elementToRemove.previousRef = null;
  }

  /**
   * Removes the last actual element (tail) from the list.
   * Does nothing if the list is empty.
   */
  removeTail() {
    // Guard clause: if the list is empty, there's nothing to remove.
    if (this.currentSize === 0) {
      return;
    }

    const elementToRemove = this.sentinel.previousRef; // Identify the last element.

    // Update links to bypass the element being removed:
    // The sentinel's 'previousRef' now points to the element before the one being removed.
    this.sentinel.previousRef = elementToRemove.previousRef;
    // The element that precedes the removed one now has its 'nextRef' point back to the sentinel.
    elementToRemove.previousRef.nextRef = this.sentinel;

    this.currentSize--; // Decrement the list size.

    // Optional: Clear references on the removed node.
    elementToRemove.nextRef = null;
    elementToRemove.previousRef = null;
  }

  /**
   * Searches for the first occurrence of a specific value and removes its corresponding node.
   * Does nothing if the list is empty or the value is not found.
   * @param {*} targetValue - The value to search for and remove.
   */
  purgeByValue(targetValue) {
    // Guard clause: if the list is empty, no purging is possible.
    if (this.currentSize === 0) {
      return;
    }

    let currentWalker = this.sentinel.nextRef; // Start traversal from the first actual element.
    let foundAndPurged = false; // Flag to track if a removal occurred.

    // Traverse the list until the sentinel is reached (end of list) or the target is found.
    while (currentWalker !== this.sentinel) {
      if (currentWalker.elementValue === targetValue) {
        // Target value found, now unlink this node from the list.
        currentWalker.previousRef.nextRef = currentWalker.nextRef; // Link previous node to next node.
        currentWalker.nextRef.previousRef = currentWalker.previousRef; // Link next node to previous node.

        this.currentSize--; // Decrement the list size.
        foundAndPurged = true; // Mark as purged.

        // Optional: Clear references on the removed node.
        currentWalker.nextRef = null;
        currentWalker.previousRef = null;
        break; // Exit loop after purging the first occurrence.
      }
      currentWalker = currentWalker.nextRef; // Move to the next node.
    }
    // Could return 'foundAndPurged' if external logic needs to know if an item was removed.
  }

  /**
   * Gathers all element values from the list into a new array.
   * @returns {Array<*>} An array containing the values of all elements in order.
   */
  collectValues() {
    const gatheredValues = [];
    let traversalNode = this.sentinel.nextRef; // Start from the first actual element.

    // Iterate through the list until the sentinel is reached.
    while (traversalNode !== this.sentinel) {
      gatheredValues.push(traversalNode.elementValue); // Add the current node's value.
      traversalNode = traversalNode.nextRef;       // Move to the next node.
    }
    return gatheredValues;
  }

  /**
   * Retrieves the current number of data elements stored in the list.
   * @returns {number} The count of actual elements.
   */
  getSize() {
      return this.currentSize;
  }
}

// --- Event Handler for End of Input ---

// Register an event listener for when the input stream has finished receiving data.
inputHandler.on("close", () => {
  // Parse the total number of operations from the very first line of input.
  // Using parseInt with radix 10 for explicit and robust number conversion.
  const operationCount = parseInt(inputRecords[0], 10);

  // Perform basic validation on the parsed operation count.
  if (isNaN(operationCount) || operationCount < 0) {
      outputStream.write("Error: Invalid or negative operation count provided.\n");
      // In a real application, one might throw an error or exit here.
      return;
  }

  // Instantiate our custom doubly linked list to manage operations.
  const managedList = new CustomDoublyList();

  /**
   * A helper function to parse a raw input line into an operation type and its associated value.
   * @param {string} rawLine - The raw string line from input.
   * @returns {{type: string, value: string|null}} An object containing the operation type and value.
   */
  const extractOperationDetails = (rawLine) => {
    // Defensive check: ensure the input line is valid.
    if (typeof rawLine !== 'string' || rawLine.trim() === '') {
        return { type: 'NOOP', value: null }; // Return a 'No Operation' type for invalid lines.
    }
    const parts = rawLine.split(" ");
    const opType = parts[0].toLowerCase(); // Standardize command casing.
    // Reconstruct operand if it contains spaces (e.g., "delete item with spaces").
    const opValue = parts.length > 1 ? parts.slice(1).join(" ") : null;
    return { type: opType, value: opValue };
  };

  // Define a mapping of command strings to their respective list methods.
  // This uses a Map for command dispatch, a flexible alternative to a switch statement.
  const commandExecutors = new Map([
      ["insert", (val) => managedList.addFront(val)],
      ["delete", (val) => managedList.purgeByValue(val)],
      ["deletefirst", () => managedList.removeHead()],
      ["deletelast", () => managedList.removeTail()],
  ]);

  // Iterate through each command line, starting from the second record (index 1).
  for (let cmdIndex = 0; cmdIndex < operationCount; cmdIndex++) {
    const currentCommandLine = inputRecords[cmdIndex + 1]; // Adjust index for 0-based array.
    const { type: operationType, value: operationValue } = extractOperationDetails(currentCommandLine);

    // Retrieve the executor function for the current operation type.
    const executor = commandExecutors.get(operationType);

    if (executor) {
        // Execute the appropriate list method based on the command type.
        // Pass the operand only if it's relevant for the command.
        if (operationType === "insert" || operationType === "delete") {
            executor(operationValue);
        } else {
            executor(); // Commands like deleteFirst/deleteLast don't require an operand.
        }
    } else if (operationType !== 'noop') {
        // Optionally log or handle unrecognized commands, ignoring 'noop' from invalid lines.
        // outputStream.write(`Warning: Unrecognized command encountered: ${operationType}\n`);
    }
  }

  // --- Output Generation ---

  // Retrieve all remaining elements from the list as an array of values.
  const finalElements = managedList.collectValues();

  // If there are elements in the list, join them with spaces and write to output.
  if (finalElements.length > 0) {
    outputStream.write(finalElements.join(" "));
  }
  // Always ensure a newline character at the end of the output, for consistency.
  outputStream.write("\n");
});